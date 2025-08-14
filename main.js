/**
 * OFFICE PURGATORY - MAIN GAME FILE
 * PHASE 3 COMPATIBLE - COMPLETE VERSION WITH ALL FUNCTIONS
 * * CRITICAL FIX: Updated all UI functions to use correct HTML element IDs
 * COMPLETE: Includes ALL functions from the original main.js
 */

// Import statements - Module-based loading
import { GameEngine } from './src/core/game-engine.js';
import { CharacterManager } from './src/core/characters/character-manager.js';
import { UIUpdater } from './src/ui/ui-updater.js';
import { Renderer } from './src/rendering/renderer.js';
import { loadMapData } from './src/core/world/world.js';
import { initializeCharacterCreator } from './character-creator.js';

// Global game state variables
let gameEngine = null;
let characterManager = null;
let uiUpdater = null;
let renderer = null;
let focusTargetId = null;

console.log('🎮 Office Purgatory - Game Loading...');

/**
 * DOM Ready Event - Main initialization
 */
document.addEventListener('DOMContentLoaded', function() {
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
});

/**
 * Initialize UI elements and inject required styles
 */
function initializeUIElements() {
    console.log('🎨 Initializing UI elements...');
    
    // Hide game elements first
    hideCharacterCreator();
    hideGameView();
    
    // Setup status panel tabs  
    setupStatusPanelTabs();
    
    // Inject tab CSS fixes
    injectTabCSS();
    
    // ALWAYS show start screen last
    showStartScreen();

    // Setup debug panel
    setupDebugPanel();
    
    console.log('✅ UI elements initialized');
}

/**
 * Setup New Game button with proper event handling
 */
