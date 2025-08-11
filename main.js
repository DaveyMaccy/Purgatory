/**
 * Main.js - Game initialization and coordination
 * PHASE 1: Defensive UI Integration
 * 
 * SAFETY: Character creator functionality is COMPLETELY UNTOUCHED
 * Only added defensive UI protection for game elements
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';

// PHASE 1: Import defensive UI system
import { DefensiveUIManager } from './src/ui/defensive-ui-manager.js';

// Global game state for Stage 3
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null;

// PHASE 1: Defensive UI instance
let defensiveUI = null;

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
        .tabs {
            display: flex;
            border-bottom: 1px solid #d1d5db;
            margin-bottom: 0;
            background-color: #f9fafb;
            padding: 8px 8px 0 8px;
            border-radius: 6px 6px 0 0;
            gap: 2px;
        }
        
        .tab-link {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            color: #374151;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 6px 6px 0 0;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            flex: 1;
            text-align: center;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-bottom: none;
        }
        
        .tab-link:hover {
            background-color: #e5e7eb;
            color: #1f2937;
        }
        
        .tab-link.active {
            background-color: #3b82f6;
            color: white;
            border-color: #3b82f6;
            border-bottom: 1px solid #3b82f6;
        }
        
        .tab-content {
            display: none;
            padding: 16px;
            border: 1px solid #d1d5db;
            border-top: none;
            border-radius: 0 0 6px 6px;
            background-color: white;
            min-height: 200px;
            margin-top: -1px;
        }
        
        .tab-content.active {
            display: block;
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
 * MAIN GAME START FUNCTION - Called from character creator
 * PHASE 1: Added defensive UI initialization
 */
window.startGameSimulation = async function(charactersFromCreator) {
    try {
        console.log('🚀 Starting game simulation with characters:', charactersFromCreator);
        
        // Validate input
        if (!charactersFromCreator || charactersFromCreator.length === 0) {
            throw new Error('No characters provided for simulation');
        }
        
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
        
        // PHASE 1: Initialize defensive UI system
        console.log('🛡️ Initializing defensive UI protection...');
        defensiveUI = new DefensiveUIManager();
        const defensiveInitialized = await defensiveUI.initialize();
        
        if (defensiveInitialized) {
            console.log('✅ Defensive UI protection active');
        } else {
            console.warn('⚠️ Defensive UI failed to initialize - continuing without protection');
        }
        
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
        
        // Hide character creator and show game world
        hideCharacterCreator();
        showGameWorld();
        
        // PHASE 1: Start defensive UI updates alongside regular UI
        if (defensiveUI && focusTargetId) {
            const focusCharacter = characterManager.getCharacter(focusTargetId);
            if (focusCharacter) {
                // Update both regular UI and defensive UI
                uiUpdater.updateUI(focusCharacter);
                defensiveUI.updateUI(focusCharacter, characterManager.characters);
                console.log(`🎯 UI (including defensive) focused on: ${focusCharacter.name}`);
            }
        } else if (focusTargetId) {
            // Fallback to regular UI only
            const focusCharacter = characterManager.getCharacter(focusTargetId);
            if (focusCharacter) {
                uiUpdater.updateUI(focusCharacter);
                console.log(`🎯 Regular UI focused on: ${focusCharacter.name}`);
            }
        }
        
        // Log game status for debugging
        logGameStatus();
        
        console.log('🎉 Game simulation started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game simulation:', error);
        showErrorMessage(`Failed to start game: ${error.message}`);
    }
};

/**
 * Fallback game start with default characters
 */
