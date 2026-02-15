# Design Document: CivicMind Health AI

## Overview

CivicMind Health AI is a mobile-first healthcare feature that bridges the language gap between English ABHA medical reports and patients who speak local Indian languages. The system retrieves medical reports from India's ABHA network, translates them using AI-powered translation services, and presents them with contextual medical explanations in the patient's preferred language.

The architecture follows a serverless pattern using AWS Lambda for backend processing, API Gateway for REST endpoints, and DynamoDB for data persistence. The React Native frontend provides a cross-platform mobile experience with offline capabilities.

### Key Design Decisions

1. **Serverless Architecture**: Using AWS Lambda enables automatic scaling for varying load patterns typical of healthcare applications
2. **AI-Powered Medical Translation**: Leveraging Amazon Bedrock (Claude 3) for context-aware medical translation with empathy filtering ensures both accuracy and appropriate tone
3. **OCR for Legacy Documents**: Using AWS Textract to extract text from PDF medical reports before translation
4. **Hybrid Translation Approach**: Combining LLM-based translation with medical term preservation maintains clinical accuracy
5. **Offline-First for Saved Reports**: Local storage enables access to previously viewed reports without connectivity
6. **Temporary Server Storage**: 24-hour TTL on DynamoDB items balances functionality with privacy requirements

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Language    │  │   Report     │  │   Medical    │      │
│  │  Selector    │  │   Viewer     │  │   Context    │      │
│  │              │  │              │  │   Explainer  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Local Storage (AsyncStorage)                  │   │
│  │  - Saved Reports  - Language Preferences              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS API Gateway                           │
│              (Authentication, Rate Limiting)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     AWS Lambda Functions                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   ABHA       │  │  Translation │  │   Medical    │      │
│  │   Retrieval  │  │   Service    │  │   Context    │      │
│  │   Handler    │  │   Handler    │  │   Handler    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ ABHA Network │    │ AWS Textract │    │  DynamoDB    │
│   (External) │    │     (OCR)    │    │  (Reports)   │
└──────────────┘    └──────────────┘    └──────────────┘
                            │
                            ▼
                   ┌──────────────┐
                   │Amazon Bedrock│
                   │  (Claude 3)  │
                   │  Translation │
                   │   + Empathy  │
                   │    Filter    │
                   └──────────────┘
```

### Data Flow

1. **Report Retrieval Flow**:
   - Patient authenticates and provides ABHA credentials
   - Frontend calls `/api/reports/retrieve` endpoint
   - ABHA Retrieval Handler fetches reports from ABHA network
   - Reports stored in DynamoDB with 24-hour TTL
   - Report metadata returned to frontend

2. **Translation Flow**:
   - Patient selects report and target language
   - Frontend calls `/api/reports/translate` endpoint
   - Translation Service Handler retrieves report from DynamoDB
   - **If report is PDF format**: AWS Textract extracts raw text via OCR
   - Medical terms extracted and preserved
   - Content sent to Amazon Bedrock (Claude 3) with system prompt for:
     - Medical translation to target language
     - Empathy filtering for critical/severe diagnoses
     - Medical term preservation in format: "translated_term (original_term)"
   - Translated report with preserved terms returned to frontend

3. **Medical Context Flow**:
   - Patient taps medical term in translated report
   - Frontend calls `/api/medical/explain` endpoint
   - Medical Context Handler retrieves explanation from knowledge base
   - Simplified explanation in target language returned to frontend

## Components and Interfaces

### Frontend Components (React Native)

#### LanguageSelector Component

```typescript
interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

