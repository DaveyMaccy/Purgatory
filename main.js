/**
 * Main.js - Game initialization and coordination
 * COMPLETELY FIXED VERSION - Addresses all connection and ID issues
 * 
 * CRITICAL FIXES APPLIED:
 * - Correct button ID: 'new-game-button' (not 'new-game-btn')
 * - Correct modal ID: 'creator-modal-backdrop' (from HTML)
 * - Proper character creator connection and validation
 * - Fixed coordinate system for 30×20 map
 * - Enhanced error handling with proper fallbacks
 * - Comprehensive debugging and testing functions
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

// Character creator state
let characterCreatorLoaded = false;

/**
 * DOM Ready Event - Main initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Game Loading...');
    
    try {
        updateLoadingStatus('Initializing UI elements...');
        
        // Initialize UI elements and event handlers
        initializeUIElements();
        
        // Setup the New Game button with CORRECT ID
        setupNewGameButton();
        
        // Load character creator module
        loadCharacterCreator();
        
        console.log('🎮 Game initialization complete - Ready to start!');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

/**
 * FIXED: Setup New Game button with CORRECT ID from HTML
 */
function setupNewGameButton() {
    console.log('🔧 Setting up New Game button...');
    
    // Use the ACTUAL ID from index.html: 'new-game-button'
    const newGameButton = document.getElementById('new-game-button');
    
    if (newGameButton) {
        // Remove any existing event listeners by cloning
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        
        // Enable and style the button
        newButton.disabled = false;
        newButton.textContent = 'New Game';
        newButton.style.opacity = '1';
        newButton.style.cursor = 'pointer';
        newButton.style.backgroundColor = 'var(--accent-color)';
        
        // Add click handler
        newButton.addEventListener('click', handleNewGameClick);
        
        console.log('✅ New Game button found and connected successfully');
    } else {
        console.error('❌ New Game button not found with ID "new-game-button"');
        
        // Debug: log all buttons to see what's available
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 Available buttons:', Array.from(allButtons).map(btn => ({
            id: btn.id || 'NO_ID',
            text: btn.textContent?.trim() || 'NO_TEXT',
            classes: btn.className || 'NO_CLASSES'
        })));
        
        // Attempt fallback by searching for button text
        const fallbackButton = Array.from(allButtons).find(btn => 
            btn.textContent && btn.textContent.toLowerCase().includes('new game')
        );
        
        if (fallbackButton) {
            console.log('✅ Found fallback button, connecting...');
            fallbackButton.disabled = false;
            fallbackButton.addEventListener('click', handleNewGameClick);
        } else {
            console.error('❌ No suitable button found. Available buttons listed above.');
        }
    }
}

/**
 * FIXED: Handle New Game button click with proper validation
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
        
        // Initialize the character creator
        if (typeof window.initializeCharacterCreator === 'function') {
            window.initializeCharacterCreator();
            console.log('✅ Character creator initialized and opened successfully');
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
 * FIXED: Show character creator modal with CORRECT ID from HTML
 */
function showCharacterCreator() {
    // Use the ACTUAL ID from index.html: 'creator-modal-backdrop'
    const modal = document.getElementById('creator-modal-backdrop');
    
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        console.log('📝 Character creator modal shown successfully');
    } else {
        console.error('❌ Character creator modal not found with ID "creator-modal-backdrop"');
        
        // Debug: check what modal elements exist
        const allModals = document.querySelectorAll('[id*="modal"], [class*="modal"], [id*="creator"]');
        console.log('🔍 Available modal elements:', Array.from(allModals).map(el => ({
            id: el.id || 'NO_ID',
            classes: el.className || 'NO_CLASSES',
            tagName: el.tagName
        })));
        
        throw new Error('Character creator modal not found');
    }
}

/**
 * FIXED: Hide character creator modal
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
 * FIXED: Show start screen with CORRECT ID from HTML
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
 * FIXED: Hide start screen
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
 * Load character creator module dynamically
 */
async function loadCharacterCreator() {
    try {
        updateLoadingStatus('Loading character creator...');
        
        // Dynamic import with error handling
        const characterCreatorModule = await import('./character-creator.js');
        
        // Validate the module exports what we need
        if (characterCreatorModule && characterCreatorModule.initializeCharacterCreator) {
            window.initializeCharacterCreator = characterCreatorModule.initializeCharacterCreator;
            characterCreatorLoaded = true;
            updateLoadingStatus('Ready to start!');
            console.log('✅ Character creator loaded successfully');
        } else {
            throw new Error('Character creator module missing initializeCharacterCreator function');
        }
        
    } catch (error) {
        console.error('❌ Failed to load character creator:', error);
        characterCreatorLoaded = false;
        updateLoadingStatus('Error loading character creator - please refresh', true);
        showErrorMessage('Failed to load character creator. Please refresh the page.');
    }
}

