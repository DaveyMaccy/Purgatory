/**
 * Work Dialogue Pool - Professional Conversation Specialist
 * Handles all work-related conversations with professional context
 * 
 * SPECIALIZED TOPICS:
 * - Project discussions and deadlines
 * - Meeting coordination and planning
 * - Task delegation and collaboration
 * - Performance and feedback
 * - Office politics and workplace dynamics
 * - Professional development and career growth
 * - Client interactions and business discussions
 * - Industry trends and market analysis
 * 
 * CONVERSATION STYLES:
 * - Formal business communication
 * - Collaborative team discussions  
 * - Problem-solving dialogues
 * - Status updates and reporting
 * - Mentoring and guidance exchanges
 */

export class WorkDialoguePool {
    constructor() {
        // Work-specific trigger words and responses
        this.workTriggers = {
            deadline: {
                keywords: ['deadline', 'due date', 'timeline', 'rush', 'urgent', 'asap'],
                responses: 'deadline_response',
                urgency: 'high'
            },
            
            project: {
                keywords: ['project', 'initiative', 'campaign', 'task', 'assignment'],
                responses: 'project_response',
                urgency: 'medium'
            },
            
            meeting: {
                keywords: ['meeting', 'conference', 'discussion', 'presentation', 'review'],
                responses: 'meeting_response',
                urgency: 'medium'
            },
            
            collaboration: {
                keywords: ['team', 'together', 'collaborate', 'help', 'support', 'assist'],
                responses: 'collaboration_response',
                urgency: 'low'
            },
            
            performance: {
                keywords: ['performance', 'review', 'feedback', 'evaluation', 'assessment'],
                responses: 'performance_response',
                urgency: 'medium'
            },
            
            client: {
                keywords: ['client', 'customer', 'stakeholder', 'external', 'vendor'],
                responses: 'client_response',
                urgency: 'high'
            },
            
            stress: {
                keywords: ['overwhelmed', 'stressed', 'burned out', 'overloaded', 'exhausted'],
                responses: 'work_stress_response',
                urgency: 'high'
            },
            
            achievement: {
                keywords: ['completed', 'finished', 'accomplished', 'success', 'achievement'],
                responses: 'achievement_response',
                urgency: 'low'
            }
        };
        
        // Work-specific sentence components (modular system)
        this.workComponents = {
            // Professional openings
            openings: {
                formal: ['Regarding that', 'Speaking of', 'In terms of', 'With respect to', 'Concerning'],
                collaborative: ['I think we should', 'What if we', 'Maybe we could', 'Have you considered', 'It might help to'],
                supportive: ['I understand', 'That makes sense', 'I can see how', 'I hear what you\'re saying', 'Absolutely'],
                urgent: ['We need to', 'It\'s critical that', 'The priority is', 'We should immediately', 'Time is of the essence']
            },
            
            // Core work content
            coreContent: {
                deadline_response: {
                    acknowledgment: ['that deadline is tight', 'time is definitely a factor', 'we\'ll need to prioritize'],
                    problem_solving: ['let\'s break this down', 'we could streamline the process', 'maybe we can reallocate resources'],
                    support: ['I can help with that', 'what do you need from me', 'let\'s tackle this together'],
                    escalation: ['we should loop in management', 'this needs higher visibility', 'we may need to reset expectations']
                },
                
                project_response: {
                    status: ['how\'s progress on that', 'where are we with', 'what\'s the current status of'],
                    planning: ['we should map out the timeline', 'let\'s identify the key milestones', 'what are the dependencies'],
                    collaboration: ['who else is involved in this', 'we should coordinate with', 'let\'s align on'],
                    quality: ['we need to ensure quality', 'let\'s double-check', 'attention to detail is crucial here']
                },
                
                meeting_response: {
                    scheduling: ['when works for everyone', 'let\'s find a time that fits', 'I can send out a calendar invite'],
                    agenda: ['what should we cover', 'the key topics are', 'we should discuss'],
                    preparation: ['I\'ll prepare some notes', 'we should review beforehand', 'let me gather the relevant info'],
                    follow_up: ['I\'ll send out action items', 'we should document decisions', 'let\'s schedule a follow-up']
                },
                
                collaboration_response: {
                    offering: ['I\'d be happy to help with', 'I have experience in', 'I can contribute to'],
                    requesting: ['could you help me understand', 'I\'d appreciate your input on', 'what\'s your take on'],
                    coordinating: ['let\'s sync up on this', 'we should align our approach', 'how should we divide this'],
                    appreciating: ['thanks for jumping in', 'I appreciate the collaboration', 'great teamwork on this']
                },
                
                performance_response: {
                    positive: ['you\'ve been doing great work', 'I\'ve noticed real improvement', 'your contributions are valuable'],
                    constructive: ['there\'s room for growth in', 'we could focus on improving', 'here\'s an area to develop'],
                    goal_setting: ['let\'s set some objectives', 'what are your career goals', 'where do you want to focus'],
                    support: ['what support do you need', 'how can I help you succeed', 'what resources would be helpful']
                },
                
                client_response: {
                    professional: ['I\'ll follow up with the client', 'we should manage expectations', 'let\'s ensure client satisfaction'],
                    problem_solving: ['how can we address their concerns', 'what solution can we propose', 'let\'s think through their needs'],
                    relationship: ['maintaining that relationship is key', 'we want to keep them happy', 'they\'re an important client'],
                    communication: ['I\'ll draft a response', 'we should schedule a call', 'clear communication is essential']
                },
                
                work_stress_response: {
                    empathy: ['I can see you\'re under a lot of pressure', 'that workload sounds overwhelming', 'work has been intense lately'],
                    support: ['what can I take off your plate', 'let\'s see how to lighten the load', 'you don\'t have to handle this alone'],
                    solutions: ['maybe we can reprioritize', 'let\'s talk to management about resources', 'we could push back on some deadlines'],
                    wellness: ['make sure you\'re taking breaks', 'your wellbeing is important', 'don\'t burn yourself out']
                },
                
                achievement_response: {
                    recognition: ['excellent work on that!', 'you really knocked it out of the park!', 'that was impressive!'],
                    impact: ['that made a real difference', 'the results speak for themselves', 'you should be proud of that'],
                    learning: ['what was your approach on that', 'I\'d love to hear how you tackled it', 'any lessons learned'],
                    celebration: ['this calls for recognition', 'we should celebrate this win', 'let\'s share this success with the team']
                }
            },
            
            // Professional modifiers
            modifiers: {
                urgency: {
                    high: ['as soon as possible', 'with immediate priority', 'urgently'],
                    medium: ['in a timely manner', 'when convenient', 'at your earliest opportunity'],
                    low: ['when you have a chance', 'no rush on this', 'in due course']
                },
                
                formality: {
                    formal: ['following proper protocols', 'according to company standards', 'in line with best practices'],
                    collaborative: ['working together effectively', 'as a unified team', 'with open communication'],
                    innovative: ['thinking outside the box', 'with a creative approach', 'exploring new possibilities']
                },
                
                scope: {
                    strategic: ['from a high-level perspective', 'considering the big picture', 'strategically speaking'],
                    tactical: ['in practical terms', 'operationally', 'from an execution standpoint'],
                    detailed: ['diving into the specifics', 'looking at the details', 'getting granular']
                }
            },
            
            // Professional endings
            endings: {
                action_oriented: ['Let\'s move forward on this.', 'I\'ll take the next steps.', 'What\'s our next move?'],
                collaborative: ['What are your thoughts?', 'How does that sound?', 'Are we aligned on this?'],
                supportive: ['Let me know if you need anything.', 'I\'m here to help.', 'We\'ve got this.'],
                follow_up: ['I\'ll circle back with you.', 'Let\'s touch base tomorrow.', 'I\'ll keep you posted.'],
                conclusive: ['That should do it.', 'I think we\'re all set.', 'That covers everything.']
            }
        };
        
        // Work context analysis
        this.workContextFactors = {
            meeting_in_progress: ['meeting', 'conference', 'discussion'],
            deadline_pressure: ['urgent', 'asap', 'deadline', 'rush'],
            collaborative_work: ['team', 'together', 'collaborate'],
            client_interaction: ['client', 'customer', 'external'],
            performance_discussion: ['review', 'feedback', 'performance']
        };
        
        console.log('💼 Work Dialogue Pool initialized');
    }

