/**
 * Banter Dialogue Pool - Humor and Playful Conversation Specialist
 * Handles humorous, teasing, and playful conversations
 * 
 * SPECIALIZED TOPICS:
 * - Jokes and humor exchange
 * - Playful teasing and friendly ribbing
 * - Sarcasm and witty comebacks
 * - Pop culture references and memes
 * - Absurd observations and random thoughts
 * - Wordplay and puns
 * - Friendly competitions and challenges
 * - Light-hearted complaints and exaggerations
 * 
 * CONVERSATION STYLES:
 * - Casual and irreverent
 * - Quick wit and clever responses
 * - Exaggerated reactions for effect
 * - Self-deprecating humor
 * - Observational comedy
 */

export class BanterDialoguePool {
    constructor() {
        // Banter-specific trigger words and responses
        this.banterTriggers = {
            joke: {
                keywords: ['joke', 'funny', 'hilarious', 'comedy', 'humor', 'laugh', 'haha', 'lol'],
                responses: 'humor_response',
                tone: 'playful'
            },
            
            sarcasm: {
                keywords: ['obviously', 'clearly', 'sure', 'right', 'totally', 'definitely'],
                responses: 'sarcastic_response',
                tone: 'sarcastic'
            },
            
            absurd: {
                keywords: ['weird', 'strange', 'bizarre', 'random', 'crazy', 'ridiculous', 'nuts'],
                responses: 'absurd_response',
                tone: 'silly'
            },
            
            complaint_light: {
                keywords: ['ugh', 'seriously', 'come on', 'really', 'why', 'annoying'],
                responses: 'playful_complaint_response',
                tone: 'exaggerated'
            },
            
            competition: {
                keywords: ['better', 'best', 'win', 'beat', 'challenge', 'compete', 'versus'],
                responses: 'competitive_banter_response',
                tone: 'competitive'
            },
            
            pop_culture: {
                keywords: ['movie', 'show', 'meme', 'internet', 'viral', 'trending', 'celebrity'],
                responses: 'pop_culture_response',
                tone: 'reference'
            },
            
            self_deprecating: {
                keywords: ['I suck', 'I\'m terrible', 'I failed', 'I\'m bad', 'mess up'],
                responses: 'self_deprecating_response',
                tone: 'supportive_banter'
            },
            
            wordplay: {
                keywords: ['pun', 'word', 'play', 'clever', 'witty', 'smart'],
                responses: 'wordplay_response',
                tone: 'clever'
            }
        };
        
        // Banter-specific sentence components
        this.banterComponents = {
            // Casual, playful openings
            openings: {
                playful: ['Oh please', 'Come on', 'Seriously?', 'No way', 'Get out of here', 'You\'re kidding'],
                sarcastic: ['Oh sure', 'Right', 'Obviously', 'Clearly', 'Of course', 'Naturally'],
                enthusiastic: ['Dude!', 'No way!', 'That\'s awesome!', 'Amazing!', 'Sweet!', 'Nice!'],
                teasing: ['Oh really?', 'Is that so?', 'Sure thing', 'If you say so', 'Uh-huh', 'Mm-hmm'],
                random: ['You know what?', 'Speaking of random', 'That reminds me', 'Funny thing', 'Plot twist']
            },
            
            // Core banter content
            coreContent: {
                humor_response: {
                    appreciation: ['that\'s actually pretty funny', 'okay that got me', 'not gonna lie, that\'s good', 'I see what you did there'],
                    building: ['and then there\'s the part where', 'plus you know what\'s even funnier', 'that reminds me of when'],
                    challenge: ['I\'ve got a better one', 'wait till you hear this', 'that\'s nothing compared to'],
                    groaning: ['that was terrible', 'wow, just wow', 'I can\'t even', 'that hurt my soul']
                },
                
                sarcastic_response: {
                    dry: ['well that\'s just fantastic', 'how wonderful for everyone', 'what a shocking development'],
                    exaggerated: ['absolutely groundbreaking', 'truly revolutionary thinking', 'never heard that before'],
                    playful: ['you\'re really onto something there', 'brilliant deduction', 'such insight'],
                    deadpan: ['I\'m sure that\'ll work out great', 'can\'t possibly go wrong', 'flawless plan']
                },
                
                absurd_response: {
                    agreement: ['the world has officially lost its mind', 'we\'re living in a simulation', 'nothing surprises me anymore'],
                    escalation: ['and that\'s not even the weirdest part', 'wait, it gets better', 'but have you considered'],
                    philosophical: ['what even is normal anymore', 'reality is overrated anyway', 'embrace the chaos'],
                    random: ['speaking of random, did you know', 'that\'s like when', 'reminds me of that time']
                },
                
                playful_complaint_response: {
                    solidarity: ['tell me about it', 'you\'re preaching to the choir', 'story of my life', 'I feel your pain'],
                    exaggeration: ['it\'s basically the end of the world', 'clearly a conspiracy', 'someone\'s out to get us'],
                    deflection: ['at least it\'s not as bad as', 'could be worse, could be', 'imagine if'],
                    humor: ['first world problems, am I right?', 'the struggle is real', 'such is life in paradise']
                },
                
                competitive_banter_response: {
                    confident: ['bring it on', 'you wish', 'in your dreams', 'not a chance'],
                    humble_brag: ['I mean, I don\'t like to brag, but', 'it\'s not my fault I\'m naturally gifted', 'some of us just have it'],
                    challenge_accepted: ['game on', 'you\'re on', 'let\'s see what you\'ve got', 'this should be interesting'],
                    trash_talk: ['that\'s adorable', 'cute confidence there', 'keep telling yourself that', 'sure, buddy']
                },
                
                pop_culture_response: {
                    reference: ['that\'s so last season', 'very 2020 of you', 'classic reference', 'I see you\'re a person of culture'],
                    meme: ['big mood', 'that\'s a whole vibe', 'this is fine', 'narrator: it was not fine'],
                    trending: ['everyone\'s talking about that', 'it\'s everywhere now', 'so hot right now', 'peak internet behavior'],
                    nostalgia: ['takes me back', 'simpler times', 'when life made sense', 'the good old days']
                },
                
                self_deprecating_response: {
                    reassurance: ['you\'re being way too hard on yourself', 'everyone has those moments', 'you\'re not alone in this'],
                    humor: ['join the club', 'welcome to my world', 'at least you\'re consistent', 'that\'s what makes you relatable'],
                    perspective: ['it\'s not that bad', 'could happen to anyone', 'we\'ve all been there', 'part of being human'],
                    building_up: ['you\'re actually pretty great at', 'don\'t sell yourself short', 'I\'ve seen you nail']
                },
                
                wordplay_response: {
                    appreciation: ['I see what you did there', 'clever wordsmith', 'that\'s some quality punning', 'wordplay game strong'],
                    groaning: ['that was painful', 'you should be ashamed', 'I can\'t believe you went there', 'truly terrible'],
                    building: ['and speaking of', 'that reminds me of', 'if we\'re doing this', 'well played, but'],
                    challenge: ['I can do better', 'amateur hour', 'watch and learn', 'hold my coffee']
                }
            },
            
            // Playful modifiers
            modifiers: {
                intensity: {
                    mild: ['just a little bit', 'somewhat', 'kinda', 'slightly', 'a tiny bit'],
                    medium: ['pretty much', 'definitely', 'totally', 'completely', 'absolutely'],
                    extreme: ['ridiculously', 'insanely', 'monumentally', 'spectacularly', 'epically']
                },
                
                attitude: {
                    cheeky: ['with zero shame', 'unapologetically', 'proudly', 'confidently', 'boldly'],
                    silly: ['in the most ridiculous way', 'absurdly', 'hilariously', 'randomly', 'chaotically'],
                    sassy: ['with attitude', 'like a boss', 'sassily', 'dramatically', 'fabulously'],
                    deadpan: ['with a straight face', 'completely seriously', 'without irony', 'earnestly', 'genuinely']
                },
                
                randomness: {
                    tangent: ['but here\'s the thing', 'plot twist', 'meanwhile', 'speaking of which', 'random thought'],
                    callback: ['like we discussed', 'going back to', 'circling back', 'as mentioned', 'remember when'],
                    escalation: ['and another thing', 'plus', 'also', 'not to mention', 'on top of that']
                }
            },
            
            // Casual endings
            endings: {
                questions: ['Right?', 'You feel me?', 'Am I wrong?', 'Don\'t you think?', 'Or is it just me?'],
                statements: ['Just saying.', 'That\'s all.', 'End of story.', 'Case closed.', 'Mic drop.'],
                continuations: ['But what do I know?', 'Your move.', 'Ball\'s in your court.', 'What\'s your take?'],
                random: ['Anyway...', 'So there\'s that.', 'Life\'s weird.', 'Such is life.', 'The world\'s crazy.'],
                challenges: ['Prove me wrong!', 'Change my mind!', 'Fight me!', 'Top that!', 'Your turn!']
            }
        };
        
        // Personality-based banter styles
        this.banterStyles = {
            'Extroverted': {
                openingPreference: 'enthusiastic',
                lengthMultiplier: 1.3,
                includeChallenge: 0.6
            },
            'Chaotic': {
                openingPreference: 'random',
                randomnessBonus: 0.8,
                tangentProbability: 0.7
            },
            'Lazy': {
                openingPreference: 'deadpan',
                effortLevel: 'minimal',
                sarcasmBonus: 0.5
            },
            'Gossip': {
                openingPreference: 'teasing',
                informationSeeking: 0.7,
                dramaEscalation: 0.6
            }
        };
        
        console.log('🎭 Banter Dialogue Pool initialized');
    }

