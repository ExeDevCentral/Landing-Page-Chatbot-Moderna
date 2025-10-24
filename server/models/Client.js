'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
  nickname: {
    type: String,
    required: [true, 'Nickname is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Nickname must be less than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    maxlength: [255, 'Email must be less than 255 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number must be less than 20 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [255, 'Address must be less than 255 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio must be less than 500 characters']
  },
  preferences: {
    type: String,
    trim: true,
    maxlength: [500, 'Preferences must be less than 500 characters']
  },
  contactHours: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact hours must be less than 100 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('client', ClientSchema);
