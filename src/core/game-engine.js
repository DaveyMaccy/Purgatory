// src/core/game-engine.js - Enhanced with Movement System for Stage 4

import { CharacterManager } from './characters/character-manager.js';
import { World } from './world/world.js';

export class GameEngine {
    constructor() {
        // Core systems
        this.characterManager = new CharacterManager();
        this.world = null;
        
        // STAGE 2: Rendering system
        this.renderer = null;
        this.uiUpdater = null;
        
        // STAGE 4: Movement system
        this.movementSystem = null;
        
        // STAGE 3+: Systems for future stages
        this.interactionSystem = null;
        this.perceptionSystem = null;
        this.eventSystem = null;
        this.conversationSystem = null;
        this.aiQueueManager = null;
        this.gameLoop = null;
        
        // Game state
        this.gameTime = 0;
        this.isRunning = false;
        this.updateLoop = null;
        this.lastUpdateTime = 0;
    }

    /**
     * STAGE 4: Initialize with movement system support
     */
    initialize(mapData) {
        try {
            console.log('🎮 Initializing game engine with movement system...');
            
            if (!mapData) {
                throw new Error('Map data is required for initialization');
            }
            
            // Initialize world with map data
            this.world = new World(this.characterManager, mapData);
            
            // Generate navigation grid for character positioning and pathfinding
            this.world.generateNavGrid();
            
            // Validate navigation grid
            if (!this.world.navGrid || this.world.navGrid.grid.length === 0) {
                throw new Error('Navigation grid initialization failed');
            }
            
            console.log('✅ Game engine initialized successfully');
            
            // Dispatch ready event for movement system integration
            document.dispatchEvent(new CustomEvent('gameEngineReady'));
            
        } catch (error) {
            console.error('❌ Game engine initialization failed:', error);
            throw error;
        }
    }

