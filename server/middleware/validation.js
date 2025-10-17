'use strict';

// Validation middleware for robust input validation
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
                convert: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));

                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Invalid input data',
                    details: errors
                });
            }

            req.body = value;
            next();
        } catch (err) {
            console.error('Validation middleware error:', err);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Error validating request data'
            });
        }
    };
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
    try {
        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) {
                return obj;
            }

            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }

            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    // Remove potentially dangerous characters
                    sanitized[key] = value
                        .trim()
                        .replace(/[<>]/g, '') // Remove < and >
                        .replace(/javascript:/gi, '') // Remove javascript: protocol
                        .replace(/on\w+=/gi, ''); // Remove event handlers
                } else {
                    sanitized[key] = sanitizeObject(value);
                }
            }
            return sanitized;
        };

        req.body = sanitizeObject(req.body);
        req.query = sanitizeObject(req.query);
        req.params = sanitizeObject(req.params);

        next();
    } catch (err) {
        console.error('Sanitization middleware error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error sanitizing input data'
        });
    }
};

// Rate limiting middleware for specific endpoints
const createRateLimit = (windowMs, max, message) => {
    const requests = new Map();

    return (req, res, next) => {
        try {
            const key = req.ip || req.connection.remoteAddress;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Clean old entries
            for (const [ip, timestamps] of requests.entries()) {
                const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
                if (validTimestamps.length === 0) {
                    requests.delete(ip);
                } else {
                    requests.set(ip, validTimestamps);
                }
            }

            // Check current IP
            const ipRequests = requests.get(key) || [];
            if (ipRequests.length >= max) {
                return res.status(429).json({
                    error: 'Rate Limit Exceeded',
                    message: message || 'Too many requests from this IP',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Add current request
            ipRequests.push(now);
            requests.set(key, ipRequests);

            next();
        } catch (err) {
            console.error('Rate limiting middleware error:', err);
            next(); // Continue on error to avoid blocking requests
        }
    };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    try {
        const start = Date.now();
        const timestamp = new Date().toISOString();
        
        // Log request
        console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent') || 'Unknown'}`);

        // Log response when finished
        res.on('finish', () => {
            const duration = Date.now() - start;
            const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
            const resetColor = '\x1b[0m';
            
            console.log(`${timestamp} - ${req.method} ${req.path} - ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`);
        });

        next();
    } catch (err) {
        console.error('Request logging middleware error:', err);
        next(); // Continue on error
    }
};

// Error boundary middleware
const errorBoundary = (err, req, res, next) => {
    try {
        console.error('Unhandled error:', err);

        // Don't leak error details in production
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        const errorResponse = {
            error: 'Internal Server Error',
            message: 'Something went wrong',
            timestamp: new Date().toISOString(),
            ...(isDevelopment && { stack: err.stack })
        };

        res.status(err.status || 500).json(errorResponse);
    } catch (boundaryError) {
        console.error('Error in error boundary:', boundaryError);
        res.status(500).json({
            error: 'Critical Error',
            message: 'Unable to process error'
        });
    }
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    try {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Enable XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Strict Transport Security (only in production with HTTPS)
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        
        // Content Security Policy
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
        
        // Referrer Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        next();
    } catch (err) {
        console.error('Security headers middleware error:', err);
        next(); // Continue on error
    }
};

// Database connection middleware
const checkDatabaseConnection = (req, res, next) => {
    try {
        const mongoose = require('mongoose');
        
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'Database connection is not available',
                timestamp: new Date().toISOString()
            });
        }
        
        next();
    } catch (err) {
        console.error('Database connection check error:', err);
        res.status(503).json({
            error: 'Service Unavailable',
            message: 'Unable to verify database connection'
        });
    }
};

// Request timeout middleware
const requestTimeout = (timeoutMs = 30000) => {
    return (req, res, next) => {
        try {
            const timeout = setTimeout(() => {
                if (!res.headersSent) {
                    res.status(408).json({
                        error: 'Request Timeout',
                        message: 'Request took too long to process',
                        timeout: timeoutMs
                    });
                }
            }, timeoutMs);

            // Clear timeout when response is sent
            res.on('finish', () => clearTimeout(timeout));
            res.on('close', () => clearTimeout(timeout));

            next();
        } catch (err) {
            console.error('Request timeout middleware error:', err);
            next(); // Continue on error
        }
    };
};

// CORS error handler
const corsErrorHandler = (err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS Error',
            message: 'Origin not allowed',
            origin: req.get('Origin') || 'Unknown'
        });
    }
    next(err);
};

module.exports = {
    validateRequest,
    sanitizeInput,
    createRateLimit,
    requestLogger,
    errorBoundary,
    securityHeaders,
    checkDatabaseConnection,
    requestTimeout,
    corsErrorHandler
};

