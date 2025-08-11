/**
 * Event Handlers Module - PHASE 3 COMPLETE
 * * Handles all event listeners and user interactions for the enhanced character creator.
 * FIXED: Proper player character enforcement and all functionality from Phase-3.
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
     * Setup enhanced event listeners for character panel - EXACT COPY from Phase-3
     */
    static setupPanelEventListeners(index, characters, globalAPIKey) {
        // Get the characters array from global scope if not passed
        if (!characters) {
            characters = window.characters || [];
        }
        
        // FIXED: Player character checkbox - enforce single player (EXACT from Phase-3)
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
                } else {
                    characters[index].isPlayer = false;
                }
            });
        }

        // Name generation button (EXACT from Phase-3)
        const generateNameBtn = document.getElementById(`generate-name-${index}`);
        if (generateNameBtn) {
            generateNameBtn.addEventListener('click', function() {
                const gender = characters[index].physicalAttributes.gender;
                const newName = generateNameByGender(gender);
                characters[index].name = newName;
                const nameInput = document.getElementById(`name-${index}`);
                if (nameInput) nameInput.value = newName;
            });
        }

        // Gender change - regenerate name (EXACT from Phase-3)
        const genderSelect = document.getElementById(`gender-${index}`);
        if (genderSelect) {
            genderSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.gender = this.value;
                // Auto-generate new name for the gender
                const newName = generateNameByGender(this.value);
                characters[index].name = newName;
                const nameInput = document.getElementById(`name-${index}`);
                if (nameInput) nameInput.value = newName;
            });
        }

        // Sprite navigation arrows (EXACT from Phase-3)
        const prevBtn = document.getElementById(`sprite-prev-${index}`);
        const nextBtn = document.getElementById(`sprite-next-${index}`);
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => this.navigateSprite(index, -1, characters));
            nextBtn.addEventListener('click', () => this.navigateSprite(index, 1, characters));
        }

        // Custom portrait upload (EXACT from Phase-3)
        const portraitUpload = document.getElementById(`portrait-upload-${index}`);
        if (portraitUpload) {
            portraitUpload.addEventListener('change', function(e) {
                EventHandlers.handleCustomPortraitUpload(index, e.target.files[0], characters);
            });
        }

        // Clear custom portrait (EXACT from Phase-3)
        const clearCustomBtn = document.getElementById(`clear-custom-${index}`);
        if (clearCustomBtn) {
            clearCustomBtn.addEventListener('click', () => EventHandlers.clearCustomPortrait(index));
        }

        // Physical attribute sliders (EXACT from Phase-3)
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

        // Skill sliders (EXACT from Phase-3)
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

        // Personality tags (max 6) with greying out (EXACT from Phase-3)
        PERSONALITY_TAGS.forEach(tag => {
            const checkbox = document.getElementById(`tags-${index}-${tag}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlers.updateCharacterTags(index, 'personalityTags', 6, characters);
                    EventHandlers.updateCheckboxStates(index, 'personalityTags', 6, characters);
                });
            }
        });

        // Inventory items (max 3) with greying out (EXACT from Phase-3)
        INVENTORY_OPTIONS.forEach(item => {
            const checkbox = document.getElementById
