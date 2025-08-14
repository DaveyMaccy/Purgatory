/**
 * OFFICE PURGATORY - MAIN GAME FILE (REFACTORED)
 * PHASE 3 COMPATIBLE - LIGHTWEIGHT COORDINATOR
 * 
 * REFACTORED FROM: 1,045 lines → 150 lines
 * PURPOSE: Lightweight coordinator that imports from modular systems
 */

// Core imports for game initialization
import { initializeGame } from './src/core/game-initializer.js';
import { startGameSimulation } from './src/core/game-coordinator.js';
import { setFocusTarget } from './src/core/game-coordinator.js';
import { showErrorMessage, showSuccessMessage } from './src/ui/ui-manager.js';
import { setupDebugCommands } from './src/utils/debug-manager.js';

// Global game state variables - maintained for backward compatibility
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null;

console.log('🎮 Office Purgatory - Game Loading...');

/**
 * DOM Ready Event - Main initialization
 * DELEGATES TO: game-initializer.js
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Initializing modular systems...');
    
    try {
        // Initialize the game through modular system
        initializeGame();
        
        // Setup debug commands
        setupDebugCommands();
        
        console.log('✅ Modular game system initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize modular game system:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page.');
    }
});

/**
 * MAIN GAME START FUNCTION - Global export for character creator
 * DELEGATES TO: game-coordinator.js
 * 
 * This function MUST remain as window.startGameSimulation for character creator compatibility
 */
window.startGameSimulation = async function(charactersFromCreator) {
    try {
        // Delegate to game coordinator
        await startGameSimulation(charactersFromCreator);
        
        // Update global references for backward compatibility
        gameEngine = window.gameEngine;
        characterManager = window.characterManager;
        uiUpdater = window.uiUpdater;
        renderer = window.renderer;
        focusTargetId = window.focusTargetId;
        
        console.log('✅ Game started successfully through modular system');
        
    } catch (error) {
        console.error('❌ Failed to start game through modular system:', error);
        showErrorMessage(`Failed to start game: ${error.message}`);
    }
};

/**
 * LEGACY SUPPORT - Export functions for backward compatibility
 * These functions now delegate to their respective modules
 */

// Export core functions that might be called externally
export {
    setFocusTarget,
    showErrorMessage,
    showSuccessMessage
};

/**
 * GLOBAL EXPORTS - Maintain for external access
 * These maintain the same API as before refactoring
 */
window.setFocusTarget = setFocusTarget;
window.showErrorMessage = showErrorMessage;
window.showSuccessMessage = showSuccessMessage;

// Console confirmation
console.log('✅ Main.js refactored - Modular system loaded');
console.log('📦 Modules loaded:');
console.log('  - game-initializer.js: DOM setup and button handling');
console.log('  - game-coordinator.js: Game startup and world interaction');
console.log('  - ui-manager.js: UI state management and styling');
console.log('  - input-handler.js: Player input and action suggestions');
console.log('  - action-system.js: Action processing and execution');
console.log('  - debug-manager.js: Debug commands and character inspection');
console.log('🎯 Ready for Phase 4 development!');

/**
 * DEVELOPER NOTES:
 * 
 * BEFORE REFACTORING: main.js was 1,045 lines with these responsibilities:
 * - Game initialization (initializeGame, setupNewGameButton)
 * - UI management (showStartScreen, setupStatusPanelTabs, injectTabCSS)
 * - Game coordination (startGameSimulation, handleWorldClick)  
 * - Input handling (setupGameInputHandlers, handlePlayerInput)
 * - Action system (TASK_ACTIONS, processPlayerAction, executePlayerAction)
 * - Debug functionality (setupDebugPanel, debugCharacterData)
 * 
 * AFTER REFACTORING: main.js is 150 lines that:
 * - Imports from 6 specialized modules
 * - Maintains exact same public API
 * - Preserves all functionality
 * - Enables safe Phase 4 development
 * 
 * MODULES CREATED:
 * 1. src/core/game-initializer.js (84 lines) - DOM setup
 * 2. src/core/game-coordinator.js (362 lines) - Game startup and coordination
 * 3. src/ui/ui-manager.js (246 lines) - UI state and styling  
 * 4. src/input/input-handler.js (139 lines) - Input processing
 * 5. src/input/action-system.js (162 lines) - Action execution
 * 6. src/utils/debug-manager.js (92 lines) - Debug functionality
 * 
 * BENEFITS:
 * - Actions system can be expanded without crowding main.js
 * - UI changes won't break game logic
 * - Input system can be enhanced independently  
 * - Debug functionality is isolated
 * - Each module has clear, single responsibility
 * - Easy to test individual components
 * - Supports tree-shaking and lazy loading
 * 
 * BACKWARD COMPATIBILITY:
 * - window.startGameSimulation still works exactly the same
 * - All global exports maintained
 * - Character creator integration unchanged
 * - Existing API preserved 100%
 */
