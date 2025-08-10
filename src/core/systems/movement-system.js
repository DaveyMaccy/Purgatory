/**
 * MovementSystem - Handles character movement and pathfinding
 * FIXED VERSION - Updated for dynamic world bounds and proper coordinate handling
 * 
 * FIXES APPLIED:
 * - Dynamic world bounds checking (works with any map size)
 * - Proper coordinate validation for 30×20 map (2304×1536 pixels)
 * - Enhanced pathfinding with better fallbacks
 * - Improved error messages and debugging
 * - Fixed bounds checking to use actual world dimensions
 */
export class MovementSystem {
    constructor() {
        this.movingCharacters = new Set();
        this.MOVEMENT_SPEED = 120; // pixels per second
        console.log('🚶 Movement system initialized');
    }

    /**
     * Move character to a specific position
     * FIXED: Uses dynamic world bounds instead of hardcoded canvas bounds
     */
    moveCharacterTo(character, targetPosition, world) {
        if (!character || !targetPosition || !world) {
            console.warn('🚫 Invalid moveCharacterTo parameters');
            return false;
        }

        console.log(`🚶 Moving ${character.name} to position:`, targetPosition);

        // FIXED: Get actual world bounds dynamically
        const worldBounds = world.getWorldBounds();
        
        console.log(`📊 World bounds check:`, {
            target: targetPosition,
            worldBounds: {
                width: worldBounds.width,      // Should be 2304 for 30×20 map
                height: worldBounds.height,    // Should be 1536 for 30×20 map
                tileSize: worldBounds.tileSize // Should be 48
            }
        });
        
        // FIXED: Validate target position is within ACTUAL world bounds
        if (targetPosition.x < worldBounds.tileSize || 
            targetPosition.x > worldBounds.width - worldBounds.tileSize || 
            targetPosition.y < worldBounds.tileSize || 
            targetPosition.y > worldBounds.height - worldBounds.tileSize) {
            
            console.warn('🚫 Target position outside world bounds:', {
                target: targetPosition,
                worldSize: `${worldBounds.width}×${worldBounds.height}`,
                tileSize: worldBounds.tileSize,
                validRange: {
                    x: `${worldBounds.tileSize} - ${worldBounds.width - worldBounds.tileSize}`,
                    y: `${worldBounds.tileSize} - ${worldBounds.height - worldBounds.tileSize}`
                }
            });
            return false;
        }

        // Use world's pathfinding system
        try {
            const path = world.findPath(character.position, targetPosition);
            
            if (path.length > 0) {
                character.path = path;
                this.movingCharacters.add(character.id);
                console.log(`✅ Path found with ${path.length} waypoints for ${character.name}`);
                console.log(`🎯 First waypoint: (${path[0].x.toFixed(1)}, ${path[0].y.toFixed(1)})`);
                return true;
            } else {
                console.warn(`🚫 No path found for ${character.name} to (${targetPosition.x}, ${targetPosition.y})`);
                
                // Try to find closest walkable position
                const closestWalkable = this.getClosestWalkablePosition(targetPosition, world);
                if (closestWalkable) {
                    console.log(`🔄 Trying closest walkable position: (${closestWalkable.x}, ${closestWalkable.y})`);
                    const fallbackPath = world.findPath(character.position, closestWalkable);
                    if (fallbackPath.length > 0) {
                        character.path = fallbackPath;
                        this.movingCharacters.add(character.id);
                        console.log(`✅ Fallback path found with ${fallbackPath.length} waypoints`);
                        return true;
                    }
                }
                return false;
            }
            
        } catch (error) {
            console.error(`❌ Pathfinding failed for ${character.name}:`, error);
            return false;
        }
    }

    /**
     * Update movement for all moving characters
     */
    update(deltaTime, characters, world) {
        if (!characters || !world) return;

        const charactersToUpdate = characters.filter(char => 
            this.movingCharacters.has(char.id) && char.path && char.path.length > 0
        );

        charactersToUpdate.forEach(character => {
            this.updateCharacterMovement(character, deltaTime, world);
        });
    }

    /**
     * Update movement for a single character
     */
    updateCharacterMovement(character, deltaTime, world) {
        if (!character.path || character.path.length === 0) {
            this.movingCharacters.delete(character.id);
            return;
        }

        const currentTarget = character.path[0];
        const currentPos = character.position;
        
        // Calculate movement distance this frame
        const moveDistance = this.MOVEMENT_SPEED * deltaTime;
        
        // Calculate direction to target
        const dx = currentTarget.x - currentPos.x;
        const dy = currentTarget.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= moveDistance) {
            // Reached current waypoint
            character.position.x = currentTarget.x;
            character.position.y = currentTarget.y;
            character.path.shift(); // Remove reached waypoint
            
            if (character.path.length === 0) {
                // Reached final destination
                this.movingCharacters.delete(character.id);
                console.log(`🎯 ${character.name} reached destination: (${character.position.x.toFixed(1)}, ${character.position.y.toFixed(1)})`);
            }
        } else {
            // Move towards target
            const moveX = (dx / distance) * moveDistance;
            const moveY = (dy / distance) * moveDistance;
            
            character.position.x += moveX;
            character.position.y += moveY;
        }
    }

    /**
     * Check if character is currently moving
     */
    isCharacterMoving(characterId) {
        return this.movingCharacters.has(characterId);
    }

    /**
     * Stop character movement
     */
    stopCharacter(character) {
        if (character.path) {
            character.path = [];
        }
        this.movingCharacters.delete(character.id);
        console.log(`⏹️ ${character.name} movement stopped`);
    }

    /**
     * FIXED: Validate position is within world bounds
     */
    isValidPosition(position, world) {
        if (!position || !world) return false;
        
        const worldBounds = world.getWorldBounds();
        
        return position.x >= 0 && 
               position.y >= 0 && 
               position.x <= worldBounds.width && 
               position.y <= worldBounds.height;
    }

    /**
     * Get the closest walkable position to a target
     */
    getClosestWalkablePosition(targetPosition, world) {
        if (!targetPosition || !world) return null;
        
        // Convert to grid coordinates
        const gridPos = world.worldToGrid(targetPosition.x, targetPosition.y);
        
        // Try to find nearby walkable position in expanding radius
        for (let radius = 1; radius <= 5; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const testGridX = gridPos.x + dx;
                        const testGridY = gridPos.y + dy;
                        
                        if (testGridX >= 0 && testGridX < world.width && 
                            testGridY >= 0 && testGridY < world.height) {
                            
                            if (world.navGrid.isWalkable(testGridX, testGridY)) {
                                return world.gridToWorld(testGridX, testGridY);
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Get movement status for all characters
     */
    getMovementStatus() {
        return {
            movingCharacterCount: this.movingCharacters.size,
            movingCharacterIds: Array.from(this.movingCharacters)
        };
    }

    /**
     * Debug method to test movement system
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

    /**
     * Force move character to position (bypasses pathfinding)
     */
    teleportCharacter(character, position) {
        character.position.x = position.x;
        character.position.y = position.y;
        character.path = [];
        this.movingCharacters.delete(character.id);
        console.log(`⚡ ${character.name} teleported to (${position.x}, ${position.y})`);
    }

    /**
     * Get movement system status
     */
    getStatus() {
        return {
            movingCharacters: this.movingCharacters.size,
            movementSpeed: this.MOVEMENT_SPEED,
            activeCharacterIds: Array.from(this.movingCharacters)
        };
    }
}
