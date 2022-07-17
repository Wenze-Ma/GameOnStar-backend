const express = require('express');
const userRoutes = express.Router();
const userController = require('../controllers/UserController')

userRoutes.route("/all").get(userController.getUsers);
userRoutes.route('/signup').post(userController.signUp);
userRoutes.route('/signin').post(userController.signIn);

module.exports = userRoutes;
