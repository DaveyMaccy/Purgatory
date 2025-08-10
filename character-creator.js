/**
 * Character Creator - Enhanced for Stage 3: Portrait system and game start integration
 * Complete replacement file with Stage 3 enhancements and standardized asset names
 */

// Data from design document
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

// UPDATED: Standardized asset naming convention
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
 * Stage 3 Enhancement: Initialize character creator with game start callback
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
        spriteSheet: SPRITE_OPTIONS[index % SPRITE_OPTIONS.length],
        portrait: null, // Stage 3: Will store base64 portrait data
        apiKey: '',
        jobRole: JOB_ROLES_BY_OFFICE[officeType][0],
        physicalAttributes: { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 },
        skills: { competence: 5, laziness: 5, charisma: 5, leadership: 5 },
        personalityTags: [],
        experienceTags: [],
        needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
        inventory: [],
        deskItems: [],
        relationships: {},
        // Stage 3: Add appearance data for future sprite system
        appearance: {
            body: 'body_skin_tone_1',
            hair: 'hair_style_4_blonde',
            shirt: 'shirt_style_2_red',
            pants: 'pants_style_1_jeans'
        }
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

    // Setup event listeners
    setupPanelEventListeners(index);
}

function generatePanelHTML(index, charData) {
    const jobRoleOptions = JOB_ROLES_BY_OFFICE[officeType]
        .map(role => `<option value="${role}" ${role === charData.jobRole ? 'selected' : ''}>${role}</option>`)
        .join('');
        
    const buildOptions = PHYSICAL_BUILDS
        .map(build => `<option value="${build}" ${build === charData.physicalAttributes.build ? 'selected' : ''}>${build}</option>`)
        .join('');
        
    const tagOptions = PERSONALITY_TAGS
        .map(tag => `<label class="checkbox-label"><input type="checkbox" id="tags-${index}-${tag}" value="${tag}"> ${tag}</label>`)
        .join('');
        
    const inventoryOptions = INVENTORY_OPTIONS
        .map(item => `<label class="checkbox-label"><input type="checkbox" id="inventory-item-${index}-${item}" value="${item}"> ${item}</label>`)
        .join('');
        
    const deskItemOptions = DESK_ITEM_OPTIONS
        .map(item => `<label class="checkbox-label"><input type="checkbox" id="desk-item-${index}-${item}" value="${item}"> ${item}</label>`)
        .join('');

    return `
        <div class="flex gap-6 h-full">
            <div class="flex-1 space-y-4 overflow-y-auto">
                <div class="form-group">
                    <label for="name-${index}">Character Name</label>
                    <input type="text" id="name-${index}" value="${charData.name}">
                </div>
                
                <div class="form-group">
                    <label for="jobRole-${index}">Job Role</label>
                    <select id="jobRole-${index}">${jobRoleOptions}</select>
                </div>

                <div class="form-group">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="isPlayer-${index}" ${charData.isPlayer ? 'checked' : ''}>
                        <label for="isPlayer-${index}" class="font-bold">Set as Player</label>
                    </div>
                </div>
                
                <div class="form-group" id="api-key-field-${index}" style="display: ${charData.isPlayer ? 'none' : 'block'};">
                    <label for="api-key-input-${index}">API Key</label>
                    <input type="text" id="api-key-input-${index}" class="font-mono" placeholder="Optional for NPCs">
                </div>
                
                <div class="form-group">
                    <h3 class="text-lg font-bold mb-2">Physical Attributes</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label>Age: <span id="age-val-${index}">${charData.physicalAttributes.age}</span></label>
                            <input type="range" id="age-${index}" min="18" max="70" value="${charData.physicalAttributes.age}">
                        </div>
                        <div>
                            <label>Height: <span id="height-val-${index}">${charData.physicalAttributes.height}</span> cm</label>
                            <input type="range" id="height-${index}" min="150" max="210" value="${charData.physicalAttributes.height}">
                        </div>
                        <div>
                            <label>Weight: <span id="weight-val-${index}">${charData.physicalAttributes.weight}</span> kg</label>
                            <input type="range" id="weight-${index}" min="50" max="150" value="${charData.physicalAttributes.weight}">
                        </div>
                        <div>
                            <label for="build-${index}">Build</label>
                            <select id="build-${index}">${buildOptions}</select>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <h3 class="text-lg font-bold mb-2">Skills</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label>Competence: <span id="competence-val-${index}">${charData.skills.competence}</span></label>
                            <input type="range" id="competence-${index}" min="1" max="10" value="${charData.skills.competence}">
                        </div>
                        <div>
                            <label>Laziness: <span id="laziness-val-${index}">${charData.skills.laziness}</span></label>
                            <input type="range" id="laziness-${index}" min="1" max="10" value="${charData.skills.laziness}">
                        </div>
                        <div>
                            <label>Charisma: <span id="charisma-val-${index}">${charData.skills.charisma}</span></label>
                            <input type="range" id="charisma-${index}" min="1" max="10" value="${charData.skills.charisma}">
                        </div>
                        <div>
                            <label>Leadership: <span id="leadership-val-${index}">${charData.skills.leadership}</span></label>
                            <input type="range" id="leadership-${index}" min="1" max="10" value="${charData.skills.leadership}">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <h3 class="text-lg font-bold mb-2">Personality (Max 6)</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm max-h-48 overflow-y-auto">${tagOptions}</div>
                </div>

                <div class="form-group">
                    <h3 class="text-lg font-bold mb-2">Items (Max 3)</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">${inventoryOptions}</div>
                </div>
                
                <div class="form-group">
                    <h3 class="text-lg font-bold mb-2">Desk Items (Max 2)</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">${deskItemOptions}</div>
                </div>
            </div>
            
            <div class="w-64 space-y-4">
                <div class="form-group">
                    <h3 class="text-lg font-bold mb-2">Character Sprite</h3>
                    <div class="sprite-grid" id="sprite-grid-${index}"></div>
                </div>
                
                <div class="form-group">
                    <h3 class="text-lg font-bold mb-2">Preview</h3>
                    <div class="w-full bg-gray-100 rounded-lg p-4 flex justify-center">
                        <canvas id="preview-canvas-${index}" width="96" height="96" class="border border-gray-300"></canvas>
                    </div>
                </div>
                
                <div class="form-group">
                    <h3 class="text-lg font-bold mb-2">Portrait (Stage 3)</h3>
                    <button type="button" id="set-portrait-btn-${index}" class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Set Custom Portrait
                    </button>
                    <canvas id="portrait-preview-${index}" width="64" height="64" class="mt-2 border border-gray-300 mx-auto block"></canvas>
                </div>
            </div>
        </div>
    `;
}

