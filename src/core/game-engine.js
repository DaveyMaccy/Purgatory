// src/core/game-engine.js - COMPLETE FIXED VERSION
// Restores ALL original methods + adds Stage 4 movement system integration

/**
 * Game Engine - Complete Stage 2-3 Integration + Stage 4 Movement
 * Lightweight coordinator for game systems with full renderer support
 */
import { CharacterManager } from './characters/character-manager.js';
import { World } from './world/world.js';

export class GameEngine {
    constructor() {
        // Core systems
        this.characterManager = new CharacterManager();
        // World will be initialized after map data is loaded
        this.world = null;
        
        // STAGE 2: Rendering system
        this.renderer = null;
        this.uiUpdater = null;
        
        // STAGE 3 + 4: Systems that will be added in later stages
        this.interactionSystem = null;
        this.movementSystem = null;
        this.perceptionSystem = null;
        this.eventSystem = null;
        this.conversationSystem = null;
        this.aiQueueManager = null;
        this.gameLoop = null;
        
        // Game state
        this.gameTime = 0;
        this.isRunning = false;
        this.updateLoop = null;
    }

    /**
     * RESTORED: Initialize with full renderer support
     */
    initialize(mapData) {
        try {
            console.log('🎮 Initializing game engine...');
            
            if (!mapData) {
                throw new Error('Map data is required for initialization');
            }
            
            // Initialize world with map data
            this.world = new World(this.characterManager, mapData);
            
            // Generate navigation grid for character positioning
            this.world.generateNavGrid();
            
            // Initialize characters (they should already be loaded by characterManager)
            this.characterManager.initializeCharacters();
            
            // STAGE 2: Start the update loop
            this.startSimpleUpdateLoop();
            this.isRunning = true;
            
            console.log('✅ Game engine initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize game engine:', error);
            throw error;
        }
    }

    /**
     * RESTORED: Set renderer reference
     * @param {Renderer} renderer - The renderer instance
     */
    setRenderer(renderer) {
        this.renderer = renderer;
        console.log('🎨 Renderer connected to game engine');
    }

    /**
     * RESTORED: Set UI updater reference
     * @param {UIUpdater} uiUpdater - The UI updater instance
     */
    setUIUpdater(uiUpdater) {
        this.uiUpdater = uiUpdater;
        console.log('🖥️ UI updater connected to game engine');
    }

    /**
     * RESTORED: Simple update loop for basic functionality
     */
    startSimpleUpdateLoop() {
        const updateInterval = 1000 / 60; // 60 FPS
        
        this.updateLoop = setInterval(() => {
            this.update(updateInterval);
        }, updateInterval);
        
        console.log('🔄 Update loop started at 60 FPS');
    }

    /**
     * RESTORED + ENHANCED: Enhanced update with renderer support + movement system
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    update(deltaTime) {
        if (!this.isRunning) return;
        
        this.gameTime += deltaTime;
        
        // Update characters (includes needs decay and observer notifications)
        if (this.characterManager) {
            this.characterManager.update(deltaTime);
        }
        
        // STAGE 4: Update movement system for all characters
        if (this.movementSystem) {
            this.characterManager.characters.forEach(character => {
                this.movementSystem.updateCharacter(character, this.world, deltaTime);
            });
        }
        
        // STAGE 2: Update renderer if available
        if (this.renderer && this.renderer.isInitialized) {
            // Update character positions in renderer
            this.characterManager.characters.forEach(character => {
                if (character.position) {
                    this.renderer.updateCharacterPosition(
                        character.id, 
                        character.position.x, 
                        character.position.y
                    );
                }
            });
            
            this.renderer.update();
        }
        
        // STAGE 3: UI updates are handled by observer pattern
        // The UI updater automatically receives notifications from characters
    }

    /**
     * RESTORED: Variable update (for non-fixed updates in future stages)
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    variableUpdate(deltaTime) {
        // Currently empty, but can be used for non-fixed updates in later stages
    }

    /**
     * RESTORED: Get game world bounds for movement/camera systems
     */
    getWorldBounds() {
        if (this.renderer) {
            return this.renderer.getWorldBounds();
        }
        return { width: 800, height: 600 }; // Default fallback
    }

    /**
     * RESTORED: Add a prompt to the global queue (placeholder for Stage 5)
     * @param {Object} promptData - Prompt data object
     */
    addToPromptQueue(promptData) {
        console.log('🤖 AI queue not implemented yet (Stage 5):', promptData);
    }

