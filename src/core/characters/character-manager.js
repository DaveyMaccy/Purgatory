/**
 * STAGE 3 COMPLETE: Character Manager - Handles character lifecycle and positioning
 *
 * Handles all character-related operations including:
 * - Loading characters from character creator
 * - Character initialization and positioning
 * - Character updates and state management
 * - Integration with world navigation grid
 * - Player character identification
 * CHANGE: Removed redundant initializeNeeds() call.
 */

import { Character } from './character.js';

export class CharacterManager {
    constructor() {
        this.characters = [];
        this.playerCharacter = null;

        console.log('👥 CharacterManager initialized');
    }

    /**
     * Load characters from the character creator data
     * @param {Array} charactersData - Array of character data from character creator
     */
    loadCharacters(charactersData) {
    console.log('📝 Loading characters from character creator:', charactersData);

    // Clear existing characters
    this.characters = [];
    this.playerCharacter = null;

    // Convert character creator data to Character instances
    charactersData.forEach((charData, index) => {
        try {
            // Create Character instance
            const character = new Character(charData);

            // FIXED: Only set as player if explicitly marked in character data
            if (charData.isPlayer === true) {
                character.isPlayer = true;
                this.playerCharacter = character;
                console.log(`🎯 Set ${character.name} as player character (from creator selection)`);
            } else {
                character.isPlayer = false;
            }

            // Add to characters array
            this.characters.push(character);
            console.log(`✅ Created character: ${character.name} (${character.jobRole}), isPlayer: ${character.isPlayer}`);

        } catch (error) {
            console.error(`❌ Failed to create character from data:`, charData, error);
        }
    });

    // SAFETY CHECK: Ensure we have exactly one player character
    const playerCharacters = this.characters.filter(char => char.isPlayer);
    if (playerCharacters.length === 0) {
        // If no player found, make first character player as fallback
        this.characters[0].isPlayer = true;
        this.playerCharacter = this.characters[0];
        console.warn(`⚠️ No player character found in data, making ${this.characters[0].name} the player`);
    } else if (playerCharacters.length > 1) {
        // If multiple players found, keep only the first one
        for (let i = 1; i < playerCharacters.length; i++) {
            playerCharacters[i].isPlayer = false;
        }
        this.playerCharacter = playerCharacters[0];
        console.warn(`⚠️ Multiple player characters found, keeping ${this.playerCharacter.name} as player`);
    }

    console.log(`📋 Loaded ${this.characters.length} characters total, player: ${this.playerCharacter?.name}`);
}

    /**
     * Initialize all characters - called after world is set up
     */
    initializeCharacters() {
        console.log('🔧 Initializing characters...');

        this.characters.forEach(character => {
            try {
                // *** THIS IS THE FIX ***
                // The character.initializeNeeds() call was removed because the Character
                // constructor already initializes the needs, making this call redundant.
                
                // Set initial action state
                if (!character.actionState) {
                    character.setActionState('idle');
                }

                console.log(`✅ Initialized character: ${character.name}`);

            } catch (error) {
                console.error(`❌ Failed to initialize character ${character.name}:`, error);
            }
        });
    }

    /**
     * STAGE 2-3 CRITICAL: Initialize character positions using world navigation grid
     * This method is essential for proper character placement in the game world.
     * It sets the initial x and y positions for all characters by finding
     * a random walkable tile on the navigation grid for each one.
     * @param {World} world - The game world instance, containing the navGrid.
     */
    initializeCharacterPositions(world) {
    if (!world) {
        console.error("❌ Cannot initialize character positions: world is not available.");
        return;
    }

    console.log('📍 Initializing character positions...');

    this.characters.forEach((character, index) => {
        let position;

        // CORRECTED: Use the designated spawn position function
        if (world.getSpawnPosition) {
            try {
                position = world.getSpawnPosition();
                console.log(`🎯 Using designated spawn point for ${character.name}: (${position.x}, ${position.y})`);
            } catch (error) {
                console.warn(`⚠️ Failed to get spawn position for ${character.name}:`, error);
                position = null;
            }
        }

        // Fallback position calculation if world positioning fails
        if (!position) {
            const fallbackX = 100 + (index * 100) % 600; // Spread characters across width
            const fallbackY = 200 + (index * 80) % 300;  // Spread characters across height
            position = { x: fallbackX, y: fallbackY };
            console.warn(`⚠️ Using fallback position for ${character.name}: (${position.x}, ${position.y})`);
        }

        // Set character position
        character.setPosition(position);
        console.log(`✅ Positioned ${character.name} at (${position.x}, ${position.y})`);
    });

    console.log('📍 Character positioning complete');
}

