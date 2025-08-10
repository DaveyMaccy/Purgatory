// src/core/game-engine.js

import { World } from './world/world.js';

/**
 * GameEngine - Central coordinator for all game systems
 * Stage 4 update: Includes movement system integration
 */
export class GameEngine {
    constructor() {
        this.world = null;
        this.renderer = null;
        this.movementSystem = null; // STAGE 4 NEW
        this.isRunning = false;
        this.lastUpdateTime = 0;
        
        console.log('🎮 Game Engine created');
    }

    /**
     * Initialize the game engine with map data
     * @param {Object} mapData - Map data from JSON file
     */
    initialize(mapData) {
        console.log('🎮 Initializing Game Engine...');
        
        try {
            // Create the game world
            this.world = new World(mapData);
            console.log('✅ World created');
            
            // Start the game loop
            this.startGameLoop();
            console.log('✅ Game loop started');
            
            console.log('🎮 Game Engine initialization complete');
            
        } catch (error) {
            console.error('❌ Failed to initialize Game Engine:', error);
            throw error;
        }
    }

    /**
     * Set the renderer instance
     * @param {Renderer} renderer - Renderer instance
     */
    setRenderer(renderer) {
        this.renderer = renderer;
        console.log('🎨 Renderer connected to Game Engine');
    }

    /**
     * STAGE 4 NEW: Set the movement system instance
     * @param {MovementSystem} movementSystem - Movement system instance
     */
    setMovementSystem(movementSystem) {
        this.movementSystem = movementSystem;
        console.log('🚶 Movement System connected to Game Engine');
    }

    /**
     * Start the main game loop
     */
    startGameLoop() {
        if (this.isRunning) {
            console.warn('⚠️ Game loop already running');
            return;
        }
        
        this.isRunning = true;
        this.lastUpdateTime = performance.now();
        
        console.log('🔄 Starting game loop...');
        this.gameLoop();
    }

    /**
     * Stop the game loop
     */
    stopGameLoop() {
        this.isRunning = false;
        console.log('🛑 Game loop stopped');
    }

    /**
     * Main game loop - runs every frame
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = currentTime;
        
        // Update all game systems
        this.update(deltaTime);
        
        // Continue the loop
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update all game systems
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update world
        if (this.world) {
            this.world.update(deltaTime);
        }
        
        // STAGE 4 NEW: Update movement system
        if (this.movementSystem && this.world) {
            // Get characters from character manager if available
            const characters = this.getCharacters();
            if (characters && characters.length > 0) {
                this.movementSystem.updateAll(characters, this.world, deltaTime);
            }
        }
        
        // Update renderer if available
        if (this.renderer) {
            this.renderer.update(deltaTime);
        }
    }

    /**
     * Get characters from the global character manager
     * This is a temporary solution until we have proper dependency injection
     * @returns {Array} Array of characters
     */
    getCharacters() {
        // Access the global character manager through window
        if (window.characterManager && window.characterManager.characters) {
            return window.characterManager.characters;
        }
        return [];
    }

    /**
     * Get current game state for debugging
     * @returns {Object} Game engine status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            hasWorld: !!this.world,
            hasRenderer: !!this.renderer,
            hasMovementSystem: !!this.movementSystem,
            worldStatus: this.world ? this.world.getStatus() : null,
            movementStatus: this.movementSystem ? this.movementSystem.getStatus() : null
        };
    }

    /**
     * Emergency stop - stops all systems
     */
    emergencyStop() {
        console.warn('🚨 Emergency stop triggered');
        this.stopGameLoop();
        
        if (this.movementSystem) {
            // Stop all character movement
            const characters = this.getCharacters();
            characters.forEach(character => {
                this.movementSystem.stopCharacter(character);
            });
        }
        
        console.log('🛑 All systems stopped');
    }

    /**
     * Restart the game engine
     */
    restart() {
        console.log('🔄 Restarting Game Engine...');
        this.stopGameLoop();
        
        // Reset systems
        this.lastUpdateTime = 0;
        
        // Restart game loop
        this.startGameLoop();
        
        console.log('✅ Game Engine restarted');
    }
}
