/**
 * @fileoverview Secure handler to fetch details for a specific analysis topic.
 * FULLY REFACTORED FOR SECURITY:
 * - Converted from an insecure HTTP onRequest function to a secure onCall function.
 * - Requires that the user be authenticated to call it.
 * - Performs an authorization check to ensure the user owns the analysis
 * before returning any data.
 */

const functions = require('firebase-functions');
const { firestore } = require("./_lib/firebaseAdmin");

/**
 * Handles a secure, callable request to fetch details for a specific topic.
 * @param {object} data The data passed from the client, containing { analysisId, topicId }.
 * @param {object} context The context of the call, containing auth information.
 * @returns {Promise<object>} A promise that resolves with the topic details and chat history.
 */
async function getAnalysisTopicDetailHandler(data, context) {
    // 1. Authentication Check: Ensure the user is logged in.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }
    const uid = context.auth.uid;
    const { analysisId, topicId } = data;

    if (!analysisId || !topicId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with both "analysisId" and "topicId".'
        );
    }

    try {
        console.log(`[AUTH] User ${uid} requesting details for topic ${topicId} in analysis ${analysisId}`);
        const analysisDocRef = firestore().collection('analyses').doc(analysisId);
        const topicDocRef = analysisDocRef.collection('topics').doc(topicId);

        // 2. Authorization Check: Verify the user owns the parent analysis.
        const analysisDoc = await analysisDocRef.get();

        if (!analysisDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Analysis with ID ${analysisId} not found.`);
        }

        if (analysisDoc.data().userId !== uid) {
            console.error(`[AUTH-FAIL] User ${uid} attempted to access analysis ${analysisId} owned by ${analysisDoc.data().userId}.`);
            throw new functions.https.HttpsError(
                'permission-denied',
                'You do not have permission to access this analysis.'
            );
        }
        
        console.log(`[AUTH-SUCCESS] User ${uid} is authorized. Fetching topic details.`);

        // 3. Proceed with fetching data only after security checks pass.
        const topicDoc = await topicDocRef.get();

        if (!topicDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'The requested topic does not exist in this analysis.');
        }

        const topicData = topicDoc.data();
        
        // Also fetch the chat history for this topic
        const chatHistorySnapshot = await topicDocRef.collection('chatHistory').orderBy('timestamp', 'asc').get();
        const chatHistory = chatHistorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`Successfully fetched details and ${chatHistory.length} chat messages for topic ${topicId}.`);
        
        return { 
            success: true, 
            topic: { id: topicDoc.id, ...topicData },
            chatHistory 
        };

    } catch (error) {
        console.error(`Error fetching topic details for user ${uid}:`, error);
        // If it's already an HttpsError, rethrow it. Otherwise, wrap it.
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'An internal server error occurred while fetching topic details.');
    }
}

module.exports = getAnalysisTopicDetailHandler;