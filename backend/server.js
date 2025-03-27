const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const rolePermissionRoutes = require('./routes/rolePermissionRoutes');
const productRoutes = require('./routes/productRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const searchRoutes = require('./routes/searchRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

// Request logger - Move before CORS
// This is temporary comment and should remove in production. 
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`, {
    body: req.body,
    headers: req.headers,
    path: req.path
  });
  next();
});

// Body parser - Move before CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use cookie-parser middleware
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'https://accounts.google.com',
      'https://oauth2.googleapis.com'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Requested-With',
    'X-HTTP-Method-Override',
    'Origin',
    'google-signin-client_id'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Base API path
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Swagger Documentation (accessible at /api/docs)
apiRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customSiteTitle: "RapidReach API Documentation"
}));

// Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', roleRoutes);
apiRouter.use('/permissions', permissionRoutes);
apiRouter.use('/role-permissions', rolePermissionRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/warehouses', warehouseRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
  // Connect to MongoDB after server starts
  connectDB();
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

module.exports = app;
