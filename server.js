var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Game = require('./Game');

server.listen(8080, '192.168.2.145');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/web/index.html');
});

app.get('/manage', function(req, res){
  res.sendFile(__dirname + '/web/manage.html');
});

app.get('/view', function(req, res){
  res.sendFile(__dirname + '/web/view.html');
});

app.get("/viewer.js", function(req, res){
  res.sendFile(__dirname + "/web/viewer.js");
});

var game = new Game(io);
