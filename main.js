/**
 * Main.js - Game initialization and coordination
 * ENHANCED: Integrated enhanced renderer with sprite preloading and error handling.
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
// Note: loadMapData is now imported and called within the new startGame function
import { initializeCharacterCreator } from './character-creator.js';

// Global game state
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null; // This can be removed if UIUpdater handles focus directly

/**
 * DOM Ready Event - Main initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Game Loading...');
    
    try {
        // Initialize UI elements
        initializeUIElements();
        
        // Setup the New Game button
        setupNewGameButton();
        
        console.log('🎮 Game initialization complete - Ready to start!');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

/**
 * Initialize UI elements and event handlers
 */
function initializeUIElements() {
    addTabCSS();
    
    const worldContainer = document.getElementById('world-canvas-container');
    if (worldContainer) {
        worldContainer.addEventListener('click', handleWorldClick);
    }
    
    setupStatusPanelTabs();
    
    console.log('✅ UI elements initialized');
}

/**
 * Add CSS for proper tab styling
 */
function addTabCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .tabs { display: flex; border-bottom: 1px solid #d1d5db; margin-bottom: 0; background-color: #f9fafb; padding: 8px 8px 0 8px; border-radius: 6px 6px 0 0; gap: 2px; }
        .tab-link { background-color: #f3f4f6; border: 1px solid #d1d5db; color: #374151; padding: 8px 12px; cursor: pointer; border-radius: 6px 6px 0 0; font-size: 14px; font-weight: 500; transition: all 0.2s ease; flex: 1; text-align: center; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-bottom: none; }
        .tab-link:hover { background-color: #e5e7eb; color: #1f2937; }
        .tab-link.active { background-color: #3b82f6; color: white; border-color: #3b82f6; border-bottom: 1px solid #3b82f6; }
        .tab-content { display: none; padding: 16px; border: 1px solid #d1d5db; border-top: none; border-radius: 0 0 6px 6px; background-color: white; min-height: 200px; margin-top: -1px; }
        .tab-content.active { display: block; }
        .widget.flex-grow { display: flex; flex-direction: column; }
        .widget .flex-grow { flex: 1; overflow-y: auto; }
    `;
    document.head.appendChild(style);
    console.log('✅ Tab CSS injected');
}

/**
 * Setup New Game button with proper event handling
 */
function setupNewGameButton() {
    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton) {
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        newButton.disabled = false;
        newButton.addEventListener('click', handleNewGameClick);
        console.log('✅ New Game button enabled and connected');
    }
}

/**
 * Handle New Game button click
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    try {
        hideStartScreen();
        showCharacterCreator();
        initializeCharacterCreator('Game Studio');
        console.log('✅ Character creator opened');
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        // Fallback to start the game directly if creator fails
        startGame([]); 
    }
}

/**
 * Handle clicks on the game world (placeholder for movement system)
 */
function handleWorldClick(event) {
    console.log('🖱️ World clicked at:', event.offsetX, event.offsetY);
}

/**
 * Set up status panel tab switching
 */
function setupStatusPanelTabs() {
    window.openTab = function(evt, tabName) {
        const tabContents = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove("active");
        }
        const tabLinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add("active");
        }
        if (evt && evt.currentTarget) {
            evt.currentTarget.classList.add("active");
        }
    };
}


/**
 * MAIN GAME START FUNCTION - REPLACED
 * This is now the primary entry point for starting the game simulation.
 * It's assigned to window.startGameSimulation to be callable from character-creator.js
 * @param {Array} charactersData - The array of character data from the creator.
 */
async function startGame(charactersData) {
     console.log('🎮 Starting game with enhanced renderer and sprite preloading...');
     
     try {
        // Hide character creator and show game world
        hideCharacterCreator();
        showGameView();
         
         // Get the world canvas container
         const worldContainer = document.getElementById('world-canvas-container');
         if (!worldContainer) {
             throw new Error('World canvas container not found in DOM');
         }

        // Initialize Character Manager
        characterManager = new CharacterManager();
         // Load character data into character manager
         console.log('📝 Loading characters into character manager...');
         characterManager.loadCharacters(charactersData);
         
         // Load map data
         console.log('🗺️ Loading map data...');
         const { loadMapData } = await import('./src/core/world/world.js');
         const mapData = await loadMapData();
         
         // ENHANCED: Initialize renderer with sprite preloading
         console.log('🎨 Initializing enhanced renderer with sprite preloading...');
         renderer = new Renderer(worldContainer);
         await renderer.initialize(mapData); // This now includes automatic sprite preloading
         
         // Initialize game engine with enhanced renderer
         console.log('⚙️ Initializing game engine...');
         gameEngine = new GameEngine(characterManager, renderer);
         await gameEngine.initialize();
         
         // Initialize UI updater
         console.log('🖥️ Initializing UI updater...');
         uiUpdater = new UIUpdater(characterManager);
         uiUpdater.initialize();
         
         // Start the game loop
         console.log('🔄 Starting game loop...');
         gameEngine.start();
         
         // Add global access for debugging
         window.game = {
             renderer,
             gameEngine,
             characterManager,
             uiUpdater
         };
         
         console.log('✅ Game started successfully with enhanced sprite rendering!');
         console.log('🔍 Debug tip: Run "window.game.renderer.getStatus()" in console to check renderer status');
         
     } catch (error) {
         console.error('❌ Failed to start game:', error);
         showErrorMessage('Failed to start game: ' + error.message);
         
         // Clean up on failure
         if (renderer) {
             renderer.destroy();
             renderer = null;
         }
     }
}
// Make the main game start function globally available for the character creator
window.startGameSimulation = startGame;


/**
 * UI state management functions
 */
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) startScreen.style.display = 'none';
}

function showCharacterCreator() {
    const creatorModal = document.getElementById('creator-modal-backdrop');
    if (creatorModal) {
        creatorModal.style.display = 'flex';
        creatorModal.classList.remove('hidden');
    }
}

function hideCharacterCreator() {
    const creatorModal = document.getElementById('creator-modal-backdrop');
    if (creatorModal) creatorModal.style.display = 'none';
}

function showGameView() {
    const mainGameUI = document.getElementById('main-game-ui');
    if (mainGameUI) {
        mainGameUI.classList.remove('hidden');
        mainGameUI.style.display = 'flex';
    }
    const startScreen = document.getElementById('start-screen-backdrop');
    if(startScreen) startScreen.style.display = 'none';
}

/**
 * Show error message to user - REPLACED
 * Displays a styled, non-blocking error message at the top-right of the screen.
 */
function showErrorMessage(message) {
     const errorDiv = document.createElement('div');
     errorDiv.style.cssText = `
         position: fixed;
         top: 20px;
         right: 20px;
         background: #dc3545;
         color: white;
         padding: 15px;
         border-radius: 5px;
         z-index: 9999;
         max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: sans-serif;
        font-size: 14px;
     `;
     errorDiv.textContent = message;
     document.body.appendChild(errorDiv);
     
     // Auto-remove after 5 seconds
     setTimeout(() => {
         if (errorDiv.parentNode) {
             errorDiv.parentNode.removeChild(errorDiv);
         }
     }, 5000);
}


/**
 * Clean up game resources (for page unload or restart)
 */
function cleanupGame() {
    console.log('🧹 Cleaning up game resources...');
    if (gameEngine) {
        gameEngine.stop();
        gameEngine = null;
    }
    // Renderer is destroyed within gameEngine.stop() or startGame() failure
    characterManager = null;
    uiUpdater = null; // Assuming uiUpdater doesn't need complex cleanup
    console.log('✅ Game cleanup complete');
}

window.addEventListener('beforeunload', cleanupGame);

/**
 * Debug functions for console testing
 */
window.debugGame = {
    getGameEngine: () => gameEngine,
    getCharacterManager: () => characterManager,
    getRenderer: () => renderer,
    getUIUpdater: () => uiUpdater,
    logStatus: () => {
        console.log('📊 Game Status Report:');
        if (window.game) {
            console.log('🎨 Renderer:', window.game.renderer.getStatus());
            console.log('⚙️ Game Engine:', window.game.gameEngine.getStatus());
            console.log('👥 Character Manager:', window.game.characterManager.getStatus());
        } else {
            console.log('Game not fully initialized.');
        }
    },
};

console.log('🎮 Main.js loaded - Debug functions available as window.debugGame');
