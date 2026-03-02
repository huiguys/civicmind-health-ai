const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const {
    handlePatientChat,
    handleDoctorChat,
    handleGenerateSummary,
    handleGeneratePatientOverview,
    handleTranslateReport,
    handleCheckPrescription,
    handlePatientHealthSummary,
    handleAnalyzeImage,
    handleTranslateSummary,
    handleTextToSpeech
} = require('./routes/aiRoutes');

// Initialize AWS Clients
const polly = new PollyClient({ region: "ap-south-1" });

exports.handler = async (event) => {
    const path = event.rawPath || event.path;
    const body = event.body ? JSON.parse(event.body) : {};

    const headers = { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
    };

    try {
        // ==========================================
        // AI ROUTES
        // ==========================================
        
        if (path === '/api/chat') {
            const result = await handlePatientChat(body);
            return { ...result, headers };
        }

        if (path === '/api/doctor-chat') {
            const result = await handleDoctorChat(body);
            return { ...result, headers };
        }

        if (path === '/api/generate-patient-summary') {
            const result = await handleGenerateSummary(body);
            return { ...result, headers };
        }

        if (path === '/api/generate-patient-overview') {
            const result = await handleGeneratePatientOverview(body);
            return { ...result, headers };
        }

        if (path === '/api/patient-health-summary') {
            const result = await handlePatientHealthSummary(body);
            return { ...result, headers };
        }

        if (path === '/api/translate-report') {
            const result = await handleTranslateReport(body);
            return { ...result, headers };
        }

        if (path === '/api/check-prescription') {
            const result = await handleCheckPrescription(body);
            return { ...result, headers };
        }

        if (path === '/api/analyze-image') {
            const result = await handleAnalyzeImage(body);
            return { ...result, headers };
        }

        if (path === '/api/translate-summary') {
            const result = await handleTranslateSummary(body);
            return { ...result, headers };
        }

        if (path === '/api/text-to-speech') {
            const result = await handleTextToSpeech(body);
            return { ...result, headers };
        }

        // ==========================================
        // MOCK ABHA GATEWAY
        // ==========================================
        
        if (path === '/api/get-abha-record') {
            return {
                statusCode: 200,
                headers,
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
        // VOICE ACCESSIBILITY (AMAZON POLLY)
        // ==========================================
        
        if (path === '/api/generate-audio') {
            const { text, language } = body;
            const voiceId = language === 'hindi' ? 'Aditi' : 'Joanna';

            const pollyParams = {
                OutputFormat: "mp3",
                Text: text,
                VoiceId: voiceId,
                LanguageCode: language === 'hindi' ? 'hi-IN' : 'en-US'
            };

            const command = new SynthesizeSpeechCommand(pollyParams);
            const response = await polly.send(command);

            const audioChunks = [];
            for await (const chunk of response.AudioStream) {
                audioChunks.push(chunk);
            }
            const audioBase64 = Buffer.concat(audioChunks).toString('base64');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ audioBase64: `data:audio/mp3;base64,${audioBase64}` })
            };
        }

        // ==========================================
        // FOOD SCANNER (DISABLED - Gemma doesn't support vision)
        // ==========================================
        
        if (path === '/api/analyze-food') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    analysis: "🔧 Food scanner temporarily unavailable. This feature requires vision-capable AI models. Please consult your doctor about dietary restrictions based on your conditions." 
                })
            };
        }

        // ==========================================
        // OTP VERIFICATION
        // ==========================================
        
        if (path === '/api/verify-sensitive-access') {
            const { otp } = body;
            
            if (otp && otp.length === 6) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        status: "success",
                        message: "Sensitive records access granted",
                        accessGranted: true,
                        expiresIn: 300
                    })
                };
            }
            
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    status: "error",
                    message: "Invalid OTP",
                    accessGranted: false
                })
            };
        }

        // ==========================================
        // DOCTOR OVERRIDE
        // ==========================================
        
        if (path === '/api/override-prescription') {
            const { consentObtained } = body;
            
            if (!consentObtained) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        status: "error",
                        message: "Patient consent required for override"
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: "success",
                    message: "Prescription approved with doctor override",
                    overrideId: `OVR-${Date.now()}`
                })
            };
        }

        // ==========================================
        // LAB SYNC WEBHOOK
        // ==========================================
        
        if (path === '/api/webhook/lab-result-ready') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: "Lab Result Intercepted successfully.",
                    textractStatus: "Digitized",
                    fhirSync: "Pushed to ABHA Network",
                    mockExtractedText: "Patient Name: Rahul Sharma. HbA1c: 7.2%."
                })
            };
        }

        // Fallback for unknown routes
        return { 
            statusCode: 404, 
            headers,
            body: JSON.stringify({ error: "Route not found" })
        };

    } catch (error) {
        console.error("API Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
};
