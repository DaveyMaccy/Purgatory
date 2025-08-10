/**
 * MovementSystem - Handles character movement and pathfinding
 * Stage 4 complete implementation with moveCharacterTo method and collision detection
 */
export class MovementSystem {
    constructor() {
        this.movingCharacters = new Set();
    }

    /**
     * Move character to a specific position
     * @param {Character} character - Character to move
     * @param {Object} targetPosition - Target position {x, y} in canvas coordinates
     * @param {World} world - Game world instance
     * @returns {boolean} True if movement started successfully
     */
    moveCharacterTo(character, targetPosition, world) {
        if (!character || !targetPosition || !world) {
            console.warn('🚫 Invalid moveCharacterTo parameters');
            return false;
        }

        console.log(`🚶 Moving ${character.name} to position:`, targetPosition);

        // Validate target position is within canvas bounds
        if (targetPosition.x < 50 || targetPosition.x > 750 || 
            targetPosition.y < 50 || targetPosition.y > 400) {
            console.warn('🚫 Target position outside canvas bounds:', targetPosition);
            return false;
        }

        // Use world's pathfinding system
        try {
            const path = world.findPath(character.position, targetPosition);
            
            if (path.length === 0) {
                console.warn(`🚫 No path found for ${character.name} to reach target`);
                
                // Try to find a nearby walkable position
                const nearbyPositions = [
                    { x: targetPosition.x + 30, y: targetPosition.y },
                    { x: targetPosition.x - 30, y: targetPosition.y },
                    { x: targetPosition.x, y: targetPosition.y + 30 },
                    { x: targetPosition.x, y: targetPosition.y - 30 },
                    { x: targetPosition.x + 20, y: targetPosition.y + 20 },
                    { x: targetPosition.x - 20, y: targetPosition.y - 20 }
                ];
                
                for (const nearbyPos of nearbyPositions) {
                    if (nearbyPos.x >= 50 && nearbyPos.x <= 750 && 
                        nearbyPos.y >= 50 && nearbyPos.y <= 400) {
                        const nearbyPath = world.findPath(character.position, nearbyPos);
                        if (nearbyPath.length > 0) {
                            character.path = nearbyPath.slice(1);
                            this.movingCharacters.add(character.id);
                            if (character.setActionState) {
                                character.setActionState('MOVING');
                            }
                            console.log(`✅ Found alternative path for ${character.name}: ${character.path.length} waypoints`);
                            return true;
                        }
                    }
                }
                
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
            
        } catch (pathError) {
            console.warn(`🚫 Pathfinding error for ${character.name}:`, pathError.message);
            return false;
        }
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
        
        const speed = 150; // pixels per second
        const target = character.path[0];
        const dx = target.x - character.position.x;
        const dy = target.y - character.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Update facing angle based on movement direction
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            // Calculate angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            
            // Update character's facing angle
            const oldAngle = character.facingAngle;
            character.facingAngle = angle;
            
            // Notify observers if facing direction changed significantly
            if (Math.abs(oldAngle - angle) > 10) {
                character.notifyObservers('facingAngle');
            }
        }
        
        // If we're close to the current waypoint, snap to it and move to next
        if (distance < 8) {
            character.position = { ...target };
            character.path.shift();
            
            // Notify observers of position change
            if (character.notifyObservers) {
                character.notifyObservers('position');
            }
            
            console.log(`📍 ${character.name} reached waypoint, ${character.path.length} waypoints remaining`);
            return;
        }
        
        // Move towards the current waypoint
        const moveDistance = speed * deltaTime;
        const ratio = Math.min(1, moveDistance / distance);
        
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
        
        // Bounds checking
        if (character.position.x < 50) character.position.x = 50;
        if (character.position.x > 750) character.position.x = 750;
        if (character.position.y < 50) character.position.y = 50;
        if (character.position.y > 400) character.position.y = 400;
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