    /**
     * STAGE 4: Start the game with movement system
     */
    start() {
        if (this.isRunning) {
            console.warn('⚠️ Game engine already running');
            return;
        }

        console.log('🚀 Starting game engine...');
        
        try {
            // Validate required systems
            this.validateSystems();
            
            // Start the update loop
            this.isRunning = true;
            this.lastUpdateTime = performance.now();
            this.startUpdateLoop();
            
            console.log('✅ Game engine started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start game engine:', error);
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * STAGE 4: Enhanced update loop with movement system
     */
    startUpdateLoop() {
        const updateFunction = (currentTime) => {
            if (!this.isRunning) return;
            
            // Calculate delta time
            const deltaTime = currentTime - this.lastUpdateTime;
            this.lastUpdateTime = currentTime;
            
            // Update game systems
            this.update(deltaTime);
            
            // Schedule next update
            requestAnimationFrame(updateFunction);
        };
        
        requestAnimationFrame(updateFunction);
    }

    /**
     * STAGE 4: Main update function with movement system integration
     */
    update(deltaTime) {
        if (!this.isRunning) return;
        
        try {
            // Update game time
            this.gameTime += deltaTime;
            
            // Update world systems
            if (this.world) {
                this.world.update(deltaTime);
            }
            
            // Update all characters (needs decay, etc.)
            this.characterManager.characters.forEach(character => {
                character.update(deltaTime);
            });
            
            // STAGE 4: Update movement system for all characters
            if (this.movementSystem) {
                this.characterManager.characters.forEach(character => {
                    this.movementSystem.updateCharacter(character, this.world, deltaTime);
                });
            }
            
            // Update renderer if available
            if (this.renderer && this.renderer.update) {
                this.renderer.update(deltaTime);
            }
            
            // Update UI
            if (this.uiUpdater) {
                const playerCharacter = this.characterManager.getPlayerCharacter();
                if (playerCharacter) {
                    this.uiUpdater.updateUI(playerCharacter);
                }
            }
            
        } catch (error) {
            console.error('❌ Error in game update loop:', error);
        }
    }

    /**
     * Validate that required systems are available
     * @private
     */
    validateSystems() {
        if (!this.world) {
            throw new Error('World system not initialized');
        }
        
        if (!this.characterManager) {
            throw new Error('Character manager not initialized');
        }
        
        if (this.characterManager.characters.length === 0) {
            console.warn('⚠️ No characters loaded');
        }
        
        if (!this.world.navGrid) {
            throw new Error('Navigation grid not available');
        }
        
        console.log('✅ System validation passed');
    }

    /**
     * STAGE 4: Move character to position (public interface)
     */
    moveCharacterTo(characterId, targetPosition) {
        if (!this.movementSystem) {
            console.error('❌ Movement system not available');
            return false;
        }
        
        const character = this.characterManager.getCharacter(characterId);
        if (!character) {
            console.error(`❌ Character not found: ${characterId}`);
            return false;
        }
        
        return this.movementSystem.moveCharacterTo(character, targetPosition, this.world);
    }

    /**
     * STAGE 4: Stop character movement
     */
    stopCharacter(characterId) {
        if (!this.movementSystem) {
            console.error('❌ Movement system not available');
            return false;
        }
        
        const character = this.characterManager.getCharacter(characterId);
        if (!character) {
            console.error(`❌ Character not found: ${characterId}`);
            return false;
        }
        
        this.movementSystem.stopCharacter(character);
        return true;
    }

    /**
     * STAGE 4: Check if character is moving
     */
    isCharacterMoving(characterId) {
        if (!this.movementSystem) return false;
        
        const character = this.characterManager.getCharacter(characterId);
        if (!character) return false;
        
        return this.movementSystem.isMoving(character);
    }

    /**
     * Add a prompt to the AI queue (placeholder for Stage 5)
     */
    addToPromptQueue(promptData) {
        console.log('🤖 AI queue not implemented yet (Stage 5):', promptData);
    }

    /**
     * Pause the game
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        console.log('⏸️ Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdateTime = performance.now();
        this.startUpdateLoop();
        console.log('▶️ Game resumed');
    }

    /**
     * Stop and cleanup the game
     */
    stop() {
        this.isRunning = false;
        
        // Cleanup systems
        if (this.renderer && this.renderer.destroy) {
            this.renderer.destroy();
            this.renderer = null;
        }
        
        if (this.uiUpdater && this.uiUpdater.destroy) {
            this.uiUpdater.destroy();
            this.uiUpdater = null;
        }
        
        // Stop all character movement
        if (this.movementSystem) {
            this.characterManager.characters.forEach(character => {
                this.movementSystem.stopCharacter(character);
            });
        }
        
        console.log('⛔ Game stopped and cleaned up');
    }

    /**
     * Get comprehensive game status for debugging
     */
    getStatus() {
        const playerCharacter = this.characterManager.getPlayerCharacter();
        
        return {
            isRunning: this.isRunning,
            gameTime: Math.floor(this.gameTime),
            characterCount: this.characterManager.characters.length,
            playerCharacter: playerCharacter ? {
                id: playerCharacter.id,
                name: playerCharacter.name,
                position: playerCharacter.position,
                actionState: playerCharacter.actionState,
                isMoving: this.movementSystem ? this.movementSystem.isMoving(playerCharacter) : false
            } : null,
            hasRenderer: !!this.renderer,
            hasWorld: !!this.world,
            hasMovementSystem: !!this.movementSystem,
            hasUIUpdater: !!this.uiUpdater,
            worldNavGridSize: this.world && this.world.navGrid ? 
                `${this.world.navGrid.height}x${this.world.navGrid.width}` : 'none'
        };
    }

    /**
     * STAGE 4: Debug function to get all character positions and movement states
     */
    getCharacterMovementStatus() {
        if (!this.characterManager) return [];
        
        return this.characterManager.characters.map(char => ({
            id: char.id,
            name: char.name,
            position: char.position,
            isPlayer: char.isPlayer,
            actionState: char.actionState,
            isMoving: this.movementSystem ? this.movementSystem.isMoving(char) : false,
            pathLength: char.path ? char.path.length : 0,
            facingAngle: char.facingAngle || 0
        }));
    }

    /**
     * STAGE 4: Debug function to test pathfinding
     */
    testPathfinding(start, end) {
        if (!this.world || !this.world.navGrid) {
            console.error('❌ Navigation grid not available for pathfinding test');
            return null;
        }
        
        console.log(`🧪 Testing pathfinding from (${start.x}, ${start.y}) to (${end.x}, ${end.y})`);
        
        const path = this.world.navGrid.findPath(start, end);
        
        if (path.length > 0) {
            console.log(`✅ Path found with ${path.length} waypoints:`, path);
        } else {
            console.log('❌ No path found');
        }
        
        return path;
    }

    /**
     * STAGE 4: Debug function to force UI update
     */
    forceUIUpdate() {
        if (this.uiUpdater && this.characterManager) {
            const playerCharacter = this.characterManager.getPlayerCharacter();
            if (playerCharacter) {
                this.uiUpdater.updateUI(playerCharacter);
                console.log('🔄 Forced UI update completed');
            }
        }
    }

    /**
     * STAGE 4: Debug function to show navigation grid
     */
    debugNavGrid() {
        if (this.world && this.world.navGrid) {
            this.world.navGrid.debugPrint();
        } else {
            console.log('❌ Navigation grid not available');
        }
    }
}
