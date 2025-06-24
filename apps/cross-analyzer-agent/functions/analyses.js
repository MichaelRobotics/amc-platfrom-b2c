/**
 * @fileoverview Secure handler to fetch a list of analyses for the authenticated user.
 * FULLY REFACTORED FOR SECURITY AND V2 COMPATIBILITY:
 * - Uses the v2 onCall function signature.
 * - Requires that the user be authenticated to call it.
 * - The Firestore query now filters analyses to only those owned by the caller.
 */

// We don't need the v1 'functions' import anymore.
const { HttpsError } = require("firebase-functions/v2/https");
const { firestore } = require("./_lib/firebaseAdmin");

/**
 * Handles a secure, callable request to fetch the user's analysis documents (v2 signature).
 * @param {object} request The request object from the client.
 * @param {object} request.auth The authentication context of the user.
 * @returns {Promise<object>} A promise that resolves with the user's list of analyses.
 */
async function getAnalysesListHandler(request) {
    // 1. Authentication Check: Ensure the user is logged in.
    if (!request.auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }
    const uid = request.auth.uid;

    try {
        console.log(`[AUTH] User ${uid} is fetching their analyses list.`);
        
        // 2. Secure Firestore Query: Use a 'where' clause to fetch only the user's documents.
        const analysesSnapshot = await firestore()
            .collection('analyses')
            .where('userId', '==', uid) // This is the critical security filter
            .orderBy('createdAt', 'desc')
            .get();

        if (analysesSnapshot.empty) {
            console.log(`[DATA] No analyses found for user ${uid}.`);
            return { success: true, analyses: [] };
        }

        // 3. Map the documents to the specific format the frontend expects.
        const analysesList = analysesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                analysisId: doc.id,
                name: data.analysisName,
                fileName: data.originalFileName,
                // Safely convert Firestore Timestamp to ISO string
                createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : null,
                lastUpdatedAt: data.lastUpdatedAt && data.lastUpdatedAt.toDate ? data.lastUpdatedAt.toDate().toISOString() : null,
                status: data.status,
                rowCount: data.rowCount,
                columnCount: data.columnCount,
                dataNatureDescription: data.dataNatureDescription || null,
            };
        });

        console.log(`[DATA] Successfully fetched and formatted ${analysesList.length} analyses for user ${uid}.`);
        return { success: true, analyses: analysesList };

    } catch (error) {
        console.error(`Error fetching analyses list for user ${uid}:`, error);
        // Throw a generic error to the client to avoid leaking implementation details.
        throw new HttpsError('internal', 'An internal server error occurred while fetching your analyses.');
    }
}

module.exports = { getAnalysesListHandler };