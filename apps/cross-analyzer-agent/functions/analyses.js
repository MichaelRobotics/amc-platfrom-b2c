/**
 * @fileoverview Secure handler to fetch a list of analyses for the authenticated user.
 * FULLY REFACTORED FOR SECURITY:
 * - Converted from an insecure HTTP onRequest function to a secure onCall function.
 * - Requires that the user be authenticated to call it.
 * - The Firestore query now filters analyses to only those owned by the caller.
 */

const functions = require('firebase-functions');
const { firestore } = require("./_lib/firebaseAdmin");

/**
 * Handles a secure, callable request to fetch the user's analysis documents.
 * @param {object} data The data passed from the client (expected to be empty).
 * @param {object} context The context of the call, containing auth information.
 * @returns {Promise<object>} A promise that resolves with the user's list of analyses.
 */
async function getAnalysesListHandler(data, context) {
    // 1. Authentication Check: Ensure the user is logged in.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }
    const uid = context.auth.uid;

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
        throw new functions.https.HttpsError('internal', 'An internal server error occurred while fetching your analyses.');
    }
}

module.exports = getAnalysesListHandler;