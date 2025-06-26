/**
 * @fileoverview A background Cloud Function triggered by file uploads to Cloud Storage.
 * This version is fully functional, with corrected path validation, and restores all 
 * original prompts, parameters, and error handling logic, while adding the automatic 
 * creation of the initial topic. It is fully v2 compatible.
 */


const { getFunctions } = require('firebase-admin/functions');
const { admin, firestore, storage } = require("./_lib/firebaseAdmin");
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient");
const { readFile, unlink } = require("fs/promises");
const Papa = require("papaparse");
const os = require('os');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');


// --- START: ORIGINAL HELPER FUNCTION (PRESERVED 100%) ---
function preprocessCsvData(csvString) {
    if (!csvString || typeof csvString !== 'string') {
        throw new Error('Invalid CSV string provided for preprocessing.');
    }
    const lines = csvString.split(/\r\n|\r|\n/);
    if (lines.length > 0) {
        lines[0] = lines[0].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    }
    const processedCsvString = lines.join('\n');
    const parseResult = Papa.parse(processedCsvString, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: true,
        transformHeader: header => (header || '').toString().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(),
    });

    if (parseResult.errors.length > 0) {
        console.warn('CSV parsing errors (will attempt to proceed):', parseResult.errors.slice(0, 5).map(e => e.message));
    }

    let data = parseResult.data.filter(row => row && Object.values(row).some(val => val !== null && val !== '' && val !== undefined));
    const originalHeaders = parseResult.meta.fields || [];

    if (data.length === 0) {
        return { cleanedData: [], cleanedHeaders: [], originalHeaders, rowCount: 0, columnCount: 0 };
    }

    const nonEmptyHeaders = originalHeaders.filter(header =>
        data.some(row => row[header] !== null && row[header] !== undefined && String(row[header]).trim() !== '')
    );

    data = data.map(row => {
        const newRow = {};
        nonEmptyHeaders.forEach(header => {
            newRow[header] = row[header];
        });
        return newRow;
    });

    data = data.filter(row =>
        nonEmptyHeaders.some(header => row[header] !== null && row[header] !== undefined && String(row[header]).trim() !== '')
    );

    return {
        cleanedData: data,
        cleanedHeaders: nonEmptyHeaders,
        originalHeaders: originalHeaders,
        rowCount: data.length,
        columnCount: nonEmptyHeaders.length,
    };
}
// --- END: ORIGINAL HELPER FUNCTION ---

/**
 * Background function handler triggered by Cloud Storage (v2 signature).
 * @param {object} event The CloudEvent object containing all event data.
 */