    /**
     * Generate banter-appropriate response
     * @param {string} incomingMessage - Message to respond to
     * @param {Object} character - Character responding
     * @param {Object} context - Environmental and social context
     * @returns {string} - Playful, humorous response
     */
    generateResponse(incomingMessage, character, context) {
        try {
            // Analyze banter context
            const banterAnalysis = this.analyzeBanterContext(incomingMessage, context);
            
            // Determine banter response strategy
            const banterStrategy = this.determineBanterStrategy(character, banterAnalysis, context);
            
            // Build playful response
            const response = this.constructBanterResponse(character, banterAnalysis, banterStrategy);
            
            return response;
            
        } catch (error) {
            console.error('Error generating banter response:', error);
            return this.getBanterFallbackResponse(character, incomingMessage);
        }
    }

    /**
     * Analyze message for banter triggers and tone
     * @param {string} message - Incoming message
     * @param {Object} context - Full context
     * @returns {Object} - Banter analysis
     */
    analyzeBanterContext(message, context) {
        const analysis = {
            banterTriggers: [],
            humorLevel: 'mild',
            sarcasmDetected: false,
            playfulnessLevel: 'normal',
            randomnessDetected: false,
            competitiveElement: false,
            selfDeprecating: false
        };
        
        const messageLower = message.toLowerCase();
        
        // Detect banter triggers
        Object.entries(this.banterTriggers).forEach(([triggerName, triggerData]) => {
            const matches = triggerData.keywords.filter(keyword => 
                messageLower.includes(keyword.toLowerCase())
            );
            
            if (matches.length > 0) {
                analysis.banterTriggers.push({
                    type: triggerName,
                    matches: matches,
                    responseType: triggerData.responses,
                    tone: triggerData.tone
                });
            }
        });
        
        // Detect humor indicators
        const humorIndicators = ['haha', 'lol', 'funny', 'hilarious', '😂', 'lmao'];
        if (humorIndicators.some(indicator => messageLower.includes(indicator))) {
            analysis.humorLevel = 'high';
        }
        
        // Detect sarcasm (context clues)
        const sarcasmIndicators = ['obviously', 'clearly', 'sure', 'right', 'totally'];
        if (sarcasmIndicators.some(indicator => messageLower.includes(indicator))) {
            analysis.sarcasmDetected = true;
        }
        
        // Detect playfulness level
        const exclamationCount = (message.match(/!/g) || []).length;
        const questionCount = (message.match(/\?/g) || []).length;
        if (exclamationCount > 1 || questionCount > 1) {
            analysis.playfulnessLevel = 'high';
        }
        
        // Detect randomness
        const randomIndicators = ['random', 'weird', 'strange', 'bizarre'];
        if (randomIndicators.some(indicator => messageLower.includes(indicator))) {
            analysis.randomnessDetected = true;
        }
        
        // Detect competitive elements
        const competitiveWords = ['better', 'best', 'win', 'beat', 'challenge'];
        if (competitiveWords.some(word => messageLower.includes(word))) {
            analysis.competitiveElement = true;
        }
        
        // Detect self-deprecation
        const selfDepWords = ['I suck', 'I\'m terrible', 'I failed', 'I\'m bad'];
        if (selfDepWords.some(phrase => messageLower.includes(phrase))) {
            analysis.selfDeprecating = true;
        }
        
        return analysis;
    }

