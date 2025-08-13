/**
 * Needs Calculator - Need-Based Decision Weighting
 * Calculates priority weights based on character needs (energy, hunger, social, stress, comfort)
 * 
 * NEED CATEGORIES:
 * - Energy: Affects work capacity, requires coffee/rest
 * - Hunger: Affects mood and focus, requires food
 * - Social: Affects extroverted characters more, requires interaction
 * - Stress: Affects decision making, requires breaks/relaxation
 * - Comfort: Affects overall satisfaction, requires pleasant environment
 * 
 * PRIORITY LEVELS:
 * - Critical (0-2): Emergency level, overrides everything
 * - Low (3-4): High priority, influences decisions strongly
 * - Moderate (5-6): Normal level, some influence
 * - Satisfied (7-8): Good level, minimal influence
 * - High (9-10): Excellent level, may enable special behaviors
 * 
 * EXPANSION NOTES:
 * - Add circadian rhythm effects (energy cycles throughout day)
 * - Implement need satisfaction curves (diminishing returns)
 * - Add weather effects on comfort needs
 * - Create personality-specific need multipliers
 */

import { MockAIConfig } from './config.js';

export class NeedsCalculator {
    constructor() {
        this.config = MockAIConfig;
        
        // Need priority thresholds
        this.thresholds = {
            critical: 2,    // Emergency level
            low: 4,         // High priority
            moderate: 6,    // Normal level
            satisfied: 8    // Good level
        };
        
        // Need interaction matrix - how needs affect each other
        this.needInteractions = {
            energy: {
                affects: ['stress', 'social'],
                low_energy_increases: ['stress'],
                low_energy_decreases: ['social']
            },
            hunger: {
                affects: ['energy', 'stress', 'comfort'],
                low_hunger_increases: ['stress'],
                low_hunger_decreases: ['energy', 'comfort']
            },
            stress: {
                affects: ['energy', 'social', 'comfort'],
                high_stress_decreases: ['energy', 'social', 'comfort']
            },
            social: {
                affects: ['stress', 'comfort'],
                low_social_increases: ['stress'],
                high_social_increases: ['comfort']
            },
            comfort: {
                affects: ['stress'],
                low_comfort_increases: ['stress']
            }
        };
        
        // Action to need satisfaction mapping
        this.actionNeedMap = {
            'DRINK_COFFEE': { energy: +3, comfort: +1 },
            'EAT_SNACK': { hunger: +3, comfort: +1 },
            'START_CONVERSATION': { social: +2, stress: -1 },
            'SOCIALIZE': { social: +3, stress: -1 },
            'IDLE': { stress: -2, energy: +1 },
            'WORK_ON': { stress: +1, energy: -1 },
            'MOVE_TO': { energy: -0.5 }
        };
        
        console.log('📊 Needs Calculator initialized');
    }

    /**
     * Calculate need-based priorities for decision making
     * @param {Object} character - Character object with needs
     * @returns {Object} - Priority analysis with critical, low, and moderate needs
     */
    calculatePriority(character) {
        const needs = this.getNeedsFromCharacter(character);
        const priority = {
            critical: [],
            low: [],
            moderate: [],
            satisfied: [],
            weightings: {}
        };
        
        // Categorize each need by priority level
        Object.keys(needs).forEach(needType => {
            const value = needs[needType];
            const weight = this.calculateNeedWeight(needType, value, needs);
            
            priority.weightings[needType] = weight;
            
            if (value <= this.thresholds.critical) {
                priority.critical.push(needType);
            } else if (value <= this.thresholds.low) {
                priority.low.push(needType);
            } else if (value <= this.thresholds.moderate) {
                priority.moderate.push(needType);
            } else {
                priority.satisfied.push(needType);
            }
        });
        
        // Sort by urgency (lowest values first)
        priority.critical.sort((a, b) => needs[a] - needs[b]);
        priority.low.sort((a, b) => needs[a] - needs[b]);
        
        // Calculate overall urgency score
        priority.urgencyScore = this.calculateUrgencyScore(needs);
        
        // Calculate need satisfaction predictions for different actions
        priority.actionOutcomes = this.predictActionOutcomes(needs);
        
        console.log(`📈 Priority analysis for ${character.name}: Critical: [${priority.critical}], Low: [${priority.low}]`);
        
        return priority;
    }

