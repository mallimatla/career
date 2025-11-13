const request = require('supertest');
const app = require('../../src/server');
const { User, Subscription, Presentation, Document, Website } = require('../../src/models');

describe('Content Generation API Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create a test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'content-test@example.com',
        password: 'TestPassword123',
        firstName: 'Content',
        lastName: 'Test',
      });

    token = response.body.token;
    userId = response.body.user.id;

    // Give user enough credits
    await Subscription.update(
      { credits: 100 },
      { where: { userId } }
    );
  });

  describe('Templates', () => {
    it('should get all presentation templates', async () => {
      const response = await request(app)
        .get('/api/templates/presentations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.templates).toBeDefined();
      expect(Object.keys(response.body.templates).length).toBeGreaterThan(0);
    });

    it('should get all document templates', async () => {
      const response = await request(app)
        .get('/api/templates/documents')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.templates).toBeDefined();
    });

    it('should get all website templates', async () => {
      const response = await request(app)
        .get('/api/templates/websites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.templates).toBeDefined();
    });
  });

  describe('Presentations', () => {
    it('should create a presentation draft', async () => {
      const response = await request(app)
        .post('/api/presentations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Presentation',
          content: 'This is test content for a presentation about AI technology.',
          templateId: 'modern-business',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.presentation).toBeDefined();
      expect(response.body.presentation.title).toBe('Test Presentation');
      expect(response.body.presentation.status).toBe('draft');
    });

    it('should get user presentations', async () => {
      const response = await request(app)
        .get('/api/presentations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.presentations)).toBe(true);
    });
  });

  describe('Documents', () => {
    it('should create a document draft', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Document',
          content: 'This is test content for a professional business document.',
          documentType: 'report',
          templateId: 'professional-doc',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.document).toBeDefined();
      expect(response.body.document.title).toBe('Test Document');
    });

    it('should get user documents', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.documents)).toBe(true);
    });
  });

  describe('Websites', () => {
    it('should create a website draft', async () => {
      const response = await request(app)
        .post('/api/websites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Website',
          content: 'This is content for a modern business website.',
          websiteType: 'landing',
          templateId: 'modern-landing',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.website).toBeDefined();
      expect(response.body.website.title).toBe('Test Website');
    });

    it('should get user websites', async () => {
      const response = await request(app)
        .get('/api/websites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.websites)).toBe(true);
    });
  });

  describe('Credit Checking', () => {
    it('should fail creation without sufficient credits', async () => {
      // Set credits to 0
      await Subscription.update(
        { credits: 0, creditsUsed: 100 },
        { where: { userId } }
      );

      const response = await request(app)
        .post('/api/presentations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test',
          content: 'Test content',
          templateId: 'modern-business',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient credits');
    });
  });
});
