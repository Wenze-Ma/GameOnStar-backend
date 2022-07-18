const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let sessionSchema = new Schema(
    {
        user: String,
        session: String,
        date: Date,
    }
);

let Session = mongoose.model("session", sessionSchema);

module.exports = Session;
