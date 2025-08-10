// main.js - Movement System Integration for Stage 4

// Import core systems
import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { MovementSystem } from './src/core/systems/movement-system.js';

// Global game state
let gameEngine = null;
let uiUpdater = null;
let movementSystem = null;
let mapData = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 Office Purgatory - Starting initialization...');
    
    try {
        // Load map data first
        await loadMapData();
        
        // Initialize UI elements
        initializeUIElements();
        
        // Create movement system
        movementSystem = new MovementSystem();
        
        // Check if we should start the game immediately (for testing)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('autostart') === 'true') {
            console.log('🚀 Auto-starting game for testing...');
            startGameWithTestCharacters();
        }
        
        console.log('✅ Initialization complete');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

/**
 * Load map data from JSON file
 */
async function loadMapData() {
    try {
        console.log('🗺️ Loading map data...');
        const response = await fetch('./assets/maps/purgatorygamemap.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load map: ${response.status}`);
        }
        
        mapData = await response.json();
        console.log('✅ Map data loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load map data:', error);
        // Create basic fallback map data
        mapData = {
            width: 16,
            height: 12,
            tilewidth: 48,
            tileheight: 48
        };
        console.log('🔧 Using fallback map data');
    }
}

/**
 * Initialize UI elements and event handlers - STAGE 4 ENHANCED
 */
function initializeUIElements() {
    // Add proper tab styling
    addTabCSS();
    
    // Set up game world click handlers for movement
    setupWorldClickHandlers();
    
    // Set up tab switching in the status panel
    setupStatusPanelTabs();
    
    // Add movement debug controls
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
        console.log('✅ World click handler attached');
    } else {
        console.warn('⚠️ World container not found for click handling');
    }
    
    // Optional: Add right-click for stopping movement
    if (worldContainer) {
        worldContainer.addEventListener('contextmenu', handleWorldRightClick);
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
        
        // Visual feedback
        showMovementTarget(clickX, clickY);
    } else {
        console.warn(`🚫 Cannot move ${playerCharacter.name} to (${clickX}, ${clickY})`);
        showInvalidTargetFeedback(clickX, clickY);
    }
}

/**
 * Handle right-click to stop movement
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
 * Show visual feedback for movement target
 */
function showMovementTarget(x, y) {
    // Create a temporary visual indicator
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
    
    // Remove after animation
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 1000);
}

/**
 * Show visual feedback for invalid movement target
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
    
    // Quick fade out
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 500);
}

/**
 * Add movement debug controls to the UI
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
    
    // Set up debug button handlers
    setupMovementDebugButtons();
}

/**
 * Set up movement debug button handlers
 */
function setupMovementDebugButtons() {
    // Test movement button
    const testButton = document.getElementById('test-movement');
    if (testButton) {
        testButton.onclick = () => testRandomMovement();
    }
    
    // Stop movement button
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
    
    // Debug path button
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
 * Test random movement
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
    
    // Generate random target within world bounds
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
 * Update movement status display
 */
function updateMovementStatus(message) {
    const statusDiv = document.getElementById('movement-status');
    if (statusDiv) {
        statusDiv.textContent = message;
    }
}

/**
 * MAIN GAME START FUNCTION - Enhanced for Stage 4
 * Called from character creator or auto-start
 */
window.startGameSimulation = function(characterTemplates) {
    console.log('🚀 Starting game simulation with movement system...');
    
    try {
        if (!mapData) {
            throw new Error('Map data not loaded');
        }
        
        // Initialize game engine
        gameEngine = new GameEngine();
        gameEngine.initialize(mapData);
        
        // Add movement system to engine
        gameEngine.movementSystem = movementSystem;
        
        // Create characters from templates
        if (characterTemplates && characterTemplates.length > 0) {
            gameEngine.characterManager.createCharacters(characterTemplates);
        } else {
            console.warn('⚠️ No character templates provided');
        }
        
        // Initialize character positions
        gameEngine.characterManager.initializeCharacterPositions(gameEngine.world);
        
        // Initialize characters
        gameEngine.characterManager.initializeCharacters();
        
        // Create UI updater
        uiUpdater = new UIUpdater(gameEngine.characterManager);
        gameEngine.uiUpdater = uiUpdater;
        
        // Start the game engine with movement system
        gameEngine.start();
        
        // Switch to game view
        switchToGameView();
        
        // Update movement status
        updateMovementStatus('Game started - Click to move player character');
        
        console.log('✅ Game simulation started with movement system');
        
    } catch (error) {
        console.error('❌ Failed to start game simulation:', error);
        showErrorMessage('Failed to start game. Please check the console for details.');
    }
};

/**
 * Create test characters for development
 */
function startGameWithTestCharacters() {
    const testCharacters = [
        {
            id: 'player_1',
            name: 'Test Player',
            isPlayer: true,
            personalityTags: ['focused', 'ambitious'],
            jobRole: 'manager',
            spriteSheet: './assets/characters/character_1.png',
            position: { x: 200, y: 200 }
        },
        {
            id: 'npc_1',
            name: 'Test NPC',
            isPlayer: false,
            personalityTags: ['friendly', 'helpful'],
            jobRole: 'developer',
            spriteSheet: './assets/characters/character_2.png',
            position: { x: 300, y: 300 }
        }
    ];
    
    window.startGameSimulation(testCharacters);
}

/**
 * Switch to game view
 */
function switchToGameView() {
    // Hide start screen
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }
    
    // Show game screen
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.style.display = 'flex';
    }
    
    console.log('🎮 Switched to game view');
}

