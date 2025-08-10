/**
 * Main.js - Core Game Initialization
 * REFACTORED VERSION - Core functionality only, other functions moved to separate modules
 * 
 * RESPONSIBILITIES:
 * - DOM ready initialization
 * - Character creator integration
 * - Game start coordination
 * - Basic UI setup
 * 
 * MOVED TO SEPARATE FILES:
 * - Debug functions → src/utils/debug-utils.js
 * - UI utilities → src/utils/ui-utils.js
 * - Game utilities → src/utils/game-utils.js
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { MovementSystem } from './src/core/systems/movement-system.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeUI } from './src/utils/ui-utils.js';
import { generateDefaultCharacters, initializeRenderer } from './src/utils/game-utils.js';

// Global game state
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let movementSystem = null;
let focusTargetId = null;
let characterCreatorLoaded = false;

/**
 * DOM Ready Event - Main initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Game Loading...');
    
    try {
        updateLoadingStatus('Initializing UI elements...');
        
        // Initialize UI (moved to ui-utils.js)
        initializeUI(handleWorldClick, handleRightClick);
        
        // Setup New Game button
        setupNewGameButton();
        
        // Load character creator
        loadCharacterCreator();
        
        console.log('🎮 Game initialization complete - Ready to start!');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

/**
 * Setup New Game button with correct ID
 */
function setupNewGameButton() {
    console.log('🔧 Setting up New Game button...');
    
    const newGameButton = document.getElementById('new-game-button');
    
    if (newGameButton) {
        // Clean setup
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        
        // Enable and add handler
        newButton.disabled = false;
        newButton.textContent = 'New Game';
        newButton.style.opacity = '1';
        newButton.style.cursor = 'pointer';
        newButton.addEventListener('click', handleNewGameClick);
        
        console.log('✅ New Game button connected');
    } else {
        console.error('❌ New Game button not found');
    }
}

/**
 * Handle New Game button click
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked');
    
    if (!characterCreatorLoaded) {
        showErrorMessage('Character creator is still loading, please wait.');
        return;
    }
    
    try {
        hideStartScreen();
        showCharacterCreator();
        
        if (typeof window.initializeCharacterCreator === 'function') {
            window.initializeCharacterCreator();
            console.log('✅ Character creator opened');
        } else {
            throw new Error('Character creator not available');
        }
        
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        showErrorMessage('Failed to open character creator: ' + error.message);
        showStartScreen();
    }
}

/**
 * Load character creator module
 */
async function loadCharacterCreator() {
    try {
        updateLoadingStatus('Loading character creator...');
        
        const characterCreatorModule = await import('./character-creator.js');
        
        if (characterCreatorModule && characterCreatorModule.initializeCharacterCreator) {
            window.initializeCharacterCreator = characterCreatorModule.initializeCharacterCreator;
            characterCreatorLoaded = true;
            updateLoadingStatus('Ready to start!');
            console.log('✅ Character creator loaded');
        } else {
            throw new Error('Character creator module invalid');
        }
        
    } catch (error) {
        console.error('❌ Failed to load character creator:', error);
        characterCreatorLoaded = false;
        updateLoadingStatus('Error loading character creator', true);
        showErrorMessage('Failed to load character creator. Please refresh.');
    }
}

/**
 * MAIN GAME START - Called from character creator
 */
