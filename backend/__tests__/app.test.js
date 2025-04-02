const request = require('supertest');
const app = require('../app');
const { dbConnect, dbDisconnect } = require('./testUtils');

describe('App Tests', () => {
    beforeAll(async () => {
        await dbConnect();
    });

    afterAll(async () => {
        await dbDisconnect();
    });

    it('should access the API base and return 200', async () => {
        const res = await request(app).get('/api');
        expect(res.statusCode).toBe(200);
    });
}); 