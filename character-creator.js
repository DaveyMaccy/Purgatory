// character-creator.js
/**
 * Character Creator - PHASE 3 RESTORED with modular structure
 * 
 * RESTORED FEATURES:
 * ✅ Complete character creation with tabs
 * ✅ Office type selector (Phase 3 feature)
 * ✅ Sprite navigation with arrows (individual sprites)
 * ✅ Add/remove characters (2-5 range)
 * ✅ Player character designation
 * ✅ Full attribute system (physical, skills, personality)
 * ✅ Inventory and desk items selection
 * ✅ Randomization with "Randomize All" option
 * ✅ Global API key with individual overrides
 * ✅ Gender-linked name generation
 * ✅ Complete form validation
 * ✅ FIXED sprite loading with fallback images
 * ✅ Works with existing index.html structure
 */

import { CharacterCreatorCore } from './src/character-creator/character-creator-core.js';
import { CharacterCreatorUI } from './src/character-creator/character-creator-ui.js';

/**
 * Main Character Creator Class
 * Coordinates between core logic and UI components
 */
class CharacterCreator {
    constructor() {
    /**
     * Close the character creator modal
     */
    close() {
        const modal = document.getElementById('creator-modal-backdrop');
        if (modal) {
            modal.classList.add('hidden');
        }

        // Show start screen again
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'flex';
        }

        console.log('📕 Character creator closed');
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
        
        // Make it globally accessible for debugging and legacy compatibility
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
 * Legacy function for backwards compatibility - opens the character creator modal
 */
window.openCharacterCreator = function() {
    if (characterCreatorInstance) {
        characterCreatorInstance.open();
    } else {
        console.error('❌ Character creator not initialized');
    }
};

/**
 * Legacy function for backwards compatibility - starts the game with character data
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

/**
 * Enhanced game state preparation for SSOT compatibility
 * Converts character creator data to full SSOT character objects
 */
function convertToSSOTCharacters(characters, officeType, globalAPIKey) {
    return characters.map((char, index) => ({
        // Basic identity
        id: `character_${index}`,
        name: char.name || `Character ${index + 1}`,
        jobRole: char.jobRole,
        isPlayer: char.isPlayer || false,
        
        // Visual representation
        spriteSheet: char.spriteSheet,
        spriteIndex: char.spriteIndex || 0,
        portrait: char.portrait || "",
        
        // Physical attributes
        physicalAttributes: {
            gender: char.physicalAttributes?.gender || "Male",
            build: char.physicalAttributes?.build || "Average"
        },
        
        // Skills (SSOT format)
        skills: {
            technical: char.skills?.technical || 50,
            creative: char.skills?.creative || 50,
            social: char.skills?.social || 50,
            leadership: char.skills?.leadership || 50,
            analytical: char.skills?.analytical || 50
        },
        
        // Personality
        personalityTags: char.personality?.tags || [],
        primaryTrait: char.personality?.primaryTrait || "",
        secondaryTrait: char.personality?.secondaryTrait || "",
        
        // Needs (SSOT format)
        needs: {
            energy: char.needs?.energy || 100,
            hunger: char.needs?.hunger || 100,
            social: char.needs?.social || 100,
            bladder: char.needs?.bladder || 100,
            entertainment: char.needs?.entertainment || 100
        },
        
        // Inventory and items
        inventory: char.inventory || [],
        deskItems: char.deskItems || [],
        
        // API configuration
        apiKey: char.apiKey || globalAPIKey || "",
        
        // Game engine required fields (SSOT compatibility)
        position: { x: 0, y: 0 },
        actionState: 'idle',
        mood: 'Neutral',
        facingAngle: 90,
        maxSightRange: 250,
        isBusy: false,
        currentAction: null,
        currentActionTranscript: [],
        pendingIntent: null,
        heldItem: null,
        conversationId: null,
        shortTermMemory: [],
        longTermMemory: [],
        longTermGoal: null,
        assignedTask: null,
        pixiArmature: null,
        
        // Initialize relationships with other characters
        relationships: characters.reduce((rel, otherChar, otherIndex) => {
            if (otherIndex !== index) {
                rel[`character_${otherIndex}`] = 50; // Neutral starting relationship
            }
            return rel;
        }, {})
    }));
}

/**
 * Enhanced start simulation function that creates SSOT-compatible game state
 */
window.startSimulation = function() {
    if (!characterCreatorInstance) {
        console.error('❌ Character creator not initialized');
        return;
    }

    const rawGameState = characterCreatorInstance.getGameState();
    if (!rawGameState) {
        alert('Please complete character creation before starting.');
        return;
    }

    // Convert to SSOT format
    const ssoTCharacters = convertToSSOTCharacters(
        rawGameState.characters, 
        rawGameState.officeType, 
        rawGameState.globalApiKey
    );

    const enhancedGameState = {
        characters: ssoTCharacters,
        officeType: rawGameState.officeType,
        globalApiKey: rawGameState.globalApiKey,
        gameTime: 0,
        gameDate: new Date().toISOString()
    };

    console.log('🚀 Starting simulation with enhanced game state:', enhancedGameState);

    // Hide start screen and character creator
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }

    const creatorModal = document.getElementById('creator-modal-backdrop');
    if (creatorModal) {
        creatorModal.classList.add('hidden');
    }

    // Show main game UI
    const gameUI = document.getElementById('main-game-ui');
    if (gameUI) {
        gameUI.classList.remove('hidden');
    }

    // Initialize main game
    if (window.initializeGame) {
        window.initializeGame(enhancedGameState);
    } else {
        console.error('❌ Main game initialization function not found');
        // Fallback: show basic game state
        console.log('📊 Game would start with:', enhancedGameState);
    }
};

// Export the class for testing purposes
export { CharacterCreator };

console.log('🎭 Character Creator - Phase 3 Restored with modular structure loaded and ready');.log('🎮 Initializing Character Creator...');
        
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
     * Setup modal open/close handlers for the existing HTML structure
     */
    setupModalHandlers() {
        // Open character creator from start screen
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.open();
            });
        }

        // Open from office selection modal (if it exists)
        const selectOfficeBtn = document.getElementById('select-office-button');
        if (selectOfficeBtn) {
            selectOfficeBtn.addEventListener('click', () => {
                // Hide office modal
                const officeModal = document.getElementById('office-type-modal-backdrop');
                if (officeModal) {
                    officeModal.classList.add('hidden');
                }
                // Show character creator
                this.open();
            });
        }

        // Close character creator on backdrop click
        const modal = document.getElementById('creator-modal-backdrop');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('creator-modal-backdrop');
                if (modal && !modal.classList.contains('hidden')) {
                    this.close();
                }
            }
        });

        console.log('🔗 Modal handlers setup complete');
    }

    /**
     * Open the character creator modal
     */
    open() {
        // Hide start screen
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }

        // Show character creator modal
        const modal = document.getElementById('creator-modal-backdrop');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('📖 Character creator opened');
        } else {
            console.error('❌ Character creator modal not found in DOM');
        }
    }

    /**
     * Close the character creator modal
     */
    close() {
        const modal = document.getElementById('creator-modal-backdrop');
        if (modal) {
            modal.classList.add('hidden');
        }

        // Show start screen again
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'flex';
        }

        console
