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
    'english': { VoiceId: 'Joanna', LanguageCode: 'en-US', Engine: 'neural', supported: true },
    'hindi': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard', supported: true },
    'telugu': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard', supported: false, name: 'Telugu' },
    'tamil': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard', supported: false, name: 'Tamil' },
    'kannada': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard', supported: false, name: 'Kannada' },
    'malayalam': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard', supported: false, name: 'Malayalam' },
  };

  const voiceConfig = voiceMap[language] || voiceMap['english'];

  // If language is not fully supported, ONLY say the "coming soon" message
  let finalText = text;
  if (!voiceConfig.supported && language !== 'english') {
    const languageName = voiceConfig.name || language;
    finalText = `Voice support for ${languageName} is coming soon.`;
  }

  // Clean text for speech - Remove HTML, markdown, and emojis
  const cleanText = finalText
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/\*/g, '') // Remove italic markdown
    .replace(/##/g, '') // Remove heading markdown
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '') // Remove all emojis
    .replace(/[\u{2600}-\u{27BF}]/gu, '') // Remove misc symbols & dingbats
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Polly has a 3000 character limit for plain text
  const truncatedText = cleanText.substring(0, 3000);

  if (!truncatedText || truncatedText.length === 0) {
    throw new Error('No text to convert to speech after cleaning');
  }

  console.log(`🔊 Converting ${truncatedText.length} characters to speech in ${language}`);

  const params = {
    OutputFormat: "mp3",
    Text: truncatedText,
    VoiceId: voiceConfig.VoiceId,
    LanguageCode: voiceConfig.LanguageCode,
    Engine: voiceConfig.Engine,
    TextType: "text" // Use plain text for faster processing
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

    console.log(`✅ Speech generated successfully (${audioBuffer.length} bytes)`);

    return `data:audio/mp3;base64,${audioBase64}`;
  } catch (error) {
    console.error('❌ Polly TTS Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode
    });
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

module.exports = {
  textToSpeech
};
