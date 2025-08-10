// src/character-creator/character-creator-core.js
/**
 * Character Creator Core Logic Module
 * Handles all business logic and data management
 * PHASE 3 RESTORED VERSION with proper functionality
 */

import { CONSTANTS } from './character-creator-constants.js';

export class CharacterCreatorCore {
    constructor() {
        this.characters = [];
        this.currentCharacterIndex = 0;
        this.officeType = "Corporate"; // Default office type
        this.globalApiKey = "";
        
        console.log('🧠 Character Creator Core initialized');
        this.initializeDefaultCharacters();
    }

    /**
     * Initialize with default characters
     */
    initializeDefaultCharacters() {
        console.log('👥 Creating default characters...');
        
        // Create initial characters
        for (let i = 0; i < CONSTANTS.MIN_CHARACTERS; i++) {
            this.addCharacter();
        }
        
        // Set first character as player
        if (this.characters.length > 0) {
            this.characters[0].isPlayer = true;
            console.log('👑 Set character 0 as player character');
        }
    }

    /**
     * Add a new character
     */
    addCharacter() {
        if (this.characters.length >= CONSTANTS.MAX_CHARACTERS) {
            console.warn('⚠️ Cannot add more characters (max reached)');
            return false;
        }

        const newCharacter = this.createDefaultCharacter();
        newCharacter.spriteIndex = this.characters.length % CONSTANTS.SPRITE_OPTIONS.length;
        newCharacter.spriteSheet = CONSTANTS.SPRITE_OPTIONS[newCharacter.spriteIndex];
        
        // Assign default job role based on office type
        const availableRoles = CONSTANTS.JOB_ROLES_BY_OFFICE[this.officeType];
        newCharacter.jobRole = availableRoles[this.characters.length % availableRoles.length];
        
        this.characters.push(newCharacter);
        
        console.log(`✅ Added character ${this.characters.length}: ${newCharacter.name || 'Unnamed'}`);
        return true;
    }

    /**
     * Remove a character
     */
    removeCharacter(index) {
        if (this.characters.length <= CONSTANTS.MIN_CHARACTERS) {
            console.warn('⚠️ Cannot remove character (minimum required)');
            return false;
        }

        if (index < 0 || index >= this.characters.length) {
            console.warn('⚠️ Invalid character index for removal');
            return false;
        }

        // Don't allow removing the last player character
        const removingPlayer = this.characters[index].isPlayer;
        const playerCount = this.characters.filter(c => c.isPlayer).length;
        
        if (removingPlayer && playerCount === 1) {
            console.warn('⚠️ Cannot remove the only player character');
            return false;
        }

        this.characters.splice(index, 1);
        
        // Adjust current index if needed
        if (this.currentCharacterIndex >= this.characters.length) {
            this.currentCharacterIndex = this.characters.length - 1;
        }
        
        console.log(`🗑️ Removed character at index ${index}`);
        return true;
    }

    /**
     * Create a default character object
     */
    createDefaultCharacter() {
        return JSON.parse(JSON.stringify(CONSTANTS.DEFAULT_CHARACTER));
    }

    /**
     * Switch to a different character tab
     */
    switchToTab(index) {
        if (index < 0 || index >= this.characters.length) {
            console.warn(`⚠️ Invalid character index: ${index}`);
            return;
        }

        this.currentCharacterIndex = index;
        console.log(`📋 Switched to character ${index}`);
    }

    /**
     * Update character sprite (navigate between available sprites)
     */
    updateCharacterSprite(index, direction) {
        if (index < 0 || index >= this.characters.length) return;

        const character = this.characters[index];
        const currentIndex = character.spriteIndex || 0;
        let newIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % CONSTANTS.SPRITE_OPTIONS.length;
        } else {
            newIndex = currentIndex === 0 ? CONSTANTS.SPRITE_OPTIONS.length - 1 : currentIndex - 1;
        }

        character.spriteIndex = newIndex;
        character.spriteSheet = CONSTANTS.SPRITE_OPTIONS[newIndex];
        
