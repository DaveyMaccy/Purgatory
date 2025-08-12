/**
 * Memory Processor - Pattern Analysis from Character Memories
 * Analyzes short-term and long-term memories to identify patterns and inform decisions
 * 
 * MEMORY ANALYSIS:
 * - Recent Actions: What has the character been doing lately?
 * - Failed Attempts: What didn't work and should be avoided?
 * - Successful Patterns: What worked well and should be repeated?
 * - Social Interactions: Who has the character talked to recently?
 * - Location Preferences: Where does the character spend time?
 * - Time Patterns: When does the character do certain activities?
 * 
 * PATTERN TYPES:
 * - Behavioral: Repeated action sequences
 * - Social: Relationship and interaction patterns
 * - Temporal: Time-based activity patterns
 * - Spatial: Location-based behavior patterns
 * - Causal: Success/failure cause-effect relationships
 * 
 * EXPANSION NOTES:
 * - Add emotional memory (positive/negative associations)
 * - Implement memory decay (older memories fade)
 * - Add shared memories (characters remember interactions)
 * - Create memory conflict resolution (conflicting experiences)
 */

export class MemoryProcessor {
    constructor() {
        // Keywords for pattern recognition
        this.actionKeywords = {
            work: ['work', 'task', 'project', 'assignment', 'job'],
            social: ['talk', 'conversation', 'chat', 'discuss', 'meet'],
            needs: ['coffee', 'drink', 'eat', 'snack', 'break', 'rest'],
            movement: ['move', 'go', 'walk', 'head', 'visit'],
            idle: ['idle', 'wait', 'pause', 'think', 'relax']
        };
        
        this.outcomeKeywords = {
            success: ['completed', 'finished', 'successful', 'worked', 'achieved', 'satisfied'],
            failure: ['failed', 'interrupted', 'abandoned', 'couldn\'t', 'unable', 'frustrated'],
            partial: ['partially', 'some progress', 'started', 'began', 'attempted']
        };
        
        this.emotionKeywords = {
            positive: ['happy', 'satisfied', 'pleased', 'content', 'energized', 'motivated'],
            negative: ['frustrated', 'tired', 'annoyed', 'stressed', 'overwhelmed', 'bored'],
            neutral: ['fine', 'okay', 'normal', 'average', 'routine']
        };
        
        // Pattern weights for decision influence
        this.patternWeights = {
            recent_success: 1.3,      // Recently successful actions get bonus
            recent_failure: 0.7,      // Recently failed actions get penalty
            frequent_success: 1.2,    // Frequently successful patterns get bonus
            frequent_failure: 0.8,    // Frequently failed patterns get penalty
            social_positive: 1.1,     // Positive social interactions encourage more
            social_negative: 0.9,     // Negative social interactions discourage
            location_positive: 1.1,   // Positive location experiences
            location_negative: 0.9    // Negative location experiences
        };
        
        console.log('🧠 Memory Processor initialized');
    }

