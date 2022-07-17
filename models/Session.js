const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let sessionSchema = new Schema(
    {
        user: String,
        session: String,
        date: {type: Date, default: Date.now},
    }
);

let Session = mongoose.model("session", sessionSchema);

module.exports = Session;
