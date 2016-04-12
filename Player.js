// Player.js
module.exports = function(socket, game, movementHandler){
  var self = this;
  self.socket = socket;
  self.team = null;
  self.x = 0;
  self.y = 0;

  socket.on("move", function(data){
    movementHandler(self, data.direction);
  });

  socket.on("join", function(data){
    self.team = game.join(self);
    if (typeof self.team !== "string") {
      socket.emit("inProgress");
    } else {
      socket.emit("join", {team:self.team});
    }
  });

  socket.on("disconnect", function(data){
    game.leave(self);
  });

  self.sendStart = function(){
    socket.emit("start");
  };

  self.sendWin = function(){
    socket.emit("win");
  };

  self.sendLose = function(){
    socket.emit("lose");
  };

  self.sendReset = function(){
    socket.emit("reset");
  };

};
