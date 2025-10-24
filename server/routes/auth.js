'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Validation helpers
const isNonEmptyString = (value) =>
  value && typeof value === 'string' && value.trim().length > 0;
const isWithinLength = (value, maxLength) =>
  value && value.length <= maxLength;
const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateName = (name) => {
  if (!isNonEmptyString(name))
    return 'Name is required and must be a non-empty string';
  if (!isWithinLength(name, 100))
    return 'Name must be less than 100 characters';
  return null;
};

const validateEmail = (email) => {
  if (!isNonEmptyString(email))
    return 'Email is required and must be a non-empty string';
  if (!isValidEmailFormat(email)) return 'Email must be a valid email address';
  if (!isWithinLength(email, 255))
    return 'Email must be less than 255 characters';
  return null;
};

const validatePassword = (password, isLogin) => {
  if (!password || typeof password !== 'string' || password.length === 0)
    return 'Password is required';
  if (!isLogin && password.length < 6)
    return 'Password must be at least 6 characters long';
  if (!isWithinLength(password, 128))
    return 'Password must be less than 128 characters';
  return null;
};

const validateUserData = (data, isLogin = false) => {
  const errors = [];
  const { name, email, password } = data;

  if (!isLogin) {
    const nameError = validateName(name);
    if (nameError) errors.push(nameError);
  }

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password, isLogin);
  if (passwordError) errors.push(passwordError);

  return errors;
};

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input data
    const validationErrors = validateUserData({ name, email, password });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationErrors
      });
    }
    
    // Sanitize input data
    const sanitizedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    };
    
    // Check for existing user
    const existingUser = await User.findOne({ email: sanitizedData.email });
    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'A user with this email already exists'
      });
    }
    
    // Find the default role
    const defaultRole = await Role.findOne({ name: 'waiter' });
    if (!defaultRole) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Default user role not found.'
      });
    }

    // Create new user
    const newUser = new User({
      ...sanitizedData,
      roles: [defaultRole._id]
    });
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password = hashedPassword;
    
    // Save user
    const savedUser = await newUser.save();
    
    // Generate JWT token
    const payload = {
      id: savedUser.id,
      email: savedUser.email,
      roles: savedUser.roles
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    // Log successful registration
    console.log(`✅ User registered: ${savedUser.email}`);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        roles: savedUser.roles,
        register_date: savedUser.register_date
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid user data',
        details: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Error',
        message: 'A user with this email already exists'
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid Data Type',
        message: 'One or more fields have invalid data types'
      });
    }
    
    // Database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'Database connection failed. Please try again later.'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user. Please try again.'
    });
  }
});

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input data
    const validationErrors = validateUserData({ email, password }, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationErrors
      });
    }
    
    // Sanitize input data
    const sanitizedEmail = email.trim().toLowerCase();
    
    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }
    
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    // Log successful login
    console.log(`✅ User logged in: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        register_date: user.register_date
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'Database connection failed. Please try again later.'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login. Please try again.'
    });
  }
});

// @route   GET api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No Token',
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Find user to ensure they still exist
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'User no longer exists'
      });
    }
    
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        register_date: user.register_date
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Token is not valid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Token has expired'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify token. Please try again.'
    });
  }
});

module.exports = router;
