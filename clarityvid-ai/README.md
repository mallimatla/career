# ClarityVid AI - AI-Powered Video Generation Platform

**Transform documents into professional whiteboard animation videos with AI**

ClarityVid AI is a complete, enterprise-level AI-powered video generation platform that converts documents, PDFs, presentations, and text prompts into engaging whiteboard explainer videos. Built with modern technologies and designed for scalability, clarity, and educational purposes.

---

## 🚀 Features

### Core Functionality
- **Document to Video Conversion**: Upload PDF, DOCX, PPTX, TXT, or Markdown files
- **AI-Powered Script Generation**: Automatic script creation using OpenAI GPT-4
- **Text-to-Speech**: Natural voiceovers in 50+ languages using OpenAI TTS
- **Whiteboard Animation**: Professional whiteboard-style video generation
- **Custom Branding**: Add logos, colors, and company branding
- **Frame-by-Frame Editing**: Precise control over animations and scenes

### Enterprise Features
- **Multi-tier Subscription System**: 6 pricing tiers (Free to Enterprise)
- **Credit-Based Billing**: Flexible pay-per-minute video generation
- **Team Collaboration**: Shared workspaces with role-based permissions
- **API Access**: RESTful API for enterprise integrations
- **Stripe Integration**: Secure payment processing
- **Video Queue System**: Scalable background processing with Bull
- **CDN Delivery**: Fast video delivery via AWS CloudFront

### Technical Capabilities
- **Multi-language Support**: Generate videos in 50+ languages
- **Multiple Resolutions**: 720p, 1080p, and 4K output
- **Multiple Formats**: MP4, MOV, and WebM export
- **Scene Management**: Automatic storyboard generation
- **Progress Tracking**: Real-time video generation progress
- **Watermark Control**: Configurable based on subscription tier

---

## 🏗️ Architecture

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Caching/Queues**: Redis + Bull Queue
- **AI Services**: OpenAI GPT-4 & TTS
- **File Storage**: AWS S3 + CloudFront CDN
- **Payment**: Stripe
- **Authentication**: JWT (JSON Web Tokens)
- **Video Processing**: FFmpeg, Canvas

#### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: React Context + React Query
- **Styling**: Pure CSS (Professional, no gradients)
- **UI Components**: Custom components with Lucide icons
- **File Upload**: React Dropzone
- **Notifications**: React Toastify

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│  (React Frontend - Professional UI, Dashboard, Editor)   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ HTTPS/REST API
                    │
┌───────────────────▼─────────────────────────────────────┐
│                    API GATEWAY                           │
│  (Express.js - Auth, Rate Limiting, Validation)         │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴────────────┬────────────────┐
        │                        │                 │
┌───────▼────────┐   ┌──────────▼─────┐   ┌──────▼───────┐
│  Auth Service  │   │  Video Service  │   │ Subscription │
│  (JWT, Users)  │   │  (CRUD, Gen)    │   │   (Stripe)   │
└───────┬────────┘   └───────┬──────────┘   └──────┬───────┘
        │                    │                      │
        │                    │                      │
┌───────▼────────────────────▼──────────────────────▼───────┐
│                     DATABASE LAYER                         │
│              (PostgreSQL - Sequelize ORM)                  │
│  Tables: users, subscriptions, videos, teams, members     │
└────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┬────────────────┐
        │                        │                 │
┌───────▼────────┐   ┌──────────▼─────┐   ┌──────▼───────┐
│  AI Services   │   │  Video Queue    │   │ File Storage │
│  (OpenAI GPT,  │   │  (Bull/Redis)   │   │   (AWS S3)   │
│   TTS, NLP)    │   │  Background Proc│   │  + CloudFront│
└────────────────┘   └─────────────────┘   └──────────────┘
```

---

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 13+
- Redis 6+
- AWS Account (S3 + CloudFront)
- OpenAI API Key
- Stripe Account
- FFmpeg installed

### Backend Setup

1. **Clone the repository**
   ```bash
   cd clarityvid-ai/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   # Database
   DB_HOST=localhost
   DB_NAME=clarityvid_db
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT
   JWT_SECRET=your_super_secret_key

   # AWS
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_S3_BUCKET=your-bucket-name

   # OpenAI
   OPENAI_API_KEY=sk-your_openai_key

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_key

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Set up database**
   ```bash
   # Create database
   createdb clarityvid_db

   # Run migrations (auto-sync in development)
   npm run dev
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start

   # Worker (for video processing)
   npm run worker
   ```

   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd clarityvid-ai/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** Create `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm start
   ```

   Frontend runs on `http://localhost:3000`

---

## 📖 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Inc"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Returns: Current user profile

### Video Endpoints

**POST /api/videos**
- Headers: `Authorization: Bearer <token>`
- Body: FormData with `file` and video metadata
- Creates a new video project

**POST /api/videos/:id/generate-script**
- Generates AI script from source content
- Deducts 0.1 credits

**POST /api/videos/:id/generate**
```json
{
  "resolution": "1080p",
  "format": "mp4"
}
```
- Starts video generation
- Deducts credits based on duration

**GET /api/videos/:id/status**
- Returns video generation progress

### Subscription Endpoints

