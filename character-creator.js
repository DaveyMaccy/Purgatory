/**
 * Character Creator - Enhanced with all requested features
 * FIXED VERSION - Addresses sprite path issues and game state connection
 * 
 * FIXES APPLIED:
 * - Fixed sprite path generation for 20 sprites (no double paths)
 * - Proper game state connection and export functions
 * - Enhanced validation and error handling
 * - Better character data structure for game compatibility
 * 
 * Features:
 * - Single player character enforcement
 * - Arrow-based sprite navigation (20 sprites)
 * - Complete SSOT attributes including gender
 * - Gender-linked random names
 * - Randomize All checkbox option
 * - Global API key with individual overrides
 * - Custom portrait upload
 * - Add/remove characters (2-5 range)
 * - Enhanced form layout
 */

// ENHANCED CONSTANTS - FIXED: Better job roles for office types
const JOB_ROLES_BY_OFFICE = {
    "Game Studio": ["Lead Developer", "Game Designer", "3D Artist", "Sound Engineer", "QA Tester", "Producer"],
    "Corporate": ["IT Specialist", "Admin Assistant", "Business Analyst", "HR Manager", "Project Manager", "Accountant"],
    "PR Agency": ["Account Manager", "Creative Director", "Social Media Manager", "Copywriter", "Media Planner", "Brand Strategist"],
    "Newspaper": ["Reporter", "Editor", "Photographer", "Layout Designer", "Copy Editor", "Columnist"]
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

const PHYSICAL_BUILDS = ["Slim", "Average", "Athletic", "Heavy"];
const GENDERS = ["Male", "Female", "Non-binary"];

// FIXED: Generate sprite options for 20 sprites without double paths
function generateSpriteOptions() {
    const sprites = [];
    for (let i = 1; i <= 20; i++) { // FIXED: Use 20 sprites, not 25
        const paddedNumber = i.toString().padStart(2, '0');
        // FIXED: Use simple path without double directory
        sprites.push(`assets/characters/character-${paddedNumber}.png`);
    }
    return sprites;
}

const SPRITE_OPTIONS = generateSpriteOptions();

// Enhanced name pools by gender
const MALE_NAMES = [
    "Alexander", "Benjamin", "Christopher", "Daniel", "Ethan", "Felix", "Gabriel", "Henry",
    "Isaac", "James", "Kevin", "Lucas", "Michael", "Nathan", "Oliver", "Patrick",
    "Quinn", "Robert", "Samuel", "Thomas", "Victor", "William", "Xavier", "Zachary"
];

const FEMALE_NAMES = [
    "Amelia", "Brooke", "Charlotte", "Diana", "Emma", "Faith", "Grace", "Hannah",
    "Isabella", "Jessica", "Katherine", "Luna", "Maya", "Natalie", "Olivia", "Penelope",
    "Quinn", "Rachel", "Sophia", "Taylor", "Victoria", "Willow", "Ximena", "Zoe"
];

const NONBINARY_NAMES = [
    "Alex", "Blake", "Casey", "Drew", "Emery", "Finley", "Gray", "Harper",
    "Indigo", "Jordan", "Kai", "Lane", "Morgan", "Nova", "Ocean", "Parker",
    "Quinn", "River", "Sage", "Taylor", "Unique", "Vale", "Winter", "Zen"
];

// Global state
let characters = [];
let currentCharacterIndex = 0;
let globalAPIKey = '';

/**
 * Initialize the character creator when called from main.js
 */
export function initializeCharacterCreator() {
    console.log('🎭 Initializing character creator...');
    
    try {
        // Initialize with default characters
        initializeDefaultCharacters();
        
        // Set up all event listeners
        setupEventListeners();
        
        // Render initial UI
        renderCharacterTabs();
        refreshAllCharacterPanels();
        
        // Switch to first character
        switchToTab(0);
        
        console.log('✅ Character creator initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize character creator:', error);
        throw error;
    }
}

/**
 * Initialize with default characters (2 characters minimum)
 */
function initializeDefaultCharacters() {
    console.log('👥 Creating default characters...');
    
    characters = [
        createCompleteRandomCharacter(0),
        createCompleteRandomCharacter(1)
    ];
    
    // Ensure first character is the player
    characters[0].isPlayer = true;
    characters[1].isPlayer = false;
    
    console.log(`✅ Created ${characters.length} default characters`);
}

/**
 * Set up all event listeners for the character creator
 */
function setupEventListeners() {
    // Character management buttons
    const addCharacterBtn = document.getElementById('add-character-btn');
    const removeCharacterBtn = document.getElementById('remove-character-btn');
    const randomizeBtn = document.getElementById('randomize-current-btn');
    const startSimulationBtn = document.getElementById('start-simulation-btn');
    
    if (addCharacterBtn) {
        addCharacterBtn.addEventListener('click', addNewCharacter);
    }
    
    if (removeCharacterBtn) {
        removeCharacterBtn.addEventListener('click', removeCurrentCharacter);
    }
    
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', handleRandomizeClick);
    }
    
    if (startSimulationBtn) {
        startSimulationBtn.addEventListener('click', handleStartSimulation);
    }
    
    // Global API key input
    const globalApiInput = document.getElementById('global-api-key');
    if (globalApiInput) {
        globalApiInput.addEventListener('input', function() {
            globalAPIKey = this.value;
            console.log('🔑 Global API key updated');
        });
    }
    
    console.log('✅ Event listeners set up');
}

