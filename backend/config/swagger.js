const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'RapidReach API Documentation',
            version: '1.0.0',
            description: 'API documentation for RapidReach application',
            contact: {
                name: 'API Support',
                email: 'support@rapidreach.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['email', 'firstName', 'lastName', 'password'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'User full name'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'User password (min 6 characters)'
                        },
                        firstName: {
                            type: 'string',
                            description: 'User first name'
                        },
                        lastName: {
                            type: 'string',
                            description: 'User last name'
                        },
                        role_id: {
                            type: 'string',
                            description: 'User role ID'
                        },
                        dateOfBirth: {
                            type: 'string',
                            format: 'date',
                            description: 'User date of birth'
                        },
                        phoneNumber: {
                            type: 'string',
                            description: 'User phone number'
                        },
                        address: {
                            type: 'object',
                            properties: {
                                street: { type: 'string' },
                                unitNumber: { type: 'string' },
                                province: { type: 'string' },
                                country: { type: 'string' },
                                zipCode: { type: 'string' }
                            }
                        }
                    }
                },
                Product: {
                    type: 'object',
                    required: ['name', 'description', 'price', 'category', 'sku', 'stockQuantity', 'unit', 'warehouseCode'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Product name'
                        },
                        description: {
                            type: 'string',
                            description: 'Product description'
                        },
                        price: {
                            type: 'number',
                            description: 'Product price'
                        },
                        category: {
                            type: 'string',
                            description: 'Product category'
                        },
                        sku: {
                            type: 'string',
                            description: 'Stock Keeping Unit'
                        },
                        stockQuantity: {
                            type: 'integer',
                            description: 'Available stock quantity'
                        },
                        unit: {
                            type: 'string',
                            description: 'Unit of measurement'
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'discontinued'],
                            default: 'active'
                        },
                        warehouseCode: {
                            type: 'string',
                            description: 'Warehouse code'
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Array of image URLs'
                        },
                        video: {
                            type: 'string',
                            description: 'Video URL'
                        }
                    }
                },
                Role: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Role name'
                        },
                        description: {
                            type: 'string',
                            description: 'Role description'
                        }
                    }
                },
                Permission: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Permission name'
                        },
                        description: {
                            type: 'string',
                            description: 'Permission description'
                        }
                    }
                },
                Warehouse: {
                    type: 'object',
                    properties: {
                        warehouseCode: {
                            type: 'string',
                            description: 'Unique warehouse code'
                        },
                        name: {
                            type: 'string',
                            description: 'Warehouse name'
                        },
                        location: {
                            type: 'string',
                            description: 'Warehouse location'
                        },
                        capacity: {
                            type: 'number',
                            description: 'Warehouse capacity'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string'
                        },
                        stack: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }],
        tags: [
            {
                name: 'Authentication',
                description: 'Authentication endpoints'
            },
            {
                name: 'Users',
                description: 'User management endpoints'
            },
            {
                name: 'Products',
                description: 'Product management endpoints'
            },
            {
                name: 'Warehouses',
                description: 'Warehouse management endpoints'
            },
            {
                name: 'Roles',
                description: 'Role management endpoints'
            },
            {
                name: 'Permissions',
                description: 'Permission management endpoints'
            },
            {
                name: 'Search',
                description: 'Search functionality endpoints'
            }
        ]
    },
    apis: [
        './routes/*.js',
        './controllers/*.js',
        './models/*.js'
    ]
};

const specs = swaggerJsdoc(options);
module.exports = specs; 