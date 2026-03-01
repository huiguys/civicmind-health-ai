require('dotenv').config();

module.exports = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  bedrock: {
    modelId: process.env.BEDROCK_MODEL_ID || 'google.gemma-3-27b-it',
  },
};
