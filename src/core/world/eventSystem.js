// src/core/world/eventSystem.js
import { WitnessProcessor } from '../ai/witnessProcessor.js';
import { PerceptionSystem } from '../systems/perceptionSystem.js';

export class EventSystem {
    constructor(world) {
        this.world = world;
        this.perceptionSystem = new PerceptionSystem(world.navGrid);
        this.witnessProcessor = new WitnessProcessor(this.perceptionSystem);
        this.events = [];
    }

    // Register a new event in the world
    registerEvent(actor, event) {
        if (!actor || !event) return;
        
        // Add basic event properties
        event.id = 'event_' + Math.random().toString(36).substr(2, 9);
        event.timestamp = Date.now();
        event.position = actor.position;
        event.actorId = actor.id;
        
        // Add to event log
        this.events.push(event);
        
        // Notify witnesses
        this.processWitnesses(actor, event);
    }

    // Process witnesses for an event
    processWitnesses(actor, event) {
        for (const character of this.world.characters) {
            // Skip the actor and disabled characters
            if (character.id === actor.id || !character.isEnabled) continue;
            
            // Generate witness prompt based on perception
            const prompt = this.witnessProcessor.generateWitnessPrompt(
                character, 
                actor, 
                event
            );
            
            if (prompt) {
                // Add to character's prompt queue
                character.pendingPrompts.push({
                    type: 'witness',
                    content: prompt,
                    eventId: event.id
                });
            }
        }
    }

    // Process witness responses
    processWitnessResponses(character, response) {
        if (response.responseType === 'witness') {
            this.witnessProcessor.processWitnessResponse(character, response);
        }
    }

    // Get recent events (for short-term memory)
    getRecentEvents(position, radius = 300, maxAge = 10000) { // maxAge in ms (10 seconds)
        const now = Date.now();
        return this.events.filter(event => {
            // Check if event is too old
            if (now - event.timestamp > maxAge) {
                return false;
            }
            
            // Check distance
            const dx = event.position.x - position.x;
            const dy = event.position.y - position.y;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
        });
    }
}
