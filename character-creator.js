/**
 * Character Creator - Core Module - PHASE 3 ENHANCED UI
 * 
 * Fixed import syntax error and integrated with the complete UI overhaul.
 * Now matches the monolithic version exactly with enhanced two-column layout.
 */

// FIXED: Import individual functions instead of non-existent CharacterData object
import { 
    JOB_ROLES_BY_OFFICE,
    MIN_CHARACTERS,
    MAX_CHARACTERS,
    generateDefaultCharacters,
    createCompleteRandomCharacter,
    validateCharacters,
    finalizeCharacters
} from './modules/character-data.js';
import { UIGenerator } from './modules/ui-generator.js';
import { EventHandlers } from './modules/event-handlers.js';
import { SpriteManager } from './modules/sprite-manager.js';
import { ValidationUtils } from './modules/validation-utils.js';

// Global state - aligned with monolithic version
let characters = [];
let currentCharacterIndex = 0;
let officeType = 'Game Studio'; // Default to Game Studio
let globalAPIKey = 'sk-placeholder-key-for-development-testing-only';

/**
 * Initialize the character creator system - PHASE 3 ENHANCED UI
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
        
        // Create office type selector
        createOfficeTypeSelector();
        
        // Clear containers
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';
        characters.length = 0;
        
        // Create initial characters using new data structure (start with 3)
        const initialCharacterCount = 3;
        for (let i = 0; i < initialCharacterCount; i++) {
            characters.push(createCompleteRandomCharacter(i, officeType));
        }
        
        // Set first character as player
        characters[0].isPlayer = true;
        
        // Generate enhanced UI for all characters
        characters.forEach((character, index) => {
            UIGenerator.createCharacterTab(index, character, tabsContainer);
            UIGenerator.createCharacterPanel(index, character, panelsContainer, officeType);
        });
        
        // Make characters globally accessible for sprite manager
        window.characters = characters;
        
        // Set first tab as active
        switchToTab(0);
        
        // Initialize enhanced buttons
        initializeCharacterCreatorButtons();
        
        console.log('✅ Enhanced character creator with complete UI initialized successfully');
        
    } catch (error) {
        console.error('❌ Character creator initialization failed:', error);
        throw error;
    }
}

/**
 * Create office type selector - matches monolithic exactly
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
            
            // Update all characters' job roles to match new office type
            updateAllCharacterJobRoles();
        });
    }
}

/**
 * Create global API key section - matches monolithic exactly
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
 * Initialize character creator buttons - enhanced with character count controls
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
 * Create character count controls (add/remove) - matches monolithic exactly
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
 * Update all character job roles when office type changes
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
 * Add a new character - matches monolithic exactly
 */
function addCharacter() {
    if (characters.length >= MAX_CHARACTERS) {
        alert(`Maximum ${MAX_CHARACTERS} characters allowed`);
        return;
    }
    
    const newIndex = characters.length;
    const newCharacter = createCompleteRandomCharacter(newIndex, officeType);
    characters.push(newCharacter);
    
    // Update UI
    const tabsContainer = document.getElementById('character-tabs');
    const panelsContainer = document.getElementById('character-panels');
    
    UIGenerator.createCharacterTab(newIndex, newCharacter, tabsContainer);
    UIGenerator.createCharacterPanel(newIndex, newCharacter, panelsContainer, officeType);
    
    updateCharacterCountControls();
    switchToTab(newIndex);
    
    console.log(`➕ Added character ${newIndex + 1}`);
}

/**
 * Remove the current character - matches monolithic exactly
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
 * Rebuild character UI after removal
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
 * Update character count controls state
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
 * Enhanced randomize handling - matches monolithic exactly
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
 * Switch to a specific character tab
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
    
    console.log(`🔄 Switched to character ${index + 1}`);
}

/**
 * Randomize the current character - updated to use new data structure
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
 * Refresh a single character panel
 */
function refreshSingleCharacterPanel(index) {
    const panel = document.getElementById(`character-panel-${index}`);
    if (panel) {
        const character = characters[index];
        panel.innerHTML = UIGenerator.generateEnhancedPanelHTML(index, character, officeType);
        EventHandlers.setupPanelEventListeners(index, characters, globalAPIKey);
        SpriteManager.updateCharacterPortrait(index, character.spriteSheet);
        
        // Initialize custom portrait canvas
        SpriteManager.clearCustomPortrait(index, characters);
        
        // Initialize checkbox states after refresh
        setTimeout(() => {
            EventHandlers.updateCheckboxStates(index, 'personalityTags', 6);
            EventHandlers.updateCheckboxStates(index, 'inventory', 3);
            EventHandlers.updateCheckboxStates(index, 'deskItems', 2);
        }, 50);
    }
}

/**
 * Handle start simulation - PHASE 3 ENHANCED with new validation
 */
function handleStartSimulation() {
    console.log('🚀 Starting simulation with characters:', characters.length);
    
    try {
        // Update characters from form data before validation
        updateCharactersFromForms();
        
        // Validate all characters using new validation
        const validation = validateCharacters(characters);
        if (!validation.isValid) {
            alert(`Cannot start simulation: ${validation.errors.join(', ')}`);
            return;
        }
        
        // Finalize character data using new finalization
        const finalizedCharacters = finalizeCharacters(characters, globalAPIKey);
        
        // Close character creator modal using correct ID
        const modal = document.getElementById('creator-modal-backdrop');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
            console.log('📝 Character creator modal closed');
        }
        
        // Call the global startGame function
        if (window.startGame && typeof window.startGame === 'function') {
            console.log('🎯 Calling window.startGame with characters:', finalizedCharacters);
            window.startGame(finalizedCharacters);
        } else {
            console.error('❌ window.startGame function not found');
            alert('Failed to start simulation. Game initialization error.');
        }
        
    } catch (error) {
        console.error('❌ Failed to start simulation:', error);
        alert(`Failed to start simulation: ${error.message}`);
    }
}

/**
 * Update characters from all form inputs - matches monolithic exactly
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
    });
}

// Export functions for global access (needed for HTML onclick handlers)
window.switchTab = switchToTab;
window.randomizeCurrentCharacter = randomizeCurrentCharacter;
window.startSimulation = handleStartSimulation;

// Export main initialization function
export { initializeCharacterCreator };

console.log('📦 Character Creator Core Module loaded - PHASE 3 ENHANCED UI');
