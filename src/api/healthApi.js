import { API_BASE_URL, API_ENDPOINTS } from '../config/constants';

/**
 * Fetch patient health summary from AI
 */
export const fetchHealthSummary = async (patientData) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HEALTH_SUMMARY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ patientData }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Send chat message to AI
 */
export const sendChatMessage = async (message, patientData) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHAT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, patientData }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Translate text to target language
 */
export const translateText = async (text, targetLanguage) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TRANSLATE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, targetLanguage }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
