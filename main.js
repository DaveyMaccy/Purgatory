/**
 * COMPLETE BUTTON FIX - All game buttons working properly
 * 
 * This fixes:
 * 1. New Game button not working
 * 2. Start Simulation button conflicts
 * 3. Character creator initialization issues
 * 4. Multiple DOM ready handlers conflicting
 * 5. Proper button event handling sequence
 */

import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
import { loadMapData } from './src/core/world/world.js';

// Global game state
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null;

// Character creator state
let characters = [];
let currentCharacterIndex = 0;

// Constants for character creation (consolidated here to avoid conflicts)
const JOB_ROLES_BY_OFFICE = {
    "Corporate": ["Senior Coder", "Junior Coder", "Team Lead", "QA Specialist", "DevOps"],
    "Creative": ["Art Director", "Graphic Designer", "Copywriter", "UX Designer", "Creative Producer"],
    "Healthcare": ["Nurse", "Admin", "Doctor", "Technician", "Receptionist"],
    "Education": ["Teacher", "Principal", "Counselor", "Librarian", "Admin"]
};

const PERSONALITY_TAGS = [
    "Creative", "Introverted", "Extroverted", "Ambitious", "Laid-back", "Analytical", 
    "Empathetic", "Competitive", "Collaborative", "Independent", "Detail-oriented", 
    "Big-picture", "Optimistic", "Pessimistic", "Humorous", "Serious", "Spontaneous", 
    "Organized", "Flexible", "Stubborn", "Patient", "Impatient", "Confident", 
    "Self-doubting", "Innovative", "Traditional", "Risk-taker", "Cautious", "Witty", "Flirty"
];

const INVENTORY_OPTIONS = [
    "Coffee Mug", "Smartphone", "Notebook", "Pen", "Laptop Charger", "Headphones", 
    "Energy Bar", "Hand Sanitizer", "Reading Glasses", "Flash Drive", "Stress Ball", 
    "Office Keys", "Business Cards", "Breath Mints", "Phone Charger"
];

const DESK_ITEM_OPTIONS = [
    "Family Photo", "Plant", "Calendar", "Desk Lamp", "Coffee Maker", "Radio", 
    "Stress Ball", "Award Trophy", "Book", "Fidget Toy", "Tissue Box", "Stapler"
];

const SPRITE_OPTIONS = [
    "assets/characters/character-01.png",
    "assets/characters/character-02.png", 
    "assets/characters/character-03.png",
    "assets/characters/character-04.png",
    "assets/characters/character-05.png"
];

const NUM_CHARACTERS = 5;

/**
 * MAIN DOM READY - CONSOLIDATED EVENT HANDLER
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Office Purgatory - Starting initialization...');
    
    // Initialize all buttons immediately
    initializeAllButtons();
    
    // Setup UI elements
    initializeUIElements();
    
    console.log('✅ Game initialization complete - All buttons ready!');
});

/**
 * FIXED: Initialize all buttons with proper event handlers
 */
function initializeAllButtons() {
    console.log('🔧 Initializing all buttons...');
    
    // 1. NEW GAME BUTTON
    const newGameButton = document.getElementById('new-game-button');
    if (newGameButton) {
        // Remove any existing listeners
        const newButton = newGameButton.cloneNode(true);
        newGameButton.parentNode.replaceChild(newButton, newGameButton);
        
        // Add fresh event listener
        newButton.disabled = false;
        newButton.addEventListener('click', handleNewGameClick);
        console.log('✅ New Game button initialized');
    } else {
        console.warn('⚠️ New Game button not found');
        // Auto-start for testing if button missing
        setTimeout(handleNewGameClick, 1000);
    }
    
    // 2. START SIMULATION BUTTON (will be initialized when character creator opens)
    // This is handled in openCharacterCreator()
    
    // 3. RANDOMIZE BUTTON (will be initialized when character creator opens)
    // This is handled in openCharacterCreator()
    
    console.log('🔧 Button initialization complete');
}

/**
 * FIXED: Handle New Game button click
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    
    try {
        // Hide start screen
        const startScreen = document.getElementById('start-screen-backdrop');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // Show character creator
        const creatorModal = document.getElementById('creator-modal-backdrop');
        if (creatorModal) {
            creatorModal.style.display = 'flex';
            creatorModal.classList.remove('hidden');
        }
        
        // Initialize character creator
        initializeCharacterCreator();
        
        console.log('✅ Character creator opened');
        
    } catch (error) {
        console.error('❌ Failed to open character creator:', error);
        // Fallback: start with default characters
        startGameWithFallbackCharacters();
    }
}

/**
 * FIXED: Initialize character creator with working buttons
 */
