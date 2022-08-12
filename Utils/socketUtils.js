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
global.onlineUsers = new Map();
global.rooms = new Map();
global.users = new Map();


exports.connection = io => {
    io.on('connection', socket => {
        console.log('A user is connected');
        for (const [roomId, values] of rooms) {
            for (const email of values) {
                if (!onlineUsers.has(email)) {
                    values.delete(email);
                }
            }
            if (values.size === 0) {
                rooms.delete(roomId);
            }
        }
        socket.on('add-user', userId => {
            onlineUsers.set(userId, socket.id);
        });
        socket.on('join-room', async data => {
            const roomId = data.roomId;
            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Set());
            }
            rooms.get(roomId).add(data.email);
            users.set(data.email, roomId);
            const room = await Room.findOne({_id: roomId});
            if (!room) return;
            if (!room.members.includes(data.email)) {
                room.members.push(data.email);
                await room.save();
            }
            console.log(rooms);
            console.log(onlineUsers);
            console.log(users)
            // for (const email of rooms.get(users.get(data.email))) {
            //     socket.to(onlineUsers.get(email)).emit('joined', email);
            // }
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
        socket.on('disconnect', async () => {
            console.log("disconnect");
            for (const [key, value] of onlineUsers) {
                if (value === socket.id) {
                    const room = await Room.findOne({_id: users.get(key)});
                    if (!room) break;
                    if (room.host === key) {
                        await Room.deleteOne({_id: room._id});
                    } else {
                        room.members.remove(key);
                        await room.save();
                    }
                    rooms.get(users.get(key)).delete(key);
                    onlineUsers.delete(key);
                    users.delete(key);
                    break;
                }
            }
            console.log(rooms);
            console.log(onlineUsers);
            console.log(users)
        });
    })
}
