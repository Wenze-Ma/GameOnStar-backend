const socketIO = require('socket.io');
const axios = require("axios");

exports.sio = server => {
    return socketIO(server, {
        transport: ['polling'],
        cors: {
            origin: '*'
        }
    })
}
global.onlineUsers = new Map();
global.rooms = new Map();
global.users = new Map();

exports.connection = io => {
    io.on('connection', socket => {
        console.log('A user is connected');
        socket.on('add-user', userId => {
            onlineUsers.set(userId, socket.id);
        });
        socket.on('join-room', data => {
            const roomId = data.roomId;
            for (const users of rooms.values()) {
                users.delete(data.email);
            }
            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Set());
            }
            rooms.get(roomId).add(data.email);
            users.set(data.email, roomId);
            console.log(rooms);
            console.log(onlineUsers);
            console.log(users)
            for (const email of rooms.get(users.get(data.email))) {
                socket.to(onlineUsers.get(email)).emit('joined', email);
            }
        });
        socket.on('send-msg', data => {
            for (const email of rooms.get(users.get(data.userId))) {
                if (email !== data.userId) {
                    socket.to(onlineUsers.get(email)).emit('receive-msg', {sender: data.userId, text: data.text});
                }
            }
        });
        socket.on('leave-room', data => {
            const roomId = data.roomId;
            const email = data.email;
            if (rooms.has(roomId)) {
                rooms.get(roomId).delete(email);
                if (rooms.get(roomId).size === 0) {
                    rooms.delete(roomId);
                }
                users.delete(email);
                onlineUsers.delete(email);
            }
            console.log(rooms);
            console.log(onlineUsers);
            console.log(users)
        });
    })
}
