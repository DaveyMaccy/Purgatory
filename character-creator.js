/**
 * Randomize the current character
 */
function randomizeCurrentCharacter() {
    if (currentCharacterIndex < 0 || currentCharacterIndex >= characters.length) return;
    
    // Generate new random character data
    const randomData = CharacterData.generateRandomCharacter(officeType);
    
    // Keep the same ID but update all other properties
    const originalId = characters[currentCharacterIndex].id;
    characters[currentCharacterIndex] = { ...randomData, id: originalId };
    
    // Update global reference
    window.characters = characters;
    
    // Refresh the current panel
    const panel = document.getElementById(`character-panel-${currentCharacterIndex}`);
    if (panel) {
        panel.innerHTML = UIGenerator.generatePanelHTML(currentCharacterIndex, characters[currentCharacterIndex], officeType);
        EventHandlers.setupPanelEventListeners(currentCharacterIndex, characters, globalAPIKey);
        SpriteManager.updateCharacterPortrait(currentCharacterIndex, characters[currentCharacterIndex].spriteSheet);
    }
    
    console.log(`🎲 Randomized character ${currentCharacterIndex + 1}`);
}

/**
 * Handle start simulation - FIXED: Use correct modal ID and validation
 */
function handleStartSimulation() {
    console.log('🚀 Starting simulation with characters:', characters.length);
    
    try {
        // Validate all characters
        const validation = ValidationUtils.validateAllCharacters(characters);
        if (!validation.isValid) {
            alert(`Cannot start simulation: ${validation.errors.join(', ')}`);
            return;
        }
        
        // Finalize character data
        const finalizedCharacters = CharacterData.finalizeCharacters(characters, globalAPIKey);
        
        // FIXED: Close character creator modal using correct ID
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

// Export functions for global access (needed for HTML onclick handlers)
window.switchTab = switchToTab;
window.randomizeCurrentCharacter = randomizeCurrentCharacter;
window.startSimulation = handleStartSimulation;

// Export main initialization function
export { initializeCharacterCreator };

console.log('📦 Character Creator Core Module loaded - WORKING VERSION');
 * Character Creator - WORKING VERSION
 * 
 * FIXED: All imports, office types, and functionality working
 */

// FIXED: Import the CharacterData class that actually exists
import { CharacterData } from './modules/character-data.js';
import { UIGenerator } from './modules/ui-generator.js';
import { EventHandlers } from './modules/event-handlers.js';
import { SpriteManager } from './modules/sprite-manager.js';
import { ValidationUtils } from './modules/validation-utils.js';

// Global state - FIXED: Use original office type
let characters = [];
let currentCharacterIndex = 0;
let officeType = 'Tech Startup'; // FIXED: This matches the data file
let globalAPIKey = '';

/**
 * Initialize the character creator system
 */
function initializeCharacterCreator() {
    console.log('🎭 Initializing Character Creator...');
    
    try {
        // Initialize with default characters
        characters = CharacterData.generateDefaultCharacters(3, officeType);
        
        // Make characters globally accessible
        window.characters = characters;
        
        // Set up UI
        setupCharacterCreatorUI();
        
        // Setup global event listeners
        setupGlobalEventHandlers();
        
        console.log('🎭 Character Creator initialized successfully');
        console.log('📊 Characters:', characters.length);
        
    } catch (error) {
        console.error('❌ Failed to initialize Character Creator:', error);
        throw error;
    }
}

/**
 * Set up the main UI structure
 */
function setupCharacterCreatorUI() {
    // Clear existing content
    const tabsContainer = document.getElementById('character-tabs');
    const panelsContainer = document.getElementById('character-panels');
    
    if (tabsContainer) tabsContainer.innerHTML = '';
    if (panelsContainer) panelsContainer.innerHTML = '';
    
    // Generate tabs and panels for each character
    characters.forEach((character, index) => {
        UIGenerator.createCharacterTab(index, character, tabsContainer);
        UIGenerator.createCharacterPanel(index, character, panelsContainer, officeType);
    });
    
    // Set up character management controls
    setupCharacterManagementControls();
    
    // Initialize with first character active
    switchToTab(0);
}

/**
 * Set up character management controls (add/remove buttons)
 */
function setupCharacterManagementControls() {
    const managementControls = document.querySelector('.character-management');
    if (!managementControls) return;
    
    const addBtn = document.getElementById('add-character-btn');
    const removeBtn = document.getElementById('remove-character-btn');
    
    if (addBtn) {
        addBtn.onclick = addCharacter;
        addBtn.disabled = characters.length >= 5;
    }
    
    if (removeBtn) {
        removeBtn.onclick = removeCharacter;
        removeBtn.disabled = characters.length <= 2;
    }
}

/**
 * Set up global event handlers
 */
function setupGlobalEventHandlers() {
    // Global API key handler
    const globalApiKeyInput = document.getElementById('global-api-key');
    if (globalApiKeyInput) {
        globalApiKeyInput.addEventListener('input', function() {
            globalAPIKey = this.value;
            // Update all character API keys that are using global
            characters.forEach((char, index) => {
                const charApiKeyInput = document.getElementById(`api-key-${index}`);
                if (charApiKeyInput && charApiKeyInput.value === '') {
                    char.apiKey = globalAPIKey;
                }
            });
        });
    }
    
    // Office type selector
    const officeSelect = document.getElementById('office-type-select');
    if (officeSelect) {
        officeSelect.addEventListener('change', function() {
            officeType = this.value;
            // Refresh UI to update job role options
            setupCharacterCreatorUI();
        });
    }
    
    // Start simulation button
    const startBtn = document.getElementById('start-simulation-btn') || document.getElementById('start-simulation-button');
    if (startBtn) {
        startBtn.onclick = handleStartSimulation;
        console.log('✅ Start Simulation button connected');
    } else {
        console.warn('⚠️ Start Simulation button not found');
    }
}

/**
 * Switch to a specific character tab
 */
function switchToTab(index) {
    currentCharacterIndex = index;
    
    // Update tab appearances
    document.querySelectorAll('.character-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    // Update panel visibility
    document.querySelectorAll('.creator-panel').forEach((panel, i) => {
        panel.classList.toggle('hidden', i !== index);
    });
    
    console.log(`🔄 Switched to character ${index + 1}`);
}

/**
 * Add a new character
 */
function addCharacter() {
    if (characters.length >= 5) return;
    
    const newIndex = characters.length;
    const newCharacter = CharacterData.generateRandomCharacter(officeType);
    newCharacter.id = `char_${newIndex + 1}`;
    characters.push(newCharacter);
    
    // Update global reference
    window.characters = characters;
    
    // Update UI
    const tabsContainer = document.getElementById('character-tabs');
    const panelsContainer = document.getElementById('character-panels');
    
    UIGenerator.createCharacterTab(newIndex, newCharacter, tabsContainer);
    UIGenerator.createCharacterPanel(newIndex, newCharacter, panelsContainer, officeType);
    
    // Update management controls
    setupCharacterManagementControls();
    
    // Switch to new character
    switchToTab(newIndex);
    
    console.log(`➕ Added character ${newIndex + 1}`);
}

/**
 * Remove the last character
 */
function removeCharacter() {
    if (characters.length <= 2) return;
    
    const lastIndex = characters.length - 1;
    characters.pop();
    
    // Update global reference
    window.characters = characters;
    
    // Remove UI elements
    const tab = document.getElementById(`character-tab-${lastIndex}`);
    const panel = document.getElementById(`character-panel-${lastIndex}`);
    
    if (tab) tab.remove();
    if (panel) panel.remove();
    
    // Update management controls
    setupCharacterManagementControls();
    
    // Switch to previous character if we removed the active one
    if (currentCharacterIndex >= characters.length) {
        switchToTab(characters.length - 1);
    }
    
    console.log(`➖ Removed character ${lastIndex + 1}`);
}

/**
