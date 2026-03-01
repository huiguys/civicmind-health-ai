const { callGemma } = require('../services/gemmaService');

/**
 * Patient AI Chatbot - Strict patient-report-only responses
 */
async function handlePatientChat(body) {
    const { message, patientData } = body;

    if (!message || !patientData) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Missing message or patient data." }) 
        };
    }

    const reportsContext = patientData.reports && patientData.reports.length > 0
        ? patientData.reports.map(r => `Date: ${r.date} | Dept: ${r.department} | Summary: ${r.summary || r.doctorNotes || 'No summary'}`).join("\n")
        : "No recent reports available";

    const systemMessage = {
        role: "system",
        content: `You are 'Heal AI', a medical assistant for patient ${patientData.name}.

PATIENT PROFILE:
- Name: ${patientData.name}
- Age: ${patientData.age}, Gender: ${patientData.gender}
- Blood Group: ${patientData.bloodGroup}
- Allergies: ${patientData.allergies ? patientData.allergies.join(", ") : "None"}
- Chronic Conditions: ${patientData.conditions ? patientData.conditions.join(", ") : "None"}
- Current Medications: ${patientData.medications ? patientData.medications.join(", ") : "None"}

MEDICAL REPORTS:
${reportsContext}

STRICT RULES:
1. ONLY answer questions about THIS patient's health based on the data above
2. If asked about anything else (weather, jokes, general topics), respond: "I can only answer questions about your health based on your medical reports. How can I help with your health concerns?"
3. Always check their allergies and conditions before giving advice
4. Warn with 🚨 if they ask about something dangerous for their condition
5. Be empathetic and encouraging
6. Keep responses concise and clear`
    };

    try {
        const reply = await callGemma([
            systemMessage,
            { role: "user", content: message }
        ], 800);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };
    } catch (error) {
        console.error("Patient Chat Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to generate AI response.", details: error.message }) 
        };
    }
}

/**
 * Doctor AI Assistant - Strict patient-report-only responses
 */
async function handleDoctorChat(body) {
    const { question, patientData } = body;

    if (!question || !patientData) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Missing question or patient data." }) 
        };
    }

    const reportsContext = patientData.reports && patientData.reports.length > 0
        ? patientData.reports.map(r => {
            let details = `\n--- ${r.type} (${r.date}) ---\n`;
            details += `Dept: ${r.department}\nSummary: ${r.summary}\n`;
            if (r.doctorNotes) details += `Notes: ${r.doctorNotes}\n`;
            if (r.fhirData && r.fhirData.result) {
                details += `Lab Results:\n`;
                r.fhirData.result.forEach(test => {
                    details += `  - ${test.testName}: ${test.value} ${test.unit} (${test.normalRange}) - ${test.interpretation}\n`;
                });
            }
            return details;
        }).join("\n")
        : "No medical reports available";

    const systemMessage = {
        role: "system",
        content: `You are a medical AI assistant for doctors.

CURRENT PATIENT:
- Name: ${patientData.name}
- Age: ${patientData.age}, Gender: ${patientData.gender}
- Blood Group: ${patientData.bloodGroup}
- Allergies: ${patientData.allergies ? patientData.allergies.join(", ") : "None"}
- Conditions: ${patientData.conditions ? patientData.conditions.join(", ") : "None"}
- Medications: ${patientData.medications ? patientData.medications.join(", ") : "None"}

MEDICAL REPORTS:
${reportsContext}

CRITICAL RULES:
1. ONLY answer questions about THIS patient based on the data above
2. If asked about anything else, respond: "I'm here to answer queries related to patient ${patientData.name}. If you want anything about their health based on their reports, I will respond."
3. Provide professional medical analysis
4. Cite specific reports and dates
5. Use medical terminology appropriately`
    };

    try {
        const reply = await callGemma([
            systemMessage,
            { role: "user", content: question }
        ], 1000);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };
    } catch (error) {
        console.error("Doctor Chat Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to generate AI response.", details: error.message }) 
        };
    }
}

/**
 * Generate AI Patient Summary
 */
