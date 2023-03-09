
import styles from './index.module.scss';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Button, Input, message } from 'antd';
import SignalServer from 'utils/SignalServer';

const pcOption = {};

type State = 'init' | 'disconnect' | 'waiting' | 'canCall' | 'connecting';

const Home = () => {
  // 远端传递过来的媒体数据
  const remoteMediaStream = useRef<MediaStream>();
  // 本地设备采集的媒体数据
  const localMediaStream = useRef<MediaStream>();
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  // 信令服务器对象
  const signalServer = useRef<SignalServer>();
  const peerConnection = useRef<RTCPeerConnection>();

  const [roomId, setRoomId] = useState('');
  const [state, setState] = useState<State>('disconnect');

  const tip = useMemo(() => {
    switch (state) {
      case 'init':
        return '正在获取媒体数据...';
      case 'disconnect':
        return '请输入房间号并加入房间';
      case 'waiting':
        return '等待对方加入房间...';
      case 'canCall':
        return '可点击啊call进行呼叫';
      case 'connecting':
        return '通话中';
      default:
        return '';
    }
  }, [state]);

  useEffect(() => {
    // 初始化信令服务器
    signalServer.current = new SignalServer({ onMessage, onJoined, onOtherJoined });

    const initPeerConnection = () => {
      console.log('------ 初始化本地pc对象');
      // 创建pc实例
      peerConnection.current = new RTCPeerConnection(pcOption);
      const pc = peerConnection.current;
      // 监听 candidate 获取事件
      pc.addEventListener('icecandidate', event => {
        const candidate = event.candidate;
        if (candidate) {
          console.log('------ 获取到了本地 candidate：', candidate);

          // 发送candidate到远端
          signalServer?.current?.send({ type: 'candidate', value: candidate });
        }
      });

      // 监听到远端传过来的媒体数据
      pc.addEventListener('track', e => {
        console.log('------ 获取到了远端媒体数据：', e);
        if (remoteVideo.current && remoteVideo.current.srcObject !== e.streams[0]) {
          remoteVideo.current.srcObject = e.streams[0];
        }
      });
    };

    //获取本地媒体数据
    const getLocalMediaStream = () => {
      console.log(' navigator.mediaDevices',  navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(mediaStream => {
        console.log('------ 成功获取本地设备媒体数据:', mediaStream);
        if (mediaStream) {
          if(localVideo.current) localVideo.current.srcObject = mediaStream;
          localMediaStream.current = mediaStream;

          // 绑定本地媒体数据到pc对象上
          if (localMediaStream.current) {
            console.log('------ 绑定本地媒体数据到pc对象上');
            localMediaStream.current.getTracks().forEach(track => {
              if(peerConnection.current) peerConnection.current.addTrack(track, localMediaStream.current as MediaStream);
            });
          }
        }
      });
    };

    initPeerConnection();

    getLocalMediaStream();

    return () => {
      // 离开页面前销毁mediaStream数据
      localMediaStream.current &&
        localMediaStream.current.getTracks().forEach(track => track.stop());
      remoteMediaStream.current &&
        remoteMediaStream.current.getTracks().forEach(track => track.stop());

      //销毁本地pc
      peerConnection.current && peerConnection.current.close();
    };
  }, []);

  const join = () => {
    if (!roomId || state !== 'disconnect') return;
    signalServer?.current?.join(roomId);
    setState('waiting');
  };

  const onJoined = ({ roomId, userNum }: { roomId : string | number, userNum: string | number }) => {
    message.success('成功加入房间,当前房间人数为:' + userNum);
    console.log('------ 成功加入房间,当前房间人数为:' + userNum);

    if (userNum === 1) {
      setState('waiting');
    } else {
      setState('canCall');
    }
  };

  const onOtherJoined = (data: unknown) => {
    console.log('------ 有人加入房间了');
    setState('canCall');
  };

  const call = () => {
    if (state !== 'canCall') return;
    // 开始建立连接
    setState('connecting');

    const pc = peerConnection.current;

    // 获取本地sdp(offer)
    pc?.createOffer().then(offer => {
      console.log('------ 获取到了本地offer', offer);

      // 绑定本地sdp
      pc.setLocalDescription(offer);

      // 发送本地sdp到远端
      signalServer?.current?.send({
        type: 'offer',
        value: offer,
      });
    });
  };

  const onMessage = ({ type, value }: { type: string, value: any }) => {
    switch (type) {
      case 'offer':
        onGetRemoteOffer(value);
        break;
      case 'answer':
        onGetRemoteAnswer(value);
        break;
      case 'candidate':
        onGetRemoteCandidate(value);
        break;
      default:
        console.log('unknown message');
    }
  };

  const onGetRemoteAnswer = (answer: RTCSessionDescription) => {
    console.log('------ 获取到了远端answer', answer);

    const pc = peerConnection.current;

    // 绑定远端sdp
    pc?.setRemoteDescription(answer);
  };

  const onGetRemoteOffer = (offer: RTCSessionDescription) => {
    console.log('------ 获取到了远端offer', offer);
    // 远端发起呼叫，开始建立连接
    setState('connecting');

    const pc = peerConnection.current;

    // 绑定远端sdp
    pc?.setRemoteDescription(offer);

    // 创建本地sdp
    pc?.createAnswer().then(answer => {
      // 绑定本地sdp
      pc.setLocalDescription(answer);

      console.log('------ 获取到了本地answer', answer);
      // 发送本地sdp到远端
      signalServer?.current?.send({
        type: 'answer',
        value: answer,
      });
    });
  };

  // 获取到远端的candidate
  const onGetRemoteCandidate = (candidate: RTCIceCandidateInit | RTCIceCandidate) => {
    console.log('------ 获取到了远端candidate', candidate);

    peerConnection?.current?.addIceCandidate(candidate);
  };

  return (
    <div className="one-on-one">
      <h1>Simple1v1{tip && `-${tip}`}</h1>
      <div className="one-on-one-container">
        <div className="one-on-one-operation">
          <div className="room-selector operation-item">
            <Input
              value={roomId || undefined}
              disabled={state !== 'disconnect'}
              onChange={e => setRoomId(e.target.value)}
              placeholder="请输入房间号"></Input>
            <Button disabled={state !== 'disconnect'} onClick={join} type="primary">
              加入房间
            </Button>
          </div>
          <div className="call-btn operation-item">
            <Button disabled={state !== 'canCall'} onClick={call} type="primary">
              call
            </Button>
          </div>
        </div>
        <div className="videos">
          <div className="local-container">
            <h3>local-video</h3>
            <video autoPlay controls ref={localVideo}></video>
          </div>
          <div className="remote-container">
            <h3>remote-video</h3>
            <video autoPlay controls ref={remoteVideo}></video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;