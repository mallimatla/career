const { User, Subscription } = require('../../src/models');
const bcrypt = require('bcryptjs');

describe('Auth Service', () => {
  describe('User Registration', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const user = await User.create(userData);

      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, user.password)).toBe(true);
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should create a free subscription for new users', async () => {
      const user = await User.create({
        email: 'newsub@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      const subscription = await Subscription.create({
        userId: user.id,
        plan: 'free',
        billingCycle: 'monthly',
        credits: 1,
        monthlyCredits: 1,
        price: 0,
        features: {},
      });

      expect(subscription.plan).toBe('free');
      expect(subscription.credits).toBe(1);
    });
  });

  describe('Password Validation', () => {
    it('should correctly validate password', async () => {
      const user = await User.create({
        email: 'passtest@example.com',
        password: 'correctpassword',
        firstName: 'Test',
        lastName: 'User',
      });

      const isValid = await user.comparePassword('correctpassword');
      const isInvalid = await user.comparePassword('wrongpassword');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('User toJSON', () => {
    it('should not expose sensitive fields', async () => {
      const user = await User.create({
        email: 'json@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      const json = user.toJSON();

      expect(json.password).toBeUndefined();
      expect(json.verificationToken).toBeUndefined();
      expect(json.resetPasswordToken).toBeUndefined();
    });
  });
});
