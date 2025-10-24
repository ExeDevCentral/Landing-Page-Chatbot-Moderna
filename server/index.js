'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { globalErrorHandler, handleNotFound } = require('./utils/errorHandler');

const app = express();

// Register global mongoose plugins
mongoose.plugin(mongoosePaginate);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];
    
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(process.env.FRONTEND_URL || 'https://yourdomain.com');
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('short'));
}

// Error handling middleware for CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed'
    });
  }
  next(err);
});

// Database connection with comprehensive error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log('✅ MongoDB Connected Successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Retry connection after delay
    setTimeout(() => {
      console.log('🔄 Retrying database connection...');
      connectDB();
    }, 5000);
  }
};

// Initialize database connection
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  };
  
  try {
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = 'Error';
    res.status(503).json(healthCheck);
  }
});

// API Routes with error handling
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api', require('./routes/hierarchicalData'));
app.use('/api/upload', require('./routes/upload'));

// Chat endpoint with OpenAI integration
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Message is required and must be a non-empty string'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Message too long',
        message: 'Message must be less than 1000 characters'
      });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to predefined responses
      const predefinedResponses = {
        'hola': '¡Hola! ¿En qué puedo ayudarte hoy?',
        'precio': 'Nuestros planes están diseñados para adaptarse a diferentes necesidades. ¿Te gustaría que te envíe información detallada sobre nuestros precios?',
        'demo': '¡Por supuesto! Puedes probar nuestro chatbot ahora mismo. También ofrecemos demos personalizados para empresas.',
        'contacto': 'Puedes contactarnos a través del formulario en nuestra página o enviarnos un email a info@aiassistant.com',
        'n8n': 'Nuestra plataforma está preparada para integrarse con n8n, permitiendo automatizar workflows complejos y optimizar procesos empresariales.'
      };

      const lowerMessage = message.toLowerCase();
      let response = 'Gracias por tu mensaje. Nuestro equipo revisará tu consulta y te responderá pronto. ¿Hay algo más en lo que pueda ayudarte?';

      for (const [key, value] of Object.entries(predefinedResponses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }

      return res.json({ response });
    }

    // OpenAI integration (if API key is available)
    const { OpenAI } = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente de IA útil y amigable. Responde en español de manera profesional y concisa."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

    res.json({ response });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'El servicio de chat no está disponible temporalmente. Por favor, inténtalo más tarde.'
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key inválida o expirada'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Has excedido el límite de mensajes. Por favor, espera un momento antes de enviar otro mensaje.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Ocurrió un error interno. Por favor, inténtalo de nuevo.'
    });
  }
});

// Serve static assets
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

// 404 handler for API routes (must be after all other routes)
app.use('/api/*', handleNotFound);

// Global error handler (must be the last middleware)
app.use(globalErrorHandler);

// Start server with error handling
const port = process.env.PORT || 5002;
const server = app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('🔒 Process terminated');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
