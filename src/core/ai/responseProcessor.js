/**
 * Conversational Dialogue System - Advanced Reply-Capable AI Integration
 * 
 * SYSTEM OVERVIEW:
 * This is the MASTER COORDINATOR that ties together ALL dialogue subsystems:
 * - Dialogue Router for pool selection
 * - Specialized dialogue pools (Work, Banter, Food, etc.)
 * - General dialogue pool as fallback
 * - Context analysis and conversation threading
 * - Personality-driven response variations
 * 
 * INTEGRATION FLOWCHART:
 * 1. Receive incoming message + character + context
 * 2. Analyze message for topic, sentiment, intent
 * 3. Route through DialogueRouter to select appropriate pool
 * 4. Selected pool generates contextual response
 * 5. Apply personality modifications and conversation threading
 * 6. Track conversation context for future responses
 * 7. Return final polished response
 * 
 * KEY FEATURES:
 * - Seamless integration with existing pool system
 * - Advanced conversation memory and threading
 * - Emotional intelligence and sentiment tracking
 * - Context-aware response generation
 * - Personality-driven conversation styles
 * - Fallback mechanisms for robustness
 * 
 * EXPANSION NOTES:
 * - All pools are pluggable and expandable
 * - Conversation history enables learning and consistency
 * - Emotional contagion system ready for implementation
 * - Multi-turn conversation coherence
 */

import { DialogueRouter } from './dialogueRouter.js';
import { MockAIConfig } from './config.js';

export class ConversationalDialogueSystem {
    constructor() {
        this.config = MockAIConfig;
        
        // Initialize the dialogue router (coordinates all pools)
        this.dialogueRouter = new DialogueRouter();
        
        // Advanced conversation tracking
        this.activeConversations = new Map();
        this.conversationHistory = new Map();
        this.globalConversationStats = {
            totalConversations: 0,
            totalTurns: 0,
            averageConversationLength: 0,
            popularTopics: new Map(),
            sentimentDistribution: {
                positive: 0,
                negative: 0,
                neutral: 0
            }
        };
        
        // Advanced message analysis patterns
        this.messagePatterns = {
            questions: {
                direct: /^(what|how|when|where|why|who|which)\s/i,
                indirect: /(do you|can you|will you|would you|could you|should you)\s/i,
                confirmation: /(right\?|isn't it\?|don't you think\?|you know\?)/i
            },
            
            emotions: {
                excitement: /(amazing|awesome|fantastic|incredible|wonderful|excited|thrilled)/i,
                frustration: /(frustrated|annoyed|irritated|angry|mad|upset)/i,
                sadness: /(sad|depressed|down|blue|disappointed|discouraged)/i,
                stress: /(stressed|overwhelmed|anxious|worried|frantic|pressure)/i,
                happiness: /(happy|glad|pleased|delighted|cheerful|joyful)/i
            },
            
            conversationEnders: /(bye|goodbye|see you|talk later|gotta go|catch you later|take care)/i,
            
            intensifiers: /(really|very|super|extremely|totally|absolutely|completely)/i,
            
            softeners: /(maybe|perhaps|possibly|might|could be|sort of|kind of)/i
        };
        
        // Conversation flow management
        this.conversationFlow = {
            maxTurnsBeforeTopicShift: 8,
            maxTurnsBeforeConversationEnd: 15,
            topicShiftProbability: 0.3,
            conversationEndProbability: 0.2,
            threadingMemoryLength: 5
        };
        
        console.log('💬 Advanced Conversational Dialogue System initialized with DialogueRouter integration');
    }

    /**
     * MAIN ENTRY POINT - Generate contextual response to incoming dialogue
     * This coordinates the entire conversation system
     * @param {Object} character - Character generating response
     * @param {string} incomingMessage - Message they're responding to
     * @param {Object} speaker - Character who spoke the message
     * @param {Object} context - Environmental context
     * @returns {string} - Generated response
     */
    generateResponse(character, incomingMessage, speaker, context) {
        try {
            console.log(`🗣️ CONVERSATION: ${character.name} responding to "${incomingMessage}" from ${speaker?.name || 'unknown'}`);
            
            // STEP 1: Analyze incoming message comprehensively
            const messageAnalysis = this.analyzeIncomingMessage(incomingMessage);
            
            // STEP 2: Get/update conversation context
            const conversationId = this.getConversationId(character, speaker);
            const conversationContext = this.getConversationContext(conversationId);
            
            // STEP 3: Update conversation history with incoming message
            this.updateConversationContext(conversationId, speaker, incomingMessage, messageAnalysis);
            
            // STEP 4: Enhance context with conversation history
            const enhancedContext = this.enhanceContextWithHistory(context, conversationContext);
            
            // STEP 5: Route to appropriate dialogue pool via DialogueRouter
            const routingResult = this.dialogueRouter.routeToPool(
                incomingMessage, 
                character, 
                enhancedContext, 
                conversationContext
            );
            
            console.log(`🎯 ROUTING: Selected ${routingResult.routing.selectedPool} pool (confidence: ${routingResult.routing.confidence.toFixed(2)})`);
            
            // STEP 6: Generate response using selected pool
            let response = routingResult.response;
            
            // STEP 7: Apply conversation threading and personality enhancements
            response = this.applyConversationThreading(response, conversationContext, character);
            response = this.applyPersonalityEnhancements(response, character, messageAnalysis);
            
            // STEP 8: Handle conversation flow management
            response = this.manageConversationFlow(response, conversationContext, character);
            
            // STEP 9: Final polish and validation
            response = this.finalizeResponse(response, character, messageAnalysis);
            
            // STEP 10: Update conversation context with our response
            this.updateConversationContext(conversationId, character, response, {
                isResponse: true,
                routedPool: routingResult.routing.selectedPool,
                confidence: routingResult.routing.confidence
            });
            
            // STEP 11: Update global statistics
            this.updateGlobalStats(messageAnalysis, conversationContext);
            
            console.log(`💭 RESPONSE GENERATED: "${response}"`);
            
            return response;
            
        } catch (error) {
            console.error(`❌ Error generating response for ${character.name}:`, error);
            return this.getEmergencyFallbackResponse(character, incomingMessage);
        }
    }