function initializeCharacterCreator() {
    console.log('🎭 Initializing character creator...');
    
    try {
        // Clear any existing characters
        characters = [];
        currentCharacterIndex = 0;
        
        // Get DOM elements
        const tabsContainer = document.getElementById('character-tabs');
        const panelsContainer = document.getElementById('character-panels');
        
        if (!tabsContainer || !panelsContainer) {
            throw new Error('Character creator DOM elements not found');
        }
        
        // Clear containers
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';
        
        // Create characters and UI
        for (let i = 0; i < NUM_CHARACTERS; i++) {
            characters.push(createCharacter(i));
            createCharacterTab(i);
            createCharacterPanel(i);
        }
        
        // Set first tab as active
        switchToTab(0);
        
        // FIXED: Initialize character creator buttons
        initializeCharacterCreatorButtons();
        
        console.log('✅ Character creator initialized with working buttons');
        
    } catch (error) {
        console.error('❌ Character creator initialization failed:', error);
        startGameWithFallbackCharacters();
    }
}

/**
 * FIXED: Initialize character creator buttons properly
 */
function initializeCharacterCreatorButtons() {
    console.log('🔧 Setting up character creator buttons...');
    
    // 1. START SIMULATION BUTTON
    const startButton = document.getElementById('start-simulation-button');
    if (startButton) {
        // Remove existing listeners by replacing the element
        const newStartButton = startButton.cloneNode(true);
        startButton.parentNode.replaceChild(newStartButton, startButton);
        
        // Add fresh event listener
        newStartButton.addEventListener('click', handleStartSimulation);
        console.log('✅ Start Simulation button connected');
    } else {
        console.warn('⚠️ Start Simulation button not found');
    }
    
    // 2. RANDOMIZE BUTTON
    const randomizeButton = document.getElementById('randomize-btn');
    if (randomizeButton) {
        // Remove existing listeners by replacing the element
        const newRandomizeButton = randomizeButton.cloneNode(true);
        randomizeButton.parentNode.replaceChild(newRandomizeButton, randomizeButton);
        
        // Add fresh event listener
        newRandomizeButton.addEventListener('click', handleRandomizeAll);
        console.log('✅ Randomize button connected');
    } else {
        console.warn('⚠️ Randomize button not found');
    }
}

/**
 * FIXED: Handle Start Simulation button click
 */
function handleStartSimulation() {
    console.log('🚀 Start Simulation clicked!');
    
    try {
        // Update characters from form data
        updateCharactersFromForms();
        
        // Validate characters
        validateCharacters();
        
        // Convert to game format
        const gameCharacters = formatCharactersForGame();
        
        // Start the game
        startGameSimulation(gameCharacters);
        
    } catch (error) {
        console.error('❌ Failed to start simulation:', error);
        alert(`Failed to start simulation: ${error.message}`);
    }
}

/**
 * FIXED: Handle Randomize All button click
 */
function handleRandomizeAll() {
    console.log('🎲 Randomize All clicked!');
    
    try {
        // Randomize all characters
        for (let i = 0; i < NUM_CHARACTERS; i++) {
            characters[i] = createRandomCharacter(i);
        }
        
        // Update UI
        refreshCharacterCreatorUI();
        
        console.log('✅ All characters randomized');
        
    } catch (error) {
        console.error('❌ Failed to randomize characters:', error);
    }
}

/**
 * Create a character with default or random values
 */
function createCharacter(index) {
    return {
        id: `char_${index}`,
        name: `Character ${index + 1}`,
        isPlayer: index === 0,
        spriteSheet: SPRITE_OPTIONS[index % SPRITE_OPTIONS.length] || null,
        jobRole: JOB_ROLES_BY_OFFICE.Corporate[0],
        physicalAttributes: { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 },
        skills: { competence: 5, laziness: 5, charisma: 5, leadership: 5 },
        personalityTags: ['Friendly'],
        needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
        inventory: ['Coffee Mug'],
        deskItems: ['Plant'],
        relationships: {}
    };
}

/**
 * Create a randomized character
 */
