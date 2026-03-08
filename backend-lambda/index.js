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
const { generateReportPDF, getCacheStats, clearPDFCache } = require('./controllers/pdfController');
const { authenticate, authorizeReportAccess } = require('./middleware/auth');
const { pdfRateLimiter } = require('./middleware/rateLimit');
const {
    createChatSession,
    addMessageToSession,
    getPatientChatSessions,
    getChatSession,
    updateSessionTitle,
    archiveChatSession
} = require('./services/dynamoDBService');

// Initialize AWS Clients
const polly = new PollyClient({ region: "us-east-1" });

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
        // CHAT HISTORY (DynamoDB)
        // ==========================================
        
        // Create new chat session
        if (path === '/api/chat-history/sessions' && event.httpMethod === 'POST') {
            const { patientId, title } = body;
            if (!patientId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Patient ID is required' })
                };
            }
            const session = await createChatSession(patientId, title);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(session)
            };
        }

        // Get all chat sessions for a patient
        if (path.match(/^\/api\/chat-history\/sessions\/[^/]+$/) && event.httpMethod === 'GET') {
            const patientId = path.split('/').pop();
            const sessions = await getPatientChatSessions(patientId);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(sessions)
            };
        }

        // Get specific chat session
        if (path.match(/^\/api\/chat-history\/session\/[^/]+$/) && event.httpMethod === 'GET') {
            const sessionId = path.split('/').pop();
            const session = await getChatSession(sessionId);
            if (!session) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Session not found' })
                };
            }
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(session)
            };
        }

        // Add message to session
        if (path.match(/^\/api\/chat-history\/session\/[^/]+\/message$/) && event.httpMethod === 'POST') {
            const pathParts = path.split('/');
            const sessionId = pathParts[pathParts.length - 2];
            const { role, content } = body;
            if (!role || !content) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Role and content are required' })
                };
            }
            const result = await addMessageToSession(sessionId, { role, content });
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        }

        // Update session title
        if (path.match(/^\/api\/chat-history\/session\/[^/]+\/title$/) && event.httpMethod === 'PUT') {
            const pathParts = path.split('/');
            const sessionId = pathParts[pathParts.length - 2];
            const { title } = body;
            if (!title) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Title is required' })
                };
            }
            const result = await updateSessionTitle(sessionId, title);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        }

        // Archive session
        if (path.match(/^\/api\/chat-history\/session\/[^/]+$/) && event.httpMethod === 'DELETE') {
            const sessionId = path.split('/').pop();
            const result = await archiveChatSession(sessionId);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        }

        // ==========================================
        // PDF GENERATION
        // ==========================================
        
        if (path === '/api/generate-report-pdf') {
            // Create mock request/response objects for middleware compatibility
            const req = {
                body,
                headers: event.headers || {},
                ip: event.requestContext?.identity?.sourceIp || 'unknown',
                user: null
            };
            
            const res = {
                statusCode: 200,
                headers: {},
                body: null,
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = JSON.stringify(data);
                    return this;
                },
                send: function(data) {
                    this.body = data;
                    return this;
                },
                setHeader: function(key, value) {
                    this.headers[key] = value;
                }
            };

            // Apply middleware chain
            try {
                // Authentication
                await new Promise((resolve, reject) => {
                    authenticate(req, res, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Authorization
                await new Promise((resolve, reject) => {
                    authorizeReportAccess(req, res, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Rate limiting
                await new Promise((resolve, reject) => {
                    pdfRateLimiter(req, res, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Generate PDF
                await generateReportPDF(req, res);

                // Return response
                return {
                    statusCode: res.statusCode,
                    headers: { ...headers, ...res.headers },
                    body: res.body,
                    isBase64Encoded: res.headers['Content-Type'] === 'application/pdf'
                };
            } catch (error) {
                return {
                    statusCode: res.statusCode || 500,
                    headers,
                    body: res.body || JSON.stringify({ error: error.message })
                };
            }
        }

        // PDF Cache Statistics
        if (path === '/api/pdf-cache-stats') {
            const req = { headers: event.headers || {} };
            const res = {
                statusCode: 200,
                body: null,
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = JSON.stringify(data);
                    return this;
                }
            };
            
            await getCacheStats(req, res);
            
            return {
                statusCode: res.statusCode,
                headers,
                body: res.body
            };
        }

        // Clear PDF Cache
        if (path === '/api/clear-pdf-cache') {
            const req = { 
                body,
                headers: event.headers || {} 
            };
            const res = {
                statusCode: 200,
                body: null,
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.body = JSON.stringify(data);
                    return this;
                }
            };
            
            await clearPDFCache(req, res);
            
            return {
                statusCode: res.statusCode,
                headers,
                body: res.body
            };
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
