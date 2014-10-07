var socketio = require('socket.io'),
    _ = require('lodash');

var guestnumber = 0;
var nicknames = {};
var takenNameList = [];
var currentRooms = {};

var handleMessages = function(socket, io){
  socket.on('message', function(data){
    io.to(currentRooms[socket.id]).emit('message', { 
      nickname: nicknames[socket.id],
      text: data.text 
    });
  });
};

var handleDisconnection = function (socket, io) {
  socket.on('disconnect', function () {
    var nameIndex = namesUsed.indexOf(nicknames[socket.id]);
    delete namesUsed[nameIndex];
    var leavingRoom = currentRoom[socket.id];

    io.to(leavingRoom).emit('message', {
      text: (nicknames[socket.id] + " is leaving" + leavingRoom + "."),
      room: leavingRoom
    });

    delete nicknames[socket.id];
    delete currentRoom[socket.id];
  });
};

var joinRoom = function (socket, io, room) {

  socket.join(room);
  currentRooms[socket.id] = room;

  io.to(room).emit('message', {
    nickname: nicknames[socket.id],
    text: "joined " + room,
    room: room
  });
};

var handleNicknameChange = function(socket, io){
  socket.on('nicknameChangeRequest', function(newname){
    if (newname.match(/^guest/) !== null ){
      io.sockets.emit('nicknameChangeResult', {
        success: false,
        message: 'Names must not begin with guest'
      });
    } else if (takenNameList.indexOf(newname) !== -1) {
      io.sockets.emit('nicknameChangeResult', {
        success: false,
        message: 'Names has already been taken'
      });
    } else {
      var room = currentRooms[socket.id];
      var preveousName = nicknames[socket.id];
      nicknames[socket.id] = newname;
      io.to(room).emit('nicknameChangeResult', {
        success: true,
        newname: newname,
        preveousName: preveousName 
      })
    
    } 

  });
};

var handleJoinRoomRequest = function(socket, io){
  socket.on('roomChangeRequest', function(room){
    var oldRoom = currentRooms[socket.id];
    socket.leave(oldRoom);
    joinRoom(socket, io, room);
    io.sockets.emit('roomList', getRoomData(io));
  });
};

var getRoomData = function(io){
  var roomHash = io.sockets.adapter.rooms;
  var roomData = {};
  for(var room in roomHash) {
    
    if(io.sockets.connected[room]) continue;

    roomData[room] = [];
    for(var socket in roomHash[room]) {
      roomData[room].push(nicknames[socket]);
    }
  }
  return roomData;
};

var createChatServer = function (server) {

  var io = socketio.listen(server);
  io.sockets.on('connection', function (socket) {
    var initialName = "guest_" + guestnumber;
    nicknames[socket.id] = initialName; 
    guestnumber++;
    joinRoom(socket, io, "lobby");   
 
    handleMessages( socket, io);
    handleJoinRoomRequest(socket, io);
    handleNicknameChange(socket, io);
    io.sockets.emit('roomList', getRoomData(io));  
});

};


module.exports = createChatServer;
