const mongoose = require('mongoose');
const {Schema} = mongoose;

const roomSchema = new Schema({
    host: {
        type: String,
        required: true,
    },
    roomName: String,
    capacity: Number,
    members: [{
        type: String
    }],
    description: String,
    gameSelected: Number,
    gameStarted: Boolean,
    gameData: Map,
})

module.exports = mongoose.model('Room', roomSchema);
