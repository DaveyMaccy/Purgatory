/**
 * AI Debugger - Testing and Analysis Tools
 * Provides debugging, testing, and analysis capabilities for the Mock AI system
 * 
 * KEY FEATURES:
 * - Forced scenario testing (morning rush, crisis situations, etc.)
 * - Decision logging and analysis
 * - Personality behavior verification
 * - Performance monitoring and optimization suggestions
 * - Real-time AI decision visualization
 * 
 * DEBUG COMMANDS:
 * - window.aiDebugger.forceScenario('morning_rush')
 * - window.aiDebugger.testPersonality('character_id', 'Ambitious')
 * - window.aiDebugger.showDecisionTree()
 * - window.aiDebugger.analyzeCharacter('character_id')
 * 
 * EXPANSION NOTES:
 * - Add A/B testing framework for configuration tuning
 * - Implement behavioral regression testing
 * - Create performance profiling and bottleneck detection
 * - Add machine learning insights for behavior optimization
 */

export class AIDebugger {
    constructor(gameEngine, aiQueueManager, responseProcessor) {
        this.gameEngine = gameEngine;
        this.aiQueueManager = aiQueueManager;
        this.responseProcessor = responseProcessor;
        
        // Decision tracking
        this.decisionLog = [];
        this.maxLogEntries = 1000;
        
        // Scenario tracking
        this.activeScenarios = new Set();
        this.scenarioHistory = [];
        
        // Performance monitoring
        this.performanceMetrics = {
            decisionLatency: [],
            memoryUsage: [],
            errorRate: 0,
            lastUpdate: Date.now()
        };
        
        // Test scenarios
        this.testScenarios = {
            morning_rush: {
                name: 'Morning Coffee Rush',
                description: 'Multiple NPCs need coffee simultaneously',
                setup: this.setupMorningRush.bind(this),
                duration: 60000, // 1 minute
                expectedBehaviors: ['coffee_seeking', 'queue_formation', 'social_interaction']
            },
            
            task_deadline: {
                name: 'Urgent Task Deadline',
                description: 'High-priority task with low energy characters',
                setup: this.setupTaskDeadline.bind(this),
                duration: 120000, // 2 minutes
                expectedBehaviors: ['work_focus', 'stress_management', 'energy_vs_duty_conflict']
            },
            
            social_dynamics: {
                name: 'Complex Social Situation',
                description: 'Introverted NPC in crowded break room',
                setup: this.setupSocialDynamics.bind(this),
                duration: 90000, // 1.5 minutes
                expectedBehaviors: ['avoidance_behavior', 'comfort_seeking', 'selective_interaction']
            },
            
            crisis_mode: {
                name: 'Multiple Critical Needs',
                description: 'Characters with multiple critical needs simultaneously',
                setup: this.setupCrisisMode.bind(this),
                duration: 180000, // 3 minutes
                expectedBehaviors: ['priority_decision', 'rapid_need_satisfaction', 'stress_response']
            },
            
            personality_showcase: {
                name: 'Personality Trait Showcase',
                description: 'Demonstrate distinct personality behaviors',
                setup: this.setupPersonalityShowcase.bind(this),
                duration: 300000, // 5 minutes
                expectedBehaviors: ['trait_expression', 'decision_variance', 'personality_consistency']
            }
        };
        
        // Expose to global scope for console access
        if (typeof window !== 'undefined') {
            window.aiDebugger = this;
        }
        
        console.log('🔍 AI Debugger initialized - Type window.aiDebugger.help() for commands');
    }

