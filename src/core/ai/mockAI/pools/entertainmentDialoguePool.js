/**
 * Personal Dialogue Pool - Life Events and Relationship Conversations
 * Specialized dialogue pool for personal topics, life events, relationships, and emotions
 * 
 * TOPICS COVERED:
 * - Family and relationships
 * - Personal milestones and achievements
 * - Life challenges and struggles
 * - Emotional support and advice
 * - Future plans and dreams
 * - Personal growth and self-reflection
 * - Health and wellness
 * - Life transitions and changes
 * 
 * RESPONSE PATTERNS:
 * - Empathetic listening and support
 * - Shared experiences and relatability
 * - Constructive advice and encouragement
 * - Celebration of achievements
 * - Comfort during difficulties
 * - Respectful boundary awareness
 * 
 * PERSONALITY ADAPTATIONS:
 * - Empathetic personalities provide more emotional support
 * - Private characters maintain appropriate boundaries
 * - Optimistic types focus on positive aspects
 * - Wise characters offer thoughtful advice
 * 
 * NOTE: This pool emphasizes emotional intelligence and sensitivity
 */

export class PersonalDialoguePool {
    constructor() {
        // Personal topic triggers (handled with sensitivity)
        this.topicTriggers = {
            relationships: {
                keywords: ['relationship', 'partner', 'dating', 'marriage', 'family', 'friend', 'love'],
                responses: 'relationships_response',
                urgency: 'medium'
            },
            
            achievements: {
                keywords: ['achievement', 'success', 'promotion', 'graduation', 'accomplishment', 'proud'],
                responses: 'achievements_response',
                urgency: 'medium'
            },
            
            challenges: {
                keywords: ['struggle', 'difficult', 'hard time', 'challenge', 'problem', 'stress'],
                responses: 'challenges_response',
                urgency: 'high'
            },
            
            health: {
                keywords: ['health', 'doctor', 'medical', 'wellness', 'fitness', 'mental health'],
                responses: 'health_response',
                urgency: 'high'
            },
            
            future: {
                keywords: ['future', 'plans', 'goals', 'dreams', 'hope', 'aspiration', 'someday'],
                responses: 'future_response',
                urgency: 'low'
            },
            
            growth: {
                keywords: ['learning', 'growing', 'change', 'development', 'improvement', 'journey'],
                responses: 'growth_response',
                urgency: 'low'
            },
            
            transitions: {
                keywords: ['moving', 'job change', 'new chapter', 'transition', 'life change'],
                responses: 'transitions_response',
                urgency: 'medium'
            },
            
            emotions: {
                keywords: ['feeling', 'emotion', 'happy', 'sad', 'angry', 'anxious', 'excited'],
                responses: 'emotions_response',
                urgency: 'medium'
            }
        };
        
        // Personal conversation components (emotionally intelligent)
        this.personalComponents = {
            // Personal conversation openings
            openings: {
                supportive: ['I hear you', 'That sounds', 'I can understand', 'It makes sense that'],
                celebratory: ['That\'s wonderful!', 'How exciting!', 'I\'m so happy for you!', 'What great news!'],
                empathetic: ['I\'m sorry you\'re going through', 'That must be', 'I can imagine how', 'It sounds like'],
                curious: ['Tell me more about', 'How are you feeling about', 'What\'s it like', 'I\'d love to hear']
            },
            
            // Core personal content (sensitive and supportive)
            coreContent: {
                relationships_response: {
                    support: ['relationships take work', 'communication is so important', 'every relationship has its challenges', 'it\'s about growing together'],
                    celebration: ['love is such a beautiful thing', 'you two are perfect together', 'relationship goals right there', 'happiness looks good on you'],
                    advice: ['trust your instincts', 'healthy boundaries are important', 'it\'s okay to take time', 'you deserve to be treated well'],
                    understanding: ['relationships are complex', 'everyone moves at their own pace', 'there\'s no perfect timeline', 'what matters is how you feel']
                },
                
                achievements_response: {
                    celebration: ['you should be so proud', 'all that hard work paid off', 'well-deserved recognition', 'this is just the beginning'],
                    recognition: ['your dedication really shows', 'you\'ve earned this moment', 'talent and effort combined', 'inspiring to see'],
                    encouragement: ['you\'ve got so much potential', 'this opens up new opportunities', 'excited to see what\'s next', 'you\'re capable of amazing things'],
                    reflection: ['moments like these matter', 'remember this feeling', 'you\'ve overcome so much', 'growth is beautiful to witness']
                },
                
                challenges_response: {
                    validation: ['what you\'re feeling is completely valid', 'it\'s okay to not be okay', 'you\'re not alone in this', 'tough times are part of life'],
                    support: ['I\'m here if you need to talk', 'you don\'t have to face this alone', 'taking things one day at a time', 'you\'re stronger than you know'],
                    perspective: ['this won\'t last forever', 'you\'ve overcome challenges before', 'sometimes we grow through difficulty', 'better days are ahead'],
                    practical: ['focus on what you can control', 'small steps still count', 'it\'s okay to ask for help', 'self-care isn\'t selfish']
                },
                
                health_response: {
                    concern: ['your health is the most important thing', 'taking care of yourself matters', 'listen to your body', 'don\'t ignore the signs'],
                    support: ['medical stuff can be scary', 'you\'re being proactive', 'good doctors make a difference', 'healing takes time'],
                    wellness: ['mental health is just as important', 'balance is key to wellness', 'stress affects everything', 'small changes add up'],
                    encouragement: ['you\'re taking the right steps', 'prioritizing your health is wise', 'recovery is a journey', 'be patient with yourself']
                },
                
                future_response: {
                    optimism: ['the future is full of possibilities', 'your dreams are valid', 'it\'s exciting to have goals', 'anything can happen'],
                    planning: ['having a vision is important', 'small steps lead to big changes', 'flexibility helps with planning', 'priorities can shift and that\'s okay'],
                    encouragement: ['you have so much potential', 'believe in your abilities', 'the world needs what you offer', 'your path is unique'],
                    wisdom: ['life rarely goes exactly as planned', 'sometimes the journey surprises us', 'being open to opportunities helps', 'trust the process']
                },
                
                growth_response: {
                    recognition: ['personal growth takes courage', 'change isn\'t always easy', 'you\'re evolving as a person', 'self-awareness is powerful'],
                    encouragement: ['every step forward counts', 'setbacks are part of growth', 'you\'re on the right path', 'progress isn\'t always linear'],
                    wisdom: ['we\'re all works in progress', 'learning never really stops', 'challenges help us grow', 'becoming who you\'re meant to be'],
                    support: ['growth can feel uncomfortable', 'it\'s okay to outgrow things', 'change takes time', 'trust your inner wisdom']
                },
                
                transitions_response: {
                    acknowledgment: ['big life changes are significant', 'transitions can be overwhelming', 'new chapters are exciting and scary', 'change brings opportunity'],
                    support: ['transition periods are challenging', 'it\'s normal to feel uncertain', 'you\'re handling this well', 'adapting takes time'],
                    perspective: ['every ending is a new beginning', 'you\'re exactly where you need to be', 'life is a series of chapters', 'embrace the unknown'],
                    practical: ['take things one step at a time', 'focus on what you can control', 'support systems matter', 'be gentle with yourself']
                },
                
                emotions_response: {
                    validation: ['all feelings are valid', 'emotions are information', 'it\'s human to feel deeply', 'don\'t judge your feelings'],
                    understanding: ['emotions can be complex', 'feelings come and go in waves', 'it\'s okay to feel multiple things', 'emotional intelligence develops over time'],
                    coping: ['healthy expression is important', 'talking helps process emotions', 'movement can shift energy', 'breathing through difficult feelings'],
                    wisdom: ['feelings aren\'t facts', 'this too shall pass', 'emotions are temporary visitors', 'you have the strength to feel and heal']
                }
            },
            
            // Personal conversation transitions (gentle and thoughtful)
            transitions: {
                empathetic: ['I can relate to that', 'That resonates with me', 'I\'ve been there too', 'Many people experience this'],
                supportive: ['You\'re not alone', 'It\'s okay to feel this way', 'That makes perfect sense', 'Your feelings are valid'],
                encouraging: ['You\'re stronger than you know', 'This shows your resilience', 'You\'re growing through this', 'I believe in you'],
                reflective: ['It makes you think', 'Life has a way of teaching us', 'Sometimes we need these experiences', 'Everything happens for a reason']
            },
            
            // Personal conversation closings (warm and supportive)
            closings: {
                supportive: ['I\'m here if you need anything.', 'Sending you positive thoughts.', 'You\'ve got this.', 'Take care of yourself.'],
                encouraging: ['Better days are coming!', 'You\'re going to do great!', 'I believe in you!', 'Excited to see your journey unfold!'],
                connecting: ['Thanks for sharing with me.', 'I appreciate your openness.', 'These conversations mean a lot.', 'We should talk more often.'],
                wise: ['Life is a beautiful journey.', 'Every experience shapes us.', 'Trust the timing of your life.', 'You\'re exactly where you need to be.']
            }
        };
        
        // Personal conversation tracking (handled with privacy)
        this.conversationMemory = new Map();
        this.supportOffered = new Map();
        
        console.log('💝 Personal Dialogue Pool initialized with emotional intelligence');
    }