    /**
     * Generate work-appropriate response
     * @param {string} incomingMessage - Message to respond to
     * @param {Object} character - Character responding
     * @param {Object} context - Environmental and social context
     * @returns {string} - Professional response
     */
    generateResponse(incomingMessage, character, context) {
        try {
            // Analyze work-specific context
            const workAnalysis = this.analyzeWorkContext(incomingMessage, context);
            
            // Determine professional response strategy
            const responseStrategy = this.determineWorkResponseStrategy(character, workAnalysis, context);
            
            // Build professional response
            const response = this.constructWorkResponse(character, workAnalysis, responseStrategy);
            
            return response;
            
        } catch (error) {
            console.error('Error generating work response:', error);
            return this.getWorkFallbackResponse(character, incomingMessage);
        }
    }

    /**
     * Analyze work-specific context and triggers
     * @param {string} message - Incoming message
     * @param {Object} context - Full context
     * @returns {Object} - Work context analysis
     */
    analyzeWorkContext(message, context) {
        const analysis = {
            workTriggers: [],
            urgencyLevel: 'normal',
            formalityLevel: 'professional',
            collaborationLevel: 'individual',
            workSituation: 'general',
            clientInvolved: false,
            meetingContext: false
        };
        
        const messageLower = message.toLowerCase();
        
        // Detect work triggers
        Object.entries(this.workTriggers).forEach(([triggerName, triggerData]) => {
            const matches = triggerData.keywords.filter(keyword => 
                messageLower.includes(keyword.toLowerCase())
            );
            
            if (matches.length > 0) {
                analysis.workTriggers.push({
                    type: triggerName,
                    matches: matches,
                    responseType: triggerData.responses,
                    urgency: triggerData.urgency
                });
            }
        });
        
        // Determine urgency level
        const urgentTriggers = analysis.workTriggers.filter(t => t.urgency === 'high');
        if (urgentTriggers.length > 0) {
            analysis.urgencyLevel = 'high';
        } else if (analysis.workTriggers.some(t => t.urgency === 'medium')) {
            analysis.urgencyLevel = 'medium';
        }
        
        // Detect specific work situations
        if (messageLower.includes('client') || messageLower.includes('customer')) {
            analysis.clientInvolved = true;
            analysis.formalityLevel = 'formal';
        }
        
        if (messageLower.includes('meeting') || messageLower.includes('conference')) {
            analysis.meetingContext = true;
        }
        
        if (messageLower.includes('team') || messageLower.includes('together')) {
            analysis.collaborationLevel = 'team';
        }
        
        // Determine primary work situation
        if (analysis.workTriggers.length > 0) {
            analysis.workSituation = analysis.workTriggers[0].type;
        }
        
        return analysis;
    }

