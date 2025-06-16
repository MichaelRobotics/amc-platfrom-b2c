// File: functions/analysisTopicDetail.js
// Description: Handler to fetch details for a specific analysis topic.
// UPDATED to read parameters from req.query.

const { firestore } = require("./_lib/firebaseAdmin");

/**
 * Handles GET requests to fetch details for a specific topic.
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 */
async function getAnalysisTopicDetailHandler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        // --- THIS IS THE KEY CHANGE ---
        // Read parameters from the query string (`?analysisId=...`) instead of path params.
        const { analysisId, topicId } = req.query;

        if (!analysisId || !topicId) {
            return res.status(400).json({ success: false, message: "Missing analysisId or topicId in query parameters." });
        }

        console.log(`Fetching details for analysis: ${analysisId}, topic: ${topicId}`);
        const topicDocRef = firestore().collection('analyses').doc(analysisId).collection('topics').doc(topicId);
        const topicDoc = await topicDocRef.get();

        if (!topicDoc.exists) {
            return res.status(404).json({ success: false, message: 'Topic not found.' });
        }

        const topicData = topicDoc.data();
        
        // Also fetch the chat history for this topic
        const chatHistorySnapshot = await topicDocRef.collection('chatHistory').orderBy('timestamp', 'asc').get();
        const chatHistory = chatHistorySnapshot.docs.map(doc => doc.data());

        console.log("Successfully fetched topic details and chat history.");
        return res.status(200).json({ 
            success: true, 
            ...topicData,
            chatHistory 
        });

    } catch (error) {
        console.error("Error fetching topic details:", error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}

module.exports = getAnalysisTopicDetailHandler;