const express = require('express');
const roomRoutes = express.Router();
const roomController = require('../controllers/RoomController');

roomRoutes.route('/all').get(roomController.getRooms);
roomRoutes.route('/create').post(roomController.createRoom);
roomRoutes.route('/getRoom/:id').get(roomController.getRoom);
roomRoutes.route('/join').post(roomController.joinRoom);
roomRoutes.route('/leave').post(roomController.leaveRoom);
roomRoutes.route('/delete/:roomId').delete(roomController.deleteRoom);
roomRoutes.route('/start').post(roomController.startGame);
roomRoutes.route('/end').post(roomController.endGame);
roomRoutes.route('/watch').post(roomController.watchGame);
roomRoutes.route('/ready').post(roomController.getReady);


module.exports = roomRoutes;
