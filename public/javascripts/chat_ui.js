(function(){
  if ( typeof App === "undefined"){
    window.App = {};
  }
  
  var chatUi = App.chatUi = function(chat){
    this.chat = chat;
    this.$messages = $('#messages');
    this.$newMessage = $('#new-message');
    this.$rooms = $('#rooms');
    this.messageTemplate = _.template($('#message-tmpl').html());
    this.roomTemplate = _.template($('#room-tmpl').html());  
    
    this.registeredHandlers(); 
  };

  _.extend(chatUi.prototype, {

    registeredHandlers: function(){
      var chatUi = this;
      
      this.chat.socket.on('message', function(message){
        var msg = chatUi.messageTemplate(message);
        chatUi.$messages.append(msg);
      });
     
      this.chat.socket.on('nicknameChangeResult', function(data){
        var newname = data.newname;
        var prevname = data.preveousName;
        var msg = chatUi.messageTemplate({ nickname: newname , text: "name has changed to " + newname + " from " + prevname });
        chatUi.$messages.append(msg);
      });
      
      this.chat.socket.on('roomList', function (roomData) {
        console.log(roomData);
        chatUi.updateRoomList(roomData);
      });

      $('#send-form').on('submit', function(event){
        event.preventDefault();
        chatUi.inputProcessor();
      });
    },

    inputProcessor: function(){
      var text = this.$newMessage.val();
      
      if (text.substring(0, 5) === '/nick'){
        this.chat.sendChangeNameRequest(text.slice(6)); 
      } else if( text.substring(0, 5) === '/join' ){ 
        this.chat.joinRoom(text.slice(6));
      } else {
        this.chat.sendMessage(text);
      }
      this.$newMessage.val('');
    },
    
    updateRoomList: function (roomData) {
      this.$rooms.empty();
      console.log(roomData);
      for(var room in roomData) {
        var content = this.roomTemplate({
          name: room,
          usernames: roomData[room]
        });
        this.$rooms.append(content);
      }
    },
  
  });

}());
