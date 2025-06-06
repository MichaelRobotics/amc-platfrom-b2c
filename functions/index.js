// Import the 'firebase-functions' library
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors'); // Added cors import

// Import all handler functions
const analysesListHandler = require("./analyses");
const analysisTopicDetailHandler = require("./analysisTopicDetail");
const chatOnTopicHandler = require("./chat-on-topic");
const initiateTopicAnalysisHandler = require("./initiate-topic-analysis");
const uploadAndPreprocessCsvHandler = require("./upload-and-preprocess-csv");

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true })); // Configure CORS as needed. Be more specific for production.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const apiRouter = express.Router();

apiRouter.get("/analyses", analysesListHandler);
apiRouter.get("/analyses/:analysisId/topics/:topicId", analysisTopicDetailHandler);
apiRouter.post("/chat-on-topic", chatOnTopicHandler);
apiRouter.post("/initiate-topic-analysis", initiateTopicAnalysisHandler);
apiRouter.post("/upload-and-preprocess-csv", uploadAndPreprocessCsvHandler);

// Mount the API router at /api
app.use('/api', apiRouter);

// Export the Express app as an HTTP Cloud Function
exports.api = functions
    .runWith({ 
        timeoutSeconds: 120, // 2 minutes
        memory: '1GB',       // 1 GiB of memory
        secrets: [
            "GEMINI_API_KEY", 
            "STORAGE_BUCKET_URL"
        ] 
    })
    .https.onRequest(app);
