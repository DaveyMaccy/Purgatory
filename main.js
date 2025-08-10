/**
 * Main.js - Game initialization and coordination
 * 
 * This file handles:
 * 1. Game system initialization (game engine, renderer, UI, etc.)
 * 2. DOM ready events and button setup
 * 3. Game start sequence coordination
 * 4. UI state management
 * 5. STAGE 4: Movement system integration and click handling
 * 
 * Character creator functionality is in separate character-creator.js
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { MovementSystem } from './src/core/systems/movement-system.js';
import { loadMapData } from './src/core/world/world.js';

// Global game state for Stage 3 + Stage 4
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let movementSystem = null; // STAGE 4 NEW
let focusTargetId = null;

// Canvas dimensions (16:9 aspect ratio)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

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
        
        // Setup the New Game button - use correct ID from HTML
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
 * Load character creator module dynamically to avoid import issues
 */
async function loadCharacterCreator() {
    try {
        updateLoadingStatus('Loading character creator...');
        const { initializeCharacterCreator } = await import('./character-creator.js');
        window.initializeCharacterCreator = initializeCharacterCreator;
        characterCreatorLoaded = true;
        updateLoadingStatus('Ready to start!');
        console.log('✅ Character creator loaded');
    } catch (error) {
        console.error('❌ Failed to load character creator:', error);
        updateLoadingStatus('Error loading character creator');
    }
}

/**
 * Update loading status message
 */
