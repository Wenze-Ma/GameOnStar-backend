const Room = require('../models/Room');
const {gameInfo} = require("../Utils/GameInfo");

module.exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json({
            rooms: rooms,
        });
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findOne({_id: req.params.id});
        res.status(200).json({
            room: room,
        });
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.createRoom = async (req, res) => {
    try {
        const room = new Room({
            'host': req.body.host,
            'roomName': req.body.roomName,
            'capacity': req.body.capacity,
            'members': [req.body.host],
            'description': req.body.description,
            'gameSelected': 0,
            'gameStarted': false,
            'watchers': [],
            'usersReady': [req.body.host],
        });
        await room.save();
        res.status(200).json({
            room: room,
            success: true,
        })
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.joinRoom = async (req, res) => {
    try {
        const room = await Room.findOne({_id: req.body.id});
        if (room.members.length < room.capacity && !room.members.includes(req.body.email)) {
            room.members.push(req.body.email);
            await room.save();
            res.status(200).json({
                room: room,
                success: true,
            })
        } else {
            res.status(200).json({
                room: room,
                success: false,
            })
        }

    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.leaveRoom = async (req, res) => {
    try {
        const room = await Room.findOne({_id: req.body.id});
        room.members.remove(req.body.email);
        room.usersReady = room.usersReady.filter(u => u !== req.body.email);
        room.watchers = room.watchers.filter(u => u !== req.body.email);
        const requiredNumber = gameInfo[room.gameSelected];
        if (room.usersReady.length < requiredNumber[0]) {
            room.gameStarted = false;
        }
        if (room.members[0]) {
            if (room.host === req.body.email) {
                const newHost = room.members[0];
                room.host = newHost;
                if (!room.usersReady.includes(newHost)) {
                    room.usersReady.push(newHost);
                }
            }
            await room.save();
        } else {
            await Room.deleteOne({_id: req.body.id});
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.deleteRoom = async (req, res) => {
    try {
        await Room.deleteOne({_id: req.params.roomId});
        res.status(200).send('deleted');
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.startGame = async (req, res) => {
    try {
        const room = await Room.findOne({_id: req.body.roomId});
        if (room && !room.gameStarted) {
            room.gameStarted = true;
            room.gameData = req.body.gameData;
            await room.save();
            res.status(200).json({
                room: room,
                success: true,
            });
        }
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.endGame = async (req, res) => {
    try {
        const room = await Room.findOne({_id: req.body.roomId});
        if (room && room.gameStarted) {
            room.gameStarted = false;
            room.usersReady = [room.host];
            await room.save();
            res.status(200).json({
                room: room,
                success: true
            });
        }
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.watchGame = async (req, res) => {
    try {
        const room = await Room.findOne({_id: req.body.roomId});
        if (room) {
            if (room.watchers.includes(req.body.email)) {
                room.watchers = room.watchers.filter(w => w !== req.body.email);
            } else {
                room.watchers.push(req.body.email);
                room.usersReady = room.usersReady.filter(u => u !== req.body.email);
            }
            await room.save();
            res.status(200).json({
                room: room,
                success: true,
            })
        }
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.getReady = async (req, res) => {
    try {
        const room = await Room.findOne({_id: req.body.roomId});
        if (room) {
            if (room.usersReady.includes(req.body.email)) {
                room.usersReady = room.usersReady.filter(w => w !== req.body.email);
            } else {
                room.usersReady.push(req.body.email);
            }
            await room.save();
            res.status(200).json({
                room: room,
                success: true,
            })
        }
    } catch (error) {
        res.status(400).send(error);
    }
}
