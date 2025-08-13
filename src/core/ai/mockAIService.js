/**
 * Mock AI Service - Centralized Service Coordinator
 * 
 * SYSTEM ARCHITECTURE:
 * This is the main service coordinator that orchestrates all Mock AI subsystems:
 * - EnhancedMockAIEngine for decision making
 * - ConversationalDialogueSystem for response generation
 * - Character state management and memory integration
 * - Performance monitoring and optimization
 * - Error handling and fallback mechanisms
 * 
 * INTEGRATION POINTS:
 * - Called by AI Queue Manager for all Mock AI characters
 * - Coordinates with Response Processor for action execution
 * - Integrates with Character Manager for state updates
 * - Provides unified interface for LLM/Mock AI switching
 * 
 * SERVICE RESPONSIBILITIES:
 * 1. Route requests to appropriate subsystems
 * 2. Coordinate decision making and dialogue generation
 * 3. Manage character state and memory
 * 4. Handle errors and provide fallbacks
 * 5. Monitor performance and optimize operations
 * 6. Provide debugging and analytics interfaces
 * 
 * DECISION FLOW:
 * Request → Parse Prompt → Make Decision → Generate Dialogue → Format Response
 *    ↓
 * Character State Update → Memory Update → Performance Logging → Return Response
 */

import { EnhancedMockAIEngine } from './mockAI/mockAIEngine.js';
import { ConversationalDialogueSystem } from './conversationalDialogueSystem.js';
import { MockAIConfig } from './mockAI/config.js';

export class MockAIService {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.config = MockAIConfig;
        
        // Initialize core subsystems
        this.mockAIEngine = new EnhancedMockAIEngine();
        this.conversationalSystem = new ConversationalDialogueSystem();
        
        // Service state management
        this.isInitialized = false;
        this.serviceHealth = 'starting';
        this.lastHealthCheck = Date.now();
        