    /**
     * Generate personal/emotional response
     * @param {string} incomingMessage - Message being responded to
     * @param {Object} character - Character generating response
     * @param {Object} context - Environmental and social context
     * @returns {string} - Generated personal dialogue
     */
    generateResponse(incomingMessage, character, context) {
        try {
            console.log(`💝 Generating personal response for ${character.name}`);
            
            // Analyze message for personal triggers (with sensitivity)
            const triggerAnalysis = this.analyzePersonalMessage(incomingMessage);
            
            // Determine response type (prioritizing emotional intelligence)
            const responseType = this.determinePersonalResponseType(triggerAnalysis, character, context);
            
            // Build response using modular components (with care)
            const response = this.constructPersonalResponse(responseType, triggerAnalysis, character, context);
            
            console.log(`💛 Personal response: "${response}"`);
            return response;
            
        } catch (error) {
            console.error(`Error generating personal response for ${character.name}:`, error);
            return this.getFallbackPersonalResponse(character, incomingMessage);
        }
    }

    /**
     * Analyze incoming message for personal triggers (with emotional awareness)
     * @param {string} message - Incoming message
     * @returns {Object} - Personal trigger analysis
     */
    analyzePersonalMessage(message) {
        const analysis = {
            originalMessage: message,
            detectedTriggers: [],
            emotionalTone: 'neutral',
            intimacyLevel: 'casual',
            supportNeeded: false
        };
        
        const messageLower = message.toLowerCase();
        
        // Detect emotional tone
        const emotionalIndicators = {
            positive: ['happy', 'excited', 'joy', 'love', 'grateful', 'amazing', 'wonderful'],
            negative: ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'difficult', 'hard'],
            vulnerable: ['scared', 'confused', 'lost', 'overwhelmed', 'struggling', 'hurt']
        };
        
