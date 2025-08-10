// src/core/ai/witnessProcessor.js

export class WitnessProcessor {
    constructor(perceptionSystem) {
        this.perceptionSystem = perceptionSystem;
    }

    // Generate witness prompt based on perception level
    generateWitnessPrompt(witness, actor, event) {
        const perceptionLevel = this.determinePerceptionLevel(witness, event);
        
        if (perceptionLevel === 0) return null; // Unaware, no prompt
        
        let eventDescription;
        switch (perceptionLevel) {
            case 3: // Direct witness (clear line of sight)
                eventDescription = `You are ${witness.name}. You clearly witnessed ${actor.name} ${event.description} in the ${event.location}.`;
                break;
            case 2: // Partial visual (obstructed or peripheral)
                // Differentiate between obstructed view and peripheral vision
                const viewType = this.perceptionSystem.hasLineOfSight(witness.position, event.position) 
                    ? "peripheral vision" 
                    : "obstructed view";
                    
                eventDescription = `You are ${witness.name}. You noticed movement in your ${viewType} in the ${event.location}, but couldn't make out details.`;
                break;
            case 1: // Sound only
                let soundDescription;
                if (event.loudness < 1.0) {
                    soundDescription = "a faint, indistinct noise";
                } else if (event.loudness < 2.0) {
                    // Use event-specific sound descriptors if available
                    const soundTypes = {
                        'throw': 'a thud', 
                        'break': 'a crash', 
                        'laugh': 'laughter'
                    };
                    const sound = soundTypes[event.type] || 'a suspicious noise';
                    soundDescription = `${sound} from the ${this.getDirectionFrom(witness.position, event.position)}`;
                } else {
                    soundDescription = "a distinct sound";
                }
                eventDescription = `You are ${witness.name}. You heard ${soundDescription} coming from the ${event.location} direction.`;
                break;
            default:
                return null;
        }

        // Get relationship status description
        const relationship = this.getRelationshipStatus(witness, actor);
        
        return `### WITNESSED EVENT ###\n${eventDescription}\n` +
            `Based on your personality (${witness.personalityTags.join(', ')}) and your ${relationship} relationship with ${actor.name}, ` +
            `what is your immediate reaction?\nYou can either say something or perform a simple action. ` +
            `Respond ONLY with a JSON object.`;
    }

    // Get relationship status description
    getRelationshipStatus(witness, actor) {
        const score = witness.relationships[actor.id] || 50;
        if (score > 75) return "close friend";
        if (score > 60) return "friendly";
        if (score > 40) return "neutral";
        if (score > 25) return "unfriendly";
        return "hostile";
    }

    // Determine perception level (0-3) with refined thresholds
    determinePerceptionLevel(witness, event) {
        // 1. Perform two-stage sight check
        const isInFOV = this.perceptionSystem.isInFOV(witness, event);
        const hasLOS = isInFOV ? this.perceptionSystem.hasLineOfSight(witness.position, event.position) : false;
        
        // 2. Perform directional sound check with distance attenuation
        const distance = Math.sqrt(
            Math.pow(event.position.x - witness.position.x, 2) + 
            Math.pow(event.position.y - witness.position.y, 2)
        );
        const attenuationFactor = Math.max(0, 1 - (distance / 500)); // Reduce loudness with distance
        const heardLoudness = event.loudness * attenuationFactor * 
            this.perceptionSystem.getDirectionalModifier(witness.facingAngle, event.position);
        
        // 3. Determine Base Perception Level with finer thresholds
        let perceptionLevel = 0;
        if (hasLOS) {
            perceptionLevel = 3; // Clear direct line of sight
        } else if (isInFOV) {
            // Differentiate between partial view and obstructed view
            perceptionLevel = 2; 
        } else if (heardLoudness > 0.3) { // Lower threshold for faint sounds
            perceptionLevel = 1; // Heard only
        }
        
        // 4. Apply distraction modifier based on witness's state of mind
        if (witness.actionState === 'FOCUSED_ON_TASK') perceptionLevel = Math.max(0, perceptionLevel - 2);
        else if (witness.actionState === 'InConversation') perceptionLevel = Math.max(0, perceptionLevel - 1);
        else if (witness.actionState === 'DISTRACTED') perceptionLevel = Math.max(0, perceptionLevel - 1);
        
        return perceptionLevel;
    }
    
    // Get cardinal direction from witness to event
    getDirectionFrom(witnessPos, eventPos) {
        const angle = Math.atan2(eventPos.y - witnessPos.y, eventPos.x - witnessPos.x);
        const degrees = (angle * 180 / Math.PI + 360) % 360;
        
        if (degrees >= 337.5 || degrees < 22.5) return "east";
        if (degrees >= 22.5 && degrees < 67.5) return "northeast";
        if (degrees >= 67.5 && degrees < 112.5) return "north";
        if (degrees >= 112.5 && degrees < 157.5) return "northwest";
        if (degrees >= 157.5 && degrees < 202.5) return "west";
        if (degrees >= 202.5 && degrees < 247.5) return "southwest";
        if (degrees >= 247.5 && degrees < 292.5) return "south";
        return "southeast";
    }

    // Process witness response
    processWitnessResponse(witness, response) {
        if (!response || !response.responseType) {
            console.error('Invalid witness response:', response);
            return;
        }
        
        switch (response.responseType) {
            case 'ACTION':
                // Add to action queue
                witness.actionQueue.push(response.action);
                break;
            case 'DIALOGUE':
                // Add to conversation log
                this.addToConversationLog(witness, response.content);
                break;
            default:
                console.warn('Unknown response type from witness:', response.responseType);
        }
    }

    // Add dialogue to conversation log
    addToConversationLog(witness, content) {
        const conversation = witness.conversations.find(c => c.id === witness.conversationId);
        if (conversation) {
            conversation.transcript.push({
                speaker: witness.name,
                content,
                timestamp: Date.now()
            });
        } else {
            console.log(`${witness.name} says: "${content}"`);
        }
    }
}
