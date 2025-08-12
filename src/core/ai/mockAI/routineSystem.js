/**
 * Routine System - Daily Pattern Management
 * Manages time-based behavioral routines and patterns
 * 
 * ROUTINE TYPES:
 * - Morning routines: Coffee, preparation, energy building
 * - Work routines: Focused periods, breaks, task patterns
 * - Social routines: Lunch interactions, break room visits
 * - End-of-day routines: Wrap-up, preparation for next day
 * 
 * ROUTINE TRIGGERS:
 * - Time-based: Specific hours or time ranges
 * - Need-based: Energy/hunger levels trigger routines
 * - Context-based: Location or social situation triggers
 * - Habit-based: Learned patterns from character history
 * 
 * EXPANSION NOTES:
 * - Add weekly routines (Monday blues, Friday energy)
 * - Implement seasonal routines (holiday patterns)
 * - Add disruption handling (meetings mess up routines)
 * - Create routine learning (characters develop new patterns)
 */

export class RoutineSystem {
    constructor() {
        // Base routine definitions
        this.routineDefinitions = {
            morning_coffee: {
                name: 'morning_coffee',
                timeRange: { start: 9, end: 10 },
                triggers: [
                    { type: 'time', condition: 'hour >= 9 && hour <= 10' },
                    { type: 'need', condition: 'energy < 5' },
                    { type: 'location', condition: 'break_room' }
                ],
                actions: ['MOVE_TO:break_room', 'DRINK_COFFEE'],
                priority: 0.7,
                frequency: 'daily',
                description: 'Morning coffee and energy restoration'
            },
            
            lunch_break: {
                name: 'lunch_break',
                timeRange: { start: 12, end: 13 },
                triggers: [
                    { type: 'time', condition: 'hour >= 12 && hour <= 13' },
                    { type: 'need', condition: 'hunger < 4' }
                ],
                actions: ['MOVE_TO:break_room', 'EAT_SNACK', 'SOCIALIZE'],
                priority: 0.8,
                frequency: 'daily',
                description: 'Lunch break and social time'
            },
            
            afternoon_coffee: {
                name: 'afternoon_coffee',
                timeRange: { start: 14, end: 16 },
                triggers: [
                    { type: 'time', condition: 'hour >= 14 && hour <= 16' },
                    { type: 'need', condition: 'energy < 4' }
                ],
                actions: ['DRINK_COFFEE'],
                priority: 0.6,
                frequency: 'daily',
                description: 'Afternoon energy boost'
            },
            
            focused_work: {
                name: 'focused_work',
                timeRange: { start: 10, end: 12 },
                triggers: [
                    { type: 'time', condition: 'hour >= 10 && hour <= 12' },
                    { type: 'need', condition: 'energy >= 6' },
                    { type: 'context', condition: 'quiet_environment' }
                ],
                actions: ['WORK_ON'],
                priority: 0.8,
                frequency: 'daily',
                description: 'Peak productivity period'
            },
            
            morning_prep: {
                name: 'morning_prep',
                timeRange: { start: 9, end: 9.5 },
                triggers: [
                    { type: 'time', condition: 'hour >= 9 && hour < 9.5' }
                ],
                actions: ['organize_workspace', 'check_emails', 'plan_day'],
                priority: 0.5,
                frequency: 'daily',
                description: 'Morning preparation and organization'
            },
            
            end_of_day: {
                name: 'end_of_day',
                timeRange: { start: 16.5, end: 17 },
                triggers: [
                    { type: 'time', condition: 'hour >= 16.5' }
                ],
                actions: ['wrap_up_tasks', 'organize_workspace', 'plan_tomorrow'],
                priority: 0.6,
                frequency: 'daily',
                description: 'End of day wrap-up'
            },
            
            social_break: {
                name: 'social_break',
                timeRange: { start: 15, end: 15.5 },
                triggers: [
                    { type: 'need', condition: 'social < 5' },
                    { type: 'context', condition: 'people_nearby' }
                ],
                actions: ['START_CONVERSATION', 'SOCIALIZE'],
                priority: 0.4,
                frequency: 'as_needed',
                description: 'Social interaction break'
            }
        };
        
        // Personality-based routine modifications
        this.personalityModifications = {
            'Ambitious': {
                focused_work: { priority: 1.2, duration: 1.3 },
                morning_prep: { priority: 1.3, actions: ['plan_day', 'set_goals', 'prioritize_tasks'] },
                social_break: { priority: 0.8 }
            },
            'Lazy': {
                focused_work: { priority: 0.7, duration: 0.8 },
                morning_coffee: { priority: 1.3, duration: 1.2 },
                afternoon_coffee: { priority: 1.2 },
                morning_prep: { priority: 0.6 }
            },
            'Extroverted': {
                social_break: { priority: 1.4, frequency: 'frequent' },
                lunch_break: { priority: 1.2, duration: 1.2 },
                morning_coffee: { actions: ['MOVE_TO:break_room', 'DRINK_COFFEE', 'SOCIALIZE'] }
            },
            'Introverted': {
                social_break: { priority: 0.6, frequency: 'rare' },
                focused_work: { priority: 1.1 },
                morning_prep: { priority: 1.1 }
            },
            'Organized': {
                morning_prep: { priority: 1.4, duration: 1.3 },
                end_of_day: { priority: 1.3, duration: 1.2 },
                focused_work: { priority: 1.1 }
            },
            'Chaotic': {
                morning_prep: { priority: 0.6 },
                end_of_day: { priority: 0.7 },
                // Add random routine disruptions
                random_breaks: { priority: 0.8, frequency: 'random' }
            },
            'Professional': {
                focused_work: { priority: 1.2 },
                morning_prep: { priority: 1.1 },
                social_break: { actions: ['professional_networking'] }
            }
        };
        
        // Weekly pattern modifications
        this.weeklyPatterns = {
            monday: {
                morning_prep: { priority: 1.2, description: 'Monday planning and goal setting' },
                focused_work: { priority: 1.1 }
            },
            tuesday: {
                focused_work: { priority: 1.2, description: 'Peak productivity day' }
            },
            wednesday: {
                social_break: { priority: 1.1, description: 'Mid-week social connections' }
            },
            thursday: {
                focused_work: { priority: 1.1 },
                end_of_day: { priority: 1.1 }
            },
            friday: {
                social_break: { priority: 1.3, description: 'Friday social energy' },
                end_of_day: { priority: 1.2, description: 'Week wrap-up' },
                lunch_break: { duration: 1.2, description: 'Extended Friday lunch' }
            }
        };
        
        console.log('📅 Routine System initialized');
    }

