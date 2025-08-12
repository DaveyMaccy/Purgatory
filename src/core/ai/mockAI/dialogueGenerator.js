/**
 * Dialogue Generator - Context-Aware Dialogue Creation
 * Generates realistic dialogue based on personality, context, and social dynamics
 * 
 * DIALOGUE INTENTS:
 * - greeting: Morning/casual hellos
 * - small_talk: Weather, general conversation
 * - work_related: Professional discussions
 * - gossip: Information sharing, rumors
 * - complaint: Expressing frustration
 * - supportive: Offering help or comfort
 * - casual_chat: Friendly, relaxed conversation
 * - information_seeking: Asking questions
 * 
 * CONTEXT FACTORS:
 * - Personality: Affects tone and topics
 * - Relationship: History with conversation partner
 * - Location: Formal vs informal settings
 * - Time: Morning energy vs afternoon fatigue
 * - Mood: Current emotional state
 * - Privacy: Confidential vs public conversations
 * 
 * EXPANSION NOTES:
 * - Add emotional dialogue (expressing feelings)
 * - Implement conversation threading (remembering topics)
 * - Add cultural/regional dialogue variations
 * - Create dialogue learning (characters develop speech patterns)
 */

export class DialogueGenerator {
    constructor() {
        // Dialogue templates organized by intent
        this.dialogueTemplates = {
            greeting: {
                morning: [
                    "Morning {target}! How's your day starting?",
                    "Hey {target}, you're here early today!",
                    "Good morning! Ready for another day?",
                    "Morning {target}! Coffee helping yet?",
                    "Hey there! How was your weekend?",
                    "Good morning! You look {mood} today."
                ],
                general: [
                    "Hey {target}, how's it going?",
                    "Hi {target}! How are you doing?",
                    "Oh hi {target}, didn't see you there.",
                    "Hey! Good to see you.",
                    "Hi there! How's your day been?",
                    "{target}! Just the person I wanted to see."
                ],
                afternoon: [
                    "Hey {target}, how's your afternoon going?",
                    "Good afternoon! Busy day?",
                    "Hi {target}! How's the day treating you?",
                    "Afternoon! Getting much done today?",
                    "Hey there! Surviving the day?"
                ]
            },
            
            small_talk: {
                weather: [
                    "Nice weather we're having, isn't it?",
                    "Can you believe this {weather}?",
                    "Perfect day for {activity}, don't you think?",
                    "This weather is making me feel {mood}.",
                    "Hope this {weather} keeps up!"
                ],
                general: [
                    "How's your day been so far?",
                    "Anything interesting happening today?",
                    "Been keeping busy?",
                    "How are things with you?",
                    "What's new in your world?",
                    "Did you see that email about {topic}?",
                    "Have you tried the new {thing} yet?"
                ],
                weekend: [
                    "Any big plans for the weekend?",
                    "How was your weekend?",
                    "Got anything fun planned?",
                    "Ready for the weekend?",
                    "What did you get up to this weekend?"
                ]
            },
            
            work_related: {
                tasks: [
                    "How's that {project} coming along?",
                    "Are you swamped with work today?",
                    "Getting caught up on everything?",
                    "How are you finding the {task}?",
                    "Need any help with anything?",
                    "What's keeping you busy these days?"
                ],
                deadlines: [
                    "When's that {project} due again?",
                    "Are you feeling the pressure with {deadline}?",
                    "How are we doing on time for {project}?",
                    "Think we'll make the deadline?",
                    "Is {boss} still asking about {project}?"
                ],
                collaboration: [
                    "Want to work on {project} together?",
                    "Should we sync up on {task}?",
                    "Have you had a chance to look at {document}?",
                    "What do you think about {proposal}?",
                    "We should probably coordinate on {project}."
                ]
            },
            
            gossip: {
                information: [
                    "Did you hear about {person}?",
                    "Have you heard the latest about {topic}?",
                    "You'll never guess what I heard...",
                    "I heard something interesting about {subject}...",
                    "Speaking of {topic}, did you know...?",
                    "Between you and me, I heard that..."
                ],
                speculation: [
                    "I wonder if {person} is going to {action}...",
                    "Do you think {situation} is really true?",
                    "What do you make of {event}?",
                    "I'm curious what you think about {topic}...",
                    "Have you noticed {observation}?"
                ],
                sharing: [
                    "I thought you should know that {information}.",
                    "You didn't hear this from me, but...",
                    "This is just between us, but {secret}.",
                    "I probably shouldn't say this, but...",
                    "Keep this quiet, but I heard..."
                ]
            },
            
            complaint: {
                work: [
                    "Ugh, this {task} is taking forever...",
                    "I can't believe how much work we have today.",
                    "This {project} is driving me crazy!",
                    "Why does everything have to be so complicated?",
                    "I'm so behind on {task}...",
                    "When will this workload calm down?"
                ],
                needs: [
                    "I really need some coffee.",
                    "I'm absolutely starving!",
                    "Is it Friday yet?",
                    "I could really use a break right now.",
                    "My energy is completely shot.",
                    "I feel like I'm running on empty."
                ],
                people: [
                    "Did you see what {person} did?",
                    "I can't deal with {person} today.",
                    "{person} is really getting on my nerves.",
                    "Why can't people just {action}?",
                    "Some people have no consideration..."
                ]
            },
            
            supportive: {
                encouragement: [
                    "You've got this! Don't worry.",
                    "I'm sure you'll figure it out.",
                    "That sounds really tough. Hang in there!",
                    "You're doing great, don't be so hard on yourself.",
                    "Is there anything I can do to help?",
                    "We've all been there. It'll get better."
                ],
                assistance: [
                    "Need a hand with that?",
                    "Want me to take a look?",
                    "I can help you with {task} if you want.",
                    "Let me know if you need anything.",
                    "Happy to pitch in if needed.",
                    "Don't hesitate to ask if you need help."
                ],
                comfort: [
                    "That sounds really frustrating.",
                    "I can see why you'd be upset about that.",
                    "That must be stressful.",
                    "I'm sorry you're dealing with that.",
                    "That's a lot to handle."
                ]
            },
            
            casual_chat: {
                interests: [
                    "What are you into these days?",
                    "Been watching anything good lately?",
                    "Read any good books recently?",
                    "Have any hobbies you're passionate about?",
                    "What do you like to do for fun?"
                ],
                experiences: [
                    "You should have seen what happened to me...",
                    "The funniest thing happened yesterday...",
                    "I had the most interesting experience...",
                    "You know what I love about {topic}?",
                    "I've been thinking about {subject} lately..."
                ],
                opinions: [
                    "What do you think about {topic}?",
                    "I've been wondering about {subject}...",
                    "Do you ever think about {philosophical_topic}?",
                    "What's your take on {current_event}?",
                    "How do you feel about {situation}?"
                ]
            },
            
            information_seeking: {
                direct: [
                    "Do you know anything about {topic}?",
                    "Have you heard when {event} is happening?",
                    "What can you tell me about {subject}?",
                    "I'm trying to figure out {problem}...",
                    "Can you help me understand {topic}?"
                ],
                indirect: [
                    "I was wondering about {topic}...",
                    "Someone mentioned {subject} earlier...",
                    "I heard something about {topic}, what do you know?",
                    "What's the story with {situation}?",
                    "Fill me in on {topic}?"
                ]
            }
        };
        
        // Personality modifiers for dialogue style
        this.personalityModifiers = {
            'Ambitious': {
                formality: 1.2,
                work_focus: 1.5,
                networking: 1.3,
                efficiency: 1.2
            },
            'Lazy': {
                casualness: 1.3,
                complaint_tendency: 1.4,
                brevity: 1.2,
                work_avoidance: 1.3
            },
            'Extroverted': {
                friendliness: 1.5,
                conversation_length: 1.4,
                personal_sharing: 1.3,
                enthusiasm: 1.4
            },
            'Introverted': {
                brevity: 1.3,
                formality: 1.1,
                personal_reserve: 1.4,
                conversation_length: 0.7
            },
            'Gossip': {
                information_seeking: 1.8,
                sharing_tendency: 1.6,
                curiosity: 1.5,
                social_connections: 1.4
            },
            'Professional': {
                formality: 1.5,
                work_focus: 1.3,
                personal_boundaries: 1.4,
                efficiency: 1.3
            },
            'Organized': {
                precision: 1.3,
                planning_focus: 1.2,
                structured_conversation: 1.2
            },
            'Chaotic': {
                randomness: 1.4,
                topic_jumping: 1.3,
                unpredictability: 1.2
            }
        };
        
        // Context modifiers
        this.contextModifiers = {
            location: {
                break_room: { casualness: 1.3, social_topics: 1.4 },
                office: { professionalism: 1.2, work_topics: 1.3 },
                meeting_room: { formality: 1.4, structured: 1.3 },
                hallway: { brevity: 1.4, casual_greetings: 1.3 }
            },
            privacy: {
                private: { personal_topics: 1.4, confidential: 1.3 },
                semi_private: { moderate_sharing: 1.2 },
                public: { general_topics: 1.2, formality: 1.1 }
            },
            time: {
                morning: { greetings: 1.3, energy_topics: 1.2 },
                lunch_time: { food_topics: 1.4, social: 1.3 },
                afternoon: { work_topics: 1.2, fatigue_topics: 1.1 },
                evening: { wrap_up_topics: 1.2, personal: 1.1 }
            }
        };
        
        console.log('💬 Dialogue Generator initialized');
    }

