/**
 * Enhanced Response Processor - Phase 5 Mock AI Integration
 * Converts AI responses (both Mock AI and LLM) into game actions with comprehensive processing
 * 
 * KEY FEATURES:
 * - Unified processing for Mock AI and LLM responses
 * - Advanced action validation and safety checks
 * - Character state updates and memory integration
 * - Conversation threading and dialogue pool integration
 * - Performance monitoring and analytics
 * - Error handling and fallback mechanisms
 * - Action chaining and priority management
 * 
 * INTEGRATION POINTS:
 * - Called by AI Queue Manager after response generation
 * - Updates character objects through character manager
 * - Fires events for UI updates and other systems
 * - Integrates with movement, interaction, and conversation systems
 * - Coordinates with ConversationalDialogueSystem and MockAIService
 * 
 * PHASE 5 ENHANCEMENTS:
 * - Mock AI response processing with dialogue pool integration
 * - Conversation threading and context management
 * - Personality consistency validation
 * - Advanced performance analytics
 * - Character behavior pattern tracking
 */

export class ResponseProcessor {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // Performance and analytics
        this.stats = {
            totalResponses: 0,
            successfulResponses: 0,
            failedResponses: 0,
            responseTypes: new Map(),
            actionTypes: new Map(),
            processingTimes: [],
            averageProcessingTime: 0,
            mockAIResponses: 0,
            llmResponses: 0,
            characterBehaviorPatterns: new Map(),
            lastReset: Date.now()
        };
        
        // Action processing state
        this.actionQueue = new Map(); // Character ID -> queued actions
        this.activeActions = new Map(); // Character ID -> current action
        this.actionHistory = new Map(); // Character ID -> action history
        
        // Conversation management
        this.activeConversations = new Map(); // Conversation ID -> conversation state
        this.conversationParticipants = new Map(); // Character ID -> active conversations
        
        // Validation and processing configuration
        this.config = {
            maxActionQueueSize: 5,
            maxActionHistorySize: 20,
            actionTimeoutMs: 30000, // 30 seconds
            conversationTimeoutMs: 300000, // 5 minutes
            memoryUpdateThreshold: 3, // Actions before memory update
            performanceLogging: true,
            debugMode: false
        };
        
        // Action validators - validate actions before processing
        this.actionValidators = {
            'MOVE_TO': this.validateMoveAction.bind(this),
            'WORK_ON': this.validateWorkAction.bind(this),
            'START_CONVERSATION': this.validateConversationAction.bind(this),
            'DRINK_COFFEE': this.validateNeedAction.bind(this),
            'EAT_SNACK': this.validateNeedAction.bind(this),
            'SOCIALIZE': this.validateSocialAction.bind(this),
            'IDLE': this.validateIdleAction.bind(this),
            'RESPOND_TO': this.validateResponseAction.bind(this)
        };
        
        // Action processors - execute validated actions
        this.actionProcessors = {
            'MOVE_TO': this.processMoveAction.bind(this),
            'WORK_ON': this.processWorkAction.bind(this),
            'START_CONVERSATION': this.processConversationAction.bind(this),
            'DRINK_COFFEE': this.processNeedAction.bind(this),
            'EAT_SNACK': this.processNeedAction.bind(this),
            'SOCIALIZE': this.processSocialAction.bind(this),
            'IDLE': this.processIdleAction.bind(this),
            'RESPOND_TO': this.processResponseAction.bind(this)
        };
        
        // Need effects - how actions affect character needs
        this.needEffects = {
            'DRINK_COFFEE': { energy: +3, stress: -1 },
            'EAT_SNACK': { hunger: +2, comfort: +1 },
            'SOCIALIZE': { social: +2, stress: -1 },
            'WORK_ON': { energy: -1, stress: +1, satisfaction: +1 },
            'IDLE': { stress: -1, energy: +0.5 }
        };
        
        // Setup maintenance tasks
        this.setupMaintenanceTasks();
        