function startGameWithFallbackCharacters() {
    console.log('🔧 Starting with fallback characters...');
    
    const fallbackCharacters = [
        {
            id: 'fallback_1', name: 'Test Player', isPlayer: true, jobRole: 'Senior Coder',
            spriteSheet: null, portrait: null, apiKey: '',
            physicalAttributes: { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 },
            skills: { competence: 7, laziness: 3, charisma: 6, leadership: 5 },
            personalityTags: ['Analytical', 'Focused'], experienceTags: [],
            needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
            inventory: ['Coffee Mug', 'Laptop'], deskItems: ['Monitor', 'Keyboard'],
            relationships: {}, appearance: { body: 'body_skin_tone_1', hair: 'hair_style_4_blonde', shirt: 'shirt_style_2_red', pants: 'pants_style_1_jeans' }
        },
        {
            id: 'fallback_2', name: 'Test NPC 1', isPlayer: false, jobRole: 'Junior Coder',
            spriteSheet: null, portrait: null, apiKey: '',
            physicalAttributes: { age: 25, height: 170, weight: 65, build: 'Slim', looks: 6 },
            skills: { competence: 5, laziness: 4, charisma: 7, leadership: 3 },
            personalityTags: ['Enthusiastic', 'Collaborative'], experienceTags: [],
            needs: { energy: 7, hunger: 6, social: 9, comfort: 7, stress: 3 },
            inventory: ['Notebook', 'Pen'], deskItems: ['Plant', 'Photo'],
            relationships: {}, appearance: { body: 'body_skin_tone_1', hair: 'hair_style_4_blonde', shirt: 'shirt_style_2_red', pants: 'pants_style_1_jeans' }
        }
    ];
    
    // Add 3 more characters to make 5 total
    for (let i = 2; i < 5; i++) {
        fallbackCharacters.push({
            ...fallbackCharacters[1],
            id: `fallback_${i + 1}`,
            name: `Test NPC ${i}`,
            isPlayer: false
        });
    }
    
    // Start the game with fallback characters
    if (window.startGameSimulation) {
        window.startGameSimulation(fallbackCharacters);
    } else {
        console.error('❌ startGameSimulation not available');
    }
}

/**
 * UI state management functions
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
 * Show error message to user
 */
function showErrorMessage(message) {
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
    
    // PHASE 1: Log defensive UI status
    if (defensiveUI) {
        console.log('🛡️ Defensive UI:', defensiveUI.getStatus());
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
    
    // PHASE 1: Cleanup defensive UI
    if (defensiveUI) {
        defensiveUI.destroy();
        defensiveUI = null;
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
 * PHASE 1: Added defensive UI debug controls
 */
window.debugGame = {
    getGameEngine: () => gameEngine,
    getCharacterManager: () => characterManager,
    getRenderer: () => renderer,
    getUIUpdater: () => uiUpdater,
    getDefensiveUI: () => defensiveUI, // PHASE 1: Access to defensive UI
    logStatus: logGameStatus,
    forceUIUpdate: () => {
        if (gameEngine && focusTargetId) {
            const character = characterManager.getCharacter(focusTargetId);
            if (character && uiUpdater) {
                uiUpdater.updateUI(character);
                
                // PHASE 1: Also update defensive UI
                if (defensiveUI) {
                    defensiveUI.updateUI(character, characterManager.characters);
                }
                
                console.log('🔄 Debug: UI force updated (regular + defensive)');
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
            return characterManager.characters.map(char => ({
                name: char.name,
                needs: char.needs,
                position: char.position,
                mood: char.mood,
                jobRole: char.jobRole
            }));
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
                
                // PHASE 1: Force defensive UI update
                if (defensiveUI && char.id === focusTargetId) {
                    defensiveUI.updateUI(char, characterManager.characters);
                }
            } else {
                console.log('Character or need type not found');
            }
        }
    },
    // PHASE 1: Defensive UI specific debug controls
    disableUIProtection: (reason) => {
        if (defensiveUI) {
            window.debugGame.disableUIProtection(reason);
        } else {
            console.log('Defensive UI not initialized');
        }
    },
    enableUIProtection: () => {
        if (defensiveUI) {
            window.debugGame.enableUIProtection();
        } else {
            console.log('Defensive UI not initialized');
        }
    },
    validateUI: () => {
        if (defensiveUI) {
            return window.debugGame.validateUI();
        } else {
            console.log('Defensive UI not initialized');
            return null;
        }
    },
    getUIStatus: () => {
        if (defensiveUI) {
            return window.debugGame.getUIStatus();
        } else {
            console.log('Defensive UI not initialized');
            return null;
        }
    }
};

console.log('🎮 Main.js loaded with Phase 1 Defensive UI - Debug functions available as window.debugGame');
