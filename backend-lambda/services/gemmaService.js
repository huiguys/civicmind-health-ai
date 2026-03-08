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
        // Gemma requires alternating user/assistant roles
        // Merge system message into first user message
        const systemMessage = messages.find(m => m.role === 'system');
        const otherMessages = messages.filter(m => m.role !== 'system');
        
        let formattedMessages = [];
        
        if (systemMessage && otherMessages.length > 0 && otherMessages[0].role === 'user') {
            // Prepend system message to first user message
            formattedMessages.push({
                role: 'user',
                content: `${systemMessage.content}\n\n${otherMessages[0].content}`
            });
            formattedMessages.push(...otherMessages.slice(1));
        } else if (systemMessage) {
            // If no user message, create one with system content
            formattedMessages.push({
                role: 'user',
                content: systemMessage.content
            });
            formattedMessages.push(...otherMessages);
        } else {
            formattedMessages = otherMessages;
        }
        
        const body = {
            messages: formattedMessages,
            max_tokens: maxTokens,
            temperature: 0.7,
            top_p: 0.9
        };

        console.log(`🤖 Calling Gemma 3 12B with ${formattedMessages.length} messages, max tokens: ${maxTokens}`);

        const command = new InvokeModelCommand({
            modelId: "google.gemma-3-12b-it",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(body)
        });

        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        console.log(`✅ Gemma responded successfully`);
        console.log("Response body:", JSON.stringify(responseBody));
        
        // Extract the response text - try different possible formats
        if (responseBody.choices && responseBody.choices.length > 0) {
            return responseBody.choices[0].message.content;
        } else if (responseBody.outputs && responseBody.outputs.length > 0) {
            return responseBody.outputs[0].text;
        } else if (responseBody.completion) {
            return responseBody.completion;
        } else if (responseBody.generated_text) {
            return responseBody.generated_text;
        } else if (responseBody.content) {
            return responseBody.content;
        } else {
            console.error("Unexpected response format:", responseBody);
            throw new Error("Unexpected response format from Gemma");
        }
    } catch (error) {
        console.error("❌ Gemma Service Error:", error.message);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
    }
}

module.exports = { callGemma };
