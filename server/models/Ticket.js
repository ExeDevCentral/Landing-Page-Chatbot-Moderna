'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new mongoose.Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'client',
    required: [true, 'Client is required']
  },
  menu: {
    type: String,
    required: [true, 'Menu is required'],
    trim: true,
    minlength: [1, 'Menu description cannot be empty'],
    maxlength: [200, 'Menu description must be less than 200 characters']
  },
  table: {
    type: String,
    required: [true, 'Table is required'],
    trim: true,
    minlength: [1, 'Table identifier cannot be empty'],
    maxlength: [50, 'Table identifier must be less than 50 characters']
  },
  waiter: {
    type: String,
    required: [true, 'Waiter is required'],
    trim: true,
    minlength: [1, 'Waiter name cannot be empty'],
    maxlength: [100, 'Waiter name must be less than 100 characters']
  },
  orderNumber: {
    type: Number,
    required: [true, 'Order number is required'],
    unique: true,
    min: [1, 'Order number must be positive']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
      message: 'Status must be one of: pending, preparing, ready, served, cancelled'
    },
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes must be less than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
TicketSchema.index({ orderNumber: 1 });
TicketSchema.index({ client: 1 });
TicketSchema.index({ table: 1 });
TicketSchema.index({ waiter: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
TicketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to update updatedAt
TicketSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static method to find tickets by status
TicketSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ createdAt: -1 });
};

// Static method to find tickets by waiter
TicketSchema.statics.findByWaiter = function(waiter) {
  return this.find({ waiter: waiter }).sort({ createdAt: -1 });
};

// Static method to find tickets by table
TicketSchema.statics.findByTable = function(table) {
  return this.find({ table: table }).sort({ createdAt: -1 });
};

// Instance method to update status
TicketSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
  return this.save();
};

// Virtual for order age in minutes
TicketSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60));
});

// Ensure virtual fields are serialized
TicketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', TicketSchema);
