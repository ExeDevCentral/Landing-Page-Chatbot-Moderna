'use strict';

const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');
const User = require('../models/User');

const Role = require('../models/Role');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const hasAuthorization = authHeader && authHeader.startsWith('Bearer');

    if (!hasAuthorization) {
      return next(new AppError('No token, authorization denied', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'permission'
        }
      });

    if (!user) {
      return next(
        new AppError('User belonging to this token does no longer exist.', 401)
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Token is not valid', 401));
  }
};

// Grant access based on permissions
exports.hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user.roles.flatMap(role => role.permissions.map(p => p.name));
    const isAuthorized = userPermissions.includes(requiredPermission);

    if (!isAuthorized) {
      return next(
        new AppError(
          `User is not authorized to access this route. Missing permission: ${requiredPermission}`,
          403
        )
      );
    }

    next();
  };
};
