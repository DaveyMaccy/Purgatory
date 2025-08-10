// main.js - COMPLETE FIXED VERSION
// Preserves ALL original functionality + adds Stage 4 movement system

/**
 * Main.js - Game initialization and coordination
 * 
 * This file handles:
 * 1. Game system initialization (game engine, renderer, UI, etc.)
 * 2. DOM ready events and button setup
 * 3. Game start sequence coordination
 * 4. UI state management
 * 5. STAGE 4: Movement system integration
 * 
 * Character creator functionality is in separate character-creator.js
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
// FIXED: Handle loadMapData import with fallback
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';
// STAGE 4: Import movement system
import { MovementSystem } from './src/core/systems/movement-system.js';

// Global game state for Stage 3 + Stage 4
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null;
// STAGE 4: Movement system
let movementSystem = null;

/**
 * DOM Ready Event - Main initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Game Loading...');
    
    try {
        // Initialize UI elements
        initializeUIElements();
        
        // STAGE 4: Initialize movement system
        movementSystem = new MovementSystem();
        console.log('🚶 Movement system initialized');
        
        // Setup the New Game button
        setupNewGameButton();
        
        console.log('🎮 Game initialization complete - Ready to start!');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

/**
 * Initialize UI elements and event handlers - ENHANCED FOR STAGE 4
 */
function initializeUIElements() {
    // FIXED: Add proper tab styling
    addTabCSS();
    
    // STAGE 4: Set up game world click handlers for movement
    setupWorldClickHandlers();
    
    // Set up tab switching in the status panel
    setupStatusPanelTabs();
    
    // STAGE 4: Add movement debug controls
    addMovementDebugControls();
    
    console.log('✅ UI elements initialized with movement support');
}

/**
 * STAGE 4: Set up world click handlers for character movement
 */
function setupWorldClickHandlers() {
    console.log('🖱️ Setting up world click handlers...');
    
    // Main world container click handler
    const worldContainer = document.getElementById('world-canvas-container');
    if (worldContainer) {
        worldContainer.addEventListener('click', handleWorldClick);
        worldContainer.style.cursor = 'crosshair'; // Visual indicator
        
        // Add right-click for stopping movement
        worldContainer.addEventListener('contextmenu', handleWorldRightClick);
        
        console.log('✅ World click handler attached');
    } else {
        console.warn('⚠️ World container not found for click handling');
    }
}

/**
 * STAGE 4: Handle clicks on the game world for character movement
 */
function handleWorldClick(event) {
    if (!gameEngine || !movementSystem) {
        console.log('🖱️ World clicked but game not ready');
        return;
    }
    
    // Get click position relative to the world container
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    console.log(`🖱️ World clicked at: (${clickX}, ${clickY})`);
    
    // Get the player character
    const playerCharacter = gameEngine.characterManager.getPlayerCharacter();
    if (!playerCharacter) {
        console.warn('⚠️ No player character found for movement');
        return;
    }
    
    // Create target position
    const targetPosition = { x: clickX, y: clickY };
    
    // Attempt to move player character to clicked position
    const success = movementSystem.moveCharacterTo(playerCharacter, targetPosition, gameEngine.world);
    
    if (success) {
        console.log(`🚶 Moving ${playerCharacter.name} to (${clickX}, ${clickY})`);
        showMovementTarget(clickX, clickY);
    } else {
        console.warn(`🚫 Cannot move ${playerCharacter.name} to (${clickX}, ${clickY})`);
        showInvalidTargetFeedback(clickX, clickY);
    }
}

/**
 * STAGE 4: Handle right-click to stop movement
 */
function handleWorldRightClick(event) {
    event.preventDefault(); // Prevent context menu
    
    if (!gameEngine || !movementSystem) return;
    
    const playerCharacter = gameEngine.characterManager.getPlayerCharacter();
    if (playerCharacter) {
        movementSystem.stopCharacter(playerCharacter);
        console.log('⏹️ Player movement stopped');
    }
}

