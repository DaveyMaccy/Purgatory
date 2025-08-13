
/**
 * Sports Dialogue Pool - Athletic and Competition Conversations
 * Specialized dialogue pool for sports, games, athletics, and competitive discussions
 * 
 * TOPICS COVERED:
 * - Professional sports (NFL, NBA, MLB, etc.)
 * - Team discussions and loyalties
 * - Game results and statistics
 * - Athletic activities and fitness
 * - Competition and rivalry
 * - Fantasy sports and betting
 * 
 * RESPONSE PATTERNS:
 * - Team loyalty expressions
 * - Game analysis and predictions
 * - Athletic achievement discussions
 * - Competition enthusiasm
 * - Sports trivia and statistics
 * 
 * PERSONALITY ADAPTATIONS:
 * - Competitive personalities show more engagement
 * - Team-oriented characters focus on collaboration
 * - Casual fans stick to basic topics
 * - Athletic characters discuss personal fitness
 */

export class SportsDialoguePool {
    constructor() {
        // Sports topic triggers
        this.topicTriggers = {
            team: {
                keywords: ['team', 'roster', 'lineup', 'squad', 'franchise', 'organization'],
                responses: 'team_response',
                urgency: 'medium'
            },
            
            game: {
                keywords: ['game', 'match', 'championship', 'playoff', 'tournament', 'final'],
                responses: 'game_response',
                urgency: 'high'
            },
            
            player: {
                keywords: ['player', 'athlete', 'star', 'rookie', 'veteran', 'coach', 'manager'],
                responses: 'player_response',
                urgency: 'medium'
            },
            
            score: {
                keywords: ['score', 'points', 'goals', 'runs', 'stats', 'record', 'statistics'],
                responses: 'score_response',
                urgency: 'medium'
            },
            
            fitness: {
                keywords: ['workout', 'training', 'gym', 'exercise', 'fitness', 'health', 'conditioning'],
                responses: 'fitness_response',
                urgency: 'low'
            },
            
            prediction: {
                keywords: ['prediction', 'forecast', 'odds', 'betting', 'fantasy', 'draft', 'trade'],
                responses: 'prediction_response',
                urgency: 'medium'
            }
        };
        
        // Sports-specific sentence components (modular system)
        this.sportsComponents = {
            // Sports openings
            openings: {
                excited: ['Did you see that', 'Can you believe', 'Holy cow', 'No way', 'Incredible'],
                analytical: ['Looking at the stats', 'Based on performance', 'Considering the matchup', 'From what I saw'],
                casual: ['So about that', 'Speaking of sports', 'You follow', 'Been watching', 'Heard about'],
                competitive: ['We absolutely crushed', 'They got destroyed', 'What a domination', 'Total victory'],
                football_purist: ['Let me tell you about REAL football', 'Now, actual football', 'Speaking of proper football', 'In real football']
            },
            
            // Core sports content
            coreContent: {
                team_response: {
                    loyalty: ['that\'s my team right there', 'been a fan since day one', 'ride or die with them', 'through thick and thin'],
                    analysis: ['their defense is solid this year', 'the coaching staff made smart moves', 'chemistry is really clicking', 'depth chart looks strong'],
                    criticism: ['management needs to step up', 'some questionable calls lately', 'not living up to potential', 'needs better leadership'],
                    optimism: ['next season is our year', 'building something special', 'the future looks bright', 'great things coming']
                },
                
                game_response: {
                    excitement: ['what a game that was!', 'edge of my seat the whole time', 'instant classic', 'game for the ages'],
                    analysis: ['the key was that third quarter', 'momentum shifted completely', 'strategy paid off perfectly', 'execution was flawless'],
                    disappointment: ['tough loss to swallow', 'so close to victory', 'heartbreaking ending', 'missed opportunities'],
                    anticipation: ['can\'t wait for the next one', 'playoffs are going to be intense', 'this matchup is huge', 'championship implications']
                },
                
                player_response: {
                    praise: ['absolute legend', 'clutch performer', 'carrying the team', 'hall of fame material'],
                    concern: ['seems to be struggling', 'not the same player', 'needs to step up', 'disappointing season'],
                    potential: ['going to be special', 'raw talent is there', 'future superstar', 'just needs experience'],
                    comparison: ['reminds me of', 'similar playing style to', 'has that same energy as', 'following in the footsteps of']
                },
                
                soccer_response: {
                    purist: ['you mean REAL football, right?', 'the beautiful game as it should be called', 'proper football with actual feet', 'the world\'s game, not American rugby'],
                    passion: ['90 minutes of pure artistry', 'the passion of the fans is unmatched', 'tactics and skill combined perfectly', 'poetry in motion on the pitch'],
                    global: ['the only truly global sport', 'World Cup is the real championship', 'brings the whole world together', 'every country plays the beautiful game'],
                    technique: ['requires incredible skill and endurance', 'no hands makes it pure', 'artistry with just your feet', 'most creative sport in existence']
                },
                
                american_football_response: {
                    acceptance: ['American football has its merits', 'different kind of strategy game', 'impressive athleticism required', 'popular in its own right'],
                    comparison: ['quite different from real football', 'more like rugby with pads', 'strategic but less fluid', 'American version of the sport'],
                    begrudging: ['I suppose it\'s entertaining', 'not my cup of tea but I get it', 'different audience entirely', 'each to their own I guess']
                },
                
                fitness_response: {
                    motivation: ['time to hit the gym', 'getting back in shape', 'summer body prep', 'feeling motivated'],
                    routine: ['my usual workout is', 'been focusing on', 'trainer suggested', 'trying a new routine'],
                    results: ['seeing some progress', 'feeling stronger', 'endurance is improving', 'clothes fitting better'],
                    struggle: ['hard to stay consistent', 'motivation is lacking', 'need an accountability partner', 'making excuses lately']
                },
                
                prediction_response: {
                    confident: ['calling it now', 'mark my words', 'bet the house on', 'guaranteed victory'],
                    uncertain: ['could go either way', 'too close to call', 'depends on key factors', 'anyone\'s game'],
                    analytical: ['the numbers suggest', 'historical trends show', 'advanced metrics indicate', 'statistical advantage goes to'],
                    fantasy: ['my lineup is stacked', 'need a big performance from', 'streaming defense this week', 'waiver wire pickup']
                }
            },
            
        // Sports-specific transitions
        this.sportsComponents.transitions = {
            agreement: ['Absolutely!', 'You got that right!', 'Couldn\'t agree more!', 'Exactly what I was thinking!'],
            disagreement: ['I see it differently', 'Have to disagree there', 'Not buying that argument', 'Numbers tell a different story'],
            excitement: ['This is huge!', 'Game changer!', 'What a development!', 'Can\'t believe it!'],
            analysis: ['Here\'s the thing though', 'What\'s interesting is', 'The key factor is', 'Don\'t forget about'],
            football_correction: ['Actually, that\'s American football', 'You mean the sport with hands?', 'Real football is played with feet', 'Let\'s call it what it is - rugby with pads']
        };
        
        // Soccer/Football preference system
        this.footballPreference = {
            // Characters with these traits are more likely to insist on "real football"
            soccer_purist_traits: ['European', 'International', 'Cultured', 'Traditional', 'Purist'],
            // Probability of correcting "football" to mean soccer (0.0 to 1.0)
            correction_probability: 0.35, // 35% chance base rate
            // Phrases to use when correcting
            correction_phrases: [
                'You mean REAL football, right?',
                'Ah, you\'re talking about American rugby!',
                'Football is played with feet, not hands!',
                'The beautiful game, as it should be called!',
                'Proper football, not that American sport!',
                'Real football - the world\'s game!',
                'Football as the rest of the world knows it!'
            ]
        };
            
            // Sports closings
            closings: {
                enthusiastic: ['Go team!', 'Can\'t wait!', 'This is our year!', 'What a time to be a fan!'],
                analytical: ['We\'ll see how it plays out', 'Time will tell', 'Interesting to watch', 'Keep an eye on that'],
                casual: ['Should be fun to watch', 'Always entertaining', 'Good times ahead', 'Enjoy the game'],
                competitive: ['May the best team win', 'Bring on the competition', 'Game on!', 'Let\'s settle this on the field']
            }
        };
        
        // Sports conversation threading
        this.conversationThreads = new Map();
        this.sportingEvents = new Map();
        
        console.log('🏈 Sports Dialogue Pool initialized');
    }

