/**
 * GameEngine Class - Central game coordination
 * * This class orchestrates all game systems including:
 * - Game loop management
 * - System updates (movement, AI, rendering)
 * - Time management
 * - State coordination
 * * PHASE 4 ADDITIONS:
 * - Movement system processing in update loop
 */

import { World } from './world/world.js';
import { MovementSystem } from './systems/movement-system.js';

export class GameEngine {
    constructor(characterManager, renderer, mapData) {
        this.characterManager = characterManager;
        this.renderer = renderer;
        this.mapData = mapData;
        
        // Initialize world
        this.world = new World(characterManager, mapData);
        this.world.generateNavGrid();
        
        // Initialize systems
        this.movementSystem = new MovementSystem();
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.gameTime = 0;
        
        // Performance tracking
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        
        // Game loop binding
        this.gameLoop = this.gameLoop.bind(this);
        
        console.log('🎮 Game engine initialized');
    }
    
    /**
     * Start the game engine
     */
    start() {
        if (this.isRunning) {
            console.warn('⚠️ Game engine already running');
            return;
        }
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.fpsUpdateTime = this.lastFrameTime;
        
        console.log('🚀 Starting game engine...');
        
        // Start the game loop
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Stop the game engine
     */
    stop() {
        this.isRunning = false;
        console.log('🛑 Game engine stopped');
    }
    
    /**
     * Pause/unpause the game
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? '⏸️ Game paused' : '▶️ Game resumed');
        return this.isPaused;
    }
    
    /**
     * Main game loop
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Update FPS counter
        this.updateFPS(currentTime);
        
        // Update game if not paused
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        // Render
        this.render();
        
        // Continue loop
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update all game systems
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        // Update game time
        this.gameTime += deltaTime;
        
        // Update world
        if (this.world) {
            this.world.update(deltaTime);
        }
        
        // Update all characters
        if (this.characterManager) {
            const characters = this.characterManager.characters;
            characters.forEach(character => {
                character.update(deltaTime);
            });
        }
        
        // PHASE 4: Process character movement
        if (this.movementSystem && this.characterManager && this.world) {
            const characters = this.characterManager.characters;
            
            for (const character of characters) {
                if (character.path && character.path.length > 0) {
                    // Convert deltaTime to seconds for movement system
                    this.movementSystem.moveCharacter(character, this.world, deltaTime / 1000);
                    
                    // Update renderer with new position
                    if (this.renderer) {
                        this.renderer.updateCharacterPosition(character.id, character.position.x, character.position.y);
                    }
                }
            }
        }
        
        // Future: Update AI system
        // if (this.aiSystem) {
        //     this.aiSystem.update(deltaTime);
        // }
        
        // Future: Update interaction system
        // if (this.interactionSystem) {
        //     this.interactionSystem.update(deltaTime);
        // }
    }
    
    /**
     * Render the game
     */
    render() {
        if (this.renderer) {
            this.renderer.update();
        }
    }
    
    /**
     * Update FPS counter
     * @param {number} currentTime - Current timestamp
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        // Update FPS every second
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
            
            // Update FPS display if element exists
            const fpsElement = document.getElementById('fps-counter');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${this.fps}`;
            }
        }
    }
    
    /**
     * Get current game state information
     * @returns {Object} Game state info
     */
    getGameState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            gameTime: this.gameTime,
            fps: this.fps,
            characterCount: this.characterManager?.characters.length || 0,
            worldSize: this.world ? `${this.world.width}x${this.world.height}` : 'N/A'
        };
    }
    
    /**
     * Handle game events
     * @param {string} eventType - Type of event
     * @param {Object} eventData - Event data
     */
    handleEvent(eventType, eventData) {
        switch (eventType) {
            case 'character_click':
                this.handleCharacterClick(eventData.characterId);
                break;
            case 'world_click':
                this.handleWorldClick(eventData.x, eventData.y);
                break;
            case 'task_complete':
                this.handleTaskComplete(eventData.characterId, eventData.taskId);
                break;
            default:
                console.warn(`⚠️ Unknown event type: ${eventType}`);
        }
    }
    
    /**
     * Handle character click events
     * @param {string} characterId - ID of clicked character
     */
    handleCharacterClick(characterId) {
        console.log(`👤 Character clicked: ${characterId}`);
        
        // Future: Open character interaction menu
        // For now, just log character info
        const character = this.characterManager.getCharacter(characterId);
        if (character) {
            console.log('Character info:', character.getStatus());
        }
    }
    
    /**
     * Handle world click events (delegated to main.js handleWorldClick)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    handleWorldClick(x, y) {
        console.log(`🌍 World clicked at: (${x}, ${y})`);
        // Movement is handled by main.js handleWorldClick function
    }
    
    /**
     * Handle task completion events
     * @param {string} characterId - ID of character who completed task
     * @param {string} taskId - ID of completed task
     */
    handleTaskComplete(characterId, taskId) {
        console.log(`✅ Task completed: ${taskId} by character ${characterId}`);
        
        // Assign a new task to the character
        const character = this.characterManager.getCharacter(characterId);
        if (character && this.world) {
            const tasks = this.world.taskDictionary[character.jobRole];
            if (tasks && tasks.length > 0) {
                const newTask = tasks[Math.floor(Math.random() * tasks.length)];
                character.assignedTask = { ...newTask };
                console.log(`📋 New task assigned to ${character.name}: ${newTask.displayName}`);
            }
        }
    }
    
    /**
     * Clean up and destroy the game engine
     */
    destroy() {
        this.stop();
        
        // Clean up renderer
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        // Clear references
        this.characterManager = null;
        this.renderer = null;
        this.world = null;
        this.movementSystem = null;
        
        console.log('🧹 Game engine destroyed');
    }
}
