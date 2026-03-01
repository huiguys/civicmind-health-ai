const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

/**
 * Call Google Gemma 3 model with messages (supports text and images)
 * @param {Array} messages - Array of message objects with role and content (can include images)
 * @param {number} maxTokens - Maximum tokens to generate
 * @returns {Promise<string>} - AI response text
 */
async function callGemma(messages, maxTokens = 500) {
    try {
        const body = {
            messages: messages,
            max_tokens: maxTokens,
            temperature: 0.7
        };

        console.log(`🤖 Calling Gemma with ${messages.length} messages, max tokens: ${maxTokens}`);

        const command = new InvokeModelCommand({
            modelId: "google.gemma-3-27b-it",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(body)
        });

        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        console.log(`✅ Gemma responded successfully`);
        return responseBody.choices[0].message.content;
    } catch (error) {
        console.error("❌ Gemma Service Error:", error.message);
        console.error("Error details:", error);
        throw error;
    }
}

module.exports = { callGemma };