function updateLoadingStatus(message) {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

/**
 * Initialize UI elements and event handlers
 */
function initializeUIElements() {
    // FIXED: Add proper tab styling
    addTabCSS();
    
    // Set up game world click handlers (STAGE 4 UPDATE)
    const worldContainer = document.getElementById('world-canvas-container');
    if (worldContainer) {
        worldContainer.addEventListener('click', handleWorldClick);
        
        // Add right-click to stop movement
        worldContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Prevent browser context menu
            handleRightClick(event);
        });
        
        // Set container to fill available space while maintaining 16:9 aspect ratio
        worldContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f0f0f0;
            border-radius: 8px;
            overflow: hidden;
        `;
    }
    
    // Set up tab switching in the status panel
    setupStatusPanelTabs();
    
    console.log('✅ UI elements initialized');
}

/**
 * STAGE 4 COMPLETE: Handle clicks on the game world for character movement
 * FIXED: Proper coordinate transformation between canvas and world coordinates
 */
function handleWorldClick(event) {
    if (!gameEngine || !gameEngine.world || !movementSystem || !characterManager) {
        console.warn('🚫 Game systems not ready for movement');
        return;
    }

    // Get click coordinates relative to the canvas
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Find the actual canvas element within the container
    const canvas = event.currentTarget.querySelector('canvas') || event.currentTarget;
    const canvasRect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : rect;
    
    const canvasX = event.clientX - canvasRect.left;
    const canvasY = event.clientY - canvasRect.top;
    
    console.log('🖱️ World clicked at canvas coords:', { x: canvasX, y: canvasY });

    // Get the focused character (player character)
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (!focusCharacter) {
        console.warn('🚫 No focus character selected for movement');
        return;
    }

    // Get world bounds from the game engine
    const worldBounds = gameEngine.world.getWorldBounds();
    
    // Get actual canvas dimensions (could be scaled)
    const actualCanvasWidth = canvasRect.width;
    const actualCanvasHeight = canvasRect.height;
    
    // Convert canvas coordinates to world coordinates
    // Scale canvas coordinates to world coordinate space
    const worldX = (canvasX / actualCanvasWidth) * worldBounds.width;
    const worldY = (canvasY / actualCanvasHeight) * worldBounds.height;
    
    const targetPosition = { 
        x: Math.max(worldBounds.tileSize, Math.min(worldBounds.width - worldBounds.tileSize, worldX)),
        y: Math.max(worldBounds.tileSize, Math.min(worldBounds.height - worldBounds.tileSize, worldY))
    };

    console.log(`🎯 Converted to world coordinates: (${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)})`);
    console.log(`📊 Canvas: ${actualCanvasWidth}x${actualCanvasHeight}, World: ${worldBounds.width}x${worldBounds.height}`);

    // Move the character to the clicked position
    const success = movementSystem.moveCharacterTo(focusCharacter, targetPosition, gameEngine.world);
    
    if (success) {
        console.log(`✅ ${focusCharacter.name} moving to:`, targetPosition);
    } else {
        console.warn(`🚫 Could not move ${focusCharacter.name} to:`, targetPosition);
        
        // Try nearby positions with proper world coordinate scaling
        const tileSize = worldBounds.tileSize;
        const nearbyPositions = [
            { x: targetPosition.x + tileSize, y: targetPosition.y },
            { x: targetPosition.x - tileSize, y: targetPosition.y },
            { x: targetPosition.x, y: targetPosition.y + tileSize },
            { x: targetPosition.x, y: targetPosition.y - tileSize },
            { x: targetPosition.x + tileSize/2, y: targetPosition.y + tileSize/2 },
            { x: targetPosition.x - tileSize/2, y: targetPosition.y - tileSize/2 }
        ];
        
        for (const nearbyPos of nearbyPositions) {
            // Ensure nearby position is within world bounds
            if (nearbyPos.x >= tileSize && nearbyPos.x <= worldBounds.width - tileSize && 
                nearbyPos.y >= tileSize && nearbyPos.y <= worldBounds.height - tileSize) {
                
                const nearbySuccess = movementSystem.moveCharacterTo(focusCharacter, nearbyPos, gameEngine.world);
                if (nearbySuccess) {
                    console.log(`✅ Found alternative position for ${focusCharacter.name}:`, nearbyPos);
                    return;
                }
            }
        }
        
        console.log('🚫 No valid nearby position found for movement');
    }
}

/**
 * Handle right-clicks on the game world to stop movement
 */
function handleRightClick(event) {
    if (!gameEngine || !movementSystem || !characterManager) {
        console.warn('🚫 Game systems not ready');
        return;
    }

    // Get the focused character (player character)
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (!focusCharacter) {
        console.warn('🚫 No focus character to stop');
        return;
    }

    // Stop the character's movement
    movementSystem.stopCharacter(focusCharacter);
    console.log(`🛑 Stopped movement for ${focusCharacter.name}`);
}

/**
 * Add proper tab styling for status panels
 */
function addTabCSS() {
    if (document.getElementById('tab-styling')) return;
    
    const style = document.createElement('style');
    style.id = 'tab-styling';
    style.textContent = `
        .tab-button {
            padding: 8px 16px;
            background: #e0e0e0;
            border: 1px solid #ccc;
            border-bottom: none;
            cursor: pointer;
            border-radius: 4px 4px 0 0;
            margin-right: 2px;
            transition: background-color 0.2s;
        }
        .tab-button:hover {
            background: #d0d0d0;
        }
        .tab-button.active {
            background: white;
            font-weight: bold;
        }
        .tab-content {
            display: none;
            padding: 16px;
            border: 1px solid #ccc;
            border-radius: 0 4px 4px 4px;
            background: white;
            min-height: 200px;
        }
        .tab-content.active {
            display: block;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setup status panel tabs functionality
 */
function setupStatusPanelTabs() {
    console.log('🔧 Setting up status panel tabs...');
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length === 0) {
        console.warn('⚠️ No tab buttons found in DOM');
        return;
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // Activate first tab by default
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
        const firstTabId = tabButtons[0].getAttribute('data-tab');
        const firstTabContent = document.getElementById(firstTabId);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        }
    }
    
    console.log('✅ Status panel tabs configured');
}

/**
 * Setup New Game button
 */
function setupNewGameButton() {
    // FIXED: Try multiple possible button IDs
    const newGameButton = document.getElementById('new-game-btn') || 
                         document.getElementById('newGameBtn') || 
                         document.querySelector('[data-action="new-game"]') ||
                         document.querySelector('button[onclick*="newGame"]');
    
    if (newGameButton) {
        // Clear any existing handlers and set new one
        newGameButton.onclick = null;
        newGameButton.addEventListener('click', handleNewGameClick);
        
        // Enable the button
        newGameButton.disabled = false;
        newGameButton.style.opacity = '1';
        newGameButton.style.cursor = 'pointer';
        
        console.log('✅ New Game button enabled and connected');
    } else {
        console.warn('⚠️ New Game button not found in DOM');
    }
}

/**
 * Handle New Game button click
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    
    if (!characterCreatorLoaded) {
        console.error('❌ Character creator not loaded');
        showErrorMessage('Character creator not ready. Please refresh the page.');
        return;
    }
    
    try {
        // Hide start screen
        hideStartScreen();
        
        // Show character creator
        showCharacterCreator();
        
        console.log('✅ Character creator opened');
        
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        showErrorMessage('Failed to open character creator. Please refresh the page.');
    }
}

/**
 * Hide the start screen
 */
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log('🏠 Start screen hidden');
    }
}

