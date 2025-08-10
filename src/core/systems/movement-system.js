// src/core/systems/movement-system.js

/**
 * MovementSystem - Handles character movement and pathfinding
 * Stage 4 complete implementation with moveCharacterTo method
 */
export class MovementSystem {
    constructor() {
        this.movingCharacters = new Set();
    }

    /**
     * STAGE 4 NEW: Move character to a specific position
     * This is called by the click handler in main.js
     * @param {Character} character - Character to move
     * @param {Object} targetPosition - Target position {x, y}
     * @param {World} world - Game world instance
     */
    moveCharacterTo(character, targetPosition, world) {
        if (!character || !targetPosition || !world) {
            console.warn('🚫 Invalid moveCharacterTo parameters');
            return false;
        }

        console.log(`🚶 Moving ${character.name} to position:`, targetPosition);

        // Check if target position is walkable
        if (!world.isPositionWalkable(targetPosition.x, targetPosition.y)) {
            console.warn(`🚫 Target position not walkable:`, targetPosition);
            return false;
        }

        // Find path from current position to target
        const path = world.findPath(character.position, targetPosition);
        
        if (path.length === 0) {
            console.warn(`🚫 No path found for ${character.name}`);
            return false;
        }

        // Set the character's path (remove first point as it's current position)
        character.path = path.slice(1);
        
        // Mark character as moving
        this.movingCharacters.add(character.id);
        
        // Update character action state
        if (character.setActionState) {
            character.setActionState('MOVING');
        }

        console.log(`✅ Path set for ${character.name}: ${character.path.length} waypoints`);
        return true;
    }

    /**
     * Update character movement - called each frame
     * @param {Character} character - Character to update
     * @param {World} world - Game world instance
     * @param {number} deltaTime - Time since last update in seconds
     */
    moveCharacter(character, world, deltaTime) {
        if (!character.path || character.path.length === 0) {
            // Character has reached destination
            if (this.movingCharacters.has(character.id)) {
                this.movingCharacters.delete(character.id);
                if (character.setActionState) {
                    character.setActionState('DEFAULT');
                }
                console.log(`🎯 ${character.name} reached destination`);
            }
            return;
        }
        
        const speed = 100; // pixels per second
        const target = character.path[0];
        const dx = target.x - character.position.x;
        const dy = target.y - character.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If we're close to the current waypoint, snap to it and move to next
        if (distance < 5) {
            character.position = { ...target };
            character.path.shift();
            
            // Notify observers of position change
            if (character.notifyObservers) {
                character.notifyObservers('position');
            }
            return;
        }
        
        // Move towards the current waypoint
        const moveDistance = speed * deltaTime;
        const ratio = moveDistance / distance;
        
        // Calculate new position
        const newX = character.position.x + (dx * ratio);
        const newY = character.position.y + (dy * ratio);
        
        // Update character position
        character.position.x = newX;
        character.position.y = newY;
        
        // Notify observers of position change
        if (character.notifyObservers) {
            character.notifyObservers('position');
        }
        
        // Safety check: if we hit an obstacle, recalculate path
        if (!world.isPositionWalkable(character.position.x, character.position.y)) {
            console.warn(`⚠️ ${character.name} hit obstacle, recalculating path`);
            const destination = character.path[character.path.length - 1];
            const newPath = world.findPath(character.position, destination);
            
            if (newPath.length > 0) {
                character.path = newPath.slice(1); // Remove current position
            } else {
                // Can't find new path, stop movement
                character.path = [];
                console.warn(`🚫 ${character.name} stuck, stopping movement`);
            }
        }
    }

    /**
     * Update all moving characters
     * @param {Array} characters - Array of all characters
     * @param {World} world - Game world instance
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateAll(characters, world, deltaTime) {
        for (const character of characters) {
            if (character.path && character.path.length > 0) {
                this.moveCharacter(character, world, deltaTime);
            }
        }
    }

    /**
     * Stop character movement
     * @param {Character} character - Character to stop
     */
    stopCharacter(character) {
        if (!character) return;
        
        character.path = [];
        this.movingCharacters.delete(character.id);
        
        if (character.setActionState) {
            character.setActionState('DEFAULT');
        }
        
        console.log(`🛑 Stopped movement for ${character.name}`);
    }

    /**
     * Check if character is currently moving
     * @param {Character} character - Character to check
     * @returns {boolean} True if character is moving
     */
    isCharacterMoving(character) {
        return character && character.path && character.path.length > 0;
    }

    /**
     * Get movement status for debugging
     * @returns {Object} Movement system status
     */
    getStatus() {
        return {
            movingCharacters: this.movingCharacters.size,
            activeMovements: Array.from(this.movingCharacters)
        };
    }
}
