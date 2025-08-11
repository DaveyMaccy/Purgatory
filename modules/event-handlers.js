/**
 * Event Handlers Module - PHASE 3 COMPLETE
 * 
 * Handles all event listeners and user interactions for the enhanced character creator.
 * Matches the monolithic implementation exactly with all interactive features.
 */

import { UIGenerator } from './ui-generator.js';
import { SpriteManager } from './sprite-manager.js';
import { ValidationUtils } from './validation-utils.js';
import { 
    PERSONALITY_TAGS, 
    INVENTORY_OPTIONS, 
    DESK_ITEM_OPTIONS,
    generateNameByGender 
} from './character-data.js';

class EventHandlers {
    /**
     * Setup enhanced event listeners for character panel - matches monolithic exactly
     */
    static setupPanelEventListeners(index, characters, globalAPIKey) {
        // Get the characters array from global scope if not passed
        if (!characters) {
            characters = window.characters || [];
        }
        
        // Ensure the character exists
        if (!characters[index]) {
            console.warn(`⚠️ Character ${index} not found, skipping event setup`);
            return;
        }
        
        // Player character checkbox - enforce single player
        this.setupPlayerCharacterHandler(index, characters);
        
        // Name generation and gender change
        this.setupNameHandlers(index, characters);
        
        // Sprite navigation arrows
        this.setupSpriteNavigationHandlers(index, characters);
        
        // Custom portrait upload
        this.setupPortraitHandlers(index, characters);
        
        // Physical attribute sliders
        this.setupPhysicalAttributesHandlers(index, characters);
        
        // Skill sliders
        this.setupSkillsHandlers(index, characters);
        
        // Personality tags with limits
        this.setupPersonalityTagsHandlers(index, characters);
        
        // Inventory items with limits
        this.setupInventoryHandlers(index, characters);
        
        // Desk items with limits
        this.setupDeskItemsHandlers(index, characters);
        
        // API key handler
        this.setupAPIKeyHandler(index, characters, globalAPIKey);
        
        // Basic form handlers
        this.setupBasicFormHandlers(index, characters);
        
        console.log(`✅ Event listeners set up for character ${index}`);
        
        // Initialize checkbox states
        setTimeout(() => {
            this.updateCheckboxStates(index, 'personalityTags', 6);
            this.updateCheckboxStates(index, 'inventory', 3);
            this.updateCheckboxStates(index, 'deskItems', 2);
        }, 50);
    }
    
