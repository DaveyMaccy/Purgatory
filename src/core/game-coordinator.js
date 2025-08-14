/**
 * GAME COORDINATOR - Main game startup and world interaction
 * EXTRACTED FROM: main.js lines 204-390 + 429-489 + other game functions
 * PURPOSE: Coordinate game startup, world clicks, and chunk updates
 */

import { GameEngine } from './game-engine.js';
import { CharacterManager } from './characters/character-manager.js';
import { UIUpdater } from '../ui/ui-updater.js';
import { Renderer } from '../rendering/renderer.js';
import { loadMapData } from './world/world.js';
import { showErrorMessage, showSuccessMessage } from '../ui/ui-manager.js';

/**
 * MAIN GAME START FUNCTION - Called from character creator
 * EXACT CODE FROM: main.js lines 204-389
 */
export async function startGameSimulation(charactersFromCreator) {
    try {
        console.log('🚀 Starting game simulation with characters:', charactersFromCreator);
        
        // Validate input
        if (!charactersFromCreator || charactersFromCreator.length === 0) {
            throw new Error('No characters provided to start game');
        }
        
        // Hide character creator
        const { hideCharacterCreator, showGameView } = await import('../ui/ui-manager.js');
        hideCharacterCreator();
        
        // Show game view
        showGameView();
        
        // Load map data first
        const mapData = await loadMapData();
        console.log('✅ Map data loaded');
        
        // Initialize character manager with characters
        window.characterManager = new CharacterManager();
        window.characterManager.loadCharacters(charactersFromCreator);
        console.log('✅ Character manager initialized');
        
        // Initialize renderer with world container - FIXED: Use correct container ID
        const worldContainer = document.getElementById('world-canvas-container');
        if (!worldContainer) {
            throw new Error('World canvas container not found');
        }
        
        window.renderer = new Renderer(worldContainer);
        await window.renderer.initialize(mapData);
        console.log('✅ Renderer initialized');
        
        // Initialize game engine with all systems
        window.gameEngine = new GameEngine(window.characterManager, window.renderer, mapData);
        
        console.log('✅ Game engine initialized');

        // Process the map data to understand its structure
        window.gameEngine.world.processMapData();

        // Perform the first chunk update immediately
        window.gameEngine.world.updateActiveChunks(window.characterManager.characters, window.renderer);
        
        // Initialize character positions using world navigation grid
        window.characterManager.initializeCharacterPositions(window.gameEngine.world);
        
        // Render all characters in the world
        const characters = window.characterManager.characters;
        characters.forEach(character => {
            // Use renderCharacter (the actual method that exists)
            window.renderer.renderCharacter(character);
            console.log(`✅ Rendered character: ${character.name}`);
        });

        // Assuming the first character is the player (or however you identify the player)
        const playerCharacter = window.characterManager.characters.find(char => char.isPlayer);
        if (playerCharacter) {
            window.renderer.setPlayerCharacter(playerCharacter.id);
        }
        
       // Initialize UI updater for real-time status updates
        window.uiUpdater = new UIUpdater(window.characterManager);
        console.log('✅ UI updater initialized');
        
        // Setup player input handling
        const { setupGameInputHandlers } = await import('../input/input-handler.js');
        setupGameInputHandlers();
        console.log('✅ Player input system initialized');

        // DEBUG: Check character data structure
        const { debugCharacterData } = await import('../utils/debug-manager.js');
        debugCharacterData();
        
        // FIXED: Set up character switching and initial UI update
        setupCharacterSwitching();
        
        // Perform initial UI update
        const initialCharacter = window.characterManager.getPlayerCharacter() || window.characterManager.characters[0];
        if (initialCharacter) {
            console.log('🔄 Performing initial UI update for:', initialCharacter.name);
            window.uiUpdater.updateUI(initialCharacter);
        }
        
        // FIXED: Set initial focus and camera on the actual player character
        const actualPlayerCharacter = window.characterManager.getPlayerCharacter();
        if (actualPlayerCharacter) {
            setFocusTarget(actualPlayerCharacter.id);
            console.log(`🎯 Initial focus set on player character: ${actualPlayerCharacter.name}`);
        } else {
            console.error('❌ No player character found after loading!');
        }
        
        // Assign initial tasks to all characters
        window.gameEngine.world.assignInitialTasks();
        
        // PHASE 4: Add click handler for movement
        const canvas = window.renderer.app?.view;
        if (canvas) {
            canvas.addEventListener('click', handleWorldClick);
            console.log('✅ Click-to-move enabled');
        }
        
        // Start the game loop
        window.gameEngine.start();
        
        // FIXED: Connect UI observers AND start UI update loop
        connectUIObservers();
        startUIUpdateLoop();

        // Make game accessible globally for debugging
        window.game = {
            engine: window.gameEngine,
            characterManager: window.characterManager,
            renderer: window.renderer,
            uiUpdater: window.uiUpdater
        };
        
        // Make game accessible globally for debugging
        window.game = {
            engine: window.gameEngine,
            characterManager: window.characterManager,
            renderer: window.renderer,
            uiUpdater: window.uiUpdater
        };
        startChunkUpdateLoop();
        console.log('🎮 GAME STARTED SUCCESSFULLY!');
        showSuccessMessage('Game started! Click to move your character.');
        
    } catch (error) {
        console.log('❌ Failed to start game:', error.message);
        showErrorMessage(`Failed to start game: ${error.message}`);
    }
}