interface SupportedLanguage {
  code: string;        // ISO 639-1 code (e.g., "hi", "ta")
  name: string;        // Native name (e.g., "हिन्दी", "தமிழ்")
  englishName: string; // English name for reference
}

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "hi", name: "हिन्दी", englishName: "Hindi" },
  { code: "ta", name: "தமிழ்", englishName: "Tamil" },
  { code: "te", name: "తెలుగు", englishName: "Telugu" },
  { code: "bn", name: "বাংলা", englishName: "Bengali" },
  { code: "mr", name: "मराठी", englishName: "Marathi" },
  { code: "gu", name: "ગુજરાતી", englishName: "Gujarati" },
  { code: "kn", name: "ಕನ್ನಡ", englishName: "Kannada" },
  { code: "ml", name: "മലയാളം", englishName: "Malayalam" },
  { code: "pa", name: "ਪੰਜਾਬੀ", englishName: "Punjabi" },
  { code: "or", name: "ଓଡ଼ିଆ", englishName: "Odia" }
];
```

#### ReportViewer Component

```typescript
interface ReportViewerProps {
  report: TranslatedReport;
  language: string;
  onTermTap: (term: MedicalTerm) => void;
  onSaveOffline: () => void;
}

interface TranslatedReport {
  id: string;
  originalReportId: string;
  patientInfo: PatientInfo;
  sections: ReportSection[];
  translatedAt: Date;
  targetLanguage: string;
  isOffline: boolean;
}

interface ReportSection {
  title: string;
  content: string;
  medicalTerms: MedicalTerm[];
  labResults?: LabResult[];
}

interface MedicalTerm {
  original: string;      // English term
  translated: string;    // Translated term
  position: number;      // Position in text for highlighting
  hasExplanation: boolean;
}

interface LabResult {
  testName: string;
  value: number | string;
  unit: string;
  normalRange: string;
  status: "normal" | "high" | "low" | "critical";
}
```

#### MedicalContextExplainer Component

```typescript
interface MedicalContextExplainerProps {
  term: MedicalTerm;
  language: string;
  onClose: () => void;
}

interface MedicalExplanation {
  term: string;
  simplifiedExplanation: string;
  category: "condition" | "medication" | "test" | "procedure";
  relatedTerms?: string[];
}
```

### Backend API Endpoints

#### Report Retrieval API

```typescript
// POST /api/reports/retrieve
interface RetrieveReportRequest {
  abhaId: string;
  abhaToken: string;
  reportType?: string; // Optional filter
}

interface RetrieveReportResponse {
  reports: ReportMetadata[];
  retrievedAt: Date;
}

interface ReportMetadata {
  id: string;
  type: string;
  date: Date;
  provider: string;
  title: string;
}
```

#### Translation API

```typescript
// POST /api/reports/translate
interface TranslateReportRequest {
  reportId: string;
  targetLanguage: string;
  userId: string;
}

interface TranslateReportResponse {
  translatedReport: TranslatedReport;
  translationTime: number; // milliseconds
}
```

#### Medical Context API

```typescript
// POST /api/medical/explain
interface ExplainTermRequest {
  term: string;
  targetLanguage: string;
  context?: string; // Optional report context
}

interface ExplainTermResponse {
  explanation: MedicalExplanation;
}
```

### Backend Lambda Handlers

#### ABHARetrievalHandler

```typescript
interface ABHAClient {
  authenticate(abhaId: string, token: string): Promise<ABHASession>;
  fetchReports(session: ABHASession, filters?: ReportFilters): Promise<ABHAReport[]>;
}

interface ABHAReport {
  id: string;
  content: string;      // Raw report content
  metadata: ReportMetadata;
  format: "pdf" | "json" | "xml";
}

async function handleRetrieveReports(
  request: RetrieveReportRequest
): Promise<RetrieveReportResponse> {
  // 1. Authenticate with ABHA network
  // 2. Fetch reports
  // 3. Store in DynamoDB with TTL
  // 4. Return metadata
}
```

#### TranslationServiceHandler

```typescript
interface TextractService {
  extractText(pdfBuffer: Buffer): Promise<string>;
  extractStructuredData(pdfBuffer: Buffer): Promise<StructuredDocument>;
}

interface BedrockTranslationService {
  translateWithClaude(
    text: string,
    targetLang: string,
    systemPrompt: string
  ): Promise<string>;
}

interface MedicalTermExtractor {
  extractTerms(text: string): MedicalTerm[];
  preserveTerms(text: string, terms: MedicalTerm[]): string;
  restoreTerms(translatedText: string, terms: MedicalTerm[]): string;
}