        Object.entries(emotionalIndicators).forEach(([tone, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.emotionalTone = tone;
            }
        });
        
        // Detect intimacy level (how personal the sharing is)
        const intimacyIndicators = {
            surface: ['work', 'weather', 'general', 'public'],
            personal: ['family', 'relationship', 'feeling', 'experience'],
            intimate: ['secret', 'private', 'personal', 'vulnerable', 'deep']
        };
        
        Object.entries(intimacyIndicators).forEach(([level, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.intimacyLevel = level;
            }
        });
        
        // Detect if support is needed
        const supportWords = ['help', 'advice', 'don\'t know', 'what should', 'struggling'];
        analysis.supportNeeded = supportWords.some(word => messageLower.includes(word));
        
        // Detect trigger categories
        Object.entries(this.topicTriggers).forEach(([category, data]) => {
            const matches = data.keywords.filter(keyword => messageLower.includes(keyword));
            if (matches.length > 0) {
                analysis.detectedTriggers.push({
                    category,
                    matches,
                    urgency: data.urgency,
                    responseType: data.responses
                });
            }
        });
        
        return analysis;
    }

    /**
     * Determine appropriate personal response type
     * @param {Object} triggerAnalysis - Analysis of incoming message
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Response type identifier
     */
    determinePersonalResponseType(triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        
        // Support needed takes priority
        if (triggerAnalysis.supportNeeded) {
            return 'challenges_response';
        }
        
    determinePersonalResponseType(triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        
        // Support needed takes priority
        if (triggerAnalysis.supportNeeded) {
            return 'challenges_response';
        }
        
        // Primary trigger-based routing
        if (triggerAnalysis.detectedTriggers.length > 0) {
            return triggerAnalysis.detectedTriggers[0].responseType;
        }
        
        // Emotional tone-based routing
        if (triggerAnalysis.emotionalTone === 'positive') {
            return 'achievements_response';
        } else if (triggerAnalysis.emotionalTone === 'negative' || triggerAnalysis.emotionalTone === 'vulnerable') {
            return 'challenges_response';
        }
        
        // Personality-based defaults
        if (personality.includes('Empathetic') || personality.includes('Caring')) {
            return 'emotions_response';
        } else if (personality.includes('Wise') || personality.includes('Thoughtful')) {
            return 'growth_response';
        } else if (personality.includes('Optimistic')) {
            return 'future_response';
        }
        
        // Default to relationships for personal topics
        return 'relationships_response';
    }

    /**
     * Construct personal response using modular components
     * @param {string} responseType - Type of response to generate
     * @param {Object} triggerAnalysis - Trigger analysis
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Constructed response
     */
    constructPersonalResponse(responseType, triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        const components = this.personalComponents;
        
        // Select opening based on emotional tone and personality
        let opening = '';
        if (triggerAnalysis.emotionalTone === 'positive') {
            opening = this.selectRandom(components.openings.celebratory);
        } else if (triggerAnalysis.emotionalTone === 'negative' || triggerAnalysis.emotionalTone === 'vulnerable') {
            opening = this.selectRandom(components.openings.empathetic);
        } else if (personality.includes('Supportive')) {
            opening = this.selectRandom(components.openings.supportive);
        } else {
            opening = this.selectRandom(components.openings.curious);
        }
        
        // Select core content based on response type
        let coreContent = '';
        if (components.coreContent[responseType]) {
            const categoryOptions = components.coreContent[responseType];
            // Choose subcategory based on emotional tone and context
            let subcategory = Object.keys(categoryOptions)[0]; // Default
            
            if (triggerAnalysis.supportNeeded && categoryOptions.support) {
                subcategory = 'support';
            } else if (triggerAnalysis.emotionalTone === 'positive' && categoryOptions.celebration) {
                subcategory = 'celebration';
            } else if (triggerAnalysis.emotionalTone === 'negative' && categoryOptions.validation) {
                subcategory = 'validation';
            }
            
            coreContent = this.selectRandom(categoryOptions[subcategory]);
        } else {
            // Fallback content (always supportive)
            coreContent = 'life is full of meaningful experiences';
        }
        
        // Select appropriate transition
        let transition = '';
        if (triggerAnalysis.supportNeeded) {
            transition = this.selectRandom(components.transitions.supportive);
        } else if (personality.includes('Empathetic')) {
            transition = this.selectRandom(components.transitions.empathetic);
        } else if (triggerAnalysis.emotionalTone === 'positive') {
            transition = this.selectRandom(components.transitions.encouraging);
        } else {
            transition = this.selectRandom(components.transitions.reflective);
        }
        
        // Select closing based on emotional tone and relationship
        let closing = '';
        if (triggerAnalysis.supportNeeded || triggerAnalysis.emotionalTone === 'negative') {
            closing = this.selectRandom(components.closings.supportive);
        } else if (triggerAnalysis.emotionalTone === 'positive') {
            closing = this.selectRandom(components.closings.encouraging);
        } else if (triggerAnalysis.intimacyLevel === 'intimate') {
            closing = this.selectRandom(components.closings.connecting);
        } else {
            closing = this.selectRandom(components.closings.wise);
        }
        
        // Combine components into natural, emotionally intelligent response
        return `${opening} ${coreContent}. ${transition} ${closing}`;
    }

    /**
     * Generate fallback personal response (always supportive)
     * @param {Object} character - Character object
     * @param {string} originalMessage - Original message
     * @returns {string} - Fallback response
     */
    getFallbackPersonalResponse(character, originalMessage) {
        const fallbacks = [
            "Thanks for sharing that with me.",
            "It sounds like you're going through a lot.",
            "I appreciate you opening up about this.",
            "Life can be really complex sometimes.",
            "You're not alone in feeling this way."
        ];
        
        return this.selectRandom(fallbacks);
    }

    /**
     * Utility method to select random element from array
     * @param {Array} array - Array to select from
     * @returns {*} - Random element
     */
    selectRandom(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Check if topic is appropriate for current context
     * @param {Object} triggerAnalysis - Trigger analysis
     * @param {Object} context - Environmental context
     * @returns {boolean} - Whether topic is appropriate
     */
    isTopicAppropriate(triggerAnalysis, context) {
        // Very personal/intimate topics should only be discussed in private settings
        if (triggerAnalysis.intimacyLevel === 'intimate') {
            return context.groupSize === 'one_on_one' && context.privacy >= 8;
        }
        
        // Personal topics are okay in small groups or private settings
        if (triggerAnalysis.intimacyLevel === 'personal') {
            return context.groupSize !== 'large_group' && context.privacy >= 5;
        }
        
        // Surface level personal topics are generally okay
        return true;
    }

    /**
     * Get pool statistics for debugging
     * @returns {Object} - Pool statistics
     */
    getPoolStats() {
        return {
            name: 'Personal Dialogue Pool',
            approach: 'Emotionally intelligent and supportive',
            triggerCategories: Object.keys(this.topicTriggers).length,
            componentCategories: Object.keys(this.personalComponents).length,
            totalResponses: Object.values(this.personalComponents.coreContent)
                .reduce((total, category) => total + Object.keys(category).length, 0),
            conversationMemory: this.conversationMemory.size,
            supportSessions: this.supportOffered.size
        };
    }

    /**
     * Record supportive interaction (for tracking emotional support)
     * @param {string} characterId - Character who provided support
     * @param {string} supportType - Type of support offered
     * @param {Object} context - Context of the interaction
     */
    recordSupportOffered(characterId, supportType, context) {
        const timestamp = Date.now();
        
        if (!this.supportOffered.has(characterId)) {
            this.supportOffered.set(characterId, []);
        }
        
        this.supportOffered.get(characterId).push({
            type: supportType,
            timestamp,
            context: context.location || 'unknown'
        });
        
        // Keep only recent support records (last 10)
        const records = this.supportOffered.get(characterId);
        if (records.length > 10) {
            records.splice(0, records.length - 10);
        }
    }

    /**
     * Get character's support history (for personality consistency)
     * @param {string} characterId - Character to check
     * @returns {Array} - Recent support interactions
     */
    getSupportHistory(characterId) {
        return this.supportOffered.get(characterId) || [];
    }
}
