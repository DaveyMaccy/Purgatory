/**
 * Conversational Dialogue System - Advanced Reply-Capable AI
 * Implements modular sentence construction with trigger-based responses
 * 
 * KEY FEATURES:
 * - Trigger word detection and response mapping
 * - Modular sentence construction (Column A + B + C system)
 * - Context-aware reply generation
 * - Conversation threading and memory
 * - Personality-driven response variations
 * - Question/answer recognition and appropriate responses
 * 
 * SENTENCE STRUCTURE:
 * [Opening] + [Core Content] + [Modifier] + [Ending] = Dynamic sentence
 * Each component has personality variants and context appropriateness
 * 
 * EXPANSION NOTES:
 * - Add emotional state detection in incoming messages
 * - Implement topic persistence across conversation turns
 * - Create relationship-specific response patterns
 * - Add cultural/regional dialogue variations
 */

import { MockAIConfig } from './config.js';

export class ConversationalDialogueSystem {
    constructor() {
        this.config = MockAIConfig;
        
        // Trigger word system for intelligent responses
        this.triggerWords = {
            // Work-related triggers
            work: {
                keywords: ['work', 'task', 'project', 'deadline', 'meeting', 'boss', 'client', 'report', 'busy', 'overtime'],
                responses: 'work_response',
                sentiment: 'neutral',
                topics: ['work_stress', 'deadlines', 'collaboration']
            },
            
            // Emotional state triggers
            stressed: {
                keywords: ['stressed', 'overwhelmed', 'pressure', 'anxious', 'worried', 'frantic', 'exhausted'],
                responses: 'supportive_response',
                sentiment: 'negative',
                topics: ['stress_relief', 'support', 'empathy']
            },
            
            happy: {
                keywords: ['great', 'awesome', 'fantastic', 'excellent', 'wonderful', 'amazing', 'excited', 'thrilled'],
                responses: 'positive_response',
                sentiment: 'positive',
                topics: ['celebration', 'shared_joy', 'enthusiasm']
            },
            
            tired: {
                keywords: ['tired', 'exhausted', 'sleepy', 'drained', 'worn out', 'beat', 'wiped', 'fatigued'],
                responses: 'energy_response',
                sentiment: 'negative',
                topics: ['rest', 'coffee', 'sympathy']
            },
            
            // Need-based triggers
            coffee: {
                keywords: ['coffee', 'caffeine', 'espresso', 'latte', 'brew', 'java', 'cup'],
                responses: 'coffee_response',
                sentiment: 'neutral',
                topics: ['coffee_sharing', 'energy', 'morning_ritual']
            },
            
            food: {
                keywords: ['hungry', 'lunch', 'snack', 'eat', 'food', 'meal', 'starving', 'appetite'],
                responses: 'food_response',
                sentiment: 'neutral',
                topics: ['food_sharing', 'hunger', 'meal_planning']
            },
            
            // Social triggers
            gossip: {
                keywords: ['heard', 'rumor', 'secret', 'drama', 'news', 'whisper', 'between us', 'confidential'],
                responses: 'gossip_response',
                sentiment: 'curious',
                topics: ['information_sharing', 'secrets', 'workplace_drama']
            },
            
            compliment: {
                keywords: ['good job', 'well done', 'impressive', 'proud', 'accomplished', 'succeeded'],
                responses: 'compliment_response',
                sentiment: 'positive',
                topics: ['recognition', 'achievement', 'validation']
            },
            
            complaint: {
                keywords: ['annoying', 'frustrating', 'stupid', 'hate', 'awful', 'terrible', 'worst'],
                responses: 'complaint_response',
                sentiment: 'negative',
                topics: ['venting', 'commiseration', 'problem_solving']
            },
            
            // Question triggers
            question: {
                keywords: ['?', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'do you', 'can you', 'will you'],
                responses: 'question_response',
                sentiment: 'inquisitive',
                topics: ['information_request', 'help_seeking', 'curiosity']
            },
            
            // Time-based triggers
            morning: {
                keywords: ['morning', 'early', 'sunrise', 'wake up', 'start of day'],
                responses: 'morning_response',
                sentiment: 'neutral',
                topics: ['morning_routine', 'energy', 'day_planning']
            },
            
            weekend: {
                keywords: ['weekend', 'saturday', 'sunday', 'days off', 'break', 'vacation'],
                responses: 'weekend_response',
                sentiment: 'positive',
                topics: ['leisure', 'relaxation', 'plans']
            }
        };
        
        // Modular sentence construction system (the "quiz generator" approach)
        this.sentenceComponents = {
            // Opening phrases (Column A)
            openings: {
                casual: {
                    friendly: ['Oh', 'Hey', 'Yeah', 'Right', 'Totally', 'Absolutely'],
                    neutral: ['Well', 'So', 'Actually', 'I mean', 'You know'],
                    professional: ['Indeed', 'Certainly', 'Of course', 'I understand', 'That makes sense']
                },
                responses: {
                    agreement: ['Exactly!', 'I know, right?', 'Absolutely!', 'You said it!', 'No kidding!'],
                    disagreement: ['Actually...', 'Well, I think...', 'Hmm, but...', 'I see it differently...'],
                    surprise: ['Really?', 'No way!', 'Seriously?', 'Are you kidding?', 'I had no idea!'],
                    sympathy: ['Oh no...', 'That sucks...', 'I\'m sorry to hear that...', 'That must be tough...']
                }
            },
            
            // Core content (Column B) - Main message
            coreContent: {
                work_response: {
                    supportive: ['I hear you on that', 'Work can be really demanding', 'Projects are crazy lately', 'The workload is intense'],
                    sharing: ['I\'m dealing with something similar', 'My project is also hectic', 'Same here with deadlines', 'I\'m in the same boat'],
                    advice: ['Maybe try breaking it into smaller tasks', 'Have you talked to the manager about it', 'Sometimes a break helps', 'Don\'t forget to pace yourself']
                },
                
                supportive_response: {
                    empathy: ['that sounds really stressful', 'I can imagine how overwhelming that must be', 'you\'re dealing with a lot right now'],
                    encouragement: ['you\'ve got this though', 'you\'re stronger than you think', 'this too shall pass', 'you\'ll get through it'],
                    offers: ['is there anything I can do to help', 'want to talk about it', 'need someone to vent to', 'I\'m here if you need support']
                },
                
                positive_response: {
                    shared_joy: ['that\'s fantastic!', 'I\'m so happy for you!', 'that\'s wonderful news!', 'amazing!'],
                    curiosity: ['tell me more about that!', 'how did that happen?', 'I want to hear all about it!'],
                    celebration: ['we should celebrate!', 'this calls for a coffee break!', 'way to go!']
                },
                
                energy_response: {
                    sympathy: ['I totally get that feeling', 'exhaustion is the worst', 'I\'m feeling drained too'],
                    solutions: ['maybe some coffee would help', 'have you tried taking a quick break', 'sometimes a walk helps'],
                    solidarity: ['we\'re all running on fumes today', 'it\'s been one of those weeks', 'I need caffeine too']
                },
                
                coffee_response: {
                    enthusiasm: ['coffee sounds perfect right now!', 'I could definitely use some caffeine!', 'great idea!'],
                    joining: ['mind if I join you?', 'I\'ll come with you!', 'let\'s go together!'],
                    sharing: ['want me to grab you one too?', 'I\'m making a coffee run', 'anyone else need coffee?']
                },
                
                food_response: {
                    agreement: ['I\'m getting hungry too', 'lunch sounds good right now', 'my stomach is grumbling'],
                    suggestions: ['want to grab something together?', 'there are snacks in the break room', 'I know a good place nearby'],
                    sharing: ['I have some snacks if you want', 'want to split something?', 'I brought extra lunch']
                },
                
                gossip_response: {
                    curiosity: ['really? tell me more!', 'I hadn\'t heard that!', 'what\'s the story?', 'spill the tea!'],
                    discretion: ['I won\'t say anything', 'that stays between us', 'your secret is safe'],
                    reciprocation: ['speaking of which, did you hear about...', 'that reminds me of...', 'I heard something similar...']
                },
                
                compliment_response: {
                    gratitude: ['thank you so much!', 'that really means a lot!', 'I appreciate that!'],
                    humility: ['it was a team effort really', 'I just got lucky', 'thanks, but everyone helped'],
                    reciprocation: ['you\'ve been doing great work too!', 'right back at you!', 'we make a good team!']
                },
                
                complaint_response: {
                    validation: ['that does sound frustrating', 'I can see why that would be annoying', 'what a pain!'],
                    commiseration: ['I hate when that happens', 'been there myself', 'we\'ve all dealt with that'],
                    problem_solving: ['have you tried...', 'maybe we could...', 'what if we...']
                },
                
                question_response: {
                    helpful: ['let me think about that...', 'good question!', 'I might know something about that'],
                    uncertain: ['I\'m not really sure about that', 'that\'s outside my expertise', 'you might want to ask...'],
                    deflecting: ['what do you think?', 'that\'s interesting, why do you ask?', 'I\'d love to hear your thoughts on that']
                },
                
                morning_response: {
                    energy: ['mornings are rough!', 'still waking up myself', 'need more coffee for sure'],
                    routine: ['how was your commute?', 'ready for the day?', 'got everything sorted?'],
                    optimism: ['at least it\'s a fresh start!', 'new day, new possibilities!', 'let\'s make it a good one!']
                },
                
                weekend_response: {
                    excitement: ['weekends are the best!', 'can\'t wait for some downtime!', 'ready to relax!'],
                    plans: ['any fun plans?', 'doing anything exciting?', 'have you got activities lined up?'],
                    work_balance: ['glad to have a break from work!', 'time to recharge!', 'well-deserved rest!']
                }
            },
            
            // Modifiers (Column C) - Add personality/context
            modifiers: {
                personality: {
                    ambitious: ['and then tackle the next challenge', 'while planning ahead', 'with an eye on future goals'],
                    lazy: ['without too much effort', 'keeping it simple', 'the easy way'],
                    extroverted: ['and get everyone involved', 'making it social', 'with the whole team'],
                    introverted: ['quietly and efficiently', 'without too much fuss', 'keeping it low-key'],
                    organized: ['in a systematic way', 'with proper planning', 'step by step'],
                    chaotic: ['and see what happens', 'going with the flow', 'winging it'],
                    gossip: ['and I know who might be interested', 'between you and me', 'if you know what I mean'],
                    professional: ['maintaining high standards', 'in a professional manner', 'following best practices']
                },
                
                context: {
                    time_pressure: ['but we need to be quick about it', 'since time is tight', 'given the deadline'],
                    relaxed: ['when we have time', 'no rush though', 'at our own pace'],
                    private: ['just between us', 'confidentially', 'keeping it quiet'],
                    public: ['for everyone to hear', 'openly', 'transparently'],
                    urgent: ['as soon as possible', 'right away', 'immediately'],
                    casual: ['whenever convenient', 'no big deal', 'casually']
                }
            },
            
            // Endings (Column D) - Wrap up naturally
            endings: {
                questions: ['What do you think?', 'Sound good?', 'Make sense?', 'You with me?', 'Right?'],
                statements: ['for sure.', 'you know?', 'anyway.', 'that\'s my take.', 'just saying.'],
                actions: ['Let\'s do it!', 'I\'m in!', 'Count me in!', 'Let\'s go for it!', 'Why not?'],
                continuations: ['What about you?', 'How about you?', 'Your turn!', 'What\'s your story?'],
                closings: ['Anyway...', 'So yeah...', 'That\'s that.', 'There you have it.', 'End of story.']
            }
        };
        
        // Conversation context tracking
        this.activeConversations = new Map();
        this.conversationHistory = new Map();
        
        console.log('💬 Advanced Conversational Dialogue System initialized');
    }

