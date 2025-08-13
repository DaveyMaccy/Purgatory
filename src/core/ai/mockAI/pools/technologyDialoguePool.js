/**
 * Technology Dialogue Pool - Tech and Digital Conversations
 * Specialized dialogue pool for technology, gadgets, software, and digital trends
 * 
 * TOPICS COVERED:
 * - Consumer electronics and gadgets
 * - Software applications and platforms
 * - Programming and development
 * - Social media and digital culture
 * - Gaming and entertainment tech
 * - Productivity tools and workflows
 * - Tech news and industry trends
 * - Troubleshooting and tech support
 * 
 * RESPONSE PATTERNS:
 * - Product recommendations and reviews
 * - Technical problem-solving assistance
 * - Feature comparisons and analysis
 * - Industry trend discussions
 * - User experience sharing
 * - Learning and skill development
 * 
 * PERSONALITY ADAPTATIONS:
 * - Tech enthusiasts show deeper knowledge
 * - Practical users focus on functionality
 * - Security-conscious characters emphasize privacy
 * - Creative types discuss design and UX
 */

export class TechnologyDialoguePool {
    constructor() {
        // Technology topic triggers
        this.topicTriggers = {
            devices: {
                keywords: ['phone', 'laptop', 'computer', 'tablet', 'watch', 'device', 'gadget'],
                responses: 'devices_response',
                urgency: 'medium'
            },
            
            software: {
                keywords: ['app', 'application', 'software', 'program', 'platform', 'tool', 'update'],
                responses: 'software_response',
                urgency: 'medium'
            },
            
            programming: {
                keywords: ['code', 'programming', 'developer', 'coding', 'language', 'framework', 'api'],
                responses: 'programming_response',
                urgency: 'low'
            },
            
            social_media: {
                keywords: ['social media', 'facebook', 'twitter', 'instagram', 'tiktok', 'linkedin', 'post'],
                responses: 'social_media_response',
                urgency: 'medium'
            },
            
            gaming: {
                keywords: ['game', 'gaming', 'console', 'pc gaming', 'mobile game', 'esports', 'stream'],
                responses: 'gaming_response',
                urgency: 'medium'
            },
            
            productivity: {
                keywords: ['productivity', 'workflow', 'automation', 'efficiency', 'organize', 'manage'],
                responses: 'productivity_response',
                urgency: 'medium'
            },
            
            troubleshooting: {
                keywords: ['problem', 'issue', 'bug', 'error', 'crash', 'broken', 'help', 'fix'],
                responses: 'troubleshooting_response',
                urgency: 'high'
            },
            
            trends: {
                keywords: ['ai', 'artificial intelligence', 'blockchain', 'crypto', 'vr', 'ar', 'future'],
                responses: 'trends_response',
                urgency: 'low'
            }
        };
        
        // Technology-specific sentence components (modular system)
        this.techComponents = {
            // Tech conversation openings
            openings: {
                enthusiastic: ['This is so cool', 'You have to check out', 'Just discovered', 'Amazing new feature'],
                helpful: ['I can help with that', 'Here\'s what worked for me', 'Try this solution', 'Let me walk you through'],
                curious: ['Have you tried', 'What do you think about', 'Curious about your experience with', 'How are you finding'],
                analytical: ['Looking at the specs', 'Based on the reviews', 'Comparing the options', 'From a technical standpoint']
            },
            
            // Core technology content
            coreContent: {
                devices_response: {
                    features: ['battery life is impressive', 'camera quality is outstanding', 'performance is smooth', 'build quality feels premium'],
                    comparison: ['better than the previous version', 'competitive with other brands', 'good value for the price', 'different approach to the problem'],
                    experience: ['love the user interface', 'learning curve isn\'t too steep', 'integrates well with other devices', 'daily driver for sure'],
                    recommendation: ['definitely worth considering', 'depends on your use case', 'great for certain workflows', 'might want to wait for the next version']
                },
                
                software_response: {
                    functionality: ['streamlines the workflow', 'intuitive design makes it easy', 'powerful features under the hood', 'customization options are extensive'],
                    performance: ['runs smoothly on my system', 'occasional bugs but overall stable', 'resource usage is reasonable', 'updates have improved things'],
                    integration: ['works well with other tools', 'sync across devices is seamless', 'plugins extend functionality', 'ecosystem is well-developed'],
                    learning: ['documentation is helpful', 'community support is strong', 'tutorials make it accessible', 'keyboard shortcuts save time']
                },
                
                programming_response: {
                    language: ['syntax is clean and readable', 'learning curve varies by background', 'community resources are excellent', 'great for certain types of projects'],
                    tools: ['development environment is crucial', 'debugging tools have improved', 'version control integration works well', 'testing frameworks are mature'],
                    career: ['in-demand skill in the market', 'constantly evolving field', 'problem-solving skills transfer', 'collaborative aspect is rewarding'],
                    projects: ['start with small projects', 'open source contributions help', 'building a portfolio takes time', 'real-world experience is valuable']
                },
                
                social_media_response: {
                    usage: ['great for staying connected', 'discovering new content', 'following interests and hobbies', 'professional networking tool'],
                    concerns: ['privacy settings are important', 'information overload can happen', 'time management is crucial', 'digital wellness matters'],
                    trends: ['algorithms shape what we see', 'content creation opportunities', 'communities form around interests', 'influence on society is significant'],
                    balance: ['moderation is key', 'real connections still matter', 'taking breaks is healthy', 'mindful consumption helps']
                },
                
                gaming_response: {
                    entertainment: ['great way to unwind', 'storytelling has really evolved', 'multiplayer experiences are fun', 'visual fidelity is incredible'],
                    community: ['online friendships are real', 'competitive scene is exciting', 'streaming culture is interesting', 'shared experiences bond people'],
                    technology: ['hardware requirements keep increasing', 'cloud gaming is promising', 'VR opens new possibilities', 'mobile gaming is accessible'],
                    skills: ['hand-eye coordination improves', 'strategic thinking develops', 'teamwork skills transfer', 'problem-solving under pressure']
                },
                
                productivity_response: {
                    tools: ['finding the right system matters', 'automation saves so much time', 'integration between tools helps', 'simple solutions often work best'],
                    habits: ['consistency is more important than perfection', 'small improvements compound', 'regular reviews help adjust', 'flexibility prevents burnout'],
                    workflows: ['everyone\'s needs are different', 'experimentation helps find what works', 'balance structure with spontaneity', 'technology should serve you'],
                    results: ['measurable improvements motivate', 'stress reduction is valuable', 'more time for important things', 'sense of control increases']
                },
                
                troubleshooting_response: {
                    approach: ['start with the basics', 'restart often fixes things', 'check for recent changes', 'search error messages online'],
                    resources: ['documentation usually helps', 'community forums are goldmines', 'video tutorials can clarify', 'support channels exist for a reason'],
                    patience: ['technical issues are frustrating', 'step-by-step approach works', 'backup important data first', 'sometimes it\'s not your fault'],
                    learning: ['troubleshooting builds skills', 'understanding systems helps', 'common problems have known solutions', 'experience makes it easier']
                },
                
                trends_response: {
                    innovation: ['rapid pace of change', 'exciting possibilities ahead', 'some overhyped but others transformative', 'adoption takes time'],
                    impact: ['will change how we work', 'societal implications are significant', 'ethical considerations matter', 'need thoughtful regulation'],
                    adoption: ['early adopters take risks', 'mainstream adoption follows', 'practical applications emerge', 'cost decreases over time'],
                    future: ['hard to predict specifics', 'general direction seems clear', 'prepare for continuous change', 'human element remains important']
                }
            },
            
            // Tech-specific transitions
            transitions: {
                agreement: ['Absolutely!', 'You\'re totally right!', 'I completely agree!', 'That\'s spot on!'],
                experience: ['In my experience', 'I\'ve found that', 'From what I\'ve seen', 'My take on it is'],
                suggestion: ['You might want to try', 'Have you considered', 'Another option is', 'What about'],
                technical: ['The technical side is', 'From a development perspective', 'Looking at the architecture', 'Implementation-wise']
            },
            
            // Tech conversation closings
            closings: {
                helpful: ['Hope that helps!', 'Let me know if you need more info!', 'Feel free to ask if you get stuck!', 'Happy to troubleshoot further!'],
                enthusiastic: ['Technology is so exciting!', 'Can\'t wait to see what\'s next!', 'The future is going to be amazing!', 'Love how tech keeps evolving!'],
                practical: ['At the end of the day, it\'s about utility.', 'Use what works for you.', 'Technology should make life easier.', 'Find the right tool for the job.'],
                cautious: ['Always good to research before buying.', 'Privacy and security matter.', 'Don\'t believe all the hype.', 'Sometimes simple solutions are best.']
            }
        };
        
        // Tech expertise tracking
        this.techExpertise = new Map();
        this.troubleshootingHistory = new Map();
        
        console.log('💻 Technology Dialogue Pool initialized');
    }