/**
 * Show the character creator
 */
function showCharacterCreator() {
    const characterCreator = document.getElementById('character-creator');
    if (characterCreator) {
        characterCreator.style.display = 'block';
        console.log('📝 Character creator shown');
        
        // Initialize character creator if function exists
        if (typeof window.initializeCharacterCreator === 'function') {
            window.initializeCharacterCreator();
        }
    } else {
        throw new Error('Character creator element not found');
    }
}

/**
 * Hide the character creator
 */
function hideCharacterCreator() {
    const characterCreator = document.getElementById('character-creator');
    if (characterCreator) {
        characterCreator.style.display = 'none';
        console.log('📝 Character creator hidden');
    }
}

/**
 * Show the game world
 */
function showGameWorld() {
    const gameView = document.getElementById('game-view');
    if (gameView) {
        gameView.style.display = 'flex';
        console.log('🌍 Game world shown');
    } else {
        console.warn('⚠️ Game view element not found');
    }
}

/**
 * Main game start function - called from character creator
 * This is the entry point after character creation is complete
 */
window.startGameSimulation = async function(characters) {
    try {
        console.log('🚀 Starting game simulation...');
        console.log('👥 Characters:', characters.length);
        console.log('🎯 Focus target:', focusTargetId);
        
        // Set focus target to first character if not set
        focusTargetId = focusTargetId || (characters.length > 0 ? characters[0].id : null);
        
        // Initialize core game systems
        gameEngine = new GameEngine();
        characterManager = new CharacterManager();
        uiUpdater = new UIUpdater();
        movementSystem = new MovementSystem(); // STAGE 4 NEW
        
        console.log('🎯 Core systems initialized');
        
        // Add characters to the character manager
        console.log('👤 Adding characters to manager...');
        for (const character of characters) {
            characterManager.addCharacter(character);
        }
        console.log(`✅ ${characters.length} characters added to manager`);
        
        // Load map data
        console.log('🗺️ Loading map data...');
        const mapData = await loadMapData();
        
        // Initialize renderer - FIXED: Load dynamically to avoid import errors
        console.log('🎨 Initializing renderer...');
        const worldContainer = document.getElementById('world-canvas-container');
        if (!worldContainer) {
            throw new Error('World canvas container not found in DOM');
        }
        
        // Try to load renderer dynamically
        try {
            const { Renderer } = await import('./src/rendering/renderer.js');
            renderer = new Renderer(worldContainer);
            await renderer.initialize();
            gameEngine.setRenderer(renderer);
            console.log('✅ Renderer initialized');
            
            // Render the map
            renderer.renderMap(mapData);
            console.log('🏢 Map rendered');
        } catch (rendererError) {
            console.warn('⚠️ Renderer failed to load, using placeholder:', rendererError.message);
            // Create a responsive placeholder that maintains aspect ratio
            worldContainer.innerHTML = `
                <div style="width: 100%; height: 100%; max-width: 100%; max-height: 100%; 
                           aspect-ratio: 16/9; background: #e8f4f8; 
                           display: flex; align-items: center; justify-content: center;
                           border: 2px dashed #b8daff; border-radius: 8px; margin: auto;">
                    <div style="text-align: center; color: #666;">
                        <h3>Office Purgatory Game World</h3>
                        <p>Click anywhere to test character movement</p>
                        <p style="font-size: 12px; color: #999;">Renderer: Placeholder Mode</p>
                        <p style="font-size: 11px; color: #bbb;">Canvas: ${CANVAS_WIDTH}×${CANVAS_HEIGHT} (16:9)</p>
                    </div>
                </div>
            `;
        }
        
        // Start the game engine (this creates the world and nav grid)
        gameEngine.initialize(mapData);
        console.log('✅ Game engine initialized');
        
        // Initialize character positions AFTER world is created
        if (gameEngine.world) {
            characterManager.initializeCharacterPositions(gameEngine.world);
            console.log('📍 Character positions initialized');
            
            // Add characters to renderer if available
            if (renderer) {
                console.log('👤 Adding characters to renderer...');
                try {
                    for (const character of characterManager.characters) {
                        await renderer.addCharacter(character);
                    }
                    console.log('✅ Characters added to renderer');
                } catch (rendererError) {
                    console.warn('⚠️ Failed to add characters to renderer:', rendererError.message);
                }
            }
        }
        
        // STAGE 4 NEW: Connect movement system to game engine
        gameEngine.setMovementSystem(movementSystem);
        console.log('🚶 Movement system connected');
        
        // Hide character creator and show game world
        hideCharacterCreator();
        showGameWorld();
        
        // Initialize UI updater with character manager
        try {
            uiUpdater.initialize(characterManager, focusTargetId);
        } catch (uiError) {
            console.warn('⚠️ Failed to update UI for focus character:', uiError.message);
        }
        
        // Print game status for debugging
        printGameStatus();
        
        console.log('🎉 Game simulation started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game simulation:', error);
        showErrorMessage(`Failed to start game: ${error.message}`);
    }
};

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    alert(`Error: ${message}`); // Basic error display - could be enhanced with better UI
}

