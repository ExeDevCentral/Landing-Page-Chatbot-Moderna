'use strict';

// Error handling utilities
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error types
const ErrorTypes = {
    VALIDATION_ERROR: 'ValidationError',
    CAST_ERROR: 'CastError',
    DUPLICATE_KEY_ERROR: 'DuplicateKeyError',
    JWT_ERROR: 'JsonWebTokenError',
    JWT_EXPIRED_ERROR: 'TokenExpiredError',
    MONGO_NETWORK_ERROR: 'MongoNetworkError',
    MONGO_TIMEOUT_ERROR: 'MongoTimeoutError',
    MONGO_SERVER_ERROR: 'MongoServerError'
};

// Error messages in Spanish
const ErrorMessages = {
    VALIDATION_ERROR: 'Datos de entrada inválidos',
    CAST_ERROR: 'Formato de ID inválido',
    DUPLICATE_KEY_ERROR: 'El recurso ya existe',
    JWT_ERROR: 'Token inválido',
    JWT_EXPIRED_ERROR: 'Token expirado',
    MONGO_NETWORK_ERROR: 'Error de conexión a la base de datos',
    MONGO_TIMEOUT_ERROR: 'Timeout de conexión a la base de datos',
    MONGO_SERVER_ERROR: 'Error del servidor de base de datos',
    INTERNAL_SERVER_ERROR: 'Error interno del servidor',
    NOT_FOUND: 'Recurso no encontrado',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso prohibido',
    BAD_REQUEST: 'Solicitud inválida',
    CONFLICT: 'Conflicto de recursos',
    TOO_MANY_REQUESTS: 'Demasiadas solicitudes',
    SERVICE_UNAVAILABLE: 'Servicio no disponible'
};

// Error handler factory
const createErrorHandler = (errorType, statusCode, customMessage = null) => {
    return (err, req, res, next) => {
        if (err.name === errorType || err.code === errorType) {
            const message = customMessage || ErrorMessages[errorType] || err.message;
            return res.status(statusCode).json({
                error: errorType,
                message: message,
                timestamp: new Date().toISOString(),
                ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
            });
        }
        next(err);
    };
};

// MongoDB error handlers
const handleMongoError = (err) => {
    let error = err;
    
    if (err.name === ErrorTypes.CAST_ERROR) {
        error = new AppError(ErrorMessages.CAST_ERROR, 400);
    } else if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new AppError(`${field} ya existe`, 409);
    } else if (err.name === ErrorTypes.VALIDATION_ERROR) {
        const errors = Object.values(err.errors).map(e => e.message);
        error = new AppError(`Datos inválidos: ${errors.join(', ')}`, 400);
    } else if (err.name === ErrorTypes.MONGO_NETWORK_ERROR || 
               err.name === ErrorTypes.MONGO_TIMEOUT_ERROR) {
        error = new AppError(ErrorMessages.MONGO_NETWORK_ERROR, 503);
    }
    
    return error;
};

// JWT error handlers
const handleJWTError = (err) => {
    if (err.name === ErrorTypes.JWT_ERROR) {
        return new AppError(ErrorMessages.JWT_ERROR, 401);
    } else if (err.name === ErrorTypes.JWT_EXPIRED_ERROR) {
        return new AppError(ErrorMessages.JWT_EXPIRED_ERROR, 401);
    }
    return err;
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Error response formatter
const formatErrorResponse = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (err.name === ErrorTypes.CAST_ERROR) {
        error = handleMongoError(err);
    } else if (err.name === ErrorTypes.JWT_ERROR || err.name === ErrorTypes.JWT_EXPIRED_ERROR) {
        error = handleJWTError(err);
    } else if (err.name === ErrorTypes.VALIDATION_ERROR || err.code === 11000) {
        error = handleMongoError(err);
    }

    // Send error response
    res.status(error.statusCode || 500).json({
        error: error.name || 'Internal Server Error',
        message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { 
            stack: error.stack,
            details: error
        })
    });
};

// Validation error formatter
const formatValidationError = (errors) => {
    return errors.map(error => ({
        field: error.path.join('.'),
        message: error.message,
        value: error.value
    }));
};

// Database connection error handler
const handleDatabaseError = (err) => {
    console.error('Database error:', err);
    
    if (err.name === ErrorTypes.MONGO_NETWORK_ERROR) {
        return new AppError('No se puede conectar a la base de datos', 503);
    } else if (err.name === ErrorTypes.MONGO_TIMEOUT_ERROR) {
        return new AppError('Timeout de conexión a la base de datos', 503);
    } else if (err.name === ErrorTypes.MONGO_SERVER_ERROR) {
        return new AppError('Error del servidor de base de datos', 503);
    }
    
    return new AppError('Error de base de datos', 500);
};

// Rate limit error handler
const handleRateLimitError = (req, res, next) => {
    res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Has excedido el límite de solicitudes. Por favor, espera un momento.',
        retryAfter: 15 * 60, // 15 minutes
        timestamp: new Date().toISOString()
    });
};

// 404 handler
const handleNotFound = (req, res, next) => {
    const error = new AppError(`Ruta ${req.originalUrl} no encontrada`, 404);
    next(error);
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        sendErrorProd(err, res);
    }
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            timestamp: new Date().toISOString()
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        
        res.status(500).json({
            status: 'error',
            message: 'Algo salió mal',
            timestamp: new Date().toISOString()
        });
    }
};

// Error logging utility
const logError = (error, context = {}) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        name: error.name,
        statusCode: error.statusCode,
        context: context
    };
    
    console.error('Error Log:', JSON.stringify(errorLog, null, 2));
    
    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
        // Example: Send to external logging service
        // loggingService.log(errorLog);
    }
};

// Retry utility for failed operations
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
};

module.exports = {
    AppError,
    ErrorTypes,
    ErrorMessages,
    createErrorHandler,
    handleMongoError,
    handleJWTError,
    asyncHandler,
    formatErrorResponse,
    formatValidationError,
    handleDatabaseError,
    handleRateLimitError,
    handleNotFound,
    globalErrorHandler,
    logError,
    retryOperation
};

