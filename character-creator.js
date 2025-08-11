/**
 * Character Creator - Core Module - PHASE 3 FIXED
 * Fixed the validateCharacters call to properly pass the characters array
 */

// Import modular components
import { 
    JOB_ROLES_BY_OFFICE,
    MIN_CHARACTERS,
    MAX_CHARACTERS,
    generateDefaultCharacters,
    createCompleteRandomCharacter,
    finalizeCharacters,
    SPRITE_OPTIONS,
    generateNameByGender,
    PERSONALITY_TAGS,
    INVENTORY_OPTIONS,
    DESK_ITEM_OPTIONS,
    PHYSICAL_BUILDS,
    GENDERS
} from './modules/character-data.js';
import { UIGenerator } from './modules/ui-generator.js';
import { EventHandlers } from './modules/event-handlers.js';
import { SpriteManager } from './modules/sprite-manager.js';
import { ValidationUtils } from './modules/validation-utils.js';

// Global state - EXACT from Phase-3
let characters = [];
let currentCharacterIndex = 0;
let officeType = 'Game Studio'; // Default to Game Studio
let globalAPIKey = 'sk-placeholder-key-for-development-testing-only';

/**
 * Initialize the character creator system - EXACT from Phase-3 but modular
 */
function initializeCharacterCreator(selectedOfficeType = 'Game Studio') {
    console.log('🎭 Initializing enhanced character creator with complete UI...');
    
    try {
        officeType = selectedOfficeType;
        
        // Get DOM elements
        const tabsContainer = document.getElementById('character-tabs');
        const panelsContainer = document.getElementById('character-panels');
        
        if (!tabsContainer || !panelsContainer) {
            throw new Error('Character creator DOM elements not found');
        }
        
        // Create global API key section
        createGlobalAPIKeySection();
        
        // Generate initial characters
        characters = generateDefaultCharacters(MIN_CHARACTERS, officeType);
        
        // Create character tabs and panels
        rebuildCharacterInterface();
        
        // Set first tab as active
        switchToTab(0);
        
        // Update count display
        updateCharacterCountControls();
        
        // Setup add/remove character handlers
        setupCharacterCountHandlers();
        
        // Setup global randomize handler  
        setupGlobalRandomizeHandler();
        
        // Setup start simulation handler
        setupStartSimulationHandler();
        
        // Make characters available globally for debugging
        window.characters = characters;
        
        console.log('✅ Character creator initialized with', characters.length, 'characters');
        
    } catch (error) {
        console.error('❌ Failed to initialize character creator:', error);
        throw error;
    }
}

/**
 * Create global API key section - EXACT from Phase-3
 */
