const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    email: String,
    name: String,
    picture: String,
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Users', userSchema)
