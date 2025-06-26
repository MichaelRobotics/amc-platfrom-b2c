/**
 * @fileoverview A background Cloud Function triggered by the update of a topic
 * document in Firestore. This function contains the core topic analysis logic.
 * NOW FULLY COMPATIBLE WITH v2 FUNCTIONS.
 *
 * ALL DATA MANIPULATION ALGORITHMS AND PROMPTS ARE PRESERVED 100% FROM THE ORIGINAL.
 */

// We don't need the v1 'functions' import anymore.
const { getFunctions } = require('firebase-admin/functions');
const { admin, firestore } = require("./_lib/firebaseAdmin");
const { GoogleAuth } = require('google-auth-library');
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient");

/**
 * Background function handler triggered by a Firestore document update (v2 signature).
 * @param {object} event The CloudEvent object containing all event data.
 * @param {object} event.data A Change object containing the data before and after the event.
 * @param {object} event.params The wildcard parameters from the document path.
 */
async function analyzeTopicHandler(event) {
    // --- CORRECTED v2 PARAMETER HANDLING ---
    // Get the wildcard parameters from the event object
    const { analysisId, topicId } = event.params;
    // The snapshot of the document *after* the change
    const snapAfter = event.data.after;
    if (!snapAfter) {
        console.log(`[ANALYZE_TOPIC] Document ${topicId} was deleted. Exiting.`);
        return;
    }
    
    const topicData = snapAfter.data();
    const topicDocRef = snapAfter.ref;

    // We only want to run the analysis when the topic is first created/submitted.
    if (topicData.status !== 'submitted') {
        console.log(`[ANALYZE_TOPIC] Topic ${topicId} status is '${topicData.status}', not 'submitted'. Skipping analysis.`);
        return;
    }
    
    const { topicDisplayName } = topicData;

    console.log(`[ANALYZE_TOPIC] Triggered for analysisId: ${analysisId}, topicId: ${topicId}`);

    try {
        // --- ALL SUBSEQUENT LOGIC IS PRESERVED ---
        // Switch to an 'analyzing' status to prevent re-triggering.
        await topicDocRef.update({ status: "analyzing" });

        // --- AUTHENTICATION & PROXY SETUP ---
        const analysisDocRef = firestore().collection('analyses').doc(analysisId);
        const analysisDoc = await analysisDocRef.get();
        if (!analysisDoc.exists || !analysisDoc.data().userId) {
            throw new Error(`Parent analysis document or its userId not found for analysis ${analysisId}`);
        }
        const userId = analysisDoc.data().userId;

        const profileDoc = await firestore().collection('users').doc(userId).get();
        if (!profileDoc.exists || !profileDoc.data().apiKeySecretName) {
            throw new Error(`User profile or apiKeySecretName not found for user ${userId}.`);
        }
        const apiKeyName = profileDoc.data().apiKeySecretName;
        // --- END AUTHENTICATION ---

        const analysisData = analysisDoc.data();
        console.log(`[ANALYZE_TOPIC] Analysis document for ${analysisId} found.`);

        const {
            dataSummaryForPrompts = {},
            dataNatureDescription = "Not specified",
            smallDatasetRawData = null
        } = analysisData;

        if (Object.keys(dataSummaryForPrompts).length === 0 || !dataNatureDescription) {
            throw new Error('Analysis document is missing crucial context (dataSummaryForPrompts or dataNatureDescription).');
        }

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

        console.log(`[ANALYZE_TOPIC] Calling Gemini for initial analysis of topic: ${topicDisplayName}`);
        const keyVault = JSON.parse(process.env.GEMINI_API_KEY_VAULT);
        const apiKey = keyVault[apiKeyName];

        if (!apiKey) {
            console.error(`Configuration error: Key "${apiKeyName}" not found in vault.`);
            response.status(500).json({ error: `Internal configuration error.` });
            return;
        }
        const model = getGenerativeModel("gemini-2.5-flash-preview-05-20", apiKey);

        const result = await model.generateContent(initialPrompt, {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            candidateCount: 1
        });

        // Corrected validation to check for candidates at the top level
        if (!result || !result.candidates || result.candidates.length === 0 || !result.candidates[0].content || !result.candidates[0].content.parts || result.candidates[0].content.parts.length === 0) {
            // Log the actual response from Gemini for easier debugging in the future
            console.error('[ANALYZE_TOPIC] Gemini returned an invalid response or was blocked. Full response:', JSON.stringify(result, null, 2));
            throw new Error('Gemini API returned no valid candidates or content parts for the topic analysis.');
        }
        
        // Corrected text extraction from the actual response structure
        const responseText = result.candidates[0].content.parts[0].text;
        const cleanedResponseText = cleanPotentialJsonMarkdown(responseText);
        
        let initialAnalysisResult;
        try {
            initialAnalysisResult = JSON.parse(cleanedResponseText);
        } catch (parseError) {
            console.error('[ANALYZE_TOPIC] Failed to parse JSON response:', cleanedResponseText);
            throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
        }
        
        console.log('[ANALYZE_TOPIC] Initial topic analysis parsed successfully.');

        if (!initialAnalysisResult || !initialAnalysisResult.conciseInitialSummary || !initialAnalysisResult.initialFindings || !initialAnalysisResult.thoughtProcess || !initialAnalysisResult.questionSuggestions) {
             throw new Error("AI response for initial analysis was incomplete or missing required fields.");
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
            // detailedAnalysisBlock removed - no duplicate block
            timestamp: finalTimestamp,
        };
        await chatMessagesRef.add(firstMessageData);

        await analysisDocRef.update({ lastUpdatedAt: finalTimestamp });

        const notificationsRef = firestore().collection('notifications');
        await notificationsRef.add({
            message: `Analiza "${topicDisplayName}" jest gotowa do przeglądu.`,
            analysisId: analysisId,
            topicId: topicId,
            createdAt: finalTimestamp,
            read: false,
        });
        console.log(`[ANALYZE_TOPIC] Notification created for analysis ${analysisId}.`);

        console.log(`[ANALYZE_TOPIC] Topic ${topicId} completed successfully.`);
        return null;

    } catch (error) {
        console.error(`[ANALYZE_TOPIC] CRITICAL ERROR for topicId ${topicId}:`, error);
        await topicDocRef.update({
            status: "error_analysis",
            errorMessage: error.message,
            lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return null;
    }
}

// Export the v2 compatible handler
module.exports = { analyzeTopicHandler };
