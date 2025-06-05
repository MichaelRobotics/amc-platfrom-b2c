// File: functions/analysisTopicDetail.js
// Description: Handles requests for details of a specific topic, including its initial analysis and chat history.
// Migrated and adapted from Vercel API route: api/analyses/[analysisId]/topics/[topicId].js (Corrected)

const { admin, firestore } = require("./_lib/firebaseAdmin"); // admin might not be strictly needed if only using toDate()

// Handler function for GET /api/analyses/:analysisId/topics/:topicId
// Fetches details of a specific topic, its initial analysis result, and its chat history.
async function analysisTopicDetailHandler(req, res) {
  if (req.method !== "GET") {
    console.warn(`Method ${req.method} not allowed for /analyses/:analysisId/topics/:topicId`);
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    // In Express, dynamic parameters from the route are in req.params
    const { analysisId, topicId } = req.params; 

    if (!analysisId || !topicId) {
      console.warn("Missing analysisId or topicId in request parameters.");
      return res.status(400).json({ success: false, message: 'Missing analysisId or topicId in request.' });
    }
    console.log(`Fetching data for analysisId: ${analysisId}, topicId: ${topicId}`);

    // 1. Fetch the specific topic document
    const topicDocRef = firestore.collection('analyses').doc(analysisId).collection('topics').doc(topicId);
    const topicDoc = await topicDocRef.get();

    if (!topicDoc.exists) {
      console.warn(`Topic with ID ${topicId} not found for analysis ${analysisId}.`);
      return res.status(404).json({ success: false, message: `Topic with ID ${topicId} not found for analysis ${analysisId}.` });
    }
    const topicData = topicDoc.data();
    // Extract initialAnalysisResult, defaulting to null if not present
    const initialAnalysisResult = topicData.initialAnalysisResult || null; 

    // 2. Fetch the chat history for this topic, ordered by timestamp
    // Consistent collection name 'chatHistory' as per original
    const chatHistoryRef = topicDocRef.collection('chatHistory'); 
    const chatHistorySnapshot = await chatHistoryRef.orderBy('timestamp', 'asc').get();

    const chatHistory = [];
    if (!chatHistorySnapshot.empty) {
      chatHistorySnapshot.docs.forEach(doc => {
        const messageData = doc.data();
        chatHistory.push({
          messageId: doc.id, // The document ID from chatHistory
          role: messageData.role,
          parts: messageData.parts, // Expected to be [{ text: "..." }]
          // Convert Firestore Timestamp to ISO string, handle potential nulls
          timestamp: messageData.timestamp && messageData.timestamp.toDate ? messageData.timestamp.toDate().toISOString() : null,
          detailedAnalysisBlock: messageData.detailedAnalysisBlock || null, // Include if present
        });
      });
    }
    console.log(`Found ${chatHistory.length} messages for topic ${topicId}. Initial analysis result ${initialAnalysisResult ? 'found' : 'not found directly on topic doc'}.`);

    // 3. Combine and return the data in the structure expected by the frontend
    return res.status(200).json({
      success: true,
      initialAnalysisResult: initialAnalysisResult,
      chatHistory: chatHistory,
      message: `Data for topic ${topicId} fetched successfully.`
    });

  } catch (error) {
    // Log error with dynamic params from req.params for Firebase environment
    console.error(`Error fetching data for analysis ${req.params.analysisId}, topic ${req.params.topicId}:`, error);
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

module.exports = analysisTopicDetailHandler;