        // Performance tracking
        this.performanceMetrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTime: 0,
            decisionTypes: new Map(),
            characterUsage: new Map(),
            lastReset: Date.now()
        };
        
        // Request queue for batch processing optimization
        this.requestQueue = [];
        this.processingQueue = false;
        this.maxConcurrentRequests = 5;
        
        // Character state cache for performance
        this.characterStateCache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        
        // Error handling and recovery
        this.errorCounts = new Map();
        this.maxErrorsPerCharacter = 3;
        this.errorResetInterval = 300000; // 5 minutes
        
        // Debugging and analytics
        this.debugMode = this.config.debug?.logging?.enabled || false;
        this.analyticsEnabled = true;
        
        console.log('🤖 Mock AI Service initializing...');
        this.initialize();
    }

    /**
     * Initialize the Mock AI Service
     */
    async initialize() {
        try {
            console.log('🔧 Initializing Mock AI Service subsystems...');
            
            // Initialize subsystems
            await this.initializeSubsystems();
            
            // Setup periodic maintenance
            this.setupMaintenanceTasks();
            
            // Setup health monitoring
            this.setupHealthMonitoring();
            
            // Mark as initialized
            this.isInitialized = true;
            this.serviceHealth = 'healthy';
            
            console.log('✅ Mock AI Service initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Mock AI Service:', error);
            this.serviceHealth = 'failed';
            throw error;
        }
    }

    /**
     * Initialize subsystems with proper error handling
     */
    async initializeSubsystems() {
        // Verify subsystems are properly instantiated
        if (!this.mockAIEngine) {
            throw new Error('Mock AI Engine failed to initialize');
        }
        
        if (!this.conversationalSystem) {
            throw new Error('Conversational System failed to initialize');
        }
        
        // Test subsystem functionality
        await this.testSubsystems();
        
        console.log('🔗 All subsystems initialized and tested');
    }

    /**
     * Test subsystems to ensure they're working
     */
    async testSubsystems() {
        try {
            // Test mock character for system verification
            const testCharacter = {
                id: 'test_character',
                name: 'Test Character',
                personalityTags: ['Professional'],
                needs: { energy: 5, hunger: 5, social: 5, comfort: 5, stress: 5 },
                currentAction: null,
                location: 'test_location'
            };
            
            // Test basic decision making
            const testDecision = this.mockAIEngine.makeDecision(testCharacter, {
                nearbyEntities: [],
                location: 'test_location',
                time: 'test_time'
            });
            
            if (!testDecision) {
                throw new Error('Mock AI Engine decision test failed');
            }
            
            // Test conversation system
            const testResponse = this.conversationalSystem.generateResponse(
                testCharacter,
                'Hello, this is a test message.',
                testCharacter,
                { location: 'test_location' }
            );
            
            if (!testResponse) {
                throw new Error('Conversational System test failed');
            }
            
            console.log('🧪 Subsystem tests passed');
            
        } catch (error) {
            console.error('❌ Subsystem test failed:', error);
            throw error;
        }
    }

    /**
     * MAIN SERVICE INTERFACE - Process AI request for character
     * @param {string} promptText - The structured prompt text
     * @param {Object} character - Character object
     * @param {Object} options - Additional options
     * @returns {Object} - Standardized AI response
     */
    async processAIRequest(promptText, character, options = {}) {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        
        try {
            if (!this.isInitialized) {
                throw new Error('Mock AI Service not initialized');
            }
            
            if (this.debugMode) {
                console.log(`🎯 Processing AI request ${requestId} for ${character.name}`);
                console.log(`📝 Prompt: ${promptText.substring(0, 100)}...`);
            }
            
            // Validate request
            this.validateRequest(character, promptText);
            
            // Parse the structured prompt
            const promptContext = this.parseStructuredPrompt(promptText);
            
            // Check character state cache
            const cachedState = this.getCharacterStateFromCache(character.id);
            if (cachedState) {
                Object.assign(character, cachedState);
            }
            
            // Determine request type and route appropriately
            const response = await this.routeRequest(character, promptContext, options);
            
            // Post-process response
            const finalResponse = this.postProcessResponse(response, character, promptContext);
            
            // Update character state cache
            this.updateCharacterStateCache(character);
            
            // Update performance metrics
            this.updatePerformanceMetrics(requestId, startTime, true, response.responseType);
            
            // Update character usage tracking
            this.updateCharacterUsage(character.id);
            
            if (this.debugMode) {
                console.log(`✅ Request ${requestId} completed successfully`);
            }
            
            return finalResponse;
            
        } catch (error) {
            console.error(`❌ Error processing AI request ${requestId} for ${character.name}:`, error);
            
            // Handle error and provide fallback
            const fallbackResponse = this.handleRequestError(error, character, promptText);
            
            // Update performance metrics
            this.updatePerformanceMetrics(requestId, startTime, false, 'error');
            
            // Track error for this character
            this.trackCharacterError(character.id, error);
            
            return fallbackResponse;
        }
    }

    /**
     * Validate incoming request
     * @param {Object} character - Character object
     * @param {string} promptText - Prompt text
     */
    validateRequest(character, promptText) {
        if (!character || !character.id) {
            throw new Error('Invalid character object provided');
        }
        
        if (!promptText || typeof promptText !== 'string') {
            throw new Error('Invalid prompt text provided');
        }
        
        if (promptText.length < 10) {
            throw new Error('Prompt text too short');
        }
        
        if (promptText.length > 50000) {
            throw new Error('Prompt text too long');
        }
        
        // Check if character has too many recent errors
        const errorCount = this.errorCounts.get(character.id) || 0;
        if (errorCount >= this.maxErrorsPerCharacter) {
            throw new Error(`Character ${character.id} has exceeded error limit`);
        }
    }

    /**
     * Parse structured prompt into contextual information
     * @param {string} promptText - Raw prompt text
     * @returns {Object} - Parsed context
     */
    parseStructuredPrompt(promptText) {
        const context = {
            characterState: null,
            currentAction: null,
            memories: { shortTerm: [], longTerm: [] },
            nearbyEntities: [],
            location: null,
            goals: [],
            availableActions: [],
            perceptions: [],
            socialContext: {},
            environmentalFactors: {},
            requestType: 'decision'
        };
        
        try {
            // Parse character identity and status
            const identityMatch = promptText.match(/IDENTITY & STATUS:(.*?)(?=\n[A-Z]|\n\n|$)/s);
            if (identityMatch) {
                context.characterState = this.parseCharacterState(identityMatch[1]);
            }
            
            // Parse memories
            const memoryMatch = promptText.match(/SHORT-TERM MEMORY:(.*?)(?=LONG-TERM MEMORY|$)/s);
            if (memoryMatch) {
                context.memories.shortTerm = this.parseMemories(memoryMatch[1]);
            }
            
            const longMemoryMatch = promptText.match(/LONG-TERM MEMORY:(.*?)(?=\n[A-Z]|\n\n|$)/s);
            if (longMemoryMatch) {
                context.memories.longTerm = this.parseMemories(longMemoryMatch[1]);
            }
            
            // Parse current goals
            const goalsMatch = promptText.match(/GOALS & SITUATION:(.*?)(?=\n[A-Z]|\n\n|$)/s);
            if (goalsMatch) {
                context.goals = this.parseGoals(goalsMatch[1]);
            }
            
            // Parse available actions
            const actionsMatch = promptText.match(/AVAILABLE ACTIONS:(.*?)(?=\n[A-Z]|\n\n|$)/s);
            if (actionsMatch) {
                context.availableActions = this.parseAvailableActions(actionsMatch[1]);
            }
            
            // Parse perceptions
            const perceptionsMatch = promptText.match(/PERCEPTION:(.*?)(?=\n[A-Z]|\n\n|$)/s);
            if (perceptionsMatch) {
                context.perceptions = this.parsePerceptions(perceptionsMatch[1]);
                context.nearbyEntities = this.extractNearbyEntities(context.perceptions);
                context.location = this.extractLocation(context.perceptions);
            }
            
            // Determine request type
            context.requestType = this.determineRequestType(promptText);
            
        } catch (error) {
            console.warn('⚠️ Error parsing structured prompt, using defaults:', error);
        }
        
        return context;
    }

    /**
     * Determine the type of AI request based on prompt content
     * @param {string} promptText - Full prompt text
     * @returns {string} - Request type
     */
    determineRequestType(promptText) {
        const promptLower = promptText.toLowerCase();
        
        // Check for conversation/dialogue requests
        if (promptLower.includes('conversation') || 
            promptLower.includes('dialogue') || 
            promptLower.includes('respond to') ||
            promptLower.includes('someone said')) {
            return 'conversation';
        }
        
        // Check for witness reaction requests
        if (promptLower.includes('witnessed') || 
            promptLower.includes('observed') || 
            promptLower.includes('saw someone')) {
            return 'witness_reaction';
        }
        
        // Check for memory processing requests
        if (promptLower.includes('memory') || 
            promptLower.includes('remember') || 
            promptLower.includes('recall')) {
            return 'memory_processing';
        }
        
        // Check for social interaction requests
        if (promptLower.includes('interaction') || 
            promptLower.includes('social') || 
            promptLower.includes('relationship')) {
            return 'social_interaction';
        }
        
        // Default to decision making
        return 'decision';
    }

    /**
     * Route request to appropriate subsystem
     * @param {Object} character - Character object
     * @param {Object} promptContext - Parsed prompt context
     * @param {Object} options - Additional options
     * @returns {Object} - AI response
     */
    async routeRequest(character, promptContext, options) {
        const { requestType } = promptContext;
        
        switch (requestType) {
            case 'conversation':
                return await this.handleConversationRequest(character, promptContext, options);
                
            case 'witness_reaction':
                return await this.handleWitnessReaction(character, promptContext, options);
                
            case 'memory_processing':
                return await this.handleMemoryProcessing(character, promptContext, options);
                
            case 'social_interaction':
                return await this.handleSocialInteraction(character, promptContext, options);
                
            case 'decision':
            default:
                return await this.handleDecisionRequest(character, promptContext, options);
        }
    }

    /**
     * Handle conversation/dialogue requests
     * @param {Object} character - Character object
     * @param {Object} promptContext - Parsed context
     * @param {Object} options - Options
     * @returns {Object} - Conversation response
     */
    async handleConversationRequest(character, promptContext, options) {
        try {
            // Extract conversation details from context
            const conversationDetails = this.extractConversationDetails(promptContext);
            
            // Generate response using conversational system
            const response = this.conversationalSystem.generateResponse(
                character,
                conversationDetails.incomingMessage,
                conversationDetails.speaker,
                conversationDetails.context
            );
            
            return {
                responseType: 'DIALOGUE',
                content: response,
                thought: `Responding to ${conversationDetails.speaker?.name || 'someone'}: "${conversationDetails.incomingMessage}"`,
                characterId: character.id,
                source: 'mock_ai_conversation',
                metadata: {
                    conversationType: conversationDetails.type,
                    confidence: 0.8,
                    processingTime: Date.now()
                }
            };
            
        } catch (error) {
            console.error('Error handling conversation request:', error);
            return this.generateFallbackDialogueResponse(character, promptContext);
        }
    }

    /**
     * Handle decision-making requests
     * @param {Object} character - Character object
     * @param {Object} promptContext - Parsed context
     * @param {Object} options - Options
     * @returns {Object} - Decision response
     */
    async handleDecisionRequest(character, promptContext, options) {
        try {
            // Prepare context for decision engine
            const decisionContext = {
                nearbyEntities: promptContext.nearbyEntities,
                location: promptContext.location,
                availableActions: promptContext.availableActions,
                goals: promptContext.goals,
                memories: promptContext.memories,
                environmentalFactors: promptContext.environmentalFactors
            };
            
            // Make decision using mock AI engine
            const decision = this.mockAIEngine.makeDecision(character, decisionContext);
            
            // If decision includes dialogue, enhance it with conversational system
            if (decision.dialogue) {
                const enhancedDialogue = this.enhanceDialogueWithConversationalSystem(
                    decision.dialogue,
                    character,
                    decisionContext
                );
                decision.dialogue = enhancedDialogue;
            }
            
            return {
                responseType: 'ACTION',
                action: decision.action,
                content: decision.dialogue,
                thought: decision.reasoning,
                characterId: character.id,
                source: 'mock_ai_decision',
                metadata: {
                    decisionConfidence: decision.confidence,
                    needsPriority: decision.needsPriority,
                    processingTime: Date.now()
                }
            };
            
        } catch (error) {
            console.error('Error handling decision request:', error);
            return this.generateFallbackActionResponse(character, promptContext);
        }
    }

    /**
     * Handle witness reaction requests
     * @param {Object} character - Character object
     * @param {Object} promptContext - Parsed context
     * @param {Object} options - Options
     * @returns {Object} - Witness reaction response
     */
    async handleWitnessReaction(character, promptContext, options) {
        try {
            // Extract witness context
            const witnessDetails = this.extractWitnessDetails(promptContext);
            
            // Determine reaction based on personality and relationship
            const reaction = this.generateWitnessReaction(character, witnessDetails);
            
            return {
                responseType: reaction.type, // 'DIALOGUE' or 'ACTION'
                content: reaction.dialogue,
                action: reaction.action,
                thought: reaction.reasoning,
                characterId: character.id,
                source: 'mock_ai_witness',
                metadata: {
                    witnessedAction: witnessDetails.action,
                    witnessedCharacter: witnessDetails.actor,
                    reactionType: reaction.reactionType,
                    processingTime: Date.now()
                }
            };
            
        } catch (error) {
            console.error('Error handling witness reaction:', error);
            return this.generateFallbackWitnessResponse(character, promptContext);
        }
    }

    /**
     * Handle memory processing requests
     * @param {Object} character - Character object
     * @param {Object} promptContext - Parsed context
     * @param {Object} options - Options
     * @returns {Object} - Memory processing response
     */
    async handleMemoryProcessing(character, promptContext, options) {
        try {
            // Process memories and update character state
            const memoryResult = this.mockAIEngine.memoryProcessor.processMemories(
                promptContext.memories.shortTerm,
                promptContext.memories.longTerm
            );
            
            // Generate any dialogue or actions based on memory processing
            const memoryResponse = this.generateMemoryBasedResponse(character, memoryResult);
            
            return {
                responseType: memoryResponse.type,
                content: memoryResponse.dialogue,
                action: memoryResponse.action,
                thought: memoryResponse.reasoning,
                characterId: character.id,
                source: 'mock_ai_memory',
                metadata: {
                    memoryPatterns: memoryResult.patterns,
                    memoryConfidence: memoryResult.confidence,
                    processingTime: Date.now()
                }
            };
            
        } catch (error) {
            console.error('Error handling memory processing:', error);
            return this.generateFallbackMemoryResponse(character, promptContext);
        }
    }

    /**
     * Handle social interaction requests
     * @param {Object} character - Character object
     * @param {Object} promptContext - Parsed context
     * @param {Object} options - Options
     * @returns {Object} - Social interaction response
     */
    async handleSocialInteraction(character, promptContext, options) {
        try {
            // Analyze social context
            const socialContext = this.analyzeSocialContext(character, promptContext);
            
            // Generate appropriate social response
            const socialResponse = this.generateSocialResponse(character, socialContext);
            
            return {
                responseType: socialResponse.type,
                content: socialResponse.dialogue,
                action: socialResponse.action,
                thought: socialResponse.reasoning,
                characterId: character.id,
                source: 'mock_ai_social',
                metadata: {
                    socialSituation: socialContext.situation,
                    relationshipFactors: socialContext.relationships,
                    processingTime: Date.now()
                }
            };
            
        } catch (error) {
            console.error('Error handling social interaction:', error);
            return this.generateFallbackSocialResponse(character, promptContext);
        }
    }

    /**
     * PARSING HELPER METHODS
     */

    /**
     * Parse character state from prompt section
     * @param {string} stateText - Character state text
     * @returns {Object} - Parsed character state
     */
    parseCharacterState(stateText) {
        const state = {};
        
        // Parse basic info
        const nameMatch = stateText.match(/Name:\s*(.+)/);
        if (nameMatch) state.name = nameMatch[1].trim();
        
        const locationMatch = stateText.match(/Location:\s*(.+)/);
        if (locationMatch) state.location = locationMatch[1].trim();
        
        // Parse needs
        const needsMatch = stateText.match(/Needs:\s*(.+)/);
        if (needsMatch) {
            state.needs = this.parseNeeds(needsMatch[1]);
        }
        
        // Parse personality
        const personalityMatch = stateText.match(/Personality:\s*(.+)/);
        if (personalityMatch) {
            state.personalityTags = personalityMatch[1].split(',').map(p => p.trim());
        }
        
        return state;
    }

    /**
     * Parse needs from text
     * @param {string} needsText - Needs text
     * @returns {Object} - Parsed needs
     */
    parseNeeds(needsText) {
        const needs = {};
        const needPattern = /(\w+):\s*(\d+)/g;
        let match;
        
        while ((match = needPattern.exec(needsText)) !== null) {
            needs[match[1].toLowerCase()] = parseInt(match[2]);
        }
        
        return needs;
    }

    /**
     * Parse memories from text
     * @param {string} memoryText - Memory text
     * @returns {Array} - Parsed memories
     */
    parseMemories(memoryText) {
        return memoryText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('-'))
            .map(memory => ({
                content: memory,
                timestamp: Date.now(),
                importance: this.assessMemoryImportance(memory)
            }));
    }

    /**
     * Parse goals from text
     * @param {string} goalsText - Goals text
     * @returns {Array} - Parsed goals
     */
    parseGoals(goalsText) {
        return goalsText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('-'))
            .map(goal => ({
                description: goal,
                priority: this.assessGoalPriority(goal),
                type: this.classifyGoal(goal)
            }));
    }

    /**
     * Parse available actions from text
     * @param {string} actionsText - Actions text
     * @returns {Array} - Parsed actions
     */
    parseAvailableActions(actionsText) {
        return actionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(action => {
                const actionMatch = action.match(/(\w+)(?:\(([^)]+)\))?/);
                if (actionMatch) {
                    return {
                        type: actionMatch[1],
                        parameters: actionMatch[2] ? actionMatch[2].split(',').map(p => p.trim()) : [],
                        availability: this.assessActionAvailability(action)
                    };
                }
                return { type: action, parameters: [], availability: 'available' };
            });
    }

    /**
     * Parse perceptions from text
     * @param {string} perceptionsText - Perceptions text
     * @returns {Array} - Parsed perceptions
     */
    parsePerceptions(perceptionsText) {
        return perceptionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(perception => ({
                description: perception,
                type: this.classifyPerception(perception),
                relevance: this.assessPerceptionRelevance(perception)
            }));
    }

    /**
     * Extract nearby entities from perceptions
     * @param {Array} perceptions - Parsed perceptions
     * @returns {Array} - Nearby entities
     */
    extractNearbyEntities(perceptions) {
        const entities = [];
        
        perceptions.forEach(perception => {
            // Look for character mentions
            const characterMatch = perception.description.match(/(\w+)\s+is\s+/);
            if (characterMatch) {
                entities.push({
                    type: 'character',
                    name: characterMatch[1],
                    activity: perception.description
                });
            }
            
            // Look for object mentions
            const objectMatch = perception.description.match(/There is (?:a|an)\s+(\w+)/);
            if (objectMatch) {
                entities.push({
                    type: 'object',
                    name: objectMatch[1],
                    description: perception.description
                });
            }
        });
        
        return entities;
    }

    /**
     * Extract location from perceptions
     * @param {Array} perceptions - Parsed perceptions
     * @returns {string} - Location
     */
    extractLocation(perceptions) {
        for (const perception of perceptions) {
            const locationMatch = perception.description.match(/You are (?:in|at) (?:the\s+)?(\w+)/);
            if (locationMatch) {
                return locationMatch[1];
            }
        }
        return 'unknown_location';
    }

    /**
     * Extract conversation details from context
     * @param {Object} promptContext - Prompt context
     * @returns {Object} - Conversation details
     */
    extractConversationDetails(promptContext) {
        const details = {
            incomingMessage: '',
            speaker: null,
            context: {},
            type: 'general'
        };
        
        // Look for conversation patterns in perceptions
        for (const perception of promptContext.perceptions) {
            const conversationMatch = perception.description.match(/(\w+)\s+(?:says?|said)\s*[":]\s*"([^"]+)"/);
            if (conversationMatch) {
                details.speaker = { name: conversationMatch[1], id: conversationMatch[1].toLowerCase() };
                details.incomingMessage = conversationMatch[2];
                details.type = 'dialogue_response';
                break;
            }
        }
        
        // Set context
        details.context = {
            location: promptContext.location,
            nearbyEntities: promptContext.nearbyEntities,
            time: 'current'
        };
        
        return details;
    }

    /**
     * POST-PROCESSING AND ENHANCEMENT METHODS
     */

    /**
     * Post-process response before returning
     * @param {Object} response - Raw response
     * @param {Object} character - Character object
     * @param {Object} promptContext - Prompt context
     * @returns {Object} - Post-processed response
     */
    postProcessResponse(response, character, promptContext) {
        // Ensure response has required fields
        const processedResponse = {
            responseType: response.responseType || 'ACTION',
            characterId: response.characterId || character.id,
            timestamp: Date.now(),
            source: response.source || 'mock_ai',
            ...response
        };
        
        // Validate action if present
        if (processedResponse.action) {
            processedResponse.action = this.validateAction(processedResponse.action, promptContext);
        }
        
        // Clean up dialogue if present
        if (processedResponse.content) {
            processedResponse.content = this.cleanupDialogue(processedResponse.content);
        }
        
        // Add processing metadata
        processedResponse.metadata = {
            ...processedResponse.metadata,
            promptType: promptContext.requestType,
            characterPersonality: character.personalityTags,
            processingLatency: Date.now() - (processedResponse.metadata?.processingTime || Date.now())
        };
        
        return processedResponse;
    }

    /**
     * Enhance dialogue using conversational system
     * @param {string} dialogue - Base dialogue
     * @param {Object} character - Character object
     * @param {Object} context - Context object
     * @returns {string} - Enhanced dialogue
     */
    enhanceDialogueWithConversationalSystem(dialogue, character, context) {
        try {
            // Use conversational system to enhance the dialogue
            return this.conversationalSystem.applyPersonalityEnhancements(
                dialogue,
                character,
                { messageType: 'statement', sentiment: 'neutral' }
            );
        } catch (error) {
            console.warn('Failed to enhance dialogue:', error);
            return dialogue;
        }
    }

    /**
     * FALLBACK RESPONSE GENERATORS
     */

    /**
     * Generate fallback dialogue response
     * @param {Object} character - Character object
     * @param {Object} promptContext - Prompt context
     * @returns {Object} - Fallback response
     */
    generateFallbackDialogueResponse(character, promptContext) {
        const fallbackDialogues = [
            'I see.',
            'That\'s interesting.',
            'Tell me more.',
            'I understand.',
            'Good point.'
        ];
        
        return {
            responseType: 'DIALOGUE',
            content: fallbackDialogues[Math.floor(Math.random() * fallbackDialogues.length)],
            thought: 'Generated fallback dialogue response',
            characterId: character.id,
            source: 'mock_ai_fallback'
        };
    }

    /**
     * Generate fallback action response
     * @param {Object} character - Character object
     * @param {Object} promptContext - Prompt context
     * @returns {Object} - Fallback response
     */
    generateFallbackActionResponse(character, promptContext) {
        return {
            responseType: 'ACTION',
            action: {
                type: 'IDLE',
                duration: 5000,
                priority: 'low'
            },
            thought: 'Generated fallback action - staying idle',
            characterId: character.id,
            source: 'mock_ai_fallback'
        };
    }

    /**
     * PERFORMANCE AND MONITORING
     */

    /**
     * Update performance metrics
     * @param {string} requestId - Request ID
     * @param {number} startTime - Start time
     * @param {boolean} success - Success flag
     * @param {string} responseType - Response type
     */
    updatePerformanceMetrics(requestId, startTime, success, responseType) {
        const responseTime = Date.now() - startTime;
        
        this.performanceMetrics.totalRequests++;
        
        if (success) {
            this.performanceMetrics.successfulRequests++;
        } else {
            this.performanceMetrics.failedRequests++;
        }
        
        // Update average response time
        this.performanceMetrics.totalResponseTime += responseTime;
        this.performanceMetrics.averageResponseTime = 
            this.performanceMetrics.totalResponseTime / this.performanceMetrics.totalRequests;
        
        // Track response types
        const currentCount = this.performanceMetrics.decisionTypes.get(responseType) || 0;
        this.performanceMetrics.decisionTypes.set(responseType, currentCount + 1);
        
        if (this.debugMode) {
            console.log(`📊 Request ${requestId}: ${responseTime}ms, Success: ${success}, Type: ${responseType}`);
        }
    }

    /**
     * Update character usage tracking
     * @param {string} characterId - Character ID
     */
    updateCharacterUsage(characterId) {
        const currentCount = this.performanceMetrics.characterUsage.get(characterId) || 0;
        this.performanceMetrics.characterUsage.set(characterId, currentCount + 1);
    }

    /**
     * Track error for character
     * @param {string} characterId - Character ID
     * @param {Error} error - Error object
     */
    trackCharacterError(characterId, error) {
        const currentCount = this.errorCounts.get(characterId) || 0;
        this.errorCounts.set(characterId, currentCount + 1);
        
        console.warn(`⚠️ Error count for ${characterId}: ${currentCount + 1}/${this.maxErrorsPerCharacter}`);
    }

    /**
     * Get performance statistics
     * @returns {Object} - Performance statistics
     */
    getPerformanceStats() {
        const successRate = this.performanceMetrics.totalRequests > 0 ? 
            (this.performanceMetrics.successfulRequests / this.performanceMetrics.totalRequests) * 100 : 0;
        
        return {
            serviceHealth: this.serviceHealth,
            totalRequests: this.performanceMetrics.totalRequests,
            successRate: successRate.toFixed(2) + '%',
            averageResponseTime: Math.round(this.performanceMetrics.averageResponseTime) + 'ms',
            decisionTypes: Object.fromEntries(this.performanceMetrics.decisionTypes),
            characterUsage: Object.fromEntries(this.performanceMetrics.characterUsage),
            errorCounts: Object.fromEntries(this.errorCounts),
            uptime: Date.now() - this.performanceMetrics.lastReset,
            conversationStats: this.conversationalSystem.getConversationStats()
        };
    }

    /**
     * MAINTENANCE AND HEALTH MONITORING
     */

    /**
     * Setup periodic maintenance tasks
     */
    setupMaintenanceTasks() {
        // Character state cache cleanup
        setInterval(() => {
            this.cleanupCharacterStateCache();
        }, this.cacheTimeout);
        
        // Conversation history cleanup
        setInterval(() => {
            this.conversationalSystem.cleanupOldConversations();
        }, 300000); // 5 minutes
        
        // Error count reset
        setInterval(() => {
            this.errorCounts.clear();
            console.log('🔄 Error counts reset');
        }, this.errorResetInterval);
        
        // Performance metrics logging
        if (this.debugMode) {
            setInterval(() => {
                console.log('📊 Performance Stats:', this.getPerformanceStats());
            }, 60000); // 1 minute
        }
    }

    /**
     * Setup health monitoring
     */
    setupHealthMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // 30 seconds
    }

    /**
     * Perform health check
     */
    performHealthCheck() {
        const now = Date.now();
        let healthIssues = [];
        
        // Check subsystem availability
        if (!this.mockAIEngine) {
            healthIssues.push('Mock AI Engine unavailable');
        }
        
        if (!this.conversationalSystem) {
            healthIssues.push('Conversational System unavailable');
        }
        
        // Check error rates
        const recentRequests = this.performanceMetrics.totalRequests;
        const recentFailures = this.performanceMetrics.failedRequests;
        
        if (recentRequests > 10 && (recentFailures / recentRequests) > 0.2) {
            healthIssues.push('High error rate detected');
        }
        
        // Check response times
        if (this.performanceMetrics.averageResponseTime > 5000) {
            healthIssues.push('High response times detected');
        }
        
        // Update health status
        if (healthIssues.length === 0) {
            this.serviceHealth = 'healthy';
        } else if (healthIssues.length < 3) {
            this.serviceHealth = 'degraded';
            console.warn('⚠️ Service health degraded:', healthIssues);
        } else {
            this.serviceHealth = 'unhealthy';
            console.error('❌ Service unhealthy:', healthIssues);
        }
        
        this.lastHealthCheck = now;
    }

    /**
     * CACHE MANAGEMENT
     */

    /**
     * Get character state from cache
     * @param {string} characterId - Character ID
     * @returns {Object|null} - Cached state or null
     */
    getCharacterStateFromCache(characterId) {
        const cached = this.characterStateCache.get(characterId);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.state;
        }
        return null;
    }

    /**
     * Update character state cache
     * @param {Object} character - Character object
     */
    updateCharacterStateCache(character) {
        this.characterStateCache.set(character.id, {
            state: { ...character },
            timestamp: Date.now()
        });
    }

    /**
     * Cleanup character state cache
     */
    cleanupCharacterStateCache() {
        const now = Date.now();
        const keysToDelete = [];
        
        this.characterStateCache.forEach((cached, characterId) => {
            if ((now - cached.timestamp) > this.cacheTimeout) {
                keysToDelete.push(characterId);
            }
        });
        
        keysToDelete.forEach(key => {
            this.characterStateCache.delete(key);
        });
        
        if (keysToDelete.length > 0 && this.debugMode) {
            console.log(`🧹 Cleaned up ${keysToDelete.length} cached character states`);
        }
    }

    /**
     * UTILITY METHODS
     */

    /**
     * Generate unique request ID
     * @returns {string} - Unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Handle request error and provide fallback
     * @param {Error} error - Error object
     * @param {Object} character - Character object
     * @param {string} promptText - Original prompt
     * @returns {Object} - Fallback response
     */
    handleRequestError(error, character, promptText) {
        console.error(`Handling error for ${character.name}:`, error.message);
        
        // Determine appropriate fallback based on error type
        if (error.message.includes('conversation') || error.message.includes('dialogue')) {
            return this.generateFallbackDialogueResponse(character, {});
        }
        
        // Default to action fallback
        return this.generateFallbackActionResponse(character, {});
    }

    /**
     * HELPER ASSESSMENT METHODS
     */

    assessMemoryImportance(memory) {
        // Simple importance scoring based on keywords
        const importantKeywords = ['urgent', 'important', 'critical', 'deadline', 'problem'];
        const memoryLower = memory.toLowerCase();
        
        for (const keyword of importantKeywords) {
            if (memoryLower.includes(keyword)) {
                return 'high';
            }
        }
        
        return 'normal';
    }

    assessGoalPriority(goal) {
        const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical'];
        const goalLower = goal.toLowerCase();
        
        for (const keyword of urgentKeywords) {
            if (goalLower.includes(keyword)) {
                return 'high';
            }
        }
        
        return 'normal';
    }

    classifyGoal(goal) {
        const goalLower = goal.toLowerCase();
        
        if (goalLower.includes('work') || goalLower.includes('task') || goalLower.includes('project')) {
            return 'work';
        }
        
        if (goalLower.includes('social') || goalLower.includes('talk') || goalLower.includes('meet')) {
            return 'social';
        }
        
        if (goalLower.includes('eat') || goalLower.includes('drink') || goalLower.includes('coffee')) {
            return 'personal_needs';
        }
        
        return 'general';
    }

    assessActionAvailability(action) {
        // Simple availability assessment
        return 'available';
    }

    classifyPerception(perception) {
        const perceptionLower = perception.toLowerCase();
        
        if (perceptionLower.includes('someone') || perceptionLower.includes('person')) {
            return 'social';
        }
        
        if (perceptionLower.includes('noise') || perceptionLower.includes('sound')) {
            return 'auditory';
        }
        
        if (perceptionLower.includes('see') || perceptionLower.includes('notice')) {
            return 'visual';
        }
        
        return 'general';
    }

    assessPerceptionRelevance(perception) {
        // Simple relevance scoring
        const relevantKeywords = ['important', 'urgent', 'interesting', 'unusual'];
        const perceptionLower = perception.toLowerCase();
        
        for (const keyword of relevantKeywords) {
            if (perceptionLower.includes(keyword)) {
                return 'high';
            }
        }
        
        return 'normal';
    }

    validateAction(action, promptContext) {
        // Ensure action has required fields
        if (!action.type) {
            action.type = 'IDLE';
        }
        
        if (!action.duration) {
            action.duration = 5000;
        }
        
        if (!action.priority) {
            action.priority = 'normal';
        }
        
        return action;
    }

    cleanupDialogue(dialogue) {
        if (!dialogue || typeof dialogue !== 'string') {
            return '';
        }
        
        // Remove extra whitespace
        dialogue = dialogue.trim().replace(/\s+/g, ' ');
        
        // Ensure proper capitalization
        if (dialogue.length > 0) {
            dialogue = dialogue.charAt(0).toUpperCase() + dialogue.slice(1);
        }
        
        // Add period if missing
        if (dialogue.length > 0 && !/[.!?]$/.test(dialogue)) {
            dialogue += '.';
        }
        
        return dialogue;
    }

    /**
     * ADDITIONAL HELPER METHODS FOR SPECIFIC REQUEST TYPES
     */

    /**
     * Extract witness details from context
     * @param {Object} promptContext - Prompt context
     * @returns {Object} - Witness details
     */
    extractWitnessDetails(promptContext) {
        const details = {
            action: null,
            actor: null,
            location: promptContext.location,
            context: {}
        };
        
        // Look for witnessed actions in perceptions
        for (const perception of promptContext.perceptions) {
            const actionMatch = perception.description.match(/(\w+)\s+is\s+(\w+)/);
            if (actionMatch) {
                details.actor = { name: actionMatch[1], id: actionMatch[1].toLowerCase() };
                details.action = actionMatch[2];
                break;
            }
        }
        
        return details;
    }

    /**
     * Generate witness reaction based on personality and relationship
     * @param {Object} character - Witnessing character
     * @param {Object} witnessDetails - Details of what was witnessed
     * @returns {Object} - Reaction details
     */
    generateWitnessReaction(character, witnessDetails) {
        const personality = character.personalityTags || [];
        
        // Default reaction
        let reaction = {
            type: 'ACTION',
            action: { type: 'IDLE', duration: 2000 },
            dialogue: null,
            reasoning: 'Witnessed an action but chose not to react',
            reactionType: 'neutral'
        };
        
        // Personality-based reactions
        if (personality.includes('Gossip')) {
            reaction = {
                type: 'DIALOGUE',
                action: null,
                dialogue: `Did you see what ${witnessDetails.actor?.name || 'they'} just did?`,
                reasoning: 'Gossip personality compelled me to comment on the action',
                reactionType: 'commentary'
            };
        } else if (personality.includes('Professional')) {
            if (witnessDetails.action && witnessDetails.action.includes('work')) {
                reaction = {
                    type: 'DIALOGUE',
                    action: null,
                    dialogue: 'I should focus on my own work.',
                    reasoning: 'Professional personality keeps me focused on work',
                    reactionType: 'dismissive'
                };
            }
        } else if (personality.includes('Extroverted')) {
            reaction = {
                type: 'DIALOGUE',
                action: null,
                dialogue: `Hey ${witnessDetails.actor?.name || 'there'}!`,
                reasoning: 'Extroverted personality prompted me to engage',
                reactionType: 'engaging'
            };
        }
        
        return reaction;
    }

    /**
     * Generate memory-based response
     * @param {Object} character - Character object
     * @param {Object} memoryResult - Memory processing result
     * @returns {Object} - Memory-based response
     */
    generateMemoryBasedResponse(character, memoryResult) {
        const response = {
            type: 'ACTION',
            action: { type: 'IDLE', duration: 3000 },
            dialogue: null,
            reasoning: 'Processed memories without specific action'
        };
        
        // If memory processing revealed patterns, act on them
        if (memoryResult.patterns && memoryResult.patterns.length > 0) {
            const dominantPattern = memoryResult.patterns[0];
            
            if (dominantPattern.type === 'work_stress') {
                response.dialogue = 'I need to take a break from all this work.';
                response.reasoning = 'Memory patterns show work stress, need break';
            } else if (dominantPattern.type === 'social_interaction') {
                response.dialogue = 'I should catch up with someone.';
                response.reasoning = 'Memory patterns show need for social interaction';
            }
        }
        
        return response;
    }

    /**
     * Analyze social context for social interaction requests
     * @param {Object} character - Character object
     * @param {Object} promptContext - Prompt context
     * @returns {Object} - Social context analysis
     */
    analyzeSocialContext(character, promptContext) {
        const context = {
            situation: 'general',
            relationships: {},
            groupDynamics: 'individual',
            socialOpportunities: []
        };
        
        // Analyze nearby entities for social opportunities
        const nearbyCharacters = promptContext.nearbyEntities.filter(entity => entity.type === 'character');
        
        if (nearbyCharacters.length === 0) {
            context.situation = 'alone';
        } else if (nearbyCharacters.length === 1) {
            context.situation = 'one_on_one';
            context.groupDynamics = 'paired';
        } else {
            context.situation = 'group';
            context.groupDynamics = 'group';
        }
        
        // Identify social opportunities
        nearbyCharacters.forEach(char => {
            context.socialOpportunities.push({
                character: char.name,
                opportunity: this.assessSocialOpportunity(character, char)
            });
        });
        
        return context;
    }

    /**
     * Assess social opportunity with another character
     * @param {Object} character - Current character
     * @param {Object} otherCharacter - Other character
     * @returns {string} - Opportunity type
     */
    assessSocialOpportunity(character, otherCharacter) {
        const personality = character.personalityTags || [];
        
        if (personality.includes('Extroverted')) {
            return 'conversation_starter';
        } else if (personality.includes('Gossip')) {
            return 'information_exchange';
        } else if (personality.includes('Professional')) {
            return 'work_discussion';
        }
        
        return 'casual_interaction';
    }

    /**
     * Generate social response
     * @param {Object} character - Character object
     * @param {Object} socialContext - Social context
     * @returns {Object} - Social response
     */
    generateSocialResponse(character, socialContext) {
        const response = {
            type: 'ACTION',
            action: { type: 'IDLE', duration: 3000 },
            dialogue: null,
            reasoning: 'No specific social action needed'
        };
        
        if (socialContext.situation === 'alone') {
            response.reasoning = 'No one around to interact with';
        } else if (socialContext.socialOpportunities.length > 0) {
            const opportunity = socialContext.socialOpportunities[0];
            
            switch (opportunity.opportunity) {
                case 'conversation_starter':
                    response.type = 'DIALOGUE';
                    response.dialogue = this.conversationalSystem.generateConversationStarter(
                        character,
                        { name: opportunity.character },
                        { location: socialContext.location }
                    );
                    response.reasoning = 'Starting conversation with nearby person';
                    break;
                    
                case 'work_discussion':
                    response.type = 'DIALOGUE';
                    response.dialogue = 'How is your project going?';
                    response.reasoning = 'Professional discussion with colleague';
                    break;
                    
                case 'information_exchange':
                    response.type = 'DIALOGUE';
                    response.dialogue = 'Did you hear about what happened earlier?';
                    response.reasoning = 'Gossip personality seeking information exchange';
                    break;
                    
                default:
                    response.type = 'DIALOGUE';
                    response.dialogue = 'Hi there.';
                    response.reasoning = 'Casual social interaction';
            }
        }
        
        return response;
    }

    /**
     * Generate fallback responses for specific request types
     */
    generateFallbackWitnessResponse(character, promptContext) {
        return {
            responseType: 'ACTION',
            action: { type: 'IDLE', duration: 2000, priority: 'low' },
            thought: 'Witnessed something but choosing not to react',
            characterId: character.id,
            source: 'mock_ai_fallback_witness'
        };
    }

    generateFallbackMemoryResponse(character, promptContext) {
        return {
            responseType: 'ACTION',
            action: { type: 'IDLE', duration: 3000, priority: 'low' },
            thought: 'Processing memories, no immediate action needed',
            characterId: character.id,
            source: 'mock_ai_fallback_memory'
        };
    }

    generateFallbackSocialResponse(character, promptContext) {
        const personality = character.personalityTags || [];
        
        if (personality.includes('Extroverted')) {
            return {
                responseType: 'DIALOGUE',
                content: 'Hello there!',
                thought: 'Extroverted fallback - greeting someone',
                characterId: character.id,
                source: 'mock_ai_fallback_social'
            };
        }
        
        return {
            responseType: 'ACTION',
            action: { type: 'IDLE', duration: 3000, priority: 'low' },
            thought: 'Social situation unclear, staying neutral',
            characterId: character.id,
            source: 'mock_ai_fallback_social'
        };
    }

    /**
     * PUBLIC API METHODS FOR EXTERNAL INTEGRATION
     */

    /**
     * Check if service is ready to handle requests
     * @returns {boolean} - True if ready
     */
    isReady() {
        return this.isInitialized && this.serviceHealth !== 'failed';
    }

    /**
     * Get service status information
     * @returns {Object} - Service status
     */
    getServiceStatus() {
        return {
            initialized: this.isInitialized,
            health: this.serviceHealth,
            lastHealthCheck: this.lastHealthCheck,
            performance: this.getPerformanceStats(),
            subsystems: {
                mockAIEngine: !!this.mockAIEngine,
                conversationalSystem: !!this.conversationalSystem
            }
        };
    }

    /**
     * Reset service statistics (for testing or maintenance)
     */
    resetStatistics() {
        this.performanceMetrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTime: 0,
            decisionTypes: new Map(),
            characterUsage: new Map(),
            lastReset: Date.now()
        };
        
        this.errorCounts.clear();
        this.conversationalSystem.resetGlobalStats();
        
        console.log('📊 Mock AI Service statistics reset');
    }

    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Debug mode state
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`🐛 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Force garbage collection and cleanup
     */
    performMaintenance() {
        console.log('🧹 Performing Mock AI Service maintenance...');
        
        // Cleanup caches
        this.cleanupCharacterStateCache();
        this.conversationalSystem.cleanupOldConversations();
        
        // Reset error counts
        this.errorCounts.clear();
        
        // Force health check
        this.performHealthCheck();
        
        console.log('✅ Maintenance completed');
    }

    /**
     * Get detailed analytics for debugging and optimization
     * @returns {Object} - Detailed analytics
     */
    getDetailedAnalytics() {
        return {
            service: this.getServiceStatus(),
            performance: this.getPerformanceStats(),
            conversations: this.conversationalSystem.getConversationStats(),
            systemAnalysis: this.conversationalSystem.analyzeSystemPerformance(),
            memoryUsage: {
                characterStateCache: this.characterStateCache.size,
                conversationHistory: this.conversationalSystem.conversationHistory.size,
                errorCounts: this.errorCounts.size
            },
            uptime: Date.now() - this.performanceMetrics.lastReset
        };
    }

    /**
     * SHUTDOWN AND CLEANUP
     */

    /**
     * Gracefully shutdown the service
     */
    async shutdown() {
        console.log('🔄 Shutting down Mock AI Service...');
        
        try {
            // Perform final maintenance
            this.performMaintenance();
            
            // Clear all caches
            this.characterStateCache.clear();
            this.conversationalSystem.conversationHistory.clear();
            
            // Mark as not initialized
            this.isInitialized = false;
            this.serviceHealth = 'shutdown';
            
            console.log('✅ Mock AI Service shutdown completed');
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }
}
