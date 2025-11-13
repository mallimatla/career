# Why Your Workflow is Failing (And How to Fix It)

## Current Status

✅ **Good News**: The workflow is now visible and running!
❌ **Issue**: It's failing after 11-20 seconds (should take 3-7 minutes when successful)

## Why It's Failing

The workflow is failing because **`FIREBASE_SERVICE_ACCOUNT` secret is not added** to GitHub yet.

### How to Verify This:

1. Go to: https://github.com/mallimatla/career/actions/runs/[latest-run-id]
2. Click on the "deploy" job
3. Expand the "🔑 Setup Firebase Service Account" step
4. You'll see an error like:

```
Error: secrets.FIREBASE_SERVICE_ACCOUNT is not defined
```

OR

```
Error: The process '/usr/local/bin/firebase' failed with exit code 1
```

---

## The Fix (Takes 2 Minutes)

### Step 1: Go to GitHub Secrets Page

Open this URL: **https://github.com/mallimatla/career/settings/secrets/actions**

### Step 2: Click "New repository secret"

Click the green button that says **"New repository secret"**

### Step 3: Add the Secret

Fill in **exactly** as shown:

**Name:**
```
FIREBASE_SERVICE_ACCOUNT
```
(must be exactly this - all caps, underscores, no spaces)

**Secret:**
Paste your complete Service Account JSON. It should start with:
```json
{
  "type": "service_account",
  "project_id": "exodus-48741",
  ...
```

The JSON you obtained from Firebase Console (the one you shared earlier with me).

### Step 4: Click "Add secret"

### Step 5: Trigger a New Deployment

After adding the secret, push a small change to trigger deployment:

```bash
cd /home/user/career
echo "Deployment test $(date)" >> clarityvid-ai/README.md
git add clarityvid-ai/README.md
git commit -m "Test deployment with Firebase secret"
git push
```

OR manually trigger from GitHub:
1. Go to: https://github.com/mallimatla/career/actions/workflows/firebase-deploy.yml
2. Click "Run workflow" (top right)
3. Select your branch
4. Click "Run workflow"

---

## What You'll See After Adding the Secret

### During Deployment (3-7 minutes):

The workflow will go through these steps:
1. ✅ Checkout Code
2. ✅ Setup Node.js 18
3. ✅ Install Backend Dependencies (~1 min)
4. ✅ Install Frontend Dependencies (~1 min)
5. ✅ Build Frontend for Production (~2 min)
6. ✅ Setup Firebase Service Account (now works!)
7. ✅ Install Firebase Tools
8. ✅ Deploy to Firebase (~1 min)
9. ✅ Cleanup
10. ✅ Deployment Summary

### After Success:

You'll see:
```
🎉 Deployment Complete!
📱 Frontend: https://exodus-48741.web.app
⚡ Backend: https://exodus-48741.web.app/api
🔐 Admin: https://exodus-48741.web.app/admin/login
```

---

## Viewing the Error Logs (Optional)

If you want to see the exact error from the current failures:

1. Go to: https://github.com/mallimatla/career/actions
2. Click on the latest failed run (red X)
3. Click "deploy" job on the left
4. Expand any step with a red X to see the error
5. Most likely you'll see: "secrets.FIREBASE_SERVICE_ACCOUNT is not defined"

---

## Common Questions

### Q: Where do I get the Service Account JSON?
**A:** You already have it - it's the JSON you obtained earlier from Firebase Console and shared with me. It starts with `{"type": "service_account", "project_id": "exodus-48741"...}`

### Q: Can I test locally first?
**A:** The deployment only works through GitHub Actions. But you can test the secret was added correctly by running the workflow manually after adding it.

### Q: How do I know if the secret was added correctly?
**A:** After adding the secret, go to: https://github.com/mallimatla/career/settings/secrets/actions
You should see `FIREBASE_SERVICE_ACCOUNT` listed (the value is hidden for security).

### Q: Do I need to enable Firebase Blaze plan?
**A:** Yes, Firebase Functions requires the Blaze (pay-as-you-go) plan. But don't worry - it has a generous free tier:
- 2 million function invocations/month free
- 5GB hosting storage free
- 10GB hosting transfer/month free

You likely won't exceed the free tier unless you have high traffic.

---

## Quick Checklist

Before deployment works, verify:

- [ ] GitHub Actions is enabled (Settings → Actions)
- [ ] Workflow file exists at `.github/workflows/firebase-deploy.yml` ✅
- [ ] Firebase project ID is `exodus-48741` in `.firebaserc` ✅
- [ ] `FIREBASE_SERVICE_ACCOUNT` secret is added to GitHub ⏳ **← DO THIS NOW**
- [ ] Firebase Blaze plan is active (check Firebase Console)

---

## Summary

**You're literally ONE step away from automatic deployment!**

The workflow is configured correctly and running. It just needs the Firebase authentication secret.

**Action Required:**
1. Go to https://github.com/mallimatla/career/settings/secrets/actions
2. Add `FIREBASE_SERVICE_ACCOUNT` secret
3. Push any change or manually trigger the workflow
4. Watch it deploy successfully to https://exodus-48741.web.app

**Estimated time to fix:** 2 minutes
**Next deployment:** 3-7 minutes
**Result:** Your app will be live on Firebase! 🚀

---

## After First Successful Deployment

Once deployed, you'll need to:

1. **Configure environment variables** in Firebase Functions:
   - Razorpay API keys
   - Anthropic Claude API key
   - Other service credentials

2. **Create admin account** in Firestore Console

3. **Test the live application**

But first, let's get that secret added so deployment works!

---

**Need help?** Check the logs at: https://github.com/mallimatla/career/actions
