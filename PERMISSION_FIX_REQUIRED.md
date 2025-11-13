# Firebase Deployment - Permission Fix Required

**Status:** Deployment failing due to Service Account permissions
**Error:** `Permission denied to get service [firebasestorage.googleapis.com]`

---

## What's Happening

The deployment is working great and got all the way to the Firebase deploy step! However, the Service Account doesn't have permission to enable/check Firebase APIs.

**Progress so far:**
- ✅ System dependencies installed
- ✅ Backend dependencies installed (npm install worked!)
- ✅ Frontend dependencies installed
- ✅ Frontend built successfully
- ✅ Firebase authentication working
- ❌ Firebase deployment blocked by permissions

---

## Quick Fix (2 Steps)

### Step 1: Enable Required APIs

Open these URLs and click "Enable" for each:

**Firebase Storage API:**
https://console.cloud.google.com/apis/library/firebasestorage.googleapis.com?project=exodus-48741

**Cloud Functions API:**
https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=exodus-48741

**Cloud Build API:**
https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=exodus-48741

**Cloud Firestore API:**
https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=exodus-48741

**Firebase Hosting API:**
https://console.cloud.google.com/apis/library/firebasehosting.googleapis.com?project=exodus-48741

### Step 2: Grant Service Account Permissions

**Option A: Quick Fix (Grant Editor Role)**

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=exodus-48741
2. Find your service account: `firebase-adminsdk-fbsvc@exodus-48741.iam.gserviceaccount.com`
3. Click the pencil icon (Edit)
4. Click "Add Another Role"
5. Select: **"Firebase Admin"**
6. Click "Save"

**Option B: Use Owner Account (Alternative)**

Instead of using the Service Account, you can use your owner account credentials:

1. From your laptop with Firebase CLI:
   ```bash
   cd ~/Downloads/aixen/career/clarityvid-ai
   firebase login:ci
   ```

2. Copy the token it generates

3. Update GitHub secret:
   - Go to: https://github.com/mallimatla/career/settings/secrets/actions
   - Edit `FIREBASE_SERVICE_ACCOUNT`
   - Or create new secret called `FIREBASE_TOKEN` with the token

4. Update workflow to use token instead of service account

---

## Recommended: Option A (Grant Permissions)

Option A is better because:
- More secure (scoped permissions)
- Follows best practices
- Won't expire
- Works with automated deployments

---

## After Enabling APIs and Granting Permissions

### Trigger New Deployment

Push any change or manually trigger:

```bash
cd /home/user/career
echo "Ready with permissions" >> clarityvid-ai/README.md
git add clarityvid-ai/README.md
git commit -m "Trigger deployment with API permissions"
git push
```

OR manually from GitHub:
- Go to: https://github.com/mallimatla/career/actions/workflows/firebase-deploy.yml
- Click "Run workflow"

---

## What Permissions Are Needed?

The Service Account needs these roles:
- **Firebase Admin** - Manage Firebase resources
- **Cloud Functions Developer** - Deploy functions
- **Cloud Build Editor** - Build containers
- **Service Account User** - Use service accounts

You can grant all at once with "Firebase Admin" role, or individually for more granular control.

---

## How to Grant Permissions (Detailed Steps)

### Via Google Cloud Console:

1. **Open IAM Page:**
   https://console.cloud.google.com/iam-admin/iam?project=exodus-48741

2. **Find Service Account:**
   Look for: `firebase-adminsdk-fbsvc@exodus-48741.iam.gserviceaccount.com`

3. **Edit Permissions:**
   - Click the pencil icon (✏️) next to the service account
   - You'll see current roles

4. **Add Firebase Admin Role:**
   - Click "+ ADD ANOTHER ROLE"
   - In the "Select a role" dropdown, type "Firebase Admin"
   - Select "Firebase Admin"
   - Click "Save"

5. **Verify:**
   After saving, the service account should have at least:
   - Firebase Admin
   - Any other default roles

---

## Alternative: Detailed Permissions (Advanced)

If you want granular control instead of Firebase Admin, grant these specific roles:

1. **Cloud Functions Developer** - `roles/cloudfunctions.developer`
2. **Firebase Hosting Admin** - `roles/firebasehosting.admin`
3. **Cloud Datastore User** - `roles/datastore.user`
4. **Storage Admin** - `roles/storage.admin`
5. **Service Usage Consumer** - `roles/serviceusage.serviceUsageConsumer`

---

## Checking API Status

To see which APIs are enabled:

**Cloud Console APIs & Services:**
https://console.cloud.google.com/apis/dashboard?project=exodus-48741

Look for:
- ✅ Cloud Functions API
- ✅ Cloud Build API
- ✅ Cloud Firestore API
- ✅ Firebase Storage API
- ✅ Firebase Hosting API

If any show "Enable" button, click it.

---

## Expected Timeline After Fix

Once permissions are granted:

1. ⏳ Deploy Firestore rules (~10s)
2. ⏳ Deploy Storage rules (~10s)
3. ⏳ Deploy Functions (~1-2 mins)
4. ⏳ Deploy Hosting (~30s)
5. ✅ Success! App is live

**Total:** ~3-4 minutes

---

## What to Do After Successful Deployment

### 1. Verify Deployment
- Frontend: https://exodus-48741.web.app
- API Health: https://exodus-48741.web.app/api/health
- Admin: https://exodus-48741.web.app/admin/login

### 2. Configure Environment Variables
```bash
firebase functions:config:set \
  razorpay.key_id="YOUR_KEY" \
  razorpay.key_secret="YOUR_SECRET" \
  anthropic.api_key="YOUR_API_KEY" \
  --project exodus-48741

firebase deploy --only functions --project exodus-48741
```

### 3. Create Admin Account
Use Firestore Console or your setup endpoint.

---

## Summary

**What's Working:**
- ✅ GitHub Actions workflow
- ✅ Dependency installation
- ✅ Frontend build
- ✅ Firebase authentication

**What's Needed:**
- ⏳ Enable Firebase APIs (5 minutes)
- ⏳ Grant Service Account permissions (2 minutes)
- ⏳ Trigger new deployment

**Time to Success:** ~10 minutes from now

---

## Quick Action Checklist

- [ ] Enable all 5 Firebase APIs (use links above)
- [ ] Grant "Firebase Admin" role to service account
- [ ] Trigger new deployment (push or manual)
- [ ] Wait 3-4 minutes
- [ ] Access live app at https://exodus-48741.web.app

---

**You're SO CLOSE! Just grant those permissions and your app will deploy! 🚀**
