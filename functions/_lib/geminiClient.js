// File: functions/_lib/geminiClient.js
// Description: Initializes and exports the Google Generative AI client and utility functions.
// Uses Firebase Functions config for the API key and the new @google/genai package.

// Static import for CommonJS environment (Firebase Functions)
const { GoogleGenAI } = require("@google/genai");

let genAIInstance;
let geminiApiKeyUsed;

try {
  // Use environment variable from Secret Manager (via apphosting.yaml)
  geminiApiKeyUsed = process.env.GEMINI_API_KEY;
  if (!geminiApiKeyUsed) {
    console.error(
      "Gemini API key is not set in environment variable GEMINI_API_KEY. " +
      "Ensure it's configured in apphosting.yaml to reference the secret from Secret Manager."
    );
    // Initialize with a null or placeholder if you want functions to attempt to run and fail gracefully
    // Forcing an error here might be better if Gemini is critical.
  } else {
    genAIInstance = new GoogleGenAI({ apiKey: geminiApiKeyUsed });
    console.log("GoogleGenAI client initialized successfully.");
  }
} catch (error) {
  console.error("GoogleGenAI client initialization error:", error.message);
  // genAIInstance will remain undefined, and calls using it will fail.
}

/**
 * Returns an initialized model instance for content generation.
 * @param {string} modelName - The name of the model to use (e.g., "gemini-2.5-flash-preview-05-20").
 * @returns {object} The model instance with generateContent method.
 * @throws {Error} If the Gemini API client is not initialized.
 */
const getGenerativeModel = (modelName = "gemini-2.5-flash-preview-05-20") => {
  if (!genAIInstance) {
    console.error("GoogleGenAI client is not initialized. Cannot get model. Check API key configuration.");
    // Return mock object with error-throwing methods
    return {
        generateContent: async () => { 
            console.error("Attempted to call generateContent on an uninitialized Gemini model.");
            throw new Error("Gemini client not initialized. API key might be missing or invalid."); 
        },
    };
  }
  
  // Return an object that mimics the old API but uses the new @google/genai structure
  return {
    generateContent: async (request, config = {}) => {
      try {
        // Handle different request formats
        let contents;
        if (request.contents) {
          contents = request.contents;
        } else if (typeof request === 'string') {
          contents = request;
        } else {
          contents = request;
        }

        // Prepare the generation config
        const generationConfig = {
          ...DEFAULT_GENERATION_CONFIG,
          ...config
        };

        // Call the new API
        const response = await genAIInstance.models.generateContent({
          model: modelName,
          contents: contents,
          config: generationConfig
        });

        // Return response in the format expected by the old code
        return {
          response: {
            text: () => response.text
          }
        };
      } catch (error) {
        console.error("Error in generateContent:", error);
        throw error;
      }
    }
  };
};

/**
 * Default generation configuration for Gemini API calls.
 * Can be overridden by specific function calls.
 */
const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 2048,
};

/**
 * Cleans a string that might be wrapped in Markdown code fences (```json ... ``` or ``` ... ```).
 * @param {string} text - The text to clean.
 * @returns {string} The cleaned text, hopefully a valid JSON string.
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
  cleanPotentialJsonMarkdown,
  DEFAULT_GENERATION_CONFIG
};