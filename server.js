var http = require('http');
var express = require('express');
var app = express();
var path = require('path');

var server = http.Server(app);
var port = process.env.PORT || 3000;
var io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, './static')));
app.set('views',path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});

// var server = app.listen(process.env.PORT || 3000, function() {
//     console.log("listening to 3000");
// });

// var io = require('socket.io').listen(server);

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

    // New user joins
    socket.on('new_user', function(name){
        socket.user = name;
        // Send existing messages to client
        allMessages.forEach(function(message){
            socket.emit('new_messages', message.name + ": " + message.message);
        });
        // Store user
        storeUsers(socket.user, socket.id);
        io.emit('active_users', activeUsers);
        console.log(activeUsers);
    });
    
    // New message received
    socket.on('new_messages', function (data) {
        var currentUser = socket.user
        io.emit('new_messages', currentUser + ": " + data);
        // Store message
        storeMessage(currentUser, data);
    });

    // socket.on('disconnect', function(){
    //     console.log('user disconnected');
    //     // Remove user from activeUser array by socket.id
    //     activeUsers.splice(activeUsers.map(function(y){
    //         return y.id;
    //     }).indexOf(socket.id), 1);
    //     console.log(activeUsers);
    //     // Emit active users to clients
    //     io.emit('active_users', activeUsers);
    // });



});

server.listen(port);
console.log('Server is running.');
