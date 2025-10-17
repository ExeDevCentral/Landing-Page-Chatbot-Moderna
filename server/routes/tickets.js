'use strict';

const express = require('express');
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');
const { protect, hasPermission } = require('../middleware/auth');

// All routes below are protected
router.use(protect);

// @route   POST api/tickets
// @desc    Create a new ticket
router.post('/', hasPermission('create-ticket'), createTicket);

// @route   GET api/tickets
// @desc    Get all tickets with pagination and filtering
router.get('/', hasPermission('read-ticket'), getAllTickets);

// @route   GET api/tickets/:id
// @desc    Get a single ticket by ID
router.get('/:id', hasPermission('read-ticket'), getTicketById);

// @route   PUT api/tickets/:id
// @desc    Update a ticket
router.put('/:id', hasPermission('update-ticket'), updateTicket);

// @route   DELETE api/tickets/:id
// @desc    Delete a ticket
router.delete('/:id', hasPermission('delete-ticket'), deleteTicket);

module.exports = router;
