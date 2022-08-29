const socketIO = require('socket.io');
const axios = require("axios");
const Room = require('../models/Room');
const ObjectId = require('mongoose').Types.ObjectId;

exports.sio = server => {
    return socketIO(server, {
        transport: ['polling'],
        cors: {
            origin: '*'
        }
    })
}

const onlineUsers = new Map();

exports.connection = io => {
    io.on('connection', socket => {
        console.log('A user is connected');
        socket.on('join-room', async (roomId, userId) => {
            console.log('\njoined ' + roomId + ' ' + userId);
            for (const room of socket.rooms) {
                socket.leave(room);
            }
            const room = await Room.findOne({_id: roomId});
            if (room) {
                socket.join(roomId);
                onlineUsers.set(socket.id, userId);
                io.to(roomId).emit('join-room', userId);
            }
            if (room && !room.members.includes(userId)) {
                room.members.push(userId);
                await room.save();
            }
            console.log(`${userId} joined ${roomId}`);
            console.log(socket.rooms);
            console.log(io.sockets.adapter.rooms);
            console.log(onlineUsers);
        });

        socket.on('leave-room', (roomId, userId) => {
            console.log('\nleaved ' + roomId + ' ' + userId);
            socket.leave(roomId);
            io.to(roomId).emit('leave-room', userId);
            console.log(`${userId} leaved ${roomId}`);
            console.log(socket.rooms);
            console.log(io.sockets.adapter.rooms);
        });

        socket.on('ready', (roomId, userId) => {
            console.log(userId);
            io.to(roomId).emit('ready', userId);
        });

        socket.on('watch', (roomId, userId) => {
            io.to(roomId).emit('watch', userId);
        });

        socket.on('disconnecting', async () => {
            console.log('\ndisconnecting');
            for (const room of socket.rooms) {
                if (!ObjectId.isValid(room)) continue;
                const email = onlineUsers.get(socket.id);
                const r = await Room.findOne({_id: room});
                if (!r) continue;
                r.members.remove(email);
                if (!r.watchers.includes(email)) {
                    r.gameStarted = false;
                }
                r.usersReady = r.usersReady.filter(u => u !== email);
                r.watchers = r.watchers.filter(u => u !== email);
                if (r.members[0]) {
                    if (r.host === email) {
                        r.host = r.members[0];
                    }
                    await r.save();
                } else {
                    await Room.deleteOne({_id: room});
                }
                socket.to(room).emit('leave-room', email);
                socket.leave(room);
            }
            onlineUsers.delete(socket.id);
            console.log('\n' + io.sockets.adapter.rooms);
            console.log(onlineUsers);
        })

        socket.on('disconnect', () => {
            console.log('disconnect')
        });

        socket.on('send-message', (roomId, userId, message) => {
            io.to(roomId).emit('receive-message', userId, message);
        });

        socket.on('game-select', async (roomId, index) => {
            const room = await Room.findOne({_id: roomId});
            io.to(roomId).emit('game-select', index);
            if (room) {
                room.gameSelected = index;
                await room.save();
            }
        });

        socket.on('game-start', (roomId) => {
            io.to(roomId).emit('game-start');
        });

        socket.on('tic-tac-toe-place-chess', (roomId, value, index, newState) => {
            io.to(roomId).emit('tic-tac-toe-place-chess', value, index, newState);
        });

        socket.on('end-game', (roomId) => {
            io.to(roomId).emit('end-game');
        });
    })
}
