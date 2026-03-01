# CivicMind Health AI - System Architecture

## 🏗️ Complete System Architecture

```mermaid
graph TB
    subgraph "External Systems"
        ABHA[("🏥 ABHA Network<br/>(Ayushman Bharat)<br/>National Health Records")]
        Hospital[("🏨 Hospital Network<br/>Reception System<br/>Patient Queue")]
        AWS[("☁️ AWS Cloud<br/>Bedrock AI<br/>Gemma 3 27B")]
    end

    subgraph "CivicMind Platform"
        subgraph "Frontend - React App"
            Landing["🏠 Landing Page<br/>Portal Selection"]
            PatientAuth["🔐 Patient Login<br/>ABHA ID + OTP"]
            DoctorAuth["🔐 Doctor Login<br/>Email + Password"]
            
            subgraph "Patient Portal"
                PatientDash["📊 Patient Dashboard<br/>Health Overview"]
                HealthSummary["🤖 AI Health Summary<br/>Multi-language"]
                ChatBot["💬 AI Health Companion<br/>Q&A Based on Records"]
                Records["📋 Medical Records<br/>Reports & History"]
            end
            
            subgraph "Doctor Portal"
                DoctorDash["👨‍⚕️ Doctor Dashboard<br/>Patient Queue"]
                PatientDetail["📄 Patient Detail View<br/>Complete Medical History"]
                AIAssist["🤖 AI Clinical Assistant<br/>Diagnosis Support"]
                Prescription["💊 Prescription Builder<br/>Safety Checks"]
            end
        end
        
        subgraph "Backend - Node.js + Express"
            API["🔌 API Gateway<br/>Express Server<br/>Port 3001"]
            
            subgraph "Controllers"
                HealthCtrl["Health Controller<br/>Summary, Chat, Translation"]
            end
            
            subgraph "Services"
                GemmaService["Gemma AI Service<br/>AWS Bedrock Integration"]
            end
            
            subgraph "Middleware"
                Auth["Authentication<br/>ABHA Verification"]
                Logger["Request Logger"]
                ErrorHandler["Error Handler"]
            end
        end
    end

    %% Patient Flow
    Landing -->|Patient Portal| PatientAuth
    PatientAuth -->|ABHA ID Verification| ABHA
    ABHA -->|Patient Records| PatientAuth
    PatientAuth -->|Success| PatientDash
    PatientDash --> HealthSummary
    PatientDash --> ChatBot
    PatientDash --> Records
    
    %% Doctor Flow
    Landing -->|Doctor Portal| DoctorAuth
    DoctorAuth -->|Hospital Auth| Hospital
    Hospital -->|Patient Queue| DoctorAuth
    DoctorAuth -->|Success| DoctorDash
    DoctorDash --> PatientDetail
    PatientDetail --> AIAssist
    PatientDetail --> Prescription
    
    %% Backend Connections
    HealthSummary -->|API Request| API
    ChatBot -->|API Request| API
    AIAssist -->|API Request| API
    Prescription -->|Safety Check| API
    
    API --> Auth
    Auth --> Logger
    Logger --> HealthCtrl
    HealthCtrl --> GemmaService
    GemmaService -->|AI Inference| AWS
    AWS -->|AI Response| GemmaService
    GemmaService --> HealthCtrl
    HealthCtrl --> ErrorHandler
    
    %% Data Sync
    PatientDetail -->|Fetch Records| ABHA
    Prescription -->|Update Records| ABHA
    DoctorDash -->|Queue Status| Hospital
    
    style ABHA fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Hospital fill:#2196F3,stroke:#1565C0,color:#fff
    style AWS fill:#FF9800,stroke:#E65100,color:#fff
    style API fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style GemmaService fill:#FF5722,stroke:#D84315,color:#fff
```

## 🔄 Data Flow Diagrams

### Patient Journey Flow

```mermaid
sequenceDiagram
    participant P as 👤 Patient
    participant App as CivicMind App
    participant ABHA as 🏥 ABHA Network
    participant AI as 🤖 AWS Bedrock AI

    P->>App: Enter ABHA ID
    App->>ABHA: Request OTP
    ABHA->>P: Send OTP to Mobile
    P->>App: Enter OTP
    App->>ABHA: Verify OTP
    ABHA->>App: ✅ Authentication Success
    ABHA->>App: Send Patient Records (FHIR Format)
    
    App->>AI: Generate Health Summary
    AI->>App: Personalized Summary
    App->>P: Display Dashboard
    
    P->>App: Ask Health Question
    App->>AI: Query with Patient Context
    AI->>App: Answer Based on Records
    App->>P: Display Response
    
    P->>App: Request Translation
    App->>AI: Translate to Local Language
    AI->>App: Translated Content
    App->>P: Display in Hindi/Telugu/etc
```

### Doctor Workflow Flow

```mermaid
sequenceDiagram
    participant D as 👨‍⚕️ Doctor
    participant App as CivicMind App
    participant Hospital as 🏨 Hospital System
    participant ABHA as 🏥 ABHA Network
    participant AI as 🤖 AWS Bedrock AI

    D->>App: Login with Credentials
    App->>Hospital: Verify Doctor
    Hospital->>App: ✅ Authentication Success
    Hospital->>App: Send Patient Queue
    App->>D: Display Queue
    
    D->>App: Select Patient
    App->>ABHA: Fetch Patient Records
    ABHA->>App: Complete Medical History
    App->>AI: Generate Patient Overview
    AI->>App: Clinical Summary
    App->>D: Display Patient Details
    
    D->>App: Ask Clinical Question
    App->>AI: Query with Patient Data
    AI->>App: Clinical Insights
    App->>D: Display Analysis
    
    D->>App: Create Prescription
    App->>AI: Check Drug Interactions
    AI->>App: Safety Analysis
    App->>D: Show Warnings/Approval
    D->>App: Confirm Prescription
    App->>ABHA: Update Patient Records
    ABHA->>App: ✅ Records Updated
```

