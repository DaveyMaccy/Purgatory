// src/core/systems/perceptionSystem.js

export class PerceptionSystem {
    constructor(navGrid) {
        this.navGrid = navGrid;
    }

    // Check if target is within character's field of view
    isInFOV(character, target) {
        const dx = target.position.x - character.position.x;
        const dy = target.position.y - character.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if beyond max sight range
        if (distance > character.maxSightRange) return false;
        
        // Calculate angle to target
        const angleToTarget = Math.atan2(dy, dx) * (180 / Math.PI);
        const normalizedAngle = (angleToTarget + 360) % 360;
        
        // Calculate angle difference
        const angleDiff = Math.abs(character.facingAngle - normalizedAngle);
        const shortestAngle = Math.min(angleDiff, 360 - angleDiff);
        
        // Check if within 60° FOV cone (120° total)
        return shortestAngle <= 60;
    }

    // Check line of sight using Bresenham's algorithm
    hasLineOfSight(start, end) {
        let x0 = Math.floor(start.x);
        let y0 = Math.floor(start.y);
        let x1 = Math.floor(end.x);
        let y1 = Math.floor(end.y);

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            // Check if current cell is blocked
            if (!this.navGrid.isWalkable(x0, y0)) {
                return false;
            }

            if (x0 === x1 && y0 === y1) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        
        return true;
    }

    // Combined FOV and LOS check
    canSee(character, target) {
        if (!this.isInFOV(character, target)) return false;
        return this.hasLineOfSight(character.position, target.position);
    }

    // Calculate directional sound loudness
    calculateDirectionalHeardLoudness(listener, soundSource, initialLoudness) {
        const dx = soundSource.x - listener.position.x;
        const dy = soundSource.y - listener.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToSound = Math.atan2(dy, dx) * (180 / Math.PI);
        const normalizedAngle = (angleToSound + 360) % 360;
        
        // Calculate angle difference
        const angleDiff = Math.abs(listener.facingAngle - normalizedAngle);
        const shortestAngle = Math.min(angleDiff, 360 - angleDiff);
        
        // Sound muffling based on direction
        let soundMufflingFactor = 0.3; // Default for behind (91-180°)
        if (shortestAngle <= 90) {
            soundMufflingFactor = 1.0; // Front/sides
        }
        
        // Calculate walls between listener and sound
        let wallCount = 0;
        if (!this.hasLineOfSight(listener.position, soundSource)) {
            wallCount = 1; // Simplified for now
        }
        
        // Final loudness calculation
        return (initialLoudness * soundMufflingFactor) - (distance * 0.2) - (wallCount * 1.5);
    }

    // Generate witness prompt based on perception level (SSOT Chapter 4.3)
    generateWitnessPrompt(witness, actor, event) {
        let perceptionLevel = 0;
        let eventDescription = '';
        
        // 1. Perform two-stage sight check
        const isInFOV = this.isInFOV(witness, { position: event.position });
        const hasLOS = isInFOV ? this.hasLineOfSight(witness.position, event.position) : false;
        
        // 2. Perform directional sound check
        const heardLoudness = this.calculateDirectionalHeardLoudness(witness, event.position, event.loudness);
        
        // 3. Determine perception level
        if (hasLOS) perceptionLevel = 3;
        else if (isInFOV) perceptionLevel = 2;
        else if (heardLoudness > 0.5) perceptionLevel = 1;
        
        // 4. Apply distraction modifiers
        if (witness.actionState === 'FOCUSED_ON_TASK') perceptionLevel -= 2;
        if (witness.actionState === 'InConversation') perceptionLevel -= 1;
        perceptionLevel = Math.max(0, perceptionLevel);
        
        // 5. Build event description based on perception level
        switch(perceptionLevel) {
            case 3:
                eventDescription = `You are ${witness.name}. You just clearly saw ${actor.name} ${event.description}.`;
                break;
            case 2:
                eventDescription = `You are ${witness.name}. You are facing the right direction but couldn't see clearly. You get the impression that ${actor.name} did something.`;
                break;
            case 1:
                const soundType = heardLoudness < 1.5 ? 'a faint noise' : 'a loud noise';
                eventDescription = `You are ${witness.name}. You just heard ${soundType} from the direction of the ${event.location}.`;
                break;
            case 0:
            default:
                return null; // No prompt for unaware witnesses
        }
        
        // Return formatted witness prompt
        return `### WITNESSED EVENT ###\n${eventDescription}\n... (rest of prompt)`;
    }
}