    /**
     * Determine appropriate work response strategy
     * @param {Object} character - Character responding
     * @param {Object} workAnalysis - Work context analysis
     * @param {Object} context - Environmental context
     * @returns {Object} - Response strategy
     */
    determineWorkResponseStrategy(character, workAnalysis, context) {
        const personality = character.personalityTags || [];
        const strategy = {
            tone: 'professional',
            approach: 'collaborative',
            length: 'medium',
            includeAction: false,
            formalityLevel: workAnalysis.formalityLevel,
            urgencyResponse: workAnalysis.urgencyLevel
        };
        
        // Personality adjustments
        if (personality.includes('Professional')) {
            strategy.tone = 'formal';
            strategy.formalityLevel = 'formal';
        }
        
        if (personality.includes('Ambitious')) {
            strategy.approach = 'proactive';
            strategy.includeAction = true;
        }
        
        if (personality.includes('Organized')) {
            strategy.approach = 'systematic';
            strategy.includeAction = true;
        }
        
        if (personality.includes('Extroverted')) {
            strategy.approach = 'collaborative';
            strategy.length = 'long';
        }
        
        if (personality.includes('Introverted')) {
            strategy.length = 'short';
            strategy.approach = 'focused';
        }
        
        // Context adjustments
        if (workAnalysis.clientInvolved) {
            strategy.tone = 'formal';
            strategy.formalityLevel = 'formal';
        }
        
        if (workAnalysis.urgencyLevel === 'high') {
            strategy.approach = 'action_oriented';
            strategy.includeAction = true;
        }
        
        if (workAnalysis.meetingContext) {
            strategy.approach = 'structured';
        }
        
        return strategy;
    }

    /**
     * Construct professional work response
     * @param {Object} character - Character responding
     * @param {Object} workAnalysis - Work analysis
     * @param {Object} strategy - Response strategy
     * @returns {string} - Constructed response
     */
    constructWorkResponse(character, workAnalysis, strategy) {
        const components = this.selectWorkComponents(workAnalysis, strategy);
        
        // Build response: Opening + Core + Modifier + Ending
        const parts = [];
        
        if (components.opening) parts.push(components.opening);
        if (components.core) parts.push(components.core);
        if (components.modifier) parts.push(components.modifier);
        if (components.ending) parts.push(components.ending);
        
        // Assemble with professional grammar
        let response = this.assembleProfessionalSentence(parts, strategy);
        
        // Apply work-specific modifications
        response = this.applyWorkModifications(response, character, workAnalysis);
        
        return response;
    }

