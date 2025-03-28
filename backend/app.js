const express = require('express');
const cors = require('cors');
// ... other imports

const app = express();

// Middleware order is important!
// 1. CORS configuration with more specific options
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend Vite default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// ... other routes 

module.exports = app; 