    /**
     * Setup player character enforcement - matches monolithic exactly
     */
    static setupPlayerCharacterHandler(index, characters) {
        const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
        if (isPlayerCheckbox) {
            isPlayerCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    // Uncheck all other player checkboxes
                    characters.forEach((char, otherIndex) => {
                        if (otherIndex !== index) {
                            char.isPlayer = false;
                            const otherCheckbox = document.getElementById(`isPlayer-${otherIndex}`);
                            if (otherCheckbox) otherCheckbox.checked = false;
                        }
                    });
                    characters[index].isPlayer = true;
                    console.log(`🎯 Set character ${index + 1} as player character`);
                } else {
                    characters[index].isPlayer = false;
                }
                
                // Update global reference
                window.characters = characters;
            });
        }
    }
    
    /**
     * Setup name generation and gender change handlers - matches monolithic exactly
     */
    static setupNameHandlers(index, characters) {
        // Name generation button
        const generateNameBtn = document.getElementById(`generate-name-${index}`);
        if (generateNameBtn) {
            generateNameBtn.addEventListener('click', function() {
                const gender = characters[index].physicalAttributes.gender;
                const newName = generateNameByGender(gender);
                characters[index].name = newName;
                const nameInput = document.getElementById(`name-${index}`);
                if (nameInput) nameInput.value = newName;
                
                // Update tab name
                UIGenerator.updateTabName(index, newName);
            });
        }
        
        // Gender change - regenerate name
        const genderSelect = document.getElementById(`gender-${index}`);
        if (genderSelect) {
            genderSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.gender = this.value;
                // Auto-generate new name for the gender
                const newName = generateNameByGender(this.value);
                characters[index].name = newName;
                const nameInput = document.getElementById(`name-${index}`);
                if (nameInput) nameInput.value = newName;
                
                // Update tab name
                UIGenerator.updateTabName(index, newName);
            });
        }
        
        // Name input change
        const nameInput = document.getElementById(`name-${index}`);
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                characters[index].name = this.value;
                UIGenerator.updateTabName(index, this.value);
            });
        }
    }
    
    /**
     * Setup sprite navigation handlers - matches monolithic exactly
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
     * Setup portrait upload handlers - matches monolithic exactly
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
     * Setup physical attribute sliders - matches monolithic exactly
     */
    static setupPhysicalAttributesHandlers(index, characters) {
        ['age', 'height', 'weight', 'looks'].forEach(attr => {
            const slider = document.getElementById(`${attr}-${index}`);
            const valueLabel = document.getElementById(`${attr}-val-${index}`);
            if (slider && valueLabel) {
                slider.addEventListener('input', function() {
                    const value = parseInt(this.value);
                    characters[index].physicalAttributes[attr] = value;
                    
                    if (attr === 'height') {
                        valueLabel.textContent = `${value} cm`;
                    } else if (attr === 'weight') {
                        valueLabel.textContent = `${value} kg`;
                    } else if (attr === 'looks') {
                        valueLabel.textContent = `${value}/10`;
                    } else {
                        valueLabel.textContent = value;
                    }
                });
            }
        });
    }
    
    /**
     * Setup skill sliders - matches monolithic exactly
     */
    static setupSkillsHandlers(index, characters) {
        ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
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
     * Setup personality tags handlers with limit enforcement - matches monolithic exactly
     */
    static setupPersonalityTagsHandlers(index, characters) {
        PERSONALITY_TAGS.forEach(tag => {
            const checkbox = document.getElementById(`tags-${index}-${tag}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlers.updateCharacterTags(index, 'personalityTags', 6, characters);
                    EventHandlers.updateCheckboxStates(index, 'personalityTags', 6);
                });
            }
        });
    }
    
    /**
     * Setup inventory handlers with limit enforcement - matches monolithic exactly
     */
    static setupInventoryHandlers(index, characters) {
        INVENTORY_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`inventory-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlers.updateCharacterItems(index, 'inventory', 3, characters);
                    EventHandlers.updateCheckboxStates(index, 'inventory', 3);
                });
            }
        });
    }
    
    /**
     * Setup desk items handlers with limit enforcement - matches monolithic exactly
     */
    static setupDeskItemsHandlers(index, characters) {
        DESK_ITEM_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`desk-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlers.updateCharacterItems(index, 'deskItems', 2, characters);
                    EventHandlers.updateCheckboxStates(index, 'deskItems', 2);
                });
            }
        });
    }
    
    /**
     * Setup API key handler
     */
    static setupAPIKeyHandler(index, characters, globalAPIKey) {
        const apiKeyInput = document.getElementById(`api-key-input-${index}`);
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', function() {
                characters[index].apiKey = this.value;
            });
        }
    }
    
    /**
     * Setup basic form handlers
     */
    static setupBasicFormHandlers(index, characters) {
        // Job role select
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        if (jobRoleSelect) {
            jobRoleSelect.addEventListener('change', function() {
                characters[index].jobRole = this.value;
            });
        }
        
        // Build select
        const buildSelect = document.getElementById(`build-${index}`);
        if (buildSelect) {
            buildSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.build = this.value;
            });
        }
    }
    
    /**
     * Update checkbox states - grey out when max reached - matches monolithic exactly
     */
    static updateCheckboxStates(index, itemType, maxLimit) {
        let prefix, selectedCount;
        
        if (itemType === 'personalityTags') {
            prefix = 'tags';
            selectedCount = window.characters?.[index]?.personalityTags?.length || 0;
        } else if (itemType === 'inventory') {
            prefix = 'inventory-item';
            selectedCount = window.characters?.[index]?.inventory?.length || 0;
        } else if (itemType === 'deskItems') {
            prefix = 'desk-item';
            selectedCount = window.characters?.[index]?.deskItems?.length || 0;
        }
        
        const allCheckboxes = document.querySelectorAll(`input[id^="${prefix}-${index}-"]`);
        
        allCheckboxes.forEach(checkbox => {
            const isChecked = checkbox.checked;
            const isMaxReached = selectedCount >= maxLimit;
            
            if (isMaxReached && !isChecked) {
                // Grey out unchecked boxes when max reached
                checkbox.disabled = true;
                checkbox.parentElement.style.color = '#9ca3af';
                checkbox.parentElement.style.opacity = '0.6';
            } else {
                // Enable all boxes when under max
                checkbox.disabled = false;
                checkbox.parentElement.style.color = '';
                checkbox.parentElement.style.opacity = '';
            }
        });
    }
    
    /**
     * Update character tags with limit enforcement - matches monolithic exactly
     */
    static updateCharacterTags(index, tagType, maxLimit, characters) {
        const checkboxes = document.querySelectorAll(`input[id^="${tagType === 'personalityTags' ? 'tags' : tagType}-${index}-"]:checked`);
        let selectedTags = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedTags.length > maxLimit) {
            // Find the last checked box and uncheck it
            const lastChecked = Array.from(document.querySelectorAll(`input[id^="${tagType === 'personalityTags' ? 'tags' : tagType}-${index}-"]`))
                .reverse()
                .find(cb => cb.checked);
            if (lastChecked) {
                lastChecked.checked = false;
                selectedTags.pop();
            }
        }
        
        characters[index][tagType] = selectedTags;
    }
    
    /**
     * Update character items with limit enforcement - matches monolithic exactly
     */
    static updateCharacterItems(index, itemType, maxLimit, characters) {
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
            }
        }
        
        characters[index][itemType] = selectedItems;
    }
    
    /**
     * Legacy methods for backward compatibility
     */
    static setupBasicInfoHandlers(index, characters) {
        this.setupNameHandlers(index, characters);
        this.setupBasicFormHandlers(index, characters);
    }
    
    static setupBioHandler(index, characters) {
        // Bio handler placeholder for future use
        console.log(`Bio handler placeholder for character ${index}`);
    }
}

export { EventHandlers };

console.log('📦 Event Handlers Module loaded - PHASE 4 FINAL');
