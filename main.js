import { GameEngine } from './src/core/gameEngine.js';
import { CharacterManager } from './src/core/characters/characterManager.js';
import { UIUpdater } from './src/ui/uiUpdater.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterUI } from './character-creator.js';

// Game initialization
async function startGame() {
    // Initialize character manager
    const characterManager = new CharacterManager();
    
    // Initialize game engine
    const gameEngine = new GameEngine();
    
    // Initialize UI updater
    const uiUpdater = new UIUpdater(characterManager);
    gameEngine.uiUpdater = uiUpdater;
    
    // Subscribe UI updater to all characters
    characterManager.characters.forEach(character => {
        uiUpdater.subscribeToCharacter(character);
    });
    
    // Load map data
    await loadMapData();
    
    // Initialize character UI
    initializeCharacterUI(characterManager);
    
    // Start game engine
    gameEngine.initialize();
    
    
    console.log('Game started successfully');
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', startGame);
