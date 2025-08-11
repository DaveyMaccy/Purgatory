/**
 * Validation Utils Module - PHASE 2 ENHANCED
 * 
 * Handles all validation for character data with enhanced player character
 * enforcement and complete data structure validation.
 */

import { MIN_CHARACTERS, MAX_CHARACTERS } from './character-data.js';

class ValidationUtils {
    /**
     * Validate all characters before starting game - matches monolithic exactly
     */
    static validateAllCharacters(characters) {
        const errors = [];
        
        // Check character count
        if (characters.length < MIN_CHARACTERS) {
            errors.push(`Minimum ${MIN_CHARACTERS} characters required`);
        }
        
        if (characters.length > MAX_CHARACTERS) {
            errors.push(`Maximum ${MAX_CHARACTERS} characters allowed`);
        }
        
        // Validate individual characters
        characters.forEach((character, index) => {
            const charErrors = this.validateSingleCharacter(character, index);
            errors.push(...charErrors);
        });
        
        // Validate player character enforcement
        const playerErrors = this.validatePlayerCharacters(characters);
        errors.push(...playerErrors);
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Validate a single character - enhanced validation
     */
    static validateSingleCharacter(character, index) {
        const errors = [];
        
        // Check required fields
        if (!character.name || character.name.trim() === '') {
            errors.push(`Character ${index + 1}: Name is required`);
        }
        
        if (!character.jobRole || character.jobRole.trim() === '') {
            errors.push(`Character ${index + 1}: Job role is required`);
        }
        
        // Validate physical attributes
        if (!character.physicalAttributes) {
            errors.push(`Character ${index + 1}: Physical attributes missing`);
        } else {
            if (!character.physicalAttributes.gender) {
                errors.push(`Character ${index + 1}: Gender is required`);
            }
            
            if (character.physicalAttributes.age < 18 || character.physicalAttributes.age > 70) {
                errors.push(`Character ${index + 1}: Age must be between 18 and 70`);
            }
        }
        
        // Validate skills
        if (!character.skills) {
            errors.push(`Character ${index + 1}: Skills missing`);
        } else {
            const requiredSkills = ['competence', 'laziness', 'charisma', 'leadership'];
            requiredSkills.forEach(skill => {
                if (typeof character.skills[skill] !== 'number' || 
                    character.skills[skill] < 1 || 
                    character.skills[skill] > 10) {
                    errors.push(`Character ${index + 1}: ${skill} must be between 1 and 10`);
                }
            });
        }
        
        // Validate personality tags limit
        if (character.personalityTags && character.personalityTags.length > 6) {
            errors.push(`Character ${index + 1}: Maximum 6 personality tags allowed`);
        }
        
        // Validate inventory limit
        if (character.inventory && character.inventory.length > 3) {
            errors.push(`Character ${index + 1}: Maximum 3 inventory items allowed`);
        }
        
        // Validate desk items limit
        if (character.deskItems && character.deskItems.length > 2) {
            errors.push(`Character ${index + 1}: Maximum 2 desk items allowed`);
        }
        
        return errors;
    }
    
    /**
     * Validate player character enforcement - exactly one player
     */
    static validatePlayerCharacters(characters) {
        const errors = [];
        const playerCharacters = characters.filter(char => char.isPlayer);
        
        if (playerCharacters.length === 0) {
            // Auto-fix: make first character the player
            characters[0].isPlayer = true;
            console.log('⚠️ No player character found, making first character the player');
        } else if (playerCharacters.length > 1) {
            // Auto-fix: keep only first player
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
        
        return errors;
    }
    
    /**
     * Validate character name
     */
    static validateCharacterName(name) {
        if (!name || name.trim() === '') {
            return { isValid: false, error: 'Name is required' };
        }
        
        if (name.length > 50) {
            return { isValid: false, error: 'Name must be 50 characters or less' };
        }
        
        return { isValid: true };
    }
    
    /**
     * Validate personality tags selection
     */
    static validatePersonalityTags(tags) {
        if (!Array.isArray(tags)) {
            return { isValid: false, error: 'Personality tags must be an array' };
        }
        
        if (tags.length > 6) {
            return { isValid: false, error: 'Maximum 6 personality tags allowed' };
        }
        
        return { isValid: true };
    }
    
    /**
     * Validate inventory items
     */
    static validateInventoryItems(items) {
        if (!Array.isArray(items)) {
            return { isValid: false, error: 'Inventory items must be an array' };
        }
        
        if (items.length > 3) {
            return { isValid: false, error: 'Maximum 3 inventory items allowed' };
        }
        
        return { isValid: true };
    }
    
    /**
     * Validate desk items
     */
    static validateDeskItems(items) {
        if (!Array.isArray(items)) {
            return { isValid: false, error: 'Desk items must be an array' };
        }
        
        if (items.length > 2) {
            return { isValid: false, error: 'Maximum 2 desk items allowed' };
        }
        
        return { isValid: true };
    }
    
    /**
     * Validate skill value
     */
    static validateSkillValue(value, skillName) {
        if (typeof value !== 'number') {
            return { isValid: false, error: `${skillName} must be a number` };
        }
        
        if (value < 1 || value > 10) {
            return { isValid: false, error: `${skillName} must be between 1 and 10` };
        }
        
        return { isValid: true };
    }
    
    /**
     * Validate physical attribute value
     */
    static validatePhysicalAttribute(value, attributeName, min, max) {
        if (typeof value !== 'number') {
            return { isValid: false, error: `${attributeName} must be a number` };
        }
        
        if (value < min || value > max) {
            return { isValid: false, error: `${attributeName} must be between ${min} and ${max}` };
        }
        
        return { isValid: true };
    }
    
    /**
     * Sanitize character name
     */
    static sanitizeCharacterName(name) {
        if (!name) return '';
        return name.trim().substring(0, 50);
    }
    
    /**
     * Ensure character data completeness - fill in missing fields
     */
    static ensureCharacterCompleteness(character, index) {
        // Ensure required fields exist
        if (!character.id) {
            character.id = `char_${index}`;
        }
        
        if (!character.name || character.name.trim() === '') {
            character.name = `Character ${index + 1}`;
        }
        
        if (typeof character.isPlayer !== 'boolean') {
            character.isPlayer = false;
        }
        
        if (!character.physicalAttributes) {
            character.physicalAttributes = {
                age: 30,
                height: 170,
                weight: 70,
                build: 'Average',
                looks: 5,
                gender: 'Male'
            };
        }
        
        if (!character.skills) {
            character.skills = {
                competence: 5,
                laziness: 5,
                charisma: 5,
                leadership: 5
            };
        }
        
        if (!Array.isArray(character.personalityTags)) {
            character.personalityTags = [];
        }
        
        if (!Array.isArray(character.inventory)) {
            character.inventory = [];
        }
        
        if (!Array.isArray(character.deskItems)) {
            character.deskItems = [];
        }
        
        if (!character.needs) {
            character.needs = { energy: 8, hunger: 8, social: 8, comfort: 8, stress: 2 };
        }
        
        if (!character.relationships) {
            character.relationships = {};
        }
        
        return character;
    }
}

export { ValidationUtils };

console.log('📦 Validation Utils Module loaded - PHASE 4 FINAL');
