let startGameCallback = null;
const characters = [];
let currentCharacterIndex = 0;
const NUM_CHARACTERS = 5;

// BILO_FIX: The job roles are now dependent on the selected office type.
const JOB_ROLES_BY_OFFICE = {
    'Default': ['Senior Coder', 'Junior Coder', 'Project Manager', 'QA Tester', 'HR Rep'],
    'Startup': ['Hacker', 'Growth Manager', 'Community Lead'],
    'Corp': ['Director', 'Associate', 'Analyst']
};

// BILO_FIX: The personality tags and other creator options have been expanded
// as per the SSOT.
const PERSONALITY_TAGS = [
    'Adventurous', 'Ambitious', 'Analytical', 'Arrogant', 'Artistic', 'Assertive', 'Awkward',
    'Blunt', 'Cautious', 'Charismatic', 'Confident', 'Content', 'Cooperative', 'Creative',
    'Cynical', 'Detail-oriented', 'Diplomatic', 'Empathetic', 'Energetic', 'Extroverted',
    'Flexible', 'Flirty', 'Generous', 'Humble', 'Humorless', 'Idealistic', 'Impulsive',
    'Insecure', 'Introverted', 'Logical', 'Organized', 'Optimistic', 'Patient',
    'Perfectionist', 'Pessimistic', 'Playful', 'Punctual', 'Relaxed', 'Reserved',
    'Selfish', 'Serious', 'Skeptical', 'Spontaneous', 'Strong', 'Technical',
    'Traditional', 'Trusting', 'Witty'
];
const BUILDS = ['Slender', 'Average', 'Muscular', 'Heavy'];

const INVENTORY_ITEMS = ['Smartphone', 'Cold Coffee Mug', 'Office Keys', 'Headphones', 'Notebook'];
const DESK_ITEMS = ['Photo Frame', 'Stapler', 'Plant', 'Rubber Duck', 'Monitor'];

const MUTUALLY_EXCLUSIVE_TAGS = [
    ['Introverted', 'Extroverted'],
    ['Confident', 'Insecure'],
    ['Optimistic', 'Pessimistic'],
    ['Ambitious', 'Content'],
    ['Humble', 'Arrogant'],
    ['Cooperative', 'Selfish'],
    ['Witty', 'Humorless'],
    ['Diplomatic', 'Blunt'],
    ['Logical', 'Spontaneous'],
    ['Organized', 'Impulsive']
];

let officeType = 'Default';

