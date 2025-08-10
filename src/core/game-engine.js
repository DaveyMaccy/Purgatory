/**
 * Game Engine - Updated with standardized imports and Stage 3 enhancements
 * Lightweight coordinator for game systems
 */
import { CharacterManager } from './characters/character-manager.js';
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
     * STAGE 3 FIX: Simplified initialize with only essential systems
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
                this.renderer.updateCharacterPosition(character.id, character.position.x, character.position.y);
            });
        }
        
        // Update UI - handled by observer pattern in Stage 3
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
        if (this.renderer) {
            this.renderer.render();
        }
    }

    /**
     * Add a prompt to the global queue (for future AI integration)
     * @param {Object} promptData - Prompt data object
     */
    addToPromptQueue(promptData) {
        if (this.aiQueueManager) {
            this.aiQueueManager.addToPromptQueue(promptData);
        }
    }

    /**
     * Stop the game engine
     */
    stop() {
        this.isRunning = false;
        if (this.updateLoop) {
            clearInterval(this.updateLoop);
            this.updateLoop = null;
        }
        console.log('Game engine stopped');
    }

    /**
     * Restart the game engine
     */
    restart() {
        this.stop();
        this.startSimpleUpdateLoop();
        this.isRunning = true;
        console.log('Game engine restarted');
    }
}
