# 🚀 Automatic Deployment from GitHub to Firebase

**No laptop needed!** Push to GitHub → Auto-deploys to Firebase ✨

---

## 📋 One-Time Setup (Do This Once)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. **Project name:** `clarityvid-ai` (or your choice)
4. Click **Continue**
5. **Google Analytics:** Disable (optional)
6. Click **Create project**
7. Wait for creation, then click **Continue**

**IMPORTANT:** Note your **Project ID** (shown in project settings)

### Step 2: Enable Firebase Services

#### Enable Firestore
1. Click **"Firestore Database"** in sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: **us-central1** (or nearest)
5. Click **"Enable"**

#### Enable Storage
1. Click **"Storage"** in sidebar
2. Click **"Get started"**
3. Click **"Next"**
4. Choose **same location** as Firestore
5. Click **"Done"**

#### Enable Authentication
1. Click **"Authentication"** in sidebar
2. Click **"Get started"**
3. Click **"Email/Password"**
4. Toggle **Enable**
5. Click **"Save"**

### Step 3: Upgrade to Blaze Plan (Required for Functions)

1. In Firebase Console, click **"Upgrade"** in bottom left
2. Select **"Blaze - Pay as you go"**
3. Add payment method
4. Don't worry - free tier is very generous!

**Free tier includes:**
- 2 million function invocations/month
- 5GB hosting storage
- 10GB hosting transfer/month

### Step 4: Update Firebase Project ID in Code

**Option A: Using GitHub Web Interface (Easiest - No Laptop Needed!)**

1. Go to your GitHub repo: https://github.com/mallimatla/career
2. Navigate to: `clarityvid-ai/.firebaserc`
3. Click the pencil icon (Edit)
4. Replace `your-firebase-project-id` with your actual Firebase project ID
5. Click **"Commit changes"**

**Option B: From Laptop**

```bash
cd ~/Downloads/aixen/career/clarityvid-ai

# Edit .firebaserc
nano .firebaserc
```

Change:
```json
{
  "projects": {
    "default": "your-actual-firebase-project-id-here"
  }
}
```

Save and commit:
```bash
git add .firebaserc
git commit -m "Update Firebase project ID"
git push
```

### Step 5: Get Firebase CI Token (Need Laptop for This One Time Only)

**You'll need Node.js installed for this step only** (use NVM as shown earlier)

```bash
# Install NVM (if not done)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 18
nvm install 18
nvm use 18

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Generate CI token (this is what we need!)
firebase login:ci
```

**Browser will open**, login with your Google account, then you'll see:

```
✔  Success! Use this token to login on a CI server:

1//0gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Example: firebase deploy --token "$FIREBASE_TOKEN"
```

**COPY THIS TOKEN!** You'll paste it in GitHub in the next step.

### Step 6: Add Firebase Token to GitHub Secrets

1. Go to: https://github.com/mallimatla/career
2. Click **"Settings"** tab (at the top)
3. In left sidebar, click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"** (green button)
5. Fill in:
   - **Name:** `FIREBASE_TOKEN`
   - **Secret:** Paste the token from Step 5
6. Click **"Add secret"**

---

## ✅ That's It! Setup Complete!

Now whenever you push code to GitHub:
- ✅ Frontend automatically builds
- ✅ Backend deploys to Firebase Functions
- ✅ Firestore & Storage rules update
- ✅ Everything goes live automatically!

---

## 🎯 How to Use

### Method 1: Push from Laptop

```bash
# Make some changes to your code
nano backend/src/something.js

# Commit and push
git add .
git commit -m "Updated something"
git push
```

**GitHub Actions will automatically:**
1. Install dependencies
2. Build frontend
3. Deploy to Firebase
4. Show you the results

### Method 2: Edit Directly on GitHub (No Laptop Needed!)

1. Go to https://github.com/mallimatla/career
2. Navigate to any file
3. Click the pencil icon (Edit)
4. Make your changes
5. Click **"Commit changes"**
6. **Auto-deployment starts!** 🚀

### Method 3: Manual Trigger

1. Go to: https://github.com/mallimatla/career/actions
2. Click **"Deploy to Firebase"** workflow
3. Click **"Run workflow"** button
4. Select your branch
5. Click **"Run workflow"**

---

## 📊 Monitor Deployments

### View Deployment Status

1. Go to: https://github.com/mallimatla/career/actions
2. See list of deployments with status:
   - 🟡 **In Progress** - Currently deploying
   - ✅ **Success** - Deployed successfully
   - ❌ **Failed** - Check logs for errors

### View Deployment Logs

1. Click on any deployment
2. Click **"deploy"** job
3. Expand any step to see details
4. See exactly what happened during deployment

### Get Your Live URL