    /**
     * Get current active routine for a character
     * @param {Object} character - Character object
     * @param {Date} currentTime - Current game time
     * @returns {Object|null} - Active routine or null
     */
    getCurrentRoutine(character, currentTime = new Date()) {
        const hour = currentTime.getHours() + (currentTime.getMinutes() / 60);
        const dayOfWeek = this.getDayName(currentTime.getDay());
        
        // Check all routines for matches
        const activeRoutines = [];
        
        Object.values(this.routineDefinitions).forEach(routine => {
            if (this.isRoutineActive(routine, character, hour, dayOfWeek)) {
                const modifiedRoutine = this.applyModifications(routine, character, dayOfWeek);
                activeRoutines.push(modifiedRoutine);
            }
        });
        
        // Sort by priority and return the highest
        if (activeRoutines.length === 0) return null;
        
        activeRoutines.sort((a, b) => b.priority - a.priority);
        const selectedRoutine = activeRoutines[0];
        
        console.log(`📋 Active routine for ${character.name}: ${selectedRoutine.name}`);
        
        return {
            activeRoutine: selectedRoutine,
            alternatives: activeRoutines.slice(1),
            context: {
                hour,
                dayOfWeek,
                timeSlot: this.getTimeSlot(hour)
            }
        };
    }

    /**
     * Check if a routine is currently active
     * @param {Object} routine - Routine definition
     * @param {Object} character - Character object
     * @param {number} hour - Current hour (decimal)
     * @param {string} dayOfWeek - Day name
     * @returns {boolean} - True if routine is active
     */
    isRoutineActive(routine, character, hour, dayOfWeek) {
        // Check time range
        if (routine.timeRange) {
            if (hour < routine.timeRange.start || hour > routine.timeRange.end) {
                return false;
            }
        }
        
        // Check triggers
        return routine.triggers.some(trigger => 
            this.evaluateTrigger(trigger, character, hour, dayOfWeek)
        );
    }

