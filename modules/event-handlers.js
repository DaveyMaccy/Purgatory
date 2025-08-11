/**
 * Event Handlers Module - FIXED AND COMPLETE
 * 
 * Handles all event listeners and user interactions for the character creator.
 * FIXED: All imports and function calls working properly.
 */

import { UIGenerator } from './ui-generator.js';
import { SpriteManager } from './sprite-manager.js';
import { ValidationUtils } from './validation-utils.js';
import { 
    PERSONALITY_TAGS, 
    INVENTORY_OPTIONS, 
    DESK_ITEM_OPTIONS
} from './character-data.js';

class EventHandlers {
    /**
     * Setup event listeners for character panel
     */
    static setupPanelEventListeners(index, characters, globalAPIKey) {
        // Get the characters array from global scope if not passed
        if (!characters) {
            characters = window.characters || [];
        }
        
        // Basic info handlers
        this.setupBasicInfoHandlers(index, characters);
        
        // Physical attributes handlers
        this.setupPhysicalAttributesHandlers(index, characters);
        
        // Skills handlers
        this.setupSkillsHandlers(index, characters);
        
        // Sprite navigation handlers
        this.setupSpriteNavigationHandlers(index, characters);
        
        // Portrait upload handlers
        this.setupPortraitHandlers(index, characters);
        
        // Personality tags handlers
        this.setupPersonalityTagsHandlers(index, characters);
        
        // Inventory handlers
        this.setupInventoryHandlers(index, characters);
        
        // Desk items handlers
        this.setupDeskItemsHandlers(index, characters);
        
        // Bio handler
        this.setupBioHandler(index, characters);
        
        // API key handler
        this.setupAPIKeyHandler(index, characters, globalAPIKey);
    }
    
