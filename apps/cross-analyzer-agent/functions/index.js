/**
 * @fileoverview Main entry point for all backend Cloud Functions for the Cross-Analyzer Agent.
 * This file imports and re-exports all individual function handlers,
 * making them available for deployment.
 */

// Import function handlers
const { requestAnalysisHandler } = require('./request-analysis');
const { processUploadedCsvHandler } = require('./process-uploaded-csv');
const { getAnalysesListHandler } = require('./analyses');
const { getAnalysisTopicDetailHandler } = require('./analysisTopicDetail');
const { chatOnTopicHandler } = require('./chat-on-topic');

// --- EXPORTS FOR DEPLOYMENT ---

// Export HTTP-triggered functions for secure client-side invocation
exports.requestAnalysis = requestAnalysisHandler;
exports.getAnalysesList = getAnalysesListHandler;
exports.getAnalysisTopicDetail = getAnalysisTopicDetailHandler;
exports.chatOnTopic = chatOnTopicHandler;


// Export background-triggered functions (e.g., from Cloud Storage)
exports.processUploadedCsv = processUploadedCsvHandler;