    /**
     * Select appropriate work components
     * @param {Object} workAnalysis - Work context analysis
     * @param {Object} strategy - Response strategy
     * @returns {Object} - Selected components
     */
    selectWorkComponents(workAnalysis, strategy) {
        const components = {};
        
        // Select opening based on urgency and formality
        if (strategy.urgencyResponse === 'high') {
            components.opening = this.randomSelect(this.workComponents.openings.urgent);
        } else if (strategy.formalityLevel === 'formal') {
            components.opening = this.randomSelect(this.workComponents.openings.formal);
        } else if (strategy.approach === 'collaborative') {
            components.opening = this.randomSelect(this.workComponents.openings.collaborative);
        } else {
            components.opening = this.randomSelect(this.workComponents.openings.supportive);
        }
        
        // Select core content based on work situation
        if (workAnalysis.workSituation && this.workComponents.coreContent[workAnalysis.workSituation + '_response']) {
            const coreCategory = this.workComponents.coreContent[workAnalysis.workSituation + '_response'];
            const subcategories = Object.keys(coreCategory);
            
            // Choose subcategory based on strategy
            let selectedSubcategory = subcategories[0]; // Default
            
            if (strategy.approach === 'action_oriented' && coreCategory.problem_solving) {
                selectedSubcategory = 'problem_solving';
            } else if (strategy.approach === 'collaborative' && coreCategory.collaboration) {
                selectedSubcategory = 'collaboration';
            } else if (strategy.approach === 'supportive' && coreCategory.support) {
                selectedSubcategory = 'support';
            }
            
            if (coreCategory[selectedSubcategory]) {
                components.core = this.randomSelect(coreCategory[selectedSubcategory]);
            }
        }
        
        // Select modifier based on urgency and scope
        if (strategy.urgencyResponse !== 'normal') {
            const urgencyModifiers = this.workComponents.modifiers.urgency[strategy.urgencyResponse];
            if (urgencyModifiers) {
                components.modifier = this.randomSelect(urgencyModifiers);
            }
        } else if (strategy.approach === 'systematic') {
            components.modifier = this.randomSelect(this.workComponents.modifiers.scope.detailed);
        } else if (strategy.approach === 'proactive') {
            components.modifier = this.randomSelect(this.workComponents.modifiers.scope.strategic);
        }
        
        // Select ending based on approach
        if (strategy.includeAction || strategy.approach === 'action_oriented') {
            components.ending = this.randomSelect(this.workComponents.endings.action_oriented);
        } else if (strategy.approach === 'collaborative') {
            components.ending = this.randomSelect(this.workComponents.endings.collaborative);
        } else if (strategy.approach === 'supportive') {
            components.ending = this.randomSelect(this.workComponents.endings.supportive);
        } else {
            components.ending = this.randomSelect(this.workComponents.endings.follow_up);
        }
        
        return components;
    }

    /**
     * Assemble sentence with professional grammar and flow
     * @param {Array} parts - Sentence parts
     * @param {Object} strategy - Response strategy
     * @returns {string} - Assembled professional sentence
     */
    assembleProfessionalSentence(parts, strategy) {
        if (parts.length === 0) return 'Understood.';
        
        let sentence = '';
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (i === 0) {
                sentence += part.charAt(0).toUpperCase() + part.slice(1);
            } else {
                // Professional connectors
                let connector = '';
                
                if (i === parts.length - 1) {
                    // Last part
                    if (part.includes('?') || part.includes('!')) {
                        connector = ' ';
                    } else {
                        connector = ', and ';
                    }
                } else {
                    // Middle parts
                    connector = ' ';
                }
                
                sentence += connector + part;
            }
        }
        
        // Ensure professional punctuation
        if (!sentence.match(/[.!?]$/)) {
            sentence += '.';
        }
        
