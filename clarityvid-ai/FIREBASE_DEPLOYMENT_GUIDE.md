# ClarityVid AI - Firebase Deployment Guide

## 🚀 Complete Guide to Deploy ClarityVid AI on Firebase

This guide will help you deploy the complete ClarityVid AI platform (backend + frontend) to Firebase with Firestore, Firebase Storage, and Firebase Functions.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or later) installed
2. **npm** (v9 or later) installed
3. **Firebase account** (free or paid plan)
4. **Razorpay account** with API keys
5. **Anthropic API key** (Claude API)
6. **Google Cloud account** (for TTS - optional)

---

## 🔧 Step 1: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

---

## 🏗️ Step 2: Create Firebase Project

### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `clarityvid-ai` (or your preferred name)
4. Disable Google Analytics (optional for now)
5. Click **"Create project"**

### Option B: Using Firebase CLI

```bash
firebase projects:create clarityvid-ai
```

---

## 🔥 Step 3: Initialize Firebase in Project

```bash
cd /path/to/clarityvid-ai

# Initialize Firebase
firebase init

# Select the following features (use spacebar to select):
# ✅ Firestore
# ✅ Functions
# ✅ Hosting
# ✅ Storage

# Follow the prompts:
# - Select: Use an existing project
# - Choose: clarityvid-ai (your project)
# - Firestore rules: firestore.rules (default)
# - Firestore indexes: firestore.indexes.json (default)
# - Functions language: JavaScript
# - ESLint: No (optional)
# - Install dependencies: Yes
# - Public directory: frontend/build
# - Single-page app: Yes
# - GitHub deploys: No (optional)
# - Storage rules: storage.rules
```

---

## ⚙️ Step 4: Configure Firebase Project Settings

### 4.1 Update .firebaserc

Open `.firebaserc` and update with your project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 4.2 Enable Required Firebase Services

#### Enable Firestore Database

1. Go to Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we have security rules)
4. Choose your preferred location (e.g., `us-central1`)
5. Click **"Enable"**

#### Enable Firebase Storage