async function handleGenerateSummary(body) {
    const { patientData } = body;

    if (!patientData) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Missing patient data." }) 
        };
    }

    const reportsContext = patientData.reports && patientData.reports.length > 0
        ? patientData.reports.map(r => {
            let details = `${r.type} (${r.date}): ${r.summary}`;
            if (r.fhirData && r.fhirData.result) {
                r.fhirData.result.forEach(test => {
                    if (test.status === 'high' || test.status === 'low') {
                        details += ` | ⚠️ ${test.testName}: ${test.value} (${test.status.toUpperCase()})`;
                    }
                });
            }
            return details;
        }).join("\n")
        : "No recent reports";

    const prompt = `Create a concise medical triage brief (3-4 sentences):

Patient: ${patientData.name}, ${patientData.age}yo ${patientData.gender}
Conditions: ${patientData.conditions ? patientData.conditions.join(", ") : "None"}
Medications: ${patientData.medications ? patientData.medications.join(", ") : "None"}
Allergies: ${patientData.allergies ? patientData.allergies.join(", ") : "None"}

Recent Reports:
${reportsContext}

Highlight: key conditions, critical findings, immediate concerns, treatment status.`;

    try {
        const summary = await callGemma([{ role: "user", content: prompt }], 500);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ summary })
        };
    } catch (error) {
        console.error("Summary Generation Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to generate summary.", details: error.message }) 
        };
    }
}

/**
 * Generate AI-Enhanced Patient Overview
 */
async function handleGeneratePatientOverview(body) {
    const { patientData } = body;

    if (!patientData) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Missing patient data." }) 
        };
    }

    const prompt = `You are a medical AI assistant. Analyze this patient's complete medical profile and present it in a clear, structured format for the doctor.

PATIENT DATA:
- Name: ${patientData.name}
- Age: ${patientData.age}, Gender: ${patientData.gender}
- Blood Group: ${patientData.bloodGroup}
- Allergies: ${patientData.allergies ? patientData.allergies.join(", ") : "None"}
- Chronic Conditions: ${patientData.conditions ? patientData.conditions.join(", ") : "None"}
- Current Medications: ${patientData.medications ? patientData.medications.join(", ") : "None"}

INSTRUCTIONS:
Generate a comprehensive patient overview with these sections:

1. **Critical Alerts** - Any life-threatening allergies or urgent concerns
2. **Current Health Status** - Summary of chronic conditions and their management
3. **Medication Analysis** - Current medications and their purpose
4. **Key Considerations** - Important points for treatment planning

Format your response in clear sections with bullet points. Be concise but thorough.`;

    try {
        const overview = await callGemma([{ role: "user", content: prompt }], 800);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ overview })
        };
    } catch (error) {
        console.error("Overview Generation Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to generate overview.", details: error.message }) 
        };
    }
}

/**
 * Translate Medical Report
 */
async function handleTranslateReport(body) {
    const { clinicalText, targetLanguage } = body;
    
    const prompt = `You are a compassionate medical AI. The patient's clinical report says: "${clinicalText}". 
    Translate this into simple, empathetic ${targetLanguage}. Remove scary jargon. Remind them it is treatable and to consult their doctor.`;

    try {
        const translation = await callGemma([{ role: "user", content: prompt }], 500);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ translation })
        };
    } catch (error) {
        console.error("Translation error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Translation failed", details: error.message })
        };
    }
}

/**
 * Check Prescription Safety
 */
async function handleCheckPrescription(body) {
    const { patientData, proposedMedication } = body;
    
    const prompt = `Analyze prescription safety:

Patient: ${patientData.age}yo ${patientData.gender}
Allergies: ${patientData.allergies ? patientData.allergies.join(", ") : "None"}
Conditions: ${patientData.conditions ? patientData.conditions.join(", ") : "None"}
Current Meds: ${patientData.medications ? patientData.medications.join(", ") : "None"}

Proposed: ${proposedMedication}

Respond ONLY in this JSON format:
{
    "isSafe": true,
    "alertLevel": "SAFE",
    "issues": [],
    "recommendation": "Safe to prescribe",
    "alternatives": []
}`;

    try {
        const response = await callGemma([{ role: "user", content: prompt }], 800);
        const safetyAnalysis = JSON.parse(response);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: "success",
                analysis: safetyAnalysis
            })
        };
    } catch (error) {
        console.error("Prescription check error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Safety check failed", details: error.message }) 
        };
    }
}

/**
 * Generate Patient Health Summary (for patient dashboard)
 */
