/**
 * STAGE 2 COMPLETE: Updated character-creator.js with proper callback system and event listeners
 * 
 * Character Creator - Manages character creation UI and flow
 */

// Constants from your SSOT
const NUM_CHARACTERS = 5;
const JOB_ROLES_BY_OFFICE = {
    'Default': ['Senior Coder', 'Manager', 'Intern', 'Designer', 'HR Specialist'],
    'Startup': ['Full-Stack Developer', 'Product Manager', 'UX Designer', 'Marketing Specialist', 'CEO'],
    'Corp': ['Software Engineer', 'Project Manager', 'Business Analyst', 'Director', 'VP']
};

const PERSONALITY_TAGS = [
    'Introverted', 'Extroverted', 'Optimistic', 'Pessimistic', 'Competitive', 'Collaborative',
    'Creative', 'Analytical', 'Friendly', 'Reserved', 'Ambitious', 'Content', 'Meticulous',
    'Spontaneous', 'Leadership', 'Follower', 'Flirty', 'Professional', 'Humorous', 'Serious',
    'Empathetic', 'Detached', 'Innovative', 'Traditional', 'Energetic', 'Calm'
];

const MUTUALLY_EXCLUSIVE_TAGS = [
    ['Introverted', 'Extroverted'],
    ['Optimistic', 'Pessimistic'],
    ['Competitive', 'Collaborative'],
    ['Creative', 'Analytical'],
    ['Friendly', 'Reserved'],
    ['Ambitious', 'Content'],
    ['Meticulous', 'Spontaneous'],
    ['Leadership', 'Follower'],
    ['Flirty', 'Professional'],
    ['Humorous', 'Serious'],
    ['Empathetic', 'Detached'],
    ['Innovative', 'Traditional'],
    ['Energetic', 'Calm']
];

const BUILDS = ['Slim', 'Average', 'Athletic', 'Heavy', 'Muscular'];

const INVENTORY_ITEMS = [
    'Coffee Mug', 'Stress Ball', 'Notebook', 'Pen Collection', 'Reading Glasses',
    'Lucky Charm', 'Snacks', 'Energy Drink', 'Phone Charger', 'Earbuds'
];

const DESK_ITEMS = [
    'Plant', 'Photo Frame', 'Desk Lamp', 'Calendar', 'Stapler',
    'Motivational Quote', 'Rubber Duck', 'Action Figure'
];

// Mock API key for testing phase
const MOCK_API_KEY = 'mock-test-api-key-for-development';

// Global state
let characters = [];
let currentCharacterIndex = 0;
let officeType = 'Default';
let startGameCallback = null;

/**
 * Initialize character creator with proper callback
 * @param {Function} onComplete - The callback to run when creation is done.
 * @param {string} selectedOfficeType - The office type chosen by the user.
 */
export function initializeCharacterCreator(onComplete, selectedOfficeType) {
    startGameCallback = onComplete;
    officeType = selectedOfficeType;
    
    const tabsContainer = document.getElementById('character-tabs');
    const panelsContainer = document.getElementById('character-panels');
    const randomizeBtn = document.getElementById('randomize-btn');
    const startBtn = document.getElementById('start-simulation-button');

    // Clear old event listeners to prevent duplicates and memory leaks
    if (randomizeBtn) randomizeBtn.removeEventListener('click', randomizeCurrentCharacter);
    if (startBtn) startBtn.removeEventListener('click', startSimulation);

    tabsContainer.innerHTML = '';
    panelsContainer.innerHTML = '';
    characters.length = 0;

    for (let i = 0; i < NUM_CHARACTERS; i++) {
        characters.push(createNewCharacter(i));
        createTab(i);
        createPanel(i);
    }
    
    switchTab(0);

    randomizeBtn.addEventListener('click', randomizeCurrentCharacter);
    startBtn.addEventListener('click', startSimulation);
}

function createNewCharacter(index) {
    return {
        id: `char_${index}`,
        name: `Character ${index + 1}`,
        isPlayer: index === 0,
        spriteSheet: `assets/characters/Premade_Character_48x48_01.png`,
        apiKey: index === 0 ? '' : MOCK_API_KEY, // Player doesn't need API key, NPCs get mock key
        jobRole: JOB_ROLES_BY_OFFICE[officeType][0],
        physicalAttributes: { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 },
        skills: { competence: 5, laziness: 5, charisma: 5, leadership: 5 },
        personalityTags: [],
        inventory: [],
        deskItems: []
    };
}

