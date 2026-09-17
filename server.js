require('dotenv').config();
const express = require('express');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Required for Socket.io
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit'); // 👇 ADDED: Rate Limiter
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express'); // Required for Swagger UI
const swaggerSpec = require('./config/swagger'); // Swagger Configuration
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const addressRoutes = require('./routes/addressRoutes');
const vendorStoreRoutes = require('./routes/vendorStoreRoutes');
const productRoutes = require('./routes/productRoutes');
const cartOrderRoutes = require('./routes/cartOrderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const supportRoutes = require('./routes/supportRoutes');
const couponRoutes = require('./routes/couponRoutes');
const searchRoutes = require('./routes/searchRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const bankDetailsRoutes = require('./routes/bankDetailsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Initialize Database
connectDB();

const app = express();

// ==========================================
// SOCKET.IO REAL-TIME SETUP
// ==========================================
// Wrap the Express app with Node's native HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make the 'io' instance accessible inside controllers via req.app.get('io')
app.set('io', io);

// Handle client connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Listen for the 'join' event from the frontend to put the user in a private room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
// ==========================================

// Global Middleware Configuration
app.use(helmet()); 

// ==========================================
// 🛡️ RATE LIMITING SETUP
// ==========================================
// 1. Global Limiter (Prevents DDOS across all APIs)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// 2. Auth Limiter (Strict limit for Login/Register to prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { 
    status: 'error', 
    message: 'Too many authentication attempts. Try again later.' 
  }
});

// Apply global rate limiter to all API routes
app.use('/api', globalLimiter);
// ==========================================

app.use(cors()); 
app.use(express.json()); 
app.use(morgan('dev')); 

// ==========================================
// SWAGGER API DOCUMENTATION ROUTE
// ==========================================
// Access the docs at http://localhost:5000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==========================================
// API Versioning & Health Endpoint
// ==========================================
/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check server health
 *     description: Returns the health status of the API server.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy and running.
 */
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount All API Routes
app.use('/api/v1/auth', authLimiter, authRoutes); // 👇 ADDED authLimiter here
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1', vendorStoreRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', cartOrderRoutes);
app.use('/api/v1', deliveryRoutes);
app.use('/api/v1', dispatchRoutes);
app.use('/api/v1', paymentRoutes);
app.use('/api/v1', settlementRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1', supportRoutes);
app.use('/api/v1', couponRoutes);
app.use('/api/v1', searchRoutes);
app.use('/api/v1', favoriteRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1', bankDetailsRoutes);
app.use('/api/v1/upload', uploadRoutes);

// 404 & Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

// IMPORTANT: Use server.listen() instead of app.listen() to support WebSockets
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});