    /**
     * Generate dialogue based on character, context, and intent
     * @param {Object} character - Character object with personality
     * @param {Object} context - Current context (location, people nearby, etc.)
     * @param {string} intent - Dialogue intent (greeting, small_talk, etc.)
     * @returns {string} - Generated dialogue
     */
    generate(character, context, intent = 'small_talk') {
        try {
            console.log(`💭 Generating ${intent} dialogue for ${character.name}`);
            
            // Get base templates for the intent
            const templates = this.getTemplatesForIntent(intent, context);
            if (!templates || templates.length === 0) {
                return this.getFallbackDialogue(intent);
            }
            
            // Select appropriate template
            const template = this.selectTemplate(templates, character, context);
            
            // Fill template with context-appropriate content
            const dialogue = this.fillTemplate(template, character, context);
            
            // Apply personality modifications
            const modifiedDialogue = this.applyPersonalityModifications(dialogue, character, context);
            
            console.log(`💬 Generated: "${modifiedDialogue}"`);
            
            return modifiedDialogue;
            
        } catch (error) {
            console.error('Error generating dialogue:', error);
            return this.getFallbackDialogue(intent);
        }
    }

    /**
     * Get appropriate templates for intent and context
     * @param {string} intent - Dialogue intent
     * @param {Object} context - Current context
     * @returns {Array} - Array of template strings
     */
    getTemplatesForIntent(intent, context) {
        const intentTemplates = this.dialogueTemplates[intent];
        if (!intentTemplates) return [];
        
        // If templates are categorized, select based on context
        if (typeof intentTemplates === 'object' && !Array.isArray(intentTemplates)) {
            // Time-based selection for greetings
            if (intent === 'greeting') {
                const hour = new Date().getHours();
                if (hour < 12) return intentTemplates.morning || intentTemplates.general;
                if (hour > 17) return intentTemplates.afternoon || intentTemplates.general;
                return intentTemplates.general;
            }
            
            // Context-based selection for other intents
            if (intent === 'small_talk') {
                // Prefer weather talk in certain conditions, weekend talk on Fridays/Mondays
                const day = new Date().getDay();
                if (day === 1) return intentTemplates.weekend || intentTemplates.general; // Monday
                if (day === 5) return intentTemplates.weekend || intentTemplates.general; // Friday
                return intentTemplates.general;
            }
            
            // Default to general category
            return intentTemplates.general || Object.values(intentTemplates).flat();
        }
        
        return intentTemplates;
    }

