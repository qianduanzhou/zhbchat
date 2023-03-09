'use strict ';

let http = require('http'); // 提供HTTP 服务
const { Server } = require('socket.io');
let express = require('express');

const MaxUserNum = 2;

let app = express();

const roomsInfo = {};
const userRoomInfo = {};

//HTTP 服务
let http_server = http.createServer(app);
http_server.listen(8081, '127.0.0.1', () => {
  console.log('listening on *:8081');
});

const io = new Server(http_server, {
  cors: {
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://192.168.20.245:3000'],
    credentials: true,
  },
});

// 处理连接事件
io.sockets.on('connection', socket => {
  console.log('got a connection');
  // 用于转发sdp、candidate等消息
  socket.on('message', ({ roomId, data }) => {
    console.log('message , room: ' + roomId + ', data , type:' + data.type);
    socket.to(roomId).emit('message', data);
  });

  socket.on('join', ({ roomId }) => {
    if (!roomId) return;
    //加入房间
    socket.join(roomId);

    console.log(`${socket.id} join ${roomId}`);

    // 登记房间用户
    if (!roomsInfo[roomId]) {
      roomsInfo[roomId] = {};
    }
    roomsInfo[roomId][socket.id] = socket;

    //登记用户房间
    if (!userRoomInfo[socket.id]) {
      userRoomInfo[socket.id] = [];
    }
    userRoomInfo[socket.id].push(roomId);

    let userNum = Object.keys(roomsInfo[roomId]).length;

    // 如果房间里人未满
    if (userNum <= MaxUserNum) {
      // 回复用户已经加入到房间里了
      socket.emit('joined', { roomId, userNum });

      // 通知另一个用户， 有人来了
      if (userNum > 1) {
        //向roomId的所有连接用户的群发消息
        socket.to(roomId).emit('otherjoined', { roomId, userId: socket.id });
      }
    } else {
      // 如果房间里人满了，离开房间
      socket.leave(roomId);
      // 回复用户房间满人了
      socket.emit('full', { roomId, userNum });
    }
  });

  const onLeave = ({ roomId }) => {
    if (!roomId) return;

    socket.leave(roomId);

    roomsInfo[roomId] && roomsInfo[roomId][socket.id] && delete roomsInfo[roomId][socket.id];
    userRoomInfo[socket.id] &&
      (userRoomInfo[socket.id] = userRoomInfo[socket.id].filter(id => id !== roomId));

    console.log(
      'someone leaved the room, the user number of room is: ',
      roomsInfo[roomId] ? Object.keys(roomsInfo[roomId]).length : 0,
    );

    // 通知其他用户有人离开了
    socket.to(roomId).emit('bye', { roomId, userId: socket.id });

    // 回复用户你已经离开房间了
    socket.emit('leaved', { roomId });
  };

  // 用户离开房间
  socket.on('leave', onLeave);

  //disconnect
  socket.on('disconnect', () => {
    console.log(socket.id, 'disconnect, and clear user`s Room', userRoomInfo[socket.id]);
    if (userRoomInfo[socket.id]) {
      userRoomInfo[socket.id].forEach(roomId => {
        onLeave({ roomId });
      });

      delete userRoomInfo[socket.id];
    }
  });
});