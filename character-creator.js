/**
 * Character Creator - Core Module - PHASE 3 EXACT MATCH
 * * Uses the modular system but maintains the EXACT functionality and structure
 * from the working Phase-3 monolithic version.
 */

// Import modular components
import { EventHandlerShield } from './modules/event-handler-shield.js';
import { 
    JOB_ROLES_BY_OFFICE,
    MIN_CHARACTERS,
    MAX_CHARACTERS,
    generateDefaultCharacters,
    createCompleteRandomCharacter,
    validateCharacters,
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
/**
 * BULLETPROOF: Initialize character creator with proper setup order
 */
function initializeCharacterCreator(selectedOfficeType = 'Game Studio') {
    console.log('🎭 Initializing bulletproof character creator...');
    
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
        
        // STEP 1: CREATE CHARACTERS FIRST
        characters.length = 0;
        for (let i = 0; i < 3; i++) {
            characters.push(createCharacter(i));
        }
        characters[0].isPlayer = true;
        
        // STEP 2: SET GLOBAL REFERENCE IMMEDIATELY
        window.characters = characters;
        
        // STEP 3: THEN CREATE UI
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';
        
        characters.forEach((character, index) => {
            UIGenerator.createCharacterTab(index, character, tabsContainer);
            UIGenerator.createCharacterPanel(index, character, panelsContainer, officeType);
        });
        
        // STEP 4: INITIALIZE ALL CHECKBOX STATES WITH PROPER DELAY
       setTimeout(() => {
    characters.forEach((char, index) => {
        EventHandlerShield.safeUpdateCheckboxStates(index, 'personalityTags', 6);
        EventHandlerShield.safeUpdateCheckboxStates(index, 'inventory', 3);
        EventHandlerShield.safeUpdateCheckboxStates(index, 'deskItems', 2);
    });
}, 200);
        
        // Set first tab as active
        switchToTab(0);
        
        // Initialize buttons
        initializeCharacterCreatorButtons();
        
        console.log('✅ Bulletproof character creator initialized successfully');
        
    } catch (error) {
        console.error('❌ Character creator initialization failed:', error);
        throw error;
    }
}

/**
 * Create global API key section - EXACT from Phase-3
 */
function createGlobalAPIKeySection() {
    const creatorHeader = document.querySelector('.creator-header');
    if (!creatorHeader) return;
    
    const apiSection = document.createElement('div');
    apiSection.style.cssText = 'margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; border: 1px solid #e9ecef;';
    
    apiSection.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <label style="font-weight: bold; color: #495057;">Global API Key:</label>
            <input type="text" id="global-api-key" value="${globalAPIKey}" placeholder="Enter global API key for all NPCs..." 
                style="flex: 1; min-width: 300px; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-family: monospace; font-size: 12px;">
            <span style="font-size: 12px; color: #6c757d;">Used for all NPCs unless individual key specified</span>
        </div>
    `;
    
    creatorHeader.appendChild(apiSection);
    
    // Add event listener
    const globalAPIInput = document.getElementById('global-api-key');
    if (globalAPIInput) {
        globalAPIInput.addEventListener('input', function() {
            globalAPIKey = this.value;
        });
    }
}

/**
 * Create office type selector - EXACT from Phase-3
 */
function createOfficeTypeSelector() {
    const creatorHeader = document.querySelector('.creator-header');
    if (!creatorHeader) return;
    
    const officeSection = document.createElement('div');
    officeSection.style.cssText = 'margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 4px; border: 1px solid #b8daff;';
    
    const officeTypes = Object.keys(JOB_ROLES_BY_OFFICE);
    const officeOptions = officeTypes
        .map(type => `<option value="${type}" ${type === officeType ? 'selected' : ''}>${type}</option>`)
        .join('');
    
    officeSection.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <label style="font-weight: bold; color: #495057;">Office Type:</label>
            <select id="office-type-selector" style="padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-weight: bold;">
                ${officeOptions}
            </select>
            <span style="font-size: 12px; color: #6c757d;">Determines available job roles and tasks</span>
        </div>
    `;
    
    // Insert before API key section
    const apiSection = creatorHeader.querySelector('div[style*="background: #f8f9fa"]');
    if (apiSection) {
        creatorHeader.insertBefore(officeSection, apiSection);
    } else {
        creatorHeader.appendChild(officeSection);
    }
    
    // Add event listener
    const officeSelector = document.getElementById('office-type-selector');
    if (officeSelector) {
        officeSelector.addEventListener('change', function() {
            officeType = this.value;
            console.log(`🏢 Office type changed to: ${officeType}`);
            updateAllCharacterJobRoles();
        });
    }
}

