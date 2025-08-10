/**
 * Character Creator - Fixed initialization for Stage 3
 * 
 * This fixes the undefined array error by ensuring all constants are properly defined
 * before the initialization functions are called.
 */

// FIXED: Ensure all constants are defined at the top level
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

const PHYSICAL_BUILDS = ["Slim", "Average", "Athletic", "Heavy"];

// FIXED: Ensure sprite options are properly defined
const SPRITE_OPTIONS = [
    "assets/characters/character-01.png",
    "assets/characters/character-02.png", 
    "assets/characters/character-03.png",
    "assets/characters/character-04.png",
    "assets/characters/character-05.png"
];

// Game state variables
const NUM_CHARACTERS = 5;
let characters = [];
let currentCharacterIndex = 0;
let startGameCallback = null;
let officeType = 'Corporate';

/**
 * FIXED: Safe initialization that checks for required DOM elements
 */
export function initializeCharacterCreator(onComplete = null, selectedOfficeType = 'Corporate') {
    console.log('🎭 Initializing character creator...');
    
    try {
        startGameCallback = onComplete;
        officeType = selectedOfficeType;
        
        // FIXED: Check if required DOM elements exist
        const tabsContainer = document.getElementById('character-tabs');
        const panelsContainer = document.getElementById('character-panels');
        
        if (!tabsContainer || !panelsContainer) {
            console.warn('⚠️ Character creator DOM elements not found, using simplified initialization');
            // Create basic characters for testing
            initializeBasicCharacters();
            return;
        }
        
        const randomizeBtn = document.getElementById('randomize-btn');
        const startBtn = document.getElementById('start-simulation-button');

        // Clear old event listeners to prevent duplicates
        if (randomizeBtn) randomizeBtn.removeEventListener('click', randomizeCurrentCharacter);
        if (startBtn) startBtn.removeEventListener('click', startSimulation);

        // Clear containers
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';
        characters.length = 0;

        // Create characters
        for (let i = 0; i < NUM_CHARACTERS; i++) {
            characters.push(createNewCharacter(i));
            createTab(i);
            createPanel(i);
        }
        
        // Set first tab as active
        switchTab(0);

        // Add event listeners
        if (randomizeBtn) randomizeBtn.addEventListener('click', randomizeCurrentCharacter);
        if (startBtn) startBtn.addEventListener('click', startSimulation);
        
        console.log('✅ Character creator initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing character creator:', error);
        // Fallback to basic character creation
        initializeBasicCharacters();
    }
}

/**
 * FIXED: Safe character creation with proper error handling
 */
function createNewCharacter(index) {
    try {
        // FIXED: Ensure arrays are defined before accessing
        if (!SPRITE_OPTIONS || SPRITE_OPTIONS.length === 0) {
            console.warn('⚠️ SPRITE_OPTIONS not defined, using fallback');
            return createFallbackCharacter(index);
        }
        
        if (!JOB_ROLES_BY_OFFICE[officeType]) {
            console.warn(`⚠️ Job roles for office type '${officeType}' not found, using Corporate`);
            officeType = 'Corporate';
        }
        
        return {
            id: `char_${index}`,
            name: `Character ${index + 1}`,
            isPlayer: index === 0,
            spriteSheet: SPRITE_OPTIONS[index % SPRITE_OPTIONS.length],
            portrait: null,
            apiKey: '',
            jobRole: JOB_ROLES_BY_OFFICE[officeType][0],
            physicalAttributes: { 
                age: 25 + Math.floor(Math.random() * 20), 
                height: 160 + Math.floor(Math.random() * 30), 
                weight: 60 + Math.floor(Math.random() * 40), 
                build: PHYSICAL_BUILDS[Math.floor(Math.random() * PHYSICAL_BUILDS.length)], 
                looks: Math.floor(Math.random() * 10) + 1 
            },
            skills: { 
                competence: Math.floor(Math.random() * 10) + 1, 
                laziness: Math.floor(Math.random() * 10) + 1, 
                charisma: Math.floor(Math.random() * 10) + 1, 
                leadership: Math.floor(Math.random() * 10) + 1 
            },
            personalityTags: getRandomTags(PERSONALITY_TAGS, 3, 6),
            experienceTags: [],
            needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
            inventory: getRandomTags(INVENTORY_OPTIONS, 1, 3),
            deskItems: getRandomTags(DESK_ITEM_OPTIONS, 1, 2),
            relationships: {},
            appearance: {
                body: 'body_skin_tone_1',
                hair: 'hair_style_4_blonde',
                shirt: 'shirt_style_2_red',
                pants: 'pants_style_1_jeans'
            }
        };
        
    } catch (error) {
        console.error(`❌ Error creating character ${index}:`, error);
        return createFallbackCharacter(index);
    }
}

/**
 * FIXED: Fallback character creation for when assets are missing
 */
function createFallbackCharacter(index) {
    return {
        id: `char_${index}`,
        name: `Character ${index + 1}`,
        isPlayer: index === 0,
        spriteSheet: null, // Will use placeholder in renderer
        portrait: null,
        apiKey: '',
        jobRole: 'Senior Coder',
        physicalAttributes: { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 },
        skills: { competence: 5, laziness: 5, charisma: 5, leadership: 5 },
        personalityTags: ['Friendly'],
        experienceTags: [],
        needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
        inventory: ['Coffee Mug'],
        deskItems: ['Plant'],
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
 * Helper function to get random tags
 */
function getRandomTags(sourceArray, min, max) {
    if (!sourceArray || sourceArray.length === 0) return [];
    
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, sourceArray.length));
}

