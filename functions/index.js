// File: functions/index.js
// Description: Refactored to use individual, purpose-built Cloud Functions instead of an Express router.

const functions = require('firebase-functions');
const cors = require('cors');

// --- Import Handlers ---
// Note: These handler files now just export the core logic function.
const uploadAndPreprocessCsvHandler = require("./upload-and-preprocess-csv");
const getAnalysesListHandler = require("./analyses");
const getAnalysisTopicDetailHandler = require("./analysisTopicDetail");
const initiateTopicAnalysisHandler = require("./initiate-topic-analysis");
const chatOnTopicHandler = require("./chat-on-topic");

// --- Default Runtime Settings ---
const runtimeOpts = {
    timeoutSeconds: 540,
    memory: '8GB',
    secrets: ["GEMINI_API_KEY", "STORAGE_BUCKET_URL"]
};

// --- HTTP Request Functions (for REST-like endpoints and file uploads) ---

// 1. Dedicated File Upload Function (MUST be onRequest)
exports.uploadAndPreprocessCsv = functions.runWith(runtimeOpts).https.onRequest(uploadAndPreprocessCsvHandler);

// 2. Function to get the list of all analyses (could also be onCall, but onRequest is fine for GET)
exports.getAnalysesList = functions.runWith(runtimeOpts).https.onRequest((req, res) => {
    // We wrap the handler with CORS to allow GET requests from the browser
    cors({ origin: true })(req, res, () => {
        return getAnalysesListHandler(req, res);
    });
});

// 3. Function to get details of a specific analysis topic
exports.getAnalysisTopicDetail = functions.runWith(runtimeOpts).https.onRequest((req, res) => {
    cors({ origin: true })(req, res, () => {
        // The handler will need to get analysisId and topicId from req.params or req.query
        return getAnalysisTopicDetailHandler(req, res);
    });
});


// --- Callable Functions (for client-to-server RPC-style calls) ---
// 'onCall' functions are the best practice for this type of invocation.
// They automatically handle CORS, auth state, and data serialization.

// 4. Callable function to start a new analysis
exports.initiateTopicAnalysis = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    // data contains { analysisId, topicId, topicDisplayName }
    // context.auth contains user auth info if they are logged in.
    return initiateTopicAnalysisHandler(data, context);
});

// 5. Callable function for chatting
exports.chatOnTopic = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
    // data contains { analysisId, topicId, userMessageText }
    return chatOnTopicHandler(data, context);
});