function setupPanelEventListeners(index) {
    const panel = document.getElementById(`character-panel-${index}`);
    
    // Player checkbox handler
    document.getElementById(`isPlayer-${index}`).addEventListener('change', (e) => {
        characters[index].isPlayer = e.target.checked;
        document.getElementById(`api-key-field-${index}`).style.display = e.target.checked ? 'none' : 'block';
        
        // Only one player allowed
        if (e.target.checked) {
            for (let i = 0; i < NUM_CHARACTERS; i++) {
                if (i !== index) {
                    const otherCheckbox = document.getElementById(`isPlayer-${i}`);
                    if (otherCheckbox) otherCheckbox.checked = false;
                    characters[i].isPlayer = false;
                }
            }
        }
    });

    // Range sliders for physical attributes
    ['age', 'height', 'weight'].forEach(attr => {
        const slider = document.getElementById(`${attr}-${index}`);
        const valueLabel = document.getElementById(`${attr}-val-${index}`);
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            characters[index].physicalAttributes[attr] = value;
            valueLabel.textContent = attr === 'height' ? `${value} cm` : 
                                     attr === 'weight' ? `${value} kg` : value;
        });
    });

    // Range sliders for skills
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const slider = document.getElementById(`${skill}-${index}`);
        const valueLabel = document.getElementById(`${skill}-val-${index}`);
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            characters[index].skills[skill] = value;
            valueLabel.textContent = value;
        });
    });

    // Personality tags (max 6)
    const personalityCheckboxes = panel.querySelectorAll('input[type="checkbox"][id^="tags-"]');
    personalityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCharacterTags(index, 'personalityTags', personalityCheckboxes, 6);
        });
    });

    // Inventory items (max 3)
    const inventoryCheckboxes = panel.querySelectorAll('input[type="checkbox"][id^="inventory-item-"]');
    inventoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCharacterItems(index, 'inventory', inventoryCheckboxes, 3);
        });
    });

    // Desk items (max 2)
    const deskItemCheckboxes = panel.querySelectorAll('input[type="checkbox"][id^="desk-item-"]');
    deskItemCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCharacterItems(index, 'deskItems', deskItemCheckboxes, 2);
        });
    });

    // Portrait button (Stage 3 enhancement)
    const portraitBtn = document.getElementById(`set-portrait-btn-${index}`);
    portraitBtn.addEventListener('click', () => setCustomPortrait(index));
}