async function handleTranslateReport(
  request: TranslateReportRequest
): Promise<TranslateReportResponse> {
  // 1. Retrieve report from DynamoDB
  const report = await retrieveReportFromDB(request.reportId);
  
  // 2. If PDF format, extract text using AWS Textract
  let reportText = report.content;
  if (report.format === 'pdf') {
    reportText = await textractService.extractText(report.contentBuffer);
  }
  
  // 3. Extract medical terms
  const medicalTerms = termExtractor.extractTerms(reportText);
  
  // 4. Detect critical/severe diagnoses for empathy filtering
  const hasCriticalDiagnosis = detectCriticalContent(reportText, medicalTerms);
  
  // 5. Build system prompt for Bedrock
  const systemPrompt = buildMedicalTranslationPrompt(
    request.targetLanguage,
    medicalTerms,
    hasCriticalDiagnosis
  );
  
  // 6. Translate using Amazon Bedrock (Claude 3)
  const translatedText = await bedrockService.translateWithClaude(
    reportText,
    request.targetLanguage,
    systemPrompt
  );
  
  // 7. Parse and structure translated report
  const structuredReport = parseTranslatedReport(translatedText, medicalTerms);
  
  // 8. Return translated report
  return {
    translatedReport: structuredReport,
    translationTime: Date.now() - startTime
  };
}

// System Prompt Builder for Amazon Bedrock (Claude 3)
function buildMedicalTranslationPrompt(
  targetLanguage: string,
  medicalTerms: MedicalTerm[],
  hasCriticalDiagnosis: boolean
): string {
  const languageNames = {
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia'
  };

  const basePrompt = `You are a medical translation expert specializing in translating English medical reports into ${languageNames[targetLanguage]}.

Your task is to translate the medical report while following these critical rules:

1. MEDICAL TERM PRESERVATION:
   - For all medical terms, medications, conditions, and measurements, use this format: "translated_term (original_term)"
   - Examples: "उच्च रक्तचाप (hypertension)", "क्रिएटिनिन (creatinine)"
   - Keep all numerical values and units EXACTLY as they appear in the original
   - Preserve medical abbreviations in parentheses after translation

2. ACCURACY:
   - Maintain the clinical meaning precisely
   - Do not omit any medical information
   - Preserve the structure of the report (sections, headings, tables)
   - Keep patient information fields in their original format

3. CLARITY:
   - Use simple, clear language that patients can understand
   - Avoid overly technical phrasing when a simpler translation exists
   - Maintain professional medical tone`;

  const empathyFilterAddition = hasCriticalDiagnosis ? `

4. EMPATHY FILTER (CRITICAL):
   - This report contains critical, severe, or terminal diagnoses
   - Soften the clinical tone to reduce panic and anxiety
   - Use compassionate, supportive language
   - After presenting any critical diagnosis, ALWAYS add: "कृपया अपने डॉक्टर से परामर्श करें और उनके मार्गदर्शन का पालन करें।" (Please consult your doctor and follow their guidance.)
   - Frame information in a way that encourages medical consultation rather than self-diagnosis
   - Example: Instead of "Patient has terminal cancer", use "रिपोर्ट में गंभीर स्थिति का संकेत है। कृपया तुरंत अपने डॉक्टर से विस्तृत चर्चा करें।" (The report indicates a serious condition. Please discuss in detail with your doctor immediately.)` : '';

  return basePrompt + empathyFilterAddition + `

Now translate the following medical report to ${languageNames[targetLanguage]}:`;
}

// Critical content detection
function detectCriticalContent(text: string, terms: MedicalTerm[]): boolean {
  const criticalKeywords = [
    'cancer', 'carcinoma', 'malignant', 'tumor', 'metastasis',
    'terminal', 'critical', 'severe', 'life-threatening',
    'heart failure', 'kidney failure', 'liver failure',
    'stroke', 'myocardial infarction', 'sepsis'
  ];
  
  const lowerText = text.toLowerCase();
  return criticalKeywords.some(keyword => lowerText.includes(keyword));
}
```

#### MedicalContextHandler

```typescript
interface MedicalKnowledgeBase {
  getExplanation(
    term: string,
    language: string
  ): Promise<MedicalExplanation | null>;
  searchSimilarTerms(term: string): Promise<string[]>;
}

