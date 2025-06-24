import { httpsCallable } from 'firebase/functions';
import { functions } from '@amc-platfrom/firebase-helpers';

/**
 * A centralized and efficient client for interacting with backend Cloud Functions.
 * Each function is initialized only once for better performance.
 */
const apiClient = {
  /**
   * Triggers the backend process to start a new analysis.
   * @param {object} data The analysis metadata.
   * @returns {Promise<object>} The result from the cloud function.
   */
  requestAnalysis: httpsCallable(functions, 'requestAnalysis'),

  /**
   * Fetches the list of all analyses for the currently logged-in user.
   * @returns {Promise<object>} A promise that resolves with the list of analyses.
   */
  getAnalysesList: httpsCallable(functions, 'getAnalysesList'),
  
  /**
   * Fetches the detailed data for a specific analysis topic.
   * @param {object} data The data containing the analysisId.
   * @returns {Promise<object>} A promise that resolves with the detailed analysis data.
   */
  getAnalysisTopicDetail: httpsCallable(functions, 'getAnalysisTopicDetail'),

  /**
   * Sends a message to the chat for a specific analysis topic.
   * @param {object} data The chat message data, including analysisId, topicId, and messageText.
   * @returns {Promise<object>} The result from the cloud function.
   */
  chatOnTopic: httpsCallable(functions, 'chatOnTopic'),
};

export default apiClient;
