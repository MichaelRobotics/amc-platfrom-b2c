// File: src/services/apiClient.js
// Description: Refactored to use lazy initialization for Firebase services to prevent race conditions.

import { getFunctions, httpsCallable } from "firebase/functions";

// --- Lazy-loaded instances ---
// We declare them here but do not initialize them immediately.
let functionsInstance;
let initiateTopicAnalysisCallable;
let chatOnTopicCallable;

/**
 * Gets the singleton instance of the Firebase Functions service.
 * It initializes it only on the first call.
 * @returns The Firebase Functions service instance.
 */
function getFunctionsInstance() {
    if (!functionsInstance) {
        // This will succeed because initializeApp() in index.js will have already run.
        functionsInstance = getFunctions();
    }
    return functionsInstance;
}

// --- API Client Definition ---
export const apiClient = {
    /**
     * Uploads a CSV file using the dedicated onRequest function.
     */
    uploadAndPreprocessCsv: async (formData) => {
        // This endpoint doesn't use the Functions SDK, so it's unchanged.
        const UPLOAD_ENDPOINT_URL = '/uploadAndPreprocessCsv';
        const response = await fetch(UPLOAD_ENDPOINT_URL, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'File upload failed.');
        }
        return response.json();
    },

    /**
     * Calls the 'initiateTopicAnalysis' callable function.
     */
    initiateTopicAnalysis: async (analysisId, topicId, topicDisplayName) => {
        // Initialize the callable function on its first use.
        if (!initiateTopicAnalysisCallable) {
            initiateTopicAnalysisCallable = httpsCallable(getFunctionsInstance(), 'initiateTopicAnalysis');
        }
        const result = await initiateTopicAnalysisCallable({ analysisId, topicId, topicDisplayName });
        return result.data;
    },

    /**
     * Calls the 'chatOnTopic' callable function.
     */
    chatOnTopic: async (analysisId, topicId, userMessageText) => {
        // Initialize the callable function on its first use.
        if (!chatOnTopicCallable) {
            chatOnTopicCallable = httpsCallable(getFunctionsInstance(), 'chatOnTopic');
        }
        const result = await chatOnTopicCallable({ analysisId, topicId, userMessageText });
        return result.data;
    },

    // --- The onRequest GET functions are unchanged ---
    getAnalysesList: async () => {
        const GET_ANALYSES_URL = '/getAnalysesList';
        const response = await fetch(GET_ANALYSES_URL);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Failed to get analyses list.');
        }
        return response.json();
    },
    
     getAnalysisTopicData: async (analysisId, topicId) => {
        const GET_TOPIC_DATA_URL = '/getAnalysisTopicDetail';
        const response = await fetch(`${GET_TOPIC_DATA_URL}?analysisId=${analysisId}&topicId=${topicId}`);
         if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: response.statusText }));
             throw new Error(errorData.message || 'Failed to get topic data.');
         }
         return response.json();
     },
};