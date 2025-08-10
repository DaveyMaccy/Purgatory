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
 * 
 * FIXES APPLIED:
 * - Works with actual 30×20 map (2304×1536 pixels)
 * - Fixed coordinate transformation for any world/canvas size
 * - Fixed button and modal ID matching
 * - Dynamic canvas sizing and aspect ratio handling
 * - Enhanced error handling
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
        
        // Setup the New Game button - FIXED to use correct ID
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
 * Update loading status message
 */
function updateLoadingStatus(message) {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
    console.log(`📢 Status: ${message}`);
}

/**
 * Initialize UI elements and event handlers
 */
function initializeUIElements() {
    // Add proper tab styling
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
        
        // Add responsive canvas styling
        const canvasStyle = document.createElement('style');
        canvasStyle.textContent = `
            #world-canvas-container canvas {
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
                border-radius: 4px;
                display: block;
            }
        `;
        document.head.appendChild(canvasStyle);
    }
    
    // Set up tab switching in the status panel
    setupStatusPanelTabs();
    
    console.log('✅ UI elements initialized');
}

/**
 * Setup New Game button - FIXED to use correct ID from HTML
 */
function setupNewGameButton() {
    console.log('🔧 Setting up New Game button...');
    
    // Use the actual ID from index.html
    const newGameButton = document.getElementById('new-game-button');
    
    if (newGameButton) {
        // Remove any existing event listeners by cloning
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        
        // Enable and add event listener
        newButton.disabled = false;
        newButton.textContent = 'New Game';
        newButton.style.opacity = '1';
        newButton.style.cursor = 'pointer';
        newButton.addEventListener('click', handleNewGameClick);
        
        console.log('✅ New Game button enabled and connected');
    } else {
        console.warn('⚠️ New Game button not found - debugging...');
        
        // Debug: log all buttons to see what's available
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 Available buttons:', Array.from(allButtons).map(btn => ({
            id: btn.id,
            text: btn.textContent?.trim(),
            classes: btn.className,
            disabled: btn.disabled
        })));
        
        // Try to find button by text content as fallback
        const fallbackButton = Array.from(allButtons).find(btn => 
            btn.textContent && (
                btn.textContent.toLowerCase().includes('new game') || 
                btn.textContent.toLowerCase().includes('start')
            )
        );
        
        if (fallbackButton) {
            console.log('✅ Found fallback button:', fallbackButton.textContent);
            fallbackButton.disabled = false;
            fallbackButton.addEventListener('click', handleNewGameClick);
        } else {
            console.error('❌ No suitable button found for New Game');
        }
    }
}

/**
 * Handle New Game button click - FIXED with better validation
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    
    if (!characterCreatorLoaded) {
        console.warn('⚠️ Character creator not loaded yet, please wait...');
        showErrorMessage('Character creator is still loading, please wait a moment and try again.');
        return;
    }
    
    try {
        // Hide start screen first
        hideStartScreen();
        
        // Show character creator modal
        showCharacterCreator();
        
        // Initialize the character creator - FIXED to check function exists
        if (typeof window.initializeCharacterCreator === 'function') {
            window.initializeCharacterCreator('Game Studio');
            console.log('✅ Character creator initialized and opened');
        } else {
            throw new Error('Character creator initialization function not available');
        }
        
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        showErrorMessage('Failed to open character creator: ' + error.message);
        
        // Show start screen again on error
        showStartScreen();
    }
}

/**
 * Show character creator modal - FIXED to use correct ID from HTML
 */
function showCharacterCreator() {
    // Use the actual ID from index.html
    const modal = document.getElementById('creator-modal-backdrop');
    
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        console.log('📝 Character creator modal shown');
    } else {
        console.error('❌ Character creator modal not found');
        
        // Debug: check what modal elements exist
        const allModals = document.querySelectorAll('[id*="modal"], [class*="modal"]');
        console.log('🔍 Available modal elements:', Array.from(allModals).map(el => ({
            id: el.id,
            classes: el.className,
            tagName: el.tagName
        })));
        
        throw new Error('Character creator modal not found');
    }
}

/**
 * Hide character creator modal - FIXED to use correct ID
 */
function hideCharacterCreator() {
    const modal = document.getElementById('creator-modal-backdrop');
    
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        console.log('📝 Character creator modal hidden');
    }
}

/**
 * Show start screen - FIXED to use correct ID from HTML
 */
function showStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    
    if (startScreen) {
        startScreen.style.display = 'flex';
        startScreen.classList.remove('hidden');
        console.log('🏠 Start screen shown');
    }
}

/**
 * Hide start screen - FIXED to use correct ID
 */
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    
    if (startScreen) {
        startScreen.style.display = 'none';
        startScreen.classList.add('hidden');
        console.log('🏠 Start screen hidden');
    }
}