async function handleExplainTerm(
  request: ExplainTermRequest
): Promise<ExplainTermResponse> {
  // 1. Normalize medical term
  // 2. Query knowledge base
  // 3. If not found, generate explanation using AI
  // 4. Translate explanation to target language
  // 5. Return explanation
}
```

## Data Models

### DynamoDB Tables

#### Reports Table

```typescript
interface ReportRecord {
  PK: string;              // "REPORT#{reportId}"
  SK: string;              // "METADATA"
  userId: string;          // GSI partition key
  reportId: string;
  originalContent: string; // Encrypted
  metadata: ReportMetadata;
  retrievedAt: number;     // Unix timestamp
  ttl: number;             // Unix timestamp (24 hours from retrieval)
}

// Global Secondary Index: UserReportsIndex
// PK: userId
// SK: retrievedAt
```

#### Translations Cache Table

```typescript
interface TranslationCacheRecord {
  PK: string;              // "TRANSLATION#{reportId}#{language}"
  SK: string;              // "CACHE"
  reportId: string;
  targetLanguage: string;
  translatedContent: string;
  medicalTerms: MedicalTerm[];
  translatedAt: number;
  ttl: number;             // 24 hours
}
```

#### Medical Terms Knowledge Base Table

```typescript
interface MedicalTermRecord {
  PK: string;              // "TERM#{normalizedTerm}"
  SK: string;              // "LANG#{languageCode}"
  term: string;
  language: string;
  explanation: string;
  category: string;
  relatedTerms: string[];
  lastUpdated: number;
}
```

### Local Storage Schema (React Native AsyncStorage)

```typescript
interface SavedReport {
  id: string;
  translatedReport: TranslatedReport;
  savedAt: Date;
  sizeBytes: number;
}

interface UserPreferences {
  preferredLanguage: string;
  fontSize: "small" | "medium" | "large";
  offlineReports: SavedReport[];
  totalStorageUsed: number; // bytes
}

// Storage Keys
const STORAGE_KEYS = {
  PREFERENCES: "@medical_translator:preferences",
  SAVED_REPORTS: "@medical_translator:saved_reports",
  AUTH_TOKEN: "@medical_translator:auth_token"
};
```

### Medical Term Extraction and Translation Pattern

The system uses an AI-powered approach with Amazon Bedrock (Claude 3) for medical term handling:

1. **OCR Extraction (for PDFs)**: AWS Textract extracts raw text from legacy PDF medical reports
2. **Medical Term Identification**: Extract medical terms using pattern matching and medical dictionaries
3. **Critical Content Detection**: Analyze report for critical/severe diagnoses to trigger empathy filtering
4. **Bedrock Translation**: Send text to Claude 3 with specialized system prompt that:
   - Translates medical content to target language
   - Preserves medical terms in format: `translated_term (original_term)`
   - Applies empathy filter for critical diagnoses
   - Maintains clinical accuracy and report structure

Example:
```
Original PDF: [Binary PDF content from ABHA]
After Textract: "Patient has hypertension with elevated creatinine levels."
Extracted Terms: ["hypertension", "creatinine"]
Critical Detection: false (no critical diagnosis)
Bedrock Translation (Hindi): "रोगी को उच्च रक्तचाप (hypertension) है और क्रिएटिनिन (creatinine) का स्तर बढ़ा हुआ है।"
```

Example with Empathy Filter:
```
Original: "Patient diagnosed with stage IV metastatic carcinoma."
Critical Detection: true (contains "metastatic carcinoma")
Bedrock Translation (Hindi): "रिपोर्ट में गंभीर स्थिति का संकेत है जिसमें कैंसर (carcinoma) की उन्नत अवस्था शामिल है। कृपया तुरंत अपने डॉक्टर से विस्तृत चर्चा करें और उनके मार्गदर्शन का पालन करें।"
(Translation: "The report indicates a serious condition involving advanced stage cancer (carcinoma). Please discuss in detail with your doctor immediately and follow their guidance.")
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: ABHA Report Retrieval Success

