import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../packages/firebase-helpers/client';

const apiClient = {
  /**
   * Triggers the backend process to start a new analysis.
   * This is a secure, callable function.
   * @param {object} data - The analysis metadata.
   * @param {string} data.analysisId - The unique ID for the new analysis.
   * @param {string} data.originalFileName - The name of the uploaded file.
   * @param {string} data.analysisName - The user-defined name for the analysis.
   * @param {string} data.userId - The UID of the user requesting the analysis.
   * @returns {Promise<object>} The result from the cloud function.
   */
  requestAnalysis: httpsCallable(functions, 'requestAnalysis'),

  /**
   * Sends a message to the chat for a specific analysis topic.
   * This is a secure, callable function.
   * @param {string} analysisId - The ID of the analysis context.
   * @param {string} messageText - The user's message.
   * @returns {Promise<object>} The result from the cloud function.
   */
  chatOnTopic: async (analysisId, messageText) => {
    const chatFunction = httpsCallable(functions, 'chatOnTopic');
    return chatFunction({ analysisId, messageText });
  },

  /**
   * Fetches the list of all analyses for the currently logged-in user.
   * This is a secure, callable function.
   * @returns {Promise<object>} A promise that resolves with the list of analyses.
   */
  getAnalysesList: httpsCallable(functions, 'getAnalysesList'),

  /**
   * Fetches the detailed data for a specific analysis topic.
   * This is a secure, callable function.
   * @param {string} analysisId - The ID of the analysis to fetch.
   * @returns {Promise<object>} A promise that resolves with the detailed analysis data.
   */
  getAnalysisTopicDetail: async (analysisId) => {
    const detailFunction = httpsCallable(functions, 'getAnalysisTopicDetail');
    return detailFunction({ analysisId });
  },
};

export default apiClient;
