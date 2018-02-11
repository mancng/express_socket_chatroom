var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, './static')));
app.set('views',path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});

var server = app.listen(3000, function() {
    console.log("listening to 3000");
});

var io = require('socket.io').listen(server);

// Store users
var activeUsers = [];
var storeUsers = function(name, id) {
    if (name != null) {
        activeUsers.push({name: name, id: id});
    };
};

// Store messages
var allMessages = [];
var storeMessage = function(name, data) {
    allMessages.push({name: name, message: data});
};

// Store username
var userName;

// Socket.io
io.sockets.on('connection', function(socket) {
    console.log("Client/socket id is: ", socket.id);

    socket.on('new_user', function(name){
        userName = name;
        allMessages.forEach(function(message){
            socket.emit('chat_messages', message.name + ":" + message.data);
        });
        // Store user
        storeUsers(userName, socket.id);
        io.emit('active_users', activeUsers);
        console.log(activeUsers);
    })
    
    socket.on( 'new_messages', function (data) {
        io.emit('new_messages', userName+":" + data);
        storeMessage(userName, data);
    })



});