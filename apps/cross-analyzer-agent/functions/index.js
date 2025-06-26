/**
 * @fileoverview Main entry point for all backend Cloud Functions for the Cross-Analyzer Agent.
 * This file imports and re-exports all individual function handlers,
 * making them available for deployment.
 */

// v2 Imports: Import triggers from their specific modules
const { setGlobalOptions } = require('firebase-functions/v2');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const { onObjectFinalized } = require('firebase-functions/v2/storage');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { logger } = require("firebase-functions");

// --- GLOBAL FUNCTION CONFIGURATION ---
// Set a baseline configuration for all functions in this file.
setGlobalOptions({
    // --- Location ---
    // Set the region to Warsaw, Poland (europe-central2). This is ideal for your
    // location to ensure the lowest possible latency for your services.
    region: 'us-central1',

    // --- Resource Allocation ---
    // A good default memory allocation. Can be overridden for specific functions.
    memory: '8GiB',
    // Default CPU. 1 is standard for v2. Can be increased for CPU-intensive tasks.
    cpu: 2,
    // Default timeout. 2 minutes is a safe baseline for most operations.
    timeoutSeconds: 540,

    // --- Scaling ---
    // Allow functions to scale down to zero to minimize costs when not in use.
    minInstances: 0,
});


// --- IMPORT FUNCTION HANDLERS ---
const { requestAnalysisHandler } = require('./request-analysis');
const { processUploadedCsvHandler } = require('./process-uploaded-csv');
const { getAnalysesListHandler } = require('./analyses');
const { getAnalysisTopicDetailHandler } = require('./analysisTopicDetail');
const { chatOnTopicHandler } = require('./chat-on-topic');
const { analyzeTopicHandler } = require('./analyze-topic');
const { geminiApiProxyHandler } = require('./gemini-api-proxy');

// --- EXPORTS FOR DEPLOYMENT ---

// The ONLY function that has access to the secret key vault.

exports.geminiApiProxy = onRequest({ secrets: ["GEMINI_API_KEY_VAULT"] }, geminiApiProxyHandler);
// --- EXPORTS FOR DEPLOYMENT ---
// All functions exported below will automatically inherit the global settings.

// Export callable functions using the v2 'onCall' trigger
exports.requestAnalysis = onCall(requestAnalysisHandler);
exports.getAnalysesList = onCall(getAnalysesListHandler);
exports.getAnalysisTopicDetail = onCall(getAnalysisTopicDetailHandler);

// This callable function requires the Gemini API key
exports.chatOnTopic = onCall({ secrets: ["GEMINI_API_KEY","GEMINI_API_KEY_VAULT"] }, chatOnTopicHandler);

// Export the storage function. We override its memory and add the required secret.
const BUCKET_NAME = 'amc-platform-b2c.firebasestorage.app'; // Verify this is your actual bucket name
exports.processUploadedCsv = onObjectFinalized({
    bucket: BUCKET_NAME,
    memory: '8GiB',
    timeoutSeconds: 540,                 // Override global setting
    secrets: ["GEMINI_API_KEY","GEMINI_API_KEY_VAULT"],    // Grant access to the Gemini secret
}, processUploadedCsvHandler);

// Export the Firestore-triggered function for AI analysis.
// We override its settings for more memory/time and add the required secret.
exports.analyzeTopic = onDocumentWritten({
    document: "analyses/{analysisId}/topics/{topicId}",
    secrets: ["GEMINI_API_KEY"], // Grant access to the Gemini secret
    timeoutSeconds: 540,         // Override: Give it 9 minutes for analysis
    memory: '8GiB',              // Override: Give it more memory
    secrets: ["GEMINI_API_KEY_VAULT"],
}, analyzeTopicHandler);