/**
 * Update all character job roles when office type changes - EXACT from Phase-3
 */
function updateAllCharacterJobRoles() {
    const availableRoles = JOB_ROLES_BY_OFFICE[officeType];
    
    characters.forEach((character, index) => {
        // Set to first available role for new office type
        character.jobRole = availableRoles[0];
        
        // Update the dropdown if panel exists
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        if (jobRoleSelect) {
            // Rebuild options
            jobRoleSelect.innerHTML = availableRoles
                .map(role => `<option value="${role}">${role}</option>`)
                .join('');
            jobRoleSelect.value = character.jobRole;
        }
    });
    
    console.log(`📋 Updated all character job roles for ${officeType} office`);
}

/**
 * Initialize character creator buttons with enhanced functionality - EXACT from Phase-3
 */
function initializeCharacterCreatorButtons() {
    console.log('🔧 Setting up enhanced character creator buttons...');
    
    // Start Simulation Button
    const startButton = document.getElementById('start-simulation-button');
    if (startButton) {
        const newStartButton = startButton.cloneNode(true);
        startButton.parentNode.replaceChild(newStartButton, startButton);
        newStartButton.addEventListener('click', handleStartSimulation);
        console.log('✅ Start Simulation button connected');
    }
    
    // Separate randomize button and checkbox
    const randomizeButton = document.getElementById('randomize-btn');
    if (randomizeButton) {
        // Reset button to just say "Randomize"
        randomizeButton.textContent = 'Randomize';
        
        const newRandomizeButton = randomizeButton.cloneNode(true);
        randomizeButton.parentNode.replaceChild(newRandomizeButton, randomizeButton);
        newRandomizeButton.addEventListener('click', handleRandomize);
        
        // Add separate checkbox next to button
        const checkboxContainer = document.createElement('label');
        checkboxContainer.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-left: 15px; cursor: pointer;';
        checkboxContainer.innerHTML = `
            <input type="checkbox" id="randomize-all-checkbox" style="margin: 0;">
            <span>Randomize All</span>
        `;
        
        // Insert after the randomize button
        newRandomizeButton.parentNode.insertBefore(checkboxContainer, newRandomizeButton.nextSibling);
        
        console.log('✅ Enhanced Randomize button and checkbox connected');
    }
    
    // Character count controls
    createCharacterCountControls();
}

/**
 * Create character count controls (add/remove) - EXACT from Phase-3
 */
function createCharacterCountControls() {
    const creatorFooter = document.querySelector('.creator-footer');
    if (!creatorFooter) return;
    
    const countControls = document.createElement('div');
    countControls.style.cssText = 'display: flex; align-items: center; gap: 10px;';
    
    countControls.innerHTML = `
        <span style="font-weight: bold;">Characters:</span>
        <button id="remove-character-btn" class="action-button" style="background-color: #dc3545; padding: 8px 12px; font-size: 12px;">Remove (-)</button>
        <span id="character-count">${characters.length}</span>
        <button id="add-character-btn" class="action-button" style="background-color: #28a745; padding: 8px 12px; font-size: 12px;">Add (+)</button>
        <span style="font-size: 12px; color: #6c757d;">(${MIN_CHARACTERS}-${MAX_CHARACTERS} allowed)</span>
    `;
    
    // Insert before existing buttons
    creatorFooter.insertBefore(countControls, creatorFooter.firstChild);
    
    // Add event listeners
    document.getElementById('add-character-btn').addEventListener('click', addCharacter);
    document.getElementById('remove-character-btn').addEventListener('click', removeCharacter);
    
    updateCharacterCountControls();
}

