const express = require('express');
const router = express.Router();
const { searchProducts } = require('../controllers/searchController');

// Search routes
router.get('/', searchProducts);

module.exports = router; 