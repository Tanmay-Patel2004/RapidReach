const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// ... other imports

const app = express();

// Add this debug middleware to check if cookie-parser is working
app.use((req, res, next) => {
  console.log('Incoming request cookies:', req.cookies);
  console.log('Raw Cookie Header:', req.headers.cookie);
  next();
});

// Middleware order is important!
// 1. Cookie Parser
app.use(cookieParser());

// 2. CORS configuration with more specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// 3. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// ... other routes 