    /**
     * ADVANCED MESSAGE ANALYSIS - Comprehensive incoming message understanding
     * @param {string} message - Incoming message to analyze
     * @returns {Object} - Detailed analysis results
     */
    analyzeIncomingMessage(message) {
        const analysis = {
            originalMessage: message,
            messageType: this.classifyMessageType(message),
            sentiment: this.analyzeSentiment(message),
            emotionalState: this.detectEmotionalState(message),
            topics: this.extractTopics(message),
            conversationElements: this.analyzeConversationElements(message),
            urgency: this.assessUrgency(message),
            formality: this.assessFormality(message),
            socialCues: this.detectSocialCues(message),
            questionAnalysis: this.analyzeQuestions(message),
            confidence: 0
        };
        
        // Calculate overall analysis confidence
        analysis.confidence = this.calculateAnalysisConfidence(analysis);
        
        console.log(`🔍 MESSAGE ANALYSIS: Type: ${analysis.messageType}, Sentiment: ${analysis.sentiment}, Topics: ${analysis.topics.join(', ')}`);
        
        return analysis;
    }

    /**
     * Classify message type for appropriate handling
     * @param {string} message - Message to classify
     * @returns {string} - Message type
     */
    classifyMessageType(message) {
        const messageLower = message.toLowerCase().trim();
        
        // Check for questions
        if (this.messagePatterns.questions.direct.test(message) ||
            this.messagePatterns.questions.indirect.test(message) ||
            this.messagePatterns.questions.confirmation.test(message) ||
            message.includes('?')) {
            return 'question';
        }
        
        // Check for conversation enders
        if (this.messagePatterns.conversationEnders.test(message)) {
            return 'conversation_ender';
        }
        
        // Check for greetings
        if (/^(hi|hello|hey|good morning|good afternoon|good evening|what's up|how's it going)/i.test(messageLower)) {
            return 'greeting';
        }
        
        // Check for exclamations
        if (message.includes('!') || /^(wow|amazing|incredible|unbelievable)/i.test(messageLower)) {
            return 'exclamation';
        }
        
        // Check for complaints/venting
        if (/(ugh|argh|damn|hate|terrible|awful|worst|annoying)/i.test(messageLower)) {
            return 'complaint';
        }
        
        // Check for sharing information
        if (/(did you hear|guess what|you know what|let me tell you)/i.test(messageLower)) {
            return 'information_sharing';
        }
        
        // Check for requests/commands
        if (/(can you|could you|would you|please|help me)/i.test(messageLower)) {
            return 'request';
        }
        
        // Default classification based on length and punctuation
        if (message.length < 15) {
            return 'short_statement';
        } else if (message.length > 100) {
            return 'long_statement';
        }
        
        return 'statement';
    }

    /**
     * Analyze sentiment of incoming message
     * @param {string} message - Message to analyze
     * @returns {string} - Sentiment classification
     */
    analyzeSentiment(message) {
        const positiveWords = ['good', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'excellent', 'love', 'happy', 'excited', 'pleased'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'annoyed', 'upset', 'disappointed', 'worried', 'stressed'];
        
        const messageLower = message.toLowerCase();
        let positiveScore = 0;
        let negativeScore = 0;
        
        positiveWords.forEach(word => {
            if (messageLower.includes(word)) positiveScore++;
        });
        
        negativeWords.forEach(word => {
            if (messageLower.includes(word)) negativeScore++;
        });
        
        // Check for intensifiers
        const intensifierBonus = this.messagePatterns.intensifiers.test(message) ? 0.5 : 0;
        
        if (positiveScore > negativeScore) {
            return positiveScore > 1 || intensifierBonus ? 'very_positive' : 'positive';
        } else if (negativeScore > positiveScore) {
            return negativeScore > 1 || intensifierBonus ? 'very_negative' : 'negative';
        }
        
        return 'neutral';
    }

    /**
     * Detect emotional state from message patterns
     * @param {string} message - Message to analyze
     * @returns {Array} - Detected emotional states
     */
    detectEmotionalState(message) {
        const emotions = [];
        
        Object.entries(this.messagePatterns.emotions).forEach(([emotion, pattern]) => {
            if (pattern.test(message)) {
                emotions.push(emotion);
            }
        });
        
        return emotions.length > 0 ? emotions : ['neutral'];
    }

