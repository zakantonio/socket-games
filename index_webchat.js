var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('./index.html');
});

io.on('connection', function(socket){
  socket.on('message', function(msg){
    console.log('message: ' + msg);
    io.emit('message', 'Did you say: ' + msg + '?');
  });
});

http.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);