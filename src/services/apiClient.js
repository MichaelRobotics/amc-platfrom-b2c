/**
 * @fileoverview API client for interacting with Firebase services.
 * CORRECTED: No longer uses an unnecessary helper function to get the 'functions' service.
 * It now imports the initialized 'functions' instance directly from the central firebase.js file.
 */
import { httpsCallable } from "firebase/functions";
import { functions } from './firebase'; // CORRECT: Import the service directly
import { getUrl } from "./urlUtils"; // Assuming urlUtils provides the base URL for functions

/**
 * NEW: Calls the lightweight 'requestAnalysis' function after a file upload.
 * @param {string} analysisId - The client-generated UUID for the analysis.
 * @param {string} originalFileName - The name of the file uploaded.
 * @param {string} analysisName - The user-provided name for the analysis.
 * @returns {Promise<any>} The result from the Cloud Function.
 */
export const requestAnalysis = async (analysisId, originalFileName, analysisName) => {
    try {
        console.log('Calling requestAnalysis with:', { analysisId, originalFileName, analysisName });
        const requestAnalysisFunction = httpsCallable(functions, 'requestAnalysis');
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
        const chatFunction = httpsCallable(functions, 'chatOnTopic');
        const result = await chatFunction({ analysisId, topicId, chatHistory });
        return result.data;
    } catch (error) {
        console.error("Error in chatOnTopic:", error);
        throw error;
    }
};

/**
 * Fetches the list of all available analyses.
 * @returns {Promise<any>} A promise that resolves with the list of analyses.
 */
export const getAnalysesList = async () => {
    try {
        const url = await getUrl('analyses');
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching analyses list:", error);
        throw error;
    }
};

/**
 * Fetches the detailed content for a specific analysis topic.
 * @param {string} analysisId - The ID of the analysis.
 * @param {string} topicId - The ID of the topic.
 * @returns {Promise<any>} A promise that resolves with the topic details.
 */
export const getAnalysisTopicDetail = async (analysisId, topicId) => {
    try {
        const url = await getUrl(`analysisTopicDetail?analysisId=${analysisId}&topicId=${topicId}`);
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching analysis topic detail:", error);
        throw error;
    }
};