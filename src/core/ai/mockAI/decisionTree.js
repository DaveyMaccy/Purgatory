/**
 * Decision Tree - Core decision logic with priority system
 * Implements hierarchical decision making based on needs, tasks, and personality
 * 
 * DECISION HIERARCHY:
 * 1. Critical Needs (Energy < 2, Hunger < 2) - Override everything
 * 2. Task Assignments - Work responsibilities
 * 3. Social Needs - Personality-driven interactions  
 * 4. Routine Behaviors - Time-based patterns
 * 5. Idle Actions - Default behaviors
 * 
 * EXPANSION NOTES:
 * - Add seasonal behaviors (holiday routines, weather responses)
 * - Implement learning from failed decisions
 * - Add workplace hierarchy respect (boss proximity changes behavior)
 * - Create emergency response patterns (fire alarms, meetings)
 */

import { MockAIConfig } from './config.js';

export class DecisionTree {
    constructor() {
        this.config = MockAIConfig;
        this.decisionWeights = {
            criticalNeed: 10.0,    // Highest priority
            taskAssignment: 8.0,   // Work responsibilities
            socialNeed: 6.0,       // Personality-driven
            routine: 4.0,          // Time-based patterns
            idle: 2.0              // Default behavior
        };
        
        console.log('🌳 Decision Tree initialized');
    }

    /**
     * Main evaluation method - determines best action given context
     * @param {Object} context - Complete decision context
     * @returns {Object} - Decision object with type, action, and metadata
     */
    evaluate(context) {
        console.log(`🎯 Evaluating decision for ${context.character.name}`);
        
        // Check for critical needs first (highest priority)
        const criticalDecision = this.evaluateCriticalNeeds(context);
        if (criticalDecision) {
            return { ...criticalDecision, priority: 'critical', source: 'critical_needs' };
        }
        
        // Check for task assignments (work responsibilities)
        const taskDecision = this.evaluateTaskAssignments(context);
        if (taskDecision) {
            return { ...taskDecision, priority: 'high', source: 'task_assignment' };
        }
        
        // Check for social needs (personality-driven)
        const socialDecision = this.evaluateSocialNeeds(context);
        if (socialDecision) {
            return { ...socialDecision, priority: 'medium', source: 'social_needs' };
        }
        
        // Check for routine behaviors (time-based patterns)
        const routineDecision = this.evaluateRoutineBehaviors(context);
        if (routineDecision) {
            return { ...routineDecision, priority: 'low', source: 'routine' };
        }
        
        // Default to idle behavior
        return this.createIdleDecision(context);
    }

    /**
     * Evaluate critical needs that override all other behaviors
     * @param {Object} context - Decision context
     * @returns {Object|null} - Critical need decision or null
     */
    evaluateCriticalNeeds(context) {
        const { needs } = context;
        const thresholds = this.config.thresholds;
        
        // Energy critical - must find coffee or rest
        if (needs.energy <= thresholds.criticalNeed) {
            console.log(`☕ ${context.character.name} has critical energy need`);
            
            // Look for coffee machine in available actions
            const coffeeAction = context.availableActions.find(action => 
                action.type === 'DRINK_COFFEE' || 
                action.target === 'coffee_machine' ||
                action.description.toLowerCase().includes('coffee')
            );
            
            if (coffeeAction) {
                return {
                    type: 'ACTION',
                    action: {
                        type: coffeeAction.type,
                        target: coffeeAction.target,
                        duration: 8000
                    },
                    reasoning: `Critical energy level (${needs.energy}) - seeking coffee`
                };
            }
            
            // If no coffee available, move to break room
            const moveAction = context.availableActions.find(action => 
                action.type === 'MOVE_TO' && 
                (action.target === 'break_room' || action.target === 'kitchen')
            );
            
            if (moveAction) {
                return {
                    type: 'ACTION',
                    action: {
                        type: 'MOVE_TO',
                        target: moveAction.target,
                        duration: 10000
                    },
                    reasoning: `Critical energy level (${needs.energy}) - heading to break room`
                };
            }
        }
        
        // Hunger critical - must find food
        if (needs.hunger <= thresholds.criticalNeed) {
            console.log(`🍪 ${context.character.name} has critical hunger need`);
            
            const snackAction = context.availableActions.find(action => 
                action.type === 'EAT_SNACK' ||
                action.description.toLowerCase().includes('snack') ||
                action.description.toLowerCase().includes('food')
            );
            
            if (snackAction) {
                return {
                    type: 'ACTION',
                    action: {
                        type: snackAction.type,
                        target: snackAction.target,
                        duration: 10000
                    },
                    reasoning: `Critical hunger level (${needs.hunger}) - seeking food`
                };
            }
        }
        
        // Stress critical - must find relief
        if (needs.stress >= (10 - thresholds.criticalNeed)) {
            console.log(`😰 ${context.character.name} has critical stress level`);
            
            // Look for stress relief activities
            const relaxAction = context.availableActions.find(action => 
                action.type === 'IDLE' ||
                action.description.toLowerCase().includes('relax') ||
                action.description.toLowerCase().includes('break')
            );
            
            if (relaxAction) {
                return {
                    type: 'ACTION',
                    action: {
                        type: 'IDLE',
                        duration: 15000 // Longer idle time for stress relief
                    },
                    reasoning: `Critical stress level (${needs.stress}) - taking a break`
                };
            }
        }
        
        return null;
    }

