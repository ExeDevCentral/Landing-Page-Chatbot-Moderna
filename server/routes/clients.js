'use strict';

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { asyncHandler } = require('../utils/errorHandler');
const { protect } = require('../middleware/auth');

// Rutas para Clientes
router.post('/', protect, asyncHandler(clientController.createClient));
router.get('/', protect, asyncHandler(clientController.getAllClients));
router.get('/:id', protect, asyncHandler(clientController.getClientById));
router.put('/:id', protect, asyncHandler(clientController.updateClient));
router.delete('/:id', protect, asyncHandler(clientController.deleteClient));

module.exports = router;
