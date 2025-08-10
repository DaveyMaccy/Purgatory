/**
 * ENHANCED: Setup event listeners for character panel with all new features
 */
function setupEnhancedPanelEventListeners(index) {
    // ENHANCED: Player character checkbox - enforce single player
    const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
    if (isPlayerCheckbox) {
        isPlayerCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck all other player checkboxes
                characters.forEach((char, otherIndex) => {
                    if (otherIndex !== index) {
                        char.isPlayer = false;
                        const otherCheckbox = document.getElementById(`isPlayer-${otherIndex}`);
                        if (otherCheckbox) otherCheckbox.checked = false;
                    }
                });
                characters[index].isPlayer = true;
            } else {
                characters[index].isPlayer = false;
            }
        });
    }

    // Name generation button
    const generateNameBtn = document.getElementById(`generate-name-${index}`);
    if (generateNameBtn) {
        generateNameBtn.addEventListener('click', function() {
            const gender = characters[index].physicalAttributes.gender;
            const newName = generateNameByGender(gender);
            characters[index].name = newName;
            const nameInput = document.getElementById(`name-${index}`);
            if (nameInput) nameInput.value = newName;
        });
    }

    // Gender change - regenerate name
    const genderSelect = document.getElementById(`gender-${index}`);
    if (genderSelect) {
        genderSelect.addEventListener('change', function() {
            characters[index].physicalAttributes.gender = this.value;
            // Auto-generate new name for the gender
            const newName = generateNameByGender(this.value);
            characters[index].name = newName;
            const nameInput = document.getElementById(`name-${index}`);
            if (nameInput) nameInput.value = newName;
        });
    }

    // ENHANCED: Sprite navigation arrows
    const prevBtn = document.getElementById(`sprite-prev-${index}`);
    const nextBtn = document.getElementById(`sprite-next-${index}`);
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => navigateSprite(index, -1));
        nextBtn.addEventListener('click', () => navigateSprite(index, 1));
    }

    // Custom portrait upload
    const portraitUpload = document.getElementById(`portrait-upload-${index}`);
    if (portraitUpload) {
        portraitUpload.addEventListener('change', function(e) {
            handleCustomPortraitUpload(index, e.target.files[0]);
        });
    }

    // Clear custom portrait
    const clearCustomBtn = document.getElementById(`clear-custom-${index}`);
    if (clearCustomBtn) {
        clearCustomBtn.addEventListener('click', () => clearCustomPortrait(index));
    }

    // Physical attribute sliders
    ['age', 'height', 'weight', 'looks'].forEach(attr => {
        const slider = document.getElementById(`${attr}-${index}`);
        const valueLabel = document.getElementById(`${attr}-val-${index}`);
        if (slider && valueLabel) {
            slider.addEventListener('input', function() {
                const value = parseInt(this.value);
                characters[index].physicalAttributes[attr] = value;
                
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
 * ENHANCED: Navigate through sprites with arrows
 */
function navigateSprite(index, direction) {
    const character = characters[index];
    let newSpriteIndex = (character.spriteIndex || 0) + direction;
    
    // Wrap around
    if (newSpriteIndex < 0) newSpriteIndex = SPRITE_OPTIONS.length - 1;
    if (newSpriteIndex >= SPRITE_OPTIONS.length) newSpriteIndex = 0;
    
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
    characters[index].customPortrait = null;
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
 * ENHANCED: Update character portrait - Extract 4th sprite from first row
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
    
    // Update sprite info
    updateSpriteInfo(index);
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
 * ENHANCED: Update characters from all form inputs
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
    });
}

/**
 * ENHANCED: Handle randomize with checkbox option
 */
function handleRandomize() {
    const randomizeAllCheckbox = document.getElementById('randomize-all-checkbox');
    const isRandomizeAll = randomizeAllCheckbox && randomizeAllCheckbox.checked;
    
    if (isRandomizeAll) {
        console.log('🎲 Randomizing all characters...');
        characters.forEach((char, index) => {
            const wasPlayer = char.isPlayer;
            characters[index] = createRandomCharacter(index);
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
 * Randomize current character only
 */
function randomizeCurrentCharacter() {
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
    const gender = getRandomItem(GENDERS);
    const randomTags = getRandomItems(PERSONALITY_TAGS, 3, 6);
    const randomInventory = getRandomItems(INVENTORY_OPTIONS, 1, 3);
    const randomDeskItems = getRandomItems(DESK_ITEM_OPTIONS, 1, 2);
    
    return {
        id: `char_${index}`,
        name: generateNameByGender(gender),
        isPlayer: index === 0, // Preserve player status for first character
        spriteSheet: getRandomItem(SPRITE_OPTIONS),
        spriteIndex: Math.floor(Math.random() * SPRITE_OPTIONS.length),
        portrait: null, // Will be generated
        customPortrait: null,
        apiKey: '',
        jobRole: getRandomItem(JOB_ROLES_BY_OFFICE[officeType]),
        physicalAttributes: {
            age: Math.floor(Math.random() * 20) + 25,
            height: Math.floor(Math.random() * 30) + 160,
            weight: Math.floor(Math.random() * 40) + 60,
            build: getRandomItem(PHYSICAL_BUILDS),
            looks: Math.floor(Math.random() * 10) + 1,
            gender: gender
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
        panel.innerHTML = generateEnhancedPanelHTML(index, character);
        setupEnhancedPanelEventListeners(index);
        updateCharacterPortrait(index, character.spriteSheet);
        clearCustomPortrait(index); // Reset custom portrait display
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
 * ENHANCED: Validate characters before starting game
 */
function validateCharacters() {
    if (characters.length < MIN_CHARACTERS) {
        throw new Error(`Minimum ${MIN_CHARACTERS} characters required`);
    }
    
    if (characters.length > MAX_CHARACTERS) {
        throw new Error(`Maximum ${MAX_CHARACTERS} characters allowed`);
    }
    
    // Ensure exactly one player
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
 * ENHANCED: Format characters for game engine with global API key
 */
function formatCharactersForGame() {
    return characters.map(char => ({
        ...char,
        // Use individual API key if set, otherwise use global for NPCs
        apiKey: char.apiKey || (char.isPlayer ? '' : globalAPIKey),
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

// Make functions available globally for HTML onclick handlers
window.switchTab = switchToTab;
window.randomizeCurrentCharacter = randomizeCurrentCharacter;
window.startSimulation = handleStartSimulation;

// Export for module usage
export { handleStartSimulation as startSimulation };

console.log('🎭 Enhanced character creator loaded and ready');/**
 * Character Creator - Enhanced with all requested features
 * 
 * New features:
 * - Single player character enforcement
 * - Arrow-based sprite navigation (20+ sprites)
 * - Complete SSOT attributes including gender
 * - Gender-linked random names
 * - Randomize All checkbox option
 * - Global API key with individual overrides
 * - Custom portrait upload
 * - Add/remove characters (2-5 range)
 * - Enhanced form layout
 */

// EXPANDED CONSTANTS
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
const GENDERS = ["Male", "Female", "Non-binary"];

// ENHANCED: Auto-detect sprite sheets (20+ sprites)
function generateSpriteOptions() {
    const sprites = [];
    for (let i = 1; i <= 25; i++) { // Check up to 25 sprite sheets
        const paddedNumber = i.toString().padStart(2, '0');
        sprites.push(`assets/characters/character-${paddedNumber}.png`);
    }
    return sprites;
}

const SPRITE_OPTIONS = generateSpriteOptions();

// ENHANCED: Gender-linked name pools
const NAMES_BY_GENDER = {
    Male: {
        first: ['James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'],
        last: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Lee', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Adams', 'Baker']
    },
    Female: {
        first: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle'],
        last: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Lee', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Adams', 'Baker']
    },
    'Non-binary': {
        first: ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'Morgan', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kai', 'Logan', 'Micah', 'Nico'],
        last: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Lee', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Adams', 'Baker']
    }
};

// GAME STATE
let characters = [];
let currentCharacterIndex = 0;
let officeType = 'Corporate';
let currentSpriteIndex = 0; // For arrow navigation
let globalAPIKey = 'sk-placeholder-key-for-development-testing-only';

// CHARACTER LIMITS
const MIN_CHARACTERS = 2;
const MAX_CHARACTERS = 5;

/**
 * Main initialization function called from main.js
 */
export function initializeCharacterCreator(selectedOfficeType = 'Corporate') {
    console.log('🎭 Initializing enhanced character creator...');
    
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
        
        // Clear containers
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';
        characters.length = 0;
        
        // Create initial characters (start with 3)
        const initialCharacterCount = 3;
        for (let i = 0; i < initialCharacterCount; i++) {
            characters.push(createCharacter(i));
            createCharacterTab(i);
            createCharacterPanel(i);
        }
        
        // Set first tab as active
        switchToTab(0);
        
        // Initialize buttons
        initializeCharacterCreatorButtons();
        
        console.log('✅ Enhanced character creator initialized successfully');
        
    } catch (error) {
        console.error('❌ Character creator initialization failed:', error);
        throw error;
    }
}

/**
 * Create global API key section at the top
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
 * Initialize character creator buttons with enhanced functionality
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
    
    // ENHANCED: Randomize button with checkbox
    const randomizeButton = document.getElementById('randomize-btn');
    if (randomizeButton) {
        // Update button text and add checkbox
        randomizeButton.innerHTML = `
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="randomize-all-checkbox" style="margin: 0;">
                <span>Randomize ${characters.length > 1 ? 'Current/All' : 'Character'}</span>
            </label>
        `;
        
        const newRandomizeButton = randomizeButton.cloneNode(true);
        randomizeButton.parentNode.replaceChild(newRandomizeButton, randomizeButton);
        newRandomizeButton.addEventListener('click', handleRandomize);
        console.log('✅ Enhanced Randomize button connected');
    }
    
    // Character count controls
    createCharacterCountControls();
}

/**
 * Create character count controls (add/remove)
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
 * Add a new character
 */
function addCharacter() {
    if (characters.length >= MAX_CHARACTERS) {
        alert(`Maximum ${MAX_CHARACTERS} characters allowed`);
        return;
    }
    
    const newIndex = characters.length;
    const newCharacter = createCharacter(newIndex);
    characters.push(newCharacter);
    
    createCharacterTab(newIndex);
    createCharacterPanel(newIndex);
    
    updateCharacterCountControls();
    switchToTab(newIndex);
    
    console.log(`➕ Added character ${newIndex + 1}`);
}

/**
 * Remove the current character
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
        createCharacterTab(index);
        createCharacterPanel(index);
    });
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
 * ENHANCED: Create character with full SSOT attributes
 */
function createCharacter(index) {
    const gender = getRandomItem(GENDERS);
    
    return {
        id: `char_${index}`,
        name: generateNameByGender(gender),
        isPlayer: index === 0,
        spriteSheet: SPRITE_OPTIONS[index % SPRITE_OPTIONS.length] || SPRITE_OPTIONS[0],
        spriteIndex: index % SPRITE_OPTIONS.length, // Track current sprite
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
 * Generate name based on gender
 */
function generateNameByGender(gender) {
    const firstNames = NAMES_BY_GENDER[gender].first;
    const lastNames = NAMES_BY_GENDER[gender].last;
    return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
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
 * ENHANCED: Create character panel with all features
 */
function createCharacterPanel(index) {
    const panelsContainer = document.getElementById('character-panels');
    const panel = document.createElement('div');
    panel.id = `character-panel-${index}`;
    panel.className = `creator-panel ${index === 0 ? '' : 'hidden'}`;
    
    const character = characters[index];
    panel.innerHTML = generateEnhancedPanelHTML(index, character);
    panelsContainer.appendChild(panel);
    
    // Setup all event listeners
    setupEnhancedPanelEventListeners(index);
    
    // Initialize sprite navigation and portrait
    updateCharacterPortrait(index, character.spriteSheet);
}

/**
 * ENHANCED: Generate complete panel HTML with all new features
 */
function generateEnhancedPanelHTML(index, charData) {
    const jobRoleOptions = JOB_ROLES_BY_OFFICE[officeType]
        .map(role => `<option value="${role}" ${role === charData.jobRole ? 'selected' : ''}>${role}</option>`)
        .join('');
        
    const buildOptions = PHYSICAL_BUILDS
        .map(build => `<option value="${build}" ${build === charData.physicalAttributes.build ? 'selected' : ''}>${build}</option>`)
        .join('');
        
    const genderOptions = GENDERS
        .map(gender => `<option value="${gender}" ${gender === charData.physicalAttributes.gender ? 'selected' : ''}>${gender}</option>`)
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
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="name-${index}" value="${charData.name}" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <button type="button" id="generate-name-${index}" style="padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Generate</button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group">
                        <label for="jobRole-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Job Role</label>
                        <select id="jobRole-${index}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">${jobRoleOptions}</select>
                    </div>
                    
                    <div class="form-group">
                        <label for="gender-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Gender</label>
                        <select id="gender-${index}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">${genderOptions}</select>
                    </div>
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
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
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
                            <label>Looks: <span id="looks-val-${index}">${charData.physicalAttributes.looks}/10</span></label>
                            <input type="range" id="looks-${index}" min="1" max="10" value="${charData.physicalAttributes.looks}" style="width: 100%;">
                        </div>
                    </div>
                    <div style="margin-top: 10px;">
                        <label for="build-${index}" style="display: block; margin-bottom: 5px;">Build</label>
                        <select id="build-${index}" style="width: 100%; padding: 4px;">${buildOptions}</select>
                    </div>
                </div>

                <!-- Skills -->
                <div class="form-group">
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Skills</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
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
                    <div style="max-height: 120px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                        ${tagOptions}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <!-- Inventory -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Inventory (Max 3)</h3>
                        <div style="max-height: 100px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
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
            </div>

            <!-- Right Column: Portraits and Settings -->
            <div class="w-80" style="width: 320px;">
                <div class="space-y-4">
                    <!-- Character Portrait with Sprite Navigation -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Character Portrait</h3>
                        <div style="text-align: center;">
                            <canvas id="preview-canvas-${index}" width="96" height="96" style="border: 2px solid #ccc; border-radius: 8px; background: #f0f0f0;"></canvas>
                            
                            <!-- Sprite Navigation Arrows -->
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                <button type="button" id="sprite-prev-${index}" style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">◀ Prev</button>
                                <span id="sprite-info-${index}" style="font-size: 12px; color: #6c757d;">Sprite 1 of ${SPRITE_OPTIONS.length}</span>
                                <button type="button" id="sprite-next-${index}" style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Next ▶</button>
                            </div>
                        </div>
                    </div>

                    <!-- Custom Portrait Upload -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Custom Portrait</h3>
                        <div style="text-align: center;">
                            <canvas id="custom-canvas-${index}" width="96" height="96" style="border: 2px solid #ccc; border-radius: 8px; background: #f8f9fa; margin-bottom: 10px;"></canvas>
                            <input type="file" id="portrait-upload-${index}" accept="image/*" style="width: 100%; padding: 4px; font-size: 12px;">
                            <button type="button" id="clear-custom-${index}" style="margin-top: 5px; padding: 4px 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Clear Custom</button>
                        </div>
                    </div>

                    <!-- API Key Override -->
                    <div class="form-group">
                        <label for="api-key-input-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Individual API Key</label>
                        <input type="text" id="api-key-input-${index}" value="${charData.apiKey}" placeholder="Override global key..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; font-family: monospace;">
                        <div style="font-size: 11px; color: #6c757d; margin-top: 2px;">Leave empty to use global key</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