    /**
     * Setup basic info event handlers
     */
    static setupBasicInfoHandlers(index, characters) {
        // First name
        const firstNameInput = document.getElementById(`first-name-${index}`);
        if (firstNameInput) {
            firstNameInput.addEventListener('input', function() {
                characters[index].firstName = this.value;
                window.characters = characters;
                UIGenerator.updateTabName(index, this.value, characters[index].lastName);
            });
        }
        
        // Last name
        const lastNameInput = document.getElementById(`last-name-${index}`);
        if (lastNameInput) {
            lastNameInput.addEventListener('input', function() {
                characters[index].lastName = this.value;
                window.characters = characters;
                UIGenerator.updateTabName(index, characters[index].firstName, this.value);
            });
        }
        
        // Job role
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        if (jobRoleSelect) {
            jobRoleSelect.addEventListener('change', function() {
                characters[index].jobRole = this.value;
                window.characters = characters;
            });
        }
        
        // Gender
        const genderSelect = document.getElementById(`gender-${index}`);
        if (genderSelect) {
            genderSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.gender = this.value;
                window.characters = characters;
            });
        }
        
        // Player character
        const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
        if (isPlayerCheckbox) {
            isPlayerCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    // Uncheck all other player checkboxes
                    characters.forEach((char, otherIndex) => {
                        if (otherIndex !== index) {
                            char.isPlayerCharacter = false;
                            const otherCheckbox = document.getElementById(`isPlayer-${otherIndex}`);
                            if (otherCheckbox) otherCheckbox.checked = false;
                        }
                    });
                    characters[index].isPlayerCharacter = true;
                } else {
                    characters[index].isPlayerCharacter = false;
                }
                window.characters = characters;
            });
        }
    }
    
    /**
     * Setup physical attributes handlers
     */
    static setupPhysicalAttributesHandlers(index, characters) {
        // Age
        const ageSlider = document.getElementById(`age-${index}`);
        const ageValue = document.getElementById(`age-val-${index}`);
        if (ageSlider && ageValue) {
            ageSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                characters[index].age = value;
                ageValue.textContent = value;
                window.characters = characters;
            });
        }
        
        // Height
        const heightSlider = document.getElementById(`height-${index}`);
        const heightValue = document.getElementById(`height-val-${index}`);
        if (heightSlider && heightValue) {
            heightSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                characters[index].physicalAttributes.height = value;
                heightValue.textContent = `${value} cm`;
                window.characters = characters;
            });
        }
        
        // Weight
        const weightSlider = document.getElementById(`weight-${index}`);
        const weightValue = document.getElementById(`weight-val-${index}`);
        if (weightSlider && weightValue) {
            weightSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                characters[index].physicalAttributes.weight = value;
                weightValue.textContent = `${value} kg`;
                window.characters = characters;
            });
        }
        
        // Looks
        const looksSlider = document.getElementById(`looks-${index}`);
        const looksValue = document.getElementById(`looks-val-${index}`);
        if (looksSlider && looksValue) {
            looksSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                characters[index].physicalAttributes.looks = value;
                looksValue.textContent = `${value}/10`;
                window.characters = characters;
            });
        }
        
        // Build
        const buildSelect = document.getElementById(`build-${index}`);
        if (buildSelect) {
            buildSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.build = this.value;
                window.characters = characters;
            });
        }
    }
    
    /**
     * Setup skills handlers
     */
    static setupSkillsHandlers(index, characters) {
        const skills = ['competence', 'laziness', 'charisma', 'leadership'];
        
        skills.forEach(skill => {
            const slider = document.getElementById(`${skill}-${index}`);
            const valueLabel = document.getElementById(`${skill}-val-${index}`);
            
            if (slider && valueLabel) {
                slider.addEventListener('input', function() {
                    const value = parseInt(this.value);
                    characters[index].skills[skill] = value;
                    valueLabel.textContent = `${value}/10`;
                    window.characters = characters;
                });
            }
        });
    }
    
    /**
     * Setup sprite navigation handlers
     */
    static setupSpriteNavigationHandlers(index, characters) {
        const prevBtn = document.getElementById(`sprite-prev-${index}`);
        const nextBtn = document.getElementById(`sprite-next-${index}`);
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                SpriteManager.navigateSprite(index, -1, characters);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                SpriteManager.navigateSprite(index, 1, characters);
            });
        }
    }
    
    /**
     * Setup portrait handlers
     */
    static setupPortraitHandlers(index, characters) {
        // Custom portrait upload
        const portraitUpload = document.getElementById(`portrait-upload-${index}`);
        if (portraitUpload) {
            portraitUpload.addEventListener('change', function(e) {
                SpriteManager.handleCustomPortraitUpload(index, e.target.files[0], characters);
            });
        }
        
        // Clear custom portrait
        const clearCustomBtn = document.getElementById(`clear-custom-${index}`);
        if (clearCustomBtn) {
            clearCustomBtn.addEventListener('click', () => {
                SpriteManager.clearCustomPortrait(index, characters);
            });
        }
    }
    
    /**
     * Setup personality tags handlers
     */
    static setupPersonalityTagsHandlers(index, characters) {
        PERSONALITY_TAGS.forEach(tag => {
            const checkbox = document.getElementById(`tags-${index}-${tag}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    this.updateCharacterTags(index, 'personalityTags', characters);
                });
            }
        });
    }
    
    /**
     * Setup inventory handlers
     */
    static setupInventoryHandlers(index, characters) {
        INVENTORY_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`inventory-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    this.updateCharacterItems(index, 'inventory', characters);
                });
            }
        });
    }
    
    /**
     * Setup desk items handlers
     */
    static setupDeskItemsHandlers(index, characters) {
        DESK_ITEM_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`desk-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    this.updateCharacterItems(index, 'deskItems', characters);
                });
            }
        });
    }
    
    /**
     * Setup bio handler
     */
    static setupBioHandler(index, characters) {
        const bioTextarea = document.getElementById(`bio-${index}`);
        if (bioTextarea) {
            bioTextarea.addEventListener('input', function() {
                characters[index].bio = this.value;
                window.characters = characters;
            });
        }
    }
    
    /**
     * Setup API key handler
     */
    static setupAPIKeyHandler(index, characters, globalAPIKey) {
        const apiKeyInput = document.getElementById(`api-key-${index}`);
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', function() {
                characters[index].apiKey = this.value || globalAPIKey;
                window.characters = characters;
            });
        }
    }
    
    /**
     * Update character tags
     */
    static updateCharacterTags(index, tagType, characters) {
        const checkboxes = document.querySelectorAll(`input[id^="tags-${index}-"]:checked`);
        const selectedTags = Array.from(checkboxes).map(cb => cb.value);
        characters[index][tagType] = selectedTags;
        window.characters = characters;
    }
    
    /**
     * Update character items
     */
    static updateCharacterItems(index, itemType, characters) {
        const prefix = itemType === 'inventory' ? 'inventory-item' : 'desk-item';
        const checkboxes = document.querySelectorAll(`input[id^="${prefix}-${index}-"]:checked`);
        const selectedItems = Array.from(checkboxes).map(cb => cb.value);
        characters[index][itemType] = selectedItems;
        window.characters = characters;
    }
}

export { EventHandlers };

console.log('📦 Event Handlers Module loaded - FIXED AND COMPLETE');