/**
 * Create character with full SSOT attributes - EXACT from Phase-3
 */
function createCharacter(index) {
    const gender = getRandomItem(GENDERS);
    
    return {
        id: `char_${index}`,
        name: generateNameByGender(gender),
        isPlayer: false,
        spriteSheet: SPRITE_OPTIONS[index % SPRITE_OPTIONS.length] || SPRITE_OPTIONS[0],
        spriteIndex: index % SPRITE_OPTIONS.length || 0, // Track current sprite - ensure never undefined
        portrait: null, // Generated from sprite
        customPortrait: null, // Custom uploaded image
        apiKey: '', // Individual API key override
        jobRole: JOB_ROLES_BY_OFFICE[officeType][0],
        physicalAttributes: { 
            age: Math.floor(Math.random() * 20) + 25,
            height: Math.floor(Math.random() * 30) + 160,
            weight: Math.floor(Math.random() * 40) + 60,
            build: getRandomItem(PHYSICAL_BUILDS),
            looks: Math.floor(Math.random() * 6) + 5,
            gender: gender
        },
        skills: { 
            competence: Math.floor(Math.random() * 6) + 5, 
            laziness: Math.floor(Math.random() * 6) + 3, 
            charisma: Math.floor(Math.random() * 6) + 4, 
            leadership: Math.floor(Math.random() * 6) + 4 
        },
        personalityTags: getRandomItems(PERSONALITY_TAGS, 2, 4),
        experienceTags: [],
        needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
        inventory: getRandomItems(INVENTORY_OPTIONS, 1, 2),
        deskItems: getRandomItems(DESK_ITEM_OPTIONS, 1, 2),
        relationships: {},
        appearance: {
            body: 'body_skin_tone_1',
            hair: 'hair_style_4_blonde',
            shirt: 'shirt_style_2_red',
            pants: 'pants_style_1_jeans'
        }
    };
}

/**
 * Add a new character - EXACT from Phase-3
 */
function addCharacter() {
    if (characters.length >= MAX_CHARACTERS) {
        alert(`Maximum ${MAX_CHARACTERS} characters allowed`);
        return;
    }
    
    const newIndex = characters.length;
    const newCharacter = createCharacter(newIndex);
    characters.push(newCharacter);
    
    const tabsContainer = document.getElementById('character-tabs');
    const panelsContainer = document.getElementById('character-panels');
    
    UIGenerator.createCharacterTab(newIndex, newCharacter, tabsContainer);
    UIGenerator.createCharacterPanel(newIndex, newCharacter, panelsContainer, officeType);
    
    updateCharacterCountControls();
    switchToTab(newIndex);
    
    // Update global reference
    window.characters = characters;
    
    console.log(`➕ Added character ${newIndex + 1}`);
}

/**
 * Remove the current character - EXACT from Phase-3
 */
function removeCharacter() {
    if (characters.length <= MIN_CHARACTERS) {
        alert(`Minimum ${MIN_CHARACTERS} characters required`);
        return;
    }
    
    const indexToRemove = currentCharacterIndex;
    
    // Remove from array
    characters.splice(indexToRemove, 1);
    
    // Remove tab and panel
    const tab = document.querySelector(`#character-tabs button:nth-child(${indexToRemove + 1})`);
    const panel = document.getElementById(`character-panel-${indexToRemove}`);
    if (tab) tab.remove();
    if (panel) panel.remove();
    
    // Rebuild tabs and panels with correct indices
    rebuildCharacterUI();
    
    // Switch to a valid tab
    const newIndex = Math.min(currentCharacterIndex, characters.length - 1);
    switchToTab(newIndex);
    
    updateCharacterCountControls();
    
    console.log(`➖ Removed character, now have ${characters.length} characters`);
}

/**
 * Rebuild character UI after removal - EXACT from Phase-3
 */
