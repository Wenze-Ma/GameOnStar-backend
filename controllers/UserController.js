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
        let cookievalue = await bcrypt.hash("secretword", 10);
        cookievalue = cookievalue.split("$").join("");
        cookievalue = cookievalue.split("/").join("");
        if (!findUser) {
            Session.deleteOne({user: user._id}).then(async () => {
                const today = new Date();
                today.setHours(today.getHours() + 2);
                let session = new Session({
                    "user": user._id,
                    "session": cookievalue,
                    "date": today,
                });
                await session.save();
            });
            user = await user.save();
            res.status(200).json({
                user: user, success: true, cookie: cookievalue,
            });
        } else {
            Session.deleteOne({user: findUser._id}).then(async () => {
                const today = new Date();
                today.setHours(today.getHours() + 2);
                let session = new Session({
                    "user": findUser._id,
                    "session": cookievalue,
                    "date": today,
                });
                await session.save();
            });
            res.status(200).json({
                existed: true,
                user: findUser,
                cookie: cookievalue,
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
                res.send({
                    success: true,
                    user: user,
                    cookie: cookievalue,
                });
                Session.deleteOne({user: user._id}).then(async () => {
                    const today = new Date();
                    today.setHours(today.getHours() + 2);
                    let session = new Session({
                        "user": user._id,
                        "session": cookievalue,
                        "date": today,
                    });
                    await session.save();
                });
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

module.exports.getUserByCookie = async (req, res) => {
    try {
        const session = await Session.findOne({
            session: req.body.cookie
        });
        if (session) {
            const user = await User.findOne({
                _id: session.user,
            });
            if (user) {
                res.json({
                    success: true,
                    user: user,
                })
            } else {
                res.send('no such user');
            }
        } else {
            res.send('no such session')
        }
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.signOut = async (req, res) => {
    try {
        await Session.deleteOne({session: req.body.cookie});
        res.send("success");
    } catch (error) {
        res.status(400).send(error);
    }
}

module.exports.getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({email: req.params.email});
        res.json({
            user: user,
        });
    } catch (error) {
        res.status(400).send(error);
    }
}
