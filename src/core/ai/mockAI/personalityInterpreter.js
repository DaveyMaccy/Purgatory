/**
 * Personality Interpreter - Trait-Based Decision Modification
 * Modifies decisions based on character personality traits
 * 
 * PERSONALITY TRAITS SUPPORTED:
 * - Ambitious: Longer work sessions, seeks advancement, competitive
 * - Lazy: Avoids work, seeks comfort, longer breaks
 * - Extroverted: Seeks social interaction, initiates conversations
 * - Introverted: Avoids crowds, shorter social interactions
 * - Organized: Follows routines, completes tasks systematically
 * - Chaotic: Random behavior, abandons tasks, unpredictable
 * - Gossip: Seeks information, shares rumors, social butterfly
 * - Professional: Formal behavior, work-focused, avoids personal topics
 * 
 * EXPANSION NOTES:
 * - Add trait combinations (e.g., Ambitious + Organized = Perfectionist)
 * - Implement trait evolution (traits can strengthen/weaken over time)
 * - Add situational trait modifiers (stress makes organized people chaotic)
 * - Create trait conflict resolution (ambitious but lazy)
 */

import { MockAIConfig } from './config.js';

export class PersonalityInterpreter {
    constructor() {
        this.config = MockAIConfig;
        
        // Trait weighting system - how much each trait affects decisions
        this.traitWeights = {
            'Ambitious': {
                work: 1.8,        // Much more likely to work
                social: 1.2,      // Moderately more social (networking)
                rest: 0.6,        // Less likely to rest
                duration: 1.5     // Longer action durations
            },
            'Lazy': {
                work: 0.4,        // Much less likely to work
                social: 0.8,      // Somewhat less social (effort)
                rest: 1.8,        // Much more likely to rest
                duration: 0.7     // Shorter action durations
            },
            'Extroverted': {
                work: 0.9,        // Slightly less work-focused
                social: 2.0,      // Much more social
                rest: 0.8,        // Less rest (prefers interaction)
                crowd_tolerance: 1.5 // Comfortable in crowds
            },
            'Introverted': {
                work: 1.2,        // Slightly more work-focused
                social: 0.5,      // Much less social
                rest: 1.3,        // More rest/alone time
                crowd_tolerance: 0.3 // Uncomfortable in crowds
            },
            'Organized': {
                work: 1.4,        // More systematic work
                routine: 1.8,     // Strongly follows routines
                completion: 1.6,  // More likely to complete tasks
                planning: 1.5     // Prefers planned actions
            },
            'Chaotic': {
                work: 0.8,        // Less systematic work
                routine: 0.4,     // Ignores routines
                completion: 0.6,  // Less likely to complete tasks
                randomness: 1.8   // Higher chance of random actions
            },
            'Gossip': {
                social: 1.6,      // More social for information
                information: 1.8, // Seeks conversations
                sharing: 1.5,     // Shares information
                curiosity: 1.7    // Interested in others
            },
            'Professional': {
                work: 1.3,        // More work-focused
                formal: 1.5,      // Formal behavior
                personal: 0.6,    // Avoids personal topics
                efficiency: 1.4   // Efficient actions
            }
        };
        
        // Trait conflict resolution matrix
        this.traitConflicts = {
            'Ambitious_Lazy': 'energy_dependent', // High energy = ambitious, low energy = lazy
            'Extroverted_Introverted': 'context_dependent', // Crowd size matters
            'Organized_Chaotic': 'stress_dependent' // Stress level affects which dominates
        };
        
        console.log('🧭 Personality Interpreter initialized');
    }

    /**
     * Get personality weights for a character
     * @param {Array} personalityTags - Array of personality trait strings
     * @returns {Object} - Calculated weights for decision making
     */
    getWeights(personalityTags) {
        if (!personalityTags || personalityTags.length === 0) {
            return this.getDefaultWeights();
        }
        
        const weights = {};
        const resolvedTraits = this.resolveTraitConflicts(personalityTags);
        
        // Calculate combined weights from all traits
        resolvedTraits.forEach(trait => {
            if (this.traitWeights[trait]) {
                const traitData = this.traitWeights[trait];
                Object.keys(traitData).forEach(key => {
                    weights[key] = (weights[key] || 1.0) * traitData[key];
                });
            }
        });
        
        // Normalize extreme values
        Object.keys(weights).forEach(key => {
            weights[key] = Math.max(0.1, Math.min(3.0, weights[key]));
        });
        
        return weights;
    }

