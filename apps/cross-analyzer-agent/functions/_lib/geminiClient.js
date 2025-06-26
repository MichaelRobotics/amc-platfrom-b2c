// File: functions/_lib/geminiClient.js
// Description: Simplified version that returns the direct SDK response to fix timeout issues.

const { GoogleGenAI } = require("@google/genai");

let genAIInstance;

/**
 * Initializes the GoogleGenAI client if it hasn't been already.
 */
function initializeGemini(apiKey) {
    if (!genAIInstance) {
        console.log('[GeminiClient] Initializing Gemini AI client...');

        if (!apiKey) {
            console.error('[GeminiClient] CRITICAL: GEMINI_API_KEY environment variable is not set.');
            throw new Error('The GEMINI_API_KEY secret is not configured for this function.');
        }

        genAIInstance = new GoogleGenAI({ apiKey });
        console.log('[GeminiClient] Gemini AI client initialized successfully.');
    }
}

/**
 * Returns an object that can be used to generate content.
 * This function now returns the direct, unmodified response from the SDK.
 * @param {string} modelName The name of the model to use.
 * @returns {object} An object with a `generateContent` method.
 */
function getGenerativeModel(modelName, apiKey) {
    initializeGemini(apiKey);

    return {
        generateContent: async (prompt, generationConfig = {}) => {
            console.log(`[GeminiClient] Calling model ${modelName}...`);
            try {
                const result = await genAIInstance.models.generateContent({
                    model: modelName,
                    contents: [{
                        role: "user",
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: generationConfig
                });

                // --- THIS IS THE FIX ---
                // Return the entire result object directly from the SDK.
                // Do not wrap it in another { response: ... } object.
                return result;

            } catch (error) {
                console.error(`[GeminiClient] Error generating content with model ${modelName}:`, error);
                throw error;
            }
        }
    };
}

/**
 * Cleans a string that might be wrapped in Markdown code fences.
 */
function cleanPotentialJsonMarkdown(text) {
    if (typeof text !== 'string') {
        return text;
    }

    let cleanedText = text.trim();
    const markdownRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
    const match = cleanedText.match(markdownRegex);

    if (match && match[1]) {
        cleanedText = match[1].trim();
    }

    return cleanedText;
}

module.exports = {
    getGenerativeModel,
    cleanPotentialJsonMarkdown
};