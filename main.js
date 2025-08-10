/**
 * Main.js - Game initialization and coordination
 * FIXED VERSION - Addresses character creator connection and coordinate system issues
 * 
 * FIXES APPLIED:
 * - Proper character creator connection and data flow
 * - Dynamic coordinate system handling for 30×20 map
 * - Enhanced error handling and recovery
 * - Fixed click-to-move with actual world bounds
 * - Better game state management
 * 
 * This file handles:
 * 1. Game system initialization (game engine, renderer, UI, etc.)
 * 2. DOM ready events and button setup
 * 3. Game start sequence coordination
 * 4. UI state management
 * 5. Character creator integration
 * 6. Click-to-move functionality
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { MovementSystem } from './src/core/systems/movement-system.js';
import { loadMapData } from './src/core/world/world.js';

// Global game state
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let movementSystem = null;
let focusTargetId = null;

// Flag to track if character creator is loaded
let characterCreatorLoaded = false;

/**
 * DOM Ready Event - Main initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Game Loading...');
    
    try {
        // First, set loading status
        updateLoadingStatus('Initializing UI elements...');
        
        // Initialize UI elements
        initializeUIElements();
        
        // Setup the New Game button
        setupNewGameButton();
        
        // Load character creator dynamically
        loadCharacterCreator();
        
        console.log('🎮 Game initialization complete - Ready to start!');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

/**
 * Load character creator module dynamically - FIXED load order
 */
async function loadCharacterCreator() {
    try {
        updateLoadingStatus('Loading character creator...');
        
        // Dynamic import with better error handling
        const characterCreatorModule = await import('./character-creator.js');
        
        // Ensure the function exists
        if (characterCreatorModule && characterCreatorModule.initializeCharacterCreator) {
            window.initializeCharacterCreator = characterCreatorModule.initializeCharacterCreator;
            characterCreatorLoaded = true;
            updateLoadingStatus('Ready to start!');
            console.log('✅ Character creator loaded successfully');
        } else {
            throw new Error('Character creator module does not export initializeCharacterCreator function');
        }
        
    } catch (error) {
        console.error('❌ Failed to load character creator:', error);
        characterCreatorLoaded = false;
        updateLoadingStatus('Error loading character creator - please refresh');
        showErrorMessage('Failed to load character creator. Please refresh the page.');
    }
}

/**
 * Enhanced New Game button setup with character creator connection
 */
function setupNewGameButton() {
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            console.log('🎮 New Game button clicked');
            
            // Check if character creator is loaded
            if (!characterCreatorLoaded) {
                console.warn('⚠️ Character creator not loaded yet, trying to load...');
                loadCharacterCreator().then(() => {
                    if (characterCreatorLoaded) {
                        openCharacterCreator();
                    } else {
                        console.error('❌ Failed to load character creator');
                        alert('Character creator failed to load. Please refresh the page.');
                    }
                });
                return;
            }
            
            // Open character creator
            openCharacterCreator();
        });
        
        console.log('✅ New Game button configured');
    } else {
        console.error('❌ New Game button not found');
    }
}

/**
 * Open character creator modal
 */
function openCharacterCreator() {
    try {
        const modal = document.getElementById('character-creator-modal');
        if (modal) {
            modal.style.display = 'flex';
            console.log('✅ Character creator modal opened');
            
            // Initialize character creator if function exists
            if (typeof window.initializeCharacterCreator === 'function') {
                window.initializeCharacterCreator();
                console.log('✅ Character creator initialized');
            } else {
                console.warn('⚠️ Character creator initialization function not found');
            }
        } else {
            console.error('❌ Character creator modal not found');
            alert('Character creator interface not found. Please refresh the page.');
        }
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        alert('Failed to open character creator. Please refresh the page.');
    }
}

/**
 * Initialize UI elements and event handlers
 */