    /**
     * Determine banter response strategy
     * @param {Object} character - Character responding
     * @param {Object} banterAnalysis - Banter context analysis
     * @param {Object} context - Environmental context
     * @returns {Object} - Banter strategy
     */
    determineBanterStrategy(character, banterAnalysis, context) {
        const personality = character.personalityTags || [];
        const strategy = {
            tone: 'playful',
            humorStyle: 'gentle',
            length: 'medium',
            includeChallenge: false,
            sarcasmLevel: 'mild',
            randomness: 'low',
            competitiveness: 'friendly'
        };
        
        // Apply personality-based banter styles
        personality.forEach(trait => {
            const style = this.banterStyles[trait];
            if (style) {
                if (style.openingPreference) strategy.openingStyle = style.openingPreference;
                if (style.lengthMultiplier) strategy.lengthModifier = style.lengthMultiplier;
                if (style.includeChallenge && Math.random() < style.includeChallenge) {
                    strategy.includeChallenge = true;
                }
                if (style.sarcasmBonus) strategy.sarcasmLevel = 'medium';
                if (style.randomnessBonus) strategy.randomness = 'high';
            }
        });
        
        // Adjust based on banter analysis
        if (banterAnalysis.sarcasmDetected) {
            strategy.sarcasmLevel = 'medium';
            strategy.tone = 'sarcastic';
        }
        
        if (banterAnalysis.competitiveElement) {
            strategy.competitiveness = 'challenging';
            strategy.includeChallenge = true;
        }
        
        if (banterAnalysis.selfDeprecating) {
            strategy.tone = 'supportive_banter';
            strategy.humorStyle = 'uplifting';
        }
        
        if (banterAnalysis.randomnessDetected) {
            strategy.randomness = 'high';
            strategy.tangentProbability = 0.6;
        }
        
        if (banterAnalysis.humorLevel === 'high') {
            strategy.humorStyle = 'energetic';
            strategy.length = 'long';
        }
        
        return strategy;
    }

