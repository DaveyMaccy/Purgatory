/**
 * STAGE 2 FIXED: Character Manager with proper name handling
 * Manages game characters and loads them from character creator data
 */
import { Character } from './character.js';

export class CharacterManager {
    constructor() {
        this.characters = [];
        this.playerCharacter = null;
    }

    /**
     * STAGE 2 FIXED: Load characters from character creator data with proper name handling
     * @param {Array} characterDataArray - Array of character data from character creator
     */
    loadCharacters(characterDataArray) {
        console.log('Loading characters into CharacterManager:', characterDataArray);
        
        // Clear any existing characters
        this.characters = [];
        this.playerCharacter = null;
        
        // Create Character instances from the data
        characterDataArray.forEach((charData, index) => {
            try {
                // FIXED: Create new Character instance with proper data
                const character = new Character(
                    charData.id,
                    charData.name, // This should now come through properly
                    charData.physicalAttributes,
                    charData.skills,
                    charData.personalityTags,
                    charData.inventory,
                    charData.deskItems
                );
                
                // FIXED: Set all properties from character creator data
                character.isPlayer = charData.isPlayer;
                character.spriteSheet = charData.spriteSheet;
                character.apiKey = charData.apiKey;
                character.jobRole = charData.jobRole;
                
                // FIXED: Ensure name is properly set
                character.name = charData.name || `Character ${index + 1}`;
                
                // Set initial position (will be properly positioned in Stage 2)
                character.x = 100 + (index * 60); // Temporary spacing
                character.y = 100 + (index * 60);
                
                // Add to characters array
                this.characters.push(character);
                
                // Set as player character if marked as such
                if (charData.isPlayer) {
                    this.playerCharacter = character;
                    console.log('Set player character:', character.name);
                }
                
                console.log(`Loaded character: ${character.name} (${character.jobRole})`);
                
            } catch (error) {
                console.error(`Failed to create character ${charData.name}:`, error);
            }
        });
        
        console.log(`Successfully loaded ${this.characters.length} characters`);
        
        // Ensure we have a player character
        if (!this.playerCharacter && this.characters.length > 0) {
            console.warn('No player character found, setting first character as player');
            this.characters[0].isPlayer = true;
            this.playerCharacter = this.characters[0];
        }
    }

    /**
     * STAGE 2 FIXED: Initialize characters - now checks if characters already loaded
     */
    initializeCharacters() {
        // Only create default characters if none have been loaded
        if (this.characters.length === 0) {
            console.log('No characters loaded, creating default characters...');
            // This is a fallback for when the game starts without character creator
            this.createDefaultCharacters();
        } else {
            console.log('Characters already loaded, skipping default creation');
        }
    }

    /**
     * STAGE 2 FIXED: Create default characters (fallback method)
     */
    createDefaultCharacters() {
        console.log('Creating default characters...');
        
        // Example default character creation
        const defaultChar = new Character(
            'default_char_1',
            'Default Character',
            { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 },
            { competence: 5, laziness: 5, charisma: 5, leadership: 5 },
            ['Friendly'],
            ['Coffee'],
            ['Plant']
        );
        
        defaultChar.isPlayer = true;
        defaultChar.x = 100;
        defaultChar.y = 100;
        defaultChar.jobRole = 'Senior Coder';
        defaultChar.spriteSheet = 'assets/characters/Premade_Character_48x48_01.png';
        
        this.characters.push(defaultChar);
        this.playerCharacter = defaultChar;
        
        console.log('Created default character:', defaultChar.name);
    }

    addCharacter(character) {
        // Ensure we are adding a proper Character instance
        if (!(character instanceof Character)) {
            const characterInstance = new Character(character);
            this.characters.push(characterInstance);
            if (characterInstance.isPlayer) {
                this.playerCharacter = characterInstance;
            }
            console.log(`Added character: ${characterInstance.name}`);
        } else {
            this.characters.push(character);
            if (character.isPlayer) {
                this.playerCharacter = character;
            }
            console.log(`Added character: ${character.name}`);
        }
    }

    getCharacter(id) {
        return this.characters.find(char => char.id === id);
    }

    getPlayerCharacter() {
        return this.characters.find(char => char.isPlayer);
    }

    removeCharacter(id) {
        this.characters = this.characters.filter(char => char.id !== id);
    }

    /**
     * STAGE 2 FIXED: Initialize character positions
     * This function sets the initial x and y positions for all characters by finding
     * a random walkable tile on the navigation grid for each one.
     * @param {World} world - The game world instance, containing the navGrid.
     */
    initializeCharacterPositions(world) {
        if (!world || !world.navGrid || !world.TILE_SIZE) {
            console.error("Cannot initialize character positions: world, navGrid, or TILE_SIZE is not available.");
            return;
        }

        this.characters.forEach((character, index) => {
            // Get a random walkable position
            const position = world.getRandomWalkablePosition();
            character.x = position.x;
            character.y = position.y;
            
            console.log(`Positioned ${character.name} at (${character.x}, ${character.y})`);
        });
    }

    /**
     * Update all characters
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        this.characters.forEach(character => {
            if (character.update) {
                character.update(deltaTime);
            }
        });
    }

    /**
     * Get all characters except the specified one
     * @param {string} excludeId - Character ID to exclude
     * @returns {Array} Array of characters
     */
    getOtherCharacters(excludeId) {
        return this.characters.filter(char => char.id !== excludeId);
    }

    /**
     * Get characters within a certain distance of a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} distance - Maximum distance
     * @returns {Array} Array of nearby characters
     */
    getCharactersNear(x, y, distance) {
        return this.characters.filter(char => {
            const dx = char.x - x;
            const dy = char.y - y;
            return Math.sqrt(dx * dx + dy * dy) <= distance;
        });
    }
}
