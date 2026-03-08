# CivicMind Health AI Platform

> **📚 Documentation:** [System Architecture](./ARCHITECTURE.md) | [Future Roadmap](./FUTURE_ROADMAP.md)

> **🎓 Hackathon Project:** AI for Bharat Hackathon | **Status:** Prototype with Production-Ready Architecture

> **🌐 Live Demo:** [https://d23719i3vbddmf.cloudfront.net](https://d23719i3vbddmf.cloudfront.net)

Enterprise-grade healthcare platform powered by AWS Bedrock AI (Google Gemma 3 12B), AWS Polly, and AWS DynamoDB.

## ⚠️ Current Implementation Status

**Data Source:** This prototype uses FHIR R4 formatted mock data that matches ABHA's exact specification.

**Why Mock Data?**
- ABHA API access requires ABDM certification and sandbox approval
- Certification process takes 2-3 months and wasn't feasible within hackathon timeline
- Our architecture is production-ready and ABHA-compatible

**What's Real:**
- ✅ AWS Bedrock AI (Google Gemma 3 12B) - Real AI processing
- ✅ AWS Polly - Real text-to-speech in 6 Indian languages
- ✅ AWS DynamoDB - Real persistent chat history storage
- ✅ Production-grade architecture following ABDM guidelines
- ✅ FHIR R4 compliant data structure
- ✅ CloudFront CDN - Global content delivery for universal access

**Path to Production:** Integrating with real ABHA API requires only updating the data fetching layer (5-10 lines of code). All AI processing, security, and business logic remain unchanged. See [ARCHITECTURE.md](./ARCHITECTURE.md#-abha-network-integration-production-implementation) for detailed integration plan.

## 🎯 Problem Statement

Healthcare in India faces critical challenges:

1. **Language Barriers** - Medical reports are in English, but 90% of Indians prefer their native language
2. **Complex Medical Jargon** - Patients struggle to understand technical medical terminology
3. **Limited Doctor Time** - Doctors spend hours reviewing patient histories manually
4. **Accessibility Issues** - Illiterate or visually impaired patients cannot access their health data
5. **Fragmented Records** - Patient data scattered across multiple hospitals and systems
6. **Delayed Diagnosis** - Manual analysis of patient history is time-consuming and error-prone

## 💡 Our Solution

CivicMind Health AI is an intelligent healthcare companion that bridges the gap between complex medical data and patient understanding using AWS AI services.

### For Patients:
- **AI Health Summaries** - Complex medical reports converted to simple, understandable language
- **Multi-language Support** - Health information in 6 Indian languages (Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali)
- **Voice Accessibility** - AWS Polly powered text-to-speech for illiterate/visually impaired users
- **AI Health Companion** - 24/7 AI assistant to answer health questions based on your reports
- **Chat History** - Persistent conversation history stored in AWS DynamoDB with smart AI-generated titles
- **ABHA Integration Ready** - Architecture designed for seamless ABHA network integration

### For Doctors:
- **Instant Patient Overview** - AI-generated comprehensive patient summaries in seconds
- **Smart Diagnostics** - AI highlights critical findings and abnormal values
- **Prescription Safety** - AI checks for drug interactions and contraindications
- **Time Savings** - Reduce patient history review time from 15 minutes to 30 seconds
- **Better Decisions** - AI-powered insights for accurate diagnosis

## 🌟 Key Impact

- **90% Time Reduction** - Doctors spend less time on paperwork, more on patient care
- **100% Language Coverage** - Every patient understands their health in their native language
- **Universal Accessibility** - Voice features enable access for all literacy levels
- **Improved Outcomes** - Faster diagnosis and better patient understanding leads to better health outcomes
- **Cost Effective** - Reduces need for translators and multiple consultations

## 🏥 How It Works

1. **Patient Login** - Secure ABHA ID authentication
2. **Data Fetch** - Retrieve medical records from ABHA network
3. **AI Processing** - AWS Bedrock Gemma 3 27B analyzes and simplifies reports
4. **Translation** - Convert to patient's preferred language
5. **Voice Output** - AWS Polly reads reports aloud
6. **Interactive Chat** - AI answers patient questions about their health

Enterprise-grade healthcare platform powered by AWS Bedrock AI (Google Gemma 3 27B) and AWS Polly.

## 🏗️ Project Structure

### Frontend (`src/`)
```
src/
├── features/              # Feature-based modules
│   ├── auth/             # Authentication
│   │   └── AuthLogin.jsx
│   ├── patient/          # Patient portal
│   │   └── PatientDashboard.jsx
│   └── doctor/           # Doctor portal
│       ├── DoctorDashboard.jsx
│       ├── PatientDetailView.jsx
│       └── PrescriptionBuilder.jsx
├── shared/               # Shared resources
│   ├── context/         # React Context
│   │   └── PatientContext.jsx
│   ├── hooks/           # Custom hooks
│   │   └── useSpeech.js
│   └── utils/           # Utility functions
│       └── formatMarkdown.js
├── api/                 # API client layer
│   └── healthApi.js
├── config/              # Configuration
│   └── constants.js
├── data/                # Mock data
│   ├── mockData.js
│   └── abhaFhirMock.json
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

### Backend (`backend-lambda/`)
```
backend-lambda/
├── config/              # Configuration
│   ├── aws.config.js   # AWS Bedrock config
│   └── server.config.js # Server config
├── controllers/         # Request handlers
│   └── healthController.js
├── middleware/          # Express middleware
│   ├── errorHandler.js
│   └── logger.js
├── routes/              # API routes
│   └── aiRoutes.js
├── services/            # Business logic
│   └── gemmaService.js
├── index.js             # Lambda handler
├── server.js            # Local dev server
└── .env                 # Environment variables
```

## 🔗 ABHA Network Integration

### Current Status: Prototype with FHIR R4 Mock Data

This is a **prototype demonstration** built for the AI for Bharat Hackathon. We use FHIR R4 formatted mock data that exactly matches ABHA's specification.

### Why Mock Data?

**Challenge:** ABHA API access requires:
- ABDM (Ayushman Bharat Digital Mission) certification
- Security audits and compliance checks  
- Sandbox testing approval
- Timeline: 2-3 months minimum

**Our Approach:** Build production-ready architecture that works with ABHA's FHIR R4 format, making integration a simple configuration change.

### Production Integration Architecture

#### Current Implementation (Prototype):
```javascript
// src/data/abhaFhirMock.json - FHIR R4 formatted mock data
const patientData = abhaFhirMock[abhaId];
```

#### Production Implementation (5-line change):
```javascript
// Fetch from real ABHA API
const response = await fetch('https://abha-api.abdm.gov.in/v1/patients', {
  headers: {
    'Authorization': `Bearer ${abhaToken}`,
    'X-CM-ID': abhaId
  }
});
const patientData = await response.json(); // Same FHIR R4 format
```

### How It Will Work in Production:

1. **Patient Registration at Hospital Reception**
   - Reception staff enters patient's 14-digit ABHA ID
   - System sends OTP to patient's registered mobile number
   - Patient verifies OTP to authenticate

2. **Consent Management**
   - Patient grants consent for hospital to access their records
   - Consent is time-bound and purpose-specific
   - Patient can revoke consent anytime via ABHA app

3. **Data Fetching**
   - System fetches patient's complete medical history from ABHA network
   - Records are in FHIR R4 format (international healthcare standard)
   - Data includes: diagnoses, medications, lab reports, discharge summaries

4. **AI Processing (Already Implemented ✅)**
   - AWS Bedrock Gemma 3 27B analyzes the FHIR records
   - Generates patient-friendly health summaries
   - Translates to patient's preferred language
   - Highlights critical findings for doctors

5. **Display to Doctor & Patient (Already Implemented ✅)**
   - Doctor sees AI-generated patient overview in queue
   - Patient sees simplified health summary in their portal
   - Both can chat with AI about the medical records
   - Chat history persists in AWS DynamoDB

### What's Real vs Mock:

| Component | Current Status | Production Ready |
|-----------|----------------|------------------|
| **AI Processing** | ✅ Real (AWS Bedrock Gemma 3 12B) | ✅ Yes |
| **Translation** | ✅ Real (AI-powered, 6 languages) | ✅ Yes |
| **Voice** | ✅ Real (AWS Polly neural voices) | ✅ Yes |
| **Chat History** | ✅ Real (AWS DynamoDB) | ✅ Yes |
| **Architecture** | ✅ Real (FHIR R4 compliant) | ✅ Yes |
| **CDN Delivery** | ✅ Real (CloudFront global CDN) | ✅ Yes |
| **ABHA Data Fetch** | ⚠️ Mock (FHIR R4 format) | 🔄 Pending ABDM certification |
| **OTP Verification** | ⚠️ Simulated | 🔄 Pending ABHA API access |

### Production Deployment Timeline:

| Phase | Duration | Status |
|-------|----------|--------|
| **Phase 1:** Prototype | 2 weeks | ✅ Complete |
| **Phase 2:** ABHA Sandbox Integration | 2-3 weeks | 🔄 Awaiting access |
| **Phase 3:** ABDM Certification | 6-8 weeks | 📋 Documentation ready |
| **Phase 4:** Security Audit | 2-3 weeks | 📋 Architecture compliant |
| **Phase 5:** Production Deployment | 1 week | 📋 Infrastructure ready |

### Key Advantages of Our Approach:

1. **FHIR R4 Compliant:** Our data structure matches ABHA exactly
2. **Modular Architecture:** Data layer is separated from AI processing
3. **Security Ready:** Implements ABDM security guidelines
4. **Scalable:** AWS infrastructure handles production load
5. **Tested:** All AI features work with FHIR R4 data format

For detailed technical documentation on ABHA integration, see [ARCHITECTURE.md](./ARCHITECTURE.md#-abha-network-integration-production-implementation).

## 🚀 Quick Start

### Live Demo
**Access the deployed application:** [https://d23719i3vbddmf.cloudfront.net](https://d23719i3vbddmf.cloudfront.net)

**Test Credentials:**
- Patient ABHA ID: `14-1234-5678-9012`
- Doctor Login: `demo@civicmind.health`

### Prerequisites
- Node.js 18+
- AWS Account with Bedrock access
- AWS Access Keys

### Installation

1. **Clone and install dependencies:**
```bash
npm install
cd backend-lambda && npm install && cd ..
```

2. **Configure AWS credentials:**
```bash
cd backend-lambda
cp .env.example .env
# Edit .env with your AWS credentials
```

3. **Start development servers:**

Terminal 1 - Backend:
```bash
cd backend-lambda
node server.js
```

Terminal 2 - Frontend:
```bash
npm run dev
```

4. **Access the app:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🔑 Environment Variables

Create `backend-lambda/.env`:
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# AWS Bedrock Model
BEDROCK_MODEL_ID=google.gemma-3-27b-it

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Optional: Logging
LOG_LEVEL=info
```

**Important:** Make sure your AWS account has:
- AWS Bedrock access enabled
- Gemma 3 27B model access granted
- AWS Polly access enabled

## 📦 Core Features

### Patient Portal
- ✅ **AI Health Summaries** - Complex medical reports simplified by AI
- ✅ **Multi-language Translation** - 6 Indian languages (Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali)
- ✅ **Voice Accessibility** - AWS Polly text-to-speech (English & Hindi)
- ✅ **AI Health Companion** - Chat with AI about your health reports
- ✅ **Persistent Chat History** - AWS DynamoDB stores all conversations with AI-generated titles
- ✅ **Report Preview** - View formatted medical reports in-app
- ✅ **ABHA Integration Ready** - Architecture designed for ABHA network

### Doctor Portal
- ✅ **Patient Management** - View all patients and their records
- ✅ **AI Patient Overview** - Instant comprehensive patient summaries
- ✅ **Smart Diagnostics** - AI highlights critical findings
- ✅ **Prescription Builder** - AI-powered prescription safety checks
- ✅ **Report Preview** - View patient reports with abnormal values highlighted
- ✅ **AI Assistant** - Chat with AI for diagnostic support

### Technical Features
- ✅ **AWS Bedrock Integration** - Google Gemma 3 27B for text generation
- ✅ **AWS Polly Integration** - Neural voices for text-to-speech
- ✅ **AWS DynamoDB** - Persistent chat history storage with session management
- ✅ **Real-time AI Processing** - Instant health summaries and translations
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Secure Authentication** - ABHA ID based login
- ✅ **Professional UI** - Modern gradients and smooth animations
- ✅ **Production-Ready Architecture** - FHIR R4 compliant, scalable AWS infrastructure

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- TailwindCSS for modern UI
- Context API for state management
- Feature-based architecture

**Backend:**
- Node.js + Express
- AWS Bedrock (Google Gemma 3 27B) - Text generation
- AWS Polly - Text-to-speech (Neural voices)
- PDFKit - Report generation
- CORS enabled for cross-origin requests

**AI Models:**
- **Gemma 3 12B** - Health summaries, translations, chat, diagnostics
- **AWS Polly** - Joanna (English), Aditi (Hindi) voices

**Infrastructure:**
- AWS SDK v3
- AWS Lambda + API Gateway
- AWS S3 + CloudFront CDN
- AWS DynamoDB
- Environment-based configuration

## 📝 API Endpoints

### AI Services
- `POST /api/patient-health-summary` - Generate AI health summary for patients
- `POST /api/chat` - Patient AI chat (answers based on reports only)
- `POST /api/translate-summary` - Translate summary to Indian languages
- `POST /api/text-to-speech` - Convert text to speech using AWS Polly
- `POST /api/doctor-chat` - Doctor AI assistant for diagnostics
- `POST /api/generate-patient-overview` - AI-generated patient overview
- `POST /api/check-prescription` - AI prescription safety check

### Report Services
- `POST /api/generate-report` - Generate medical report preview
- `GET /api/report/:reportId` - Get cached report

### Health Check
- `GET /api/health` - Server health status

## 🏢 Enterprise Architecture

This codebase follows enterprise best practices:

✅ **Feature-based organization** - Scalable module structure  
✅ **Separation of concerns** - Clear MVC layer boundaries  
✅ **Configuration management** - Centralized AWS and server config  
✅ **Error handling** - Global error middleware with logging  
✅ **API abstraction** - Clean API client layer  
✅ **Reusable utilities** - Shared hooks and utils  
✅ **Middleware stack** - Auth, logging, rate limiting, error handling  
✅ **Service layer** - Business logic separated from controllers  
✅ **Caching system** - PDF caching for performance  
✅ **Audit logging** - Comprehensive request/response logging  

## 🎨 UI/UX Features

- Modern gradient designs
- Smooth animations and transitions
- Fullscreen-friendly layout
- Responsive design (mobile, tablet, desktop)
- Professional medical report formatting
- Color-coded abnormal values (red highlights)
- Loading states and error handling
- Accessibility-first approach

## 🔒 Security Features

- ABHA ID authentication
- AWS IAM-based access control
- Environment variable configuration
- CORS protection
- Rate limiting middleware
- Secure API endpoints
- Audit logging for compliance

## 📊 Performance Optimizations

- PDF caching system
- Efficient AI prompt engineering
- Lazy loading components
- Optimized bundle size with Vite
- CDN-ready static assets
- Lambda-compatible architecture

## 🚀 Deployment Ready

**Live Application:**
- **Frontend URL:** [https://d23719i3vbddmf.cloudfront.net](https://d23719i3vbddmf.cloudfront.net)
- **Backend API:** `https://araw74z5hf.execute-api.us-east-1.amazonaws.com/Prod/`

**Deployment Architecture:**
- Frontend: AWS S3 + CloudFront CDN (global distribution)
- Backend: AWS Lambda + API Gateway (serverless)
- Database: AWS DynamoDB (NoSQL, serverless)
- AI: AWS Bedrock (Gemma 3 12B)
- Voice: AWS Polly (Neural TTS)

**Features:**
- Environment-based configuration
- Lambda-compatible backend
- Production build scripts
- Health check endpoints
- Error monitoring ready
- Scalable architecture
- Global CDN delivery

## 📚 Additional Documentation

Explore detailed technical documentation:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture, ABHA integration workflow, AWS security framework, and compliance details
- **[FUTURE_ROADMAP.md](./FUTURE_ROADMAP.md)** - Future enhancements including hospital administration AI, doctor co-pilot features, and patient ecosystem innovations
- **[DEPLOY.md](./DEPLOY.md)** - Step-by-step AWS deployment guide for developers

## 👥 Team

**Team CivicMind:**
- Srinivasa PM
- Nidith VS
- Ria
- Spandana

**Vision:** Transforming healthcare through AI-powered intelligence, one patient at a time.

## 📄 License

Proprietary - CivicMind Health AI Platform
