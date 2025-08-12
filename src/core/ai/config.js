/**
 * Mock AI Configuration - Settings and Tuning Parameters
 * Central configuration for all Mock AI system components
 * 
 * CONFIGURATION CATEGORIES:
 * - Decision Making: Weights, thresholds, priorities
 * - Personality: Trait influences and compatibility
 * - Needs: Satisfaction levels and decay rates
 * - Social: Relationship dynamics and interaction rules
 * - Temporal: Time-based behavior patterns
 * - Performance: System optimization settings
 * 
 * TUNING GUIDELINES:
 * - Higher weights = stronger influence on decisions
 * - Lower thresholds = earlier triggering of behaviors
 * - Frequency values control how often behaviors occur
 * - Debug settings help with development and testing
 * 
 * EXPANSION NOTES:
 * - Add difficulty levels (casual, normal, realistic)
 * - Implement per-character configuration overrides
 * - Create seasonal/contextual configuration variations
 * - Add A/B testing framework for configuration tuning
 */

export const MockAIConfig = {
    // Version and metadata
    version: '1.0.0',
    last_updated: '2025-01-12',
    description: 'Mock AI System Configuration - Phase 5 Implementation',
    
    // Core decision making parameters
    decision: {
        // Decision frequency (milliseconds between AI decisions)
        frequency: 2000,
        
        // Priority weights for different decision sources
        priorities: {
            critical_needs: 10.0,    // Highest priority
            task_assignment: 8.0,    // Work responsibilities
            social_needs: 6.0,       // Personality-driven social
            routine_behavior: 4.0,   // Time-based patterns
            idle_behavior: 2.0       // Default/fallback
        },
        
        // Decision confidence thresholds
        confidence: {
            minimum: 0.3,      // Won't take action below this
            preferred: 0.6,    // Comfortable decision level
            certain: 0.9       // High confidence threshold
        },
        
        // Randomness and variation
        randomness: {
            base_variation: 0.1,        // 10% random variation in decisions
            personality_consistency: 0.8, // How consistent characters are
            mood_influence: 0.3,        // How much mood affects decisions
            fatigue_influence: 0.4      // How tiredness affects consistency
        }
    },
    
    // Need system configuration
    needs: {
        // Critical thresholds (0-10 scale)
        thresholds: {
            critical: 2,      // Emergency level - overrides everything
            low: 4,           // High priority level
            moderate: 6,      // Normal level
            satisfied: 8      // Good level
        },
        
        // Need decay rates (per hour)
        decay_rates: {
            energy: 0.8,      // Energy decreases throughout day
            hunger: 0.6,      // Hunger builds gradually
            social: 0.4,      // Social needs decrease slowly
            stress: -0.3,     // Stress decreases slightly over time
            comfort: 0.2      // Comfort needs minimal decay
        },
        
        // Need satisfaction from actions
        satisfaction: {
            'DRINK_COFFEE': { energy: 3, comfort: 1, stress: -0.5 },
            'EAT_SNACK': { hunger: 3, comfort: 1, energy: 0.5 },
            'START_CONVERSATION': { social: 2, stress: -1 },
            'SOCIALIZE': { social: 3, stress: -1, energy: -0.5 },
            'IDLE': { stress: -2, energy: 1 },
            'WORK_ON': { stress: 1, energy: -1 },
            'MOVE_TO': { energy: -0.5 }
        },
        
        // Cross-need interactions
        interactions: {
            low_energy_affects: ['stress', 'social'],
            high_stress_affects: ['energy', 'social', 'comfort'],
            low_social_affects: ['stress', 'comfort']
        }
    },
    
    // Personality system configuration
    personality: {
        // Base trait weights (how much each trait influences behavior)
        trait_weights: {
            'Ambitious': {
                work_focus: 1.8,
                social_networking: 1.3,
                rest_avoidance: 0.6,
                goal_orientation: 1.5
            },
            'Lazy': {
                work_avoidance: 0.4,
                comfort_seeking: 1.8,
                efficiency_preference: 1.3,
                rest_preference: 1.6
            },
            'Extroverted': {
                social_seeking: 2.0,
                conversation_initiation: 1.6,
                group_preference: 1.4,
                energy_from_others: 1.3
            },
            'Introverted': {
                social_caution: 0.5,
                alone_time_preference: 1.4,
                deep_conversation: 1.2,
                energy_drain_from_crowds: 1.5
            },
            'Organized': {
                routine_adherence: 1.8,
                task_completion: 1.6,
                planning_preference: 1.4,
                efficiency: 1.3
            },
            'Chaotic': {
                routine_breaking: 0.4,
                spontaneity: 1.8,
                unpredictability: 1.4,
                task_abandonment: 1.3
            },
            'Gossip': {
                information_seeking: 1.8,
                social_curiosity: 1.6,
                conversation_extension: 1.4,
                rumor_sharing: 1.5
            },
            'Professional': {
                work_focus: 1.3,
                formal_behavior: 1.5,
                boundary_maintenance: 1.4,
                efficiency: 1.3
            }
        },
        
        // Trait compatibility matrix
        compatibility: {
            'Extroverted': { 'Introverted': -0.1, 'Gossip': 0.4, 'Professional': 0.1 },
            'Ambitious': { 'Lazy': -0.4, 'Professional': 0.3, 'Organized': 0.2 },
            'Organized': { 'Chaotic': -0.5, 'Professional': 0.4, 'Ambitious': 0.2 },
            'Gossip': { 'Professional': -0.2, 'Extroverted': 0.3, 'Introverted': -0.1 }
        },
        
        // Trait evolution (how traits can change over time)
        evolution: {
            enabled: false,           // Disabled for Phase 5
            rate: 0.001,             // Very slow change
            max_change: 0.2,         // Maximum trait strength change
            stress_influence: 0.1,   // How stress affects trait expression
            success_influence: 0.05  // How success affects trait development
        }
    },
    
    // Social system configuration
    social: {
        // Interaction distance thresholds
        distances: {
            conversation: 3,      // Max distance for conversation
            awareness: 5,         // Distance for noticing others
            crowd_threshold: 6,   // When area feels crowded
            personal_space: 1     // Minimum comfortable distance
        },
        
        // Relationship development rates
        relationships: {
            familiarity_gain: 0.1,      // Per positive interaction
            sentiment_change: 0.05,     // Per interaction outcome
            memory_fade_rate: 0.02,     // How quickly memories fade
            trust_build_rate: 0.03      // How trust develops
        },
        
        // Group dynamics
        groups: {
            optimal_conversation_size: 3,
            max_comfortable_size: 5,
            join_confidence_threshold: 0.6,
            leave_threshold: 0.3
        },
        
        // Conversation settings
        conversation: {
            base_duration: 10000,        // Base conversation length (ms)
            topic_change_rate: 0.3,      // Chance to change topic
            natural_ending_rate: 0.2,    // Chance conversation ends naturally
            interruption_tolerance: 0.1  // Tolerance for interruptions
        }
    },
    
    // Temporal behavior configuration
    temporal: {
        // Daily rhythm settings
        daily_patterns: {
            morning_energy_boost: 1.2,    // Energy multiplier in morning
            afternoon_energy_decline: 0.8, // Energy multiplier afternoon
            lunch_social_boost: 1.3,       // Social preference at lunch
            end_day_fatigue: 0.6          // Energy at end of day
        },
        
        // Weekly patterns
        weekly_patterns: {
            monday_motivation: 1.1,        // Slightly higher work motivation
            wednesday_social: 1.2,         // Mid-week social boost
            friday_relaxation: 0.8         // Lower work focus on Friday
        },
        
        // Routine adherence
        routines: {
            base_adherence: 0.7,           // How well routines are followed
            personality_influence: 0.3,    // How much personality affects adherence
            disruption_recovery: 0.8,      // How quickly routines resume after interruption
            habit_strength: 0.6            // How strong routine habits are
        }
    },
    
    // Performance and optimization settings
    performance: {
        // Memory management
        memory: {
            max_short_term_memories: 20,   // Number of recent memories to keep
            max_long_term_memories: 100,   // Total memories to maintain
            memory_compression_rate: 0.1,  // How often to compress memories
            pattern_detection_threshold: 3 // Min occurrences to detect pattern
        },
        
        // Processing optimization
        processing: {
            decision_cache_timeout: 30000,    // Cache decisions for 30 seconds
            batch_processing_size: 5,         // Process up to 5 decisions at once
            context_analysis_depth: 3,        // How deep to analyze context
            prediction_horizon: 2             // How many steps ahead to predict
        },
        
        // Update frequencies (milliseconds)
        updates: {
            decision_frequency: 2000,      // How often to make decisions
            need_decay_frequency: 30000,   // How often needs decay
            relationship_update: 60000,    // How often to update relationships
            routine_check: 10000           // How often to check routines
        }
    },
    
    // Dialogue generation settings
    dialogue: {
        // Response variety
        variety: {
            template_rotation: true,       // Use different templates
            personality_variation: 0.3,   // How much personality affects dialogue
            context_sensitivity: 0.4,     // How much context changes dialogue
            randomness: 0.2               // Random variation in responses
        },
        
        // Conversation flow
        flow: {
            greeting_probability: 0.8,     // Chance to start with greeting
            topic_coherence: 0.7,          // How well topics connect
            natural_endings: 0.6,          // How often conversations end naturally
            interruption_handling: 0.5     // How well interruptions are handled
        },
        
        // Intent distribution (probability weights)
        intent_weights: {
            greeting: 0.2,
            small_talk: 0.3,
            work_related: 0.2,
            gossip: 0.1,
            complaint: 0.1,
            supportive: 0.05,
            casual_chat: 0.25,
            information_seeking: 0.15
        }
    },
    
    // Debug and development settings
    debug: {
        // Logging levels
        logging: {
            enabled: true,
            level: 'info',              // 'debug', 'info', 'warn', 'error'
            decision_logging: true,     // Log decision making process
            personality_logging: true,  // Log personality influences
            social_logging: true,       // Log social interactions
            performance_logging: false  // Log performance metrics
        },
        
        // Visual debugging
        visualization: {
            decision_tree: false,       // Show decision tree in console
            need_tracking: false,       // Track need changes
            relationship_matrix: false, // Show relationship changes
            routine_timeline: false     // Show routine adherence
        },
        
        // Testing and simulation
        testing: {
            forced_scenarios: false,    // Enable forced scenario testing
            personality_override: null, // Override personality for testing
            need_override: null,        // Override needs for testing
            deterministic_mode: false   // Remove randomness for testing
        }
    },
    
    // Scenario-specific configurations
    scenarios: {
        // Morning rush scenario
        morning_rush: {
            coffee_urgency_multiplier: 1.5,
            social_interaction_penalty: 0.8,
            work_preparation_bonus: 1.2,
            time_pressure_stress: 1.3
        },
        
        // Lunch break scenario
        lunch_break: {
            social_interaction_bonus: 1.4,
            hunger_urgency_multiplier: 1.6,
            work_avoidance_bonus: 1.3,
            relaxation_preference: 1.2
        },
        
        // End of day scenario
        end_of_day: {
            fatigue_influence: 1.4,
            task_completion_urgency: 1.3,
            social_wind_down: 1.1,
            organization_bonus: 1.2
        },
        
        // Crisis scenario (multiple critical needs)
        crisis: {
            need_prioritization_sharpness: 2.0,
            decision_speed_bonus: 1.5,
            social_interaction_penalty: 0.6,
            routine_abandonment_rate: 0.8
        }
    },
    
    // Integration settings for connecting with game systems
    integration: {
        // Character system integration
        character: {
            property_mapping: {
                energy: 'energy',
                hunger: 'hunger',
                social: 'social',
                stress: 'stress',
                comfort: 'comfort'
            },
            update_frequency: 1000,     // How often to sync with character data
            validation_enabled: true    // Validate character data integrity
        },
        
        // UI system integration
        ui: {
            decision_feedback: true,    // Show decisions in UI
            thought_bubbles: false,     // Show character thoughts
            relationship_indicators: false, // Show relationship status
            need_visualization: true    // Show need levels
        },
        
        // Event system integration
        events: {
            decision_events: true,      // Fire events for decisions
            social_events: true,        // Fire events for social interactions
            routine_events: false,      // Fire events for routine actions
            need_events: true          // Fire events for need changes
        }
    },
    
    // Experimental features (disabled by default)
    experimental: {
        // Advanced AI features
        advanced_ai: {
            learning_from_failures: false,     // Learn from failed actions
            emotional_contagion: false,        // Spread emotions between characters
            group_decision_making: false,      // Coordinate group actions
            predictive_behavior: false         // Predict future actions
        },
        
        // Dynamic difficulty
        dynamic_difficulty: {
            enabled: false,
            adapt_to_player_skill: false,
            personality_evolution: false,
            environmental_adaptation: false
        },
        
        // Analytics and learning
        analytics: {
            behavior_tracking: false,
            pattern_recognition: false,
            optimization_suggestions: false,
            usage_statistics: false
        }
    },
    
    // Utility functions for configuration access
    get: function(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this);
    },
    
    set: function(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this);
        target[lastKey] = value;
    },
    
    // Validation functions
    validate: function() {
        const errors = [];
        
        // Validate critical thresholds
        if (this.needs.thresholds.critical >= this.needs.thresholds.low) {
            errors.push('Critical threshold must be less than low threshold');
        }
        
        // Validate decision frequencies
        if (this.decision.frequency < 1000) {
            errors.push('Decision frequency should be at least 1000ms');
        }
        
        // Validate personality weights
        Object.values(this.personality.trait_weights).forEach(weights => {
            Object.values(weights).forEach(weight => {
                if (weight < 0 || weight > 3) {
                    errors.push('Personality weights should be between 0 and 3');
                }
            });
        });
        
        return errors;
    },
    
    // Reset to defaults
    reset: function() {
        // This would restore all default values
        console.log('Configuration reset to defaults');
    },
    
    // Export configuration for debugging
    export: function() {
        return JSON.stringify(this, null, 2);
    },
    
    // Load configuration from external source
    load: function(configData) {
        Object.assign(this, configData);
        const errors = this.validate();
        if (errors.length > 0) {
            console.warn('Configuration validation errors:', errors);
        }
    }
};

// Environment-specific overrides
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    // Development environment settings
    MockAIConfig.debug.logging.level = 'debug';
    MockAIConfig.debug.logging.decision_logging = true;
    MockAIConfig.debug.testing.forced_scenarios = true;
    MockAIConfig.decision.frequency = 1500; // Faster decisions for testing
}

// Export as default for ES6 modules
export default MockAIConfig;
