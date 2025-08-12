/**
 * Social Dynamics - Relationship-Based Decision Making
 * Analyzes social context and relationships to influence character behavior
 * 
 * SOCIAL FACTORS:
 * - Relationship Status: Friend, colleague, stranger, supervisor
 * - Interaction History: Previous conversations and outcomes
 * - Group Dynamics: Who's talking to whom, group formations
 * - Social Hierarchies: Workplace status and influence
 * - Emotional Contagion: How moods spread between characters
 * 
 * SOCIAL BEHAVIORS:
 * - Approach/Avoidance: Who to talk to and who to avoid
 * - Conversation Topics: What's appropriate to discuss with whom
 * - Group Joining: When and how to join conversations
 * - Conflict Resolution: Handling disagreements and tensions
 * - Alliance Formation: Building and maintaining relationships
 * 
 * EXPANSION NOTES:
 * - Add romantic relationships and attractions
 * - Implement workplace politics and power dynamics
 * - Create cultural and demographic influences
 * - Add emotional intelligence variations by personality
 */

export class SocialDynamics {
    constructor() {
        // Relationship types and their behavioral impacts
        this.relationshipTypes = {
            stranger: {
                formality: 1.3,
                caution: 1.2,
                small_talk_preference: 1.4,
                personal_topics: 0.3,
                trust_level: 0.2
            },
            acquaintance: {
                formality: 1.1,
                caution: 1.0,
                small_talk_preference: 1.2,
                personal_topics: 0.6,
                trust_level: 0.5
            },
            colleague: {
                formality: 1.0,
                caution: 0.9,
                work_topics: 1.3,
                personal_topics: 0.7,
                trust_level: 0.7
            },
            friend: {
                formality: 0.7,
                caution: 0.6,
                personal_topics: 1.4,
                humor: 1.3,
                trust_level: 0.9
            },
            close_friend: {
                formality: 0.5,
                caution: 0.4,
                personal_topics: 1.6,
                emotional_support: 1.4,
                trust_level: 0.95
            },
            supervisor: {
                formality: 1.5,
                caution: 1.4,
                work_topics: 1.5,
                personal_topics: 0.4,
                deference: 1.3,
                trust_level: 0.6
            },
            subordinate: {
                formality: 1.2,
                mentoring: 1.3,
                work_topics: 1.3,
                authority: 1.2,
                trust_level: 0.7
            }
        };
        
        // Group dynamic factors
        this.groupDynamics = {
            conversation_circles: {
                join_threshold: 0.6, // Social confidence needed to join
                optimal_size: 3,     // Best conversation group size
                max_comfortable: 5   // Maximum before feeling crowded
            },
            workplace_hierarchies: {
                respect_distance: 2, // Distance to maintain from superiors
                authority_radius: 3, // Area of influence for managers
                peer_collaboration: 1.5 // Bonus to peer interactions
            },
            social_contagion: {
                mood_spread_rate: 0.3,    // How quickly moods spread
                energy_influence: 0.2,    // How others' energy affects you
                stress_contagion: 0.4     // How stress spreads (faster than positive moods)
            }
        };
        
        // Personality-based social behaviors
        this.personalitySocialBehaviors = {
            'Extroverted': {
                approach_bonus: 1.4,
                group_joining: 1.5,
                conversation_initiation: 1.6,
                social_energy_gain: 1.3
            },
            'Introverted': {
                approach_bonus: 0.6,
                group_joining: 0.5,
                conversation_initiation: 0.4,
                social_energy_drain: 1.4,
                one_on_one_preference: 1.3
            },
            'Gossip': {
                information_seeking: 1.8,
                rumor_spreading: 1.6,
                social_curiosity: 1.7,
                network_building: 1.4
            },
            'Professional': {
                work_relationship_focus: 1.4,
                boundary_maintenance: 1.3,
                formal_interaction: 1.2,
                personal_distance: 1.2
            },
            'Ambitious': {
                networking: 1.5,
                status_awareness: 1.4,
                strategic_relationships: 1.3,
                mentor_seeking: 1.2
            },
            'Chaotic': {
                unpredictable_social: 1.3,
                boundary_crossing: 1.2,
                mood_volatility: 1.4
            }
        };
        
        console.log('👥 Social Dynamics initialized');
    }

