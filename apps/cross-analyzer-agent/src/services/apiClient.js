/**
 * @fileoverview API client for interacting with Firebase Cloud Functions.
 * This version is updated for the monorepo architecture.
 * - It imports the 'functions' service from the shared firebase-helpers package.
 * - It exclusively uses modern, secure httpsCallable functions.
 * - Outdated fetch/URL-based calls have been removed.
 */
import { httpsCallable } from "firebase/functions";
// The 'packages' alias is configured by the monorepo's workspace setup.
import { functions } from 'packages/firebase-helpers/client';

/**
 * Calls the 'requestAnalysis' function after a file upload.
 * @param {string} analysisId - The client-generated UUID for the analysis.
 * @param {string} originalFileName - The name of the file uploaded.
 * @param {string} analysisName - The user-provided name for the analysis.
 * @returns {Promise<any>} The result from the Cloud Function.
 */
export const requestAnalysis = async (analysisId, originalFileName, analysisName) => {
    try {
        console.log('Calling requestAnalysis with:', { analysisId, originalFileName, analysisName });
        // It's best practice to specify the function name directly.
        const requestAnalysisFunction = httpsCallable(functions, 'cross-analyzer-gcp-requestAnalysis');
        const result = await requestAnalysisFunction({ analysisId, originalFileName, analysisName });
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

// NOTE: getAnalysesList and getAnalysisTopicDetail have been removed.
// This data is now fetched directly and more efficiently from Firestore
// using real-time listeners in the AnalysisContext.
