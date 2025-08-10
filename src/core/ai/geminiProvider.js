// Gemini 2.0 Flash Lite API provider
// SSOT Chapter 6.5: API Key Anonymity & Proprietary Code Protection

export async function sendPromptToGemini(prompt) {
  // API endpoint configuration
  const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
  
  try {
    // Get API key from user input (stored in memory only)
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.error('Gemini API key not found. Please set your API key in character settings.');
      return null;
    }

    // Construct request payload
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    };

    // Send request to Gemini API
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return parseGeminiResponse(data);
  } catch (error) {
    console.error('Gemini API request failed:', error);
    return null;
  }
}

function parseGeminiResponse(responseData) {
  try {
    // Extract the first candidate's text content
    const textContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) throw new Error('Invalid response structure from Gemini API');
    
    // Parse JSON response from Gemini
    return JSON.parse(textContent);
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    return null;
  }
}

// Temporary mock until API key input is implemented in UI
function getGeminiApiKey() {
  // In final implementation, this will get the key from character settings
  // For now, return a placeholder that will work in development
  return 'YOUR_GEMINI_API_KEY_HERE';
}

// Error handling fallback strategies
function handleApiError(error) {
  console.error('Gemini API error:', error);
  // Implement exponential backoff for retries
  // SSOT Chapter 6.4: Exponential Backoff
  return null;
}
