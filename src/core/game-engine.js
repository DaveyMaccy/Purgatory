/**
 * Game Engine - Complete Stage 2-3 Integration
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
        
        // STAGE 3: Systems that will be added in later stages
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
    }

    /**
     * STAGE 2-3 COMPLETE: Initialize with full renderer support
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
     * STAGE 2: Set renderer reference
     * @param {Renderer} renderer - The renderer instance
     */
    setRenderer(renderer) {
        this.renderer = renderer;
        console.log('🎨 Renderer connected to game engine');
    }

    /**
     * STAGE 3: Set UI updater reference
     * @param {UIUpdater} uiUpdater - The UI updater instance
     */
    setUIUpdater(uiUpdater) {
        this.uiUpdater = uiUpdater;
        console.log('🖥️ UI updater connected to game engine');
    }

    /**
     * STAGE 2: Simple update loop for basic functionality
     */
    startSimpleUpdateLoop() {
        const updateInterval = 1000 / 60; // 60 FPS
        
        this.updateLoop = setInterval(() => {
            this.update(updateInterval);
        }, updateInterval);
        
        console.log('🔄 Update loop started at 60 FPS');
    }

    /**
     * STAGE 2-3: Enhanced update with renderer support
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    update(deltaTime) {
        if (!this.isRunning) return;
        
        this.gameTime += deltaTime;
        
        // Update characters (includes needs decay and observer notifications)
        if (this.characterManager) {
            this.characterManager.update(deltaTime);
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
     * Variable update (for non-fixed updates in future stages)
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    variableUpdate(deltaTime) {
        // Currently empty, but can be used for non-fixed updates in later stages
    }

    /**
     * STAGE 2: Get game world bounds for movement/camera systems
     */
    getWorldBounds() {
        if (this.renderer) {
            return this.renderer.getWorldBounds();
        }
        return { width: 800, height: 600 }; // Default fallback
    }

    /**
     * Add a prompt to the global queue (placeholder for Stage 5)
     * @param {Object} promptData - Prompt data object
     */
    addToPromptQueue(promptData) {
        console.log('🤖 AI queue not implemented yet (Stage 5):', promptData);
    }

    /**
     * Pause the game
     */
    pause() {
        this.isRunning = false;
        if (this.updateLoop) {
            clearInterval(this.updateLoop);
        }
        console.log('⏸️ Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startSimpleUpdateLoop();
            console.log('▶️ Game resumed');
        }
    }

    /**
     * Stop and cleanup the game
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
        
        console.log('⛔ Game stopped and cleaned up');
    }

    /**
     * Get comprehensive game status for debugging
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            gameTime: this.gameTime,
            characterCount: this.characterManager ? this.characterManager.characters.length : 0,
            hasRenderer: !!this.renderer,
            rendererInitialized: this.renderer ? this.renderer.isInitialized : false,
            hasWorld: !!this.world,
            hasUIUpdater: !!this.uiUpdater,
            worldNavGridSize: this.world ? `${this.world.navGrid.length}x${this.world.navGrid[0]?.length || 0}` : 'none'
        };
    }

    /**
     * STAGE 3: Debug function to get character positions
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
     * STAGE 3: Debug function to force UI update
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
}