    /**
     * Generate sports-related response
     * @param {string} incomingMessage - Message being responded to
     * @param {Object} character - Character generating response
     * @param {Object} context - Environmental and social context
     * @returns {string} - Generated sports dialogue
     */
    generateResponse(incomingMessage, character, context) {
        try {
            console.log(`🏈 Generating sports response for ${character.name}`);
            
            // Analyze message for sports triggers
            const triggerAnalysis = this.analyzeSportsMessage(incomingMessage);
            
            // Determine response type
            const responseType = this.determineSportsResponseType(triggerAnalysis, character, context);
            
            // Build response using modular components
            const response = this.constructSportsResponse(responseType, triggerAnalysis, character, context);
            
            console.log(`🏆 Sports response: "${response}"`);
            return response;
            
        } catch (error) {
            console.error(`Error generating sports response for ${character.name}:`, error);
            return this.getFallbackSportsResponse(character, incomingMessage);
        }
    }

    /**
     * Analyze incoming message for sports-related triggers
     * @param {string} message - Incoming message
     * @returns {Object} - Sports trigger analysis
     */
    analyzeSportsMessage(message) {
        const analysis = {
            originalMessage: message,
            detectedTriggers: [],
            sportType: 'general',
            intensity: 'medium',
            timeContext: 'general'
        };
        
        const messageLower = message.toLowerCase();
        
        // Detect specific sports
        const sportTypes = {
            american_football: ['nfl', 'quarterback', 'touchdown', 'fumble', 'american football'],
            basketball: ['basketball', 'nba', 'dunk', 'three-pointer', 'rebound'],
            baseball: ['baseball', 'mlb', 'home run', 'strikeout', 'pitcher'],
            soccer: ['soccer', 'football', 'goal', 'penalty', 'midfielder', 'fifa', 'world cup'],
            hockey: ['hockey', 'nhl', 'puck', 'goal', 'penalty'],
            tennis: ['tennis', 'serve', 'ace', 'match point', 'tournament'],
            golf: ['golf', 'birdie', 'par', 'tournament', 'course']
        };
        
        Object.entries(sportTypes).forEach(([sport, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.sportType = sport;
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
        
        // Determine intensity
        const excitementWords = ['amazing', 'incredible', 'unbelievable', 'awesome', 'fantastic'];
        const disappointmentWords = ['terrible', 'awful', 'disappointing', 'horrible', 'disaster'];
        
        if (excitementWords.some(word => messageLower.includes(word))) {
            analysis.intensity = 'high';
        } else if (disappointmentWords.some(word => messageLower.includes(word))) {
            analysis.intensity = 'low';
        }
        
        return analysis;
    }

    /**
     * Determine appropriate sports response type
     * @param {Object} triggerAnalysis - Analysis of incoming message
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Response type identifier
     */
    determineSportsResponseType(triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        
        // Special handling for football/soccer distinction
        if (triggerAnalysis.footballMention) {
            // Check if character is likely to be a soccer purist
            const isSoccerPurist = this.isSoccerPurist(personality);
            const shouldCorrect = Math.random() < this.getFootballCorrectionProbability(personality);
            
            if (isSoccerPurist && shouldCorrect) {
                return 'soccer_response'; // Will include correction dialogue
            } else if (triggerAnalysis.americanFootballContext) {
                return 'american_football_response';
            } else {
                return 'soccer_response';
            }
        }
        
        // Primary trigger-based routing
        if (triggerAnalysis.detectedTriggers.length > 0) {
            return triggerAnalysis.detectedTriggers[0].responseType;
        }
        
        // Personality-based defaults
        if (personality.includes('Competitive')) {
            return 'competitive_response';
        } else if (personality.includes('Analytical')) {
            return 'analytical_response';
        } else if (personality.includes('Enthusiastic')) {
            return 'excited_response';
        }
        
        // Fallback based on sports type
        return `${triggerAnalysis.sportType}_general_response`;
    }

    /**
     * Check if character is likely to be a soccer purist
     * @param {Array} personalityTags - Character's personality traits
     * @returns {boolean} - Whether character is likely to correct football usage
     */
    isSoccerPurist(personalityTags) {
        return this.footballPreference.soccer_purist_traits.some(trait => 
            personalityTags.includes(trait)
        ) || personalityTags.includes('Soccer Fan') || personalityTags.includes('International');
    }

    /**
     * Calculate probability of correcting "football" usage
     * @param {Array} personalityTags - Character's personality traits
     * @returns {number} - Probability (0.0 to 1.0)
     */
    getFootballCorrectionProbability(personalityTags) {
        let probability = this.footballPreference.correction_probability;
        
        // Increase probability for soccer purist traits
        if (this.isSoccerPurist(personalityTags)) {
            probability += 0.3;
        }
        
        // Increase for pedantic or argumentative personalities
        if (personalityTags.includes('Pedantic') || personalityTags.includes('Argumentative')) {
            probability += 0.2;
        }
        
        // Increase for passionate personalities
        if (personalityTags.includes('Passionate') || personalityTags.includes('Opinionated')) {
            probability += 0.15;
        }
        
        // Decrease for polite or diplomatic personalities
        if (personalityTags.includes('Polite') || personalityTags.includes('Diplomatic')) {
            probability -= 0.2;
        }
        
        return Math.min(1.0, Math.max(0.0, probability));
    }

    /**
     * Construct sports response using modular components
     * @param {string} responseType - Type of response to generate
     * @param {Object} triggerAnalysis - Trigger analysis
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Constructed response
     */
    constructSportsResponse(responseType, triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        const components = this.sportsComponents;
        
        // Handle football/soccer correction
        if (triggerAnalysis.footballMention && responseType === 'soccer_response') {
            const isSoccerPurist = this.isSoccerPurist(personality);
            const shouldCorrect = Math.random() < this.getFootballCorrectionProbability(personality);
            
            if (isSoccerPurist && shouldCorrect) {
                // Start with a correction
                const correction = this.selectRandom(this.footballPreference.correction_phrases);
                const soccerContent = this.selectRandom(components.coreContent.soccer_response.purist);
                const enthusiasm = this.selectRandom(components.closings.enthusiastic);
                
                return `${correction} ${soccerContent}. ${enthusiasm}`;
            }
        }
        
        // Select opening based on personality and intensity
        let opening = '';
        if (triggerAnalysis.intensity === 'high') {
            opening = this.selectRandom(components.openings.excited);
        } else if (personality.includes('Analytical')) {
            opening = this.selectRandom(components.openings.analytical);
        } else if (personality.includes('Competitive')) {
            opening = this.selectRandom(components.openings.competitive);
        } else if (this.isSoccerPurist(personality) && triggerAnalysis.sportType === 'soccer') {
            opening = this.selectRandom(components.openings.football_purist);
        } else {
            opening = this.selectRandom(components.openings.casual);
        }
        
        // Select core content based on response type
        let coreContent = '';
        const responseCategory = responseType.split('_')[0]; // Extract category from responseType
        
        if (components.coreContent[responseType]) {
            const categoryOptions = components.coreContent[responseType];
            const subcategory = Object.keys(categoryOptions)[0]; // Use first subcategory as default
            coreContent = this.selectRandom(categoryOptions[subcategory]);
        } else {
            // Fallback content
            coreContent = 'that\'s really interesting';
        }
        
        // Select appropriate transition
        let transition = '';
        if (triggerAnalysis.footballMention && this.isSoccerPurist(personality)) {
            transition = this.selectRandom(components.transitions.football_correction);
        } else if (triggerAnalysis.intensity === 'high') {
            transition = this.selectRandom(components.transitions.excitement);
        } else {
            transition = this.selectRandom(components.transitions.agreement);
        }
        
        // Select closing based on personality
        let closing = '';
        if (personality.includes('Competitive')) {
            closing = this.selectRandom(components.closings.competitive);
        } else if (personality.includes('Analytical')) {
            closing = this.selectRandom(components.closings.analytical);
        } else if (triggerAnalysis.intensity === 'high') {
            closing = this.selectRandom(components.closings.enthusiastic);
        } else {
            closing = this.selectRandom(components.closings.casual);
        }
        
        // Combine components into natural response
        return `${opening} ${coreContent}. ${transition} ${closing}`;
    }

    /**
     * Generate fallback sports response
     * @param {Object} character - Character object
     * @param {string} originalMessage - Original message
     * @returns {string} - Fallback response
     */
    getFallbackSportsResponse(character, originalMessage) {
        const fallbacks = [
            "I don't follow sports that closely, but sounds exciting!",
            "Not really my area, but I can appreciate the enthusiasm!",
            "Sports aren't really my thing, but good for you!",
            "I should probably pay more attention to sports.",
            "You seem to know way more about this than I do!"
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
            name: 'Sports Dialogue Pool',
            triggerCategories: Object.keys(this.topicTriggers).length,
            componentCategories: Object.keys(this.sportsComponents).length,
            totalResponses: Object.values(this.sportsComponents.coreContent)
                .reduce((total, category) => total + Object.keys(category).length, 0),
            activeThreads: this.conversationThreads.size
        };
    }
}
