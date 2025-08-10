/**
 * Character Creator - Complete standalone implementation
 * 
 * This file contains all character creator functionality:
 * - Full character customization forms
 * - Sprite selection with proper portraits (4th sprite, first row)
 * - Physical attributes sliders
 * - Personality tags selection
 * - Inventory and desk items
 * - Portrait generation from sprites
 * - Complete UI functionality
 */

// COMPLETE CONSTANTS
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

const SPRITE_OPTIONS = [
    "assets/characters/character-01.png",
    "assets/characters/character-02.png", 
    "assets/characters/character-03.png",
    "assets/characters/character-04.png",
    "assets/characters/character-05.png"
];

// GAME STATE
const NUM_CHARACTERS = 5;
let characters = [];
let currentCharacterIndex = 0;
let officeType = 'Corporate';

/**
 * Main initialization function called from main.js
 * @param {string} selectedOfficeType - Office type for job roles
 */
export function initializeCharacterCreator(selectedOfficeType = 'Corporate') {
    console.log('🎭 Initializing character creator...');
    
    try {
        officeType = selectedOfficeType;
        
        // Get DOM elements
        const tabsContainer = document.getElementById('character-tabs');
        const panelsContainer = document.getElementById('character-panels');
        
        if (!tabsContainer || !panelsContainer) {
            throw new Error('Character creator DOM elements not found');
        }
        
        // Clear containers
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';
        characters.length = 0;
        
        // Create characters and UI
        for (let i = 0; i < NUM_CHARACTERS; i++) {
            characters.push(createCharacter(i));
            createCharacterTab(i);
            createCharacterPanel(i);
        }
        
        // Set first tab as active
        switchToTab(0);
        
        // Initialize buttons
        initializeCharacterCreatorButtons();
        
        console.log('✅ Character creator initialized successfully');
        
    } catch (error) {
        console.error('❌ Character creator initialization failed:', error);
        throw error;
    }
}

/**
 * Initialize character creator buttons
 */
function initializeCharacterCreatorButtons() {
    console.log('🔧 Setting up character creator buttons...');
    
    // Start Simulation Button
    const startButton = document.getElementById('start-simulation-button');
    if (startButton) {
        // Remove existing listeners by cloning
        const newStartButton = startButton.cloneNode(true);
        startButton.parentNode.replaceChild(newStartButton, startButton);
        
        // Add fresh event listener
        newStartButton.addEventListener('click', handleStartSimulation);
        console.log('✅ Start Simulation button connected');
    }
    
    // Randomize Button
    const randomizeButton = document.getElementById('randomize-btn');
    if (randomizeButton) {
        // Remove existing listeners by cloning
        const newRandomizeButton = randomizeButton.cloneNode(true);
        randomizeButton.parentNode.replaceChild(newRandomizeButton, randomizeButton);
        
        // Add fresh event listener
        newRandomizeButton.addEventListener('click', randomizeCurrentCharacter);
        console.log('✅ Randomize button connected');
    }
}

/**
 * Create a character with full customization data
 */
