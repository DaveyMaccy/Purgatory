import { GameEngine } from './src/core/gameEngine.js';
import { CharacterManager } from './src/core/characters/characterManager.js';
import { UIUpdater } from './src/ui/uiUpdater.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterUI } from './character-creator.js';

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
        
        // Initialize character positions
        characterManager.initializeCharacterPositions