    /**
     * Construct playful banter response
     * @param {Object} character - Character responding
     * @param {Object} banterAnalysis - Banter analysis
     * @param {Object} strategy - Banter strategy
     * @returns {string} - Constructed banter response
     */
    constructBanterResponse(character, banterAnalysis, strategy) {
        const components = this.selectBanterComponents(banterAnalysis, strategy);
        
        // Build response: Opening + Core + Modifier + Ending
        const parts = [];
        
        if (components.opening) parts.push(components.opening);
        if (components.core) parts.push(components.core);
        if (components.modifier) parts.push(components.modifier);
        if (components.ending) parts.push(components.ending);
        
        // Assemble with casual, playful grammar
        let response = this.assembleCasualSentence(parts, strategy);
        
        // Apply banter-specific modifications
        response = this.applyBanterModifications(response, character, banterAnalysis, strategy);
        
        return response;
    }

    /**
     * Select appropriate banter components
     * @param {Object} banterAnalysis - Banter analysis
     * @param {Object} strategy - Banter strategy
     * @returns {Object} - Selected components
     */
    selectBanterComponents(banterAnalysis, strategy) {
        const components = {};
        
        // Select opening based on strategy
        const openingStyle = strategy.openingStyle || 'playful';
        if (this.banterComponents.openings[openingStyle]) {
            components.opening = this.randomSelect(this.banterComponents.openings[openingStyle]);
        } else {
            components.opening = this.randomSelect(this.banterComponents.openings.playful);
        }
        
        // Select core content based on banter triggers
        if (banterAnalysis.banterTriggers.length > 0) {
            const primaryTrigger = banterAnalysis.banterTriggers[0];
            const coreCategory = this.banterComponents.coreContent[primaryTrigger.responseType];
            
            if (coreCategory) {
                const subcategories = Object.keys(coreCategory);
                let selectedSubcategory = subcategories[0]; // Default
                
                // Choose subcategory based on strategy
                if (strategy.tone === 'sarcastic' && coreCategory.dry) {
                    selectedSubcategory = 'dry';
                } else if (strategy.competitiveness === 'challenging' && coreCategory.challenge) {
                    selectedSubcategory = 'challenge';
                } else if (strategy.humorStyle === 'uplifting' && coreCategory.building_up) {
                    selectedSubcategory = 'building_up';
                } else if (strategy.randomness === 'high' && coreCategory.random) {
                    selectedSubcategory = 'random';
                }
                
                if (coreCategory[selectedSubcategory]) {
                    components.core = this.randomSelect(coreCategory[selectedSubcategory]);
                }
            }
        }
        
        // Select modifier based on strategy
        if (strategy.randomness === 'high') {
            components.modifier = this.randomSelect(this.banterComponents.modifiers.randomness.tangent);
        } else if (strategy.sarcasmLevel === 'medium') {
            components.modifier = this.randomSelect(this.banterComponents.modifiers.attitude.deadpan);
        } else if (strategy.humorStyle === 'energetic') {
            components.modifier = this.randomSelect(this.banterComponents.modifiers.intensity.extreme);
        }
        
        // Select ending based on strategy
        if (strategy.includeChallenge) {
            components.ending = this.randomSelect(this.banterComponents.endings.challenges);
        } else if (strategy.randomness === 'high') {
            components.ending = this.randomSelect(this.banterComponents.endings.random);
        } else if (strategy.tone === 'supportive_banter') {
            components.ending = this.randomSelect(this.banterComponents.endings.continuations);
        } else {
            components.ending = this.randomSelect(this.banterComponents.endings.statements);
        }
        
        return components;
    }

