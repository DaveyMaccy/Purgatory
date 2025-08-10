/**
 * Character Creator - COMPLETE RESTORED VERSION with all original features
 * 
 * RESTORED FEATURES:
 * - Complete character creation with tabs
 * - Sprite navigation with arrows (20 sprites)
 * - Add/remove characters (2-5 range)
 * - Player character designation
 * - Full attribute system (physical, skills, personality)
 * - Inventory and desk items selection
 * - Portrait upload and canvas system
 * - Randomization with "Randomize All" option
 * - Global API key with individual overrides
 * - Gender-linked name generation
 * - Complete form validation
 * 
 * PLUS CRITICAL FIXES:
 * - Fixed sprite paths for 20 sprites
 * - Proper game state connection
 * - Enhanced error handling
 */

// ENHANCED CONSTANTS
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

// FIXED: Generate sprite options for 20 sprites
function generateSpriteOptions() {
    const sprites = [];
    for (let i = 1; i <= 20; i++) {
        const paddedNumber = i.toString().padStart(2, '0');
        sprites.push(`assets/characters/character-${paddedNumber}.png`);
    }
    return sprites;
}

const SPRITE_OPTIONS = generateSpriteOptions();

// Enhanced name pools by gender
const NAMES_BY_GENDER = {
    "Male": {
        first: ["Alexander", "Benjamin", "Christopher", "Daniel", "Ethan", "Felix", "Gabriel", "Henry", "Isaac", "James", "Kevin", "Lucas", "Michael", "Nathan", "Oliver", "Patrick", "Quinn", "Robert", "Samuel", "Thomas", "Victor", "William", "Xavier", "Zachary"],
        last: ["Anderson", "Brown", "Davis", "Johnson", "Miller", "Wilson", "Moore", "Taylor", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee"]
    },
    "Female": {
        first: ["Amelia", "Brooke", "Charlotte", "Diana", "Emma", "Faith", "Grace", "Hannah", "Isabella", "Jessica", "Katherine", "Luna", "Maya", "Natalie", "Olivia", "Penelope", "Quinn", "Rachel", "Sophia", "Taylor", "Victoria", "Willow", "Ximena", "Zoe"],
        last: ["Anderson", "Brown", "Davis", "Johnson", "Miller", "Wilson", "Moore", "Taylor", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee"]
    },
    "Non-binary": {
        first: ["Alex", "Blake", "Casey", "Drew", "Emery", "Finley", "Gray", "Harper", "Indigo", "Jordan", "Kai", "Lane", "Morgan", "Nova", "Ocean", "Parker", "Quinn", "River", "Sage", "Taylor", "Unique", "Vale", "Winter", "Zen"],
        last: ["Anderson", "Brown", "Davis", "Johnson", "Miller", "Wilson", "Moore", "Taylor", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee"]
    }
};

// Global state
let characters = [];
let currentCharacterIndex = 0;
let officeType = 'Game Studio';
let globalAPIKey = '';

// Character limits
const MIN_CHARACTERS = 2;
const MAX_CHARACTERS = 5;

/**
 * MAIN INITIALIZATION FUNCTION - Called from main.js
 */
export function initializeCharacterCreator(selectedOfficeType = 'Game Studio') {
    console.log('🎭 Initializing complete character creator...');
    
    try {
        officeType = selectedOfficeType;
        
        // Initialize with default characters
        initializeDefaultCharacters();
        
        // Set up the complete UI
        setupCharacterCreatorUI();
        
        // Set up all event listeners
        setupAllEventListeners();
        
        console.log('✅ Character creator fully initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize character creator:', error);
        throw error;
    }
}

/**
 * Initialize with default characters
 */
function initializeDefaultCharacters() {
    console.log('👥 Creating default characters...');
    
    characters = [
        createCompleteCharacter(0),
        createCompleteCharacter(1)
    ];
    
    // Set first character as player
    characters[0].isPlayer = true;
    characters[1].isPlayer = false;
    
    console.log(`✅ Created ${characters.length} default characters`);
}

/**
 * Setup the complete character creator UI
 */
function setupCharacterCreatorUI() {
    console.log('🎨 Setting up character creator UI...');
    
    // Setup header controls
    setupHeaderControls();
    
    // Create character tabs
    createAllCharacterTabs();
    
    // Create character panels
    createAllCharacterPanels();
    
    // Setup footer controls
    setupFooterControls();
    
    // Switch to first character
    switchToTab(0);
    
    console.log('✅ Character creator UI setup complete');
}

/**
 * Setup header controls (Global API key, character count, add/remove buttons)
 */
function setupHeaderControls() {
    const headerContainer = document.querySelector('.creator-header') || 
                           document.querySelector('#character-creator-modal .p-6:first-child');
    
    if (headerContainer) {
        // Add character count and management controls
        const controlsHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <label for="global-api-key" style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Global AI API Key:</label>
                    <input type="text" id="global-api-key" placeholder="Enter your API key..." 
                           style="width: 300px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                </div>
                <div style="text-align: center;">
                    <div id="character-count" style="font-weight: bold; margin-bottom: 0.5rem;">${characters.length}/${MAX_CHARACTERS} Characters</div>
                    <div>
                        <button type="button" id="add-character-btn" style="padding: 0.5rem 1rem; margin-right: 0.5rem; background: #10b981; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">+ Add</button>
                        <button type="button" id="remove-character-btn" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">- Remove</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">
                        <input type="checkbox" id="randomize-all-checkbox" style="margin-right: 0.5rem;">
                        Randomize All Characters
                    </label>
                    <button type="button" id="randomize-current-btn" style="padding: 0.5rem 1rem; background: #8b5cf6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">🎲 Randomize Current</button>
                </div>
            </div>
        `;
        
        headerContainer.insertAdjacentHTML('beforeend', controlsHTML);
    }
}

/**
 * Create all character tabs
 */
function createAllCharacterTabs() {
    const tabsContainer = document.getElementById('character-tabs');
    if (!tabsContainer) {
        console.error('❌ Character tabs container not found');
        return;
    }
    
    tabsContainer.innerHTML = '';
    
    characters.forEach((character, index) => {
        createCharacterTab(index);
    });
}

/**
 * Create individual character tab
 */
function createCharacterTab(index) {
    const tabsContainer = document.getElementById('character-tabs');
    const character = characters[index];
    
    const tab = document.createElement('button');
    tab.className = `character-tab ${index === currentCharacterIndex ? 'active' : ''}`;
    tab.textContent = character.name || `Character ${index + 1}`;
    tab.onclick = () => switchToTab(index);
    
    // Add player indicator
    if (character.isPlayer) {
        tab.classList.add('player-character');
        tab.textContent += ' 👑';
    }
    
    tabsContainer.appendChild(tab);
}

/**
 * Create all character panels
 */
function createAllCharacterPanels() {
    const panelsContainer = document.getElementById('character-panels');
    if (!panelsContainer) {
        console.error('❌ Character panels container not found');
        return;
    }
    
    panelsContainer.innerHTML = '';
    
    characters.forEach((character, index) => {
        createCharacterPanel(index);
    });
}

/**
 * Create individual character panel with complete form
 */
function createCharacterPanel(index) {
    const panelsContainer = document.getElementById('character-panels');
    const character = characters[index];
    
    const panel = document.createElement('div');
    panel.id = `character-panel-${index}`;
    panel.className = `creator-panel ${index === currentCharacterIndex ? '' : 'hidden'}`;
    
    panel.innerHTML = generateCompleteCharacterPanelHTML(index, character);
    panelsContainer.appendChild(panel);
    
    // Setup all event listeners for this panel
    setupPanelEventListeners(index);
    
    // Initialize portrait and sprite display
    updateCharacterPortrait(index, character.spriteSheet);
    updateSpriteInfo(index);
}

/**
 * Generate complete character panel HTML
 */
function generateCompleteCharacterPanelHTML(index, character) {
    const jobRoleOptions = JOB_ROLES_BY_OFFICE[officeType]
        .map(role => `<option value="${role}" ${role === character.jobRole ? 'selected' : ''}>${role}</option>`)
        .join('');
        
    const buildOptions = PHYSICAL_BUILDS
        .map(build => `<option value="${build}" ${build === character.physicalAttributes.build ? 'selected' : ''}>${build}</option>`)
        .join('');
        
    const genderOptions = GENDERS
        .map(gender => `<option value="${gender}" ${gender === character.physicalAttributes.gender ? 'selected' : ''}>${gender}</option>`)
        .join('');

    return `
        <div style="display: flex; gap: 1.5rem; height: 100%;">
            <!-- Left Column: Basic Info and Attributes -->
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Basic Information -->
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 0.5rem;">
                        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 1rem;">Basic Information</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Name:</label>
                                <input type="text" id="name-${index}" value="${character.name}" 
                                       style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Gender:</label>
                                <select id="gender-${index}" 
                                        style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                                    ${genderOptions}
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Job Role:</label>
                                <select id="jobRole-${index}" 
                                        style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                                    ${jobRoleOptions}
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Build:</label>
                                <select id="build-${index}" 
                                        style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                                    ${buildOptions}
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; align-items: center; font-weight: 500;">
                                <input type="checkbox" id="isPlayer-${index}" ${character.isPlayer ? 'checked' : ''} 
                                       style="margin-right: 0.5rem;">
                                Set as Player Character
                            </label>
                        </div>
                        
                        <div style="margin-top: 1rem;">
                            <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Individual API Key (optional):</label>
                            <input type="text" id="api-key-${index}" value="${character.apiKey || ''}" 
                                   placeholder="Override global API key..." 
                                   style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                        </div>
                    </div>
                    
                    <!-- Physical Attributes -->
                    <div style="background: #f0f9ff; padding: 1rem; border-radius: 0.5rem;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 1rem;">Physical Attributes</h3>
                        
                        ${generateAttributeSlider(index, 'age', 'Age', character.physicalAttributes.age, 18, 65, '')}
                        ${generateAttributeSlider(index, 'height', 'Height', character.physicalAttributes.height, 140, 200, 'cm')}
                        ${generateAttributeSlider(index, 'weight', 'Weight', character.physicalAttributes.weight, 40, 120, 'kg')}
                        ${generateAttributeSlider(index, 'looks', 'Attractiveness', character.physicalAttributes.looks, 1, 10, '/10')}
                    </div>
                    
                    <!-- Skill Attributes -->
                    <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.5rem;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 1rem;">Skills & Personality</h3>
                        
                        ${generateAttributeSlider(index, 'competence', 'Competence', character.skillAttributes.competence, 0, 100, '%')}
                        ${generateAttributeSlider(index, 'laziness', 'Laziness', character.skillAttributes.laziness, 0, 100, '%')}
                        ${generateAttributeSlider(index, 'charisma', 'Charisma', character.skillAttributes.charisma, 0, 100, '%')}
                        ${generateAttributeSlider(index, 'leadership', 'Leadership', character.skillAttributes.leadership, 0, 100, '%')}
                    </div>
                </div>
            </div>
            
            <!-- Middle Column: Personality and Items -->
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; flex-direction: column; gap: 1rem; height: 100%;">
                    <!-- Personality Tags -->
                    <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 1rem;">Personality Tags</h3>
                        <div id="personality-tags-${index}" style="max-height: 120px; overflow-y: auto; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 0.25rem; background: white;">
                            ${generatePersonalityTagsHTML(index, character.personalityTags)}
                        </div>
                        <button type="button" id="add-personality-tag-${index}" 
                                style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 12px;">
                            + Add Tag
                        </button>
                    </div>
                    
                    <!-- Inventory Items -->
                    <div style="background: #ede9fe; padding: 1rem; border-radius: 0.5rem;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 1rem;">Inventory (Max 3)</h3>
                        <div style="max-height: 120px; overflow-y: auto; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 0.25rem; background: white; font-size: 14px;">
                            ${generateInventoryOptionsHTML(index, character.inventory)}
                        </div>
                    </div>
                    
                    <!-- Desk Items -->
                    <div style="background: #fce7f3; padding: 1rem; border-radius: 0.5rem;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 1rem;">Desk Items (Max 2)</h3>
                        <div style="max-height: 120px; overflow-y: auto; border: 1px solid #d1d5db; padding: 0.5rem; border-radius: 0.25rem; background: white; font-size: 14px;">
                            ${generateDeskItemsOptionsHTML(index, character.deskItems)}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Column: Portrait and Sprite -->
            <div style="width: 280px; flex-shrink: 0;">
                <div style="display: flex; flex-direction: column; gap: 1rem; height: 100%;">
                    <!-- Sprite Selection -->
                    <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 1rem; text-align: center;">Character Sprite</h3>
                        
                        <!-- Sprite Navigation -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <button type="button" id="sprite-prev-${index}" 
                                    style="padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                                ◀ Prev
                            </button>
                            <span id="sprite-info-${index}" style="font-size: 12px; color: #6b7280;">
                                Sprite 1 of ${SPRITE_OPTIONS.length}
                            </span>
                            <button type="button" id="sprite-next-${index}" 
                                    style="padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                                Next ▶
                            </button>
                        </div>
                        
                        <!-- Sprite Display -->
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <img id="character-portrait-${index}" 
                                 style="width: 120px; height: 120px; object-fit: cover; border: 2px solid #d1d5db; border-radius: 0.5rem; background: #f9fafb;" 
                                 alt="Character Sprite">
                        </div>
                    </div>
                    
                    <!-- Custom Portrait Upload -->
                    <div style="background: #f0f9ff; padding: 1rem; border-radius: 0.5rem;">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 1rem;">Custom Portrait</h3>
                        
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <canvas id="custom-canvas-${index}" width="120" height="120" 
                                    style="border: 2px solid #d1d5db; border-radius: 0.5rem; background: #f9fafb;"></canvas>
                        </div>
                        
                        <div style="text-align: center;">
                            <input type="file" id="portrait-upload-${index}" accept="image/*" 
                                   style="display: none;">
                            <button type="button" id="upload-portrait-btn-${index}" 
                                    style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem; font-size: 12px;">
                                📷 Upload
                            </button>
                            <button type="button" id="clear-custom-${index}" 
                                    style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 12px;">
                                🗑️ Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate attribute slider HTML
 */
function generateAttributeSlider(index, attrName, label, value, min, max, unit) {
    return `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <label style="font-weight: 500;">${label}:</label>
                <span id="${attrName}-val-${index}" style="font-weight: bold;">${value}${unit}</span>
            </div>
            <input type="range" id="${attrName}-${index}" min="${min}" max="${max}" value="${value}" 
                   style="width: 100%; accent-color: #3b82f6;">
        </div>
    `;
}

/**
 * Generate personality tags HTML
 */
function generatePersonalityTagsHTML(index, selectedTags) {
    return PERSONALITY_TAGS.map(tag => `
        <label style="display: block; margin: 2px 0; font-size: 14px;">
            <input type="checkbox" id="personality-${index}-${tag}" value="${tag}" 
                   ${selectedTags.includes(tag) ? 'checked' : ''} 
                   style="margin-right: 0.5rem;">
            ${tag}
        </label>
    `).join('');
}

/**
 * Generate inventory options HTML
 */
function generateInventoryOptionsHTML(index, selectedItems) {
    return INVENTORY_OPTIONS.map(item => `
        <label style="display: block; margin: 2px 0; font-size: 14px;">
            <input type="checkbox" id="inventory-${index}-${item}" value="${item}" 
                   ${selectedItems.includes(item) ? 'checked' : ''} 
                   style="margin-right: 0.5rem;">
            ${item}
        </label>
    `).join('');
}

/**
 * Generate desk items options HTML
 */
function generateDeskItemsOptionsHTML(index, selectedItems) {
    return DESK_ITEM_OPTIONS.map(item => `
        <label style="display: block; margin: 2px 0; font-size: 14px;">
            <input type="checkbox" id="desk-item-${index}-${item}" value="${item}" 
                   ${selectedItems.includes(item) ? 'checked' : ''} 
                   style="margin-right: 0.5rem;">
            ${item}
        </label>
    `).join('');
}

/**
 * Setup footer controls (Start Simulation button)
 */
function setupFooterControls() {
    const footerContainer = document.querySelector('.creator-footer') || 
                           document.querySelector('#character-creator-modal .p-6:last-child');
    
    if (footerContainer) {
        const footerHTML = `
            <button type="button" id="start-simulation-btn" 
                    style="padding: 1rem 2rem; background: #059669; color: white; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 16px; cursor: pointer;">
                🚀 Start Simulation
            </button>
        `;
        
        footerContainer.innerHTML = footerHTML;
    }
}

/**
 * Setup all event listeners
 */
function setupAllEventListeners() {
    console.log('🔧 Setting up all event listeners...');
    
    // Global controls
    setupGlobalEventListeners();
    
    // Panel-specific listeners for each character
    characters.forEach((_, index) => {
        setupPanelEventListeners(index);
    });
    
    console.log('✅ All event listeners setup complete');
}

/**
 * Setup global event listeners (add/remove buttons, global API key, etc.)
 */
function setupGlobalEventListeners() {
    // Global API key
    const globalApiInput = document.getElementById('global-api-key');
    if (globalApiInput) {
        globalApiInput.addEventListener('input', (e) => {
            globalAPIKey = e.target.value;
            console.log('🔑 Global API key updated');
        });
    }
    
    // Add character button
    const addBtn = document.getElementById('add-character-btn');
    if (addBtn) {
        addBtn.addEventListener('click', addNewCharacter);
    }
    
    // Remove character button
    const removeBtn = document.getElementById('remove-character-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', removeCurrentCharacter);
    }
    
    // Randomize current button
    const randomizeBtn = document.getElementById('randomize-current-btn');
    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', handleRandomizeClick);
    }
    
    // Start simulation button
    const startBtn = document.getElementById('start-simulation-btn');
    if (startBtn) {
        startBtn.addEventListener('click', handleStartSimulation);
    }
}

/**
 * Setup event listeners for a specific character panel
 */
function setupPanelEventListeners(index) {
    // Basic info inputs
    ['name', 'gender', 'jobRole', 'build', 'isPlayer', 'api-key'].forEach(field => {
        const element = document.getElementById(`${field}-${index}`);
        if (element) {
            element.addEventListener('change', () => updateCharacterFromForm(index));
        }
    });
    
    // Physical attribute sliders
    ['age', 'height', 'weight', 'looks'].forEach(attr => {
        const slider = document.getElementById(`${attr}-${index}`);
        const valueLabel = document.getElementById(`${attr}-val-${index}`);
        if (slider && valueLabel) {
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                characters[index].physicalAttributes[attr] = value;
                
                const unit = attr === 'height' ? 'cm' : 
                           attr === 'weight' ? 'kg' : 
                           attr === 'looks' ? '/10' : '';
                valueLabel.textContent = `${value}${unit}`;
            });
        }
    });
    
    // Skill attribute sliders
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const slider = document.getElementById(`${skill}-${index}`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                characters[index].skillAttributes[skill] = value;
                const valueLabel = document.getElementById(`${skill}-val-${index}`);
                if (valueLabel) {
                    valueLabel.textContent = `${value}%`;
                }
            });
        }
    });
    
    // Personality tags checkboxes
    PERSONALITY_TAGS.forEach(tag => {
        const checkbox = document.getElementById(`personality-${index}-${tag}`);
        if (checkbox) {
            checkbox.addEventListener('change', () => updatePersonalityTags(index));
        }
    });
    
    // Inventory checkboxes
    INVENTORY_OPTIONS.forEach(item => {
        const checkbox = document.getElementById(`inventory-${index}-${item}`);
        if (checkbox) {
            checkbox.addEventListener('change', () => updateInventory(index));
        }
    });
    
    // Desk items checkboxes
    DESK_ITEM_OPTIONS.forEach(item => {
        const checkbox = document.getElementById(`desk-item-${index}-${item}`);
        if (checkbox) {
            checkbox.addEventListener('change', () => updateDeskItems(index));
        }
    });
    
    // Sprite navigation
    const prevBtn = document.getElementById(`sprite-prev-${index}`);
    const nextBtn = document.getElementById(`sprite-next-${index}`);
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => navigateSprite(index, -1));
        nextBtn.addEventListener('click', () => navigateSprite(index, 1));
    }
    
    // Portrait upload
    const uploadBtn = document.getElementById(`upload-portrait-btn-${index}`);
    const uploadInput = document.getElementById(`portrait-upload-${index}`);
    const clearBtn = document.getElementById(`clear-custom-${index}`);
    
    if (uploadBtn && uploadInput) {
        uploadBtn.addEventListener('click', () => uploadInput.click());
        uploadInput.addEventListener('change', (e) => handleCustomPortraitUpload(index, e.target.files[0]));
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => clearCustomPortrait(index));
    }
}

