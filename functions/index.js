// File: functions/index.js
// Description: Main Express router for the API. This file correctly omits a global
// body-parser, which is required for the formidable route to work. No changes are needed here.

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Import all handler functions
const analysesListHandler = require("./analyses");
const analysisTopicDetailHandler = require("./analysisTopicDetail");
const chatOnTopicHandler = require("./chat-on-topic");
const initiateTopicAnalysisHandler = require("./initiate-topic-analysis");
// Import the newly modernized CSV handler
const uploadAndPreprocessCsvHandler = require("./upload-and-preprocess-csv");

// Initialize Express app
const app = express();
console.log('--- Express app initialized ---');

// Apply CORS middleware to allow requests from your web app
app.use(cors({ origin: true })); 

// IMPORTANT: A global express.json() parser is NOT used here.
// This allows formidable to handle the raw request stream on the upload route.

// --- API Routes ---
const apiRouter = express.Router();

// Routes that expect a JSON body can have the middleware applied individually.
const jsonParser = express.json();
apiRouter.get("/analyses", analysesListHandler);
apiRouter.get("/analyses/:analysisId/topics/:topicId", analysisTopicDetailHandler);
apiRouter.post("/chat-on-topic", jsonParser, chatOnTopicHandler);
apiRouter.post("/initiate-topic-analysis", jsonParser, initiateTopicAnalysisHandler);

// This route for file uploads does NOT use the JSON parser.
apiRouter.post("/upload-and-preprocess-csv", uploadAndPreprocessCsvHandler);

// Mount the API router
app.use('/api', apiRouter);

// Export the Express app as a single, powerful HTTP Cloud Function
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