const express = require('express');
const { login, register } = require('../controllers/authController');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Auth service is running' });
});

router.post('/login', login);
router.post('/register', register);

module.exports = router; 