    /**
     * Extract needs from character object, with defaults
     * @param {Object} character - Character object
     * @returns {Object} - Normalized needs object
     */
    getNeedsFromCharacter(character) {
        return {
            energy: character.energy ?? 5,
            hunger: character.hunger ?? 5,
            social: character.social ?? 5,
            stress: character.stress ?? 5,
            comfort: character.comfort ?? 5
        };
    }

    /**
     * Calculate weight for a specific need considering interactions
     * @param {string} needType - Type of need (energy, hunger, etc.)
     * @param {number} value - Current need value
     * @param {Object} allNeeds - All character needs
     * @returns {number} - Calculated weight
     */
    calculateNeedWeight(needType, value, allNeeds) {
        let baseWeight = this.getBaseWeight(value);
        
        // Apply personality multipliers if available
        const personalityMultiplier = this.getPersonalityMultiplier(needType);
        baseWeight *= personalityMultiplier;
        
        // Apply need interactions
        const interactionMultiplier = this.calculateInteractionMultiplier(needType, allNeeds);
        baseWeight *= interactionMultiplier;
        
        // Apply time-of-day effects
        const timeMultiplier = this.getTimeMultiplier(needType);
        baseWeight *= timeMultiplier;
        
        return Math.max(0.1, Math.min(5.0, baseWeight));
    }

    /**
     * Get base weight for a need value
     * @param {number} value - Need value (0-10)
     * @returns {number} - Base weight
     */
    getBaseWeight(value) {
        if (value <= this.thresholds.critical) return 4.0;
        if (value <= this.thresholds.low) return 3.0;
        if (value <= this.thresholds.moderate) return 2.0;
        if (value <= this.thresholds.satisfied) return 1.0;
        return 0.5;
    }

    /**
     * Get personality multiplier for specific needs
     * @param {string} needType - Type of need
     * @returns {number} - Personality multiplier
     */
    getPersonalityMultiplier(needType) {
        // These would be enhanced with actual personality data in real implementation
        const multipliers = {
            energy: 1.0,    // Could be affected by 'Ambitious' (lower tolerance) or 'Lazy' (higher tolerance)
            hunger: 1.0,    // Could be affected by food-related personality traits
            social: 1.0,    // Heavily affected by 'Extroverted' (higher weight) vs 'Introverted' (lower weight)
            stress: 1.0,    // Could be affected by 'Organized' (lower tolerance) vs 'Chaotic' (higher tolerance)
            comfort: 1.0    // Could be affected by various personality traits
        };
        
        return multipliers[needType] || 1.0;
    }

    /**
     * Calculate multiplier based on need interactions
     * @param {string} needType - Primary need type
     * @param {Object} allNeeds - All character needs
     * @returns {number} - Interaction multiplier
     */
    calculateInteractionMultiplier(needType, allNeeds) {
        const interactions = this.needInteractions[needType];
        if (!interactions) return 1.0;
        
        let multiplier = 1.0;
        
        // Check for interaction effects
        if (interactions.affects) {
            interactions.affects.forEach(affectedNeed => {
                const affectedValue = allNeeds[affectedNeed];
                
                // If affected need is also low, increase priority of this need
                if (affectedValue <= this.thresholds.low) {
                    multiplier *= 1.2;
                }
            });
        }
        
        // Specific interaction rules
        if (needType === 'energy') {
            // Low energy is more critical if stress is also high
            if (allNeeds.stress >= 8) {
                multiplier *= 1.3;
            }
        }
        
        if (needType === 'social') {
            // Social needs less critical if stress is very high (people want to be alone when stressed)
            if (allNeeds.stress >= 8) {
                multiplier *= 0.7;
            }
        }
        
        if (needType === 'stress') {
            // High stress becomes more critical if multiple other needs are also low
            const lowNeeds = Object.keys(allNeeds).filter(need => 
                need !== 'stress' && allNeeds[need] <= this.thresholds.low
            ).length;
            
            if (lowNeeds >= 2) {
                multiplier *= 1.4;
            }
        }
        
        return multiplier;
    }