/**
 * Switch to a specific character tab
 */
function switchToTab(index) {
    if (index < 0 || index >= characters.length) {
        console.warn(`Invalid character index: ${index}`);
        return;
    }
    
    // Update current character from form before switching
    if (currentCharacterIndex !== index) {
        updateCharacterFromForm(currentCharacterIndex);
    }
    
    currentCharacterIndex = index;
    
    // Update tab appearance
    document.querySelectorAll('.character-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    // Update panel visibility
    document.querySelectorAll('.creator-panel').forEach((panel, i) => {
        panel.classList.toggle('hidden', i !== index);
    });
    
    console.log(`📝 Switched to character ${index + 1}: ${characters[index].name}`);
}

/**
 * Update character data from form inputs
 */
function updateCharacterFromForm(index) {
    const character = characters[index];
    if (!character) return;
    
    // Basic info
    const nameInput = document.getElementById(`name-${index}`);
    const genderSelect = document.getElementById(`gender-${index}`);
    const jobRoleSelect = document.getElementById(`jobRole-${index}`);
    const buildSelect = document.getElementById(`build-${index}`);
    const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
    const apiKeyInput = document.getElementById(`api-key-${index}`);
    
    if (nameInput) character.name = nameInput.value;
    if (genderSelect) character.physicalAttributes.gender = genderSelect.value;
    if (jobRoleSelect) character.jobRole = jobRoleSelect.value;
    if (buildSelect) character.physicalAttributes.build = buildSelect.value;
    if (isPlayerCheckbox) {
        // Ensure only one player character
        if (isPlayerCheckbox.checked) {
            characters.forEach((char, i) => {
                char.isPlayer = (i === index);
            });
        }
    }
    if (apiKeyInput) character.apiKey = apiKeyInput.value;
    
    // Update tab display
    createAllCharacterTabs();
}

/**
 * Update personality tags from checkboxes
 */
function updatePersonalityTags(index) {
    const character = characters[index];
    const selectedTags = [];
    
    PERSONALITY_TAGS.forEach(tag => {
        const checkbox = document.getElementById(`personality-${index}-${tag}`);
        if (checkbox && checkbox.checked) {
            selectedTags.push(tag);
        }
    });
    
    character.personalityTags = selectedTags;
}

/**
 * Update inventory from checkboxes (max 3)
 */
function updateInventory(index) {
    const character = characters[index];
    const selectedItems = [];
    
    INVENTORY_OPTIONS.forEach(item => {
        const checkbox = document.getElementById(`inventory-${index}-${item}`);
        if (checkbox && checkbox.checked) {
            selectedItems.push(item);
        }
    });
    
    // Limit to 3 items
    if (selectedItems.length > 3) {
        selectedItems.splice(3);
        // Update checkboxes to reflect limit
        INVENTORY_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`inventory-${index}-${item}`);
            if (checkbox) {
                checkbox.checked = selectedItems.includes(item);
            }
        });
    }
    
    character.inventory = selectedItems;
}

