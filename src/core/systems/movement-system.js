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
     * Move character along their path
     * FINAL FIX: Animation direction is now based on the final destination
     * for stability, preventing "moonwalking" and random flips.
     */
    moveCharacter(character, world, deltaTime) {
        if (!character.path || character.path.length === 0) {
            // No path, ensure character is idle.
            if (character.actionState !== 'idle') {
                character.setActionState('idle');
            }
            return;
        }
        
        // The character physically moves toward the next immediate step in its path.
        const immediateTarget = character.path[0];
        const dx = immediateTarget.x - character.position.x;
        const dy = immediateTarget.y - character.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // --- NEW DIRECTION LOGIC ---
        // For animation, we determine direction based on the *final* destination.
        // This creates a stable direction that doesn't flip on small detours.
        const finalDestination = character.path[character.path.length - 1];
        const overall_dx = finalDestination.x - character.position.x;
        const overall_dy = finalDestination.y - character.position.y;

        if (Math.abs(overall_dx) > Math.abs(overall_dy)) {
            character.facingDirection = overall_dx > 0 ? 'right' : 'left';
        } else {
            if (Math.abs(overall_dy) > 0) {
                 character.facingDirection = overall_dy > 0 ? 'down' : 'up';
            }
        }
        // --- END NEW DIRECTION LOGIC ---
        
        // Ensure the character is in the 'walking' state.
        if (character.actionState !== 'walking') {
            character.setActionState('walking');
        }

        // If we're close to the waypoint, move to the next one.
        if (distance < this.ARRIVAL_THRESHOLD) {
            character.position = { ...immediateTarget };
            character.path.shift();
            
            // If no more path points, the character has arrived.
            if (character.path.length === 0) {
                character.setActionState('idle');

                // Check for and execute a queued action upon arrival.
                if (character.queuedAction && window.gameEngine) {
                    window.gameEngine.executeAction(character, character.queuedAction);
                    character.queuedAction = null; // Clear action after execution
                }
            }
            return;
        }
        
        // Calculate movement for this frame towards the immediate target.
        const moveDistance = this.MOVEMENT_SPEED * deltaTime;
        const ratio = Math.min(moveDistance / distance, 1);
        
        const newX = character.position.x + (dx * ratio);
        const newY = character.position.y + (dy * ratio);
        
        // Check if new position is walkable BEFORE moving.
        if (world.isPositionWalkable(newX, newY)) {
            character.position.x = newX;
            character.position.y = newY;
            character.notifyObservers('position');
        } else {
            // Hit an obstacle, recalculate entire path.
            console.log(`⚠️ ${character.name} hit obstacle, recalculating path`);
            
            const newPath = world.findPath(character.position, finalDestination);
            
            if (newPath && newPath.length > 0) {
                character.path = newPath;
                console.log(`✅ New path calculated with ${newPath.length} waypoints`);
            } else {
                character.path = [];
                character.setActionState('idle');
                console.log(`❌ No valid path found for ${character.name}`);
            }
        }
    }
}