    /**
     * Modify a decision based on personality traits
     * @param {Object} decision - Original decision object
     * @param {Object} context - Complete decision context
     * @returns {Object} - Modified decision
     */
    modifyDecision(decision, context) {
        const personality = context.personality || [];
        const weights = this.getWeights(personality);
        const modifiedDecision = { ...decision };
        
        // Apply trait-specific modifications
        personality.forEach(trait => {
            modifiedDecision = this.applyTraitModification(modifiedDecision, trait, context, weights);
        });
        
        // Apply duration modifications
        if (modifiedDecision.action && weights.duration) {
            modifiedDecision.action.duration = Math.round(
                (modifiedDecision.action.duration || 5000) * weights.duration
            );
        }
        
        // Add personality-specific reasoning
        const personalityReasoning = this.generatePersonalityReasoning(modifiedDecision, personality, context);
        if (personalityReasoning) {
            modifiedDecision.reasoning = `${modifiedDecision.reasoning}; ${personalityReasoning}`;
        }
        
        return modifiedDecision;
    }

    /**
     * Apply specific trait modifications to a decision
     * @param {Object} decision - Decision to modify
     * @param {string} trait - Personality trait
     * @param {Object} context - Decision context
     * @param {Object} weights - Calculated weights
     * @returns {Object} - Modified decision
     */
    applyTraitModification(decision, trait, context, weights) {
        const modified = { ...decision };
        
        switch (trait) {
            case 'Ambitious':
                modified = this.applyAmbitiousModifications(modified, context);
                break;
                
            case 'Lazy':
                modified = this.applyLazyModifications(modified, context);
                break;
                
            case 'Extroverted':
                modified = this.applyExtrovertedModifications(modified, context);
                break;
                
            case 'Introverted':
                modified = this.applyIntrovertedModifications(modified, context);
                break;
                
            case 'Organized':
                modified = this.applyOrganizedModifications(modified, context);
                break;
                
            case 'Chaotic':
                modified = this.applyChaoticModifications(modified, context);
                break;
                
            case 'Gossip':
                modified = this.applyGossipModifications(modified, context);
                break;
                
            case 'Professional':
                modified = this.applyProfessionalModifications(modified, context);
                break;
        }
        
        return modified;
    }

    /**
     * Ambitious trait modifications
     */
    applyAmbitiousModifications(decision, context) {
        const modified = { ...decision };
        
        // Extend work durations
        if (modified.action?.type === 'WORK_ON') {
            modified.action.duration = Math.max(modified.action.duration, 15000);
            
            // Ambitious characters work even when tired (but not exhausted)
            if (context.needs.energy >= 3) {
                modified.action.duration *= 1.3;
            }
        }
        
        // Prefer advancement opportunities
        if (context.availableActions) {
            const advancementActions = context.availableActions.filter(action =>
                action.description.toLowerCase().includes('presentation') ||
                action.description.toLowerCase().includes('meeting') ||
                action.description.toLowerCase().includes('project')
            );
            
            if (advancementActions.length > 0 && Math.random() < 0.3) {
                modified.action = {
                    type: advancementActions[0].type,
                    target: advancementActions[0].target,
                    duration: 20000
                };
                modified.reasoning = 'Ambitious - seeking advancement opportunity';
            }
        }
        
        // More likely to initiate work conversations
        if (modified.includeDialogue) {
            modified.dialogueIntent = 'professional';
        }
        
        return modified;
    }