    /**
     * Analyze social situation and provide behavioral recommendations
     * @param {Object} character - Character object
     * @param {Array} nearbyEntities - People and objects nearby
     * @returns {Object} - Social analysis and recommendations
     */
    analyzeSocialSituation(character, nearbyEntities) {
        const analysis = {
            people_present: [],
            relationship_map: {},
            group_formations: [],
            social_opportunities: [],
            social_barriers: [],
            recommended_actions: [],
            overall_social_climate: 'neutral'
        };
        
        if (!nearbyEntities || nearbyEntities.length === 0) {
            analysis.overall_social_climate = 'isolated';
            return analysis;
        }
        
        // Filter for people
        const people = nearbyEntities.filter(entity => entity.type === 'Character');
        analysis.people_present = people;
        
        if (people.length === 0) return analysis;
        
        // Analyze relationships
        people.forEach(person => {
            analysis.relationship_map[person.name] = this.determineRelationship(character, person);
        });
        
        // Identify group formations
        analysis.group_formations = this.identifyGroupFormations(people);
        
        // Find social opportunities
        analysis.social_opportunities = this.identifySocialOpportunities(character, people, analysis.relationship_map);
        
        // Identify barriers
        analysis.social_barriers = this.identifySocialBarriers(character, people, analysis.relationship_map);
        
        // Generate action recommendations
        analysis.recommended_actions = this.generateSocialRecommendations(character, analysis);
        
        // Assess overall climate
        analysis.overall_social_climate = this.assessSocialClimate(character, analysis);
        
        console.log(`👥 Social analysis for ${character.name}: ${people.length} people, ${analysis.social_opportunities.length} opportunities`);
        
        return analysis;
    }

    /**
     * Determine relationship type between two characters
     * @param {Object} character1 - First character
     * @param {Object} character2 - Second character
     * @returns {Object} - Relationship analysis
     */
    determineRelationship(character1, character2) {
        // This would normally check character memory and interaction history
        // For now, use simplified logic based on names and context
        
        let relationshipType = 'colleague'; // Default workplace relationship
        let familiarity = 0.5; // 0-1 scale
        let sentiment = 0.0; // -1 to 1 scale (negative to positive)
        
        // Check if they've interacted before (would check memory system)
        const hasInteracted = this.checkInteractionHistory(character1, character2);
        
        if (hasInteracted) {
            familiarity = Math.min(0.9, familiarity + 0.3);
            relationshipType = familiarity > 0.7 ? 'friend' : 'acquaintance';
        }
        
        // Personality compatibility affects sentiment
        const compatibility = this.calculatePersonalityCompatibility(character1, character2);
        sentiment = compatibility;
        
        return {
            type: relationshipType,
            familiarity: familiarity,
            sentiment: sentiment,
            interaction_count: hasInteracted ? Math.floor(Math.random() * 10) + 1 : 0,
            last_interaction: hasInteracted ? 'recent' : 'never',
            compatibility: compatibility
        };
    }

    /**
     * Check if two characters have interaction history
     * @param {Object} character1 - First character
     * @param {Object} character2 - Second character
     * @returns {boolean} - True if they've interacted
     */
    checkInteractionHistory(character1, character2) {
        // Simplified: random chance based on workplace proximity
        // In real implementation, would check actual memory/conversation logs
        return Math.random() < 0.6; // 60% chance of prior interaction
    }

