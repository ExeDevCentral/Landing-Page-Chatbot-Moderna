'use strict';

const Product = require('../models/Product');
const { AppError } = require('../utils/errorHandler');

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  const productData = {
    ...req.body,
    createdBy: req.user.id,
    updatedBy: req.user.id
  };
  const product = new Product(productData);
  await product.save();
  res.status(201).json({
    status: 'success',
    data: {
      product
    }
  });
};

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
};

// Obtener un producto por ID
exports.getProductById = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('No se encontró un producto con ese ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
};

// Actualizar un producto
exports.updateProduct = async (req, res, next) => {
  const productData = {
    ...req.body,
    updatedBy: req.user.id
  };
  const product = await Product.findByIdAndUpdate(req.params.id, productData, {
    new: true,
    runValidators: true
  });
  if (!product) {
    return next(new AppError('No se encontró un producto con ese ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
};

// Eliminar un producto
exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('No se encontró un producto con ese ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
};
