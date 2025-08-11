/**
 * Main.js - Game initialization and coordination
 * CORRECT FIX: Use the actual method names that exist in the codebase
 * - characterManager.initializeCharacterPositions() EXISTS and is kept
 * - renderer.addCharacter() does NOT exist, replaced with renderer.renderCharacter()
 * 
 * PHASE 4 ADDITIONS:
 * - Enhanced handleWorldClick for click-to-move functionality
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';

// Global game state for Stage 3
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
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
 * Initialize UI elements and inject required styles
 */
function initializeUIElements() {
    console.log('🎨 Initializing UI elements...');
    
    // Hide initial screens
    hideStartScreen();
    hideCharacterCreator();
    hideGameView();
    
    // Setup status panel tabs  
    setupStatusPanelTabs();
    
    // Inject tab CSS fixes
    injectTabCSS();
    
    // Show start screen
    showStartScreen();
    
    console.log('✅ UI elements initialized');
}

/**
 * Inject CSS fixes for tab alignment
 */
function injectTabCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Tab alignment fixes */
        .tab-bar {
            display: flex;
            border-bottom: 1px solid #333;
            background: #1a1a1a;
        }
        
        .tab-link {
            padding: 10px 20px;
            background: transparent;
            color: #888;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .tab-link:hover {
            background: #2a2a2a;
            color: #fff;
        }
        
        .tab-link.active {
            background: #333;
            color: #0ff;
            border-bottom: 2px solid #0ff;
            margin-bottom: -1px;
        }
        
        .tab-content {
            display: none;
            padding: 15px;
            min-height: 200px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Ensure proper z-index for tab bar */
        .tab-bar {
            z-index: 10;
            margin-top: -1px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Ensure the widget container has proper flex layout */
        .widget.flex-grow {
            display: flex;
            flex-direction: column;
        }
        
        .widget .flex-grow {
            flex: 1;
            overflow-y: auto;
        }