    /**
     * Evaluate task assignments and work responsibilities
     * @param {Object} context - Decision context
     * @returns {Object|null} - Task decision or null
     */
    evaluateTaskAssignments(context) {
        // Only work during working hours unless it's urgent
        if (!context.isWorkingHours && !this.hasUrgentTasks(context)) {
            return null;
        }
        
        // Check for work-related actions
        const workActions = context.availableActions.filter(action => 
            action.type === 'WORK_ON' ||
            action.description.toLowerCase().includes('work') ||
            action.description.toLowerCase().includes('task')
        );
        
        if (workActions.length === 0) {
            return null;
        }
        
        // Personality affects work behavior
        const isAmbitious = context.personality.includes('Ambitious');
        const isLazy = context.personality.includes('Lazy');
        const isOrganized = context.personality.includes('Organized');
        
        // Lazy characters avoid work unless energy is high
        if (isLazy && context.needs.energy < 6) {
            console.log(`😴 ${context.character.name} (lazy) avoiding work due to low energy`);
            return null;
        }
        
        // Choose work action based on personality
        let selectedAction = workActions[0]; // Default to first available
        
        if (isOrganized) {
            // Organized characters prefer systematic work
            selectedAction = workActions.find(action => 
                action.description.toLowerCase().includes('organize') ||
                action.description.toLowerCase().includes('plan')
            ) || selectedAction;
        }
        
        // Ambitious characters work longer
        const duration = isAmbitious ? 20000 : isLazy ? 10000 : 15000;
        
        return {
            type: 'ACTION',
            action: {
                type: selectedAction.type,
                target: selectedAction.target,
                duration: duration
            },
            reasoning: `Working on assigned task - ${isAmbitious ? 'ambitious' : isLazy ? 'reluctantly' : 'normally'}`
        };
    }

    /**
     * Evaluate social needs and personality-driven interactions
     * @param {Object} context - Decision context
     * @returns {Object|null} - Social decision or null
     */
    evaluateSocialNeeds(context) {
        const { needs, personality, nearbyEntities, socialContext } = context;
        
        // Check if social need is low enough to warrant action
        if (needs.social > thresholds.lowNeed) {
            return null;
        }
        
        const isExtroverted = personality.includes('Extroverted');
        const isIntroverted = personality.includes('Introverted');
        const isGossip = personality.includes('Gossip');
        
        // Introverted characters avoid social interaction if area is crowded
        if (isIntroverted && context.environmentalFactors?.crowded) {
            console.log(`🤐 ${context.character.name} (introverted) avoiding crowded area`);
            return null;
        }
        
        // Find suitable conversation partners
        const potentialPartners = nearbyEntities.filter(entity => 
            entity.type === 'Character' && 
            entity.name !== context.character.name &&
            entity.distance <= 3 // Close enough to talk
        );
        
        if (potentialPartners.length === 0) {
            // No one to talk to - maybe move to a social area
            const socialMoveAction = context.availableActions.find(action => 
                action.type === 'MOVE_TO' && 
                (action.target === 'break_room' || 
                 action.target === 'lounge' ||
                 action.description.toLowerCase().includes('social'))
            );
            
            if (socialMoveAction && isExtroverted) {
                return {
                    type: 'ACTION',
                    action: {
                        type: 'MOVE_TO',
                        target: socialMoveAction.target,
                        duration: 10000
                    },
                    reasoning: 'Seeking social interaction - moving to social area'
                };
            }
            
            return null;
        }
        
        // Choose conversation partner based on personality
        let targetPartner = potentialPartners[0];
        
        if (isGossip) {
            // Gossip characters prefer people they know
            targetPartner = potentialPartners.find(p => 
                context.memoryPatterns.knownPeople?.includes(p.name)
            ) || targetPartner;
        }
        
        // Create conversation action
        const conversationAction = context.availableActions.find(action => 
            action.type === 'START_CONVERSATION' ||
            action.description.toLowerCase().includes('talk') ||
            action.description.toLowerCase().includes('conversation')
        );
        
        if (conversationAction) {
            return {
                type: 'ACTION',
                action: {
                    type: 'START_CONVERSATION',
                    target: targetPartner.name,
                    duration: isExtroverted ? 15000 : isIntroverted ? 5000 : 10000
                },
                reasoning: `Social need (${needs.social}) - starting conversation