    /**
     * Lazy trait modifications
     */
    applyLazyModifications(decision, context) {
        const modified = { ...decision };
        
        // Shorten work durations
        if (modified.action?.type === 'WORK_ON') {
            modified.action.duration = Math.min(modified.action.duration, 10000);
            
            // Skip work if energy is low
            if (context.needs.energy < 4) {
                modified.type = 'IDLE';
                modified.action = { type: 'IDLE', duration: 8000 };
                modified.reasoning = 'Lazy - avoiding work due to low energy';
            }
        }
        
        // Prefer comfort activities
        const comfortActions = context.availableActions?.filter(action =>
            action.type === 'DRINK_COFFEE' ||
            action.type === 'EAT_SNACK' ||
            action.description.toLowerCase().includes('comfortable')
        );
        
        if (comfortActions && comfortActions.length > 0 && decision.priority !== 'critical') {
            if (Math.random() < 0.4) {
                modified.action = {
                    type: comfortActions[0].type,
                    target: comfortActions[0].target,
                    duration: 12000
                };
                modified.reasoning = 'Lazy - choosing comfort over productivity';
            }
        }
        
        return modified;
    }

    /**
     * Extroverted trait modifications
     */
    applyExtrovertedModifications(decision, context) {
        const modified = { ...decision };
        
        // Extend social interactions
        if (modified.action?.type === 'START_CONVERSATION' || modified.action?.type === 'SOCIALIZE') {
            modified.action.duration *= 1.5;
        }
        
        // More likely to add dialogue to actions
        if (!modified.includeDialogue && Math.random() < 0.6) {
            modified.includeDialogue = true;
            modified.dialogueIntent = 'friendly';
        }
        
        // Seek social opportunities even during work
        if (context.nearbyEntities?.length > 0 && decision.priority !== 'critical') {
            const socialOpportunities = context.nearbyEntities.filter(entity => 
                entity.type === 'Character' && entity.distance <= 2
            );
            
            if (socialOpportunities.length > 0 && Math.random() < 0.3) {
                modified.action = {
                    type: 'START_CONVERSATION',
                    target: socialOpportunities[0].name,
                    duration: 12000
                };
                modified.reasoning = 'Extroverted - taking social opportunity';
                modified.includeDialogue = true;
                modified.dialogueIntent = 'friendly';
            }
        }
        
        return modified;
    }

    /**
     * Introverted trait modifications
     */
    applyIntrovertedModifications(decision, context) {
        const modified = { ...decision };
        
        // Shorten social interactions
        if (modified.action?.type === 'START_CONVERSATION' || modified.action?.type === 'SOCIALIZE') {
            modified.action.duration *= 0.7;
        }
        
        // Avoid crowded areas
        if (context.environmentalFactors?.crowded) {
            // Look for quieter alternatives
            const quietActions = context.availableActions?.filter(action =>
                action.target !== 'break_room' &&
                action.description.toLowerCase().includes('quiet') ||
                action.description.toLowerCase().includes('private')
            );
            
            if (quietActions && quietActions.length > 0) {
                modified.action = {
                    type: quietActions[0].type,
                    target: quietActions[0].target,
                    duration: modified.action?.duration || 8000
                };
                modified.reasoning = 'Introverted - seeking quieter environment';
            }
        }
        
        // Less likely to initiate conversations
        if (modified.includeDialogue && Math.random() < 0.5) {
            modified.includeDialogue = false;
        }
        
        return modified;
    }

    /**
     * Organized trait modifications
     */
    applyOrganizedModifications(decision, context) {
        const modified = { ...decision };
        
        // Prefer completing current tasks before starting new ones
        if (context.character.currentTask && modified.action?.type !== context.character.currentTask) {
            // Stick with current task unless it's a critical need
            if (decision.priority !== 'critical') {
                modified.action = {
                    type: 'WORK_ON',
                    target: context.character.currentTask,
                    duration: 15000
                };
                modified.reasoning = 'Organized - completing current task before starting new one';
            }
        }
        
        // Add systematic approach to actions
        if (modified.action?.type === 'WORK_ON') {
            modified.action.systematic = true;
            modified.action.duration *= 1.2; // More thorough work
        }
        
        // Prefer maintenance and organization activities during idle time
        if (modified.type === 'IDLE') {
            const organizeActions = context.availableActions?.filter(action =>
                action.description.toLowerCase().includes('organize') ||
                action.description.toLowerCase().includes('clean') ||
                action.description.toLowerCase().includes('arrange')
            );
            
            if (organizeActions && organizeActions.length > 0) {
                modified.type = 'ACTION';
                modified.action = {
                    type: organizeActions[0].type,
                    target: organizeActions[0].target,
                    duration: 10000
                };
                modified.reasoning = 'Organized - maintaining workspace during free time';
            }
        }
        
        return modified;
    }