function createRandomCharacter(index) {
    const randomTags = getRandomItems(PERSONALITY_TAGS, 2, 5);
    const randomInventory = getRandomItems(INVENTORY_OPTIONS, 1, 3);
    const randomDeskItems = getRandomItems(DESK_ITEM_OPTIONS, 1, 2);
    
    return {
        id: `char_${index}`,
        name: generateRandomName(),
        isPlayer: index === 0, // Keep first character as player
        spriteSheet: getRandomItem(SPRITE_OPTIONS),
        jobRole: getRandomItem(JOB_ROLES_BY_OFFICE.Corporate),
        physicalAttributes: {
            age: Math.floor(Math.random() * 20) + 25,
            height: Math.floor(Math.random() * 30) + 160,
            weight: Math.floor(Math.random() * 40) + 60,
            build: getRandomItem(['Slim', 'Average', 'Athletic', 'Heavy']),
            looks: Math.floor(Math.random() * 10) + 1
        },
        skills: {
            competence: Math.floor(Math.random() * 10) + 1,
            laziness: Math.floor(Math.random() * 10) + 1,
            charisma: Math.floor(Math.random() * 10) + 1,
            leadership: Math.floor(Math.random() * 10) + 1
        },
        personalityTags: randomTags,
        needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
        inventory: randomInventory,
        deskItems: randomDeskItems,
        relationships: {}
    };
}

