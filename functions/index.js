// Import the 'firebase-functions' library
const functions = require('firebase-functions');
// Import all handler functions
const analysesListHandler = require("./analyses");
const analysisTopicDetailHandler = require("./analysisTopicDetail");
const chatOnTopicHandler = require("./chat-on-topic");
const initiateTopicAnalysisHandler = require("./initiate-topic-analysis");
const uploadAndPreprocessCsvHandler = require("./upload-and-preprocess-csv");

const express = require('express');
// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true })); // Configure CORS as needed. Be more specific for production.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
// The '/api' prefix is handled by how you call this from the frontend
// and how App Hosting might route (if using pathPrefix in apphosting.yaml, though not strictly necessary here
// if all non-static routes go to the backend)

// If your frontend calls /api/analyses, your Express routes should match that.
// Or, your App Hosting routes can map /api/* to this backend, and Express handles /analyses.
// Let's assume the frontend calls /api/*, so Express should route from /api/*

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
    .runWith({ secrets: ["GEMINI_API_KEY", "FIREBASE_SERVICE_ACCOUNT_KEY_JSON", "FIREBASE_STORAGE_BUCKET_URL"] }) // Declare the secrets your function needs
    .https.onRequest(app);

// Export the Express app as an HTTP Cloud Function named 'api'
exports.api = functions.https.onRequest(app);

// No longer exporting for Cloud Functions:
// exports.api = functions.https.onRequest(app);
