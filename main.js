/**
 * Main.js - Game initialization and coordination
 * CORRECTED UPDATE: Only the specified functions (startGame and showErrorMessage) have been replaced.
 * All other functions, including fallbacks and debug tools, are preserved.
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
// loadMapData is now imported within the new startGame function where it's used.
import { initializeCharacterCreator } from './character-creator.js';

// Global game state for Stage 3
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null;

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
    // FIXED: Add proper tab styling
    addTabCSS();
    
    // Set up game world click handlers (for future movement system)
    const worldContainer = document.getElementById('world-canvas-container');
    if (worldContainer) {
        worldContainer.addEventListener('click', handleWorldClick);
    }
    
    // Set up tab switching in the status panel
    setupStatusPanelTabs();
    
    console.log('✅ UI elements initialized');
}

/**
 * FIXED: Add CSS for proper tab styling with even alignment
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
    console.log('✅ Tab CSS injected with proper alignment');
}

/**
 * Setup New Game button with proper event handling
 */
function setupNewGameButton() {
    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton) {
        // Remove any existing listeners by cloning
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        
        // Enable and add event listener
        newButton.disabled = false;
        newButton.addEventListener('click', handleNewGameClick);
        
        console.log('✅ New Game button enabled and connected');
    } else {
        console.warn('⚠️ New Game button not found');
        // Auto-start for testing if button missing
        setTimeout(handleNewGameClick, 1000);
    }
}

/**
 * Handle New Game button click
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    
    try {
        // Hide start screen
        hideStartScreen();
        
        // Show character creator
        showCharacterCreator();
        
        // Initialize the character creator with Game Studio office type
        initializeCharacterCreator('Game Studio');
        
        console.log('✅ Character creator opened');
        
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        // Fallback: start with default characters
        startGameWithFallbackCharacters();
    }
}

/**
 * Handle clicks on the game world (placeholder for movement system)
 */
function handleWorldClick(event) {
    // This will be implemented in Stage 4 for character movement
    console.log('🖱️ World clicked at:', event.offsetX, event.offsetY);
}

/**
 * Set up status panel tab switching
 */
function setupStatusPanelTabs() {
    // FIXED: Proper tab switching implementation
    console.log('🔧 Setting up status panel tabs...');
    
    // Make openTab function available globally (as required by HTML onclick)
    window.openTab = function(evt, tabName) {
        console.log(`📋 Switching to tab: ${tabName}`);
        
        // Hide all tab content
        const tabContents = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove("active");
        }
        
        // Remove active class from all tab links
        const tabLinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }
        
        // Show the selected tab content and mark button as active
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add("active");
        }
        
        if (evt && evt.currentTarget) {
            evt.currentTarget.classList.add("active");
        }
    };
    
    // Set up click handlers for tab buttons (backup to onclick)
    const tabButtons = document.querySelectorAll('.tab-link');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = button.textContent.toLowerCase();
            window.openTab(e, tabName);
        });
    });
    
    console.log('✅ Status panel tabs configured');
}

/**
 * MAIN GAME START FUNCTION - REPLACED AS PER INSTRUCTIONS
 * This function now orchestrates the entire game startup process with the enhanced renderer.
 */
async function startGame(charactersData) {
    console.log('🎮 Starting game with enhanced renderer and sprite preloading...');
    
    try {
        // Hide character creator and show game world view
        hideCharacterCreator();
        showGameWorld();
        
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
// Make the new start function available globally for the character creator
window.startGameSimulation = startGame;

/**
 * Fallback game start with default characters (PRESERVED)
 */
function startGameWithFallbackCharacters() {
    console.log('🔧 Starting with fallback characters...');
    
    const fallbackCharacters = [
        { id: 'fallback_1', name: 'Test Player', isPlayer: true, jobRole: 'Senior Coder', spriteSheet: null, portrait: null, apiKey: '', physicalAttributes: { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 }, skills: { competence: 7, laziness: 3, charisma: 6, leadership: 5 }, personalityTags: ['Analytical', 'Focused'], experienceTags: [], needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 }, inventory: ['Coffee Mug', 'Laptop'], deskItems: ['Monitor', 'Keyboard'], relationships: {} },
        { id: 'fallback_2', name: 'Test NPC 1', isPlayer: false, jobRole: 'Junior Coder', spriteSheet: null, portrait: null, apiKey: '', physicalAttributes: { age: 25, height: 170, weight: 65, build: 'Slim', looks: 6 }, skills: { competence: 5, laziness: 4, charisma: 7, leadership: 3 }, personalityTags: ['Enthusiastic', 'Collaborative'], experienceTags: [], needs: { energy: 7, hunger: 6, social: 9, comfort: 7, stress: 3 }, inventory: ['Notebook', 'Pen'], deskItems: ['Plant', 'Photo'], relationships: {} }
    ];
    
    // Add 3 more characters to make 5 total
    for (let i = 2; i < 5; i++) {
        fallbackCharacters.push({ ...fallbackCharacters[1], id: `fallback_${i + 1}`, name: `Test NPC ${i}`, isPlayer: false });
    }
    
    // Start the game with fallback characters
    if (window.startGameSimulation) {
        window.startGameSimulation(fallbackCharacters);
    } else {
        console.error('❌ startGameSimulation not available');
    }
}

/**
 * UI state management functions (PRESERVED)
 */
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log('📺 Start screen hidden');
    }
}

