// backend/tests/jest.setup.js
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
jest.setTimeout(10000);