/**
 * Print comprehensive game status for debugging
 */
function printGameStatus() {
    console.log('📊 === GAME STATUS ===');
    
    if (gameEngine) {
        console.log('🎮 Game Engine: ✅ Ready');
        if (gameEngine.world) {
            console.log('🌍 World Status:', gameEngine.world.getStatus());
        } else {
            console.log('🌍 World: ❌ Not created');
        }
    } else {
        console.log('🎮 Game Engine: ❌ Not initialized');
    }
    
    if (characterManager) {
        console.log('👥 Character Manager: ✅ Ready');
        console.log('👤 Characters loaded:', characterManager.characters.length);
        if (characterManager.characters.length > 0) {
            characterManager.characters.forEach(char => {
                console.log(`   - ${char.name}: ${char.position?.x || 0}, ${char.position?.y || 0}`);
            });
        }
    } else {
        console.log('👥 Character Manager: ❌ Not initialized');
    }
    
    if (renderer) {
        console.log('🎨 Renderer: ✅ Ready');
        console.log('🎨 Renderer Status:', renderer.getStatus());
    } else {
        console.log('🎨 Renderer: ⚠️ Not loaded (using placeholder)');
    }
    
    if (movementSystem) {
        console.log('🚶 Movement System: ✅ Ready');
        try {
            console.log('🚶 Movement Status:', movementSystem.getStatus());
        } catch (error) {
            console.log('🚶 Movement System: ⚠️ Status unavailable');
        }
    } else {
        console.log('🚶 Movement System: ❌ Not initialized');
    }
    
    if (uiUpdater) {
        console.log('🖥️ UI Updater: ✅ Ready');
    } else {
        console.log('🖥️ UI Updater: ❌ Not initialized');
    }
    
    console.log('📊 === END STATUS ===');
}

/**
 * DEBUG: Enhanced movement testing function with proper coordinates
 */