        console.log(`🎨 Updated character ${index} sprite to ${newIndex + 1}/${CONSTANTS.SPRITE_OPTIONS.length}`);
    }

    /**
     * Set a character as the player character
     */
    setPlayerCharacter(index) {
        if (index < 0 || index >= this.characters.length) return;

        // Remove player status from all characters
        this.characters.forEach(char => char.isPlayer = false);
        
        // Set new player character
        this.characters[index].isPlayer = true;
        
        console.log(`👑 Set character ${index} as player character`);
    }

    /**
     * Randomize a character's attributes
     */
    randomizeCharacter(index) {
        if (index < 0 || index >= this.characters.length) return;

        const character = this.characters[index];
        
        // Randomize basic attributes
        character.physicalAttributes.gender = this.getRandomFromArray(CONSTANTS.GENDERS);
        character.physicalAttributes.build = this.getRandomFromArray(CONSTANTS.PHYSICAL_BUILDS);
        
        // Generate random name based on gender
        character.name = this.generateRandomName(character.physicalAttributes.gender);
        
        // Randomize sprite
        character.spriteIndex = Math.floor(Math.random() * CONSTANTS.SPRITE_OPTIONS.length);
        character.spriteSheet = CONSTANTS.SPRITE_OPTIONS[character.spriteIndex];
        
        // Randomize skills (30-80 range for realism)
        Object.keys(character.skills).forEach(skill => {
            character.skills[skill] = Math.floor(Math.random() * 51) + 30;
        });
        
        // Randomize personality tags (2-4 tags)
        character.personality.tags = this.generateRandomPersonalityTags();
        
        // Randomize inventory (1-3 items)
        const inventoryCount = Math.floor(Math.random() * 3) + 1;
        character.inventory = this.getRandomFromArray(CONSTANTS.INVENTORY_OPTIONS, inventoryCount);
        
        // Randomize desk items (1-2 items)
        const deskItemCount = Math.floor(Math.random() * 2) + 1;
        character.deskItems = this.getRandomFromArray(CONSTANTS.DESK_ITEM_OPTIONS, deskItemCount);
        
        console.log(`🎲 Randomized character ${index}: ${character.name}`);
    }

    /**
     * Randomize all characters
     */
    randomizeAllCharacters() {
        this.characters.forEach((_, index) => {
            this.randomizeCharacter(index);
        });
        
        console.log('🎲 Randomized all characters');
    }

    /**
     * Generate random name based on gender
     */
    generateRandomName(gender) {
        let nameList;
        
        switch (gender) {
            case 'Male':
                nameList = CONSTANTS.MALE_NAMES;
                break;
            case 'Female': 
                nameList = CONSTANTS.FEMALE_NAMES;
                break;
            case 'Non-binary':
                nameList = CONSTANTS.NONBINARY_NAMES;
                break;
            default:
                nameList = CONSTANTS.MALE_NAMES;
        }
        
        return this.getRandomFromArray(nameList);
    }

    /**
     * Generate random personality tags (avoiding conflicts)
     */
    generateRandomPersonalityTags() {
        const numTags = Math.floor(Math.random() * 3) + 2; // 2-4 tags
        const selectedTags = [];
        const availableTags = [...CONSTANTS.PERSONALITY_TAGS];
        
        for (let i = 0; i < numTags && availableTags.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableTags.length);
            const selectedTag = availableTags[randomIndex];
            
            // Check for conflicts with already selected tags
            const hasConflict = selectedTags.some(existingTag => 
                this.areTraitsConflicting(existingTag, selectedTag)
            );
            
            if (!hasConflict) {
                selectedTags.push(selectedTag);
                // Remove conflicting traits from available options
                this.removeConflictingTraits(availableTags, selectedTag);
            }
            
            // Remove the selected tag from available options
            availableTags.splice(randomIndex, 1);
        }
        
        return selectedTags;
    }

    /**
     * Check if two personality traits conflict
     */
    areTraitsConflicting(trait1, trait2) {
        return CONSTANTS.CONFLICTING_TRAITS.some(pair => 
            (pair[0] === trait1 && pair[1] === trait2) || 
            (pair[0] === trait2 && pair[1] === trait1)
        );
    }

    /**
     * Remove traits that conflict with the selected trait
     */
    removeConflictingTraits(availableTraits, selectedTrait) {
        CONSTANTS.CONFLICTING_TRAITS.forEach(pair => {
            if (pair[0] === selectedTrait) {
                const conflictIndex = availableTraits.indexOf(pair[1]);
                if (conflictIndex !== -1) {
                    availableTraits.splice(conflictIndex, 1);
                }
            } else if (pair[1] === selectedTrait) {
                const conflictIndex = availableTraits.indexOf(pair[0]);
                if (conflictIndex !== -1) {
                    availableTraits.splice(conflictIndex, 1);
                }
            }
        });
    }

    /**
     * Get random item(s) from an array
     */
    getRandomFromArray(array, count = 1) {
        if (count === 1) {
            return array[Math.floor(Math.random() * array.length)];
        }
        
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }

    /**
     * Validate character data before starting the game
     */
    validateCharacters() {
        const errors = [];
        
        // Check minimum characters
        if (this.characters.length < CONSTANTS.MIN_CHARACTERS) {
            errors.push(`Minimum ${CONSTANTS.MIN_CHARACTERS} characters required`);
        }
        
        // Check for at least one player character
        const playerCount = this.characters.filter(c => c.isPlayer).length;
        if (playerCount === 0) {
            errors.push('At least one player character required');
        }
        
        // Validate each character
        this.characters.forEach((character, index) => {
            if (!character.name || character.name.trim() === '') {
                errors.push(`Character ${index + 1} needs a name`);
            }
            
            if (!character.jobRole) {
                errors.push(`Character ${index + 1} needs a job role`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get the current game state for starting the simulation
     */
    getGameState() {
        const validation = this.validateCharacters();
        
        if (!validation.isValid) {
            console.error('❌ Character validation failed:', validation.errors);
            return null;
        }
        
        return {
            characters: this.characters,
            officeType: this.officeType,
            globalApiKey: this.globalApiKey
        };
    }
}
