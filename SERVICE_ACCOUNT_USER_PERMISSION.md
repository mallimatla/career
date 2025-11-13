# Service Account User Permission Required

**Error:** `Missing permissions required for functions deploy`
**Required:** `iam.serviceAccounts.ActAs` permission
**Solution:** Grant "Service Account User" role

---

## Quick Fix (2 Minutes)

### Step 1: Open IAM Console
https://console.cloud.google.com/iam-admin/iam?project=exodus-48741

### Step 2: Find Service Account
Look for: `firebase-adminsdk-fbsvc@exodus-48741.iam.gserviceaccount.com`

### Step 3: Add Role
1. Click the **pencil icon (✏️)** next to the service account
2. Click **"+ ADD ANOTHER ROLE"**
3. Search for: **"Service Account User"**
4. Select: `Service Account User` (roles/iam.serviceAccountUser)
5. Click **"Save"**

---

## All Required Roles for Firebase Deployment

Your Service Account should have these roles:

| Role | Purpose | Required For |
|------|---------|--------------|
| **Firebase Admin** | Manage Firebase resources | All deployments |
| **Service Account User** | Act as App Engine service account | Functions deployment |
| **Cloud Functions Developer** | Deploy functions | Functions deployment |
| **Cloud Build Editor** | Build function containers | Functions deployment |

---

## How to Grant All Roles at Once

### Via IAM Console:

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=exodus-48741

2. Find: `firebase-adminsdk-fbsvc@exodus-48741.iam.gserviceaccount.com`

3. Click the pencil icon (✏️)

4. Add each role:
   - Click "+ ADD ANOTHER ROLE"
   - Search and select role
   - Repeat for all 4 roles

5. Click "Save"

### Via gcloud CLI (If you prefer):

```bash
# Set project
gcloud config set project exodus-48741

# Service Account email
SA_EMAIL="firebase-adminsdk-fbsvc@exodus-48741.iam.gserviceaccount.com"

# Grant roles
gcloud projects add-iam-policy-binding exodus-48741 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding exodus-48741 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding exodus-48741 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding exodus-48741 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor"
```

---

## After Granting Permissions

### Verify Roles Are Applied

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=exodus-48741
2. Find your service account
3. Verify it shows all 4 roles

### Trigger Deployment

**Option A: Push a change**
```bash
cd /home/user/career
echo "Ready with all permissions" >> clarityvid-ai/README.md
git add clarityvid-ai/README.md
git commit -m "Trigger deployment with full permissions"
git push
```

**Option B: Manual trigger**
1. Go to: https://github.com/mallimatla/career/actions/workflows/firebase-deploy.yml
2. Click "Run workflow"
3. Select your branch
4. Click "Run workflow"

---

## Expected Deployment Flow (After Fix)

```
1. ✅ Checkout Code
2. ✅ Setup Node.js
3. ✅ Install System Dependencies
4. ✅ Install Backend Dependencies
5. ✅ Install Frontend Dependencies
6. ✅ Build Frontend
7. ✅ Setup Firebase Service Account
8. ✅ Install Firebase Tools
9. ✅ Deploy to Firebase
   ├─ Deploy Firestore rules
   ├─ Deploy Storage rules
   ├─ Deploy Functions (will work now!)
   └─ Deploy Hosting
10. ✅ Success!
```

**Time:** 3-5 minutes

---

## Troubleshooting

### If deployment still fails:

**Check 1: Verify all roles are granted**
- Go to IAM console
- Confirm service account has all 4 roles

**Check 2: Wait a few minutes**
- IAM permission changes can take 1-2 minutes to propagate
- Try deployment again after waiting

**Check 3: Ensure Blaze plan is active**
- Go to: https://console.firebase.google.com/project/exodus-48741
- Check if Blaze (pay-as-you-go) plan is enabled
- Cloud Functions require Blaze plan (but has generous free tier)

**Check 4: Verify APIs are enabled**
- Go to: https://console.cloud.google.com/apis/dashboard?project=exodus-48741
- Ensure these are enabled:
  - Cloud Functions API
  - Cloud Build API
  - Cloud Firestore API
  - Firebase Storage API
  - Firebase Hosting API

---

## Security Note

These permissions are safe and follow Firebase best practices:
- Service Account is project-specific
- Roles are scoped to Firebase/Cloud Functions only
- This is the standard setup for CI/CD deployments
- More secure than using owner credentials

---

## Summary

**Current Status:**
- ✅ All code and dependencies working
- ✅ Firebase authentication working
- ⏳ Need: "Service Account User" role

**Action Required:**
1. Add "Service Account User" role (2 minutes)
2. Trigger deployment
3. Wait 3-5 minutes
4. App is live! 🚀

**Live URL (after success):**
https://exodus-48741.web.app

---

**You're literally one permission away from success! Add that role and you're done! 🎉**
