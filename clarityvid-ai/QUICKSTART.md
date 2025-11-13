# 🚀 ClarityVid AI - Quick Start Guide

Get your ClarityVid AI platform up and running in **15 minutes**!

---

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier works!)
- Razorpay account
- Anthropic API key (Claude)

---

## Quick Deploy (4 Steps)

### 1️⃣ Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2️⃣ Clone & Setup

```bash
cd clarityvid-ai

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 3️⃣ Configure Firebase

```bash
# Initialize Firebase (from project root)
firebase init

# Select:
# ✅ Firestore, Functions, Hosting, Storage
# Choose: Use existing project OR create new
# Defaults: Accept all defaults

# Update .firebaserc with your project ID
# Update backend/.env with your credentials
```

### 4️⃣ Deploy!

```bash
# Build frontend
cd frontend && npm run build

# Deploy everything
cd ..
firebase deploy
```

**Done! 🎉** Your app is live at `https://your-project-id.web.app`

---

## Environment Variables Setup

Copy `backend/.env.example` to `backend/.env` and fill in:

**Required**:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret

ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Get Firebase Credentials**:
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Extract `project_id`, `private_key`, `client_email`

---

## Local Development

```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start frontend dev server
cd frontend
npm start
```

Visit: `http://localhost:3000`

---

## Test Deployment

```bash
# Health check
curl https://your-project-id.web.app/api/health

# Should return:
# {"status":"ok","service":"ClarityVid AI API","version":"2.0.0"}
```

---

## Enable Firebase Services

In Firebase Console, enable:

1. **Firestore Database** → Create database (production mode)
2. **Firebase Storage** → Get started
3. **Authentication** → Email/Password provider (optional)

---

## Configure Razorpay Webhook

1. Razorpay Dashboard → Settings → Webhooks
2. Add: `https://your-project-id.web.app/api/subscriptions/webhook`
3. Select events: payment.captured, payment.failed
4. Save webhook secret to `.env`

---

## What's Included

✅ AI-powered video generation (Claude API)
✅ Presentation generation (PPTX, PDF, HTML)
✅ Document generation (DOCX, PDF, Markdown)
✅ Website generation (full responsive sites)
✅ Razorpay payment integration
✅ User authentication
✅ Team collaboration
✅ 6-tier subscription system
✅ File storage (Firebase Storage)
✅ Automatic backups & scaling

---

## Common Commands

```bash
# Deploy functions only
firebase deploy --only functions

# Deploy hosting only
firebase deploy --only hosting

# View logs
firebase functions:log

# Open Firebase console
firebase open
```

---

## Next Steps

1. ✅ Deploy (done!)
2. 📖 Read `FIREBASE_DEPLOYMENT_GUIDE.md` for details
3. 🎨 Customize templates in `backend/src/services/templateService.js`
4. 📧 Configure email service for notifications
5. 🚀 Launch & market your platform!

---

## Need Help?

- **Detailed Guide**: See `FIREBASE_DEPLOYMENT_GUIDE.md`
- **Migration Info**: See `MIGRATION_SUMMARY.md`
- **Features**: See `PLATFORM_UPGRADE_V2.md`
- **Testing**: See `VERIFICATION_REPORT.md`

---

**🎉 Congratulations! Your platform is live!**

**ClarityVid AI Team**