function createTab(index) {
    const tabsContainer = document.getElementById('character-tabs');
    const tab = document.createElement('button');
    tab.textContent = `Character ${index + 1}`;
    tab.dataset.index = index;
    tab.onclick = () => switchTab(index);
    tabsContainer.appendChild(tab);
}

function createPanel(index) {
    const panelsContainer = document.getElementById('character-panels');
    const panel = document.createElement('div');
    panel.id = `character-panel-${index}`;
    panel.className = 'creator-panel hidden';
    
    panel.innerHTML = generatePanelHTML(index, characters[index]);
    panelsContainer.appendChild(panel);
    
    populateSpriteGrid(index);
    updatePreviewCanvas(index, characters[index].spriteSheet);
    setupPanelEventListeners(index);
}

function setupPanelEventListeners(index) {
    // Player toggle - FIXED: Only one player character allowed
    document.getElementById(`isPlayer-${index}`).addEventListener('change', (e) => {
        if (e.target.checked) {
            // Uncheck all other player checkboxes
            characters.forEach((char, i) => {
                if (i !== index) {
                    char.isPlayer = false;
                    const otherCheckbox = document.getElementById(`isPlayer-${i}`);
                    if (otherCheckbox) otherCheckbox.checked = false;
                    
                    // Show API key field for former player (now NPC)
                    const otherApiField = document.getElementById(`api-key-field-${i}`);
                    if (otherApiField) otherApiField.style.display = 'block';
                    
                    // Set mock API key for former player
                    const otherApiInput = document.getElementById(`api-key-${i}`);
                    if (otherApiInput) otherApiInput.value = MOCK_API_KEY;
                    char.apiKey = MOCK_API_KEY;
                }
            });
            
            // Set this character as player
            characters[index].isPlayer = true;
            characters[index].apiKey = ''; // Player doesn't need API key
            
            // Hide API key field for player
            const apiField = document.getElementById(`api-key-field-${index}`);
            if (apiField) apiField.style.display = 'none';
        } else {
            // If unchecking, this becomes an NPC
            characters[index].isPlayer = false;
            characters[index].apiKey = MOCK_API_KEY;
            
            // Show API key field and set mock key
            const apiField = document.getElementById(`api-key-field-${index}`);
            if (apiField) apiField.style.display = 'block';
            
            const apiInput = document.getElementById(`api-key-${index}`);
            if (apiInput) apiInput.value = MOCK_API_KEY;
        }
    });

    // Name input event listener
    const nameInput = document.getElementById(`name-${index}`);
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            characters[index].name = e.target.value;
            console.log(`Updated character ${index} name to: ${e.target.value}`);
        });
    }

    // Job role select event listener  
    const jobRoleSelect = document.getElementById(`jobRole-${index}`);
    if (jobRoleSelect) {
        jobRoleSelect.addEventListener('change', (e) => {
            characters[index].jobRole = e.target.value;
            console.log(`Updated character ${index} job role to: ${e.target.value}`);
        });
    }

    // Build select event listener
    const buildSelect = document.getElementById(`build-${index}`);
    if (buildSelect) {
        buildSelect.addEventListener('change', (e) => {
            characters[index].physicalAttributes.build = e.target.value;
            console.log(`Updated character ${index} build to: ${e.target.value}`);
        });
    }

    // Skill range inputs
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const input = document.getElementById(`${skill}-${index}`);
        if (input) {
            input.addEventListener('input', (e) => {
                characters[index].skills[skill] = parseInt(e.target.value);
                document.getElementById(`${skill}-val-${index}`).textContent = e.target.value;
            });
        }
    });

    // Physical attribute inputs
    ['age', 'height', 'weight'].forEach(attr => {
        const input = document.getElementById(`${attr}-${index}`);
        if (input) {
            input.addEventListener('input', (e) => {
                characters[index].physicalAttributes[attr] = parseInt(e.target.value);
                document.getElementById(`${attr}-val-${index}`).textContent = e.target.value;
            });
        }
    });

    // Inventory item checkboxes with max limit
    const inventoryCheckboxes = document.querySelectorAll(`#character-panel-${index} input[type="checkbox"][id^="inventory-item-${index}-"]`);
    const maxInventory = 3;
    inventoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const selectedItems = Array.from(inventoryCheckboxes).filter(cb => cb.checked);
            if (selectedItems.length > maxInventory) {
                e.target.checked = false;
                showCustomAlert(`You can only select up to ${maxInventory} inventory items.`);
            }
        });
    });

    // Desk item checkboxes with max limit
    const deskItemCheckboxes = document.querySelectorAll(`#character-panel-${index} input[type="checkbox"][id^="desk-item-${index}-"]`);
    const maxDeskItems = 2;
    deskItemCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const selectedItems = Array.from(deskItemCheckboxes).filter(cb => cb.checked);
            if (selectedItems.length > maxDeskItems) {
                e.target.checked = false;
                showCustomAlert(`You can only select up to ${maxDeskItems} desk items.`);
            }
        });
    });
}