    /**
     * Extract patterns from character memories
     * @param {Object} memories - Memory object with shortTerm and longTerm arrays
     * @returns {Object} - Extracted patterns and insights
     */
    extractPatterns(memories) {
        if (!memories || (!memories.shortTerm && !memories.longTerm)) {
            return this.getEmptyPatterns();
        }
        
        const shortTerm = memories.shortTerm || [];
        const longTerm = memories.longTerm || [];
        const allMemories = [...shortTerm, ...longTerm];
        
        console.log(`🔍 Analyzing ${allMemories.length} memories (${shortTerm.length} short-term, ${longTerm.length} long-term)`);
        
        const patterns = {
            // Recent behavior patterns
            recentActions: this.extractRecentActions(shortTerm),
            recentConversations: this.extractRecentConversations(shortTerm),
            recentLocations: this.extractRecentLocations(shortTerm),
            recentOutcomes: this.extractRecentOutcomes(shortTerm),
            
            // Historical patterns
            frequentActions: this.extractFrequentActions(allMemories),
            knownPeople: this.extractKnownPeople(allMemories),
            preferredLocations: this.extractPreferredLocations(allMemories),
            successfulPatterns: this.extractSuccessfulPatterns(allMemories),
            failurePatterns: this.extractFailurePatterns(allMemories),
            
            // Behavioral insights
            behaviorTrends: this.analyzeBehaviorTrends(allMemories),
            socialPatterns: this.analyzeSocialPatterns(allMemories),
            temporalPatterns: this.analyzeTemporalPatterns(allMemories),
            emotionalPatterns: this.analyzeEmotionalPatterns(allMemories),
            
            // Decision modifiers
            actionModifiers: this.calculateActionModifiers(allMemories),
            avoidanceList: this.generateAvoidanceList(shortTerm),
            preferenceList: this.generatePreferenceList(allMemories)
        };
        
        return patterns;
    }

    /**
     * Extract recent actions from short-term memory
     * @param {Array} shortTermMemories - Short-term memory entries
     * @returns {Array} - Recent action types
     */
    extractRecentActions(shortTermMemories) {
        const actions = [];
        
        shortTermMemories.forEach(memory => {
            const actionType = this.identifyActionType(memory);
            if (actionType) {
                actions.push(actionType);
            }
        });
        
        // Return unique actions in order of recency
        return [...new Set(actions)];
    }

    /**
     * Extract recent conversations from short-term memory
     * @param {Array} shortTermMemories - Short-term memory entries
     * @returns {Array} - Names of people recently talked to
     */
    extractRecentConversations(shortTermMemories) {
        const conversations = [];
        
        shortTermMemories.forEach(memory => {
            const people = this.extractNamesFromMemory(memory);
            if (this.isConversationMemory(memory)) {
                conversations.push(...people);
            }
        });
        
        return [...new Set(conversations)];
    }

    /**
     * Extract recent locations from short-term memory
     * @param {Array} shortTermMemories - Short-term memory entries
     * @returns {Array} - Recent locations visited
     */
    extractRecentLocations(shortTermMemories) {
        const locations = [];
        
        shortTermMemories.forEach(memory => {
            const location = this.extractLocationFromMemory(memory);
            if (location) {
                locations.push(location);
            }
        });
        
        return [...new Set(locations)];
    }

    /**
     * Extract recent outcomes (success/failure) from short-term memory
     * @param {Array} shortTermMemories - Short-term memory entries
     * @returns {Object} - Recent outcome analysis
     */
    extractRecentOutcomes(shortTermMemories) {
        const outcomes = {
            successes: [],
            failures: [],
            partials: [],
            overall_mood: 'neutral'
        };
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        shortTermMemories.forEach(memory => {
            const outcome = this.classifyOutcome(memory);
            const action = this.identifyActionType(memory);
            
            if (outcome === 'success' && action) {
                outcomes.successes.push(action);
                positiveCount++;
            } else if (outcome === 'failure' && action) {
                outcomes.failures.push(action);
                negativeCount++;
            } else if (outcome === 'partial' && action) {
                outcomes.partials.push(action);
            }
        });
        
        // Determine overall mood from recent outcomes
        if (positiveCount > negativeCount * 1.5) {
            outcomes.overall_mood = 'positive';
        } else if (negativeCount > positiveCount * 1.5) {
            outcomes.overall_mood = 'negative';
        }
        
        return outcomes;
    }

    /**
     * Extract frequent actions from all memories
     * @param {Array} allMemories - All memory entries
     * @returns {Object} - Action frequency counts
     */
    extractFrequentActions(allMemories) {
        const actionCounts = {};
        
        allMemories.forEach(memory => {
            const actionType = this.identifyActionType(memory);
            if (actionType) {
                actionCounts[actionType] = (actionCounts[actionType] || 0) + 1;
            }
        });
        
        // Sort by frequency
        const sortedActions = Object.entries(actionCounts)
            .sort(([,a], [,b]) => b - a)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
        
        return sortedActions;
    }

