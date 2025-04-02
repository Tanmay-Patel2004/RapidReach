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
const userActivityRoutes = require('./routes/userActivityRoutes'); // Import user activity routes
const driverRoutes = require('./routes/driverRoutes'); // Import driver routes
const corsOptions = require('./config/corsOptions');

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Use cookie-parser middleware
app.use(cookieParser());

// CORS configuration
// Already imported at the top of the file

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
apiRouter.use('/user-activity', userActivityRoutes); // Register user activity routes
apiRouter.use('/drivers', driverRoutes); // Register driver routes

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