    /**
     * Generate technology-related response
     * @param {string} incomingMessage - Message being responded to
     * @param {Object} character - Character generating response
     * @param {Object} context - Environmental and social context
     * @returns {string} - Generated technology dialogue
     */
    generateResponse(incomingMessage, character, context) {
        try {
            console.log(`💻 Generating tech response for ${character.name}`);
            
            // Analyze message for tech triggers
            const triggerAnalysis = this.analyzeTechMessage(incomingMessage);
            
            // Determine response type
            const responseType = this.determineTechResponseType(triggerAnalysis, character, context);
            
            // Build response using modular components
            const response = this.constructTechResponse(responseType, triggerAnalysis, character, context);
            
            console.log(`⚡ Tech response: "${response}"`);
            return response;
            
        } catch (error) {
            console.error(`Error generating tech response for ${character.name}:`, error);
            return this.getFallbackTechResponse(character, incomingMessage);
        }
    }

    /**
     * Analyze incoming message for technology-related triggers
     * @param {string} message - Incoming message
     * @returns {Object} - Technology trigger analysis
     */
    analyzeTechMessage(message) {
        const analysis = {
            originalMessage: message,
            detectedTriggers: [],
            techCategory: 'general',
            complexityLevel: 'intermediate',
            problemSolving: false
        };
        
        const messageLower = message.toLowerCase();
        
        // Detect tech categories
        const techCategories = {
            consumer: ['phone', 'laptop', 'tablet', 'headphones', 'smart watch'],
            enterprise: ['server', 'database', 'network', 'security', 'cloud'],
            development: ['programming', 'coding', 'framework', 'api', 'github'],
            creative: ['design', 'video', 'photo', 'music', 'content creation'],
            emerging: ['ai', 'blockchain', 'vr', 'ar', 'iot', 'machine learning']
        };
        
        Object.entries(techCategories).forEach(([category, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.techCategory = category;
            }
        });
        
        // Detect complexity level
        const complexityIndicators = {
            basic: ['simple', 'easy', 'basic', 'beginner', 'new to'],
            intermediate: ['learning', 'trying', 'working with', 'using'],
            advanced: ['optimizing', 'customizing', 'developing', 'architecting', 'enterprise']
        };
        
        Object.entries(complexityIndicators).forEach(([level, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.complexityLevel = level;
            }
        });
        
        // Detect problem-solving context
        const problemWords = ['problem', 'issue', 'broken', 'error', 'help', 'stuck', 'trouble'];
        analysis.problemSolving = problemWords.some(word => messageLower.includes(word));
        
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
     * Determine appropriate technology response type
     * @param {Object} triggerAnalysis - Analysis of incoming message
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Response type identifier
     */
    determineTechResponseType(triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        
        // Problem-solving takes priority
        if (triggerAnalysis.problemSolving) {
            return 'troubleshooting_response';
        }
        
        // Primary trigger-based routing
        if (triggerAnalysis.detectedTriggers.length > 0) {
            return triggerAnalysis.detectedTriggers[0].responseType;
        }
        
        // Personality-based defaults
        if (personality.includes('Tech-savvy') || personality.includes('Analytical')) {
            return 'software_response';
        } else if (personality.includes('Creative')) {
            return 'devices_response';
        } else if (personality.includes('Helpful')) {
            return 'troubleshooting_response';
        } else if (personality.includes('Future-focused')) {
            return 'trends_response';
        }
        
        // Fallback based on tech category
        return `${triggerAnalysis.techCategory}_response`;
    }

    /**
     * Construct technology response using modular components
     * @param {string} responseType - Type of response to generate
     * @param {Object} triggerAnalysis - Trigger analysis
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Constructed response
     */
    constructTechResponse(responseType, triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        const components = this.techComponents;
        
        // Select opening based on personality and context
        let opening = '';
        if (triggerAnalysis.problemSolving) {
            opening = this.selectRandom(components.openings.helpful);
        } else if (personality.includes('Enthusiastic') || personality.includes('Tech-savvy')) {
            opening = this.selectRandom(components.openings.enthusiastic);
        } else if (personality.includes('Analytical')) {
            opening = this.selectRandom(components.openings.analytical);
        } else {
            opening = this.selectRandom(components.openings.curious);
        }
        
        // Select core content based on response type
        let coreContent = '';
        if (components.coreContent[responseType]) {
            const categoryOptions = components.coreContent[responseType];
            const subcategory = Object.keys(categoryOptions)[0]; // Use first subcategory as default
            coreContent = this.selectRandom(categoryOptions[subcategory]);
        } else {
            // Fallback content
            coreContent = 'technology continues to evolve rapidly';
        }
        
        // Select appropriate transition
        let transition = '';
        if (triggerAnalysis.complexityLevel === 'advanced') {
            transition = this.selectRandom(components.transitions.technical);
        } else if (personality.includes('Helpful')) {
            transition = this.selectRandom(components.transitions.suggestion);
        } else {
            transition = this.selectRandom(components.transitions.experience);
        }
        
        // Select closing based on personality and context
        let closing = '';
        if (triggerAnalysis.problemSolving) {
            closing = this.selectRandom(components.closings.helpful);
        } else if (personality.includes('Enthusiastic')) {
            closing = this.selectRandom(components.closings.enthusiastic);
        } else if (personality.includes('Cautious') || personality.includes('Security-conscious')) {
            closing = this.selectRandom(components.closings.cautious);
        } else {
            closing = this.selectRandom(components.closings.practical);
        }
        
        // Combine components into natural response
        return `${opening} ${coreContent}. ${transition} ${closing}`;
    }

    /**
     * Generate fallback technology response
     * @param {Object} character - Character object
     * @param {string} originalMessage - Original message
     * @returns {string} - Fallback response
     */
    getFallbackTechResponse(character, originalMessage) {
        const fallbacks = [
            "Technology moves so fast these days!",
            "I should probably keep up with tech trends better.",
            "You seem to know way more about this than I do!",
            "Technology can be both amazing and overwhelming.",
            "Always learning something new about tech!"
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
     * Get pool statistics for debugging
     * @returns {Object} - Pool statistics
     */
    getPoolStats() {
        return {
            name: 'Technology Dialogue Pool',
            triggerCategories: Object.keys(this.topicTriggers).length,
            componentCategories: Object.keys(this.techComponents).length,
            totalResponses: Object.values(this.techComponents.coreContent)
                .reduce((total, category) => total + Object.keys(category).length, 0),
            expertiseTracked: this.techExpertise.size,
            troubleshootingSessions: this.troubleshootingHistory.size
        };
    }
}
