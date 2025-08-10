/**
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
        
        // Game state
        this.gameTime = 0;
    }

    initialize(officeLayout) {
        this.characterManager.initializeCharacters();
        this.world = new World(this.characterManager, officeLayout);
        this.world.generateNavGrid();
        this.gameLoop.start();
    }

    /**
     * Update game state (called by game loop)
     * @param {number} deltaTime - Time in milliseconds since last update
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Update systems
        this.movementSystem.update(deltaTime);
        this.perceptionSystem.update();
        this.interactionSystem.update();
        this.eventSystem.update();
        this.conversationSystem.updateActiveConversations();
        
        // Update characters
        this.characterManager.update(deltaTime);
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
        // This would call the rendering system
    }

    /**
     * Add a prompt to the global queue
     * @param {Object} promptData - Prompt data object
     */
    addToPromptQueue(promptData) {
        this.aiQueueManager.addToPromptQueue(promptData);
    }
}
