const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    email: String,
    firstName: String,
    lastName: String,
    picture: String,
    date: {type: Date, default: Date.now},
    password_hash: String,
    third_party: Boolean,
})

module.exports = mongoose.model('User', userSchema);