## 🏛️ System Components

### 1. **ABHA Network Integration**
- **Purpose**: National health records repository
- **Data Format**: FHIR (Fast Healthcare Interoperability Resources)
- **Authentication**: ABHA ID + OTP verification
- **Operations**:
  - Fetch patient medical history
  - Update prescriptions and diagnoses
  - Sync lab reports
  - Store consultation notes

### 2. **Hospital Network Integration**
- **Purpose**: Local hospital management system
- **Functions**:
  - Patient registration at reception
  - Queue management
  - Doctor authentication
  - Appointment scheduling
  - Emergency patient handling

### 3. **AWS Bedrock AI (Gemma 3 27B)**
- **Purpose**: AI-powered medical intelligence
- **Capabilities**:
  - Generate patient health summaries
  - Answer health questions (patient-specific)
  - Provide clinical decision support
  - Check prescription safety
  - Translate medical content to 6+ languages
  - Analyze patient trends

### 4. **CivicMind Application**
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Architecture**: Feature-based modular design
- **Security**: ABHA-compliant encryption

## 🔐 Security & Compliance

```mermaid
graph LR
    subgraph "Security Layers"
        A[ABHA Authentication] --> B[Encrypted Data Transfer]
        B --> C[Role-Based Access Control]
        C --> D[Audit Logging]
        D --> E[HIPAA Compliance]
    end
    
    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#9C27B0,color:#fff
    style E fill:#F44336,color:#fff
```

### Security Features:
1. **ABHA Authentication**: Government-verified identity
2. **OTP Verification**: Two-factor authentication
3. **Encrypted Communication**: TLS/SSL for all data transfer
4. **Role-Based Access**: Separate patient/doctor permissions
5. **Audit Trail**: All actions logged for compliance
6. **Data Privacy**: HIPAA and ABDM guidelines

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Modern UI framework |
| **Styling** | TailwindCSS | Responsive design |
| **Backend** | Node.js + Express | API server |
| **AI Engine** | AWS Bedrock (Gemma 3 27B) | Medical AI |
| **Health Records** | ABHA Network (FHIR) | National health data |
| **Hospital System** | REST API Integration | Queue management |
| **Authentication** | ABHA ID + OTP | Secure login |
| **Deployment** | AWS Lambda + S3 | Serverless architecture |

## 🌐 Network Architecture

```mermaid
graph TB
    subgraph "Internet"
        Users["👥 Users<br/>Patients & Doctors"]
    end
    
    subgraph "AWS Cloud"
        CloudFront["CloudFront CDN<br/>Static Assets"]
        Lambda["Lambda Functions<br/>API Backend"]
        Bedrock["Bedrock AI<br/>Gemma 3 27B"]
        S3["S3 Bucket<br/>Frontend Hosting"]
    end
    
    subgraph "External APIs"
        ABHA_API["ABHA Gateway<br/>Health Records API"]
        Hospital_API["Hospital API<br/>Queue Management"]
    end
    
    Users -->|HTTPS| CloudFront
    CloudFront --> S3
    Users -->|API Calls| Lambda
    Lambda --> Bedrock
    Lambda --> ABHA_API
    Lambda --> Hospital_API
    
    style CloudFront fill:#FF9800,color:#fff
    style Lambda fill:#4CAF50,color:#fff
    style Bedrock fill:#F44336,color:#fff
    style S3 fill:#2196F3,color:#fff
```

## 🚀 Deployment Flow

```mermaid
graph LR
    A[Developer] -->|Push Code| B[GitHub]
    B -->|CI/CD| C[AWS CodePipeline]
    C -->|Build| D[Frontend Build]
    C -->|Deploy| E[Lambda Functions]
    D -->|Upload| F[S3 + CloudFront]
    E -->|Update| G[API Gateway]
    F -->|Serve| H[Users]
    G -->|API| H
    
    style A fill:#4CAF50,color:#fff
    style B fill:#333,color:#fff
    style C fill:#FF9800,color:#fff
    style F fill:#2196F3,color:#fff
    style G fill:#9C27B0,color:#fff
```

## 📱 User Interfaces

### Patient Portal Features:
- 🏠 Health overview dashboard
- 🤖 AI health summary (multi-language)
- 💬 AI health companion chatbot
- 📋 Medical records viewer
- 🔊 Voice accessibility (text-to-speech)
- 🌐 6 language support

### Doctor Portal Features:
- 👥 Patient queue management
- 📊 AI-generated patient briefs
- 🤖 Clinical decision support
- 💊 Smart prescription builder
- ⚠️ Drug interaction warnings
- 📝 Consultation notes

## 🔄 Real-time Updates

The system maintains real-time synchronization:
- **ABHA Network**: Bi-directional sync for health records
- **Hospital System**: Live patient queue updates
- **AI Processing**: Sub-second response times
- **Multi-device**: Sync across patient/doctor devices

---

**Built with ❤️ for Indian Healthcare**  
*Powered by ABHA Network & AWS Bedrock AI*
