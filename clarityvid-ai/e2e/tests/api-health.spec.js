const { test, expect } = require('@playwright/test');

test.describe('API Health Checks', () => {
  test('health endpoint should return 200', async ({ request }) => {
    const response = await request.get('https://exodus-48741.web.app/api/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('ClarityVid AI API');
  });

  test('videos endpoint should require authentication', async ({ request }) => {
    const response = await request.get('https://exodus-48741.web.app/api/videos');
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('should authenticate and fetch user data', async ({ request }) => {
    // Register a test user
    const testEmail = `apitest${Date.now()}@example.com`;
    const registerResponse = await request.post('https://exodus-48741.web.app/api/auth/register', {
      data: {
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'API',
        lastName: 'Test',
      },
    });

    expect(registerResponse.status()).toBe(201);
    const registerBody = await registerResponse.json();
    expect(registerBody.success).toBe(true);
    expect(registerBody.token).toBeTruthy();

    // Use token to fetch user data
    const token = registerBody.token;
    const meResponse = await request.get('https://exodus-48741.web.app/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    expect(meResponse.status()).toBe(200);
    const meBody = await meResponse.json();
    expect(meBody.success).toBe(true);
    expect(meBody.user.email).toBe(testEmail);
  });
});
