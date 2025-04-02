// Set up environment variables for testing
jest.setTimeout(30000); // Increase timeout for tests

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.PORT = 5000; 