1. Go to Firebase Console → **Storage**
2. Click **"Get started"**
3. Use default security rules (we'll update them)
4. Choose same location as Firestore
5. Click **"Done"**

#### Enable Firebase Authentication (Optional but Recommended)

1. Go to Firebase Console → **Authentication**
2. Click **"Get started"**
3. Enable **"Email/Password"** provider
4. Click **"Save"**

---

## 🔑 Step 5: Get Firebase Service Account Credentials

1. Go to Firebase Console → **Project Settings** (gear icon)
2. Go to **Service accounts** tab
3. Click **"Generate new private key"**
4. Save the JSON file securely
5. Extract these values:
   - `project_id`
   - `private_key`
   - `client_email`

---

## 📝 Step 6: Configure Environment Variables

### 6.1 Create .env file in backend folder

```bash
cd backend
cp .env.example .env
```

### 6.2 Update .env with your credentials

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
API_URL=https://your-project-id.web.app
FRONTEND_URL=https://your-project-id.web.app

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# Redis Configuration (if using external Redis)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Anthropic Claude Configuration
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Google TTS (optional)
GOOGLE_TTS_API_KEY=your_google_tts_api_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@clarityvid.ai

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_API_ACCESS=true
ENABLE_TEAM_FEATURES=true
ENABLE_WEBHOOKS=true

# Logging
LOG_LEVEL=info
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- For `FIREBASE_PRIVATE_KEY`, keep the newline characters (`\n`)
- Never commit `.env` file to version control

---

## 📦 Step 7: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🏗️ Step 8: Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/build/` folder.

---

## 🚀 Step 9: Deploy to Firebase

### Deploy Everything

```bash
# From project root
firebase deploy
```

### Or Deploy Individually

```bash
# Deploy only Firestore rules
firebase deploy --only firestore

# Deploy only Storage rules
firebase deploy --only storage

# Deploy only Functions (backend API)
firebase deploy --only functions

# Deploy only Hosting (frontend)
firebase deploy --only hosting
```

---

## 🔒 Step 10: Configure Security Rules

Your Firestore and Storage security rules are already created. After deployment, verify them:

### Verify Firestore Rules

1. Go to Firebase Console → **Firestore Database** → **Rules**
2. Ensure rules from `firestore.rules` are applied
3. Click **"Publish"** if needed

### Verify Storage Rules

1. Go to Firebase Console → **Storage** → **Rules**
2. Ensure rules from `storage.rules` are applied
3. Click **"Publish"** if needed

---

## 🔗 Step 11: Configure Razorpay Webhook

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **Webhooks**
3. Click **"Add New Webhook"**
4. Set URL: `https://your-project-id.web.app/api/subscriptions/webhook`
5. Select events:
   - `payment.captured`
   - `payment.failed`
   - `subscription.charged`
6. Set webhook secret (use same value as `RAZORPAY_WEBHOOK_SECRET` in .env)
7. Click **"Create Webhook"**

---

## ✅ Step 12: Test Your Deployment

### 12.1 Access Your Application

```
Frontend: https://your-project-id.web.app
API: https://your-project-id.web.app/api/health
```

### 12.2 Test Health Check

```bash
curl https://your-project-id.web.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T10:00:00.000Z",
  "service": "ClarityVid AI API",
  "version": "2.0.0"
}
```

### 12.3 Test User Registration

```bash
curl -X POST https://your-project-id.web.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 🔍 Step 13: Monitor Your Application

### View Function Logs

```bash
firebase functions:log
```

### View Real-time Logs

```bash
firebase functions:log --only api
```

### Firebase Console Monitoring

1. Go to Firebase Console → **Functions**
2. View function invocations, errors, and performance
3. Go to **Firestore** to view database operations
4. Go to **Storage** to view file uploads

---

## 🐛 Troubleshooting

### Issue: Functions deployment fails

**Solution:**
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# Try deploying again
firebase deploy --only functions
```

### Issue: "Insufficient permissions" error

**Solution:**
1. Check Firebase service account has correct permissions
2. Ensure Firestore and Storage are enabled
3. Verify security rules are not too restrictive

### Issue: Frontend not loading

**Solution:**
```bash
# Rebuild frontend
cd frontend
rm -rf build
npm run build

# Redeploy hosting
firebase deploy --only hosting
```

### Issue: API calls returning 404

**Solution:**
- Check `firebase.json` rewrites configuration
- Ensure Functions are deployed successfully
- Verify API URL in frontend `.env` file

### Issue: Payment webhook not working

**Solution:**
1. Verify webhook URL in Razorpay dashboard
2. Check webhook secret matches `.env` value
3. View function logs for webhook errors

---

## 📊 Step 14: Set Up Monitoring & Alerts

### Enable Firebase Performance Monitoring

1. Go to Firebase Console → **Performance**
2. Click **"Get started"**
3. Follow integration instructions

### Enable Firebase Crashlytics (for mobile apps)

1. Go to Firebase Console → **Crashlytics**
2. Click **"Get started"**

### Set Up Budget Alerts

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **Billing** → **Budgets & alerts**
4. Create budget alert for your desired limit

---

## 💰 Cost Optimization Tips

### Free Tier Limits (Spark Plan - Free)

- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5 GB storage, 1 GB downloads/day
- **Functions**: 125K invocations/month, 40K GB-seconds, 40K CPU-seconds
- **Hosting**: 10 GB storage, 360 MB/day transfer

### Optimize Costs

1. **Enable caching** for frequently accessed data
2. **Use Firestore queries efficiently** (add proper indexes)
3. **Implement pagination** for list endpoints
4. **Compress files** before uploading to Storage
5. **Set up lifecycle policies** for Storage (delete old temp files)
6. **Monitor usage** in Firebase Console regularly

### Upgrade to Blaze Plan (Pay-as-you-go)

When you exceed free tier limits:
1. Go to Firebase Console → **Usage and billing**
2. Click **"Modify plan"**
3. Select **"Blaze"** plan
4. Add payment method
5. Set billing alerts

---

## 🔐 Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env` to version control
- ✅ Use Firebase Environment Config for Functions:

```bash
firebase functions:config:set \
  razorpay.key_id="your_key_id" \
  razorpay.key_secret="your_secret" \
  anthropic.api_key="your_api_key"
```

### 2. Firestore Security

- ✅ Review and test security rules regularly
- ✅ Never use overly permissive rules in production
- ✅ Implement proper user authentication checks

### 3. Storage Security

- ✅ Validate file types and sizes
- ✅ Scan uploaded files for malware (consider Cloud Functions)
- ✅ Implement proper access controls

### 4. API Security

- ✅ Enable rate limiting (already configured)
- ✅ Use CORS properly (already configured)
- ✅ Implement request validation
- ✅ Monitor for suspicious activity

---

## 🚀 Advanced Configuration

### Custom Domain Setup

1. Go to Firebase Console → **Hosting**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `app.clarityvid.ai`)
4. Follow DNS verification steps
5. Wait for SSL certificate provisioning (automatic)