    /**
     * Main entry point - generate contextual response to incoming dialogue
     * @param {Object} character - Character generating response
     * @param {string} incomingMessage - Message they're responding to
     * @param {Object} speaker - Character who spoke the message
     * @param {Object} context - Environmental context
     * @returns {string} - Generated response
     */
    generateResponse(character, incomingMessage, speaker, context) {
        try {
            console.log(`🗣️ ${character.name} responding to "${incomingMessage}" from ${speaker?.name || 'unknown'}`);
            
            // Analyze incoming message
            const messageAnalysis = this.analyzeIncomingMessage(incomingMessage);
            
            // Get or create conversation context
            const conversationId = this.getConversationId(character, speaker);
            const conversationContext = this.getConversationContext(conversationId);
            
            // Update conversation context with new message
            this.updateConversationContext(conversationId, speaker, incomingMessage, messageAnalysis);
            
            // Generate appropriate response
            const response = this.constructResponse(character, messageAnalysis, conversationContext, context);
            
            // Store our response in conversation history
            this.updateConversationContext(conversationId, character, response, { isResponse: true });
            
            console.log(`💭 Generated response: "${response}"`);
            
            return response;
            
        } catch (error) {
            console.error(`Error generating response for ${character.name}:`, error);
            return this.getFallbackResponse(character, incomingMessage);
        }
    }

