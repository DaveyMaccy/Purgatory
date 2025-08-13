/**
 * Context Analyzer - Environmental Decision Factors
 * Analyzes environmental context to influence decision making
 * 
 * ENVIRONMENTAL FACTORS:
 * - Crowdedness: Number of people in area affects introverted/extroverted behavior
 * - Privacy: Affects likelihood of personal conversations and behaviors
 * - Location Type: Different behaviors appropriate for different areas
 * - Time Context: Morning vs afternoon vs evening behaviors
 * - Available Resources: Coffee machines, food, comfortable seating
 * 
 * LOCATION TYPES:
 * - Office/Workspace: Work-focused behavior, professional interactions
 * - Break Room: Social behavior, need satisfaction (food, coffee)
 * - Meeting Room: Formal behavior, work discussions
 * - Hallway: Brief interactions, movement-focused
 * - Private Office: Personal tasks, focused work, private conversations
 * 
 * EXPANSION NOTES:
 * - Add weather effects (rainy days = more indoor socializing)
 * - Implement noise level detection (affects concentration)
 * - Add seasonal context (holidays, busy periods)
 * - Create location memory (characters remember what happens where)
 */

export class ContextAnalyzer {
    constructor() {
        // Location type classifications
        this.locationTypes = {
            office: ['office', 'workspace', 'desk', 'cubicle'],
            break_room: ['break_room', 'kitchen', 'lounge', 'cafeteria'],
            meeting_room: ['meeting_room', 'conference_room', 'boardroom'],
            hallway: ['hallway', 'corridor', 'entrance', 'lobby'],
            private: ['private_office', 'manager_office', 'bathroom'],
            outdoor: ['patio', 'balcony', 'parking', 'garden']
        };
        
        // Context factors that influence behavior
        this.contextFactors = {
            crowdedness: {
                empty: 0,      // No one else around
                sparse: 1,     // 1-2 people
                moderate: 3,   // 3-5 people  
                crowded: 6,    // 6+ people
                packed: 10     // 10+ people
            },
            privacy: {
                public: 1,     // Open area, everyone can see/hear
                semi_private: 5, // Some privacy, nearby people
                private: 10    // Private area, no one else around
            },
            formality: {
                casual: 1,     // Break room, informal areas
                neutral: 5,    // General office areas
                formal: 10     // Meeting rooms, manager offices
            }
        };
        
        // Behavioral modifiers by location type
        this.locationBehaviors = {
            office: {
                work_bonus: 1.3,
                social_penalty: 0.8,
                formality: 7,
                noise_tolerance: 0.6
            },
            break_room: {
                social_bonus: 1.5,
                work_penalty: 0.4,
                formality: 3,
                needs_satisfaction_bonus: 1.4
            },
            meeting_room: {
                formality: 9,
                social_bonus: 1.2, // But formal social
                work_bonus: 1.1,
                personal_penalty: 0.2
            },
            hallway: {
                brief_interaction_bonus: 1.3,
                long_conversation_penalty: 0.6,
                movement_bonus: 1.2
            },
            private: {
                personal_bonus: 1.4,
                formal_penalty: 0.7,
                concentration_bonus: 1.3
            }
        };
        
        console.log('🔍 Context Analyzer initialized');
    }

    /**
     * Analyze environmental context from prompt data
     * @param {Object} promptContext - Parsed prompt context
     * @returns {Object} - Environmental analysis
     */
    analyze(promptContext) {
        const analysis = {
            location: this.analyzeLocation(promptContext.location),
            crowdedness: this.analyzeCrowdedness(promptContext.nearbyEntities),
            privacy: this.analyzePrivacy(promptContext.privacy, promptContext.nearbyEntities),
            social_opportunities: this.analyzeSocialOpportunities(promptContext.nearbyEntities),
            resource_availability: this.analyzeResources(promptContext.availableActions),
            time_context: this.analyzeTimeContext(),
            behavioral_modifiers: {}
        };
        
        // Calculate behavioral modifiers based on context
        analysis.behavioral_modifiers = this.calculateBehavioralModifiers(analysis);
        
        // Add convenience flags
        analysis.crowded = analysis.crowdedness.level >= this.contextFactors.crowdedness.moderate;
        analysis.private_enough = analysis.privacy.score >= 7;
        analysis.formal_setting = analysis.location.formality >= 7;
        analysis.good_for_socializing = this.isGoodForSocializing(analysis);
        analysis.good_for_work = this.isGoodForWork(analysis);
        analysis.good_for_needs = this.isGoodForNeeds(analysis);
        
        console.log(`🌍 Context analysis: ${analysis.location.type} (${analysis.crowdedness.description})`);
        
        return analysis;
    }