function createGlobalAPIKeySection() {
    const globalSection = document.getElementById('global-api-section');
    if (globalSection) {
        globalSection.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-lg border">
                <h3 class="text-lg font-semibold mb-2">🔑 Global Settings</h3>
                <div class="mb-3">
                    <label for="global-api-key" class="block text-sm font-medium text-gray-700 mb-1">
                        Global API Key (for NPCs)
                    </label>
                    <input 
                        type="text" 
                        id="global-api-key" 
                        value="${globalAPIKey}" 
                        placeholder="Enter API key for NPC characters"
                        class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <p class="text-xs text-gray-500 mt-1">This key will be used for all NPC characters unless individually overridden</p>
                </div>
            </div>
        `;
        
        // Setup global API key handler
        const globalAPIInput = document.getElementById('global-api-key');
        if (globalAPIInput) {
            globalAPIInput.addEventListener('input', (e) => {
                globalAPIKey = e.target.value;
                console.log('🔑 Global API key updated');
            });
        }
    }
}

/**
 * Setup character count handlers - EXACT from Phase-3
 */
function setupCharacterCountHandlers() {
    const addBtn = document.getElementById('add-character-btn');
    const removeBtn = document.getElementById('remove-character-btn');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (characters.length < MAX_CHARACTERS) {
                const newIndex = characters.length;
                const newCharacter = createCompleteRandomCharacter(newIndex, officeType);
                characters.push(newCharacter);
                
                rebuildCharacterInterface();
                switchToTab(newIndex);
                updateCharacterCountControls();
                
                console.log(`✅ Added character ${newIndex + 1}`);
            }
        });
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (characters.length > MIN_CHARACTERS) {
                // Remove last character
                characters.pop();
                
                // Rebuild interface
                rebuildCharacterInterface();
                
                // Switch to last remaining tab if current was removed
                if (currentCharacterIndex >= characters.length) {
                    switchToTab(characters.length - 1);
                }
                
                updateCharacterCountControls();
                
                console.log(`✅ Removed character, now have ${characters.length} characters`);
            }
        });
    }
}

/**
 * Setup global randomize handler - EXACT from Phase-3
 */
function setupGlobalRandomizeHandler() {
    const randomizeBtn = document.getElementById('randomize-btn');
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', () => {
            try {
                console.log('🎲 Randomizing all characters...');
                
                characters.forEach((char, index) => {
                    const wasPlayer = char.isPlayer;
                    characters[index] = createCompleteRandomCharacter(index, officeType);
                    characters[index].isPlayer = wasPlayer; // Preserve player status
                });
                
                rebuildCharacterInterface();
                switchToTab(currentCharacterIndex);
                
                console.log('✅ All characters randomized');
                
            } catch (error) {
                console.error('❌ Failed to randomize all characters:', error);
            }
        });
    }
}

/**
 * Setup start simulation handler - EXACT from Phase-3
 */
function setupStartSimulationHandler() {
    const startBtn = document.getElementById('start-simulation-btn');
    if (startBtn) {
        startBtn.addEventListener('click', handleStartSimulation);
    }
}

/**
 * Rebuild character interface after changes - EXACT from Phase-3
 */
function rebuildCharacterInterface() {
    const tabsContainer = document.getElementById('character-tabs');
    const panelsContainer = document.getElementById('character-panels');
    
    tabsContainer.innerHTML = '';
    panelsContainer.innerHTML = '';
    
    // Recreate all with correct indices
    characters.forEach((char, index) => {
        char.id = `char_${index}`; // Update IDs
        UIGenerator.createCharacterTab(index, char, tabsContainer);
        UIGenerator.createCharacterPanel(index, char, panelsContainer, officeType);
    });
    
    // Update global reference
    window.characters = characters;
}

/**
 * Update character count controls state - EXACT from Phase-3
 */
function updateCharacterCountControls() {
    const countDisplay = document.getElementById('character-count');
    const addBtn = document.getElementById('add-character-btn');
    const removeBtn = document.getElementById('remove-character-btn');
    
    if (countDisplay) countDisplay.textContent = characters.length;
    if (addBtn) addBtn.disabled = characters.length >= MAX_CHARACTERS;
    if (removeBtn) removeBtn.disabled = characters.length <= MIN_CHARACTERS;
}

/**
 * Switch to a character tab - EXACT from Phase-3
 */
function switchToTab(index) {
    // Update character data from current form before switching
    if (currentCharacterIndex !== index) {
        updateCharactersFromForms();
    }
    
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
 * Update characters from all form inputs - EXACT from Phase-3
 */
function updateCharactersFromForms() {
    characters.forEach((char, index) => {
        // Basic info
        const nameInput = document.getElementById(`name-${index}`);
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        const genderSelect = document.getElementById(`gender-${index}`);
        const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
        const apiKeyInput = document.getElementById(`api-key-input-${index}`);
        const buildSelect = document.getElementById(`build-${index}`);
        
        if (nameInput) char.name = nameInput.value || char.name;
        if (jobRoleSelect) char.jobRole = jobRoleSelect.value || char.jobRole;
        if (genderSelect) char.physicalAttributes.gender = genderSelect.value || char.physicalAttributes.gender;
        if (isPlayerCheckbox) char.isPlayer = isPlayerCheckbox.checked;
        if (apiKeyInput) char.apiKey = apiKeyInput.value || char.apiKey;
        if (buildSelect) char.physicalAttributes.build = buildSelect.value || char.physicalAttributes.build;
        
        // Skills
        const skillInputs = ['competence', 'laziness', 'charisma', 'leadership'];
        skillInputs.forEach(skill => {
            const input = document.getElementById(`${skill}-${index}`);
            if (input) {
                char.skills[skill] = parseInt(input.value) || char.skills[skill];
            }
        });
        
        // Physical attributes
        const physicalInputs = ['age', 'height', 'weight', 'looks'];
        physicalInputs.forEach(attr => {
            const input = document.getElementById(`${attr}-${index}`);
            if (input) {
                char.physicalAttributes[attr] = parseInt(input.value) || char.physicalAttributes[attr];
            }
        });
        
        // Checkbox arrays (personality tags, inventory, desk items)
        updateCharacterArrayFromCheckboxes(char, index, 'personalityTags', PERSONALITY_TAGS);
        updateCharacterArrayFromCheckboxes(char, index, 'inventory', INVENTORY_OPTIONS);
        updateCharacterArrayFromCheckboxes(char, index, 'deskItems', DESK_ITEM_OPTIONS);
    });
}

/**
 * Update character array from checkboxes - EXACT from Phase-3
 */
function updateCharacterArrayFromCheckboxes(character, charIndex, arrayName, sourceArray) {
    const checkedItems = [];
    sourceArray.forEach(item => {
        const checkbox = document.getElementById(`${arrayName}-${item.replace(/\s+/g, '-').toLowerCase()}-${charIndex}`);
        if (checkbox && checkbox.checked) {
            checkedItems.push(item);
        }
    });
    character[arrayName] = checkedItems;
}

/**
 * Randomize current character - EXACT from Phase-3
 */
function randomizeCurrentCharacter() {
    try {
        console.log(`🎲 Randomizing character ${currentCharacterIndex + 1}...`);
        
        if (currentCharacterIndex >= 0 && currentCharacterIndex < characters.length) {
            const wasPlayer = characters[currentCharacterIndex].isPlayer;
            characters[currentCharacterIndex] = createCompleteRandomCharacter(currentCharacterIndex, officeType);
            characters[currentCharacterIndex].isPlayer = wasPlayer; // Preserve player status
            
            // Refresh the current panel
            refreshSingleCharacterPanel(currentCharacterIndex);
            
            console.log(`✅ Randomized character ${currentCharacterIndex + 1}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to randomize character:', error);
    }
}

