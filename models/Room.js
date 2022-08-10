const mongoose = require('mongoose');
const {Schema} = mongoose;

const roomSchema = new Schema({
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    roomName: String,
    capacity: Number,
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    description: String,
})

module.exports = mongoose.model('Room', roomSchema);
