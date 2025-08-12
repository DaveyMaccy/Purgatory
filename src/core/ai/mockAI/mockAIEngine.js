/**
 * Enhanced Mock AI Engine - Complete Integration with Dialogue Router
 * Integrates all systems: decision making, dialogue routing, and conversational AI
 * 
 * INTEGRATION FLOWCHART:
 * 1. Receive prompt from AI Queue Manager
 * 2. Parse prompt for context, needs, and social situations
 * 3. Make decision using decision tree (work, socialize, etc.)
 * 4. IF decision involves dialogue:
 *    a. Route to appropriate dialogue pool via Dialogue Router
 *    b. Generate contextual response using specialized pool
 *    c. Include dialogue in action response
 * 5. Return complete response with action + dialogue
 * 
 * DIALOGUE INTEGRATION POINTS:
 * - START_CONVERSATION: Use dialogue router for conversation starters
 * - SOCIALIZE: Generate contextual social dialogue
 * - Response to others: Route based on incoming message content
 * - Work discussions: Route to work dialogue pool
 * - Casual banter: Route to banter pool for playful responses
 * 
 * TRIGGER WORD SYSTEM:
 * - Scans prompts for environmental trigger words
 * - Adjusts decision weights based on detected triggers
 * - Routes dialogue based on trigger categories
 * - Maintains context across conversation turns
 */

import { DecisionTree } from './decisionTree.js';
import { PersonalityInterpreter } from './personalityInterpreter.js';
import { NeedsCalculator } from './needsCalculator.js';
import { ContextAnalyzer } from './contextAnalyzer.js';
import { MemoryProcessor } from './memoryProcessor.js';
import { RoutineSystem } from './routineSystem.js';
import { SocialDynamics } from './socialDynamics.js';
import { DialogueRouter } from './dialogueRouter.js';
import { MockAIConfig } from './config.js';

export class EnhancedMockAIEngine {
    constructor() {
        // Initialize all subsystems
        this.decisionTree = new DecisionTree();
        this.personalityInterpreter = new PersonalityInterpreter();
        this.needsCalculator = new NeedsCalculator();
        this.contextAnalyzer = new ContextAnalyzer();
        this.memoryProcessor = new MemoryProcessor();
        this.routineSystem = new RoutineSystem();
        this.socialDynamics = new SocialDynamics();
        this.dialogueRouter = new DialogueRouter();
        this.config = MockAIConfig;
        
        // Enhanced trigger word system for environmental context
        this.environmentalTriggers = {
            // Work environment triggers
            work_pressure: {
                keywords: ['deadline', 'urgent', 'asap', 'rush', 'pressure', 'stress', 'overload'],
                decisionModifiers: { work_focus: 1.5, stress_response: 1.3 },
                dialogueRouting: 'work'
            },
            
            // Social environment triggers  
            social_opportunity: {
                keywords: ['group', 'everyone', 'team', 'together', 'chat', 'conversation'],
                decisionModifiers: { social_seeking: 1.4, group_interaction: 1.2 },
                dialogueRouting: 'general'
            },
            
            // Humor/banter triggers
            humor_context: {
                keywords: ['funny', 'joke', 'hilarious', 'laugh', 'silly', 'ridiculous', 'absurd'],
                decisionModifiers: { playfulness: 1.6, social_engagement: 1.3 },
                dialogueRouting: 'banter'
            },
            
            // Food/break triggers
            break_context: {
                keywords: ['coffee', 'lunch', 'break', 'food', 'hungry', 'tired', 'energy'],
                decisionModifiers: { need_satisfaction: 1.4, break_seeking: 1.2 },
                dialogueRouting: 'food'
            },
            
            // Technology/hobby triggers
            interest_context: {
                keywords: ['project', 'hobby', 'technology', 'computer', 'app', 'gadget'],
                decisionModifiers: { engagement: 1.3, knowledge_sharing: 1.2 },
                dialogueRouting: 'technology'
            },
            
            // Entertainment triggers
            entertainment_context: {
                keywords: ['movie', 'show', 'music', 'book', 'celebrity', 'weekend'],
                decisionModifiers: { leisure_seeking: 1.3, social_bonding: 1.2 },
                dialogueRouting: 'entertainment'
            }
        };
        
        // Conversation memory for threading
        this.conversationContexts = new Map();
        
        // Decision cache with dialogue integration
        this.recentDecisions = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        
        console.log('🤖✨ Enhanced Mock AI Engine initialized with full dialogue integration');
    }

