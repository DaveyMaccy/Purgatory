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
 * Initialize all game systems
 */
async function initializeGame() {
    console.log('🚀 Initializing game systems...');
    
    // Initialize core managers
    uiManager = new UIManager();
    await uiManager.initialize();
    
    inputManager = new InputManager();
    await inputManager.initialize();
    
    gameStateManager = new GameStateManager();
    await gameStateManager.initialize();
    
    // Initialize character creator
    await initializeCharacterCreator('Game Studio');
    
    // Setup New Game button handler
    setupNewGameButton();
    
    console.log('✅ All systems initialized successfully');
}

/**
 * Setup New Game button functionality - PHASE 1 FIXED
 */
function setupNewGameButton() {
    const newGameBtn = document.getElementById('new-game-btn');
    
    if (newGameBtn) {
        console.log('🎯 Found New Game button with ID:', newGameBtn.id);
        
        // Remove any existing listeners
        newGameBtn.replaceWith(newGameBtn.cloneNode(true));
        const freshBtn = document.getElementById('new-game-btn');
        
        freshBtn.addEventListener('click', () => {
            console.log('🎯 New Game button clicked');
            showCharacterCreator();
        });
        
        console.log('✅ New Game button setup complete');
    } else {
        console.error('❌ Could not find New Game button with ID: new-game-btn');
    }
}

/**
 * Show the character creator modal
 */
function showCharacterCreator() {
    // Hide start screen
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log('📝 Start screen hidden');
    }
    
    // Show character creator
    const creatorModal = document.getElementById('creator-modal-backdrop');
    if (creatorModal) {
        creatorModal.style.display = 'flex';
        creatorModal.classList.remove('hidden');
        console.log('📝 Character creator opened');
    } else {
        console.error('❌ Character creator modal not found. Expected ID: creator-modal-backdrop');
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
 * Load map data from assets - FIXED: Use correct filename
 */
async function loadMapData() {
    try {
        // FIXED: Use the correct map filename from file structure
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
        
        // FIXED: Find or create the game world container element
        let gameWorldContainer = document.getElementById('world-canvas-container');
        if (!gameWorldContainer) {
            // Create the container if it doesn't exist
            console.log('⚠️ Creating missing world-canvas-container element');
            gameWorldContainer = document.createElement('div');
            gameWorldContainer.id = 'world-canvas-container';
            gameWorldContainer.style.cssText = 'width: 100%; height: 500px; background: #000; border: 2px solid #333;';
            
            // Try to find a good place to insert it
            const gameUI = document.getElementById('main-game-ui');
            if (gameUI) {
                gameUI.insertBefore(gameWorldContainer, gameUI.firstChild);
            } else {
                // Fallback: add to body
                document.body.appendChild(gameWorldContainer);
            }
        }
        
        // Initialize renderer with the container
        renderer = new Renderer(gameWorldContainer);
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
            gameUI.style.display = 'block';
        } else {
            console.warn('⚠️ main-game-ui element not found, game may not display properly');
        }
        
        // Hide loading state
        if (uiManager) {
            uiManager.showLoadingState(false);
        }
        
        console.log('🎮 Game started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game:', error);
        
        // Hide loading state
        if (uiManager) {
            uiManager.showLoadingState(false);
        }
        
        // Show error message
        showErrorMessage(`Failed to start game: ${error.message}`);
        
        // Show character creator again
        showCharacterCreator();
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    alert(message); // Simple alert for now
    console.error('💥 Error shown to user:', message);
}

// Make startGame available globally for character creator
window.startGame = startGame;

console.log('🎮 Main.js loaded - Core game system ready');
