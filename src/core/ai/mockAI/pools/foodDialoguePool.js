/**
 * Food Dialogue Pool - Culinary and Dining Conversations
 * Specialized dialogue pool for food, cooking, restaurants, and dining experiences
 * 
 * TOPICS COVERED:
 * - Cooking and recipes
 * - Restaurant recommendations
 * - Food preferences and dietary needs
 * - Meal planning and preparation
 * - Cultural cuisine exploration
 * - Nutrition and health
 * - Food experiences and memories
 * 
 * RESPONSE PATTERNS:
 * - Recipe sharing and cooking tips
 * - Restaurant reviews and recommendations
 * - Food preference discussions
 * - Dietary accommodation understanding
 * - Cultural food appreciation
 * - Meal planning assistance
 * 
 * PERSONALITY ADAPTATIONS:
 * - Foodie personalities show more culinary knowledge
 * - Health-conscious characters focus on nutrition
 * - Social types emphasize dining experiences
 * - Practical characters discuss meal prep and planning
 */

export class FoodDialoguePool {
    constructor() {
        // Food topic triggers
        this.topicTriggers = {
            cooking: {
                keywords: ['cook', 'recipe', 'kitchen', 'prepare', 'bake', 'grill', 'chef'],
                responses: 'cooking_response',
                urgency: 'medium'
            },
            
            restaurant: {
                keywords: ['restaurant', 'dine', 'menu', 'waiter', 'reservation', 'takeout', 'delivery'],
                responses: 'restaurant_response',
                urgency: 'medium'
            },
            
            taste: {
                keywords: ['taste', 'flavor', 'delicious', 'yummy', 'spicy', 'sweet', 'salty'],
                responses: 'taste_response',
                urgency: 'low'
            },
            
            dietary: {
                keywords: ['diet', 'vegetarian', 'vegan', 'gluten', 'allergy', 'healthy', 'nutrition'],
                responses: 'dietary_response',
                urgency: 'medium'
            },
            
            culture: {
                keywords: ['cuisine', 'traditional', 'cultural', 'ethnic', 'authentic', 'fusion'],
                responses: 'culture_response',
                urgency: 'low'
            },
            
            meal: {
                keywords: ['breakfast', 'lunch', 'dinner', 'snack', 'meal', 'hungry', 'appetite'],
                responses: 'meal_response',
                urgency: 'high'
            }
        };
        
        // Food-specific sentence components (modular system)
        this.foodComponents = {
            // Food conversation openings
            openings: {
                enthusiastic: ['Oh my goodness', 'You have to try', 'I\'m obsessed with', 'Just discovered'],
                sharing: ['I made this amazing', 'Want to know my secret for', 'Let me tell you about', 'You should definitely try'],
                curious: ['Have you ever tried', 'What do you think about', 'Do you know anything about', 'I\'m curious about'],
                practical: ['For quick meals I usually', 'When I need something easy', 'My go-to recipe is', 'Simple but effective']
            },
            
            // Core food content
            coreContent: {
                cooking_response: {
                    technique: ['the key is proper seasoning', 'timing makes all the difference', 'fresh ingredients are crucial', 'low and slow cooking works wonders'],
                    sharing: ['this recipe has been in my family', 'learned this from a friend', 'found it online and modified it', 'experimenting with new combinations'],
                    process: ['prep everything beforehand', 'mise en place is essential', 'taste as you go', 'don\'t be afraid to adjust'],
                    satisfaction: ['so rewarding to cook from scratch', 'love creating something delicious', 'therapeutic to work with your hands', 'bringing people together through food']
                },
                
                restaurant_response: {
                    recommendation: ['you absolutely have to try', 'hidden gem in the neighborhood', 'consistently great food', 'worth the wait for a table'],
                    experience: ['the atmosphere is perfect', 'service was exceptional', 'presentation was beautiful', 'portions were generous'],
                    value: ['great quality for the price', 'worth every penny', 'good bang for your buck', 'special occasion worthy'],
                    comparison: ['reminds me of this place', 'similar to but better than', 'unique take on classic dishes', 'never had anything quite like it']
                },
                
                taste_response: {
                    description: ['complex layers of flavor', 'perfectly balanced seasoning', 'rich and satisfying', 'bright and fresh taste'],
                    reaction: ['hits all the right notes', 'exactly what I was craving', 'comfort food at its finest', 'surprisingly delightful'],
                    analysis: ['the spice level is just right', 'sweetness balances the heat', 'umami flavors really shine', 'texture adds so much'],
                    memory: ['reminds me of childhood', 'takes me back to', 'nostalgic and comforting', 'like grandma used to make']
                },
                
                dietary_response: {
                    accommodation: ['plenty of options for everyone', 'easy to modify for dietary needs', 'clearly labeled on the menu', 'staff is knowledgeable about ingredients'],
                    health: ['focus on whole foods', 'balanced nutrition is important', 'everything in moderation', 'listening to your body'],
                    alternatives: ['great substitutions available', 'plant-based options are delicious', 'gluten-free doesn\'t mean flavor-free', 'creative ways to meet dietary needs'],
                    understanding: ['everyone has different needs', 'food allergies are serious', 'respect for dietary choices', 'making everyone feel included']
                },
                
                culture_response: {
                    appreciation: ['love exploring different cuisines', 'each culture has unique flavors', 'food tells a story', 'traditional techniques are fascinating'],
                    learning: ['trying to understand the history', 'authentic preparation methods', 'significance of certain dishes', 'regional variations are interesting'],
                    fusion: ['creative combinations work well', 'modern twists on classics', 'blending flavors from different cultures', 'innovation while respecting tradition'],
                    experience: ['food connects us to culture', 'sharing meals builds community', 'hospitality through cooking', 'universal language of good food']
                },
                
                meal_response: {
                    planning: ['meal prep saves so much time', 'planning ahead reduces stress', 'variety keeps meals interesting', 'batch cooking is efficient'],
                    timing: ['breakfast sets the tone', 'light lunch keeps energy up', 'dinner is for unwinding', 'healthy snacks prevent overeating'],
                    social: ['meals are better shared', 'cooking together is fun', 'family dinner tradition', 'food brings people together'],
                    satisfaction: ['good food nourishes the soul', 'eating well affects mood', 'taking time to enjoy meals', 'mindful eating practices']
                }
            },
            
            // Food-specific transitions
            transitions: {
                agreement: ['Absolutely!', 'You\'re so right!', 'I totally agree!', 'Couldn\'t have said it better!'],
                suggestion: ['You should try', 'Have you considered', 'What about', 'Another option might be'],
                curiosity: ['Tell me more about', 'How do you make', 'What\'s your favorite', 'Where did you discover'],
                sharing: ['I have to share this', 'Let me tell you about', 'You\'ll love this', 'Here\'s what I do']
            },
            
            // Food conversation closings
            closings: {
                inviting: ['We should cook together sometime!', 'You\'ll have to come over for dinner!', 'Let\'s try that restaurant together!', 'I\'ll share the recipe with you!'],
                encouraging: ['Hope you get to try it soon!', 'Let me know how it turns out!', 'Trust me, you\'ll love it!', 'Definitely worth the effort!'],
                satisfied: ['Food is one of life\'s great pleasures.', 'Good food makes everything better.', 'Nothing beats a home-cooked meal.', 'Life\'s too short for bad food.'],
                practical: ['Simple ingredients, amazing results.', 'Easy weeknight dinner solution.', 'Budget-friendly and delicious.', 'Quick but satisfying meal.']
            }
        };
        
        // Food preference tracking
        this.foodPreferences = new Map();
        this.mealPlanning = new Map();
        
        console.log('🍽️ Food Dialogue Pool initialized');
    }

