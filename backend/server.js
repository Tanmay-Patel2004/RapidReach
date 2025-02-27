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
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Base API path
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Swagger Documentation (accessible at /api/docs)
apiRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customSiteTitle: "RapidReach API Documentation"
}));

// Request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`, {
    body: req.body,
    headers: req.headers,
    path: req.path
  });
  next();
});

// Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', roleRoutes);
apiRouter.use('/permissions', permissionRoutes);
apiRouter.use('/role-permissions', rolePermissionRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/warehouses', warehouseRoutes);
apiRouter.use('/search', searchRoutes);

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
