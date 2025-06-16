/**
 * @fileoverview API client for interacting with Firebase Cloud Functions.
 * CORRECTED FOR MONOREPO:
 * - Imports the 'functions' service from the shared firebase-helpers package.
 * - The 'requestAnalysis' function now accepts and passes the 'userId' to the backend,
 * which is critical for establishing data ownership and security.
 */
import { httpsCallable } from "firebase/functions";
// The 'packages' alias is configured by the monorepo's workspace setup.
import { functions } from 'packages/firebase-helpers/client';

/**
 * Calls the 'requestAnalysis' function after a file upload.
 * @param {string} analysisId - The client-generated UUID for the analysis.
 * @param {string} originalFileName - The name of the file uploaded.
 * @param {string} analysisName - The user-provided name for the analysis.
 * @param {string} userId - The UID of the currently authenticated user.
 * @returns {Promise<any>} The result from the Cloud Function.
 */
export const requestAnalysis = async (analysisId, originalFileName, analysisName, userId) => {
    try {
        console.log('Calling requestAnalysis with:', { analysisId, originalFileName, analysisName, userId });
        // It's best practice to specify the function name directly.
        const requestAnalysisFunction = httpsCallable(functions, 'cross-analyzer-gcp-requestAnalysis');
        
        // The userId is now included in the payload sent to the function.
        const result = await requestAnalysisFunction({ analysisId, originalFileName, analysisName, userId });
        
        return result.data;
    } catch (error) {
        console.error("Error requesting analysis:", error);
        throw error;
    }
};

/**
 * Calls the 'chatOnTopic' function.
 * @param {string} analysisId - The ID of the analysis.
 * @param {string} topicId - The ID of the topic.
 * @param {Array<object>} chatHistory - The current chat history.
 * @returns {Promise<any>} The result from the Cloud Function.
 */
export const chatOnTopic = async (analysisId, topicId, chatHistory) => {
    try {
        console.log('Calling chatOnTopic with:', { analysisId, topicId });
        const chatFunction = httpsCallable(functions, 'cross-analyzer-gcp-chatOnTopic');
        const result = await chatFunction({ analysisId, topicId, chatHistory });
        return result.data;
    } catch (error) {
        console.error("Error in chatOnTopic:", error);
        throw error;
    }
};
