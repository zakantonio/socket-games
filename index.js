// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
/*
var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Listening on port %d', port);
});
*/


server.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);

// Routing
app.use(express.static(__dirname + '/public'));


// Chatroom


// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;


io.on('connection', function (socket) {
  var addedUser = false;


  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    console.log("new Message");
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });


  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
      console.log("add user");
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('game', function (pos) {
    console.log("game on %d", pos);
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('game', {
      n: pos
    });
  });

  socket.on('game win', function () {
    console.log("game win by", socket.username);
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('game over', {
      username: socket.username
    });
  });
    
  socket.on('game finish', function () {
    console.log("game finish in a draw");
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('game finish');
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });


  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });


  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;


      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
