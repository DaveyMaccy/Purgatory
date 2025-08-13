/**
 * Hobbies Dialogue Pool - Personal Interests and Creative Activities
 * Specialized dialogue pool for hobbies, crafts, personal projects, and creative pursuits
 * 
 * TOPICS COVERED:
 * - Crafting and DIY projects
 * - Collecting (stamps, coins, etc.)
 * - Gardening and plants
 * - Cooking and baking
 * - Art and creative expression
 * - Reading and learning
 * - Music and instruments
 * - Photography and visual arts
 * 
 * RESPONSE PATTERNS:
 * - Passion and enthusiasm sharing
 * - Project progress updates
 * - Tips and advice exchange
 * - Supply and tool discussions
 * - Achievement celebrations
 * - Problem-solving help
 * 
 * PERSONALITY ADAPTATIONS:
 * - Creative personalities show more artistic focus
 * - Organized characters discuss systematic approaches
 * - Social types share and collaborate more
 * - Perfectionist types focus on quality and detail
 */

export class HobbiesDialoguePool {
    constructor() {
        // Hobby topic triggers
        this.topicTriggers = {
            crafting: {
                keywords: ['craft', 'diy', 'handmade', 'project', 'build', 'make', 'create'],
                responses: 'crafting_response',
                urgency: 'medium'
            },
            
            collecting: {
                keywords: ['collect', 'collection', 'rare', 'vintage', 'antique', 'find', 'hunt'],
                responses: 'collecting_response',
                urgency: 'medium'
            },
            
            gardening: {
                keywords: ['garden', 'plant', 'grow', 'flower', 'vegetable', 'soil', 'bloom'],
                responses: 'gardening_response',
                urgency: 'low'
            },
            
            cooking: {
                keywords: ['cook', 'bake', 'recipe', 'kitchen', 'ingredient', 'dish', 'flavor'],
                responses: 'cooking_response',
                urgency: 'medium'
            },
            
            art: {
                keywords: ['art', 'paint', 'draw', 'sketch', 'canvas', 'brush', 'create'],
                responses: 'art_response',
                urgency: 'medium'
            },
            
            reading: {
                keywords: ['read', 'book', 'novel', 'author', 'story', 'chapter', 'library'],
                responses: 'reading_response',
                urgency: 'low'
            },
            
            music: {
                keywords: ['music', 'instrument', 'play', 'song', 'melody', 'practice', 'perform'],
                responses: 'music_response',
                urgency: 'medium'
            },
            
            photography: {
                keywords: ['photo', 'camera', 'picture', 'shot', 'lens', 'exposure', 'capture'],
                responses: 'photography_response',
                urgency: 'medium'
            }
        };
        
        // Hobby-specific sentence components (modular system)
        this.hobbyComponents = {
            // Hobby openings
            openings: {
                excited: ['I\'m so excited about', 'Just started working on', 'Can\'t wait to show you', 'You won\'t believe'],
                sharing: ['I\'ve been working on', 'Want to see what I made', 'Check out my latest', 'Been experimenting with'],
                seeking: ['Looking for advice on', 'Anyone know about', 'Need some help with', 'Trying to figure out'],
                accomplished: ['Just finished', 'Finally completed', 'So proud of', 'Managed to create']
            },
            
            // Core hobby content
            coreContent: {
                crafting_response: {
                    materials: ['found these amazing supplies', 'the wood grain is perfect', 'this fabric has great texture', 'quality materials make all the difference'],
                    process: ['taking my time with each step', 'following the pattern carefully', 'improvising as I go', 'learning new techniques'],
                    challenges: ['trickier than it looks', 'made a few mistakes', 'need to practice more', 'patience is key'],
                    satisfaction: ['so rewarding to make something yourself', 'love working with my hands', 'therapeutic and relaxing', 'each piece is unique']
                },
                
                collecting_response: {
                    discovery: ['found an incredible piece', 'stumbled across something special', 'couldn\'t believe my luck', 'rare find at the market'],
                    knowledge: ['the history behind this is fascinating', 'dating back to the 1940s', 'only a few of these exist', 'condition is everything'],
                    hunt: ['been searching for this for years', 'finally tracked one down', 'the thrill of the hunt', 'you never know what you\'ll find'],
                    community: ['met other collectors', 'learned so much from experts', 'trading stories and pieces', 'passionate community']
                },
                
                gardening_response: {
                    growth: ['watching things grow is magical', 'new shoots are coming up', 'blooms are starting to open', 'harvest time is approaching'],
                    care: ['watering schedule is crucial', 'soil needs good drainage', 'pruning makes a big difference', 'patience with the seasons'],
                    planning: ['designing the layout', 'choosing the right varieties', 'companion planting works well', 'thinking ahead to next year'],
                    connection: ['so peaceful being outside', 'closer to nature', 'therapeutic digging in dirt', 'cycle of life is beautiful']
                },
                
                cooking_response: {
                    experimentation: ['trying a new recipe', 'improvising with ingredients', 'fusion of different styles', 'making it my own'],
                    technique: ['timing is everything', 'seasoning to taste', 'proper knife skills matter', 'temperature control is key'],
                    sharing: ['cooking for friends and family', 'love seeing people enjoy it', 'food brings people together', 'sharing recipes and tips'],
                    discovery: ['flavors complement each other', 'learned this from grandma', 'inspired by travel', 'fresh ingredients make all the difference']
                },
                
                art_response: {
                    inspiration: ['inspired by the light today', 'capturing a moment', 'expressing something deep', 'seeing beauty everywhere'],
                    technique: ['working on my brushwork', 'experimenting with color', 'trying different mediums', 'developing my style'],
                    process: ['lost track of time creating', 'each stroke has meaning', 'layer by layer building up', 'sometimes it just flows'],
                    emotion: ['art is emotional release', 'expressing what words can\'t', 'therapeutic and healing', 'connecting with something bigger']
                },
                
                reading_response: {
                    engagement: ['completely absorbed in this book', 'can\'t put it down', 'staying up too late reading', 'lost in another world'],
                    discovery: ['learned something fascinating', 'new perspective on things', 'author has incredible insight', 'research is amazing'],
                    recommendation: ['you have to read this', 'right up your alley', 'reminded me of you', 'life-changing book'],
                    discussion: ['what did you think about', 'the ending was unexpected', 'character development was brilliant', 'themes really resonate']
                },
                
                music_response: {
                    practice: ['been practicing this piece', 'working on my technique', 'muscle memory is developing', 'getting the rhythm down'],
                    performance: ['played for some friends', 'nerve-wracking but exciting', 'music brings joy to others', 'sharing the gift of music'],
                    learning: ['taking lessons with', 'watching online tutorials', 'learning by ear', 'theory is finally clicking'],
                    emotion: ['music speaks to the soul', 'expressing feelings through sound', 'therapeutic and uplifting', 'universal language']
                },
                
                photography_response: {
                    capture: ['caught the perfect moment', 'lighting was just right', 'composition really works', 'timing is everything'],
                    technical: ['experimenting with settings', 'new lens makes a difference', 'editing brings out details', 'learning about exposure'],
                    subjects: ['people have amazing stories', 'nature provides endless inspiration', 'urban scenes are fascinating', 'macro reveals hidden worlds'],
                    sharing: ['excited to share these shots', 'feedback helps me improve', 'photography connects people', 'moments become memories']
                }
            },
            
            // Hobby-specific transitions
            transitions: {
                enthusiasm: ['I absolutely love', 'So passionate about', 'Nothing beats', 'Gets me excited every time'],
                learning: ['Still learning', 'Always discovering', 'Picking up new tricks', 'Growing my skills'],
                sharing: ['Want to try it?', 'Happy to show you', 'We should do this together', 'I can teach you'],
                reflection: ['It\'s funny how', 'What I love most is', 'The thing about hobbies', 'People don\'t realize']
            },
            
            // Hobby closings
            closings: {
                encouraging: ['You should give it a try!', 'Everyone needs a creative outlet!', 'It\'s never too late to start!', 'You might surprise yourself!'],
                inviting: ['Want to see my workshop?', 'Come by and check it out!', 'Let\'s plan a project together!', 'I\'d love to show you sometime!'],
                content: ['Such a rewarding hobby.', 'Keeps me busy and happy.', 'Best stress relief ever.', 'Love having something that\'s just mine.'],
                philosophical: ['Life needs more than just work.', 'Hobbies feed the soul.', 'Everyone should have a passion.', 'Creating things makes us human.']
            }
        };
        
        // Hobby expertise tracking
        this.hobbyExpertise = new Map();
        this.projectProgress = new Map();
        
        console.log('🎨 Hobbies Dialogue Pool initialized');
    }