    /**
     * Calculate personality compatibility between characters
     * @param {Object} character1 - First character
     * @param {Object} character2 - Second character
     * @returns {number} - Compatibility score (-1 to 1)
     */
    calculatePersonalityCompatibility(character1, character2) {
        const traits1 = character1.personalityTags || [];
        const traits2 = character2.personalityTags || [];
        
        let compatibility = 0;
        let factors = 0;
        
        // Compatible trait combinations
        const compatibilities = {
            'Extroverted': { 'Extroverted': 0.3, 'Introverted': -0.1, 'Gossip': 0.4 },
            'Introverted': { 'Introverted': 0.2, 'Extroverted': -0.1, 'Professional': 0.3 },
            'Ambitious': { 'Ambitious': 0.2, 'Lazy': -0.4, 'Professional': 0.3 },
            'Lazy': { 'Lazy': 0.2, 'Ambitious': -0.4, 'Chaotic': 0.1 },
            'Organized': { 'Organized': 0.3, 'Chaotic': -0.5, 'Professional': 0.4 },
            'Chaotic': { 'Chaotic': 0.1, 'Organized': -0.5, 'Lazy': 0.1 },
            'Gossip': { 'Gossip': 0.4, 'Professional': -0.2, 'Extroverted': 0.3 },
            'Professional': { 'Professional': 0.3, 'Gossip': -0.2, 'Ambitious': 0.3 }
        };
        
        traits1.forEach(trait1 => {
            traits2.forEach(trait2 => {
                if (compatibilities[trait1] && compatibilities[trait1][trait2] !== undefined) {
                    compatibility += compatibilities[trait1][trait2];
                    factors++;
                }
            });
        });
        
        return factors > 0 ? Math.max(-1, Math.min(1, compatibility / factors)) : 0;
    }

    /**
     * Identify group formations in the area
     * @param {Array} people - People present
     * @returns {Array} - Identified groups
     */
    identifyGroupFormations(people) {
        const groups = [];
        
        if (people.length < 2) return groups;
        
        // Simple grouping based on proximity
        const proximityGroups = this.groupByProximity(people);
        
        proximityGroups.forEach(group => {
            if (group.length >= 2) {
                groups.push({
                    type: group.length === 2 ? 'pair' : 'group',
                    size: group.length,
                    members: group.map(p => p.name),
                    approachability: this.calculateGroupApproachability(group),
                    dominant_mood: this.calculateGroupMood(group),
                    activity: this.inferGroupActivity(group)
                });
            }
        });
        
        return groups;
    }

    /**
     * Group people by proximity
     * @param {Array} people - People to group
     * @returns {Array} - Arrays of grouped people
     */
    groupByProximity(people) {
        const groups = [];
        const processed = new Set();
        
        people.forEach(person => {
            if (processed.has(person.name)) return;
            
            const group = [person];
            processed.add(person.name);
            
            // Find others within conversation distance
            people.forEach(other => {
                if (!processed.has(other.name) && 
                    other.distance <= 3 && 
                    Math.abs((person.distance || 5) - (other.distance || 5)) <= 2) {
                    group.push(other);
                    processed.add(other.name);
                }
            });
            
            groups.push(group);
        });
        
        return groups;
    }

    /**
     * Calculate how approachable a group is
     * @param {Array} group - Group members
     * @returns {number} - Approachability score (0-1)
     */
    calculateGroupApproachability(group) {
        let approachability = 0.5; // Base approachability
        
        // Smaller groups are more approachable
        if (group.length <= 2) approachability += 0.3;
        else if (group.length >= 5) approachability -= 0.4;
        
        // Mood affects approachability
        const averageMood = this.calculateAverageMood(group);
        if (averageMood === 'happy' || averageMood === 'friendly') approachability += 0.2;
        else if (averageMood === 'busy' || averageMood === 'focused') approachability -= 0.3;
        
        return Math.max(0, Math.min(1, approachability));
    }