/**
 * Show main game world - FIXED to use correct ID from HTML
 */
function showGameWorld() {
    const gameView = document.getElementById('main-game-ui');
    
    if (gameView) {
        gameView.style.display = 'flex';
        gameView.classList.remove('hidden');
        console.log('🌍 Game world shown');
    } else {
        console.error('❌ Game view container not found');
        
        // Debug: check what containers exist
        const containers = document.querySelectorAll('[id*="game"], [id*="main"]');
        console.log('🔍 Available game containers:', Array.from(containers).map(el => ({
            id: el.id,
            classes: el.className
        })));
    }
}

/**
 * STAGE 4 COMPLETE: Handle clicks on the game world for character movement
 * FIXED: Dynamic coordinate transformation that works with any world/canvas size
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
    if (movementSystem.stopCharacter) {
        movementSystem.stopCharacter(focusCharacter);
        console.log(`🛑 Stopped movement for ${focusCharacter.name}`);
    } else {
        console.warn('🚫 Movement system does not support stopping characters');
    }
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
    
    // FIXED: Create openTab function on window for HTML onclick handlers
    window.openTab = function(evt, tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content, .tabcontent');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-button, .tablink');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Show the selected tab content and mark button as active
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.style.display = 'block';
        }
        
        if (evt && evt.currentTarget) {
            evt.currentTarget.classList.add('active');
        }
    };
    
    // Set up click handlers for tab buttons (backup to onclick)
    const tabButtons = document.querySelectorAll('.tab-link, .tablink');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = button.getAttribute('data-tab') || 
                           button.textContent.toLowerCase().replace(/\s+/g, '');
            window.openTab(e, tabName);
        });
    });
    
    // Activate first tab by default if none are active
    const firstTabButton = document.querySelector('.tab-link, .tablink');
    if (firstTabButton && !document.querySelector('.tab-content.active, .tabcontent.active')) {
        const firstTabName = firstTabButton.getAttribute('data-tab') || 
                            firstTabButton.textContent.toLowerCase().replace(/\s+/g, '');
        window.openTab(null, firstTabName);
    }
    
    console.log('✅ Status panel tabs configured');
}

/**
 * Main game start function - FIXED to match character creator expectations
 * This is called from character creator after "Start Simulation" is clicked
 */
