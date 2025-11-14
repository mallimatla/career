# Environment Variables Setup for Firebase Functions

## Required Environment Variables

The following environment variables must be configured for full functionality:

### Critical Services

1. **ANTHROPIC_API_KEY** (Required for script generation)
   - Get your API key from: https://console.anthropic.com/
   - This is used to generate video scripts using Claude AI
   - Without this key, video creation will work but script generation will fail

### Setup Methods

#### Method 1: Using .env file (Local Development)
1. Copy `.env.example` to `.env`
2. Fill in your actual API keys
3. The `.env` file is loaded automatically by the application

#### Method 2: Firebase Functions Config (Production)
For production deployment, set environment variables using Firebase CLI:

```bash
# Set Anthropic API Key
firebase functions:config:set anthropic.api_key="sk-ant-your_key_here" --project exodus-48741

# Verify the configuration
firebase functions:config:get --project exodus-48741
```

After setting environment variables, you need to redeploy:
```bash
firebase deploy --only functions --project exodus-48741
```

#### Method 3: Using .env in Functions Directory (Current Setup)
Currently, the `.env` file in the `backend` directory is deployed with the functions. Make sure to:

1. Never commit actual API keys to git
2. Keep `.env` in `.gitignore`
3. Set up CI/CD secrets if using GitHub Actions

## Environment Variables Status

| Variable | Status | Feature Impact |
|----------|--------|----------------|
| ANTHROPIC_API_KEY | ⚠️ Not configured | Script generation fails with 503 error |
| RAZORPAY_KEY_ID | ⚠️ Optional | Payment processing |
| RAZORPAY_KEY_SECRET | ⚠️ Optional | Payment processing |

## Current Configuration

To check if ANTHROPIC_API_KEY is set, the application will log warnings on startup:
- ✅ "ANTHROPIC_API_KEY configured" - Script generation will work
- ⚠️ "WARNING: ANTHROPIC_API_KEY environment variable is not set" - Script generation will fail

## Testing Configuration

After setting environment variables, test script generation:
1. Create a new video with text input
2. Click "Generate Script"
3. If you see "Script generation service is not configured" error, the API key is not set correctly

## Next Steps

**To enable script generation:**
1. Get an Anthropic API key from https://console.anthropic.com/
2. Set it using one of the methods above
3. Redeploy if using Firebase Functions Config
4. Test by creating a video and generating a script
