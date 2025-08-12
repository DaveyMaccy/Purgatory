/**
 * Response Processor - Rebuilt for Mock AI Integration
 * Converts AI responses (both Mock AI and LLM) into game actions
 * 
 * KEY FEATURES:
 * - Unified processing for Mock AI and LLM responses
 * - Action validation and safety checks
 * - Character state updates and memory integration
 * - Event firing for UI and other systems
 * - Error handling and fallback mechanisms
 * 
 * INTEGRATION POINTS:
 * - Called by AI Queue Manager after response generation
 * - Updates character objects through character manager
 * - Fires events for UI updates and other systems
 * - Integrates with movement, interaction, and conversation systems
 * 
 * EXPANSION NOTES:
 * - Add action success/failure tracking
 * - Implement action chaining for complex behaviors
 * - Add animation and sound effect triggers
 * - Create action history for learning systems
 */

import { MockAIConfig } from './mockAI/config.js';

export class ResponseProcessor {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.config = MockAIConfig;
        
        // Action processing statistics
        this.stats = {
            totalActions: 0,
            successfulActions: 0,
            failedActions: 0,
            actionTypes: {},
            averageProcessingTime: 0
        };
        
        // Action validators
        this.actionValidators = {
            'MOVE_TO': this.validateMoveAction.bind(this),
            'WORK_ON': this.validateWorkAction.bind(this),
            'START_CONVERSATION': this.validateConversationAction.bind(this),
            'DRINK_COFFEE': this.validateNeedAction.bind(this),
            'EAT_SNACK': this.validateNeedAction.bind(this),
            'SOCIALIZE': this.validateSocialAction.bind(this),
            'IDLE': this.validateIdleAction.bind(this)
        };
        
        // Action processors
        this.actionProcessors = {
            'MOVE_TO': this.processMoveAction.bind(this),
            'WORK_ON': this.processWorkAction.bind(this),
            'START_CONVERSATION': this.processConversationAction.bind(this),
            'DRINK_COFFEE': this.processNeedAction.bind(this),
            'EAT_SNACK': this.processNeedAction.bind(this),
            'SOCIALIZE': this.processSocialAction.bind(this),
            'IDLE': this.processIdleAction.bind(this)
        };
        
