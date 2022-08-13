const socketIO = require('socket.io');
const axios = require("axios");
const Room = require('../models/Room');


exports.sio = server => {
    return socketIO(server, {
        transport: ['polling'],
        cors: {
            origin: '*'
        }
    })
}

exports.connection = io => {
    io.on('connection', socket => {
        console.log('A user is connected');
        socket.on('join-room', (roomId, userId) => {
            for (const room of socket.rooms) {
                socket.leave(room);
            }
            socket.join(roomId);
            io.to(roomId).emit('join-room', userId);
            console.log('\n'+`${userId} joined ${roomId}`);
            console.log(socket.rooms);
            console.log(io.sockets.adapter.rooms);
        });

        socket.on('leave-room', async (roomId, userId) => {
            socket.leave(roomId);
            io.to(roomId).emit('leave-room', userId);
            console.log('\n' + `${userId} leaved ${roomId}`);
            console.log(socket.rooms);
            console.log(io.sockets.adapter.rooms);
        });

        socket.on('disconnect', () => {
            for (const room of socket.rooms) {
                socket.leave(room);
            }
            console.log('\n'+io.sockets.adapter.rooms);
        });

        socket.on('send-message', (roomId, userId, message) => {
            io.to(roomId).emit('receive-message', userId, message);
        });
    })
}