/**
 * Initializes the character creation screen.
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

    // BILO_FIX: Clear old event listeners to prevent duplicates and memory leaks
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
        apiKey: '',
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

    document.getElementById(`isPlayer-${index}`).addEventListener('change', (e) => {
        characters[index].isPlayer = e.target.checked;
        document.getElementById(`api-key-field-${index}`).style.display = e.target.checked ? 'none' : 'block';
    });

    ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
        const slider = document.getElementById(`${skill}-${index}`);
        const label = document.getElementById(`${skill}-val-${index}`);
        if(slider && label) {
            slider.addEventListener('input', () => { label.textContent = slider.value; });
        }
    });

    // BILO_FIX: New event listeners for physical attribute sliders
    ['age', 'height', 'weight'].forEach(attr => {
        const slider = document.getElementById(`${attr}-${index}`);
        const label = document.getElementById(`${attr}-val-${index}`);
        if(slider && label) {
            slider.addEventListener('input', () => { label.textContent = slider.value; });
        }
    });

    // BILO_FIX: Add change listeners for personality tags to enforce max selection
    const personalityTagCheckboxes = document.querySelectorAll(`#character-panel-${index} input[type="checkbox"][id^="tags-${index}-"]`);
    const maxTags = 6;
    personalityTagCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const selectedTags = Array.from(personalityTagCheckboxes).filter(cb => cb.checked);
            if (selectedTags.length > maxTags) {
                e.target.checked = false;
                showCustomAlert(`You can only select up to ${maxTags} personality tags.`);
            }
            if (e.target.checked) {
                checkMutuallyExclusiveTags(index, e.target.value);
            }
        });
    });

    // BILO_FIX: Add change listeners for inventory items to enforce max selection (max 3)
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

    // BILO_FIX: Add change listeners for desk items to enforce max selection (max 2)
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
    const jobOptions = JOB_ROLES_BY_OFFICE[officeType].map(role => `<option ${charData.jobRole === role ? 'selected' : ''}>${role}</option>`).join('');
    
    // BILO_FIX: Generate all personality tag options from the new, expanded list
    const tagOptions = PERSONALITY_TAGS.map(tag => `
        <div>
            <input type="checkbox" id="tags-${index}-${tag}" value="${tag}" ${charData.personalityTags.includes(tag) ? 'checked' : ''}>
            <label for="tags-${index}-${tag}" class="ml-2">${tag}</label>
        </div>
    `).join('');

    const buildOptions = BUILDS.map(build => `<option value="${build}" ${charData.physicalAttributes.build === build ? 'selected' : ''}>${build}</option>`).join('');

    // BILO_FIX: Generate UI for inventory and desk item selection
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
            <div class="form-group mt-4"><label for="jobRole-${index}">Job Role</label><select id="jobRole-${index}">${jobOptions}</select></div>
            <div class="form-group flex items-center mt-4"><input type="checkbox" id="isPlayer-${index}" class="player-toggle" ${charData.isPlayer ? 'checked' : ''}><label for="isPlayer-${index}" class="ml-2 font-bold">Set as Player</label></div>
            <div class="form-group mt-4" id="api-key-field-${index}" style="display: ${charData.isPlayer ? 'none' : 'block'};"><label for="api-key-input-${index}">API Key</label><input type="text" id="api-key-input-${index}" class="font-mono"></div>
            
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
                <div class="grid grid-cols-2 gap-2 text-sm max-h-48 overflow-y-auto">${tagOptions}</div>
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

function switchTab(index) {
    currentCharacterIndex = index;
    document.querySelectorAll('#character-tabs button').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.creator-panel').forEach((panel, i) => {
        panel.classList.toggle('hidden', i !== index);
    });
    const char = characters[index];
    if(char) {
        updatePreviewCanvas(index, char.spriteSheet);
        highlightSelectedSprite(index, char.spriteSheet);
    }
}

function highlightSelectedSprite(panelIndex, spritePath) {
    const grid = document.getElementById(`sprite-grid-${panelIndex}`);
    if(!grid) return;
    grid.querySelectorAll('.sprite-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.path === spritePath);
    });
}

/**
 * BILO_FIX: This function is now fully implemented to randomize all fields,
 * including new physical attributes and a gender-appropriate name.
 */
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
        const isConflicting = MUTUALLY_EXCLUSIVE_TAGS.some(pair => pair.includes(newTag) && pair.some(t => randomTags.includes(t)));
        if (!isConflicting) {
            randomTags.push(newTag);
        } else {
            i--; // Try again for this slot
        }
    }
    char.personalityTags = randomTags;

    // BILO_FIX: Randomize initial items
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
    const panel = document.getElementById(`character-panel-${currentCharacterIndex}`);
    if (panel) {
        document.getElementById(`age-val-${currentCharacterIndex}`).textContent = char.physicalAttributes.age;
        document.getElementById(`age-${currentCharacterIndex}`).value = char.physicalAttributes.age;
        document.getElementById(`height-val-${currentCharacterIndex}`).textContent = char.physicalAttributes.height;
        document.getElementById(`height-${currentCharacterIndex}`).value = char.physicalAttributes.height;
        document.getElementById(`weight-val-${currentCharacterIndex}`).textContent = char.physicalAttributes.weight;
        document.getElementById(`weight-${currentCharacterIndex}`).value = char.physicalAttributes.weight;
        document.getElementById(`build-${currentCharacterIndex}`).value = char.physicalAttributes.build;

        ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
            document.getElementById(`${skill}-${currentCharacterIndex}`).value = char.skills[skill];
            document.getElementById(`${skill}-val-${currentCharacterIndex}`).textContent = char.skills[skill];
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
    }
}