    /**
     * Analyze incoming message for triggers, sentiment, and intent
     * @param {string} message - Incoming message to analyze
     * @returns {Object} - Analysis results
     */
    analyzeIncomingMessage(message) {
        const analysis = {
            originalMessage: message,
            triggers: [],
            sentiment: 'neutral',
            intent: 'general',
            isQuestion: false,
            topics: [],
            emotionalState: 'neutral',
            urgency: 'normal'
        };
        
        const messageLower = message.toLowerCase();
        
        // Detect triggers
        Object.entries(this.triggerWords).forEach(([triggerName, triggerData]) => {
            const matches = triggerData.keywords.filter(keyword => 
                messageLower.includes(keyword.toLowerCase())
            );
            
            if (matches.length > 0) {
                analysis.triggers.push({
                    type: triggerName,
                    matches: matches,
                    responseType: triggerData.responses,
                    sentiment: triggerData.sentiment,
                    topics: triggerData.topics,
                    strength: matches.length / triggerData.keywords.length
                });
            }
        });
        
        // Determine dominant trigger/sentiment
        if (analysis.triggers.length > 0) {
            const dominantTrigger = analysis.triggers.reduce((prev, curr) => 
                curr.strength > prev.strength ? curr : prev
            );
            
            analysis.intent = dominantTrigger.responseType;
            analysis.sentiment = dominantTrigger.sentiment;
            analysis.topics = dominantTrigger.topics;
        }
        
        // Detect questions
        analysis.isQuestion = messageLower.includes('?') || 
                            ['what', 'when', 'where', 'why', 'how', 'who', 'which', 'do you', 'can you', 'will you', 'have you', 'did you'].some(q => 
                                messageLower.startsWith(q + ' ') || messageLower.includes(' ' + q + ' ')
                            );
        
        // Detect emotional intensity
        const intensityWords = ['really', 'very', 'extremely', 'totally', 'absolutely', 'completely', 'definitely'];
        const hasIntensity = intensityWords.some(word => messageLower.includes(word));
        
        if (hasIntensity) {
            analysis.emotionalState = analysis.sentiment === 'positive' ? 'excited' : 
                                    analysis.sentiment === 'negative' ? 'upset' : 'emphatic';
        }
        
        // Detect urgency
        const urgencyWords = ['urgent', 'asap', 'immediately', 'now', 'quick', 'hurry', 'emergency'];
        if (urgencyWords.some(word => messageLower.includes(word))) {
            analysis.urgency = 'high';
        }
        
        return analysis;
    }