/**
 * Render character tabs based on current characters array
 */
function renderCharacterTabs() {
    const tabsContainer = document.getElementById('character-tabs');
    if (!tabsContainer) {
        console.error('❌ Character tabs container not found');
        return;
    }
    
    // Clear existing tabs
    tabsContainer.innerHTML = '';
    
    // Create tabs for each character
    characters.forEach((character, index) => {
        const tab = document.createElement('button');
        tab.className = 'character-tab';
        tab.textContent = character.name || `Character ${index + 1}`;
        tab.onclick = () => switchToTab(index);
        
        // Add player indicator
        if (character.isPlayer) {
            tab.classList.add('player-character');
            tab.textContent += ' 👑';
        }
        
        tabsContainer.appendChild(tab);
    });
    
    // Update character count display
    updateCharacterCountDisplay();
}

/**
 * Switch to a specific character tab
 */
function switchToTab(index) {
    if (index < 0 || index >= characters.length) {
        console.warn(`Invalid character index: ${index}`);
        return;
    }
    
    currentCharacterIndex = index;
    
    // Update tab appearance
    const tabs = document.querySelectorAll('.character-tab');
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    // Show current character panel
    refreshSingleCharacterPanel(index);
    
    console.log(`📝 Switched to character ${index + 1}: ${characters[index].name}`);
}

/**
 * Refresh character panel for a specific character
 */
function refreshSingleCharacterPanel(index) {
    const character = characters[index];
    if (!character) return;
    
    // Update all form elements for current character
    updateFormElement('name', character.name);
    updateFormElement('gender', character.gender);
    updateFormElement('office', character.office);
    updateFormElement('job-role', character.jobRole);
    updateFormElement('build', character.build);
    
    // Update physical attributes
    ['age', 'height', 'weight', 'looks'].forEach(attr => {
        updateFormElement(attr, character.physicalAttributes[attr]);
        updateFormElement(`${attr}-val`, 
            attr === 'height' ? `${character.physicalAttributes[attr]} cm` :
            attr === 'weight' ? `${character.physicalAttributes[attr]} kg` :
            attr === 'looks' ? `${character.physicalAttributes[attr]}/10` :
            character.physicalAttributes[attr]
        );
    });
    
    // Update skill attributes
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        updateFormElement(skill, character.skillAttributes[skill]);
        updateFormElement(`${skill}-val`, character.skillAttributes[skill]);
    });
    
    // Update personality tags
    updatePersonalityTags(character.personalityTags);
    
    // Update inventory and desk items
    updateListDisplay('inventory-list', character.inventory);
    updateListDisplay('desk-items-list', character.deskItems);
    
    // Update sprite and portrait
    updateCharacterPortrait(index, character.spriteSheet);
    updateSpriteInfo(index);
    
    // Update player checkbox
    updateFormElement('is-player', character.isPlayer);
    
    // Update API key
    updateFormElement('api-key', character.apiKey || '');
}

/**
 * Refresh all character panels
 */
function refreshAllCharacterPanels() {
    characters.forEach((_, index) => {
        if (index === currentCharacterIndex) {
            refreshSingleCharacterPanel(index);
        }
    });
}

/**
 * Update a form element value
 */
function updateFormElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }
}

/**
 * Update personality tags display
 */
