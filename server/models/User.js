// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userProfileSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  hireDate: {
    type: Date
  },
  salary: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'Apellido es requerido'],
    trim: true,
    maxlength: [50, 'El apellido no puede tener más de 50 caracteres']
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'employee', 'client'],
    default: 'client',
    required: true
  },
  permissions: [{
    type: String,
    enum: [
      'create_user', 'read_user', 'update_user', 'delete_user',
      'create_product', 'read_product', 'update_product', 'delete_product',
      'create_sale', 'read_sale', 'update_sale', 'delete_sale',
      'create_ticket', 'read_ticket', 'update_ticket', 'delete_ticket',
      'view_reports', 'export_data', 'manage_settings', 'view_logs', 'manage_roles'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profile: userProfileSchema,
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for initials
userSchema.virtual('initials').get(function() {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Method to get user permissions based on role
userSchema.methods.getRolePermissions = function() {
  const rolePermissions = {
    super_admin: [
      'create_user', 'read_user', 'update_user', 'delete_user',
      'create_product', 'read_product', 'update_product', 'delete_product',
      'create_sale', 'read_sale', 'update_sale', 'delete_sale',
      'create_ticket', 'read_ticket', 'update_ticket', 'delete_ticket',
      'view_reports', 'export_data', 'manage_settings', 'view_logs', 'manage_roles'
    ],
    admin: [
      'create_user', 'read_user', 'update_user',
      'create_product', 'read_product', 'update_product', 'delete_product',
      'create_sale', 'read_sale', 'update_sale', 'delete_sale',
      'create_ticket', 'read_ticket', 'update_ticket', 'delete_ticket',
      'view_reports', 'export_data', 'manage_settings', 'view_logs'
    ],
    employee: [
      'read_user', 'read_product', 'update_product',
      'create_sale', 'read_sale', 'update_sale',
      'create_ticket', 'read_ticket', 'update_ticket',
      'view_reports'
    ],
    client: [
      'read_product', 'create_sale', 'read_sale',
      'create_ticket', 'read_ticket'
    ]
  };
  
  return rolePermissions[this.role] || [];
};

// Static method to create user with default permissions
userSchema.statics.createWithRole = async function(userData) {
  const user = new this(userData);
  
  // Set default permissions based on role
  if (!user.permissions || user.permissions.length === 0) {
    user.permissions = user.getRolePermissions();
  }
  
  return user.save();
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

module.exports = mongoose.model('User', userSchema);