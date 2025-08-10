/**
 * STAGE 2 FIX: Updated Game Engine with rendering support
 * 
 * Game Engine - Lightweight coordinator for game systems
 */
import { CharacterManager } from './characters/characterManager.js';
import { World } from './world/world.js';
import { InteractionSystem } from './systems/interactionSystem.js';
import { MovementSystem } from './systems/movementSystem.js';
import { PerceptionSystem } from './systems/perceptionSystem.js';
import { EventSystem } from './world/eventSystem.js';
import { ConversationSystem } from './engine/conversationSystem.js';
import { AIQueueManager } from './engine/aiQueueManager.js';
import { GameLoop } from './engine/gameLoop.js';

export class GameEngine {
    constructor() {
        // Core systems
        this.characterManager = new CharacterManager();
        // World will be initialized after map data is loaded
        this.world = null;
        this.interactionSystem = new InteractionSystem(this.characterManager, this.world);
        this.movementSystem = new MovementSystem(this.characterManager, this.world);
        this.perceptionSystem = new PerceptionSystem(this.characterManager, this.world);
        this.eventSystem = new EventSystem(this.characterManager);
        
        // New subsystems
        this.conversationSystem = new ConversationSystem(this);
        this.aiQueueManager = new AIQueueManager(this);
        
        // Game loop
        this.gameLoop = new GameLoop(this);
        
        // STAGE 2: Rendering system reference
        this.renderer = null;
        this.uiUpdater = null;
        
        // Game state
        this.gameTime = 0;
        this.isRunning = false;
    }

    /**
     * STAGE 2 FIX: Updated initialize with proper error handling
     */
    initialize(officeLayout) {
        try {
            console.log('Initializing game engine...');
            
            if (!officeLayout) {
                throw new Error('Office layout data is required');
            }
            
            // Initialize world with map data
            this.world = new World(this.characterManager, officeLayout);
            
            // Update system references to world
            this.interactionSystem = new InteractionSystem(this.characterManager, this.world);
            this.movementSystem = new MovementSystem(this.characterManager, this.world);
            this.perceptionSystem = new PerceptionSystem(this.characterManager, this.world);
            
            // Generate navigation grid
            this.world.generateNavGrid();
            
            // Initialize characters (they should already be loaded by characterManager)
            this.characterManager.initializeCharacters();
            
            // Position characters if world positioning is available
            if (this.world && this.characterManager.characters.length > 0) {
                this.characterManager.initializeCharacterPositions(this.world);
            }
            
            // Start game loop
            this.gameLoop.start();
            this.isRunning = true;
            
            console.log('Game engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize game engine:', error);
            throw error;
        }
    }

    /**
     * Update game state (called by game loop)
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    update(deltaTime) {
        if (!this.isRunning) return;
        
        this.gameTime += deltaTime;
        
        // Update systems
        this.movementSystem.update(deltaTime);
        this.perceptionSystem.update();
        this.interactionSystem.update();
        this.eventSystem.update();
        this.conversationSystem.updateActiveConversations();
        
        // Update characters
        this.characterManager.update(deltaTime);
        
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
            // But we could add additional UI updates here if needed
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
        // We could add additional rendering logic here if needed
    }

    /**
     * Add a prompt to the global queue
     * @param {Object} promptData - Prompt data object
     */
    addToPromptQueue(promptData) {
        this.aiQueueManager.addToPromptQueue(promptData);
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
        if (this.gameLoop) {
            this.gameLoop.stop();
        }
        console.log('Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        this.isRunning = true;
        if (this.gameLoop) {
            this.gameLoop.start();
        }
        console.log('Game resumed');
    }

    /**
     * Stop and cleanup the game
     */
    stop() {
        this.isRunning = false;
        
        if (this.gameLoop) {
            this.gameLoop.stop();
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