    /**
     * Select the most appropriate template from available options
     * @param {Array} templates - Available templates
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @returns {string} - Selected template
     */
    selectTemplate(templates, character, context) {
        if (templates.length === 1) return templates[0];
        
        // Score each template based on personality and context
        const scoredTemplates = templates.map(template => ({
            template,
            score: this.scoreTemplate(template, character, context)
        }));
        
        // Sort by score and add some randomness
        scoredTemplates.sort((a, b) => b.score - a.score);
        
        // Select from top 3 to add variety while maintaining appropriateness
        const topTemplates = scoredTemplates.slice(0, Math.min(3, scoredTemplates.length));
        const selected = topTemplates[Math.floor(Math.random() * topTemplates.length)];
        
        return selected.template;
    }

    /**
     * Score a template's appropriateness for the character and context
     * @param {string} template - Template to score
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @returns {number} - Appropriateness score
     */
    scoreTemplate(template, character, context) {
        let score = 1.0;
        const templateLower = template.toLowerCase();
        const personality = character.personalityTags || [];
        
        // Personality-based scoring
        personality.forEach(trait => {
            const modifiers = this.personalityModifiers[trait];
            if (!modifiers) return;
            
            // Ambitious characters prefer work-related dialogue
            if (trait === 'Ambitious' && templateLower.includes('work')) {
                score *= 1.3;
            }
            
            // Gossip characters prefer information-seeking
            if (trait === 'Gossip' && (templateLower.includes('hear') || templateLower.includes('know'))) {
                score *= 1.4;
            }
            
            // Professional characters avoid overly casual language
            if (trait === 'Professional' && (templateLower.includes('hey') || templateLower.includes('stuff'))) {
                score *= 0.8;
            }
            
            // Introverted characters prefer brief interactions
            if (trait === 'Introverted' && template.length > 50) {
                score *= 0.9;
            }
            
            // Extroverted characters prefer longer, friendlier interactions
            if (trait === 'Extroverted' && (templateLower.includes('!') || template.length > 30)) {
                score *= 1.2;
            }
        });
        
        // Context-based scoring
        if (context.location?.type === 'break_room' && templateLower.includes('coffee')) {
            score *= 1.3;
        }
        
        if (context.location?.formality > 7 && templateLower.includes('hey')) {
            score *= 0.7; // Less casual in formal settings
        }
        
        return score;
    }

