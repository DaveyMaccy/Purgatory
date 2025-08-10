/**
 * Character Creator Constants
 * All constants and data used by the character creator
 */

export const CONSTANTS = {
    // Office types and job roles
    JOB_ROLES_BY_OFFICE: {
        "Game Studio": ["Lead Developer", "Game Designer", "3D Artist", "Sound Engineer", "QA Tester", "Producer"],
        "Corporate": ["IT Specialist", "Admin Assistant", "Business Analyst", "HR Manager", "Project Manager", "Accountant"],
        "PR Agency": ["Account Manager", "Creative Director", "Social Media Manager", "Copywriter", "Media Planner", "Brand Strategist"],
        "Newspaper": ["Reporter", "Editor", "Photographer", "Layout Designer", "Copy Editor", "Columnist"]
    },

    // Character attributes
    PERSONALITY_TAGS: [
        "Creative", "Introverted", "Extroverted", "Ambitious", "Laid-back", "Analytical", 
        "Empathetic", "Competitive", "Collaborative", "Independent", "Detail-oriented", 
        "Big-picture", "Optimistic", "Pessimistic", "Humorous", "Serious", "Spontaneous", 
        "Organized", "Flexible", "Stubborn", "Patient", "Impatient", "Confident", 
        "Self-doubting", "Innovative", "Traditional", "Risk-taker", "Cautious", "Witty", "Flirty"
    ],

    INVENTORY_OPTIONS: [
        "Coffee Mug", "Smartphone", "Notebook", "Pen", "Laptop Charger", "Headphones", 
        "Energy Bar", "Hand Sanitizer", "Reading Glasses", "Flash Drive", "Stress Ball", 
        "Office Keys", "Business Cards", "Breath Mints", "Phone Charger"
    ],

    DESK_ITEM_OPTIONS: [
        "Family Photo", "Plant", "Calendar", "Desk Lamp", "Coffee Maker", "Radio", 
        "Stress Ball", "Award Trophy", "Book", "Fidget Toy", "Tissue Box", "Stapler"
    ],

    PHYSICAL_BUILDS: ["Slim", "Average", "Athletic", "Heavy"],
    
    GENDERS: ["Male", "Female", "Non-binary"],

    // Sprite options (20 sprites)
    SPRITE_OPTIONS: (() => {
        const sprites = [];
        for (let i = 1; i <= 20; i++) {
            const paddedNumber = i.toString().padStart(2, '0');
            sprites.push(`assets/characters/character-${paddedNumber}.png`);
        }
        return sprites;
    })(),

    // Names by gender
    NAMES_BY_GENDER: {
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
    },

    // Character limits
    MIN_CHARACTERS: 2,
    MAX_CHARACTERS: 5,

    // Office types for selector
    OFFICE_TYPES: ["Game Studio", "Corporate", "PR Agency", "Newspaper"]
};
