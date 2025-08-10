/**
 * Character Manager - Manages game characters
 */
import { Character } from './character.js';

export class CharacterManager {
    constructor() {
        this.characters = [];
        this.playerCharacter = null;
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

        this.characters.forEach(character => {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 200;

            while (!placed && attempts < maxAttempts) {
                const gridY = Math.floor(Math.random() * world.navGrid.length);
                const gridX = Math.floor(Math.random() * world.navGrid[gridY].length);

                if (world.navGrid[gridY][gridX] === 0) {
                    character.position = { 
                        x: gridX * world.TILE_SIZE + (world.TILE_SIZE / 2), 
                        y: gridY * world.TILE_SIZE + (world.TILE_SIZE / 2) 
                    };
                    placed = true;
                }
                attempts++;
            }

            if (!placed) {
                console.error(`Could not find a valid starting position for character: ${character.name}. Placing at default.`);
                character.position = { x: 50, y: 50 };
            }
        });
    }

    update(deltaTime) {
        for (const character of this.characters) {
            // BILO_PLACEHOLDER: This needs to call the character's update method if one exists
            // This is a placeholder because the character.js file doesn't currently export an update method
            if (character.isEnabled && typeof character.update === 'function') {
                character.update(deltaTime);
            }
        }
    }
}
