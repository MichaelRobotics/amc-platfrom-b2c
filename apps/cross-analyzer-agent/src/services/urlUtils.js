/**
 * @fileoverview Utility for creating fully-qualified Cloud Function URLs.
 * This is necessary for calling onRequest (HTTP) functions from the client.
 */

// This helper function constructs the correct URL for an onRequest Cloud Function.
// It uses environment variables provided by Create React App to determine if it's
// running in a local emulator or in production.

const isEmulating = window.location.hostname === 'localhost';

// Get the project ID from your Firebase config.
// IMPORTANT: You must add this to your .env.local file for it to work locally.
const projectId = "cross-analyzer-gcp"; 

// Replace with the region where your functions are deployed.
const region = 'europe-west1'; 

/**
 * Constructs the full URL for a given Cloud Function.
 * @param {string} functionName - The name of the function (e.g., 'analyses').
 * @returns {string} The full URL to call the function.
 */
export const getUrl = (functionName) => {
    if (isEmulating) {
        // URL for local Firebase emulator
        // The default port for Functions emulator is 5001.
        return `http://localhost:5001/${projectId}/${region}/${functionName}`;
    } else {
        // URL for deployed functions
        return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
    }
};