    /**
     * Analyze location type and characteristics
     * @param {string} locationString - Location string from prompt
     * @returns {Object} - Location analysis
     */
    analyzeLocation(locationString) {
        if (!locationString) {
            return {
                type: 'unknown',
                name: 'unknown',
                formality: 5,
                characteristics: []
            };
        }
        
        const location = locationString.toLowerCase();
        
        // Determine location type
        let locationType = 'unknown';
        for (const [type, keywords] of Object.entries(this.locationTypes)) {
            if (keywords.some(keyword => location.includes(keyword))) {
                locationType = type;
                break;
            }
        }
        
        // Get location behaviors
        const behaviors = this.locationBehaviors[locationType] || {};
        
        return {
            type: locationType,
            name: locationString,
            formality: behaviors.formality || 5,
            characteristics: this.getLocationCharacteristics(locationType),
            behaviors: behaviors
        };
    }

    /**
     * Get characteristics for a location type
     * @param {string} locationType - Type of location
     * @returns {Array} - Array of characteristic strings
     */
    getLocationCharacteristics(locationType) {
        const characteristics = {
            office: ['work-focused', 'professional', 'task-oriented'],
            break_room: ['social', 'relaxed', 'need-satisfaction'],
            meeting_room: ['formal', 'collaborative', 'structured'],
            hallway: ['transitional', 'brief-interactions', 'movement'],
            private: ['personal', 'concentrated', 'confidential'],
            outdoor: ['fresh-air', 'informal', 'energizing']
        };
        
        return characteristics[locationType] || ['neutral'];
    }

    /**
     * Analyze crowdedness based on nearby entities
     * @param {Array} nearbyEntities - List of nearby people/objects
     * @returns {Object} - Crowdedness analysis
     */
    analyzeCrowdedness(nearbyEntities) {
        const people = nearbyEntities ? nearbyEntities.filter(entity => 
            entity.type === 'Character' || entity.type === 'character'
        ) : [];
        
        const count = people.length;
        let level, description;
        
        if (count === 0) {
            level = this.contextFactors.crowdedness.empty;
            description = 'empty';
        } else if (count <= 2) {
            level = this.contextFactors.crowdedness.sparse;
            description = 'sparse';
        } else if (count <= 5) {
            level = this.contextFactors.crowdedness.moderate;
            description = 'moderate';
        } else if (count <= 9) {
            level = this.contextFactors.crowdedness.crowded;
            description = 'crowded';
        } else {
            level = this.contextFactors.crowdedness.packed;
            description = 'packed';
        }
        
        return {
            count,
            level,
            description,
            people: people.map(p => ({ name: p.name, distance: p.distance }))
        };
    }

    /**
     * Analyze privacy level
     * @param {number} privacyScore - Privacy score from prompt (0-10)
     * @param {Array} nearbyEntities - Nearby people
     * @returns {Object} - Privacy analysis
     */
    analyzePrivacy(privacyScore, nearbyEntities) {
        // Use provided privacy score or calculate from context
        let score = privacyScore || 5;
        
        // Adjust based on nearby people if no explicit score
        if (!privacyScore && nearbyEntities) {
            const nearbyPeople = nearbyEntities.filter(e => e.type === 'Character').length;
            if (nearbyPeople === 0) score = 10;
            else if (nearbyPeople <= 2) score = 7;
            else if (nearbyPeople <= 5) score = 4;
            else score = 2;
        }
        
        let level;
        if (score >= 8) level = 'private';
        else if (score >= 5) level = 'semi_private';
        else level = 'public';
        
        return {
            score,
            level,
            suitable_for_personal: score >= 6,
            suitable_for_confidential: score >= 8,
            eavesdropping_risk: score < 4
        };
    }