    /**
     * Chaotic trait modifications
     */
    applyChaoticModifications(decision, context) {
        const modified = { ...decision };
        
        // Random chance to change decision completely
        if (Math.random() < 0.2 && decision.priority !== 'critical') {
            const randomActions = context.availableActions?.filter(action =>
                action.type !== 'WORK_ON' || Math.random() < 0.3
            );
            
            if (randomActions && randomActions.length > 0) {
                const randomAction = randomActions[Math.floor(Math.random() * randomActions.length)];
                modified.action = {
                    type: randomAction.type,
                    target: randomAction.target,
                    duration: Math.random() * 10000 + 3000 // Random duration 3-13 seconds
                };
                modified.reasoning = 'Chaotic - random impulse decision';
            }
        }
        
        // Shorter attention spans
        if (modified.action?.duration) {
            modified.action.duration *= 0.8;
        }
        
        // More likely to abandon tasks mid-way (handled by action execution system)
        if (modified.action) {
            modified.action.abandonChance = 0.15; // 15% chance to abandon
        }
        
        return modified;
    }

    /**
     * Gossip trait modifications
     */
    applyGossipModifications(decision, context) {
        const modified = { ...decision };
        
        // Always include dialogue in social situations
        if (context.nearbyEntities?.some(e => e.type === 'Character')) {
            modified.includeDialogue = true;
            modified.dialogueIntent = 'gossip';
        }
        
        // Prefer information-gathering conversations
        if (modified.action?.type === 'START_CONVERSATION') {
            modified.action.duration *= 1.3; // Longer conversations
            modified.dialogueIntent = 'information_seeking';
        }
        
        // More likely to approach people they haven't talked to recently
        const unknownPeople = context.nearbyEntities?.filter(entity =>
            entity.type === 'Character' &&
            !context.memoryPatterns.recentConversations?.includes(entity.name)
        );
        
        if (unknownPeople && unknownPeople.length > 0 && Math.random() < 0.4) {
            modified.action = {
                type: 'START_CONVERSATION',
                target: unknownPeople[0].name,
                duration: 15000
            };
            modified.reasoning = 'Gossip - seeking new information source';
            modified.includeDialogue = true;
            modified.dialogueIntent = 'curious';
        }
        
        return modified;
    }

    /**
     * Professional trait modifications
     */
    applyProfessionalModifications(decision, context) {
        const modified = { ...decision };
        
        // More formal behavior
        if (modified.includeDialogue) {
            modified.dialogueIntent = 'professional';
        }
        
        // Prioritize work during work hours
        if (context.isWorkingHours && decision.priority !== 'critical') {
            const workActions = context.availableActions?.filter(action =>
                action.type === 'WORK_ON'
            );
            
            if (workActions && workActions.length > 0) {
                modified.action = {
                    type: 'WORK_ON',
                    target: workActions[0].target,
                    duration: 15000
                };
                modified.reasoning = 'Professional - maintaining work focus during business hours';
            }
        }
        
        // Avoid personal conversations during work
        if (context.isWorkingHours && modified.dialogueIntent === 'personal') {
            modified.dialogueIntent = 'professional';
        }
        
        // More efficient actions
        if (modified.action?.duration) {
            modified.action.duration *= 0.9; // Slightly faster, more efficient
        }
        
        return modified;
    }

    /**
     * Resolve conflicts between opposing traits
     * @param {Array} traits - Array of personality traits
     * @returns {Array} - Resolved traits with conflicts handled
     */
    resolveTraitConflicts(traits) {
        const resolved = [...traits];
        
        // Handle Ambitious vs Lazy conflict
        if (traits.includes('Ambitious') && traits.includes('Lazy')) {
            // Remove one based on current energy level (handled in context)
            // This will be resolved dynamically in decision making
            resolved.push('Ambitious_Lazy_Conflict');
        }
        
        // Handle Extroverted vs Introverted conflict
        if (traits.includes('Extroverted') && traits.includes('Introverted')) {
            resolved.push('Ambivert'); // Person who can be both
        }
        
        // Handle Organized vs Chaotic conflict
        if (traits.includes('Organized') && traits.includes('Chaotic')) {
            resolved.push('Organized_Chaotic_Conflict');
        }
        
        return resolved;
    }

