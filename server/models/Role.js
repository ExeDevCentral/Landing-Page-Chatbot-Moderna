'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Role name must be less than 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [255, 'Description must be less than 255 characters']
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'permission'
  }]
}, {
  timestamps: true
});

RoleSchema.index({ name: 1 });

module.exports = mongoose.model('role', RoleSchema);