    /**
     * Extract known people from all memories
     * @param {Array} allMemories - All memory entries
     * @returns {Array} - List of known people with interaction counts
     */
    extractKnownPeople(allMemories) {
        const peopleCounts = {};
        
        allMemories.forEach(memory => {
            const people = this.extractNamesFromMemory(memory);
            people.forEach(person => {
                peopleCounts[person] = (peopleCounts[person] || 0) + 1;
            });
        });
        
        // Convert to array and sort by interaction frequency
        return Object.entries(peopleCounts)
            .map(([name, count]) => ({ name, interactions: count }))
            .sort((a, b) => b.interactions - a.interactions);
    }

    /**
     * Extract preferred locations from all memories
     * @param {Array} allMemories - All memory entries
     * @returns {Object} - Location preferences with success rates
     */
    extractPreferredLocations(allMemories) {
        const locationData = {};
        
        allMemories.forEach(memory => {
            const location = this.extractLocationFromMemory(memory);
            const outcome = this.classifyOutcome(memory);
            
            if (location) {
                if (!locationData[location]) {
                    locationData[location] = { visits: 0, successes: 0, failures: 0 };
                }
                
                locationData[location].visits++;
                if (outcome === 'success') locationData[location].successes++;
                if (outcome === 'failure') locationData[location].failures++;
            }
        });
        
        // Calculate success rates
        Object.keys(locationData).forEach(location => {
            const data = locationData[location];
            data.successRate = data.visits > 0 ? data.successes / data.visits : 0;
        });
        
        return locationData;
    }

    /**
     * Extract successful patterns from memories
     * @param {Array} allMemories - All memory entries
     * @returns {Array} - Patterns that led to success
     */
    extractSuccessfulPatterns(allMemories) {
        const patterns = [];
        
        // Look for sequences of actions that led to positive outcomes
        for (let i = 0; i < allMemories.length - 1; i++) {
            const currentMemory = allMemories[i];
            const nextMemory = allMemories[i + 1];
            
            const currentAction = this.identifyActionType(currentMemory);
            const nextOutcome = this.classifyOutcome(nextMemory);
            
            if (currentAction && nextOutcome === 'success') {
                patterns.push({
                    action: currentAction,
                    context: this.extractContextFromMemory(currentMemory),
                    outcome: 'success',
                    confidence: this.calculatePatternConfidence(currentAction, 'success', allMemories)
                });
            }
        }
        
        return patterns;
    }

    /**
     * Extract failure patterns from memories
     * @param {Array} allMemories - All memory entries
     * @returns {Array} - Patterns that led to failure
     */
    extractFailurePatterns(allMemories) {
        const patterns = [];
        
        for (let i = 0; i < allMemories.length - 1; i++) {
            const currentMemory = allMemories[i];
            const nextMemory = allMemories[i + 1];
            
            const currentAction = this.identifyActionType(currentMemory);
            const nextOutcome = this.classifyOutcome(nextMemory);
            
            if (currentAction && nextOutcome === 'failure') {
                patterns.push({
                    action: currentAction,
                    context: this.extractContextFromMemory(currentMemory),
                    outcome: 'failure',
                    confidence: this.calculatePatternConfidence(currentAction, 'failure', allMemories)
                });
            }
        }
        
        return patterns;
    }