/**
 * Refresh a single character panel - EXACT from Phase-3
 */
function refreshSingleCharacterPanel(index) {
    const panel = document.getElementById(`character-panel-${index}`);
    if (panel) {
        const character = characters[index];
        panel.innerHTML = UIGenerator.generateEnhancedPanelHTML(index, character, officeType);
        EventHandlers.setupPanelEventListeners(index, characters);
        SpriteManager.updateCharacterPortrait(index, character.spriteSheet);
        
        // Reset custom portrait display
        const canvas = document.getElementById(`custom-canvas-${index}`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6c757d';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No Custom', canvas.width / 2, canvas.height / 2);
        }
        
        // Update all checkbox states after refresh
        setTimeout(() => {
            EventHandlers.updateCheckboxStates(index, 'personalityTags', 6, characters);
            EventHandlers.updateCheckboxStates(index, 'inventory', 3, characters);
            EventHandlers.updateCheckboxStates(index, 'deskItems', 2, characters);
        }, 50);
    }
}

/**
 * ENHANCED: Validate characters before starting game
 */
function validateCharacters() {
    if (characters.length < MIN_CHARACTERS) {
        throw new Error(`Minimum ${MIN_CHARACTERS} characters required`);
    }
    
    if (characters.length > MAX_CHARACTERS) {
        throw new Error(`Maximum ${MAX_CHARACTERS} characters allowed`);
    }
    
    // Ensure exactly one player
    const playerCount = characters.filter(char => char.isPlayer).length;
    if (playerCount === 0) {
        characters[0].isPlayer = true;
        console.log('⚠️ No player character found, making first character the player');
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
        console.log('⚠️ Multiple player characters found, using first one');
    }
    
    // Ensure all have names
    characters.forEach((char, index) => {
        if (!char.name || char.name.trim() === '') {
            char.name = `Character ${index + 1}`;
        }
    });
}

/**
 * Handle Start Simulation button click - EXACT from Phase-3
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
        
        // Call the global game start function
        if (window.startGameSimulation) {
            window.startGameSimulation(gameCharacters);
        } else {
            console.error('❌ startGameSimulation function not found on window object');
            alert('Failed to start simulation. Game initialization error.');
        }
        
    } catch (error) {
        console.error('❌ Failed to start simulation:', error);
        alert(`Failed to start simulation: ${error.message}`);
    }
}

/**
 * Format characters for game engine with custom portrait priority - EXACT from Phase-3
 */
function formatCharactersForGame() {
    return characters.map(char => ({
        ...char,
        // Use custom portrait if available, otherwise use sprite portrait
        portrait: char.customPortrait || char.portrait,
        // Use individual API key if set, otherwise use global for NPCs
        apiKey: char.apiKey || (char.isPlayer ? '' : globalAPIKey),
        // Game engine required fields
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
        relationships: characters.reduce((rel, otherChar) => {
            if (otherChar.id !== char.id) {
                rel[otherChar.id] = 50; // Neutral starting relationship
            }
            return rel;
        }, {})
    }));
}

/**
 * Helper functions - EXACT from Phase-3
 */
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Make functions available globally for HTML onclick handlers - EXACT from Phase-3
window.switchTab = switchToTab;
window.randomizeCurrentCharacter = randomizeCurrentCharacter;
window.startSimulation = handleStartSimulation;

// Export main initialization function
export { initializeCharacterCreator };

console.log('🎭 Enhanced character creator loaded and ready - PHASE 3 FIXED');