function generatePanelHTML(index, charData) {
    const jobOptions = JOB_ROLES_BY_OFFICE[officeType].map(role => 
        `<option value="${role}" ${charData.jobRole === role ? 'selected' : ''}>${role}</option>`
    ).join('');
    
    const tagOptions = PERSONALITY_TAGS.map(tag => `
        <div>
            <input type="checkbox" id="tags-${index}-${tag}" value="${tag}" ${charData.personalityTags.includes(tag) ? 'checked' : ''}>
            <label for="tags-${index}-${tag}" class="ml-2">${tag}</label>
        </div>
    `).join('');

    const buildOptions = BUILDS.map(build => 
        `<option value="${build}" ${charData.physicalAttributes.build === build ? 'selected' : ''}>${build}</option>`
    ).join('');

    const inventoryOptions = INVENTORY_ITEMS.map(item => `
        <div>
            <input type="checkbox" id="inventory-item-${index}-${item}" value="${item}" ${charData.inventory.includes(item) ? 'checked' : ''}>
            <label for="inventory-item-${index}-${item}" class="ml-2">${item}</label>
        </div>
    `).join('');

    const deskItemOptions = DESK_ITEMS.map(item => `
        <div>
            <input type="checkbox" id="desk-item-${index}-${item}" value="${item}" ${charData.deskItems.includes(item) ? 'checked' : ''}>
            <label for="desk-item-${index}-${item}" class="ml-2">${item}</label>
        </div>
    `).join('');

    return `
        <div class="creator-form">
            <div class="form-group">
                <label for="name-${index}">Name</label>
                <input type="text" id="name-${index}" value="${charData.name}">
            </div>
            <div class="form-group mt-4">
                <label for="jobRole-${index}">Job Role</label>
                <select id="jobRole-${index}">${jobOptions}</select>
            </div>
            <div class="form-group flex items-center mt-4">
                <input type="checkbox" id="isPlayer-${index}" class="player-toggle" ${charData.isPlayer ? 'checked' : ''}>
                <label for="isPlayer-${index}" class="ml-2 font-bold">Set as Player</label>
            </div>
            <div class="form-group mt-4" id="api-key-field-${index}" style="display: ${charData.isPlayer ? 'none' : 'block'};">
                <label for="api-key-${index}">API Key</label>
                <input type="text" id="api-key-${index}" class="font-mono" value="${charData.apiKey}">
            </div>
            
            <div class="form-group mt-4">
                <h3 class="text-lg font-bold mb-2">Physical Attributes</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div><label>Age: <span id="age-val-${index}">${charData.physicalAttributes.age}</span></label><input type="range" id="age-${index}" min="18" max="70" value="${charData.physicalAttributes.age}"></div>
                    <div><label>Height: <span id="height-val-${index}">${charData.physicalAttributes.height}</span> cm</label><input type="range" id="height-${index}" min="150" max="210" value="${charData.physicalAttributes.height}"></div>
                    <div><label>Weight: <span id="weight-val-${index}">${charData.physicalAttributes.weight}</span> kg</label><input type="range" id="weight-${index}" min="50" max="150" value="${charData.physicalAttributes.weight}"></div>
                    <div><label for="build-${index}">Build</label><select id="build-${index}">${buildOptions}</select></div>
                </div>
            </div>

            <div class="form-group mt-4">
                <h3 class="text-lg font-bold mb-2">Skills</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div><label>Competence: <span id="competence-val-${index}">${charData.skills.competence}</span></label><input type="range" id="competence-${index}" min="1" max="10" value="${charData.skills.competence}"></div>
                    <div><label>Laziness: <span id="laziness-val-${index}">${charData.skills.laziness}</span></label><input type="range" id="laziness-${index}" min="1" max="10" value="${charData.skills.laziness}"></div>
                    <div><label>Charisma: <span id="charisma-val-${index}">${charData.skills.charisma}</span></label><input type="range" id="charisma-${index}" min="1" max="10" value="${charData.skills.charisma}"></div>
                    <div><label>Leadership: <span id="leadership-val-${index}">${charData.skills.leadership}</span></label><input type="range" id="leadership-${index}" min="1" max="10" value="${charData.skills.leadership}"></div>
                </div>
            </div>
            
            <div class="form-group mt-4">
                <h3 class="text-lg font-bold mb-2">Personality (Max 6)</h3>
                <div class="grid grid-cols-2 gap-2 text-sm" style="max-height: 200px; overflow-y-auto;">${tagOptions}</div>
            </div>

            <div class="form-group mt-4">
                <h3 class="text-lg font-bold mb-2">Items (Max 3)</h3>
                <div class="grid grid-cols-2 gap-2 text-sm">${inventoryOptions}</div>
            </div>
            
            <div class="form-group mt-4">
                <h3 class="text-lg font-bold mb-2">Desk Items (Max 2)</h3>
                <div class="grid grid-cols-2 gap-2 text-sm">${deskItemOptions}</div>
            </div>
        </div>
        <div class="creator-appearance">
            <div class="form-group">
                <label>Appearance</label>
                <div class="bg-white p-2 rounded-lg border border-gray-200 mb-4 flex justify-center items-center h-24">
                    <canvas id="character-preview-${index}" width="48" height="48"></canvas>
                </div>
                <div id="sprite-grid-${index}" class="sprite-grid"></div>
            </div>
        </div>
    `;
}

