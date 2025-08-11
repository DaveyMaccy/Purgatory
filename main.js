/**
 * Main Application Entry Point - MINIMAL FIX VERSION
 *
 * This is a MINIMAL fix that only addresses the two specific errors:
 * 1. Map file path (office-layout.json → purgatorygamemap.json)
 * 2. Missing DOM element for renderer
 * CHANGE: Removed the incorrect closeCharacterCreator() call from startGame to fix the loop.
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
    
    uiManager = new UIManager();
    await uiManager.initialize();
    
    inputManager = new InputManager();
    inputManager.initialize();
    
    gameStateManager = new GameStateManager();
    gameStateManager.initialize();
    
    initializeCharacterCreator();
    
    setupNewGameButton();
    
    console.log('✅ All systems initialized successfully');
}

/**
 * Setup the New Game button
 */
function setupNewGameButton() {
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
        newGameBtn.disabled = false;
        
        const newButton = newGameBtn.cloneNode(true);
        newGameBtn.parentNode.replaceChild(newButton, newGameBtn);
        
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
 */
function showCharacterCreator() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log('📝 Start screen hidden');
    }
    
    const modal = document.getElementById('creator-modal-backdrop');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        console.log('📝 Character creator opened');
    } else {
        console.error('❌ Character creator modal not found!');
    }
}

/**
 * Close the character creator modal
 */
function closeCharacterCreator() {
    const modal = document.getElementById('creator-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        console.log('📝 Character creator closed');
    }
    
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.style.display = 'flex';
        console.log('📝 Start screen shown');
    }
}

/**
 * Load map data from JSON file
 */
async function loadMapData() {
    try {
        const response = await fetch('assets/maps/purgatorygamemap.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Failed to load map data:', error);
        return {
            width: 16, height: 12, tilewidth: 48, tileheight: 48, layers: []
        };
    }
}

/**
 * Start the actual game with finalized characters
 */
async function startGame(characters) {
    console.log('🚀 Starting game with', characters.length, 'characters');
    
    try {
        if (uiManager) {
            uiManager.showLoadingState(true, 'Starting simulation...');
        }
        
        // Close character creator modal (fix for modal staying open)
        const modal = document.getElementById('creator-modal-backdrop');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
            console.log('📝 Character creator closed');
        }
        
        // SHOW GAME UI FIRST - before creating the world container
        const gameUI = document.getElementById('main-game-ui');
        if (gameUI) {
            gameUI.classList.remove('hidden');
            gameUI.style.display = 'block';
            console.log('🎮 Game UI shown');
        }
        
        gameEngine = new GameEngine();
        
        characterManager = new CharacterManager();
        characterManager.loadCharacters(characters);
        
        const mapData = await loadMapData();
        
        // Look for existing container in the proper game UI structure
        let gameWorldContainer = document.getElementById('world-canvas-container');
        if (!gameWorldContainer) {
            console.log('⚠️ world-canvas-container not found in HTML, this should not happen');
            // Don't create fallback - the HTML structure should have this element
            throw new Error('world-canvas-container element missing from HTML structure');
        }
        
        renderer = new Renderer(gameWorldContainer);
        await renderer.initialize(mapData);
        
        uiUpdater = new UIUpdater(characterManager);
        
        // CRITICAL FIX: Establish observer pattern connections between UIUpdater and characters
        const allCharacters = characterManager.getCharacters();
        console.log(`🔗 Connecting UI observer to ${allCharacters.length} characters...`);
        
        allCharacters.forEach(character => {
            uiUpdater.subscribeToCharacter(character);
            console.log(`✅ UI subscribed to character: ${character.name}`);
        });
        
        // Set initial UI focus to player character
        const playerCharacter = characterManager.getPlayerCharacter();
        if (playerCharacter) {
            console.log(`🎯 Setting initial UI focus to player: ${playerCharacter.name}`);
            uiUpdater.updateUI(playerCharacter);
        }
        
        gameEngine.setCharacterManager(characterManager);
        gameEngine.setRenderer(renderer);
        gameEngine.setUIUpdater(uiUpdater);
        
        gameEngine.initialize(mapData);
        
        if (gameStateManager) {
            gameStateManager.setState('playing');
        }
        
        if (uiManager) {
            uiManager.showLoadingState(false);
        }
        
        console.log('🎮 Game started successfully with observer pattern connections!');
        
        // Test the observer pattern after 1 second to verify it's working
        setTimeout(() => {
            console.log('🧪 Testing observer pattern...');
            if (playerCharacter) {
                // This should trigger uiUpdater.onCharacterStateChange() -> updateUI()
                playerCharacter.setMood('happy');
                console.log('✅ Test mood change sent - UI should update automatically via observer pattern');
            }
        }, 1000);
        
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
        alert(message);
    }
}

// Make functions globally accessible
window.startGame = startGame;
window.startGameSimulation = startGame;  // Alias for character creator compatibility
// The rest of the global functions remain for compatibility.
window.showCharacterCreator = showCharacterCreator;
window.closeCharacterCreator = closeCharacterCreator;
window.togglePause = () => gameEngine?.pause();
window.setFocusTarget = (id) => renderer?.setFocusTarget(id);
window.setSimulationSpeed = (speed) => gameEngine?.setSimulationSpeed(speed);

// Export for module usage
export { 
    startGame, 
    showCharacterCreator, 
    closeCharacterCreator
};

console.log('🎮 Main.js loaded - Core game system ready');