    /**
     * Analyze behavior trends over time
     * @param {Array} allMemories - All memory entries
     * @returns {Object} - Behavior trend analysis
     */
    analyzeBehaviorTrends(allMemories) {
        const recent = allMemories.slice(-10); // Last 10 memories
        const older = allMemories.slice(0, -10);
        
        const recentActions = this.getActionFrequency(recent);
        const olderActions = this.getActionFrequency(older);
        
        const trends = {};
        
        // Compare recent vs older patterns
        Object.keys(recentActions).forEach(action => {
            const recentFreq = recentActions[action] / recent.length;
            const olderFreq = (olderActions[action] || 0) / Math.max(older.length, 1);
            
            if (recentFreq > olderFreq * 1.2) {
                trends[action] = 'increasing';
            } else if (recentFreq < olderFreq * 0.8) {
                trends[action] = 'decreasing';
            } else {
                trends[action] = 'stable';
            }
        });
        
        return trends;
    }

    /**
     * Analyze social interaction patterns
     * @param {Array} allMemories - All memory entries
     * @returns {Object} - Social pattern analysis
     */
    analyzeSocialPatterns(allMemories) {
        const socialMemories = allMemories.filter(memory => this.isConversationMemory(memory));
        const patterns = {
            interaction_frequency: socialMemories.length / Math.max(allMemories.length, 1),
            preferred_partners: {},
            conversation_topics: {},
            social_outcomes: { positive: 0, negative: 0, neutral: 0 },
            interaction_contexts: {}
        };
        
        socialMemories.forEach(memory => {
            // Track conversation partners
            const people = this.extractNamesFromMemory(memory);
            people.forEach(person => {
                patterns.preferred_partners[person] = (patterns.preferred_partners[person] || 0) + 1;
            });
            
            // Track conversation topics
            const topics = this.extractTopicsFromMemory(memory);
            topics.forEach(topic => {
                patterns.conversation_topics[topic] = (patterns.conversation_topics[topic] || 0) + 1;
            });
            
            // Track social outcomes
            const emotion = this.extractEmotionFromMemory(memory);
            if (emotion === 'positive') patterns.social_outcomes.positive++;
            else if (emotion === 'negative') patterns.social_outcomes.negative++;
            else patterns.social_outcomes.neutral++;
            
            // Track interaction contexts
            const context = this.extractContextFromMemory(memory);
            if (context) {
                patterns.interaction_contexts[context] = (patterns.interaction_contexts[context] || 0) + 1;
            }
        });
        
        return patterns;
    }

    /**
     * Analyze temporal (time-based) patterns
     * @param {Array} allMemories - All memory entries
     * @returns {Object} - Temporal pattern analysis
     */
    analyzeTemporalPatterns(allMemories) {
        const patterns = {
            morning_activities: [],
            afternoon_activities: [],
            evening_activities: [],
            peak_productivity_times: [],
            low_energy_times: []
        };
        
        allMemories.forEach(memory => {
            const timeContext = this.extractTimeFromMemory(memory);
            const action = this.identifyActionType(memory);
            const outcome = this.classifyOutcome(memory);
            
            if (timeContext && action) {
                // Categorize by time of day
                if (timeContext.includes('morning') || timeContext.includes('9') || timeContext.includes('10')) {
                    patterns.morning_activities.push(action);
                } else if (timeContext.includes('afternoon') || timeContext.includes('1') || timeContext.includes('2') || timeContext.includes('3')) {
                    patterns.afternoon_activities.push(action);
                } else if (timeContext.includes('evening') || timeContext.includes('5') || timeContext.includes('6')) {
                    patterns.evening_activities.push(action);
                }
                
                // Track productivity patterns
                if (outcome === 'success' && action === 'work') {
                    patterns.peak_productivity_times.push(timeContext);
                } else if (outcome === 'failure' || memory.toLowerCase().includes('tired')) {
                    patterns.low_energy_times.push(timeContext);
                }
            }
        });
        
        return patterns;
    }