    /**
     * Evaluate if a trigger condition is met
     * @param {Object} trigger - Trigger definition
     * @param {Object} character - Character object
     * @param {number} hour - Current hour
     * @param {string} dayOfWeek - Day name
     * @returns {boolean} - True if trigger is active
     */
    evaluateTrigger(trigger, character, hour, dayOfWeek) {
        switch (trigger.type) {
            case 'time':
                return this.evaluateTimeCondition(trigger.condition, hour);
                
            case 'need':
                return this.evaluateNeedCondition(trigger.condition, character);
                
            case 'location':
                // Would need current location context
                return true; // Simplified for now
                
            case 'context':
                return this.evaluateContextCondition(trigger.condition, character);
                
            default:
                return false;
        }
    }

    /**
     * Evaluate time-based condition
     * @param {string} condition - Condition string
     * @param {number} hour - Current hour
     * @returns {boolean} - True if condition met
     */
    evaluateTimeCondition(condition, hour) {
        try {
            // Replace 'hour' with actual value and evaluate
            const expression = condition.replace(/hour/g, hour.toString());
            return Function('"use strict"; return (' + expression + ')')();
        } catch (error) {
            console.warn('Error evaluating time condition:', condition, error);
            return false;
        }
    }

    /**
     * Evaluate need-based condition
     * @param {string} condition - Condition string
     * @param {Object} character - Character object
     * @returns {boolean} - True if condition met
     */
    evaluateNeedCondition(condition, character) {
        try {
            const energy = character.energy || 5;
            const hunger = character.hunger || 5;
            const social = character.social || 5;
            const stress = character.stress || 5;
            
            // Replace need variables with actual values
            let expression = condition
                .replace(/energy/g, energy.toString())
                .replace(/hunger/g, hunger.toString())
                .replace(/social/g, social.toString())
                .replace(/stress/g, stress.toString());
            
            return Function('"use strict"; return (' + expression + ')')();
        } catch (error) {
            console.warn('Error evaluating need condition:', condition, error);
            return false;
        }
    }

    /**
     * Evaluate context-based condition
     * @param {string} condition - Condition string
     * @param {Object} character - Character object
     * @returns {boolean} - True if condition met
     */
    evaluateContextCondition(condition, character) {
        // Simplified context evaluation
        switch (condition) {
            case 'quiet_environment':
                return true; // Would check actual environment noise
            case 'people_nearby':
                return true; // Would check nearby entities
            default:
                return true;
        }
    }

    /**
     * Apply personality and weekly modifications to a routine
     * @param {Object} routine - Base routine
     * @param {Object} character - Character object
     * @param {string} dayOfWeek - Current day
     * @returns {Object} - Modified routine
     */
    applyModifications(routine, character, dayOfWeek) {
        let modified = { ...routine };
        
        // Apply personality modifications
        const personality = character.personalityTags || [];
        personality.forEach(trait => {
            const traitMods = this.personalityModifications[trait];
            if (traitMods && traitMods[routine.name]) {
                const mods = traitMods[routine.name];
                
                if (mods.priority) modified.priority *= mods.priority;
                if (mods.duration) modified.duration = (modified.duration || 1) * mods.duration;
                if (mods.actions) modified.actions = mods.actions;
                if (mods.frequency) modified.frequency = mods.frequency;
            }
        });
        
        // Apply weekly modifications
        const weeklyMods = this.weeklyPatterns[dayOfWeek];
        if (weeklyMods && weeklyMods[routine.name]) {
            const mods = weeklyMods[routine.name];
            
            if (mods.priority) modified.priority *= mods.priority;
            if (mods.duration) modified.duration = (modified.duration || 1) * mods.duration;
            if (mods.description) modified.description = mods.description;
        }
        
        return modified;
    }

    /**
     * Get suggested action from current routine
     * @param {Object} routineContext - Current routine context
     * @param {Object} character - Character object
     * @returns {Object|null} - Suggested action
     */
    getRoutineAction(routineContext, character) {
        if (!routineContext || !routineContext.activeRoutine) {
            return null;
        }
        
        const routine = routineContext.activeRoutine;
        const actions = routine.actions || [];
        
        if (actions.length === 0) return null;
        
        // Select action based on character state and routine progress
        let selectedAction = actions[0]; // Default to first action
        
        // For multi-action routines, consider character's current state
        if (actions.length > 1) {
            selectedAction = this.selectBestRoutineAction(actions, character, routine);
        }
        
        return {
            type: 'ACTION',
            action: this.parseRoutineAction(selectedAction),
            priority: routine.priority,
            source: 'routine',
            routine: routine.name,
            reasoning: `Following ${routine.name} routine - ${routine.description}`
        };
    }