function initializeUIElements() {
    // Add proper tab styling
    addTabCSS();
    
    // Set up game world click handlers
    const worldContainer = document.getElementById('world-canvas-container');
    if (worldContainer) {
        worldContainer.addEventListener('click', handleWorldClick);
        
        // Add right-click to stop movement
        worldContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Prevent browser context menu
            handleRightClick(event);
        });
        
        // Set container to fill available space and maintain aspect ratio
        worldContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f0f0f0;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
        `;
        
        console.log('✅ World container configured for click handling');
    }
    
    console.log('✅ UI elements initialized');
}

/**
 * Add CSS for character tabs
 */
function addTabCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .character-tab {
            padding: 8px 16px;
            margin: 2px;
            border: 1px solid #ddd;
            background: #f8f9fa;
            cursor: pointer;
            border-radius: 4px;
        }
        .character-tab.active {
            background: #007bff;
            color: white;
        }
        .character-tab.player-character {
            border-color: #28a745;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

/**
 * CRITICAL: Start game with characters from character creator
 */
window.startGameWithCharacters = async function(charactersFromCreator) {
    try {
        console.log('🎮 Starting Office Purgatory with characters from creator...');
        
        // Validate characters from creator
        let characters;
        if (charactersFromCreator && Array.isArray(charactersFromCreator) && charactersFromCreator.length > 0) {
            console.log(`✅ Received ${charactersFromCreator.length} characters from creator`);
            characters = charactersFromCreator;
            
            // Log each character for debugging
            characters.forEach((char, i) => {
                console.log(`   ${i + 1}. ${char.name} ${char.isPlayer ? '(PLAYER)' : ''}`);
                console.log(`      Job: ${char.jobRole}`);
                console.log(`      Sprite: ${char.spriteSheet}`);
            });
        } else {
            console.warn('⚠️ Invalid or missing characters from creator, generating defaults');
            characters = generateDefaultCharacters();
        }
        
        // Ensure we have a player character
        let playerCharacter = characters.find(char => char.isPlayer);
        if (!playerCharacter && characters.length > 0) {
            console.log('🤔 No player character found, setting first character as player');
            characters[0].isPlayer = true;
            playerCharacter = characters[0];
        }
        
        // Set focus target for camera and controls
        focusTargetId = playerCharacter?.id || (characters.length > 0 ? characters[0].id : null);
        console.log(`👑 Player character: ${playerCharacter?.name} (ID: ${focusTargetId})`);
        
        // Initialize core game systems
        gameEngine = new GameEngine();
        characterManager = new CharacterManager();
        uiUpdater = new UIUpdater();
        movementSystem = new MovementSystem();
        
        console.log('🎯 Core systems initialized');
        
        // Load map data first
        console.log('🗺️ Loading map data...');
        const mapData = await loadMapData();
        console.log(`📊 Map loaded: ${mapData.width}×${mapData.height} tiles`);
        
        // Initialize world with map data
        console.log('🌍 Initializing world...');
        const { World } = await import('./src/core/world/world.js');
        gameEngine.world = new World(mapData);
        console.log('✅ World initialized with actual map dimensions');
        
        // Generate character positions
        console.log('📍 Positioning characters...');
        characters.forEach(character => {
            if (!character.position || character.position.x === 0 || character.position.y === 0) {
                const randomPos = gameEngine.world.getRandomWalkablePosition();
                character.position = randomPos;
                console.log(`📍 ${character.name} positioned at (${randomPos.x.toFixed(1)}, ${randomPos.y.toFixed(1)})`);
            }
        });
        
        // Add characters to the character manager
        console.log('👤 Adding characters to manager...');
        for (const character of characters) {
            characterManager.addCharacter(character);
        }
        console.log(`✅ ${characters.length} characters added to manager`);
        
        // Initialize renderer
        console.log('🎨 Initializing renderer...');
        const worldContainer = document.getElementById('world-canvas-container');
        if (!worldContainer) {
            throw new Error('World canvas container not found in DOM');
        }
        
        try {
            const { Renderer } = await import('./src/rendering/renderer.js');
            renderer = new Renderer(worldContainer);
            await renderer.initialize();
            gameEngine.setRenderer(renderer);
            console.log('✅ Renderer initialized');
            
            // Render the map
            renderer.renderMap(mapData);
            console.log('🏢 Map rendered');
            
            // Add characters to renderer
            console.log('👥 Adding characters to renderer...');
            for (const character of characters) {
                await renderer.addCharacter(character);
            }
            console.log('✅ Characters added to renderer');
            
        } catch (rendererError) {
            console.error('❌ Renderer failed to initialize:', rendererError);
            // Create fallback placeholder
            createRendererFallback(worldContainer, gameEngine.world.getWorldBounds());
        }
        
        // Initialize UI updater
        console.log('🖥️ Initializing UI...');
        if (uiUpdater && playerCharacter) {
            uiUpdater.setFocusCharacter(playerCharacter);
            uiUpdater.updateAll();
        }
        
        // Start game loop
        console.log('🔄 Starting game loop...');
        gameEngine.setCharacterManager(characterManager);
        gameEngine.setMovementSystem(movementSystem);
        gameEngine.start();
        
        console.log('🎉 Game started successfully!');
        
        // Update loading status
        updateLoadingStatus('Game loaded successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game with characters:', error);
        updateLoadingStatus('Failed to start game', true);
        showErrorMessage('Failed to start game. Please refresh and try again.');
    }
};

/**
 * Create fallback renderer when PixiJS fails
 */
function createRendererFallback(container, worldBounds) {
    console.log('📦 Creating fallback renderer...');
    
    const fallback = document.createElement('div');
    fallback.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #2c3e50;
        font-family: Arial, sans-serif;
        text-align: center;
        border-radius: 8px;
    `;
    
    fallback.innerHTML = `
        <h3>🏢 Office Purgatory</h3>
        <p>World Size: ${worldBounds.width}×${worldBounds.height} pixels</p>
        <p>Click anywhere to test movement</p>
        <p style="font-size: 12px; color: #7f8c8d;">
            Note: Visual renderer failed to load, but game systems are active
        </p>
    `;
    
    container.innerHTML = '';
    container.appendChild(fallback);
}

