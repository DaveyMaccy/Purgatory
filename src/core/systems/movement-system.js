/**
 * MovementSystem - Handles character movement and pathfinding
 * Stage 4 complete implementation with moveCharacterTo method and collision detection
 * 
 * FIXES APPLIED:
 * - Dynamic world bounds checking (works with any map size)
 * - Proper coordinate validation for 30×20 map (2304×1536 pixels)
 * - Enhanced pathfinding with better fallbacks
 * - Improved error messages and debugging
 */
export class MovementSystem {
    constructor() {
        this.movingCharacters = new Set();
    }

    /**
     * Move character to a specific position
     * @param {Character} character - Character to move
     * @param {Object} targetPosition - Target position {x, y} in world coordinates
     * @param {World} world - Game world instance
     * @returns {boolean} True if movement started successfully
     */
    moveCharacterTo(character, targetPosition, world) {
        if (!character || !targetPosition || !world) {
            console.warn('🚫 Invalid moveCharacterTo parameters');
            return false;
        }

        console.log(`🚶 Moving ${character.name} to position:`, targetPosition);

        // FIXED: Get actual world bounds instead of hardcoded canvas bounds
        const worldBounds = world.getWorldBounds();
        
        // FIXED: Validate target position is within WORLD bounds, not canvas bounds
        if (targetPosition.x < worldBounds.tileSize || 
            targetPosition.x > worldBounds.width - worldBounds.tileSize || 
            targetPosition.y < worldBounds.tileSize || 
            targetPosition.y > worldBounds.height - worldBounds.tileSize) {
            console.warn('🚫 Target position outside world bounds:', {
                target: targetPosition,
                worldBounds: {
                    width: worldBounds.width,
                    height: worldBounds.height,
                    tileSize: worldBounds.tileSize
                }
            });
            return false;
        }

        // Use world's pathfinding system
        try {
            const path = world.findPath(character.position, targetPosition);
            
            if (path.length === 0) {
                console.warn(`🚫 No path found for ${character.name} to reach target`);
                
                // Try to find a nearby walkable position
                const nearbyPositions = [
                    { x: targetPosition.x + worldBounds.tileSize, y: targetPosition.y },
                    { x: targetPosition.x - worldBounds.tileSize, y: targetPosition.y },
                    { x: targetPosition.x, y: targetPosition.y + worldBounds.tileSize },
                    { x: targetPosition.x, y: targetPosition.y - worldBounds.tileSize },
                    { x: targetPosition.x + worldBounds.tileSize/2, y: targetPosition.y + worldBounds.tileSize/2 },
                    { x: targetPosition.x - worldBounds.tileSize/2, y: targetPosition.y - worldBounds.tileSize/2 }
                ];
                
                for (const nearbyPos of nearbyPositions) {
                    // Check if nearby position is within world bounds
                    if (nearbyPos.x >= worldBounds.tileSize && 
                        nearbyPos.x <= worldBounds.width - worldBounds.tileSize && 
                        nearbyPos.y >= worldBounds.tileSize && 
                        nearbyPos.y <= worldBounds.height - worldBounds.tileSize) {
                        
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
    }

    /**
     * Stop a character's movement
     * @param {Character} character - Character to stop
     */
    stopCharacter(character) {
        if (character && character.path) {
            character.path = [];
            this.movingCharacters.delete(character.id);
            
            if (character.setActionState) {
                character.setActionState('DEFAULT');
            }
            
            console.log(`🛑 Stopped movement for ${character.name}`);
        }
    }

    /**
     * Update all moving characters
     * @param {Array} characters - Array of all characters
     * @param {World} world - Game world instance
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(characters, world, deltaTime) {
        characters.forEach(character => {
            if (this.movingCharacters.has(character.id)) {
                this.moveCharacter(character, world, deltaTime);
            }
        });
    }

    /**
     * Get movement system status for debugging
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            movingCharacters: this.movingCharacters.size,
            activeMovements: Array.from(this.movingCharacters)
        };
    }

    /**
     * Check if a character is currently moving
     * @param {string} characterId - Character ID to check
     * @returns {boolean} True if character is moving
     */
    isCharacterMoving(characterId) {
        return this.movingCharacters.has(characterId);
    }

    /**
     * Get all characters that are currently moving
     * @returns {Set} Set of character IDs that are moving
     */
    getMovingCharacters() {
        return new Set(this.movingCharacters);
    }

    /**
     * Clear all movement for all characters (emergency stop)
     */
    stopAllMovement() {
        this.movingCharacters.clear();
        console.log('🛑 All character movement stopped');
    }

    /**
     * Validate a position is within world bounds
     * @param {Object} position - Position {x, y}
     * @param {World} world - Game world instance
     * @returns {boolean} True if position is valid
     */
    isValidPosition(position, world) {
        if (!position || !world) return false;
        
        const worldBounds = world.getWorldBounds();
        
        return position.x >= 0 && 
               position.x <= worldBounds.width && 
               position.y >= 0 && 
               position.y <= worldBounds.height;
    }

    /**
     * Get the closest walkable position to a target
     * @param {Object} targetPosition - Target position {x, y}
     * @param {World} world - Game world instance
     * @returns {Object|null} Closest walkable position or null
     */
    getClosestWalkablePosition(targetPosition, world) {
        if (!targetPosition || !world) return null;
        
        // Convert to grid coordinates
        const gridPos = world.worldToGrid(targetPosition.x, targetPosition.y);
        
        // Try to find nearby walkable position
        const nearbyGrid = world.navGrid.findNearbyWalkable(gridPos, 5);
        
        if (nearbyGrid) {
            return world.gridToWorld(nearbyGrid.x, nearbyGrid.y);
        }
        
        return null;
    }

    /**
     * Debug method to test movement system
     * @param {Character} character - Character to test
     * @param {Object} targetPosition - Target position {x, y}
     * @param {World} world - Game world instance
     */
    debugMovement(character, targetPosition, world) {
        console.log('🧪 Movement System Debug:');
        console.log('   Character:', character.name);
        console.log('   Current position:', character.position);
        console.log('   Target position:', targetPosition);
        console.log('   World bounds:', world.getWorldBounds());
        console.log('   Valid position:', this.isValidPosition(targetPosition, world));
        console.log('   Currently moving:', this.isCharacterMoving(character.id));
        
        // Test pathfinding
        try {
            const path = world.findPath(character.position, targetPosition);
            console.log('   Path length:', path.length);
            if (path.length > 0) {
                console.log('   First waypoint:', path[0]);
                console.log('   Last waypoint:', path[path.length - 1]);
            }
        } catch (error) {
            console.log('   Pathfinding error:', error.message);
        }
    }
}