async function handlePatientHealthSummary(body) {
    const { patientData } = body;

    if (!patientData) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Missing patient data." }) 
        };
    }

    const reportsContext = patientData.reports && patientData.reports.length > 0
        ? patientData.reports.map(r => `${r.type} (${r.date}): ${r.summary}`).join("\n")
        : "No recent reports";

    const prompt = `You are a friendly health AI assistant. Create a warm, easy-to-understand health summary for the patient.

PATIENT INFO:
- Name: ${patientData.name}
- Age: ${patientData.age}, Gender: ${patientData.gender}
- Blood Group: ${patientData.bloodGroup}
- Allergies: ${patientData.allergies ? patientData.allergies.join(", ") : "None"}
- Health Conditions: ${patientData.conditions ? patientData.conditions.join(", ") : "None"}
- Current Medications: ${patientData.medications ? patientData.medications.join(", ") : "None"}

RECENT MEDICAL REPORTS:
${reportsContext}

Create a friendly, encouraging health summary with these sections:

**Your Health at a Glance** 👋
[Brief overview of their current health status]

**What You Should Know** 💡
[Key health points in simple language]

**Your Care Plan** 💊
[Current medications and why they're taking them]

**Healthy Living Tips** 🌟
[Personalized lifestyle recommendations]

Use emojis, be warm and encouraging, avoid medical jargon. Make it easy to understand!`;

    try {
        const summary = await callGemma([{ role: "user", content: prompt }], 1000);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ summary })
        };
    } catch (error) {
        console.error("Patient Health Summary Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to generate health summary.", details: error.message }) 
        };
    }
}

/**
 * Analyze Food Image for Patient
 */
async function handleAnalyzeImage(body) {
    const { imageBase64, patientData } = body;

    if (!imageBase64 || !patientData) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Missing image or patient data." }) 
        };
    }

    const systemMessage = {
        role: "system",
        content: `You are a medical nutrition AI assistant analyzing food for patient ${patientData.name}.

PATIENT PROFILE:
- Age: ${patientData.age}, Gender: ${patientData.gender}
- Allergies: ${patientData.allergies ? patientData.allergies.join(", ") : "None"}
- Chronic Conditions: ${patientData.conditions ? patientData.conditions.join(", ") : "None"}
- Current Medications: ${patientData.medications ? patientData.medications.join(", ") : "None"}

TASK: Analyze the food image and provide:
1. 🍽️ **Food Identification** - What food items you see
2. ⚠️ **Health Concerns** - Any risks based on their conditions/allergies
3. ✅ **Healthier Alternatives** - Better options for their health
4. 💡 **Recommendation** - Should they eat it or not?

Be empathetic, clear, and use emojis. Focus on their specific health needs.`
    };

    const userMessage = {
        role: "user",
        content: [
            {
                type: "image",
                source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: imageBase64
                }
            },
            {
                type: "text",
                text: "Analyze this food for me. Is it safe for my health conditions?"
            }
        ]
    };

    try {
        const analysis = await callGemma([systemMessage, userMessage], 1000);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ analysis })
        };
    } catch (error) {
        console.error("Image Analysis Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to analyze image.", details: error.message }) 
        };
    }
}

/**
 * Translate Health Summary to Local Language
 */
async function handleTranslateSummary(body) {
    const { text, targetLanguage } = body;

    if (!text || !targetLanguage) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Missing text or target language." }) 
        };
    }

    const languageNames = {
        'hindi': 'Hindi (हिंदी)',
        'telugu': 'Telugu (తెలుగు)',
        'tamil': 'Tamil (தமிழ்)',
        'kannada': 'Kannada (ಕನ್ನಡ)',
        'malayalam': 'Malayalam (മലയാളം)',
        'bengali': 'Bengali (বাংলা)',
        'marathi': 'Marathi (मराठी)',
        'gujarati': 'Gujarati (ગુજરાતી)',
        'punjabi': 'Punjabi (ਪੰਜਾਬੀ)'
    };

    const prompt = `You are a medical translation AI. Translate the following health summary into ${languageNames[targetLanguage] || targetLanguage}.

IMPORTANT RULES:
1. Translate ALL text into ${targetLanguage}
2. Keep the same structure and formatting (headings, bullet points, emojis)
3. Use simple, easy-to-understand language
4. Keep medical terms accurate but explain them simply
5. Maintain the warm, encouraging tone
6. Keep emojis in the same positions

ORIGINAL TEXT (English):
${text}

TRANSLATED TEXT (${languageNames[targetLanguage] || targetLanguage}):`;

    try {
        const translation = await callGemma([{ role: "user", content: prompt }], 1500);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ translation })
        };
    } catch (error) {
        console.error("Translation Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to translate summary.", details: error.message }) 
        };
    }
}

module.exports = {
    handlePatientChat,
    handleDoctorChat,
    handleGenerateSummary,
    handleGeneratePatientOverview,
    handleTranslateReport,
    handleCheckPrescription,
    handlePatientHealthSummary,
    handleAnalyzeImage,
    handleTranslateSummary
};
