/**
 * Validation Utils Module
 * 
 * Handles all validation logic for character creation.
 * Ensures data integrity and provides user feedback.
 */

class ValidationUtils {
    /**
     * Validate a single character
     */
    static validateCharacter(character) {
        const errors = [];
        
        // Basic info validation
        if (!character.firstName || character.firstName.trim().length === 0) {
            errors.push('First name is required');
        } else if (character.firstName.trim().length > 50) {
            errors.push('First name must be 50 characters or less');
        }
        
        if (!character.lastName || character.lastName.trim().length === 0) {
            errors.push('Last name is required');
        } else if (character.lastName.trim().length > 50) {
            errors.push('Last name must be 50 characters or less');
        }
        
        if (!character.jobRole || character.jobRole.trim().length === 0) {
            errors.push('Job role is required');
        }
        
        // Age validation
        if (!character.age || character.age < 18 || character.age > 65) {
            errors.push('Age must be between 18 and 65');
        }
        
        // Physical attributes validation
        if (!character.physicalAttributes) {
            errors.push('Physical attributes are missing');
        } else {
            const attrs = character.physicalAttributes;
            
            if (!attrs.gender) {
                errors.push('Gender is required');
            }
            
            if (!attrs.build) {
                errors.push('Build is required');
            }
            
            if (!attrs.height || attrs.height < 140 || attrs.height > 210) {
                errors.push('Height must be between 140 and 210 cm');
            }
            
            if (!attrs.weight || attrs.weight < 40 || attrs.weight > 150) {
                errors.push('Weight must be between 40 and 150 kg');
            }
            
            if (!attrs.looks || attrs.looks < 1 || attrs.looks > 10) {
                errors.push('Looks rating must be between 1 and 10');
            }
        }
        
        // Skills validation
        if (!character.skills) {
            errors.push('Skills are missing');
        } else {
            const skills = character.skills;
            const skillNames = ['competence', 'laziness', 'charisma', 'leadership'];
            
            skillNames.forEach(skill => {
                if (!skills[skill] || skills[skill] < 1 || skills[skill] > 10) {
                    errors.push(`${skill} must be between 1 and 10`);
                }
            });
        }
        
        // Personality tags validation
        if (!character.personalityTags || !Array.isArray(character.personalityTags)) {
            errors.push('Personality tags are missing');
        } else if (character.personalityTags.length < 2) {
            errors.push('At least 2 personality tags are required');
        } else if (character.personalityTags.length > 5) {
            errors.push('Maximum 5 personality tags allowed');
        }
        
        // Inventory validation
        if (!character.inventory || !Array.isArray(character.inventory)) {
            errors.push('Inventory is missing');
        } else if (character.inventory.length < 3) {
            errors.push('At least 3 inventory items are required');
        } else if (character.inventory.length > 6) {
            errors.push('Maximum 6 inventory items allowed');
        }
        
        // Desk items validation
        if (!character.deskItems || !Array.isArray(character.deskItems)) {
            errors.push('Desk items are missing');
        } else if (character.deskItems.length < 3) {
            errors.push('At least 3 desk items are required');
        } else if (character.deskItems.length > 6) {
            errors.push('Maximum 6 desk items allowed');
        }
        
        // Sprite validation
        if (!character.spriteSheet) {
            errors.push('Character sprite is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Validate all characters
     */
    static validateAllCharacters(characters) {
        const allErrors = [];
        
        if (!characters || !Array.isArray(characters)) {
            return {
                isValid: false,
                errors: ['No characters found']
            };
        }
        
        if (characters.length < 2) {
            allErrors.push('At least 2 characters are required');
        }
        
        if (characters.length > 5) {
            allErrors.push('Maximum 5 characters allowed');
        }
        
        // Check for player character
        const playerCharacters = characters.filter(char => char.isPlayerCharacter);
        if (playerCharacters.length === 0) {
            allErrors.push('One character must be designated as the player character');
        } else if (playerCharacters.length > 1) {
            allErrors.push('Only one character can be the player character');
        }
        
        // Validate each character individually
        characters.forEach((character, index) => {
            const validation = this.validateCharacter(character);
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    allErrors.push(`Character ${index + 1}: ${error}`);
                });
            }
        });
        
        // Check for duplicate names
        const names = characters.map(char => `${char.firstName} ${char.lastName}`.toLowerCase());
        const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicateNames.length > 0) {
            allErrors.push('Characters must have unique names');
        }
        
