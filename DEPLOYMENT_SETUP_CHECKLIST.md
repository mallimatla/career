# Firebase Deployment Setup - Final Checklist

## Current Status: Almost Ready! 🚀

### ✅ Completed Steps

- ✅ Firebase project created (exodus-48741)
- ✅ Firestore database enabled
- ✅ Firebase Storage enabled
- ✅ Service Account JSON obtained
- ✅ GitHub Actions workflow configured
- ✅ Workflow file moved to correct location (.github/workflows/)
- ✅ Firebase project ID updated in .firebaserc

### ⏳ Final Step Required

You need to add the Firebase Service Account JSON as a GitHub Secret. This is the **only remaining blocker** for automatic deployment.

---

## How to Add FIREBASE_SERVICE_ACCOUNT Secret

### Step 1: Go to GitHub Secrets Page
Open this URL in your browser:
```
https://github.com/mallimatla/career/settings/secrets/actions
```

### Step 2: Click "New repository secret"
Look for the green button that says **"New repository secret"** and click it.

### Step 3: Fill in the Secret Details

**Name (exactly as shown):**
```
FIREBASE_SERVICE_ACCOUNT
```

**Secret:**

Paste the **complete Service Account JSON** you obtained from Firebase Console.

It should look like this (use your actual JSON, not this example):

```json
{
  "type": "service_account",
  "project_id": "exodus-48741",
  "private_key_id": "your-key-id-here",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@exodus-48741.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}
```

**IMPORTANT:** Copy the ENTIRE JSON including all fields from the file you downloaded from Firebase.

### Step 4: Click "Add secret"

### Step 5: Verify the Workflow Appears

1. Go to: https://github.com/mallimatla/career/actions
2. You should now see "Deploy to Firebase" workflow in the left sidebar
3. The latest run should appear (triggered by the recent push)

---

## What Happens After Adding the Secret?

### Automatic Deployment Will Start

Once you add the secret and push any code change:

1. ✅ GitHub Actions will automatically trigger
2. ✅ It will install Node.js and dependencies
3. ✅ Build the frontend (React production build)
4. ✅ Deploy everything to Firebase:
   - Frontend → Firebase Hosting
   - Backend → Firebase Functions
   - Database rules → Firestore
   - Storage rules → Firebase Storage

### Your Live URLs

After successful deployment, your app will be available at:

- **Frontend**: https://exodus-48741.web.app
- **API**: https://exodus-48741.web.app/api
- **Admin Panel**: https://exodus-48741.web.app/admin/login

---

## Monitoring Deployment

### Check Workflow Status
- URL: https://github.com/mallimatla/career/actions
- Click on any workflow run to see detailed logs
- Green checkmark = Success ✅
- Red X = Failed (check logs) ❌
- Yellow circle = In Progress 🟡

### Check Firebase Console
- URL: https://console.firebase.google.com/project/exodus-48741
- Click "Hosting" to see deployment history
- Click "Functions" to see deployed backend functions

---

## Troubleshooting

### If Workflow Doesn't Appear
1. Check if GitHub Actions is enabled: https://github.com/mallimatla/career/settings/actions
2. Ensure "Allow all actions and reusable workflows" is selected
3. Make sure you're on the correct repository page

### If Deployment Fails
1. Check the workflow logs for errors
2. Verify the secret was added correctly (name must be exactly `FIREBASE_SERVICE_ACCOUNT`)
3. Ensure Firebase Blaze plan is active (required for Functions)

### If App Doesn't Load
1. Check Firebase Console for deployment status
2. Open browser console (F12) to see JavaScript errors
3. Verify environment variables are set in Firebase Functions config

---

## After First Successful Deployment

### Set Up Environment Variables

Your backend needs API keys. Run these commands from your laptop:

```bash
cd ~/Downloads/aixen/career/clarityvid-ai

# Configure environment variables in Firebase
firebase functions:config:set \
  razorpay.key_id="YOUR_RAZORPAY_KEY_ID" \
  razorpay.key_secret="YOUR_RAZORPAY_SECRET" \
  anthropic.api_key="YOUR_ANTHROPIC_API_KEY"

# Redeploy functions with new config
firebase deploy --only functions --project exodus-48741
```

### Create Admin Account

Go to Firestore Console:
1. https://console.firebase.google.com/project/exodus-48741/firestore
2. Create a new document in the `admins` collection
3. Add your admin email and credentials

---

## Summary

**You are ONE STEP away from automatic deployment!**

Just add the `FIREBASE_SERVICE_ACCOUNT` secret to GitHub, and every time you push code, it will automatically deploy to Firebase.

**Next action:** Go to https://github.com/mallimatla/career/settings/secrets/actions and add the secret!

---

## Questions?

If something doesn't work:
1. Check GitHub Actions logs: https://github.com/mallimatla/career/actions
2. Check Firebase Console: https://console.firebase.google.com/project/exodus-48741
3. The workflow runs every time you push to your branch

---

**Deployment Time:** 3-5 minutes per push
**Cost:** FREE (within Firebase free tier)
**Complexity:** ZERO (fully automated!)

🚀 **Push to GitHub → Auto-Deploy to Firebase → Live in Minutes!**
