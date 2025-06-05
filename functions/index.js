// File: functions/index.js
// Description: Main Cloud Functions file, sets up Express app for API routing.

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

// Import all handler functions
const analysesListHandler = require("./analyses");
const analysisTopicDetailHandler = require("./analysisTopicDetail");
const chatOnTopicHandler = require("./chat-on-topic");
const initiateTopicAnalysisHandler = require("./initiate-topic-analysis");
const uploadAndPreprocessCsvHandler = require("./upload-and-preprocess-csv");

// Initialize Express app
const app = express();

// Middleware
// Enable CORS with a more specific origin in production if needed
app.use(cors({ origin: true }));
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// API Routes
// Route for listing analyses
app.get("/analyses", analysesListHandler);

// Route for getting details of a specific topic within an analysis
// :analysisId and :topicId will be available in req.params
app.get("/analyses/:analysisId/topics/:topicId", analysisTopicDetailHandler);

// Route for handling chat on a specific topic
app.post("/chat-on-topic", chatOnTopicHandler);

// Route for initiating a topic analysis
app.post("/initiate-topic-analysis", initiateTopicAnalysisHandler);

// Route for uploading and preprocessing a CSV file
app.post("/upload-and-preprocess-csv", uploadAndPreprocessCsvHandler);

// Expose the Express app as a single Cloud Function named 'api'
// This function will handle all requests starting with /api/ as defined in firebase.json rewrites
exports.api = functions.https.onRequest(app);