        return {
            isValid: allErrors.length === 0,
            errors: allErrors
        };
    }
    
    /**
     * Validate API key format
     */
    static validateAPIKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return {
                isValid: false,
                error: 'API key is required'
            };
        }
        
        // Remove whitespace
        apiKey = apiKey.trim();
        
        if (apiKey.length === 0) {
            return {
                isValid: false,
                error: 'API key cannot be empty'
            };
        }
        
        // Basic format validation (adjust based on your API requirements)
        if (apiKey.length < 10) {
            return {
                isValid: false,
                error: 'API key appears to be too short'
            };
        }
        
        if (apiKey.length > 200) {
            return {
                isValid: false,
                error: 'API key appears to be too long'
            };
        }
        
        // Check for potentially invalid characters
        if (!/^[a-zA-Z0-9\-_\.]+$/.test(apiKey)) {
            return {
                isValid: false,
                error: 'API key contains invalid characters'
            };
        }
        
        return {
            isValid: true,
            error: null
        };
    }
    
    /**
     * Validate character name for uniqueness
     */
    static validateNameUniqueness(firstName, lastName, characters, excludeIndex = -1) {
        const fullName = `${firstName} ${lastName}`.toLowerCase().trim();
        
        for (let i = 0; i < characters.length; i++) {
            if (i === excludeIndex) continue;
            
            const existingName = `${characters[i].firstName} ${characters[i].lastName}`.toLowerCase().trim();
            if (existingName === fullName) {
                return {
                    isValid: false,
                    error: 'A character with this name already exists'
                };
            }
        }
        
        return {
            isValid: true,
            error: null
        };
    }
    
    /**
     * Validate bio length and content
     */
    static validateBio(bio) {
        if (!bio) {
            return { isValid: true, error: null }; // Bio is optional
        }
        
        if (typeof bio !== 'string') {
            return {
                isValid: false,
                error: 'Bio must be text'
            };
        }
        
        if (bio.length > 1000) {
            return {
                isValid: false,
                error: 'Bio must be 1000 characters or less'
            };
        }
        
        // Check for inappropriate content (basic check)
        const inappropriateWords = ['badword1', 'badword2']; // Add actual inappropriate words
        const lowercaseBio = bio.toLowerCase();
        
        for (const word of inappropriateWords) {
            if (lowercaseBio.includes(word)) {
                return {
                    isValid: false,
                    error: 'Bio contains inappropriate content'
                };
            }
        }
        
        return {
            isValid: true,
            error: null
        };
    }
    
    /**
     * Real-time validation for form fields
     */
    static validateField(fieldType, value, context = {}) {
        switch (fieldType) {
            case 'firstName':
            case 'lastName':
                if (!value || value.trim().length === 0) {
                    return { isValid: false, error: 'This field is required' };
                }
                if (value.trim().length > 50) {
                    return { isValid: false, error: 'Must be 50 characters or less' };
                }
                if (!/^[a-zA-Z\s\-']+$/.test(value)) {
                    return { isValid: false, error: 'Only letters, spaces, hyphens, and apostrophes allowed' };
                }
                break;
                
            case 'age':
                const age = parseInt(value);
                if (isNaN(age) || age < 18 || age > 65) {
                    return { isValid: false, error: 'Age must be between 18 and 65' };
                }
                break;
                
            case 'height':
                const height = parseInt(value);
                if (isNaN(height) || height < 140 || height > 210) {
                    return { isValid: false, error: 'Height must be between 140 and 210 cm' };
                }
                break;
                
            case 'weight':
                const weight = parseInt(value);
                if (isNaN(weight) || weight < 40 || weight > 150) {
                    return { isValid: false, error: 'Weight must be between 40 and 150 kg' };
                }
                break;
                
            case 'skill':
                const skill = parseInt(value);
                if (isNaN(skill) || skill < 1 || skill > 10) {
                    return { isValid: false, error: 'Must be between 1 and 10' };
                }
                break;
                
            case 'bio':
                return this.validateBio(value);
                
            case 'apiKey':
                return this.validateAPIKey(value);
                
            default:
                return { isValid: true, error: null };
        }
        
        return { isValid: true, error: null };
    }
    
    /**
     * Get validation summary for display
     */
    static getValidationSummary(characters) {
        const summary = {
            totalCharacters: characters.length,
            validCharacters: 0,
            invalidCharacters: 0,
            errors: [],
            warnings: []
        };
        
        characters.forEach((character, index) => {
            const validation = this.validateCharacter(character);
            if (validation.isValid) {
                summary.validCharacters++;
            } else {
                summary.invalidCharacters++;
                validation.errors.forEach(error => {
                    summary.errors.push(`Character ${index + 1}: ${error}`);
                });
            }
        });
        
        // Add warnings
        if (summary.totalCharacters < 3) {
            summary.warnings.push('Consider adding more characters for a richer simulation');
        }
        
        const playerChars = characters.filter(char => char.isPlayerCharacter);
        if (playerChars.length === 0) {
            summary.warnings.push('No player character designated');
        }
        
        return summary;
    }
}

export { ValidationUtils };

console.log('✅ Validation Utils Module loaded');