    /**
     * Select the best action from a routine's action list
     * @param {Array} actions - Available actions
     * @param {Object} character - Character object
     * @param {Object} routine - Routine object
     * @returns {string} - Selected action
     */
    selectBestRoutineAction(actions, character, routine) {
        // Priority logic for different routines
        if (routine.name === 'lunch_break') {
            // Check if hungry first
            if ((character.hunger || 5) < 4 && actions.includes('EAT_SNACK')) {
                return 'EAT_SNACK';
            }
            // Then socialize if not too introverted
            if ((character.social || 5) < 6 && !character.personalityTags?.includes('Introverted')) {
                return 'SOCIALIZE';
            }
        }
        
        if (routine.name === 'morning_coffee') {
            // Always prioritize coffee if energy is low
            if ((character.energy || 5) < 4) {
                return 'DRINK_COFFEE';
            }
        }
        
        if (routine.name === 'focused_work') {
            // Work actions when energy is sufficient
            if ((character.energy || 5) >= 5) {
                return 'WORK_ON';
            }
        }
        
        // Default to first action
        return actions[0];
    }

    /**
     * Parse a routine action string into structured action
     * @param {string} actionString - Action string (e.g., "MOVE_TO:break_room")
     * @returns {Object} - Parsed action object
     */
    parseRoutineAction(actionString) {
        if (actionString.includes(':')) {
            const [type, target] = actionString.split(':');
            return {
                type: type,
                target: target,
                duration: this.getDefaultActionDuration(type)
            };
        }
        
        return {
            type: actionString,
            duration: this.getDefaultActionDuration(actionString)
        };
    }

    /**
     * Get default duration for action types
     * @param {string} actionType - Type of action
     * @returns {number} - Duration in milliseconds
     */
    getDefaultActionDuration(actionType) {
        const durations = {
            'MOVE_TO': 8000,
            'DRINK_COFFEE': 8000,
            'EAT_SNACK': 10000,
            'WORK_ON': 15000,
            'SOCIALIZE': 12000,
            'START_CONVERSATION': 5000,
            'organize_workspace': 6000,
            'check_emails': 4000,
            'plan_day': 5000,
            'wrap_up_tasks': 8000
        };
        
        return durations[actionType] || 5000;
    }

    /**
     * Check if character should break from routine
     * @param {Object} character - Character object
     * @param {Object} currentRoutine - Current routine
     * @returns {boolean} - True if should break routine
     */
    shouldBreakRoutine(character, currentRoutine) {
        // Critical needs override routines
        const energy = character.energy || 5;
        const hunger = character.hunger || 5;
        const stress = character.stress || 5;
        
        if (energy <= 2 || hunger <= 2 || stress >= 8) {
            return true;
        }
        
        // Chaotic personality sometimes breaks routines
        if (character.personalityTags?.includes('Chaotic') && Math.random() < 0.1) {
            return true;
        }
        
        // External interruptions (would be handled by higher-level systems)
        // e.g., meetings, urgent tasks, etc.
        
        return false;
    }

    /**
     * Get next expected routine for planning
     * @param {Object} character - Character object
     * @param {Date} currentTime - Current time
     * @returns {Object|null} - Next routine
     */
    getNextRoutine(character, currentTime = new Date()) {
        const currentHour = currentTime.getHours() + (currentTime.getMinutes() / 60);
        const dayOfWeek = this.getDayName(currentTime.getDay());
        
        let nextRoutine = null;
        let minTimeToNext = Infinity;
        
        Object.values(this.routineDefinitions).forEach(routine => {
            if (routine.timeRange) {
                let timeToStart = routine.timeRange.start - currentHour;
                
                // If routine is today but time has passed, check tomorrow
                if (timeToStart < 0) {
                    timeToStart += 24; // Tomorrow
                }
                
                if (timeToStart < minTimeToNext) {
                    minTimeToNext = timeToStart;
                    nextRoutine = routine;
                }
            }
        });
        
        return nextRoutine ? {
            routine: nextRoutine,
            timeUntilStart: minTimeToNext,
            estimatedStartTime: new Date(currentTime.getTime() + (minTimeToNext * 60 * 60 * 1000))
        } : null;
    }

