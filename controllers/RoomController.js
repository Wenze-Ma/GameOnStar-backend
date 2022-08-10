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
        const room = await Room.find({_id: req.params.id});
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
            'host': req.body._id,
            'roomName': req.body.roomName,
            'capacity': req.body.capacity,
            'members': [req.body._id],
            'description': req.body.description,
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
        if (room.members.length < room.capacity) {
            room.members.push(req.body.socket_id);
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
        room.members.remove(req.body.socket_id);
        await room.save();
        res.status(200).json({
            room: room,
            success: true,
        });
    } catch (error) {
        res.status(400).send(error);
    }
}
