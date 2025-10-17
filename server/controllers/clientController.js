'use strict';

const Client = require('../models/Client');
const { AppError } = require('../utils/errorHandler');

// Crear un nuevo cliente
exports.createClient = async (req, res) => {
  const client = new Client(req.body);
  await client.save();
  res.status(201).json({
    status: 'success',
    data: {
      client
    }
  });
};

// Obtener todos los clientes
exports.getAllClients = async (req, res) => {
  const clients = await Client.find();
  res.status(200).json({
    status: 'success',
    results: clients.length,
    data: {
      clients
    }
  });
};

// Obtener un cliente por ID
exports.getClientById = async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return next(new AppError('No se encontró un cliente con ese ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  });
};

// Actualizar un cliente
exports.updateClient = async (req, res, next) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!client) {
    return next(new AppError('No se encontró un cliente con ese ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      client
    }
  });
};

// Eliminar un cliente
exports.deleteClient = async (req, res, next) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) {
    return next(new AppError('No se encontró un cliente con ese ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
};
