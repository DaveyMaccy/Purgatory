/**
 * Character Data Module - PHASE 2 COMPLETE ALIGNMENT
 * 
 * Contains all character-related data structures, constants, and generation functions.
 * Now matches the monolithic version exactly for full feature parity.
 */

// ENHANCED CONSTANTS - Complete alignment with monolithic version
export const JOB_ROLES_BY_OFFICE = {
    "Game Studio": ["Lead Developer", "Game Designer", "3D Artist", "Sound Engineer", "QA Tester", "Producer"],
    "Corporate": ["IT Specialist", "Admin Assistant", "Business Analyst", "HR Manager", "Project Manager", "Accountant"],
    "PR Agency": ["Account Manager", "Creative Director", "Social Media Manager", "Copywriter", "Media Planner", "Brand Strategist"],
    "Newspaper": ["Reporter", "Editor", "Photographer", "Layout Designer", "Copy Editor", "Columnist"]
};

export const PERSONALITY_TAGS = [
    "Creative", "Introverted", "Extroverted", "Ambitious", "Laid-back", "Analytical", 
    "Empathetic", "Competitive", "Collaborative", "Independent", "Detail-oriented", 
    "Big-picture", "Optimistic", "Pessimistic", "Humorous", "Serious", "Spontaneous", 
    "Organized", "Flexible", "Stubborn", "Patient", "Impatient", "Confident", 
    "Self-doubting", "Innovative", "Traditional", "Risk-taker", "Cautious", "Witty", "Flirty"
];

export const INVENTORY_OPTIONS = [
    "Coffee Mug", "Smartphone", "Notebook", "Pen", "Laptop Charger", "Headphones", 
    "Energy Bar", "Hand Sanitizer", "Reading Glasses", "Flash Drive", "Stress Ball", 
    "Office Keys", "Business Cards", "Breath Mints", "Phone Charger"
];

export const DESK_ITEM_OPTIONS = [
    "Family Photo", "Plant", "Calendar", "Desk Lamp", "Coffee Maker", "Radio", 
    "Stress Ball", "Award Trophy", "Book", "Fidget Toy", "Tissue Box", "Stapler"
];

export const PHYSICAL_BUILDS = ["Slim", "Average", "Athletic", "Heavy"];
export const GENDERS = ["Male", "Female", "Non-binary"];

// Character count limits
export const MIN_CHARACTERS = 2;
export const MAX_CHARACTERS = 5;

// Auto-detect sprite sheets (25+ sprites) - matches monolithic exactly
function generateSpriteOptions() {
    const sprites = [];
    for (let i = 1; i <= 25; i++) {
        const paddedNumber = i.toString().padStart(2, '0');
        sprites.push(`assets/characters/character-${paddedNumber}.png`);
    }
    return sprites;
}

export const SPRITE_OPTIONS = generateSpriteOptions();

// Gender-linked name pools - matches monolithic exactly
export const NAMES_BY_GENDER = {
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

/**
 * Helper functions - matches monolithic exactly
 */
export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function getRandomItems(array, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Generate name based on gender - matches monolithic exactly
 */
export function generateNameByGender(gender) {
    const firstNames = NAMES_BY_GENDER[gender].first;
    const lastNames = NAMES_BY_GENDER[gender].last;
    return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

/**
 * Create complete randomized character - matches monolithic exactly
 */
export function createCompleteRandomCharacter(index, officeType = 'Game Studio') {
    const gender = getRandomItem(GENDERS);
    const randomTags = getRandomItems(PERSONALITY_TAGS, 3, 6);
    const randomInventory = getRandomItems(INVENTORY_OPTIONS, 1, 3);
    const randomDeskItems = getRandomItems(DESK_ITEM_OPTIONS, 1, 2);
    
    // Ensure sprite index is valid and sprite sheet exists
    const validSpriteIndex = Math.floor(Math.random() * 5); // Only use first 5 sprites that exist
    const spriteSheet = SPRITE_OPTIONS[validSpriteIndex];
    
    return {
        id: `char_${index}`,
        name: generateNameByGender(gender), // ALIGNED: Single name field
        isPlayer: false, // ALIGNED: Player identification field
        spriteSheet: spriteSheet,
        spriteIndex: validSpriteIndex, // ALIGNED: Track current sprite
        portrait: null, // Will be generated from sprite
        customPortrait: null, // ALIGNED: Custom uploaded image
        apiKey: '', // Individual API key override
        jobRole: getRandomItem(JOB_ROLES_BY_OFFICE[officeType]),
        physicalAttributes: {
            age: Math.floor(Math.random() * 20) + 25,
            height: Math.floor(Math.random() * 30) + 160,
            weight: Math.floor(Math.random() * 40) + 60,
            build: getRandomItem(PHYSICAL_BUILDS),
            looks: Math.floor(Math.random() * 10) + 1,
            gender: gender // ALIGNED: Gender field included
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
 * Generate default characters - updated to match monolithic structure
 */
export function generateDefaultCharacters(count = 3, officeType = 'Game Studio') {
    const characters = [];
    
    for (let i = 0; i < count; i++) {
        const character = createCompleteRandomCharacter(i, officeType);
        
        // Make first character the player
        if (i === 0) {
            character.isPlayer = true;
        }
        
        characters.push(character);
    }
    
    return characters;
}

/**
 * Generate random character - wrapper for createCompleteRandomCharacter
 */
export function generateRandomCharacter(officeType = 'Game Studio') {
    return createCompleteRandomCharacter(0, officeType);
}

/**
 * Validate characters before starting game - enhanced validation
 */
export function validateCharacters(characters) {
    const errors = [];
    
    if (characters.length < MIN_CHARACTERS) {
        errors.push(`Minimum ${MIN_CHARACTERS} characters required`);
    }
    
    if (characters.length > MAX_CHARACTERS) {
        errors.push(`Maximum ${MAX_CHARACTERS} characters allowed`);
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
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Format characters for game engine - complete game format conversion
 */
export function formatCharactersForGame(characters, globalAPIKey = '') {
    return characters.map(char => ({
        ...char,
        // Use custom portrait if available, otherwise use sprite portrait
        portrait: char.customPortrait || char.portrait,
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
 * Finalize characters - wrapper for format function
 */
export function finalizeCharacters(characters, globalAPIKey = '') {
    return formatCharactersForGame(characters, globalAPIKey);
}

console.log('📦 Character Data Module loaded - PHASE 2 COMPLETE ALIGNMENT');
