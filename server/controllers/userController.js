'use strict';

const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  const user = await User.createWithRole(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      user
    }
  });
};

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
};

// Obtener un usuario por ID
exports.getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No se encontró un usuario con ese ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
};

// Actualizar un usuario
exports.updateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!user) {
    return next(new AppError('No se encontró un usuario con ese ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
};

// Eliminar un usuario
exports.deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('No se encontró un usuario con ese ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
};