function rebuildCharacterUI() {
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
/**
 * BULLETPROOF: Update characters from ALL form inputs including checkboxes
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
        
        // Physical attributes from sliders
        ['age', 'height', 'weight', 'looks'].forEach(attr => {
            const slider = document.getElementById(`${attr}-${index}`);
            if (slider) {
                char.physicalAttributes[attr] = parseInt(slider.value);
            }
        });
        
        // Skills from sliders
        ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
            const slider = document.getElementById(`${skill}-${index}`);
            if (slider) {
                char.skills[skill] = parseInt(slider.value);
            }
        });
        
        // BULLETPROOF: Capture ALL checkbox data
        // Personality tags
        const personalityCheckboxes = document.querySelectorAll(`input[id^="tags-${index}-"]:checked`);
        char.personalityTags = Array.from(personalityCheckboxes).map(cb => cb.value);
        
        // Inventory items  
        const inventoryCheckboxes = document.querySelectorAll(`input[id^="inventory-item-${index}-"]:checked`);
        char.inventory = Array.from(inventoryCheckboxes).map(cb => cb.value);
        
        // Desk items
        const deskCheckboxes = document.querySelectorAll(`input[id^="desk-item-${index}-"]:checked`);
        char.deskItems = Array.from(deskCheckboxes).map(cb => cb.value);
    });
    
    // Update global reference
    window.characters = characters;
}

/**
 * Enhanced randomize handling with proper checkbox separation - EXACT from Phase-3
 */
function handleRandomize() {
    const randomizeAllCheckbox = document.getElementById('randomize-all-checkbox');
    const isRandomizeAll = randomizeAllCheckbox && randomizeAllCheckbox.checked;
    
    if (isRandomizeAll) {
        console.log('🎲 Randomizing all characters...');
        characters.forEach((char, index) => {
            const wasPlayer = char.isPlayer;
            characters[index] = createCompleteRandomCharacter(index, officeType);
            characters[index].isPlayer = wasPlayer; // Preserve player status
            refreshSingleCharacterPanel(index);
        });
        console.log('✅ All characters randomized');
    } else {
        console.log(`🎲 Randomizing character ${currentCharacterIndex + 1}...`);
        randomizeCurrentCharacter();
    }
}

/**
 * Randomize current character only - EXACT from Phase-3
 */
function randomizeCurrentCharacter() {
    try {
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
 * Handle Start Simulation button click - EXACT from Phase-3
 */
function handleStartSimulation() {
    console.log('🚀 Start Simulation clicked!');
    
    try {
        // Update characters from form data
        updateCharactersFromForms();
        
        // Validate characters
        validateCharacters(characters);
        
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
/**
 * BULLETPROOF: Format characters for game engine preserving ALL data
 */
function formatCharactersForGame() {
    return characters.map(char => ({
        // PRESERVE ALL ORIGINAL DATA
        ...char,
        
        // CONVERT INVENTORY TO MIXED FORMAT FOR UI COMPATIBILITY
        inventory: (char.inventory || []).map(item => {
            if (typeof item === 'string') {
                return {
                    name: item,
                    type: item,
                    id: `${char.id}_${item}`,
                    originalString: item
                };
            }
            return item;
        }),
        
        // ENSURE NEEDS OBJECT EXISTS
        needs: char.needs || {
            energy: 8,
            hunger: 6, 
            social: 7,
            stress: 3
        },
        
        // PRESERVE ALL CHARACTER CREATOR DATA
        physicalAttributes: char.physicalAttributes || {},
        skills: char.skills || {},
        personalityTags: char.personalityTags || [],
        deskItems: char.deskItems || [],
        
        // ENSURE RELATIONSHIPS EXIST
        relationships: char.relationships || {},
        
        // PORTRAIT PRIORITY: custom > extracted portrait > sprite  
        portrait: char.customPortrait || char.portrait || char.spriteSheet,
        customPortrait: char.customPortrait, // Preserve custom separately
        spriteSheet: char.spriteSheet, // Preserve sprite sheet separately
        
        // GAME ENGINE REQUIRED FIELDS
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
        pixiArmature: null
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

console.log('🎭 Enhanced character creator loaded and ready - PHASE 3 EXACT MATCH');