/**
 * STAGE 4: Show visual feedback for movement target
 */
function showMovementTarget(x, y) {
    const worldContainer = document.getElementById('world-canvas-container');
    if (!worldContainer) return;
    
    const indicator = document.createElement('div');
    indicator.style.position = 'absolute';
    indicator.style.left = (x - 5) + 'px';
    indicator.style.top = (y - 5) + 'px';
    indicator.style.width = '10px';
    indicator.style.height = '10px';
    indicator.style.backgroundColor = '#00ff00';
    indicator.style.border = '2px solid #ffffff';
    indicator.style.borderRadius = '50%';
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '1000';
    
    worldContainer.appendChild(indicator);
    
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 1000);
}

/**
 * STAGE 4: Show visual feedback for invalid movement target
 */
function showInvalidTargetFeedback(x, y) {
    const worldContainer = document.getElementById('world-canvas-container');
    if (!worldContainer) return;
    
    const indicator = document.createElement('div');
    indicator.style.position = 'absolute';
    indicator.style.left = (x - 8) + 'px';
    indicator.style.top = (y - 8) + 'px';
    indicator.style.width = '16px';
    indicator.style.height = '16px';
    indicator.style.backgroundColor = '#ff0000';
    indicator.style.border = '2px solid #ffffff';
    indicator.style.borderRadius = '50%';
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '1000';
    indicator.style.opacity = '0.8';
    
    worldContainer.appendChild(indicator);
    
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 500);
}

/**
 * STAGE 4: Add movement debug controls to the UI
 */
function addMovementDebugControls() {
    const rightPanel = document.querySelector('.status-panel');
    if (!rightPanel) return;
    
    const debugDiv = document.createElement('div');
    debugDiv.id = 'movement-debug-panel';
    debugDiv.className = 'widget mt-4';
    debugDiv.innerHTML = `
        <h3 class="font-bold mb-2 text-sm">Movement Debug (Stage 4)</h3>
        <div class="flex flex-wrap gap-2 mb-2">
            <button id="test-movement" class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                Test Movement
            </button>
            <button id="stop-movement" class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                Stop Movement
            </button>
            <button id="debug-path" class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                Debug Path
            </button>
        </div>
        <div id="movement-status" class="text-xs text-gray-600">
            Click in the world to move player character
        </div>
    `;
    
    rightPanel.appendChild(debugDiv);
    setupMovementDebugButtons();
}

/**
 * STAGE 4: Set up movement debug button handlers
 */
function setupMovementDebugButtons() {
    const testButton = document.getElementById('test-movement');
    if (testButton) {
        testButton.onclick = () => testRandomMovement();
    }
    
    const stopButton = document.getElementById('stop-movement');
    if (stopButton) {
        stopButton.onclick = () => {
            if (gameEngine && movementSystem) {
                const player = gameEngine.characterManager.getPlayerCharacter();
                if (player) {
                    movementSystem.stopCharacter(player);
                    updateMovementStatus('Movement stopped');
                }
            }
        };
    }
    
    const debugButton = document.getElementById('debug-path');
    if (debugButton) {
        debugButton.onclick = () => {
            if (gameEngine) {
                const player = gameEngine.characterManager.getPlayerCharacter();
                if (player && movementSystem) {
                    movementSystem.debugPath(player);
                }
            }
        };
    }
}

/**
 * STAGE 4: Test random movement
 */
