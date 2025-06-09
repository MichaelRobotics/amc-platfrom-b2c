/**
 * @fileoverview A lightweight, callable Cloud Function to create an initial
 * analysis record in Firestore.
 *
 * This function is the first step in the new asynchronous workflow, triggered
 * by the client immediately after it finishes uploading a file directly to
 * Cloud Storage.
 */

const functions = require('firebase-functions');
const { admin, firestore } = require("./_lib/firebaseAdmin");

/**
 * Creates a placeholder document for a new analysis.
 * @param {object} data The data passed from the client.
 * @param {string} data.analysisId The client-generated UUID for the analysis.
 * @param {string} data.originalFileName The name of the file uploaded to Storage.
 * @param {string} data.analysisName The user-provided name for the analysis.
 * @param {object} context The context of the call (e.g., auth info).
 * @returns {Promise<{success: boolean, analysisId: string}>}
 */
async function requestAnalysisHandler(data, context) {
    const { analysisId, originalFileName, analysisName } = data;

    // Validate input from the client
    if (!analysisId || !originalFileName || !analysisName) {
        console.error("Invalid arguments:", { analysisId, originalFileName, analysisName });
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "analysisId", "originalFileName", and "analysisName".');
    }

    const analysisDocRef = firestore().collection('analyses').doc(analysisId);

    console.log(`[REQUEST_ANALYSIS] Creating initial analysis document for ${analysisName} (ID: ${analysisId})`);

    // Create the document with an initial status. The background function will update this.
    await analysisDocRef.set({
        analysisName: analysisName,
        originalFileName: originalFileName,
        // The raw CSV path is now deterministic based on the client-known analysisId
        rawCsvStoragePath: `raw_csvs/${analysisId}/${originalFileName}`,
        status: "processing_started", // Initial status for the frontend to monitor
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[REQUEST_ANALYSIS] Document ${analysisId} created successfully.`);

    // Return the ID to the client for navigation.
    return { success: true, analysisId: analysisId };
}

module.exports = requestAnalysisHandler;