/**
 * FALLBACK: Generate default characters if creator fails
 */
function generateDefaultCharacters() {
    console.log('🎭 Generating default characters...');
    
    const defaults = [
        {
            id: 'char_0',
            name: 'Alex Thompson',
            isPlayer: true,
            jobRole: 'IT Specialist',
            spriteSheet: './assets/characters/character-01.png',
            spriteIndex: 0,
            gender: 'Male',
            office: 'Corporate',
            position: { x: 200, y: 200 },
            physicalAttributes: { age: 28, height: 175, weight: 70, looks: 7 },
            skillAttributes: { competence: 75, laziness: 30, charisma: 60, leadership: 50 },
            personalityTags: ['Analytical', 'Introverted', 'Detail-oriented'],
            inventory: ['Coffee Mug', 'Smartphone'],
            deskItems: ['Family Photo', 'Plant']
        },
        {
            id: 'char_1',
            name: 'Sarah Chen',
            isPlayer: false,
            jobRole: 'Project Manager',
            spriteSheet: './assets/characters/character-02.png',
            spriteIndex: 1,
            gender: 'Female',
            office: 'Corporate',
            position: { x: 400, y: 300 },
            physicalAttributes: { age: 32, height: 165, weight: 60, looks: 8 },
            skillAttributes: { competence: 85, laziness: 20, charisma: 80, leadership: 90 },
            personalityTags: ['Organized', 'Extroverted', 'Leadership'],
            inventory: ['Notebook', 'Pen'],
            deskItems: ['Calendar', 'Award Trophy']
        }
    ];
    
    // Add required fields for game engine
    return defaults.map(char => ({
        ...char,
        actionState: 'idle',
        mood: 'Neutral',
        facingAngle: 90,
        maxSightRange: 250,
        isBusy: false,
        currentAction: null,
        path: [],
        relationships: {}
    }));
}

