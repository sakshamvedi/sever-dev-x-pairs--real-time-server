// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
let connectedUsers = {};

const PORT = 3002;

io.on('connect', (socket) => {
    connectedUsers[socket.id] = socket;

    socket.on(('winner'), ({ winner, opponentCode }) => {
        console.log('Winner: ' + opponentCode + ' ' + winner);
        io.to(opponentCode).emit('checkstatus', winner);
        console.log('After emit.');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        delete connectedUsers[socket.id];
    });

    socket.on('checkValidMatches', ({ usercode, opponentCode }) => {

        const isUserLive = connectedUsers.hasOwnProperty(usercode);
        const isCodeCorrect = connectedUsers.hasOwnProperty(opponentCode);

        if (isUserLive && isCodeCorrect) {

            socket.emit('matchValid', { message: 'User is live and code is correct' });
        } else {

            socket.emit('matchInvalid', { message: 'User is not live or code is not correct' });
        }
    });


    socket.on('userDetails', (obj) => {
        connectedUsers[socket.id] = obj;
        var data = connectedUsers[socket.id];
        console.log(connectedUsers[socket.id]);
        socket.emit('OppenentuserDetails', connectedUsers);
    });

    socket.on('userJoined', ({ opponentCode }) => {
        io.to(opponentCode).emit('request', "I am joined.");
    });

});

server.listen(PORT, () => {
    console.log(`Server running`);
});