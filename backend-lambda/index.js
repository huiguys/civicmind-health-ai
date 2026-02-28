const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const { TextractClient, DetectDocumentTextCommand } = require("@aws-sdk/client-textract");

// Initialize AWS Clients (Make sure your AWS credentials are set in your environment)
const awsConfig = {
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const polly = new PollyClient({ region: "ap-south-1" }); // Mumbai region for Indian voices
const textract = new TextractClient({ region: "ap-south-1" });

exports.handler = async (event) => {
    // Basic router for our API Gateway
    const path = event.rawPath || event.path;
    const body = event.body ? JSON.parse(event.body) : {};

    try {
        // ==========================================
        // ROUTE 1: MOCK ABHA GATEWAY (HIP)
        // ==========================================
        if (path === '/api/get-abha-record') {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    status: "success",
                    abhaId: body.abhaId,
                    data: {
                        general: { bloodGroup: "O+", allergies: ["Penicillin"] },
                        sensitive: { chronicConditions: ["Hypertension Grade 1", "Type 2 Diabetes"] }
                    }
                })
            };
        }

        // ==========================================
        // ROUTE 2: EMPATHY FILTER (BEDROCK / CLAUDE 3)
        // ==========================================
        if (path === '/api/translate-report') {
            const { clinicalText, targetLanguage } = body;
            
            const prompt = `You are a compassionate medical AI. The patient's clinical report says: "${clinicalText}". 
            Translate this into simple, empathetic ${targetLanguage}. Remove scary jargon. Remind them it is treatable and to consult their doctor.`;

            const bedrockParams = {
                modelId: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
                contentType: "application/json",
                accept: "application/json",
                body: JSON.stringify({
                    anthropic_version: "bedrock-2023-05-31",
                    max_tokens: 500,
                    messages: [{ role: "user", content: prompt }]
                })
            };

            const command = new InvokeModelCommand(bedrockParams);
            const response = await bedrock.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));

            return {
                statusCode: 200,
                body: JSON.stringify({ translation: responseBody.content[0].text })
            };
        }

        // ==========================================
        // ROUTE 3: VOICE ACCESSIBILITY (AMAZON POLLY)
        // ==========================================
        if (path === '/api/generate-audio') {
            const { text, language } = body;
            
            // Use 'Aditi' for Hindi/Indian English, 'Joanna' for standard English
            const voiceId = language === 'hindi' ? 'Aditi' : 'Joanna';

            const pollyParams = {
                OutputFormat: "mp3",
                Text: text,
                VoiceId: voiceId,
                LanguageCode: language === 'hindi' ? 'hi-IN' : 'en-US'
            };

            const command = new SynthesizeSpeechCommand(pollyParams);
            const response = await polly.send(command);

            // Convert audio stream to base64 so frontend can play it easily
            const audioChunks = [];
            for await (const chunk of response.AudioStream) {
                audioChunks.push(chunk);
            }
            const audioBase64 = Buffer.concat(audioChunks).toString('base64');

            return {
                statusCode: 200,
                body: JSON.stringify({ audioBase64: `data:audio/mp3;base64,${audioBase64}` })
            };
        }

        // ==========================================
        // ROUTE 4: NUTRI-SCANNER (CLAUDE 3 VISION)
        // ==========================================
        if (path === '/api/analyze-food') {
            const { imageBase64, patientHistory } = body;
            
            const prompt = `You are a medical diet analyzer. The patient's history shows: ${patientHistory}. 
            Look at this food image. Identify the food. If it is dangerous for their specific condition, issue a RED ALERT, explain why, and suggest a healthy Indian alternative.`;

            const bedrockParams = {
                modelId: "us.anthropic.claude-sonnet-4-6",
                contentType: "application/json",
                accept: "application/json",
                body: JSON.stringify({
                    anthropic_version: "bedrock-2023-05-31",
                    max_tokens: 500,
                    messages: [{
                        role: "user",
                        content: [
                            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
                            { type: "text", text: prompt }
                        ]
                    }]
                })
            };

            const command = new InvokeModelCommand(bedrockParams);
            const response = await bedrock.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));

            return {
                statusCode: 200,
                body: JSON.stringify({ analysis: responseBody.content[0].text })
            };
        }

        // ==========================================
        // ROUTE 5: AUTO-SYNC LIMS (AWS TEXTRACT)
        // ==========================================
        if (path === '/api/webhook/lab-result-ready') {
            // In a real scenario, this gets a PDF from an S3 bucket uploaded by the hospital
            // We simulate the Textract call here for the demo
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Lab Result Intercepted successfully.",
                    textractStatus: "Digitized",
                    fhirSync: "Pushed to ABHA Network",
                    mockExtractedText: "Patient Name: Rahul Sharma. HbA1c: 7.2%."
                })
            };
        }

        // Fallback for unknown routes
        return { statusCode: 404, body: "Route not found in CivicMind API." };

    } catch (error) {
        console.error("CivicMind API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
};