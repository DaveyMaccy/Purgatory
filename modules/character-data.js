/**
 * Character Data Module
 * 
 * Handles all character data generation, randomization, and management.
 * Contains all the constants and data structures needed for character creation.
 */

// Character data constants
const GENDERS = ['Male', 'Female', 'Non-binary'];
const PHYSICAL_BUILDS = ['Thin', 'Average', 'Athletic', 'Heavy'];

const MALE_NAMES = [
    'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph',
    'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark',
    'Donald', 'Steven', 'Paul', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George',
    'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob'
];

const FEMALE_NAMES = [
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
    'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Dorothy', 'Sandra',
    'Ashley', 'Kimberly', 'Emily', 'Donna', 'Margaret', 'Carol', 'Michelle',
    'Laura', 'Sharon', 'Deborah', 'Cynthia', 'Angela', 'Melissa', 'Brenda', 'Emma'
];

const NONBINARY_NAMES = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
    'Sage', 'River', 'Phoenix', 'Rowan', 'Skylar', 'Cameron', 'Blake', 'Drew',
    'Emery', 'Finley', 'Hayden', 'Indigo', 'Kai', 'Lane', 'Marlowe', 'Nova'
];

const JOB_ROLES_BY_OFFICE = {
    'Tech Startup': ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer', 'Marketing Specialist'],
    'Law Firm': ['Partner', 'Associate', 'Paralegal', 'Legal Secretary', 'Court Reporter', 'Law Clerk'],
    'Medical Practice': ['Doctor', 'Nurse', 'Medical Assistant', 'Receptionist', 'Lab Technician', 'Office Manager'],
    'Accounting Firm': ['CPA', 'Tax Specialist', 'Bookkeeper', 'Auditor', 'Financial Analyst', 'Administrative Assistant'],
    'Marketing Agency': ['Creative Director', 'Account Manager', 'Copywriter', 'Graphic Designer', 'Social Media Manager', 'Media Planner']
};

const PERSONALITY_TAGS = [
    'Analytical', 'Creative', 'Outgoing', 'Reserved', 'Ambitious', 'Laid-back',
    'Detail-oriented', 'Big-picture', 'Collaborative', 'Independent', 'Optimistic',
    'Pragmatic', 'Innovative', 'Traditional', 'Competitive', 'Supportive',
    'Risk-taker', 'Cautious', 'Empathetic', 'Logical'
];

const INVENTORY_OPTIONS = [
    'Laptop', 'Smartphone', 'Notebook', 'Pen', 'Coffee Mug', 'Water Bottle',
    'Headphones', 'Charger', 'Business Cards', 'Sticky Notes', 'Calculator',
    'USB Drive', 'Wallet', 'Keys', 'Sunglasses', 'Gum', 'Hand Sanitizer',
    'Protein Bar', 'Energy Drink', 'Tissues'
];

const DESK_ITEM_OPTIONS = [
    'Monitor', 'Keyboard', 'Mouse', 'Desk Lamp', 'Plant', 'Picture Frame',
    'Paperweight', 'Stapler', 'Hole Punch', 'Tape Dispenser', 'File Organizer',
    'Pen Holder', 'Calendar', 'Stress Ball', 'Action Figure', 'Coffee Warmer',
    'Phone Stand', 'Cable Organizer', 'Mini Fridge', 'Desk Fan'
];

const SPRITE_OPTIONS = Array.from({ length: 20 }, (_, i) => 
    `assets/characters/character-${String(i + 1).padStart(2, '0')}.png`
);

class CharacterData {
    /**
     * Generate a default character template
     */
    static generateDefaultCharacter(index, officeType) {
        const gender = this.getRandomItem(GENDERS);
        const firstName = this.getRandomNameByGender(gender);
        const lastName = this.getRandomItem(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']);
        
        return {
            id: `char_${index + 1}`,
            isPlayerCharacter: index === 0, // First character is player
            
            // Basic Info
            firstName: firstName,
            lastName: lastName,
            age: Math.floor(Math.random() * 25) + 25, // 25-50
            jobRole: this.getRandomItem(JOB_ROLES_BY_OFFICE[officeType] || ['Employee']),
            
            // Physical Attributes
            physicalAttributes: {
                gender: gender,
                height: Math.floor(Math.random() * 40) + 150, // 150-190cm
                weight: Math.floor(Math.random() * 50) + 50,  // 50-100kg
                build: this.getRandomItem(PHYSICAL_BUILDS),
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
            personalityTags: this.getRandomItems(PERSONALITY_TAGS, 2, 4),
            inventory: this.getRandomItems(INVENTORY_OPTIONS, 3, 6),
            deskItems: this.getRandomItems(DESK_ITEM_OPTIONS, 3, 6),
            
            // Bio & Appearance
            bio: '',
            spriteSheet: this.getRandomItem(SPRITE_OPTIONS),
            spriteColors: null,
            portrait: null,
            customPortrait: null,
            
            // API Configuration
            apiKey: '',
            
            // Game engine fields (will be populated later)
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
        const character = this.generateDefaultCharacter(0, officeType);
        
        // Randomize more thoroughly
        character.age = Math.floor(Math.random() * 30) + 20; // 20-50
        character.physicalAttributes.height = Math.floor(Math.random() * 50) + 150; // 150-200cm
        character.physicalAttributes.weight = Math.floor(Math.random() * 80) + 40;  // 40-120kg
        character.skills.competence = Math.floor(Math.random() * 10) + 1;
        character.skills.laziness = Math.floor(Math.random() * 10) + 1;
        character.skills.charisma = Math.floor(Math.random() * 10) + 1;
        character.skills.leadership = Math.floor(Math.random() * 10) + 1;
        
        return character;
    }
    
    /**
     * Finalize characters for game engine
     */
    static finalizeCharacters(characters, globalAPIKey) {
        return characters.map(char => ({
            ...char,
            apiKey: char.apiKey || globalAPIKey,
            // Initialize relationships if not set
            relationships: characters.reduce((rel, otherChar) => {
                if (otherChar.id !== char.id) {
                    rel[otherChar.id] = char.relationships[otherChar.id] || 50;
                }
                return rel;
            }, {})
        }));
    }
    
    /**
     * Get random name based on gender
     */
    static getRandomNameByGender(gender) {
        switch (gender) {
            case 'Male':
                return this.getRandomItem(MALE_NAMES);
            case 'Female':
                return this.getRandomItem(FEMALE_NAMES);
            case 'Non-binary':
                return this.getRandomItem(NONBINARY_NAMES);
            default:
                return this.getRandomItem([...MALE_NAMES, ...FEMALE_NAMES, ...NONBINARY_NAMES]);
        }
    }
    
    /**
     * Get random item from array
     */
    static getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * Get random items from array
     */
    static getRandomItems(array, min, max) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

// Export the class and constants
export { 
    CharacterData,
    GENDERS,
    PHYSICAL_BUILDS,
    JOB_ROLES_BY_OFFICE,
    PERSONALITY_TAGS,
    INVENTORY_OPTIONS,
    DESK_ITEM_OPTIONS,
    SPRITE_OPTIONS
};

console.log('📊 Character Data Module loaded');