function updatePersonalityTags(tags) {
    const container = document.getElementById('personality-tags');
    if (!container) return;
    
    // Clear existing tags
    const existingTags = container.querySelectorAll('.personality-tag');
    existingTags.forEach(tag => tag.remove());
    
    // Add current tags
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'personality-tag';
        tagElement.textContent = tag;
        tagElement.onclick = () => removePersonalityTag(tag);
        container.appendChild(tagElement);
    });
}

/**
 * Update list display (inventory, desk items)
 */
function updateListDisplay(listId, items) {
    const list = document.getElementById(listId);
    if (!list) return;
    
    list.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    });
}

/**
 * FIXED: Navigate sprite selection (handles 20 sprites correctly)
 */
function navigateSprite(index, direction) {
    const character = characters[index];
    if (!character) return;
    
    let newSpriteIndex = (character.spriteIndex || 0) + direction;
    
    // FIXED: Wrap around for 20 sprites
    if (newSpriteIndex >= 20) newSpriteIndex = 0;  // UPDATED: 20 sprites
    if (newSpriteIndex < 0) newSpriteIndex = 19;   // UPDATED: 20 sprites
    
    character.spriteIndex = newSpriteIndex;
    character.spriteSheet = SPRITE_OPTIONS[newSpriteIndex];
    
    // Update portrait and info
    updateCharacterPortrait(index, character.spriteSheet);
    updateSpriteInfo(index);
}

/**
 * Update sprite info display
 */
function updateSpriteInfo(index) {
    const spriteInfo = document.getElementById(`sprite-info-${index}`);
    if (spriteInfo) {
        const spriteIndex = characters[index].spriteIndex || 0;
        spriteInfo.textContent = `Sprite ${spriteIndex + 1} of ${SPRITE_OPTIONS.length}`;
    }
}

/**
 * Update character portrait
 */
function updateCharacterPortrait(index, spriteSheet) {
    const portraitImg = document.getElementById('character-portrait');
    if (portraitImg && spriteSheet) {
        // FIXED: Ensure proper path without double directories
        let cleanPath = spriteSheet;
        if (cleanPath.includes('assets/characters/assets/characters/')) {
            cleanPath = cleanPath.replace('assets/characters/assets/characters/', 'assets/characters/');
        }
        if (!cleanPath.startsWith('./')) {
            cleanPath = './' + cleanPath;
        }
        
        portraitImg.src = cleanPath;
        portraitImg.alt = `Character ${index + 1} Portrait`;
    }
}

/**
 * Add new character (max 5 characters)
 */
function addNewCharacter() {
    if (characters.length >= 5) {
        alert('Maximum 5 characters allowed');
        return;
    }
    
    const newCharacter = createCompleteRandomCharacter(characters.length);
    newCharacter.isPlayer = false; // Only first character can be player initially
    
    characters.push(newCharacter);
    
    renderCharacterTabs();
    switchToTab(characters.length - 1);
    
    console.log(`✅ Added new character: ${newCharacter.name}`);
}

/**
 * Remove current character (min 2 characters)
 */
function removeCurrentCharacter() {
    if (characters.length <= 2) {
        alert('Minimum 2 characters required');
        return;
    }
    
    const removedCharacter = characters[currentCharacterIndex];
    
    // If removing player character, make first remaining character the player
    if (removedCharacter.isPlayer && characters.length > 1) {
        const nextPlayerIndex = currentCharacterIndex === 0 ? 1 : 0;
        characters[nextPlayerIndex].isPlayer = true;
    }
    
    characters.splice(currentCharacterIndex, 1);
    
    // Adjust current index if needed
    if (currentCharacterIndex >= characters.length) {
        currentCharacterIndex = characters.length - 1;
    }
    
    renderCharacterTabs();
    switchToTab(currentCharacterIndex);
    
    console.log(`✅ Removed character: ${removedCharacter.name}`);
}

/**
 * Handle randomize button click (with "Randomize All" option)
 */
function handleRandomizeClick() {
    const randomizeAllCheckbox = document.getElementById('randomize-all-checkbox');
    const isRandomizeAll = randomizeAllCheckbox && randomizeAllCheckbox.checked;
    
    if (isRandomizeAll) {
        console.log('🎲 Randomizing all characters...');
        characters.forEach((char, index) => {
            const wasPlayer = char.isPlayer;
            characters[index] = createCompleteRandomCharacter(index);
            characters[index].isPlayer = wasPlayer; // Preserve player status
        });
        renderCharacterTabs();
        refreshAllCharacterPanels();
        console.log('✅ All characters randomized');
    } else {
        console.log(`🎲 Randomizing character ${currentCharacterIndex + 1}...`);
        randomizeCurrentCharacter();
    }
}