    /**
     * Analyze social opportunities in current context
     * @param {Array} nearbyEntities - Nearby people and objects
     * @returns {Object} - Social opportunities analysis
     */
    analyzeSocialOpportunities(nearbyEntities) {
        const people = nearbyEntities ? nearbyEntities.filter(entity => 
            entity.type === 'Character'
        ) : [];
        
        const opportunities = {
            total_people: people.length,
            conversation_targets: [],
            group_opportunities: [],
            networking_potential: 0,
            social_barriers: []
        };
        
        // Analyze individual conversation opportunities
        people.forEach(person => {
            const distance = person.distance || 10;
            const mood = person.mood || 'neutral';
            
            if (distance <= 3) {
                opportunities.conversation_targets.push({
                    name: person.name,
                    distance,
                    mood,
                    approachability: this.calculateApproachability(person),
                    conversation_type: this.suggestConversationType(person)
                });
            }
        });
        
        // Analyze group opportunities
        if (people.length >= 3) {
            const groups = this.identifyGroups(people);
            opportunities.group_opportunities = groups;
        }
        
        // Calculate networking potential (for ambitious characters)
        opportunities.networking_potential = Math.min(10, people.length * 2);
        
        // Identify social barriers
        if (people.length > 6) {
            opportunities.social_barriers.push('too_crowded');
        }
        
        const busyPeople = people.filter(p => p.mood === 'focused' || p.mood === 'busy').length;
        if (busyPeople > people.length * 0.5) {
            opportunities.social_barriers.push('people_busy');
        }
        
        return opportunities;
    }

    /**
     * Calculate how approachable a person is
     * @param {Object} person - Person entity
     * @returns {number} - Approachability score (0-10)
     */
    calculateApproachability(person) {
        let score = 5; // Base approachability
        
        // Mood affects approachability
        const moodModifiers = {
            'happy': +3,
            'friendly': +2,
            'neutral': 0,
            'focused': -2,
            'busy': -3,
            'stressed': -2,
            'angry': -4
        };
        
        score += moodModifiers[person.mood] || 0;
        
        // Distance affects approachability (closer = more approachable)
        if (person.distance <= 1) score += 2;
        else if (person.distance <= 2) score += 1;
        else if (person.distance >= 5) score -= 1;
        
        return Math.max(0, Math.min(10, score));
    }

    /**
     * Suggest conversation type based on person and context
     * @param {Object} person - Person entity
     * @returns {string} - Suggested conversation type
     */
    suggestConversationType(person) {
        if (person.mood === 'busy' || person.mood === 'focused') {
            return 'brief_greeting';
        }
        
        if (person.mood === 'stressed') {
            return 'supportive';
        }
        
        if (person.mood === 'happy' || person.mood === 'friendly') {
            return 'casual_chat';
        }
        
        return 'small_talk';
    }

    /**
     * Identify conversation groups among nearby people
     * @param {Array} people - List of people
     * @returns {Array} - Identified groups
     */
    identifyGroups(people) {
        const groups = [];
        
        // Simple grouping based on proximity
        // In a real implementation, this would be more sophisticated
        if (people.length >= 3) {
            const closeGroups = people.filter(p => p.distance <= 2);
            if (closeGroups.length >= 2) {
                groups.push({
                    type: 'conversation_circle',
                    size: closeGroups.length,
                    approachable: closeGroups.length <= 4, // Large groups harder to join
                    members: closeGroups.map(p => p.name)
                });
            }
        }
        
        return groups;
    }

    /**
     * Analyze available resources in the area
     * @param {Array} availableActions - Available actions from prompt
     * @returns {Object} - Resource analysis
     */
    analyzeResources(availableActions) {
        const resources = {
            coffee: false,
            food: false,
            seating: false,
            work_tools: false,
            entertainment: false,
            communication: false
        };
        
        if (!availableActions) return resources;
        
        // Check for different types of resources
        availableActions.forEach(action => {
            const desc = action.description?.toLowerCase() || '';
            const type = action.type?.toLowerCase() || '';
            
            // Coffee resources
            if (type.includes('coffee') || desc.includes('coffee') || desc.includes('drink')) {
                resources.coffee = true;
            }
            
            // Food resources
            if (type.includes('snack') || type.includes('eat') || desc.includes('food') || desc.includes('snack')) {
                resources.food = true;
            }
            
            // Work tools
            if (type.includes('work') || desc.includes('computer') || desc.includes('task')) {
                resources.work_tools = true;
            }
            
            // Communication
            if (type.includes('conversation') || desc.includes('talk') || desc.includes('phone')) {
                resources.communication = true;
            }
        });
        
        return resources;
    }

