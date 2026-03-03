const { callLlama } = require('../services/llamaService');

/**
 * Generate patient health summary
 */
exports.getHealthSummary = async (req, res, next) => {
  try {
    const { patientData } = req.body;

    if (!patientData) {
      return res.status(400).json({ error: 'Patient data is required' });
    }

    const prompt = `You are a medical AI assistant. Analyze this patient's health data and provide a comprehensive, easy-to-understand health summary.

Patient Data:
${JSON.stringify(patientData, null, 2)}

Create a friendly, personalized health summary that includes:
1. A warm greeting using their name
2. Key health metrics and what they mean
3. Current medications and their purposes
4. Any chronic conditions and management tips
5. Personalized health recommendations
6. Encouragement and positive reinforcement

Use simple language, emojis, and markdown formatting (## for headings, ** for bold, * for bullets).`;

    const summary = await callLlama(prompt);

    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle patient chat messages
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, patientData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt = `You are a medical AI assistant with access to this patient's complete medical history. Answer their question based ONLY on their medical data. If the question is not related to their health data, politely redirect them.

Patient Data:
${JSON.stringify(patientData, null, 2)}

Patient Question: ${message}

Provide a helpful, accurate response based on their medical records. Be friendly and use simple language.`;

    const reply = await callLlama(prompt);

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

/**
 * Translate health summary
 */
exports.translateSummary = async (req, res, next) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const languageMap = {
      hindi: 'Hindi (हिंदी)',
      telugu: 'Telugu (తెలుగు)',
      tamil: 'Tamil (தமிழ்)',
      kannada: 'Kannada (ಕನ್ನಡ)',
      malayalam: 'Malayalam (മലയാളം)',
    };

    const targetLang = languageMap[targetLanguage] || targetLanguage;

    const prompt = `Translate the following health summary to ${targetLang}. Maintain all formatting, emojis, and structure. Keep medical terms accurate.

Text to translate:
${text}

Provide ONLY the translation, no explanations.`;

    const translation = await callLlama(prompt);

    res.json({ translation });
  } catch (error) {
    next(error);
  }
};
