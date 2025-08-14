/**
 * GAME INITIALIZER - DOM initialization and button setup
 * EXTRACTED FROM: main.js lines 14-43 + 70-106
 * PURPOSE: Handle initial DOM setup and button connections
 */

import { initializeUIElements, showErrorMessage } from '../ui/ui-manager.js';
import { startGameWithFallbackCharacters } from './game-coordinator.js';
import { initializeCharacterCreator } from '../../character-creator.js';

/**
 * DOM Ready Event - Main initialization
 * EXACT CODE FROM: main.js lines 14-29
 */
export function initializeGame() {
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
}

/**
 * Setup New Game button with proper event handling
 * EXACT CODE FROM: main.js lines 70-93
 */
export function setupNewGameButton() {
    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton) {
        // Remove any existing listeners by cloning
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        
        // Enable and add event listener
        newButton.disabled = false;
        newButton.addEventListener('click', handleNewGameClick);
        
        console.log('✅ New Game button enabled and connected');
        
        // Update loading status to show loaded
        const loadingStatus = document.getElementById('loading-status');
        if (loadingStatus) loadingStatus.textContent = 'Loaded';
    } else {
        console.warn('⚠️ New Game button not found');
        // Auto-start for testing if button missing
        setTimeout(handleNewGameClick, 1000);
    }
}

/**
 * Handle New Game button click
 * EXACT CODE FROM: main.js lines 98-116
 */
export async function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    
    try {
        // Hide start screen
        const { hideStartScreen, showCharacterCreator } = await import('../ui/ui-manager.js');
        hideStartScreen();
        
        // Show character creator
        showCharacterCreator();
        
        // Initialize the character creator with Game Studio office type
        initializeCharacterCreator('Game Studio');
        
        console.log('✅ Character creator opened');
        
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        // Fallback: start with default characters
        startGameWithFallbackCharacters();
    }
}
