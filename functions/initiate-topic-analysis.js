// File: functions/initiate-topic-analysis.js
// Description: Handles the initiation of a detailed analysis for a specific, predefined topic.
// Migrated from Vercel API route: api/initiate-topic-analysis.js (Corrected to include full original logic)

const { admin, firestore } = require("./_lib/firebaseAdmin"); // Firebase Admin SDK
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient"); // Gemini API client

// Handler function for POST /api/initiate-topic-analysis
async function initiateTopicAnalysisHandler(req, res) {
  console.log('--- initiateTopicAnalysisHandler INVOKED (NEW LOGGING V2) ---');
  console.log('Request method:', req.method);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('GEMINI_API_KEY is set:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
  console.log('STORAGE_BUCKET_URL is set:', process.env.STORAGE_BUCKET_URL ? 'Yes' : 'No');

  if (req.method !== 'POST') {
    console.warn(`[INITIATE_TOPIC] Method ${req.method} not allowed for /initiate-topic-analysis`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  let topicDocRef; // Declare here to be accessible in catch block

  try {
    const { analysisId, topicId, topicDisplayName } = req.body;
    console.log(`[INITIATE_TOPIC] Parsed from req.body - analysisId: ${analysisId}, topicId: ${topicId}, topicDisplayName: ${topicDisplayName}`);

    // Validate inputs
    if (!analysisId || !topicId || !topicDisplayName) {
      console.warn("[INITIATE_TOPIC] Missing required fields: analysisId, topicId, or topicDisplayName.");
      return res.status(400).json({ success: false, message: 'Missing required fields: analysisId, topicId, or topicDisplayName.' });
    }
    console.log(`[INITIATE_TOPIC] Initiating topic analysis for analysisId: ${analysisId}, topicId: ${topicId}, displayName: ${topicDisplayName}`);

    console.log(`[INITIATE_TOPIC] Fetching analysis document: analyses/${analysisId}`);
    const analysisDocRef = firestore.collection('analyses').doc(analysisId);
    const analysisDoc = await analysisDocRef.get();

    if (!analysisDoc.exists) {
      console.warn(`[INITIATE_TOPIC] Analysis with ID ${analysisId} not found.`);
      return res.status(404).json({ success: false, message: `Analysis with ID ${analysisId} not found.` });
    }
    const analysisData = analysisDoc.data();
    console.log(`[INITIATE_TOPIC] Analysis document for ${analysisId} found.`);
    const { 
        dataSummaryForPrompts = {}, 
        dataNatureDescription = "Not specified", 
        smallDatasetRawData = null 
    } = analysisData;

    if (Object.keys(dataSummaryForPrompts).length === 0 || !dataNatureDescription) {
      console.warn(`[INITIATE_TOPIC] Analysis document ${analysisId} is missing dataSummaryForPrompts or dataNatureDescription.`);
      return res.status(400).json({ success: false, message: 'Analysis document is missing dataSummaryForPrompts or dataNatureDescription.' });
    }

    topicDocRef = firestore.collection('analyses').doc(analysisId).collection('topics').doc(topicId);
    console.log(`[INITIATE_TOPIC] Checking existing topic document: analyses/${analysisId}/topics/${topicId}`);
    const topicDoc = await topicDocRef.get();
    const initialTimestamp = admin.firestore.FieldValue.serverTimestamp();

    if (topicDoc.exists && topicDoc.data().initialAnalysisResult) {
      console.log(`[INITIATE_TOPIC] Initial analysis for topic ${topicId} already exists. Returning existing data.`);
      return res.status(200).json({
        success: true,
        data: topicDoc.data().initialAnalysisResult,
        message: "Initial analysis for this topic already existed."
      });
    }

    console.log(`[INITIATE_TOPIC] Setting topic ${topicId} status to "analyzing".`);
    await topicDocRef.set({
      topicDisplayName: topicDisplayName,
      status: "analyzing",
      createdAt: topicDoc.exists ? (topicDoc.data().createdAt || initialTimestamp) : initialTimestamp,
      lastUpdatedAt: initialTimestamp,
    }, { merge: true });
    console.log(`[INITIATE_TOPIC] Topic ${topicId} status set to "analyzing".`);

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
        console.log(`[INITIATE_TOPIC] Using full small dataset (${smallDatasetRawData.length} rows) and extended summary in prompt for initial analysis.`);
    } else {
        dataContextForPrompt = `
Podsumowanie statystyczne kolumn (zawierające także spostrzeżenia dotyczące wierszy z próbki i obserwacje ogólne):
${JSON.stringify(dataSummaryForPrompts, null, 2)}
`;
        console.log(`[INITIATE_TOPIC] Using extended data summary (with row insights) in prompt for initial analysis.`);
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
- "initialFindings": (String) Główna, szczegółowa część Twojej odpowiedzi na powyższe pytanie. Powinny to być Twoje kluczowe wstępne obserwacje, spostrzeżenia lub hipotezy. Jeśli odnosiłeś się do konkretnych wartości wierszy/kolumn, uwzględnij te odniesienia. Ten ciąg znaków powinien być sformatowany za pomocą tagów HTML dla akapitów (np. "<p>Spostrzeżenie 1.</p><p>Spostrzeżenie 2.</p>"). Kiedy odnosisz się do nazw kolumn (np. OperatorWorkload_%, TasksCompleted), NIE używaj odwrotnych apostrofów. Zamiast tego, otocz dokładną nazwę kolumny tagiem <span class="column-name-highlight"></span>. Na przykład, jeśli odnosisz się do 'OperatorWorkload_%', zapisz to jako <span class="column-name-highlight">OperatorWorkload_%</span>. WAŻNE: Cała wartość ciągu znaków dla "initialFindings" musi być prawidłowym ciągiem JSON. Wszelkie cudzysłowy (") w treści lub atrybutach HTML MUSZĄ być poprzedzone znakiem ucieczki jako ".
- "thoughtProcess": (String) Krótko wyjaśnij kroki lub rozumowanie, które doprowadziły Cię do sformułowania odpowiedzi w "initialFindings". Jeśli analizowałeś pełne dane lub 'rowInsights', opisz, jak poszczególne wiersze lub wartości wpłynęły na Twoje wnioski. Ten ciąg znaków powinien być sformatowany jako nieuporządkowana lista HTML (np. "<ul><li>Krok pierwszy wyjaśniający "dlaczego".</li><li>Krok drugi.</li><li>Krok trzeci.</li></ul>") zawierająca dokładnie 3 punkty. Kiedy odnosisz się do nazw kolumn, użyj tagu <span class="column-name-highlight"></span>. WAŻNE: Cała wartość ciągu znaków dla "thoughtProcess" musi być prawidłowym ciągiem JSON. Wszelkie cudzysłowy (") w treści lub atrybutach HTML MUSZĄ być poprzedzone znakiem ucieczki jako ".
- "questionSuggestions": (Array of strings) Podaj 3-5 wnikliwych pytań uzupełniających (zwykły tekst), które użytkownik mógłby zadać. Pytania te powinny być praktyczne i oparte na Twoich ustaleniach. NIE używaj odwrotnych apostrofów ani tagów span HTML dla nazw kolumn w tych sugestiach.

Styl Interakcji: Bądź analityczny, wnikliwy i proaktywny.
    `;
    
    console.log(`[INITIATE_TOPIC] Storing initial prompt for topic: ${topicDisplayName}`);
    await topicDocRef.update({ initialPromptSent: initialPrompt.substring(0, 10000) });
    console.log(`[INITIATE_TOPIC] Calling Gemini for initial analysis of topic: ${topicDisplayName}`);

    let initialAnalysisResult;
    try {
      const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
      const result = await model.generateContent(initialPrompt, {
        responseMimeType: 'application/json'
      });
      
      const responseText = result.response.text();
      const cleanedResponseText = cleanPotentialJsonMarkdown(responseText);
      initialAnalysisResult = JSON.parse(cleanedResponseText);
      console.log(`[INITIATE_TOPIC] Initial analysis for topic ${topicId} generated successfully by Gemini.`);
    } catch (geminiError) {
      console.error(`[INITIATE_TOPIC] Gemini API error for topic ${topicId}:`, geminiError);
      await topicDocRef.update({ status: "error_initial_analysis", error: geminiError.message, lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return res.status(500).json({ success: false, message: `Failed to generate initial analysis with AI: ${geminiError.message}` });
    }

    if (!initialAnalysisResult || !initialAnalysisResult.conciseInitialSummary || !initialAnalysisResult.initialFindings || !initialAnalysisResult.thoughtProcess || !initialAnalysisResult.questionSuggestions) {
      console.error("[INITIATE_TOPIC] Gemini response for initial analysis is missing required fields.", initialAnalysisResult);
      await topicDocRef.update({ status: "error_initial_analysis", error: "AI response missing required fields.", lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return res.status(500).json({ success: false, message: "AI response for initial analysis was incomplete." });
    }
    
    const finalTimestamp = admin.firestore.FieldValue.serverTimestamp();
    console.log(`[INITIATE_TOPIC] Updating topic document ${topicId} with results and status 'completed'.`);
    await topicDocRef.update({
      initialAnalysisResult: initialAnalysisResult, 
      status: "completed",
      lastUpdatedAt: finalTimestamp,
    });

    console.log(`[INITIATE_TOPIC] Adding first chat message for topic ${topicId}.`);
    const chatMessagesRef = topicDocRef.collection('chatMessages');
    const firstMessageData = {
      role: "model",
      parts: [{ text: initialAnalysisResult.conciseInitialSummary }],
      detailedAnalysisBlock: initialAnalysisResult,
      timestamp: finalTimestamp,
    };
    await chatMessagesRef.add(firstMessageData);
    console.log(`[INITIATE_TOPIC] First chat message (initial summary) added for topic ${topicId}.`);

    await analysisDocRef.update({ lastUpdatedAt: finalTimestamp });
    console.log(`[INITIATE_TOPIC] Parent analysis document ${analysisId} lastUpdatedAt updated.`);

    return res.status(200).json({
      success: true,
      data: initialAnalysisResult, 
      message: "Initial topic analysis completed successfully."
    });

  } catch (error) {
    console.error(`[INITIATE_TOPIC] Error in /api/initiate-topic-analysis (analysisId: ${req.body.analysisId}, topicId: ${req.body.topicId}):`, error);
    const errorTimestamp = admin.firestore.FieldValue.serverTimestamp();
    if (topicDocRef && typeof topicDocRef.update === 'function') { 
        try {
            await topicDocRef.update({ status: "error_server", error: error.message, lastUpdatedAt: errorTimestamp });
        } catch (updateError) {
            console.error('[INITIATE_TOPIC] Failed to update topic status on server error:', updateError);
        }
    }
    return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
}

module.exports = initiateTopicAnalysisHandler;
