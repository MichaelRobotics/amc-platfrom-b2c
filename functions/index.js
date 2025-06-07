// File: functions/index.js
// Description: Updated to separate the file upload handler into its own dedicated Cloud Function.

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Import all handler functions
const analysesListHandler = require("./analyses");
const analysisTopicDetailHandler = require("./analysisTopicDetail");
const chatOnTopicHandler = require("./chat-on-topic");
const initiateTopicAnalysisHandler = require("./initiate-topic-analysis");
// Import the upload handler
const uploadAndPreprocessCsvHandler = require("./upload-and-preprocess-csv");

// --- Main Express App for JSON APIs ---
const app = express();
app.use(cors({ origin: true })); 

const apiRouter = express.Router();
const jsonParser = express.json();

// All JSON-based routes remain in the Express app
apiRouter.get("/analyses", analysesListHandler);
apiRouter.get("/analyses/:analysisId/topics/:topicId", analysisTopicDetailHandler);
apiRouter.post("/chat-on-topic", jsonParser, chatOnTopicHandler);
apiRouter.post("/initiate-topic-analysis", jsonParser, initiateTopicAnalysisHandler);

// --- The upload route has been REMOVED from the Express router ---

app.use('/api', apiRouter);

// --- Function Exports ---

// 1. Export the main Express app for all JSON-based API calls
exports.api = functions
    .runWith({ 
        timeoutSeconds: 120,
        memory: '1GB',
        secrets: [
            "GEMINI_API_KEY", 
            "STORAGE_BUCKET_URL"
        ] 
    })
    .https.onRequest(app);

// 2. Export the file upload handler as a NEW, SEPARATE Cloud Function
// This isolates it from Express and its body parsers.
exports.uploadAndPreprocessCsv = functions
    .runWith({
        timeoutSeconds: 120, // Keep same settings
        memory: '1GB',
        secrets: [
            "GEMINI_API_KEY", 
            "STORAGE_BUCKET_URL"
        ]
    })
    .https.onRequest(uploadAndPreprocessCsvHandler);
