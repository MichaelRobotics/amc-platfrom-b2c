// File: functions/_lib/geminiClient.js
// Description: Corrected version that properly uses the Gemini SDK
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
        
        // Correct constructor - pass options object with apiKey
        genAIInstance = new GoogleGenAI({ apiKey });
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
    
    // Get the model instance from the SDK
    const model = genAIInstance.getGenerativeModel({ model: modelName });
    
    // Return an object that has a generateContent method, as expected by the handlers.
    return {
        generateContent: async (prompt, config = {}) => {
            try {
                // The SDK's generateContent method expects either a string or contents array
                const result = await model.generateContent({
                    contents: [{ 
                        role: "user", 
                        parts: [{ text: prompt }] 
                    }],
                    generationConfig: config
                });
                
                // Return an object that matches what your handlers expect
                // The SDK returns result.response.text() for the text content
                return {
                    response: {
                        text: () => result.response.text(),
                        candidates: result.response.candidates,
                        promptFeedback: result.response.promptFeedback,
                        usageMetadata: result.response.usageMetadata
                    }
                };
            } catch (error) {
                console.error('[GeminiClient] Error generating content:', error);
                throw error;
            }
        }
    };
}

/**
 * Alternative method that directly returns the SDK's model instance
 * Use this if you want to work directly with the SDK's API
 * @param {string} modelName The name of the model to use.
 * @returns {object} The SDK's generative model instance.
 */
function getDirectModel(modelName) {
    initializeGemini();
    return genAIInstance.getGenerativeModel({ model: modelName });
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
    getDirectModel,
    cleanPotentialJsonMarkdown 
};