    /**
     * Extract topics from message content
     * @param {string} message - Message to analyze
     * @returns {Array} - Extracted topics
     */
    extractTopics(message) {
        const topics = [];
        const messageLower = message.toLowerCase();
        
        // Work-related topics
        if (/(work|job|project|deadline|meeting|task|office|business|client|boss)/i.test(message)) {
            topics.push('work');
        }
        
        // Food-related topics
        if (/(food|eat|hungry|lunch|dinner|breakfast|coffee|drink|meal|restaurant)/i.test(message)) {
            topics.push('food');
        }
        
        // Social topics
        if (/(friend|relationship|family|party|social|people|group|together)/i.test(message)) {
            topics.push('social');
        }
        
        // Entertainment topics
        if (/(movie|music|book|game|tv|show|entertainment|fun|hobby)/i.test(message)) {
            topics.push('entertainment');
        }
        
        // Technology topics
        if (/(computer|phone|app|software|tech|digital|online|internet)/i.test(message)) {
            topics.push('technology');
        }
        
        // Sports topics
        if (/(sport|game|team|player|match|score|win|lose|competition)/i.test(message)) {
            topics.push('sports');
        }
        
        // Personal topics
        if (/(feeling|emotion|personal|private|secret|life|experience)/i.test(message)) {
            topics.push('personal');
        }
        
        return topics.length > 0 ? topics : ['general'];
    }

    /**
     * Analyze conversation-specific elements
     * @param {string} message - Message to analyze
     * @returns {Object} - Conversation element analysis
     */
    analyzeConversationElements(message) {
        return {
            hasQuestion: this.messagePatterns.questions.direct.test(message) || 
                        this.messagePatterns.questions.indirect.test(message) ||
                        message.includes('?'),
            isConversationEnder: this.messagePatterns.conversationEnders.test(message),
            hasIntensifier: this.messagePatterns.intensifiers.test(message),
            hasSoftener: this.messagePatterns.softeners.test(message),
            hasPersonalReference: /\b(I|me|my|myself|mine)\b/i.test(message),
            hasOtherReference: /\b(you|your|yours|yourself)\b/i.test(message),
            wordCount: message.split(/\s+/).length,
            hasEmoji: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(message)
        };
    }

    /**
     * Assess message urgency level
     * @param {string} message - Message to analyze
     * @returns {string} - Urgency level
     */
    assessUrgency(message) {
        const urgentWords = ['urgent', 'asap', 'emergency', 'quickly', 'immediately', 'rush', 'deadline', 'critical'];
        const messageLower = message.toLowerCase();
        
        const urgentCount = urgentWords.filter(word => messageLower.includes(word)).length;
        const hasMultipleExclamations = (message.match(/!/g) || []).length > 1;
        const hasAllCaps = /[A-Z]{3,}/.test(message);
        
        if (urgentCount > 1 || hasMultipleExclamations || hasAllCaps) {
            return 'high';
        } else if (urgentCount > 0 || message.includes('!')) {
            return 'medium';
        }
        
        return 'low';
    }

    /**
     * Assess message formality level
     * @param {string} message - Message to analyze
     * @returns {string} - Formality level
     */
    assessFormality(message) {
        const formalWords = ['please', 'thank you', 'regards', 'sincerely', 'professional', 'business'];
        const informalWords = ['hey', 'yeah', 'gonna', 'wanna', 'kinda', 'sorta', 'cool', 'awesome'];
        
        const messageLower = message.toLowerCase();
        const formalCount = formalWords.filter(word => messageLower.includes(word)).length;
        const informalCount = informalWords.filter(word => messageLower.includes(word)).length;
        
        if (formalCount > informalCount) {
            return 'formal';
        } else if (informalCount > formalCount) {
            return 'informal';
        }
        
        return 'neutral';
    }