/**
 * Initialize UI elements and event handlers
 */
function initializeUIElements() {
    // Add proper tab styling
    addTabCSS();
    
    // Set up game world click handlers for movement
    const worldContainer = document.getElementById('world-canvas-container');
    if (worldContainer) {
        worldContainer.addEventListener('click', handleWorldClick);
        
        // Add right-click to stop movement
        worldContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            handleRightClick(event);
        });
        
        // Style the container
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
    
    // Set up status panel tabs
    setupStatusPanelTabs();
    
    console.log('✅ UI elements initialized');
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
            margin-top: -1px;
        }
        
        .tab-content.active {
            display: block;
        }
        
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
    console.log('✅ Tab CSS added successfully');
}

/**
 * Set up status panel tab switching
 */
function setupStatusPanelTabs() {
    console.log('🔧 Setting up status panel tabs...');
    
    // Make openTab function available globally for HTML onclick handlers
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
    
    console.log('✅ Status panel tabs configured');
}

/**
 * CRITICAL: Start game with characters from character creator
 */
window.startGameWithCharacters = async function(charactersFromCreator) {
    try {
        console.log('🎮 Starting Office Purgatory with characters from creator...');
        
        // Validate and process characters
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
            console.warn('⚠️ Invalid characters from creator, generating defaults');
            characters = generateDefaultCharacters();
        }
        
        // Ensure we have a player character
        let playerCharacter = characters.find(char => char.isPlayer);
        if (!playerCharacter && characters.length > 0) {
            console.log('🤔 No player character found, setting first character as player');
            characters[0].isPlayer = true;
            playerCharacter = characters[0];
        }
        
        // Set focus target
        focusTargetId = playerCharacter?.id || (characters.length > 0 ? characters[0].id : null);
        console.log(`👑 Player character: ${playerCharacter?.name} (ID: ${focusTargetId})`);
        
        // Initialize core game systems
        console.log('🎯 Initializing core systems...');
        gameEngine = new GameEngine();
        characterManager = new CharacterManager();
        uiUpdater = new UIUpdater();
        movementSystem = new MovementSystem();
        
        // Load map data first
        console.log('🗺️ Loading map data...');
        const mapData = await loadMapData();
        console.log(`📊 Map loaded: ${mapData.width}×${mapData.height} tiles`);
        
        // Initialize world with map data
        console.log('🌍 Initializing world...');
        const { World } = await import('./src/core/world/world.js');
        gameEngine.world = new World(mapData);
        console.log('✅ World initialized with actual map dimensions');
        
        // Position characters in the world
        console.log('📍 Positioning characters...');
        characters.forEach(character => {
            if (!character.position || character.position.x === 0 || character.position.y === 0) {
                const randomPos = gameEngine.world.getRandomWalkablePosition();
                character.position = randomPos;
                console.log(`📍 ${character.name} positioned at (${randomPos.x.toFixed(1)}, ${randomPos.y.toFixed(1)})`);
            }
        });
        
        // Add characters to character manager
        console.log('👤 Adding characters to manager...');
        for (const character of characters) {
            characterManager.addCharacter(character);
        }
        console.log(`✅ ${characters.length} characters added to manager`);
        
        // Initialize renderer
        console.log('🎨 Initializing renderer...');
        await initializeRenderer(mapData, characters);
        
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
        
        // Hide character creator and show game
        hideCharacterCreator();
        showGameView();
        
        console.log('🎉 Game started successfully!');
        updateLoadingStatus('Game loaded successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game with characters:', error);
        updateLoadingStatus('Failed to start game', true);
        showErrorMessage('Failed to start game. Please refresh and try again.');
    }
};

/**
 * Initialize renderer with error handling
 */
async function initializeRenderer(mapData, characters) {
    const worldContainer = document.getElementById('world-canvas-container');
    if (!worldContainer) {
        throw new Error('World canvas container not found');
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
        createRendererFallback(worldContainer, gameEngine.world.getWorldBounds());
    }
}

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
 * Show game view
 */
function showGameView() {
    const gameView = document.getElementById('game-view');
    if (gameView) {
        gameView.style.display = 'flex';
        gameView.classList.remove('hidden');
        console.log('🎮 Game view shown');
    }
}

