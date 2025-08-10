/**
 * STAGE 2 FIX: Updated Game Engine with proper error handling and fallbacks
 * 
 * Game Engine - Lightweight coordinator for game systems
 */
import { CharacterManager } from './characters/characterManager.js';
import { World } from './world/world.js';

export class GameEngine {
    constructor() {
        // Core systems
        this.characterManager = new CharacterManager();
        // World will be initialized after map data is loaded
        this.world = null;
        
        // STAGE 2: Only initialize systems that exist
        // Other systems will be added in later stages
        this.interactionSystem = null;
        this.movementSystem = null;
        this.perceptionSystem = null;
        this.eventSystem = null;
        this.conversationSystem = null;
        this.aiQueueManager = null;
        this.gameLoop = null;
        
        // STAGE 2: Rendering system reference
        this.renderer = null;
        this.uiUpdater = null;
        
        // Game state
        this.gameTime = 0;
        this.isRunning = false;
    }

    /**
     * STAGE 2 FIX: Simplified initialize with only essential systems
     */
    initialize(officeLayout) {
        try {
            console.log('Initializing game engine...');
            
            if (!officeLayout) {
                throw new Error('Office layout data is required');
            }
            
            // Initialize world with map data
            this.world = new World(this.characterManager, officeLayout);
            
            // Generate navigation grid
            this.world.generateNavGrid();
            
            // Initialize characters (they should already be loaded by characterManager)
            this.characterManager.initializeCharacters();
            
            // Position characters if world positioning is available
            if (this.world && this.characterManager.characters.length > 0) {
                this.characterManager.initializeCharacterPositions(this.world);
            }
            
            // STAGE 2: Simple update loop instead of complex game loop
            this.startSimpleUpdateLoop();
            this.isRunning = true;
            
            console.log('Game engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize game engine:', error);
            throw error;
        }
    }

    /**
     * STAGE 2: Simple update loop for basic functionality
     */
    startSimpleUpdateLoop() {
        const updateInterval = 1000 / 60; // 60 FPS
        
        this.updateLoop = setInterval(() => {
            this.update(updateInterval);
        }, updateInterval);
        
        console.log('Simple update loop started');
    }

    /**
     * Update game state (called by update loop)
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    update(deltaTime) {
        if (!this.isRunning) return;
        
        this.gameTime += deltaTime;
        
        // STAGE 2: Basic updates only
        
        // Update characters
        if (this.characterManager) {
            this.characterManager.update(deltaTime);
        }
        
        // STAGE 2: Update renderer if available
        if (this.renderer) {
            this.renderer.update();
            
            // Update character positions in renderer
            this.characterManager.characters.forEach(character => {
                this.renderer.updateCharacterPosition(character.id, character.x, character.y);
            });
        }
        
        // Update UI
        if (this.uiUpdater) {
            // UI updates are handled by the observer pattern
        }
    }

    /**
     * Variable update (for non-fixed updates)
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    variableUpdate(deltaTime) {
        // Currently empty, but can be used for non-fixed updates
    }

    /**
     * Render the game (called by game loop)
     */
    render() {
        // STAGE 2: Rendering is handled by PixiJS automatically
    }

    /**
     * Add a prompt to the global queue (placeholder for later stages)
     * @param {Object} promptData - Prompt data object
     */
    addToPromptQueue(promptData) {
        console.log('AI queue not implemented yet:', promptData);
    }

    /**
     * STAGE 2: Set renderer reference
     * @param {Renderer} renderer - The renderer instance
     */
    setRenderer(renderer) {
        this.renderer = renderer;
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
     * Pause the game
     */
    pause() {
        this.isRunning = false;
        if (this.updateLoop) {
            clearInterval(this.updateLoop);
        }
        console.log('Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        this.isRunning = true;
        this.startSimpleUpdateLoop();
        console.log('Game resumed');
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
        
        console.log('Game stopped');
    }

    /**
     * Get game status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            gameTime: this.gameTime,
            characterCount: this.characterManager ? this.characterManager.characters.length : 0,
            hasRenderer: !!this.renderer,
            hasWorld: !!this.world
        };
    }
}
