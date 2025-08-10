import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';

// Global game state for Stage 3
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let focusTargetId = null;

// Game initialization function called when simulation starts
window.startGameSimulation = async function(charactersFromCreator) {
    try {
        console.log('Starting game simulation with characters:', charactersFromCreator);
        
        // Initialize character manager
        characterManager = new CharacterManager();
        
        // Load characters from the character creator
        characterManager.loadCharacters(charactersFromCreator);
        
        // Set the first player character as focus target
        const playerCharacter = characterManager.getPlayerCharacter();
        if (playerCharacter) {
            focusTargetId = playerCharacter.id;
            console.log(`Focus set to player: ${playerCharacter.name}`);
        }
        
        // Initialize UI updater
        uiUpdater = new UIUpdater(characterManager);
        
        // Subscribe UI updater to all characters for observer pattern
        characterManager.characters.forEach(character => {
            uiUpdater.subscribeToCharacter(character);
            console.log(`UI updater subscribed to: ${character.name}`);
        });
        
        // Initialize game engine
        gameEngine = new GameEngine();
        gameEngine.characterManager = characterManager;
        gameEngine.uiUpdater = uiUpdater;
        
        // Load map data
        const mapData = await loadMapData();
        console.log('Map data loaded successfully');
        
        // Initialize character positions (when world system is ready)
        if (gameEngine.world) {
            characterManager.initializeCharacterPositions(gameEngine.world);
        }
        
        // Start the game loop
        gameEngine.initialize(mapData);
        
        // Hide start screen and character creator
        hideStartScreen();
        hideCharacterCreator();
        
        // Show game world
        showGameWorld();
        
        // Start UI updates with initial focus character
        if (focusTargetId) {
            const focusCharacter = characterManager.getCharacter(focusTargetId);
            if (focusCharacter) {
                uiUpdater.updateUI(focusCharacter);
            }
        }
        
        console.log('Game simulation started successfully!');
        
    } catch (error) {
        console.error('Failed to start game simulation:', error);
        alert('Failed to start game. Please check the console for details.');
    }
};

// UI state management functions
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.style.display = 'none';
    }
}

function hideCharacterCreator() {
    const creator = document.getElementById('creator-modal-backdrop');
    if (creator) {
        creator.style.display = 'none';
    }
}

function showGameWorld() {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.style.display = 'flex';
        gameContainer.classList.remove('hidden');
    }
    
    // Also show the main game UI
    const mainGameUI = document.getElementById('main-game-ui');
    if (mainGameUI) {
        mainGameUI.classList.remove('hidden');
        mainGameUI.style.display = 'flex';
    }
}

function showCharacterCreator() {
    // Hide start screen
    hideStartScreen();
    
    // Show character creator modal
    const creator = document.getElementById('creator-modal-backdrop');
    if (creator) {
        creator.style.display = 'flex';
        creator.classList.remove('hidden');
    }
    
    // Initialize the character creator
    initializeCharacterCreator(null, 'Corporate');
    console.log('Character creator opened');
}

// Game loop function for Stage 3 - UI sync
function gameLoop(timestamp) {
    if (!gameEngine || !uiUpdater || !characterManager) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Get the current focus character
    const focusCharacter = focusTargetId ? 
        characterManager.getCharacter(focusTargetId) : 
        characterManager.getPlayerCharacter();
    
    if (focusCharacter) {
        // Update UI for the focus character
        uiUpdater.updateUI(focusCharacter);
    }
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Character focus switching (for Stage 3 testing)
window.switchFocusCharacter = function(characterId) {
    if (characterManager) {
        const character = characterManager.getCharacter(characterId);
        if (character) {
            focusTargetId = characterId;
            uiUpdater.updateUI(character);
            console.log(`Focus switched to: ${character.name}`);
        }
    }
};

// Utility function to get current game state (for debugging)
window.getGameState = function() {
    return {
        gameEngine,
        characterManager,
        uiUpdater,
        focusTargetId,
        characters: characterManager ? characterManager.characters : []
    };
};

// FIXED: Add New Game button event handler
function setupNewGameButton() {
    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton) {
        newGameButton.disabled = false;
        
        // Remove any existing event listeners
        newGameButton.removeEventListener('click', showCharacterCreator);
        
        // Add the click handler
        newGameButton.addEventListener('click', showCharacterCreator);
        
        console.log('New Game button enabled and connected');
    } else {
        console.error('New Game button not found in DOM');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main.js loaded - waiting for character creator to start simulation');
    
    // FIXED: Setup the New Game button
    setupNewGameButton();
    
    // Start the UI update loop
    requestAnimationFrame(gameLoop);
    
    // Setup basic character switching for testing (will be removed in later stages)
    setupCharacterSwitchingUI();
});

// Setup character switching UI for Stage 3 testing
function setupCharacterSwitchingUI() {
    // Add character switching buttons to the options area (temporary for Stage 3)
    const rightPanel = document.querySelector('.right-panel');
    if (rightPanel) {
        const switcherDiv = document.createElement('div');
        switcherDiv.id = 'character-switcher';
        switcherDiv.className = 'widget mt-4';
        switcherDiv.innerHTML = `
            <h3 class="font-bold mb-2 text-sm">Focus Character (Stage 3 Testing)</h3>
            <div id="character-switch-buttons" class="flex flex-wrap gap-2">
                <!-- Buttons will be added dynamically -->
            </div>
        `;
        rightPanel.appendChild(switcherDiv);
    }
}

// Update character switcher buttons when characters are loaded
window.updateCharacterSwitcher = function() {
    const buttonsContainer = document.getElementById('character-switch-buttons');
    if (!buttonsContainer || !characterManager) return;
    
    buttonsContainer.innerHTML = '';
    
    characterManager.characters.forEach(character => {
        const button = document.createElement('button');
        button.className = 'px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600';
        button.textContent = character.name;
        button.onclick = () => window.switchFocusCharacter(character.id);
        buttonsContainer.appendChild(button);
    });
};

// Debug functions for Stage 3 testing
window.testNeedsDecay = function() {
    if (!characterManager) return;
    
    characterManager.characters.forEach(character => {
        // Simulate time passing to test needs decay
        character.update(5000); // 5 seconds
        console.log(`${character.name} needs after decay:`, character.needs);
    });
};

window.testRelationshipChange = function() {
    if (!characterManager || characterManager.characters.length < 2) return;
    
    const char1 = characterManager.characters[0];
    const char2 = characterManager.characters[1];
    
    char1.updateRelationship(char2.id, 10);
    console.log(`Updated relationship between ${char1.name} and ${char2.name}`);
};

window.testTaskAssignment = function() {
    if (!characterManager) return;
    
    const character = characterManager.characters[0];
    character.setAssignedTask({
        type: 'TEST_TASK',
        displayName: 'Test Assignment',
        progress: 0.3
    });
    console.log(`Assigned test task to ${character.name}`);
};

window.testInventoryChange = function() {
    if (!characterManager) return;
    
    const character = characterManager.characters[0];
    character.addToInventory({
        id: 'test_item_1',
        name: 'Test Item',
        type: 'test_item'
    });
    console.log(`Added test item to ${character.name}'s inventory`);
};
