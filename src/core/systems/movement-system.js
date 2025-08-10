// src/core/systems/movement-system.js

export class MovementSystem {
    constructor() {
        this.MOVEMENT_SPEED = 120; // pixels per second
        this.ARRIVAL_THRESHOLD = 8; // pixels - how close to consider "arrived"
    }

    /**
     * Update character movement
     * @param {Character} character - Character to move
     * @param {World} world - Game world for pathfinding
     * @param {number} deltaTime - Time since last update (milliseconds)
     */
    updateCharacter(character, world, deltaTime) {
        if (!character.path || character.path.length === 0) {
            // No path to follow, character is stationary
            if (character.actionState === 'moving') {
                character.setActionState('idle');
            }
            return;
        }

        // Set character as moving if not already
        if (character.actionState !== 'moving') {
            character.setActionState('moving');
        }

        const target = character.path[0];
        const dx = target.x - character.position.x;
        const dy = target.y - character.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if we've reached the current target
        if (distance <= this.ARRIVAL_THRESHOLD) {
            // Snap to the target position
            character.setPosition({ x: target.x, y: target.y });
            
            // Remove this waypoint from the path
            character.path.shift();
            
            // Check if we've completed the entire path
            if (character.path.length === 0) {
                character.setActionState('idle');
                this.onMovementComplete(character);
            }
            
            return;
        }

        // Calculate movement for this frame
        const moveDistance = (this.MOVEMENT_SPEED * deltaTime) / 1000; // Convert ms to seconds
        const moveRatio = Math.min(moveDistance / distance, 1.0); // Don't overshoot
        
        const newX = character.position.x + (dx * moveRatio);
        const newY = character.position.y + (dy * moveRatio);
        
        // Update character facing direction
        this.updateFacingDirection(character, dx, dy);
        
        // Validate the new position is walkable
        if (world && world.isPositionWalkable(newX, newY)) {
            character.setPosition({ x: newX, y: newY });
        } else {
            // Hit an obstacle, try to recalculate path
            console.warn(`🚧 ${character.name} hit obstacle, recalculating path`);
            this.recalculatePath(character, world);
        }
    }

    /**
     * Set a character's movement target
     * @param {Character} character - Character to move
     * @param {Object} targetPosition - Target {x, y} position
     * @param {World} world - Game world for pathfinding
     */
    moveCharacterTo(character, targetPosition, world) {
        if (!character || !targetPosition || !world) {
            console.error('❌ MovementSystem: Invalid parameters for moveCharacterTo');
            return false;
        }

        // Find path from current position to target
        const path = world.navGrid.findPath(character.position, targetPosition);
        
        if (path.length === 0) {
            console.warn(`🚫 No path found for ${character.name} to reach target`);
            return false;
        }

        // Set the character's path
        character.path = path;
        
        console.log(`🚶 ${character.name} moving to (${targetPosition.x}, ${targetPosition.y}) via ${path.length} waypoints`);
        return true;
    }

    /**
     * Stop character movement
     * @param {Character} character - Character to stop
     */
    stopCharacter(character) {
        if (character.path) {
            character.path = [];
        }
        if (character.actionState === 'moving') {
            character.setActionState('idle');
        }
        console.log(`⏹️ ${character.name} movement stopped`);
    }

    /**
     * Update character facing direction based on movement
     * @param {Character} character - Character to update
     * @param {number} dx - X movement delta
     * @param {number} dy - Y movement delta
     * @private
     */
    updateFacingDirection(character, dx, dy) {
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            return; // Not moving enough to change direction
        }

        // Calculate angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        character.facingAngle = angle;
    }

    /**
     * Recalculate path when character hits obstacle
     * @param {Character} character - Character whose path to recalculate
     * @param {World} world - Game world for pathfinding
     * @private
     */
    recalculatePath(character, world) {
        if (!character.path || character.path.length === 0) {
            return;
        }

        // Try to find new path to the final destination
        const finalDestination = character.path[character.path.length - 1];
        const newPath = world.navGrid.findPath(character.position, finalDestination);
        
        if (newPath.length > 0) {
            character.path = newPath;
            console.log(`🔄 Recalculated path for ${character.name}`);
        } else {
            // Can't reach destination, stop movement
            this.stopCharacter(character);
            console.warn(`🚫 ${character.name} cannot reach destination, stopping`);
        }
    }

    /**
     * Called when character completes movement
     * @param {Character} character - Character that completed movement
     * @private
     */
    onMovementComplete(character) {
        console.log(`✅ ${character.name} reached destination`);
        
        // Trigger any completion callbacks if needed
        if (character.onMovementComplete) {
            character.onMovementComplete();
        }
    }

    /**
     * Check if character is currently moving
     * @param {Character} character - Character to check
     * @returns {boolean} True if character is moving
     */
    isMoving(character) {
        return character.path && character.path.length > 0;
    }

    /**
     * Get character's movement progress (0-1)
     * @param {Character} character - Character to check
     * @returns {number} Progress from 0 (not started) to 1 (completed)
     */
    getMovementProgress(character) {
        if (!character.path || character.path.length === 0) {
            return 1.0; // No movement = completed
        }

        // This is a simplified version - could be enhanced to track total path distance
        const totalWaypoints = character.originalPathLength || character.path.length;
        const remainingWaypoints = character.path.length;
        
        return Math.max(0, (totalWaypoints - remainingWaypoints) / totalWaypoints);
    }

    /**
     * Debug method to visualize character paths
     * @param {Character} character - Character whose path to debug
     */
    debugPath(character) {
        if (!character.path || character.path.length === 0) {
            console.log(`🐛 ${character.name} has no path`);
            return;
        }

        console.log(`🐛 ${character.name} path (${character.path.length} waypoints):`);
        character.path.forEach((point, index) => {
            const prefix = index === 0 ? '→' : ' ';
            console.log(`  ${prefix} ${index}: (${point.x}, ${point.y})`);
        });
    }
}