        console.log('⚙️ Response Processor initialized');
    }

    /**
     * Main entry point - process an AI response
     * @param {Object} character - Character object
     * @param {Object} response - AI response object
     * @returns {boolean} - True if processing successful
     */
    processResponse(character, response) {
        const startTime = Date.now();
        
        try {
            if (!this.validateResponse(response)) {
                console.warn(`⚠️ Invalid response format for ${character.name}:`, response);
                return false;
            }
            
            this.stats.totalActions++;
            
            // Update character's last AI response
            character.lastAIResponse = {
                ...response,
                processedAt: Date.now()
            };
            
            // Process different response types
            let success = false;
            
            if (response.responseType === 'ACTION' && response.action) {
                success = this.processAction(character, response.action, response);
            } else if (response.responseType === 'DIALOGUE' && response.content) {
                success = this.processDialogue(character, response.content, response);
            } else if (response.responseType === 'IDLE') {
                success = this.processIdleResponse(character, response);
            } else {
                console.warn(`Unknown response type: ${response.responseType}`);
                success = this.processFallbackAction(character, response);
            }
            
            // Add thought to character memory
            if (response.thought && success) {
                this.addThoughtToMemory(character, response.thought);
            }
            
            // Update statistics
            const processingTime = Date.now() - startTime;
            this.updateStats(response.action?.type || response.responseType, processingTime, success);
            
            // Fire events for other systems
            if (success) {
                this.fireActionEvent(character, response);
            }
            
            if (this.config.debug.logging.decision_logging) {
                console.log(`${success ? '✅' : '❌'} Processed ${response.responseType} for ${character.name} (${processingTime}ms)`);
            }
            
            return success;
            
        } catch (error) {
            console.error(`❌ Error processing response for ${character.name}:`, error);
            this.stats.failedActions++;
            return false;
        }
    }

    /**
     * Validate AI response format
     * @param {Object} response - AI response to validate
     * @returns {boolean} - True if valid
     */
    validateResponse(response) {
        if (!response || typeof response !== 'object') {
            return false;
        }
        
        // Must have response type
        if (!response.responseType) {
            return false;
        }
        
        // Validate based on response type
        switch (response.responseType) {
            case 'ACTION':
                return response.action && response.action.type;
            case 'DIALOGUE':
                return response.content && typeof response.content === 'string';
            case 'IDLE':
                return true; // IDLE responses need minimal validation
            default:
                return false;
        }
    }

    /**
     * Process an action response
     * @param {Object} character - Character object
     * @param {Object} action - Action object from response
     * @param {Object} fullResponse - Complete response object
     * @returns {boolean} - True if successful
     */
    processAction(character, action, fullResponse) {
        const actionType = action.type;
        
        // Validate action
        const validator = this.actionValidators[actionType];
        if (validator && !validator(character, action)) {
            console.warn(`❌ Action validation failed: ${actionType} for ${character.name}`);
            return false;
        }
        
        // Check if character is busy (prevent action conflicts)
        if (character.isBusy && action.priority !== 'critical') {
            if (this.config.debug.logging.decision_logging) {
                console.log(`⏳ Character ${character.name} is busy, queuing action: ${actionType}`);
            }
            this.queueAction(character, action);
            return true;
        }
        
        // Process the action
        const processor = this.actionProcessors[actionType];
        if (processor) {
            return processor(character, action, fullResponse);
        } else {
            console.warn(`No processor found for action type: ${actionType}`);
            return this.processGenericAction(character, action, fullResponse);
        }
    }

    /**
     * Process a dialogue response
     * @param {Object} character - Character object
     * @param {string} content - Dialogue content
     * @param {Object} fullResponse - Complete response object
     * @returns {boolean} - True if successful
     */
    processDialogue(character, content, fullResponse) {
        try {
            // Add dialogue to chat log or conversation system
            if (this.gameEngine.conversationSystem) {
                this.gameEngine.conversationSystem.addDialogue(character, content);
            }
            
            // Update UI with dialogue
            if (this.gameEngine.uiManager) {
                this.gameEngine.uiManager.showDialogue(character, content);
            }
            
            // Add to character's memory
            this.addToMemory(character, `Said: "${content}"`);
            
            // Update social needs (talking is social)
            this.updateCharacterNeeds(character, { social: 0.5 });
            
            return true;
            
        } catch (error) {
            console.error(`Error processing dialogue for ${character.name}:`, error);
            return false;
        }
    }

    /**
     * Process an idle response
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @returns {boolean} - True if successful
     */
    processIdleResponse(character, response) {
        const duration = response.duration || 5000;
        
        return this.processIdleAction(character, { 
            type: 'IDLE', 
            duration: duration 
        }, response);
    }

    /**
     * Action Validators
     */
    validateMoveAction(character, action) {
        if (!action.target) {
            console.warn(`Move action missing target for ${character.name}`);
            return false;
        }
        
        // Check if target location exists (would check with world system)
        // For now, assume all locations are valid
        return true;
    }

    validateWorkAction(character, action) {
        // Check if character has work tasks available
        if (!character.workTasks || character.workTasks.length === 0) {
            // Allow work action anyway - character might organize or find work
            return true;
        }
        
        return true;
    }

    validateConversationAction(character, action) {
        if (!action.target) {
            console.warn(`Conversation action missing target for ${character.name}`);
            return false;
        }
        
        // Check if target character exists and is nearby
        const targetCharacter = this.gameEngine.characterManager?.getCharacter(action.target);
        if (!targetCharacter) {
            console.warn(`Conversation target not found: ${action.target}`);
            return false;
        }
        
        // Check distance (would integrate with world/position system)
        return true;
    }

    validateNeedAction(character, action) {
        // Need actions (coffee, food) are generally always valid
        // Could check resource availability here
        return true;
    }

    validateSocialAction(character, action) {
        // Check if there are people nearby to socialize with
        // For now, assume socializing is always possible
        return true;
    }

    validateIdleAction(character, action) {
        // Idle is always valid
        return true;
    }

    /**
     * Action Processors
     */
    processMoveAction(character, action, fullResponse) {
        try {
            // Set character as busy during movement
            character.isBusy = true;
            character.currentAction = action;
            
            // Integrate with movement system
            if (this.gameEngine.movementSystem) {
                const success = this.gameEngine.movementSystem.moveCharacterTo(character, action.target);
                if (success) {
                    this.addToMemory(character, `Moved to ${action.target}`);
                    
                    // Schedule completion
                    setTimeout(() => {
                        character.isBusy = false;
                        character.currentAction = null;
                        this.processQueuedActions(character);
                    }, action.duration || 8000);
                    
                    return true;
                }
            } else {
                // Fallback: simulate movement
                this.simulateMovement(character, action);
                return true;
            }
            
            character.isBusy = false;
            character.currentAction = null;
            return false;
            
        } catch (error) {
            console.error(`Error processing move action for ${character.name}:`, error);
            character.isBusy = false;
            character.currentAction = null;
            return false;
        }
    }

    processWorkAction(character, action, fullResponse) {
        try {
            character.isBusy = true;
            character.currentAction = action;
            
            // Update character state
            this.updateCharacterNeeds(character, { 
                energy: -1, 
                stress: 0.5,
                comfort: -0.2
            });
            
            // Add to memory
            this.addToMemory(character, `Worked on ${action.target || 'tasks'}`);
            
            // Integrate with work/task system if available
            if (this.gameEngine.taskSystem) {
                this.gameEngine.taskSystem.performWork(character, action);
            }
            
            // Schedule completion
            setTimeout(() => {
                character.isBusy = false;
                character.currentAction = null;
                this.addToMemory(character, `Completed work session`);
                this.processQueuedActions(character);
            }, action.duration || 15000);
            
            return true;
            
        } catch (error) {
            console.error(`Error processing work action for ${character.name}:`, error);
            character.isBusy = false;
            character.currentAction = null;
            return false;
        }
    }

    processConversationAction(character, action, fullResponse) {
        try {
            character.isBusy = true;
            character.currentAction = action;
            
            // Find target character
            const targetCharacter = this.gameEngine.characterManager?.getCharacter(action.target);
            if (!targetCharacter) {
                character.isBusy = false;
                character.currentAction = null;
                return false;
            }
            
            // Start conversation
            if (this.gameEngine.conversationSystem) {
                this.gameEngine.conversationSystem.startConversation(character, targetCharacter);
            }
            
            // Update needs
            this.updateCharacterNeeds(character, { 
                social: 2, 
                stress: -0.5 
            });
            
            // Add to memory
            this.addToMemory(character, `Started conversation with ${action.target}`);
            
            // If there's dialogue content, add it
            if (fullResponse.content) {
                this.processDialogue(character, fullResponse.content, fullResponse);
            }
            
            // Schedule completion
            setTimeout(() => {
                character.isBusy = false;
                character.currentAction = null;
                this.addToMemory(character, `Finished conversation with ${action.target}`);
                this.processQueuedActions(character);
            }, action.duration || 10000);
            
            return true;
            
        } catch (error) {
            console.error(`Error processing conversation action for ${character.name}:`, error);
            character.isBusy = false;
            character.currentAction = null;
            return false;
        }
    }

    processNeedAction(character, action, fullResponse) {
        try {
            character.isBusy = true;
            character.currentAction = action;
            
            // Determine need satisfaction based on action type
            let needUpdates = {};
            let memoryText = '';
            
            if (action.type === 'DRINK_COFFEE') {
                needUpdates = { energy: 3, comfort: 1, stress: -0.5 };
                memoryText = 'Drank coffee';
            } else if (action.type === 'EAT_SNACK') {
                needUpdates = { hunger: 3, comfort: 1, energy: 0.5 };
                memoryText = 'Ate snack';
            }
            
            // Apply need updates
            this.updateCharacterNeeds(character, needUpdates);
            
            // Add to memory
            this.addToMemory(character, memoryText);
            
            // Schedule completion
            setTimeout(() => {
                character.isBusy = false;
                character.currentAction = null;
                this.processQueuedActions(character);
            }, action.duration || 8000);
            
            return true;
            
        } catch (error) {
            console.error(`Error processing need action for ${character.name}:`, error);
            character.isBusy = false;
            character.currentAction = null;
            return false;
        }
    }

    processSocialAction(character, action, fullResponse) {
        try {
            character.isBusy = true;
            character.currentAction = action;
            
            // Update social needs
            this.updateCharacterNeeds(character, { 
                social: 3, 
                stress: -1, 
                energy: -0.5 
            });
            
            // Add to memory
            this.addToMemory(character, 'Socialized with colleagues');
            
            // If there's dialogue content, add it
            if (fullResponse.content) {
                this.processDialogue(character, fullResponse.content, fullResponse);
            }
            
            // Schedule completion
            setTimeout(() => {
                character.isBusy = false;
                character.currentAction = null;
                this.processQueuedActions(character);
            }, action.duration || 12000);
            
            return true;
            
        } catch (error) {
            console.error(`Error processing social action for ${character.name}:`, error);
            character.isBusy = false;
            character.currentAction = null;
            return false;
        }
    }

    processIdleAction(character, action, fullResponse) {
        try {
            character.isBusy = true;
            character.currentAction = action;
            
            // Idle provides small stress relief and energy recovery
            this.updateCharacterNeeds(character, { 
                stress: -2, 
                energy: 1 
            });
            
            // Add to memory
            this.addToMemory(character, 'Took a moment to rest');
            
            // Schedule completion
            setTimeout(() => {
                character.isBusy = false;
                character.currentAction = null;
                this.processQueuedActions(character);
            }, action.duration || 5000);
            
            return true;
            
        } catch (error) {
            console.error(`Error processing idle action for ${character.name}:`, error);
            character.isBusy = false;
            character.currentAction = null;
            return false;
        }
    }

    /**
     * Process generic/unknown action types
     * @param {Object} character - Character object
     * @param {Object} action - Action object
     * @param {Object} fullResponse - Complete response
     * @returns {boolean} - True if successful
     */
    processGenericAction(character, action, fullResponse) {
        console.warn(`Processing unknown action type: ${action.type} for ${character.name}`);
        
        // Treat as idle action with custom duration
        return this.processIdleAction(character, {
            type: action.type,
            duration: action.duration || 5000
        }, fullResponse);
    }

    /**
     * Process fallback action when response is invalid
     * @param {Object} character - Character object
     * @param {Object} response - Original response
     * @returns {boolean} - True if successful
     */
    processFallbackAction(character, response) {
        console.warn(`Using fallback action for ${character.name}`);
        
        return this.processIdleAction(character, {
            type: 'IDLE',
            duration: 5000
        }, response);
    }

    /**
     * Helper Methods
     */
    
    /**
     * Update character needs
     * @param {Object} character - Character object
     * @param {Object} needChanges - Changes to apply { energy: +/-amount, etc. }
     */
    updateCharacterNeeds(character, needChanges) {
        Object.keys(needChanges).forEach(needType => {
            const change = needChanges[needType];
            const currentValue = character[needType] || 5;
            character[needType] = Math.max(0, Math.min(10, currentValue + change));
        });
        
        // Notify UI of need changes
        if (this.gameEngine.uiUpdater) {
            this.gameEngine.uiUpdater.updateCharacterNeeds(character);
        }
    }

    /**
     * Add entry to character memory
     * @param {Object} character - Character object
     * @param {string} memoryText - Memory text to add
     */
    addToMemory(character, memoryText) {
        if (!character.shortTermMemory) {
            character.shortTermMemory = [];
        }
        
        const memoryEntry = `${new Date().toLocaleTimeString()}: ${memoryText}`;
        character.shortTermMemory.unshift(memoryEntry);
        
        // Keep only recent memories
        if (character.shortTermMemory.length > this.config.performance.memory.max_short_term_memories) {
            character.shortTermMemory = character.shortTermMemory.slice(0, this.config.performance.memory.max_short_term_memories);
        }
    }

    /**
     * Add thought to character memory
     * @param {Object} character - Character object
     * @param {string} thought - Thought text
     */
    addThoughtToMemory(character, thought) {
        this.addToMemory(character, `Thought: ${thought}`);
    }

    /**
     * Queue action for later execution
     * @param {Object} character - Character object
     * @param {Object} action - Action to queue
     */
    queueAction(character, action) {
        if (!character.actionQueue) {
            character.actionQueue = [];
        }
        
        character.actionQueue.push({
            ...action,
            queuedAt: Date.now()
        });
    }

    /**
     * Process any queued actions for character
     * @param {Object} character - Character object
     */
    processQueuedActions(character) {
        if (!character.actionQueue || character.actionQueue.length === 0) {
            return;
        }
        
        if (character.isBusy) {
            return; // Still busy, try again later
        }
        
        const nextAction = character.actionQueue.shift();
        
        if (this.config.debug.logging.decision_logging) {
            console.log(`🔄 Processing queued action for ${character.name}: ${nextAction.type}`);
        }
        
        this.processAction(character, nextAction, { responseType: 'ACTION', action: nextAction });
    }

    /**
     * Simulate movement when movement system is not available
     * @param {Object} character - Character object
     * @param {Object} action - Move action
     */
    simulateMovement(character, action) {
        // Simple simulation - just update character location
        character.location = action.target;
        this.addToMemory(character, `Moved to ${action.target}`);
        
        setTimeout(() => {
            character.isBusy = false;
            character.currentAction = null;
            this.processQueuedActions(character);
        }, action.duration || 8000);
    }

    /**
     * Fire action event for other systems
     * @param {Object} character - Character object
     * @param {Object} response - AI response
     */
    fireActionEvent(character, response) {
        if (!this.config.integration.events.decision_events) return;
        
        // Fire custom event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('characterAction', {
                detail: {
                    character: character,
                    action: response.action || { type: response.responseType },
                    response: response,
                    timestamp: Date.now()
                }
            });
            window.dispatchEvent(event);
        }
        
        // Call game engine event handler if available
        if (this.gameEngine.onCharacterAction && typeof this.gameEngine.onCharacterAction === 'function') {
            this.gameEngine.onCharacterAction(character, response);
        }
    }

    /**
     * Update processing statistics
     * @param {string} actionType - Type of action processed
     * @param {number} processingTime - Time taken to process
     * @param {boolean} success - Whether processing was successful
     */
    updateStats(actionType, processingTime, success) {
        if (success) {
            this.stats.successfulActions++;
        } else {
            this.stats.failedActions++;
        }
        
        // Track action types
        this.stats.actionTypes[actionType] = (this.stats.actionTypes[actionType] || 0) + 1;
        
        // Update average processing time
        const totalProcessed = this.stats.successfulActions + this.stats.failedActions;
        this.stats.averageProcessingTime = 
            (this.stats.averageProcessingTime * (totalProcessed - 1) + processingTime) / totalProcessed;
    }

    /**
     * Get processing statistics
     * @returns {Object} - Processing statistics
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalActions > 0 ? 
                Math.round((this.stats.successfulActions / this.stats.totalActions) * 100) : 0
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalActions: 0,
            successfulActions: 0,
            failedActions: 0,
            actionTypes: {},
            averageProcessingTime: 0
        };
    }
}
