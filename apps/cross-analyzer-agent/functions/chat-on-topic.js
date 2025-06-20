// File: functions/chat-on-topic.js
// Description: Refactored 'onCall' function with corrected Gemini response handling.

const functions = require('firebase-functions');
const { admin, firestore } = require("./_lib/firebaseAdmin");
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient");

/**
 * Helper to format chat history for the Gemini API.
 * @param {Array<object>} chatHistoryDocs - Array of message document snapshots from Firestore.
 * @returns {Array<object>} Formatted history for the Gemini prompt.
 */
function formatChatHistoryForGemini(chatHistoryDocs) {
    if (!chatHistoryDocs || chatHistoryDocs.length === 0) {
        return [];
    }
    return chatHistoryDocs.map(doc => {
        const data = doc.data();
        return {
            role: data.role,
            // Handle both 'parts' and older 'content' fields for compatibility
            parts: data.parts || [{ text: data.content || "" }],
        };
    });
}

/**
 * Handles a callable request for chatting about a topic with full context.
 * @param {object} data The data passed from the client: { analysisId, topicId, userMessageText }.
 * @param {object} context The context of the call (e.g., auth info).
 * @returns {Promise<object>} A promise that resolves with the AI's chat response.
 */
async function chatOnTopicHandler(data, context) {
    const { analysisId, topicId, userMessageText } = data;

    if (!analysisId || !topicId || !userMessageText) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "analysisId", "topicId", and "userMessageText".');
    }
    if (userMessageText.trim().length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'User message text cannot be empty.');
    }

    try {
        console.log(`Processing chat message with full context for analysisId: ${analysisId}, topicId: ${topicId}`);
        const analysisDocRef = firestore().collection('analyses').doc(analysisId);
        const topicDocRef = analysisDocRef.collection('topics').doc(topicId);
        const chatMessagesRef = topicDocRef.collection('chatHistory');

        const [analysisDoc, topicDoc] = await Promise.all([
            analysisDocRef.get(),
            topicDocRef.get(),
        ]);

        if (!analysisDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Analysis with ID ${analysisId} not found.`);
        }
        if (!topicDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Topic with ID ${topicId} not found for analysis ${analysisId}.`);
        }

        const {
            dataSummaryForPrompts = {},
            dataNatureDescription = "Not specified",
            analysisName = "Unnamed Analysis",
            smallDatasetRawData = null
        } = analysisDoc.data();
        
        const { topicDisplayName = "current topic" } = topicDoc.data();
        
        const userTimestamp = admin.firestore.FieldValue.serverTimestamp();
        const userMessage = {
            role: 'user',
            parts: [{ text: userMessageText }],
            timestamp: userTimestamp
        };
        await chatMessagesRef.add(userMessage);

        const updatedChatHistorySnapshot = await chatMessagesRef.orderBy('timestamp', 'asc').get();
        const formattedHistory = formatChatHistoryForGemini(updatedChatHistorySnapshot.docs);

        let dataContextForChatPrompt;
        if (smallDatasetRawData && Array.isArray(smallDatasetRawData) && smallDatasetRawData.length > 0) {
            const dataForPrompt = smallDatasetRawData.map(row =>
                Object.fromEntries(
                    Object.entries(row).map(([key, value]) => [key, String(value).slice(0, 150)])
                )
            );
            dataContextForChatPrompt = `
Pełne dane (lub reprezentatywna próbka) dla tej analizy (format JSON):
${JSON.stringify(dataForPrompt, null, 2)}

Dodatkowo, podsumowanie statystyczne kolumn (zawierające także spostrzeżenia dotyczące wierszy z próbki i obserwacje ogólne):
${JSON.stringify(dataSummaryForPrompts, null, 2)}
`;
        } else {
            dataContextForChatPrompt = `
Podsumowanie statystyczne kolumn (zawierające także spostrzeżenia dotyczące wierszy z próbki i obserwacje ogólne):
${JSON.stringify(dataSummaryForPrompts, null, 2)}
`;
        }

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
    - "detailedFindings": (String) Twoje szczegółowe ustalenia, wyjaśnienia lub analizy związane z pytaniem. Ten ciąg znaków powinien być sformatowany za pomocą tagów HTML dla akapitów (np. "<p>Ustalenie 1.</p><p>Ustalenie 2.</p>"). Kiedy odnosisz się do nazw kolumn (np. OperatorWorkload_%, TasksCompleted), NIE używaj odwrotnych apostrofów. Zamiast tego, otocz dokładną nazwę kolumny tagiem <span class="column-name-highlight"></span>. WAŻNE: Cała wartość ciągu znaków dla "detailedFindings" musi być prawidłowym ciągiem JSON. Wszelkie cudzysłowy (") w treści lub atrybutach HTML MUSZĄ być poprawnie poprzedzone znakiem ucieczki jako \\\\".
    - "specificThoughtProcess": (String) Krótko wyjaśnij, jak doszedłeś do tych szczegółowych ustaleń. Ten ciąg znaków powinien być sformatowany jako nieuporządkowana lista HTML (np. "<ul><li>Krok pierwszy wyjaśniający \\\\"dlaczego\\\\".</li><li>Krok drugi.</li><li>Krok trzeci.</li></ul>") zawierająca dokładnie 3 punkty. Kiedy odnosisz się do nazw kolumn, użyj tagu <span class="column-name-highlight"></span>. WAŻNE: Cała wartość ciągu znaków dla "specificThoughtProcess" musi być prawidłowym ciągiem JSON. Wszelkie cudzysłowy (") w treści lub atrybutach HTML MUSZĄ być poprawnie poprzedzone znakiem ucieczki jako \\\\".
    - "followUpSuggestions": (Array of strings) Podaj 2-3 wnikliwe pytania uzupełniające (zwykły tekst). NIE używaj odwrotnych apostrofów ani tagów span HTML dla nazw kolumn w tych sugestiach.

Styl Interakcji: Bądź analityczny, wnikliwy i bezpośrednio odpowiadaj na pytanie użytkownika.
        `;

        console.log(`Calling Gemini for chat response on topic: ${topicDisplayName}`);
        let geminiResponsePayload;
        try {
            const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
            const result = await model.generateContent(chatPrompt, {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                candidateCount: 1
            });
            
            // --- CORRECTED RESPONSE HANDLING ---
            if (!result || !result.response) {
                console.error('[GEMINI] Invalid or unexpected response structure for chat.');
                throw new functions.https.HttpsError('internal', 'Gemini API returned an invalid or empty response structure for chat.');
            }

            // Get the response text using the correct method
            const responseText = result.response.text();
            const cleanedResponseText = cleanPotentialJsonMarkdown(responseText);

            try {
                geminiResponsePayload = JSON.parse(cleanedResponseText);
                console.log('[GEMINI] Chat response parsed successfully.');
            } catch (jsonParseError) {
                console.error("[GEMINI] Failed to parse cleaned chat response as JSON.", jsonParseError);
                console.error("[GEMINI] Raw response text:", responseText);
                console.error("[GEMINI] Cleaned response text:", cleanedResponseText);
                throw new functions.https.HttpsError('internal', `The AI returned text that was not valid JSON for chat after cleaning. Parse error: ${jsonParseError.message}`);
            }

        } catch (geminiError) {
            console.error(`Gemini API error during chat for topic ${topicId}:`, geminiError);
            throw new functions.https.HttpsError('internal', `Failed to get AI response: ${geminiError.message || 'Unknown Gemini error'}`);
        }

        if (!geminiResponsePayload || !geminiResponsePayload.conciseChatMessage || !geminiResponsePayload.detailedAnalysisBlock) {
            console.error("Gemini response for chat is missing required fields.", geminiResponsePayload);
            throw new functions.https.HttpsError('internal', "AI response for chat was incomplete or malformed.");
        }
        console.log(`Gemini chat response received and parsed for topic ${topicId}`);

        const modelTimestamp = admin.firestore.FieldValue.serverTimestamp();
        const modelMessageRecord = {
            role: "model",
            parts: [{ text: geminiResponsePayload.conciseChatMessage }],
            detailedAnalysisBlock: geminiResponsePayload.detailedAnalysisBlock,
            timestamp: modelTimestamp,
        };
        const modelMessageDocRef = await chatMessagesRef.add(modelMessageRecord);
        console.log(`Model (AI) response stored for topic ${topicId}, Firestore ID: ${modelMessageDocRef.id}`);

        await topicDocRef.update({ lastUpdatedAt: modelTimestamp });
        await analysisDocRef.update({ lastUpdatedAt: modelTimestamp });

        // Return the structured data to the client
        return {
            success: true,
            chatMessage: {
                role: "model",
                parts: [{ text: geminiResponsePayload.conciseChatMessage }],
                timestamp: new Date().toISOString(),
                messageId: modelMessageDocRef.id,
            },
            detailedBlock: geminiResponsePayload.detailedAnalysisBlock,
            message: "AI response generated successfully."
        };

    } catch (error) {
        console.error(`Error in chatOnTopicHandler (analysisId: ${data.analysisId}, topicId: ${data.topicId}):`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', `Server error: ${error.message}`);
    }
}

module.exports = chatOnTopicHandler;