/**
 * @fileoverview A background Cloud Function triggered by file uploads to Cloud Storage.
 * This function contains the core data processing logic from the original
 * `upload-and-preprocess-csv.js` function. It is responsible for reading the
 * CSV, cleaning it, generating AI summaries, and updating the Firestore document.
 *
 * ALL DATA MANIPULATION ALGORITHMS AND PROMPTS ARE PRESERVED 100% FROM THE ORIGINAL.
 */

const { firestore, storage } = require("./_lib/firebaseAdmin");
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient");
const { readFile, unlink } = require("fs/promises");
const Papa = require("papaparse");
const os = require('os');
const path = require('path');
const fs = require('fs');

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
 * Background function handler triggered by Cloud Storage.
 * @param {object} object The Cloud Storage object metadata.
 */
async function processUploadedCsvHandler(object) {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    // We are only interested in files in the 'raw_csvs/' directory.
    // The path format is `raw_csvs/{analysisId}/{originalFileName}`.
    const pathParts = filePath.split('/');
    if (pathParts[0] !== 'raw_csvs' || pathParts.length < 3) {
        console.log(`Ignoring file '${filePath}' as it is not in a 'raw_csvs/{id}' directory.`);
        return null;
    }

    const analysisId = pathParts[1];
    const analysisDocRef = firestore().collection('analyses').doc(analysisId);

    console.log(`[PROCESS_CSV] Triggered for analysisId: ${analysisId}, file: ${filePath}`);

    try {
        await analysisDocRef.update({ status: "preprocessing_data", lastUpdatedAt: firestore.FieldValue.serverTimestamp() });

        const bucket = storage().bucket(fileBucket);
        const remoteFile = bucket.file(filePath);
        const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));

        await remoteFile.download({ destination: tempFilePath });
        console.log(`[PROCESS_CSV] File downloaded to ${tempFilePath}`);

        const rawFileBuffer = await readFile(tempFilePath);
        const csvString = rawFileBuffer.toString('utf-8');

        // --- ALL ORIGINAL PROCESSING LOGIC (PRESERVED 100%) ---
        const { cleanedData, cleanedHeaders, rowCount, columnCount } = preprocessCsvData(csvString);

        if (rowCount === 0 || columnCount === 0) {
            throw new Error('CSV processing resulted in no usable data. The file might be empty or incorrectly formatted.');
        }
        console.log(`[PROCESS_CSV] CSV preprocessed: ${rowCount} rows, ${columnCount} columns.`);

        const sampleSizeForPrompt = Math.min(rowCount, 500);
        const sampleDataForSummaryPrompt = cleanedData.slice(0, sampleSizeForPrompt).map(row =>
            Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value).slice(0, 100)]))
        );

        // --- ORIGINAL GEMINI PROMPT 1 (PRESERVED 100%) ---
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
        `;

        console.log('[PROCESS_CSV] Calling Gemini for data summary...');
        
        // CORRECTED: Using the new model and proper configuration
        const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
        const resultSummary = await model.generateContent(dataSummaryPrompt, {
            temperature: 0.3, // Lower temperature for more consistent structured output
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            candidateCount: 1
        });
        
        // --- CORRECTED GEMINI RESPONSE HANDLING ---
        if (!resultSummary || !resultSummary.response) {
            throw new Error('Gemini API returned an invalid or empty response structure for data summary.');
        }

        // Get the response text using the correct method
        const responseTextSummary = resultSummary.response.text();
        const cleanedResponseTextSummary = cleanPotentialJsonMarkdown(responseTextSummary);
        
        let dataSummaryForPrompts;
        try {
            dataSummaryForPrompts = JSON.parse(cleanedResponseTextSummary);
        } catch (parseError) {
            console.error('[PROCESS_CSV] Failed to parse data summary JSON response:', cleanedResponseTextSummary);
            throw new Error(`Failed to parse AI data summary response as JSON: ${parseError.message}`);
        }
        
        console.log('[PROCESS_CSV] Data summary parsed successfully.');

        // --- ORIGINAL GEMINI PROMPT 2 (PRESERVED 100%) ---
        const dataNaturePrompt = `
Na podstawie następującego podsumowania danych (które zawiera analizę kolumn i spostrzeżenia dotyczące wierszy):
${JSON.stringify(dataSummaryForPrompts, null, 2)}

Krótko opisz ogólną naturę tego zbioru danych w 1-2 zdaniach. 
Zasugeruj 1-2 ogólne typy analizy, do których byłby on najbardziej odpowiedni, biorąc pod uwagę zarówno charakterystyki kolumn, jak i przykładowe spostrzeżenia dotyczące wierszy.
Opis powinien być zwięzły i informacyjny. Nie używaj formatowania HTML. Odpowiedź powinna być zwykłym tekstem.
        `;

        console.log('[PROCESS_CSV] Calling Gemini for data nature description...');
        const resultNature = await model.generateContent(dataNaturePrompt, {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
            candidateCount: 1
        });
        
        // --- CORRECTED GEMINI RESPONSE HANDLING ---
        if (!resultNature || !resultNature.response) {
            throw new Error('Gemini API returned an invalid response for data nature description.');
        }

        const dataNatureDescriptionText = resultNature.response.text();
        console.log('[PROCESS_CSV] Data nature description generated.');

        // --- ORIGINAL CLEANED DATA STORAGE LOGIC (PRESERVED 100%) ---
        const cleanedCsvString = Papa.unparse(cleanedData);
        const cleanedCsvStoragePath = `cleaned_csvs/${analysisId}/cleaned_data.csv`;
        await storage().bucket().file(cleanedCsvStoragePath).save(cleanedCsvString, {
            metadata: { contentType: 'text/csv' }
        });
        console.log(`[PROCESS_CSV] Cleaned CSV uploaded: ${cleanedCsvStoragePath}`);

        // --- ORIGINAL FIRESTORE DOCUMENT STRUCTURE (PRESERVED 100%) ---
        const analysisDocUpdateData = {
            cleanedCsvStoragePath,
            dataSummaryForPrompts,
            dataNatureDescription: dataNatureDescriptionText,
            rowCount,
            columnCount,
            lastUpdatedAt: firestore.FieldValue.serverTimestamp(),
            status: "ready_for_topic_analysis",
            smallDatasetRawData: null
        };

        const SMALL_DATASET_THRESHOLD_CELLS = 2000;
        const SMALL_DATASET_THRESHOLD_JSON_LENGTH = 2000000;
        if (rowCount * columnCount <= SMALL_DATASET_THRESHOLD_CELLS) {
            try {
                const tempStringified = JSON.stringify(cleanedData);
                if (tempStringified.length <= SMALL_DATASET_THRESHOLD_JSON_LENGTH) {
                    analysisDocUpdateData.smallDatasetRawData = cleanedData;
                    console.log(`[PROCESS_CSV] Small dataset (${rowCount}x${columnCount}), storing full data.`);
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

        // Clean up the temporary file
        return unlink(tempFilePath);

    } catch (error) {
        console.error(`[PROCESS_CSV] CRITICAL ERROR for analysisId ${analysisId}:`, error);
        // Update Firestore document with error status for the client to see
        await analysisDocRef.update({
            status: "error_processing",
            errorMessage: error.message,
            lastUpdatedAt: firestore.FieldValue.serverTimestamp()
        });
        return null;
    }
}

module.exports = processUploadedCsvHandler;