function showCharacterCreator() {
    const creatorModal = document.getElementById('creator-modal-backdrop');
    if (creatorModal) {
        creatorModal.style.display = 'flex';
        creatorModal.classList.remove('hidden');
        console.log('🎭 Character creator shown');
    }
}

function hideCharacterCreator() {
    const creatorModal = document.getElementById('creator-modal-backdrop');
    if (creatorModal) {
        creatorModal.style.display = 'none';
        console.log('🎭 Character creator hidden');
    }
}

function showGameWorld() {
    // Show the main game UI
    const mainGameUI = document.getElementById('main-game-ui');
    if (mainGameUI) {
        mainGameUI.classList.remove('hidden');
        mainGameUI.style.display = 'flex';
        console.log('🌍 Game world shown');
    }
}

/**
 * Show error message to user (REPLACED AS PER INSTRUCTIONS)
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #dc3545;
        color: white; padding: 15px; border-radius: 5px; z-index: 9999;
        max-width: 300px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-family: sans-serif;
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
 * Log comprehensive game status for debugging (PRESERVED)
 */
function logGameStatus() {
    console.log('📊 Game Status Report:');
    if (gameEngine) console.log('🎮 Game Engine:', gameEngine.getStatus());
    if (characterManager) console.log('👥 Character Manager:', characterManager.getStatus());
    if (renderer) console.log('🎨 Renderer:', renderer.getStatus());
    if (uiUpdater) console.log('🖥️ UI Updater: Active with clock running');
}

/**
 * Clean up game resources (for page unload or restart) (PRESERVED)
 */
function cleanupGame() {
    console.log('🧹 Cleaning up game resources...');
    if (gameEngine) {
        gameEngine.stop();
        gameEngine = null;
    }
    if (renderer) {
        renderer.destroy();
        renderer = null;
    }
    if (uiUpdater) {
        uiUpdater.destroy();
        uiUpdater = null;
    }
    characterManager = null;
    focusTargetId = null;
    console.log('✅ Game cleanup complete');
}

/**
 * Handle page unload cleanup (PRESERVED)
 */
window.addEventListener('beforeunload', cleanupGame);

/**
 * Debug functions for console testing (PRESERVED)
 */
window.debugGame = {
    getGameEngine: () => gameEngine,
    getCharacterManager: () => characterManager,
    getRenderer: () => renderer,
    getUIUpdater: () => uiUpdater,
    logStatus: logGameStatus,
    forceUIUpdate: () => {
        if (gameEngine && focusTargetId) {
            const character = characterManager.getCharacter(focusTargetId);
            if (character && uiUpdater) {
                uiUpdater.updateUI(character);
                console.log('🔄 Debug: UI force updated');
            }
        }
    },
    getCharacterPositions: () => {
        if (characterManager) {
            const positions = characterManager.getCharacterPositions();
            console.log('Character Positions:');
            positions.forEach(pos => {
                console.log(`${pos.name}: (${pos.x}, ${pos.y}) - Player: ${pos.isPlayer}`);
            });
            return positions;
        }
        return [];
    },
    testNewGame: handleNewGameClick,
    startFallback: startGameWithFallbackCharacters,
    getCharacters: () => {
        if (characterManager) {
            return characterManager.characters.map(char => ({ name: char.name, needs: char.needs, position: char.position, mood: char.mood, jobRole: char.jobRole }));
        }
        return [];
    },
    testCharacterNeeds: () => {
        if (characterManager) {
            characterManager.characters.forEach(char => {
                console.log(`${char.name} needs:`, char.needs);
            });
        }
    },
    adjustCharacterNeed: (characterName, needType, value) => {
        if (characterManager) {
            const char = characterManager.getCharacterByName(characterName);
            if (char && char.needs && char.needs[needType] !== undefined) {
                char.needs[needType] = Math.max(0, Math.min(10, value));
                char.notifyObservers('needs');
                console.log(`Set ${characterName}'s ${needType} to ${value}`);
            } else {
                console.log('Character or need type not found');
            }
        }
    }
};

console.log('🎮 Main.js loaded - Debug functions available as window.debugGame');