function testRandomMovement() {
    if (!gameEngine || !movementSystem) {
        console.warn('⚠️ Game not ready for movement test');
        return;
    }
    
    const player = gameEngine.characterManager.getPlayerCharacter();
    if (!player) {
        console.warn('⚠️ No player character for movement test');
        return;
    }
    
    const world = gameEngine.world;
    const targetX = Math.random() * world.worldWidth;
    const targetY = Math.random() * world.worldHeight;
    
    const success = movementSystem.moveCharacterTo(player, {x: targetX, y: targetY}, world);
    
    if (success) {
        updateMovementStatus(`Moving to (${Math.floor(targetX)}, ${Math.floor(targetY)})`);
        showMovementTarget(targetX, targetY);
    } else {
        updateMovementStatus('Failed to find path to random target');
    }
}

/**
 * STAGE 4: Update movement status display
 */
function updateMovementStatus(message) {
    const statusDiv = document.getElementById('movement-status');
    if (statusDiv) {
        statusDiv.textContent = message;
    }
}

/**
 * FIXED: Add CSS for proper tab styling with even alignment + movement debug styling
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
        }
        
        .tab-content.active {
            display: block;
        }
        
        .widget {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
        }
        
        /* STAGE 4: Movement debug panel styling */
        #movement-debug-panel {
            border-left: 4px solid #10b981;
        }
        
        #movement-status {
            background-color: #f0f9ff;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #bae6fd;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Tab CSS injected with proper alignment + movement styling');
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
 * Fallback function if character creator fails
 */