    /**
     * Analyze emotional patterns from memories
     * @param {Array} allMemories - All memory entries
     * @returns {Object} - Emotional pattern analysis
     */
    analyzeEmotionalPatterns(allMemories) {
        const patterns = {
            dominant_emotion: 'neutral',
            emotion_triggers: {},
            mood_trajectory: [],
            stress_indicators: [],
            satisfaction_sources: []
        };
        
        const emotionCounts = { positive: 0, negative: 0, neutral: 0 };
        
        allMemories.forEach(memory => {
            const emotion = this.extractEmotionFromMemory(memory);
            const action = this.identifyActionType(memory);
            const context = this.extractContextFromMemory(memory);
            
            emotionCounts[emotion]++;
            patterns.mood_trajectory.push(emotion);
            
            // Track what triggers different emotions
            if (emotion !== 'neutral' && action) {
                if (!patterns.emotion_triggers[emotion]) {
                    patterns.emotion_triggers[emotion] = {};
                }
                patterns.emotion_triggers[emotion][action] = (patterns.emotion_triggers[emotion][action] || 0) + 1;
            }
            
            // Track stress indicators
            if (memory.toLowerCase().includes('stress') || memory.toLowerCase().includes('overwhelm') || 
                memory.toLowerCase().includes('frustrated')) {
                patterns.stress_indicators.push({ action, context });
            }
            
            // Track satisfaction sources
            if (emotion === 'positive') {
                patterns.satisfaction_sources.push({ action, context });
            }
        });
        
        // Determine dominant emotion
        patterns.dominant_emotion = Object.entries(emotionCounts)
            .reduce((a, b) => emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b)[0];
        
        return patterns;
    }

    /**
     * Calculate action modifiers based on memory patterns
     * @param {Array} allMemories - All memory entries
     * @returns {Object} - Action modifier values
     */
    calculateActionModifiers(allMemories) {
        const modifiers = {};
        
        // Analyze success/failure rates for each action type
        const actionOutcomes = {};
        
        allMemories.forEach(memory => {
            const action = this.identifyActionType(memory);
            const outcome = this.classifyOutcome(memory);
            
            if (action && outcome) {
                if (!actionOutcomes[action]) {
                    actionOutcomes[action] = { successes: 0, failures: 0, total: 0 };
                }
                
                actionOutcomes[action].total++;
                if (outcome === 'success') actionOutcomes[action].successes++;
                if (outcome === 'failure') actionOutcomes[action].failures++;
            }
        });
        
        // Calculate modifiers based on success rates
        Object.keys(actionOutcomes).forEach(action => {
            const data = actionOutcomes[action];
            const successRate = data.successes / data.total;
            
            if (successRate > 0.7) {
                modifiers[action] = this.patternWeights.frequent_success;
            } else if (successRate < 0.3) {
                modifiers[action] = this.patternWeights.frequent_failure;
            } else {
                modifiers[action] = 1.0; // Neutral
            }
        });
        
        return modifiers;
    }

    /**
     * Generate list of actions/contexts to avoid
     * @param {Array} shortTermMemories - Recent memories
     * @returns {Array} - Things to avoid
     */
    generateAvoidanceList(shortTermMemories) {
        const avoidance = [];
        
        shortTermMemories.forEach(memory => {
            const outcome = this.classifyOutcome(memory);
            const action = this.identifyActionType(memory);
            const context = this.extractContextFromMemory(memory);
            
            if (outcome === 'failure' && action) {
                avoidance.push({
                    type: 'action',
                    value: action,
                    reason: 'Recently failed',
                    context: context
                });
            }
            
            // Avoid people who caused negative interactions
            if (this.isConversationMemory(memory) && this.extractEmotionFromMemory(memory) === 'negative') {
                const people = this.extractNamesFromMemory(memory);
                people.forEach(person => {
                    avoidance.push({
                        type: 'person',
                        value: person,
                        reason: 'Recent negative interaction',
                        context: context
                    });
                });
            }
        });
        
        return avoidance;
    }

