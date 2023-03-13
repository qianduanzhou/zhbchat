
import styles from './index.module.scss';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Button, Input, message, Spin } from 'antd';
import SignalServer from 'utils/SignalServer';
const { TextArea } = Input;
const pcOption = {
  iceServers: [
    {
      urls: 'stun:175.178.107.242:3478',
      username: 'admin',
      credential: '78000'
    }
  ]
};

type State = 'socketDisConnected' | 'init' | 'disconnect' | 'waiting' | 'canCall' | 'connected';
interface msgObj {
  id: number,
  name: string
  text: string
  isLocal: boolean
}
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
  const dataChannel = useRef<RTCDataChannel>();
  const [roomId, setRoomId] = useState('');//房间号
  const [state, setState] = useState<State>('socketDisConnected');//连接状态
  const [connectLoading, setConnectLoading] = useState(false);//连接loading
  const [msg, setMsg] = useState('');//发送消息
  const [msgList, setMsgList] = useState<msgObj[]>([]);//消息列表
  const tip = useMemo(() => {
    switch (state) {
      case 'socketDisConnected':
        return '等待socket连接';
      case 'init':
        return '正在获取媒体数据...';
      case 'disconnect':
        return '请输入房间号并加入房间';
      case 'waiting':
        return '等待对方加入房间...';
      case 'canCall':
        return '可点击啊call进行呼叫';
      case 'connected':
        return '通话中';
      default:
        return '';
    }
  }, [state]);

  useEffect(() => {
    // 初始化信令服务器
    signalServer.current = new SignalServer({ onMessage, onJoined, onOtherJoined, onConnect });

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

  // 初始化本地pc对象
  const initPeerConnection = () => {
    setConnectLoading(true);
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

    // 监听对等连接状态
    pc.addEventListener('connectionstatechange', event => {
      console.log('当前对等连接状态', pc.connectionState)
      if (pc.connectionState === 'connected') {
        setState('connected');
      } else if (pc.connectionState === 'disconnected') {
        unCall();
      }
    });

    // 创建通道
    dataChannel.current = pc.createDataChannel('sendDataChannel');

    // 监听通道
    peerConnection?.current?.addEventListener('datachannel', onGetRemoteDatachannel);

    //监听通道打开
    dataChannel.current.addEventListener('open', (e) => {
      console.log('------ 本地通道已打开：', e);
    })

    //监听通道关闭
    dataChannel.current.addEventListener('close', (e) => {
      console.log('------ 本地通道已关闭：', e);
    })
  };

  // 获取本地媒体数据
  const getLocalMediaStream = () => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({
        audio: false, video: {
          width: 500,
          height: 500
        }
      }).then(mediaStream => {
        console.log('------ 成功获取本地设备媒体数据:', mediaStream);
        if (mediaStream) {
          if (localVideo.current) localVideo.current.srcObject = mediaStream;
          localMediaStream.current = mediaStream;

          // 绑定本地媒体数据到pc对象上
          if (localMediaStream.current) {
            console.log('------ 绑定本地媒体数据到pc对象上');
            localMediaStream.current.getTracks().forEach(track => {
              if (peerConnection.current) peerConnection.current.addTrack(track, localMediaStream.current as MediaStream);
            });
            resolve('addTrackDown');
          }
        }
      });
    })
  };

  // 发起通讯请求的方法
  const connectFunc = async () => {
    setConnectLoading(true);
    initPeerConnection();
    await getLocalMediaStream();
    setConnectLoading(false);
    return Promise.resolve('connected');
  }

  // 加入房间
  const join = () => {
    if (state !== 'disconnect') return message.error('请先启动信令服务器');
    if (!roomId) return message.error('请输入房间号');
    signalServer?.current?.join(roomId);
    setState('waiting');
  };

  // 离开房间
  const leave = () => {
    unCall();
    signalServer?.current?.leave();
    message.success('已离开当前房间');
    setState('disconnect');
  }

  //信令服务器已连接
  const onConnect = () => {
    setState('disconnect');
  }

  // 已加入房间
  const onJoined = ({ roomId, userNum }: { roomId: string | number, userNum: string | number }) => {
    message.success('成功加入房间,当前房间人数为:' + userNum);
    console.log('------ 成功加入房间,当前房间人数为:' + userNum);

    if (userNum === 1) {
      setState('waiting');
    } else {
      setState('canCall');
    }
  };

  // 其他人加入房间
  const onOtherJoined = (data: unknown) => {
    console.log('------ 有人加入房间了');
    setState('canCall');
  };

  // 发起通讯
  const call = async () => {
    if (state !== 'canCall') return;
    await connectFunc();

    // 开始建立连接
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

  // 关闭通讯
  const unCall = () => {
    peerConnection?.current?.close();
    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;

    setState('canCall');
  }

  //发送消息
  const sendMsg = () => {
    if (dataChannel.current && msg) {
      setMsgList([...msgList, {
        id: msgList.length + 1,
        name: '我',
        text: msg,
        isLocal: true
      }]);
      setMsg('');
      dataChannel.current.send(msg);
    }
  }
  //监听消息框按键
  const msgKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMsg();
    }
  }
  const onMessage = ({ type, value }: { type: string, value: RTCSessionDescription }) => {
    switch (type) {
      case 'offer':
        onGetRemoteOffer(value);
        break;
      case 'answer':
        onGetRemoteAnswer(value);
        break;
      case 'candidate':
        onGetRemoteCandidate(value as RTCIceCandidateInit | RTCIceCandidate);
        break;
      default:
        console.log('unknown message');
    }
  };

  // 获取远端offer
  const onGetRemoteOffer = async (offer: RTCSessionDescription) => {
    console.log('------ 获取到了远端offer', offer);
    await connectFunc();

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

  // 获取远端answer
  const onGetRemoteAnswer = (answer: RTCSessionDescription) => {
    console.log('------ 获取到了远端answer', answer);

    const pc = peerConnection.current;

    // 绑定远端sdp
    pc?.setRemoteDescription(answer);
  };

  // 获取到远端的candidate
  const onGetRemoteCandidate = (candidate: RTCIceCandidateInit | RTCIceCandidate) => {
    console.log('------ 获取到了远端candidate', candidate);

    peerConnection?.current?.addIceCandidate(candidate);
  };

  // 获取远端datachannel
  const onGetRemoteDatachannel = (event: RTCDataChannelEvent) => {
    const dc = event.channel;
    console.log('------ 获取到了远端通道', event.channel);
    //监听通道消息
    dc.addEventListener('message', (e: MessageEvent<any>) => {
      setMsgList(msgList => [...msgList, {
        id: msgList.length + 1,
        name: '他',
        text: e.data,
        isLocal: false
      }]);
      console.log('------ 远端通道消息：', e);
    })
    //监听通道打开
    dc.addEventListener('open', (e) => {
      console.log('------ 远端通道已打开：', e);
    })
    //监听通道关闭
    dc.addEventListener('close', (e) => {
      console.log('------ 远端通道已关闭：', e);
    })
  }

  return (
    <div className={styles['home']}>
      <h1 className={styles['home_title']}>实时通讯1v1{tip && `-${tip}`}</h1>
      <Spin spinning={connectLoading}>
        <main className={styles['main']}>
          <div className={styles['main_operation']}>
            <Input
              value={roomId || undefined}
              disabled={state !== 'disconnect'}
              onChange={e => setRoomId(e.target.value)}
              placeholder="请输入房间号" className={styles['main_operation_input']}></Input>
            {
              state === 'disconnect' && <Button onClick={join} type="primary" className={styles['main_operation_btn']}>
                加入房间
              </Button>
            }
            {
              (state === 'canCall' || state === 'waiting') && <Button onClick={leave} type="primary" danger className={styles['main_operation_btn']}>
                离开房间
              </Button>
            }
            {
              state === 'canCall' && <Button onClick={call} type="primary" className={styles['main_operation_btn']}>
                发起通讯
              </Button>
            }
            {
              state === 'connected' && <Button onClick={unCall} type="primary" danger className={styles['main_operation_btn']}>
                关闭通讯
              </Button>
            }
          </div>
          <div className={styles['main_container']}>
            <div className={styles['main_container_videoContainer']}>
              <p className={styles['main_container_videoContainer_title']}>视频区域</p>
              <div className={styles['main_container_videoContainer_content']}>
                <div className={styles['main_container_videoContainer_content_local']}>
                  <video autoPlay ref={localVideo}></video>
                </div>
                <div className={styles['main_container_videoContainer_content_remote']}>
                  <video autoPlay ref={remoteVideo}></video>
                </div>
              </div>
            </div>
            <div className={styles['main_container_chatContainer']}>
              <p className={styles['main_container_chatContainer_title']}>聊天区域</p>
              <div className={styles['main_container_chatContainer_acceptBlock']}>
                {
                  msgList.map((msg: msgObj) => {
                    return (
                      <div className={`${styles['main_container_chatContainer_acceptBlock_item']} ${msg.isLocal ? styles['relative'] : ''}`} key={msg.id}>
                        <div className={styles['name']}>{msg.name}</div>
                        <div className={styles['text']}>{msg.text}</div>
                      </div>
                    )
                  })
                }
              </div>
              <div className={styles['main_container_chatContainer_sendBlock']}>
                <TextArea disabled={state !== 'connected'} value={msg || undefined} onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => msgKeyDown(e)} placeholder="请输入聊天信息" className={styles['main_container_chatContainer_sendBlock_input']}>
                </TextArea>
                <Button disabled={state !== 'connected'} onClick={sendMsg} type="primary" className={styles['main_container_chatContainer_sendBlock_btn']}>
                  发送
                </Button>
              </div>
            </div>
          </div>
        </main>
      </Spin>

    </div>
  );
};

export default Home;