*For any* valid ABHA credentials and patient, when the ABHA network is available, retrieving reports should return a non-empty list of report metadata and store the reports in DynamoDB with a 24-hour TTL.

**Validates: Requirements 1.1, 1.2**

### Property 2: Report Metadata Completeness

*For any* set of retrieved reports, each report in the returned list should contain all required metadata fields: id, type, date, provider, and title.

**Validates: Requirements 1.4**

### Property 3: Language Preference Persistence

*For any* supported language selection, saving the preference and then retrieving it should return the same language code.

**Validates: Requirements 2.2**

### Property 4: Language Change Triggers Re-translation

*For any* currently displayed translated report, changing the language preference should result in a new translation request with the new target language.

**Validates: Requirements 2.3**

### Property 5: System Language Default Matching

*For any* device system language that matches a supported language, initializing the app without a saved preference should default to that matching language.

**Validates: Requirements 2.4**

### Property 6: Translation Produces Output

*For any* valid medical report and supported target language, requesting translation should return a translated report with content in the target language using Amazon Bedrock (Claude 3).

**Validates: Requirements 3.1**

### Property 6a: PDF OCR Extraction

*For any* medical report in PDF format, AWS Textract should successfully extract text content before translation processing.

**Validates: Requirements 3.1**

### Property 6b: Empathy Filter Application

*For any* medical report containing critical, severe, or terminal diagnoses, the translated output should include compassionate language and explicit advice to consult a doctor.

**Validates: Requirements 3.6**

### Property 7: Medical Term Preservation Format

*For any* medical report containing medical terms (medications, conditions, measurements), the translated output should preserve each term in the format "translated_term (original_term)" where numerical values and units remain exactly as in the original.

**Validates: Requirements 3.2, 3.3, 8.2, 8.3, 8.4**

### Property 8: Medical Abbreviation Expansion

*For any* medical report containing known medical abbreviations, the translation process should expand abbreviations to their full forms before translation.

**Validates: Requirements 8.5**

### Property 9: Medical Explanation Availability

*For any* medical term in a translated report, requesting an explanation should return a simplified explanation in the target language.

**Validates: Requirements 4.1**

### Property 10: Lab Value Status Classification

*For any* lab result with a value and normal range, the system should correctly classify the status as "normal", "high", "low", or "critical" based on the value's position relative to the range.

**Validates: Requirements 4.4**

### Property 11: Report Type Appropriate Explanations

*For any* medical report of a specific type (lab results, prescriptions, diagnostic reports), the explanations provided should be contextually appropriate for that report type.

**Validates: Requirements 4.5**

### Property 12: Report Structure Preservation

*For any* medical report with structured sections (headings, tables, patient info, test results), the translated report should maintain the same structure with all sections present.

**Validates: Requirements 5.1, 5.5**

### Property 13: Critical Value Highlighting

*For any* report containing lab results with critical or abnormal values, those values should be marked with appropriate visual indicators in the translated report.

**Validates: Requirements 5.3**

### Property 14: TTL Assignment for Temporary Storage

*For any* report stored in DynamoDB, the record should have a TTL value set to 24 hours (86400 seconds) from the storage timestamp.

**Validates: Requirements 6.3**

### Property 15: Authentication Required for Access

*For any* API endpoint that accesses medical reports, requests without valid authentication tokens should be rejected with an authentication error.

**Validates: Requirements 6.4**

### Property 16: Audit Logging for Report Access

*For any* successful or failed attempt to access a medical report, an audit log entry should be created with timestamp, user ID, report ID, and action result.

**Validates: Requirements 6.6, 9.5**

### Property 17: Offline Report Storage Round-Trip

*For any* translated report, saving it locally and then retrieving it should return an equivalent report with all content intact.

