import Character from './character.js';

export default class NPCManager {
    constructor() {
        this.npcs = new Map();
        this.promptQueue = [];
    }

    addNPC(npc) {
        if (!(npc instanceof Character)) {
            throw new Error('NPC must be an instance of Character');
        }
        this.npcs.set(npc.id, npc);
    }

    removeNPC(id) {
        this.npcs.delete(id);
    }

    getNPC(id) {
        return this.npcs.get(id);
    }

    update(deltaTime) {
        // TODO: Implement AI and movement updates
        // For now, do nothing to avoid errors
    }
    
    // Update character states (needs, mood, etc.)
    updateCharacterStates(deltaTime) {
        for (const npc of this.npcs.values()) {
            npc.updateNeeds(deltaTime);
        }
    }
    
    processNPCBehavior(npc) {
        // Get available actions based on current state
        const availableIntents = npc.getAvailableIntents();
        
        // Prepare prompt for AI decision
        const prompt = this.createDecisionPrompt(npc, availableIntents);
        
        // Add to prompt queue
        this.addToPromptQueue(npc, prompt);
        
        // Mark NPC as busy while waiting for response
        npc.isBusy = true;
    }

    createDecisionPrompt(npc, availableIntents) {
        // This would be replaced with the actual prompt template from Chapter 7
        return {
            characterId: npc.id,
            promptText: `You are ${npc.name}, a ${npc.physicalAttributes.age}-year-old ${npc.jobRole}.
            Your personality traits: ${npc.personalityTags.join(', ')}.
            Current mood: ${npc.mood}.
            Needs: Energy(${npc.needs.energy}), Hunger(${npc.needs.hunger}), Social(${npc.needs.social}).
            Available actions: ${availableIntents.join(', ')}.
            What do you want to do?`,
            callbackType: 'decision'
        };
    }

    addToPromptQueue(npc, prompt) {
        this.promptQueue.push(prompt);
    }

    processPromptQueue() {
        if (this.promptQueue.length === 0) return;
        
        // In a real implementation, this would send requests to the AI API
        // For now, we'll simulate responses
        for (const prompt of this.promptQueue) {
            const npc = this.getNPC(prompt.characterId);
            if (!npc) continue;
            
            // Simulate AI response
            const response = this.simulateAIResponse(npc);
            this.processAIResponse(npc, response);
        }
        
        // Clear queue after processing
        this.promptQueue = [];
    }

    simulateAIResponse(npc) {
        // Simple simulation - prioritize needs
        if (npc.needs.energy < 4) return { responseType: 'ACTION', action: 'REST' };
        if (npc.needs.hunger < 4) return { responseType: 'ACTION', action: 'EAT' };
        
        // Otherwise, move randomly
        return { responseType: 'ACTION', action: 'MOVE_TO' };
    }

    processAIResponse(npc, response) {
        // Handle the AI response
        if (response.responseType === 'ACTION') {
            npc.currentAction = {
                type: response.action,
                target: null,
                duration: 2000, // 2 seconds
                elapsedTime: 0
            };
        } else if (response.responseType === 'DIALOGUE') {
            // Handle dialogue
            console.log(`${npc.name} says: ${response.content}`);
        }
        
        // Mark NPC as no longer busy
        npc.isBusy = false;
    }
}
