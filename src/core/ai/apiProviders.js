// API endpoint configuration
const API_ENDPOINTS = {
  'gemini-2.0-flash-lite': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent',
  'openai-gpt-3.5-turbo': 'https://api.openai.com/v1/chat/completions',
  'deepseek-chat': 'https://api.deepseek.com/v1/chat/completions'
};

// API request templates
const REQUEST_TEMPLATES = {
  'gemini-2.0-flash-lite': (prompt) => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  }),
  
  'openai-gpt-3.5-turbo': (prompt) => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    })
  }),
  
  'deepseek-chat': (prompt) => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    })
  })
};

// Response parsers
const RESPONSE_PARSERS = {
  'gemini-2.0-flash-lite': (response) => response.candidates[0].content.parts[0].text,
  'openai-gpt-3.5-turbo': (response) => response.choices[0].message.content,
  'deepseek-chat': (response) => response.choices[0].message.content
};

class APIProvider {
  constructor(providerType, apiKey) {
    this.providerType = providerType;
    this.apiKey = apiKey;
  }

  async sendPrompt(prompt) {
    // Mock response for testing - returns a random action number
    return new Promise((resolve) => {
      setTimeout(() => {
        // Random number between 1-5
        const randomAction = Math.floor(Math.random() * 5) + 1;
        resolve(randomAction.toString());
      }, 500);
    });
  }
}

module.exports = APIProvider;