**GET /api/subscriptions/plans**
- Returns all available pricing plans

**GET /api/subscriptions/current**
- Returns user's current subscription

**POST /api/subscriptions/checkout**
```json
{
  "plan": "professional",
  "billingCycle": "annual"
}
```
- Creates Stripe checkout session

---

## 💰 Pricing Tiers

| Plan | Monthly | Annual | Credits | Features |
|------|---------|--------|---------|----------|
| **Free** | $0 | $0 | 1 | 3 videos, 2 min each, watermark |
| **Starter** | $29 | $23 | 10 | 10 videos, 5 min, no watermark |
| **Professional** | $79 | $63 | 30 | 30 videos, 15 min, branding, editing |
| **Business** | $149 | $119 | 100 | 100 videos, 60 min, API, 10 team members |
| **Agency** | $299 | $239 | 500 | 500 videos, 60 min, white-label, 50 members |
| **Enterprise** | Custom | Custom | Unlimited | Custom integration, SLA, 24/7 support |

**Credit System**: 1 credit = 1 minute of final video

---

## 🎨 UI Design Principles

- **Professional & Clean**: No gradients, solid colors only
- **Accessibility**: High contrast, readable fonts, semantic HTML
- **Responsive**: Mobile-first design, works on all devices
- **Performance**: Optimized assets, lazy loading
- **Consistency**: Reusable components, design tokens

---

## 🔧 Development

### Project Structure

```
clarityvid-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── aiService.js        # OpenAI integration
│   │   │   ├── ttsService.js       # Text-to-speech
│   │   │   ├── s3Service.js        # AWS S3
│   │   │   ├── videoGenerator.js   # Video creation
│   │   │   └── videoQueue.js       # Bull queue
│   │   ├── middleware/       # Auth, validation
│   │   ├── utils/            # Helpers
│   │   └── workers/          # Background jobs
│   ├── config/               # Configuration files
│   ├── tests/                # Unit & integration tests
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Route pages
│   │   │   ├── Auth/               # Login, Register
│   │   │   ├── Dashboard.js        # Main dashboard
│   │   │   ├── CreateVideo.js      # Video creation
│   │   │   ├── VideoEditor.js      # Script editor
│   │   │   ├── VideoList.js        # Video library
│   │   │   ├── Pricing.js          # Plans & billing
│   │   │   └── Settings.js         # User settings
│   │   ├── services/         # API clients
│   │   ├── context/          # React Context
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Helper functions
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   └── package.json
│
├── shared/                   # Shared types, constants
├── docs/                     # Additional documentation
└── README.md
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Migrations

```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set strong JWT secrets
- [ ] Configure SMTP for emails
- [ ] Set up AWS S3 bucket and CloudFront
- [ ] Configure Stripe production keys
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Deployment Options

**Option 1: Traditional VPS (DigitalOcean, AWS EC2)**
```bash
# Backend
pm2 start src/server.js --name clarityvid-api
pm2 start src/workers/videoProcessor.js --name clarityvid-worker

# Frontend (build and serve)
npm run build
# Serve build folder with nginx
```

**Option 2: Docker**
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

**Option 3: Cloud Platforms**
- **Backend**: Heroku, Railway, Render
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Database**: AWS RDS, DigitalOcean Managed PostgreSQL
- **Redis**: AWS ElastiCache, Redis Labs

---

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- SQL injection protection (Sequelize ORM)
- File upload restrictions
- Stripe webhook signature verification

---

## 📊 Monitoring & Analytics

### Recommended Tools

- **Application Monitoring**: New Relic, Datadog
- **Error Tracking**: Sentry
- **Logging**: Winston (included), Papertrail
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Analytics**: Mixpanel, Google Analytics

### Key Metrics to Track

- Video generation success rate
- Average processing time
- Credit consumption patterns
- User retention and churn
- API response times
- Error rates

---

## 🤝 Contributing

This is a proprietary enterprise platform. For contributions or feature requests, please contact the development team.

---

## 📝 License

Proprietary - All Rights Reserved

Copyright (c) 2025 ClarityVid AI

---

## 🆘 Support

For technical support or questions:
- **Email**: support@clarityvid.ai
- **Documentation**: https://docs.clarityvid.ai
- **Status Page**: https://status.clarityvid.ai

---

## 🎯 Roadmap

### Q1 2025
- [ ] Advanced video editing features
- [ ] Custom voice upload
- [ ] Video templates library
- [ ] Mobile app (iOS/Android)

### Q2 2025
- [ ] Advanced analytics dashboard
- [ ] A/B testing for videos
- [ ] Video collaboration features
- [ ] Webhooks for enterprise customers

### Q3 2025
- [ ] AI-powered video optimization
- [ ] Multi-language auto-translation
- [ ] Video SEO tools
- [ ] White-label platform

---

## 👥 Team

Built with ❤️ by the ClarityVid AI Team

---

## 🌟 Acknowledgments

- OpenAI for GPT-4 and TTS APIs
- Stripe for payment processing
- AWS for infrastructure
- Y Combinator for inspiration (Golpo AI)

---
## Deployment Status
Deployed to Firebase: https://exodus-48741.web.app

**ClarityVid AI** - Making video creation as easy as writing.
