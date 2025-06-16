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
 * AI summary.
 * 3. `analyzeTopic` (firestore.onCreate): A background function that triggers when
 * a new topic document is created in Firestore. It performs the detailed topic
 * analysis.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK once at the top level
admin.initializeApp();

// --- Import NEW Asynchronous Architecture Handlers ---
const requestAnalysisHandler = require('./request-analysis');
const processUploadedCsvHandler = require('./process-uploaded-csv');
const analyzeTopicHandler = require('./analyze-topic');

// --- Import Existing Function Handlers for Data & Chat ---
const analysesHandler = require('./analyses');
const analysisTopicDetailHandler = require('./analysisTopicDetail');
const chatOnTopicHandler = require('./chat-on-topic');

// --- Reusable Function Configuration ---
const functionBuilder = functions.region('europe-west1').runWith({
    timeoutSeconds: 540,
    memory: '8GB',
    secrets: ["GEMINI_API_KEY", "STORAGE_BUCKET_URL"]
});

// --- EXPORTS for NEW Asynchronous Architecture ---

/**
 * 1. A lightweight, callable HTTP function to kick off the analysis record creation.
 * Triggered by the client after a direct file upload to Cloud Storage.
 * This function is SECURED and requires user authentication.
 */
exports.requestAnalysis = functionBuilder.https.onCall(requestAnalysisHandler);

/**
 * 2. A background function triggered by new file uploads to Cloud Storage.
 * This function handles the CSV preprocessing and initial summary generation.
 * Its security is based on Storage Rules.
 */
exports.processUploadedCsv = functionBuilder.storage.object().onFinalize(processUploadedCsvHandler);

/**
 * 3. A background function triggered by the creation of a new topic document in Firestore.
 * This function handles the detailed, in-depth AI analysis for that topic.
 * Its security is based on Firestore Rules.
 */
exports.analyzeTopic = functionBuilder.firestore
    .document('analyses/{analysisId}/topics/{topicId}')
    .onCreate(analyzeTopicHandler);


// --- EXPORTS for Existing Data Retrieval & Chat Functions ---

/**
 * An HTTP function to get a list of all analyses for the logged-in user.
 * This function is SECURED and requires user authentication.
 */
exports.analyses = functionBuilder.https.onCall(analysesHandler);

/**
 * An HTTP function to get the details of a specific analysis and its topics.
 * This function is SECURED and requires user authentication.
 */
exports.analysisTopicDetail = functionBuilder.https.onCall(analysisTopicDetailHandler);

/**
 * A callable function to handle chat messages on a specific analysis topic.
 * This function is SECURED and requires user authentication and authorization.
 */
exports.chatOnTopic = functionBuilder.https.onCall(chatOnTopicHandler);