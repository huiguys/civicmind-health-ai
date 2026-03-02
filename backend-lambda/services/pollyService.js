const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const awsConfig = require('../config/aws.config');

// Initialize Polly Client
const polly = new PollyClient({
  region: awsConfig.region,
  credentials: awsConfig.credentials
});

/**
 * Convert text to speech using AWS Polly
 * @param {string} text - Text to convert
 * @param {string} language - Target language (english, hindi, telugu, tamil, etc.)
 * @returns {Promise<string>} Base64 encoded audio
 */
async function textToSpeech(text, language = 'english') {
  // Map languages to Polly voices
  const voiceMap = {
    'english': { VoiceId: 'Joanna', LanguageCode: 'en-US', Engine: 'neural' },
    'hindi': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' },
    'telugu': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' }, // Fallback to Hindi
    'tamil': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' }, // Fallback to Hindi
    'kannada': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' }, // Fallback to Hindi
    'malayalam': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' }, // Fallback to Hindi
  };

  const voiceConfig = voiceMap[language] || voiceMap['english'];

  // Clean text for speech (remove HTML tags and markdown)
  const cleanText = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/\*/g, '') // Remove italic markdown
    .replace(/##/g, '') // Remove heading markdown
    .substring(0, 3000); // Polly has a 3000 character limit

  const params = {
    OutputFormat: "mp3",
    Text: cleanText,
    VoiceId: voiceConfig.VoiceId,
    LanguageCode: voiceConfig.LanguageCode,
    Engine: voiceConfig.Engine
  };

  try {
    const command = new SynthesizeSpeechCommand(params);
    const response = await polly.send(command);

    // Convert audio stream to base64
    const audioChunks = [];
    for await (const chunk of response.AudioStream) {
      audioChunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(audioChunks);
    const audioBase64 = audioBuffer.toString('base64');

    return `data:audio/mp3;base64,${audioBase64}`;
  } catch (error) {
    console.error('❌ Polly TTS Error:', error);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

module.exports = {
  textToSpeech
};
