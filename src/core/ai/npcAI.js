/**
 * NPC AI Class - Coordinates the cognitive cycle for non-player characters
 * Implements the three-phase cognition cycle from SSOT Chapter 1
 */
import { gatherContext } from './contextBuilder.js';
import { generatePrompt } from './promptEngine.js';
import { processResponse } from './responseProcessor.js';

export class NPCAI {
    constructor(character, world) {
        this.character = character;
        this.world = world;
        this.promptText = '';
        this.response = null;
    }

    /**
     * Main cognitive cycle
     * Based on SSOT Chapter 1: System Philosophy
     */
    cognitiveCycle() {
        if (this.character.isBusy) return;
        
        try {
            // Phase 1: Sensation (Gathering Context)
            const context = gatherContext(this.character, this.world);
            
            // Phase 2: Cognition (The Prompt)
            this.promptText = generatePrompt(this.character, context);
            
            // Add to global prompt queue
            this.world.gameEngine.addToPromptQueue({
                characterId: this.character.id,
                promptText: this.promptText,
                callbackType: 'decision'
            });
            
        } catch (error) {
            console.error(`AI cognitive cycle error for ${this.character.name}:`, error);
        }
    }

    /**
     * Process AI response (delegates to responseProcessor)
     * @param {Object} response - The AI response
     */
    processResponse(response) {
        processResponse(this.character, response);
    }
}
