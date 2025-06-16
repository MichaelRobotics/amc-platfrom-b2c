// apps/cross-analyzer-agent/src/services/apiClient.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../packages/firebase-helpers/client';

/**
 * This object centralizes all the callable Cloud Function endpoints used by the application.
 * This makes it easy to manage and update function calls from one place.
 */
const apiClient = {
  /**
   * Fetches a list of all analyses.
   * This is an HTTP onRequest function on the backend.
   */
  getAnalyses: httpsCallable(functions, 'analyses'),

  /**
   * Fetches the details and chat history for a specific analysis topic.
   * This is an HTTP onRequest function on the backend.
   */
  getAnalysisTopicDetail: httpsCallable(functions, 'analysisTopicDetail'),

  /**
   * Sends a user's message to the chat for a specific topic and gets the AI's response.
   * This is a secured onCall function.
   */
  chatOnTopic: httpsCallable(functions, 'chatOnTopic'),

  /**
   * NEW: Kicks off the asynchronous analysis process after a file is uploaded.
   * This is a lightweight onCall function.
   */
  requestAnalysis: httpsCallable(functions, 'requestAnalysis'),
};

export default apiClient;