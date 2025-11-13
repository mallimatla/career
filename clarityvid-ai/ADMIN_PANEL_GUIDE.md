# 🔐 Admin Panel Guide - ClarityVid AI

Complete guide for accessing and using the ClarityVid AI Admin Panel.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [First-Time Setup](#first-time-setup)
3. [Accessing Admin Panel](#accessing-admin-panel)
4. [Admin Features](#admin-features)
5. [Security](#security)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Admin Panel allows you to:
- ✅ View platform statistics (users, content, revenue)
- ✅ Update pricing and plan features
- ✅ Configure API keys (display only)
- ✅ Manage platform features and settings
- ✅ View all users
- ✅ Monitor admin activity logs
- ✅ Control maintenance mode

---

## 🚀 First-Time Setup

### Step 1: Create Your First Admin Account

After deploying to Firebase, run the admin setup script:

```bash
cd backend
node scripts/createAdmin.js
```

**Follow the prompts:**
```
🔐 ClarityVid AI - Admin Setup

This script will create your first admin account.

Enter admin username (default: admin): admin
Enter admin email: your-email@example.com
Enter admin password (min 8 characters): ********
Confirm password: ********

⏳ Creating admin account...
✅ Admin account created successfully!

📋 Admin Details:
   Username: admin
   Email: your-email@example.com
   Role: super_admin
   ID: xxxxxxxxxxxxxxxxxxxx

⏳ Creating default settings...
✅ Default settings created!

🎉 Setup complete! You can now login to the admin panel.

Admin Panel URL: http://localhost:3000/admin
Or in production: https://your-domain.com/admin
```

### Step 2: Save Your Credentials

**IMPORTANT:** Store your admin credentials securely!

- **Username**: Your chosen username
- **Password**: Your chosen password (minimum 8 characters)

> ⚠️ **Security Note**: There is NO password reset feature by default. If you forget your password, you'll need to delete the admin document from Firestore and run the setup script again.

---

## 🔑 Accessing Admin Panel

### Local Development

```
URL: http://localhost:3000/admin/login
```

### Production

```
URL: https://your-project-id.web.app/admin/login
OR: https://your-custom-domain.com/admin/login
```

### Login Steps

1. Open the admin login URL
2. Enter your username
3. Enter your password
4. Click **"Login"**

You'll be redirected to the dashboard upon successful login.

---

## 📊 Admin Features

### 1. Dashboard

**View Platform Statistics:**
- 👥 Total Users & Active Subscriptions
- 📝 Total Content Generated
- 🎬 Videos Created
- 📊 Presentations Generated
- 📄 Documents Created
- 🌐 Websites Built
- 💰 Monthly Revenue

**Quick Actions:**
- Send announcements (coming soon)
- Export data
- Refresh statistics

---

### 2. Pricing Management

**Configure Subscription Plans:**

**5 Plans Available:**
1. Free
2. Starter
3. Professional
4. Business
5. Agency

**For Each Plan, Set:**

**💰 Pricing:**
- Monthly Price (₹ INR)
- Annual Price (₹ INR per month)
- Monthly Credits

**✨ Features:**
- Max Videos
- Max Duration (minutes)
- Team Members limit
- Watermark (on/off)
- Custom Branding (on/off)
- API Access (on/off)
- Support Level

**How to Update:**
1. Click **"Pricing"** in sidebar
2. Modify any field
3. Click **"💾 Save All Changes"**
4. Changes take effect immediately for NEW subscriptions

> ⚠️ **Note**: Existing subscriptions maintain their original pricing until renewal.

---

### 3. API Keys Configuration

**View and Reference API Keys:**

**🔐 Razorpay (Payment Gateway):**
- Key ID (visible)
- Key Secret (masked)
- Webhook Secret (masked)

**🤖 Anthropic Claude (AI):**
- API Key (masked)
- Model Selection

**🔥 Firebase:**
- Project ID (read-only)
- Storage Bucket (read-only)

**⚠️ IMPORTANT - How to Actually Update API Keys:**

API keys are displayed here for reference only. To actually update them:

1. **Connect to your server:**
   ```bash
   # If using SSH
   ssh your-server

   # If using Firebase
   # Edit environment config
   firebase functions:config:set razorpay.key_id="new_key"
   ```

2. **Update .env file:**
   ```bash
   cd backend
   nano .env
   # Update the respective keys
   ```

3. **Required Environment Variables:**
   ```bash
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ANTHROPIC_API_KEY=sk-ant-your_key
   ```

4. **Redeploy:**
   ```bash
   firebase deploy --only functions
   ```

> 🔒 **Security**: Never store actual API secrets in Firestore. Always use environment variables.

---

### 4. Features & Settings

**⚙️ Platform Features:**

Toggle features on/off:
- ✅ **Enable API Access** - Allow API usage for users with API plans
- ✅ **Enable Team Features** - Allow team collaboration
- ✅ **Enable Webhooks** - Allow webhook notifications
- 🔧 **Maintenance Mode** - Put platform under maintenance (blocks all users)

**🚦 Platform Limits:**
- Max File Size (MB)
- Max Video Duration (minutes)
- Rate Limit Window (minutes)
- Rate Limit Max Requests

**📧 Email Configuration:**
- SMTP Host
- SMTP Port
- SMTP User
- Email From Address

**How to Update:**
1. Modify settings
2. Click respective **"💾 Save"** button
3. Changes apply immediately

---

### 5. User Management

**View All Users:**
- Email address
- Full name
- Current plan
- Join date
- Verification status

**Features:**
- Search users (coming soon)
- Filter by plan (coming soon)
- Export user data (coming soon)
- User details (coming soon)

---

### 6. Admin Logs

**Monitor Admin Activity:**
- View all admin actions
- Track changes to settings
- Audit trail with timestamps
- IP addresses and user agents

---

## 🔐 Security Best Practices

### 1. Strong Password

✅ Use a strong password:
- Minimum 12 characters
- Mix of uppercase and lowercase
- Include numbers and symbols
- Don't use common words

❌ Avoid:
- Simple passwords like "admin123"
- Your name or company name
- Common dictionary words

### 2. Secure Access

✅ Security measures:
- Only share credentials with authorized personnel
- Use secure connection (HTTPS) always
- Log out after each session
- Change password regularly

❌ Never:
- Share credentials via email or chat
- Access from public/unsecured WiFi without VPN
- Save passwords in browser on shared computers
- Use same password for multiple accounts

### 3. IP Whitelisting (Recommended)

Add IP whitelisting to your Firebase Functions:

```javascript
// In backend/src/middleware/adminAuth.js
const allowedIPs = ['your.ip.address.here'];

exports.checkIPWhitelist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied from this IP',
    });
  }

  next();
};
```

### 4. Two-Factor Authentication (Coming Soon)

We're working on adding 2FA support for enhanced security.

---

## 🛠️ Troubleshooting

### Issue: Can't Login - "Invalid credentials"

**Possible Causes:**
1. Wrong username or password
2. Admin account doesn't exist
3. Database connection issue

**Solutions:**
1. Double-check username (case-sensitive)
2. Verify admin exists in Firestore `admins` collection
3. Reset admin account:
   ```bash
   # Delete admin from Firestore Console
   # Run setup script again
   node scripts/createAdmin.js
   ```

---

### Issue: "Token expired"

**Cause:** Your session expired (24 hours)

**Solution:**
1. Click **"Logout"**
2. Login again

---

### Issue: Can't Save Settings

**Possible Causes:**
1. Network connection issue
2. Insufficient permissions
3. Invalid data format

**Solutions:**
1. Check internet connection
2. Verify you're logged in as admin
3. Check browser console for errors (F12)
4. Try refreshing the page

---

### Issue: Changes Not Reflecting

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

---

### Issue: Forgot Password

**There is NO automatic password reset.**

**Solution:**
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Find `admins` collection
4. Delete your admin document
5. Run setup script again:
   ```bash
   node scripts/createAdmin.js
   ```

---

## 📱 Admin Panel Access Points

### Local Development
```
Frontend: http://localhost:3000/admin/login
Backend API: http://localhost:5000/api/admin
```

### Production
```
Frontend: https://your-project-id.web.app/admin/login
Backend API: https://your-project-id.web.app/api/admin
```

---

## 🔄 Regular Maintenance Tasks

### Daily
- ✅ Check platform statistics
- ✅ Review new user signups
- ✅ Monitor revenue

### Weekly
- ✅ Review admin activity logs
- ✅ Check for failed payments
- ✅ Verify system health

### Monthly
- ✅ Audit pricing and features
- ✅ Review and update limits if needed
- ✅ Backup important data

---

## 📞 Support

### Need Help?

1. **Check Documentation:**
   - `FIREBASE_DEPLOYMENT_GUIDE.md`
   - `MIGRATION_SUMMARY.md`
   - `QUICKSTART.md`

2. **Check Logs:**
   ```bash
   # Firebase Functions logs
   firebase functions:log

   # Local backend logs
   cd backend && npm run dev
   ```

3. **Firebase Console:**
   - [Firebase Console](https://console.firebase.google.com/)
   - Check Firestore, Functions, Storage

---

## 🎉 Tips for Success

1. **Regular Backups**
   - Export Firestore data regularly
   - Backup environment variables

2. **Monitor Usage**
   - Keep track of platform growth
   - Plan for scaling

3. **Stay Updated**
   - Update dependencies regularly
   - Follow security best practices

4. **Document Changes**
   - Keep track of pricing changes
   - Document configuration updates

---

## 🔒 Admin Permissions

**super_admin Role** (default):
- ✅ Full access to all features
- ✅ View and edit all settings
- ✅ Manage pricing
- ✅ Configure API keys
- ✅ View all users
- ✅ Access admin logs

**Custom Roles** (coming soon):
- Support role
- Manager role
- Read-only role

---

**Admin Panel Version**: 1.0.0
**Last Updated**: 2025-11-13
**Status**: ✅ **PRODUCTION READY**

---

**Happy Administrating!** 🚀

---

*For technical issues, refer to the deployment guides or check Firebase console logs.*