/**
 * FIXED: Randomize current character only
 */
function randomizeCurrentCharacter() {
    try {
        if (currentCharacterIndex >= 0 && currentCharacterIndex < characters.length) {
            const wasPlayer = characters[currentCharacterIndex].isPlayer;
            characters[currentCharacterIndex] = createCompleteRandomCharacter(currentCharacterIndex);
            characters[currentCharacterIndex].isPlayer = wasPlayer; // Preserve player status
            
            // Refresh the current panel and tab
            renderCharacterTabs();
            refreshSingleCharacterPanel(currentCharacterIndex);
            
            console.log(`✅ Randomized character ${currentCharacterIndex + 1}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to randomize character:', error);
    }
}

/**
 * FIXED: Create complete randomized character with all essential fields
 */
function createCompleteRandomCharacter(index) {
    const gender = getRandomItem(GENDERS);
    const randomTags = getRandomItems(PERSONALITY_TAGS, 3, 6);
    const randomInventory = getRandomItems(INVENTORY_OPTIONS, 1, 3);
    const randomDeskItems = getRandomItems(DESK_ITEM_OPTIONS, 1, 2);
    const office = getRandomItem(Object.keys(JOB_ROLES_BY_OFFICE));
    
    // FIXED: Ensure sprite index is valid for 20 sprites
    const validSpriteIndex = Math.floor(Math.random() * 20); // Use all 20 sprites
    const spriteSheet = SPRITE_OPTIONS[validSpriteIndex];
    
    return {
        id: `char_${index}`,
        name: generateNameByGender(gender),
        isPlayer: false, // Will be set appropriately by caller
        gender: gender,
        office: office,
        jobRole: getRandomItem(JOB_ROLES_BY_OFFICE[office]),
        build: getRandomItem(PHYSICAL_BUILDS),
        
        // FIXED: Proper sprite handling
        spriteSheet: spriteSheet,
        spriteIndex: validSpriteIndex,
        
        // Physical attributes
        physicalAttributes: {
            age: Math.floor(Math.random() * 30) + 22, // 22-52
            height: Math.floor(Math.random() * 40) + 150, // 150-190 cm
            weight: Math.floor(Math.random() * 60) + 50, // 50-110 kg
            looks: Math.floor(Math.random() * 10) + 1 // 1-10
        },
        
        // Skill attributes
        skillAttributes: {
            competence: Math.floor(Math.random() * 100),
            laziness: Math.floor(Math.random() * 100),
            charisma: Math.floor(Math.random() * 100),
            leadership: Math.floor(Math.random() * 100)
        },
        
        personalityTags: randomTags,
        inventory: randomInventory,
        deskItems: randomDeskItems,
        
        // API settings
        apiKey: '',
        
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
        path: [],
        
        // Initialize relationships with other characters
        relationships: {}
    };
}

/**
 * Generate name based on gender
 */
function generateNameByGender(gender) {
    switch (gender.toLowerCase()) {
        case 'male':
            return getRandomItem(MALE_NAMES);
        case 'female':
            return getRandomItem(FEMALE_NAMES);
        case 'non-binary':
            return getRandomItem(NONBINARY_NAMES);
        default:
            return getRandomItem([...MALE_NAMES, ...FEMALE_NAMES, ...NONBINARY_NAMES]);
    }
}

/**
 * Update character count display
 */
function updateCharacterCountDisplay() {
    const countDisplay = document.getElementById('character-count');
    if (countDisplay) {
        countDisplay.textContent = `${characters.length}/5 Characters`;
    }
    
    // Update button states
    const addBtn = document.getElementById('add-character-btn');
    const removeBtn = document.getElementById('remove-character-btn');
    
    if (addBtn) {
        addBtn.disabled = characters.length >= 5;
    }
    
    if (removeBtn) {
        removeBtn.disabled = characters.length <= 2;
    }
}

/**
 * UPDATED: Handle Start Simulation with proper character export
 */
function handleStartSimulation() {
    console.log('🚀 Starting simulation...');
    
    try {
        // Validate all characters
        const validationErrors = validateAllCharacters();
        if (validationErrors.length > 0) {
            console.error('❌ Character validation failed:', validationErrors);
            alert('Please fix character validation errors:\n' + validationErrors.join('\n'));
            return;
        }
        
        // Ensure relationships are initialized between all characters
        initializeCharacterRelationships();
        
        // Hide character creator
        const modal = document.getElementById('character-creator-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Show game view
        const gameView = document.getElementById('game-view');
        const startScreen = document.getElementById('start-screen');
        
        if (gameView) gameView.style.display = 'flex';
        if (startScreen) startScreen.style.display = 'none';
        
        // CRITICAL: Start the game with our characters
        if (typeof window.startGameWithCharacters === 'function') {
            const exportedCharacters = window.getCharactersFromCreator();
            window.startGameWithCharacters(exportedCharacters);
        } else {
            console.error('❌ startGameWithCharacters function not found in main.js');
            alert('Game initialization function not found. Please refresh the page.');
        }
        
        console.log('✅ Character creator completed successfully');
        
    } catch (error) {
        console.error('❌ Failed to start simulation:', error);
        alert('Failed to start game. Please try again.');
    }
}

/**
 * Initialize relationships between all characters
 */
function initializeCharacterRelationships() {
    characters.forEach(char => {
        char.relationships = {};
        characters.forEach(otherChar => {
            if (otherChar.id !== char.id) {
                char.relationships[otherChar.id] = 50; // Neutral starting relationship
            }
        });
    });
}

/**
 * ENHANCED: Validate all characters before starting game
 */
function validateAllCharacters() {
    const errors = [];
    
    if (!characters || characters.length === 0) {
        errors.push('No characters created');
        return errors;
    }
    
    if (characters.length < 2) {
        errors.push('At least 2 characters required');
    }
    
    if (characters.length > 5) {
        errors.push('Maximum 5 characters allowed');
    }
    
    // Check for player character
    const playerCount = characters.filter(char => char.isPlayer).length;
    if (playerCount === 0) {
        errors.push('No player character selected');
    } else if (playerCount > 1) {
        errors.push('Multiple player characters selected');
    }
    
    // Validate each character
    characters.forEach((char, index) => {
        if (!char.name || char.name.trim().length === 0) {
            errors.push(`Character ${index + 1}: Missing name`);
        }
        
        if (!char.jobRole) {
            errors.push(`Character ${index + 1}: Missing job role`);
        }
        
        if (!char.spriteSheet) {
            errors.push(`Character ${index + 1}: Missing sprite selection`);
        }
        
        if (!char.gender) {
            errors.push(`Character ${index + 1}: Missing gender`);
        }
        
        if (!char.office) {
            errors.push(`Character ${index + 1}: Missing office type`);
        }
    });
    
    return errors;
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

function removePersonalityTag(tag) {
    const character = characters[currentCharacterIndex];
    if (character) {
        character.personalityTags = character.personalityTags.filter(t => t !== tag);
        updatePersonalityTags(character.personalityTags);
    }
}

// =============================================================================
// CRITICAL: EXPORT FUNCTIONS FOR GAME STATE CONNECTION
// =============================================================================

/**
 * CRITICAL: Export characters for game initialization
 * This function is called by main.js when starting the game
 */
window.getCharactersFromCreator = function() {
    console.log('📤 Exporting characters from creator...');
    
    if (!characters || characters.length === 0) {
        console.warn('⚠️ No characters created, returning null');
        return null;
    }
    
    // Ensure all characters have proper sprite paths (fix double path issue)
    const fixedCharacters = characters.map(char => {
        // FIXED: Clean up sprite path
        if (char.spriteSheet && char.spriteSheet.includes('assets/characters/assets/characters/')) {
            char.spriteSheet = char.spriteSheet.replace('assets/characters/assets/characters/', 'assets/characters/');
        }
        
        // Ensure proper sprite sheet format
        if (char.spriteSheet && !char.spriteSheet.startsWith('./')) {
            char.spriteSheet = './' + char.spriteSheet;
        }
        
        console.log(`👤 ${char.name}: ${char.spriteSheet}`);
        return char;
    });
    
    console.log(`✅ Exported ${fixedCharacters.length} characters from creator`);
    return fixedCharacters;
};

// Make functions available globally for HTML onclick handlers
window.switchTab = switchToTab;
window.randomizeCurrentCharacter = randomizeCurrentCharacter;
window.startSimulation = handleStartSimulation;
window.navigateSprite = navigateSprite;
window.addNewCharacter = addNewCharacter;
window.removeCurrentCharacter = removeCurrentCharacter;
window.validateAllCharacters = validateAllCharacters;

// Export for module usage
export { handleStartSimulation as startSimulation };

console.log('🎭 Enhanced character creator loaded and ready');
