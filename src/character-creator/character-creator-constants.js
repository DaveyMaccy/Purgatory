// src/character-creator/character-creator-constants.js
/**
 * Character Creator Constants Module
 * All constants and configuration for the character creator
 * PHASE 3 RESTORED VERSION with all features
 */

export const CONSTANTS = {
    // PHASE 3 FEATURE: Office types that determine available job roles
    OFFICE_TYPES: [
        "Game Studio",
        "Corporate", 
        "PR Agency",
        "Newspaper"
    ],

    // Job roles organized by office type
    JOB_ROLES_BY_OFFICE: {
        "Game Studio": ["Lead Developer", "Game Designer", "3D Artist", "Sound Engineer", "QA Tester", "Producer"],
        "Corporate": ["IT Specialist", "Admin Assistant", "Business Analyst", "HR Manager", "Project Manager", "Accountant"],
        "PR Agency": ["Account Manager", "Creative Director", "Social Media Manager", "Copywriter", "Media Planner", "Brand Strategist"],
        "Newspaper": ["Reporter", "Editor", "Photographer", "Layout Designer", "Copy Editor", "Columnist"]
    },

    // Character limits
    MIN_CHARACTERS: 2,
    MAX_CHARACTERS: 5,

    // Physical attributes
    GENDERS: ["Male", "Female", "Non-binary"],
    PHYSICAL_BUILDS: ["Slim", "Average", "Athletic", "Heavy"],

    // FIXED: 20 individual sprite files (Phase 1 approach)
    SPRITE_OPTIONS: [
        "assets/characters/character_01.png",
        "assets/characters/character_02.png", 
        "assets/characters/character_03.png",
        "assets/characters/character_04.png",
        "assets/characters/character_05.png",
        "assets/characters/character_06.png",
        "assets/characters/character_07.png",
        "assets/characters/character_08.png",
        "assets/characters/character_09.png",
        "assets/characters/character_10.png",
        "assets/characters/character_11.png",
        "assets/characters/character_12.png",
        "assets/characters/character_13.png",
        "assets/characters/character_14.png",
        "assets/characters/character_15.png",
        "assets/characters/character_16.png",
        "assets/characters/character_17.png",
        "assets/characters/character_18.png",
        "assets/characters/character_19.png",
        "assets/characters/character_20.png"
    ],

    // Personality traits
    PERSONALITY_TAGS: [
        "Creative", "Introverted", "Extroverted", "Ambitious", "Laid-back", "Analytical", 
        "Empathetic", "Competitive", "Collaborative", "Independent", "Detail-oriented", 
        "Big-picture", "Optimistic", "Pessimistic", "Humorous", "Serious", "Spontaneous", 
        "Organized", "Flexible", "Stubborn", "Patient", "Impatient", "Confident", 
        "Self-doubting", "Innovative", "Traditional", "Risk-taker", "Cautious", "Witty", "Flirty"
    ],

    // Conflicting personality pairs
    CONFLICTING_TRAITS: [
        ["Introverted", "Extroverted"],
        ["Optimistic", "Pessimistic"],
        ["Organized", "Spontaneous"],
        ["Patient", "Impatient"],
        ["Confident", "Self-doubting"],
        ["Innovative", "Traditional"],
        ["Risk-taker", "Cautious"],
        ["Laid-back", "Ambitious"],
        ["Flexible", "Stubborn"]
    ],

    // Inventory items
    INVENTORY_OPTIONS: [
        "Coffee Mug", "Smartphone", "Notebook", "Pen", "Laptop Charger", "Headphones", 
        "Energy Drink", "Stress Ball", "Reading Glasses", "Flash Drive", "Business Cards", 
        "Sticky Notes", "Wallet", "Keys", "Hand Sanitizer", "Gum", "Tissues", "Lip Balm", 
        "Band-Aids", "Aspirin"
    ],

    // Desk items
    DESK_ITEM_OPTIONS: [
        "Family Photo", "Plant", "Desk Lamp", "Calendar", "Motivational Poster", 
        "Action Figure", "Mug", "Stress Ball", "Books", "Pen Holder", "Monitor Stand", 
        "Keyboard", "Mouse Pad", "Speakers", "Webcam", "Tablet", "Notebook"
    ],

    // Name lists for random generation
    MALE_NAMES: [
        "Alex", "Ben", "Chris", "David", "Eric", "Frank", "George", "Henry", "Ian", "Jack",
        "Kevin", "Luke", "Mike", "Nick", "Oliver", "Paul", "Quinn", "Ryan", "Sam", "Tom",
        "Victor", "Will", "Xavier", "Yuki", "Zack", "Aaron", "Brad", "Colin", "Dan", "Ethan"
    ],

    FEMALE_NAMES: [
        "Anna", "Beth", "Chloe", "Diana", "Emma", "Fiona", "Grace", "Hannah", "Ivy", "Julia",
        "Kate", "Lucy", "Maya", "Nina", "Olivia", "Penny", "Quinn", "Rachel", "Sarah", "Tina",
        "Uma", "Vera", "Wendy", "Xara", "Yara", "Zoe", "Amy", "Bella", "Clara", "Dora"
    ],

    NONBINARY_NAMES: [
        "Avery", "Blake", "Casey", "Dakota", "Emery", "Finley", "Gray", "Harper", "Indigo", "Jordan",
        "Kai", "Lane", "Morgan", "Nova", "Ocean", "Parker", "Quinn", "River", "Sage", "Taylor",
        "Unity", "Vale", "Winter", "Xen", "Yael", "Zen", "Arrow", "Bay", "Cloud", "Drew"
    ],

    // Default character template
    DEFAULT_CHARACTER: {
        name: "",
        jobRole: "",
        isPlayer: false,
        spriteSheet: "assets/characters/character_01.png",
        spriteIndex: 0,
        portrait: "",
        physicalAttributes: {
            gender: "Male",
            build: "Average"
        },
        skills: {
            technical: 50,
            creative: 50,
            social: 50,
            leadership: 50,
            analytical: 50
        },
        personality: {
            tags: [],
            primaryTrait: "",
            secondaryTrait: ""
        },
        needs: {
            energy: 100,
            hunger: 100,
            social: 100,
            bladder: 100,
            entertainment: 100
        },
        relationships: {},
        inventory: [],
        deskItems: [],
        apiKey: ""
    }
};