    /**
     * Generate list of preferred actions/contexts
     * @param {Array} allMemories - All memories
     * @returns {Array} - Preferences
     */
    generatePreferenceList(allMemories) {
        const preferences = [];
        
        // Find consistently successful patterns
        const actionSuccessRates = {};
        
        allMemories.forEach(memory => {
            const action = this.identifyActionType(memory);
            const outcome = this.classifyOutcome(memory);
            
            if (action && outcome) {
                if (!actionSuccessRates[action]) {
                    actionSuccessRates[action] = { successes: 0, total: 0 };
                }
                
                actionSuccessRates[action].total++;
                if (outcome === 'success') {
                    actionSuccessRates[action].successes++;
                }
            }
        });
        
        // Add high-success actions to preferences
        Object.entries(actionSuccessRates).forEach(([action, data]) => {
            const successRate = data.successes / data.total;
            if (successRate > 0.6 && data.total >= 3) { // At least 60% success rate with 3+ attempts
                preferences.push({
                    type: 'action',
                    value: action,
                    confidence: successRate,
                    reason: `${Math.round(successRate * 100)}% success rate`
                });
            }
        });
        
        return preferences.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Helper methods for memory analysis
     */

    getEmptyPatterns() {
        return {
            recentActions: [],
            recentConversations: [],
            recentLocations: [],
            recentOutcomes: { successes: [], failures: [], partials: [], overall_mood: 'neutral' },
            frequentActions: {},
            knownPeople: [],
            preferredLocations: {},
            successfulPatterns: [],
            failurePatterns: [],
            behaviorTrends: {},
            socialPatterns: {},
            temporalPatterns: {},
            emotionalPatterns: {},
            actionModifiers: {},
            avoidanceList: [],
            preferenceList: []
        };
    }

    identifyActionType(memory) {
        if (!memory || typeof memory !== 'string') return null;
        
        const memoryLower = memory.toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.actionKeywords)) {
            if (keywords.some(keyword => memoryLower.includes(keyword))) {
                return category;
            }
        }
        
