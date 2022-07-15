const express = require('express');
const userRoutes = express.Router();
const userController = require('../controllers/UserController')

userRoutes.route("/all").get(userController.getUsers);

module.exports = userRoutes;