function updateCharacterTags(index, tagType, checkboxes, maxLimit) {
    const selectedTags = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedTags.length > maxLimit) {
        // Find the last checked box and uncheck it
        const lastChecked = Array.from(checkboxes).reverse().find(cb => cb.checked);
        lastChecked.checked = false;
        selectedTags.pop();
    }
    
    characters[index][tagType] = selectedTags;
}

function updateCharacterItems(index, itemType, checkboxes, maxLimit) {
    const selectedItems = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedItems.length > maxLimit) {
        // Find the last checked box and uncheck it
        const lastChecked = Array.from(checkboxes).reverse().find(cb => cb.checked);
        lastChecked.checked = false;
        selectedItems.pop();
    }
    
    characters[index][itemType] = selectedItems;
}

function populateSpriteGrid(index) {
    const spriteGrid = document.getElementById(`sprite-grid-${index}`);
    spriteGrid.innerHTML = '';
    
    SPRITE_OPTIONS.forEach((spritePath, spriteIndex) => {
        const img = document.createElement('img');
        img.src = spritePath;
        img.className = 'sprite-option';
        img.style.width = '48px';
        img.style.height = '48px';
        
        if (spritePath === characters[index].spriteSheet) {
            img.classList.add('selected');
        }
        
        img.addEventListener('click', () => {
            // Remove selection from all sprites in this grid
            spriteGrid.querySelectorAll('.sprite-option').forEach(sprite => {
                sprite.classList.remove('selected');
            });
            
            // Select this sprite
            img.classList.add('selected');
            characters[index].spriteSheet = spritePath;
            updatePreviewCanvas(index, spritePath);
        });
        
        spriteGrid.appendChild(img);
    });
}

function updatePreviewCanvas(index, spritePath) {
    const canvas = document.getElementById(`preview-canvas-${index}`);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Load and draw sprite
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = spritePath;
}

// Stage 3: Custom portrait functionality
function setCustomPortrait(index) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Create a canvas to crop the image to 64x64
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                
                // Calculate crop area (center square)
                const size = Math.min(img.width, img.height);
                const x = (img.width - size) / 2;
                const y = (img.height - size) / 2;
                
                // Draw cropped image
                ctx.drawImage(img, x, y, size, size, 0, 0, 64, 64);
                
                // Convert to base64 and store
                const portraitData = canvas.toDataURL('image/png');
                characters[index].portrait = portraitData;
                
                // Update preview
                updatePortraitPreview(index, portraitData);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    input.click();
}

function updatePortraitPreview(index, portraitData) {
    const canvas = document.getElementById(`portrait-preview-${index}`);
    const ctx = canvas.getContext('2d');
    
    if (portraitData) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = portraitData;
    } else {
        // Draw placeholder
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Portrait', canvas.width / 2, canvas.height / 2 + 4);
    }
}

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
    
    // Update character data from form when switching tabs
    if (index > 0) {
        updateCharacterFromForm(index - 1);
    }
}