    /**
     * Assemble sentence with casual, playful grammar
     * @param {Array} parts - Sentence parts
     * @param {Object} strategy - Banter strategy
     * @returns {string} - Assembled casual sentence
     */
    assembleCasualSentence(parts, strategy) {
        if (parts.length === 0) return 'Hah.';
        
        let sentence = '';
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (i === 0) {
                sentence += part.charAt(0).toUpperCase() + part.slice(1);
            } else {
                // Casual connectors
                let connector = '';
                
                if (i === parts.length - 1) {
                    // Last part
                    if (part.includes('?') || part.includes('!')) {
                        connector = ' ';
                    } else {
                        connector = ', ';
                    }
                } else {
                    // Middle parts - more casual connections
                    if (strategy.randomness === 'high' && Math.random() < 0.3) {
                        connector = ' - ';
                    } else {
                        connector = ' ';
                    }
                }
                
                sentence += connector + part;
            }
        }
        
        // Casual punctuation
        if (!sentence.match(/[.!?]$/)) {
            if (strategy.humorStyle === 'energetic') {
                sentence += '!';
            } else {
                sentence += '.';
            }
        }
        
        return sentence;
    }

    /**
     * Apply banter-specific modifications
     * @param {string} response - Base response
     * @param {Object} character - Character responding
     * @param {Object} banterAnalysis - Banter analysis
     * @param {Object} strategy - Banter strategy
     * @returns {string} - Modified response
     */
    applyBanterModifications(response, character, banterAnalysis, strategy) {
        let modified = response;
        const personality = character.personalityTags || [];
        
        // Personality-based modifications
        personality.forEach(trait => {
            switch (trait) {
                case 'Chaotic':
                    // Add random elements occasionally
                    if (Math.random() < 0.3) {
                        const randomAdditions = [' ...wait, what?', ' *brain.exe has stopped*', ' Plot twist!'];
                        modified += randomAdditions[Math.floor(Math.random() * randomAdditions.length)];
                    }
                    break;
                    
                case 'Lazy':
                    // Make it more casual/lazy
                    modified = modified.replace(/going to/gi, 'gonna');
                    modified = modified.replace(/want to/gi, 'wanna');
                    if (Math.random() < 0.2) {
                        modified = modified.replace(/\.$/, '...');
                    }
                    break;
                    
                case 'Extroverted':
                    // Add enthusiasm
                    if (!modified.includes('!') && Math.random() < 0.5) {
                        modified = modified.replace(/\.$/, '!');
                    }
                    break;
                    
                case 'Gossip':
                    // Add conspiratorial elements
                    if (Math.random() < 0.3) {
                        modified += ' Just saying...';
                    }
                    break;
            }
        });
        
        // Strategy-based modifications
        if (strategy.sarcasmLevel === 'medium' && Math.random() < 0.4) {
            // Add air quotes or emphasis
            const emphasizers = [' *eye roll*', ' Obviously.', ' Sure.'];
            modified += this.randomSelect(emphasizers);
        }
        
        if (strategy.randomness === 'high' && Math.random() < 0.3) {
            // Add random tangent
            const tangents = [' Speaking of which...', ' That reminds me...', ' Random thought...'];
            modified += this.randomSelect(tangents);
        }
        
        if (strategy.competitiveness === 'challenging' && Math.random() < 0.4) {
            // Add competitive flair
            const competitiveAdditions = [' Game on!', ' Bring it!', ' Challenge accepted!'];
            modified += this.randomSelect(competitiveAdditions);
        }
        
        return modified;
    }

    /**
     * Generate playful conversation starter
     * @param {Object} character - Character starting conversation
     * @param {Object} target - Target character
     * @param {Object} context - Context
     * @returns {string} - Playful conversation starter
     */
    generateBanterConversationStarter(character, target, context) {
        const personality = character.personalityTags || [];
        
        const starterTypes = {
            observational: ['Did you notice', 'Is it just me or', 'Anyone else think'],
            random: ['Random question:', 'Weird thought:', 'Plot twist:'],
            teasing: ['So I heard', 'Word on the street is', 'Little birdie told me'],
            absurd: ['What if', 'Imagine if', 'Hypothetically speaking'],
            competitive: ['Bet you can\'t', 'I challenge you to', 'Think you\'re better at']
        };
        
        // Select based on personality
        let selectedType = 'observational';
        
        if (personality.includes('Chaotic')) {
            selectedType = Math.random() < 0.6 ? 'random' : 'absurd';
        } else if (personality.includes('Gossip')) {
            selectedType = Math.random() < 0.5 ? 'teasing' : 'observational';
        } else if (personality.includes('Ambitious')) {
            selectedType = Math.random() < 0.4 ? 'competitive' : 'observational';
        }
        
        const starters = starterTypes[selectedType];
        const starter = this.randomSelect(starters);
        
        // Add context-appropriate topic
        const topics = {
            observational: ['this place gets weirder every day', 'everyone looks half-dead today', 'the coffee situation here'],
            random: ['do you think aliens drink coffee?', 'why do we call it rush hour when nobody moves?'],
            teasing: ['you\'re the office coffee champion', 'you have strong opinions about staplers'],
            absurd: ['everyone here was secretly a robot', 'coffee was actually just brown water'],
            competitive: ['drink more coffee than me', 'survive this Monday without caffeine']
        };
        
        const topic = this.randomSelect(topics[selectedType] || topics.observational);
        
        return `${starter} ${topic}?`;
    }

    /**
     * Utility methods
     */
    randomSelect(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }

    getBanterFallbackResponse(character, incomingMessage) {
        const personality = character.personalityTags || [];
        
        const banterFallbacks = {
            'Chaotic': ['That\'s... random.', 'Well that happened.', 'Sure, why not?'],
            'Extroverted': ['Tell me more!', 'That\'s hilarious!', 'I love it!'],
            'Lazy': ['Yep.', 'Sounds about right.', 'Classic.'],
            'Gossip': ['Interesting...', 'Do tell!', 'I need details!']
        };
        
        // Use personality-specific fallback
        for (const trait of personality) {
            if (banterFallbacks[trait]) {
                return this.randomSelect(banterFallbacks[trait]);
            }
        }
        
        // Generic banter fallbacks
        return this.randomSelect(['Ha!', 'That\'s fair.', 'True that.', 'Fair enough.', 'I see you.']);
    }

    /**
     * Get banter-specific conversation statistics
     * @returns {Object} - Banter conversation stats
     */
    getBanterStats() {
        return {
            triggerTypes: Object.keys(this.banterTriggers).length,
            componentCategories: {
                openings: Object.keys(this.banterComponents.openings).length,
                coreContent: Object.keys(this.banterComponents.coreContent).length,
                modifiers: Object.keys(this.banterComponents.modifiers).length,
                endings: Object.keys(this.banterComponents.endings).length
            },
            personalityStyles: Object.keys(this.banterStyles).length
        };
    }
}