window.startGameWithCharacters = async function(charactersFromCreator) {
    try {
        console.log('🎮 Starting Office Purgatory...');
        
        // Process characters
        let characters = charactersFromCreator && charactersFromCreator.length > 0 
            ? charactersFromCreator 
            : generateDefaultCharacters();
        
        // Ensure player character
        let playerCharacter = characters.find(char => char.isPlayer);
        if (!playerCharacter && characters.length > 0) {
            characters[0].isPlayer = true;
            playerCharacter = characters[0];
        }
        
        focusTargetId = playerCharacter?.id;
        
        // Initialize systems
        console.log('🎯 Initializing systems...');
        gameEngine = new GameEngine();
        characterManager = new CharacterManager();
        uiUpdater = new UIUpdater();
        movementSystem = new MovementSystem();
        
        // Load world
        console.log('🗺️ Loading world...');
        const mapData = await loadMapData();
        const { World } = await import('./src/core/world/world.js');
        gameEngine.world = new World(mapData);
        
        // Position characters
        characters.forEach(character => {
            if (!character.position || character.position.x === 0) {
                character.position = gameEngine.world.getRandomWalkablePosition();
            }
        });
        
        // Add characters to manager
        for (const character of characters) {
            characterManager.addCharacter(character);
        }
        
        // Initialize renderer (moved to game-utils.js)
        renderer = await initializeRenderer(gameEngine, mapData, characters);
        
        // Setup UI
        if (uiUpdater && playerCharacter) {
            uiUpdater.setFocusCharacter(playerCharacter);
            uiUpdater.updateAll();
        }
        
        // Start game
        gameEngine.setCharacterManager(characterManager);
        gameEngine.setMovementSystem(movementSystem);
        gameEngine.start();
        
        // Show game
        hideCharacterCreator();
        showGameView();
        
        console.log('🎉 Game started successfully!');
        updateLoadingStatus('Game loaded!');
        
    } catch (error) {
        console.error('❌ Failed to start game:', error);
        updateLoadingStatus('Failed to start game', true);
        showErrorMessage('Failed to start game. Please refresh.');
    }
};

/**
 * Handle world click for movement
 */
function handleWorldClick(event) {
    if (!gameEngine || !characterManager || !movementSystem) return;

    const rect = event.target.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (!focusCharacter) return;

    // Convert to world coordinates
    const worldBounds = gameEngine.world.getWorldBounds();
    const worldX = (canvasX / rect.width) * worldBounds.width;
    const worldY = (canvasY / rect.height) * worldBounds.height;
    
    const targetPosition = { 
        x: Math.max(worldBounds.tileSize, Math.min(worldBounds.width - worldBounds.tileSize, worldX)),
        y: Math.max(worldBounds.tileSize, Math.min(worldBounds.height - worldBounds.tileSize, worldY))
    };

    const success = movementSystem.moveCharacterTo(focusCharacter, targetPosition, gameEngine.world);
    console.log(`🖱️ Movement ${success ? 'started' : 'failed'} for ${focusCharacter.name}`);
}

/**
 * Handle right-click to stop movement
 */
function handleRightClick(event) {
    event.preventDefault();
    
    if (!gameEngine || !characterManager || !movementSystem) return;
    
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (focusCharacter) {
        movementSystem.stopCharacter(focusCharacter);
        console.log(`⏹️ Stopped ${focusCharacter.name}`);
    }
}

/**
 * Modal and screen management
 */
function showCharacterCreator() {
    const modal = document.getElementById('creator-modal-backdrop');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    }
}

function hideCharacterCreator() {
    const modal = document.getElementById('creator-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

function showStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.style.display = 'flex';
        startScreen.classList.remove('hidden');
    }
}

function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.style.display = 'none';
        startScreen.classList.add('hidden');
    }
}

function showGameView() {
    const gameView = document.getElementById('game-view');
    if (gameView) {
        gameView.style.display = 'flex';
        gameView.classList.remove('hidden');
    }
}

/**
 * Utility functions
 */
function updateLoadingStatus(message, isError = false) {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = isError ? '#e74c3c' : '#2c3e50';
    }
    console.log(`📢 Status: ${message}`);
}

function showErrorMessage(message, isRecoverable = true) {
    console.error('🚨 Error:', message);
    updateLoadingStatus(`Error: ${message}`, true);
    
    if (isRecoverable) {
        const retry = confirm(`${message}\n\nRefresh the page?`);
        if (retry) window.location.reload();
    } else {
        alert(message);
    }
}

console.log('🎮 Main.js loaded - Core initialization ready');