    /**
     * Construct response using modular sentence system
     * @param {Object} character - Character generating response
     * @param {Object} messageAnalysis - Analysis of incoming message
     * @param {Object} conversationContext - Ongoing conversation context
     * @param {Object} environmentContext - Environmental context
     * @returns {string} - Constructed response
     */
    constructResponse(character, messageAnalysis, conversationContext, environmentContext) {
        // Determine response strategy
        const responseStrategy = this.determineResponseStrategy(character, messageAnalysis, conversationContext);
        
        // Select sentence components based on strategy
        const components = this.selectSentenceComponents(character, responseStrategy, messageAnalysis);
        
        // Construct sentence: Opening + Core + Modifier + Ending
        const parts = [];
        
        // Add opening (Column A)
        if (components.opening) {
            parts.push(components.opening);
        }
        
        // Add core content (Column B)
        if (components.core) {
            parts.push(components.core);
        }
        
        // Add personality modifier (Column C)
        if (components.modifier) {
            parts.push(components.modifier);
        }
        
        // Add ending (Column D)
        if (components.ending) {
            parts.push(components.ending);
        }
        
        // Join parts with appropriate spacing and punctuation
        let response = this.assembleSentence(parts, responseStrategy);
        
        // Apply personality-specific modifications
        response = this.applyPersonalityModifications(response, character, messageAnalysis);
        
        return response;
    }

    /**
     * Determine response strategy based on context
     * @param {Object} character - Character responding
     * @param {Object} messageAnalysis - Message analysis
     * @param {Object} conversationContext - Conversation context
     * @returns {Object} - Response strategy
     */
    determineResponseStrategy(character, messageAnalysis, conversationContext) {
        const strategy = {
            type: 'supportive', // supportive, informative, social, deflective
            tone: 'friendly',   // friendly, professional, casual, warm
            length: 'medium',   // short, medium, long
            includeQuestion: false,
            showPersonality: true,
            engagementLevel: 'normal' // low, normal, high
        };
        
        const personality = character.personalityTags || [];
        
        // Adjust based on message analysis
        if (messageAnalysis.isQuestion) {
            strategy.type = 'informative';
            strategy.includeQuestion = Math.random() < 0.3; // Sometimes ask follow-up
        }
        
        if (messageAnalysis.sentiment === 'negative') {
            strategy.type = 'supportive';
            strategy.tone = 'warm';
        }
        
        if (messageAnalysis.sentiment === 'positive') {
            strategy.type = 'social';
            strategy.tone = 'enthusiastic';
            strategy.engagementLevel = 'high';
        }
        
        // Adjust based on personality
        if (personality.includes('Professional')) {
            strategy.tone = 'professional';
            strategy.showPersonality = false;
        }
        
        if (personality.includes('Extroverted')) {
            strategy.length = 'long';
            strategy.includeQuestion = true;
            strategy.engagementLevel = 'high';
        }
        
        if (personality.includes('Introverted')) {
            strategy.length = 'short';
            strategy.includeQuestion = false;
            strategy.engagementLevel = 'low';
        }
        
        if (personality.includes('Gossip')) {
            strategy.includeQuestion = true;
            strategy.type = 'curious';
            strategy.engagementLevel = 'high';
        }
        
        return strategy;
    }

    /**
     * Select appropriate sentence components
     * @param {Object} character - Character responding
     * @param {Object} strategy - Response strategy
     * @param {Object} messageAnalysis - Message analysis
     * @returns {Object} - Selected components
     */
    selectSentenceComponents(character, strategy, messageAnalysis) {
        const components = {};
        const personality = character.personalityTags || [];
        
        // Select opening based on strategy and message analysis
        if (messageAnalysis.sentiment === 'positive') {
            components.opening = this.randomSelect(this.sentenceComponents.openings.responses.agreement);
        } else if (messageAnalysis.sentiment === 'negative') {
            components.opening = this.randomSelect(this.sentenceComponents.openings.responses.sympathy);
        } else if (messageAnalysis.isQuestion) {
            components.opening = this.randomSelect(this.sentenceComponents.openings.casual.neutral);
        } else {
            components.opening = this.randomSelect(this.sentenceComponents.openings.casual.friendly);
        }
        
        // Select core content based on intent
        const coreContentCategory = this.sentenceComponents.coreContent[messageAnalysis.intent];
        if (coreContentCategory) {
            const subcategories = Object.keys(coreContentCategory);
            let selectedSubcategory = subcategories[0]; // Default
            
            // Choose subcategory based on personality and strategy
            if (strategy.type === 'supportive' && coreContentCategory.empathy) {
                selectedSubcategory = 'empathy';
            } else if (strategy.type === 'supportive' && coreContentCategory.offers) {
                selectedSubcategory = 'offers';
            } else if (strategy.engagementLevel === 'high' && coreContentCategory.curiosity) {
                selectedSubcategory = 'curiosity';
            } else if (personality.includes('Helpful') && coreContentCategory.advice) {
                selectedSubcategory = 'advice';
            }
            
            if (coreContentCategory[selectedSubcategory]) {
                components.core = this.randomSelect(coreContentCategory[selectedSubcategory]);
            }
        }
        
        // Select personality modifier if showing personality
        if (strategy.showPersonality && personality.length > 0) {
            const trait = personality[0].toLowerCase(); // Use first personality trait
            const modifierCategory = this.sentenceComponents.modifiers.personality[trait];
            if (modifierCategory) {
                components.modifier = this.randomSelect(modifierCategory);
            }
        }
        
        // Select ending based on strategy
        if (strategy.includeQuestion || messageAnalysis.isQuestion) {
            components.ending = this.randomSelect(this.sentenceComponents.endings.questions);
        } else if (strategy.engagementLevel === 'high') {
            components.ending = this.randomSelect(this.sentenceComponents.endings.continuations);
        } else if (strategy.type === 'social') {
            components.ending = this.randomSelect(this.sentenceComponents.endings.actions);
        } else {
            components.ending = this.randomSelect(this.sentenceComponents.endings.statements);
        }
        
        return components;
    }

