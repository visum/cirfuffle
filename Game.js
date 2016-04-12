// Game.js
var Player = require("./Player");

module.exports = function(io){
  var self = this;
  var players = [];
  var joinedPlayers = [];
  var viewers = [];
  var fieldWidth = 800;
  var fieldHeight = 600;
  var movementInterval = 5;
  var tickMills = 100;
  var tickTimer = -1;
  var state = "lobby";
  var redPlayers = [];
  var bluePlayers = [];

  var states = {
    "lobby": {
      "join": function(player){
        joinedPlayers.push(player);
        player.x = Math.floor(Math.random() * fieldWidth);
        player.y = Math.floor(Math.random() * fieldHeight);
        return getTeam();
      },
      "reset": function(){},
      "start": function(){
        joinedPlayers.forEach(function(player){
          player.sendStart();
        });
        redPlayers = joinedPlayers.filter((p) => {
          return p.team === "red";
        });
        bluePlayers = joinedPlayers.filter((p) => {
          return p.team === "blue";
        });
        tickTimer = setInterval(tick, tickMills);
        state = "running";
      }
    },
    "running": {
      "join": function(player){
        return false;
      },
      "reset": function(){
        players.forEach(function(player){
          player.sendReset();
        });
        viewers.forEach(function(viewer){
          viewer.emit("reset");
        });
        joinedPlayers = [];
        state = "lobby";
        clearInterval(tickTimer);
      },
      "start": function(){}
    }
  };

  var blueGoal = {top: fieldHeight * 0.2, right: fieldWidth * 0.4, bottom: fieldHeight * 0.8, left: fieldWidth * 0.1};
  var redGoal  = {top: fieldHeight * 0.2, right: fieldWidth * 0.9, bottom: fieldHeight * 0.8, left: fieldWidth * 0.6};
  var inGoal = {
    red: function(player){
      return (player.x > redGoal.left) && (player.x < redGoal.right) && (player.y > redGoal.top) && (player.y < redGoal.bottom);
    },
     blue: function(player){
       return (player.x > blueGoal.left) && (player.x < blueGoal.right) && (player.y > blueGoal.top) && (player.y < blueGoal.bottom);
     }
  };

  var teamToggle = false;
  getTeam = function(){
    teamToggle = !teamToggle;
    return teamToggle ? "red" : "blue";
  };

  self.join = function(player){
    return states[state].join(player);
  };

  self.leave = function(player){
    console.log("Player disconnected from team " + player.team);
    var cleanUpArrays = [players, joinedPlayers, redPlayers, bluePlayers];
    cleanUpArrays.forEach(function(a){
      var index = a.indexOf(player);
      if (a > -1) {
        a.splice(a, 1);
      }
    });
  };

  var handleMovement = function(player, direction){
    var newPos;
    if (direction === "left") {
      newPos = player.x - movementInterval;
      if (newPos >= 0) {
        player.x = newPos;
      }
    } else if (direction === "right") {
      newPos = player.x + movementInterval;
      if (newPos <= fieldWidth) {
        player.x = newPos;
      }
    } else if (direction === "up") {
      newPos = player.y - movementInterval;
      if (newPos >= 0) {
        player.y = newPos;
      }
    } else if (direction === "down") {
      newPos = player.y + movementInterval;
      if (newPos <= fieldHeight) {
        player.y = newPos;
      }
    }
  };

  var tick = function(){
    var data = joinedPlayers.map(function(player){
      return {team:player.team, x:player.x, y:player.y};
    });
    viewers.forEach(function(viewer){
      viewer.emit("update", data);
    });

    var blueWin = (bluePlayers.length > 0) && bluePlayers.every(inGoal.blue);
    var redWin = (redPlayers.length > 0) && redPlayers.every(inGoal.red);
    // check win
    if(blueWin) {
      bluePlayers.forEach(function(player){
        player.sendWin();
      });
      redPlayers.forEach(function(player){
        player.sendLose();
      });
      viewers.forEach(function(viewer){
        viewer.emit("win", {team:"blue"});
      });
    } else if (redWin) {
      redPlayers.forEach(function(player){
        player.sendWin();
      });
      bluePlayers.forEach(function(player){
        player.sendLose();
      });
      viewers.forEach(function(viewer){
        viewer.emit("win", {team:"red"});
      });
    }

    if (redWin || blueWin) {
      clearInterval(tickTimer);
    }
  };

  // default channel = players
  io.on('connection', function(socket){
    var player  = new Player(socket, self, handleMovement);
    players.push(player);
  });

  // viewer channel
  io.of("viewer").on("connection", function(socket){
    viewers.push(socket);
  });

  // manager channel
  io.of("manager").on("connection", function(socket){
      socket.on("discconnect", function(){
        managerClaimed = false;
      });

      socket.on("start", function(){
        states[state].start();
      });

      socket.on("reset", function(){
        states[state].reset();
      });
  });

};
