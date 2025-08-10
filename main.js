/**
 * Main.js - Core Game Initialization
 * 
 * This is now the lightweight core that coordinates all modules.
 * Most functionality has been moved to specialized modules.
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';
import { UIManager } from './src/ui/ui-manager.js';
import { GameStateManager } from './src/core/game-state-manager.js';
import { InputManager } from './src/input/input-manager.js';

// Global game state
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let uiManager = null;
let gameStateManager = null;
let inputManager = null;

/**
 * DOM Ready Event - Main initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Game Loading...');
    
    try {
        // Initialize all managers and systems
        initializeGame();
        
        console.log('🎮 Game initialization complete - Ready to start!');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

/**
 * Initialize the complete game system
 */
async function initializeGame() {
    console.log('🚀 Initializing game systems...');
    
    // Initialize UI Manager first (handles all UI setup)
    uiManager = new UIManager();
    await uiManager.initialize();
    
    // Initialize Input Manager
    inputManager = new InputManager();
    inputManager.initialize();
    
    // Initialize Game State Manager
    gameStateManager = new GameStateManager();
    gameStateManager.initialize();
    
    // Initialize Character Creator
    initializeCharacterCreator();
    
    // Setup new game button
    setupNewGameButton();
    
    console.log('✅ All systems initialized successfully');
}

/**
 * Setup the New Game button
 */
function setupNewGameButton() {
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            console.log('🎯 New Game button clicked');
            showCharacterCreator();
        });
    }
}

/**
 * Show the character creator modal
 */
function showCharacterCreator() {
    const modal = document.getElementById('character-creator-modal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('📝 Character creator opened');
    }
}

/**
 * Close the character creator modal
 */
function closeCharacterCreator() {
    const modal = document.getElementById('character-creator-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('📝 Character creator closed');
    }
}

/**
 * Start the actual game with finalized characters
 * Called by the character creator when ready
 */
async function startGame(characters) {
    console.log('🚀 Starting game with', characters.length, 'characters');
    
    try {
        // Show loading state
        if (uiManager) {
            uiManager.showLoadingState(true, 'Starting simulation...');
        }
        
        // Initialize game engine
        gameEngine = new GameEngine();
        
        // Initialize character manager with created characters
        characterManager = new CharacterManager();
        await characterManager.initialize(characters);
        
        // Load map data
        const mapData = await loadMapData();
        
        // Initialize renderer
        renderer = new Renderer();
        await renderer.initialize(mapData);
        
        // Initialize UI updater
        uiUpdater = new UIUpdater();
        await uiUpdater.initialize();
        
        // Connect all systems
        gameEngine.setCharacterManager(characterManager);
        gameEngine.setRenderer(renderer);
        gameEngine.setUIUpdater(uiUpdater);
        
        // Start the game loop
        await gameEngine.start();
        
        // Update game state
        if (gameStateManager) {
            gameStateManager.setState('playing');
        }
        
        // Hide loading state
        if (uiManager) {
            uiManager.showLoadingState(false);
        }
        
        console.log('🎮 Game started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game:', error);
        
        if (uiManager) {
            uiManager.showLoadingState(false);
            uiManager.showError('Failed to start game: ' + error.message);
        }
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    if (uiManager) {
        uiManager.showError(message);
    } else {
        // Fallback if UI manager not available
        alert(message);
    }
}

/**
 * Global pause/resume function
 */
function togglePause() {
    if (gameEngine) {
        if (gameEngine.isPaused()) {
            gameEngine.resume();
        } else {
            gameEngine.pause();
        }
    }
}

/**
 * Global focus target setter
 */
function setFocusTarget(targetId) {
    if (renderer) {
        if (targetId === 'none') {
            renderer.clearFocusTarget();
        } else {
            renderer.setFocusTarget(targetId);
        }
    }
}

/**
 * Set simulation speed
 */
function setSimulationSpeed(speed) {
    if (gameEngine) {
        gameEngine.setSimulationSpeed(speed);
    }
}

// Make functions globally accessible for HTML onclick handlers
window.showCharacterCreator = showCharacterCreator;
window.closeCharacterCreator = closeCharacterCreator;
window.startGame = startGame;
window.togglePause = togglePause;
window.setFocusTarget = setFocusTarget;
window.setSimulationSpeed = setSimulationSpeed;

// Export main functions for module usage
export { 
    startGame, 
    showCharacterCreator, 
    closeCharacterCreator,
    togglePause,
    setFocusTarget,
    setSimulationSpeed
};

console.log('🎮 Main.js loaded - Core game system ready');