**Validates: Requirements 7.1, 7.2**

### Property 18: Offline Report Indicator

*For any* report loaded from local storage, the report object should have the isOffline flag set to true.

**Validates: Requirements 7.3**

### Property 19: Offline Report Deletion

*For any* saved report in local storage, deleting it should result in the report no longer being present in the saved reports list.

**Validates: Requirements 7.4**

### Property 20: Offline Storage Limits Enforcement

*For any* sequence of report save operations, the system should reject saves when either 50 reports are stored or total storage exceeds 100MB, whichever limit is reached first.

**Validates: Requirements 7.5**

### Property 21: Translation Cache Effectiveness

*For any* medical term that has been translated once, subsequent translations of the same term to the same language should use the cached translation.

**Validates: Requirements 10.4**

## Error Handling

### Error Categories

1. **Network Errors**
   - ABHA network unavailable
   - Translation service timeout
   - API Gateway errors
   - No internet connectivity

2. **Authentication Errors**
   - Invalid ABHA credentials
   - Expired authentication tokens
   - Unauthorized access attempts

3. **Translation Errors**
   - Unsupported language
   - Bedrock service timeout or throttling
   - Textract OCR failure on malformed PDFs
   - Malformed report content

4. **Storage Errors**
   - DynamoDB write failures
   - Local storage quota exceeded
   - Report not found

5. **Validation Errors**
   - Invalid report format
   - Missing required fields
   - Malformed medical data

### Error Handling Strategy

#### Frontend Error Handling

```typescript
interface ErrorResponse {
  code: string;
  message: string;
  userMessage: string;      // Localized message for display
  retryable: boolean;
  suggestedAction?: string;
}

class ErrorHandler {
  handleError(error: Error, language: string): ErrorResponse {
    // 1. Classify error type
    // 2. Log error details
    // 3. Generate user-friendly message in target language
    // 4. Determine if retryable
    // 5. Suggest action (retry, go offline, contact support)
  }
}
```

**Error Display Patterns**:
- Network errors: Show retry button and offline mode option
- Authentication errors: Redirect to login with explanation
- Translation errors: Offer original English report as fallback
- Storage errors: Suggest clearing old reports or reducing storage

#### Backend Error Handling

```typescript
class LambdaErrorHandler {
  async handleABHAError(error: ABHAError): Promise<APIResponse> {
    // Log error with context
    await logger.error("ABHA retrieval failed", {
      errorCode: error.code,
      userId: context.userId,
      timestamp: Date.now()
    });
    
    // Return structured error
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        code: error.code,
        message: error.message,
        userMessage: this.getUserMessage(error, context.language),
        retryable: error.retryable
      })
    };
  }
}
```

**Error Recovery Strategies**:
- Automatic retry with exponential backoff for transient failures
- Circuit breaker pattern for ABHA network calls
- Fallback to cached data when available
- Graceful degradation (show English report if translation fails)

### Logging and Monitoring

```typescript
interface AuditLog {
  timestamp: number;
  userId: string;
  action: string;
  resourceId: string;
  result: "success" | "failure";
  errorCode?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
}
```

**CloudWatch Metrics**:
- Translation request count and latency (Bedrock API calls)
- Textract OCR success/failure rates
- ABHA retrieval success/failure rates
- Cache hit/miss ratios
- Storage usage per user
- API error rates by endpoint
- Bedrock token usage and costs

**Alarms**:
- Translation latency > 10 seconds
- Textract OCR failure rate > 5%
- ABHA retrieval failure rate > 10%
- Lambda error rate > 5%
- DynamoDB throttling events
- Bedrock throttling or quota exceeded

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests as complementary approaches:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Together, these provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing

**Framework**: We will use `fast-check` for JavaScript/TypeScript property-based testing.

**Configuration**:
- Each property test must run a minimum of 100 iterations
- Each test must reference its design document property using a comment tag
- Tag format: `// Feature: civicmind-health-ai, Property {number}: {property_text}`

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';

