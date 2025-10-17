'use strict';

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { asyncHandler } = require('../utils/errorHandler');

// Rutas para Clientes
router.post('/', asyncHandler(clientController.createClient));
router.get('/', asyncHandler(clientController.getAllClients));
router.get('/:id', asyncHandler(clientController.getClientById));
router.put('/:id', asyncHandler(clientController.updateClient));
router.delete('/:id', asyncHandler(clientController.deleteClient));

module.exports = router;
