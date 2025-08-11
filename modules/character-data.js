/**
 * Character Data Module - WORKING VERSION
 * 
 * FIXED: Uses original office types and structure that the character creator expects
 */

// FIXED: Use original office types that match character-creator.js
export const JOB_ROLES_BY_OFFICE = {
    'Tech Startup': ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer', 'Marketing Specialist'],
    'Law Firm': ['Partner', 'Associate', 'Paralegal', 'Legal Secretary', 'Court Reporter', 'Law Clerk'],
    'Medical Practice': ['Doctor', 'Nurse', 'Medical Assistant', 'Receptionist', 'Lab Technician', 'Office Manager'],
    'Accounting Firm': ['CPA', 'Tax Specialist', 'Bookkeeper', 'Auditor', 'Financial Analyst', 'Administrative Assistant'],
    'Marketing Agency': ['Creative Director', 'Account Manager', 'Copywriter', 'Graphic Designer', 'Social Media Manager', 'Media Planner']
};

export const PERSONALITY_TAGS = [
    'Analytical', 'Creative', 'Outgoing', 'Reserved', 'Ambitious', 'Laid-back',
    'Detail-oriented', 'Big-picture', 'Collaborative', 'Independent', 'Optimistic',
    'Pragmatic', 'Innovative', 'Traditional', 'Competitive', 'Supportive',
    'Risk-taker', 'Cautious', 'Empathetic', 'Logical'
];

export const INVENTORY_OPTIONS = [
    'Laptop', 'Smartphone', 'Notebook', 'Pen', 'Coffee Mug', 'Water Bottle',
    'Headphones', 'Charger', 'Business Cards', 'Sticky Notes', 'Calculator',
    'USB Drive', 'Wallet', 'Keys', 'Sunglasses', 'Gum', 'Hand Sanitizer',
    'Protein Bar', 'Energy Drink', 'Tissues'
];

export const DESK_ITEM_OPTIONS = [
    'Monitor', 'Keyboard', 'Mouse', 'Desk Lamp', 'Plant', 'Picture Frame',
    'Paperweight', 'Stapler', 'Hole Punch', 'Tape Dispenser', 'File Organizer',
    'Pen Holder', 'Calendar', 'Stress Ball', 'Action Figure', 'Coffee Warmer',
    'Phone Stand', 'Cable Organizer', 'Mini Fridge', 'Desk Fan'
];

export const PHYSICAL_BUILDS = ['Thin', 'Average', 'Athletic', 'Heavy'];
export const GENDERS = ['Male', 'Female', 'Non-binary'];

// Character count limits
export const MIN_CHARACTERS = 2;
export const MAX_CHARACTERS = 5;

// Sprite options
export const SPRITE_OPTIONS = Array.from({ length: 20 }, (_, i) => 
    `assets/characters/character-${String(i + 1).padStart(2, '0')}.png`
);

// Name pools
const MALE_NAMES = [
    'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph',
    'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark',
    'Donald', 'Steven', 'Paul', 'Joshua', 'Kenneth'
];

const FEMALE_NAMES = [
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
    'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Dorothy', 'Sandra',
    'Ashley', 'Kimberly', 'Emily', 'Donna', 'Margaret'
];

const NONBINARY_NAMES = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
    'Sage', 'River', 'Phoenix', 'Rowan', 'Skylar', 'Cameron', 'Blake', 'Drew'
];

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

/**
 * Helper functions
 */
export function getRandomItem(array) {
    if (!array || !Array.isArray(array) || array.length === 0) {
        console.error('getRandomItem called with invalid array:', array);
        return null;
    }
    return array[Math.floor(Math.random() * array.length)];
}

export function getRandomItems(array, min, max) {
    if (!array || !Array.isArray(array) || array.length === 0) {
        console.error('getRandomItems called with invalid array:', array);
        return [];
    }
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Get random name by gender
 */
function getRandomNameByGender(gender) {
    let firstNames;
    switch (gender) {
        case 'Male':
            firstNames = MALE_NAMES;
            break;
        case 'Female':
            firstNames = FEMALE_NAMES;
            break;
        case 'Non-binary':
            firstNames = NONBINARY_NAMES;
            break;
        default:
            firstNames = MALE_NAMES;
    }
    return getRandomItem(firstNames);
}

/**
 * CharacterData class - maintains original structure
 */
class CharacterData {
    /**
     * Generate a default character template
     */
    static generateDefaultCharacter(index, officeType) {
        const gender = getRandomItem(GENDERS);
        const firstName = getRandomNameByGender(gender);
        const lastName = getRandomItem(LAST_NAMES);
        
        return {
            id: `char_${index + 1}`,
            isPlayerCharacter: index === 0, // First character is player
            
            // Basic Info
            firstName: firstName,
            lastName: lastName,
            age: Math.floor(Math.random() * 25) + 25, // 25-50
            jobRole: getRandomItem(JOB_ROLES_BY_OFFICE[officeType] || ['Employee']),
            
            // Physical Attributes
            physicalAttributes: {
                gender: gender,
                height: Math.floor(Math.random() * 40) + 150, // 150-190cm
                weight: Math.floor(Math.random() * 50) + 50,  // 50-100kg
                build: getRandomItem(PHYSICAL_BUILDS),
                looks: Math.floor(Math.random() * 6) + 5      // 5-10
            },
            
            // Skills (1-10 scale)
            skills: {
                competence: Math.floor(Math.random() * 6) + 5,  // 5-10
                laziness: Math.floor(Math.random() * 10) + 1,    // 1-10
                charisma: Math.floor(Math.random() * 10) + 1,    // 1-10
                leadership: Math.floor(Math.random() * 10) + 1   // 1-10
            },
            
            // Personality & Items
            personalityTags: getRandomItems(PERSONALITY_TAGS, 2, 4),
            inventory: getRandomItems(INVENTORY_OPTIONS, 3, 6),
            deskItems: getRandomItems(DESK_ITEM_OPTIONS, 3, 6),
            
            // Bio & Appearance
            bio: '',
            spriteSheet: getRandomItem(SPRITE_OPTIONS),
            spriteColors: null,
            portrait: null,
            customPortrait: null,
            
            // API Configuration
            apiKey: '',
            
            // Game engine fields
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
            relationships: {}
        };
    }
    
    /**
     * Generate multiple default characters
     */
    static generateDefaultCharacters(count, officeType) {
        const characters = [];
        for (let i = 0; i < count; i++) {
            characters.push(this.generateDefaultCharacter(i, officeType));
        }
        
        // Initialize relationships between characters
        characters.forEach(char => {
            characters.forEach(other => {
                if (char.id !== other.id) {
                    char.relationships[other.id] = 50; // Neutral starting relationship
                }
            });
        });
        
        return characters;
    }
    
    /**
     * Generate a completely random character
     */
    static generateRandomCharacter(officeType) {
        return this.generateDefaultCharacter(0, officeType);
    }
    
    /**
     * Finalize characters for game engine
     */
    static finalizeCharacters(characters, globalAPIKey) {
        return characters.map(char => ({
            ...char,
            apiKey: char.apiKey || globalAPIKey
        }));
    }
}

// Export the class
export { CharacterData };

console.log('📦 Character Data Module loaded - WORKING VERSION');
