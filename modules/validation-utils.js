/**
 * Validation Utils Module - FIXED AND COMPLETE
 * 
 * Handles all validation for character data.
 * FIXED: All functions properly implemented and error-free.
 */

class ValidationUtils {
    /**
     * Validate all characters before starting game
     */
    static validateAllCharacters(characters) {
        const errors = [];
        
        // Check minimum characters
        if (characters.length < 2) {
            errors.push('Minimum 2 characters required');
        }
        
        // Check maximum characters
        if (characters.length > 5) {
            errors.push('Maximum 5 characters allowed');
        }
        
        // Validate individual characters
        characters.forEach((character, index) => {
            const charErrors = this.validateSingleCharacter(character, index);
            errors.push(...charErrors);
        });
        
        // Check player character
        const playerCount = characters.filter(char => char.isPlayerCharacter).length;
        if (playerCount === 0) {
            errors.push('At least one player character required');
        } else if (playerCount > 1) {
            errors.push('Only one player character allowed');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Validate a single character
     */
    static validateSingleCharacter(character, index) {
        const errors = [];
        
        // Check required fields
        if (!character.firstName || character.firstName.trim() === '') {
            errors.push(`Character ${index + 1}: First name is required`);
        }
        
        if (!character.lastName || character.lastName.trim() === '') {
            errors.push(`Character ${index + 1}: Last name is required`);
        }
        
        if (!character.jobRole || character.jobRole.trim() === '') {
            errors.push(`Character ${index + 1}: Job role is required`);
        }
        
        // Validate age
        if (!character.age || character.age < 18 || character.age > 70) {
            errors.push(`Character ${index + 1}: Age must be between 18 and 70`);
        }
        
        // Validate physical attributes
        if (!character.physicalAttributes) {
            errors.push(`Character ${index + 1}: Physical attributes missing`);
        } else {
            if (!character.physicalAttributes.gender) {
                errors.push(`Character ${index + 1}: Gender is required`);
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
     * Sanitize character name
     */
    static sanitizeCharacterName(name) {
        if (!name) return '';
        return name.trim().substring(0, 50);
    }
}

export { ValidationUtils };

console.log('📦 Validation Utils Module loaded - FIXED AND COMPLETE');
