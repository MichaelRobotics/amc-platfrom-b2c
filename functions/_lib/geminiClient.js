// File: functions/_lib/geminiClient.js
// Description: Final corrected version that uses the Gemini SDK according to the documentation.

const { GoogleGenAI } = require("@google/genai");

let genAIInstance;

/**
 * Initializes the GoogleGenAI client if it hasn't been already.
 * This "lazy initialization" prevents cold start crashes if secrets aren't ready.
 */
function initializeGemini() {
    // Only initialize once
    if (!genAIInstance) {
        console.log('[GeminiClient] Initializing Gemini AI client...');
        const apiKey = process.env.GEMINI_API_KEY;

        // Throw a clear error if the API key is missing
        if (!apiKey) {
            console.error('[GeminiClient] CRITICAL: GEMINI_API_KEY environment variable is not set.');
            throw new Error('The GEMINI_API_KEY secret is not configured for this function.');
        }
        
        genAIInstance = new GoogleGenAI(apiKey);
        console.log('[GeminiClient] Gemini AI client initialized successfully.');
    }
}


/**
 * Returns an object that can be used to generate content with a specific model.
 * This now correctly uses the underlying SDK's methods.
 * @param {string} modelName The name of the model to use.
 * @returns {object} An object with a `generateContent` method.
 */
function getGenerativeModel(modelName) {
    initializeGemini(); // Ensure client is initialized before use.
    
    // Return an object that has a generateContent method, as expected by the handlers.
    return {
        generateContent: async (prompt, config = {}) => {
            // The actual SDK call is to `genAIInstance.models.generateContent`
            const result = await genAIInstance.models.generateContent({
                model: modelName,
                // The prompt is the first argument, which we assume is a string.
                // The official SDK takes a `contents` array, so we wrap the prompt.
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: config
            });
            // Return the entire result object, as the handlers expect a .response property on it.
            return result;
        }
    };
}

/**
 * Cleans a string that might be wrapped in Markdown code fences.
 * @param {string} text The text to clean.
 * @returns {string} The cleaned text, more likely to be valid JSON.
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
