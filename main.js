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
import { Renderer } from './src/rendering/renderer.js';
import { MovementSystem } from './src/core/systems/movement-system.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';

// Global game state for Stage 3 + Stage 4
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let movementSystem = null; // STAGE 4 NEW
let focusTargetId = null;

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
        console.log('👥 Characters:', characters.length);
        console.log('🎯 Focus target:', focusTarget);
        
        // Store focus target for movement system
        focusTargetId = focusTarget;
        
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
        showErrorMessage('Failed to start game. Please try again.');
    }
};

/**
 * Setup New Game button
 */
function setupNewGameButton() {
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            console.log('🎮 New Game button clicked');
            
            // Initialize character creator
            initializeCharacterCreator();
            
            // Show character creator modal
            showCharacterCreator();
        });
        
        // Enable the button after initialization
        newGameBtn.disabled = false;
        newGameBtn.textContent = 'New Game';
        console.log('✅ New Game button ready');
    }
}

/**
 * Show character creator modal
 */
function showCharacterCreator() {
    const modal = document.getElementById('character-creator-modal');
    const startScreen = document.getElementById('start-screen');
    
    if (modal && startScreen) {
        startScreen.style.display = 'none';
        modal.style.display = 'block';
        console.log('📝 Character creator shown');
    }
}

/**
 * Hide character creator modal
 */
function hideCharacterCreator() {
    const modal = document.getElementById('character-creator-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('📝 Character creator hidden');
    }
}

/**
 * Show main game world
 */
function showGameWorld() {
    const gameView = document.getElementById('game-view');
    if (gameView) {
        gameView.style.display = 'flex';
        console.log('🌍 Game world shown');
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    // Simple error display - could be enhanced with a proper modal
    alert('Error: ' + message);
    console.error('User notified of error:', message);
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