    /**
     * Fill template placeholders with appropriate content
     * @param {string} template - Template with placeholders
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @returns {string} - Filled template
     */
    fillTemplate(template, character, context) {
        let filled = template;
        
        // Fill target placeholder
        const target = this.getConversationTarget(context);
        filled = filled.replace(/{target}/g, target);
        
        // Fill mood placeholder
        const mood = this.getContextualMood(character, context);
        filled = filled.replace(/{mood}/g, mood);
        
        // Fill weather placeholder
        const weather = this.getWeatherDescription();
        filled = filled.replace(/{weather}/g, weather);
        
        // Fill activity placeholder
        const activity = this.getSeasonalActivity();
        filled = filled.replace(/{activity}/g, activity);
        
        // Fill work-related placeholders
        filled = this.fillWorkPlaceholders(filled, character, context);
        
        // Fill topic placeholders
        filled = this.fillTopicPlaceholders(filled, context);
        
        // Fill person placeholders
        filled = this.fillPersonPlaceholders(filled, context);
        
        return filled;
    }

    /**
     * Get conversation target from context
     * @param {Object} context - Current context
     * @returns {string} - Target name or generic term
     */
    getConversationTarget(context) {
        if (context.nearbyEntities && context.nearbyEntities.length > 0) {
            const people = context.nearbyEntities.filter(e => e.type === 'Character');
            if (people.length > 0) {
                return people[0].name;
            }
        }
        
        // Generic alternatives when no specific target
        const alternatives = ['there', 'friend', 'colleague'];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    }

    /**
     * Get contextual mood description
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @returns {string} - Mood description
     */
    getContextualMood(character, context) {
        const energy = character.energy || 5;
        const stress = character.stress || 5;
        const timeOfDay = context.time_context?.period || 'unknown';
        
        if (energy < 3) return 'tired';
        if (stress > 7) return 'stressed';
        if (energy > 7 && timeOfDay === 'morning') return 'energetic';
        if (timeOfDay === 'afternoon' && energy < 5) return 'sluggish';
        
        const moods = ['good', 'focused', 'busy', 'productive', 'relaxed'];
        return moods[Math.floor(Math.random() * moods.length)];
    }

    /**
     * Get weather description for small talk
     * @returns {string} - Weather description
     */
    getWeatherDescription() {
        const weather = ['nice weather', 'crazy weather', 'beautiful day', 'weather', 'temperature'];
        return weather[Math.floor(Math.random() * weather.length)];
    }

    /**
     * Get seasonal activity suggestion
     * @returns {string} - Activity description
     */
    getSeasonalActivity() {
        const month = new Date().getMonth();
        
        if (month >= 2 && month <= 4) { // Spring
            const spring = ['gardening', 'walks', 'outdoor lunch', 'spring cleaning'];
            return spring[Math.floor(Math.random() * spring.length)];
        } else if (month >= 5 && month <= 7) { // Summer
            const summer = ['picnics', 'outdoor activities', 'barbecues', 'vacation'];
            return summer[Math.floor(Math.random() * summer.length)];
        } else if (month >= 8 && month <= 10) { // Fall
            const fall = ['hiking', 'cozy activities', 'fall walks', 'seasonal activities'];
            return fall[Math.floor(Math.random() * fall.length)];
        } else { // Winter
            const winter = ['staying warm', 'indoor activities', 'hot drinks', 'winter sports'];
            return winter[Math.floor(Math.random() * winter.length)];
        }
    }