    /**
     * Get time-of-day multiplier for needs
     * @param {string} needType - Type of need
     * @returns {number} - Time multiplier
     */
    getTimeMultiplier(needType) {
        const hour = new Date().getHours();
        
        const timeMultipliers = {
            energy: {
                morning: 0.8,    // Less critical in morning
                afternoon: 1.2,  // More critical in afternoon
                evening: 1.4     // Most critical in evening
            },
            hunger: {
                morning: 0.9,    // Breakfast time
                lunch: 1.3,      // Lunch time (12-1 PM)
                afternoon: 1.1,  // Snack time
                evening: 0.8     // Dinner usually handled outside work
            },
            social: {
                morning: 0.8,    // People starting work, less social
                lunch: 1.3,      // Social lunch time
                afternoon: 1.1,  // Good time for collaboration
                evening: 0.9     // Winding down
            },
            stress: {
                morning: 0.9,    // Fresh start
                afternoon: 1.2,  // Workload builds up
                evening: 1.3     // End of day stress
            },
            comfort: {
                all: 1.0         // Consistent throughout day
            }
        };
        
        // Determine time period
        let timePeriod = 'morning';
        if (hour >= 12 && hour <= 13) timePeriod = 'lunch';
        else if (hour >= 14 && hour <= 17) timePeriod = 'afternoon';
        else if (hour >= 18) timePeriod = 'evening';
        
        const needMultipliers = timeMultipliers[needType];
        if (!needMultipliers) return 1.0;
        
        return needMultipliers[timePeriod] || needMultipliers.all || 1.0;
    }

    /**
     * Calculate overall urgency score
     * @param {Object} needs - Character needs
     * @returns {number} - Urgency score (0-100)
     */
    calculateUrgencyScore(needs) {
        let score = 0;
        let totalWeight = 0;
        
        Object.keys(needs).forEach(needType => {
            const value = needs[needType];
            const weight = this.calculateNeedWeight(needType, value, needs);
            
            // Lower values contribute more to urgency
            const urgencyContribution = (10 - value) * weight;
            score += urgencyContribution;
            totalWeight += weight;
        });
        
        // Normalize to 0-100 scale
        return totalWeight > 0 ? Math.min(100, (score / totalWeight) * 10) : 0;
    }

    /**
     * Predict outcomes of different actions on needs
     * @param {Object} currentNeeds - Current character needs
     * @returns {Object} - Predicted need changes for different actions
     */
    predictActionOutcomes(currentNeeds) {
        const outcomes = {};
        
        Object.keys(this.actionNeedMap).forEach(actionType => {
            const changes = this.actionNeedMap[actionType];
            const predictedNeeds = { ...currentNeeds };
            
            // Apply changes
            Object.keys(changes).forEach(needType => {
                const change = changes[needType];
                predictedNeeds[needType] = Math.max(0, Math.min(10, predictedNeeds[needType] + change));
            });
            
            // Calculate new urgency score
            const newUrgencyScore = this.calculateUrgencyScore(predictedNeeds);
            const currentUrgencyScore = this.calculateUrgencyScore(currentNeeds);
            
            outcomes[actionType] = {
                predictedNeeds,
                urgencyChange: newUrgencyScore - currentUrgencyScore,
                benefitScore: this.calculateBenefitScore(currentNeeds, predictedNeeds)
            };
        });
        
        return outcomes;
    }

