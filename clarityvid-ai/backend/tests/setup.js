const { sequelize } = require('../config/database');

// Test database setup
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.OPENAI_API_KEY = 'sk-test-key';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.STRIPE_SECRET_KEY = 'sk_test_key';

module.exports = { sequelize };