    /**
     * Generate hobby-related response
     * @param {string} incomingMessage - Message being responded to
     * @param {Object} character - Character generating response
     * @param {Object} context - Environmental and social context
     * @returns {string} - Generated hobby dialogue
     */
    generateResponse(incomingMessage, character, context) {
        try {
            console.log(`🎨 Generating hobby response for ${character.name}`);
            
            // Analyze message for hobby triggers
            const triggerAnalysis = this.analyzeHobbyMessage(incomingMessage);
            
            // Determine response type
            const responseType = this.determineHobbyResponseType(triggerAnalysis, character, context);
            
            // Build response using modular components
            const response = this.constructHobbyResponse(responseType, triggerAnalysis, character, context);
            
            console.log(`🏆 Hobby response: "${response}"`);
            return response;
            
        } catch (error) {
            console.error(`Error generating hobby response for ${character.name}:`, error);
            return this.getFallbackHobbyResponse(character, incomingMessage);
        }
    }

    /**
     * Analyze incoming message for hobby-related triggers
     * @param {string} message - Incoming message
     * @returns {Object} - Hobby trigger analysis
     */
    analyzeHobbyMessage(message) {
        const analysis = {
            originalMessage: message,
            detectedTriggers: [],
            hobbyType: 'general',
            skillLevel: 'intermediate',
            timeInvestment: 'moderate'
        };
        
        const messageLower = message.toLowerCase();
        
        // Detect specific hobby types
        const hobbyCategories = {
            creative: ['art', 'paint', 'draw', 'craft', 'design', 'create'],
            active: ['garden', 'build', 'woodwork', 'photography', 'cooking'],
            intellectual: ['read', 'write', 'research', 'study', 'learn'],
            technical: ['programming', 'electronics', 'mechanic', 'engineering'],
            social: ['music', 'perform', 'teach', 'share', 'collaborate']
        };
        
        Object.entries(hobbyCategories).forEach(([category, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.hobbyType = category;
            }
        });
        
        // Detect skill level indicators
        const skillIndicators = {
            beginner: ['just started', 'new to', 'learning', 'first time', 'beginner'],
            intermediate: ['been doing', 'getting better', 'practicing', 'improving'],
            advanced: ['expert', 'years of', 'master', 'professional', 'teach others']
        };
        
        Object.entries(skillIndicators).forEach(([level, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.skillLevel = level;
            }
        });
        
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
     * Determine appropriate hobby response type
     * @param {Object} triggerAnalysis - Analysis of incoming message
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Response type identifier
     */
    determineHobbyResponseType(triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        
        // Primary trigger-based routing
        if (triggerAnalysis.detectedTriggers.length > 0) {
            return triggerAnalysis.detectedTriggers[0].responseType;
        }
        
        // Personality-based defaults
        if (personality.includes('Creative')) {
            return 'art_response';
        } else if (personality.includes('Organized')) {
            return 'collecting_response';
        } else if (personality.includes('Patient')) {
            return 'gardening_response';
        } else if (personality.includes('Social')) {
            return 'music_response';
        }
        
        // Fallback based on hobby type
        return `${triggerAnalysis.hobbyType}_general_response`;
    }

    /**
     * Construct hobby response using modular components
     * @param {string} responseType - Type of response to generate
     * @param {Object} triggerAnalysis - Trigger analysis
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Constructed response
     */
    constructHobbyResponse(responseType, triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        const components = this.hobbyComponents;
        
        // Select opening based on personality and skill level
        let opening = '';
        if (personality.includes('Enthusiastic') || triggerAnalysis.skillLevel === 'advanced') {
            opening = this.selectRandom(components.openings.excited);
        } else if (personality.includes('Social')) {
            opening = this.selectRandom(components.openings.sharing);
        } else if (triggerAnalysis.skillLevel === 'beginner') {
            opening = this.selectRandom(components.openings.seeking);
        } else {
            opening = this.selectRandom(components.openings.accomplished);
        }
        
        // Select core content based on response type
        let coreContent = '';
        if (components.coreContent[responseType]) {
            const categoryOptions = components.coreContent[responseType];
            const subcategory = Object.keys(categoryOptions)[0]; // Use first subcategory as default
            coreContent = this.selectRandom(categoryOptions[subcategory]);
        } else {
            // Fallback content
            coreContent = 'it\'s such a rewarding hobby';
        }
        
        // Select appropriate transition
        let transition = '';
        if (personality.includes('Social')) {
            transition = this.selectRandom(components.transitions.sharing);
        } else if (triggerAnalysis.skillLevel === 'beginner') {
            transition = this.selectRandom(components.transitions.learning);
        } else {
            transition = this.selectRandom(components.transitions.enthusiasm);
        }
        
        // Select closing based on personality
        let closing = '';
        if (personality.includes('Social') || personality.includes('Encouraging')) {
            closing = this.selectRandom(components.closings.encouraging);
        } else if (personality.includes('Organized')) {
            closing = this.selectRandom(components.closings.inviting);
        } else if (personality.includes('Philosophical')) {
            closing = this.selectRandom(components.closings.philosophical);
        } else {
            closing = this.selectRandom(components.closings.content);
        }
        
        // Combine components into natural response
        return `${opening} ${coreContent}. ${transition} ${closing}`;
    }

    /**
     * Generate fallback hobby response
     * @param {Object} character - Character object
     * @param {string} originalMessage - Original message
     * @returns {string} - Fallback response
     */
    getFallbackHobbyResponse(character, originalMessage) {
        const fallbacks = [
            "That sounds like a really interesting hobby!",
            "I should pick up a new hobby myself.",
            "It's great that you have something you're passionate about!",
            "I admire people who are creative and hands-on.",
            "Hobbies are so important for a balanced life."
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
            name: 'Hobbies Dialogue Pool',
            triggerCategories: Object.keys(this.topicTriggers).length,
            componentCategories: Object.keys(this.hobbyComponents).length,
            totalResponses: Object.values(this.hobbyComponents.coreContent)
                .reduce((total, category) => total + Object.keys(category).length, 0),
            expertiseTracked: this.hobbyExpertise.size,
            activeProjects: this.projectProgress.size
        };
    }
}
