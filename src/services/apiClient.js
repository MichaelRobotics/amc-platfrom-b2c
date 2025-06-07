// src/services/apiClient.js
// Description: Updated to handle the separate URL for the file upload function.

// Base URL for the main backend API (Express app)
const API_BASE_URL = '/api';

// --- THIS IS THE CRITICAL CHANGE ---
// The URL for the upload function is now the name of the exported function, not a path within the API.
// NOTE: In local Firebase emulation, the URL will be different. This is for the deployed environment.
// The base path to the functions is handled by the browser's request origin.
const UPLOAD_ENDPOINT_URL = '/uploadAndPreprocessCsv'; 


/**
 * Generic request function for the MAIN Express API.
 * @param {string} endpoint - The API endpoint to call (e.g., '/analyses').
 * @param {object} options - Configuration options for the fetch call.
 * @returns {Promise<any>} - A promise that resolves with the JSON response.
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config = {
        method: options.method || 'GET',
        headers: headers,
        body: options.body,
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText };
            }
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`API request to ${endpoint} failed: ${error.message}`);
        throw error;
    }
}

// Export an object containing all API client methods.
export const apiClient = {
    /**
     * Uploads a CSV file using the DEDICATED upload function endpoint.
     * This method now uses fetch directly to call the correct URL.
     * @param {FormData} formData - FormData object containing 'csvFile' and 'analysisName'.
     * @returns {Promise<object>} - The backend response.
     */
    uploadAndPreprocessCsv: async (formData) => {
        try {
            const response = await fetch(UPLOAD_ENDPOINT_URL, {
                method: 'POST',
                body: formData, // Browser will set Content-Type to multipart/form-data
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: response.statusText };
                }
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API request to ${UPLOAD_ENDPOINT_URL} failed: ${error.message}`);
            throw error;
        }
    },

    /**
     * The rest of the API calls use the main Express API via the generic 'request' function.
     */
    initiateTopicAnalysis: (analysisId, topicId, topicDisplayName) => {
        return request('/initiate-topic-analysis', {
            method: 'POST',
            body: JSON.stringify({ analysisId, topicId, topicDisplayName }),
        });
    },

    chatOnTopic: (analysisId, topicId, userMessageText) => {
        return request('/chat-on-topic', {
            method: 'POST',
            body: JSON.stringify({ analysisId, topicId, userMessageText }),
        });
    },

    getAnalysesList: () => {
        return request('/analyses');
    },

    getAnalysisTopicData: (analysisId, topicId) => {
        return request(`/analyses/${analysisId}/topics/${topicId}`);
    },
};
