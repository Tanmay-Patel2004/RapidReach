# Unit Testing for RapidReach Backend

This document provides an overview of the unit testing setup and approach for the RapidReach backend.

## Table of Contents

- [Introduction](#introduction)
- [Testing Stack](#testing-stack)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)

## Introduction

Unit testing is a crucial aspect of software development that ensures individual components of the application work as expected. The RapidReach backend implements comprehensive unit tests to validate models, controllers, routes, and middleware functions.

Benefits of unit testing:

- Early bug detection
- Safer refactoring
- Documentation of code behaviour
- Improved code design
- Confidence in code reliability

## Testing Stack

The RapidReach backend uses the following testing technologies:

- **Jest**: A JavaScript testing framework with a focus on simplicity and support for large web applications
- **Supertest**: A library for testing HTTP servers
- **MongoDB Memory Server**: An in-memory implementation of MongoDB for testing
- **@shelf/jest-mongodb**: A preset configuration for Jest to work with MongoDB

## Test Structure

The tests are organized in the `__tests__` directory with the following structure:

```
__tests__/
├── controllers/       # Tests for controller functions
├── middleware/        # Tests for middleware functions
├── models/            # Tests for database models
├── routes/            # Tests for API routes
└── testUtils.js       # Utility functions for testing
```

Each test file corresponds to a specific component in the application with similar naming conventions.

## Running Tests

To run the tests, use the following command:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- __tests__/models/userModel.test.js
```

To run tests with coverage reports:

```bash
npm test -- --coverage
```

## Writing Tests

When writing tests for the RapidReach backend, follow these guidelines:

### Model Tests

Model tests validate the schema, validations, and methods of Mongoose models. Example:

```javascript
describe("User Model Test", () => {
  it("should create & save user successfully", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      dateOfBirth: new Date("1990-01-01"),
      role_id: new mongoose.Types.ObjectId(),
    };

    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
  });
});
```

### Controller Tests

Controller tests verify that controller functions process requests and return appropriate responses:

```javascript
describe("GET /api/users/:id", () => {
  it("should get a user by ID when authenticated", async () => {
    const res = await request(app)
      .get(`/api/users/${testUser._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id.toString()).toBe(testUser._id.toString());
  });
});
```

### Middleware Tests

Middleware tests check that middleware functions perform their expected behavior:

```javascript
it("should authenticate user with valid token", async () => {
  const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
  mockReq.headers.authorization = `Bearer ${token}`;

  await protect(mockReq, mockRes, mockNext);

  expect(mockReq.user).toBeDefined();
  expect(mockNext).toHaveBeenCalled();
});
```

## Best Practices

1. **Isolate tests**: Each test should run independently without relying on other tests
2. **Use descriptive names**: Test names should describe what they're testing and expected behaviour
3. **Clean up after tests**: Reset the test environment after each test
4. **Mock external services**: Use mocks for external services like AWS or email services
5. **Test edge cases**: Include tests for error cases and boundary conditions
6. **Keep tests fast**: Tests should execute quickly to maintain a productive workflow
7. **Use setup and teardown**: Utilize Jest's `beforeAll`, `afterAll`, `beforeEach`, and `afterEach` hooks
8. **Test one thing per test**: Each test should verify a single aspect of functionality

By following these practices and maintaining comprehensive test coverage, the RapidReach backend will remain robust and maintainable as it evolves.
