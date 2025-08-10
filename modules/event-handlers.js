/**
 * Event Handlers Module
 * 
 * Manages all event listeners and user interactions for the character creator.
 * Handles form updates, validation, and user input processing.
 */

import { UIGenerator } from './ui-generator.js';
import { SpriteManager } from './sprite-manager.js';
import { ValidationUtils } from './validation-utils.js';

class EventHandlers {
    /**
     * Setup event listeners for a character panel
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
                UIGenerator.updateTabName(index, this.value, characters[index].lastName);
            });
        }
        
        // Last name
        const lastNameInput = document.getElementById(`last-name-${index}`);
        if (lastNameInput) {
            lastNameInput.addEventListener('input', function() {
                characters[index].lastName = this.value;
                UIGenerator.updateTabName(index, characters[index].firstName, this.value);
            });
        }
        
        // Age
        const ageSlider = document.getElementById(`age-${index}`);
        const ageValue = document.getElementById(`age-val-${index}`);
        if (ageSlider && ageValue) {
            ageSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                characters[index].age = value;
                ageValue.textContent = value;
            });
        }
        
        // Job role
        const jobRoleSelect = document.getElementById(`job-role-${index}`);
        if (jobRoleSelect) {
            jobRoleSelect.addEventListener('change', function() {
                characters[index].jobRole = this.value;
            });
        }
    }
    
    /**
     * Setup physical attributes event handlers
     */
    static setupPhysicalAttributesHandlers(index, characters) {
        // Gender
        const genderSelect = document.getElementById(`gender-${index}`);
        if (genderSelect) {
            genderSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.gender = this.value;
            });
        }
        
        // Build
        const buildSelect = document.getElementById(`build-${index}`);
        if (buildSelect) {
            buildSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.build = this.value;
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
            });
        }
    }
    
    /**
     * Setup skills event handlers
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
                });
            }
        });
    }
    
    /**
     * Setup sprite navigation event handlers
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
     * Setup portrait upload event handlers
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
     * Setup personality tags event handlers
     */
    static setupPersonalityTagsHandlers(index, characters) {
        const tagCheckboxes = document.querySelectorAll(`input[id^="tags-${index}-"]`);
        
        tagCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                this.updateCharacterTags(index, 'personalityTags', 5, characters);
            }.bind(this));
        });
    }
    
    /**
     * Setup inventory event handlers
     */
    static setupInventoryHandlers(index, characters) {
        const inventoryCheckboxes = document.querySelectorAll(`input[id^="inventory-item-${index}-"]`);
        
        inventoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                this.updateCharacterItems(index, 'inventory', 6, characters);
            }.bind(this));
        });
    }
    
    /**
     * Setup desk items event handlers
     */
    static setupDeskItemsHandlers(index, characters) {
        const deskItemCheckboxes = document.querySelectorAll(`input[id^="desk-item-${index}-"]`);
        
        deskItemCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                this.updateCharacterItems(index, 'deskItems', 6, characters);
            }.bind(this));
        });
    }
    
    /**
     * Setup bio event handler
     */
    static setupBioHandler(index, characters) {
        const bioTextarea = document.getElementById(`bio-${index}`);
        if (bioTextarea) {
            bioTextarea.addEventListener('input', function() {
                characters[index].bio = this.value;
            });
        }
    }
    
    /**
     * Setup API key event handler
     */
    static setupAPIKeyHandler(index, characters, globalAPIKey) {
        const apiKeyInput = document.getElementById(`api-key-${index}`);
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', function() {
                characters[index].apiKey = this.value || globalAPIKey || '';
            });
        }
    }
    
    /**
     * Update character tags with limit enforcement
     */
    updateCharacterTags(index, tagType, maxLimit, characters) {
        const prefix = tagType === 'personalityTags' ? 'tags' : tagType;
        const checkboxes = document.querySelectorAll(`input[id^="${prefix}-${index}-"]:checked`);
        let selectedTags = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedTags.length > maxLimit) {
            // Find the last checked box and uncheck it
            const lastChecked = Array.from(document.querySelectorAll(`input[id^="${prefix}-${index}-"]`))
                .reverse()
                .find(cb => cb.checked);
            if (lastChecked) {
                lastChecked.checked = false;
                selectedTags.pop();
                UIGenerator.showError(`Maximum ${maxLimit} ${tagType} allowed`);
            }
        }
        
        characters[index][tagType] = selectedTags;
    }
    
    /**
     * Update character items with limit enforcement
     */
    updateCharacterItems(index, itemType, maxLimit, characters) {
        const prefix = itemType === 'inventory' ? 'inventory-item' : 'desk-item';
        const checkboxes = document.querySelectorAll(`input[id^="${prefix}-${index}-"]:checked`);
        let selectedItems = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedItems.length > maxLimit) {
            // Find the last checked box and uncheck it
            const lastChecked = Array.from(document.querySelectorAll(`input[id^="${prefix}-${index}-"]`))
                .reverse()
                .find(cb => cb.checked);
            if (lastChecked) {
                lastChecked.checked = false;
                selectedItems.pop();
                UIGenerator.showError(`Maximum ${maxLimit} ${itemType} allowed`);
            }
        }
        
        characters[index][itemType] = selectedItems;
    }
    
    /**
     * Setup keyboard shortcuts
     */
    static setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Number keys to switch tabs
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                if (window.switchTab && typeof window.switchTab === 'function') {
                    window.switchTab(tabIndex);
                }
            }
            
            // Ctrl/Cmd + R to randomize current character
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                if (window.randomizeCurrentCharacter && typeof window.randomizeCurrentCharacter === 'function') {
                    window.randomizeCurrentCharacter();
                }
            }
            
            // Enter to start simulation (when focused on start button)
            if (e.key === 'Enter' && document.activeElement.id === 'start-simulation-btn') {
                e.preventDefault();
                if (window.startSimulation && typeof window.startSimulation === 'function') {
                    window.startSimulation();
                }
            }
        });
    }
    
    /**
     * Setup form validation on blur events
     */
    static setupFormValidation(characters) {
        // Add real-time validation to required fields
        document.addEventListener('blur', function(e) {
            if (e.target.matches('input[id^="first-name-"], input[id^="last-name-"]')) {
                const index = parseInt(e.target.id.split('-')[2]);
                const validation = ValidationUtils.validateCharacter(characters[index]);
                
                if (!validation.isValid) {
                    e.target.style.borderColor = '#ff4444';
                    e.target.title = validation.errors.join(', ');
                } else {
                    e.target.style.borderColor = '';
                    e.target.title = '';
                }
            }
        }, true);
    }
    
    /**
     * Cleanup event listeners (useful for module reloading)
     */
    static cleanup() {
        // Remove any global event listeners that might persist
        document.removeEventListener('keydown', this.keyboardHandler);
        document.removeEventListener('blur', this.validationHandler);
    }
}

export { EventHandlers };

console.log('🎯 Event Handlers Module loaded');
