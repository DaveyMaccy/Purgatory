/**
 * Main Application Entry Point - MINIMAL FIX VERSION
 *
 * This is a MINIMAL fix that only addresses the two specific errors:
 * 1. Map file path (office-layout.json → purgatorygamemap.json)
 * 2. Missing DOM element for renderer
 * CHANGE: Corrected UIUpdater instantiation.
 * CHANGE: Corrected gameEngine.start() to gameEngine.initialize(mapData).
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
 * MINIMAL FIX: Only change the filename to match the actual file structure
 */
async function loadMapData() {
    try {
        // MINIMAL FIX: Use correct filename from file structure (was office-layout.json)
        const response = await fetch('./assets/maps/purgatorygamemap.json');
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
            width: 16,
            height: 12,
            tilewidth: 48,
            tileheight: 48,
            layers: []
        };
    }
}

/**
 * Start the actual game with finalized characters
 * Called by the character creator when ready
 * MINIMAL FIX: Only fix the DOM element and renderer initialization
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

        // MINIMAL FIX: Ensure the game world container exists before initializing renderer
        let gameWorldContainer = document.getElementById('world-canvas-container');
        if (!gameWorldContainer) {
            // Create the container if it doesn't exist
            console.log('⚠️ Creating missing world-canvas-container element');
            gameWorldContainer = document.createElement('div');
            gameWorldContainer.id = 'world-canvas-container';
            gameWorldContainer.style.cssText = 'width: 100%; height: 500px; background: #000; border: 2px solid #333; margin: 20px 0;';

            // Try to find a good place to insert it
            const gameUI = document.getElementById('main-game-ui');
            if (gameUI) {
                gameUI.insertBefore(gameWorldContainer, gameUI.firstChild);
            } else {
                // Fallback: add to body
                document.body.appendChild(gameWorldContainer);
                console.log('⚠️ Added world-canvas-container to body as fallback');
            }
        }

        // Initialize renderer with the container
        renderer = new Renderer(gameWorldContainer);
        await renderer.initialize(mapData);

        // Pass characterManager to the UIUpdater constructor.
        uiUpdater = new UIUpdater(characterManager);

        // Connect all systems to game engine
        gameEngine.setCharacterManager(characterManager);
        gameEngine.setRenderer(renderer);
        gameEngine.setUIUpdater(uiUpdater);

        // *** THIS IS THE FIX ***
        // Changed from gameEngine.start() to the correct gameEngine.initialize() method.
        gameEngine.initialize(mapData);

        // Update game state
        if (gameStateManager) {
            gameStateManager.setState('playing');
        }

        // Show main game UI
        const gameUI = document.getElementById('main-game-ui');
        if (gameUI) {
            gameUI.classList.remove('hidden');
            gameUI.style.display = 'block';
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
// CRITICAL: Keep existing global exports intact!
window.showCharacterCreator = showCharacterCreator;
window.closeCharacterCreator = closeCharacterCreator;
window.startGame = startGame;  // This is what the character creator calls!
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