    /**
     * Generate personality-specific reasoning text
     * @param {Object} decision - Modified decision
     * @param {Array} personality - Personality traits
     * @param {Object} context - Decision context
     * @returns {string} - Personality reasoning
     */
    generatePersonalityReasoning(decision, personality, context) {
        const reasoningParts = [];
        
        personality.forEach(trait => {
            const traitReasoning = this.getTraitReasoning(trait, decision, context);
            if (traitReasoning) {
                reasoningParts.push(traitReasoning);
            }
        });
        
        return reasoningParts.join(', ');
    }

    /**
     * Get reasoning text for specific trait
     * @param {string} trait - Personality trait
     * @param {Object} decision - Decision object
     * @param {Object} context - Decision context
     * @returns {string} - Trait-specific reasoning
     */
    getTraitReasoning(trait, decision, context) {
        const actionType = decision.action?.type;
        
        const reasoningMap = {
            'Ambitious': {
                'WORK_ON': 'driven to excel',
                'START_CONVERSATION': 'networking opportunity',
                'default': 'pursuing goals'
            },
            'Lazy': {
                'IDLE': 'conserving energy',
                'DRINK_COFFEE': 'minimal effort solution',
                'default': 'avoiding exertion'
            },
            'Extroverted': {
                'START_CONVERSATION': 'energized by social contact',
                'SOCIALIZE': 'thriving in social environment',
                'default': 'seeking interaction'
            },
            'Introverted': {
                'IDLE': 'needing quiet time',
                'WORK_ON': 'preferring focused work',
                'default': 'avoiding crowds'
            },
            'Organized': {
                'WORK_ON': 'following systematic approach',
                'organize': 'maintaining order',
                'default': 'keeping things structured'
            },
            'Chaotic': {
                'random': 'following impulse',
                'abandon': 'easily distracted',
                'default': 'embracing spontaneity'
            },
            'Gossip': {
                'START_CONVERSATION': 'seeking information',
                'SOCIALIZE': 'sharing knowledge',
                'default': 'staying connected'
            },
            'Professional': {
                'WORK_ON': 'maintaining standards',
                'formal': 'upholding professionalism',
                'default': 'focusing on efficiency'
            }
        };
        
        const traitMap = reasoningMap[trait];
        if (!traitMap) return null;
        
        return traitMap[actionType] || traitMap['default'] || null;
    }

    /**
     * Get default weights for characters with no personality traits
     * @returns {Object} - Default weight values
     */
    getDefaultWeights() {
        return {
            work: 1.0,
            social: 1.0,
            rest: 1.0,
            duration: 1.0,
            routine: 1.0,
            completion: 1.0,
            crowd_tolerance: 1.0
        };
    }

    /**
     * Calculate trait dominance for conflict resolution
     * @param {Array} traits - Personality traits
     * @param {Object} context - Current context (energy, stress, etc.)
     * @returns {Object} - Dominant traits for current situation
     */
    calculateTraitDominance(traits, context) {
        const dominance = {};
        
        // Energy affects Ambitious vs Lazy
        if (traits.includes('Ambitious') && traits.includes('Lazy')) {
            if (context.needs.energy > 6) {
                dominance.primary = 'Ambitious';
            } else if (context.needs.energy < 4) {
                dominance.primary = 'Lazy';
            } else {
                dominance.primary = Math.random() < 0.5 ? 'Ambitious' : 'Lazy';
            }
        }
        
        // Stress affects Organized vs Chaotic
        if (traits.includes('Organized') && traits.includes('Chaotic')) {
            if (context.needs.stress > 7) {
                dominance.secondary = 'Chaotic'; // Stress makes organized people chaotic
            } else {
                dominance.secondary = 'Organized';
            }
        }
        
        // Social context affects Extroverted vs Introverted
        if (traits.includes('Extroverted') && traits.includes('Introverted')) {
            const crowdSize = context.nearbyEntities?.length || 0;
            if (crowdSize > 3) {
                dominance.social = 'Introverted'; // Too crowded even for extroverts
            } else if (crowdSize > 0) {
                dominance.social = 'Extroverted';
            } else {
                dominance.social = 'Introverted'; // Alone
            }
        }
        
        return dominance;
    }
}
