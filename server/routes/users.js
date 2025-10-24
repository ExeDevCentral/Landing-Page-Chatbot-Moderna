'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { asyncHandler } = require('../utils/errorHandler');
const { protect } = require('../middleware/auth');

// Rutas para Usuarios
router.post('/', protect, asyncHandler(userController.createUser));
router.get('/', protect, asyncHandler(userController.getAllUsers));
router.get('/:id', protect, asyncHandler(userController.getUserById));
router.put('/:id', protect, asyncHandler(userController.updateUser));
router.delete('/:id', protect, asyncHandler(userController.deleteUser));

module.exports = router;
