// File: functions/analyses.js
// Description: Refactored handler with full, original data mapping logic restored.

const { firestore } = require("./_lib/firebaseAdmin");

/**
 * Handles GET requests to fetch all analysis documents and formats them for the frontend.
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 */
async function getAnalysesListHandler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        console.log("Fetching list of all analyses with full data mapping...");
        
        // Use the lazy-initialized firestore() function to get the instance
        const analysesSnapshot = await firestore()
            .collection('analyses')
            .orderBy('createdAt', 'desc')
            .get();

        if (analysesSnapshot.empty) {
            console.log('No analyses found.');
            return res.status(200).json({ success: true, analyses: [] });
        }

        // --- FULL DATA MAPPING LOGIC RESTORED ---
        // Map the documents to the specific format the frontend expects.
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
        // --- END OF RESTORED LOGIC ---

        console.log(`Successfully fetched and formatted ${analysesList.length} analyses.`);
        return res.status(200).json({ success: true, analyses: analysesList });

    } catch (error) {
        console.error("Error fetching analyses list:", error);
        return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
}

module.exports = getAnalysesListHandler;