        console.log('⚙️ Enhanced Response Processor initialized with Phase 5 features');
    }

    /**
     * MAIN PROCESSING INTERFACE - Process AI response and convert to game actions
     * @param {Object} character - Character object
     * @param {Object} response - AI response object (Mock AI or LLM)
     * @param {Object} context - Additional context (optional)
     * @returns {Promise<boolean>} - True if processing successful
     */
    async processResponse(character, response, context = {}) {
        const startTime = Date.now();
        const processingId = this.generateProcessingId();
        
        try {
            if (this.config.debugMode) {
                console.log(`🔄 Processing response ${processingId} for ${character.name}`);
                console.log(`📋 Response:`, response);
            }
            
            // Validate response format
            if (!this.validateResponseFormat(response)) {
                console.warn(`⚠️ Invalid response format for ${character.name}:`, response);
                return false;
            }
            
            // Update statistics
            this.stats.totalResponses++;
            this.updateResponseTypeStats(response);
            
            // Determine response source (Mock AI vs LLM)
            const isLLMResponse = this.isLLMResponse(response);
            if (isLLMResponse) {
                this.stats.llmResponses++;
            } else {
                this.stats.mockAIResponses++;
            }
            
            // Process response based on type
            let processingResult = false;
            
            switch (response.responseType) {
                case 'ACTION':
                    processingResult = await this.processActionResponse(character, response, context);
                    break;
                    
                case 'DIALOGUE':
                    processingResult = await this.processDialogueResponse(character, response, context);
                    break;
                    
                case 'MIXED':
                    processingResult = await this.processMixedResponse(character, response, context);
                    break;
                    
                case 'IDLE':
                    processingResult = await this.processIdleResponse(character, response, context);
                    break;
                    
                default:
                    console.warn(`Unknown response type: ${response.responseType}`);
                    processingResult = await this.processFallbackResponse(character, response, context);
            }
            
            // Post-processing tasks
            if (processingResult) {
                await this.postProcessResponse(character, response, context);
            }
            
            // Update performance metrics
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, processingResult);
            
            // Update character behavior patterns
            this.updateCharacterBehaviorPattern(character, response, processingResult);
            
            if (this.config.debugMode) {
                console.log(`${processingResult ? '✅' : '❌'} Response ${processingId} processed in ${processingTime}ms`);
            }
            
            return processingResult;
            
        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Error processing response ${processingId} for ${character.name}:`, error);
            
            // Handle error and attempt recovery
            const recoveryResult = await this.handleProcessingError(character, response, error, context);
            
            // Update error statistics
            this.updatePerformanceMetrics(processingTime, false);
            this.stats.failedResponses++;
            
            return recoveryResult;
        }
    }

    /**
     * RESPONSE TYPE PROCESSORS
     */

    /**
     * Process action response
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @param {Object} context - Processing context
     * @returns {Promise<boolean>} - Success status
     */
    async processActionResponse(character, response, context) {
        const action = response.action;
        
        if (!action || !action.type) {
            console.warn(`Invalid action in response for ${character.name}`);
            return false;
        }
        
        // Validate action
        if (!this.validateAction(character, action)) {
            console.warn(`Action validation failed: ${action.type} for ${character.name}`);
            return false;
        }
        
        // Check for action conflicts
        if (this.hasActionConflict(character, action)) {
            console.log(`⏳ Action conflict detected for ${character.name}, queuing action`);
            this.queueAction(character, action, response);
            return true;
        }
        
        // Process the action
        const success = await this.executeAction(character, action, response);
        
        if (success) {
            // Add to action history
            this.addToActionHistory(character, action, response);
            
            // Apply need effects
            this.applyNeedEffects(character, action);
            
            // Update character memory with thought
            if (response.thought) {
                this.addThoughtToMemory(character, response.thought, action);
            }
        }
        
        return success;
    }

    /**
     * Process dialogue response
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @param {Object} context - Processing context
     * @returns {Promise<boolean>} - Success status
     */
    async processDialogueResponse(character, response, context) {
        const dialogue = response.content;
        
        if (!dialogue || typeof dialogue !== 'string') {
            console.warn(`Invalid dialogue in response for ${character.name}`);
            return false;
        }
        
        // Process dialogue through conversation system
        const success = await this.processDialogue(character, dialogue, response, context);
        
        if (success) {
            // Update conversation context
            this.updateConversationContext(character, dialogue, response, context);
            
            // Add dialogue to character memory
            this.addDialogueToMemory(character, dialogue, response);
            
            // Fire dialogue event for UI and other systems
            this.fireDialogueEvent(character, dialogue, response);
        }
        
        return success;
    }

    /**
     * Process mixed response (both action and dialogue)
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @param {Object} context - Processing context
     * @returns {Promise<boolean>} - Success status
     */
    async processMixedResponse(character, response, context) {
        let actionSuccess = true;
        let dialogueSuccess = true;
        
        // Process action component if present
        if (response.action) {
            actionSuccess = await this.processActionResponse(character, 
                { ...response, responseType: 'ACTION' }, context);
        }
        
        // Process dialogue component if present
        if (response.content) {
            dialogueSuccess = await this.processDialogueResponse(character, 
                { ...response, responseType: 'DIALOGUE' }, context);
        }
        
        return actionSuccess && dialogueSuccess;
    }

    /**
     * Process idle response
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @param {Object} context - Processing context
     * @returns {Promise<boolean>} - Success status
     */
    async processIdleResponse(character, response, context) {
        // Set character to idle state
        character.setActionState('idle');
        
        // Add idle thought to memory if present
        if (response.thought) {
            this.addThoughtToMemory(character, response.thought);
        }
        
        // Fire idle event
        this.fireActionEvent(character, { type: 'IDLE' }, response);
        
        return true;
    }

    /**
     * Process fallback response when response type is unknown
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @param {Object} context - Processing context
     * @returns {Promise<boolean>} - Success status
     */
    async processFallbackResponse(character, response, context) {
        console.warn(`Using fallback processing for ${character.name}`);
        
        // Default to idle behavior
        return await this.processIdleResponse(character, {
            responseType: 'IDLE',
            thought: 'Processed unknown response type, defaulting to idle',
            source: 'fallback'
        }, context);
    }

    /**
     * ACTION PROCESSING METHODS
     */

    /**
     * Execute a validated action
     * @param {Object} character - Character object
     * @param {Object} action - Action to execute
     * @param {Object} response - Full response context
     * @returns {Promise<boolean>} - Success status
     */
    async executeAction(character, action, response) {
        const actionType = action.type;
        const processor = this.actionProcessors[actionType];
        
        if (!processor) {
            console.warn(`No processor found for action type: ${actionType}`);
            return false;
        }
        
        try {
            // Mark character as busy
            character.isBusy = true;
            this.activeActions.set(character.id, {
                action: action,
                response: response,
                startTime: Date.now()
            });
            
            // Execute the action
            const result = await processor(character, action, response);
            
            // Clear busy state
            character.isBusy = false;
            this.activeActions.delete(character.id);
            
            return result;
            
        } catch (error) {
            console.error(`Error executing action ${actionType} for ${character.name}:`, error);
            
            // Clear busy state on error
            character.isBusy = false;
            this.activeActions.delete(character.id);
            
            return false;
        }
    }

    /**
     * ACTION VALIDATORS
     */

    /**
     * Validate action before processing
     * @param {Object} character - Character object
     * @param {Object} action - Action to validate
     * @returns {boolean} - True if valid
     */
    validateAction(character, action) {
        const validator = this.actionValidators[action.type];
        if (!validator) {
            console.warn(`No validator found for action type: ${action.type}`);
            return false;
        }
        
        return validator(character, action);
    }

    validateMoveAction(character, action) {
        // Validate target location exists and is accessible
        if (!action.target) {
            return false;
        }
        
        // Check if target is a valid location in the game world
        if (this.gameEngine.world && !this.gameEngine.world.isValidLocation(action.target)) {
            return false;
        }
        
        return true;
    }

    validateWorkAction(character, action) {
        // Validate work target exists
        if (!action.target) {
            return false;
        }
        
        // Check if character is at appropriate location for work
        if (character.location !== 'office' && character.location !== 'desk') {
            // Allow work action but may be less efficient
        }
        
        return true;
    }

    validateConversationAction(character, action) {
        // Validate conversation target
        if (!action.target) {
            return false;
        }
        
        // Check if target character exists and is nearby
        const targetCharacter = this.gameEngine.characterManager?.getCharacter(action.target);
        if (!targetCharacter) {
            return false;
        }
        
        // Check proximity (basic implementation)
        if (character.location !== targetCharacter.location) {
            return false;
        }
        
        return true;
    }

    validateNeedAction(character, action) {
        // Need actions are generally always valid
        // Could add location-based validation (e.g., coffee only in break room)
        return true;
    }

    validateSocialAction(character, action) {
        // Check if there are other characters nearby for social interaction
        const nearbyCharacters = this.getNearbyCharacters(character);
        return nearbyCharacters.length > 0;
    }

    validateIdleAction(character, action) {
        // Idle is always valid
        return true;
    }

    validateResponseAction(character, action) {
        // Validate response to another character's dialogue
        if (!action.target || !action.message) {
            return false;
        }
        
        return true;
    }

    /**
     * ACTION PROCESSORS
     */

    async processMoveAction(character, action, response) {
        if (!this.gameEngine.movementSystem) {
            console.warn('Movement system not available');
            return false;
        }
        
        // Use movement system to move character
        const success = await this.gameEngine.movementSystem.moveCharacterTo(character, action.target);
        
        if (success) {
            character.setActionState('moving');
            this.fireActionEvent(character, action, response);
        }
        
        return success;
    }

    async processWorkAction(character, action, response) {
        // Set character to working state
        character.setActionState('working');
        
        // Update character's current task
        character.currentTask = action.target;
        
        // Fire work event
        this.fireActionEvent(character, action, response);
        
        return true;
    }

    async processConversationAction(character, action, response) {
        const targetCharacter = this.gameEngine.characterManager?.getCharacter(action.target);
        if (!targetCharacter) {
            return false;
        }
        
        // Create conversation
        const conversationId = this.createConversation(character, targetCharacter);
        
        // Set character state
        character.setActionState('talking');
        character.conversationTarget = action.target;
        
        // Fire conversation event
        this.fireConversationEvent(character, targetCharacter, action, response);
        
        return true;
    }

    async processNeedAction(character, action, response) {
        // Set appropriate action state
        if (action.type === 'DRINK_COFFEE') {
            character.setActionState('drinking');
        } else if (action.type === 'EAT_SNACK') {
            character.setActionState('eating');
        }
        
        // Fire need action event
        this.fireActionEvent(character, action, response);
        
        return true;
    }

    async processSocialAction(character, action, response) {
        // Set character to socializing state
        character.setActionState('socializing');
        
        // Fire social event
        this.fireActionEvent(character, action, response);
        
        return true;
    }

    async processIdleAction(character, action, response) {
        // Set character to idle state
        character.setActionState('idle');
        
        // Fire idle event
        this.fireActionEvent(character, action, response);
        
        return true;
    }

    async processResponseAction(character, action, response) {
        // Process response to another character's dialogue
        const success = await this.processDialogue(character, action.message, response, {
            targetCharacter: action.target,
            isResponse: true
        });
        
        return success;
    }

    /**
     * DIALOGUE PROCESSING
     */

    /**
     * Process dialogue through conversation system
     * @param {Object} character - Speaking character
     * @param {string} dialogue - Dialogue content
     * @param {Object} response - Full response object
     * @param {Object} context - Processing context
     * @returns {Promise<boolean>} - Success status
     */
    async processDialogue(character, dialogue, response, context = {}) {
        try {
            // Add dialogue to game log/chat system
            if (this.gameEngine.chatSystem) {
                this.gameEngine.chatSystem.addDialogue(character, dialogue);
            }
            
            // Update character state
            character.setActionState('talking');
            character.lastDialogue = {
                content: dialogue,
                timestamp: Date.now(),
                context: context
            };
            
            // Process conversation context if this is a response
            if (context.isResponse && context.targetCharacter) {
                this.updateConversationBetweenCharacters(character, context.targetCharacter, dialogue);
            }
            
            return true;
            
        } catch (error) {
            console.error(`Error processing dialogue for ${character.name}:`, error);
            return false;
        }
    }

    /**
     * MEMORY MANAGEMENT
     */

    /**
     * Add thought to character memory
     * @param {Object} character - Character object
     * @param {string} thought - Thought content
     * @param {Object} action - Associated action (optional)
     */
    addThoughtToMemory(character, thought, action = null) {
        if (!character.memories) {
            character.memories = { shortTerm: [], longTerm: [] };
        }
        
        const memoryEntry = {
            type: 'thought',
            content: thought,
            timestamp: Date.now(),
            action: action?.type || null,
            importance: this.assessMemoryImportance(thought)
        };
        
        character.memories.shortTerm.push(memoryEntry);
        
        // Limit short-term memory size
        if (character.memories.shortTerm.length > 20) {
            const oldMemory = character.memories.shortTerm.shift();
            
            // Move important memories to long-term
            if (oldMemory.importance === 'high') {
                character.memories.longTerm.push(oldMemory);
            }
        }
        
        // Limit long-term memory size
        if (character.memories.longTerm.length > 100) {
            character.memories.longTerm.shift();
        }
    }

    /**
     * Add dialogue to character memory
     * @param {Object} character - Character object
     * @param {string} dialogue - Dialogue content
     * @param {Object} response - Full response object
     */
    addDialogueToMemory(character, dialogue, response) {
        if (!character.memories) {
            character.memories = { shortTerm: [], longTerm: [] };
        }
        
        const memoryEntry = {
            type: 'dialogue',
            content: dialogue,
            timestamp: Date.now(),
            speaker: character.name,
            context: response.metadata || {},
            importance: this.assessMemoryImportance(dialogue)
        };
        
        character.memories.shortTerm.push(memoryEntry);
    }

    /**
     * Assess memory importance for retention decisions
     * @param {string} content - Memory content
     * @returns {string} - Importance level (low, normal, high)
     */
    assessMemoryImportance(content) {
        const importantKeywords = ['important', 'critical', 'urgent', 'deadline', 'problem', 'meeting'];
        const contentLower = content.toLowerCase();
        
        for (const keyword of importantKeywords) {
            if (contentLower.includes(keyword)) {
                return 'high';
            }
        }
        
        // Check for emotional content
        const emotionalKeywords = ['angry', 'happy', 'sad', 'excited', 'worried', 'frustrated'];
        for (const keyword of emotionalKeywords) {
            if (contentLower.includes(keyword)) {
                return 'normal';
            }
        }
        
        return 'low';
    }

    /**
     * NEED EFFECTS AND CHARACTER STATE MANAGEMENT
     */

    /**
     * Apply need effects from action execution
     * @param {Object} character - Character object
     * @param {Object} action - Executed action
     */
    applyNeedEffects(character, action) {
        const effects = this.needEffects[action.type];
        if (!effects || !character.needs) {
            return;
        }
        
        Object.entries(effects).forEach(([need, change]) => {
            if (character.needs[need] !== undefined) {
                character.needs[need] = Math.max(0, Math.min(10, character.needs[need] + change));
            }
        });
        
        // Fire need change event
        this.fireNeedChangeEvent(character, effects);
    }

    /**
     * CONVERSATION MANAGEMENT
     */

    /**
     * Create conversation between characters
     * @param {Object} character1 - First character
     * @param {Object} character2 - Second character
     * @returns {string} - Conversation ID
     */
    createConversation(character1, character2) {
        const conversationId = this.generateConversationId(character1, character2);
        
        this.activeConversations.set(conversationId, {
            id: conversationId,
            participants: [character1.id, character2.id],
            startTime: Date.now(),
            messageCount: 0,
            lastActivity: Date.now()
        });
        
        // Track conversations for each participant
        this.addConversationToParticipant(character1.id, conversationId);
        this.addConversationToParticipant(character2.id, conversationId);
        
        return conversationId;
    }

    /**
     * Update conversation context between characters
     * @param {Object} speaker - Speaking character
     * @param {Object} listener - Listening character
     * @param {string} dialogue - Dialogue content
     */
    updateConversationBetweenCharacters(speaker, listener, dialogue) {
        const conversationId = this.generateConversationId(speaker, listener);
        const conversation = this.activeConversations.get(conversationId);
        
        if (conversation) {
            conversation.messageCount++;
            conversation.lastActivity = Date.now();
        }
    }

    /**
     * UTILITY METHODS
     */

    /**
     * Check if character has action conflicts
     * @param {Object} character - Character object
     * @param {Object} action - Proposed action
     * @returns {boolean} - True if conflict exists
     */
    hasActionConflict(character, action) {
        // Check if character is busy with another action
        if (character.isBusy) {
            return true;
        }
        
        // Check if action queue is full
        const queue = this.actionQueue.get(character.id) || [];
        if (queue.length >= this.config.maxActionQueueSize) {
            return true;
        }
        
        return false;
    }

    /**
     * Queue action for later processing
     * @param {Object} character - Character object
     * @param {Object} action - Action to queue
     * @param {Object} response - Full response object
     */
    queueAction(character, action, response) {
        if (!this.actionQueue.has(character.id)) {
            this.actionQueue.set(character.id, []);
        }
        
        const queue = this.actionQueue.get(character.id);
        queue.push({
            action: action,
            response: response,
            queuedAt: Date.now()
        });
    }

    /**
     * Process queued actions for character
     * @param {Object} character - Character object
     */
    async processQueuedActions(character) {
        const queue = this.actionQueue.get(character.id);
        if (!queue || queue.length === 0 || character.isBusy) {
            return;
        }
        
        const queuedItem = queue.shift();
        await this.executeAction(character, queuedItem.action, queuedItem.response);
    }

    /**
     * Get nearby characters for social validation
     * @param {Object} character - Character object
     * @returns {Array} - Array of nearby characters
     */
    getNearbyCharacters(character) {
        if (!this.gameEngine.characterManager) {
            return [];
        }
        
        return this.gameEngine.characterManager.getCharactersInLocation(character.location)
            .filter(c => c.id !== character.id);
    }

    /**
     * RESPONSE VALIDATION
     */

    /**
     * Validate response format
     * @param {Object} response - Response to validate
     * @returns {boolean} - True if valid
     */
    validateResponseFormat(response) {
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
            case 'MIXED':
                return (response.action && response.action.type) || (response.content && typeof response.content === 'string');
            case 'IDLE':
                return true;
            default:
                return false;
        }
    }

    /**
     * Determine if response is from LLM or Mock AI
     * @param {Object} response - Response object
     * @returns {boolean} - True if LLM response
     */
    isLLMResponse(response) {
        return response.source && response.source.includes('llm');
    }

    /**
     * ACTION HISTORY MANAGEMENT
     */

    /**
     * Add action to character's action history
     * @param {Object} character - Character object
     * @param {Object} action - Executed action
     * @param {Object} response - Full response object
     */
    addToActionHistory(character, action, response) {
        if (!this.actionHistory.has(character.id)) {
            this.actionHistory.set(character.id, []);
        }
        
        const history = this.actionHistory.get(character.id);
        history.push({
            action: action,
            response: response,
            executedAt: Date.now(),
            success: true
        });
        
        // Limit history size
        if (history.length > this.config.maxActionHistorySize) {
            history.shift();
        }
    }

    /**
     * EVENT SYSTEM INTEGRATION
     */

    /**
     * Fire action event for other systems
     * @param {Object} character - Character object
     * @param {Object} action - Executed action
     * @param {Object} response - Full response object
     */
    fireActionEvent(character, action, response) {
        if (this.gameEngine.eventSystem) {
            this.gameEngine.eventSystem.fireEvent('characterAction', {
                character: character,
                action: action,
                response: response,
                timestamp: Date.now()
            });
        }
        
        // Notify UI updater
        if (this.gameEngine.uiUpdater) {
            this.gameEngine.uiUpdater.onCharacterAction(character, action);
        }
    }

    /**
     * Fire dialogue event for other systems
     * @param {Object} character - Speaking character
     * @param {string} dialogue - Dialogue content
     * @param {Object} response - Full response object
     */
    fireDialogueEvent(character, dialogue, response) {
        if (this.gameEngine.eventSystem) {
            this.gameEngine.eventSystem.fireEvent('characterDialogue', {
                character: character,
                dialogue: dialogue,
                response: response,
                timestamp: Date.now()
            });
        }
        
        // Notify UI updater
        if (this.gameEngine.uiUpdater) {
            this.gameEngine.uiUpdater.onCharacterDialogue(character, dialogue);
        }
    }

    /**
     * Fire conversation event
     * @param {Object} character1 - First character
     * @param {Object} character2 - Second character
     * @param {Object} action - Conversation action
     * @param {Object} response - Full response object
     */
    fireConversationEvent(character1, character2, action, response) {
        if (this.gameEngine.eventSystem) {
            this.gameEngine.eventSystem.fireEvent('conversationStarted', {
                participants: [character1, character2],
                initiator: character1,
                action: action,
                response: response,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Fire need change event
     * @param {Object} character - Character object
     * @param {Object} needChanges - Need changes applied
     */
    fireNeedChangeEvent(character, needChanges) {
        if (this.gameEngine.eventSystem) {
            this.gameEngine.eventSystem.fireEvent('characterNeedsChanged', {
                character: character,
                changes: needChanges,
                newNeeds: { ...character.needs },
                timestamp: Date.now()
            });
        }
        
        // Notify UI updater
        if (this.gameEngine.uiUpdater) {
            this.gameEngine.uiUpdater.onCharacterNeedsChanged(character);
        }
    }

    /**
     * PERFORMANCE MONITORING AND ANALYTICS
     */

    /**
     * Update response type statistics
     * @param {Object} response - Response object
     */
    updateResponseTypeStats(response) {
        const type = response.responseType;
        const currentCount = this.stats.responseTypes.get(type) || 0;
        this.stats.responseTypes.set(type, currentCount + 1);
        
        // Track action types if present
        if (response.action && response.action.type) {
            const actionType = response.action.type;
            const actionCount = this.stats.actionTypes.get(actionType) || 0;
            this.stats.actionTypes.set(actionType, actionCount + 1);
        }
    }

    /**
     * Update performance metrics
     * @param {number} processingTime - Time taken to process
     * @param {boolean} success - Whether processing was successful
     */
    updatePerformanceMetrics(processingTime, success) {
        // Update processing times
        this.stats.processingTimes.push(processingTime);
        
        // Keep only recent processing times (last 100)
        if (this.stats.processingTimes.length > 100) {
            this.stats.processingTimes.shift();
        }
        
        // Calculate average processing time
        this.stats.averageProcessingTime = 
            this.stats.processingTimes.reduce((sum, time) => sum + time, 0) / 
            this.stats.processingTimes.length;
        
        // Update success/failure counts
        if (success) {
            this.stats.successfulResponses++;
        } else {
            this.stats.failedResponses++;
        }
    }

    /**
     * Update character behavior patterns
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @param {boolean} success - Processing success
     */
    updateCharacterBehaviorPattern(character, response, success) {
        if (!this.stats.characterBehaviorPatterns.has(character.id)) {
            this.stats.characterBehaviorPatterns.set(character.id, {
                totalResponses: 0,
                successfulResponses: 0,
                actionTypes: new Map(),
                personalityConsistency: 0,
                lastUpdate: Date.now()
            });
        }
        
        const pattern = this.stats.characterBehaviorPatterns.get(character.id);
        pattern.totalResponses++;
        
        if (success) {
            pattern.successfulResponses++;
        }
        
        // Track action type preferences
        if (response.action && response.action.type) {
            const actionType = response.action.type;
            const actionCount = pattern.actionTypes.get(actionType) || 0;
            pattern.actionTypes.set(actionType, actionCount + 1);
        }
        
        // Update personality consistency (simplified calculation)
        pattern.personalityConsistency = this.calculatePersonalityConsistency(character, response);
        pattern.lastUpdate = Date.now();
    }

    /**
     * Calculate personality consistency score
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @returns {number} - Consistency score (0-1)
     */
    calculatePersonalityConsistency(character, response) {
        // Simplified personality consistency calculation
        // In a full implementation, this would analyze action patterns against personality traits
        
        if (!character.personalityTags || character.personalityTags.length === 0) {
            return 0.5; // Neutral if no personality defined
        }
        
        // Basic consistency check based on action type and personality
        let consistencyScore = 0.5;
        
        if (response.action) {
            const actionType = response.action.type;
            
            // Check consistency with personality traits
            character.personalityTags.forEach(trait => {
                switch (trait) {
                    case 'Extroverted':
                        if (['SOCIALIZE', 'START_CONVERSATION'].includes(actionType)) {
                            consistencyScore += 0.1;
                        }
                        break;
                    case 'Professional':
                        if (['WORK_ON', 'IDLE'].includes(actionType)) {
                            consistencyScore += 0.1;
                        }
                        break;
                    case 'Lazy':
                        if (['IDLE', 'EAT_SNACK'].includes(actionType)) {
                            consistencyScore += 0.1;
                        }
                        break;
                }
            });
        }
        
        return Math.min(1, Math.max(0, consistencyScore));
    }

    /**
     * ERROR HANDLING AND RECOVERY
     */

    /**
     * Handle processing error and attempt recovery
     * @param {Object} character - Character object
     * @param {Object} response - Failed response
     * @param {Error} error - Error object
     * @param {Object} context - Processing context
     * @returns {Promise<boolean>} - Recovery success
     */
    async handleProcessingError(character, response, error, context) {
        console.warn(`🔧 Attempting error recovery for ${character.name}`);
        
        try {
            // Clear any busy state
            character.isBusy = false;
            this.activeActions.delete(character.id);
            
            // Attempt simple recovery based on error type
            if (error.message.includes('validation')) {
                // Validation error - try with idle action
                return await this.processIdleResponse(character, {
                    responseType: 'IDLE',
                    thought: 'Recovery from validation error',
                    source: 'error_recovery'
                }, context);
            }
            
            if (error.message.includes('action')) {
                // Action error - try dialogue fallback if available
                if (response.content) {
                    return await this.processDialogueResponse(character, {
                        responseType: 'DIALOGUE',
                        content: response.content,
                        thought: 'Recovery using dialogue component',
                        source: 'error_recovery'
                    }, context);
                }
            }
            
            // Default recovery - idle state
            return await this.processIdleResponse(character, {
                responseType: 'IDLE',
                thought: 'General error recovery - going idle',
                source: 'error_recovery'
            }, context);
            
        } catch (recoveryError) {
            console.error(`❌ Error recovery failed for ${character.name}:`, recoveryError);
            return false;
        }
    }

    /**
     * POST-PROCESSING TASKS
     */

    /**
     * Perform post-processing tasks after successful response processing
     * @param {Object} character - Character object
     * @param {Object} response - Processed response
     * @param {Object} context - Processing context
     */
    async postProcessResponse(character, response, context) {
        try {
            // Process any queued actions
            await this.processQueuedActions(character);
            
            // Update character's last response timestamp
            character.lastResponseProcessed = Date.now();
            
            // Check for conversation threading opportunities
            if (response.responseType === 'DIALOGUE') {
                this.processConversationThreading(character, response, context);
            }
            
            // Trigger any follow-up behaviors based on personality
            this.triggerPersonalityBasedFollowUps(character, response);
            
            // Update relationship dynamics if social action
            if (this.isSocialAction(response)) {
                this.updateRelationshipDynamics(character, response, context);
            }
            
        } catch (error) {
            console.warn(`⚠️ Post-processing error for ${character.name}:`, error);
            // Post-processing errors are non-critical, don't fail the main processing
        }
    }

    /**
     * Process conversation threading for dialogue responses
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @param {Object} context - Processing context
     */
    processConversationThreading(character, response, context) {
        // Update conversation context for future responses
        const nearbyCharacters = this.getNearbyCharacters(character);
        
        nearbyCharacters.forEach(nearbyChar => {
            if (nearbyChar.conversationContext) {
                nearbyChar.conversationContext.lastHeard = {
                    speaker: character.name,
                    content: response.content,
                    timestamp: Date.now()
                };
            }
        });
    }

    /**
     * Trigger personality-based follow-up behaviors
     * @param {Object} character - Character object
     * @param {Object} response - Processed response
     */
    triggerPersonalityBasedFollowUps(character, response) {
        if (!character.personalityTags) return;
        
        character.personalityTags.forEach(trait => {
            switch (trait) {
                case 'Gossip':
                    if (response.responseType === 'DIALOGUE') {
                        // Gossip personalities might generate follow-up questions
                        this.scheduleFollowUpAction(character, 'SOCIALIZE', 5000);
                    }
                    break;
                    
                case 'Ambitious':
                    if (response.action && response.action.type === 'WORK_ON') {
                        // Ambitious characters might continue working
                        this.scheduleFollowUpAction(character, 'WORK_ON', 3000);
                    }
                    break;
                    
                case 'Extroverted':
                    if (this.getNearbyCharacters(character).length > 0) {
                        // Extroverted characters seek social interaction
                        this.scheduleFollowUpAction(character, 'SOCIALIZE', 7000);
                    }
                    break;
            }
        });
    }

    /**
     * Schedule follow-up action for character
     * @param {Object} character - Character object
     * @param {string} actionType - Type of follow-up action
     * @param {number} delay - Delay in milliseconds
     */
    scheduleFollowUpAction(character, actionType, delay) {
        setTimeout(() => {
            if (!character.isBusy && Math.random() < 0.3) { // 30% chance
                this.queueAction(character, {
                    type: actionType,
                    priority: 'low',
                    source: 'personality_followup'
                }, {
                    responseType: 'ACTION',
                    thought: `Personality-driven follow-up: ${actionType}`,
                    source: 'personality_system'
                });
            }
        }, delay);
    }

    /**
     * Check if response involves social action
     * @param {Object} response - Response object
     * @returns {boolean} - True if social action
     */
    isSocialAction(response) {
        if (response.responseType === 'DIALOGUE') return true;
        
        if (response.action) {
            const socialActions = ['START_CONVERSATION', 'SOCIALIZE', 'RESPOND_TO'];
            return socialActions.includes(response.action.type);
        }
        
        return false;
    }

    /**
     * Update relationship dynamics based on social interactions
     * @param {Object} character - Character object
     * @param {Object} response - Response object
     * @param {Object} context - Processing context
     */
    updateRelationshipDynamics(character, response, context) {
        // Basic relationship tracking
        if (context.targetCharacter) {
            if (!character.relationships) {
                character.relationships = {};
            }
            
            const targetId = context.targetCharacter.id || context.targetCharacter;
            if (!character.relationships[targetId]) {
                character.relationships[targetId] = {
                    familiarity: 0,
                    affinity: 0,
                    lastInteraction: Date.now()
                };
            }
            
            // Update relationship values
            character.relationships[targetId].familiarity += 0.1;
            character.relationships[targetId].lastInteraction = Date.now();
            
            // Adjust affinity based on interaction type
            if (response.responseType === 'DIALOGUE') {
                character.relationships[targetId].affinity += 0.05;
            }
        }
    }

    /**
     * MAINTENANCE AND CLEANUP
     */

    /**
     * Setup periodic maintenance tasks
     */
    setupMaintenanceTasks() {
        // Clean up old conversations
        setInterval(() => {
            this.cleanupOldConversations();
        }, 60000); // Every minute
        
        // Clean up old action history
        setInterval(() => {
            this.cleanupOldActionHistory();
        }, 300000); // Every 5 minutes
        
        // Performance logging
        if (this.config.performanceLogging) {
            setInterval(() => {
                this.logPerformanceStats();
            }, 120000); // Every 2 minutes
        }
        
        // Process action timeouts
        setInterval(() => {
            this.processActionTimeouts();
        }, 30000); // Every 30 seconds
    }

    /**
     * Clean up old conversations
     */
    cleanupOldConversations() {
        const now = Date.now();
        const conversationsToRemove = [];
        
        this.activeConversations.forEach((conversation, id) => {
            if (now - conversation.lastActivity > this.config.conversationTimeoutMs) {
                conversationsToRemove.push(id);
            }
        });
        
        conversationsToRemove.forEach(id => {
            const conversation = this.activeConversations.get(id);
            
            // Remove from participants
            conversation.participants.forEach(participantId => {
                const participantConversations = this.conversationParticipants.get(participantId) || [];
                const index = participantConversations.indexOf(id);
                if (index > -1) {
                    participantConversations.splice(index, 1);
                }
            });
            
            this.activeConversations.delete(id);
        });
        
        if (conversationsToRemove.length > 0 && this.config.debugMode) {
            console.log(`🧹 Cleaned up ${conversationsToRemove.length} old conversations`);
        }
    }

    /**
     * Clean up old action history
     */
    cleanupOldActionHistory() {
        this.actionHistory.forEach((history, characterId) => {
            if (history.length > this.config.maxActionHistorySize) {
                const excess = history.length - this.config.maxActionHistorySize;
                history.splice(0, excess);
            }
        });
    }

    /**
     * Process action timeouts
     */
    processActionTimeouts() {
        const now = Date.now();
        const timedOutActions = [];
        
        this.activeActions.forEach((actionData, characterId) => {
            if (now - actionData.startTime > this.config.actionTimeoutMs) {
                timedOutActions.push(characterId);
            }
        });
        
        timedOutActions.forEach(characterId => {
            const character = this.gameEngine.characterManager?.getCharacter(characterId);
            if (character) {
                console.warn(`⏰ Action timeout for ${character.name}, clearing busy state`);
                character.isBusy = false;
                this.activeActions.delete(characterId);
            }
        });
    }

    /**
     * UTILITY METHODS
     */

    /**
     * Generate unique processing ID
     * @returns {string} - Unique processing ID
     */
    generateProcessingId() {
        return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate conversation ID between two characters
     * @param {Object} character1 - First character
     * @param {Object} character2 - Second character
     * @returns {string} - Conversation ID
     */
    generateConversationId(character1, character2) {
        const ids = [character1.id, character2.id].sort();
        return `conv_${ids.join('_')}`;
    }

    /**
     * Add conversation to participant tracking
     * @param {string} participantId - Character ID
     * @param {string} conversationId - Conversation ID
     */
    addConversationToParticipant(participantId, conversationId) {
        if (!this.conversationParticipants.has(participantId)) {
            this.conversationParticipants.set(participantId, []);
        }
        
        const conversations = this.conversationParticipants.get(participantId);
        if (!conversations.includes(conversationId)) {
            conversations.push(conversationId);
        }
    }

    /**
     * Update conversation context
     * @param {Object} character - Character object
     * @param {string} dialogue - Dialogue content
     * @param {Object} response - Response object
     * @param {Object} context - Processing context
     */
    updateConversationContext(character, dialogue, response, context) {
        // Update character's conversation context
        if (!character.conversationContext) {
            character.conversationContext = {
                recentDialogue: [],
                currentTopic: null,
                lastSpeaker: null
            };
        }
        
        character.conversationContext.recentDialogue.push({
            speaker: character.name,
            content: dialogue,
            timestamp: Date.now()
        });
        
        // Limit recent dialogue history
        if (character.conversationContext.recentDialogue.length > 10) {
            character.conversationContext.recentDialogue.shift();
        }
        
        character.conversationContext.lastSpeaker = character.name;
    }

    /**
     * PUBLIC API METHODS
     */

    /**
     * Get processing statistics
     * @returns {Object} - Processing statistics
     */
    getProcessingStats() {
        const successRate = this.stats.totalResponses > 0 ? 
            (this.stats.successfulResponses / this.stats.totalResponses * 100).toFixed(2) + '%' : '0%';
        
        return {
            totalResponses: this.stats.totalResponses,
            successfulResponses: this.stats.successfulResponses,
            failedResponses: this.stats.failedResponses,
            successRate: successRate,
            averageProcessingTime: Math.round(this.stats.averageProcessingTime) + 'ms',
            mockAIResponses: this.stats.mockAIResponses,
            llmResponses: this.stats.llmResponses,
            responseTypes: Object.fromEntries(this.stats.responseTypes),
            actionTypes: Object.fromEntries(this.stats.actionTypes),
            activeConversations: this.activeConversations.size,
            queuedActions: Array.from(this.actionQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
            characterBehaviorPatterns: this.stats.characterBehaviorPatterns.size
        };
    }

    /**
     * Get character-specific analytics
     * @param {string} characterId - Character ID
     * @returns {Object} - Character analytics
     */
    getCharacterAnalytics(characterId) {
        const behaviorPattern = this.stats.characterBehaviorPatterns.get(characterId);
        const actionHistory = this.actionHistory.get(characterId) || [];
        const activeAction = this.activeActions.get(characterId);
        const queuedActions = this.actionQueue.get(characterId) || [];
        
        return {
            behaviorPattern: behaviorPattern || null,
            actionHistory: actionHistory.slice(-10), // Last 10 actions
            activeAction: activeAction || null,
            queuedActions: queuedActions.length,
            conversations: this.conversationParticipants.get(characterId) || []
        };
    }

    /**
     * Reset statistics (for testing or maintenance)
     */
    resetStatistics() {
        this.stats = {
            totalResponses: 0,
            successfulResponses: 0,
            failedResponses: 0,
            responseTypes: new Map(),
            actionTypes: new Map(),
            processingTimes: [],
            averageProcessingTime: 0,
            mockAIResponses: 0,
            llmResponses: 0,
            characterBehaviorPatterns: new Map(),
            lastReset: Date.now()
        };
        
        console.log('📊 Response Processor statistics reset');
    }

    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Debug mode state
     */
    setDebugMode(enabled) {
        this.config.debugMode = enabled;
        console.log(`🐛 Response Processor debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Log performance statistics
     */
    logPerformanceStats() {
        if (!this.config.performanceLogging) return;
        
        const stats = this.getProcessingStats();
        console.log('📊 Response Processor Performance:', {
            responses: `${stats.totalResponses} total (${stats.successRate} success)`,
            avgTime: stats.averageProcessingTime,
            mockVsLlm: `${stats.mockAIResponses} Mock AI, ${stats.llmResponses} LLM`,
            activeElements: `${stats.activeConversations} conversations, ${stats.queuedActions} queued actions`
        });
    }

    /**
     * Force cleanup of all data (for shutdown or reset)
     */
    forceCleanup() {
        console.log('🧹 Force cleanup of Response Processor data...');
        
        // Clear all maps and arrays
        this.actionQueue.clear();
        this.activeActions.clear();
        this.actionHistory.clear();
        this.activeConversations.clear();
        this.conversationParticipants.clear();
        
        // Reset statistics
        this.resetStatistics();
        
        console.log('✅ Response Processor cleanup completed');
    }
}