window.testMovement = function(canvasX, canvasY) {
    if (!focusTargetId || !characterManager || !movementSystem || !gameEngine) {
        console.warn('🚫 Game not ready for movement test');
        return;
    }
    
    const character = characterManager.getCharacter(focusTargetId);
    if (!character) {
        console.warn('🚫 No character found for movement test');
        return;
    }
    
    // Convert canvas coordinates to world coordinates
    const worldBounds = gameEngine.world.getWorldBounds();
    
    const worldX = (canvasX / CANVAS_WIDTH) * worldBounds.width;
    const worldY = (canvasY / CANVAS_HEIGHT) * worldBounds.height;
    
    const targetPosition = { x: worldX, y: worldY };
    
    console.log(`🧪 Test movement: ${character.name}`);
    console.log(`   From: (${character.position.x.toFixed(1)}, ${character.position.y.toFixed(1)})`);
    console.log(`   Canvas click: (${canvasX}, ${canvasY})`);
    console.log(`   World target: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);
    console.log(`   World bounds: ${worldBounds.width}x${worldBounds.height}`);
    
    // Test if target position is walkable
    const isWalkable = gameEngine.world.isPositionWalkable(worldX, worldY);
    console.log(`   Target walkable: ${isWalkable}`);
    
    // Test grid conversion
    const gridPos = gameEngine.world.worldToGrid(worldX, worldY);
    console.log(`   Grid position: (${gridPos.x}, ${gridPos.y})`);
    console.log(`   Grid bounds: ${worldBounds.tileWidth}x${worldBounds.tileHeight}`);
    
    movementSystem.moveCharacterTo(character, targetPosition, gameEngine.world);
};

/**
 * DEBUG: Test specific world coordinates directly
 */
window.testWorldMovement = function(worldX, worldY) {
    if (!focusTargetId || !characterManager || !movementSystem || !gameEngine) {
        console.warn('🚫 Game not ready for movement test');
        return;
    }
    
    const character = characterManager.getCharacter(focusTargetId);
    if (!character) {
        console.warn('🚫 No character found for movement test');
        return;
    }
    
    const targetPosition = { x: worldX, y: worldY };
    
    console.log(`🧪 Direct world movement test: ${character.name}`);
    console.log(`   From: (${character.position.x.toFixed(1)}, ${character.position.y.toFixed(1)})`);
    console.log(`   To: (${worldX}, ${worldY})`);
    
    // Test grid conversion
    const startGrid = gameEngine.world.worldToGrid(character.position.x, character.position.y);
    const endGrid = gameEngine.world.worldToGrid(worldX, worldY);
    console.log(`   Start grid: (${startGrid.x}, ${startGrid.y})`);
    console.log(`   End grid: (${endGrid.x}, ${endGrid.y})`);
    
    // Test walkability
    const startWalkable = gameEngine.world.navGrid.isWalkable(startGrid.x, startGrid.y);
    const endWalkable = gameEngine.world.navGrid.isWalkable(endGrid.x, endGrid.y);
    console.log(`   Start walkable: ${startWalkable}, End walkable: ${endWalkable}`);
    
    movementSystem.moveCharacterTo(character, targetPosition, gameEngine.world);
};

/**
 * DEBUG: Check if movement is updating
 */
window.debugMovement = function() {
    if (!characterManager || !gameEngine) {
        console.warn('🚫 Game not ready');
        return;
    }
    
    const characters = characterManager.characters;
    console.log('📊 Movement Debug Status:');
    console.log('🔄 Game loop running:', gameEngine.isRunning);
    console.log('⏱️ Last update time:', gameEngine.lastUpdateTime);
    console.log('🚶 Movement system exists:', !!gameEngine.movementSystem);
    
    characters.forEach(char => {
        console.log(`👤 ${char.name}:`);
        console.log(`   Position: (${char.position.x.toFixed(1)}, ${char.position.y.toFixed(1)})`);
        console.log(`   Path: ${char.path?.length || 0} waypoints`);
        console.log(`   Moving: ${gameEngine.movementSystem?.movingCharacters?.has(char.id) || false}`);
    });
};

/**
 * DEBUG: Convert canvas click to all coordinate systems for debugging
 */
window.debugCoordinates = function(canvasX, canvasY) {
    if (!gameEngine || !gameEngine.world) {
        console.warn('🚫 Game world not available');
        return;
    }
    
    console.log(`🔍 Coordinate conversion for canvas click (${canvasX}, ${canvasY}):`);
    
    // Canvas to world conversion
    const worldBounds = gameEngine.world.getWorldBounds();
    
    const worldX = (canvasX / CANVAS_WIDTH) * worldBounds.width;
    const worldY = (canvasY / CANVAS_HEIGHT) * worldBounds.height;
    
    console.log(`   Canvas: (${canvasX}, ${canvasY})`);
    console.log(`   World: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);
    console.log(`   Canvas size: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
    console.log(`   World size: ${worldBounds.width}x${worldBounds.height}`);
    
    // World to grid conversion
    const gridPos = gameEngine.world.worldToGrid(worldX, worldY);
    console.log(`   Grid: (${gridPos.x}, ${gridPos.y})`);
    console.log(`   Grid size: ${worldBounds.tileWidth}x${worldBounds.tileHeight}`);
    
    // Check if walkable
    if (gameEngine.world.navGrid) {
        const isWalkable = gameEngine.world.navGrid.isWalkable(gridPos.x, gridPos.y);
        console.log(`   Walkable: ${isWalkable}`);
        
        if (!isWalkable) {
            console.log('🔧 Searching for nearby walkable positions...');
            const nearby = gameEngine.world.navGrid.findNearbyWalkable(gridPos);
            if (nearby) {
                const nearbyWorld = gameEngine.world.gridToWorld(nearby.x, nearby.y);
                console.log(`   Nearby walkable: grid(${nearby.x}, ${nearby.y}) → world(${nearbyWorld.x.toFixed(1)}, ${nearbyWorld.y.toFixed(1)})`);
            } else {
                console.log('   No nearby walkable positions found');
            }
        }
    }
    
    return { canvas: {x: canvasX, y: canvasY}, world: {x: worldX, y: worldY}, grid: gridPos };
};