    /**
     * Log an AI decision for analysis
     * @param {Object} character - Character that made decision
     * @param {Object} prompt - Original prompt data
     * @param {Object} response - AI response
     * @param {string} reasoning - Decision reasoning
     */
    logDecision(character, prompt, response, reasoning) {
        const logEntry = {
            id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            character: {
                id: character.id,
                name: character.name,
                personality: character.personalityTags || [],
                needs: {
                    energy: character.energy || 5,
                    hunger: character.hunger || 5,
                    social: character.social || 5,
                    stress: character.stress || 5,
                    comfort: character.comfort || 5
                },
                location: character.location,
                currentAction: character.currentAction?.type
            },
            prompt: {
                summary: this.summarizePrompt(prompt),
                context: this.extractPromptContext(prompt)
            },
            response: {
                type: response.responseType,
                action: response.action,
                content: response.content,
                thought: response.thought,
                source: response.source
            },
            reasoning: reasoning,
            context: this.captureEnvironmentalContext(character),
            performance: {
                processingTime: response.processingTime,
                queuePosition: this.aiQueueManager.promptQueue.length
            }
        };
        
        this.decisionLog.push(logEntry);
        
        // Keep log size manageable
        if (this.decisionLog.length > this.maxLogEntries) {
            this.decisionLog = this.decisionLog.slice(-this.maxLogEntries);
        }
        
        // Analyze decision in real-time
        this.analyzeDecision(logEntry);
    }

    /**
     * Force a specific test scenario
     * @param {string} scenarioName - Name of scenario to force
     * @param {Array} targetCharacters - Characters to involve (optional)
     * @returns {string} - Scenario ID for tracking
     */
    forceScenario(scenarioName, targetCharacters = null) {
        const scenario = this.testScenarios[scenarioName];
        if (!scenario) {
            console.error(`Unknown scenario: ${scenarioName}`);
            console.log('Available scenarios:', Object.keys(this.testScenarios));
            return null;
        }
        
        const scenarioId = `scenario_${Date.now()}_${scenarioName}`;
        
        console.log(`🎬 Starting forced scenario: ${scenario.name}`);
        console.log(`Description: ${scenario.description}`);
        console.log(`Duration: ${scenario.duration / 1000} seconds`);
        console.log(`Expected behaviors: ${scenario.expectedBehaviors.join(', ')}`);
        
        // Setup scenario
        const setupResult = scenario.setup(targetCharacters);
        
        // Track active scenario
        this.activeScenarios.add(scenarioId);
        
        // Schedule scenario end
        setTimeout(() => {
            this.endScenario(scenarioId, scenario);
        }, scenario.duration);
        
        // Add to history
        this.scenarioHistory.push({
            id: scenarioId,
            name: scenarioName,
            startTime: Date.now(),
            setup: setupResult,
            targetCharacters: targetCharacters,
            status: 'active'
        });
        
        return scenarioId;
    }

    /**
     * Test specific personality behavior
     * @param {string} characterId - Character to test
     * @param {string} personalityTrait - Trait to test
     * @param {number} duration - Test duration in milliseconds
     */
    testPersonality(characterId, personalityTrait, duration = 60000) {
        const character = this.gameEngine.characterManager?.getCharacter(characterId);
        if (!character) {
            console.error(`Character not found: ${characterId}`);
            return;
        }
        
        console.log(`🧪 Testing ${personalityTrait} behavior for ${character.name}`);
        
        // Store original personality
        const originalPersonality = [...(character.personalityTags || [])];
        
        // Set test personality
        character.personalityTags = [personalityTrait];
        
        // Track decisions during test
        const testStartTime = Date.now();
        const testDecisions = [];
        
        const originalLogDecision = this.logDecision.bind(this);
        this.logDecision = (char, prompt, response, reasoning) => {
            originalLogDecision(char, prompt, response, reasoning);
            
            if (char.id === characterId && Date.now() - testStartTime < duration) {
                testDecisions.push({
                    action: response.action?.type,
                    reasoning: reasoning,
                    timestamp: Date.now()
                });
            }
        };
        
        // Reset after test duration
        setTimeout(() => {
            character.personalityTags = originalPersonality;
            this.logDecision = originalLogDecision;
            
            // Analyze test results
            this.analyzePersonalityTest(character, personalityTrait, testDecisions);
        }, duration);
    }

