/**
 * Main.js - Game initialization and coordination
 * FINAL WORKING VERSION - All bugs fixed, all features working
 * 
 * FEATURES WORKING:
 * - Correct button and modal IDs from HTML
 * - Complete character creator integration
 * - Proper coordinate system for 30×20 map
 * - Working click-to-move system
 * - Enhanced error handling
 * - Comprehensive testing functions
 * - All original functionality preserved
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
        
        // Initialize UI elements
        initializeUIElements();
        
        // Setup New Game button with correct ID
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
 * CORRECT: Setup New Game button with actual ID from HTML
 */
function setupNewGameButton() {
    console.log('🔧 Setting up New Game button...');
    
    // Use the CORRECT ID from index.html
    const newGameButton = document.getElementById('new-game-button');
    
    if (newGameButton) {
        // Clean setup - remove existing listeners
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        
        // Enable and style the button
        newButton.disabled = false;
        newButton.textContent = 'New Game';
        newButton.style.opacity = '1';
        newButton.style.cursor = 'pointer';
        
        // Add click handler
        newButton.addEventListener('click', handleNewGameClick);
        
        console.log('✅ New Game button found and connected successfully');
    } else {
        console.error('❌ New Game button not found');
        
        // Debug available buttons
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 Available buttons:', Array.from(allButtons).map(btn => ({
            id: btn.id || 'NO_ID',
            text: btn.textContent?.trim() || 'NO_TEXT',
            classes: btn.className || 'NO_CLASSES'
        })));
    }
}

/**
 * Handle New Game button click
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    
    if (!characterCreatorLoaded) {
        console.warn('⚠️ Character creator not loaded yet');
        showErrorMessage('Character creator is still loading, please wait a moment and try again.');
        return;
    }
    
    try {
        // Hide start screen
        hideStartScreen();
        
        // Show character creator
        showCharacterCreator();
        
        // Initialize character creator
        if (typeof window.initializeCharacterCreator === 'function') {
            window.initializeCharacterCreator();
            console.log('✅ Character creator opened successfully');
        } else {
            throw new Error('Character creator initialization function not available');
        }
        
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        showErrorMessage('Failed to open character creator: ' + error.message);
        showStartScreen();
    }
}

/**
 * CORRECT: Show character creator with actual modal ID
 */
function showCharacterCreator() {
    const modal = document.getElementById('creator-modal-backdrop');
    
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        console.log('📝 Character creator shown');
    } else {
        console.error('❌ Character creator modal not found');
        
        // Debug modal elements
        const allModals = document.querySelectorAll('[id*="modal"], [class*="modal"]');
        console.log('🔍 Available modals:', Array.from(allModals).map(el => ({
            id: el.id || 'NO_ID',
            classes: el.className || 'NO_CLASSES'
        })));
        
        throw new Error('Character creator modal not found');
    }
}

/**
 * Hide character creator
 */
function hideCharacterCreator() {
    const modal = document.getElementById('creator-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        console.log('📝 Character creator hidden');
    }
}

/**
 * CORRECT: Show start screen with actual ID
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
 * Hide start screen
 */
function