function updateCharacterFromForm(index) {
    const char = characters[index];
    const panel = document.getElementById(`character-panel-${index}`);
    if (!panel) return;
    
    // Update basic info
    const nameInput = document.getElementById(`name-${index}`);
    const jobRoleSelect = document.getElementById(`jobRole-${index}`);
    const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
    const apiKeyInput = document.getElementById(`api-key-input-${index}`);
    const buildSelect = document.getElementById(`build-${index}`);
    
    if (nameInput) char.name = nameInput.value;
    if (jobRoleSelect) char.jobRole = jobRoleSelect.value;
    if (isPlayerCheckbox) char.isPlayer = isPlayerCheckbox.checked;
    if (apiKeyInput) char.apiKey = apiKeyInput.value;
    if (buildSelect) char.physicalAttributes.build = buildSelect.value;
    
    // Update physical attributes
    ['age', 'height', 'weight'].forEach(attr => {
        const input = document.getElementById(`${attr}-${index}`);
        if (input) char.physicalAttributes[attr] = parseInt(input.value);
    });

    // Update skills
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const input = document.getElementById(`${skill}-${index}`);
        if (input) char.skills[skill] = parseInt(input.value);
    });

    // Update personality tags
    const personalityTagCheckboxes = panel.querySelectorAll(`input[type="checkbox"][id^="tags-"]`);
    char.personalityTags = Array.from(personalityTagCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Update inventory items
    const inventoryCheckboxes = panel.querySelectorAll(`input[type="checkbox"][id^="inventory-item-"]`);
    char.inventory = Array.from(inventoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
        
    // Update desk items
    const deskItemCheckboxes = panel.querySelectorAll(`input[type="checkbox"][id^="desk-item-"]`);
    char.deskItems = Array.from(deskItemCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

function randomizeCurrentCharacter() {
    const index = currentCharacterIndex;
    const char = characters[index];
    
    // Randomize physical attributes
    char.physicalAttributes.age = Math.floor(Math.random() * 52) + 18; // 18-70
    char.physicalAttributes.height = Math.floor(Math.random() * 60) + 150; // 150-210
    char.physicalAttributes.weight = Math.floor(Math.random() * 100) + 50; // 50-150
    char.physicalAttributes.build = PHYSICAL_BUILDS[Math.floor(Math.random() * PHYSICAL_BUILDS.length)];
    char.physicalAttributes.looks = Math.floor(Math.random() * 10) + 1; // 1-10
    
    // Randomize skills
    Object.keys(char.skills).forEach(skill => {
        char.skills[skill] = Math.floor(Math.random() * 10) + 1; // 1-10
    });
    
    // Randomize personality tags (3-6 tags)
    const numTags = Math.floor(Math.random() * 4) + 3; // 3-6
    const shuffledTags = [...PERSONALITY_TAGS].sort(() => 0.5 - Math.random());
    char.personalityTags = shuffledTags.slice(0, numTags);
    
    // Randomize inventory (1-3 items)
    const numInventory = Math.floor(Math.random() * 3) + 1; // 1-3
    const shuffledInventory = [...INVENTORY_OPTIONS].sort(() => 0.5 - Math.random());
    char.inventory = shuffledInventory.slice(0, numInventory);
    
    // Randomize desk items (1-2 items)
    const numDeskItems = Math.floor(Math.random() * 2) + 1; // 1-2
    const shuffledDeskItems = [...DESK_ITEM_OPTIONS].sort(() => 0.5 - Math.random());
    char.deskItems = shuffledDeskItems.slice(0, numDeskItems);
    
    // Randomize sprite
    const randomSprite = SPRITE_OPTIONS[Math.floor(Math.random() * SPRITE_OPTIONS.length)];
    char.spriteSheet = randomSprite;
    
    // Update UI to reflect changes
    updatePanelFromCharacter(index);
    populateSpriteGrid(index);
    updatePreviewCanvas(index, char.spriteSheet);
}

function updatePanelFromCharacter(index) {
    const char = characters[index];
    const panel = document.getElementById(`character-panel-${index}`);
    if (!panel) return;
    
    // Update form fields
    document.getElementById(`name-${index}`).value = char.name;
    document.getElementById(`jobRole-${index}`).value = char.jobRole;
    document.getElementById(`isPlayer-${index}`).checked = char.isPlayer;
    document.getElementById(`api-key-input-${index}`).value = char.apiKey;
    document.getElementById(`build-${index}`).value = char.physicalAttributes.build;
    
    // Update physical attributes
    ['age', 'height', 'weight'].forEach(attr => {
        const slider = document.getElementById(`${attr}-${index}`);
        const valueLabel = document.getElementById(`${attr}-val-${index}`);
        if (slider && valueLabel) {
            slider.value = char.physicalAttributes[attr];
            valueLabel.textContent = attr === 'height' ? `${char.physicalAttributes[attr]} cm` : 
                                     attr === 'weight' ? `${char.physicalAttributes[attr]} kg` : 
                                     char.physicalAttributes[attr];
        }
    });
    
    // Update skills
    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const slider = document.getElementById(`${skill}-${index}`);
        const valueLabel = document.getElementById(`${skill}-val-${index}`);
        if (slider && valueLabel) {
            slider.value = char.skills[skill];
            valueLabel.textContent = char.skills[skill];
        }
    });

    // Update personality tag checkboxes
    const personalityTagCheckboxes = panel.querySelectorAll(`input[type="checkbox"][id^="tags-"]`);
    personalityTagCheckboxes.forEach(cb => {
        cb.checked = char.personalityTags.includes(cb.value);
    });

    // Update item checkboxes
    const inventoryCheckboxes = panel.querySelectorAll(`input[type="checkbox"][id^="inventory-item-"]`);
    inventoryCheckboxes.forEach(cb => {
        cb.checked = char.inventory.includes(cb.value);
    });
    const deskItemCheckboxes = panel.querySelectorAll(`input[type="checkbox"][id^="desk-item-"]`);
    deskItemCheckboxes.forEach(cb => {
        cb.checked = char.deskItems.includes(cb.value);
    });
    
    // Update portrait preview
    updatePortraitPreview(index, char.portrait);
}

// Stage 3: Enhanced start simulation function
function startSimulation() {
    // Update current character data from form
    updateCharacterFromForm(currentCharacterIndex);
    
    // Validate that we have at least one player
    const playerCharacters = characters.filter(char => char.isPlayer);
    if (playerCharacters.length === 0) {
        alert('Please designate at least one character as the player.');
        return;
    }
    
    if (playerCharacters.length > 1) {
        alert('Please designate only one character as the player.');
        return;
    }
    
    // Validate character names
    for (let i = 0; i < NUM_CHARACTERS; i++) {
        const nameInput = document.getElementById(`name-${i}`);
        if (!nameInput || !nameInput.value.trim()) {
            alert(`Please enter a name for Character ${i + 1}.`);
            return;
        }
        characters[i].name = nameInput.value.trim();
    }
    
    // Convert character data to proper format for game engine
    const gameCharacters = characters.map(char => ({
        ...char,
        // Stage 3: Ensure proper data structure
        relationships: {},
        position: { x: 0, y: 0 },
        actionState: 'DEFAULT',
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
    
    console.log('Starting simulation with characters:', gameCharacters);
    
    // Call the game start function from main.js
    if (window.startGameSimulation) {
        window.startGameSimulation(gameCharacters);
        
        // Update character switcher for Stage 3 testing
        setTimeout(() => {
            if (window.updateCharacterSwitcher) {
                window.updateCharacterSwitcher();
            }
        }, 1000);
    } else {
        console.error('startGameSimulation function not found on window object');
        alert('Failed to start simulation. Please check the console for errors.');
    }
}

// Export functions for external use
export function initializeCharacterUI(characterManager) {
    console.log('Character UI initialized with character manager');
}

// Global functions for HTML onclick handlers
window.switchTab = switchTab;
window.randomizeCurrentCharacter = randomizeCurrentCharacter;
window.startSimulation = startSimulation;

// Initialize character creator when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Character creator loaded and ready');
});