    /**
     * Calculate dominant mood of a group
     * @param {Array} group - Group members
     * @returns {string} - Dominant mood
     */
    calculateGroupMood(group) {
        const moods = group.map(person => person.mood || 'neutral');
        const moodCounts = {};
        
        moods.forEach(mood => {
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        
        return Object.entries(moodCounts)
            .reduce((a, b) => moodCounts[a[0]] > moodCounts[b[0]] ? a : b)[0];
    }

    calculateAverageMood(group) {
        return this.calculateGroupMood(group); // Simplified
    }

    /**
     * Infer what a group is doing
     * @param {Array} group - Group members
     * @returns {string} - Inferred activity
     */
    inferGroupActivity(group) {
        const activities = ['chatting', 'working', 'planning', 'gossiping', 'problem-solving'];
        
        // In real implementation, would analyze conversation context, location, etc.
        return activities[Math.floor(Math.random() * activities.length)];
    }

    /**
     * Identify social opportunities for the character
     * @param {Object} character - Character object
     * @param {Array} people - People present
     * @param {Object} relationshipMap - Relationship analysis
     * @returns {Array} - Social opportunities
     */
    identifySocialOpportunities(character, people, relationshipMap) {
        const opportunities = [];
        const personality = character.personalityTags || [];
        
        people.forEach(person => {
            const relationship = relationshipMap[person.name];
            const distance = person.distance || 10;
            
            // One-on-one conversation opportunities
            if (distance <= 3 && !this.isInGroup(person, people)) {
                opportunities.push({
                    type: 'one_on_one_conversation',
                    target: person.name,
                    relationship: relationship.type,
                    confidence: this.calculateConversationConfidence(character, person, relationship),
                    suggested_topics: this.suggestConversationTopics(character, person, relationship),
                    priority: this.calculateOpportunityPriority(character, relationship, 'conversation')
                });
            }
            
            // Networking opportunities (for ambitious characters)
            if (personality.includes('Ambitious') && relationship.type === 'supervisor') {
                opportunities.push({
                    type: 'networking',
                    target: person.name,
                    relationship: relationship.type,
                    confidence: 0.6,
                    benefits: ['career_advancement', 'mentor_relationship'],
                    priority: 0.8
                });
            }
            
            // Information gathering (for gossip characters)
            if (personality.includes('Gossip') && relationship.familiarity < 0.7) {
                opportunities.push({
                    type: 'information_gathering',
                    target: person.name,
                    relationship: relationship.type,
                    confidence: 0.7,
                    potential_info: ['workplace_news', 'personal_updates', 'rumors'],
                    priority: 0.6
                });
            }
            
            // Mentoring opportunities (for experienced characters with subordinates)
            if (relationship.type === 'subordinate' && character.experience > 3) {
                opportunities.push({
                    type: 'mentoring',
                    target: person.name,
                    relationship: relationship.type,
                    confidence: 0.8,
                    benefits: ['relationship_building', 'leadership_development'],
                    priority: 0.5
                });
            }
        });
        
        // Group joining opportunities
        const groups = this.identifyGroupFormations(people);
        groups.forEach(group => {
            if (group.approachability > 0.5 && group.size <= this.groupDynamics.conversation_circles.max_comfortable) {
                opportunities.push({
                    type: 'join_group',
                    targets: group.members,
                    group_size: group.size,
                    confidence: group.approachability,
                    activity: group.activity,
                    priority: this.calculateGroupJoinPriority(character, group)
                });
            }
        });
        
        return opportunities.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Check if a person is currently in a group conversation
     * @param {Object} person - Person to check
     * @param {Array} allPeople - All people present
     * @returns {boolean} - True if in group
     */
    isInGroup(person, allPeople) {
        const closeNeighbors = allPeople.filter(other => 
            other.name !== person.name && 
            Math.abs((other.distance || 10) - (person.distance || 10)) <= 2
        );
        return closeNeighbors.length >= 1;
    }

    /**
     * Calculate confidence for starting a conversation
     * @param {Object} character - Character initiating
     * @param {Object} target - Target person
     * @param {Object} relationship - Relationship analysis
     * @returns {number} - Confidence score (0-1)
     */
    calculateConversationConfidence(character, target, relationship) {
        let confidence = 0.5; // Base confidence
        
        // Personality factors
        const personality = character.personalityTags || [];
        if (personality.includes('Extroverted')) confidence += 0.3;
        if (personality.includes('Introverted')) confidence -= 0.2;
        if (personality.includes('Professional') && relationship.type === 'colleague') confidence += 0.1;
        
        // Relationship factors
        confidence += relationship.familiarity * 0.3;
        confidence += Math.max(0, relationship.sentiment * 0.2);
        
        // Target's mood
        const targetMood = target.mood || 'neutral';
        const moodModifiers = {
            'happy': 0.2, 'friendly': 0.3, 'neutral': 0,
            'busy': -0.3, 'focused': -0.2, 'stressed': -0.4
        };
        confidence += moodModifiers[targetMood] || 0;
        
        return Math.max(0, Math.min(1, confidence));
    }

    /**
     * Suggest appropriate conversation topics
     * @param {Object} character - Character initiating
     * @param {Object} target - Target person
     * @param {Object} relationship - Relationship analysis
     * @returns {Array} - Suggested topics
     */
    suggestConversationTopics(character, target, relationship) {
        const topics = [];
        const relationshipType = relationship.type;
        const personality = character.personalityTags || [];
        
        // Universal topics
        topics.push('greeting', 'weather');
        
        // Relationship-appropriate topics
        if (relationshipType === 'colleague' || relationshipType === 'supervisor') {
            topics.push('work_projects', 'deadlines', 'workplace_news');
        }
        
        if (relationshipType === 'friend' || relationshipType === 'close_friend') {
            topics.push('personal_life', 'hobbies', 'weekend_plans');
        }
        
        if (relationship.familiarity > 0.7) {
            topics.push('shared_experiences', 'inside_jokes');
        }
        
        // Personality-driven topics
        if (personality.includes('Gossip')) {
            topics.push('office_rumors', 'people_updates');
        }
        
        if (personality.includes('Professional')) {
            topics.push('industry_trends', 'professional_development');
        }
        
        if (personality.includes('Ambitious')) {
            topics.push('career_goals', 'opportunities');
        }
        
        return topics;
    }

    /**
     * Calculate priority for a social opportunity
     * @param {Object} character - Character
     * @param {Object} relationship - Relationship data
     * @param {string} opportunityType - Type of opportunity
     * @returns {number} - Priority score (0-1)
     */
    calculateOpportunityPriority(character, relationship, opportunityType) {
        let priority = 0.5;
        
        const personality = character.personalityTags || [];
        const needs = {
            social: character.social || 5,
            energy: character.energy || 5
        };
        
        // Need-based priority
        if (needs.social < 5) priority += (5 - needs.social) * 0.1;
        
        // Personality-based priority
        if (personality.includes('Extroverted')) priority += 0.2;
        if (personality.includes('Introverted') && opportunityType === 'one_on_one_conversation') priority += 0.1;
        if (personality.includes('Gossip') && opportunityType === 'information_gathering') priority += 0.3;
        
        // Relationship-based priority
        if (relationship.sentiment > 0.5) priority += 0.2;
        if (relationship.type === 'supervisor' && personality.includes('Ambitious')) priority += 0.3;
        
        return Math.max(0, Math.min(1, priority));
    }

    /**
     * Calculate priority for joining a group
     * @param {Object} character - Character
     * @param {Object} group - Group data
     * @returns {number} - Priority score (0-1)
     */
    calculateGroupJoinPriority(character, group) {
        let priority = 0.3; // Lower base priority than one-on-one
        
        const personality = character.personalityTags || [];
        
        // Personality factors
        if (personality.includes('Extroverted')) priority += 0.4;
        if (personality.includes('Introverted')) priority -= 0.2;
        
        // Group size preference
        if (group.size <= 3) priority += 0.2;
        else if (group.size >= 5) priority -= 0.3;
        
        // Activity type
        if (group.activity === 'chatting' || group.activity === 'gossiping') {
            if (personality.includes('Gossip')) priority += 0.3;
        }
        
        return Math.max(0, Math.min(1, priority));
    }

    /**
     * Identify social barriers preventing interaction
     * @param {Object} character - Character
     * @param {Array} people - People present
     * @param {Object} relationshipMap - Relationship data
     * @returns {Array} - Identified barriers
     */
    identifySocialBarriers(character, people, relationshipMap) {
        const barriers = [];
        const personality = character.personalityTags || [];
        
        // Crowding barriers
        if (people.length > 6) {
            barriers.push({
                type: 'overcrowding',
                description: 'Too many people in area',
                severity: personality.includes('Introverted') ? 'high' : 'medium',
                affected_actions: ['group_conversation', 'approaching_strangers']
            });
        }
        
        // Negative relationship barriers
        Object.entries(relationshipMap).forEach(([name, relationship]) => {
            if (relationship.sentiment < -0.3) {
                barriers.push({
                    type: 'negative_relationship',
                    target: name,
                    description: `Poor relationship with ${name}`,
                    severity: 'high',
                    affected_actions: ['conversation', 'collaboration']
                });
            }
        });
        
        // Energy barriers
        if ((character.energy || 5) < 3) {
            barriers.push({
                type: 'low_energy',
                description: 'Too tired for social interaction',
                severity: personality.includes('Introverted') ? 'high' : 'medium',
                affected_actions: ['conversation_initiation', 'group_joining']
            });
        }
        
        // Stress barriers
        if ((character.stress || 5) > 7) {
            barriers.push({
                type: 'high_stress',
                description: 'Too stressed to socialize comfortably',
                severity: 'high',
                affected_actions: ['casual_conversation', 'humor', 'relaxed_interaction']
            });
        }
        
        // Personality-specific barriers
        if (personality.includes('Professional')) {
            barriers.push({
                type: 'professional_boundaries',
                description: 'Maintaining professional distance',
                severity: 'low',
                affected_actions: ['personal_topics', 'casual_behavior']
            });
        }
        
        return barriers;
    }

    /**
     * Generate social action recommendations
     * @param {Object} character - Character
     * @param {Object} analysis - Complete social analysis
     * @returns {Array} - Recommended actions
     */
    generateSocialRecommendations(character, analysis) {
        const recommendations = [];
        
        // Process opportunities into actionable recommendations
        analysis.social_opportunities.forEach(opportunity => {
            let recommendation = null;
            
            switch (opportunity.type) {
                case 'one_on_one_conversation':
                    recommendation = {
                        action: 'START_CONVERSATION',
                        target: opportunity.target,
                        confidence: opportunity.confidence,
                        reasoning: `Good opportunity to talk with ${opportunity.target}`,
                        suggested_topics: opportunity.suggested_topics,
                        priority: opportunity.priority
                    };
                    break;
                    
                case 'join_group':
                    recommendation = {
                        action: 'JOIN_CONVERSATION',
                        targets: opportunity.targets,
                        confidence: opportunity.confidence,
                        reasoning: `Could join the ${opportunity.activity} discussion`,
                        priority: opportunity.priority
                    };
                    break;
                    
                case 'networking':
                    recommendation = {
                        action: 'PROFESSIONAL_CONVERSATION',
                        target: opportunity.target,
                        confidence: opportunity.confidence,
                        reasoning: 'Career networking opportunity',
                        focus: 'professional_development',
                        priority: opportunity.priority
                    };
                    break;
                    
                case 'information_gathering':
                    recommendation = {
                        action: 'CASUAL_INQUIRY',
                        target: opportunity.target,
                        confidence: opportunity.confidence,
                        reasoning: 'Opportunity to gather information',
                        focus: 'information_seeking',
                        priority: opportunity.priority
                    };
                    break;
            }
            
            if (recommendation) {
                recommendations.push(recommendation);
            }
        });
        
        // Add barrier-aware recommendations
        if (analysis.social_barriers.length > 0) {
            recommendations.forEach(rec => {
                const relevantBarriers = analysis.social_barriers.filter(barrier =>
                    barrier.affected_actions.some(action => 
                        rec.action.toLowerCase().includes(action.toLowerCase())
                    )
                );
                
                if (relevantBarriers.length > 0) {
                    rec.confidence *= 0.8; // Reduce confidence due to barriers
                    rec.barriers = relevantBarriers;
                }
            });
        }
        
        return recommendations.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Assess overall social climate
     * @param {Object} character - Character
     * @param {Object} analysis - Social analysis
     * @returns {string} - Climate description
     */
    assessSocialClimate(character, analysis) {
        const peopleCount = analysis.people_present.length;
        const opportunityCount = analysis.social_opportunities.length;
        const barrierSeverity = analysis.social_barriers.reduce((total, barrier) => {
            const severityScores = { low: 1, medium: 2, high: 3 };
            return total + (severityScores[barrier.severity] || 1);
        }, 0);
        
        if (peopleCount === 0) return 'isolated';
        if (barrierSeverity > 6) return 'tense';
        if (opportunityCount === 0) return 'unfavorable';
        if (opportunityCount > peopleCount) return 'vibrant';
        if (opportunityCount >= peopleCount * 0.5) return 'favorable';
        
        return 'neutral';
    }

    /**
     * Calculate social influence on character needs
     * @param {Object} character - Character
     * @param {Object} socialContext - Current social context
     * @returns {Object} - Need modifications
     */
    calculateSocialInfluence(character, socialContext) {
        const influence = {
            social: 0,
            stress: 0,
            energy: 0,
            mood: 'no_change'
        };
        
        const personality = character.personalityTags || [];
        const peopleCount = socialContext.people_present?.length || 0;
        
        // Extroverted characters gain energy from social interaction
        if (personality.includes('Extroverted') && peopleCount > 0) {
            influence.social += Math.min(2, peopleCount * 0.3);
            influence.energy += Math.min(1, peopleCount * 0.2);
        }
        
        // Introverted characters lose energy in crowds
        if (personality.includes('Introverted') && peopleCount > 3) {
            influence.energy -= (peopleCount - 3) * 0.2;
            influence.stress += (peopleCount - 3) * 0.1;
        }
        
        // Positive relationships boost mood
        const positiveRelationships = Object.values(socialContext.relationship_map || {})
            .filter(rel => rel.sentiment > 0.3).length;
        
        if (positiveRelationships > 0) {
            influence.social += positiveRelationships * 0.2;
            influence.mood = 'positive';
        }
        
        // Negative relationships increase stress
        const negativeRelationships = Object.values(socialContext.relationship_map || {})
            .filter(rel => rel.sentiment < -0.3).length;
        
        if (negativeRelationships > 0) {
            influence.stress += negativeRelationships * 0.3;
            influence.mood = 'negative';
        }
        
        return influence;
    }

    /**
     * Get social action modifiers for decision making
     * @param {Object} character - Character
     * @param {Object} proposedAction - Action being considered
     * @param {Object} socialContext - Social context
     * @returns {number} - Modifier (0.5 to 1.5)
     */
    getSocialActionModifier(character, proposedAction, socialContext) {
        let modifier = 1.0;
        
        const actionType = proposedAction.type;
        const target = proposedAction.target;
        
        // Check relationship with target
        if (target && socialContext.relationship_map && socialContext.relationship_map[target]) {
            const relationship = socialContext.relationship_map[target];
            
            // Positive relationships encourage interaction
            if (actionType === 'START_CONVERSATION' && relationship.sentiment > 0.3) {
                modifier *= 1.3;
            }
            
            // Negative relationships discourage interaction
            if (actionType === 'START_CONVERSATION' && relationship.sentiment < -0.3) {
                modifier *= 0.6;
            }
            
            // Formal relationships affect conversation style
            if (relationship.type === 'supervisor') {
                modifier *= character.personalityTags?.includes('Professional') ? 1.1 : 0.9;
            }
        }
        
        // Social barriers affect actions
        socialContext.social_barriers?.forEach(barrier => {
            if (barrier.affected_actions.includes(actionType.toLowerCase())) {
                const severityPenalty = { low: 0.9, medium: 0.8, high: 0.6 };
                modifier *= severityPenalty[barrier.severity] || 0.8;
            }
        });
        
        return Math.max(0.5, Math.min(1.5, modifier));
    }

    /**
     * Generate social reasoning for decisions
     * @param {Object} decision - Decision being made
     * @param {Object} socialContext - Social context
     * @returns {string} - Social reasoning
     */
    generateSocialReasoning(decision, socialContext) {
        const reasons = [];
        
        if (decision.action?.type === 'START_CONVERSATION') {
            const target = decision.action.target;
            const relationship = socialContext.relationship_map?.[target];
            
            if (relationship) {
                if (relationship.sentiment > 0.3) {
                    reasons.push(`positive relationship with ${target}`);
                }
                if (relationship.familiarity > 0.7) {
                    reasons.push(`familiar with ${target}`);
                }
            }
        }
        
        if (socialContext.overall_social_climate === 'favorable') {
            reasons.push('favorable social environment');
        }
        
        if (socialContext.social_opportunities.length > 0) {
            reasons.push('social opportunities available');
        }
        
        return reasons.length > 0 ? reasons.join(', ') : 'social context considered';
    }
}