    /**
     * Detect social cues in the message
     * @param {string} message - Message to analyze
     * @returns {Object} - Social cue analysis
     */
    detectSocialCues(message) {
        return {
            seekingAgreement: this.messagePatterns.questions.confirmation.test(message),
            seekingInformation: this.messagePatterns.questions.direct.test(message),
            offeringHelp: /(help|assist|support|offer|available)/i.test(message),
            expressingConcern: /(worried|concerned|care about|hope you're)/i.test(message),
            changingSubject: /(anyway|by the way|speaking of|on another note)/i.test(message),
            includingOthers: /(we should|let's|everyone|all of us)/i.test(message),
            excludingOthers: /(just us|between you and me|privately|confidential)/i.test(message)
        };
    }

    /**
     * Analyze question types for appropriate responses
     * @param {string} message - Message to analyze
     * @returns {Object} - Question analysis
     */
    analyzeQuestions(message) {
        if (!message.includes('?') && !this.messagePatterns.questions.direct.test(message)) {
            return { hasQuestion: false };
        }
        
        return {
            hasQuestion: true,
            questionType: this.classifyQuestionType(message),
            expectsDetailedAnswer: message.length > 30,
            isRhetoricalQuestion: this.messagePatterns.questions.confirmation.test(message),
            isOpenEnded: /(what do you think|how do you feel|what's your opinion)/i.test(message)
        };
    }

    /**
     * Classify the type of question being asked
     * @param {string} message - Message containing question
     * @returns {string} - Question type
     */
    classifyQuestionType(message) {
        const messageLower = message.toLowerCase();
        
        if (/^what/i.test(message)) return 'what';
        if (/^how/i.test(message)) return 'how';
        if (/^when/i.test(message)) return 'when';
        if (/^where/i.test(message)) return 'where';
        if (/^why/i.test(message)) return 'why';
        if (/^who/i.test(message)) return 'who';
        if (/^(do|does|did|can|could|will|would|should)/i.test(message)) return 'yes_no';
        if (this.messagePatterns.questions.confirmation.test(message)) return 'confirmation';
        
        return 'general';
    }

    /**
     * Calculate confidence score for analysis
     * @param {Object} analysis - Analysis object
     * @returns {number} - Confidence score (0-1)
     */
    calculateAnalysisConfidence(analysis) {
        let confidence = 0.5; // Base confidence
        
        // Boost confidence based on detected elements
        if (analysis.topics.length > 1) confidence += 0.1;
        if (analysis.sentiment !== 'neutral') confidence += 0.1;
        if (analysis.emotionalState.length > 0) confidence += 0.1;
        if (analysis.conversationElements.hasQuestion) confidence += 0.1;
        if (analysis.urgency !== 'low') confidence += 0.1;
        
        return Math.min(confidence, 1.0);
    }

    /**
     * CONVERSATION THREADING - Apply conversation memory and context
     * @param {string} response - Base response from pool
     * @param {Object} conversationContext - Conversation history
     * @param {Object} character - Responding character
     * @returns {string} - Enhanced response with threading
     */
    applyConversationThreading(response, conversationContext, character) {
        const history = conversationContext.history || [];
        const recentMessages = history.slice(-3);
        
        // Apply topic continuity
        if (conversationContext.topics && conversationContext.topics.length > 0) {
            response = this.applyTopicContinuity(response, conversationContext.topics, character);
        }
        
        // Apply conversation flow awareness
        if (conversationContext.turnCount > this.conversationFlow.maxTurnsBeforeTopicShift) {
            response = this.considerTopicShift(response, conversationContext, character);
        }
        
        // Apply conversation ending awareness
        if (conversationContext.turnCount > this.conversationFlow.maxTurnsBeforeConversationEnd) {
            response = this.considerConversationEnding(response, conversationContext, character);
        }
        
        return response;
    }

    /**
     * Apply topic continuity to maintain conversation coherence
     * @param {string} response - Base response
     * @param {Array} topics - Current conversation topics
     * @param {Object} character - Character object
     * @returns {string} - Modified response
     */
    applyTopicContinuity(response, topics, character) {
        // Check if response naturally continues the topic
        const responseLower = response.toLowerCase();
        const topicKeywords = topics.join('|');
        const topicRegex = new RegExp(topicKeywords, 'i');
        
        if (!topicRegex.test(response)) {
            // Add subtle topic reference if personality allows
            if (character.personalityTags?.includes('Professional') || 
                character.personalityTags?.includes('Organized')) {
                
                const topicReferences = {
                    'work': 'Speaking of work,',
                    'food': 'About food though,',
                    'social': 'On the social side,',
                    'technology': 'Tech-wise,'
                };
                
                const mainTopic = topics[0];
                if (topicReferences[mainTopic] && Math.random() < 0.3) {
                    response = `${topicReferences[mainTopic]} ${response.toLowerCase()}`;
                }
            }
        }
        
        return response;
    }

    /**
     * PERSONALITY ENHANCEMENTS - Apply character-specific modifications
     * @param {string} response - Base response
     * @param {Object} character - Character object
     * @param {Object} messageAnalysis - Original message analysis
     * @returns {string} - Personality-enhanced response
     */
    applyPersonalityEnhancements(response, character, messageAnalysis) {
        if (!character.personalityTags || character.personalityTags.length === 0) {
            return response;
        }
        
        let enhanced = response;
        
        // Apply each personality trait's influence
        character.personalityTags.forEach(trait => {
            enhanced = this.applyPersonalityTrait(enhanced, trait, messageAnalysis, character);
        });
        
        return enhanced;
    }

    /**
     * Apply specific personality trait modifications
     * @param {string} response - Current response
     * @param {string} trait - Personality trait
     * @param {Object} messageAnalysis - Message analysis
     * @param {Object} character - Character object
     * @returns {string} - Modified response
     */
    applyPersonalityTrait(response, trait, messageAnalysis, character) {
        switch (trait) {
            case 'Professional':
                // Make more formal and structured
                response = response.replace(/yeah/gi, 'yes');
                response = response.replace(/gonna/gi, 'going to');
                if (messageAnalysis.urgency === 'high') {
                    response = `I understand the urgency. ${response}`;
                }
                break;
                
            case 'Extroverted':
                // Add enthusiasm and engagement
                if (Math.random() < 0.3 && !response.includes('!')) {
                    response += '!';
                }
                if (messageAnalysis.sentiment === 'positive' && Math.random() < 0.4) {
                    response = `That's great! ${response}`;
                }
                break;
                
            case 'Introverted':
                // Make more reserved and concise
                if (response.length > 50 && Math.random() < 0.4) {
                    const sentences = response.split('.');
                    response = sentences[0] + '.';
                }
                response = response.replace(/!/g, '.');
                break;
                
            case 'Gossip':
                // Add curiosity and follow-up questions
                if (messageAnalysis.topics.includes('personal') && Math.random() < 0.5) {
                    response += ' Tell me more!';
                }
                break;
                
            case 'Empathetic':
                // Add emotional understanding
                if (messageAnalysis.sentiment.includes('negative') && Math.random() < 0.6) {
                    response = `I can understand how you feel. ${response}`;
                }
                break;
                
            case 'Ambitious':
                // Add goal-oriented language
                if (messageAnalysis.topics.includes('work') && Math.random() < 0.4) {
                    response += ' How can we move this forward?';
                }
                break;
                
            case 'Lazy':
                // Make more casual and less energetic
                response = response.replace(/exciting/gi, 'interesting');
                response = response.replace(/let's do it/gi, 'sounds good');
                break;
                
            case 'Chaotic':
                // Add unpredictability and humor
                if (Math.random() < 0.2) {
                    const chaosAdditions = [' ...wait, what?', ' That reminds me of something completely different.', ' Oh, random thought!'];
                    response += chaosAdditions[Math.floor(Math.random() * chaosAdditions.length)];
                }
                break;
        }
        
        return response;
    }

    /**
     * CONVERSATION FLOW MANAGEMENT
     * @param {string} response - Base response
     * @param {Object} conversationContext - Conversation context
     * @param {Object} character - Character object
     * @returns {string} - Flow-managed response
     */
    manageConversationFlow(response, conversationContext, character) {
        const turnCount = conversationContext.turnCount;
        
        // Natural conversation ending
        if (turnCount > this.conversationFlow.maxTurnsBeforeConversationEnd && 
            Math.random() < this.conversationFlow.conversationEndProbability) {
            response = this.addConversationEnding(response, character);
        }
        
        // Topic shifting
        else if (turnCount > this.conversationFlow.maxTurnsBeforeTopicShift && 
                 Math.random() < this.conversationFlow.topicShiftProbability) {
            response = this.addTopicShift(response, character);
        }
        
        return response;
    }

    /**
     * Add natural conversation ending
     * @param {string} response - Base response
     * @param {Object} character - Character object
     * @returns {string} - Response with ending
     */
    addConversationEnding(response, character) {
        const endings = {
            'Professional': ['Well, I should get back to work.', 'I need to focus on this project.'],
            'Extroverted': ['This has been great!', 'Thanks for the chat!'],
            'Introverted': ['I should get going.', 'Talk to you later.'],
            'default': ['Anyway, I should run.', 'Catch you later!']
        };
        
        const personalityType = character.personalityTags?.[0] || 'default';
        const endingOptions = endings[personalityType] || endings.default;
        const selectedEnding = endingOptions[Math.floor(Math.random() * endingOptions.length)];
        
        return `${response} ${selectedEnding}`;
    }

    /**
     * Add topic shift to keep conversation dynamic
     * @param {string} response - Base response
     * @param {Object} character - Character object
     * @returns {string} - Response with topic shift
     */
    addTopicShift(response, character) {
        const shifts = [
            'By the way,',
            'Speaking of which,',
            'That reminds me,',
            'On a different note,',
            'Actually,'
        ];
        
        const newTopics = [
            'did you see that email?',
            'how was your weekend?',
            'any lunch plans?',
            'this weather is something.'
        ];
        
        const shift = shifts[Math.floor(Math.random() * shifts.length)];
        const topic = newTopics[Math.floor(Math.random() * newTopics.length)];
        
        return `${response} ${shift} ${topic}`;
    }

    /**
     * FINAL RESPONSE PROCESSING
     * @param {string} response - Response to finalize
     * @param {Object} character - Character object
     * @param {Object} messageAnalysis - Message analysis
     * @returns {string} - Final polished response
     */
    finalizeResponse(response, character, messageAnalysis) {
        // Clean up response
        response = this.cleanupResponse(response);
        
        // Ensure appropriate response length
        response = this.adjustResponseLength(response, character, messageAnalysis);
        
        // Final personality touch
        response = this.applyFinalPersonalityTouch(response, character);
        
        return response;
    }

    /**
     * Clean up response text
     * @param {string} response - Raw response
     * @returns {string} - Cleaned response
     */
    cleanupResponse(response) {
        // Remove double spaces
        response = response.replace(/\s+/g, ' ');
        
        // Trim whitespace
        response = response.trim();
        
        // Ensure proper capitalization
        if (response.length > 0) {
            response = response.charAt(0).toUpperCase() + response.slice(1);
        }
        
        // Add period if missing and not ending with punctuation
        if (response.length > 0 && !/[.!?]$/.test(response)) {
            response += '.';
        }
        
        return response;
    }

    /**
     * CONVERSATION STARTERS - Generate initial dialogue
     * @param {Object} character - Character initiating conversation
     * @param {Object} target - Target character (optional)
     * @param {Object} context - Environmental context
     * @returns {string} - Conversation starter
     */
    generateConversationStarter(character, target = null, context = {}) {
        console.log(`🎬 Generating conversation starter for ${character.name}`);
        
        // Create fake context for routing
        const starterContext = {
            ...context,
            isConversationStarter: true,
            target: target
        };
        
        // Use dialogue router to determine appropriate pool for starter
        const routingResult = this.dialogueRouter.routeToPool(
            '', // Empty message for starter
            character,
            starterContext,
            null // No conversation history yet
        );
        
        // Generate starter using selected pool
        let starter = routingResult.response || this.getDefaultConversationStarter(character, context);
        
        // Apply personality enhancements to starter
        starter = this.applyPersonalityEnhancements(starter, character, {
            messageType: 'greeting',
            sentiment: 'neutral',
            topics: ['general']
        });
        
        return this.finalizeResponse(starter, character, { messageType: 'greeting' });
    }

    /**
     * Get default conversation starter when routing fails
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Default starter
     */
    getDefaultConversationStarter(character, context) {
        const personality = character.personalityTags || [];
        
        // Location-specific starters
        if (context.location === 'break_room') {
            return personality.includes('Professional') ? 
                'Good morning.' : 
                'Coffee break time?';
        }
        
        if (context.location === 'meeting_room') {
            return 'Ready for the meeting?';
        }
        
        // Time-based starters
        const hour = new Date().getHours();
        if (hour < 12) {
            return personality.includes('Extroverted') ? 
                'Good morning! How\'s it going?' : 
                'Morning.';
        } else if (hour < 17) {
            return 'How\'s your day going?';
        } else {
            return 'Getting close to the end of the day.';
        }
    }

    /**
     * CONVERSATION CONTEXT MANAGEMENT
     */

    /**
     * Get unique conversation ID for tracking
     * @param {Object} character1 - First character
     * @param {Object} character2 - Second character
     * @returns {string} - Unique conversation ID
     */
    getConversationId(character1, character2) {
        if (!character2) return `${character1.id}_monologue`;
        
        // Create consistent ID regardless of order
        const ids = [character1.id, character2.id].sort();
        return `conversation_${ids[0]}_${ids[1]}`;
    }

    /**
     * Get or create conversation context
     * @param {string} conversationId - Conversation ID
     * @returns {Object} - Conversation context
     */
    getConversationContext(conversationId) {
        if (!this.conversationHistory.has(conversationId)) {
            this.conversationHistory.set(conversationId, {
                id: conversationId,
                startTime: Date.now(),
                lastActivity: Date.now(),
                turnCount: 0,
                topics: [],
                sentiment: 'neutral',
                lastSpeaker: null,
                history: [],
                routingHistory: [],
                conversationState: 'active',
                participants: []
            });
        }
        
        const context = this.conversationHistory.get(conversationId);
        context.lastActivity = Date.now();
        return context;
    }

    /**
     * Update conversation context with new message
     * @param {string} conversationId - Conversation ID
     * @param {Object} speaker - Character who spoke
     * @param {string} message - Message content
     * @param {Object} analysis - Message analysis (optional)
     */
    updateConversationContext(conversationId, speaker, message, analysis = null) {
        const context = this.getConversationContext(conversationId);
        
        // Add message to history
        context.history.push({
            speaker: speaker.id,
            speakerName: speaker.name,
            message: message,
            timestamp: Date.now(),
            analysis: analysis,
            turnNumber: context.turnCount + 1
        });
        
        // Update context metadata
        context.turnCount++;
        context.lastSpeaker = speaker.id;
        context.lastActivity = Date.now();
        
        // Add participant if not already tracked
        if (!context.participants.includes(speaker.id)) {
            context.participants.push(speaker.id);
        }
        
        // Update topics from analysis
        if (analysis?.topics) {
            analysis.topics.forEach(topic => {
                if (!context.topics.includes(topic)) {
                    context.topics.push(topic);
                }
            });
        }
        
        // Update sentiment (weighted toward recent messages)
        if (analysis?.sentiment && analysis.sentiment !== 'neutral') {
            context.sentiment = analysis.sentiment;
        }
        
        // Track routing history for debugging
        if (analysis?.routedPool) {
            context.routingHistory.push({
                turn: context.turnCount,
                pool: analysis.routedPool,
                confidence: analysis.confidence,
                timestamp: Date.now()
            });
        }
        
        // Manage conversation state
        this.updateConversationState(context, analysis);
        
        // Limit history size for performance
        this.limitConversationHistory(context);
    }

    /**
     * Update conversation state based on recent activity
     * @param {Object} context - Conversation context
     * @param {Object} analysis - Recent message analysis
     */
    updateConversationState(context, analysis) {
        // Check for conversation ending signals
        if (analysis?.messageType === 'conversation_ender') {
            context.conversationState = 'ending';
        }
        
        // Check for natural conversation conclusion
        else if (context.turnCount > this.conversationFlow.maxTurnsBeforeConversationEnd) {
            context.conversationState = 'winding_down';
        }
        
        // Check for topic exhaustion
        else if (context.turnCount > this.conversationFlow.maxTurnsBeforeTopicShift && 
                 context.topics.length === 1) {
            context.conversationState = 'topic_exhausted';
        }
        
        // Active conversation
        else if (context.turnCount > 0) {
            context.conversationState = 'active';
        }
    }

    /**
     * Limit conversation history for performance
     * @param {Object} context - Conversation context
     */
    limitConversationHistory(context) {
        // Limit message history
        if (context.history.length > 50) {
            context.history = context.history.slice(-50);
        }
        
        // Limit topic history
        if (context.topics.length > 10) {
            context.topics = context.topics.slice(-10);
        }
        
        // Limit routing history
        if (context.routingHistory.length > 20) {
            context.routingHistory = context.routingHistory.slice(-20);
        }
    }

    /**
     * Enhance context with conversation history for routing
     * @param {Object} baseContext - Base environmental context
     * @param {Object} conversationContext - Conversation history
     * @returns {Object} - Enhanced context
     */
    enhanceContextWithHistory(baseContext, conversationContext) {
        return {
            ...baseContext,
            conversationTurnCount: conversationContext.turnCount,
            conversationTopics: conversationContext.topics,
            conversationSentiment: conversationContext.sentiment,
            conversationState: conversationContext.conversationState,
            recentMessages: conversationContext.history.slice(-3),
            isOngoingConversation: conversationContext.turnCount > 0,
            participantCount: conversationContext.participants.length
        };
    }

    /**
     * UTILITY METHODS
     */

    /**
     * Adjust response length based on character and context
     * @param {string} response - Current response
     * @param {Object} character - Character object
     * @param {Object} messageAnalysis - Message analysis
     * @returns {string} - Length-adjusted response
     */
    adjustResponseLength(response, character, messageAnalysis) {
        const personality = character.personalityTags || [];
        
        // Introverted characters prefer shorter responses
        if (personality.includes('Introverted') && response.length > 60) {
            const sentences = response.split('. ');
            response = sentences[0] + '.';
        }
        
        // Extroverted characters might expand responses
        else if (personality.includes('Extroverted') && response.length < 20 && Math.random() < 0.3) {
            const expansions = [
                ' That\'s really interesting!',
                ' I love talking about this!',
                ' Thanks for sharing!'
            ];
            response += expansions[Math.floor(Math.random() * expansions.length)];
        }
        
        // Professional characters maintain appropriate length
        else if (personality.includes('Professional') && messageAnalysis.urgency === 'high') {
            // Keep urgent professional responses concise
            if (response.length > 80) {
                const sentences = response.split('. ');
                response = sentences.slice(0, 2).join('. ') + '.';
            }
        }
        
        return response;
    }

    /**
     * Apply final personality touch to response
     * @param {string} response - Response to modify
     * @param {Object} character - Character object
     * @returns {string} - Final response
     */
    applyFinalPersonalityTouch(response, character) {
        const personality = character.personalityTags || [];
        
        // Add character-specific verbal tics or habits
        if (personality.includes('Gossip') && Math.random() < 0.2) {
            response += ' You didn\'t hear it from me though!';
        }
        
        if (personality.includes('Chaotic') && Math.random() < 0.15) {
            response += ' ...wait, what were we talking about?';
        }
        
        if (personality.includes('Ambitious') && Math.random() < 0.1) {
            response += ' Always thinking ahead!';
        }
        
        return response;
    }

    /**
     * Get emergency fallback response for error situations
     * @param {Object} character - Character object
     * @param {string} originalMessage - Original message that caused error
     * @returns {string} - Emergency fallback response
     */
    getEmergencyFallbackResponse(character, originalMessage) {
        const emergencyFallbacks = [
            'I see.',
            'That\'s interesting.',
            'Tell me more.',
            'I understand.',
            'Good point.',
            'That makes sense.',
            'I hear you.',
            'Thanks for sharing.'
        ];
        
        // Apply basic personality filter even to fallbacks
        const personality = character.personalityTags || [];
        
        if (personality.includes('Professional')) {
            return 'I understand your point.';
        } else if (personality.includes('Extroverted')) {
            return 'That\'s really interesting!';
        } else if (personality.includes('Introverted')) {
            return 'I see.';
        }
        
        return emergencyFallbacks[Math.floor(Math.random() * emergencyFallbacks.length)];
    }

    /**
     * GLOBAL STATISTICS AND ANALYTICS
     */

    /**
     * Update global conversation statistics
     * @param {Object} messageAnalysis - Message analysis
     * @param {Object} conversationContext - Conversation context
     */
    updateGlobalStats(messageAnalysis, conversationContext) {
        // Update total turns
        this.globalConversationStats.totalTurns++;
        
        // Update sentiment distribution
        if (messageAnalysis.sentiment && this.globalConversationStats.sentimentDistribution[messageAnalysis.sentiment] !== undefined) {
            this.globalConversationStats.sentimentDistribution[messageAnalysis.sentiment]++;
        }
        
        // Update popular topics
        if (messageAnalysis.topics) {
            messageAnalysis.topics.forEach(topic => {
                const currentCount = this.globalConversationStats.popularTopics.get(topic) || 0;
                this.globalConversationStats.popularTopics.set(topic, currentCount + 1);
            });
        }
        
        // Update conversation count
        if (conversationContext.turnCount === 1) {
            this.globalConversationStats.totalConversations++;
        }
        
        // Update average conversation length
        if (conversationContext.conversationState === 'ending') {
            const totalLength = this.globalConversationStats.averageConversationLength * (this.globalConversationStats.totalConversations - 1);
            this.globalConversationStats.averageConversationLength = 
                (totalLength + conversationContext.turnCount) / this.globalConversationStats.totalConversations;
        }
    }

    /**
     * Get conversation statistics for debugging and analytics
     * @returns {Object} - Comprehensive conversation statistics
     */
    getConversationStats() {
        const activeConversations = Array.from(this.conversationHistory.values())
            .filter(conv => conv.conversationState === 'active');
        
        const topTopics = Array.from(this.globalConversationStats.popularTopics.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        return {
            // Current state
            activeConversations: activeConversations.length,
            totalTrackedConversations: this.conversationHistory.size,
            
            // Global statistics
            totalTurns: this.globalConversationStats.totalTurns,
            totalConversations: this.globalConversationStats.totalConversations,
            averageConversationLength: this.globalConversationStats.averageConversationLength,
            
            // Sentiment analysis
            sentimentDistribution: { ...this.globalConversationStats.sentimentDistribution },
            
            // Topic analysis
            topTopics: topTopics.map(([topic, count]) => ({ topic, count })),
            
            // Routing performance
            routingStats: this.dialogueRouter.getRoutingStats(),
            
            // System health
            memoryUsage: {
                conversationHistorySize: this.conversationHistory.size,
                averageHistoryLength: this.getAverageHistoryLength()
            }
        };
    }

    /**
     * Calculate average history length for memory management
     * @returns {number} - Average history length
     */
    getAverageHistoryLength() {
        if (this.conversationHistory.size === 0) return 0;
        
        let totalLength = 0;
        this.conversationHistory.forEach(context => {
            totalLength += context.history.length;
        });
        
        return totalLength / this.conversationHistory.size;
    }

    /**
     * CLEANUP AND MAINTENANCE
     */

    /**
     * Clean up old conversation contexts to manage memory
     * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
     */
    cleanupOldConversations(maxAge = 3600000) {
        const now = Date.now();
        const conversationsToRemove = [];
        
        this.conversationHistory.forEach((context, id) => {
            if (now - context.lastActivity > maxAge && context.conversationState !== 'active') {
                conversationsToRemove.push(id);
            }
        });
        
        conversationsToRemove.forEach(id => {
            this.conversationHistory.delete(id);
        });
        
        if (conversationsToRemove.length > 0) {
            console.log(`🧹 Cleaned up ${conversationsToRemove.length} old conversations`);
        }
    }

    /**
     * Reset global statistics (for testing or new sessions)
     */
    resetGlobalStats() {
        this.globalConversationStats = {
            totalConversations: 0,
            totalTurns: 0,
            averageConversationLength: 0,
            popularTopics: new Map(),
            sentimentDistribution: {
                positive: 0,
                negative: 0,
                neutral: 0
            }
        };
        
        console.log('📊 Global conversation statistics reset');
    }

    /**
     * DEBUG AND TESTING METHODS
     */

    /**
     * Test the dialogue system with a sample conversation
     * @param {Object} character1 - First character
     * @param {Object} character2 - Second character
     * @param {Array} testMessages - Array of test messages
     * @returns {Array} - Array of responses for analysis
     */
    testConversation(character1, character2, testMessages) {
        console.log(`🧪 Testing conversation between ${character1.name} and ${character2.name}`);
        
        const responses = [];
        let currentSpeaker = character1;
        let currentListener = character2;
        
        testMessages.forEach((message, index) => {
            const response = this.generateResponse(
                currentListener,
                message,
                currentSpeaker,
                { location: 'test_environment', time: 'test_time' }
            );
            
            responses.push({
                turn: index + 1,
                speaker: currentSpeaker.name,
                message: message,
                responder: currentListener.name,
                response: response
            });
            
            // Swap speakers for next turn
            [currentSpeaker, currentListener] = [currentListener, currentSpeaker];
        });
        
        return responses;
    }

    /**
     * Analyze system performance and provide recommendations
     * @returns {Object} - Performance analysis and recommendations
     */
    analyzeSystemPerformance() {
        const stats = this.getConversationStats();
        const recommendations = [];
        
        // Memory usage analysis
        if (stats.memoryUsage.conversationHistorySize > 100) {
            recommendations.push('Consider running cleanupOldConversations() to manage memory');
        }
        
        // Conversation flow analysis
        if (stats.averageConversationLength < 3) {
            recommendations.push('Conversations seem short - consider adjusting conversation flow parameters');
        }
        
        // Sentiment analysis
        const totalSentiment = Object.values(stats.sentimentDistribution).reduce((a, b) => a + b, 0);
        if (totalSentiment > 0) {
            const negativeRatio = stats.sentimentDistribution.negative / totalSentiment;
            if (negativeRatio > 0.4) {
                recommendations.push('High negative sentiment detected - review response templates');
            }
        }
        
        return {
            performance: stats,
            recommendations: recommendations,
            systemHealth: recommendations.length === 0 ? 'Good' : 'Needs attention'
        };
    }
}