function updatePreviewCanvas(panelIndex, spritePath) {
    const canvas = document.getElementById(`character-preview-${panelIndex}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = spritePath;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 144, 0, 48, 96, 0, 0, 48, 48);
    };
}

function populateSpriteGrid(panelIndex) {
    const grid = document.getElementById(`sprite-grid-${panelIndex}`);
    if(!grid) return;
    grid.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const spritePath = `assets/characters/Premade_Character_48x48_${String(i).padStart(2, '0')}.png`;
        const spriteOption = document.createElement('div');
        spriteOption.className = 'sprite-option';
        spriteOption.dataset.path = spritePath;
        
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        spriteOption.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = spritePath;
        img.onload = () => {
            ctx.drawImage(img, 144, 0, 48, 96, 0, 0, 48, 48);
        };
        
        spriteOption.addEventListener('click', () => {
            characters[panelIndex].spriteSheet = spritePath;
            updatePreviewCanvas(panelIndex, spritePath);
            highlightSelectedSprite(panelIndex, spritePath);
        });
        
        grid.appendChild(spriteOption);
    }
}

function highlightSelectedSprite(panelIndex, selectedPath) {
    const grid = document.getElementById(`sprite-grid-${panelIndex}`);
    if (!grid) return;
    
    grid.querySelectorAll('.sprite-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.path === selectedPath) {
            option.classList.add('selected');
        }
    });
}

function switchTab(index) {
    currentCharacterIndex = index;
    
    // Update tab appearance
    document.querySelectorAll('#character-tabs button').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    // Show/hide panels
    document.querySelectorAll('.creator-panel').forEach((panel, i) => {
        panel.classList.toggle('hidden', i !== index);
    });
}

function randomizeCurrentCharacter() {
    const char = characters[currentCharacterIndex];
    
    // Randomize sprite
    const randomIndex = Math.floor(Math.random() * 20) + 1;
    const randomSprite = `assets/characters/Premade_Character_48x48_${String(randomIndex).padStart(2, '0')}.png`;
    char.spriteSheet = randomSprite;
    updatePreviewCanvas(currentCharacterIndex, randomSprite);
    highlightSelectedSprite(currentCharacterIndex, randomSprite);

    // Randomize physical attributes
    char.physicalAttributes.age = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
    char.physicalAttributes.height = Math.floor(Math.random() * (200 - 160 + 1)) + 160;
    char.physicalAttributes.weight = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
    char.physicalAttributes.build = BUILDS[Math.floor(Math.random() * BUILDS.length)];
    
    // Randomize skills
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const value = Math.floor(Math.random() * 10) + 1;
        char.skills[skill] = value;
    });

    // Randomize personality tags
    const randomTags = [];
    const availableTags = [...PERSONALITY_TAGS];
    const maxTags = 6;
    for (let i = 0; i < maxTags && availableTags.length > 0; i++) {
        const tagIndex = Math.floor(Math.random() * availableTags.length);
        const newTag = availableTags.splice(tagIndex, 1)[0];
        // Check for mutually exclusive tags and re-randomize if a conflict exists
        const isConflicting = MUTUALLY_EXCLUSIVE_TAGS.some(pair => 
            pair.includes(newTag) && pair.some(t => randomTags.includes(t))
        );
        if (!isConflicting) {
            randomTags.push(newTag);
        } else {
            i--; // Try again for this slot
        }
    }
    char.personalityTags = randomTags;

    // Randomize initial items
    const randomInventory = [];
    const availableInventory = [...INVENTORY_ITEMS];
    const maxInventory = 3;
    for (let i = 0; i < maxInventory && availableInventory.length > 0; i++) {
        const itemIndex = Math.floor(Math.random() * availableInventory.length);
        randomInventory.push(availableInventory.splice(itemIndex, 1)[0]);
    }
    char.inventory = randomInventory;

    const randomDeskItems = [];
    const availableDeskItems = [...DESK_ITEMS];
    const maxDeskItems = 2;
    for (let i = 0; i < maxDeskItems && availableDeskItems.length > 0; i++) {
        const itemIndex = Math.floor(Math.random() * availableDeskItems.length);
        randomDeskItems.push(availableDeskItems.splice(itemIndex, 1)[0]);
    }
    char.deskItems = randomDeskItems;

    // Update UI elements from new random values
    updateUIFromCharacterData(currentCharacterIndex, char);
}

function updateUIFromCharacterData(index, char) {
    // Update physical attributes
    ['age', 'height', 'weight'].forEach(attr => {
        const valElement = document.getElementById(`${attr}-val-${index}`);
        const inputElement = document.getElementById(`${attr}-${index}`);
        if (valElement) valElement.textContent = char.physicalAttributes[attr];
        if (inputElement) inputElement.value = char.physicalAttributes[attr];
    });

    // Update skills
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const valElement = document.getElementById(`${skill}-val-${index}`);
        const inputElement = document.getElementById(`${skill}-${index}`);
        if (valElement) valElement.textContent = char.skills[skill];
        if (inputElement) inputElement.value = char.skills[skill];
    });

    // Update build dropdown
    const buildSelect = document.getElementById(`build-${index}`);
    if (buildSelect) buildSelect.value = char.physicalAttributes.build;

    // Update personality tags
    PERSONALITY_TAGS.forEach(tag => {
        const checkbox = document.getElementById(`tags-${index}-${tag}`);
        if (checkbox) checkbox.checked = char.personalityTags.includes(tag);
    });

    // Update inventory items
    INVENTORY_ITEMS.forEach(item => {
        const checkbox = document.getElementById(`inventory-item-${index}-${item}`);
        if (checkbox) checkbox.checked = char.inventory.includes(item);
    });

    // Update desk items
    DESK_ITEMS.forEach(item => {
        const checkbox = document.getElementById(`desk-item-${index}-${item}`);
        if (checkbox) checkbox.checked = char.deskItems.includes(item);
    });
}

/**
 * Fixed startSimulation function - properly validates and calls callback
 */
function startSimulation() {
    console.log('Starting simulation...');
    
    // Validate that we have characters
    if (!characters || characters.length === 0) {
        showCustomAlert('No characters created. Please create at least one character.');
        return;
    }
    
    // Validate that at least one character is marked as player
    const hasPlayer = characters.some(char => char.isPlayer);
    if (!hasPlayer) {
        showCustomAlert('Please mark at least one character as the player character.');
        return;
    }
    
    // FIXED: Validate API keys for NPC characters (not player characters)
    const npcChars = characters.filter(char => !char.isPlayer);
    for (const npcChar of npcChars) {
        const npcIndex = characters.indexOf(npcChar);
        const apiKeyInput = document.getElementById(`api-key-${npcIndex}`);
        const apiKey = apiKeyInput ? apiKeyInput.value : npcChar.apiKey;
        if (!apiKey || apiKey.trim() === '') {
            showCustomAlert(`NPC character "${npcChar.name}" needs an API key for AI behavior.`);
            return;
        }
    }
    
    // Collect all current character data from the UI
    const finalCharacterData = characters.map((char, index) => {
        return collectCharacterDataFromPanel(index);
    });
    
    console.log('Character creation complete. Final data:', finalCharacterData);
    
    // Call the callback function passed from main.js
    if (startGameCallback && typeof startGameCallback === 'function') {
        startGameCallback(finalCharacterData);
    } else {
        console.error('No start game callback function provided');
        showCustomAlert('Error: Game startup function not found. Please refresh and try again.');
    }
}

/**
 * Collect current character data from a specific panel
 * @param {number} index - Character panel index
 * @returns {Object} Character data object
 */
function collectCharacterDataFromPanel(index) {
    const char = characters[index];
    
    // Get values from UI elements
    const nameInput = document.getElementById(`name-${index}`);
    const jobRoleSelect = document.getElementById(`jobRole-${index}`);
    const isPlayerCheck = document.getElementById(`isPlayer-${index}`);
    const apiKeyInput = document.getElementById(`api-key-${index}`);
    
    // Physical attributes
    const ageInput = document.getElementById(`age-${index}`);
    const heightInput = document.getElementById(`height-${index}`);
    const weightInput = document.getElementById(`weight-${index}`);
    const buildSelect = document.getElementById(`build-${index}`);
    
    // Skills
    const competenceInput = document.getElementById(`competence-${index}`);
    const lazinessInput = document.getElementById(`laziness-${index}`);
    const charismaInput = document.getElementById(`charisma-${index}`);
    const leadershipInput = document.getElementById(`leadership-${index}`);
    
    // Collect selected personality tags
    const personalityTags = [];
    PERSONALITY_TAGS.forEach(tag => {
        const checkbox = document.getElementById(`tags-${index}-${tag}`);
        if (checkbox && checkbox.checked) {
            personalityTags.push(tag);
        }
    });
    
    // Collect selected inventory items
    const inventory = [];
    INVENTORY_ITEMS.forEach(item => {
        const checkbox = document.getElementById(`inventory-item-${index}-${item}`);
        if (checkbox && checkbox.checked) {
            inventory.push(item);
        }
    });
    
    // Collect selected desk items
    const deskItems = [];
    DESK_ITEMS.forEach(item => {
        const checkbox = document.getElementById(`desk-item-${index}-${item}`);
        if (checkbox && checkbox.checked) {
            deskItems.push(item);
        }
    });
    
    // Return complete character data
    return {
        id: char.id,
        name: nameInput ? nameInput.value : char.name,
        isPlayer: isPlayerCheck ? isPlayerCheck.checked : char.isPlayer,
        spriteSheet: char.spriteSheet,
        apiKey: apiKeyInput ? apiKeyInput.value : char.apiKey,
        jobRole: jobRoleSelect ? jobRoleSelect.value : char.jobRole,
        physicalAttributes: {
            age: ageInput ? parseInt(ageInput.value) : char.physicalAttributes.age,
            height: heightInput ? parseInt(heightInput.value) : char.physicalAttributes.height,
            weight: weightInput ? parseInt(weightInput.value) : char.physicalAttributes.weight,
            build: buildSelect ? buildSelect.value : char.physicalAttributes.build,
            looks: 5 // Default value for now
        },
        skills: {
            competence: competenceInput ? parseInt(competenceInput.value) : char.skills.competence,
            laziness: lazinessInput ? parseInt(lazinessInput.value) : char.skills.laziness,
            charisma: charismaInput ? parseInt(charismaInput.value) : char.skills.charisma,
            leadership: leadershipInput ? parseInt(leadershipInput.value) : char.skills.leadership
        },
        personalityTags: personalityTags,
        inventory: inventory,
        deskItems: deskItems
    };
}

/**
 * Show custom alert
 */
function showCustomAlert(message) {
    alert(message);
}
