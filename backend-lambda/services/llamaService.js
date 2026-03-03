const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

/**
 * Call Meta Llama 4 Scout model with messages
 * @param {Array} messages - Array of message objects with role and content
 * @param {number} maxTokens - Maximum tokens to generate
 * @returns {Promise<string>} - AI response text
 */
async function callLlama(messages, maxTokens = 500) {
    try {
        const body = {
            messages: messages,
            max_tokens: maxTokens,
            temperature: 0.7
        };

        console.log(`🤖 Calling Llama 4 Scout with ${messages.length} messages, max tokens: ${maxTokens}`);

        const command = new InvokeModelCommand({
            modelId: "meta.llama4-scout-17b-instruct-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(body)
        });

        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        console.log(`✅ Llama 4 Scout responded successfully`);
        return responseBody.choices[0].message.content;
    } catch (error) {
        console.error("❌ Llama 4 Scout Service Error:", error.message);
        console.error("Error details:", error);
        throw error;
    }
}

// Keep backward compatibility
const callGemma = callLlama;

module.exports = { callLlama, callGemma };
