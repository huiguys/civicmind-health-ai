# CivicMind Health AI Platform

Enterprise-grade healthcare platform powered by AWS Bedrock AI (Google Gemma 3).

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

## 🚀 Quick Start

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
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=google.gemma-3-27b-it
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## 📦 Key Features

- **AI Health Summaries** - Personalized health insights
- **Multi-language Support** - 6 Indian languages
- **Voice Accessibility** - Text-to-speech
- **Doctor Portal** - Patient management & AI diagnostics
- **Patient Portal** - Health records & AI companion
- **ABHA Integration** - Secure health data access

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Context API

**Backend:**
- Node.js + Express
- AWS Bedrock (Gemma 3 27B)
- AWS Lambda compatible

## 📝 API Endpoints

### Patient APIs
- `POST /api/patient-health-summary` - Generate health summary
- `POST /api/chat` - Patient AI chat
- `POST /api/translate-summary` - Translate to local language

### Doctor APIs
- `POST /api/doctor-chat` - Doctor AI assistant
- `POST /api/generate-patient-overview` - Patient overview
- `POST /api/check-prescription` - Prescription safety check

## 🏢 Enterprise Architecture

This codebase follows enterprise best practices:

✅ **Feature-based organization** - Scalable module structure  
✅ **Separation of concerns** - Clear layer boundaries  
✅ **Configuration management** - Centralized config  
✅ **Error handling** - Global error middleware  
✅ **API abstraction** - Clean API client layer  
✅ **Reusable utilities** - Shared hooks and utils  
✅ **Type safety ready** - Easy TypeScript migration path  

## 📄 License

Proprietary - CivicMind Health AI Platform
