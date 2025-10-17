'use strict';

const Ticket = require('../models/Ticket');
const Counter = require('../models/Counter');
const { AppError, ErrorTypes, ErrorMessages, asyncHandler, logError, retryOperation } = require('../utils/errorHandler');

// Enhanced validation helper
const validateTicketData = (data) => {
  const errors = [];
  
  // Required field validation
  if (!data.menu || typeof data.menu !== 'string' || data.menu.trim().length === 0) {
    errors.push('El menú es requerido y debe ser una cadena no vacía');
  }
  
  if (!data.table || typeof data.table !== 'string' || data.table.trim().length === 0) {
    errors.push('La mesa es requerida y debe ser una cadena no vacía');
  }
  
  if (!data.waiter || typeof data.waiter !== 'string' || data.waiter.trim().length === 0) {
    errors.push('El mesero es requerido y debe ser una cadena no vacía');
  }
  
  // Length validation
  if (data.menu && data.menu.length > 200) {
    errors.push('La descripción del menú debe tener menos de 200 caracteres');
  }
  
  if (data.table && data.table.length > 50) {
    errors.push('El identificador de mesa debe tener menos de 50 caracteres');
  }
  
  if (data.waiter && data.waiter.length > 100) {
    errors.push('El nombre del mesero debe tener menos de 100 caracteres');
  }

  // Pattern validation
  if (data.menu && !/^[a-zA-Z0-9\s\-_.,áéíóúñüÁÉÍÓÚÑÜ]+$/.test(data.menu)) {
    errors.push('El menú contiene caracteres no válidos');
  }

  if (data.table && !/^[a-zA-Z0-9\-_\s]+$/.test(data.table)) {
    errors.push('La mesa contiene caracteres no válidos');
  }

  if (data.waiter && !/^[a-zA-Z\sáéíóúñüÁÉÍÓÚÑÜ]+$/.test(data.waiter)) {
    errors.push('El nombre del mesero contiene caracteres no válidos');
  }

  // Business logic validation
  if (data.waiter && data.waiter.trim().split(' ').length < 2) {
    errors.push('El nombre del mesero debe incluir nombre y apellido');
  }
  
  return errors;
};

// Get next order number with retry logic
const getNextOrderNumber = async () => {
  const operation = async () => {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'orderNumber' },
      { $inc: { sequence_value: 1 } },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    if (!counter) {
      throw new AppError('No se pudo generar el número de orden', 500, ErrorTypes.INTERNAL_SERVER_ERROR);
    }
    
    return counter.sequence_value;
  };

  try {
    return await retryOperation(operation, 3, 1000);
  } catch (error) {
    logError(error, { operation: 'getNextOrderNumber' });
    throw new AppError('Error al generar número de orden', 500, ErrorTypes.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Public
const createTicket = asyncHandler(async (req, res) => {
  const { menu, table, waiter } = req.body;
  
  // Validate input data
  const validationErrors = validateTicketData({ menu, table, waiter });
  if (validationErrors.length > 0) {
    throw new AppError(
      'Datos de entrada inválidos',
      400,
      ErrorTypes.VALIDATION_ERROR
    );
  }
  
  // Sanitize input data
  const sanitizedData = {
    menu: menu.trim().replace(/\s+/g, ' '), // Normalize spaces
    table: table.trim().toUpperCase(), // Convert to uppercase
    waiter: waiter.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') // Capitalize each word
  };
  
  // Get next order number with retry
  const orderNumber = await getNextOrderNumber();
  
  // Create ticket
  const ticket = new Ticket({
    ...sanitizedData,
    orderNumber
  });
  
  const savedTicket = await ticket.save();
  
  // Log successful creation
  console.log(`✅ Ticket created: Order #${orderNumber} for table ${sanitizedData.table}`);
  
  res.status(201).json({
    success: true,
    message: 'Ticket creado exitosamente',
    data: {
      _id: savedTicket._id,
      menu: savedTicket.menu,
      table: savedTicket.table,
      waiter: savedTicket.waiter,
      orderNumber: savedTicket.orderNumber,
      createdAt: savedTicket.createdAt
    }
  });
});

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Public
const getAllTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', table, waiter } = req.query;
    
    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid Pagination',
        message: 'Page must be >= 1, limit must be between 1 and 100'
      });
    }
    
    // Build filter
    const filter = {};
    if (table) filter.table = { $regex: table, $options: 'i' };
    if (waiter) filter.waiter = { $regex: waiter, $options: 'i' };
    
    // Validate sort parameter
    const allowedSortFields = ['createdAt', '-createdAt', 'orderNumber', '-orderNumber', 'table', '-table'];
    const sortField = allowedSortFields.includes(sort) ? sort : '-createdAt';
    
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with pagination
    const [tickets, totalCount] = await Promise.all([
      Ticket.find(filter)
        .sort(sortField)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Ticket.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / limitNum);
    
    res.json({
      success: true,
      data: tickets,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Get all tickets error:', error);
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'Database connection failed. Please try again later.'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve tickets. Please try again.'
    });
  }
};

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
// @access  Public
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID Format',
        message: 'Ticket ID must be a valid MongoDB ObjectId'
      });
    }
    
    const ticket = await Ticket.findById(id).lean();
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket Not Found',
        message: 'No ticket found with the provided ID'
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
    
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID Format',
        message: 'Ticket ID must be a valid MongoDB ObjectId'
      });
    }
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'Database connection failed. Please try again later.'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve ticket. Please try again.'
    });
  }
};

// @desc    Update a ticket
// @route   PUT /api/tickets/:id
// @access  Public
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID Format',
        message: 'Ticket ID must be a valid MongoDB ObjectId'
      });
    }
    
    // Validate update data
    const validationErrors = validateTicketData(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid update data',
        details: validationErrors
      });
    }
    
    // Sanitize update data
    const sanitizedData = {};
    if (updateData.menu) sanitizedData.menu = updateData.menu.trim();
    if (updateData.table) sanitizedData.table = updateData.table.trim();
    if (updateData.waiter) sanitizedData.waiter = updateData.waiter.trim();
    
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      sanitizedData,
      { 
        new: true, 
        runValidators: true,
        lean: true
      }
    );
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket Not Found',
        message: 'No ticket found with the provided ID'
      });
    }
    
    console.log(`✅ Ticket updated: Order #${ticket.orderNumber}`);
    
    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
    
  } catch (error) {
    console.error('Update ticket error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID Format',
        message: 'Ticket ID must be a valid MongoDB ObjectId'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid update data',
        details: errors
      });
    }
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'Database connection failed. Please try again later.'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update ticket. Please try again.'
    });
  }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Public
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID Format',
        message: 'Ticket ID must be a valid MongoDB ObjectId'
      });
    }
    
    const ticket = await Ticket.findByIdAndDelete(id).lean();
    
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket Not Found',
        message: 'No ticket found with the provided ID'
      });
    }
    
    console.log(`✅ Ticket deleted: Order #${ticket.orderNumber}`);
    
    res.json({
      success: true,
      message: 'Ticket deleted successfully',
      data: { orderNumber: ticket.orderNumber }
    });
    
  } catch (error) {
    console.error('Delete ticket error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID Format',
        message: 'Ticket ID must be a valid MongoDB ObjectId'
      });
    }
    
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'Database connection failed. Please try again later.'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete ticket. Please try again.'
    });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket
};