        return null;
    }

    classifyOutcome(memory) {
        if (!memory || typeof memory !== 'string') return 'neutral';
        
        const memoryLower = memory.toLowerCase();
        
        for (const [outcome, keywords] of Object.entries(this.outcomeKeywords)) {
            if (keywords.some(keyword => memoryLower.includes(keyword))) {
                return outcome;
            }
        }
        
        return 'neutral';
    }

    extractEmotionFromMemory(memory) {
        if (!memory || typeof memory !== 'string') return 'neutral';
        
        const memoryLower = memory.toLowerCase();
        
        for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
            if (keywords.some(keyword => memoryLower.includes(keyword))) {
                return emotion;
            }
        }
        
        return 'neutral';
    }

    extractNamesFromMemory(memory) {
        if (!memory || typeof memory !== 'string') return [];
        
        // Simple name extraction - looks for capitalized words that might be names
        const words = memory.split(' ');
        const names = words.filter(word => {
            return word.length > 2 && 
                   word[0] === word[0].toUpperCase() && 
                   word.slice(1) === word.slice(1).toLowerCase() &&
                   !['The', 'A', 'An', 'I', 'He', 'She', 'They', 'We'].includes(word);
        });
        
        return [...new Set(names)]; // Remove duplicates
    }

    extractLocationFromMemory(memory) {
        if (!memory || typeof memory !== 'string') return null;
        
        const memoryLower = memory.toLowerCase();
        const locationKeywords = ['room', 'office', 'kitchen', 'hallway', 'lobby', 'desk', 'break'];
        
        const words = memory.split(' ');
        for (let i = 0; i < words.length; i++) {
            const word = words[i].toLowerCase();
            if (locationKeywords.some(keyword => word.includes(keyword))) {
                return words[i];
            }
        }
        
        return null;
    }

    extractContextFromMemory(memory) {
        if (!memory || typeof memory !== 'string') return null;
        
        const memoryLower = memory.toLowerCase();
        
        // Extract contextual information
        if (memoryLower.includes('crowded')) return 'crowded';
        if (memoryLower.includes('quiet')) return 'quiet';
        if (memoryLower.includes('busy')) return 'busy';
        if (memoryLower.includes('alone')) return 'alone';
        if (memoryLower.includes('meeting')) return 'meeting';
        if (memoryLower.includes('break')) return 'break_time';
        
        return null;
    }

    extractTimeFromMemory(memory) {
        if (!memory || typeof memory !== 'string') return null;
        
        const memoryLower = memory.toLowerCase();
        
        // Extract time references
        if (memoryLower.includes('morning')) return 'morning';
        if (memoryLower.includes('afternoon')) return 'afternoon';
        if (memoryLower.includes('evening')) return 'evening';
        if (memoryLower.includes('lunch')) return 'lunch_time';
        
        // Extract specific times
        const timeMatch = memory.match(/(\d{1,2}):(\d{2})|(\d{1,2})\s*(am|pm)/i);
        if (timeMatch) return timeMatch[0];
        
        return null;
    }

    extractTopicsFromMemory(memory) {
        if (!memory || typeof memory !== 'string') return [];
        
        const memoryLower = memory.toLowerCase();
        const topics = [];
        
        const topicKeywords = {
            work: ['project', 'task', 'deadline', 'meeting', 'report'],
            personal: ['family', 'weekend', 'hobby', 'vacation', 'health'],
            office: ['policy', 'announcement', 'event', 'training', 'equipment'],
            social: ['party', 'lunch', 'coffee', 'chat', 'gossip']
        };
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => memoryLower.includes(keyword))) {
                topics.push(topic);
            }
        });
        
        return topics;
    }

    isConversationMemory(memory) {
        if (!memory || typeof memory !== 'string') return false;
        
        const memoryLower = memory.toLowerCase();
        const conversationIndicators = ['talked', 'said', 'told', 'asked', 'mentioned', 'discussed', 'chat', 'conversation'];
        
        return conversationIndicators.some(indicator => memoryLower.includes(indicator));
    }

    getActionFrequency(memories) {
        const frequency = {};
        
        memories.forEach(memory => {
            const action = this.identifyActionType(memory);
            if (action) {
                frequency[action] = (frequency[action] || 0) + 1;
            }
        });
        
        return frequency;
    }

    calculatePatternConfidence(action, outcome, allMemories) {
        let matches = 0;
        let total = 0;
        
        allMemories.forEach(memory => {
            const memoryAction = this.identifyActionType(memory);
            const memoryOutcome = this.classifyOutcome(memory);
            
            if (memoryAction === action) {
                total++;
                if (memoryOutcome === outcome) {
                    matches++;
                }
            }
        });
        
        return total > 0 ? matches / total : 0;
    }

    /**
     * Public method to get decision influence from patterns
     * @param {Object} patterns - Extracted patterns
     * @param {string} proposedAction - Action being considered
     * @param {Object} context - Current context
     * @returns {number} - Influence multiplier (0.5 to 1.5)
     */
    getPatternInfluence(patterns, proposedAction, context) {
        let influence = 1.0;
        
        // Check avoidance list
        const shouldAvoid = patterns.avoidanceList.some(avoid => 
            avoid.type === 'action' && avoid.value === proposedAction
        );
        if (shouldAvoid) {
            influence *= this.patternWeights.recent_failure;
        }
        
        // Check preference list
        const isPreferred = patterns.preferenceList.some(pref => 
            pref.type === 'action' && pref.value === proposedAction
        );
        if (isPreferred) {
            influence *= this.patternWeights.recent_success;
        }
        
        // Check action modifiers
        if (patterns.actionModifiers[proposedAction]) {
            influence *= patterns.actionModifiers[proposedAction];
        }
        
        // Ensure reasonable bounds
        return Math.max(0.5, Math.min(1.5, influence));
    }
}