window.startGameSimulation = async function(characters, focusTarget) {
    try {
        console.log('🚀 Starting game simulation...');
        console.log('👥 Characters:', characters?.length || 0);
        console.log('🎯 Focus target:', focusTarget);
        
        // Validate inputs
        if (!characters || characters.length === 0) {
            throw new Error('No characters provided for simulation');
        }
        
        // Store focus target for movement system
        focusTargetId = focusTarget || (characters.length > 0 ? characters[0].id : null);
        
        // Initialize core game systems
        gameEngine = new GameEngine();
        characterManager = new CharacterManager();
        uiUpdater = new UIUpdater();
        movementSystem = new MovementSystem();
        
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
        
        // Initialize renderer - FIXED: Better error handling
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
            
            // Create a responsive placeholder that shows actual world dimensions
            const worldInfo = mapData ? `${mapData.width}×${mapData.height} tiles (${mapData.width * (mapData.tilewidth || 48)}×${mapData.height * (mapData.tileheight || 48)} pixels)` : 'Unknown dimensions';
            
            worldContainer.innerHTML = `
                <div style="width: 100%; height: 100%; max-width: 100%; max-height: 100%; 
                           aspect-ratio: ${mapData ? mapData.width / mapData.height : 16/9}; 
                           background: linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%); 
                           display: flex; align-items: center; justify-content: center;
                           border: 2px dashed #b8daff; border-radius: 8px; margin: auto;
                           box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="text-align: center; color: #666; user-select: none;">
                        <h3 style="margin: 0 0 8px 0; color: #2563eb;">Office Purgatory</h3>
                        <p style="margin: 4px 0; font-size: 14px;">Click anywhere to test character movement</p>
                        <p style="margin: 4px 0; font-size: 12px; color: #999;">Renderer: Placeholder Mode</p>
                        <p style="margin: 4px 0; font-size: 11px; color: #bbb;">World: ${worldInfo}</p>
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
        
        // Connect movement system to game engine
        if (gameEngine.setMovementSystem) {
            gameEngine.setMovementSystem(movementSystem);
            console.log('🚶 Movement system connected');
        }
        
        // Hide character creator and show game world
        hideCharacterCreator();
        showGameWorld();
        
        // Initialize UI updater with character manager
        try {
            if (uiUpdater.initialize) {
                uiUpdater.initialize(characterManager, focusTargetId);
            }
        } catch (uiError) {
            console.warn('⚠️ Failed to initialize UI updater:', uiError.message);
        }
        
        // Print game status for debugging
        printGameStatus();
        
        console.log('🎉 Game simulation started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game simulation:', error);
        
        // Enhanced error message for different error types
        let userMessage = 'Failed to start game: ';
        if (error.message.includes('character')) {
            userMessage += 'Character setup failed. Please try creating characters again.';
        } else if (error.message.includes('world')) {
            userMessage += 'Game world failed to initialize. Please refresh and try again.';
        } else if (error.message.includes('renderer')) {
            userMessage += 'Graphics system failed to load. The game may still work without graphics.';
        } else {
            userMessage += error.message;
        }
        
        showErrorMessage(userMessage);
        
        // Try to show start screen again on critical error
        showStartScreen();
        hideCharacterCreator();
    }
};

/**
 * Show error message to user - ENHANCED with better UI
 */
function showErrorMessage(message) {
    console.error('🚨 User error notification:', message);
    
    // Try to show error in a more user-friendly way
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: linear-gradient(135deg, #fee 0%, #fdd 100%); 
        border: 1px solid #fcc; color: #c33;
        padding: 15px 20px; border-radius: 8px; max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px; line-height: 1.4;
    `;
    errorDiv.innerHTML = `
        <strong>Error</strong><br>
        ${message}
        <button onclick="this.parentElement.remove()" style="
            float: right; margin-left: 10px; background: none; border: none; 
            color: #c33; cursor: pointer; font-size: 16px; font-weight: bold;
        ">×</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 8000);
    
    // Fallback to alert for critical errors
    if (message.includes('refresh')) {
        setTimeout(() => alert(message), 100);
    }
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
                console.log(`   - ${char.name}: ${char.position?.x?.toFixed(1) || 0}, ${char.position?.y?.toFixed(1) || 0}`);
            });
        }
    } else {
        console.log('👥 Character Manager: ❌ Not initialized');
    }
    
    if (renderer) {
        console.log('🎨 Renderer: ✅ Ready');
        if (renderer.getStatus) {
            console.log('🎨 Renderer Status:', renderer.getStatus());
        }
    } else {
        console.log('🎨 Renderer: ⚠️ Not loaded (using placeholder)');
    }
    
    if (movementSystem) {
        console.log('🚶 Movement System: ✅ Ready');
        try {
            if (movementSystem.getStatus) {
                console.log('🚶 Movement Status:', movementSystem.getStatus());
            }
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
 * DEBUG: Enhanced movement testing function with dynamic coordinates
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
    
    // Get dynamic world bounds
    const worldBounds = gameEngine.world.getWorldBounds();
    
    // Assume canvas size (could be dynamic)
    const canvasElement = document.querySelector('#world-canvas-container canvas');
    const canvasWidth = canvasElement ? canvasElement.clientWidth : 800;
    const canvasHeight = canvasElement ? canvasElement.clientHeight : 600;
    
    const worldX = (canvasX / canvasWidth) * worldBounds.width;
    const worldY = (canvasY / canvasHeight) * worldBounds.height;
    
    const targetPosition = { x: worldX, y: worldY };
    
    console.log(`🧪 Test movement: ${character.name}`);
    console.log(`   From: (${character.position.x.toFixed(1)}, ${character.position.y.toFixed(1)})`);
    console.log(`   Canvas click: (${canvasX}, ${canvasY})`);
    console.log(`   World target: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);
    console.log(`   Canvas: ${canvasWidth}×${canvasHeight}, World: ${worldBounds.width}×${worldBounds.height}`);
    
    // Test if target position is walkable
    const isWalkable = gameEngine.world.isPositionWalkable(worldX, worldY);
    console.log(`   Target walkable: ${isWalkable}`);
    
    // Test grid conversion
    const gridPos = gameEngine.world.worldToGrid(worldX, worldY);
    console.log(`   Grid position: (${gridPos.x}, ${gridPos.y})`);
    
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
    
    // Get dynamic dimensions
    const worldBounds = gameEngine.world.getWorldBounds();
    const canvasElement = document.querySelector('#world-canvas-container canvas');
    const canvasWidth = canvasElement ? canvasElement.clientWidth : 800;
    const canvasHeight = canvasElement ? canvasElement.clientHeight : 600;
    
    const worldX = (canvasX / canvasWidth) * worldBounds.width;
    const worldY = (canvasY / canvasHeight) * worldBounds.height;
    
    console.log(`   Canvas: (${canvasX}, ${canvasY})`);
    console.log(`   World: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);
    console.log(`   Canvas size: ${canvasWidth}×${canvasHeight}`);
    console.log(`   World size: ${worldBounds.width}×${worldBounds.height}`);
    
    // World to grid conversion
    const gridPos = gameEngine.world.worldToGrid(worldX, worldY);
    console.log(`   Grid: (${gridPos.x}, ${gridPos.y})`);
    console.log(`   Grid size: ${worldBounds.tileWidth}×${worldBounds.tileHeight}`);
    
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
