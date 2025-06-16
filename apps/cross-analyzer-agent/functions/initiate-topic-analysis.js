// File: functions/initiate-topic-analysis.js
// Description: Refactored 'onCall' function with corrected Gemini response handling.

const functions = require('firebase-functions');
const { admin, firestore } = require("./_lib/firebaseAdmin");
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient");

/**
 * Handles a callable request to initiate a topic analysis with full, detailed logic.
 * @param {object} data The data passed from the client: { analysisId, topicId, topicDisplayName }.
 * @param {object} context The context of the call (e.g., auth info).
 * @returns {Promise<object>} A promise that resolves with the detailed analysis results.
 */
async function initiateTopicAnalysisHandler(data, context) {
    const { analysisId, topicId, topicDisplayName } = data;

    if (!analysisId || !topicId || !topicDisplayName) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "analysisId", "topicId", and "topicDisplayName".');
    }

    let topicDocRef; // Declare here to be accessible in catch block

    try {
        console.log(`[INITIATE_TOPIC] Initiating topic analysis for analysisId: ${analysisId}, topicId: ${topicId}`);

        const analysisDocRef = firestore().collection('analyses').doc(analysisId);
        const analysisDoc = await analysisDocRef.get();

        if (!analysisDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Analysis with ID ${analysisId} not found.`);
        }
        const analysisData = analysisDoc.data();
        console.log(`[INITIATE_TOPIC] Analysis document for ${analysisId} found.`);

        const {
            dataSummaryForPrompts = {},
            dataNatureDescription = "Not specified",
            smallDatasetRawData = null
        } = analysisData;

        if (Object.keys(dataSummaryForPrompts).length === 0 || !dataNatureDescription) {
            throw new functions.https.HttpsError('failed-precondition', 'Analysis document is missing crucial context (dataSummaryForPrompts or dataNatureDescription).');
        }

        topicDocRef = firestore().collection('analyses').doc(analysisId).collection('topics').doc(topicId);
        const topicDoc = await topicDocRef.get();
        const initialTimestamp = admin.firestore.FieldValue.serverTimestamp();

        if (topicDoc.exists && topicDoc.data().initialAnalysisResult) {
            console.log(`[INITIATE_TOPIC] Initial analysis for topic ${topicId} already exists. Returning existing data.`);
            return {
                success: true,
                initialAnalysisResult: topicDoc.data().initialAnalysisResult,
                message: "Initial analysis for this topic already existed."
            };
        }

        console.log(`[INITIATE_TOPIC] Setting topic ${topicId} status to "analyzing".`);
        await topicDocRef.set({
            topicDisplayName: topicDisplayName,
            status: "analyzing",
            createdAt: topicDoc.exists ? (topicDoc.data().createdAt || initialTimestamp) : initialTimestamp,
            lastUpdatedAt: initialTimestamp,
        }, { merge: true });

        let dataContextForPrompt;
        if (smallDatasetRawData && Array.isArray(smallDatasetRawData) && smallDatasetRawData.length > 0) {
            const dataForPrompt = smallDatasetRawData.map(row =>
                Object.fromEntries(
                    Object.entries(row).map(([key, value]) => [key, String(value).slice(0, 150)])
                )
            );
            dataContextForPrompt = `
Pełne dane (lub reprezentatywna próbka) dla tej analizy (format JSON):
${JSON.stringify(dataForPrompt, null, 2)}

Dodatkowo, podsumowanie statystyczne kolumn (zawierające także spostrzeżenia dotyczące wierszy z próbki i obserwacje ogólne):
${JSON.stringify(dataSummaryForPrompts, null, 2)}
`;
        } else {
            dataContextForPrompt = `
Podsumowanie statystyczne kolumn (zawierające także spostrzeżenia dotyczące wierszy z próbki i obserwacje ogólne):
${JSON.stringify(dataSummaryForPrompts, null, 2)}
`;
        }

        const initialPrompt = `
Jesteś Agentem AI do Analizy Danych.
Twoim zadaniem jest pomóc mi przeprowadzić analizę krzyżową i odkryć cenne spostrzeżenia związane z tematem: "${topicDisplayName}".
Dane, które analizujesz, dotyczą przede wszystkim: "${dataNatureDescription}".
Skup swoją analizę tematu "${topicDisplayName}" przez ten pryzmat, biorąc pod uwagę ogólną naturę zbioru danych.

O Twoich Danych (kontekst zawiera podsumowanie kolumn, spostrzeżenia o wierszach z próbki, a czasem pełne dane jeśli zbiór jest mały):
${dataContextForPrompt}

Twoja Pierwsza Odpowiedź - Wstępna Analiza i Wskazówki:
Proszę odpowiedz na następujące pytanie: "Na podstawie dostarczonych danych (w tym poszczególnych wierszy, jeśli zostały przekazane w sekcji 'Pełne dane' lub opisane w 'rowInsights' w podsumowaniu), jakie są kluczowe wstępne obserwacje, spostrzeżenia, potencjalne obszary do dalszej analizy oraz hipotezy dotyczące tematu '${topicDisplayName}'? Jeśli analizujesz pełne dane lub spostrzeżenia o wierszach, odnieś się do konkretnych wartości w komórkach [wiersz, kolumna], gdzie to istotne."
Dostarcz swoją odpowiedź sformatowaną jako obiekt JSON z następującymi dokładnymi kluczami:
- "conciseInitialSummary": (String) Krótkie, 1-2 zdaniowe podsumowanie Twoich głównych wstępnych ustaleń, odpowiednie do wyświetlenia jako pierwsza wiadomość w interfejsie czatu. Powinien to być zwykły tekst, bez formatowania HTML.
- "initialFindings": (String) Główna, szczegółowa część Twojej odpowiedzi na powyższe pytanie. Powinny to być Twoje kluczowe wstępne obserwacje, spostrzeżenia lub hipotezy. Jeśli odnosiłeś się do konkretnych wartości wierszy/kolumn, uwzględnij te odniesienia. Ten ciąg znaków powinien być sformatowany za pomocą tagów HTML dla akapitów (np. "<p>Spostrzeżenie 1.</p><p>Spostrzeżenie 2.</p>"). Kiedy odnosisz się do nazw kolumn (np. OperatorWorkload_%, TasksCompleted), NIE używaj odwrotnych apostrofów. Zamiast tego, otocz dokładną nazwę kolumny tagiem <span class="column-name-highlight"></span>. Na przykład, jeśli odnosisz się do 'OperatorWorkload_%', zapisz to jako <span class="column-name-highlight">OperatorWorkload_%</span>. WAŻNE: Cała wartość ciągu znaków dla "initialFindings" musi być prawidłowym ciągiem JSON. Wszelkie cudzysłowy (") w treści lub atrybutach HTML MUSZĄ być poprawnie poprzedzone znakiem ucieczki jako \\".
- "thoughtProcess": (String) Krótko wyjaśnij kroki lub rozumowanie, które doprowadziły Cię do sformułowania odpowiedzi w "initialFindings". Jeśli analizowałeś pełne dane lub 'rowInsights', opisz, jak poszczególne wiersze lub wartości wpłynęły na Twoje wnioski. Ten ciąg znaków powinien być sformatowany jako nieuporządkowana lista HTML (np. "<ul><li>Krok pierwszy wyjaśniający \\"dlaczego\\".</li><li>Krok drugi.</li><li>Krok trzeci.</li></ul>") zawierająca dokładnie 3 punkty. Kiedy odnosisz się do nazw kolumn, użyj tagu <span class="column-name-highlight"></span>. WAŻNE: Cała wartość ciągu znaków dla "thoughtProcess" musi być prawidłowym ciągiem JSON. Wszelkie cudzysłowy (") w treści lub atrybutach HTML MUSZĄ być poprawnie poprzedzone znakiem ucieczki jako \\".
- "questionSuggestions": (Array of strings) Podaj 3-5 wnikliwych pytań uzupełniających (zwykły tekst), które użytkownik mógłby zadać. Pytania te powinny być praktyczne i oparte na Twoich ustaleniach. NIE używaj odwrotnych apostrofów ani tagów span HTML dla nazw kolumn w tych sugestiach.

Styl Interakcji: Bądź analityczny, wnikliwy i proaktywny.
        `;
        
        console.log(`[INITIATE_TOPIC] Calling Gemini for initial analysis of topic: ${topicDisplayName}`);
        let initialAnalysisResult;
        try {
            const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
            const result = await model.generateContent(initialPrompt, { responseMimeType: 'application/json' });
            
            // --- START: CORRECTED ROBUST RESPONSE HANDLING ---
            if (!result || !result.candidates || result.candidates.length === 0) {
                 if (result && result.promptFeedback && result.promptFeedback.blockReason) {
                    const reason = result.promptFeedback.blockReason;
                    console.error(`[GEMINI] Content generation blocked. Reason: ${reason}`);
                    throw new Error(`Content generation blocked due to: ${reason}`);
                }
                console.error('[GEMINI] Invalid or unexpected response structure. No candidates found.');
                throw new Error('Gemini API returned an invalid or empty response structure.');
            }
            
            const responseText = result.candidates[0].content.parts[0].text;
            const cleanedResponseText = cleanPotentialJsonMarkdown(responseText);
            
            try {
                initialAnalysisResult = JSON.parse(cleanedResponseText);
                console.log('[GEMINI] Initial topic analysis parsed successfully.');
            } catch (jsonParseError) {
                console.error("[GEMINI] Failed to parse cleaned response as JSON.", jsonParseError);
                throw new Error(`The AI returned text that was not valid JSON after cleaning. Raw text: "${cleanedResponseText}"`);
            }
            // --- END: CORRECTED ROBUST RESPONSE HANDLING ---

        } catch (geminiError) {
            console.error(`[INITIATE_TOPIC] Gemini API error for topic ${topicId}:`, geminiError);
            await topicDocRef.update({ status: "error_initial_analysis", error: geminiError.message, lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });
            throw new functions.https.HttpsError('internal', `Failed to generate initial analysis with AI: ${geminiError.message}`);
        }

        if (!initialAnalysisResult || !initialAnalysisResult.conciseInitialSummary || !initialAnalysisResult.initialFindings || !initialAnalysisResult.thoughtProcess || !initialAnalysisResult.questionSuggestions) {
            console.error("[INITIATE_TOPIC] Gemini response for initial analysis is missing required fields.", initialAnalysisResult);
            await topicDocRef.update({ status: "error_initial_analysis", error: "AI response missing required fields.", lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });
            throw new functions.https.HttpsError('internal', "AI response for initial analysis was incomplete.");
        }

        const finalTimestamp = admin.firestore.FieldValue.serverTimestamp();
        await topicDocRef.update({
            initialAnalysisResult: initialAnalysisResult,
            status: "completed",
            lastUpdatedAt: finalTimestamp,
        });

        const chatMessagesRef = topicDocRef.collection('chatHistory');
        const firstMessageData = {
            role: "model",
            parts: [{ text: initialAnalysisResult.conciseInitialSummary }],
            detailedAnalysisBlock: initialAnalysisResult,
            timestamp: finalTimestamp,
        };
        await chatMessagesRef.add(firstMessageData);

        await analysisDocRef.update({ lastUpdatedAt: finalTimestamp });
        console.log(`[INITIATE_TOPIC] Parent analysis document ${analysisId} lastUpdatedAt updated.`);

        return {
            success: true,
            initialAnalysisResult: initialAnalysisResult, // Send the full result back
            message: "Initial topic analysis completed successfully."
        };

    } catch (error) {
        console.error(`[INITIATE_TOPIC] Error in handler (analysisId: ${data.analysisId}, topicId: ${data.topicId}):`, error);
        const errorTimestamp = admin.firestore.FieldValue.serverTimestamp();
        if (topicDocRef) {
            try {
                await topicDocRef.update({ status: "error_server", error: error.message, lastUpdatedAt: errorTimestamp });
            } catch (updateError) {
                console.error('[INITIATE_TOPIC] Failed to update topic status on server error:', updateError);
            }
        }
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', `Server error: ${error.message}`);
    }
}

module.exports = initiateTopicAnalysisHandler;