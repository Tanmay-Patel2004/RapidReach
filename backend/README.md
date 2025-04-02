# RapidReach Backend

This is the backend API for the RapidReach application, an e-commerce platform designed for efficient order processing and delivery management.

## Table of Contents

- [Installation](#installation)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables by creating a `.env` file with the following variables:

```
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Development

To start the development server:

```bash
npm run dev
```

## API Documentation

API documentation is available at `/api/docs` when the server is running. This provides a Swagger UI interface to explore and test the API endpoints.

## Testing

The project includes a comprehensive testing suite using Jest. The tests are organized by component type:

- **Models**: Tests for database schemas and model methods
- **Controllers**: Tests for request handling and business logic
- **Middleware**: Tests for authentication, permissions, and other middleware functions
- **Routes**: Integration tests for API endpoints

### Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- path/to/test-file.js
```

To run tests with coverage report:

```bash
npm test -- --coverage
```

### Test Structure

Tests are organized in the `__tests__` directory with a structure mirroring the main application:

```
__tests__/
├── controllers/       # Tests for controller functions
├── middleware/        # Tests for middleware functions
├── models/            # Tests for database models
├── routes/            # Tests for API routes
└── testUtils.js       # Utility functions for testing
```

### Test Utilities

The `testUtils.js` file provides common utilities for testing:

- Database connection management with MongoDB Memory Server
- Test user and role creation
- Token generation for authentication testing
- Environment setup with permissions and roles

## Project Structure

The backend follows a modular structure:

```
backend/
├── config/            # Configuration files
├── constants/         # Application constants
├── controllers/       # Business logic
├── Helper/            # Helper functions
├── middleware/        # Express middleware
├── models/            # MongoDB models
├── routes/            # API routes
├── utils/             # Utility functions
├── app.js             # Express application
└── server.js          # Server entry point
```