    /**
     * Generate food-related response
     * @param {string} incomingMessage - Message being responded to
     * @param {Object} character - Character generating response
     * @param {Object} context - Environmental and social context
     * @returns {string} - Generated food dialogue
     */
    generateResponse(incomingMessage, character, context) {
        try {
            console.log(`🍽️ Generating food response for ${character.name}`);
            
            // Analyze message for food triggers
            const triggerAnalysis = this.analyzeFoodMessage(incomingMessage);
            
            // Determine response type
            const responseType = this.determineFoodResponseType(triggerAnalysis, character, context);
            
            // Build response using modular components
            const response = this.constructFoodResponse(responseType, triggerAnalysis, character, context);
            
            console.log(`🍴 Food response: "${response}"`);
            return response;
            
        } catch (error) {
            console.error(`Error generating food response for ${character.name}:`, error);
            return this.getFallbackFoodResponse(character, incomingMessage);
        }
    }

    /**
     * Analyze incoming message for food-related triggers
     * @param {string} message - Incoming message
     * @returns {Object} - Food trigger analysis
     */
    analyzeFoodMessage(message) {
        const analysis = {
            originalMessage: message,
            detectedTriggers: [],
            foodCategory: 'general',
            mealTime: 'anytime',
            urgencyLevel: 'medium'
        };
        
        const messageLower = message.toLowerCase();
        
        // Detect specific food categories
        const foodCategories = {
            comfort: ['comfort', 'cozy', 'warm', 'hearty', 'soul food', 'homemade'],
            healthy: ['healthy', 'nutritious', 'fresh', 'organic', 'diet', 'wellness'],
            exotic: ['exotic', 'international', 'ethnic', 'authentic', 'traditional', 'cultural'],
            quick: ['quick', 'fast', 'easy', 'simple', 'convenient', 'takeout'],
            gourmet: ['gourmet', 'fine dining', 'elegant', 'sophisticated', 'chef', 'artisan']
        };
        
        Object.entries(foodCategories).forEach(([category, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.foodCategory = category;
            }
        });
        
        // Detect meal timing
        const mealTimes = {
            breakfast: ['breakfast', 'morning', 'coffee', 'cereal', 'eggs', 'toast'],
            lunch: ['lunch', 'midday', 'noon', 'sandwich', 'salad', 'soup'],
            dinner: ['dinner', 'evening', 'supper', 'main course', 'entree'],
            snack: ['snack', 'nibble', 'bite', 'munchies', 'appetizer']
        };
        
        Object.entries(mealTimes).forEach(([time, keywords]) => {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                analysis.mealTime = time;
            }
        });
        