    /**
     * Fill work-related placeholders
     * @param {string} text - Text with placeholders
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @returns {string} - Text with filled placeholders
     */
    fillWorkPlaceholders(text, character, context) {
        // Project placeholder
        const projects = ['the quarterly report', 'that big project', 'the client presentation', 'the new initiative', 'the budget review'];
        text = text.replace(/{project}/g, projects[Math.floor(Math.random() * projects.length)]);
        
        // Task placeholder
        const tasks = ['data analysis', 'report writing', 'client meeting prep', 'system updates', 'documentation'];
        text = text.replace(/{task}/g, tasks[Math.floor(Math.random() * tasks.length)]);
        
        // Deadline placeholder
        const deadlines = ['end of week', 'Monday deadline', 'month-end close', 'client deadline', 'budget deadline'];
        text = text.replace(/{deadline}/g, deadlines[Math.floor(Math.random() * deadlines.length)]);
        
        // Boss placeholder
        const bosses = ['the manager', 'leadership', 'the director', 'upper management', 'the team lead'];
        text = text.replace(/{boss}/g, bosses[Math.floor(Math.random() * bosses.length)]);
        
        return text;
    }

    /**
     * Fill topic-related placeholders
     * @param {string} text - Text with placeholders
     * @param {Object} context - Current context
     * @returns {string} - Text with filled placeholders
     */
    fillTopicPlaceholders(text, context) {
        // General topics
        const topics = ['the new policy', 'the office renovation', 'the upcoming training', 'the system upgrade', 'the team changes'];
        text = text.replace(/{topic}/g, topics[Math.floor(Math.random() * topics.length)]);
        
        // Subject placeholder
        const subjects = ['work-life balance', 'the new procedures', 'the latest announcement', 'office culture', 'productivity tools'];
        text = text.replace(/{subject}/g, subjects[Math.floor(Math.random() * subjects.length)]);
        
        // Document placeholder
        const documents = ['the proposal', 'the requirements doc', 'the meeting notes', 'the status report', 'the guidelines'];
        text = text.replace(/{document}/g, documents[Math.floor(Math.random() * documents.length)]);
        
        return text;
    }

    /**
     * Fill person-related placeholders
     * @param {string} text - Text with placeholders
     * @param {Object} context - Current context
     * @returns {string} - Text with filled placeholders
     */
    fillPersonPlaceholders(text, context) {
        // Get names from context or use generic terms
        const knownPeople = context.memoryPatterns?.knownPeople || [];
        const nearbyPeople = context.nearbyEntities?.filter(e => e.type === 'Character').map(e => e.name) || [];
        const allPeople = [...knownPeople.map(p => p.name), ...nearbyPeople];
        
        let personName = 'someone';
        if (allPeople.length > 0) {
            personName = allPeople[Math.floor(Math.random() * allPeople.length)];
        }
        
        text = text.replace(/{person}/g, personName);
        
        // Action placeholder
        const actions = ['handle this better', 'be more considerate', 'communicate clearly', 'follow through', 'be on time'];
        text = text.replace(/{action}/g, actions[Math.floor(Math.random() * actions.length)]);
        
        return text;
    }

    /**
     * Apply personality-based modifications to dialogue
     * @param {string} dialogue - Base dialogue
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @returns {string} - Modified dialogue
     */
    applyPersonalityModifications(dialogue, character, context) {
        let modified = dialogue;
        const personality = character.personalityTags || [];
        
        personality.forEach(trait => {
            modified = this.applyTraitModification(modified, trait, character, context);
        });
        
        return modified;
    }

