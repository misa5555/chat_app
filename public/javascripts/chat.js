(function(){
  if ( typeof App === "undefined" ){
    window.App = {};
  }

  var Chat = App.Chat = function(socket){
    this.socket = socket;
    this.room = "lobby";
  };

  _.extend( Chat.prototype, {
    sendMessage: function(text){
      this.socket.emit('message', {
        text: text,
        room: this.room
      }); 
    },
    
    joinRoom: function (room) {
      this.room = room;
      this.socket.emit('roomChangeRequest', room);
      this.sendMessage('Switched to ' + room);
    },

    sendChangeNameRequest: function(newname){
      this.socket.emit('nicknameChangeRequest', newname);
    },
  });
}());
