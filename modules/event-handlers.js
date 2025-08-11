/**
 * Event Handlers Module - PHASE 3 FIXED
 * Handles all event listeners and user interactions for the enhanced character creator.
 * FIXED: Proper null checks and array bounds validation to prevent undefined errors.
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
     * Setup enhanced event listeners for character panel - FIXED VERSION
     */
    static setupPanelEventListeners(index, characters, globalAPIKey) {
        // FIXED: Get the characters array from global scope if not passed and validate it
        if (!characters) {
            characters = window.characters || [];
        }
        
        // FIXED: Validate index bounds and character existence
        if (!characters || !Array.isArray(characters) || index < 0 || index >= characters.length || !characters[index]) {
            console.error(`❌ Invalid character index ${index} or characters array:`, characters);
            return;
        }
        
        // FIXED: Player character checkbox - enforce single player with proper null checks
        const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
        if (isPlayerCheckbox) {
            isPlayerCheckbox.addEventListener('change', function() {
                // FIXED: Add safety checks before accessing array elements
                if (!characters[index]) {
                    console.error(`❌ Character at index ${index} is undefined`);
                    return;
                }
                
                if (this.checked) {
                    // Uncheck all other player checkboxes
                    characters.forEach((char, otherIndex) => {
                        if (char && otherIndex !== index) { // FIXED: Check char exists
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

        // Name generation button (FIXED with null checks)
        const generateNameBtn = document.getElementById(`generate-name-${index}`);
        if (generateNameBtn) {
            generateNameBtn.addEventListener('click', function() {
                if (!characters[index] || !characters[index].physicalAttributes) {
                    console.error(`❌ Character or physical attributes missing for index ${index}`);
                    return;
                }
                
                const gender = characters[index].physicalAttributes.gender;
                const newName = generateNameByGender(gender);
                characters[index].name = newName;
                const nameInput = document.getElementById(`name-${index}`);
                if (nameInput) nameInput.value = newName;
            });
        }

        // Gender change - regenerate name (FIXED with null checks)
        const genderSelect = document.getElementById(`gender-${index}`);
        if (genderSelect) {
            genderSelect.addEventListener('change', function() {
                if (!characters[index] || !characters[index].physicalAttributes) {
                    console.error(`❌ Character or physical attributes missing for index ${index}`);
                    return;
                }
                
                characters[index].physicalAttributes.gender = this.value;
                // Auto-generate new name for the gender
                const newName = generateNameByGender(this.value);
                characters[index].name = newName;
                const nameInput = document.getElementById(`name-${index}`);
                if (nameInput) nameInput.value = newName;
            });
        }

        // Sprite navigation (FIXED with null checks)
        const prevSpriteBtn = document.getElementById(`prev-sprite-${index}`);
        const nextSpriteBtn = document.getElementById(`next-sprite-${index}`);
        
        if (prevSpriteBtn) {
            prevSpriteBtn.addEventListener('click', function() {
                if (!characters[index]) {
                    console.error(`❌ Character missing for index ${index}`);
                    return;
                }
                SpriteManager.navigateSprite(index, -1, characters);
            });
        }
        
        if (nextSpriteBtn) {
            nextSpriteBtn.addEventListener('click', function() {
                if (!characters[index]) {
                    console.error(`❌ Character missing for index ${index}`);
                    return;
                }
                SpriteManager.navigateSprite(index, 1, characters);
            });
        }

        // Personality tags (max 6) with greying out (FIXED with null checks)
        PERSONALITY_TAGS.forEach(tag => {
            const checkbox = document.getElementById(`tags-${index}-${tag.replace(/\s+/g, '-').toLowerCase()}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    if (!characters[index]) {
                        console.error(`❌ Character missing for index ${index}`);
                        return;
                    }
                    EventHandlers.updateCharacterTags(index, 'personalityTags', 6, characters);
                    EventHandlers.updateCheckboxStates(index, 'personalityTags', 6, characters);
                });
            }
        });

        // Inventory items (max 3) with greying out (FIXED with null checks)
        INVENTORY_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`inventory-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    if (!characters[index]) {
                        console.error(`❌ Character missing for index ${index}`);
                        return;
                    }
                    EventHandlers.updateCharacterItems(index, 'inventory', 3, characters);
                    EventHandlers.updateCheckboxStates(index, 'inventory', 3, characters);
                });
            }
        });

        // Desk items (max 2) with greying out (FIXED with null checks)
        DESK_ITEM_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`desk-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    if (!characters[index]) {
                        console.error(`❌ Character missing for index ${index}`);
                        return;
                    }
                    EventHandlers.updateCharacterItems(index, 'deskItems', 2, characters);
                    EventHandlers.updateCheckboxStates(index, 'deskItems', 2, characters);
                });
            }
        });
        
        // API key handler (FIXED with null checks)
        const apiKeyInput = document.getElementById(`api-key-input-${index}`);
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', function() {
                if (!characters[index]) {
                    console.error(`❌ Character missing for index ${index}`);
                    return;
                }
                characters[index].apiKey = this.value;
            });
        }

        // Basic form handlers (FIXED with null checks)
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        if (jobRoleSelect) {
            jobRoleSelect.addEventListener('change', function() {
                if (!characters[index]) {
                    console.error(`❌ Character missing for index ${index}`);
                    return;
                }
                characters[index].jobRole = this.value;
            });
        }
        
        const buildSelect = document.getElementById(`build-${index}`);
        if (buildSelect) {
            buildSelect.addEventListener('change', function() {
                if (!characters[index] || !characters[index].physicalAttributes) {
                    console.error(`❌ Character or physical attributes missing for index ${index}`);
                    return;
                }
                characters[index].physicalAttributes.build = this.value;
            });
        }
        
        // Initialize checkbox states with delay to ensure DOM is ready
        setTimeout(() => {
            // FIXED: Re-fetch characters from global scope and validate before use
            const currentCharacters = window.characters || characters;
            if (currentCharacters && currentCharacters[index]) {
                EventHandlers.updateCheckboxStates(index, 'personalityTags', 6, currentCharacters);
                EventHandlers.updateCheckboxStates(index, 'inventory', 3, currentCharacters);
                EventHandlers.updateCheckboxStates(index, 'deskItems', 2, currentCharacters);
            }
        }, 100);
    }

    /**
     * Setup custom portrait upload handler (FIXED with null checks)
     */
    static setupCustomPortraitHandler(index, characters) {
        const uploadInput = document.getElementById(`custom-portrait-${index}`);
        if (uploadInput) {
            uploadInput.addEventListener('change', function(event) {
                if (!characters[index]) {
                    console.error(`❌ Character missing for index ${index}`);
                    return;
                }
                
                const file = event.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = new Image();
                        img.onload = function() {
                            EventHandlers.drawCustomPortrait(index, img, characters);
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    /**
     * Draw custom portrait on canvas (FIXED with null checks)
     */
    static drawCustomPortrait(index, img, characters) {
        if (!characters[index]) {
            console.error(`❌ Character missing for index ${index}`);
            return;
        }
        
        const canvas = document.getElementById(`custom-canvas-${index}`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Calculate scaling to fit image
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (canvas.width - scaledWidth) / 2;
            const y = (canvas.height - scaledHeight) / 2;
            
            // Draw image
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            // Store canvas data
            characters[index].customPortrait = canvas.toDataURL();
        }
    }

    /**
     * Clear custom portrait (FIXED with null checks)
     */
    static clearCustomPortrait(index, characters) {
        if (!characters || !characters[index]) {
            console.error(`❌ Character missing for index ${index}`);
            return;
        }
        
        const canvas = document.getElementById(`custom-canvas-${index}`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6c757d';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No Custom', canvas.width / 2, canvas.height / 2);
        }
        
        // Clear from character data
        characters[index].customPortrait = null;
    }

    /**
     * Update checkbox states - grey out when max reached (FIXED with null checks)
     */
    static updateCheckboxStates(index, itemType, maxLimit, characters) {
        // FIXED: Validate all parameters
        if (!characters || !characters[index] || typeof index !== 'number' || index < 0) {
            console.error(`❌ Invalid parameters for updateCheckboxStates:`, { index, characters: !!characters, itemType });
            return;
        }
        
        let prefix, selectedCount;
        
        if (itemType === 'personalityTags') {
            prefix = 'tags';
            selectedCount = characters[index].personalityTags ? characters[index].personalityTags.length : 0;
        } else if (itemType === 'inventory') {
            prefix = 'inventory-item';
            selectedCount = characters[index].inventory ? characters[index].inventory.length : 0;
        } else if (itemType === 'deskItems') {
            prefix = 'desk-item';
            selectedCount = characters[index].deskItems ? characters[index].deskItems.length : 0;
        } else {
            console.error(`❌ Invalid itemType: ${itemType}`);
            return;
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
     * Update character tags with limit enforcement (FIXED with null checks)
     */
    static updateCharacterTags(index, tagType, maxLimit, characters) {
        // FIXED: Validate all parameters
        if (!characters || !characters[index] || typeof index !== 'number' || index < 0) {
            console.error(`❌ Invalid parameters for updateCharacterTags:`, { index, characters: !!characters, tagType });
            return;
        }
        
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
            }
        }
        
        // FIXED: Ensure the array exists before assignment
        if (!characters[index][tagType]) {
            characters[index][tagType] = [];
        }
        characters[index][tagType] = selectedTags;
    }

    /**
     * Update character items with limit enforcement (FIXED with null checks)
     */
    static updateCharacterItems(index, itemType, maxLimit, characters) {
        // FIXED: Validate all parameters
        if (!characters || !characters[index] || typeof index !== 'number' || index < 0) {
            console.error(`❌ Invalid parameters for updateCharacterItems:`, { index, characters: !!characters, itemType });
            return;
        }
        
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
        
        // FIXED: Ensure the array exists before assignment
        if (!characters[index][itemType]) {
            characters[index][itemType] = [];
        }
        characters[index][itemType] = selectedItems;
    }
}

export { EventHandlers };

console.log('📦 Event Handlers Module loaded - PHASE 3 FIXED');
