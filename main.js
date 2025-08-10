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
    }
    
    // Set up tab switching in the status panel
    setupStatusPanelTabs();
    
    console.log('✅ UI elements initialized');
}

/**
 * STAGE 4 COMPLETE: Handle clicks on the game world for character movement
 */
function handleWorldClick(event) {
    if (!gameEngine || !gameEngine.world || !movementSystem || !characterManager) {
        console.warn('🚫 Game systems not ready for movement');
        return;
    }

    // Get click coordinates relative to the canvas
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log('🖱️ World clicked at:', { x, y });

    // Get the focused character (player character)
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (!focusCharacter) {
        console.warn('🚫 No focus character selected for movement');
        return;
    }

    // Convert canvas coordinates to world coordinates if needed
    // For now, assuming 1:1 mapping
    const targetPosition = { x, y };

    // Move the character to the clicked position
    const success = movementSystem.moveCharacterTo(focusCharacter, targetPosition, gameEngine.world);
    
    if (success) {
        console.log(`✅ ${focusCharacter.name} moving to:`, targetPosition);
    } else {
        console.warn(`🚫 Could not move ${focusCharacter.name} to:`, targetPosition);
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
 * MAIN GAME START FUNCTION - Called from character creator
 * This is the primary entry point for starting the game simulation
 * STAGE 4 UPDATE: Now includes movement system initialization
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
            // Create a simple placeholder div for the world
            worldContainer.innerHTML = `
                <div style="width: 100%; height: 100%; background: #e8f4f8; 
                           display: flex; align-items: center; justify-content: center;
                           border: 2px dashed #b8daff; border-radius: 8px;">
                    <div style="text-align: center; color: #666;">
                        <h3>Game World</h3>
                        <p>Click anywhere to test movement</p>
                        <p style="font-size: 12px; color: #999;">Renderer not loaded - using placeholder</p>
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
                for (const character of characterManager.characters) {
                    await renderer.addCharacter(character);
                }
                console.log('✅ Characters added to renderer');
            }
        } else {
            throw new Error('Game world was not created properly');
        }
        
        // STAGE 4 NEW: Connect movement system to game engine
        gameEngine.setMovementSystem(movementSystem);
        console.log('🚶 Movement system connected');
        
        // Hide character creator and show game world
        hideCharacterCreator();
        showGameWorld();
        
        // Start UI updates with initial focus character
        if (focusTargetId) {
            const focusCharacter = characterManager.getCharacter(focusTargetId);
            if (focusCharacter) {
                uiUpdater.updateUI(focusCharacter);
                console.log(`🎯 UI focused on: ${focusCharacter.name}`);
            }
        }
        
        // Log game status for debugging
        logGameStatus();
        
        console.log('🎉 Game simulation started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game simulation:', error);
        showErrorMessage('Failed to start game: ' + error.message);
        
        // Try to show start screen again on critical error
        showStartScreen();
        hideCharacterCreator();
    }
};

/**
 * Setup New Game button - FIXED for correct HTML ID
 */
function setupNewGameButton() {
    // Try both possible button IDs from HTML
    const newGameButton = document.getElementById('new-game-button') || document.getElementById('new-game-btn');
    
    if (newGameButton) {
        // Remove any existing listeners by cloning
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        
        // Enable and add event listener
        newButton.disabled = false;
        newButton.textContent = 'New Game';
        newButton.addEventListener('click', handleNewGameClick);
        
        console.log('✅ New Game button enabled and connected');
    } else {
        console.warn('⚠️ New Game button not found - checking available buttons...');
        
        // Debug: log all buttons to see what's available
        const allButtons = document.querySelectorAll('button');
        console.log('Available buttons:', Array.from(allButtons).map(btn => ({
            id: btn.id,
            text: btn.textContent,
            classes: btn.className
        })));
        
        // Try to find button by text content as fallback
        const fallbackButton = Array.from(allButtons).find(btn => 
            btn.textContent.toLowerCase().includes('new game') || 
            btn.textContent.toLowerCase().includes('start')
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
 * Handle New Game button click - FIXED
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    
    if (!characterCreatorLoaded) {
        console.warn('⚠️ Character creator not loaded yet, please wait...');
        showErrorMessage('Character creator is still loading, please wait a moment and try again.');
        return;
    }
    
    try {
        // Hide start screen
        hideStartScreen();
        
        // Show character creator
        showCharacterCreator();
        
        // Initialize the character creator - check if function exists
        if (window.initializeCharacterCreator) {
            window.initializeCharacterCreator('Game Studio');
            console.log('✅ Character creator opened');
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
 * Show character creator modal - FIXED IDs
 */
function showCharacterCreator() {
    // Hide start screen first
    hideStartScreen();
    
    // Try multiple possible modal IDs
    const modal = document.getElementById('creator-modal-backdrop') || 
                  document.getElementById('character-creator-modal') ||
                  document.querySelector('.modal-backdrop');
    
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        console.log('📝 Character creator shown');
    } else {
        console.error('❌ Character creator modal not found');
        showErrorMessage('Character creator interface not found');
    }
}

/**
 * Hide character creator modal - FIXED IDs
 */
function hideCharacterCreator() {
    const modal = document.getElementById('creator-modal-backdrop') || 
                  document.getElementById('character-creator-modal') ||
                  document.querySelector('.modal-backdrop');
    
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        console.log('📝 Character creator hidden');
    }
}

/**
 * Show start screen - FIXED IDs
 */
function showStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop') || 
                       document.getElementById('start-screen');
    
    if (startScreen) {
        startScreen.style.display = 'flex';
        startScreen.classList.remove('hidden');
        console.log('🏠 Start screen shown');
    }
}

/**
 * Hide start screen - FIXED IDs
 */
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop') || 
                       document.getElementById('start-screen');
    
    if (startScreen) {
        startScreen.style.display = 'none';
        startScreen.classList.add('hidden');
        console.log('🏠 Start screen hidden');
    }
}

/**
 * Show main game world - FIXED IDs
 */
function showGameWorld() {
    const gameView = document.getElementById('main-game-ui') || 
                    document.getElementById('game-view');
    
    if (gameView) {
        gameView.style.display = 'flex';
        gameView.classList.remove('hidden');
        console.log('🌍 Game world shown');
    } else {
        console.error('❌ Game view container not found');
    }
}

/**
 * Show error message to user - ENHANCED
 */
function showErrorMessage(message) {
    console.error('User notified of error:', message);
    
    // Try to show error in a more user-friendly way
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #fee; border: 1px solid #fcc; color: #c33;
        padding: 15px 20px; border-radius: 8px; max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: system-ui, sans-serif;
    `;
    errorDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Error</div>
        <div style="margin-bottom: 12px;">${message}</div>
        <button onclick="this.parentElement.remove()" 
                style="background: #c33; color: white; border: none; 
                       padding: 6px 12px; border-radius: 4px; cursor: pointer;">
            Dismiss
        </button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 10000);
    
    // Also show in console for debugging
    alert('Error: ' + message);
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
        }
        
        .tab-content.active {
            display: block;
        }
        
        .tab-content h3 {
            margin-top: 0;
            margin-bottom: 12px;
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
        }
        
        .tab-content p {
            margin: 8px 0;
            color: #4b5563;
            line-height: 1.5;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Log current game status for debugging
 */
function logGameStatus() {
    console.log('📊 === GAME STATUS ===');
    
    if (gameEngine) {
        console.log('🎮 Game Engine: ✅ Ready');
        if (gameEngine.world) {
            console.log('🌍 World Status:', gameEngine.world.getStatus());
        }
    }
    
    if (characterManager) {
        console.log('👥 Character Manager: ✅ Ready');
        console.log(`👤 Characters loaded: ${characterManager.characters.length}`);
        characterManager.characters.forEach(char => {
            console.log(`   - ${char.name}: ${char.position.x}, ${char.position.y}`);
        });
    }
    
    if (renderer) {
        console.log('🎨 Renderer: ✅ Ready');
    }
    
    if (movementSystem) {
        console.log('🚶 Movement System: ✅ Ready');
        console.log('🚶 Movement Status:', movementSystem.getStatus());
    }
    
    if (uiUpdater) {
        console.log('🖥️ UI Updater: ✅ Ready');
    }
    
    console.log('📊 === END STATUS ===');
}

/**
 * DEBUG: Global function to test movement system
 */
window.testMovement = function(x, y) {
    if (!focusTargetId || !characterManager || !movementSystem || !gameEngine) {
        console.warn('🚫 Game not ready for movement test');
        return;
    }
    
    const character = characterManager.getCharacter(focusTargetId);
    if (character) {
        movementSystem.moveCharacterTo(character, {x, y}, gameEngine.world);
        console.log(`🧪 Test movement: ${character.name} to ${x}, ${y}`);
    }
};
