/**
 * @fileoverview A secure, lightweight, callable Cloud Function to create an
 * initial analysis record in Firestore.
 * FULLY REFACTORED FOR SECURITY and v2 COMPATIBILITY:
 * - Uses the v2 onCall function signature.
 * - Requires that the user be authenticated.
 * - Uses the secure user ID from the auth context, not from the client.
 * - Stores the owner's user ID in the new analysis document.
 * - Correctly constructs the Cloud Storage path to match the client upload path.
 */

const { HttpsError } = require("firebase-functions/v2/https");
const { admin, firestore } = require("./_lib/firebaseAdmin");

/**
 * Creates a placeholder document for a new analysis for the authenticated user (v2 signature).
 * @param {object} request The request object from the client.
 * @param {object} request.auth The authentication context of the user.
 * @param {object} request.data The data passed from the client.
 * @param {string} request.data.analysisId The client-generated UUID for the analysis.
 * @param {string} request.data.originalFileName The name of the file uploaded to Storage.
 * @param {string} request.data.analysisName The user-provided name for the analysis.
 * @returns {Promise<{success: boolean, analysisId: string}>}
 */
async function requestAnalysisHandler(request) {
    // 1. Authentication Check: Ensure the user is logged in.
    if (!request.auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }
    const uid = request.auth.uid; // Get the secure user ID from the context.

    const { analysisId, originalFileName, analysisName } = request.data;

    // 2. Validate input from the client
    if (!analysisId || !originalFileName || !analysisName) {
        console.error("Invalid arguments:", { analysisId, originalFileName, analysisName });
        throw new HttpsError('invalid-argument', 'The function must be called with "analysisId", "originalFileName", and "analysisName".');
    }

    const analysisDocRef = firestore().collection('analyses').doc(analysisId);

    console.log(`[AUTH] User ${uid} requesting new analysis "${analysisName}" (ID: ${analysisId})`);

    // 3. Create the document with owner's UID and an initial status.
    // The background function will update this document as it progresses.
    await analysisDocRef.set({
        userId: uid, // This is the critical security field.
        analysisName: analysisName,
        originalFileName: originalFileName,
        // CORRECTED: The raw CSV path now includes the userId to match the client's upload path.
        rawCsvStoragePath: `raw_csvs/${uid}/${analysisId}/${originalFileName}`,
        status: "processing_started", // Initial status for the frontend to monitor
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[SUCCESS] Document ${analysisId} created successfully for user ${uid}.`);

    // Return the ID to the client for navigation.
    return { success: true, analysisId: analysisId };
}

module.exports = { requestAnalysisHandler };