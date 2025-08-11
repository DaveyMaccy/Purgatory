// ============================================
// FILE: src/core/systems/movement-system.js
// MINIMAL CHANGES: Only direction update logic modified
// ============================================

export class MovementSystem {
    constructor() {
        this.MOVEMENT_SPEED = 100; // pixels per second
        this.ARRIVAL_THRESHOLD = 5; // pixels to consider "arrived"
    }

    /**
     * Move character along their path
     * PHASE 4 FIX: Better obstacle detection and animation state management
     */
    moveCharacter(character, world, deltaTime) {
        if (!character.path || character.path.length === 0) {
            // No path, ensure character is idle
            if (character.actionState !== 'idle') {
                character.setActionState('idle');
            }
            return;
        }
        
        // Set walking animation if not already walking
        if (character.actionState !== 'walking') {
            character.setActionState('walking');
        }
        
        const target = character.path[0];
        const dx = target.x - character.position.x;
        const dy = target.y - character.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // FIXED: Update character facing direction continuously + trigger animation updates
        const previousDirection = character.facingDirection;
        if (Math.abs(dx) > Math.abs(dy)) {
            character.facingDirection = dx > 0 ? 'right' : 'left';
        } else {
            character.facingDirection = dy > 0 ? 'down' : 'up';
        }
        
        // FIXED: Update animation when direction changes
        if (character.facingDirection !== previousDirection) {
            character.setActionState('walking'); // Triggers animation update
        }
        
        // If we're close to the waypoint, move to next
        if (distance < this.ARRIVAL_THRESHOLD) {
            character.position = { ...target };
            character.path.shift();
            
            // If no more path points, set to idle
            if (character.path.length === 0) {
                character.setActionState('idle');
            }
            return;
        }
        
        // Calculate movement for this frame
        const moveDistance = this.MOVEMENT_SPEED * deltaTime;
        const ratio = Math.min(moveDistance / distance, 1);
        
        // Calculate new position
        const newX = character.position.x + (dx * ratio);
        const newY = character.position.y + (dy * ratio);
        
        // PHASE 4 FIX: Check if new position is walkable BEFORE moving
        if (world.isPositionWalkable(newX, newY)) {
            // Position is valid, update character
            character.position.x = newX;
            character.position.y = newY;
            character.notifyObservers('position');
        } else {
            // Hit an obstacle, recalculate entire path
            console.log(`⚠️ ${character.name} hit obstacle, recalculating path`);
            
            // Get the final destination
            const finalDestination = character.path[character.path.length - 1];
            
            // Recalculate path from current position
            const newPath = world.findPath(character.position, finalDestination);
            
            if (newPath && newPath.length > 0) {
                character.path = newPath;
                console.log(`✅ New path calculated with ${newPath.length} waypoints`);
            } else {
                // No valid path found, stop movement
                character.path = [];
                character.setActionState('idle');
                console.log(`❌ No valid path found for ${character.name}`);
            }
        }
    }
}