    /**
     * Calculate benefit score for a potential action
     * @param {Object} currentNeeds - Current needs
     * @param {Object} predictedNeeds - Predicted needs after action
     * @returns {number} - Benefit score
     */
    calculateBenefitScore(currentNeeds, predictedNeeds) {
        let benefitScore = 0;
        
        Object.keys(currentNeeds).forEach(needType => {
            const current = currentNeeds[needType];
            const predicted = predictedNeeds[needType];
            const change = predicted - current;
            
            // Positive changes are good, negative changes are bad
            // Weight by how critical the need currently is
            const needWeight = this.getBaseWeight(current);
            benefitScore += change * needWeight;
        });
        
        return benefitScore;
    }

    /**
     * Suggest optimal action based on current needs
     * @param {Object} character - Character object
     * @param {Array} availableActions - Available actions
     * @returns {Object} - Suggested action with reasoning
     */
    suggestOptimalAction(character, availableActions) {
        const needs = this.getNeedsFromCharacter(character);
        const outcomes = this.predictActionOutcomes(needs);
        
        let bestAction = null;
        let bestBenefit = -Infinity;
        
        availableActions.forEach(action => {
            const outcome = outcomes[action.type];
            if (outcome && outcome.benefitScore > bestBenefit) {
                bestBenefit = outcome.benefitScore;
                bestAction = {
                    ...action,
                    expectedBenefit: outcome.benefitScore,
                    urgencyReduction: -outcome.urgencyChange,
                    reasoning: this.generateNeedReasoning(needs, outcome)
                };
            }
        });
        
        return bestAction;
    }

    /**
     * Generate reasoning text for need-based decisions
     * @param {Object} currentNeeds - Current needs
     * @param {Object} outcome - Predicted outcome
     * @returns {string} - Reasoning text
     */
    generateNeedReasoning(currentNeeds, outcome) {
        const improvements = [];
        const critical = [];
        
        Object.keys(currentNeeds).forEach(needType => {
            const current = currentNeeds[needType];
            const predicted = outcome.predictedNeeds[needType];
            const change = predicted - current;
            
            if (current <= this.thresholds.critical) {
                critical.push(needType);
            }
            
            if (change > 0) {
                improvements.push(`${needType} +${change.toFixed(1)}`);
            }
        });
        
        let reasoning = '';
        if (critical.length > 0) {
            reasoning += `Addressing critical ${critical.join(', ')} need(s)`;
        }
        
        if (improvements.length > 0) {
            if (reasoning) reasoning += '; ';
            reasoning += `Expected improvement: ${improvements.join(', ')}`;
        }
        
        return reasoning || 'Maintaining current need levels';
    }

    /**
     * Check if character is in a needs crisis (multiple critical needs)
     * @param {Object} character - Character object
     * @returns {boolean} - True if in crisis
     */
    isInNeedsCrisis(character) {
        const needs = this.getNeedsFromCharacter(character);
        const criticalNeeds = Object.keys(needs).filter(needType => 
            needs[needType] <= this.thresholds.critical
        );
        
        return criticalNeeds.length >= 2;
    }

    /**
     * Get the most urgent need for a character
     * @param {Object} character - Character object
     * @returns {Object} - Most urgent need info
     */
    getMostUrgentNeed(character) {
        const needs = this.getNeedsFromCharacter(character);
        
        let mostUrgent = null;
        let lowestValue = Infinity;
        let highestWeight = 0;
        
        Object.keys(needs).forEach(needType => {
            const value = needs[needType];
            const weight = this.calculateNeedWeight(needType, value, needs);
            
            // Consider both low value and high weight
            const urgencyScore = (10 - value) * weight;
            
            if (urgencyScore > highestWeight || (urgencyScore === highestWeight && value < lowestValue)) {
                mostUrgent = needType;
                lowestValue = value;
                highestWeight = urgencyScore;
            }
        });
        
        return mostUrgent ? {
            type: mostUrgent,
            value: lowestValue,
            weight: highestWeight,
            isCritical: lowestValue <= this.thresholds.critical
        } : null;
    }
}