function createCharacter(index) {
    return {
        id: `char_${index}`,
        name: `Character ${index + 1}`,
        isPlayer: index === 0,
        spriteSheet: SPRITE_OPTIONS[index % SPRITE_OPTIONS.length] || null,
        portrait: null, // Will be generated from sprite
        apiKey: '',
        jobRole: JOB_ROLES_BY_OFFICE[officeType][0],
        physicalAttributes: { 
            age: 25 + Math.floor(Math.random() * 15), 
            height: 160 + Math.floor(Math.random() * 25), 
            weight: 60 + Math.floor(Math.random() * 30), 
            build: PHYSICAL_BUILDS[Math.floor(Math.random() * PHYSICAL_BUILDS.length)], 
            looks: Math.floor(Math.random() * 6) + 5 
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
 * Create character panel with full functionality
 */
function createCharacterPanel(index) {
    const panelsContainer = document.getElementById('character-panels');
    const panel = document.createElement('div');
    panel.id = `character-panel-${index}`;
    panel.className = `creator-panel ${index === 0 ? '' : 'hidden'}`;
    
    const character = characters[index];
    panel.innerHTML = generateFullPanelHTML(index, character);
    panelsContainer.appendChild(panel);
    
    // Setup all event listeners for this panel
    setupPanelEventListeners(index);
    
    // Generate sprite grid and portrait
    populateSpriteGrid(index);
    updateCharacterPortrait(index, character.spriteSheet);
}

/**
 * Generate complete panel HTML with all form elements
 */
function generateFullPanelHTML(index, charData) {
    const jobRoleOptions = JOB_ROLES_BY_OFFICE[officeType]
        .map(role => `<option value="${role}" ${role === charData.jobRole ? 'selected' : ''}>${role}</option>`)
        .join('');
        
    const buildOptions = PHYSICAL_BUILDS
        .map(build => `<option value="${build}" ${build === charData.physicalAttributes.build ? 'selected' : ''}>${build}</option>`)
        .join('');
        
    const tagOptions = PERSONALITY_TAGS
        .map(tag => `<label class="checkbox-label" style="display: block; margin: 2px 0;">
            <input type="checkbox" id="tags-${index}-${tag}" value="${tag}" ${charData.personalityTags.includes(tag) ? 'checked' : ''}> 
            ${tag}
        </label>`)
        .join('');
        
    const inventoryOptions = INVENTORY_OPTIONS
        .map(item => `<label class="checkbox-label" style="display: block; margin: 2px 0;">
            <input type="checkbox" id="inventory-item-${index}-${item}" value="${item}" ${charData.inventory.includes(item) ? 'checked' : ''}> 
            ${item}
        </label>`)
        .join('');
        
    const deskItemOptions = DESK_ITEM_OPTIONS
        .map(item => `<label class="checkbox-label" style="display: block; margin: 2px 0;">
            <input type="checkbox" id="desk-item-${index}-${item}" value="${item}" ${charData.deskItems.includes(item) ? 'checked' : ''}> 
            ${item}
        </label>`)
        .join('');

    return `
        <div class="flex gap-6 h-full">
            <!-- Left Column: Form Fields -->
            <div class="flex-1 space-y-4 overflow-y-auto" style="max-height: 500px; padding-right: 10px;">
                <!-- Basic Info -->
                <div class="form-group">
                    <label for="name-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Character Name</label>
                    <input type="text" id="name-${index}" value="${charData.name}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                
                <div class="form-group">
                    <label for="jobRole-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Job Role</label>
                    <select id="jobRole-${index}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">${jobRoleOptions}</select>
                </div>

                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="isPlayer-${index}" ${charData.isPlayer ? 'checked' : ''}>
                        <span style="font-weight: bold;">Player Character</span>
                    </label>
                </div>
                
                <!-- Physical Attributes -->
                <div class="form-group">
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Physical Attributes</h3>
                    <div style="space-y: 8px;">
                        <div>
                            <label>Age: <span id="age-val-${index}">${charData.physicalAttributes.age}</span></label>
                            <input type="range" id="age-${index}" min="22" max="65" value="${charData.physicalAttributes.age}" style="width: 100%;">
                        </div>
                        <div>
                            <label>Height: <span id="height-val-${index}">${charData.physicalAttributes.height} cm</span></label>
                            <input type="range" id="height-${index}" min="150" max="200" value="${charData.physicalAttributes.height}" style="width: 100%;">
                        </div>
                        <div>
                            <label>Weight: <span id="weight-val-${index}">${charData.physicalAttributes.weight} kg</span></label>
                            <input type="range" id="weight-${index}" min="45" max="120" value="${charData.physicalAttributes.weight}" style="width: 100%;">
                        </div>
                        <div>
                            <label for="build-${index}" style="display: block; margin-bottom: 5px;">Build</label>
                            <select id="build-${index}" style="width: 100%; padding: 4px;">${buildOptions}</select>
                        </div>
                        <div>
                            <label>Looks: <span id="looks-val-${index}">${charData.physicalAttributes.looks}/10</span></label>
                            <input type="range" id="looks-${index}" min="1" max="10" value="${charData.physicalAttributes.looks}" style="width: 100%;">
                        </div>
                    </div>
                </div>

                <!-- Skills -->
                <div class="form-group">
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Skills</h3>
                    <div style="space-y: 8px;">
                        <div>
                            <label>Competence: <span id="competence-val-${index}">${charData.skills.competence}/10</span></label>
                            <input type="range" id="competence-${index}" min="1" max="10" value="${charData.skills.competence}" style="width: 100%;">
                        </div>
                        <div>
                            <label>Laziness: <span id="laziness-val-${index}">${charData.skills.laziness}/10</span></label>
                            <input type="range" id="laziness-${index}" min="1" max="10" value="${charData.skills.laziness}" style="width: 100%;">
                        </div>
                        <div>
                            <label>Charisma: <span id="charisma-val-${index}">${charData.skills.charisma}/10</span></label>
                            <input type="range" id="charisma-${index}" min="1" max="10" value="${charData.skills.charisma}" style="width: 100%;">
                        </div>
                        <div>
                            <label>Leadership: <span id="leadership-val-${index}">${charData.skills.leadership}/10</span></label>
                            <input type="range" id="leadership-${index}" min="1" max="10" value="${charData.skills.leadership}" style="width: 100%;">
                        </div>
                    </div>
                </div>
                
                <!-- Personality Tags -->
                <div class="form-group">
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Personality (Max 6)</h3>
                    <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                        ${tagOptions}
                    </div>
                </div>

                <!-- Inventory -->
                <div class="form-group">
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Inventory Items (Max 3)</h3>
                    <div style="max-height: 120px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                        ${inventoryOptions}
                    </div>
                </div>
                
                <!-- Desk Items -->
                <div class="form-group">
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Desk Items (Max 2)</h3>
                    <div style="max-height: 100px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                        ${deskItemOptions}
                    </div>
                </div>
            </div>

            <!-- Right Column: Sprite Selection and Portrait -->
            <div class="w-80" style="width: 300px;">
                <div class="space-y-4">
                    <!-- Character Portrait -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Character Portrait</h3>
                        <canvas id="preview-canvas-${index}" width="96" height="96" style="border: 2px solid #ccc; border-radius: 8px; background: #f0f0f0;"></canvas>
                    </div>

                    <!-- Sprite Selection -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Choose Sprite</h3>
                        <div id="sprite-grid-${index}" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"></div>
                    </div>

                    <!-- API Key (if needed) -->
                    <div class="form-group">
                        <label for="api-key-input-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">API Key (Optional)</label>
                        <input type="text" id="api-key-input-${index}" value="${charData.apiKey}" placeholder="Enter API key..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;">
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Setup event listeners for character panel
 */
function setupPanelEventListeners(index) {
    // Physical attribute sliders
    ['age', 'height', 'weight', 'looks'].forEach(attr => {
        const slider = document.getElementById(`${attr}-${index}`);
        const valueLabel = document.getElementById(`${attr}-val-${index}`);
        if (slider && valueLabel) {
            slider.addEventListener('input', function() {
                const value = this.value;
                characters[index].physicalAttributes[attr] = parseInt(value);
                
                if (attr === 'height') {
                    valueLabel.textContent = `${value} cm`;
                } else if (attr === 'weight') {
                    valueLabel.textContent = `${value} kg`;
                } else if (attr === 'looks') {
                    valueLabel.textContent = `${value}/10`;
                } else {
                    valueLabel.textContent = value;
                }
            });
        }
    });

    // Skill sliders
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const slider = document.getElementById(`${skill}-${index}`);
        const valueLabel = document.getElementById(`${skill}-val-${index}`);
        if (slider && valueLabel) {
            slider.addEventListener('input', function() {
                const value = parseInt(this.value);
                characters[index].skills[skill] = value;
                valueLabel.textContent = `${value}/10`;
            });
        }
    });

    // Personality tags (max 6)
    PERSONALITY_TAGS.forEach(tag => {
        const checkbox = document.getElementById(`tags-${index}-${tag}`);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                updateCharacterTags(index, 'personalityTags', 6);
            });
        }
    });

    // Inventory items (max 3)
    INVENTORY_OPTIONS.forEach(item => {
        const checkbox = document.getElementById(`inventory-item-${index}-${item}`);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                updateCharacterItems(index, 'inventory', 3);
            });
        }
    });

    // Desk items (max 2)
    DESK_ITEM_OPTIONS.forEach(item => {
        const checkbox = document.getElementById(`desk-item-${index}-${item}`);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                updateCharacterItems(index, 'deskItems', 2);
            });
        }
    });
}

/**
 * Update character tags with limit enforcement
 */
function updateCharacterTags(index, tagType, maxLimit) {
    const checkboxes = document.querySelectorAll(`input[id^="${tagType === 'personalityTags' ? 'tags' : tagType}-${index}-"]:checked`);
    let selectedTags = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedTags.length > maxLimit) {
        // Find the last checked box and uncheck it
        const lastChecked = Array.from(document.querySelectorAll(`input[id^="${tagType === 'personalityTags' ? 'tags' : tagType}-${index}-"]`))
            .reverse()
            .find(cb => cb.checked);
        if (lastChecked) {
            lastChecked.checked = false;
            selectedTags.pop();
        }
    }
    
    characters[index][tagType] = selectedTags;
}

/**
 * Update character items with limit enforcement
 */
function updateCharacterItems(index, itemType, maxLimit) {
    const prefix = itemType === 'inventory' ? 'inventory-item' : 'desk-item';
    const checkboxes = document.querySelectorAll(`input[id^="${prefix}-${index}-"]:checked`);
    let selectedItems = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedItems.length > maxLimit) {
        // Find the last checked box and uncheck it
        const lastChecked = Array.from(document.querySelectorAll(`input[id^="${prefix}-${index}-"]`))
            .reverse()
            .find(cb => cb.checked);
        if (lastChecked) {
            lastChecked.checked = false;
            selectedItems.pop();
        }
    }
    
    characters[index][itemType] = selectedItems;
}

/**
 * Populate sprite grid with clickable sprite options
 */
function populateSpriteGrid(index) {
    const spriteGrid = document.getElementById(`sprite-grid-${index}`);
    if (!spriteGrid) return;
    
    spriteGrid.innerHTML = '';
    
    SPRITE_OPTIONS.forEach((spritePath, spriteIndex) => {
        const spriteContainer = document.createElement('div');
        spriteContainer.style.cssText = 'border: 2px solid transparent; border-radius: 4px; cursor: pointer; padding: 2px; text-align: center;';
        
        const img = document.createElement('img');
        img.src = spritePath;
        img.style.cssText = 'width: 48px; height: 48px; display: block;';
        
        // Set selection state
        if (spritePath === characters[index].spriteSheet) {
            spriteContainer.style.borderColor = '#3b82f6';
            spriteContainer.style.backgroundColor = '#eff6ff';
        }
        
        spriteContainer.addEventListener('click', () => {
            // Remove selection from all sprites in this grid
            spriteGrid.querySelectorAll('div').forEach(container => {
                container.style.borderColor = 'transparent';
                container.style.backgroundColor = 'transparent';
            });
            
            // Select this sprite
            spriteContainer.style.borderColor = '#3b82f6';
            spriteContainer.style.backgroundColor = '#eff6ff';
            
            // Update character data
            characters[index].spriteSheet = spritePath;
            
            // Update portrait
            updateCharacterPortrait(index, spritePath);
        });
        
        spriteContainer.appendChild(img);
        spriteGrid.appendChild(spriteContainer);
    });
}

/**
 * Update character portrait - Extract 4th sprite from first row
 */
function updateCharacterPortrait(index, spritePath) {
    const canvas = document.getElementById(`preview-canvas-${index}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (spritePath) {
        const img = new Image();
        img.onload = function() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Extract 4th sprite from first row (index 3, since 0-based)
            // Assuming each sprite is 48x96 and they're arranged in a horizontal row
            const spriteWidth = 48;
            const spriteHeight = 96;
            const spriteIndex = 3; // Fourth sprite (0-based index)
            const sourceX = spriteIndex * spriteWidth;
            const sourceY = 0; // First row
            
            // Draw the specific sprite frame, scaled to fit canvas
            ctx.drawImage(
                img,
                sourceX, sourceY, spriteWidth, spriteHeight, // Source rectangle
                0, 0, canvas.width, canvas.height // Destination rectangle
            );
            
            // Store as portrait data
            characters[index].portrait = canvas.toDataURL();
        };
        
        img.onerror = function() {
            // Fallback: draw placeholder
            drawPlaceholderPortrait(ctx, canvas);
        };
        
        img.src = spritePath;
    } else {
        // Draw placeholder when no sprite
        drawPlaceholderPortrait(ctx, canvas);
    }
}

/**
 * Draw placeholder portrait
 */
function drawPlaceholderPortrait(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No Portrait', canvas.width / 2, canvas.height / 2 + 4);
}

/**
 * Switch to a character tab
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
 * Update characters from all form inputs
 */
function updateCharactersFromForms() {
    characters.forEach((char, index) => {
        // Basic info
        const nameInput = document.getElementById(`name-${index}`);
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
        const apiKeyInput = document.getElementById(`api-key-input-${index}`);
        const buildSelect = document.getElementById(`build-${index}`);
        
        if (nameInput) char.name = nameInput.value || char.name;
        if (jobRoleSelect) char.jobRole = jobRoleSelect.value || char.jobRole;
        if (isPlayerCheckbox) char.isPlayer = isPlayerCheckbox.checked;
        if (apiKeyInput) char.apiKey = apiKeyInput.value || char.apiKey;
        if (buildSelect) char.physicalAttributes.build = buildSelect.value || char.physicalAttributes.build;
        
        // Physical attributes and skills are updated by their respective event listeners
        // Personality tags, inventory, and desk items are updated by their respective event listeners
    });
}

/**
 * Randomize current character only
 */
function randomizeCurrentCharacter() {
    console.log(`🎲 Randomizing character ${currentCharacterIndex + 1}...`);
    
    try {
        if (currentCharacterIndex >= 0 && currentCharacterIndex < characters.length) {
            const wasPlayer = characters[currentCharacterIndex].isPlayer;
            characters[currentCharacterIndex] = createRandomCharacter(currentCharacterIndex);
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
 * Create randomized character with full data
 */
function createRandomCharacter(index) {
    const randomTags = getRandomItems(PERSONALITY_TAGS, 3, 6);
    const randomInventory = getRandomItems(INVENTORY_OPTIONS, 1, 3);
    const randomDeskItems = getRandomItems(DESK_ITEM_OPTIONS, 1, 2);
    
    return {
        id: `char_${index}`,
        name: generateRandomName(),
        isPlayer: index === 0, // Preserve player status for first character
        spriteSheet: getRandomItem(SPRITE_OPTIONS),
        portrait: null, // Will be generated
        apiKey: '',
        jobRole: getRandomItem(JOB_ROLES_BY_OFFICE[officeType]),
        physicalAttributes: {
            age: Math.floor(Math.random() * 20) + 25,
            height: Math.floor(Math.random() * 30) + 160,
            weight: Math.floor(Math.random() * 40) + 60,
            build: getRandomItem(PHYSICAL_BUILDS),
            looks: Math.floor(Math.random() * 10) + 1
        },
        skills: {
            competence: Math.floor(Math.random() * 10) + 1,
            laziness: Math.floor(Math.random() * 10) + 1,
            charisma: Math.floor(Math.random() * 10) + 1,
            leadership: Math.floor(Math.random() * 10) + 1
        },
        personalityTags: randomTags,
        experienceTags: [],
        needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
        inventory: randomInventory,
        deskItems: randomDeskItems,
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
 * Refresh a single character panel
 */
function refreshSingleCharacterPanel(index) {
    const panel = document.getElementById(`character-panel-${index}`);
    if (panel) {
        const character = characters[index];
        panel.innerHTML = generateFullPanelHTML(index, character);
        setupPanelEventListeners(index);
        populateSpriteGrid(index);
        updateCharacterPortrait(index, character.spriteSheet);
    }
}

/**
 * Handle Start Simulation button click
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
 * Format characters for game engine with full data preservation
 */
function formatCharactersForGame() {
    return characters.map(char => ({
        ...char,
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
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'Morgan', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kai', 'Logan', 'Micah', 'Nico'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Lee', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Adams', 'Baker'];
    return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

// Make functions available globally for HTML onclick handlers
window.switchTab = switchToTab;
window.randomizeCurrentCharacter = randomizeCurrentCharacter;
window.startSimulation = handleStartSimulation;

// Export for module usage
export { handleStartSimulation as startSimulation };

console.log('🎭 Character creator loaded and ready');