/**
 * Helper functions
 */
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateRandomName() {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Lee'];
    return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

/**
 * Create character tab
 */
function createCharacterTab(index) {
    const tabsContainer = document.getElementById('character-tabs');
    const tab = document.createElement('button');
    tab.textContent = `Character ${index + 1}`;
    tab.className = index === 0 ? 'active' : '';
    tab.onclick = () => switchToTab(index);
    tabsContainer.appendChild(tab);
}

/**
 * Create character panel (simplified)
 */
function createCharacterPanel(index) {
    const panelsContainer = document.getElementById('character-panels');
    const panel = document.createElement('div');
    panel.id = `character-panel-${index}`;
    panel.className = `creator-panel ${index === 0 ? '' : 'hidden'}`;
    
    const character = characters[index];
    const jobOptions = JOB_ROLES_BY_OFFICE.Corporate
        .map(role => `<option value="${role}" ${role === character.jobRole ? 'selected' : ''}>${role}</option>`)
        .join('');
    
    panel.innerHTML = `
        <div class="space-y-4 p-4">
            <div class="form-group">
                <label for="name-${index}">Character Name</label>
                <input type="text" id="name-${index}" value="${character.name}" class="w-full p-2 border rounded">
            </div>
            
            <div class="form-group">
                <label for="jobRole-${index}">Job Role</label>
                <select id="jobRole-${index}" class="w-full p-2 border rounded">${jobOptions}</select>
            </div>

            <div class="form-group">
                <label>
                    <input type="checkbox" id="isPlayer-${index}" ${character.isPlayer ? 'checked' : ''}>
                    Player Character
                </label>
            </div>
            
            <div class="form-group">
                <strong>Personality:</strong> ${character.personalityTags.join(', ')}
            </div>
            
            <div class="form-group">
                <strong>Skills:</strong>
                <ul class="text-sm">
                    <li>Competence: ${character.skills.competence}/10</li>
                    <li>Charisma: ${character.skills.charisma}/10</li>
                    <li>Leadership: ${character.skills.leadership}/10</li>
                </ul>
            </div>
        </div>
    `;
    
    panelsContainer.appendChild(panel);
}

/**
 * Switch to a character tab
 */
function switchToTab(index) {
    currentCharacterIndex = index;
    
    // Update tab appearances
    document.querySelectorAll('#character-tabs button').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    // Update panel visibility
    document.querySelectorAll('.creator-panel').forEach((panel, i) => {
        panel.classList.toggle('hidden', i !== index);
    });
}

/**
 * Update characters from form inputs
 */
function updateCharactersFromForms() {
    characters.forEach((char, index) => {
        const nameInput = document.getElementById(`name-${index}`);
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
        
        if (nameInput) char.name = nameInput.value || char.name;
        if (jobRoleSelect) char.jobRole = jobRoleSelect.value || char.jobRole;
        if (isPlayerCheckbox) char.isPlayer = isPlayerCheckbox.checked;
    });
}

/**
 * Validate characters before starting game
 */
function validateCharacters() {
    if (characters.length === 0) {
        throw new Error('No characters created');
    }
    
    // Ensure at least one player
    const playerCount = characters.filter(char => char.isPlayer).length;
    if (playerCount === 0) {
        characters[0].isPlayer = true;
    } else if (playerCount > 1) {
        // Keep only first player
        let foundFirst = false;
        characters.forEach(char => {
            if (char.isPlayer && foundFirst) {
                char.isPlayer = false;
            } else if (char.isPlayer) {
                foundFirst = true;
            }
        });
    }
    
    // Ensure all have names
    characters.forEach((char, index) => {
        if (!char.name || char.name.trim() === '') {
            char.name = `Character ${index + 1}`;
        }
    });
}

/**
 * Format characters for game engine
 */
function formatCharactersForGame() {
    return characters.map(char => ({
        ...char,
        position: { x: 0, y: 0 },
        actionState: 'idle',
        mood: 'Neutral',
        relationships: {},
        currentAction: null,
        assignedTask: null
    }));
}

/**
 * Refresh character creator UI
 */
function refreshCharacterCreatorUI() {
    const panelsContainer = document.getElementById('character-panels');
    if (panelsContainer) {
        panelsContainer.innerHTML = '';
        for (let i = 0; i < NUM_CHARACTERS; i++) {
            createCharacterPanel(i);
        }
        switchToTab(currentCharacterIndex);
    }
}

/**
 * MAIN GAME START FUNCTION
 */
async function startGameSimulation(charactersFromCreator) {
    try {
        console.log('🚀 Starting game simulation with characters:', charactersFromCreator);
        
        // Hide character creator
        const creatorModal = document.getElementById('creator-modal-backdrop');
        if (creatorModal) {
            creatorModal.style.display = 'none';
        }
        
        // Show game world
        const gameContainer = document.getElementById('main-game-ui');
        if (gameContainer) {
            gameContainer.style.display = 'flex';
            gameContainer.classList.remove('hidden');
        }
        
        // Initialize game systems
        characterManager = new CharacterManager();
        characterManager.loadCharacters(charactersFromCreator);
        
        const playerCharacter = characterManager.getPlayerCharacter();
        if (playerCharacter) {
            focusTargetId = playerCharacter.id;
            console.log(`🎯 Focus set to player: ${playerCharacter.name}`);
        }
        
        uiUpdater = new UIUpdater(characterManager);
        characterManager.characters.forEach(character => {
            uiUpdater.subscribeToCharacter(character);
        });
        
        gameEngine = new GameEngine();
        gameEngine.characterManager = characterManager;
        gameEngine.setUIUpdater(uiUpdater);
        
        const mapData = await loadMapData();
        console.log('🗺️ Map data loaded');
        
        const worldContainer = document.getElementById('world-canvas-container');
        if (worldContainer) {
            renderer = new Renderer(worldContainer);
            await renderer.initialize();
            gameEngine.setRenderer(renderer);
            renderer.renderMap(mapData);
            console.log('🎨 Renderer initialized');
        }
        
        gameEngine.initialize(mapData);
        
        if (gameEngine.world) {
            characterManager.initializeCharacterPositions(gameEngine.world);
            
            for (const character of characterManager.characters) {
                await renderer.addCharacter(character);
            }
            console.log('👥 Characters added to renderer');
        }
        
        if (focusTargetId) {
            const focusCharacter = characterManager.getCharacter(focusTargetId);
            if (focusCharacter) {
                uiUpdater.updateUI(focusCharacter);
            }
        }
        
        console.log('🎉 Game simulation started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start game simulation:', error);
        alert(`Failed to start game: ${error.message}`);
    }
}

/**
 * Fallback game start with default characters
 */
function startGameWithFallbackCharacters() {
    console.log('🔧 Starting with fallback characters...');
    
    const fallbackCharacters = [
        {
            id: 'fallback_1', name: 'Test Player', isPlayer: true, jobRole: 'Senior Coder',
            physicalAttributes: { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 },
            skills: { competence: 7, laziness: 3, charisma: 6, leadership: 5 },
            personalityTags: ['Analytical'], needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
            inventory: ['Coffee'], deskItems: ['Monitor'], relationships: {}
        },
        {
            id: 'fallback_2', name: 'Test NPC', isPlayer: false, jobRole: 'Junior Coder',
            physicalAttributes: { age: 25, height: 170, weight: 65, build: 'Slim', looks: 6 },
            skills: { competence: 5, laziness: 4, charisma: 7, leadership: 3 },
            personalityTags: ['Friendly'], needs: { energy: 7, hunger: 6, social: 9, comfort: 7, stress: 3 },
            inventory: ['Notebook'], deskItems: ['Plant'], relationships: {}
        }
    ];
    
    // Add 3 more characters to make 5 total
    for (let i = 2; i < 5; i++) {
        fallbackCharacters.push({
            ...fallbackCharacters[1],
            id: `fallback_${i + 1}`,
            name: `Test NPC ${i}`,
            isPlayer: false
        });
    }
    
    startGameSimulation(fallbackCharacters);
}

/**
 * Initialize UI elements
 */
function initializeUIElements() {
    // Basic UI setup
    console.log('✅ UI elements initialized');
}

// Make startGameSimulation available globally
window.startGameSimulation = startGameSimulation;

// Debug functions
window.debugGame = {
    getGameEngine: () => gameEngine,
    getCharacterManager: () => characterManager,
    getRenderer: () => renderer,
    getUIUpdater: () => uiUpdater,
    testNewGame: handleNewGameClick,
    testStartSim: handleStartSimulation
};

console.log('🎮 Main.js loaded - All buttons ready!');
