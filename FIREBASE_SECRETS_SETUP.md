# Firebase Secrets Setup Guide

This guide explains how to configure the ANTHROPIC_API_KEY secret for Firebase Functions.

## Problem

The 503 error when generating scripts occurs because the ANTHROPIC_API_KEY is not available in the Firebase Functions runtime environment. Environment variables from `.env` files are NOT automatically deployed to Firebase Functions.

## Solution

Firebase Functions requires secrets to be configured using Firebase Secrets Manager.

## Automatic Setup (via GitHub Actions)

The deployment workflow automatically sets up the secret when you push to the repository. The secret is configured in the `🔐 Configure Firebase Secrets` step of the GitHub Actions workflow.

**Requirements:**
- Ensure `ANTHROPIC_API_KEY` is set in your GitHub repository secrets
- The workflow will automatically configure it in Firebase Functions during deployment

## Manual Setup (if needed)

If you need to set up the secret manually or update it:

### Option 1: Using Firebase CLI

```bash
# Navigate to your project directory
cd clarityvid-ai

# Set the secret (you'll be prompted to enter the value)
firebase functions:secrets:set ANTHROPIC_API_KEY --project exodus-48741

# Or set from a file
echo "your-anthropic-api-key-here" | firebase functions:secrets:set ANTHROPIC_API_KEY --project exodus-48741 --data-file=-
```

### Option 2: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (exodus-48741)
3. Navigate to **Secret Manager**
4. Click **Create Secret**
5. Name: `ANTHROPIC_API_KEY`
6. Value: Your Anthropic API key
7. Click **Create Secret**
8. Grant access to the Firebase Functions service account

### Option 3: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Functions** → **Configuration**
4. Click **Add Secret**
5. Name: `ANTHROPIC_API_KEY`
6. Value: Your Anthropic API key
7. Save

## Verify Secret Configuration

After setting up the secret, verify it's properly configured:

```bash
# List all secrets
firebase functions:secrets:list --project exodus-48741

# Check if ANTHROPIC_API_KEY is listed
```

## How It Works

1. **Backend Code**: The `backend/index.js` file defines the secret in the function configuration:
   ```javascript
   exports.api = functions
     .runWith({
       secrets: ['ANTHROPIC_API_KEY'],
       timeoutSeconds: 540,
       memory: '512MB',
     })
     .https.onRequest(app);
   ```

2. **Service Code**: The `backend/src/services/claudeService.js` accesses it via environment variable:
   ```javascript
   const apiKey = process.env.ANTHROPIC_API_KEY;
   ```

3. **Runtime**: When the function runs, Firebase automatically injects the secret as an environment variable.

## Deployment

After configuring the secret, deploy your functions:

```bash
cd clarityvid-ai
firebase deploy --only functions --project exodus-48741
```

Or push to your repository to trigger the GitHub Actions deployment.

## Troubleshooting

### Still getting 503 errors?

1. **Check if the secret is set:**
   ```bash
   firebase functions:secrets:list --project exodus-48741
   ```

2. **Check Firebase Functions logs:**
   ```bash
   firebase functions:log --project exodus-48741
   ```
   Look for warnings about ANTHROPIC_API_KEY not being set.

3. **Verify the secret value:**
   - Make sure the API key is valid
   - Test it locally with a simple curl request to Anthropic's API

4. **Redeploy the functions:**
   ```bash
   firebase deploy --only functions --project exodus-48741 --force
   ```

### Local Development

For local development, use a `.env` file in the `backend` directory:

```env
ANTHROPIC_API_KEY=your-key-here
```

The code automatically falls back to the `.env` file when running locally.

## Security Notes

- Never commit your API key to Git
- Use GitHub Secrets for CI/CD
- Use Firebase Secrets Manager for production
- Rotate your API keys regularly
- Monitor API usage for unusual activity

## Additional Resources

- [Firebase Secrets Manager Documentation](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Firebase Functions Environment Configuration](https://firebase.google.com/docs/functions/config-env)