        // Detect hunger/urgency level
        const urgencyWords = ['hungry', 'starving', 'craving', 'need food', 'so hungry'];
        if (urgencyWords.some(word => messageLower.includes(word))) {
            analysis.urgencyLevel = 'high';
        }
        
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
     * Determine appropriate food response type
     * @param {Object} triggerAnalysis - Analysis of incoming message
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Response type identifier
     */
    determineFoodResponseType(triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        
        // Primary trigger-based routing
        if (triggerAnalysis.detectedTriggers.length > 0) {
            return triggerAnalysis.detectedTriggers[0].responseType;
        }
        
        // Personality-based defaults
        if (personality.includes('Foodie') || personality.includes('Creative')) {
            return 'cooking_response';
        } else if (personality.includes('Health-conscious')) {
            return 'dietary_response';
        } else if (personality.includes('Social')) {
            return 'restaurant_response';
        } else if (personality.includes('Practical')) {
            return 'meal_response';
        }
        
        // Context-based defaults
        if (context.location === 'kitchen' || context.location === 'cafeteria') {
            return 'cooking_response';
        }
        
        // Fallback based on food category
        return `${triggerAnalysis.foodCategory}_response`;
    }

    /**
     * Construct food response using modular components
     * @param {string} responseType - Type of response to generate
     * @param {Object} triggerAnalysis - Trigger analysis
     * @param {Object} character - Character object
     * @param {Object} context - Environmental context
     * @returns {string} - Constructed response
     */
    constructFoodResponse(responseType, triggerAnalysis, character, context) {
        const personality = character.personalityTags || [];
        const components = this.foodComponents;
        
        // Select opening based on personality and urgency
        let opening = '';
        if (triggerAnalysis.urgencyLevel === 'high') {
            opening = this.selectRandom(components.openings.practical);
        } else if (personality.includes('Enthusiastic') || personality.includes('Foodie')) {
            opening = this.selectRandom(components.openings.enthusiastic);
        } else if (personality.includes('Social')) {
            opening = this.selectRandom(components.openings.sharing);
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
            coreContent = 'food is such an important part of life';
        }
        
        // Select appropriate transition
        let transition = '';
        if (personality.includes('Social')) {
            transition = this.selectRandom(components.transitions.sharing);
        } else if (triggerAnalysis.foodCategory === 'exotic') {
            transition = this.selectRandom(components.transitions.curiosity);
        } else {
            transition = this.selectRandom(components.transitions.agreement);
        }
        
        // Select closing based on personality and context
        let closing = '';
        if (personality.includes('Social') || personality.includes('Hospitable')) {
            closing = this.selectRandom(components.closings.inviting);
        } else if (personality.includes('Encouraging')) {
            closing = this.selectRandom(components.closings.encouraging);
        } else if (triggerAnalysis.foodCategory === 'quick') {
            closing = this.selectRandom(components.closings.practical);
        } else {
            closing = this.selectRandom(components.closings.satisfied);
        }
        
        // Combine components into natural response
        return `${opening} ${coreContent}. ${transition} ${closing}`;
    }

    /**
     * Generate fallback food response
     * @param {Object} character - Character object
     * @param {string} originalMessage - Original message
     * @returns {string} - Fallback response
     */
    getFallbackFoodResponse(character, originalMessage) {
        const fallbacks = [
            "Food is always such an interesting topic!",
            "I should probably eat more adventurously.",
            "You seem to know a lot about good food!",
            "I'm always looking for new things to try.",
            "Food brings people together, doesn't it?"
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
            name: 'Food Dialogue Pool',
            triggerCategories: Object.keys(this.topicTriggers).length,
            componentCategories: Object.keys(this.foodComponents).length,
            totalResponses: Object.values(this.foodComponents.coreContent)
                .reduce((total, category) => total + Object.keys(category).length, 0),
            trackedPreferences: this.foodPreferences.size,
            mealPlans: this.mealPlanning.size
        };
    }
}
