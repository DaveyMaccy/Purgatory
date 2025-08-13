/**
 * AI Queue Manager - Rebuilt with Mock AI Integration
 * Manages the global prompt queue and routes to either Mock AI or real LLM
 * 
 * KEY FEATURES:
 * - Hybrid AI routing (Mock AI vs LLM based on character settings)
 * - Queue management with priority handling
 * - Response format standardization
 * - Error handling and fallback mechanisms
 * - Performance optimization and batching
 * 
 * INTEGRATION POINTS:
 * - Import this file in main game engine
 * - Characters need 'usesMockAI' property
 * - Responses match existing LLM format exactly
 * - Events fired for AI decisions (optional)
 * 
 * EXPANSION NOTES:
 * - Add API cost tracking for LLM calls
 * - Implement response caching for similar prompts
 * - Add queue analytics and performance metrics
 * - Create prompt optimization for LLM efficiency
 */

import { MockAIEngine } from './mockAI/mockAIEngine.js';
import { MockAIConfig } from './mockAI/config.js';

export class AIQueueManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.mockAIEngine = new MockAIEngine();
        this.config = MockAIConfig;
        
        // Queue management
        this.promptQueue = [];
        this.isProcessing = false;
        this.processingInterval = null;
        
        // Performance tracking
        this.stats = {
            totalPrompts: 0,
            mockAIPrompts: 0,
            llmPrompts: 0,
            averageResponseTime: 0,
            errors: 0,
            lastProcessedTime: null
        };
        
        // Response cache for optimization
        this.responseCache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
        
        // LLM API integration (placeholder)
        this.llmService = null; // Would be initialized with actual API service
        
        console.log('🤖 AI Queue Manager initialized with Mock AI support');
        
        // Start processing loop
        this.startProcessing();
    }

    /**
     * Add a prompt to the global queue
     * @param {Object} promptData - Prompt data structure
     * @param {string} promptData.characterId - ID of the character making the request
     * @param {string} promptData.promptText - Formatted prompt text
     * @param {string} promptData.apiProvider - API provider name (optional)
     * @param {string} promptData.apiKey - User-provided API key (optional)
     * @param {number} promptData.priority - Priority level (optional, default: 5)
     * @param {function} callback - Response handler function
     */
    addToQueue(promptData, callback) {
        const queueItem = {
            id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            promptData,
            callback,
            timestamp: Date.now(),
            priority: promptData.priority || 5,
            attempts: 0,
            maxAttempts: 3
        };
        
        // Insert into queue based on priority (higher priority first)
        const insertIndex = this.promptQueue.findIndex(item => item.priority < queueItem.priority);
        if (insertIndex === -1) {
            this.promptQueue.push(queueItem);
        } else {
            this.promptQueue.splice(insertIndex, 0, queueItem);
        }
        
        this.stats.totalPrompts++;
        
        if (this.config.debug.logging.decision_logging) {
            console.log(`📋 Added prompt to queue for ${promptData.characterId} (Priority: ${queueItem.priority}, Queue size: ${this.promptQueue.length})`);
        }
        
        // Start processing if not already running
        if (!this.isProcessing) {
            this.startProcessing();
        }
    }

    /**
     * Start the queue processing loop
     */
    startProcessing() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        
        // Use requestAnimationFrame for better performance, fallback to setTimeout
        const processLoop = () => {
            if (this.promptQueue.length > 0 && this.isProcessing) {
                this.processNextPrompt();
            }
            
            if (this.isProcessing) {
                if (typeof requestAnimationFrame !== 'undefined') {
                    requestAnimationFrame(() => {
                        setTimeout(processLoop, this.config.decision.frequency);
                    });
                } else {
                    setTimeout(processLoop, this.config.decision.frequency);
                }
            }
        };
        
        processLoop();
    }

    /**
     * Stop the queue processing loop
     */
    stopProcessing() {
        this.isProcessing = false;
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        console.log('⏹️ AI Queue Manager processing stopped');
    }

    /**
     * Process the next prompt in the queue
     */
    async processNextPrompt() {
        if (this.promptQueue.length === 0) return;
        
        const queueItem = this.promptQueue.shift();
        const startTime = Date.now();
        
        try {
            // Get character to determine AI type
            const character = this.gameEngine.characterManager?.getCharacter(queueItem.promptData.characterId);
            
            if (!character) {
                throw new Error(`Character not found: ${queueItem.promptData.characterId}`);
            }
            
            // Determine which AI system to use
            const usesMockAI = this.shouldUseMockAI(character, queueItem.promptData);
            
            let response;
            if (usesMockAI) {
                response = await this.processWithMockAI(queueItem.promptData, character);
                this.stats.mockAIPrompts++;
            } else {
                response = await this.processWithLLM(queueItem.promptData, character);
                this.stats.llmPrompts++;
            }
            
            // Standardize response format
            const standardizedResponse = this.standardizeResponse(response, character);
            
            // Update performance stats
            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime);
            
            // Cache response if appropriate
            if (this.shouldCacheResponse(queueItem.promptData, response)) {
                this.cacheResponse(queueItem.promptData, standardizedResponse);
            }
            
            // Execute callback with response
            if (queueItem.callback && typeof queueItem.callback === 'function') {
                queueItem.callback(null, standardizedResponse);
            }
            
            // Fire event for other systems
            this.fireAIDecisionEvent(character, queueItem.promptData, standardizedResponse);
            
            if (this.config.debug.logging.decision_logging) {
                console.log(`✅ Processed prompt for ${character.name} using ${usesMockAI ? 'Mock AI' : 'LLM'} (${processingTime}ms)`);
            }
            
        } catch (error) {
            this.handleProcessingError(queueItem, error);
        }
    }

    /**
     * Determine whether to use Mock AI for a character
     * @param {Object} character - Character object
     * @param {Object} promptData - Prompt data
     * @returns {boolean} - True if should use Mock AI
     */
    shouldUseMockAI(character, promptData) {
        // Check character's preference first
        if (character.usesMockAI !== undefined) {
            return character.usesMockAI;
        }
        
        // Check if character has API key configured
        if (!character.apiKey || character.apiKey.trim() === '') {
            return true; // No API key = use Mock AI
        }
        
        // Player character should not use Mock AI (controlled by human)
        if (character.isPlayer || character.type === 'player') {
            return false;
        }
        
        // Default to Mock AI for NPCs
        return true;
    }

    /**
     * Process prompt using Mock AI system
     * @param {Object} promptData - Prompt data
     * @param {Object} character - Character object
     * @returns {Object} - Mock AI response
     */
    async processWithMockAI(promptData, character) {
        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(promptData, character);
            if (this.responseCache.has(cacheKey)) {
                const cachedResponse = this.responseCache.get(cacheKey);
                if (Date.now() - cachedResponse.timestamp < this.cacheTimeout) {
                    if (this.config.debug.logging.decision_logging) {
                        console.log(`🎯 Using cached Mock AI response for ${character.name}`);
                    }
                    return cachedResponse.response;
                }
            }
            
            // Process with Mock AI engine
            const response = this.mockAIEngine.processPrompt(promptData.promptText, character);
            
            return response;
            
        } catch (error) {
            console.error(`❌ Mock AI processing error for ${character.name}:`, error);
            
            // Return safe fallback response
            return this.createFallbackResponse(character);
        }
    }

    /**
     * Process prompt using LLM API
     * @param {Object} promptData - Prompt data
     * @param {Object} character - Character object
     * @returns {Object} - LLM response
     */
    async processWithLLM(promptData, character) {
        // Placeholder for LLM integration
        // In real implementation, this would call the actual LLM API
        
        console.log(`🌐 Processing LLM request for ${character.name} (simulated)`);
        
        // Simulate LLM processing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // For now, return a mock LLM response
        // In real implementation, this would be the actual API call:
        // return await this.llmService.processPrompt(promptData, character.apiKey);
        
        return {
            responseType: 'ACTION',
            action: {
                type: 'IDLE',
                duration: 5000,
                priority: 'normal'
            },
            thought: 'Simulated LLM response - replace with actual API call',
            characterId: character.id
        };
    }

    /**
     * Standardize response format to match expected structure
     * @param {Object} response - Raw response from AI system
     * @param {Object} character - Character object
     * @returns {Object} - Standardized response
     */
    standardizeResponse(response, character) {
        // Ensure response has required fields
        const standardized = {
            responseType: response.responseType || 'ACTION',
            characterId: response.characterId || character.id,
            timestamp: Date.now(),
            source: response.source || (response.isMockAI !== false ? 'mock_ai' : 'llm')
        };
        
        // Add action if present
        if (response.action) {
            standardized.action = {
                type: response.action.type || 'IDLE',
                target: response.action.target || null,
                duration: response.action.duration || 5000,
                priority: response.action.priority || 'normal'
            };
        }
        
        // Add dialogue content if present
        if (response.content) {
            standardized.content = response.content;
        }
        
        // Add thought/reasoning if present
        if (response.thought) {
            standardized.thought = response.thought;
        }
        
        return standardized;
    }

    /**
     * Handle processing errors with retry logic
     * @param {Object} queueItem - Failed queue item
     * @param {Error} error - Error that occurred
     */
    handleProcessingError(queueItem, error) {
        this.stats.errors++;
        
        console.error(`❌ AI processing error for ${queueItem.promptData.characterId}:`, error);
        
        queueItem.attempts++;
        
        if (queueItem.attempts < queueItem.maxAttempts) {
            // Retry with exponential backoff
            const delay = Math.pow(2, queueItem.attempts) * 1000;
            
            setTimeout(() => {
                queueItem.priority = Math.max(1, queueItem.priority - 1); // Lower priority for retry
                this.promptQueue.unshift(queueItem); // Add back to front of queue
                
                if (this.config.debug.logging.enabled) {
                    console.log(`🔄 Retrying prompt for ${queueItem.promptData.characterId} (Attempt ${queueItem.attempts}/${queueItem.maxAttempts})`);
                }
            }, delay);
        } else {
            // Max attempts reached, return fallback response
            const character = this.gameEngine.characterManager?.getCharacter(queueItem.promptData.characterId);
            const fallbackResponse = this.createFallbackResponse(character);
            
            if (queueItem.callback && typeof queueItem.callback === 'function') {
                queueItem.callback(error, fallbackResponse);
            }
            
            console.warn(`⚠️ Max retry attempts reached for ${queueItem.promptData.characterId}, using fallback response`);
        }
    }

    /**
     * Create a safe fallback response when processing fails
     * @param {Object} character - Character object
     * @returns {Object} - Fallback response
     */
    createFallbackResponse(character) {
        return {
            responseType: 'ACTION',
            action: {
                type: 'IDLE',
                duration: 5000,
                priority: 'low'
            },
            thought: 'Taking a moment to think...',
            characterId: character?.id || 'unknown',
            source: 'fallback',
            timestamp: Date.now()
        };
    }

    /**
     * Generate cache key for response caching
     * @param {Object} promptData - Prompt data
     * @param {Object} character - Character object
     * @returns {string} - Cache key
     */
    generateCacheKey(promptData, character) {
        // Create hash of relevant prompt and character data
        const relevantData = {
            characterId: character.id,
            location: character.location,
            energy: Math.floor(character.energy || 5),
            hunger: Math.floor(character.hunger || 5),
            social: Math.floor(character.social || 5),
            timeOfDay: Math.floor(new Date().getHours() / 4) // 4-hour blocks
        };
        
        return btoa(JSON.stringify(relevantData)).replace(/[^a-zA-Z0-9]/g, '');
    }

    /**
     * Determine if response should be cached
     * @param {Object} promptData - Prompt data
     * @param {Object} response - AI response
     * @returns {boolean} - True if should cache
     */
    shouldCacheResponse(promptData, response) {
        // Don't cache error responses or fallbacks
        if (response.source === 'fallback') return false;
        
        // Don't cache unique actions
        if (response.action?.type === 'START_CONVERSATION') return false;
        
        // Cache routine and common responses
        return ['IDLE', 'WORK_ON', 'DRINK_COFFEE', 'EAT_SNACK'].includes(response.action?.type);
    }

    /**
     * Cache a response for future use
     * @param {Object} promptData - Prompt data
     * @param {Object} response - Response to cache
     */
    cacheResponse(promptData, response) {
        const character = this.gameEngine.characterManager?.getCharacter(promptData.characterId);
        if (!character) return;
        
        const cacheKey = this.generateCacheKey(promptData, character);
        
        this.responseCache.set(cacheKey, {
            response: { ...response },
            timestamp: Date.now()
        });
        
        // Clean old cache entries
        this.cleanCache();
    }

    /**
     * Clean expired cache entries
     */
    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.responseCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.responseCache.delete(key);
            }
        }
    }

    /**
     * Update performance statistics
     * @param {number} processingTime - Time taken to process prompt
     */
    updateStats(processingTime) {
        this.stats.lastProcessedTime = processingTime;
        
        // Update rolling average
        const totalProcessed = this.stats.mockAIPrompts + this.stats.llmPrompts;
        this.stats.averageResponseTime = 
            (this.stats.averageResponseTime * (totalProcessed - 1) + processingTime) / totalProcessed;
    }

    /**
     * Fire event for AI decision (for other game systems)
     * @param {Object} character - Character object
     * @param {Object} promptData - Original prompt data
     * @param {Object} response - AI response
     */
    fireAIDecisionEvent(character, promptData, response) {
        if (!this.config.integration.events.decision_events) return;
        
        // Fire custom event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('aiDecision', {
                detail: {
                    character: character,
                    prompt: promptData,
                    response: response,
                    timestamp: Date.now()
                }
            });
            window.dispatchEvent(event);
        }
        
        // Call game engine event handler if available
        if (this.gameEngine.onAIDecision && typeof this.gameEngine.onAIDecision === 'function') {
            this.gameEngine.onAIDecision(character, promptData, response);
        }
    }

    /**
     * Get current queue statistics
     * @returns {Object} - Queue and performance statistics
     */
    getStats() {
        return {
            ...this.stats,
            queueLength: this.promptQueue.length,
            cacheSize: this.responseCache.size,
            isProcessing: this.isProcessing,
            mockAIPercentage: this.stats.totalPrompts > 0 ? 
                Math.round((this.stats.mockAIPrompts / this.stats.totalPrompts) * 100) : 0
        };
    }

    /**
     * Clear the queue and reset statistics
     */
    reset() {
        this.promptQueue = [];
        this.responseCache.clear();
        this.stats = {
            totalPrompts: 0,
            mockAIPrompts: 0,
            llmPrompts: 0,
            averageResponseTime: 0,
            errors: 0,
            lastProcessedTime: null
        };
        
        console.log('🔄 AI Queue Manager reset');
    }

    /**
     * Shutdown the queue manager
     */
    shutdown() {
        this.stopProcessing();
        this.reset();
        console.log('🛑 AI Queue Manager shutdown complete');
    }
}