    /**
     * Get the player character
     * @returns {Character|null} The player character or null if not found
     */
    getPlayerCharacter() {
        return this.playerCharacter;
    }

    /**
     * Get character by ID
     * @param {string} id - Character ID
     * @returns {Character|null} Character or null if not found
     */
    getCharacter(id) {
        return this.characters.find(char => char.id === id) || null;
    }

    /**
     * Get character by name
     * @param {string} name - Character name
     * @returns {Character|null} Character or null if not found
     */
    getCharacterByName(name) {
        return this.characters.find(char => char.name === name) || null;
    }

    /**
     * Get all NPCs (non-player characters)
     * @returns {Array<Character>} Array of NPC characters
     */
    getNPCs() {
        return this.characters.filter(char => !char.isPlayer);
    }

    /**
     * Get characters by job role
     * @param {string} jobRole - Job role to filter by
     * @returns {Array<Character>} Array of characters with the specified job role
     */
    getCharactersByJobRole(jobRole) {
        return this.characters.filter(char => char.jobRole === jobRole);
    }

    /**
     * Get characters within a certain distance of a position
     * @param {Object} position - {x, y} position
     * @param {number} radius - Search radius
     * @returns {Array<Character>} Array of characters within radius
     */
    getCharactersNearPosition(position, radius = 100) {
        return this.characters.filter(char => {
            if (!char.position) return false;

            const distance = Math.sqrt(
                Math.pow(char.position.x - position.x, 2) +
                Math.pow(char.position.y - position.y, 2)
            );

            return distance <= radius;
        });
    }

    /**
     * Update all characters
     * @param {number} deltaTime - Time passed in milliseconds
     */
    update(deltaTime) {
        this.characters.forEach(character => {
            try {
                character.update(deltaTime);
            } catch (error) {
                console.error(`❌ Error updating character ${character.name}:`, error);
            }
        });
    }

    /**
     * Add a new character to the game
     * @param {Object} characterData - Character data
     * @returns {Character} The created character
     */
    addCharacter(characterData) {
        const character = new Character(characterData);
        this.characters.push(character);
        console.log(`➕ Added new character: ${character.name}`);
        return character;
    }

    /**
     * Remove a character from the game
     * @param {string} characterId - Character ID to remove
     * @returns {boolean} True if character was removed
     */
    removeCharacter(characterId) {
        const index = this.characters.findIndex(char => char.id === characterId);
        if (index !== -1) {
            const character = this.characters[index];
            this.characters.splice(index, 1);

            // Clear player reference if this was the player
            if (this.playerCharacter && this.playerCharacter.id === characterId) {
                this.playerCharacter = null;
            }

            console.log(`➖ Removed character: ${character.name}`);
            return true;
        }
        return false;
    }

    /**
     * Get comprehensive status for debugging
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            totalCharacters: this.characters.length,
            playerCharacter: this.playerCharacter ? this.playerCharacter.name : 'None',
            npcCount: this.getNPCs().length,
            charactersWithPositions: this.characters.filter(char => char.position).length,
            characterNames: this.characters.map(char => char.name)
        };
    }

    /**
     * Get all character positions for renderer updates
     * @returns {Array} Array of {id, name, x, y, isPlayer} objects
     */
    getCharacterPositions() {
        return this.characters.map(char => ({
            id: char.id,
            name: char.name,
            x: char.position?.x || 0,
            y: char.position?.y || 0,
            isPlayer: char.isPlayer
        }));
    }

    /**
     * Force all characters to notify their observers (useful for debugging)
     */
    forceNotifyObservers() {
        this.characters.forEach(character => {
            character.notifyObservers('debug_update');
        });
        console.log('🔄 Forced observer notifications for all characters');
    }
}


