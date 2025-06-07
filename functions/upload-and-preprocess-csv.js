// File: functions/upload-and-preprocess-csv.js
// Description: Final update using a direct event-driven busboy pattern to prevent stream errors.

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

// Helper function for advanced CSV preprocessing (This function is unchanged)
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
        nonEmptyHeaders.forEach(header => { newRow[header] = row[header]; });
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
        columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
    };
}


/**
 * Modernized handler function using a direct, robust event-driven pattern with Busboy.
 * This is the standard approach for reliable file uploads in Cloud Functions.
 */
function uploadAndPreprocessCsvHandler(req, res) {
    console.log('--- Busboy CSV Handler for Express INVOKED (Event-Driven Pattern) ---');

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    const busboy = Busboy({ headers: req.headers });
    
    // This object will accumulate all the fields, file paths, and promises.
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
        tempFilepathForCleanup = filepath; // Keep track for cleanup on error
        
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
            // Wait for all file writes to complete
            await Promise.all(uploadContext.fileWrites);
            console.log('[PROCESSING] All file writes complete. Starting main logic.');

            // --- ALL SUBSEQUENT LOGIC IS NOW SAFELY INSIDE THE 'finish' EVENT ---
            
            // --- FILE AND FIELD VALIDATION ---
            if (uploadContext.files.length === 0) {
                console.warn('[VALIDATION] Failed: No CSV file was uploaded.');
                return res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
            }
            const csvFile = uploadContext.files[0];
            const tempFilepath = csvFile.filepath; // Use this path for processing

            if (!uploadContext.fields.analysisName || !uploadContext.fields.analysisName.trim()) {
                console.warn('[VALIDATION] Failed: Analysis name is required.');
                return res.status(400).json({ success: false, message: 'Analysis name is required.' });
            }
            console.log('[VALIDATION] Initial validation passed.');

            const analysisName = uploadContext.fields.analysisName.trim();
            const originalFileName = csvFile.filename || 'uploaded_file.csv';
            const analysisId = uuidv4();
            console.log(`[PROCESSING] Started: ${analysisName} (ID: ${analysisId})`);

            const rawFileBuffer = await readFile(tempFilepath);
            const bucket = storage.bucket();
            const rawCsvStoragePath = `raw_csvs/${analysisId}/${originalFileName}`;
            await bucket.file(rawCsvStoragePath).save(rawFileBuffer, { metadata: { contentType: csvFile.mimeType || 'text/csv' } });
            console.log(`[PROCESSING] Raw CSV uploaded to: ${rawCsvStoragePath}`);

            await unlink(tempFilepath);
            console.log('[PROCESSING] Temporary file unlinked.');

            const csvString = rawFileBuffer.toString('utf-8');
            const { cleanedData, cleanedHeaders, rowCount, columnCount } = preprocessCsvData(csvString);

            if (rowCount === 0) {
                return res.status(400).json({ success: false, message: 'CSV processing resulted in no usable data.' });
            }
            console.log(`[PROCESSING] CSV preprocessed: ${rowCount} rows, ${columnCount} columns.`);

            console.log('[GEMINI] Preparing sample for Gemini data summary...');
            const sampleSizeForPrompt = Math.min(rowCount, 13);
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
WAŻNE: Cała odpowiedź musi być prawidłowym obiektem JSON. Wszelkie cudzysłowy (") w wartościach tekstowych MUSZĄ być poprawnie poprzedzone znakiem ucieczki jako \\".`;

            let dataSummaryForPrompts;
            try {
                console.log('[GEMINI] Calling Gemini for data summary...');
                const model = getGenerativeModel("gemini-2.5-flash-preview-05-20"); 
                const result = await model.generateContent(dataSummaryPrompt, { responseMimeType: 'application/json' });
                const cleanedResponseText = cleanPotentialJsonMarkdown(result.response.text());
                dataSummaryForPrompts = JSON.parse(cleanedResponseText);
                console.log('[GEMINI] Data summary generated by Gemini.');
            } catch (geminiError) {
                console.error("[GEMINI] Gemini error during data summary generation:", geminiError);
                return res.status(500).json({ success: false, message: `Failed to generate data summary with AI: ${geminiError.message}` });
            }

            const dataNaturePrompt = `
Na podstawie następującego podsumowania danych (które zawiera analizę kolumn i spostrzeżenia dotyczące wierszy):
${JSON.stringify(dataSummaryForPrompts, null, 2)}

Krótko opisz ogólną naturę tego zbioru danych w 1-2 zdaniach. 
Zasugeruj 1-2 ogólne typy analizy, do których byłby on najbardziej odpowiedni, biorąc pod uwagę zarówno charakterystyki kolumn, jak i przykładowe spostrzeżenia dotyczące wierszy.
Opis powinien być zwięzły i informacyjny. Nie używaj formatowania HTML. Odpowiedź powinna być zwykłym tekstem.`;

            let dataNatureDescriptionText;
            try {
                console.log('[GEMINI] Calling Gemini for data nature description...');
                const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
                const result = await model.generateContent(dataNaturePrompt);
                dataNatureDescriptionText = result.response.text();
                console.log('[GEMINI] Data nature description generated by Gemini.');
            } catch (geminiError) {
                console.error("[GEMINI] Gemini error during data nature description generation:", geminiError);
                return res.status(500).json({ success: false, message: `Failed to generate data nature description with AI: ${geminiError.message}` });
            }

            console.log('[STORAGE] Saving cleaned CSV to Storage...');
            const cleanedCsvString = Papa.unparse(cleanedData);
            const cleanedCsvStoragePath = `cleaned_csvs/${analysisId}/cleaned_data.csv`;
            await bucket.file(cleanedCsvStoragePath).save(cleanedCsvString, { metadata: { contentType: 'text/csv' } });
            console.log(`[STORAGE] Cleaned CSV uploaded to: ${cleanedCsvStoragePath}`);

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

            const SMALL_DATASET_THRESHOLD_CELLS = 200;
            const SMALL_DATASET_THRESHOLD_JSON_LENGTH = 200000;
            if (rowCount * columnCount <= SMALL_DATASET_THRESHOLD_CELLS) {
                const tempStringified = JSON.stringify(cleanedData);
                if (tempStringified.length <= SMALL_DATASET_THRESHOLD_JSON_LENGTH) {
                    analysisDocData.smallDatasetRawData = cleanedData;
                    console.log(`[FIRESTORE] Small dataset (${rowCount}x${columnCount}), storing full data in Firestore.`);
                }
            }

            console.log('[FIRESTORE] Saving analysis document to Firestore...');
            await firestore.collection('analyses').doc(analysisId).set(analysisDocData);
            console.log(`[FIRESTORE] Analysis document created in Firestore with ID: ${analysisId}`);

            console.log(`[SUCCESS] Analysis ${analysisId} successful. Sending final response.`);
            return res.status(200).json({
                success: true,
                message: 'File processed successfully',
                analysisId: analysisId,
                analysisName: analysisName,
                rowCount: rowCount,
                columnCount: columnCount,
                dataSummary: dataSummaryForPrompts,
                dataNatureDescription: dataNatureDescriptionText
            });

        } catch (error) {
            console.error('[CRITICAL] An error occurred within the finish event handler:', error);
            if (tempFilepathForCleanup) {
                await unlink(tempFilepathForCleanup).catch(e => console.error("Error unlinking temp file on failure:", e));
            }
            return res.status(500).json({ success: false, message: 'An internal server error occurred during processing.' });
        }
    });

    busboy.on('error', (err) => {
        console.error('[CRITICAL] Busboy stream error:', err);
        return res.status(500).json({ success: false, message: 'An error occurred during file upload.' });
    });
    
    // Start the process by piping the request to busboy
    req.pipe(busboy);
}

// Export the handler for your router to use
module.exports = uploadAndPreprocessCsvHandler;
