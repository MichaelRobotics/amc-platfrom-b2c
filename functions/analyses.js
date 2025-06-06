// File: functions/analyses.js
// Description: Handles requests related to listing analyses.
// Migrated from Vercel API route: api/analyses.js (Corrected to include full logic)

const { admin, firestore } = require("./_lib/firebaseAdmin"); // admin might be needed for Timestamp check, firestore for query
// At the very top of the handler function
module.exports = async (req, res) => {
  console.log('--- /api/analyses handler INVOKED ---');
  console.log("Request path:", req.path);
  console.log("GEMINI_API_KEY at runtime:", process.env.GEMINI_API_KEY);
  console.log("STORAGE_BUCKET_URL at runtime:", process.env.STORAGE_BUCKET_URL);
  try {
    // ... your existing logic for fetching analyses ...
    res.status(200).json({ message: "Analyses list from handler", data: [] }); // Example response
  } catch (error) {
    console.error("--- ERROR in /api/analyses handler ---:", error);
    res.status(500).json({ error: "Internal server error in /api/analyses" });
  }
};

// Handler function for GET /api/analyses
// Lists all analyses from Firestore, ordered by creation date.
async function analysesListHandler(req, res) {
  if (req.method !== "GET") {
    console.warn(`Method ${req.method} not allowed for /analyses`);
    // Match original error response structure
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('Fetching list of all analyses...'); // Original log message

    // Query the 'analyses' collection, order by creation date descending
    const analysesSnapshot = await firestore.collection('analyses')
                                          .orderBy('createdAt', 'desc')
                                          .get();

    if (analysesSnapshot.empty) {
      console.log('No analyses found.');
      // Match original success response structure for empty list
      return res.status(200).json({ success: true, analyses: [] });
    }

    // Map the documents to the format expected by the frontend (from original)
    const analysesList = analysesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        analysisId: doc.id,
        name: data.analysisName, // Original used analysisName from Firestore
        fileName: data.originalFileName, // Or originalFilename as per upload function
        // Convert Firestore Timestamp to ISO string, handle potential nulls
        createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : null,
        lastUpdatedAt: data.lastUpdatedAt && data.lastUpdatedAt.toDate ? data.lastUpdatedAt.toDate().toISOString() : null,
        status: data.status,
        rowCount: data.rowCount, // Ensure these fields exist or provide defaults
        columnCount: data.columnCount,
        dataNatureDescription: data.dataNatureDescription || null,
      };
    });

    console.log(`Found ${analysesList.length} analyses.`);
    // Match original success response structure
    return res.status(200).json({ success: true, analyses: analysesList });

  } catch (error) {
    console.error('Error fetching analyses list:', error);
    // Match original error response structure
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

module.exports = analysesListHandler;
