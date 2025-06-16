/**
 * @fileoverview Main entry point for all Cloud Functions.
 * This file exports the new asynchronous functions for the analysis process,
 * while retaining existing functions for data retrieval and chat.
 *
 * New Asynchronous Flow:
 * 1. `requestAnalysis` (onCall): A lightweight function called by the frontend after
 * a file is uploaded directly to Storage. It creates the initial analysis document.
 * 2. `processUploadedCsv` (storage.onFinalize): A background function that triggers
 * when the CSV is uploaded. It performs all the data preprocessing and initial
 * AI summary, exactly like the original `upload-and-preprocess-csv.js`.
 * 3. `analyzeTopic` (firestore.onCreate): A background function that triggers when
 * a new topic document is created in Firestore. It performs the detailed topic
 * analysis, exactly like the original `initiate-topic-analysis.js`.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK once
admin.initializeApp();

// --- Import Existing Function Handlers (Unchanged) ---
const analysisTopicDetailHandler = require('./analysisTopicDetail');
const analysesHandler =require('./analyses');
const chatOnTopicHandler = require('./chat-on-topic');

// --- Import NEW Asynchronous Architecture Handlers ---
const requestAnalysisHandler = require('./request-analysis');
const processUploadedCsvHandler = require('./process-uploaded-csv');
const analyzeTopicHandler = require('./analyze-topic');


// --- Reusable Function Configuration ---
const functionBuilder = functions.region('europe-west1').runWith({
    timeoutSeconds: 540,
    memory: '8GB',
    secrets: ["GEMINI_API_KEY", "STORAGE_BUCKET_URL"]
});

// --- EXPORTS for Existing Functions (Unchanged) ---
exports.analysisTopicDetail = functionBuilder.https.onRequest(analysisTopicDetailHandler);
exports.analyses = functionBuilder.https.onRequest(analysesHandler);
exports.chatOnTopic = functionBuilder.https.onCall(chatOnTopicHandler);

// --- EXPORTS for NEW Asynchronous Architecture ---

/**
 * 1. A lightweight, callable HTTP function to kick off the analysis record creation.
 * Triggered by the client after a direct file upload to Cloud Storage.
 */
exports.requestAnalysis = functionBuilder.https.onCall(requestAnalysisHandler);

/**
 * 2. A background function triggered by new file uploads to Cloud Storage.
 * This function handles the CSV preprocessing and initial summary generation.
 */
exports.processUploadedCsv = functionBuilder.storage.object().onFinalize(processUploadedCsvHandler);

/**
 * 3. A background function triggered by the creation of a new topic document in Firestore.
 * This function handles the detailed, in-depth AI analysis for that topic.
 */
exports.analyzeTopic = functionBuilder.firestore
    .document('analyses/{analysisId}/topics/{topicId}')
    .onCreate(analyzeTopicHandler);