    /**
     * Analyze time-based context
     * @returns {Object} - Time context analysis
     */
    analyzeTimeContext() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        let period, energy_trend, social_trend;
        
        // Determine time period and associated trends
        if (hour < 9) {
            period = 'early_morning';
            energy_trend = 'building';
            social_trend = 'low';
        } else if (hour < 12) {
            period = 'morning';
            energy_trend = 'high';
            social_trend = 'moderate';
        } else if (hour === 12 || (hour === 13 && minute < 30)) {
            period = 'lunch_time';
            energy_trend = 'moderate';
            social_trend = 'high';
        } else if (hour < 17) {
            period = 'afternoon';
            energy_trend = 'declining';
            social_trend = 'moderate';
        } else if (hour < 19) {
            period = 'evening';
            energy_trend = 'low';
            social_trend = 'wind_down';
        } else {
            period = 'night';
            energy_trend = 'very_low';
            social_trend = 'personal';
        }
        
        return {
            hour,
            minute,
            period,
            energy_trend,
            social_trend,
            is_working_hours: hour >= 9 && hour <= 17,
            is_lunch_time: (hour === 12) || (hour === 13 && minute <= 30),
            is_break_time: minute >= 45 || minute <= 15, // Top/bottom of hour
            is_peak_productivity: hour >= 10 && hour <= 11 || hour >= 14 && hour <= 15
        };
    }

    /**
     * Calculate behavioral modifiers based on all context factors
     * @param {Object} analysis - Complete context analysis
     * @returns {Object} - Behavioral modifier values
     */
    calculateBehavioralModifiers(analysis) {
        const modifiers = {
            work_preference: 1.0,
            social_preference: 1.0,
            movement_preference: 1.0,
            rest_preference: 1.0,
            formality_requirement: 1.0,
            noise_tolerance: 1.0
        };
        
        // Location-based modifiers
        const locationBehaviors = analysis.location.behaviors || {};
        if (locationBehaviors.work_bonus) modifiers.work_preference *= locationBehaviors.work_bonus;
        if (locationBehaviors.social_bonus) modifiers.social_preference *= locationBehaviors.social_bonus;
        if (locationBehaviors.work_penalty) modifiers.work_preference *= locationBehaviors.work_penalty;
        if (locationBehaviors.social_penalty) modifiers.social_preference *= locationBehaviors.social_penalty;
        
        // Crowdedness modifiers
        if (analysis.crowdedness.level >= 6) {
            modifiers.social_preference *= 0.8; // Even extroverts overwhelmed by crowds
            modifiers.work_preference *= 0.7;   // Hard to concentrate
            modifiers.movement_preference *= 1.2; // Want to leave
        } else if (analysis.crowdedness.level === 0) {
            modifiers.social_preference *= 0.5; // No one to socialize with
            modifiers.work_preference *= 1.1;   // Good for concentration
        }
        
        // Privacy modifiers
        if (analysis.privacy.score >= 8) {
            modifiers.personal_conversation_bonus = 1.3;
            modifiers.confidential_work_bonus = 1.2;
        } else if (analysis.privacy.score <= 3) {
            modifiers.personal_conversation_penalty = 0.6;
            modifiers.formality_requirement *= 1.3;
        }
        
        // Time-based modifiers
        const timeContext = analysis.time_context;
        if (timeContext.is_lunch_time) {
            modifiers.social_preference *= 1.4;
            modifiers.food_seeking_bonus = 1.5;
        }
        
        if (timeContext.is_peak_productivity) {
            modifiers.work_preference *= 1.2;
            modifiers.interruption_tolerance = 0.8;
        }
        
        if (timeContext.energy_trend === 'declining' || timeContext.energy_trend === 'low') {
            modifiers.rest_preference *= 1.3;
            modifiers.coffee_seeking_bonus = 1.4;
        }
        
        return modifiers;
    }

    /**
     * Determine if context is good for socializing
     * @param {Object} analysis - Context analysis
     * @returns {boolean} - True if good for socializing
     */
    isGoodForSocializing(analysis) {
        return analysis.social_opportunities.total_people > 0 &&
               analysis.crowdedness.level < 8 && // Not too crowded
               analysis.location.type !== 'private' && // Not in private area
               !analysis.social_opportunities.social_barriers.includes('people_busy');
    }

    /**
     * Determine if context is good for work
     * @param {Object} analysis - Context analysis
     * @returns {boolean} - True if good for work
     */
    isGoodForWork(analysis) {
        return (analysis.location.type === 'office' || analysis.location.type === 'private') &&
               analysis.crowdedness.level < 6 && // Not too distracting
               analysis.resource_availability.work_tools &&
               analysis.time_context.is_working_hours;
    }

    /**
     * Determine if context is good for satisfying needs
     * @param {Object} analysis - Context analysis
     * @returns {boolean} - True if good for needs
     */
    isGoodForNeeds(analysis) {
        return analysis.location.type === 'break_room' ||
               analysis.resource_availability.coffee ||
               analysis.resource_availability.food;
    }

    /**
     * Get context-appropriate action suggestions
     * @param {Object} analysis - Context analysis
     * @param {Array} availableActions - Available actions
     * @returns {Array} - Prioritized action suggestions
     */
    suggestContextAppropriateActions(analysis, availableActions) {
        if (!availableActions) return [];
        
        const suggestions = availableActions.map(action => ({
            ...action,
            contextScore: this.scoreActionForContext(action, analysis)
        }));
        
        // Sort by context appropriateness
        suggestions.sort((a, b) => b.contextScore - a.contextScore);
        
        return suggestions;
    }

    /**
     * Score how appropriate an action is for the current context
     * @param {Object} action - Action to score
     * @param {Object} analysis - Context analysis
     * @returns {number} - Context appropriateness score (0-10)
     */
    scoreActionForContext(action, analysis) {
        let score = 5; // Base score
        
        const actionType = action.type?.toLowerCase() || '';
        const description = action.description?.toLowerCase() || '';
        
        // Location appropriateness
        if (analysis.location.type === 'break_room') {
            if (actionType.includes('coffee') || actionType.includes('snack') || actionType.includes('socialize')) {
                score += 2;
            }
            if (actionType.includes('work')) {
                score -= 2;
            }
        } else if (analysis.location.type === 'office') {
            if (actionType.includes('work')) {
                score += 2;
            }
            if (actionType.includes('socialize') && analysis.crowdedness.level > 3) {
                score -= 1; // Inappropriate in busy office
            }
        }
        
        // Crowdedness appropriateness
        if (analysis.crowded) {
            if (actionType.includes('conversation') || description.includes('talk')) {
                score -= 1; // Harder to have conversations in crowds
            }
            if (actionType.includes('move')) {
                score += 1; // Moving away from crowds can be good
            }
        }
        
        // Privacy appropriateness
        if (analysis.privacy.score < 4) {
            if (description.includes('personal') || description.includes('private')) {
                score -= 2; // Not appropriate in public
            }
        }
        
        // Time appropriateness
        if (analysis.time_context.is_lunch_time) {
            if (actionType.includes('eat') || actionType.includes('snack')) {
                score += 2;
            }
        }
        
        return Math.max(0, Math.min(10, score));
    }

    /**
     * Generate context summary for debugging
     * @param {Object} analysis - Context analysis
     * @returns {string} - Human-readable context summary
     */
    generateContextSummary(analysis) {
        const parts = [];
        
        parts.push(`Location: ${analysis.location.name} (${analysis.location.type})`);
        parts.push(`Crowdedness: ${analysis.crowdedness.description} (${analysis.crowdedness.count} people)`);
        parts.push(`Privacy: ${analysis.privacy.level} (${analysis.privacy.score}/10)`);
        parts.push(`Time: ${analysis.time_context.period}`);
        
        if (analysis.good_for_socializing) parts.push('Good for socializing');
        if (analysis.good_for_work) parts.push('Good for work');
        if (analysis.good_for_needs) parts.push('Good for needs');
        
        if (analysis.social_opportunities.social_barriers.length > 0) {
            parts.push(`Barriers: ${analysis.social_opportunities.social_barriers.join(', ')}`);
        }
        
        return parts.join(' | ');
    }
}
