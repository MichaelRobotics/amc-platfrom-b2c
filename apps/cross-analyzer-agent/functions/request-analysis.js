/**
 * @fileoverview A secure, lightweight, callable Cloud Function to create an
 * initial analysis record in Firestore.
 * FULLY REFACTORED FOR SECURITY:
 * - Requires that the user be authenticated.
 * - Uses the secure user ID from the auth context, not from the client.
 * - Stores the owner's user ID in the new analysis document.
 */

const functions = require('firebase-functions');
const { admin, firestore } = require("./_lib/firebaseAdmin");

/**
 * Creates a placeholder document for a new analysis for the authenticated user.
 * @param {object} data The data passed from the client.
 * @param {string} data.analysisId The client-generated UUID for the analysis.
 * @param {string} data.originalFileName The name of the file uploaded to Storage.
 * @param {string} data.analysisName The user-provided name for the analysis.
 * @param {object} context The context of the call, containing auth information.
 * @returns {Promise<{success: boolean, analysisId: string}>}
 */
async function requestAnalysisHandler(data, context) {
    // 1. Authentication Check: Ensure the user is logged in.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }
    const uid = context.auth.uid; // Get the secure user ID from the context.

    const { analysisId, originalFileName, analysisName } = data;

    // 2. Validate input from the client
    if (!analysisId || !originalFileName || !analysisName) {
        console.error("Invalid arguments:", { analysisId, originalFileName, analysisName });
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "analysisId", "originalFileName", and "analysisName".');
    }

    const analysisDocRef = firestore().collection('analyses').doc(analysisId);

    console.log(`[AUTH] User ${uid} requesting new analysis "${analysisName}" (ID: ${analysisId})`);

    // 3. Create the document with owner's UID and an initial status.
    // The background function will update this document as it progresses.
    await analysisDocRef.set({
        userId: uid, // This is the critical security field.
        analysisName: analysisName,
        originalFileName: originalFileName,
        // The raw CSV path is now deterministic based on the client-known analysisId
        rawCsvStoragePath: `raw_csvs/${analysisId}/${originalFileName}`,
        status: "processing_started", // Initial status for the frontend to monitor
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[SUCCESS] Document ${analysisId} created successfully for user ${uid}.`);

    // Return the ID to the client for navigation.
    return { success: true, analysisId: analysisId };
}

module.exports = requestAnalysisHandler;