/**
 * Update desk items from checkboxes (max 2)
 */
function updateDeskItems(index) {
    const character = characters[index];
    const selectedItems = [];
    
    DESK_ITEM_OPTIONS.forEach(item => {
        const checkbox = document.getElementById(`desk-item-${index}-${item}`);
        if (checkbox && checkbox.checked) {
            selectedItems.push(item);
        }
    });
    
    // Limit to 2 items
    if (selectedItems.length > 2) {
        selectedItems.splice(2);
        // Update checkboxes to reflect limit
        DESK_ITEM_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`desk-item-${index}-${item}`);
            if (checkbox) {
                checkbox.checked = selectedItems.includes(item);
            }
        });
    }
    
    character.deskItems = selectedItems;
}

/**
 * Navigate sprite selection
 */
function navigateSprite(index, direction) {
    const character = characters[index];
    if (!character) return;
    
    let newSpriteIndex = (character.spriteIndex || 0) + direction;
    
    // Wrap around for 20 sprites
    if (newSpriteIndex >= 20) newSpriteIndex = 0;
    if (newSpriteIndex < 0) newSpriteIndex = 19;
    
    character.spriteIndex = newSpriteIndex;
    character.spriteSheet = SPRITE_OPTIONS[newSpriteIndex];
    
    // Update display
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
 * Update character portrait image
 */
function updateCharacterPortrait(index, spriteSheet) {
    const portraitImg = document.getElementById(`character-portrait-${index}`);
    if (portraitImg && spriteSheet) {
        // Clean up sprite path
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
 * Handle custom portrait upload
 */
function handleCustomPortraitUpload(index, file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById(`custom-canvas-${index}`);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw image scaled to fit
                const aspectRatio = img.width / img.height;
                let drawWidth = canvas.width;
                let drawHeight = canvas.height;
                
                if (aspectRatio > 1) {
                    drawHeight = canvas.width / aspectRatio;
                } else {
                    drawWidth = canvas.height * aspectRatio;
                }
                
                const x = (canvas.width - drawWidth) / 2;
                const y = (canvas.height - drawHeight) / 2;
                
                ctx.drawImage(img, x, y, drawWidth, drawHeight);
                
                // Store custom portrait
                characters[index].customPortrait = canvas.toDataURL();
                console.log(`📷 Custom portrait uploaded for ${characters[index].name}`);
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Clear custom portrait
 */
function clearCustomPortrait(index) {
    const canvas = document.getElementById(`custom-canvas-${index}`);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw placeholder
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Custom', canvas.width / 2, canvas.height / 2 - 5);
        ctx.fillText('Portrait', canvas.width / 2, canvas.height / 2 + 10);
        
        characters[index].customPortrait = null;
        console.log(`🗑️ Custom portrait cleared for ${characters[index].name}`);
    }
}

/**
 * Add new character
 */
function addNewCharacter() {
    if (characters.length >= MAX_CHARACTERS) {
        alert(`Maximum ${MAX_CHARACTERS} characters allowed`);
        return;
    }
    
    const newIndex = characters.length;
    const newCharacter = createCompleteCharacter(newIndex);
    newCharacter.isPlayer = false; // Only first character can be player initially
    
    characters.push(newCharacter);
    
    // Recreate UI
    createAllCharacterTabs();
    createAllCharacterPanels();
    setupAllEventListeners();
    
    // Switch to new character
    switchToTab(newIndex);
    
    // Update controls
    updateCharacterCountControls();
    
    console.log(`✅ Added new character: ${newCharacter.name}`);
}

/**
 * Remove current character
 */
function removeCurrentCharacter() {
    if (characters.length <= MIN_CHARACTERS) {
        alert(`Minimum ${MIN_CHARACTERS} characters required`);
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
    
    // Recreate UI
    createAllCharacterTabs();
    createAllCharacterPanels();
    setupAllEventListeners();
    
    // Switch to valid character
    switchToTab(currentCharacterIndex);
    
    // Update controls
    updateCharacterCountControls();
    
    console.log(`✅ Removed character: ${removedCharacter.name}`);
}

/**
 * Update character count controls
 */
function updateCharacterCountControls() {
    const countDisplay = document.getElementById('character-count');
    const addBtn = document.getElementById('add-character-btn');
    const removeBtn = document.getElementById('remove-character-btn');
    
    if (countDisplay) {
        countDisplay.textContent = `${characters.length}/${MAX_CHARACTERS} Characters`;
    }
    
    if (addBtn) {
        addBtn.disabled = characters.length >= MAX_CHARACTERS;
        addBtn.style.opacity = characters.length >= MAX_CHARACTERS ? '0.5' : '1';
    }
    
    if (removeBtn) {
        removeBtn.disabled = characters.length <= MIN_CHARACTERS;
        removeBtn.style.opacity = characters.length <= MIN_CHARACTERS ? '0.5' : '1';
    }
}

/**
 * Handle randomize button click
 */
function handleRandomizeClick() {
    const randomizeAllCheckbox = document.getElementById('randomize-all-checkbox');
    const isRandomizeAll = randomizeAllCheckbox && randomizeAllCheckbox.checked;
    
    if (isRandomizeAll) {
        console.log('🎲 Randomizing all characters...');
        characters.forEach((char, index) => {
            const wasPlayer = char.isPlayer;
            characters[index] = createCompleteCharacter(index);
            characters[index].isPlayer = wasPlayer; // Preserve player status
        });
        
        // Recreate UI for all characters
        createAllCharacterTabs();
        createAllCharacterPanels();
        setupAllEventListeners();
        switchToTab(currentCharacterIndex);
        
        console.log('✅ All characters randomized');
    } else {
        console.log(`🎲 Randomizing character ${currentCharacterIndex + 1}...`);
        randomizeCurrentCharacter();
    }
}

/**
 * Randomize current character only
 */
function randomizeCurrentCharacter() {
    try {
        if (currentCharacterIndex >= 0 && currentCharacterIndex < characters.length) {
            const wasPlayer = characters[currentCharacterIndex].isPlayer;
            characters[currentCharacterIndex] = createCompleteCharacter(currentCharacterIndex);
            characters[currentCharacterIndex].isPlayer = wasPlayer; // Preserve player status
            
            // Recreate current panel
            const panelsContainer = document.getElementById('character-panels');
            const oldPanel = document.getElementById(`character-panel-${currentCharacterIndex}`);
            if (oldPanel) oldPanel.remove();
            
            createCharacterPanel(currentCharacterIndex);
            createAllCharacterTabs();
            setupPanelEventListeners(currentCharacterIndex);
            
            console.log(`✅ Randomized character ${currentCharacterIndex + 1}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to randomize character:', error);
    }
}

/**
 * Create a complete character with all attributes
 */
function createCompleteCharacter(index) {
    const gender = getRandomItem(GENDERS);
    const randomTags = getRandomItems(PERSONALITY_TAGS, 3, 6);
    const randomInventory = getRandomItems(INVENTORY_OPTIONS, 1, 3);
    const randomDeskItems = getRandomItems(DESK_ITEM_OPTIONS, 1, 2);
    const office = officeType;
    
    // Use valid sprite index for 20 sprites
    const validSpriteIndex = Math.floor(Math.random() * 20);
    const spriteSheet = SPRITE_OPTIONS[validSpriteIndex];
    
    return {
        id: `char_${index}`,
        name: generateNameByGender(gender),
        isPlayer: false,
        gender: gender,
        office: office,
        jobRole: getRandomItem(JOB_ROLES_BY_OFFICE[office]),
        
        // Sprite information
        spriteSheet: spriteSheet,
        spriteIndex: validSpriteIndex,
        customPortrait: null,
        
        // Physical attributes
        physicalAttributes: {
            age: Math.floor(Math.random() * 30) + 22, // 22-52
            height: Math.floor(Math.random() * 40) + 150, // 150-190 cm
            weight: Math.floor(Math.random() * 60) + 50, // 50-110 kg
            looks: Math.floor(Math.random() * 10) + 1, // 1-10
            build: getRandomItem(PHYSICAL_BUILDS),
            gender: gender
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
        relationships: {}
    };
}

/**
 * Generate name based on gender
 */
function generateNameByGender(gender) {
    const names = NAMES_BY_GENDER[gender];
    if (!names) return 'Unknown Character';
    
    const firstName = getRandomItem(names.first);
    const lastName = getRandomItem(names.last);
    return `${firstName} ${lastName}`;
}

/**
 * Handle start simulation
 */
function handleStartSimulation() {
    console.log('🚀 Starting simulation...');
    
    try {
        // Update current character from form
        updateCharacterFromForm(currentCharacterIndex);
        
        // Validate all characters
        const validationErrors = validateAllCharacters();
        if (validationErrors.length > 0) {
            console.error('❌ Character validation failed:', validationErrors);
            alert('Please fix character validation errors:\n' + validationErrors.join('\n'));
            return;
        }
        
        // Initialize relationships between all characters
        initializeCharacterRelationships();
        
        // Start the game
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
 * Validate all characters before starting game
 */
function validateAllCharacters() {
    const errors = [];
    
    if (!characters || characters.length === 0) {
        errors.push('No characters created');
        return errors;
    }
    
    if (characters.length < MIN_CHARACTERS) {
        errors.push(`At least ${MIN_CHARACTERS} characters required`);
    }
    
    if (characters.length > MAX_CHARACTERS) {
        errors.push(`Maximum ${MAX_CHARACTERS} characters allowed`);
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
        
        if (!char.physicalAttributes.gender) {
            errors.push(`Character ${index + 1}: Missing gender`);
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

// =============================================================================
// EXPORT FUNCTIONS FOR GAME STATE CONNECTION
// =============================================================================

/**
 * Export characters for game initialization
 */
window.getCharactersFromCreator = function() {
    console.log('📤 Exporting characters from creator...');
    
    if (!characters || characters.length === 0) {
        console.warn('⚠️ No characters created, returning null');
        return null;
    }
    
    // Update current character from form before export
    updateCharacterFromForm(currentCharacterIndex);
    
    // Ensure all characters have proper sprite paths
    const fixedCharacters = characters.map(char => {
        // Clean up sprite path
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

console.log('🎭 Complete character creator loaded and ready');
