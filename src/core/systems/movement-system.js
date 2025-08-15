// ============================================
// FILE: src/core/systems/movement-system.js
// ============================================
// REPLACEMENT - Fixes animation direction to be more stable.

export class MovementSystem {
    constructor() {
        this.MOVEMENT_SPEED = 100; // pixels per second
        this.ARRIVAL_THRESHOLD = 5; // pixels to consider "arrived"
    }

    /**
     * Move character along their path. This function has been rebuilt from the ground up
     * to fix the foundational character centering issue.
     */
    moveCharacter(character, world, deltaTime, TILE_SIZE = 48) {
        if (!character.path || character.path.length === 0) {
            // If there is no path, ensure the character is idle and do nothing else.
            if (character.actionState !== 'idle') {
                character.setActionState('idle');
            }
            return;
        }

        // 1. SET TARGET AND DIRECTION
        // The immediate target is the next waypoint in the path. This waypoint
        // is already a centered coordinate, calculated correctly by world.js.
        const target = character.path[0];
        const finalDestination = character.path[character.path.length - 1];

        // Set facing direction based on the final destination to prevent jittering.
        const overall_dx = finalDestination.x - character.position.x;
        const overall_dy = finalDestination.y - character.position.y;
        if (Math.abs(overall_dx) > Math.abs(overall_dy)) {
            character.facingDirection = overall_dx > 0 ? 'right' : 'left';
        } else if (Math.abs(overall_dy) > 0) {
            character.facingDirection = overall_dy > 0 ? 'down' : 'up';
        }

       // 2. CALCULATE MOVEMENT
        const dx = target.x - character.position.x;
        const dy = target.y - character.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveDistance = this.MOVEMENT_SPEED * deltaTime;

        // 3. CHECK FOR ARRIVAL
        // If the remaining distance is less than the distance we would move in this frame,
        // it means we have arrived at the waypoint.
        if (distance <= moveDistance || distance < this.ARRIVAL_THRESHOLD) {
            // DEBUG: Log what position we're snapping to
            console.error(`[MOVEMENT DEBUG] ${character.name} arriving at waypoint: (${target.x}, ${target.y})`);
            console.error(`[MOVEMENT DEBUG] Is ${target.x} divisible by 48? ${target.x % 48 === 0}`);
            console.error(`[MOVEMENT DEBUG] Is ${target.y} divisible by 48? ${target.y % 48 === 0}`);
            console.error(`[MOVEMENT DEBUG] Should be at center (24 or 72): x%48=${target.x % 48}, y%48=${target.y % 48}`);
            
            // SNAP TO EXACT TARGET: The target from findPath is already centered
            // We trust the pathfinding system's centered coordinates
            character.position.x = target.x;
            character.position.y = target.y;
            // Remove the reached waypoint from the path.
            character.path.shift();

            // If that was the last waypoint, the character stops and executes their action.
            if (character.path.length === 0) {
                character.setActionState('idle');
                if (character.queuedAction && window.gameEngine) {
                    window.gameEngine.executeAction(character, character.queuedAction);
                    character.queuedAction = null;
                }
            }
        } else {
            // 4. MOVE CHARACTER
            // If we have not arrived, move the character along the path.
            character.setActionState('walking');
            character.position.x += (dx / distance) * moveDistance;
            character.position.y += (dy / distance) * moveDistance;
        }
        
        // Notify observers of the position change for rendering.
        character.notifyObservers('position');
    }
}