async function processUploadedCsvHandler(event) {
    const fileBucket = event.data.bucket;
    const filePath = event.data.name;

    // --- CORRECTED PATH VALIDATION LOGIC ---
    const pathParts = filePath.split('/');
    if (pathParts[0] !== 'raw_csvs' || pathParts.length < 4) {
        console.log(`Ignoring file '${filePath}' because its path does not match the required 'raw_csvs/{userId}/{analysisId}/{fileName}' structure.`);
        return null;
    }
    // --- END OF CORRECTION ---
    const userId = pathParts[1]; //
    const analysisId = pathParts[2];
    const analysisDocRef = firestore().collection('analyses').doc(analysisId);

    const maxRetries = 5;
    const delayMs = 2000; // 2 seconds
    
    let analysisDoc;
    let retries = 0;
    
    // Poll Firestore until the document exists or we run out of retries
    while (retries < maxRetries) {
        analysisDoc = await analysisDocRef.get();
        if (analysisDoc.exists) {
            console.log(`[PROCESS_CSV] Document ${analysisId} found after ${retries} retries. Proceeding.`);
            break; // Exit the loop and proceed
        }
    
        console.log(`[PROCESS_CSV] Document ${analysisId} not found. Waiting ${delayMs}ms... (Attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        retries++;
    }
    
    // If the document still doesn't exist after all retries, exit gracefully.
    if (!analysisDoc || !analysisDoc.exists) {
        console.error(`[PROCESS_CSV] CRITICAL: Document ${analysisId} did not appear after ${maxRetries} retries. Abandoning processing.`);
        // Optionally, you could delete the orphaned CSV file from storage here.
        return null; 
    }
    
    console.log(`[PROCESS_CSV] Triggered for analysisId: ${analysisId}, file: ${filePath}`);
    
    
    console.log(`[PROCESS_CSV] Triggered for analysisId: ${analysisId}, file: ${filePath}`);

    try {
        await analysisDocRef.update({ status: "preprocessing_data", lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });

        const bucket = storage().bucket(fileBucket);
        const remoteFile = bucket.file(filePath);
        const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

        await remoteFile.download({ destination: tempFilePath });
        console.log(`[PROCESS_CSV] File downloaded to ${tempFilePath}`);

        const rawFileBuffer = await readFile(tempFilePath);
        const csvString = rawFileBuffer.toString('utf-8');
        
        const { cleanedData, cleanedHeaders, rowCount, columnCount } = preprocessCsvData(csvString);

        if (rowCount === 0 || columnCount === 0) {
            throw new Error('CSV processing resulted in no usable data. The file might be empty or incorrectly formatted.');
        }
        console.log(`[PROCESS_CSV] CSV preprocessed: ${rowCount} rows, ${columnCount} columns.`);

        const sampleSizeForPrompt = Math.min(rowCount, 500);
        const sampleDataForSummaryPrompt = cleanedData.slice(0, sampleSizeForPrompt).map(row =>
            Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value).slice(0, 100)]))
        );
        
        // --- AUTHENTICATION & PROXY SETUP ---
        const profileDoc = await firestore().collection('users').doc(userId).get();
        if (!profileDoc.exists || !profileDoc.data().apiKeySecretName) {
            throw new Error(`User profile or apiKeySecretName not found for user ${userId}.`);
        }
        const apiKeyName = profileDoc.data().apiKeySecretName;


        // --- ORIGINAL, FULLY-FEATURED PROMPT 1 RESTORED ---
        const dataSummaryPrompt = `
Przeanalizuj poniższe nagłówki danych CSV oraz dostarczoną próbkę wierszy, aby dostarczyć kompleksowe, strukturalne podsumowanie obejmujące zarówno kolumny, jak i wiersze.
Nagłówki: ${cleanedHeaders.join(', ')}.
Całkowita liczba wierszy w zbiorze: ${rowCount}.
Całkowita liczba kolumn w zbiorze: ${columnCount}.
Próbka danych (${sampleDataForSummaryPrompt.length} wierszy):
${sampleDataForSummaryPrompt.map(row => JSON.stringify(row)).join('\n')}

Zwróć obiekt JSON o następującej strukturze:
{
  "columns": [
    { 
      "name": "nazwa_kolumny_1", 
      "inferredType": "string/numeric/boolean/date/other", 
      "stats": { "mean": null, "median": null, "uniqueValues": null, "missingValues": 0, "min": null, "max": null, "mostFrequent": null },
      "description": "Krótki opis kolumny i jej potencjalne znaczenie." 
    }
  ],
  "rowInsights": [
    {
      "rowIndexOrIdentifier": "Numer wiersza w próbce (0-indeksowany) lub kluczowe wartości identyfikujące wiersz",
      "observation": "Opis, co jest szczególnego lub interesującego w tym wierszu, np. wartości odstające, nietypowe kombinacje wartości w różnych kolumnach.",
      "relevantColumns": ["kolumna1", "kolumna2"]
    }
  ],
  "generalObservations": [
    "Ogólne spostrzeżenie 1...",
    "Ogólne spostrzeżenie 2..."
  ],
  "rowCountProvidedSample": ${sampleDataForSummaryPrompt.length},
  "columnCount": ${columnCount},
  "potentialProblems": ["wymień wszelkie zaobserwowane potencjalne problemy z jakością danych, np. wiele brakujących wartości w kolumnie, niespójności"]
}
Dla 'columns.inferredType', użyj jednej z wartości: string, numeric, boolean, date, other.
Dla 'columns.stats', podaj odpowiednie statystyki; jeśli statystyka nie ma zastosowania, użyj null. Zawsze dołączaj 'missingValues'. Dodaj 'mostFrequent' dla kolumn kategorycznych/tekstowych, jeśli to ma sens.
Dla 'columns.description', krótko opisz zawartość i potencjalne znaczenie kolumny.
Dla 'rowInsights', wybierz 2-3 najbardziej wyróżniające się wiersze z dostarczonej próbki i opisz je. Wskaż numer wiersza z próbki (0-indeksowany) lub podaj kluczowe wartości, które go identyfikują.
Dla 'generalObservations', podaj zwięzłe, ogólne spostrzeżenia.
WAŻNE: Cała odpowiedź musi być prawidłowym obiektem JSON. Wszelkie cudzysłowy (") w wartościach tekstowych MUSZĄ być poprawnie poprzedzone znakiem ucieczki jako \\".

Twoja ostateczna odpowiedź MUSI zawierać TYLKO i wyłącznie kompletny, prawidłowo sformatowany obiekt JSON. Nie dołączaj żadnych dodatkowych tekstów, wyjaśnień, ani odniesień po zakończeniu obiektu JSON.

`;
 
        console.log('[PROCESS_CSV] Calling Gemini for data summary...');
        const keyVault = JSON.parse(process.env.GEMINI_API_KEY_VAULT);
        const apiKey = keyVault[apiKeyName];

        if (!apiKey) {
            console.error(`Configuration error: Key "${apiKeyName}" not found in vault.`);
            response.status(500).json({ error: `Internal configuration error.` });
            return;
        }
        const model = getGenerativeModel("gemini-2.5-flash-preview-05-20", apiKey);
        // --- ORIGINAL GEMINI PARAMETERS RESTORED ---
        const resultSummary = await model.generateContent(dataSummaryPrompt, {
            temperature: 0.3,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            candidateCount: 1
        });
        
        // Corrected validation to check for candidates at the top level
        if (!resultSummary || !resultSummary.candidates || resultSummary.candidates.length === 0 || !resultSummary.candidates[0].content || !resultSummary.candidates[0].content.parts || resultSummary.candidates[0].content.parts.length === 0) {
            // Log the actual response from Gemini for easier debugging in the future
            console.error('[PROCESS_CSV] Gemini returned an invalid response or was blocked. Full response:', JSON.stringify(resultSummary, null, 2));
            throw new Error('Gemini API returned no valid candidates or content parts for the data summary.');
        }

        // Corrected text extraction from the actual response structure
        const responseTextSummary = resultSummary.candidates[0].content.parts[0].text;
 
        const cleanedResponseTextSummary = cleanPotentialJsonMarkdown(responseTextSummary);
        
        let dataSummaryForPrompts;
        try {
            dataSummaryForPrompts = JSON.parse(cleanedResponseTextSummary);
        } catch (parseError) {
            console.error('[PROCESS_CSV] Failed to parse data summary JSON response:', cleanedResponseTextSummary);
            throw new Error(`Failed to parse AI data summary response as JSON: ${parseError.message}`);
        }
        
        console.log('[PROCESS_CSV] Data summary parsed successfully.');

        // --- ORIGINAL, FULLY-FEATURED PROMPT 2 RESTORED ---
        const dataNaturePrompt = `
Na podstawie następującego podsumowania danych (które zawiera analizę kolumn i spostrzeżenia dotyczące wierszy):
${JSON.stringify(dataSummaryForPrompts, null, 2)}

Krótko opisz ogólną naturę tego zbioru danych w 1-2 zdaniach. 
Zasugeruj 1-2 ogólne typy analizy, do których byłby on najbardziej odpowiedni, biorąc pod uwagę zarówno charakterystyki kolumn, jak i przykładowe spostrzeżenia dotyczące wierszy.
Opis powinien być zwięzły i informacyjny. Nie używaj formatowania HTML. Odpowiedź powinna być zwykłym tekstem.
        `;

        console.log('[PROCESS_CSV] Calling Gemini for data nature description...');
        // --- ORIGINAL GEMINI PARAMETERS RESTORED ---
        console.log('[PROCESS_CSV] Calling Gemini for data nature description...');
        // --- ORIGINAL GEMINI PARAMETERS RESTORED ---
        const resultNature = await model.generateContent(dataNaturePrompt, {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
            candidateCount: 1
        });
        
        // Corrected validation for the second API call
        if (!resultNature || !resultNature.candidates || resultNature.candidates.length === 0 || !resultNature.candidates[0].content || !resultNature.candidates[0].content.parts || !resultNature.candidates[0].content.parts.length === 0) {
            console.error('[PROCESS_CSV] Gemini returned an invalid response for data nature description. Full response:', JSON.stringify(resultNature, null, 2));
            throw new Error('Gemini API returned no valid candidates or content parts for the data nature description.');
        }
        
        // Corrected text extraction for the second API call
        const dataNatureDescriptionText = resultNature.candidates[0].content.parts[0].text;
        console.log('[PROCESS_CSV] Data nature description generated.');

        const cleanedCsvString = Papa.unparse(cleanedData);
        const cleanedCsvStoragePath = `cleaned_csvs/${analysisId}/cleaned_data.csv`;
        await storage().bucket(fileBucket).file(cleanedCsvStoragePath).save(cleanedCsvString, {
            metadata: { contentType: 'text/csv' }
        });
        console.log(`[PROCESS_CSV] Cleaned CSV uploaded: ${cleanedCsvStoragePath}`);

        const analysisDocUpdateData = {
            cleanedCsvStoragePath,
            dataSummaryForPrompts,
            dataNatureDescription: dataNatureDescriptionText,
            rowCount,
            columnCount,
            lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "ready_for_topic_analysis",
            smallDatasetRawData: null
        };
        
        // --- ORIGINAL SMALL DATASET LOGIC RESTORED ---
        const SMALL_DATASET_THRESHOLD_CELLS = 2000;
        const SMALL_DATASET_THRESHOLD_JSON_LENGTH = 1000000; // Firestore document limit is ~1MB, this is a safe margin
        if (rowCount * columnCount <= SMALL_DATASET_THRESHOLD_CELLS) {
            try {
                const tempStringified = JSON.stringify(cleanedData);
                if (tempStringified.length <= SMALL_DATASET_THRESHOLD_JSON_LENGTH) {
                    analysisDocUpdateData.smallDatasetRawData = cleanedData;
                    console.log(`[PROCESS_CSV] Small dataset (${rowCount}x${columnCount}), storing full data in Firestore.`);
                } else {
                    console.log(`[PROCESS_CSV] Small dataset is too large to store as JSON (${tempStringified.length} bytes).`);
                }
            } catch (stringifyError) {
                console.error("[PROCESS_CSV] Error stringifying small dataset:", stringifyError);
            }
        }

        console.log(`[PROCESS_CSV] Updating Firestore document ${analysisId} with final data.`);
        await analysisDocRef.update(analysisDocUpdateData);
        console.log(`[PROCESS_CSV] Analysis ${analysisId} successfully processed.`);
        
        // --- NEW FEATURE: AUTOMATICALLY CREATE THE FIRST TOPIC ---
        const initialTopicId = 'profitability_analysis_default';
        const initialTopicRef = analysisDocRef.collection('topics').doc(initialTopicId);
        
        await initialTopicRef.set({
            topicDisplayName: "Analiza rentowności procesu",
            status: "submitted",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isDefault: true
        });

        console.log(`[PROCESS_CSV] Initial topic 'Analiza rentowności procesu' created for analysis ${analysisId}.`);

        // --- ORIGINAL CLEANUP LOGIC ---
        return unlink(tempFilePath);

    } catch (error) {
        console.error(`[PROCESS_CSV] CRITICAL ERROR for analysisId ${analysisId}:`, error);
        // Update Firestore document with error status for the client to see
        await analysisDocRef.update({
            status: "error_processing",
            errorMessage: error.message,
            lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return null;
    }
}

module.exports = { processUploadedCsvHandler };