    /**
     * Show decision tree visualization in console
     * @param {string} characterId - Character to show tree for (optional)
     */
    showDecisionTree(characterId = null) {
        console.log('🌳 AI Decision Tree Analysis');
        console.log('============================');
        
        if (characterId) {
            const decisions = this.decisionLog.filter(entry => entry.character.id === characterId);
            this.visualizeDecisionTreeForCharacter(decisions);
        } else {
            this.visualizeOverallDecisionTree();
        }
    }

    /**
     * Analyze a specific character's behavior patterns
     * @param {string} characterId - Character to analyze
     * @returns {Object} - Analysis results
     */
    analyzeCharacter(characterId) {
        const character = this.gameEngine.characterManager?.getCharacter(characterId);
        if (!character) {
            console.error(`Character not found: ${characterId}`);
            return null;
        }
        
        const decisions = this.decisionLog.filter(entry => entry.character.id === characterId);
        
        if (decisions.length === 0) {
            console.log(`No decisions logged for ${character.name}`);
            return null;
        }
        
        const analysis = {
            character: character.name,
            totalDecisions: decisions.length,
            timeSpan: decisions.length > 0 ? decisions[decisions.length - 1].timestamp - decisions[0].timestamp : 0,
            actionBreakdown: {},
            personalityConsistency: 0,
            needResponsePattern: {},
            averageResponseTime: 0,
            mostCommonActions: [],
            behaviorTrends: {},
            anomalies: []
        };
        
        // Analyze action patterns
        decisions.forEach(decision => {
            const actionType = decision.response.action?.type || decision.response.type;
            analysis.actionBreakdown[actionType] = (analysis.actionBreakdown[actionType] || 0) + 1;
        });
        
        // Find most common actions
        analysis.mostCommonActions = Object.entries(analysis.actionBreakdown)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([action, count]) => ({ action, count, percentage: Math.round((count / decisions.length) * 100) }));
        
        // Analyze personality consistency
        analysis.personalityConsistency = this.calculatePersonalityConsistency(decisions, character.personalityTags || []);
        
        // Analyze need response patterns
        analysis.needResponsePattern = this.analyzeNeedResponses(decisions);
        
        // Calculate average response time
        const responseTimes = decisions.map(d => d.performance?.processingTime || 0).filter(t => t > 0);
        analysis.averageResponseTime = responseTimes.length > 0 ? 
            Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;
        
        // Detect behavior trends
        analysis.behaviorTrends = this.detectBehaviorTrends(decisions);
        
        // Find anomalies
        analysis.anomalies = this.detectAnomalies(decisions, character);
        
        // Display analysis
        this.displayCharacterAnalysis(analysis);
        
