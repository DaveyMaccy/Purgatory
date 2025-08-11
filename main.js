/**
 * Main Application Entry Point - PHASE 1 FIXED
 * 
 * Coordinates the initialization of all game systems and manages the main game loop.
 * This file serves as the primary entry point and orchestrator for the entire application.
 */

// Import core systems
import { UIManager } from './src/ui/ui-manager.js';
import { InputManager } from './src/input/input-manager.js';
import { GameStateManager } from './src/core/game-state-manager.js';
import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { Renderer } from './src/rendering/renderer.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { initializeCharacterCreator } from './character-creator.js';

// Global system instances
let uiManager = null;
let inputManager = null;
let gameStateManager = null;
let gameEngine = null;
let characterManager = null;
let renderer = null;
let uiUpdater = null;

/**
 * Application entry point
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Purgatory Office Simulator - Initializing...');
    
    try {
        await initializeGame();
        console.log('🚀 Game initialization complete');
        
        // Update loading status
        const loadingStatus = document.getElementById('loading-status');
        if (loadingStatus) {
            loadingStatus.textContent = 'Ready to start!';
        }
        
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
    // Try multiple possible button IDs to ensure compatibility
    const buttonIds = ['new-game-btn', 'new-game-button'];
    let newGameBtn = null;
    
    for (const id of buttonIds) {
        newGameBtn = document.getElementById(id);
        if (newGameBtn) {
            console.log(`🎯 Found New Game button with ID: ${id}`);
            break;
        }
    }
    
    if (newGameBtn) {
        // Enable the button
        newGameBtn.disabled = false;
        
        // Remove any existing event listeners by cloning the node
        const newButton = newGameBtn.cloneNode(true);
        newGameBtn.parentNode.replaceChild(newButton, newGameBtn);
        
        // Add our event listener
        newButton.addEventListener('click', function() {
            console.log('🎯 New Game button clicked');
            showCharacterCreator();
        });
        
        console.log('✅ New Game button setup complete');
    } else {
        console.error('❌ New Game button not found! Checked IDs:', buttonIds);
    }
}

/**
 * Show the character creator modal
 * FIXED: Updated to use correct modal ID from HTML structure
 */
function showCharacterCreator() {
    // First hide the start screen
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log('📝 Start screen hidden');
    }
    
    // Show the character creator modal (using correct ID from HTML)
    const modal = document.getElementById('creator-modal-backdrop');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        console.log('📝 Character creator opened');
    } else {
        console.error('❌ Character creator modal not found! Expected ID: creator-modal-backdrop');
    }
}

/**
 * Close the character creator modal
 * FIXED: Updated to use correct modal ID from HTML structure
 */
function closeCharacterCreator() {
    const modal = document.getElementById('creator-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        console.log('📝 Character creator closed');
        
        // Show start screen again
        const startScreen = document.getElementById('start-screen-backdrop');
        if (startScreen) {
            startScreen.style.display = 'flex';
        }
    }
}

/**
 * Load map data from assets
 */
async function loadMapData() {
    try {
        const response = await fetch('./assets/maps/office-layout.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const mapData = await response.json();
        console.log('🗺️ Map data loaded successfully');
        return mapData;
    } catch (error) {
        console.error('❌ Failed to load map data:', error);
        // Return a basic fallback map
        return {
            width: 960,
            height: 640,
            tileSize: 32,
            objects: []
        };
    }
}

/**
 * Start the actual game with finalized characters
 * Called by the character creator when ready
 * PHASE 1 FIX: Use loadCharacters instead of initialize
 */
async function startGame(characters) {
    console.log('🚀 Starting game with', characters.length, 'characters');
    
    try {
        // Show loading state
        if (uiManager) {
            uiManager.showLoadingState(true, 'Starting simulation...');
        }
        
        // Hide the character creator modal
        closeCharacterCreator();
        
        // Initialize game engine
        gameEngine = new GameEngine();
        
        // PHASE 1 FIX: Use loadCharacters instead of initialize
        characterManager = new CharacterManager();
        characterManager.loadCharacters(characters);  // FIXED: Was characterManager.initialize(characters)
        
        // Load map data
        const mapData = await loadMapData();
        
        // Initialize renderer
        renderer = new Renderer();
        await renderer.initialize(mapData);
        
        // Initialize UI updater
        uiUpdater = new UIUpdater();
        await uiUpdater.initialize();
        
        // Connect all systems to game engine
        gameEngine.setCharacterManager(characterManager);
        gameEngine.setRenderer(renderer);
        gameEngine.setUIUpdater(uiUpdater);
        
        // Start the game loop
        await gameEngine.start();
        
        // Update game state
        if (gameStateManager) {
            gameStateManager.setState('playing');
        }
        
        // Show main game UI
        const gameUI = document.getElementById('main-game-ui');
        if (gameUI) {
            gameUI.classList.remove('hidden');
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