function startSimulation() {
    for (let i = 0; i < NUM_CHARACTERS; i++) {
        const char = characters[i];
        char.name = document.getElementById(`name-${i}`).value;
        char.isPlayer = document.getElementById(`isPlayer-${i}`).checked;
        char.apiKey = document.getElementById(`api-key-input-${i}`).value;
        char.jobRole = document.getElementById(`jobRole-${i}`).value;
        char.physicalAttributes.age = parseInt(document.getElementById(`age-${i}`).value);
        char.physicalAttributes.height = parseInt(document.getElementById(`height-${i}`).value);
        char.physicalAttributes.weight = parseInt(document.getElementById(`weight-${i}`).value);
        char.physicalAttributes.build = document.getElementById(`build-${i}`).value;
        char.skills.competence = parseInt(document.getElementById(`competence-${i}`).value);
        char.skills.laziness = parseInt(document.getElementById(`laziness-${i}`).value);
        char.skills.charisma = parseInt(document.getElementById(`charisma-${i}`).value);
        char.skills.leadership = parseInt(document.getElementById(`leadership-${i}`).value);
        
        char.personalityTags = Array.from(document.querySelectorAll(`#character-panel-${i} input[type="checkbox"][id^="tags-${i}-"]`))
            .filter(cb => cb.checked).map(cb => cb.value);

        // BILO_FIX: Capture selected inventory and desk items
        char.inventory = Array.from(document.querySelectorAll(`#character-panel-${i} input[type="checkbox"][id^="inventory-item-${i}-"]`))
            .filter(cb => cb.checked).map(cb => cb.value);
        char.deskItems = Array.from(document.querySelectorAll(`#character-panel-${i} input[type="checkbox"][id^="desk-item-${i}-"]`))
            .filter(cb => cb.checked).map(cb => cb.value);

        // BILO_FIX: Check for mutually exclusive tags and block start if found
        for (const tag of char.personalityTags) {
            if (checkMutuallyExclusiveTags(i, tag, true)) {
                return;
            }
        }
    }

    const playerCount = characters.filter(c => c.isPlayer).length;
    if (playerCount !== 1) {
        showCustomAlert("You must select exactly one character as the player.");
        return;
    }

    document.getElementById('creator-modal-backdrop').classList.add('hidden');
    
    if (startGameCallback) {
        startGameCallback(characters);
    }
}

/**
 * Checks for mutually exclusive tags and shows an alert if a conflict is found.
 * @param {number} index - The character's index
 * @param {string} newTag - The tag that was just checked
 * @param {boolean} block - Whether to show the alert and return true immediately
 * @returns {boolean} True if a conflict exists, false otherwise
 */
function checkMutuallyExclusiveTags(index, newTag, block = false) {
    const selectedTags = characters[index].personalityTags;
    const conflictingTag = selectedTags.find(tag => MUTUALLY_EXCLUSIVE_TAGS.some(pair => 
        pair.includes(tag) && pair.includes(newTag) && tag !== newTag
    ));

    if (conflictingTag) {
        const message = `You cannot select both '${newTag}' and '${conflictingTag}'.`;
        if (block) {
            showCustomAlert(message);
        } else {
            const checkbox = document.getElementById(`tags-${index}-${conflictingTag}`);
            if (checkbox) {
                checkbox.checked = false;
            }
            showCustomAlert(message);
        }
        return true;
    }
    return false;
}

function showCustomAlert(message) {
    let alertBox = document.getElementById('custom-alert');
    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'custom-alert';
        alertBox.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); padding:1rem 2rem; background-color:#f87171; color:white; border-radius:0.5rem; box-shadow:0 4px 6px rgba(0,0,0,0.1); z-index:200;';
        document.body.appendChild(alertBox);
    }
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 3000);
}
