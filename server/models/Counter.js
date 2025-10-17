'use strict';

const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure the counter starts from 1
CounterSchema.pre('save', function(next) {
  if (this.isNew && this.sequence_value === 0) {
    this.sequence_value = 1;
  }
  next();
});

module.exports = mongoose.model('Counter', CounterSchema);