/**
 * PHASE 4 ENHANCED: Handle clicks on the game world for movement
 * EXACT CODE FROM: main.js lines 395-427
 */
export function handleWorldClick(event) {
    // PHASE 4: Implement click-to-move for player character
    if (!window.gameEngine || !window.characterManager || !window.renderer) {
        console.warn('⚠️ Game not fully initialized for click handling.');
        return;
    }
    
    const player = window.characterManager.getPlayerCharacter();
    if (!player) {
        console.warn('⚠️ No player character found to move.');
        return;
    }
    
    // Get click position relative to the canvas
    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // CRITICAL FIX: Convert screen coordinates to world coordinates.
    // We must subtract the worldContainer's position, which represents the camera's offset.
    const worldContainer = window.renderer.worldContainer;
    const worldX = clickX - worldContainer.x;
    const worldY = clickY - worldContainer.y;
    
    console.log(`🖱️ Click at world position: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);
    
    // Find a path from the player's current position to the clicked destination
    const path = window.gameEngine.world.findPath(
        player.position,
        { x: worldX, y: worldY }
    );
    
    if (path && path.length > 0) {
        // Assign the calculated path to the player character for the movement system to handle
        player.path = path;
        console.log(`🚶 Player path set with ${path.length} waypoints.`);
    } else {
        console.log('❌ No valid path to destination could be found.');
    }
}

/**
 * Fallback function when character creator fails
 * EXACT CODE FROM: main.js lines 432-489
 */
export function startGameWithFallbackCharacters() {
    console.log('🔧 Starting with fallback characters...');
    
    const fallbackCharacters = [
        {
            id: 'player',
            name: 'Manager',
            age: 35,
            jobRole: 'Manager',
            competence: 7,
            laziness: 3,
            charisma: 8,
            personalityTags: ['organized', 'decisive'],
            experienceTags: ['Leadership'],
            personalItems: ['clipboard'],
            deskItems: ['computer'],
            spriteSheet: 'assets/characters/character-01.png',
            isPlayer: true
        },
        {
            id: 'npc1',
            name: 'Developer',
            age: 28,
            jobRole: 'Software Developer',
            competence: 9,
            laziness: 4,
            charisma: 5,
            personalityTags: ['logical', 'introverted'],
            experienceTags: ['Programming'],
            personalItems: ['laptop'],
            deskItems: ['code'],
            spriteSheet: 'assets/characters/character-02.png',
            isPlayer: false
        },
        {
            id: 'npc2',
            name: 'Designer',
            age: 26,
            jobRole: 'UI/UX Designer',
            competence: 8,
            laziness: 2,
            charisma: 7,
            personalityTags: ['creative', 'detail-oriented'],
            experienceTags: ['Design'],
            personalItems: ['tablet'],
            deskItems: ['sketches'],
            spriteSheet: 'assets/characters/character-03.png',
            isPlayer: false
        },
        {
            id: 'npc3',
            name: 'Sales Rep',
            age: 32,
            jobRole: 'Sales Representative',
            competence: 6,
            laziness: 5,
            charisma: 9,
            personalityTags: ['outgoing', 'persuasive'],
            experienceTags: ['Sales'],
            personalItems: ['phone'],
            deskItems: ['contracts'],
            spriteSheet: 'assets/characters/character-04.png',
            isPlayer: false
        },
        {
            id: 'npc4',
            name: 'Intern',
            age: 22,
            jobRole: 'Intern',
            competence: 4,
            laziness: 2,
            charisma: 6,
            personalityTags: ['eager', 'nervous'],
            experienceTags: ['Entry Level'],
            personalItems: ['notebook'],
            deskItems: ['coffee'],
            spriteSheet: 'assets/characters/character-05.png',
            isPlayer: false
        }
    ];
    
    startGameSimulation(fallbackCharacters);
}

/**
 * Set focus on a specific character
 * EXACT CODE FROM: main.js lines 494-511
 */
export function setFocusTarget(characterId) {
    window.focusTargetId = characterId;
    
    // FIXED: Also update camera to follow the focused character
    if (window.renderer && window.renderer.setFollowTarget) {
        window.renderer.setFollowTarget(characterId);
        console.log(`📹 Camera now following: ${characterId}`);
    }
    
    if (window.uiUpdater && window.characterManager) {
        // Get the character by ID and update UI
        const character = window.characterManager.characters.find(char => char.id === characterId);
        if (character) {
            window.uiUpdater.updateUI(character);
            console.log(`👁️ Focus set on character: ${character.name}`);
        } else {
            console.warn(`⚠️ Character with ID ${characterId} not found`);
        }
    }
}

/**
 * Connect observer pattern for automatic UI updates
 * EXACT CODE FROM: main.js lines 516-528
 */
export function connectUIObservers() {
    console.log('🔄 Connecting UI observers...');
    
    if (window.uiUpdater && window.characterManager && window.characterManager.characters) {
        // Register UIUpdater as observer for all characters
        window.characterManager.characters.forEach(character => {
            // Only add if not already added (prevent duplicates)
            if (!character.observers.includes(window.uiUpdater)) {
                character.addObserver(window.uiUpdater);
                console.log(`✅ UI observer connected to ${character.name}`);
            }
        });
    }
}

/**
 * Start continuous UI updates
 * EXACT CODE FROM: main.js lines 533-575
 */
export function startUIUpdateLoop() {
    console.log('🔄 Starting UI update loop...');
    
    function updateUILoop() {
        if (window.uiUpdater && window.characterManager && window.characterManager.characters) {
            // FIXED: Use focusTargetId to find character or default to player
            let focusedCharacter = null;
            
            if (window.focusTargetId) {
                focusedCharacter = window.characterManager.characters.find(char => char.id === window.focusTargetId);
            }
            
            // Default to player character or first character
            if (!focusedCharacter) {
                focusedCharacter = window.characterManager.getPlayerCharacter() || window.characterManager.characters[0];
            }
            
            if (focusedCharacter) {
                // Character needs should already exist from Character constructor
                // If they don't exist, log error instead of creating placeholders
                if (!focusedCharacter.needs) {
                    console.error(`❌ Character ${focusedCharacter.name} missing needs object`);
                    return;
                }
                
                window.uiUpdater.updateUI(focusedCharacter);
            }
        }
        
        // Update every 1000ms (1 second) - reduced frequency for stability
        setTimeout(updateUILoop, 1000);
    }
    
    // Start the loop
    updateUILoop();
    console.log('✅ UI update loop started');
}

/**
 * Set up character focus switching with number keys
 * EXACT CODE FROM: main.js lines 580-597
 */
export function setupCharacterSwitching() {
    console.log('🔧 Setting up character focus switching...');
    
    document.addEventListener('keydown', (e) => {
        if (!window.characterManager || !window.uiUpdater) return;
        
        // Number keys 1-5 for character switching
        if (e.code >= 'Digit1' && e.code <= 'Digit5') {
            const index = parseInt(e.code.slice(-1)) - 1;
            const character = window.characterManager.characters[index];
            
            if (character) {
                console.log(`🎯 Switching focus to character ${index + 1}: ${character.name}`);
                setFocusTarget(character.id);
            }
        }
    });
    
    console.log('✅ Character switching configured');
}

/**
 * Starts the loop to periodically update active map chunks.
 * EXACT CODE FROM: main.js lines 725-734
 */
export function startChunkUpdateLoop() {
    console.log('🔄 Starting chunk update loop...');

    setInterval(() => {
        if (window.gameEngine && window.characterManager && window.renderer) {
            window.gameEngine.world.updateActiveChunks(window.characterManager.characters, window.renderer);
        }
    }, 250); // Runs 4 times per second
}
