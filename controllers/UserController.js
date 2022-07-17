const User = require('../models/User');
const bcrypt = require("bcrypt");
const Session = require("../models/Session");


module.exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.signUp = async (req, res) => {
    try {
        let user = new User({
            'email': req.body.email,
            'firstName': req.body.firstName,
            'lastName': req.body.lastName,
        });
        if (req.body.thirdParty) {
            user.third_party = true;
        } else {
            user.password_hash = await bcrypt.hash(req.body.password, 10);
        }
        const findUser = await User.findOne({email: user.email});
        if (!findUser) {
            user = await user.save();
            res.status(200).json({user: user, success: true});
        } else {
            res.status(200).json({
                existed: true,
                user: findUser,
            })
        }
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.signIn = async (req, res) => {
    try {
        let user = await User.findOne({
            email: req.body.email
        });
        if (user) {
            if (await bcrypt.compare(req.body.password, user.password_hash)) {
                let cookievalue = await bcrypt.hash("secretword", 10);
                cookievalue = cookievalue.split("$").join("");
                cookievalue = cookievalue.split("/").join("");
                res.cookie("game_on_star_cookie", cookievalue, {httpOnly: false});
                res.send({
                    success: true,
                    user: user,
                });
                let session = new Session({
                    "user": user._id,
                    "session": cookievalue
                });
                await session.save();
            } else {
                res.json({
                    data: "Incorrect password"
                });
            }
        } else {
            res.json({
                data: "No user with that email"
            });
        }
    } catch
        (err) {
        res.status(400).json({
            status: 400,
            message: err.message
        });
    }
}
