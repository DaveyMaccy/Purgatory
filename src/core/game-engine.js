// ============================================
// FILE: src/core/game-engine.js
// ============================================
// REPLACEMENT - Fixes animation acceleration when tab is inactive.

/**
 * GameEngine Class - Central game coordination
 * * This class orchestrates all game systems including:
 * - Game loop management
 * - System updates (movement, AI, rendering)
 * - Time management
 * - State coordination
 * * FINAL FIX:
 * - Clamps deltaTime to prevent animation speed-up after tab inactivity.
 */

import { World } from './world/world.js';
import { MovementSystem } from './systems/movement-system.js';

export class GameEngine {
    constructor(characterManager, renderer, mapData) {
        this.characterManager = characterManager;
        this.renderer = renderer;
        this.mapData = mapData;
        
        this.world = new World(characterManager, mapData);
        this.world.generateNavGrid();
        
        this.movementSystem = new MovementSystem();
        
        this.isRunning = false;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.gameTime = 0;
        
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        
        this.gameLoop = this.gameLoop.bind(this);
        
        console.log('🎮 Game engine initialized');
    }
    
    start() {
        if (this.isRunning) {
            console.warn('⚠️ Game engine already running');
            return;
        }
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.fpsUpdateTime = this.lastFrameTime;
        
        console.log('🚀 Starting game engine...');
        requestAnimationFrame(this.gameLoop);
    }
    
    stop() {
        this.isRunning = false;
        console.log('🛑 Game engine stopped');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? '⏸️ Game paused' : '▶️ Game resumed');
        return this.isPaused;
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        let deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // --- NEW: Clamp deltaTime ---
        // Prevents massive spikes when the tab is inactive.
        // If more than 100ms (0.1s) has passed, treat it as if only 100ms passed.
        const MAX_DELTA_TIME = 100;
        if (deltaTime > MAX_DELTA_TIME) {
            deltaTime = MAX_DELTA_TIME;
        }
        // --- END FIX ---
        
        this.updateFPS(currentTime);
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        if (this.world) {
            this.world.update(deltaTime);
        }
        
        if (this.characterManager) {
            const characters = this.characterManager.characters;
            characters.forEach(character => {
                character.update(deltaTime);
            });
        }
        
        // Update character movement and rendering states
        if (this.movementSystem && this.characterManager && this.world) {
            const characters = this.characterManager.characters;
            
            for (const character of characters) {
                this.movementSystem.moveCharacter(character, this.world, deltaTime / 1000);
                
                if (this.renderer) {
                    this.renderer.updateCharacterPosition(character.id, character.position.x, character.position.y);
                    this.renderer.syncCharacterDirection(character.id, character.facingDirection);
                }
            }
        }

        // Run the animation frame-by-frame updates
        if (this.renderer) {
            this.renderer.updateAllCharacterAnimations(deltaTime / 1000);
        }
    }
    
    render() {
        if (this.renderer) {
            this.renderer.update();
        }
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
            
            const fpsElement = document.getElementById('fps-counter');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${this.fps}`;
            }
        }
    }
    
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
    
    handleCharacterClick(characterId) {
        console.log(`👤 Character clicked: ${characterId}`);
        const character = this.characterManager.getCharacter(characterId);
        if (character) {
            console.log('Character info:', character.getStatus());
        }
    }
    
    handleWorldClick(x, y) {
        console.log(`🌍 World clicked at: (${x}, ${y})`);
    }
    
    handleTaskComplete(characterId, taskId) {
        console.log(`✅ Task completed: ${taskId} by character ${characterId}`);
        
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
    
    destroy() {
        this.stop();
        
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        this.characterManager = null;
        this.renderer = null;
        this.world = null;
        this.movementSystem = null;
        
        console.log('🧹 Game engine destroyed');
    }
}