        return sentence;
    }

    /**
     * Apply work-specific modifications
     * @param {string} response - Base response
     * @param {Object} character - Character responding
     * @param {Object} workAnalysis - Work analysis
     * @returns {string} - Modified response
     */
    applyWorkModifications(response, character, workAnalysis) {
        let modified = response;
        const personality = character.personalityTags || [];
        
        // Professional personality modifications
        if (personality.includes('Professional')) {
            modified = modified.replace(/yeah/gi, 'yes');
            modified = modified.replace(/sure thing/gi, 'certainly');
            modified = modified.replace(/no problem/gi, 'of course');
        }
        
        if (personality.includes('Ambitious')) {
            // Add proactive elements
            if (workAnalysis.urgencyLevel === 'high' && Math.random() < 0.3) {
                modified += ' I can take point on this.';
            }
        }
        
        if (personality.includes('Organized')) {
            // Add structured elements
            if (workAnalysis.workSituation === 'project' && Math.random() < 0.4) {
                modified += ' Let me outline the steps.';
            }
        }
        
        // Client interaction modifications
        if (workAnalysis.clientInvolved) {
            modified = modified.replace(/we should/gi, 'we will');
            modified = modified.replace(/maybe/gi, 'we can');
        }
        
        return modified;
    }

    /**
     * Generate work conversation starter
     * @param {Object} character - Character starting conversation
     * @param {Object} target - Target character
     * @param {Object} context - Work context
     * @returns {string} - Professional conversation starter
     */
    generateWorkConversationStarter(character, target, context) {
        const personality = character.personalityTags || [];
        const timeOfDay = new Date().getHours();
        
        // Work-specific starter types
        const starterTypes = {
            project_check: ['How\'s progress on', 'Any updates on', 'Where are we with'],
            collaboration: ['I wanted to sync up on', 'Could we discuss', 'I\'d like to coordinate on'],
            support: ['Do you need any help with', 'Can I assist with', 'How can I support'],
            update: ['Just wanted to update you on', 'Quick status on', 'FYI on'],
            planning: ['We should plan for', 'Let\'s strategize about', 'I\'m thinking about']
        };
        
        // Select starter type based on personality and context
        let selectedType = 'project_check';
        
        if (personality.includes('Organized')) {
            selectedType = Math.random() < 0.5 ? 'planning' : 'project_check';
        } else if (personality.includes('Ambitious')) {
            selectedType = Math.random() < 0.4 ? 'collaboration' : 'update';
        } else if (personality.includes('Professional')) {
            selectedType = Math.random() < 0.3 ? 'update' : 'support';
        }
        
        // Time-based adjustments
        if (timeOfDay < 10) {
            return this.randomSelect(['Good morning! Ready to tackle today\'s priorities?', 'Morning! What\'s on your agenda today?', 'Good morning! How are we looking for today?']);
        } else if (timeOfDay >= 17) {
            return this.randomSelect(['Before we wrap up, can we discuss', 'End of day check - how did', 'Wrapping up - any final thoughts on']);
        }
        
        const starters = starterTypes[selectedType];
        const starter = this.randomSelect(starters);
        
        // Add work topic
        const workTopics = ['the project', 'this initiative', 'our deadlines', 'the client work', 'our collaboration'];
        const topic = this.randomSelect(workTopics);
        
        return `${starter} ${topic}?`;
    }

    /**
     * Utility methods
     */
    randomSelect(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }

    getWorkFallbackResponse(character, incomingMessage) {
        const personality = character.personalityTags || [];
        
        const workFallbacks = {
            'Professional': ['I understand your position.', 'That\'s a valid point.', 'Let me consider that.'],
            'Ambitious': ['Let\'s find a solution.', 'How can we move forward?', 'What\'s our next step?'],
            'Organized': ['Let me clarify that.', 'We should document this.', 'I\'ll follow up on that.'],
            'Extroverted': ['Let\'s discuss this further.', 'I\'d like to hear more.', 'Great point to consider.']
        };
        
        // Use personality-specific fallback
        for (const trait of personality) {
            if (workFallbacks[trait]) {
                return this.randomSelect(workFallbacks[trait]);
            }
        }
        
        // Generic professional fallbacks
        return this.randomSelect(['Understood.', 'That makes sense.', 'I see your point.', 'Let\'s address that.']);
    }

    /**
     * Get work-specific conversation statistics
     * @returns {Object} - Work conversation stats
     */
    getWorkStats() {
        return {
            triggerTypes: Object.keys(this.workTriggers).length,
            componentCategories: {
                openings: Object.keys(this.workComponents.openings).length,
                coreContent: Object.keys(this.workComponents.coreContent).length,
                modifiers: Object.keys(this.workComponents.modifiers).length,
                endings: Object.keys(this.workComponents.endings).length
            },
            contextFactors: Object.keys(this.workContextFactors).length
        };
    }
}