function setupNewGameButton() {
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
 */
function handleNewGameClick() {
    console.log('🎭 New Game clicked - Opening character creator...');
    
    try {
        // Hide start screen
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

/**
 * Inject CSS fixes for tab alignment
 */
function injectTabCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Tab alignment fixes */
        .tab-bar {
            display: flex;
            border-bottom: 1px solid #333;
            background: #1a1a1a;
        }
        
        .tab-link {
            padding: 10px 20px;
            background: transparent;
            color: #888;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .tab-link:hover {
            background: #2a2a2a;
            color: #fff;
        }
        
        .tab-link.active {
            background: #333;
            color: #0ff;
            border-bottom: 2px solid #0ff;
            margin-bottom: -1px;
        }
        
        .tab-content {
            display: none;
            padding: 15px;
            min-height: 200px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Ensure proper z-index for tab bar */
        .tab-bar {
            z-index: 10;
            margin-top: -1px;
        }
        
        /* Ensure the widget container has proper flex layout */
        .widget.flex-grow {
            display: flex;
            flex-direction: column;
        }
        
        .widget .flex-grow {
            flex: 1;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Tab CSS injected with proper alignment');
}

/**
 * Set up status panel tab switching
 */
function setupStatusPanelTabs() {
    console.log('🔧 Setting up status panel tabs...');
    
    const tabs = document.querySelectorAll('.status-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            const tabName = tab.textContent.trim().toLowerCase();
            console.log(`📋 Switching to tab: ${tabName}`);
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content visibility
            contents.forEach((content, contentIndex) => {
                content.classList.toggle('hidden', contentIndex !== index);
            });
            
            // FORCE UI UPDATE AFTER TAB SWITCH
            if (characterManager && uiUpdater) {
                setTimeout(() => {
                    const focusedCharacter = characterManager.getPlayerCharacter();
                    if (focusedCharacter) {
                        console.log(`🔄 Forcing UI update for tab: ${tabName}`);
                        uiUpdater.updateUI(focusedCharacter);
                    }
                }, 50);
            }
        });
    });
    
    console.log('✅ Status panel tabs configured');
}

/**
 * MAIN GAME START FUNCTION - Called from character creator
 * FIXED: Use correct method names that actually exist in the codebase
 */
window.startGameSimulation = async function(charactersFromCreator) {
    try {
        console.log('🚀 Starting game simulation with characters:', charactersFromCreator);
        
        // Validate input
        if (!charactersFromCreator || charactersFromCreator.length === 0) {
            throw new Error('No characters provided to start game');
        }
        
        // Hide character creator
        hideCharacterCreator();
        
        // Show game view
        showGameView();
        
        // Load map data first
        const mapData = await loadMapData();
        console.log('✅ Map data loaded');
        
        // Initialize character manager with characters
        characterManager = new CharacterManager();
        characterManager.loadCharacters(charactersFromCreator);
        console.log('✅ Character manager initialized');
        
        // Initialize renderer with world container - FIXED: Use correct container ID
        const worldContainer = document.getElementById('world-canvas-container');
        if (!worldContainer) {
            throw new Error('World canvas container not found');
        }
        
        renderer = new Renderer(worldContainer);
        await renderer.initialize(mapData);
        console.log('✅ Renderer initialized');
        
        // Initialize game engine with all systems
        gameEngine = new GameEngine(characterManager, renderer, mapData);
        
        // Expose gameEngine globally for task system communication
        window.gameEngine = gameEngine;
        
        console.log('✅ Game engine initialized');

        // Process the map data to understand its structure
        gameEngine.world.processMapData();

        // Perform the first chunk update immediately
        gameEngine.world.updateActiveChunks(characterManager.characters, renderer);
        
        // Initialize character positions using world navigation grid
        characterManager.initializeCharacterPositions(gameEngine.world);
        
        // Render all characters in the world
        const characters = characterManager.characters;
        characters.forEach(character => {
            // Use renderCharacter (the actual method that exists)
            renderer.renderCharacter(character);
            console.log(`✅ Rendered character: ${character.name}`);
        });

        // Assuming the first character is the player (or however you identify the player)
        const playerCharacter = characterManager.characters.find(char => char.isPlayer);
        if (playerCharacter) {
        renderer.setPlayerCharacter(playerCharacter.id);
        }
        
       // Initialize UI updater for real-time status updates
        uiUpdater = new UIUpdater(characterManager);
        console.log('✅ UI updater initialized');
        
        // Setup player input handling
        setupGameInputHandlers();
        console.log('✅ Player input system initialized');

        // DEBUG: Check character data structure
        debugCharacterData();
        
        // FIXED: Set up character switching and initial UI update
        setupCharacterSwitching();
        
        // Perform initial UI update
        const initialCharacter = characterManager.getPlayerCharacter() || characterManager.characters[0];
        if (initialCharacter) {
            console.log('🔄 Performing initial UI update for:', initialCharacter.name);
            uiUpdater.updateUI(initialCharacter);
        }
        
        // FIXED: Set initial focus and camera on the actual player character
        const actualPlayerCharacter = characterManager.getPlayerCharacter();
        if (actualPlayerCharacter) {
            setFocusTarget(actualPlayerCharacter.id);
            console.log(`🎯 Initial focus set on player character: ${actualPlayerCharacter.name}`);
        } else {
            console.error('❌ No player character found after loading!');
        }
        
        // Assign initial tasks to all characters
        gameEngine.world.assignInitialTasks();
        
        // PHASE 4: Add click handler for movement
        const canvas = renderer.app?.view;
        if (canvas) {
            canvas.addEventListener('click', handleWorldClick);
            console.log('✅ Click-to-move enabled');
        }
        
        // Start the game loop
        gameEngine.start();
        
        // FIXED: Connect UI observers AND start UI update loop
        connectUIObservers();
        startUIUpdateLoop();

        // Make game accessible globally for debugging
        window.game = {
            engine: gameEngine,
            characterManager: characterManager,
            renderer: renderer,
            uiUpdater: uiUpdater
        };
        
        // ANIMATION FIX: Make renderer globally accessible for character animations
        window.renderer = renderer;
        
        // Make game accessible globally for debugging
        window.game = {
            engine: gameEngine,
            characterManager: characterManager,
            renderer: renderer,
            uiUpdater: uiUpdater
        };
        startChunkUpdateLoop();
        console.log('🎮 GAME STARTED SUCCESSFULLY!');
        showSuccessMessage('Game started! Click to move your character.');
        
    } catch (error) {
        console.log('❌ Failed to start game:', error.message);
        showErrorMessage(`Failed to start game: ${error.message}`);
    }
};

/**
 * PHASE 4 ENHANCED: Handle clicks on the game world for movement
 */
function handleWorldClick(event) {
    // PHASE 4: Implement click-to-move for player character
    if (!gameEngine || !characterManager || !renderer) {
        console.warn('⚠️ Game not fully initialized for click handling.');
        return;
    }
    
    const player = characterManager.getPlayerCharacter();
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
    const worldContainer = renderer.worldContainer;
    const worldX = clickX - worldContainer.x;
    const worldY = clickY - worldContainer.y;
    
    console.log(`🖱️ Click at world position: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);
    
    // Find a path from the player's current position to the clicked destination
    const path = gameEngine.world.findPath(
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
 */
function startGameWithFallbackCharacters() {
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
    
    window.startGameSimulation(fallbackCharacters);
}

/**
 * Set focus on a specific character
 * @param {string} characterId - ID of character to focus on
 */
function setFocusTarget(characterId) {
    focusTargetId = characterId;
    
    // FIXED: Also update camera to follow the focused character
    if (renderer && renderer.setFollowTarget) {
        renderer.setFollowTarget(characterId);
        console.log(`📹 Camera now following: ${characterId}`);
    }
    
    if (uiUpdater && characterManager) {
        // Get the character by ID and update UI
        const character = characterManager.characters.find(char => char.id === characterId);
        if (character) {
            uiUpdater.updateUI(character);
            console.log(`👁️ Focus set on character: ${character.name}`);
        } else {
            console.warn(`⚠️ Character with ID ${characterId} not found`);
        }
    }
}

/**
 * Connect observer pattern for automatic UI updates
 */
function connectUIObservers() {
    console.log('🔄 Connecting UI observers...');
    
    if (uiUpdater && characterManager && characterManager.characters) {
        // Register UIUpdater as observer for all characters
        characterManager.characters.forEach(character => {
            // Only add if not already added (prevent duplicates)
            if (!character.observers.includes(uiUpdater)) {
                character.addObserver(uiUpdater);
                console.log(`✅ UI observer connected to ${character.name}`);
            }
        });
    }
}

/**
 * Start continuous UI updates
 */
function startUIUpdateLoop() {
    console.log('🔄 Starting UI update loop...');
    
    function updateUILoop() {
        if (uiUpdater && characterManager && characterManager.characters) {
            // FIXED: Use focusTargetId to find character or default to player
            let focusedCharacter = null;
            
            if (focusTargetId) {
                focusedCharacter = characterManager.characters.find(char => char.id === focusTargetId);
            }
            
            // Default to player character or first character
            if (!focusedCharacter) {
                focusedCharacter = characterManager.getPlayerCharacter() || characterManager.characters[0];
            }
            
            if (focusedCharacter) {
                // Character needs should already exist from Character constructor
                // If they don't exist, log error instead of creating placeholders
                if (!focusedCharacter.needs) {
                    console.error(`❌ Character ${focusedCharacter.name} missing needs object`);
                    return;
                }
                
                uiUpdater.updateUI(focusedCharacter);
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
 */
function setupCharacterSwitching() {
    console.log('🔧 Setting up character focus switching...');
    
    document.addEventListener('keydown', (e) => {
        if (!characterManager || !uiUpdater) return;
        
        // Number keys 1-5 for character switching
        if (e.code >= 'Digit1' && e.code <= 'Digit5') {
            const index = parseInt(e.code.slice(-1)) - 1;
            const character = characterManager.characters[index];
            
            if (character) {
                console.log(`🎯 Switching focus to character ${index + 1}: ${character.name}`);
                setFocusTarget(character.id);
            }
        }
    });
    
    console.log('✅ Character switching configured');
}

// UI Visibility Helper Functions - FIXED to use correct HTML element IDs

function showStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.classList.remove('hidden');
        startScreen.style.display = 'flex';
    } else {
        console.warn('UI Warning: Element with ID "start-screen-backdrop" not found.');
    }
}

function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.classList.add('hidden');
        startScreen.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "start-screen-backdrop" not found.');
    }
}

function showCharacterCreator() {
    const creator = document.getElementById('creator-modal-backdrop');
    if (creator) {
        creator.classList.remove('hidden');
        creator.style.display = 'flex';
    } else {
        throw new Error('UI Error: Element with ID "creator-modal-backdrop" not found. Cannot open character creator.');
    }
}

function hideCharacterCreator() {
    const creator = document.getElementById('creator-modal-backdrop');
    if (creator) {
        creator.classList.add('hidden');
        creator.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "creator-modal-backdrop" not found.');
    }
}

function showGameView() {
    const gameView = document.getElementById('main-game-ui');
    if (gameView) {
        gameView.classList.remove('hidden');
        gameView.style.display = 'flex';
    } else {
        throw new Error('UI Error: Element with ID "main-game-ui" not found. Cannot show game view.');
    }
}

function hideGameView() {
    const gameView = document.getElementById('main-game-ui');
    if (gameView) {
        gameView.classList.add('hidden');
        gameView.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "main-game-ui" not found.');
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    console.error('❌ ERROR:', message);
    
    // Try to show in UI
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    // Also show as alert as fallback
    alert(`Error: ${message}`);
}

/**
 * Show success message to user
 */
function showSuccessMessage(message) {
    console.log('✅ SUCCESS:', message);
    
    // Try to show in UI
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

/**
 * Debug function to check character data structure
 */
function debugCharacterData() {
    if (characterManager && characterManager.characters) {
        console.log('🔍 DEBUG: Character data structure:');
        characterManager.characters.forEach((char, index) => {
            console.log(`Character ${index}:`, {
                name: char.name,
                id: char.id,
                jobRole: char.jobRole,
                hasNeeds: !!char.needs,
                needs: char.needs,
                hasInventory: !!char.inventory,
                inventory: char.inventory,
                hasPhysicalAttributes: !!char.physicalAttributes,
                physicalAttributes: char.physicalAttributes,
                hasSkills: !!char.skills,
                skills: char.skills
            });
        });
        
        // Test if UI elements exist
        console.log('🔍 DEBUG: UI Elements check:');
        console.log('character-name element:', !!document.getElementById('character-name'));
        console.log('character-role element:', !!document.getElementById('character-role'));
        console.log('energy-value element:', !!document.getElementById('energy-value'));
        console.log('inventory-list element:', !!document.getElementById('inventory-list'));
        console.log('character-stats element:', !!document.getElementById('character-stats'));
    }
}

/**
* Starts the loop to periodically update active map chunks.
*/
function startChunkUpdateLoop() {
    console.log('🔄 Starting chunk update loop...');

    setInterval(() => {
        if (gameEngine && characterManager && renderer) {
            gameEngine.world.updateActiveChunks(characterManager.characters, renderer);
        }
    }, 250); // Runs 4 times per second
}

// Export for use in other modules
export {
    setFocusTarget,
    showErrorMessage,
    showSuccessMessage
};

/**
 * Setup debug panel functionality
 */
function setupDebugPanel() {
    // Open debug panel button
    const debugBtn = document.getElementById('debug-panel-btn');
    if (debugBtn) {
        debugBtn.addEventListener('click', () => {
            const modal = document.getElementById('debug-modal-backdrop');
            if (modal) {
                modal.classList.remove('hidden');
            }
        });
    }
    
    // Close debug modal
    const closeBtn = document.getElementById('close-debug-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('debug-modal-backdrop');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    // Run debug command
    const runBtn = document.getElementById('run-debug-cmd');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            const select = document.getElementById('debug-command-select');
            const output = document.getElementById('debug-output');
            const result = document.getElementById('debug-result');
            
            if (select && select.value) {
                try {
                    let commandResult;
                    const command = select.value;
                    
                    // Execute the debug command
                    switch(command) {
                        case 'debugCharacterData':
                            debugCharacterData();
                            commandResult = 'Check console for character data';
                            break;
                        case 'debugCharacterStatus':
                            if (window.debugCharacterStatus) {
                                window.debugCharacterStatus();
                                commandResult = 'Check console for character status';
                            } else {
                                commandResult = 'debugCharacterStatus function not found';
                            }
                            break;
                        case 'console.clear':
                            console.clear();
                            commandResult = 'Console cleared';
                            break;
                        default:
                            // Try to evaluate as window property
                            commandResult = eval(`window.${command}`);
                            console.log(`Debug: ${command}`, commandResult);
                    }
                    
                    // Show result
                    if (output && result) {
                        result.textContent = typeof commandResult === 'object' 
                            ? JSON.stringify(commandResult, null, 2) 
                            : String(commandResult);
                        output.classList.remove('hidden');
                    }
                    
                } catch (error) {
                    console.error('Debug command failed:', error);
                    if (result) {
                        result.textContent = `Error: ${error.message}`;
                        output.classList.remove('hidden');
                    }
                }
            }
        });
    }
}

/**
 * TASK SYSTEM - Player input handling functions
 */

// Available task actions based on current context
const TASK_ACTIONS = {
    // Primary task actions
    'work': 'WORK_ON_TASK',
    'work on task': 'WORK_ON_TASK', 
    'complete task': 'COMPLETE_TASK',
    'finish task': 'COMPLETE_TASK',
    
    // Movement actions
    'move to': 'MOVE_TO',
    'go to': 'MOVE_TO',
    'walk to': 'MOVE_TO',
    
    // Need-based actions
    'get coffee': 'DRINK_COFFEE',
    'coffee': 'DRINK_COFFEE',
    'eat': 'EAT_SNACK',
    'snack': 'EAT_SNACK',
    
    // Social actions
    'talk to': 'START_CONVERSATION',
    'chat with': 'START_CONVERSATION',
    'socialize': 'SOCIALIZE',
    
    // Location shortcuts
    'desk': 'MOVE_TO_DESK',
    'meeting room': 'MOVE_TO_MEETING_ROOM',
    'break room': 'MOVE_TO_BREAK_ROOM',
    'printer': 'MOVE_TO_PRINTER'
};

/**
 * Setup player input event handlers
 */
function setupGameInputHandlers() {
    console.log('🎮 Setting up game input handlers...');
    
    const playerInput = document.getElementById('player-input');
    const inputModeSelector = document.getElementById('input-mode-selector');
    const actionSuggestions = document.getElementById('action-suggestions');
    
    if (!playerInput || !inputModeSelector) {
        console.warn('⚠️ Player input elements not found');
        return;
    }
    
    // Handle input typing for action suggestions
    playerInput.addEventListener('input', (event) => {
        if (inputModeSelector.value === 'action') {
            showActionSuggestions(event.target.value);
        }
    });
    
    // Handle enter key
    playerInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handlePlayerInput(playerInput.value, inputModeSelector.value);
            playerInput.value = '';
            hideActionSuggestions();
        } else if (event.key === 'Escape') {
            hideActionSuggestions();
        }
    });
    
    // Handle mode change
    inputModeSelector.addEventListener('change', () => {
        hideActionSuggestions();
        playerInput.placeholder = inputModeSelector.value === 'action' 
            ? 'Type an action (e.g., "work", "complete task", "move to desk")...' 
            : 'Type a message...';
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!playerInput.contains(event.target) && !actionSuggestions?.contains(event.target)) {
            hideActionSuggestions();
        }
    });
    
    console.log('✅ Player input handlers connected');
}

/**
 * Show action suggestions based on input
 */
function showActionSuggestions(inputText) {
    const suggestions = document.getElementById('action-suggestions');
    if (!suggestions) return;
    
    const text = inputText.toLowerCase().trim();
    if (text.length < 1) {
        hideActionSuggestions();
        return;
    }
    
    // Get player character for context
    const playerCharacter = characterManager?.getPlayerCharacter();
    const matchingActions = [];
    
    // Find matching actions
    for (const [keyword, actionType] of Object.entries(TASK_ACTIONS)) {
        if (keyword.includes(text) || text.includes(keyword)) {
            matchingActions.push({
                keyword,
                actionType,
                display: getActionDisplayText(keyword, actionType, playerCharacter)
            });
        }
    }
    
    // Populate suggestions
    suggestions.innerHTML = '';
    matchingActions.slice(0, 5).forEach(action => {
        const div = document.createElement('div');
        div.className = 'p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200';
        div.textContent = action.display;
        div.onclick = () => {
            document.getElementById('player-input').value = action.keyword;
            hideActionSuggestions();
            handlePlayerInput(action.keyword, 'action');
        };
        suggestions.appendChild(div);
    });
    
    suggestions.classList.toggle('hidden', matchingActions.length === 0);
}

/**
 * Hide action suggestions
 */
function hideActionSuggestions() {
    const suggestions = document.getElementById('action-suggestions');
    if (suggestions) {
        suggestions.classList.add('hidden');
    }
}

/**
 * Get display text for action suggestion
 */
function getActionDisplayText(keyword, actionType, playerCharacter) {
    if (!playerCharacter) return keyword;
    
    switch (actionType) {
        case 'WORK_ON_TASK':
            const task = playerCharacter.assignedTask?.displayName || 'assigned task';
            return `Work on: ${task}`;
        case 'COMPLETE_TASK':
            return `Complete current task`;
        case 'MOVE_TO_DESK':
            return `Go to your desk`;
        case 'MOVE_TO_MEETING_ROOM':
            return `Go to meeting room`;
        case 'MOVE_TO_BREAK_ROOM':
            return `Go to break room`;
        case 'MOVE_TO_PRINTER':
            return `Go to printer`;
        default:
            return keyword;
    }
}

/**
 * Handle player input - main processing function
 */
function handlePlayerInput(inputText, mode) {
    if (!inputText || !inputText.trim()) return;
    
    const playerCharacter = characterManager?.getPlayerCharacter();
    if (!playerCharacter) {
        addToChatLog('System', 'No player character found.');
        return;
    }
    
    if (mode === 'action') {
        processPlayerAction(inputText.trim(), playerCharacter);
    } else {
        processPlayerDialogue(inputText.trim(), playerCharacter);
    }
}

/**
 * Process player action commands
 */
function processPlayerAction(actionText, playerCharacter) {
    const text = actionText.toLowerCase();
    
    // Find matching action
    let actionType = null;
    let actionTarget = null;
    
    for (const [keyword, type] of Object.entries(TASK_ACTIONS)) {
        if (text === keyword || text.startsWith(keyword + ' ')) {
            actionType = type;
            if (text.length > keyword.length) {
                actionTarget = text.substring(keyword.length).trim();
            }
            break;
        }
    }
    
    if (!actionType) {
        addToChatLog('System', `Unknown action: "${actionText}". Try "work", "complete task", or "move to desk".`);
        return;
    }
    
    // Execute action
    executePlayerAction(actionType, actionTarget, playerCharacter);
}

/**
 * Execute player action
 */
function executePlayerAction(actionType, target, playerCharacter) {
    switch (actionType) {
        case 'WORK_ON_TASK':
            if (playerCharacter.assignedTask) {
                addToChatLog(playerCharacter.name, `Working on: ${playerCharacter.assignedTask.displayName}`);
                // Manually progress task
                const progressAmount = 0.2; // 20% progress per action
                if (!playerCharacter.assignedTask.progress) {
                    playerCharacter.assignedTask.progress = 0;
                }
                playerCharacter.assignedTask.progress = Math.min(1.0, 
                    playerCharacter.assignedTask.progress + progressAmount);
                
                if (playerCharacter.assignedTask.progress >= 1.0) {
                    playerCharacter.completeCurrentTask();
                    addToChatLog('System', 'Task completed! New task assigned.');
                } else {
                    addToChatLog('System', `Task progress: ${Math.round(playerCharacter.assignedTask.progress * 100)}%`);
                }
            } else {
                addToChatLog('System', 'No task assigned.');
            }
            break;
            
        case 'COMPLETE_TASK':
            if (playerCharacter.assignedTask) {
                playerCharacter.completeCurrentTask();
                addToChatLog(playerCharacter.name, 'Completed current task!');
                addToChatLog('System', 'New task assigned.');
            } else {
                addToChatLog('System', 'No task to complete.');
            }
            break;
            
        case 'MOVE_TO_DESK':
        case 'MOVE_TO_MEETING_ROOM':
        case 'MOVE_TO_BREAK_ROOM':
        case 'MOVE_TO_PRINTER':
            const locationMap = {
                'MOVE_TO_DESK': 'desk',
                'MOVE_TO_MEETING_ROOM': 'meeting room',
                'MOVE_TO_BREAK_ROOM': 'break room',
                'MOVE_TO_PRINTER': 'printer'
            };
            const location = locationMap[actionType];
            addToChatLog(playerCharacter.name, `Moving to ${location}...`);
            // Note: Actual movement would be handled by movement system
            break;
            
        case 'DRINK_COFFEE':
            playerCharacter.needs.energy = Math.min(10, playerCharacter.needs.energy + 3);
            addToChatLog(playerCharacter.name, 'Had some coffee. Feeling more energized!');
            break;
            
        case 'EAT_SNACK':
            playerCharacter.needs.hunger = Math.min(10, playerCharacter.needs.hunger + 2);
            addToChatLog(playerCharacter.name, 'Had a snack. Feeling less hungry.');
            break;
            
        default:
            addToChatLog('System', `Action "${actionType}" not implemented yet.`);
    }
    
    // Trigger UI update
    if (uiUpdater) {
        uiUpdater.updateUI(playerCharacter);
    }
}

/**
 * Process player dialogue 
 */
function processPlayerDialogue(dialogueText, playerCharacter) {
    addToChatLog(playerCharacter.name, dialogueText);
}

/**
 * Add message to chat log
 */
function addToChatLog(speaker, message) {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'mb-2 p-2 bg-gray-100 rounded';
    messageDiv.innerHTML = `<strong>${speaker}:</strong> ${message}`;
    
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

console.log('✅ Main.js loaded - Complete version with all functions');






