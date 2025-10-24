'use strict';

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { asyncHandler } = require('../utils/errorHandler');
const { protect } = require('../middleware/auth');

// Rutas para Productos
router.post('/', protect, asyncHandler(productController.createProduct));
router.get('/', asyncHandler(productController.getAllProducts));
router.get('/:id', asyncHandler(productController.getProductById));
router.put('/:id', protect, asyncHandler(productController.updateProduct));
router.delete('/:id', protect, asyncHandler(productController.deleteProduct));

module.exports = router;