/**
 * Enhanced game engine update loop that includes movement system
 */
function enhanceGameEngineWithMovement() {
    if (!gameEngine || !movementSystem) return;
    
    // Store original update method
    const originalUpdate = gameEngine.update.bind(gameEngine);
    
    // Override update to include movement system
    gameEngine.update = function(deltaTime) {
        // Call original update
        originalUpdate(deltaTime);
        
        // Update movement for all characters
        this.characterManager.characters.forEach(character => {
            movementSystem.updateCharacter(character, this.world, deltaTime);
        });
        
        // Update movement status display for player
        updatePlayerMovementStatus();
    };
    
    console.log('✅ Game engine enhanced with movement system');
}

/**
 * Update player movement status in UI
 */
function updatePlayerMovementStatus() {
    if (!gameEngine || !movementSystem) return;
    
    const player = gameEngine.characterManager.getPlayerCharacter();
    if (!player) return;
    
    const statusDiv = document.getElementById('movement-status');
    if (!statusDiv) return;
    
    if (movementSystem.isMoving(player)) {
        const progress = movementSystem.getMovementProgress(player);
        const percentage = Math.floor(progress * 100);
        statusDiv.textContent = `Moving... ${percentage}% complete`;
    } else {
        statusDiv.textContent = 'Click in the world to move player character';
    }
}

/**
 * Set up status panel tab switching - Enhanced for Stage 4
 */
function setupStatusPanelTabs() {
    console.log('🔧 Setting up status panel tabs...');
    
    // Make openTab function available globally
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
    
    // Set up click handlers for tab buttons
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
 * Add CSS for proper tab styling
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
        
        /* Movement debug panel styling */
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
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.right = '20px';
    errorDiv.style.backgroundColor = '#fee2e2';
    errorDiv.style.color = '#dc2626';
    errorDiv.style.padding = '12px 16px';
    errorDiv.style.borderRadius = '6px';
    errorDiv.style.border = '1px solid #fecaca';
    errorDiv.style.zIndex = '10000';
    errorDiv.style.maxWidth = '400px';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Debug functions for Stage 4 testing
window.testMovement = function() {
    testRandomMovement();
};

window.stopPlayerMovement = function() {
    if (gameEngine && movementSystem) {
        const player = gameEngine.characterManager.getPlayerCharacter();
        if (player) {
            movementSystem.stopCharacter(player);
        }
    }
};

window.debugPlayerPath = function() {
    if (gameEngine && movementSystem) {
        const player = gameEngine.characterManager.getPlayerCharacter();
        if (player) {
            movementSystem.debugPath(player);
        }
    }
};

window.getMovementSystemStatus = function() {
    if (!gameEngine || !movementSystem) {
        return 'Movement system not initialized';
    }
    
    const player = gameEngine.characterManager.getPlayerCharacter();
    if (!player) {
        return 'No player character found';
    }
    
    return {
        isMoving: movementSystem.isMoving(player),
        progress: movementSystem.getMovementProgress(player),
        pathLength: player.path ? player.path.length : 0,
        position: player.position,
        actionState: player.actionState
    };
};

// Initialize movement system integration when game engine starts
document.addEventListener('gameEngineReady', function() {
    enhanceGameEngineWithMovement();
});
