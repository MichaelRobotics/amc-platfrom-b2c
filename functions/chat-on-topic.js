// File: functions/chat-on-topic.js
// Description: Handles chat interactions related to a specific topic using Gemini API.
// Migrated from Vercel API route: api/chat-on-topic.js (now with more complete logic)

const functions = require("firebase-functions"); // Required for functions.config() if used directly here
const { admin, firestore } = require("./_lib/firebaseAdmin"); // Correct path, admin for FieldValue
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient"); // Correct path

// Helper to format chat history for Gemini API (adapted from original)
function formatChatHistoryForGemini(chatHistoryDocs) {
  if (!chatHistoryDocs || chatHistoryDocs.length === 0) {
    return [];
  }
  return chatHistoryDocs.map(doc => {
    const data = doc.data();
    return {
      role: data.role,
      // Ensure parts is an array, provide default if undefined
      parts: Array.isArray(data.parts) ? data.parts : [{ text: String(data.text || "") }], 
    };
  });
}

// Handler function for POST /api/chat-on-topic
async function chatOnTopicHandler(req, res) {
  if (req.method !== "POST") {
    console.warn(`Method ${req.method} not allowed for /chat-on-topic`);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { analysisId, topicId, userMessageText } = req.body; // Original uses userMessageText

  if (!analysisId || !topicId || !userMessageText) {
    console.warn("Missing analysisId, topicId, or userMessageText in request body.");
    return res.status(400).json({ success: false, message: 'Missing required fields: analysisId, topicId, or userMessageText.' });
  }
  if (userMessageText.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'User message text cannot be empty.' });
  }
  console.log(`Chat message received for analysisId: ${analysisId}, topicId: ${topicId}`);

  try {
    const analysisDocRef = firestore.collection('analyses').doc(analysisId);
    const analysisDoc = await analysisDocRef.get();

    if (!analysisDoc.exists) {
      console.warn(`Analysis with ID ${analysisId} not found.`);
      return res.status(404).json({ success: false, message: `Analysis with ID ${analysisId} not found.` });
    }
    const analysisData = analysisDoc.data();
    // Destructure with defaults to prevent errors if fields are missing
    const { 
        dataSummaryForPrompts = {}, 
        dataNatureDescription = "Not specified", 
        analysisName = "Unnamed Analysis", 
        smallDatasetRawData = null 
    } = analysisData;

    if (Object.keys(dataSummaryForPrompts).length === 0 || !dataNatureDescription) {
        console.warn(`Analysis document ${analysisId} is missing dataSummaryForPrompts or dataNatureDescription.`);
      return res.status(400).json({ success: false, message: 'Analysis document is missing crucial context (dataSummaryForPrompts or dataNatureDescription).' });
    }

    const topicDocRef = firestore.collection('analyses').doc(analysisId).collection('topics').doc(topicId);
    const topicDoc = await topicDocRef.get();
    if (!topicDoc.exists) {
      console.warn(`Topic with ID ${topicId} not found for analysis ${analysisId}.`);
      return res.status(404).json({ success: false, message: `Topic with ID ${topicId} not found for analysis ${analysisId}.` });
    }
    const topicData = topicDoc.data();
    const topicDisplayName = topicData.topicDisplayName || topicData.title || "current topic"; // Fallback to title

    // In Firebase Functions, collection for chat messages might be different, adjust if needed.
    // Original used 'chatHistory', previous migration used 'chatMessages'. Sticking to 'chatMessages' for consistency with previous step.
    const chatMessagesRef = topicDocRef.collection('chatMessages');
    
    const userTimestamp = admin.firestore.FieldValue.serverTimestamp(); // For Firestore server-side timestamp
    // Storing user message
    // The original uses custom message IDs like `userMsg_${Date.now()}`.
    // Using add() for simplicity now, which auto-generates IDs.
    // If specific ID format is critical, use .doc(customId).set({...})
    const userMessageRecord = {
      role: "user",
      parts: [{ text: userMessageText }],
      timestamp: userTimestamp, // Will be resolved by server
    };
    const userMessageDocRef = await chatMessagesRef.add(userMessageRecord);
    console.log(`User message stored for topic ${topicId}, Firestore ID: ${userMessageDocRef.id}`);

    // Fetch the complete chat history from Firestore to build the prompt
    const chatHistorySnapshot = await chatMessagesRef.orderBy('timestamp', 'asc').get();
    const existingChatHistoryDocs = chatHistorySnapshot.docs;
    const formattedHistory = formatChatHistoryForGemini(existingChatHistoryDocs);

    // Determine data context for the prompt (from original logic)
    let dataContextForChatPrompt;
    if (smallDatasetRawData && Array.isArray(smallDatasetRawData) && smallDatasetRawData.length > 0) {
        const dataForPrompt = smallDatasetRawData.map(row => 
            Object.fromEntries(
                Object.entries(row).map(([key, value]) => [key, String(value).slice(0, 150)]) // Truncate long values
            )
        );
        dataContextForChatPrompt = `
Pełne dane (lub reprezentatywna próbka) dla tej analizy (format JSON):
${JSON.stringify(dataForPrompt, null, 2)}

Dodatkowo, podsumowanie statystyczne kolumn (zawierające także spostrzeżenia dotyczące wierszy z próbki i obserwacje ogólne):
${JSON.stringify(dataSummaryForPrompts, null, 2)}
`;
        console.log(`Using full small dataset (${smallDatasetRawData.length} rows) and extended summary in prompt for chat.`);
    } else {
        dataContextForChatPrompt = `
Podsumowanie statystyczne kolumn (zawierające także spostrzeżenia dotyczące wierszy z próbki i obserwacje ogólne):
${JSON.stringify(dataSummaryForPrompts, null, 2)}
`;
        console.log(`Using extended data summary (with row insights) in prompt for chat.`);
    }

    // Reconstruct the detailed chat prompt (from original)
    // IMPORTANT: Ensure all string interpolations are safe and correctly formatted.
    const chatPrompt = `
Jesteś Agentem AI do Analizy Danych. Kontynuuj rozmowę na podstawie dostarczonej historii.
Ogólna analiza nosi nazwę "${analysisName || 'N/A'}", a bieżący temat dyskusji to "${topicDisplayName}".
Dane, które analizujesz, dotyczą przede wszystkim: "${dataNatureDescription}".

O Twoich Danych (kontekst zawiera podsumowanie kolumn, spostrzeżenia o wierszach z próbki, a czasem pełne dane jeśli zbiór jest mały):
${dataContextForChatPrompt}

Historia Rozmowy (ostatnia wiadomość użytkownika jest na końcu):
${formattedHistory.map(m => `${m.role}: ${m.parts.map(p => p.text).join(' ')}`).join('\n')}

Twoja Odpowiedź:
Na podstawie ostatniej wiadomości użytkownika ("${userMessageText}") i historii rozmowy (oraz dostarczonych danych, w tym pełnych danych lub 'rowInsights' jeśli dostępne), udziel odpowiedzi. Odnoś się do konkretnych wartości w komórkach [wiersz, kolumna], jeśli to istotne i dane na to pozwalają.
Sformatuj swoją odpowiedź jako obiekt JSON z następującymi dokładnymi kluczami:
- "conciseChatMessage": (String) Krótka, bezpośrednia odpowiedź na pytanie użytkownika, odpowiednia do wyświetlenia w interfejsie czatu. Powinien to być zwykły tekst. WAŻNE: Odpowiedź MUSI być w języku polskim.
- "detailedAnalysisBlock": (Object) Strukturalny blok dla głównego obszaru wyświetlania, z tymi kluczami:
    - "questionAsked": (String) Pytanie użytkownika, na które odpowiadasz (tj. "${userMessageText}"). Powinien to być zwykły tekst.
    - "detailedFindings": (String) Twoje szczegółowe ustalenia, wyjaśnienia lub analizy związane z pytaniem. Ten ciąg znaków powinien być sformatowany za pomocą tagów HTML dla akapitów (np. "<p>Ustalenie 1.</p><p>Ustalenie 2.</p>"). Kiedy odnosisz się do nazw kolumn (np. OperatorWorkload_%, TasksCompleted), NIE używaj odwrotnych apostrofów. Zamiast tego, otocz dokładną nazwę kolumny tagiem <span class="column-name-highlight"></span>. WAŻNE: Cała wartość ciągu znaków dla "detailedFindings" musi być prawidłowym ciągiem JSON. Wszelkie cudzysłowy (") w treści lub atrybutach HTML MUSZĄ być poprzedzone znakiem ucieczki jako \\\\".
    - "specificThoughtProcess": (String) Krótko wyjaśnij, jak doszedłeś do tych szczegółowych ustaleń. Ten ciąg znaków powinien być sformatowany jako nieuporządkowana lista HTML (np. "<ul><li>Krok pierwszy wyjaśniający \\\\"dlaczego\\\\".</li><li>Krok drugi.</li><li>Krok trzeci.</li></ul>") zawierająca dokładnie 3 punkty. Kiedy odnosisz się do nazw kolumn, użyj tagu <span class="column-name-highlight"></span>. WAŻNE: Cała wartość ciągu znaków dla "specificThoughtProcess" musi być prawidłowym ciągiem JSON. Wszelkie cudzysłowy (") w treści lub atrybutach HTML MUSZĄ być poprzedzone znakiem ucieczki jako \\\\".
    - "followUpSuggestions": (Array of strings) Podaj 2-3 wnikliwe pytania uzupełniające (zwykły tekst). NIE używaj odwrotnych apostrofów ani tagów span HTML dla nazw kolumn w tych sugestiach.

Styl Interakcji: Bądź analityczny, wnikliwy i bezpośrednio odpowiadaj na pytanie użytkownika.
    `;

    console.log(`Calling Gemini for chat response on topic: ${topicDisplayName}`);
    let geminiResponsePayload;
    try {
      const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
      const result = await model.generateContent(chatPrompt, {
        responseMimeType: 'application/json'
      });
      
      const responseText = result.response.text();
      const cleanedResponseText = cleanPotentialJsonMarkdown(responseText);
      geminiResponsePayload = JSON.parse(cleanedResponseText);

    } catch (geminiError) {
      console.error(`Gemini API error during chat for topic ${topicId}:`, geminiError);
      return res.status(500).json({ success: false, message: `Failed to get AI response: ${geminiError.message || 'Unknown Gemini error'}` });
    }
    
    if (!geminiResponsePayload || 
        !geminiResponsePayload.conciseChatMessage || 
        !geminiResponsePayload.detailedAnalysisBlock ||
        !geminiResponsePayload.detailedAnalysisBlock.detailedFindings || 
        !geminiResponsePayload.detailedAnalysisBlock.specificThoughtProcess ||
        !geminiResponsePayload.detailedAnalysisBlock.followUpSuggestions) {
      console.error("Gemini response for chat is missing required fields.", geminiResponsePayload);
      return res.status(500).json({ success: false, message: "AI response for chat was incomplete or malformed." });
    }
    console.log(`Gemini chat response received and parsed for topic ${topicId}`);

    const modelTimestamp = admin.firestore.FieldValue.serverTimestamp();
    // Storing model response
    const modelMessageRecord = {
      role: "model",
      parts: [{ text: geminiResponsePayload.conciseChatMessage }], // Storing the concise message as primary text part
      detailedAnalysisBlock: geminiResponsePayload.detailedAnalysisBlock, // Storing the detailed block
      timestamp: modelTimestamp,
    };
    const modelMessageDocRef = await chatMessagesRef.add(modelMessageRecord);
    console.log(`Model (AI) response stored for topic ${topicId}, Firestore ID: ${modelMessageDocRef.id}`);

    // Update timestamps on parent documents
    await topicDocRef.update({ lastUpdatedAt: modelTimestamp });
    await analysisDocRef.update({ lastUpdatedAt: modelTimestamp }); // Ensure lastUpdatedAt is a valid path

    return res.status(200).json({
      success: true,
      // The client expects `chatMessage` (object) and `detailedBlock` (object)
      chatMessage: { 
        role: "model",
        parts: [{ text: geminiResponsePayload.conciseChatMessage }],
        timestamp: new Date().toISOString(), // Client might prefer ISO string for immediate display
        messageId: modelMessageDocRef.id, // Send Firestore ID
      },
      detailedBlock: geminiResponsePayload.detailedAnalysisBlock,
      message: "AI response generated successfully."
    });

  } catch (error) {
    console.error(`Error in /api/chat-on-topic (analysisId: ${analysisId}, topicId: ${topicId}):`, error);
    // Check for specific API key errors if possible (though geminiClient should handle this)
    if (error.message && error.message.includes("API key not valid")) {
        return res.status(500).json({ success: false, message: "Gemini API key is invalid or not configured.", details: error.message });
    }
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

module.exports = chatOnTopicHandler;