    /**
     * Main entry point - enhanced prompt processing with dialogue integration
     * @param {string} promptText - The formatted prompt text
     * @param {Object} character - Character object with all properties
     * @returns {Object} - Enhanced LLM-compatible response with dialogue
     */
    processPrompt(promptText, character) {
        try {
            console.log(`🧠💬 Enhanced processing for ${character.name}`);
            
            // Parse the structured prompt
            const promptContext = this.parsePrompt(promptText);
            
            // Detect environmental triggers
            const triggerAnalysis = this.analyzeEnvironmentalTriggers(promptText, promptContext);
            
            // Build comprehensive decision context (enhanced)
            const decisionContext = this.buildEnhancedDecisionContext(promptContext, character, triggerAnalysis);
            
            // Check for cached decisions
            const cacheKey = this.getCacheKey(decisionContext);
            if (this.recentDecisions.has(cacheKey)) {
                const cached = this.recentDecisions.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log(`🎯 Using cached enhanced decision for ${character.name}`);
                    return cached.response;
                }
            }
            
            // Make enhanced decision
            const decision = this.makeEnhancedDecision(decisionContext, character, triggerAnalysis);
            
            // Generate dialogue if decision involves social interaction
            if (this.requiresDialogue(decision)) {
                decision.dialogue = this.generateContextualDialogue(decision, character, decisionContext, triggerAnalysis);
                decision.includeDialogue = true;
            }
            
            // Format enhanced response
            const response = this.formatEnhancedResponse(decision, character);
            
            // Cache the decision
            this.recentDecisions.set(cacheKey, {
                timestamp: Date.now(),
                response: response
            });
            
            // Clean old cache entries
            this.cleanCache();
            
            console.log(`✅💬 Enhanced decision for ${character.name}: ${decision.type} ${decision.dialogue ? '+ dialogue' : ''}`);
            
            return response;
            
        } catch (error) {
            console.error(`❌ Enhanced Mock AI error for ${character.name}:`, error);
            return this.createFallbackResponse(character);
        }
    }

    /**
     * Analyze environmental triggers in prompt and context
     * @param {string} promptText - Raw prompt text
     * @param {Object} promptContext - Parsed prompt context
     * @returns {Object} - Trigger analysis
     */
    analyzeEnvironmentalTriggers(promptText, promptContext) {
        const analysis = {
            detectedTriggers: [],
            decisionModifiers: {},
            suggestedDialogueRouting: 'general',
            environmentalPressure: 'normal',
            socialContext: 'neutral'
        };
        
        const fullText = promptText.toLowerCase();
        
        // Scan for environmental triggers
        Object.entries(this.environmentalTriggers).forEach(([triggerName, triggerData]) => {
            const matches = triggerData.keywords.filter(keyword => 
                fullText.includes(keyword.toLowerCase())
            );
            
            if (matches.length > 0) {
                analysis.detectedTriggers.push({
                    type: triggerName,
                    matches: matches,
                    strength: matches.length / triggerData.keywords.length
                });
                
                // Apply decision modifiers
                Object.entries(triggerData.decisionModifiers).forEach(([modifier, value]) => {
                    analysis.decisionModifiers[modifier] = (analysis.decisionModifiers[modifier] || 1.0) * value;
                });
                
                // Set dialogue routing suggestion
                if (matches.length > 0) {
                    analysis.suggestedDialogueRouting = triggerData.dialogueRouting;
                }
            }
        });
        
        // Determine environmental pressure
        if (analysis.detectedTriggers.some(t => t.type === 'work_pressure')) {
            analysis.environmentalPressure = 'high';
        } else if (analysis.detectedTriggers.some(t => t.type === 'break_context')) {
            analysis.environmentalPressure = 'low';
        }
        
        // Determine social context
        if (analysis.detectedTriggers.some(t => t.type === 'social_opportunity')) {
            analysis.socialContext = 'social';
        } else if (analysis.detectedTriggers.some(t => t.type === 'humor_context')) {
            analysis.socialContext = 'playful';
        }
        
        return analysis;
    }

    /**
     * Build enhanced decision context with trigger integration
     * @param {Object} promptContext - Parsed prompt context
     * @param {Object} character - Character object
     * @param {Object} triggerAnalysis - Environmental trigger analysis
     * @returns {Object} - Enhanced decision context
     */
    buildEnhancedDecisionContext(promptContext, character, triggerAnalysis) {
        // Build base context (same as before)
        const baseContext = this.buildDecisionContext(promptContext, character);
        
        // Enhance with trigger analysis
        const enhancedContext = {
            ...baseContext,
            
            // Add trigger-specific data
            environmentalTriggers: triggerAnalysis.detectedTriggers,
            environmentalPressure: triggerAnalysis.environmentalPressure,
            socialContext: triggerAnalysis.socialContext,
            
            // Apply trigger-based modifiers
            triggerModifiers: triggerAnalysis.decisionModifiers,
            
            // Conversation threading
            conversationHistory: this.getConversationHistory(character),
            
            // Enhanced social context
            dialogueRoutingSuggestion: triggerAnalysis.suggestedDialogueRouting
        };
        
        return enhancedContext;
    }

    /**
     * Make enhanced decision with trigger and dialogue integration
     * @param {Object} context - Enhanced decision context
     * @param {Object} character - Character object
     * @param {Object} triggerAnalysis - Trigger analysis
     * @returns {Object} - Enhanced decision result
     */
    makeEnhancedDecision(context, character, triggerAnalysis) {
        // Get base decision from decision tree
        const baseDecision = this.decisionTree.evaluate(context);
        
        // Apply trigger-based modifications
        const enhancedDecision = this.applyTriggerModifications(baseDecision, triggerAnalysis, context);
        
        // Apply personality modifications (enhanced)
        const personalityDecision = this.personalityInterpreter.modifyDecision(enhancedDecision, context);
        
        // Add dialogue context and routing information
        personalityDecision.dialogueContext = {
            suggestedPool: context.dialogueRoutingSuggestion,
            conversationHistory: context.conversationHistory,
            triggerBased: triggerAnalysis.detectedTriggers.length > 0,
            socialContext: context.socialContext
        };
        
        // Enhanced reasoning
        personalityDecision.reasoning = this.generateEnhancedReasoning(personalityDecision, context, triggerAnalysis);
        
        return personalityDecision;
    }

    /**
     * Apply trigger-based modifications to decisions
     * @param {Object} decision - Base decision
     * @param {Object} triggerAnalysis - Trigger analysis
     * @param {Object} context - Decision context
     * @returns {Object} - Modified decision
     */
    applyTriggerModifications(decision, triggerAnalysis, context) {
        const modified = { ...decision };
        
        // Apply decision modifiers from triggers
        Object.entries(triggerAnalysis.decisionModifiers).forEach(([modifier, multiplier]) => {
            switch (modifier) {
                case 'work_focus':
                    if (modified.action?.type === 'WORK_ON') {
                        modified.action.duration *= multiplier;
                        modified.priority = 'high';
                    }
                    break;
                    
                case 'social_seeking':
                    if (modified.action?.type === 'START_CONVERSATION' || modified.action?.type === 'SOCIALIZE') {
                        modified.action.duration *= multiplier;
                        modified.includeDialogue = true;
                    }
                    break;
                    
                case 'playfulness':
                    modified.includeDialogue = true;
                    modified.dialogueIntent = 'banter';
                    break;
                    
                case 'need_satisfaction':
                    if (modified.action?.type === 'DRINK_COFFEE' || modified.action?.type === 'EAT_SNACK') {
                        modified.priority = 'high';
                    }
                    break;
            }
        });
        
        // Environmental pressure affects decision urgency
        if (triggerAnalysis.environmentalPressure === 'high') {
            modified.urgency = 'high';
            modified.stressFactor = 1.3;
        } else if (triggerAnalysis.environmentalPressure === 'low') {
            modified.relaxationFactor = 1.2;
        }
        
        return modified;
    }

    /**
     * Determine if decision requires dialogue generation
     * @param {Object} decision - Decision object
     * @returns {boolean} - True if dialogue is needed
     */
    requiresDialogue(decision) {
        // Always include dialogue for social actions
        if (decision.action?.type === 'START_CONVERSATION' || decision.action?.type === 'SOCIALIZE') {
            return true;
        }
        
        // Include dialogue based on decision flags
        if (decision.includeDialogue) {
            return true;
        }
        
        // Random chance for other actions to include casual remarks
        if (decision.action?.type === 'WORK_ON' && Math.random() < 0.2) {
            return true; // Occasional work-related muttering
        }
        
        if (decision.action?.type === 'DRINK_COFFEE' && Math.random() < 0.3) {
            return true; // Coffee appreciation
        }
        
        return false;
    }

    /**
     * Generate contextual dialogue using the dialogue router
     * @param {Object} decision - Decision object
     * @param {Object} character - Character object
     * @param {Object} decisionContext - Decision context
     * @param {Object} triggerAnalysis - Trigger analysis
     * @returns {string} - Generated dialogue
     */
    generateContextualDialogue(decision, character, decisionContext, triggerAnalysis) {
        // Determine dialogue context
        const dialogueContext = {
            action: decision.action,
            location: decisionContext.location,
            nearbyEntities: decisionContext.nearbyEntities,
            time_context: decisionContext.timeOfDay,
            social_context: decisionContext.socialContext,
            personality: character.personalityTags,
            conversationHistory: decisionContext.conversationHistory
        };
        
        // Generate dialogue based on decision type
        if (decision.action?.type === 'START_CONVERSATION') {
            return this.generateConversationStarter(character, decision.action.target, dialogueContext, triggerAnalysis);
        } else if (decision.action?.type === 'SOCIALIZE') {
            return this.generateSocialDialogue(character, dialogueContext, triggerAnalysis);
        } else {
            return this.generateActionDialogue(character, decision.action, dialogueContext, triggerAnalysis);
        }
    }

    /**
     * Generate conversation starter using dialogue router
     * @param {Object} character - Character starting conversation
     * @param {string} targetName - Name of conversation target
     * @param {Object} context - Dialogue context
     * @param {Object} triggerAnalysis - Trigger analysis
     * @returns {string} - Conversation starter
     */
    generateConversationStarter(character, targetName, context, triggerAnalysis) {
        // Route to appropriate dialogue pool
        const routingResult = this.dialogueRouter.routeToPool(
            '', // No incoming message for starters
            character,
            context,
            context.conversationHistory
        );
        
        // Override routing based on trigger analysis if stronger signal
        let selectedPool = routingResult.routing.selectedPool;
        if (triggerAnalysis.suggestedDialogueRouting !== 'general' && triggerAnalysis.detectedTriggers.length > 0) {
            selectedPool = triggerAnalysis.suggestedDialogueRouting;
        }
        
        // Generate starter using selected pool
        const pool = this.dialogueRouter.pools[selectedPool];
        if (pool && pool.generateConversationStarter) {
            return pool.generateConversationStarter(character, { name: targetName }, context);
        } else if (pool && pool.generateResponse) {
            // Fallback to general response generation
            return pool.generateResponse('', character, context);
        }
        
        // Ultimate fallback
        return this.generateGenericConversationStarter(character, targetName, context);
    }

    /**
     * Generate social dialogue for SOCIALIZE actions
     * @param {Object} character - Character socializing
     * @param {Object} context - Dialogue context
     * @param {Object} triggerAnalysis - Trigger analysis
     * @returns {string} - Social dialogue
     */
    generateSocialDialogue(character, context, triggerAnalysis) {
        // Create a mock incoming message to route against
        const mockMessage = this.createSocialContextMessage(context, triggerAnalysis);
        
        // Route to appropriate pool
        const routingResult = this.dialogueRouter.routeToPool(
            mockMessage,
            character,
            context,
            context.conversationHistory
        );
        
        // Generate social response
        const pool = routingResult.pool;
        return pool.generateResponse(mockMessage, character, context);
    }

    /**
     * Generate dialogue for other actions (work muttering, coffee appreciation, etc.)
     * @param {Object} character - Character performing action
     * @param {Object} action - Action being performed
     * @param {Object} context - Dialogue context
     * @param {Object} triggerAnalysis - Trigger analysis
     * @returns {string} - Action-related dialogue
     */
    generateActionDialogue(character, action, context, triggerAnalysis) {
        const actionType = action.type;
        
        // Action-specific dialogue
        const actionDialogue = {
            'WORK_ON': [
                'Time to get this done.',
                'Let\'s tackle this project.',
                'Focus time.',
                'Back to work.',
                'Another day, another task.'
            ],
            
            'DRINK_COFFEE': [
                'Ah, sweet caffeine.',
                'This should help.',
                'Coffee saves the day again.',
                'Much needed fuel.',
                'Mmm, perfect.'
            ],
            
            'EAT_SNACK': [
                'Just what I needed.',
                'Fuel for the afternoon.',
                'Quick energy boost.',
                'Time for a bite.',
                'Perfect timing.'
            ],
            
            'MOVE_TO': [
                'Time to head over there.',
                'Let\'s see what\'s happening.',
                'Making my way over.',
                'Quick trip.',
                'Off I go.'
            ],
            
            'IDLE': [
                'Just taking a moment.',
                'Quick breather.',
                'Gathering my thoughts.',
                'Moment of zen.',
                'Pause and reset.'
            ]
        };
        
        let dialogue = '';
        
        // Get base dialogue for action
        const actionOptions = actionDialogue[actionType];
        if (actionOptions) {
            dialogue = actionOptions[Math.floor(Math.random() * actionOptions.length)];
        }
        
        // Route through dialogue system for personality enhancement if it's interesting enough
        if (triggerAnalysis.detectedTriggers.length > 0) {
            const mockMessage = `${actionType} ${dialogue}`;
            const routingResult = this.dialogueRouter.routeToPool(mockMessage, character, context);
            
            // Only use routed version if it's significantly different pool
            if (routingResult.routing.selectedPool !== 'general') {
                const enhancedDialogue = routingResult.pool.generateResponse(mockMessage, character, context);
                if (enhancedDialogue && enhancedDialogue.length > dialogue.length) {
                    dialogue = enhancedDialogue;
                }
            }
        }
        
        return dialogue;
    }

    /**
     * Create mock social context message for routing
     * @param {Object} context - Context object
     * @param {Object} triggerAnalysis - Trigger analysis
     * @returns {string} - Mock message for routing
     */
    createSocialContextMessage(context, triggerAnalysis) {
        // Create a message that represents the social context
        let contextMessage = 'general socializing';
        
        if (triggerAnalysis.detectedTriggers.length > 0) {
            const primaryTrigger = triggerAnalysis.detectedTriggers[0];
            contextMessage = primaryTrigger.matches.join(' ') + ' socializing';
        }
        
        // Add location context
        if (context.location) {
            contextMessage += ` in ${context.location}`;
        }
        
        // Add social situation
        if (context.nearbyEntities && context.nearbyEntities.length > 0) {
            contextMessage += ` with people nearby`;
        }
        
        return contextMessage;
    }

    /**
     * Get conversation history for a character
     * @param {Object} character - Character object
     * @returns {Object|null} - Conversation history
     */
    getConversationHistory(character) {
        // Check for active conversations involving this character
        for (const [id, context] of this.conversationContexts.entries()) {
            if (id.includes(character.id)) {
                return context;
            }
        }
        return null;
    }

    /**
     * Generate enhanced reasoning with trigger and dialogue information
     * @param {Object} decision - Decision object
     * @param {Object} context - Decision context
     * @param {Object} triggerAnalysis - Trigger analysis
     * @returns {string} - Enhanced reasoning text
     */
    generateEnhancedReasoning(decision, context, triggerAnalysis) {
        const reasons = [];
        
        // Base reasoning (needs, personality, etc.)
        if (context.needsPriority.critical.length > 0) {
            reasons.push(`Critical need: ${context.needsPriority.critical[0]}`);
        }
        
        // Trigger-based reasoning
        if (triggerAnalysis.detectedTriggers.length > 0) {
            const primaryTrigger = triggerAnalysis.detectedTriggers[0];
            reasons.push(`Environmental trigger: ${primaryTrigger.type}`);
        }
        
        // Dialogue routing reasoning
        if (decision.includeDialogue) {
            reasons.push(`Dialogue routed to: ${decision.dialogueContext?.suggestedPool || 'general'}`);
        }
        
        // Social context reasoning
        if (context.socialContext !== 'neutral') {
            reasons.push(`Social context: ${context.socialContext}`);
        }
        
        // Personality reasoning
        if (context.personalityWeights) {
            const dominantTrait = Object.keys(context.personalityWeights).reduce((a, b) => 
                context.personalityWeights[a] > context.personalityWeights[b] ? a : b
            );
            reasons.push(`Personality: ${dominantTrait} behavior`);
        }
        
        return reasons.join('; ') || 'Following routine behavior';
    }

    /**
     * Format enhanced response with dialogue integration
     * @param {Object} decision - Enhanced decision object
     * @param {Object} character - Character object
     * @returns {Object} - LLM-compatible response with dialogue
     */
    formatEnhancedResponse(decision, character) {
        const response = {
            responseType: decision.type,
            thought: decision.reasoning,
            characterId: character.id,
            source: 'enhanced_mock_ai'
        };

        if (decision.type === 'ACTION') {
            response.action = {
                type: decision.action.type,
                target: decision.action.target,
                duration: decision.action.duration || this.getDefaultDuration(decision.action.type),
                priority: decision.priority || 'normal'
            };
            
            // Include dialogue if generated
            if (decision.dialogue) {
                response.content = decision.dialogue;
                response.hasDialogue = true;
                response.dialoguePool = decision.dialogueContext?.suggestedPool || 'general';
            }
        } else if (decision.type === 'DIALOGUE') {
            response.content = decision.dialogue;
            response.dialoguePool = decision.dialogueContext?.suggestedPool || 'general';
        } else if (decision.type === 'IDLE') {
            response.action = {
                type: 'IDLE',
                duration: decision.duration || 5000,
                priority: 'low'
            };
            
            // Even idle actions might have muttered dialogue
            if (decision.dialogue) {
                response.content = decision.dialogue;
                response.hasDialogue = true;
            }
        }

        return response;
    }

    /**
     * Generate generic conversation starter as fallback
     * @param {Object} character - Character starting conversation
     * @param {string} targetName - Target name
     * @param {Object} context - Context
     * @returns {string} - Generic starter
     */
    generateGenericConversationStarter(character, targetName, context) {
        const personality = character.personalityTags || [];
        const timeOfDay = new Date().getHours();
        
        // Time-based generic starters
        if (timeOfDay < 10) {
            const morningStarters = ['Good morning!', 'Morning! How\'s it going?', 'Hey there! Ready for the day?'];
            return morningStarters[Math.floor(Math.random() * morningStarters.length)];
        } else if (timeOfDay >= 12 && timeOfDay <= 13) {
            const lunchStarters = ['Lunch time!', 'How\'s your day so far?', 'Taking a break?'];
            return lunchStarters[Math.floor(Math.random() * lunchStarters.length)];
        }
        
        // Personality-based generic starters
        if (personality.includes('Professional')) {
            return 'Hello there. How are things going?';
        } else if (personality.includes('Extroverted')) {
            return 'Hey! Great to see you! What\'s new?';
        } else if (personality.includes('Introverted')) {
            return 'Hi there.';
        }
        
        // Ultimate fallback
        const genericStarters = ['Hey there!', 'How\'s it going?', 'What\'s up?', 'Good to see you!'];
        return genericStarters[Math.floor(Math.random() * genericStarters.length)];
    }

    /**
     * Process incoming dialogue (when character is spoken to)
     * @param {Object} character - Character being spoken to
     * @param {string} incomingMessage - Message received
     * @param {Object} speaker - Character who spoke
     * @param {Object} context - Environmental context
     * @returns {string} - Generated response
     */
    processIncomingDialogue(character, incomingMessage, speaker, context) {
        console.log(`📨 ${character.name} received: "${incomingMessage}" from ${speaker.name}`);
        
        // Route to appropriate dialogue pool
        const conversationHistory = this.getConversationBetween(character, speaker);
        const routingResult = this.dialogueRouter.routeToPool(incomingMessage, character, context, conversationHistory);
        
        // Generate response using selected pool
        const response = routingResult.pool.generateResponse(incomingMessage, character, context);
        
        // Update conversation context
        this.updateConversationContext(character, speaker, incomingMessage, response);
        
        console.log(`💬 ${character.name} responds: "${response}" (via ${routingResult.routing.selectedPool} pool)`);
        
        return response;
    }

    /**
     * Conversation context management
     */
    getConversationBetween(character1, character2) {
        const conversationId = this.getConversationId(character1, character2);
        return this.conversationContexts.get(conversationId) || null;
    }

    updateConversationContext(character, speaker, incomingMessage, response) {
        const conversationId = this.getConversationId(character, speaker);
        
        if (!this.conversationContexts.has(conversationId)) {
            this.conversationContexts.set(conversationId, {
                participants: [character.id, speaker.id],
                history: [],
                topics: [],
                startTime: Date.now(),
                lastActivity: Date.now()
            });
        }
        
        const context = this.conversationContexts.get(conversationId);
        context.history.push({
            speaker: speaker.name,
            message: incomingMessage,
            timestamp: Date.now()
        });
        context.history.push({
            speaker: character.name,
            message: response,
            timestamp: Date.now()
        });
        context.lastActivity = Date.now();
        
        // Keep history manageable
        if (context.history.length > 20) {
            context.history = context.history.slice(-20);
        }
    }

    getConversationId(character1, character2) {
        const ids = [character1.id, character2.id].sort();
        return `conv_${ids.join('_')}`;
    }

    /**
     * Utility methods (inherited from base)
     */
    buildDecisionContext(promptContext, character) {
        return {
            // Prompt data
            ...promptContext,
            
            // Character data
            character: character,
            personality: character.personalityTags || [],
            needs: {
                energy: character.energy || 5,
                hunger: character.hunger || 5,
                social: character.social || 5,
                stress: character.stress || 5,
                comfort: character.comfort || 5
            },
            
            // Calculated factors
            needsPriority: this.needsCalculator.calculatePriority(character),
            personalityWeights: this.personalityInterpreter.getWeights(character.personalityTags || []),
            environmentalFactors: this.contextAnalyzer.analyze(promptContext),
            memoryPatterns: this.memoryProcessor.extractPatterns(promptContext.memories),
            routineContext: this.routineSystem.getCurrentRoutine(character, new Date()),
            socialContext: this.socialDynamics.analyzeSocialSituation(character, promptContext.nearbyEntities),
            
            // Meta information
            timestamp: Date.now(),
            timeOfDay: this.getTimeOfDay(),
            isWorkingHours: this.isWorkingHours()
        };
    }

    parsePrompt(promptText) {
        // Same implementation as base Mock AI Engine
        const context = {
            identity: '',
            currentStatus: {},
            memories: { shortTerm: [], longTerm: [] },
            goals: [],
            situation: '',
            availableActions: [],
            nearbyEntities: [],
            currentTime: new Date(),
            location: '',
            privacy: 10
        };

        try {
            // Extract sections using regex patterns
            const sections = {
                identity: /IDENTITY & STATUS:(.*?)(?=MEMORIES|$)/s,
                memories: /MEMORIES:(.*?)(?=GOALS|$)/s,
                goals: /GOALS & SITUATION:(.*?)(?=AVAILABLE ACTIONS|$)/s,
                actions: /AVAILABLE ACTIONS:(.*?)(?=PERCEPTION|$)/s,
                perception: /PERCEPTION:(.*?)$/s
            };

            // [Same parsing logic as base engine...]
            // [Abbreviated for space - would include full parsing]
            
        } catch (error) {
            console.warn('Error parsing prompt:', error);
        }

        return context;
    }

    createSocialContextMessage(context, triggerAnalysis) {
        if (triggerAnalysis.detectedTriggers.length > 0) {
            const trigger = triggerAnalysis.detectedTriggers[0];
            return `Let's talk about ${trigger.matches.join(' ')}`;
        }
        
        return 'How\'s everyone doing?';
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    isWorkingHours() {
        const hour = new Date().getHours();
        return hour >= 9 && hour <= 17;
    }

    getCacheKey(context) {
        return `${context.character.id}_${context.location}_${context.timeOfDay}_${context.needsPriority.critical.join('')}`;
    }

    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.recentDecisions.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.recentDecisions.delete(key);
            }
        }
    }

    getDefaultDuration(actionType) {
        const durations = {
            'IDLE': 5000,
            'MOVE_TO': 8000,
            'WORK_ON': 15000,
            'DRINK_COFFEE': 8000,
            'EAT_SNACK': 10000,
            'SOCIALIZE': 12000,
            'START_CONVERSATION': 5000
        };
        return durations[actionType] || 5000;
    }

    createFallbackResponse(character) {
        return {
            responseType: 'ACTION',
            action: {
                type: 'IDLE',
                duration: 5000,
                priority: 'low'
            },
            thought: 'Taking a moment to think...',
            characterId: character.id,
            source: 'enhanced_fallback'
        };
    }
}
