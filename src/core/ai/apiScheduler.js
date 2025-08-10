/**
 * Global Prompt Queue & API Scheduler
 * Manages API requests to prevent conflicts and ensure sequential processing
 * Implements SSOT Chapter 6.3 specifications
 */

class APIScheduler {
    constructor() {
        this.promptQueue = [];
        this.isProcessing = false;
        this.apiCallCooldown = 2000; // 2-second cooldown between calls
        this.apiPool = []; // For multi-API pool distribution
        this.currentApiIndex = 0; // Current index for round-robin API selection
        this.activeApiKey = null; // Currently active API key
    }

    /**
     * Add a prompt to the global queue
     * @param {Object} promptData - Prompt data structure
     * @param {string} promptData.characterId - ID of the character making the request
     * @param {string} promptData.prompt - Formatted prompt text
     * @param {string} promptData.apiProvider - API provider name
     * @param {string} promptData.apiKey - User-provided API key
     * @param {function} callback - Response handler function
     */
    addToQueue(promptData, callback) {
        this.promptQueue.push({ promptData, callback });
        this.processQueue();
    }

    /**
     * Process the queue sequentially
     */
    async processQueue() {
        if (this.isProcessing || this.promptQueue.length === 0) return;
        
        this.isProcessing = true;
        const { promptData, callback } = this.promptQueue.shift();
        
        try {
            const response = await this.sendAPIRequest(promptData);
            callback(null, response);
        } catch (error) {
            // Implement exponential backoff for failed requests
            if (promptData.retryCount === undefined) {
                promptData.retryCount = 1;
            } else {
                promptData.retryCount++;
            }
            
            if (promptData.retryCount <= 3) {
                // Requeue with delay
                setTimeout(() => {
                    this.promptQueue.unshift({ promptData, callback });
                    this.isProcessing = false;
                    this.processQueue();
                }, 1000 * Math.pow(2, promptData.retryCount));
                return;
            } else {
                callback(error, null);
            }
        }
        
        // Apply cooldown before next request
        setTimeout(() => {
            this.isProcessing = false;
            this.processQueue();
        }, this.apiCallCooldown);
    }

    /**
     * Send API request to the specified provider
     * @param {Object} promptData - Prompt data structure
     */
    async sendAPIRequest(promptData) {
        const { apiProvider, prompt } = promptData;
        const endpoint = this.getAPIEndpoint(apiProvider);
        const apiKey = this.selectApiKey(promptData);
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${await response.text()}`);
        }
        
        return response.json();
    }
    
    /**
     * Select API key based on workload distribution tier
     * @param {Object} promptData - Prompt data structure
     */
    selectApiKey(promptData) {
        // Tier 3: Multi-API Pool
        if (this.apiPool.length > 0) {
            const key = this.apiPool[this.currentApiIndex];
            this.currentApiIndex = (this.currentApiIndex + 1) % this.apiPool.length;
            return key;
        }
        
        // Tier 2: Dual API - Use primary for decisions, secondary for background
        if (this.backgroundApiKey && promptData.type === 'background') {
            return this.backgroundApiKey;
        }
        
        // Tier 1: Single API or fallback
        return this.activeApiKey || promptData.apiKey;
    }
    
    /**
     * Configure API workload distribution
     * @param {string} tier - Workload distribution tier ('SINGLE', 'DUAL', 'POOL')
     * @param {Object} keys - API keys configuration
     */
    configureApiTier(tier, keys) {
        switch(tier) {
            case 'DUAL':
                this.activeApiKey = keys.primary;
                this.backgroundApiKey = keys.secondary;
                this.apiPool = [];
                break;
                
            case 'POOL':
                this.apiPool = keys.pool || [];
                this.currentApiIndex = 0;
                this.activeApiKey = null;
                this.backgroundApiKey = null;
                break;
                
            case 'SINGLE':
            default:
                this.activeApiKey = keys.primary;
                this.backgroundApiKey = null;
                this.apiPool = [];
        }
    }
    
    /**
     * Toggle API processing on/off
     * @param {boolean} enabled - Whether to enable API processing
     */
    toggleApiProcessing(enabled) {
        if (enabled && !this.isProcessing) {
            this.processQueue();
        } else {
            // Clear any pending processing
            clearTimeout(this.processTimer);
        }
    }

    /**
     * Get API endpoint for the specified provider
     * @param {string} provider - API provider name
     */
    getAPIEndpoint(provider) {
        const endpoints = {
            'gemini-2.0-flash-lite': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=',
            'gemini-1.5-fast': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=',
            'gpt-4': 'https://api.openai.com/v1/chat/completions',
            'deepseek': 'https://api.deepseek.com/v1/chat/completions',
            'claude-3-haiku': 'https://api.anthropic.com/v1/messages'
        };
        
        return endpoints[provider] || endpoints['gemini-2.0-flash-lite'];
    }
}

// Singleton instance
const apiScheduler = new APIScheduler();

// Example initialization (to be called from game setup)
// apiScheduler.configureApiTier('SINGLE', { primary: 'USER_API_KEY' });
// apiScheduler.configureApiTier('DUAL', { 
//   primary: 'DECISION_API_KEY', 
//   secondary: 'BACKGROUND_API_KEY' 
// });
// apiScheduler.configureApiTier('POOL', { 
//   pool: ['KEY1', 'KEY2', 'KEY3'] 
// });

export default apiScheduler;
