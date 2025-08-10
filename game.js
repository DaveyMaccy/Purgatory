import { GameEngine } from './src/core/gameEngine.js';
import { Character } from './src/core/characters/character.js';
import { CharacterManager } from './src/core/characters/characterManager.js';
import { World } from './src/core/world/world.js';

// Load office layout (example - should come from actual game assets)
const officeLayout = {
    width: 1000,
    height: 800,
    objects: [
        // Define walls, desks, etc.
        { type: 'wall', x: 0, y: 0, width: 1000, height: 20 },
        { type: 'wall', x: 0, y: 780, width: 1000, height: 20 },
        { type: 'wall', x: 0, y: 20, width: 20, height: 760 },
        { type: 'wall', x: 980, y: 20, width: 20, height: 760 },
        { type: 'desk', x: 100, y: 100, width: 80, height: 60 },
        { type: 'desk', x: 200, y: 100, width: 80, height: 60 },
        // Add more objects as needed
    ]
};

// Initialize game components
const characterManager = new CharacterManager();
const gameEngine = new GameEngine(characterManager, officeLayout);

// Create player character
const playerCharacter = new Character({
    id: 'player_1',
    name: 'Alex',
    isPlayer: true,
    jobRole: 'Senior Developer',
    personalityTags: ['Creative', 'Introverted'],
    position: { x: 300, y: 200 },
    api: {
        key: '',
        provider: 'gemini-2.0-flash-lite'
    }
});

// Create NPCs
const npc1 = new Character({
    id: 'npc_1',
    name: 'Sarah',
    jobRole: 'Project Manager',
    personalityTags: ['Extroverted', 'Organized'],
    position: { x: 400, y: 300 },
    api: {
        key: '',
        provider: 'gemini-2.0-flash-lite'
    }
});

const npc2 = new Character({
    id: 'npc_2',
    name: 'Mark',
    jobRole: 'Junior Developer',
    personalityTags: ['Energetic', 'Insecure'],
    position: { x: 200, y: 300 },
    api: {
        key: '',
        provider: 'gemini-2.0-flash-lite'
    }
});

// Add characters to the game
gameEngine.characterManager.addCharacter(playerCharacter);
gameEngine.characterManager.addCharacter(npc1);
gameEngine.characterManager.addCharacter(npc2);

// Start the game
gameEngine.start();

console.log('Office Purgatory Simulator started!');
