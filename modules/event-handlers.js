/**
 * Event Handlers Module - PHASE 4 FINAL
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
                // Update global reference
                window.characters = characters;
            });
        }
        
        // Gender change - regenerate name
        const genderSelect = document.getElementById(`gender-${index}`);
        if (genderSelect) {
            genderSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.gender = this.value;
                // Auto-generate new name for the gender
                const newName = generateNameByGender(this
