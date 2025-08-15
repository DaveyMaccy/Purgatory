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
            // THE CORE FIX: Instead of snapping to the (potentially flawed) target coordinate,
            // we calculate the mathematical center of the target's tile and snap to that.
            // This guarantees a perfectly centered final position.
            const targetTileX = Math.floor(target.x / TILE_SIZE);
            const targetTileY = Math.floor(target.y / TILE_SIZE);
            character.position.x = (targetTileX * TILE_SIZE) + (TILE_SIZE / 2);
            character.position.y = (targetTileY * TILE_SIZE) + (TILE_SIZE / 2);

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




