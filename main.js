/**
 * OFFICE PURGATORY - MAIN GAME FILE
 * PHASE 3 COMPATIBLE - COMPLETE VERSION WITH ALL FUNCTIONS
 * 
 * CRITICAL FIX: Updated all UI functions to use correct HTML element IDs
 * COMPLETE: Includes ALL functions from the original main.js
 */

// Import statements - Module-based loading
import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';

// Global game state variables
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null;

console.log('🎮 Office Purgatory - Game Loading...');

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
 * Initialize UI elements and inject required styles
 */
function initializeUIElements() {
    console.log('🎨 Initializing UI elements...');
    
    // Hide initial screens
    hideStartScreen();
    hideCharacterCreator();
    hideGameView();
    
    // Setup status panel tabs  
    setupStatusPanelTabs();
    
    // Inject tab CSS fixes
    injectTabCSS();
    
    // Show start screen
    showStartScreen();
    
    console.log('✅ UI elements initialized');
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
 * Inject CSS fixes for tab alignment
 */
function injectTabCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Tab alignment fixes */
        .tab-bar {
            display: flex;
            border-bottom: 1px solid #333;
            background: #1a1a1a;
        }
        
        .tab-link {
            padding: 10px 20px;
            background: transparent;
            color: #888;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .tab-link:hover {
            background: #2a2a2a;
            color: #fff;
        }
        
        .tab-link.active {
            background: #333;
            color: #0ff;
            border-bottom: 2px solid #0ff;
            margin-bottom: -1px;
        }
        
        .tab-content {
            display: none;
            padding: 15px;
            min-height: 200px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Ensure proper z-index for tab bar */
        .tab-bar {
            z-index: 10;
            margin-top: -1px;
        }
        
        /* Ensure the widget container has proper flex layout */
        .widget.flex-grow {
            display: flex;
            flex-direction: column;
        }
        
        .widget .flex-grow {
            flex: 1;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Tab CSS injected with proper alignment');
}

/**
 * Set up status panel tab switching
 */
function setupStatusPanelTabs() {
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
 * MAIN GAME START FUNCTION - Called from character creator
 * FIXED: Use correct method names that actually exist in the codebase
 */
window.startGameSimulation = async function(charactersFromCreator) {
    try {
        console.log('🚀 Starting game simulation with characters:', charactersFromCreator);
        
        // Validate input
        if (!charactersFromCreator || charactersFromCreator.length === 0) {
            throw new Error('No characters provided to start game');
        }
        
        // Hide character creator
        hideCharacterCreator();
        
        // Show game view
        showGameView();
        
        // Load map data first
        const mapData = await loadMapData();
        console.log('✅ Map data loaded');
        
        // Initialize character manager with characters
        characterManager = new CharacterManager();
        characterManager.loadCharacters(charactersFromCreator);
        console.log('✅ Character manager initialized');
        
        // Initialize renderer with world container - FIXED: Use correct container ID
        const worldContainer = document.getElementById('world-canvas-container');
        if (!worldContainer) {
            throw new Error('World canvas container not found');
        }
        
        renderer = new Renderer(worldContainer);
        await renderer.initialize(mapData);
        console.log('✅ Renderer initialized');
        
        // Initialize game engine with all systems
        gameEngine = new GameEngine(characterManager, renderer, mapData);
        console.log('✅ Game engine initialized');
        
        // Initialize character positions using world navigation grid
        characterManager.initializeCharacterPositions(gameEngine.world);
        
        // Render all characters in the world
        const characters = characterManager.characters;
        characters.forEach(character => {
            // Use renderCharacter (the actual method that exists)
            renderer.renderCharacter(character);
            console.log(`✅ Rendered character: ${character.name}`);
        });
        
        // Initialize UI updater for real-time status updates
        uiUpdater = new UIUpdater(characterManager);
        console.log('✅ UI updater initialized');
        
        // Set initial focus on player character
        const playerCharacter = characterManager.getPlayerCharacter();
        if (playerCharacter) {
            setFocusTarget(playerCharacter.id);
        }
        
        // Assign initial tasks to all characters
        gameEngine.world.assignInitialTasks();
        
        // PHASE 4: Add click handler for movement
        const canvas = renderer.app?.view;
        if (canvas) {
            canvas.addEventListener('click', handleWorldClick);
            console.log('✅ Click-to-move enabled');
        }
        
        // Start the game loop
        gameEngine.start();

 // Make game accessible globally for debugging
        window.game = {
            engine: gameEngine,
            characterManager: characterManager,
            renderer: renderer,
            uiUpdater: uiUpdater
        };
        
        // ANIMATION FIX: Make renderer globally accessible for character animations
        window.renderer = renderer;
        
        // Make game accessible globally for debugging
        window.game = {
            engine: gameEngine,
            characterManager: characterManager,
            renderer: renderer,
            uiUpdater: uiUpdater
        };
        
        console.log('🎮 GAME STARTED SUCCESSFULLY!');
        showSuccessMessage('Game started! Click to move your character.');
        
    } catch (error) {
        console.log('❌ Failed to start game:', error.message);
        showErrorMessage(`Failed to start game: ${error.message}`);
    }
};

/**
 * PHASE 4 ENHANCED: Handle clicks on the game world for movement
 */
function handleWorldClick(event) {
    // PHASE 4: Implement click-to-move for player character
    if (!gameEngine || !characterManager || !renderer) {
        console.warn('⚠️ Game not fully initialized');
        return;
    }
    
    const player = characterManager.getPlayerCharacter();
    if (!player) {
        console.warn('⚠️ No player character found');
        return;
    }
    
    // Get click position relative to canvas
    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Convert to world coordinates (accounting for any camera offset)
    const worldX = clickX;
    const worldY = clickY;
    
    console.log(`🖱️ Click at world position: (${worldX}, ${worldY})`);
    
    // Find path from player position to click position
    const path = gameEngine.world.findPath(
        player.position,
        { x: worldX, y: worldY }
    );
    
    if (path && path.length > 0) {
        // Set the path on the player character
        player.path = path;
        console.log(`🚶 Player path set with ${path.length} waypoints`);
    } else {
        console.log('❌ No valid path to destination');
    }
}

/**
 * Fallback function when character creator fails
 */
function startGameWithFallbackCharacters() {
    console.log('🔧 Starting with fallback characters...');
    
    const fallbackCharacters = [
        {
            id: 'player',
            name: 'Manager',
            age: 35,
            jobRole: 'Manager',
            competence: 7,
            laziness: 3,
            charisma: 8,
            personalityTags: ['organized', 'decisive'],
            experienceTags: ['Leadership'],
            personalItems: ['clipboard'],
            deskItems: ['computer'],
            spriteSheet: 'assets/characters/character-01.png',
            isPlayer: true
        },
        {
            id: 'npc1',
            name: 'Developer',
            age: 28,
            jobRole: 'Software Developer',
            competence: 9,
            laziness: 4,
            charisma: 5,
            personalityTags: ['logical', 'introverted'],
            experienceTags: ['Programming'],
            personalItems: ['laptop'],
            deskItems: ['code'],
            spriteSheet: 'assets/characters/character-02.png',
            isPlayer: false
        },
        {
            id: 'npc2',
            name: 'Designer',
            age: 26,
            jobRole: 'UI/UX Designer',
            competence: 8,
            laziness: 2,
            charisma: 7,
            personalityTags: ['creative', 'detail-oriented'],
            experienceTags: ['Design'],
            personalItems: ['tablet'],
            deskItems: ['sketches'],
            spriteSheet: 'assets/characters/character-03.png',
            isPlayer: false
        },
        {
            id: 'npc3',
            name: 'Sales Rep',
            age: 32,
            jobRole: 'Sales Representative',
            competence: 6,
            laziness: 5,
            charisma: 9,
            personalityTags: ['outgoing', 'persuasive'],
            experienceTags: ['Sales'],
            personalItems: ['phone'],
            deskItems: ['contracts'],
            spriteSheet: 'assets/characters/character-04.png',
            isPlayer: false
        },
        {
            id: 'npc4',
            name: 'Intern',
            age: 22,
            jobRole: 'Intern',
            competence: 4,
            laziness: 2,
            charisma: 6,
            personalityTags: ['eager', 'nervous'],
            experienceTags: ['Entry Level'],
            personalItems: ['notebook'],
            deskItems: ['coffee'],
            spriteSheet: 'assets/characters/character-05.png',
            isPlayer: false
        }
    ];
    
    window.startGameSimulation(fallbackCharacters);
}

/**
 * Set focus on a specific character
 * @param {string} characterId - ID of character to focus on
 */
function setFocusTarget(characterId) {
    focusTargetId = characterId;
    
    if (uiUpdater && characterManager) {
        // Get the character by ID and update UI
        const character = characterManager.characters.find(char => char.id === characterId);
        if (character) {
            uiUpdater.updateUI(character);
            console.log(`👁️ Focus set on character: ${character.name}`);
        } else {
            console.warn(`⚠️ Character with ID ${characterId} not found`);
        }
    }
}

// UI Visibility Helper Functions - FIXED to use correct HTML element IDs

function showStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.classList.remove('hidden');
        startScreen.style.display = 'flex';
    } else {
        console.warn('UI Warning: Element with ID "start-screen-backdrop" not found.');
    }
}

function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.classList.add('hidden');
        startScreen.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "start-screen-backdrop" not found.');
    }
}