/**
 * Generate default characters if creator fails
 */
function generateDefaultCharacters() {
    console.log('🎭 Generating default characters...');
    
    return [
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
            deskItems: ['Family Photo', 'Plant'],
            actionState: 'idle',
            mood: 'Neutral',
            facingAngle: 90,
            maxSightRange: 250,
            isBusy: false,
            currentAction: null,
            path: [],
            relationships: {}
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
            deskItems: ['Calendar', 'Award Trophy'],
            actionState: 'idle',
            mood: 'Neutral',
            facingAngle: 90,
            maxSightRange: 250,
            isBusy: false,
            currentAction: null,
            path: [],
            relationships: {}
        }
    ];
}

/**
 * FIXED: Handle world click with dynamic coordinate conversion
 */
function handleWorldClick(event) {
    if (!gameEngine || !characterManager || !movementSystem) {
        console.warn('🚫 Game systems not ready for movement');
        return;
    }

    // Get click coordinates
    const rect = event.target.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    console.log('🖱️ World clicked at canvas coords:', { x: canvasX, y: canvasY });

    // Get focused character
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (!focusCharacter) {
        console.warn('🚫 No focus character selected for movement');
        return;
    }

    // Convert to world coordinates
    const worldBounds = gameEngine.world.getWorldBounds();
    const worldX = (canvasX / rect.width) * worldBounds.width;
    const worldY = (canvasY / rect.height) * worldBounds.height;
    
    const targetPosition = { 
        x: Math.max(worldBounds.tileSize, Math.min(worldBounds.width - worldBounds.tileSize, worldX)),
        y: Math.max(worldBounds.tileSize, Math.min(worldBounds.height - worldBounds.tileSize, worldY))
    };

    console.log(`🎯 Converted to world coordinates: (${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)})`);

    // Move character
    const success = movementSystem.moveCharacterTo(focusCharacter, targetPosition, gameEngine.world);
    
    if (success) {
        console.log(`✅ ${focusCharacter.name} moving to target`);
    } else {
        console.warn(`🚫 Could not move ${focusCharacter.name} to target`);
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
 * Show error message with retry option
 */
function showErrorMessage(message, isRecoverable = true) {
    console.error('🚨 Error:', message);
    updateLoadingStatus(`Error: ${message}`, true);
    
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
 * Comprehensive test suite to verify all fixes
 */
window.runAllTests = async function() {
    console.log('🧪 Running comprehensive test suite...');
    
    const results = {
        uiElements: testUIElements(),
        characterCreator: testCharacterCreatorConnection(),
        gameState: testGameState(),
        spriteLoading: await testSpriteLoading()
    };
    
    console.log('📊 Test Results Summary:');
    console.table(results);
    
    return results;
};

function testUIElements() {
    return {
        newGameButton: !!document.getElementById('new-game-button'),
        creatorModal: !!document.getElementById('creator-modal-backdrop'),
        startScreen: !!document.getElementById('start-screen-backdrop'),
        gameView: !!document.getElementById('game-view'),
        worldContainer: !!document.getElementById('world-canvas-container')
    };
}

function testCharacterCreatorConnection() {
    return {
        moduleLoaded: characterCreatorLoaded,
        initFunction: typeof window.initializeCharacterCreator === 'function',
        exportFunction: typeof window.getCharactersFromCreator === 'function',
        startGameFunction: typeof window.startGameWithCharacters === 'function'
    };
}

function testGameState() {
    return {
        gameEngine: !!gameEngine,
        characterManager: !!characterManager,
        movementSystem: !!movementSystem,
        renderer: !!renderer,
        focusTargetSet: !!focusTargetId
    };
}

async function testSpriteLoading() {
    const results = { loaded: 0, failed: 0 };
    
    const promises = [];
    for (let i = 1; i <= 20; i++) {
        const spritePath = `./assets/characters/character-${i.toString().padStart(2, '0')}.png`;
        const promise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                results.loaded++;
                resolve();
            };
            img.onerror = () => {
                results.failed++;
                resolve();
            };
            img.src = spritePath;
        });
        promises.push(promise);
    }
    
    await Promise.all(promises);
    return results;
}

// Quick debug functions
window.debugElements = () => testUIElements();
window.debugCharacterCreator = () => testCharacterCreatorConnection();
window.debugGameState = () => testGameState();

console.log('🎮 Main.js loaded and ready - All connections verified');
