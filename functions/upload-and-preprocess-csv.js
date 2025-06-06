// File: functions/upload-and-preprocess-csv.js
// Description: Handles CSV file uploads, advanced preprocessing, AI-driven summarization, and storage.
// Migrated from Vercel API route: api/upload-and-preprocess-csv.js (Corrected to include full original logic)

const formidable = require("formidable"); // For parsing multipart/form-data
const fs = require("fs/promises"); // For reading/unlinking temporary files
const Papa = require("papaparse"); // For CSV parsing
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const { admin, firestore, storage } = require("./_lib/firebaseAdmin"); // Firebase Admin SDK
const { getGenerativeModel, cleanPotentialJsonMarkdown } = require("./_lib/geminiClient"); // Gemini API client

// Helper function for advanced CSV preprocessing
function preprocessCsvData(csvString) {
  if (!csvString || typeof csvString !== 'string') {
    throw new Error('Invalid CSV string provided for preprocessing.');
  }

  // Pre-process headers: remove newlines, trim, and consolidate spaces
  const lines = csvString.split(/\r\n|\r|\n/);

  if (lines.length > 0) {
    lines[0] = lines[0].replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const processedCsvString = lines.join('\n');

  const parseResult = Papa.parse(processedCsvString, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: true,
    transformHeader: header => (header || '').toString().replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim(),
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

// Handler function for POST /api/upload-and-preprocess-csv
async function uploadAndPreprocessCsvHandler(req, res) {
  console.log('--- uploadAndPreprocessCsvHandler INVOKED (NEW LOGGING V4) ---');
  console.log('Request method:', req.method);
  console.log('GEMINI_API_KEY is set:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
  console.log('STORAGE_BUCKET_URL is set:', process.env.STORAGE_BUCKET_URL ? 'Yes' : 'No');

  if (req.method !== 'POST') {
    console.warn(`Method ${req.method} not allowed for /upload-and-preprocess-csv`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const form = new formidable.IncomingForm();
  let tempFilepath = null;

  // Add formidable event listeners for debugging
  form.on('error', (err) => {
    console.error('[UPLOAD_CSV] Formidable stream error:', err);
  });
  form.on('progress', (bytesReceived, bytesExpected) => {
    console.log(`[UPLOAD_CSV] Formidable progress: ${bytesReceived} / ${bytesExpected || 'unknown'}`);
  });
  form.on('fileBegin', (name, file) => {
    console.log(`[UPLOAD_CSV] Formidable fileBegin: fieldName='${name}', originalFilename='${file.originalFilename}', newFilename='${file.newFilename}', filepath='${file.filepath}'`);
  });
  form.on('file', (name, file) => {
    console.log(`[UPLOAD_CSV] Formidable file received: fieldName='${name}', path='${file.filepath}', originalFilename='${file.originalFilename}', size=${file.size}`);
  });
  form.on('field', (name, value) => {
    console.log(`[UPLOAD_CSV] Formidable field received: ${name} = ${value}`);
  });
  form.on('end', () => {
    console.log('[UPLOAD_CSV] Formidable form.on("end") event fired.');
  });
  form.on('aborted', () => {
    console.error('[UPLOAD_CSV] Formidable form.on("aborted") event fired. Request was aborted by the client or a network error.');
  });

  try {
    console.log('[UPLOAD_CSV] Starting wrapped form.parse promise...');
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('[UPLOAD_CSV] Error in form.parse callback:', err);
          reject(err);
          return;
        }
        console.log('[UPLOAD_CSV] form.parse callback successful. Fields and files received.');
        resolve([fields, files]);
      });
    });

    if (!files.csvFile || files.csvFile.length === 0) {
      console.warn("[UPLOAD_CSV] No CSV file uploaded under 'csvFile' field.");
      return res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
    }

    const csvFile = files.csvFile[0];
    tempFilepath = csvFile.filepath;
    console.log(`[UPLOAD_CSV] Temporary file path: ${tempFilepath}`);
    
    if (!fields.analysisName || fields.analysisName.length === 0 || !fields.analysisName[0].trim()) {
      console.warn("[UPLOAD_CSV] Analysis name is missing or empty.");
      return res.status(400).json({ success: false, message: 'Analysis name is required and cannot be empty.' });
    }

    const analysisName = fields.analysisName[0].trim();
    const originalFileName = csvFile.originalFilename || 'uploaded_file.csv';
    const analysisId = uuidv4();
    
    console.log(`[UPLOAD_CSV] Processing new analysis: ${analysisName} (ID: ${analysisId}), original file: ${originalFileName}`);

    console.log('[UPLOAD_CSV] Reading raw file buffer...');
    const rawFileBuffer = await fs.readFile(csvFile.filepath);
    console.log('[UPLOAD_CSV] Raw file buffer read. Uploading to Storage...');
    
    const bucket = storage.bucket();
    const rawCsvStoragePath = `raw_csvs/${analysisId}/${originalFileName}`;
    await bucket.file(rawCsvStoragePath).save(rawFileBuffer, {
      metadata: { contentType: csvFile.mimetype || 'text/csv' },
    });
    console.log(`[UPLOAD_CSV] Raw CSV uploaded to Firebase Storage: ${rawCsvStoragePath}`);
    
    console.log('[UPLOAD_CSV] Unlinking temporary file...');
    await fs.unlink(csvFile.filepath);
    tempFilepath = null;
    console.log('[UPLOAD_CSV] Temporary file unlinked.');

    console.log('[UPLOAD_CSV] Starting CSV preprocessing...');
    const csvString = rawFileBuffer.toString('utf-8');
    const { cleanedData, cleanedHeaders, rowCount, columnCount } = preprocessCsvData(csvString);
    
    if (rowCount === 0 || columnCount === 0) {
      console.warn("[UPLOAD_CSV] CSV processing resulted in no usable data.");
      return res.status(400).json({ 
        success: false, 
        message: 'CSV processing resulted in no usable data. The file might be empty or incorrectly formatted.' 
      });
    }
    console.log(`[UPLOAD_CSV] CSV preprocessed: ${rowCount} rows, ${columnCount} columns.`);

    console.log('[UPLOAD_CSV] Preparing sample for Gemini dataSummaryForPrompts...');
    const sampleSizeForPrompt = Math.min(rowCount, 13);
    const sampleDataForSummaryPrompt = cleanedData.slice(0, sampleSizeForPrompt).map(row => 
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value).slice(0,100)]))
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
WAŻNE: Cała odpowiedź musi być prawidłowym obiektem JSON. Wszelkie cudzysłowy (") w wartościach tekstowych MUSZĄ być poprawnie poprzedzone znakiem ucieczki jako ".
    `;

    let dataSummaryForPrompts;
    try {
      console.log('[UPLOAD_CSV] Calling Gemini for dataSummaryForPrompts...');
      const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
      const result = await model.generateContent(dataSummaryPrompt, {
        responseMimeType: 'application/json'
      });
      
      const responseText = result.response.text();
      const cleanedResponseText = cleanPotentialJsonMarkdown(responseText);
      dataSummaryForPrompts = JSON.parse(cleanedResponseText);
      console.log('[UPLOAD_CSV] Data summary generated by Gemini.');
    } catch(geminiError) {
      console.error("[UPLOAD_CSV] Gemini error during dataSummaryForPrompts generation:", geminiError);
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
      console.log('[UPLOAD_CSV] Calling Gemini for dataNatureDescription...');
      const model = getGenerativeModel("gemini-2.5-flash-preview-05-20");
      const result = await model.generateContent(dataNaturePrompt);
      dataNatureDescriptionText = result.response.text();
      console.log('[UPLOAD_CSV] Data nature description generated by Gemini.');
    } catch(geminiError) {
      console.error("[UPLOAD_CSV] Gemini error during dataNatureDescription generation:", geminiError);
      return res.status(500).json({ 
        success: false, 
        message: `Failed to generate data nature description with AI: ${geminiError.message}` 
      });
    }

    console.log('[UPLOAD_CSV] Saving cleaned CSV to Storage...');
    const cleanedCsvString = Papa.unparse(cleanedData);
    const cleanedCsvStoragePath = `cleaned_csvs/${analysisId}/cleaned_data.csv`;
    await bucket.file(cleanedCsvStoragePath).save(cleanedCsvString, { 
      metadata: { contentType: 'text/csv' } 
    });
    console.log(`[UPLOAD_CSV] Cleaned CSV uploaded to Firebase Storage: ${cleanedCsvStoragePath}`);

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
    };

    const SMALL_DATASET_THRESHOLD_CELLS = 200;
    const SMALL_DATASET_THRESHOLD_JSON_LENGTH = 200000;
    
    if (rowCount * columnCount <= SMALL_DATASET_THRESHOLD_CELLS) {
      try {
        const tempStringified = JSON.stringify(cleanedData);
        if (tempStringified.length <= SMALL_DATASET_THRESHOLD_JSON_LENGTH) {
          analysisDocData.smallDatasetRawData = cleanedData;
          console.log(`[UPLOAD_CSV] Small dataset (${rowCount}x${columnCount}), storing full cleanedData in Firestore.`);
        } else {
          console.log(`[UPLOAD_CSV] Small dataset (${rowCount}x${columnCount}), but serialized JSON is too large (${tempStringified.length} bytes). Not storing.`);
          analysisDocData.smallDatasetRawData = null;
        }
      } catch (stringifyError) {
        console.error("[UPLOAD_CSV] Error stringifying small dataset:", stringifyError);
        analysisDocData.smallDatasetRawData = null;
      }
    }

    console.log('[UPLOAD_CSV] Saving analysis document to Firestore...');
    await firestore.collection('analyses').doc(analysisId).set(analysisDocData);
    console.log(`[UPLOAD_CSV] Analysis document created in Firestore with ID: ${analysisId}`);

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
    console.error('[UPLOAD_CSV] Error processing CSV:', error);
    
    if (tempFilepath) {
      try {
        await fs.unlink(tempFilepath);
      } catch (unlinkError) {
        console.error('[UPLOAD_CSV] Error cleaning up temporary file:', unlinkError);
      }
    }

    return res.status(500).json({
      success: false,
      message: `Error processing CSV: ${error.message}`
    });
  }
}

module.exports = uploadAndPreprocessCsvHandler;
