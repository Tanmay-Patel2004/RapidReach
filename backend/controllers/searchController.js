const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// @desc    Search products with filters and pagination
// @route   GET /api/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
    const {
        q, // search query
        category,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Text search if query provided
    if (q) {
        query.$text = { $search: q };
    }

    // Category filter
    if (category) {
        query.category = category;
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Status filter (only show active products)
    query.status = 'active';

    try {
        // Calculate skip value for pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Build sort object
        const sortOptions = {};
        if (q) {
            // If there's a text search, sort by score
            sortOptions.score = { $meta: 'textScore' };
        }
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const products = await Product.find(query)
            .select(q ? { score: { $meta: 'textScore' } } : '')
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('warehouse', 'name location');

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        // Get all available categories
        const categories = await Product.distinct('category');

        // Get price range
        const priceRange = await Product.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                },
                filters: {
                    categories,
                    priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
                }
            }
        });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500);
        throw new Error('Error performing search');
    }
});

module.exports = {
    searchProducts
}; 