    // ========================================
    // STAGE 4: NEW MOVEMENT SYSTEM METHODS
    // ========================================

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
     * STAGE 4: Start the game with movement system support
     */
    start() {
        if (this.isRunning) {
            console.warn('⚠️ Game engine already running');
            return;
        }

        console.log('🚀 Starting game engine with movement system...');
        
        try {
            // Validate required systems
            this.validateSystems();
            
            // Start the update loop (if not already started)
            if (!this.updateLoop) {
                this.isRunning = true;
                this.startSimpleUpdateLoop();
            } else {
                this.isRunning = true;
            }
            
            console.log('✅ Game engine started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start game engine:', error);
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * STAGE 4: Validate that required systems are available
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

    // ========================================
    // RESTORED: ORIGINAL GAME CONTROL METHODS
    // ========================================

    /**
     * RESTORED: Pause the game
     */
    pause() {
        this.isRunning = false;
        if (this.updateLoop) {
            clearInterval(this.updateLoop);
        }
        console.log('⏸️ Game paused');
    }

    /**
     * RESTORED: Resume the game
     */
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startSimpleUpdateLoop();
            console.log('▶️ Game resumed');
        }
    }

    /**
     * RESTORED: Stop and cleanup the game
     */
    stop() {
        this.isRunning = false;
        
        if (this.updateLoop) {
            clearInterval(this.updateLoop);
            this.updateLoop = null;
        }
        
        // Cleanup systems
        if (this.renderer) {
            this.renderer.destroy();
            this.renderer = null;
        }
        
        if (this.uiUpdater) {
            this.uiUpdater.destroy();
            this.uiUpdater = null;
        }
        
        // STAGE 4: Stop all character movement
        if (this.movementSystem) {
            this.characterManager.characters.forEach(character => {
                this.movementSystem.stopCharacter(character);
            });
        }
        
        console.log('⛔ Game stopped and cleaned up');
    }

    // ========================================
    // RESTORED + ENHANCED: DEBUG AND STATUS METHODS
    // ========================================

    /**
     * RESTORED + ENHANCED: Get comprehensive game status for debugging
     */
    getStatus() {
        const playerCharacter = this.characterManager.getPlayerCharacter();
        
        return {
            isRunning: this.isRunning,
            gameTime: Math.floor(this.gameTime),
            characterCount: this.characterManager ? this.characterManager.characters.length : 0,
            playerCharacter: playerCharacter ? {
                id: playerCharacter.id,
                name: playerCharacter.name,
                position: playerCharacter.position,
                actionState: playerCharacter.actionState,
                isMoving: this.movementSystem ? this.movementSystem.isMoving(playerCharacter) : false
            } : null,
            hasRenderer: !!this.renderer,
            rendererInitialized: this.renderer ? this.renderer.isInitialized : false,
            hasWorld: !!this.world,
            hasUIUpdater: !!this.uiUpdater,
            hasMovementSystem: !!this.movementSystem,
            worldNavGridSize: this.world && this.world.navGrid ? 
                `${this.world.navGrid.length}x${this.world.navGrid[0]?.length || 0}` : 'none'
        };
    }

    /**
     * RESTORED: Debug function to get character positions
     */
    getCharacterPositions() {
        if (!this.characterManager) return [];
        
        return this.characterManager.characters.map(char => ({
            id: char.id,
            name: char.name,
            position: char.position,
            isPlayer: char.isPlayer
        }));
    }

    /**
     * STAGE 4: Debug function to get all character movement status
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
        if (!this.world || !this.world.findPath) {
            console.error('❌ World pathfinding not available');
            return null;
        }
        
        console.log(`🧪 Testing pathfinding from (${start.x}, ${start.y}) to (${end.x}, ${end.y})`);
        
        const path = this.world.findPath(start, end);
        
        if (path.length > 0) {
            console.log(`✅ Path found with ${path.length} waypoints:`, path);
        } else {
            console.log('❌ No path found');
        }
        
        return path;
    }

    /**
     * RESTORED: Debug function to force UI update
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
        if (this.world && this.world.debugNavGrid) {
            this.world.debugNavGrid();
        } else {
            console.log('❌ Navigation grid debug not available');
        }
    }
}