describe('Medical Term Preservation', () => {
  it('should preserve medical terms in translation', () => {
    // Feature: civicmind-health-ai, Property 7: Medical Term Preservation Format
    
    fc.assert(
      fc.property(
        fc.record({
          content: fc.string(),
          medicalTerms: fc.array(fc.string()),
          targetLanguage: fc.constantFrom('hi', 'ta', 'te', 'bn')
        }),
        async (report) => {
          const translated = await translateReportWithBedrock(report);
          
          // Verify each medical term appears in format: "translated (original)"
          for (const term of report.medicalTerms) {
            expect(translated.content).toMatch(
              new RegExp(`\\w+\\s*\\(${term}\\)`)
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should apply empathy filter for critical diagnoses', () => {
    // Feature: civicmind-health-ai, Property 6b: Empathy Filter Application
    
    fc.assert(
      fc.property(
        fc.record({
          content: fc.constantFrom(
            'Patient has terminal cancer',
            'Diagnosed with severe heart failure',
            'Critical condition with metastatic carcinoma'
          ),
          targetLanguage: fc.constantFrom('hi', 'ta', 'te')
        }),
        async (report) => {
          const translated = await translateReportWithBedrock(report);
          
          // Verify empathy filter was applied
          expect(translated.content).toMatch(/consult.*doctor|डॉक्टर से परामर्श/i);
          expect(translated.hasCriticalContent).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Focus Areas**:
1. **API Endpoint Integration**: Test request/response handling for each endpoint
2. **Error Conditions**: Test specific error scenarios (network failures, invalid input, Textract failures, Bedrock timeouts)
3. **Edge Cases**: Empty reports, very long reports, special characters, malformed PDFs
4. **Authentication Flow**: Token validation, session management
5. **Local Storage Operations**: Save, retrieve, delete operations
6. **OCR Accuracy**: Test Textract extraction on various PDF formats
7. **Empathy Filter**: Test critical diagnosis detection and appropriate response generation

**Example Unit Test**:

```typescript
describe('ABHA Report Retrieval', () => {
  it('should return error when ABHA network is unavailable', async () => {
    // Mock ABHA network failure
    mockABHAClient.fetchReports.mockRejectedValue(
      new NetworkError('ABHA network unavailable')
    );
    
    const response = await handleRetrieveReports({
      abhaId: 'test-123',
      abhaToken: 'valid-token'
    });
    
    expect(response.statusCode).toBe(503);
    expect(response.body.code).toBe('ABHA_UNAVAILABLE');
    expect(response.body.retryable).toBe(true);
  });
  
  it('should extract text from PDF using Textract', async () => {
    const pdfBuffer = Buffer.from('mock-pdf-content');
    mockTextractService.extractText.mockResolvedValue('Extracted medical report text');
    
    const result = await textractService.extractText(pdfBuffer);
    
    expect(result).toBe('Extracted medical report text');
    expect(mockTextractService.extractText).toHaveBeenCalledWith(pdfBuffer);
  });
  
  it('should detect critical diagnoses correctly', () => {
    const criticalReport = 'Patient diagnosed with terminal cancer';
    const normalReport = 'Patient has mild hypertension';
    
    expect(detectCriticalContent(criticalReport, [])).toBe(true);
    expect(detectCriticalContent(normalReport, [])).toBe(false);
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 23 correctness properties must have corresponding property tests (including new properties 6a and 6b)
- **Integration Test Coverage**: All API endpoints must have integration tests
- **E2E Test Coverage**: Critical user flows (retrieve → OCR → translate → view → save)

### Testing Environments

1. **Local Development**: Mock ABHA network and AWS services
2. **CI/CD Pipeline**: Automated test execution on every commit
3. **Staging**: Integration tests against real AWS services with test ABHA accounts
4. **Production**: Synthetic monitoring and canary deployments

### Performance Testing

While not part of unit/property testing, performance requirements will be validated through:
- Load testing with 100+ concurrent users
- Latency monitoring for translation operations
- Storage performance testing for DynamoDB operations
- Mobile app performance profiling for UI responsiveness
