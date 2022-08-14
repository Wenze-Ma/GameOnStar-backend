const Room = require('../models/Room');

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
            'gameSelected': -1,
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
        if (room.members[0]) {
            if (room.host === req.body.email) {
                room.host = room.members[0];
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