function startGameWithFallbackCharacters() {
    console.log('🔧 Starting game with fallback characters...');
    
    const fallbackCharacters = [
        {
            id: 'player_1',
            name: 'Test Player',
            isPlayer: true,
            personalityTags: ['focused', 'ambitious'],
            jobRole: 'manager',
            spriteSheet: './assets/characters/character_1.png',
            position: { x: 200, y: 200 },
            path: [], // STAGE 4: Required for movement
            appearance: { body: 'body_skin_tone_1', hair: 'hair_style_4_blonde', shirt: 'shirt_style_2_red', pants: 'pants_style_1_jeans' }
        },
        {
            id: 'npc_1',
            name: 'Test NPC',
            isPlayer: false,
            personalityTags: ['friendly', 'helpful'],
            jobRole: 'developer',
            spriteSheet: './assets/characters/character_2.png',
            position: { x: 300, y: 300 },
            path: [], // STAGE 4: Required for movement
            appearance: { body: 'body_skin_tone_1', hair: 'hair_style_4_blonde', shirt: 'shirt_style_2_red', pants: 'pants_style_1_jeans' }
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
 * MAIN GAME START FUNCTION - RESTORED ORIGINAL COMPLEXITY + STAGE 4 ENHANCEMENTS
 * Called from character creator
 * This is the primary entry point for starting the game simulation
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
        
        // STAGE 4: Add movement system to engine
        gameEngine.movementSystem = movementSystem;
        console.log('🚶 Movement system connected to game engine');
        
        // RESTORED: Initialize renderer
        console.log('🎨 Initializing renderer...');
        const worldContainer = document.getElementById('world-canvas-container');
        if (!worldContainer) {
            throw new Error('World canvas container not found in DOM');
        }
        
        renderer = new Renderer(worldContainer);
        await renderer.initialize();
        gameEngine.setRenderer(renderer);
        console.log('✅ Renderer initialized');
        
        // RESTORED: Render the map
        renderer.renderMap(mapData);
        console.log('🏢 Map rendered');
        
        // Start the game engine (this creates the world and nav grid)
        gameEngine.initialize(mapData);
        console.log('✅ Game engine initialized');
        
        // RESTORED: Initialize character positions AFTER world is created
        if (gameEngine.world) {
            characterManager.initializeCharacterPositions(gameEngine.world);
            console.log('📍 Character positions initialized');
            
            // RESTORED: Add characters to renderer
            console.log('👤 Adding characters to renderer...');
            for (const character of characterManager.characters) {
                await renderer.addCharacter(character);
            }
            console.log('✅ Characters added to renderer');
        } else {
            throw new Error('Game world was not created properly');
        }
        
        // RESTORED: Hide character creator and show game world
        hideCharacterCreator();
        showGameWorld();
        
        // RESTORED: Start UI updates with initial focus character
        if (focusTargetId) {
            const focusCharacter = characterManager.getCharacter(focusTargetId);
            if (focusCharacter) {
                uiUpdater.updateUI(focusCharacter);
                console.log(`🎯 UI focused on: ${focusCharacter.name}`);
            }
        }
        
        // STAGE 4: Update movement status
        updateMovementStatus('Game started - Click to move player character');
        
        // RESTORED: Log game status for debugging
        logGameStatus();
        
        console.log('🎉 Game simulation started successfully with movement system!');
        
    } catch (error) {
        console.error('❌ Failed to start game simulation:', error);
        showErrorMessage(`Failed to start simulation: ${error.message}`);
    }
};

/**
 * RESTORED: UI state management functions
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
 * RESTORED: Log comprehensive game status for debugging
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
    
    // STAGE 4: Movement system status
    if (movementSystem) {
        console.log('🚶 Movement System: Active and ready');
        const player = characterManager?.getPlayerCharacter();
        if (player) {
            console.log('🎯 Player Movement:', {
                hasPath: player.path && player.path.length > 0,
                pathLength: player.path ? player.path.length : 0,
                position: player.position,
                canMove: !player.isBusy
            });
        }
    }
}

/**
 * RESTORED: Clean up game resources (for page unload or restart)
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
    movementSystem = null;
    
    console.log('✅ Game cleanup complete');
}

/**
 * RESTORED: Handle page unload cleanup
 */
window.addEventListener('beforeunload', cleanupGame);

/**
 * RESTORED + ENHANCED: Debug functions for console testing
 */
window.debugGame = {
    getGameEngine: () => gameEngine,
    getCharacterManager: () => characterManager,
    getRenderer: () => renderer,
    getUIUpdater: () => uiUpdater,
    // STAGE 4: Movement debug functions
    getMovementSystem: () => movementSystem,
    testMovement: testRandomMovement,
    stopPlayerMovement: () => {
        if (gameEngine && movementSystem) {
            const player = gameEngine.characterManager.getPlayerCharacter();
            if (player) movementSystem.stopCharacter(player);
        }
    },
    debugPlayerPath: () => {
        if (gameEngine && movementSystem) {
            const player = gameEngine.characterManager.getPlayerCharacter();
            if (player) movementSystem.debugPath(player);
        }
    },
    getMovementStatus: () => {
        if (!gameEngine || !movementSystem) return 'Not initialized';
        const player = gameEngine.characterManager.getPlayerCharacter();
        if (!player) return 'No player character';
        return {
            isMoving: movementSystem.isMoving(player),
            progress: movementSystem.getMovementProgress(player),
            pathLength: player.path ? player.path.length : 0,
            position: player.position,
            actionState: player.actionState
        };
    },
    // RESTORED: Original debug functions
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
    getCharacters: () => {
        if (characterManager) {
            return characterManager.characters.map(char => ({
                name: char.name,
                needs: char.needs,
                position: char.position,
                mood: char.mood,
                jobRole: char.jobRole,
                // STAGE 4: Movement info
                isMoving: char.path && char.path.length > 0,
                pathLength: char.path ? char.path.length : 0
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
            } else {
                console.log('Character or need type not found');
            }
        }
    },
    // STAGE 4: Movement testing functions
    testPathfinding: (startX, startY, endX, endY) => {
        if (!gameEngine || !gameEngine.world) {
            console.log('Game not ready for pathfinding test');
            return;
        }
        return gameEngine.world.testRandomPathfinding();
    },
    showNavGrid: () => {
        if (gameEngine && gameEngine.world) {
            gameEngine.world.debugNavGrid();
        }
    }
};

console.log('🎮 Main.js loaded - Debug functions available as window.debugGame');
console.log('🚶 Stage 4 Movement System ready - Click in world to move player character');