    /**
     * Apply specific trait modifications to dialogue
     * @param {string} dialogue - Dialogue to modify
     * @param {string} trait - Personality trait
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @returns {string} - Modified dialogue
     */
    applyTraitModification(dialogue, trait, character, context) {
        switch (trait) {
            case 'Professional':
                // More formal language
                dialogue = dialogue.replace(/hey/gi, 'hello');
                dialogue = dialogue.replace(/stuff/gi, 'things');
                dialogue = dialogue.replace(/yeah/gi, 'yes');
                break;
                
            case 'Lazy':
                // More casual, sometimes abbreviated
                if (Math.random() < 0.3) {
                    dialogue = dialogue.replace(/\?$/, '...');
                }
                dialogue = dialogue.replace(/How are you doing/gi, 'How\'s it going');
                break;
                
            case 'Extroverted':
                // Add enthusiasm
                if (!dialogue.includes('!') && Math.random() < 0.4) {
                    dialogue = dialogue.replace(/\.$/, '!');
                }
                break;
                
            case 'Introverted':
                // Remove excessive enthusiasm
                dialogue = dialogue.replace(/!+/g, '.');
                break;
                
            case 'Gossip':
                // Add intrigue and information-seeking
                if (Math.random() < 0.3) {
                    dialogue += ' You know anything about that?';
                }
                break;
                
            case 'Chaotic':
                // Occasionally add random tangents
                if (Math.random() < 0.2) {
                    const tangents = [' Oh, that reminds me...', ' Wait, speaking of which...', ' Random thought...'];
                    dialogue += tangents[Math.floor(Math.random() * tangents.length)];
                }
                break;
        }
        
        return dialogue;
    }

    /**
     * Get fallback dialogue for when generation fails
     * @param {string} intent - Original intent
     * @returns {string} - Safe fallback dialogue
     */
    getFallbackDialogue(intent) {
        const fallbacks = {
            greeting: 'Hello there!',
            small_talk: 'How\'s your day going?',
            work_related: 'How\'s work treating you?',
            gossip: 'Anything interesting happening?',
            complaint: 'I need a break...',
            supportive: 'Let me know if you need anything.',
            casual_chat: 'What\'s new with you?',
            information_seeking: 'Quick question for you...'
        };
        
        return fallbacks[intent] || 'How are you doing?';
    }

    /**
     * Generate context-appropriate greeting
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @returns {string} - Contextual greeting
     */
    generateGreeting(character, context) {
        const timeOfDay = context.time_context?.period || 'general';
        let greeting = this.generate(character, context, 'greeting');
        
        // Add time-specific modifications
        if (timeOfDay === 'morning' && character.energy < 4) {
            const tiredGreetings = ['Morning... coffee time.', 'Hey... still waking up.', 'Morning. Need caffeine.'];
            greeting = tiredGreetings[Math.floor(Math.random() * tiredGreetings.length)];
        }
        
        return greeting;
    }

    /**
     * Generate situation-specific dialogue
     * @param {Object} character - Character object
     * @param {Object} context - Current context
     * @param {string} situation - Specific situation (coffee_break, work_interruption, etc.)
     * @returns {string} - Situational dialogue
     */
    generateSituationalDialogue(character, context, situation) {
        const situationalDialogue = {
            coffee_break: [
                'Coffee break time!',
                'Need some caffeine to keep going.',
                'Time for a quick coffee run.',
                'Anyone else need a coffee break?'
            ],
            work_interruption: [
                'Sorry to interrupt, but...',
                'Quick question when you have a sec.',
                'Don\'t mean to bother you, but...',
                'Got a minute?'
            ],
            leaving_work: [
                'Calling it a day!',
                'Time to head out.',
                'Have a good evening!',
                'See you tomorrow!'
            ],
            lunch_time: [
                'Lunch time!',
                'Anyone want to grab lunch?',
                'Time for a break.',
                'Food time!'
            ]
        };
        
        const options = situationalDialogue[situation];
        if (!options) {
            return this.generate(character, context, 'casual_chat');
        }
        
        let selected = options[Math.floor(Math.random() * options.length)];
        return this.applyPersonalityModifications(selected, character, context);
    }

    /**
     * Check if dialogue is appropriate for current context
     * @param {string} dialogue - Generated dialogue
     * @param {Object} context - Current context
     * @returns {boolean} - True if appropriate
     */
    isDialogueAppropriate(dialogue, context) {
        const dialogueLower = dialogue.toLowerCase();
        
        // Check formality level
        if (context.location?.formality > 7) {
            // Formal setting - avoid very casual language
            if (dialogueLower.includes('hey') || dialogueLower.includes('stuff')) {
                return false;
            }
        }
        
        // Check privacy level
        if (context.privacy?.score < 4) {
            // Public setting - avoid personal topics
            if (dialogueLower.includes('personal') || dialogueLower.includes('private')) {
                return false;
            }
        }
        
        return true;
    }
}