/**
 * FIXED: Handle world click with dynamic coordinate conversion
 */
function handleWorldClick(event) {
    if (!gameEngine || !characterManager || !movementSystem) {
        console.warn('🚫 Game systems not ready for movement');
        return;
    }

    // Get click coordinates relative to canvas
    const canvasRect = event.target.getBoundingClientRect ? 
        event.target.getBoundingClientRect() : 
        event.currentTarget.getBoundingClientRect();
    
    const canvasX = event.clientX - canvasRect.left;
    const canvasY = event.clientY - canvasRect.top;
    
    console.log('🖱️ World clicked at canvas coords:', { x: canvasX, y: canvasY });

    // Get the focused character (player character)
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (!focusCharacter) {
        console.warn('🚫 No focus character selected for movement');
        return;
    }

    // FIXED: Get dynamic world bounds from the actual world
    const worldBounds = gameEngine.world.getWorldBounds();
    
    // Get actual canvas dimensions (could be scaled)
    const actualCanvasWidth = canvasRect.width;
    const actualCanvasHeight = canvasRect.height;
    
    // FIXED: Dynamic coordinate conversion based on actual dimensions
    const worldX = (canvasX / actualCanvasWidth) * worldBounds.width;
    const worldY = (canvasY / actualCanvasHeight) * worldBounds.height;
    
    const targetPosition = { 
        x: Math.max(worldBounds.tileSize, Math.min(worldBounds.width - worldBounds.tileSize, worldX)),
        y: Math.max(worldBounds.tileSize, Math.min(worldBounds.height - worldBounds.tileSize, worldY))
    };

    console.log(`🎯 Converted to world coordinates: (${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)})`);
    console.log(`📊 Canvas: ${actualCanvasWidth.toFixed(0)}×${actualCanvasHeight.toFixed(0)}, World: ${worldBounds.width}×${worldBounds.height}`);

    // Move the character to the clicked position
    const success = movementSystem.moveCharacterTo(focusCharacter, targetPosition, gameEngine.world);
    
    if (success) {
        console.log(`✅ ${focusCharacter.name} moving to:`, targetPosition);
    } else {
        console.warn(`🚫 Could not move ${focusCharacter.name} to:`, targetPosition);
    }
}

/**
 * Handle right-click to stop movement
 */
function handleRightClick(event) {
    if (!gameEngine || !characterManager || !movementSystem) return;
    
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (focusCharacter) {
        movementSystem.stopCharacter(focusCharacter);
        console.log(`⏹️ Stopped ${focusCharacter.name} movement`);
    }
}

/**
 * Update loading status message
 */
function updateLoadingStatus(message, isError = false) {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = isError ? '#e74c3c' : '#2c3e50';
    }
    console.log(`📢 Status: ${message}`);
}

/**
 * Enhanced error handling for critical game systems
 */
function showErrorMessage(message, isRecoverable = true) {
    console.error('🚨 Error:', message);
    
    // Update loading status
    updateLoadingStatus(`Error: ${message}`, true);
    
    // Show user-friendly error
    if (isRecoverable) {
        const retry = confirm(`${message}\n\nWould you like to try refreshing the page?`);
        if (retry) {
            window.location.reload();
        }
    } else {
        alert(message);
    }
}

// =============================================================================
// DEBUG AND TESTING FUNCTIONS
// =============================================================================

/**
 * Test coordinate conversion with actual world dimensions
 */