function showCharacterCreator() {
    const creator = document.getElementById('creator-modal-backdrop');
    if (creator) {
        creator.classList.remove('hidden');
        creator.style.display = 'block';
    } else {
        throw new Error('UI Error: Element with ID "creator-modal-backdrop" not found. Cannot open character creator.');
    }
}

function hideCharacterCreator() {
    const creator = document.getElementById('creator-modal-backdrop');
    if (creator) {
        creator.classList.add('hidden');
        creator.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "creator-modal-backdrop" not found.');
    }
}

function showGameView() {
    const gameView = document.getElementById('main-game-ui');
    if (gameView) {
        gameView.classList.remove('hidden');
        gameView.style.display = 'flex';
    } else {
        throw new Error('UI Error: Element with ID "main-game-ui" not found. Cannot show game view.');
    }
}

function hideGameView() {
    const gameView = document.getElementById('main-game-ui');
    if (gameView) {
        gameView.classList.add('hidden');
        gameView.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "main-game-ui" not found.');
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    console.error('❌ ERROR:', message);
    
    // Try to show in UI
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    // Also show as alert as fallback
    alert(`Error: ${message}`);
}

/**
 * Show success message to user
 */
function showSuccessMessage(message) {
    console.log('✅ SUCCESS:', message);
    
    // Try to show in UI
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

// Export for use in other modules
export {
    setFocusTarget,
    showErrorMessage,
    showSuccessMessage
};

console.log('✅ Main.js loaded - Complete version with all functions');