    /**
     * Generate routine-based reasoning for decisions
     * @param {Object} routine - Active routine
     * @param {Object} character - Character object
     * @returns {string} - Reasoning text
     */
    generateRoutineReasoning(routine, character) {
        const timeSlot = this.getTimeSlot(new Date().getHours());
        const personalityFactors = [];
        
        // Add personality-specific reasoning
        if (character.personalityTags?.includes('Organized')) {
            personalityFactors.push('maintaining schedule');
        }
        if (character.personalityTags?.includes('Professional')) {
            personalityFactors.push('following professional routine');
        }
        if (character.personalityTags?.includes('Ambitious')) {
            personalityFactors.push('optimizing productivity');
        }
        
        const baseReason = `${timeSlot} routine: ${routine.description}`;
        const personalityReason = personalityFactors.length > 0 ? 
            ` (${personalityFactors.join(', ')})` : '';
        
        return baseReason + personalityReason;
    }

    /**
     * Utility methods
     */
    getDayName(dayIndex) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[dayIndex] || 'unknown';
    }

    getTimeSlot(hour) {
        if (hour < 9) return 'early_morning';
        if (hour < 12) return 'morning';
        if (hour < 14) return 'lunch_time';
        if (hour < 17) return 'afternoon';
        if (hour < 19) return 'evening';
        return 'night';
    }

    /**
     * Create custom routine for a character
     * @param {Object} character - Character object
     * @param {Object} routineTemplate - Custom routine definition
     * @returns {Object} - Created routine
     */
    createCustomRoutine(character, routineTemplate) {
        const customRoutine = {
            ...routineTemplate,
            id: `custom_${character.id}_${Date.now()}`,
            isCustom: true,
            characterId: character.id
        };
        
        // Apply immediate personality modifications
        const personality = character.personalityTags || [];
        personality.forEach(trait => {
            const traitMods = this.personalityModifications[trait];
            if (traitMods && traitMods[customRoutine.name]) {
                const mods = traitMods[customRoutine.name];
                Object.assign(customRoutine, mods);
            }
        });
        
        return customRoutine;
    }

    /**
     * Get routine statistics for character
     * @param {Object} character - Character object
     * @param {Array} routineHistory - History of completed routines
     * @returns {Object} - Routine statistics
     */
    getRoutineStats(character, routineHistory = []) {
        const stats = {
            totalRoutines: routineHistory.length,
            completedSuccessfully: 0,
            interrupted: 0,
            mostCommonRoutine: null,
            averageCompletionTime: 0,
            personalityAlignment: 0
        };
        
        if (routineHistory.length === 0) return stats;
        
        const routineCounts = {};
        let totalTime = 0;
        
        routineHistory.forEach(entry => {
            // Count routine types
            routineCounts[entry.routineName] = (routineCounts[entry.routineName] || 0) + 1;
            
            // Track completion status
            if (entry.completed) stats.completedSuccessfully++;
            else stats.interrupted++;
            
            // Track time
            if (entry.duration) totalTime += entry.duration;
        });
        
        // Find most common routine
        stats.mostCommonRoutine = Object.entries(routineCounts)
            .reduce((a, b) => routineCounts[a[0]] > routineCounts[b[0]] ? a : b)[0];
        
        // Calculate average time
        stats.averageCompletionTime = totalTime / routineHistory.length;
        
        // Calculate personality alignment (how well routines match personality)
        stats.personalityAlignment = this.calculatePersonalityAlignment(character, routineHistory);
        
        return stats;
    }

    /**
     * Calculate how well routines align with personality
     * @param {Object} character - Character object
     * @param {Array} routineHistory - Routine history
     * @returns {number} - Alignment score (0-1)
     */
    calculatePersonalityAlignment(character, routineHistory) {
        if (!character.personalityTags || routineHistory.length === 0) return 0.5;
        
        let alignmentScore = 0;
        let totalWeight = 0;
        
        routineHistory.forEach(entry => {
            const routine = this.routineDefinitions[entry.routineName];
            if (!routine) return;
            
            let entryScore = 0.5; // Base score
            
            character.personalityTags.forEach(trait => {
                const traitMods = this.personalityModifications[trait];
                if (traitMods && traitMods[routine.name]) {
                    // Higher priority routines for this personality type = better alignment
                    const priorityMod = traitMods[routine.name].priority || 1;
                    if (priorityMod > 1) entryScore += 0.2;
                    else if (priorityMod < 1) entryScore -= 0.2;
                }
            });
            
            alignmentScore += entryScore;
            totalWeight += 1;
        });
        
        return totalWeight > 0 ? Math.max(0, Math.min(1, alignmentScore / totalWeight)) : 0.5;
    }
}
