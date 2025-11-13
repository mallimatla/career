# ClarityVid AI - Quick Setup Guide

This guide will help you get ClarityVid AI running locally in under 15 minutes.

## Prerequisites Installation

### 1. Install Node.js and npm
```bash
# Check if installed
node --version  # Should be 18+
npm --version   # Should be 9+

# If not installed, download from https://nodejs.org/
```

### 2. Install PostgreSQL
```bash
# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows: Download from https://www.postgresql.org/download/windows/
```

### 3. Install Redis
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Windows: Download from https://redis.io/download
```

### 4. Install FFmpeg
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows: Download from https://ffmpeg.org/download.html
```

## Quick Start

### Step 1: Database Setup

```bash
# Create PostgreSQL database
createdb clarityvid_db

# Or using psql:
psql postgres
CREATE DATABASE clarityvid_db;
\q
```

### Step 2: Backend Setup

```bash
cd clarityvid-ai/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials (see below)
nano .env  # or use your preferred editor

# Start backend server
npm run dev
```

**Minimum .env Configuration:**
```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clarityvid_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your_openai_key

# AWS (get from AWS Console - IAM)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@clarityvid.ai

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 3: Frontend Setup

```bash
# Open new terminal
cd clarityvid-ai/frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# Start frontend
npm start
```

### Step 4: Start Video Worker (Optional, for production)

```bash
# Open new terminal
cd clarityvid-ai/backend

# Start worker process
npm run worker
```

## Verify Installation

1. **Backend**: Visit http://localhost:5000/health
   - You should see: `{"success": true, "message": "ClarityVid AI API is running"}`

2. **Frontend**: Visit http://localhost:3000
   - You should see the login page

3. **Register**: Create a new account at http://localhost:3000/register

4. **Test Video Creation**:
   - Login to dashboard
   - Click "Create New Video"
   - Upload a document or paste text
   - Generate script
   - Generate video

## Getting API Keys

### OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Sign up or login
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Add to `.env` as `OPENAI_API_KEY`

### AWS Credentials
1. Login to AWS Console
2. Go to IAM → Users → Create User
3. Attach policies: `AmazonS3FullAccess`
4. Create access key
5. Copy Access Key ID and Secret Access Key
6. Add to `.env`
7. Create S3 bucket and add bucket name to `.env`

### Stripe Keys
1. Visit https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" and "Secret key"
3. Add to `.env`
4. For webhooks, use Stripe CLI or Dashboard

### Gmail App Password (for emails)
1. Enable 2-Factor Authentication on Gmail
2. Visit https://myaccount.google.com/apppasswords
3. Generate new app password
4. Use this password in `.env` as `SMTP_PASSWORD`

## Common Issues & Solutions

### Issue: Database connection fails
```bash
# Check PostgreSQL is running
pg_isready

# Check credentials in .env match your PostgreSQL setup
psql -U postgres -d clarityvid_db
```

### Issue: Redis connection fails
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
redis-server
```

### Issue: FFmpeg not found
```bash
# Verify FFmpeg installation
ffmpeg -version

# Add to PATH if needed
export PATH="/usr/local/bin:$PATH"
```

### Issue: npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

## Development Tips

### Hot Reload
- Backend: Uses `nodemon` for auto-restart
- Frontend: Uses React's built-in hot reload

### Database Reset
```bash
# Drop and recreate database
dropdb clarityvid_db
createdb clarityvid_db

# Restart backend to auto-sync models
npm run dev
```

### Testing Endpoints
```bash
# Install httpie or use curl
brew install httpie

# Test health endpoint
http GET http://localhost:5000/health

# Test registration
http POST http://localhost:5000/api/auth/register \
  email=test@example.com \
  password=password123 \
  firstName=John \
  lastName=Doe
```

### Viewing Logs
```bash
# Backend logs (console)
# Frontend logs (browser console)

# Database queries (enable in backend/config/database.js)
logging: console.log
```

## Next Steps

1. **Explore the Dashboard**: Login and explore the UI
2. **Create Test Video**: Upload a small PDF or text
3. **Review Generated Script**: See AI script generation in action
4. **Generate Video**: Create your first whiteboard animation
5. **Test Subscriptions**: Try upgrading to different plans
6. **API Documentation**: Read API docs in main README.md
7. **Customize Branding**: Add your logo and colors

## Production Deployment

For production deployment, see the main README.md deployment section.

Key differences for production:
- Set `NODE_ENV=production`
- Use production database with backups
- Configure SSL/TLS
- Set up CDN for frontend
- Use PM2 or Docker for process management
- Configure monitoring and logging
- Set up automated backups
- Use production API keys

## Support

If you encounter issues:
1. Check this guide's Common Issues section
2. Review backend console logs
3. Check browser console for frontend errors
4. Verify all prerequisites are installed
5. Ensure all API keys are valid

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] FFmpeg installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can register new account
- [ ] Can login to dashboard
- [ ] All API keys configured
- [ ] Video creation works

**Congratulations! You're ready to create amazing AI-powered videos! 🎉**
