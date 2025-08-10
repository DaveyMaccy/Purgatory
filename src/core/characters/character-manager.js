/**
 * Character Manager - Manages game characters
 * Updated with standardized naming and Stage 3 enhancements
 */
import { Character } from './character.js';

export class CharacterManager {
    constructor() {
        this.characters = [];
        this.playerCharacter = null;
    }

    /**
     * STAGE 3 FIXED: Load characters from character creator data with proper name handling
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
                // Create new Character instance with proper data structure
                const character = new Character(charData);
                
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
     * Initialize characters - now checks if characters already loaded
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
     * UPDATED: Create default characters with standardized asset naming (fallback method)
     */
    createDefaultCharacters() {
        console.log('Creating default characters...');
        
        // Example default character creation with updated naming
        const defaultCharData = {
            id: 'default_char_1',
            name: 'Default Character',
            isPlayer: true,
            jobRole: 'Senior Coder',
            physicalAttributes: { age: 30, height: 175, weight: 70, build: 'Average', looks: 5 },
            skills: { competence: 5, laziness: 5, charisma: 5, leadership: 5 },
            personalityTags: ['Friendly'],
            inventory: ['Coffee'],
            deskItems: ['Plant'],
            spriteSheet: 'assets/characters/character-01.png', // UPDATED: Standardized naming
            position: { x: 100, y: 100 },
            needs: { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 },
            relationships: {}
        };
        
        const defaultChar = new Character(defaultCharData);
        
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
    
    /**
     * BILO_FIX: This function no longer loads hardcoded characters.
     * It now accepts an array of characters created by the user and adds them.
     * This is the core fix for the "character data overwriting" bug.
     * @param {Array<Object>} createdCharacters - The array of character data from the creator.
     */
    loadCharacters(createdCharacters) {
        console.log('Loading characters from creator...');
        this.characters.length = 0; // Clear any default/placeholder characters
        this.playerCharacter = null;

        if (createdCharacters && createdCharacters.length > 0) {
            createdCharacters.forEach(data => this.addCharacter(data));
        }
    }

    removeCharacter(id) {
        this.characters = this.characters.filter(char => char.id !== id);
    }

    /**
     * BILO_FIX: This function was missing, causing the original crash.
     * It sets the initial x and y positions for all characters by finding
     * a random walkable tile on the navigation grid for each one.
     * @param {World} world - The game world instance, containing the navGrid.
     */
    initializeCharacterPositions(world) {
        if (!world || !world.navGrid || !world.TILE_SIZE) {
            console.error("Cannot initialize character positions: world, navGrid, or TILE_SIZE is not available.");
            return;
        }

        console.log('Initializing character positions...');
        
        this.characters.forEach((character, index) => {
            // Find a random walkable position
            let attempts = 0;
            let x, y;
            
            do {
                // Generate random grid coordinates
                const gridX = Math.floor(Math.random() * world.navGrid.length);
                const gridY = Math.floor(Math.random() * world.navGrid[0].length);
                
                // Check if tile is walkable (assuming 1 = walkable, 0 = blocked)
                if (world.navGrid[gridX] && world.navGrid[gridX][gridY] === 1) {
                    // Convert grid coordinates to world coordinates
                    x = gridX * world.TILE_SIZE + (world.TILE_SIZE / 2);
                    y = gridY * world.TILE_SIZE + (world.TILE_SIZE / 2);
                    break;
                }
                
                attempts++;
            } while (attempts < 100); // Prevent infinite loop
            
            // Fallback position if no walkable tile found
            if (attempts >= 100) {
                x = 100 + (index * 60);
                y = 100 + (index * 60);
                console.warn(`Could not find walkable position for ${character.name}, using fallback`);
            }
            
            // Set character position
            character.position = { x, y };
            console.log(`Positioned ${character.name} at (${x}, ${y})`);
        });
    }

    /**
     * Update all characters
     * @param {number} deltaTime - Time passed in milliseconds
     */
    update(deltaTime) {
        this.characters.forEach(character => {
            character.update(deltaTime);
        });
    }
}
