/**
 * AI Queue Manager - Processes global prompt queue
 */
export class AIQueueManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.promptQueue = [];
        this.isProcessing = false;
        this.processingInterval = 1000; // Check queue every 1 second
        this.maxBatchSize = 3; // Process up to 3 prompts at a time
    }

    /**
     * Add a prompt to the global queue
     * @param {Object} promptData - Prompt data object
     */
    addToPromptQueue(promptData) {
        this.promptQueue.push(promptData);
        console.log(`Added prompt to queue for ${promptData.characterId}`);
        this.startProcessing();
    }

    /**
     * Start processing the queue if not already processing
     */
    startProcessing() {
        if (!this.isProcessing) {
            this.isProcessing = true;
            this.processGlobalPromptQueue();
        }
    }

    /**
     * Process the global prompt queue in batches
     */
    processGlobalPromptQueue() {
        if (this.promptQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        // Process a batch of prompts
        const batchSize = Math.min(this.maxBatchSize, this.promptQueue.length);
        const batch = this.promptQueue.splice(0, batchSize);
        
        console.log(`Processing batch of ${batchSize} prompts`);
        
        // Send the batch to the AI service
        this.sendBatchToAI(batch);
        
        // Schedule next processing
        setTimeout(() => this.processGlobalPromptQueue(), this.processingInterval);
    }

    /**
     * Send a batch of prompts to the AI service
     * @param {Array} batch - Batch of prompt objects
     */
    async sendBatchToAI(batch) {
        try {
            const responses = await this.gameEngine.aiService.processBatch(batch);
            
            // Process each response
            for (const response of responses) {
                const character = this.gameEngine.characterManager.getCharacter(response.characterId);
                if (character && character.ai) {
                    character.ai.processResponse(response);
                }
            }
        } catch (error) {
            console.error('Error processing AI batch:', error);
        }
    }
}