window.testWorldCoordinates = function(canvasX, canvasY) {
    console.log('🧪 Testing coordinate conversion...');
    
    if (!gameEngine || !gameEngine.world) {
        console.error('❌ Game world not available');
        return;
    }
    
    const worldBounds = gameEngine.world.getWorldBounds();
    const canvasElement = document.querySelector('#world-canvas-container canvas') || 
                         document.querySelector('#world-canvas-container');
    
    if (!canvasElement) {
        console.error('❌ Canvas element not found');
        return;
    }
    
    const canvasRect = canvasElement.getBoundingClientRect();
    const actualCanvasWidth = canvasRect.width;
    const actualCanvasHeight = canvasRect.height;
    
    // Convert canvas coordinates to world coordinates
    const worldX = (canvasX / actualCanvasWidth) * worldBounds.width;
    const worldY = (canvasY / actualCanvasHeight) * worldBounds.height;
    
    console.log('📊 Coordinate Conversion Test:');
    console.log(`   Canvas click: (${canvasX}, ${canvasY})`);
    console.log(`   Canvas size: ${actualCanvasWidth} × ${actualCanvasHeight}`);
    console.log(`   World size: ${worldBounds.width} × ${worldBounds.height}`);
    console.log(`   World coords: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);
    
    // Test if coordinates are within bounds
    const isValidX = worldX >= 0 && worldX <= worldBounds.width;
    const isValidY = worldY >= 0 && worldY <= worldBounds.height;
    
    console.log(`   Valid coordinates: ${isValidX && isValidY}`);
    
    return { worldX, worldY, isValid: isValidX && isValidY };
};

/**
 * Test movement to actual world center
 */
window.testMovementToCenter = function() {
    console.log('🧪 Testing movement to world center...');
    
    if (!gameEngine || !characterManager || !movementSystem) {
        console.error('❌ Game systems not available');
        return;
    }
    
    const worldBounds = gameEngine.world.getWorldBounds();
    const centerX = worldBounds.width / 2;
    const centerY = worldBounds.height / 2;
    
    console.log(`🎯 World center: (${centerX}, ${centerY})`);
    console.log(`📏 World size: ${worldBounds.width} × ${worldBounds.height}`);
    
    // Get player character
    const playerCharacter = characterManager.getCharacter(focusTargetId);
    if (!playerCharacter) {
        console.error('❌ No player character found');
        return;
    }
    
    console.log(`👤 Moving ${playerCharacter.name} to center...`);
    
    // Attempt movement
    const success = movementSystem.moveCharacterTo(
        playerCharacter, 
        { x: centerX, y: centerY }, 
        gameEngine.world
    );
    
    if (success) {
        console.log('✅ Movement to center initiated successfully');
    } else {
        console.error('❌ Movement to center failed');
    }
    
    return { centerX, centerY, success };
};

/**
 * Comprehensive sprite loading test
 */
window.testAllSprites = function() {
    console.log('🧪 Testing all 20 character sprites...');
    
    const results = [];
    let loadedCount = 0;
    let failedCount = 0;
    
    return new Promise((resolve) => {
        for (let i = 1; i <= 20; i++) {
            const paddedNumber = i.toString().padStart(2, '0');
            const spritePath = `./assets/characters/character-${paddedNumber}.png`;
            
            const img = new Image();
            
            img.onload = function() {
                loadedCount++;
                results.push({ 
                    index: i, 
                    path: spritePath, 
                    status: 'loaded', 
                    dimensions: `${this.width}×${this.height}` 
                });
                console.log(`✅ Sprite ${i}: ${spritePath} (${this.width}×${this.height})`);
                
                if (loadedCount + failedCount === 20) {
                    console.log('📊 Sprite Loading Results:');
                    console.log(`   ✅ Loaded: ${loadedCount}/20`);
                    console.log(`   ❌ Failed: ${failedCount}/20`);
                    console.table(results);
                    resolve(results);
                }
            };
            
            img.onerror = function() {
                failedCount++;
                results.push({ 
                    index: i, 
                    path: spritePath, 
                    status: 'failed', 
                    dimensions: 'N/A' 
                });
                console.error(`❌ Sprite ${i}: ${spritePath}`);
                
                if (loadedCount + failedCount === 20) {
                    console.log('📊 Sprite Loading Results:');
                    console.log(`   ✅ Loaded: ${loadedCount}/20`);
                    console.log(`   ❌ Failed: ${failedCount}/20`);
                    console.table(results);
                    resolve(results);
                }
            };
            
            img.src = spritePath;
        }
    });
};

/**
 * Test character creator connection
 */
window.testCharacterCreatorConnection = function() {
    console.log('🧪 Testing character creator connection...');
    
    const tests = {
        creatorLoaded: characterCreatorLoaded,
        initFunctionExists: typeof window.initializeCharacterCreator === 'function',
        exportFunctionExists: typeof window.getCharactersFromCreator === 'function',
        startGameFunctionExists: typeof window.startGameWithCharacters === 'function',
        modalExists: !!document.getElementById('character-creator-modal'),
        newGameButtonExists: !!document.getElementById('new-game-btn')
    };
    
    console.log('📊 Character Creator Connection Test Results:');
    console.table(tests);
    
    const allPassed = Object.values(tests).every(test => test === true);
    
    if (allPassed) {
        console.log('✅ All character creator connection tests passed');
    } else {
        console.log('❌ Some character creator connection tests failed');
        
        // Specific recommendations
        if (!tests.creatorLoaded) {
            console.log('🔧 Fix: Ensure character-creator.js loads properly');
        }
        if (!tests.initFunctionExists) {
            console.log('🔧 Fix: Add initializeCharacterCreator function to character-creator.js');
        }
        if (!tests.exportFunctionExists) {
            console.log('🔧 Fix: Add getCharactersFromCreator function to character-creator.js');
        }
        if (!tests.startGameFunctionExists) {
            console.log('🔧 Fix: Add startGameWithCharacters function to main.js');
        }
        if (!tests.modalExists) {
            console.log('🔧 Fix: Ensure character-creator-modal exists in index.html');
        }
        if (!tests.newGameButtonExists) {
            console.log('🔧 Fix: Ensure new-game-btn exists in index.html');
        }
    }
    
    return tests;
};

/**
 * System health check
 */
window.performHealthCheck = function() {
    console.log('🏥 Performing system health check...');
    
    const health = {
        // Core Systems
        gameEngine: !!gameEngine,
        characterManager: !!characterManager,
        renderer: !!renderer,
        movementSystem: !!movementSystem,
        uiUpdater: !!uiUpdater,
        
        // Character Creator
        characterCreatorLoaded: characterCreatorLoaded,
        charactersExist: !!(window.getCharactersFromCreator && window.getCharactersFromCreator()),
        
        // World State
        worldExists: !!(gameEngine && gameEngine.world),
        mapDataLoaded: !!(gameEngine && gameEngine.world && gameEngine.world.getWorldBounds),
        
        // Rendering
        canvasExists: !!document.querySelector('#world-canvas-container canvas') || 
                     !!document.querySelector('#world-canvas-container div'),
        pixiAppExists: !!(renderer && renderer.app),
        
        // UI
        gameViewExists: !!document.getElementById('game-view'),
        statusPanelExists: !!document.getElementById('status-panel'),
        
        // Movement
        focusTargetSet: !!focusTargetId,
        movementSystemActive: !!(movementSystem && gameEngine && gameEngine.world)
    };
    
    console.log('📊 System Health Check Results:');
    console.table(health);
    
    const healthyCount = Object.values(health).filter(h => h === true).length;
    const totalCount = Object.keys(health).length;
    const healthPercentage = (healthyCount / totalCount * 100).toFixed(1);
    
    console.log(`🏥 Overall Health: ${healthPercentage}% (${healthyCount}/${totalCount} systems healthy)`);
    
    // Recommendations for failed systems
    Object.entries(health).forEach(([system, isHealthy]) => {
        if (!isHealthy) {
            console.log(`🔧 ${system}: Needs attention`);
        }
    });
    
    return health;
};

/**
 * Debug world bounds and movement
 */
window.debugWorldMovement = function(worldX, worldY) {
    console.log('🧪 Testing world movement...');
    
    if (!gameEngine || !characterManager || !movementSystem) {
        console.error('❌ Game systems not available');
        return;
    }
    
    const worldBounds = gameEngine.world.getWorldBounds();
    const playerCharacter = characterManager.getCharacter(focusTargetId);
    
    if (!playerCharacter) {
        console.error('❌ No player character found');
        return;
    }
    
    console.log('📊 Movement Debug Info:');
    console.log(`   Current position: (${playerCharacter.position.x.toFixed(1)}, ${playerCharacter.position.y.toFixed(1)})`);
    console.log(`   Target position: (${worldX}, ${worldY})`);
    console.log(`   World bounds: ${worldBounds.width} × ${worldBounds.height}`);
    console.log(`   Valid range X: ${worldBounds.tileSize} - ${worldBounds.width - worldBounds.tileSize}`);
    console.log(`   Valid range Y: ${worldBounds.tileSize} - ${worldBounds.height - worldBounds.tileSize}`);
    
    // Test movement
    const success = movementSystem.moveCharacterTo(
        playerCharacter, 
        { x: worldX, y: worldY }, 
        gameEngine.world
    );
    
    console.log(`   Movement result: ${success ? 'SUCCESS' : 'FAILED'}`);
    
    return { 
        success, 
        currentPos: playerCharacter.position, 
        targetPos: { x: worldX, y: worldY },
        worldBounds 
    };
};

/**
 * Quick test function to verify all fixes
 */
window.runAllTests = async function() {
    console.log('🧪 Running comprehensive test suite...');
    
    try {
        // Test 1: Character Creator Connection
        console.log('\n=== Test 1: Character Creator Connection ===');
        const connectionTest = window.testCharacterCreatorConnection();
        
        // Test 2: Sprite Loading
        console.log('\n=== Test 2: Sprite Loading ===');
        const spriteTest = await window.testAllSprites();
        
        // Test 3: Coordinate System
        console.log('\n=== Test 3: Coordinate System ===');
        const coordTest = window.testWorldCoordinates(400, 300);
        
        // Test 4: Movement System
        console.log('\n=== Test 4: Movement System ===');
        const movementTest = window.testMovementToCenter();
        
        // Test 5: System Health
        console.log('\n=== Test 5: System Health ===');
        const healthTest = window.performHealthCheck();
        
        // Summary
        console.log('\n=== TEST SUMMARY ===');
        const spriteSuccessRate = spriteTest.filter(s => s.status === 'loaded').length / spriteTest.length;
        const connectionSuccessRate = Object.values(connectionTest).filter(t => t === true).length / Object.keys(connectionTest).length;
        const healthSuccessRate = Object.values(healthTest).filter(h => h === true).length / Object.keys(healthTest).length;
        
        console.log(`📊 Sprite Loading: ${(spriteSuccessRate * 100).toFixed(1)}%`);
        console.log(`📊 Creator Connection: ${(connectionSuccessRate * 100).toFixed(1)}%`);
        console.log(`📊 Coordinate System: ${coordTest?.isValid ? '100%' : '0%'}`);
        console.log(`📊 Movement System: ${movementTest?.success ? '100%' : '0%'}`);
        console.log(`📊 System Health: ${(healthSuccessRate * 100).toFixed(1)}%`);
        
        const overallSuccess = (spriteSuccessRate + connectionSuccessRate + healthSuccessRate + 
                               (coordTest?.isValid ? 1 : 0) + (movementTest?.success ? 1 : 0)) / 5;
        
        console.log(`\n🎯 OVERALL SUCCESS RATE: ${(overallSuccess * 100).toFixed(1)}%`);
        
        if (overallSuccess >= 0.8) {
            console.log('✅ Most systems are working correctly!');
        } else {
            console.log('⚠️ Some systems need attention. Check individual test results above.');
        }
        
        return {
            spriteTest,
            connectionTest,
            coordTest,
            movementTest,
            healthTest,
            overallSuccess: overallSuccess * 100
        };
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        return null;
    }
};

// Export the health check function for global access
window.checkSystemHealth = window.performHealthCheck;

console.log('🎮 Main.js loaded and ready');