        return analysis;
    }

    /**
     * Get performance statistics for the AI system
     * @returns {Object} - Performance statistics
     */
    getPerformanceStats() {
        const queueStats = this.aiQueueManager.getStats();
        const processorStats = this.responseProcessor.getStats();
        
        return {
            aiQueue: queueStats,
            responseProcessor: processorStats,
            debugger: {
                totalDecisionsLogged: this.decisionLog.length,
                activeScenariosCount: this.activeScenarios.size,
                scenarioHistoryCount: this.scenarioHistory.length
            },
            performance: this.performanceMetrics
        };
    }

    /**
     * Show help with available debug commands
     */
    help() {
        console.log(`
🔍 AI Debugger Commands
======================

Scenario Testing:
• forceScenario('scenario_name') - Force a test scenario
• listScenarios() - Show available scenarios
• endActiveScenarios() - Stop all active scenarios

Character Analysis:
• analyzeCharacter('character_id') - Analyze character behavior
• testPersonality('character_id', 'trait') - Test personality behavior
• compareCharacters(['id1', 'id2']) - Compare character behaviors

Decision Analysis:
• showDecisionTree() - Show decision tree visualization
• getRecentDecisions(count) - Get recent decisions
• analyzeDecisionPatterns() - Analyze overall patterns

Performance:
• getPerformanceStats() - Show performance statistics
• clearLogs() - Clear decision logs
• exportData() - Export debug data

Example usage:
• window.aiDebugger.forceScenario('morning_rush')
• window.aiDebugger.analyzeCharacter('character_1')
• window.aiDebugger.testPersonality('character_2', 'Ambitious')
        `);
    }

    /**
     * List available test scenarios
     */
    listScenarios() {
        console.log('🎬 Available Test Scenarios:');
        console.log('============================');
        
        Object.entries(this.testScenarios).forEach(([key, scenario]) => {
            console.log(`${key}: ${scenario.name}`);
            console.log(`  Description: ${scenario.description}`);
            console.log(`  Duration: ${scenario.duration / 1000}s`);
            console.log(`  Expected: ${scenario.expectedBehaviors.join(', ')}`);
            console.log('');
        });
    }

    /**
     * Scenario Setup Methods
     */
    setupMorningRush(targetCharacters) {
        const characters = targetCharacters || this.gameEngine.characterManager?.getAllCharacters() || [];
        
        // Set low energy for multiple characters
        const affectedCharacters = characters.slice(0, Math.min(5, characters.length));
        
        affectedCharacters.forEach(character => {
            character.energy = Math.random() * 2 + 1; // 1-3 energy (critical)
            character.hunger = Math.random() * 3 + 3; // 3-6 hunger (moderate)
            console.log(`☕ ${character.name} needs coffee (Energy: ${character.energy.toFixed(1)})`);
        });
        
        return {
            affectedCharacters: affectedCharacters.map(c => c.name),
            setupComplete: true
        };
    }

    setupTaskDeadline(targetCharacters) {
        const characters = targetCharacters || this.gameEngine.characterManager?.getAllCharacters() || [];
        
        characters.forEach(character => {
            character.energy = Math.random() * 2 + 2; // 2-4 energy (low)
            character.stress = Math.random() * 2 + 7; // 7-9 stress (high)
            
            // Add urgent task to memory
            if (!character.shortTermMemory) character.shortTermMemory = [];
            character.shortTermMemory.unshift('URGENT: Project deadline in 1 hour!');
            
            console.log(`⏰ ${character.name} has urgent deadline (Energy: ${character.energy.toFixed(1)}, Stress: ${character.stress.toFixed(1)})`);
        });
        
        return {
            affectedCharacters: characters.map(c => c.name),
            setupComplete: true
        };
    }

    setupSocialDynamics(targetCharacters) {
        const characters = targetCharacters || this.gameEngine.characterManager?.getAllCharacters() || [];
        
        // Find or create introverted character
        let introvert = characters.find(c => c.personalityTags?.includes('Introverted'));
        if (!introvert && characters.length > 0) {
            introvert = characters[0];
            introvert.personalityTags = ['Introverted'];
        }
        
        if (introvert) {
            introvert.social = Math.random() * 2 + 2; // 2-4 social (low)
            introvert.location = 'break_room'; // Crowded area
            
            console.log(`😰 ${introvert.name} (Introverted) in crowded break room (Social: ${introvert.social.toFixed(1)})`);
        }
        
        // Set other characters as nearby and social
        characters.slice(1, 4).forEach(character => {
            character.location = 'break_room';
            character.social = Math.random() * 3 + 6; // 6-9 social (high)
        });
        
        return {
            introvertCharacter: introvert?.name,
            crowdedLocation: 'break_room',
            setupComplete: true
        };
    }

    setupCrisisMode(targetCharacters) {
        const characters = targetCharacters || this.gameEngine.characterManager?.getAllCharacters() || [];
        
        characters.forEach(character => {
            // Multiple critical needs
            character.energy = Math.random() * 2; // 0-2 energy (critical)
            character.hunger = Math.random() * 2; // 0-2 hunger (critical) 
            character.stress = Math.random() * 2 + 8; // 8-10 stress (critical)
            character.social = Math.random() * 3 + 2; // 2-5 social (low)
            
            console.log(`🚨 ${character.name} in crisis mode (E:${character.energy.toFixed(1)} H:${character.hunger.toFixed(1)} S:${character.stress.toFixed(1)})`);
        });
        
        return {
            affectedCharacters: characters.map(c => c.name),
            crisisLevel: 'extreme',
            setupComplete: true
        };
    }

    setupPersonalityShowcase(targetCharacters) {
        const characters = targetCharacters || this.gameEngine.characterManager?.getAllCharacters() || [];
        const personalities = ['Ambitious', 'Lazy', 'Extroverted', 'Introverted', 'Organized', 'Chaotic', 'Gossip', 'Professional'];
        
        characters.forEach((character, index) => {
            if (index < personalities.length) {
                character.personalityTags = [personalities[index]];
                
                // Set moderate needs to highlight personality differences
                character.energy = Math.random() * 2 + 4; // 4-6 energy
                character.social = Math.random() * 2 + 4; // 4-6 social
                character.stress = Math.random() * 2 + 4; // 4-6 stress
                
                console.log(`🎭 ${character.name} showcasing ${personalities[index]} personality`);
            }
        });
        
        return {
            personalityMapping: characters.slice(0, personalities.length).map((c, i) => ({
                character: c.name,
                personality: personalities[i]
            })),
            setupComplete: true
        };
    }

    /**
     * Analysis Methods
     */
    analyzeDecision(logEntry) {
        // Real-time decision analysis
        const character = logEntry.character;
        const response = logEntry.response;
        
        // Check for personality consistency
        const consistency = this.checkPersonalityConsistency(character, response);
        if (consistency < 0.5) {
            console.warn(`⚠️ Low personality consistency for ${character.name}: ${consistency.toFixed(2)}`);
        }
        
        // Check for need responsiveness
        const needResponse = this.checkNeedResponseness(character, response);
        if (needResponse.critical && !needResponse.addressed) {
            console.warn(`⚠️ ${character.name} not addressing critical need: ${needResponse.criticalNeed}`);
        }
    }

    calculatePersonalityConsistency(decisions, personalityTags) {
        if (decisions.length === 0 || personalityTags.length === 0) return 0.5;
        
        let consistencyScore = 0;
        let scorableDecisions = 0;
        
        decisions.forEach(decision => {
            const score = this.scorePersonalityAlignment(decision, personalityTags);
            if (score !== null) {
                consistencyScore += score;
                scorableDecisions++;
            }
        });
        
        return scorableDecisions > 0 ? consistencyScore / scorableDecisions : 0.5;
    }

    scorePersonalityAlignment(decision, personalityTags) {
        const actionType = decision.response.action?.type;
        if (!actionType) return null;
        
        let alignmentScore = 0.5; // Base score
        
        personalityTags.forEach(trait => {
            switch (trait) {
                case 'Ambitious':
                    if (actionType === 'WORK_ON') alignmentScore += 0.3;
                    if (actionType === 'IDLE') alignmentScore -= 0.2;
                    break;
                case 'Lazy':
                    if (actionType === 'IDLE' || actionType === 'DRINK_COFFEE') alignmentScore += 0.3;
                    if (actionType === 'WORK_ON') alignmentScore -= 0.2;
                    break;
                case 'Extroverted':
                    if (actionType === 'START_CONVERSATION' || actionType === 'SOCIALIZE') alignmentScore += 0.3;
                    break;
                case 'Introverted':
                    if (actionType === 'IDLE' || actionType === 'WORK_ON') alignmentScore += 0.2;
                    if (actionType === 'SOCIALIZE') alignmentScore -= 0.2;
                    break;
            }
        });
        
        return Math.max(0, Math.min(1, alignmentScore));
    }

    analyzeNeedResponses(decisions) {
        const needPatterns = {
            energy: { low: 0, responded: 0 },
            hunger: { low: 0, responded: 0 },
            social: { low: 0, responded: 0 },
            stress: { high: 0, responded: 0 }
        };
        
        decisions.forEach(decision => {
            const needs = decision.character.needs;
            const actionType = decision.response.action?.type;
            
            // Check low energy
            if (needs.energy < 4) {
                needPatterns.energy.low++;
                if (actionType === 'DRINK_COFFEE' || actionType === 'IDLE') {
                    needPatterns.energy.responded++;
                }
            }
            
            // Check low hunger
            if (needs.hunger < 4) {
                needPatterns.hunger.low++;
                if (actionType === 'EAT_SNACK') {
                    needPatterns.hunger.responded++;
                }
            }
            
            // Check low social
            if (needs.social < 4) {
                needPatterns.social.low++;
                if (actionType === 'START_CONVERSATION' || actionType === 'SOCIALIZE') {
                    needPatterns.social.responded++;
                }
            }
            
            // Check high stress
            if (needs.stress > 6) {
                needPatterns.stress.high++;
                if (actionType === 'IDLE' || actionType === 'SOCIALIZE') {
                    needPatterns.stress.responded++;
                }
            }
        });
        
        // Calculate response rates
        Object.keys(needPatterns).forEach(need => {
            const pattern = needPatterns[need];
            const total = pattern.low || pattern.high || 1;
            pattern.responseRate = Math.round((pattern.responded / total) * 100);
        });
        
        return needPatterns;
    }

    detectBehaviorTrends(decisions) {
        if (decisions.length < 10) return {};
        
        const recentDecisions = decisions.slice(-10);
        const earlierDecisions = decisions.slice(-20, -10);
        
        const recentActions = this.getActionFrequency(recentDecisions);
        const earlierActions = this.getActionFrequency(earlierDecisions);
        
        const trends = {};
        
        Object.keys({...recentActions, ...earlierActions}).forEach(action => {
            const recentFreq = recentActions[action] || 0;
            const earlierFreq = earlierActions[action] || 0;
            
            if (recentFreq > earlierFreq * 1.5) {
                trends[action] = 'increasing';
            } else if (recentFreq < earlierFreq * 0.5) {
                trends[action] = 'decreasing';
            }
        });
        
        return trends;
    }

    detectAnomalies(decisions, character) {
        const anomalies = [];
        
        // Check for unexpected personality behavior
        const personalityScore = this.calculatePersonalityConsistency(decisions, character.personalityTags || []);
        if (personalityScore < 0.3) {
            anomalies.push({
                type: 'personality_inconsistency',
                severity: 'high',
                description: `Very low personality consistency (${Math.round(personalityScore * 100)}%)`
            });
        }
        
        // Check for ignored critical needs
        const criticalNeedIgnored = decisions.some(decision => {
            const needs = decision.character.needs;
            const actionType = decision.response.action?.type;
            
            return (needs.energy <= 2 && actionType !== 'DRINK_COFFEE' && actionType !== 'IDLE') ||
                   (needs.hunger <= 2 && actionType !== 'EAT_SNACK');
        });
        
        if (criticalNeedIgnored) {
            anomalies.push({
                type: 'ignored_critical_needs',
                severity: 'medium',
                description: 'Character ignored critical needs in favor of other actions'
            });
        }
        
        return anomalies;
    }

    /**
     * Utility Methods
     */
    getActionFrequency(decisions) {
        const frequency = {};
        decisions.forEach(decision => {
            const actionType = decision.response.action?.type || decision.response.type;
            frequency[actionType] = (frequency[actionType] || 0) + 1;
        });
        return frequency;
    }

    summarizePrompt(prompt) {
        if (typeof prompt === 'string') {
            return prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '');
        }
        return 'Complex prompt object';
    }

    extractPromptContext(prompt) {
        // Extract key context from prompt
        return {
            hasNearbyEntities: prompt?.includes?.('Nearby Entities') || false,
            hasWorkTasks: prompt?.includes?.('WORK_ON') || false,
            hasMemories: prompt?.includes?.('MEMORIES') || false
        };
    }

    captureEnvironmentalContext(character) {
        return {
            location: character.location || 'unknown',
            timeOfDay: new Date().getHours(),
            nearbyCharacterCount: 0, // Would be populated by actual game state
            isBusy: character.isBusy || false
        };
    }

    displayCharacterAnalysis(analysis) {
        console.log(`
🧠 Character Analysis: ${analysis.character}
=========================================

📊 Decision Summary:
• Total Decisions: ${analysis.totalDecisions}
• Time Span: ${Math.round(analysis.timeSpan / 60000)} minutes
• Avg Response Time: ${analysis.averageResponseTime}ms
• Personality Consistency: ${Math.round(analysis.personalityConsistency * 100)}%

🎭 Most Common Actions:
${analysis.mostCommonActions.map(a => `• ${a.action}: ${a.count} times (${a.percentage}%)`).join('\n')}

🎯 Need Response Rates:
• Energy (low): ${analysis.needResponsePattern.energy?.responseRate || 0}%
• Hunger (low): ${analysis.needResponsePattern.hunger?.responseRate || 0}%
• Social (low): ${analysis.needResponsePattern.social?.responseRate || 0}%
• Stress (high): ${analysis.needResponsePattern.stress?.responseRate || 0}%

📈 Behavior Trends:
${Object.entries(analysis.behaviorTrends).map(([action, trend]) => `• ${action}: ${trend}`).join('\n') || '• No significant trends detected'}

⚠️ Anomalies:
${analysis.anomalies.map(a => `• ${a.type}: ${a.description} (${a.severity})`).join('\n') || '• No anomalies detected'}
        `);
    }

    /**
     * Public API Methods
     */
    getRecentDecisions(count = 10) {
        return this.decisionLog.slice(-count);
    }

    clearLogs() {
        this.decisionLog = [];
        console.log('🗑️ Decision logs cleared');
    }

    exportData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            decisionLog: this.decisionLog,
            scenarioHistory: this.scenarioHistory,
            performanceMetrics: this.performanceMetrics,
            stats: this.getPerformanceStats()
        };
        
        console.log('📁 Debug data exported:', exportData);
        return exportData;
    }

    endActiveScenarios() {
        this.activeScenarios.clear();
        console.log('⏹️ All active scenarios ended');
    }

    endScenario(scenarioId, scenario) {
        this.activeScenarios.delete(scenarioId);
        
        const scenarioRecord = this.scenarioHistory.find(s => s.id === scenarioId);
        if (scenarioRecord) {
            scenarioRecord.status = 'completed';
            scenarioRecord.endTime = Date.now();
            scenarioRecord.duration = scenarioRecord.endTime - scenarioRecord.startTime;
        }
        
        console.log(`🏁 Scenario completed: ${scenario.name} (${scenario.duration / 1000}s)`);
        
        // Analyze scenario results
        this.analyzeScenarioResults(scenarioId, scenario);
    }

    analyzeScenarioResults(scenarioId, scenario) {
        const scenarioRecord = this.scenarioHistory.find(s => s.id === scenarioId);
        if (!scenarioRecord) return;
        
        // Get decisions during scenario timeframe
        const scenarioDecisions = this.decisionLog.filter(decision => 
            decision.timestamp >= scenarioRecord.startTime && 
            decision.timestamp <= scenarioRecord.endTime
        );
        
        console.log(`📊 Scenario Analysis: ${scenario.name}`);
        console.log(`• Decisions made: ${scenarioDecisions.length}`);
        console.log(`• Expected behaviors: ${scenario.expectedBehaviors.join(', ')}`);
        
        // Check if expected behaviors were observed
        const observedBehaviors = this.checkExpectedBehaviors(scenarioDecisions, scenario.expectedBehaviors);
        console.log(`• Observed behaviors: ${observedBehaviors.join(', ')}`);
    }

    checkExpectedBehaviors(decisions, expectedBehaviors) {
        const observed = [];
        
        // Simple behavior detection based on actions
        const actionTypes = decisions.map(d => d.response.action?.type).filter(Boolean);
        
        if (expectedBehaviors.includes('coffee_seeking') && actionTypes.includes('DRINK_COFFEE')) {
            observed.push('coffee_seeking');
        }
        
        if (expectedBehaviors.includes('work_focus') && actionTypes.includes('WORK_ON')) {
            observed.push('work_focus');
        }
        
        if (expectedBehaviors.includes('social_interaction') && 
            (actionTypes.includes('START_CONVERSATION') || actionTypes.includes('SOCIALIZE'))) {
            observed.push('social_interaction');
        }
        
        if (expectedBehaviors.includes('avoidance_behavior') && actionTypes.includes('IDLE')) {
            observed.push('avoidance_behavior');
        }
        
        return observed;
    }

    checkPersonalityConsistency(character, response) {
        const personalityTags = character.personality || [];
        return this.scorePersonalityAlignment({ response }, personalityTags) || 0.5;
    }

    checkNeedResponseness(character, response) {
        const needs = character.needs;
        const actionType = response.action?.type;
        
        // Find critical needs
        const criticalNeeds = Object.entries(needs)
            .filter(([need, value]) => need !== 'stress' ? value <= 2 : value >= 8)
            .map(([need]) => need);
        
        if (criticalNeeds.length === 0) {
            return { critical: false };
        }
        
        // Check if action addresses critical need
        const addresses = criticalNeeds.some(need => {
            switch (need) {
                case 'energy': return actionType === 'DRINK_COFFEE' || actionType === 'IDLE';
                case 'hunger': return actionType === 'EAT_SNACK';
                case 'social': return actionType === 'START_CONVERSATION' || actionType === 'SOCIALIZE';
                case 'stress': return actionType === 'IDLE' || actionType === 'SOCIALIZE';
                default: return false;
            }
        });
        
        return {
            critical: true,
            criticalNeed: criticalNeeds[0],
            addressed: addresses
        };
    }

    visualizeDecisionTreeForCharacter(decisions) {
        // Simplified visualization for console
        console.log('Character Decision Patterns:');
        
        const patterns = {};
        decisions.forEach(decision => {
            const needState = this.categorizeNeedState(decision.character.needs);
            const action = decision.response.action?.type || 'unknown';
            
            if (!patterns[needState]) patterns[needState] = {};
            patterns[needState][action] = (patterns[needState][action] || 0) + 1;
        });
        
        Object.entries(patterns).forEach(([needState, actions]) => {
            console.log(`${needState}:`);
            Object.entries(actions)
                .sort(([,a], [,b]) => b - a)
                .forEach(([action, count]) => {
                    console.log(`  └─ ${action}: ${count} times`);
                });
        });
    }

    visualizeOverallDecisionTree() {
        console.log('Overall AI Decision Patterns:');
        
        const allActions = {};
        this.decisionLog.forEach(decision => {
            const action = decision.response.action?.type || decision.response.type;
            allActions[action] = (allActions[action] || 0) + 1;
        });
        
        Object.entries(allActions)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([action, count]) => {
                const percentage = Math.round((count / this.decisionLog.length) * 100);
                console.log(`${action}: ${count} times (${percentage}%)`);
            });
    }

    categorizeNeedState(needs) {
        const critical = Object.entries(needs).filter(([need, value]) => 
            need !== 'stress' ? value <= 2 : value >= 8
        );
        
        if (critical.length > 0) return `critical_${critical[0][0]}`;
        
        const low = Object.entries(needs).filter(([need, value]) => 
            need !== 'stress' ? value <= 4 : value >= 6
        );
        
        if (low.length > 0) return `low_${low[0][0]}`;
        
        return 'normal';
    }
}
