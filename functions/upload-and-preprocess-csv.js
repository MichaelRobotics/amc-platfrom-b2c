// File: functions/upload-and-preprocess-csv.js
// Description: Final version with corrected Gemini response handling.

// --- Start of Updated Dependencies ---
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
// --- End of Updated Dependencies ---

const { readFile, unlink } = require("fs/promises");
const Papa = require("papaparse");
const { v4: uuidv4 } = require("uuid");
const { admin, firestore, storage } = require("./_lib/firebaseAdmin");
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient");

// --- FULL, ORIGINAL HELPER FUNCTION RESTORED ---
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


/**
 * Modernized handler function with all original logic restored.
 */
function uploadAndPreprocessCsvHandler(req, res) {
    // --- Manual CORS Pre-flight handling ---
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        console.log('Responding to OPTIONS pre-flight request.');
        res.status(204).send('');
        return;
    }

    console.log('--- Busboy CSV Handler INVOKED ---');
    const busboy = Busboy({ headers: req.headers });

    const uploadContext = {
        fields: {},
        files: [],
        fileWrites: []
    };
    let tempFilepathForCleanup = null;

    busboy.on('field', (fieldname, val) => {
        console.log(`[BUSBOY] Field [${fieldname}]: value captured.`);
        uploadContext.fields[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, fileInfo) => {
        console.log(`[BUSBOY] File [${fieldname}]: filename: ${fileInfo.filename}`);
        const filepath = path.join(os.tmpdir(), fileInfo.filename);
        tempFilepathForCleanup = filepath;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        const promise = new Promise((resolve, reject) => {
            file.on('end', () => writeStream.end());
            writeStream.on('finish', () => {
                console.log(`[BUSBOY] File write finished for ${filepath}`);
                uploadContext.files.push({
                    fieldname,
                    filepath,
                    filename: fileInfo.filename,
                    mimeType: fileInfo.mimeType
                });
                resolve();
            });
            writeStream.on('error', reject);
        });
        uploadContext.fileWrites.push(promise);
    });

    busboy.on('finish', async () => {
        console.log('[BUSBOY] Busboy finished parsing the request stream.');
        try {
            await Promise.all(uploadContext.fileWrites);
            console.log('[PROCESSING] All file writes complete. Starting main logic.');

            if (uploadContext.files.length === 0) {
                console.warn("[VALIDATION] No CSV file uploaded under 'csvFile' field.");
                return res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
            }

            const csvFile = uploadContext.files[0];
            const tempFilepath = csvFile.filepath;

            if (!uploadContext.fields.analysisName || !uploadContext.fields.analysisName.trim()) {
                console.warn("[VALIDATION] Analysis name is missing or empty.");
                return res.status(400).json({ success: false, message: 'Analysis name is required and cannot be empty.' });
            }

            const analysisName = uploadContext.fields.analysisName.trim();
            const originalFileName = csvFile.filename || 'uploaded_file.csv';
            const analysisId = uuidv4();

            console.log(`[PROCESSING] New analysis: ${analysisName} (ID: ${analysisId}), file: ${originalFileName}`);

            const rawFileBuffer = await readFile(tempFilepath);
            const bucket = storage().bucket();
            const rawCsvStoragePath = `raw_csvs/${analysisId}/${originalFileName}`;
            await bucket.file(rawCsvStoragePath).save(rawFileBuffer, {
                metadata: { contentType: csvFile.mimeType || 'text/csv' },
            });
            console.log(`[STORAGE] Raw CSV uploaded: ${rawCsvStoragePath}`);

            await unlink(tempFilepath);
            tempFilepathForCleanup = null; // Prevent cleanup in catch block
            console.log('[PROCESSING] Temporary file unlinked.');

            const csvString = rawFileBuffer.toString('utf-8');
            const { cleanedData, cleanedHeaders, rowCount, columnCount } = preprocessCsvData(csvString);

            if (rowCount === 0 || columnCount === 0) {
                console.warn("[VALIDATION] CSV processing resulted in no usable data.");
                return res.status(400).json({
                    success: false,
                    message: 'CSV processing resulted in no usable data. The file might be empty or incorrectly formatted.'
                });
            }
            console.log(`[PROCESSING] CSV preprocessed: ${rowCount} rows, ${columnCount} columns.`);

            const sampleSizeForPrompt = Math.min(rowCount, 500);
            const sampleDataForSummaryPrompt = cleanedData.slice(0, sampleSizeForPrompt).map(row =>
                Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value).slice(0, 100)]))
            );

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

            let dataSummaryForPrompts;
            try {
                console.log('[GEMINI] Calling Gemini for data summary...');
                const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
                const result = await model.generateContent(dataSummaryPrompt, {
                    responseMimeType: 'application/json'
                });
                
                // --- START: CORRECTED ROBUST RESPONSE HANDLING ---
                console.log('[GEMINI_DEBUG] Full result object from SDK:', JSON.stringify(result, null, 2));
                
                // The actual response object from the SDK doesn't have a nested .response property.
                // We access the candidates directly from the top-level result.
                if (!result || !result.candidates || result.candidates.length === 0) {
                    // Check for a safety block reason on the top-level result
                    if (result && result.promptFeedback && result.promptFeedback.blockReason) {
                        const reason = result.promptFeedback.blockReason;
                        console.error(`[GEMINI] Content generation blocked by safety filters. Reason: ${reason}`);
                        throw new Error(`Content generation blocked due to: ${reason}`);
                    }
                    console.error('[GEMINI] Invalid or unexpected response structure from Gemini API. No candidates found.');
                    throw new Error('Gemini API returned an invalid or empty response structure.');
                }
                
                // The text is nested deep inside the first candidate
                const responseText = result.candidates[0].content.parts[0].text;
                const cleanedResponseText = cleanPotentialJsonMarkdown(responseText);
                
                try {
                    dataSummaryForPrompts = JSON.parse(cleanedResponseText);
                    console.log('[GEMINI] Data summary parsed successfully.');
                } catch (jsonParseError) {
                    console.error("[GEMINI] Failed to parse cleaned response as JSON.", jsonParseError);
                    throw new Error(`The AI returned text that was not valid JSON after cleaning. Raw text: "${cleanedResponseText}"`);
                }
                // --- END: CORRECTED ROBUST RESPONSE HANDLING ---

            } catch (geminiError) {
                console.error("[GEMINI] Error during data summary generation:", geminiError);
                return res.status(500).json({
                    success: false,
                    message: `Failed to generate data summary with AI: ${geminiError.message}`
                });
            }

            const dataNaturePrompt = `
Na podstawie następującego podsumowania danych (które zawiera analizę kolumn i spostrzeżenia dotyczące wierszy):
${JSON.stringify(dataSummaryForPrompts, null, 2)}

Krótko opisz ogólną naturę tego zbioru danych w 1-2 zdaniach. 
Zasugeruj 1-2 ogólne typy analizy, do których byłby on najbardziej odpowiedni, biorąc pod uwagę zarówno charakterystyki kolumn, jak i przykładowe spostrzeżenia dotyczące wierszy.
Opis powinien być zwięzły i informacyjny. Nie używaj formatowania HTML. Odpowiedź powinna być zwykłym tekstem.
            `;

            let dataNatureDescriptionText;
            try {
                console.log('[GEMINI] Calling Gemini for data nature description...');
                const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
                const result = await model.generateContent(dataNaturePrompt);
                
                // Corrected response handling for this call as well
                if (!result || !result.candidates || result.candidates.length === 0) {
                    throw new Error('Gemini API returned an invalid response for data nature description.');
                }
                
                dataNatureDescriptionText = result.candidates[0].content.parts[0].text;
                console.log('[GEMINI] Data nature description generated.');
            } catch (geminiError) {
                console.error("[GEMINI] Error during data nature description generation:", geminiError);
                return res.status(500).json({
                    success: false,
                    message: `Failed to generate data nature description with AI: ${geminiError.message}`
                });
            }

            const cleanedCsvString = Papa.unparse(cleanedData);
            const cleanedCsvStoragePath = `cleaned_csvs/${analysisId}/cleaned_data.csv`;
            await storage().bucket().file(cleanedCsvStoragePath).save(cleanedCsvString, {
                metadata: { contentType: 'text/csv' }
            });
            console.log(`[STORAGE] Cleaned CSV uploaded: ${cleanedCsvStoragePath}`);

            const analysisDocData = {
                analysisName,
                originalFileName,
                rawCsvStoragePath,
                cleanedCsvStoragePath,
                dataSummaryForPrompts,
                dataNatureDescription: dataNatureDescriptionText,
                rowCount,
                columnCount,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: "ready_for_topic_analysis",
                smallDatasetRawData: null
            };

            const SMALL_DATASET_THRESHOLD_CELLS = 2000;
            const SMALL_DATASET_THRESHOLD_JSON_LENGTH = 2000000;
            if (rowCount * columnCount <= SMALL_DATASET_THRESHOLD_CELLS) {
                try {
                    const tempStringified = JSON.stringify(cleanedData);
                    if (tempStringified.length <= SMALL_DATASET_THRESHOLD_JSON_LENGTH) {
                        analysisDocData.smallDatasetRawData = cleanedData;
                        console.log(`[FIRESTORE] Small dataset (${rowCount}x${columnCount}), storing full data.`);
                    } else {
                        console.log(`[FIRESTORE] Small dataset is too large to store as JSON (${tempStringified.length} bytes).`);
                    }
                } catch (stringifyError) {
                    console.error("[FIRESTORE] Error stringifying small dataset:", stringifyError);
                }
            }

            console.log('[FIRESTORE] Saving analysis document...');
            await firestore().collection('analyses').doc(analysisId).set(analysisDocData);
            console.log(`[FIRESTORE] Analysis document created: ${analysisId}`);

            return res.status(200).json({
                success: true,
                message: 'CSV file processed successfully',
                analysisId,
                analysisName,
                rowCount,
                columnCount,
                dataSummary: dataSummaryForPrompts,
                dataNatureDescription: dataNatureDescriptionText
            });

        } catch (error) {
            console.error('[CRITICAL] Error in finish handler:', error);
            if (tempFilepathForCleanup) {
                try {
                    await unlink(tempFilepathForCleanup);
                } catch (unlinkError) {
                    console.error('[CLEANUP] Error removing temp file on failure:', unlinkError);
                }
            }
            return res.status(500).json({
                success: false,
                message: `Error processing CSV: ${error.message}`
            });
        }
    });

    busboy.on('error', (err) => {
        console.error('[CRITICAL] Busboy stream error:', err);
        return res.status(500).json({ success: false, message: 'An error occurred during file upload.' });
    });

    if (req.rawBody) {
        busboy.end(req.rawBody);
    } else {
        req.pipe(busboy);
    }
}

module.exports = uploadAndPreprocessCsvHandler;
