import MemoryProcessor from '../ai/memoryProcessor.js';

export default class StateManager {
    constructor() {
        this.needDecayRates = {
            energy: 0.1, // per minute
            hunger: 0.08, // per minute
            social: 0.05, // per minute
            comfort: 0.02, // per minute
            stress: 0.03 // per minute
        };
        this.memoryProcessor = new MemoryProcessor();
    }

    update(deltaTime, gameState) {
        const characters = gameState.characters;
        
        // Update each character's state
        characters.forEach(character => {
            // Update needs
            this.updateNeeds(deltaTime, character);
            
            // Update mood based on needs
            this.updateMood(character);
            
            // Process current action if any
            this.processAction(deltaTime, character);
            
            // Process action queue if no current action
            if (!character.currentAction && character.actionQueue.length > 0) {
                character.currentAction = character.actionQueue.shift();
            }
            
            // Process memory consolidation periodically
            if (character.lastMemoryConsolidation === undefined || 
                Date.now() - character.lastMemoryConsolidation > 30000) { // Every 30 seconds
                this.processMemory(character);
                character.lastMemoryConsolidation = Date.now();
            }
        });
    }
    
    /**
     * Process memory consolidation (SSOT Chapter 7.2)
     * @param {Character} character - The character to process
     */
    async processMemory(character) {
        if (character.shortTermMemory.length === 0) return;
        
        try {
            const recentEvents = [...character.shortTermMemory];
            await this.memoryProcessor.processEvents(character, recentEvents);
        } catch (error) {
            console.error(`Memory processing failed for ${character.name}:`, error);
        }
    }

    updateNeeds(deltaTime, character) {
        // Convert deltaTime from seconds to minutes
        const minutesPassed = deltaTime / 60;
        
        // Decay needs
        for (const need in character.needs) {
            if (this.needDecayRates[need]) {
                character.needs[need] = Math.max(0, 
                    character.needs[need] - (this.needDecayRates[need] * minutesPassed));
            }
        }
    }

    updateMood(character) {
        const needs = character.needs;
        
        // Determine mood based on the most critical need
        if (needs.energy < 3) {
            character.mood = 'Tired';
        } else if (needs.hunger < 3) {
            character.mood = 'Hungry';
        } else if (needs.stress > 7) {
            character.mood = 'Stressed';
        } else if (needs.social < 3) {
            character.mood = 'Lonely';
        } else {
            character.mood = 'Neutral';
        }
    }

    processAction(deltaTime, character) {
        if (!character.currentAction) return;
        
        const action = character.currentAction;
        action.elapsedTime += deltaTime;
        
        // Check if action is complete
        if (action.elapsedTime >= action.duration) {
            this.completeAction(character, action);
            character.currentAction = null;
            return;
        }
        
        // Handle specific action effects
        switch (action.type) {
            case 'USE_COFFEE_MACHINE':
                character.needs.energy = Math.min(10, character.needs.energy + 0.5);
                break;
            case 'USE_COMPUTER':
                if (character.assignedTask) {
                    character.assignedTask.progress += (0.1 * character.skills.competence);
                }
                character.needs.energy -= 0.05;
                character.needs.stress += 0.03;
                break;
        }
    }

    completeAction(character, action) {
        // Handle action completion effects
        switch (action.type) {
            case 'MOVE_TO':
                // Clear path after reaching destination
                character.path = [];
                break;
            case 'USE_COFFEE_MACHINE':
                character.needs.energy = Math.min(10, character.needs.energy + 3);
                break;
        }
    }
}
