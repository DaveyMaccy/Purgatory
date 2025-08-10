/**
 * STAGE 3 COMPLETE: Main Game Initialization
 * 
 * This is the main entry point that coordinates all game systems:
 * - Character creator integration
 * - Game engine initialization
 * - Renderer setup with PixiJS
 * - World and character positioning
 * - UI system integration
 * - Proper error handling and cleanup
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';

// Global game state for Stage 3
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null;

// DOM Ready Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Game Loading...');
    
    try {
        // Initialize the character creator system
        initializeCharacterCreator();
        console.log('✅ Character creator initialized');
        
        // Enable the New Game button once everything is loaded
        const newGameButton = document.getElementById('new-game-button');
        if (newGameButton) {
            newGameButton.disabled = false;
            newGameButton.addEventListener('click', openCharacterCreator);
            console.log('✅ New game button enabled');
        }
        
        // Initialize UI elements
        initializeUIElements();
        
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
    const tabButtons = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('[data-tab-content]');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Add active class to clicked tab and show content
            button.classList.add('active');
            const targetContent = document.querySelector(`[data-tab-content="${targetTab}"]`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
}

/**
 * Open the character creator modal
 */
function openCharacterCreator() {
    console.log('🎭 Opening character creator...');
    
    const modal = document.getElementById('character-creator-modal');
    const startScreen = document.getElementById('start-screen');
    
    if (modal && startScreen) {
        startScreen.style.display = 'none';
        modal.style.display = 'flex';
        console.log('✅ Character creator opened');
    } else {
        console.error('❌ Character creator modal or start screen not found');
    }
}

/**
 * MAIN GAME START FUNCTION - Called from character creator
 * This is the primary entry point for starting the game simulation
 */
window.startGameSimulation = async function(charactersFromCreator) {
    try {
        console.log('🚀 Starting game simulation with characters:', charactersFromCreator);
        
        // Validate input
        if (!charactersFromCreator || charactersFromCreator.length === 0) {
            throw new Error('No characters provided for simulation');
        }
        
        // Show loading state
        showLoadingState();
        
        // Initialize character manager
        console.log('👥 Initializing character manager...');
        characterManager = new CharacterManager();
        
        // Load characters from the character creator
        characterManager.loadCharacters(charactersFromCreator);
        
        // Set the first player character as focus target
        const playerCharacter = characterManager.getPlayerCharacter();
        if (playerCharacter) {
            focusTargetId = playerCharacter.id;
            console.log(`🎯 Focus set to player: ${playerCharacter.name}`);
        } else {
            console.warn('⚠️ No player character found, using first character');
            if (characterManager.characters.length > 0) {
                focusTargetId = characterManager.characters[0].id;
            }
        }
        
        // Initialize UI updater
        console.log('🖥️ Initializing UI updater...');
        uiUpdater = new UIUpdater(characterManager);
        
        // Subscribe UI updater to all characters for observer pattern
        characterManager.characters.forEach(character => {
            uiUpdater.subscribeToCharacter(character);
            console.log(`🔗 UI updater subscribed to: ${character.name}`);
        });
        
        // Load map data
        console.log('🗺️ Loading map data...');
        const mapData = await loadMapData();
        console.log('✅ Map data loaded successfully');
        
        // Initialize game engine
        console.log('🎮 Initializing game engine...');
        gameEngine = new GameEngine();
        gameEngine.characterManager = characterManager;
        gameEngine.setUIUpdater(uiUpdater);
        
        // Initialize renderer
        console.log('🎨 Initializing renderer...');
        const worldContainer = document.getElementById('world-canvas-container');
        if (!worldContainer) {
            throw new Error('World canvas container not found in DOM');
        }
        
        renderer = new Renderer(worldContainer);
        await renderer.initialize();
        gameEngine.setRenderer(renderer);
        console.log('✅ Renderer initialized');
        
        // Render the map
        renderer.renderMap(mapData);
        console.log('🏢 Map rendered');
        
        // Start the game engine (this creates the world and nav grid)
        gameEngine.initialize(mapData);
        console.log('✅ Game engine initialized');
        
        // Initialize character positions AFTER world is created
        if (gameEngine.world) {
            characterManager.initializeCharacterPositions(gameEngine.world);
            console.log('📍 Character positions initialized');
            
            // Add characters to renderer
            console.log('👤 Adding characters to renderer...');
            for (const character of characterManager.characters) {
                await renderer.addCharacter(character);
            }
            console.log('✅ Characters added to renderer');
        } else {
            throw new Error('Game world was not created properly');
        }
        
        // Hide loading/start screens and show game world
        hideLoadingState();
        hideStartScreen();
        hideCharacterCreator();
        showGameWorld();
        
        // Start UI updates with initial focus character
        if (focusTargetId) {
            const focusCharacter = characterManager.getCharacter(focusTargetId);
            if (focusCharacter) {
                uiUpdater.updateUI(focusCharacter);
                console.log(`🎯 UI focused on: ${focusCharacter.name}`);
            }
        }
        
        // Log game status for debugging
        logGameStatus();
        
        console.log('🎉 Game simulation started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game simulation:', error);
        hideLoadingState();
        showErrorMessage(`Failed to start game: ${error.message}`);
    }
};

/**
 * Show loading state during game initialization
 */
function showLoadingState() {
    // You can add a loading spinner or message here
    console.log('⏳ Loading game...');
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    // Hide loading spinner/message
    console.log('✅ Loading complete');
}

/**
 * Hide the start screen
 */
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log('📺 Start screen hidden');
    }
}

/**
 * Hide the character creator modal
 */
function hideCharacterCreator() {
    const modal = document.getElementById('character-creator-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('🎭 Character creator hidden');
    }
}

/**
 * Show the main game world interface
 */
function showGameWorld() {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.style.display = 'flex';
        console.log('🌍 Game world shown');
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    // You can replace this with a proper error modal
    alert(message);
    console.error('💥 Error shown to user:', message);
}

/**
 * Log comprehensive game status for debugging
 */
function logGameStatus() {
    console.log('📊 Game Status Report:');
    
    if (gameEngine) {
        console.log('🎮 Game Engine:', gameEngine.getStatus());
    }
    
    if (characterManager) {
        console.log('👥 Character Manager:', characterManager.getStatus());
    }
    
    if (renderer) {
        console.log('🎨 Renderer:', renderer.getStatus());
    }
    
    if (uiUpdater) {
        console.log('🖥️ UI Updater: Active with clock running');
    }
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
 * Handle page unload cleanup
 */
window.addEventListener('beforeunload', cleanupGame);

/**
 * Debug functions for console testing
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
            return characterManager.getCharacterPositions();
        }
        return [];
    }
};

console.log('🎮 Main.js loaded - Debug functions available as window.debugGame');
