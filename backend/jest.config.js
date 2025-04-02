module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    coveragePathIgnorePatterns: [
        '/node_modules/'
    ],
    preset: '@shelf/jest-mongodb',
    setupFilesAfterEnv: ['./jest.setup.js'],
} 