After successful deployment:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Open your project
3. Click **"Hosting"** in sidebar
4. See your live URL: `https://your-project-id.web.app`

---

## 🔧 Configure Environment Variables (For Firebase Functions)

Your backend needs API keys. Set them in Firebase:

```bash
# From laptop (one time)
firebase functions:config:set \
  razorpay.key_id="rzp_live_YOUR_KEY" \
  razorpay.key_secret="YOUR_SECRET" \
  anthropic.api_key="sk-ant-YOUR_KEY"

# Deploy functions
firebase deploy --only functions --token "YOUR_FIREBASE_TOKEN"
```

**Or set via Firebase Console:**
1. Go to Firebase Console → Functions
2. Click on your function
3. Go to **"Configuration"** tab
4. Add environment variables

---

## 🎨 Customization

### Deploy Only on Specific Branches

Edit `.github/workflows/firebase-deploy.yml`:

```yaml
on:
  push:
    branches:
      - main  # Only deploy from main branch
      # Remove other branches if you want
```

### Deploy Only Specific Parts

```yaml
# Deploy only hosting (frontend)
- run: firebase deploy --only hosting --token "${{ secrets.FIREBASE_TOKEN }}"

# Deploy only functions (backend)
- run: firebase deploy --only functions --token "${{ secrets.FIREBASE_TOKEN }}"

# Deploy only rules
- run: firebase deploy --only firestore,storage --token "${{ secrets.FIREBASE_TOKEN }}"
```

### Add Deployment Notifications

Add Slack/Discord/Email notifications when deployment completes:

```yaml
- name: 📧 Send Notification
  if: success()
  run: |
    curl -X POST YOUR_WEBHOOK_URL \
      -d "Deployment successful! 🎉"
```

---

## 🐛 Troubleshooting

### Issue: "FIREBASE_TOKEN not found"

**Solution:**
1. Check you added the secret in Step 6
2. Name must be exactly `FIREBASE_TOKEN`
3. Re-run the workflow

### Issue: "Error: HTTP Error: 403"

**Solution:**
1. Enable Cloud Functions API in Google Cloud Console
2. Enable Cloud Build API
3. Verify Blaze plan is active

### Issue: "Build failed"

**Solution:**
1. Check the error in GitHub Actions logs
2. Fix the error in your code
3. Push again - auto-deploys on next push!

### Issue: Functions not deploying

**Solution:**
```bash
# Check functions configuration
firebase functions:config:get

# Set missing variables
firebase functions:config:set key="value"

# Redeploy
firebase deploy --only functions
```

---

## 💡 Pro Tips

### Tip 1: Preview Deployments (Coming Soon)

Set up preview channels for testing before production:

```yaml
# Deploy to preview channel
- run: firebase hosting:channel:deploy preview-${{ github.sha }}
```

### Tip 2: Rollback if Needed

```bash
# List previous deployments
firebase hosting:releases:list

# Rollback to specific version
firebase hosting:rollback
```

### Tip 3: Set Deployment Schedule

Deploy automatically at specific times:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Deploy daily at 2 AM
```

### Tip 4: Add Tests Before Deploy

```yaml
- name: 🧪 Run Tests
  run: npm test
  working-directory: ./clarityvid-ai/backend

# Only deploys if tests pass!
```

---

## 🎉 Benefits of This Setup

✅ **No laptop needed** - Edit on GitHub, auto-deploys
✅ **Instant deployments** - Push code, live in 3-5 minutes
✅ **Version history** - Track all deployments
✅ **Rollback easily** - Undo bad deployments
✅ **Team collaboration** - Anyone can deploy safely
✅ **Always up-to-date** - Latest code always live
✅ **Professional workflow** - Like big tech companies!

---

## 📚 Additional Resources

- GitHub Actions Docs: https://docs.github.com/actions
- Firebase CLI Reference: https://firebase.google.com/docs/cli
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Firebase Functions: https://firebase.google.com/docs/functions

---

## 🔄 Workflow Sequence

```
1. You push code to GitHub
   ↓
2. GitHub Actions triggers automatically
   ↓
3. Installs Node.js and dependencies
   ↓
4. Builds frontend (creates optimized production build)
   ↓
5. Deploys everything to Firebase:
   - Frontend → Firebase Hosting
   - Backend → Firebase Functions
   - Rules → Firestore & Storage
   ↓
6. Your app is LIVE! ✨
   ↓
7. You get notification (✅ success or ❌ failed)
```

---

**Deployment Time:** 3-7 minutes
**Cost:** FREE (within generous free tier)
**Complexity:** ZERO (after initial setup)

🚀 **Push to GitHub → Live on Firebase!**

---

**Questions?** Check the logs at: https://github.com/mallimatla/career/actions
