'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Permission name must be less than 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [255, 'Description must be less than 255 characters']
  }
}, {
  timestamps: true
});

PermissionSchema.index({ name: 1 });

module.exports = mongoose.model('permission', PermissionSchema);