/**
 * FIXED: Basic character initialization for when DOM is not ready
 */
function initializeBasicCharacters() {
    console.log('🔧 Initializing basic characters for testing...');
    
    characters.length = 0;
    
    for (let i = 0; i < NUM_CHARACTERS; i++) {
        characters.push(createNewCharacter(i));
    }
    
    console.log(`✅ Created ${characters.length} basic characters`);
}

/**
 * Create tab in the UI
 */
function createTab(index) {
    const tabsContainer = document.getElementById('character-tabs');
    if (!tabsContainer) return;
    
    const tab = document.createElement('button');
    tab.textContent = `Character ${index + 1}`;
    tab.dataset.index = index;
    tab.className = index === 0 ? 'active' : '';
    tab.onclick = () => switchTab(index);
    tabsContainer.appendChild(tab);
}

/**
 * Create panel in the UI
 */
function createPanel(index) {
    const panelsContainer = document.getElementById('character-panels');
    if (!panelsContainer) return;
    
    const panel = document.createElement('div');
    panel.id = `character-panel-${index}`;
    panel.className = `creator-panel ${index === 0 ? '' : 'hidden'}`;
    
    panel.innerHTML = generateBasicPanelHTML(index, characters[index]);
    panelsContainer.appendChild(panel);
}

/**
 * Generate basic panel HTML (simplified version)
 */
function generateBasicPanelHTML(index, charData) {
    const jobRoleOptions = JOB_ROLES_BY_OFFICE[officeType]
        .map(role => `<option value="${role}" ${role === charData.jobRole ? 'selected' : ''}>${role}</option>`)
        .join('');
        
    return `
        <div class="space-y-4">
            <div class="form-group">
                <label for="name-${index}">Character Name</label>
                <input type="text" id="name-${index}" value="${charData.name}" class="w-full p-2 border rounded">
            </div>
            
            <div class="form-group">
                <label for="jobRole-${index}">Job Role</label>
                <select id="jobRole-${index}" class="w-full p-2 border rounded">${jobRoleOptions}</select>
            </div>

            <div class="form-group">
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="isPlayer-${index}" ${charData.isPlayer ? 'checked' : ''}>
                    <label for="isPlayer-${index}">Player Character</label>
                </div>
            </div>
            
            <div class="form-group">
                <p><strong>Personality:</strong> ${charData.personalityTags.join(', ')}</p>
            </div>
            
            <div class="form-group">
                <p><strong>Inventory:</strong> ${charData.inventory.join(', ')}</p>
            </div>
        </div>
    `;
}

/**
 * Switch between character tabs
 */
function switchTab(index) {
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
 * Randomize current character
 */
function randomizeCurrentCharacter() {
    if (currentCharacterIndex >= 0 && currentCharacterIndex < characters.length) {
        characters[currentCharacterIndex] = createNewCharacter(currentCharacterIndex);
        
        // Update the panel
        const panel = document.getElementById(`character-panel-${currentCharacterIndex}`);
        if (panel) {
            panel.innerHTML = generateBasicPanelHTML(currentCharacterIndex, characters[currentCharacterIndex]);
        }
        
        console.log(`🎲 Randomized character ${currentCharacterIndex + 1}`);
    }
}

/**
 * FIXED: Start simulation with proper validation
 */
function startSimulation() {
    console.log('🚀 Starting simulation...');
    
    try {
        // Update character data from forms
        updateCharactersFromForms();
        
        // Validate characters
        if (characters.length === 0) {
            throw new Error('No characters created');
        }
        
        // Ensure at least one player character
        const playerCharacters = characters.filter(char => char.isPlayer);
        if (playerCharacters.length === 0) {
            characters[0].isPlayer = true;
            console.log('⚠️ No player character found, making first character the player');
        }
        
        if (playerCharacters.length > 1) {
            // Keep only the first player character
            characters.forEach((char, index) => {
                if (char.isPlayer && index > 0) {
                    char.isPlayer = false;
                }
            });
            console.log('⚠️ Multiple player characters found, using first one');
        }
        
        // Validate character names
        characters.forEach((char, index) => {
            if (!char.name || char.name.trim() === '') {
                char.name = `Character ${index + 1}`;
            }
        });
        
        // Convert to proper format for game engine
        const gameCharacters = characters.map(char => ({
            ...char,
            relationships: {},
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
        
        console.log('✅ Starting simulation with characters:', gameCharacters);
        
        // Call the game start function
        if (window.startGameSimulation) {
            window.startGameSimulation(gameCharacters);
        } else {
            console.error('❌ startGameSimulation function not found');
            alert('Failed to start simulation. Please check the console for errors.');
        }
        
    } catch (error) {
        console.error('❌ Failed to start simulation:', error);
        alert(`Failed to start simulation: ${error.message}`);
    }
}

/**
 * Update character data from form inputs
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

// Global functions for HTML onclick handlers
window.switchTab = switchTab;
window.randomizeCurrentCharacter = randomizeCurrentCharacter;
window.startSimulation = startSimulation;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎭 Character creator DOM ready');
    
    // Don't auto-initialize here, wait for explicit call from main.js
});

console.log('🎭 Character creator loaded and ready');
