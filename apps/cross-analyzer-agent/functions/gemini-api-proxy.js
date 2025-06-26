const { GoogleGenAI } = require("@google/genai");

async function geminiApiProxyHandler(request, response) {
    if (request.method !== 'POST') {
        response.status(405).send({ error: 'Method Not Allowed' });
        return;
    }

    const { apiKeyName, prompt, generationConfig } = request.body.data || {};

    if (!apiKeyName || !prompt || !generationConfig) {
        console.error("Proxy call missing 'apiKeyName', 'prompt', or 'generationConfig'");
        response.status(400).json({ 
            error: 'Request body must be a JSON object with a "data" key containing "apiKeyName", "prompt", and "generationConfig".' 
        });
        return;
    }

    try {
        const keyVault = JSON.parse(process.env.GEMINI_API_KEY_VAULT);
        const apiKey = keyVault[apiKeyName];

        if (!apiKey) {
            console.error(`Configuration error: Key "${apiKeyName}" not found in vault.`);
            response.status(500).json({ error: `Internal configuration error.` });
            return;
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        const contents = [{
            role: 'user',
            parts: [{ text: prompt }]
        }];

        // --- KLUCZOWA ZMIANA ---
        // Usuwamy błędny krok .getGenerativeModel() i wywołujemy API bezpośrednio,
        // przekazując wszystkie parametry w jednym obiekcie.
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-05-20", // Nazwa modelu jest tutaj parametrem
            contents: contents,
            generationConfig: generationConfig,
        });

        
        // Krok 4: Wysłanie odpowiedzi - dokumentacja wskazuje, że wynik jest w `result.response`
        const responseFromAI = result.response;
        // Sprawdzamy, czy odpowiedź nie jest pusta (zgodnie z poprzednim błędem)
        if (!responseFromAI || !responseFromAI.candidates || responseFromAI.candidates.length === 0) {
            console.error("Gemini API returned an empty or blocked response:", responseFromAI?.promptFeedback || "No feedback available.");
            // Zwracamy błąd, ale z bardziej szczegółową informacją, jeśli jest dostępna
            response.status(500).json({ 
                error: 'AI model returned an empty or blocked response.',
                promptFeedback: responseFromAI?.promptFeedback 
            });
            return;
        }

        // Tworzymy prosty obiekt, który zostanie wysłany z powrotem.
        const responseData = {
            text: responseFromAI.text(), // Wywołujemy metodę .text()
            candidates: responseFromAI.candidates,
            promptFeedback: responseFromAI.promptFeedback
        };

        // Wysyłamy prosty obiekt JSON.
        response.status(200).json({ success: true, data: responseData });

    } catch (error) {
        // Krok 5: Zaawansowana obsługa błędów oparta na przykładzie z README
        console.error(`Gemini API error in proxy for key ${apiKeyName}:`, error.message);
        
        // Logowanie bardziej szczegółowych informacji w zależności od statusu błędu
        switch (error.status) {
            case 400:
                console.error('Detailed Error: Bad request - check the input format, prompt structure or generationConfig.');
                break;
            case 401:
                console.error('Detailed Error: Unauthorized - check the API key being used.');
                break;
            case 429:
                console.error('Detailed Error: Rate limit exceeded - retry logic should be implemented in the calling function.');
                break;
            case 500:
                console.error('Detailed Error: Google AI server error.');
                break;
            default:
                console.error('Detailed Error: An unexpected error occurred.', error);
        }
        
        response.status(500).json({ error: 'An error occurred while communicating with the AI model.' });
    }
}

module.exports = { geminiApiProxyHandler };