    /**
     * Assemble sentence parts with proper grammar and flow
     * @param {Array} parts - Sentence parts to assemble
     * @param {Object} strategy - Response strategy
     * @returns {string} - Assembled sentence
     */
    assembleSentence(parts, strategy) {
        if (parts.length === 0) return 'Yeah...';
        
        let sentence = '';
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (i === 0) {
                // First part - capitalize
                sentence += part.charAt(0).toUpperCase() + part.slice(1);
            } else {
                // Determine connector
                let connector = '';
                
                if (i === parts.length - 1) {
                    // Last part
                    if (part.includes('?') || part.includes('!')) {
                        connector = ' ';
                    } else {
                        connector = ', ';
                    }
                } else {
                    // Middle parts
                    if (part.startsWith('and ') || part.startsWith('but ') || part.startsWith('so ')) {
                        connector = ' ';
                    } else {
                        connector = ' ';
                    }
                }
                
                sentence += connector + part;
            }
        }
        
        // Ensure proper punctuation
        if (!sentence.match(/[.!?]$/)) {
            sentence += '.';
        }
        
        return sentence;
    }

    /**
     * Apply personality-specific modifications to final response
     * @param {string} response - Base response
     * @param {Object} character - Character responding
     * @param {Object} messageAnalysis - Message analysis
     * @returns {string} - Modified response
     */
    applyPersonalityModifications(response, character, messageAnalysis) {
        const personality = character.personalityTags || [];
        let modified = response;
        
        personality.forEach(trait => {
            switch (trait) {
                case 'Professional':
                    // More formal language
                    modified = modified.replace(/yeah/gi, 'yes');
                    modified = modified.replace(/gonna/gi, 'going to');
                    modified = modified.replace(/wanna/gi, 'want to');
                    break;
                    
                case 'Lazy':
                    // More casual, sometimes incomplete
                    if (Math.random() < 0.2) {
                        modified = modified.replace(/\.$/, '...');
                    }
                    modified = modified.replace(/going to/gi, 'gonna');
                    break;
                    
                case 'Extroverted':
                    // Add enthusiasm
                    if (!modified.includes('!') && Math.random() < 0.4) {
                        modified = modified.replace(/\.$/, '!');
                    }
                    break;
                    
                case 'Introverted':
                    // Remove excessive enthusiasm, make more reserved
                    modified = modified.replace(/!+/g, '.');
                    if (Math.random() < 0.3) {
                        modified = modified.replace(/^(\w+),?\s*/gi, 'Well, ');
                    }
                    break;
                    
                case 'Gossip':
                    // Add conspiratorial elements
                    if (messageAnalysis.intent === 'gossip_response' && Math.random() < 0.4) {
                        modified += ' *winks*';
                    }
                    break;
                    
                case 'Chaotic':
                    // Occasionally add random elements
                    if (Math.random() < 0.2) {
                        const randomAdditions = [' Wait, what were we talking about?', ' Oh, shiny!', ' ...anyway!'];
                        modified += randomAdditions[Math.floor(Math.random() * randomAdditions.length)];
                    }
                    break;
            }
        });
        
        return modified;
    }

    /**
     * Conversation context management
     */
    getConversationId(character1, character2) {
        const ids = [character1.id, character2?.id || 'unknown'].sort();
        return `conv_${ids.join('_')}`;
    }

    getConversationContext(conversationId) {
        if (!this.activeConversations.has(conversationId)) {
            this.activeConversations.set(conversationId, {
                id: conversationId,
                startTime: Date.now(),
                turnCount: 0,
                topics: [],
                sentiment: 'neutral',
                lastSpeaker: null,
                history: []
            });
        }
        
        return this.activeConversations.get(conversationId);
    }

    updateConversationContext(conversationId, speaker, message, analysis) {
        const context = this.getConversationContext(conversationId);
        
        context.turnCount++;
        context.lastSpeaker = speaker.id;
        context.history.push({
            speaker: speaker.name,
            message: message,
            timestamp: Date.now(),
            analysis: analysis
        });
        
        // Update topics
        if (analysis?.topics) {
            analysis.topics.forEach(topic => {
                if (!context.topics.includes(topic)) {
                    context.topics.push(topic);
                }
            });
        }
        
        // Update sentiment
        if (analysis?.sentiment && analysis.sentiment !== 'neutral') {
            context.sentiment = analysis.sentiment;
        }
        
        // Keep history manageable
        if (context.history.length > 20) {
            context.history = context.history.slice(-20);
        }
    }

    /**
     * Utility methods
     */
    randomSelect(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }

    getFallbackResponse(character, incomingMessage) {
        const personality = character.personalityTags || [];
        
        const fallbacks = {
            'Professional': ['I see your point.', 'That\'s interesting.', 'Let me think about that.'],
            'Extroverted': ['Tell me more!', 'That\'s fascinating!', 'I love hearing about that!'],
            'Introverted': ['Hmm.', 'I see.', 'That makes sense.'],
            'Gossip': ['Really? What else?', 'I hadn\'t heard that!', 'You don\'t say!'],
            'Lazy': ['Yeah...', 'Mm-hmm.', 'Sure thing.'],
            'Ambitious': ['Interesting perspective.', 'Good point.', 'I hadn\'t considered that.']
        };
        
        // Use personality-specific fallback if available
        for (const trait of personality) {
            if (fallbacks[trait]) {
                return this.randomSelect(fallbacks[trait]);
            }
        }
        
        // Generic fallbacks
        return this.randomSelect(['That\'s interesting.', 'I hear you.', 'Makes sense.', 'Yeah, totally.']);
    }

    /**
     * Generate a conversation starter (when character initiates)
     * @param {Object} character - Character starting conversation
     * @param {Object} target - Target character
     * @param {Object} context - Environmental context
     * @returns {string} - Conversation starter
     */
    generateConversationStarter(character, target, context) {
        const personality = character.personalityTags || [];
        const timeOfDay = new Date().getHours();
        const location = context.location?.type || 'office';
        
        // Select appropriate starter strategy
        let starterType = 'greeting';
        
        if (personality.includes('Gossip')) {
            starterType = Math.random() < 0.6 ? 'gossip_probe' : 'greeting';
        } else if (personality.includes('Professional')) {
            starterType = Math.random() < 0.5 ? 'work_related' : 'greeting';
        } else if (personality.includes('Extroverted')) {
            starterType = Math.random() < 0.4 ? 'enthusiastic' : 'greeting';
        }
        
        // Time-based adjustments
        if (timeOfDay < 10) {
            starterType = 'morning_greeting';
        } else if (timeOfDay >= 12 && timeOfDay <= 13) {
            starterType = 'lunch_related';
        }
        
        // Location-based adjustments
        if (location === 'break_room' && (character.energy < 5 || Math.random() < 0.4)) {
            starterType = 'coffee_related';
        }
        
        return this.constructStarter(character, target, starterType, context);
    }

    constructStarter(character, target, starterType, context) {
        const components = this.getStarterComponents(starterType, character, target);
        
        // Build starter: Greeting + Topic + Personality modifier + Optional question
        const parts = [];
        
        if (components.greeting) parts.push(components.greeting);
        if (components.topic) parts.push(components.topic);
        if (components.modifier) parts.push(components.modifier);
        if (components.question) parts.push(components.question);
        
        return this.assembleSentence(parts, { type: 'conversation_starter' });
    }

    getStarterComponents(starterType, character, target) {
        const personality = character.personalityTags || [];
        const components = {};
        
        // Define starter component pools
        const starterPools = {
            greeting: {
                casual: ['Hey', 'Hi there', 'Oh hey', 'What\'s up'],
                formal: ['Hello', 'Good morning', 'How are you', 'Nice to see you'],
                friendly: ['Hey there!', 'Hi!', 'Good to see you!']
            },
            
            coffee_related: {
                topic: ['grabbing some coffee', 'need caffeine badly', 'coffee break time', 'this coffee smells great'],
                questions: ['want to join me?', 'need some too?', 'how do you take yours?']
            },
            
            work_related: {
                topic: ['busy day today', 'how\'s your project going', 'deadlines are crazy lately'],
                questions: ['how are you managing everything?', 'getting much done?', 'need any help?']
            },
            
            gossip_probe: {
                topic: ['heard anything interesting lately', 'things have been quiet around here', 'did you hear about'],
                questions: ['anything new happening?', 'what\'s the word?', 'fill me in!']
            },
            
            morning_greeting: {
                topic: ['early start today', 'morning already', 'ready for the day'],
                questions: ['how was your commute?', 'sleep well?', 'coffee helping yet?']
            },
            
            lunch_related: {
                topic: ['lunch time!', 'getting hungry', 'food break'],
                questions: ['joining me?', 'know any good places?', 'what sounds good?']
            },
            
            enthusiastic: {
                topic: ['great energy today!', 'love the vibe here', 'feeling productive'],
                questions: ['how\'s your day going?', 'feeling good too?', 'what\'s got you motivated?']
            }
        };
        
        // Select greeting
        if (personality.includes('Professional')) {
            components.greeting = this.randomSelect(starterPools.greeting.formal);
        } else if (personality.includes('Extroverted')) {
            components.greeting = this.randomSelect(starterPools.greeting.friendly);
        } else {
            components.greeting = this.randomSelect(starterPools.greeting.casual);
        }
        
        // Select topic based on starter type
        const pool = starterPools[starterType];
        if (pool) {
            if (pool.topic) components.topic = this.randomSelect(pool.topic);
            if (pool.questions && (personality.includes('Extroverted') || personality.includes('Gossip') || Math.random() < 0.5)) {
                components.question = this.randomSelect(pool.questions);
            }
        }
        
        // Add personality modifier
        const trait = personality[0]?.toLowerCase();
        if (trait && this.sentenceComponents.modifiers.personality[trait] && Math.random() < 0.3) {
            components.modifier = this.randomSelect(this.sentenceComponents.modifiers.personality[trait]);
        }
        
        return components;
    }

    /**
     * Advanced response patterns for complex conversations
     */
    
    /**
     * Generate follow-up response based on conversation history
     * @param {Object} character - Character responding
     * @param {Object} conversationContext - Full conversation context
     * @returns {string} - Follow-up response
     */
    generateFollowUpResponse(character, conversationContext) {
        const history = conversationContext.history;
        const recentMessages = history.slice(-3); // Last 3 exchanges
        
        // Analyze conversation flow
        const topics = conversationContext.topics;
        const sentiment = conversationContext.sentiment;
        
        // Determine follow-up strategy
        let followUpType = 'continuation';
        
        if (topics.includes('work_stress') && sentiment === 'negative') {
            followUpType = 'supportive_deepening';
        } else if (topics.includes('gossip') || topics.includes('workplace_drama')) {
            followUpType = 'information_seeking';
        } else if (conversationContext.turnCount > 6) {
            followUpType = 'conversation_winding';
        }
        
        return this.constructFollowUp(character, followUpType, conversationContext);
    }

    constructFollowUp(character, followUpType, conversationContext) {
        const personality = character.personalityTags || [];
        
        const followUpPools = {
            supportive_deepening: {
                empathy: ['that really does sound tough', 'I can imagine how stressful that must be'],
                offers: ['is there anything I can do to help?', 'want to talk more about it?'],
                solutions: ['have you considered...', 'maybe we could...', 'what if...']
            },
            
            information_seeking: {
                curiosity: ['tell me more about that', 'what else did you hear?', 'who else knows?'],
                discretion: ['this stays between us, right?', 'I won\'t tell anyone'],
                reciprocation: ['speaking of which...', 'that reminds me...', 'I heard something similar...']
            },
            
            conversation_winding: {
                summary: ['anyway', 'so yeah', 'well then'],
                transition: ['I should probably get back to work', 'don\'t want to keep you', 'thanks for the chat'],
                future: ['let\'s catch up again soon', 'talk later', 'see you around']
            },
            
            continuation: {
                interest: ['that\'s really interesting', 'I hadn\'t thought of that', 'good point'],
                building: ['and also...', 'plus there\'s...', 'not to mention...'],
                questions: ['what do you think about...', 'how do you feel about...', 'ever wonder about...']
            }
        };
        
        const pool = followUpPools[followUpType];
        if (!pool) return this.getFallbackResponse(character, '');
        
        // Select appropriate sub-category based on personality
        let subcategory = Object.keys(pool)[0]; // Default
        
        if (personality.includes('Gossip') && pool.curiosity) {
            subcategory = 'curiosity';
        } else if (personality.includes('Professional') && pool.solutions) {
            subcategory = 'solutions';
        } else if (personality.includes('Introverted') && pool.transition) {
            subcategory = 'transition';
        }
        
        return this.randomSelect(pool[subcategory]) || this.getFallbackResponse(character, '');
    }

    /**
     * Topic transition management
     */
    
    /**
     * Generate topic transition when conversation stalls
     * @param {Object} character - Character making transition
     * @param {Object} conversationContext - Conversation context
     * @param {Object} environmentContext - Environmental context
     * @returns {string} - Topic transition
     */
    generateTopicTransition(character, conversationContext, environmentContext) {
        const personality = character.personalityTags || [];
        const currentTopics = conversationContext.topics;
        
        // Determine new topic based on context and personality
        let newTopic = 'weather'; // Safe fallback
        
        if (environmentContext.location?.type === 'break_room') {
            newTopic = Math.random() < 0.5 ? 'food' : 'coffee';
        } else if (environmentContext.isWorkingHours) {
            newTopic = 'work';
        }
        
        // Personality influences topic choice
        if (personality.includes('Gossip') && !currentTopics.includes('workplace_drama')) {
            newTopic = 'office_news';
        } else if (personality.includes('Ambitious') && !currentTopics.includes('career')) {
            newTopic = 'professional_goals';
        }
        
        return this.constructTopicTransition(character, newTopic, conversationContext);
    }

    constructTopicTransition(character, newTopic, conversationContext) {
        const transitions = {
            weather: {
                bridges: ['speaking of which', 'anyway', 'by the way'],
                openers: ['nice day today', 'crazy weather lately', 'love this temperature']
            },
            
            food: {
                bridges: ['oh, that reminds me', 'speaking of food', 'randomly'],
                openers: ['I\'m getting hungry', 'lunch was great today', 'trying new recipes lately']
            },
            
            work: {
                bridges: ['work-wise', 'professionally speaking', 'on another note'],
                openers: ['busy week ahead', 'project deadlines coming up', 'meetings have been crazy']
            },
            
            office_news: {
                bridges: ['did you hear', 'speaking of news', 'oh, I meant to tell you'],
                openers: ['something interesting happened', 'heard through the grapevine', 'office gossip time']
            }
        };
        
        const topicData = transitions[newTopic] || transitions.weather;
        const bridge = this.randomSelect(topicData.bridges);
        const opener = this.randomSelect(topicData.openers);
        
        return `${bridge}, ${opener}...`;
    }

    /**
     * Conversation management utilities
     */
    
    /**
     * Check if conversation should naturally end
     * @param {Object} conversationContext - Conversation context
     * @param {Object} character - Character in conversation
     * @returns {boolean} - True if conversation should end
     */
    shouldEndConversation(conversationContext, character) {
        const personality = character.personalityTags || [];
        const duration = Date.now() - conversationContext.startTime;
        const turnCount = conversationContext.turnCount;
        
        // Base ending probability increases with time and turns
        let endProbability = Math.min(0.8, (duration / 120000) + (turnCount / 20)); // 2 minutes or 20 turns
        
        // Personality adjustments
        if (personality.includes('Introverted')) {
            endProbability *= 1.5; // More likely to end conversation
        } else if (personality.includes('Extroverted')) {
            endProbability *= 0.7; // Less likely to end conversation
        }
        
        if (personality.includes('Professional') && character.currentAction?.type === 'WORK_ON') {
            endProbability *= 1.3; // Work pressure
        }
        
        return Math.random() < endProbability;
    }

    /**
     * Generate conversation ending
     * @param {Object} character - Character ending conversation
     * @param {Object} conversationContext - Conversation context
     * @returns {string} - Conversation ending
     */
    generateConversationEnding(character, conversationContext) {
        const personality = character.personalityTags || [];
        const wasPositive = conversationContext.sentiment === 'positive';
        
        const endings = {
            polite: ['Well, I should get going', 'Don\'t want to keep you', 'I should let you get back to it'],
            work: ['Back to the grind!', 'These tasks won\'t finish themselves', 'Duty calls'],
            social: ['Great talking with you!', 'Let\'s chat again soon!', 'Always enjoy our conversations'],
            abrupt: ['Anyway...', 'Well then...', 'So yeah...']
        };
        
        let endingType = 'polite';
        
        if (personality.includes('Professional')) {
            endingType = 'work';
        } else if (personality.includes('Extroverted') && wasPositive) {
            endingType = 'social';
        } else if (personality.includes('Introverted') || personality.includes('Chaotic')) {
            endingType = 'abrupt';
        }
        
        return this.randomSelect(endings[endingType]);
    }

    /**
     * Public API methods for integration
     */
    
    /**
     * Process a dialogue exchange between two characters
     * @param {Object} speaker - Character who spoke
     * @param {string} message - What they said
     * @param {Object} listener - Character who is responding
     * @param {Object} context - Environmental context
     * @returns {Object} - Response data
     */
    processDialogueExchange(speaker, message, listener, context) {
        const response = this.generateResponse(listener, message, speaker, context);
        
        return {
            speaker: listener.name,
            message: response,
            timestamp: Date.now(),
            conversationId: this.getConversationId(speaker, listener),
            analysis: this.analyzeIncomingMessage(message)
        };
    }

    /**
     * Start a new conversation between characters
     * @param {Object} initiator - Character starting conversation
     * @param {Object} target - Character being approached
     * @param {Object} context - Environmental context
     * @returns {Object} - Initial dialogue
     */
    initiateConversation(initiator, target, context) {
        const starter = this.generateConversationStarter(initiator, target, context);
        
        // Create conversation context
        const conversationId = this.getConversationId(initiator, target);
        this.updateConversationContext(conversationId, initiator, starter, { isInitiation: true });
        
        return {
            speaker: initiator.name,
            message: starter,
            timestamp: Date.now(),
            conversationId: conversationId,
            isConversationStart: true
        };
    }

    /**
     * Get conversation statistics for debugging
     * @returns {Object} - Conversation statistics
     */
    getConversationStats() {
        return {
            activeConversations: this.activeConversations.size,
            totalTriggerTypes: Object.keys(this.triggerWords).length,
            sentenceComponentPools: {
                openings: Object.keys(this.sentenceComponents.openings).length,
                coreContent: Object.keys(this.sentenceComponents.coreContent).length,
                modifiers: Object.keys(this.sentenceComponents.modifiers).length,
                endings: Object.keys(this.sentenceComponents.endings).length
            }
        };
    }

    /**
     * Clean up old conversation contexts
     */
    cleanupOldConversations() {
        const now = Date.now();
        const maxAge = 300000; // 5 minutes
        
        for (const [id, context] of this.activeConversations.entries()) {
            if (now - context.startTime > maxAge) {
                this.conversationHistory.set(id, context);
                this.activeConversations.delete(id);
            }
        }
    }

    /**
     * Export conversation data for analysis
     * @returns {Object} - Conversation data
     */
    exportConversationData() {
        return {
            activeConversations: Array.from(this.activeConversations.values()),
            conversationHistory: Array.from(this.conversationHistory.values()),
            triggerWordStats: this.getTriggerWordStats(),
            timestamp: Date.now()
        };
    }

    getTriggerWordStats() {
        const stats = {};
        Object.keys(this.triggerWords).forEach(trigger => {
            stats[trigger] = {
                keywordCount: this.triggerWords[trigger].keywords.length,
                responseType: this.triggerWords[trigger].responses,
                sentiment: this.triggerWords[trigger].sentiment
            };
        });
        return stats;
    }
}
