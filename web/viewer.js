// viewer.js

var url = new URL(document.location.href);
var socket = io("http://" + url.host + "/viewer");
var canvas = document.querySelector("#canvas");
var context = canvas.getContext("2d");
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;
var circleRadius = 10;

var clear = function(){
  context.fillStyle = "white";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
};

var drawGoals = function(){
  // blue box
  var blueLeft = canvasWidth * 0.1;
  var blueTop = canvasHeight * 0.2;
  var blueRight = canvasWidth * 0.4;
  var blueBottom = canvasHeight * 0.8;
  context.strokeStyle = "blue";
  context.strokeRect(blueLeft, blueTop, blueRight - blueLeft, blueBottom - blueTop);

  // red box
  var redLeft = canvasWidth * 0.6;
  var redRight = canvasWidth * 0.9;
  var redTop = canvasHeight * 0.2;
  var redBottom = canvasHeight * 0.8;
  context.strokeStyle = "red";
  context.strokeRect(redLeft, redTop, redRight - redLeft, redBottom - redTop);
};

var draw = function(data){
  clear();
  drawGoals();

  data.forEach(function(player){
    context.beginPath();
    context.fillStyle = player.team;
    context.arc(player.x, player.y, circleRadius, 0, 2 * Math.PI);
    context.fill();
  });
};

socket.on("update", function(data){
  draw(data);
});

socket.on("win", function(data){
  // make everything the color of the winning team
  context.fillStyle = data.team;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
});

socket.on("reset", function(data){
  // erase everything
  clear();
  drawGoals();
});

drawGoals();
