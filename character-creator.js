// character-creator.js
/**
 * Character Creator - COMPLETE RESTORED PHASE 3 VERSION
 * 
 * RESTORED FEATURES:
 * ✅ Complete character creation with tabs
 * ✅ Office type selector (Phase 3 feature)
 * ✅ Sprite navigation with arrows (20 individual sprites)
 * ✅ Add/remove characters (2-5 range)
 * ✅ Player character designation
 * ✅ Full attribute system (physical, skills, personality)
 * ✅ Inventory and desk items selection
 * ✅ Portrait upload and canvas system
 * ✅ Randomization with "Randomize All" option
 * ✅ Global API key with individual overrides
 * ✅ Gender-linked name generation
 * ✅ Complete form validation
 * 
 * CRITICAL FIXES:
 * ✅ Fixed sprite paths for individual sprites (not sprite sheets)
 * ✅ Proper game state connection
 * ✅ Enhanced error handling
 * ✅ Modular architecture for easier maintenance
 * ✅ Phase 3 layout and functionality restored
 */

import { CharacterCreatorCore } from './src/character-creator/character-creator-core.js';
import { CharacterCreatorUI } from './src/character-creator/character-creator-ui.js';

/**
 * Main Character Creator Class
 * Coordinates between core logic and UI components
 */
class CharacterCreator {
    constructor() {
        console.log('🎮 Initializing Character Creator...');
        
        // Initialize core logic
        this.core = new CharacterCreatorCore();
        
        // Initialize UI manager
        this.ui = new CharacterCreatorUI(this.core);
        
        // Track initialization state
        this.isInitialized = false;
        
        console.log('✅ Character Creator initialized');
    }

    /**
     * Initialize the character creator
     */
    async initialize() {
        try {
            console.log('🎨 Setting up character creator...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize UI
            await this.ui.initialize();
            
            // Setup modal event handlers
            this.setupModalHandlers();
            
            this.isInitialized = true;
            console.log('✅ Character creator setup complete');
            
        } catch (error) {
            console.error('❌ Failed to initialize character creator:', error);
            throw error;
        }
    }

    /**
     * Setup modal open/close handlers
     */
    setupModalHandlers() {
        // Open character creator
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.open();
            });
        }

        // Close character creator
        const closeBtn = document.querySelector('#character-creator-modal .close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // Close on outside click
        const modal = document.getElementById('character-creator-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
        }

        console.log('🔗 Modal handlers setup complete');
    }

    /**
     * Open the character creator modal
     */
    open() {
        const modal = document.getElementById('character-creator-modal');
        if (modal) {
            modal.style.display = 'flex';
            console.log('📖 Character creator opened');
        }
    }

    /**
     * Close the character creator modal
     */
    close() {
        const modal = document.getElementById('character-creator-modal');
        if (modal) {
            modal.style.display = 'none';
            console.log('📕 Character creator closed');
        }
    }

    /**
     * Get the current game state for starting the simulation
     */
    getGameState() {
        return this.core.getGameState();
    }

    /**
     * Get all characters
     */
    getCharacters() {
        return this.core.characters;
    }

    /**
     * Get office type
     */
    getOfficeType() {
        return this.core.officeType;
    }

    /**
     * Get global API key
     */
    getGlobalApiKey() {
        return this.core.globalApiKey;
    }
}

// Global character creator instance
let characterCreatorInstance = null;

/**
 * Initialize the character creator
 * Called from main.js
 */
export async function initializeCharacterCreator() {
    try {
        if (characterCreatorInstance) {
            console.log('⚠️ Character creator already initialized');
            return characterCreatorInstance;
        }

        console.log('🎮 Creating character creator instance...');
        characterCreatorInstance = new CharacterCreator();
        
        await characterCreatorInstance.initialize();
        
        // Make it globally accessible for debugging
        window.characterCreator = characterCreatorInstance;
        
        console.log('✅ Character creator ready');
        return characterCreatorInstance;
        
    } catch (error) {
        console.error('❌ Character creator initialization failed:', error);
        throw error;
    }
}

/**
 * Get the current character creator instance
 */
export function getCharacterCreator() {
    return characterCreatorInstance;
}

/**
 * Legacy function for backwards compatibility
 * Opens the character creator modal
 */
window.openCharacterCreator = function() {
    if (characterCreatorInstance) {
        characterCreatorInstance.open();
    } else {
        console.error('❌ Character creator not initialized');
    }
};

/**
 * Legacy function for backwards compatibility
 * Starts the game with character data
 */
window.startGame = function() {
    if (characterCreatorInstance) {
        const gameState = characterCreatorInstance.getGameState();
        if (gameState) {
            console.log('🚀 Starting game with character data:', gameState);
            
            // Close character creator
            characterCreatorInstance.close();
            
            // Initialize main game
            if (window.initializeGame) {
                window.initializeGame(gameState);
            } else {
                console.error('❌ Main game initialization function not found');
            }
        } else {
            console.error('❌ Invalid game state - check character validation');
        }
    } else {
        console.error('❌ Character creator not initialized');
    }
};

// Export the class for testing purposes
export { CharacterCreator };
