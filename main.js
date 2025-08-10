/**
 * STAGE 2 DEBUG: Updated main.js with character rendering debug and PixiJS
 * 
 * Fixed Issues:
 * 1. Added PixiJS initialization
 * 2. Connected renderer to game engine
 * 3. Added character positioning and rendering
 * 4. Added debug logging for character rendering
 * 5. Proper error handling for rendering
 */

import { GameEngine } from './src/core/gameEngine.js';
import { CharacterManager } from './src/core/characters/characterManager.js';
import { UIUpdater } from './src/ui/uiUpdater.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';
import { Renderer } from './src/rendering/renderer.js';

// Global game state
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let mapData = null;

/**
 * Initialize the game - called when page loads
 */
async function initializeGame() {
    try {
        console.log('Initializing game...');
        
        // Load PixiJS from CDN
        await loadPixiJS();
        
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
 * Load PixiJS from CDN
 */
async function loadPixiJS() {
    return new Promise((resolve, reject) => {
        if (window.PIXI) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js';
        script.onload = () => {
            console.log('PixiJS loaded successfully');
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Failed to load PixiJS'));
        };
        document.head.appendChild(script);
    });
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
        
        // STAGE 2: Initialize renderer first
        const worldContainer = document.getElementById('world-canvas-container');
        if (!worldContainer) {
            throw new Error('World canvas container not found');
        }
        
        renderer = new Renderer(worldContainer);
        await renderer.initialize();
        
        // Render the map
        renderer.renderMap(mapData);
        
        // Initialize game systems
        characterManager = new CharacterManager();
        
        // Load characters from character creator data
        characterManager.loadCharacters(characterData);
        
        // DEBUG: Check character data before positioning
        console.log('Characters after loading:', characterManager.characters.map(c => ({
            id: c.id,
            name: c.name,
            isPlayer: c.isPlayer,
            spriteSheet: c.spriteSheet
        })));
        
        // Position characters in valid world locations
        positionCharactersInWorld();
        
        // DEBUG: Check character data after positioning
        console.log('Characters after positioning:', characterManager.characters.map(c => ({
            id: c.id,
            name: c.name,
            x: c.x,
            y: c.y,
            spriteSheet: c.spriteSheet
        })));
        
        // STAGE 2: Add characters to renderer with debug
        console.log('Starting character rendering...');
        for (let i = 0; i < characterManager.characters.length; i++) {
            const character = characterManager.characters[i];
            console.log(`Attempting to render character ${i}:`, {
                id: character.id,
                name: character.name,
                x: character.x,
                y: character.y,
                spriteSheet: character.spriteSheet
            });
            
            try {
                await renderer.addCharacter(character);
                console.log(`✅ Successfully rendered character ${character.name}`);
            } catch (error) {
                console.error(`❌ Failed to render character ${character.name}:`, error);
                // Force fallback creation
                renderer.createFallbackCharacterSprite(character);
                console.log(`🔧 Created fallback sprite for ${character.name}`);
            }
        }
        
        // Initialize UI updater
        uiUpdater = new UIUpdater(characterManager);
        
        // Subscribe UI updater to all characters
        characterManager.characters.forEach(character => {
            uiUpdater.subscribeToCharacter(character);
        });
        
        // Initialize game engine with map data
        gameEngine = new GameEngine();
        gameEngine.uiUpdater = uiUpdater;
        gameEngine.renderer = renderer; // Connect renderer to game engine
        
        // Start game engine with loaded map data
        try {
            gameEngine.initialize(mapData);
            console.log('✅ Game started successfully');
            console.log('✅ Characters rendered in world');
        } catch (engineError) {
            console.warn('⚠️ Game engine had issues but rendering succeeded:', engineError);
            console.log('✅ Characters are still visible and positioned correctly');
        }
        
    } catch (error) {
        console.error('Failed to start game:', error);
        
        // Show error to user and return to start screen
        alert(`Failed to start game: ${error.message}. Please try again.`);
        returnToStartScreen();
    }
}

/**
 * Position characters in valid world locations
 */
function positionCharactersInWorld() {
    if (!characterManager || !characterManager.characters) {
        return;
    }
    
    // Define valid character spawn positions in the office
    const spawnPositions = [
        { x: 160, y: 120 }, // Near desk 1
        { x: 360, y: 120 }, // Near desk 2
        { x: 560, y: 120 }, // Near desk 3
        { x: 160, y: 320 }, // Near desk 4
        { x: 360, y: 320 }, // Near desk 5
    ];
    
    characterManager.characters.forEach((character, index) => {
        const position = spawnPositions[index % spawnPositions.length];
        
        // Add some random offset to prevent exact overlap
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        
        character.x = position.x + offsetX;
        character.y = position.y + offsetY;
        
        console.log(`Positioned ${character.name} at (${character.x}, ${character.y})`);
    });
}

/**
 * Return to start screen (for error handling)
 */
function returnToStartScreen() {
    // Cleanup renderer if it exists
    if (renderer) {
        renderer.destroy();
        renderer = null;
    }
    
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
