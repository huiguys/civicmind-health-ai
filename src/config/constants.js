// API Configuration
export const API_BASE_URL = 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH_SUMMARY: '/api/patient-health-summary',
  CHAT: '/api/chat',
  TRANSLATE: '/api/translate-summary',
  ANALYZE_IMAGE: '/api/analyze-image',
};

// Supported Languages
export const LANGUAGES = {
  ENGLISH: 'english',
  HINDI: 'hindi',
  TELUGU: 'telugu',
  TAMIL: 'tamil',
  KANNADA: 'kannada',
  MALAYALAM: 'malayalam',
};

export const LANGUAGE_OPTIONS = [
  { code: LANGUAGES.ENGLISH, label: 'English', flag: '🇬🇧' },
  { code: LANGUAGES.HINDI, label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: LANGUAGES.TELUGU, label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: LANGUAGES.TAMIL, label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: LANGUAGES.KANNADA, label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: LANGUAGES.MALAYALAM, label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
];

// Test ABHA IDs
export const TEST_ABHA_IDS = [
  { id: '14-1234-5678-9012', name: 'Rahul Sharma' },
  { id: '14-9876-5432-1098', name: 'Priya Patel' },
  { id: '14-4567-8901-2345', name: 'Vikram Singh' },
];