### CDN Configuration

Firebase Hosting includes global CDN automatically. No additional setup needed!

### Environment-Specific Deployments

Create multiple Firebase projects for different environments:

```bash
# Production
firebase use production
firebase deploy

# Staging
firebase use staging
firebase deploy
```

---

## 📚 Additional Resources

### Firebase Documentation
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)

### ClarityVid AI Documentation
- `README.md` - Platform overview
- `VERIFICATION_REPORT.md` - Testing results
- `PLATFORM_UPGRADE_V2.md` - V2.0 features

---

## 🎉 Deployment Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] Firebase services are enabled (Firestore, Storage, Functions, Hosting)
- [ ] Security rules are deployed and tested
- [ ] Frontend is built and deployed
- [ ] Backend functions are deployed
- [ ] Health check endpoint responds correctly
- [ ] User registration works
- [ ] Razorpay webhook is configured
- [ ] Email notifications are working (if configured)
- [ ] Monitoring and alerts are set up
- [ ] Budget alerts are configured
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] All tests pass locally
- [ ] Performance is acceptable

---

## 🆘 Support & Help

### Getting Help

1. **Firebase Support**: [Firebase Support](https://firebase.google.com/support)
2. **Community**: [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
3. **Status**: [Firebase Status Dashboard](https://status.firebase.google.com/)

### Common Commands Reference

```bash
# View logs
firebase functions:log

# Open Firebase console
firebase open

# List projects
firebase projects:list

# Switch project
firebase use <project-id>

# Deploy specific function
firebase deploy --only functions:api

# Test locally with emulators
firebase emulators:start

# Export Firestore data
firebase firestore:export gs://your-bucket/backups

# Import Firestore data
firebase firestore:import gs://your-bucket/backups
```

---

## 🎯 Next Steps After Deployment

1. **Set up monitoring dashboard** - Track usage, errors, performance
2. **Configure email templates** - Welcome emails, password resets
3. **Set up CI/CD** - Automate deployments with GitHub Actions
4. **Implement backup strategy** - Regular Firestore exports
5. **Performance testing** - Load test your API endpoints
6. **User acceptance testing** - Test with real users
7. **Marketing launch** - Promote your platform!

---

## 🔄 Continuous Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install

      - name: Build frontend
        run: cd frontend && npm run build

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

**Congratulations! 🎉 Your ClarityVid AI platform is now live on Firebase!**

For questions or issues, refer to the documentation or contact support.

---

**Deployed By**: ClarityVid AI Team
**Last Updated**: 2025-11-13
**Version**: 2.0.0
**Status**: ✅ **PRODUCTION READY**
