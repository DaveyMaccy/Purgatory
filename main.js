/**
 * STAGE 1 FIX: Complete rewrite of main.js initialization sequence
 * 
 * Fixed Issues:
 * 1. Proper UI state management with modals
 * 2. Correct function name for character creator
 * 3. Map data loading before game engine initialization
 * 4. Proper callback flow from character creation to game start
 */

import { GameEngine } from './src/core/gameEngine.js';
import { CharacterManager } from './src/core/characters/characterManager.js';
import { UIUpdater } from './src/ui/uiUpdater.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';

// Global game state
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let mapData = null;

/**
 * Initialize the game - called when page loads
 */
async function initializeGame() {
    try {
        console.log('Initializing game...');
        
        // Load map data first
        mapData = await loadMapData();
        console.log('Map data loaded successfully');
        
        // Setup UI event handlers
        setupUIEventHandlers();
        
        // Enable the "New Game" button now that everything is loaded
        const newGameButton = document.getElementById('new-game-button');
        if (newGameButton) {
            newGameButton.disabled = false;
            newGameButton.textContent = 'New Game';
        }
        
        // Update loading status
        const loadingStatus = document.getElementById('loading-status');
        if (loadingStatus) {
            loadingStatus.textContent = 'Ready to play!';
        }
        
        console.log('Game initialization complete');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        
        // Update loading status to show error
        const loadingStatus = document.getElementById('loading-status');
        if (loadingStatus) {
            loadingStatus.textContent = 'Error loading game. Please refresh.';
        }
    }
}

/**
 * Setup all UI event handlers
 */
function setupUIEventHandlers() {
    // New Game button - opens office type selection
    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton) {
        newGameButton.addEventListener('click', showOfficeTypeModal);
    }
    
    // Office type selection
    const selectOfficeButton = document.getElementById('select-office-button');
    if (selectOfficeButton) {
        selectOfficeButton.addEventListener('click', handleOfficeTypeSelection);
    }
    
    // Load Game button (disabled for now)
    const loadGameButton = document.getElementById('load-game-button');
    if (loadGameButton) {
        loadGameButton.addEventListener('click', () => {
            console.log('Load game functionality not implemented yet');
        });
    }
}

/**
 * Show the office type selection modal
 */
function showOfficeTypeModal() {
    // Hide start screen
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.classList.add('hidden');
    }
    
    // Show office type modal
    const officeModal = document.getElementById('office-type-modal-backdrop');
    if (officeModal) {
        officeModal.classList.remove('hidden');
    }
}

/**
 * Handle office type selection and open character creator
 */
function handleOfficeTypeSelection() {
    const officeSelect = document.getElementById('office-type-select');
    if (!officeSelect) {
        console.error('Office type selector not found');
        return;
    }
    
    const selectedOfficeType = officeSelect.value;
    console.log('Selected office type:', selectedOfficeType);
    
    // Hide office type modal
    const officeModal = document.getElementById('office-type-modal-backdrop');
    if (officeModal) {
        officeModal.classList.add('hidden');
    }
    
    // Show character creator modal
    const creatorModal = document.getElementById('creator-modal-backdrop');
    if (creatorModal) {
        creatorModal.classList.remove('hidden');
    }
    
    // Initialize character creator with callback
    initializeCharacterCreator(
        (characterData) => startGameWithCharacters(characterData, selectedOfficeType),
        selectedOfficeType
    );
}

/**
 * Start the actual game with created characters
 * @param {Array} characterData - Array of created character objects
 * @param {string} selectedOfficeType - The selected office type
 */
async function startGameWithCharacters(characterData, selectedOfficeType) {
    try {
        console.log('Starting game with characters:', characterData);
        console.log('Office type:', selectedOfficeType);
        
        // Hide character creator modal
        const creatorModal = document.getElementById('creator-modal-backdrop');
        if (creatorModal) {
            creatorModal.classList.add('hidden');
        }
        
        // Show main game UI
        const mainGameUI = document.getElementById('main-game-ui');
        if (mainGameUI) {
            mainGameUI.classList.remove('hidden');
        }
        
        // Initialize game systems
        characterManager = new CharacterManager();
        
        // Load characters from character creator data
        characterManager.loadCharacters(characterData);
        
        // Initialize UI updater
        uiUpdater = new UIUpdater(characterManager);
        
        // Subscribe UI updater to all characters
        characterManager.characters.forEach(character => {
            uiUpdater.subscribeToCharacter(character);
        });
        
        // Initialize game engine with map data
        gameEngine = new GameEngine();
        gameEngine.uiUpdater = uiUpdater;
        
        // Start game engine with loaded map data
        gameEngine.initialize(mapData);
        
        console.log('Game started successfully');
        
    } catch (error) {
        console.error('Failed to start game:', error);
        
        // Show error to user and return to start screen
        alert('Failed to start game. Please try again.');
        returnToStartScreen();
    }
}

/**
 * Return to start screen (for error handling)
 */
function returnToStartScreen() {
    // Hide all modals
    const modals = ['office-type-modal-backdrop', 'creator-modal-backdrop', 'main-game-ui'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Show start screen
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.classList.remove('hidden');
    }
}

// Start initialization when page loads
window.addEventListener('DOMContentLoaded', initializeGame);
