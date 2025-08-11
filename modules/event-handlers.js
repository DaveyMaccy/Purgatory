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
            const checkbox = document.getElementById(`inventory-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlers.updateCharacterItems(index, 'inventory', 3, characters);
                    EventHandlers.updateCheckboxStates(index, 'inventory', 3, characters);
                });
            }
        });

        // Desk items (max 2) with greying out (EXACT from Phase-3)
        DESK_ITEM_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`desk-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlers.updateCharacterItems(index, 'deskItems', 2, characters);
                    EventHandlers.updateCheckboxStates(index, 'deskItems', 2, characters);
                });
            }
        });
        
        // API key handler
        const apiKeyInput = document.getElementById(`api-key-input-${index}`);
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', function() {
                characters[index].apiKey = this.value;
            });
        }

        // Basic form handlers
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        if (jobRoleSelect) {
            jobRoleSelect.addEventListener('change', function() {
                characters[index].jobRole = this.value;
            });
        }
        
        const buildSelect = document.getElementById(`build-${index}`);
        if (buildSelect) {
            buildSelect.addEventListener('change', function() {
                characters[index].physicalAttributes.build = this.value;
            });
        }
        
        // Initialize checkbox states
        setTimeout(() => {
            // FIX: Re-fetch characters from global scope to get the latest version,
            // avoiding the race condition during initial setup.
            const currentCharacters = window.characters || [];
            if (!currentCharacters[index]) return; // Safety check in case character was removed

            EventHandlers.updateCheckboxStates(index, 'personalityTags', 6, currentCharacters);
            EventHandlers.updateCheckboxStates(index, 'inventory', 3, currentCharacters);
            EventHandlers.updateCheckboxStates(index, 'deskItems', 2, currentCharacters);
        }, 50);
    }

    /**
     * Navigate through sprites with arrows (EXACT from Phase-3)
     */
    static navigateSprite(index, direction, characters) {
        const character = characters[index];
        let newSpriteIndex = (character.spriteIndex || 0) + direction;
        
        // Import SPRITE_OPTIONS dynamically if needed
        import('./character-data.js').then(({ SPRITE_OPTIONS }) => {
            // Wrap around
            if (newSpriteIndex < 0) newSpriteIndex = SPRITE_OPTIONS.length - 1;
            if (newSpriteIndex >= SPRITE_OPTIONS.length) newSpriteIndex = 0;
            
            character.spriteIndex = newSpriteIndex;
            character.spriteSheet = SPRITE_OPTIONS[newSpriteIndex];
            
            // Update portrait and info
            SpriteManager.updateCharacterPortrait(index, character.spriteSheet);
            EventHandlers.updateSpriteInfo(index, characters);
        });
    }

    /**
     * Update sprite info display (EXACT from Phase-3)
     */
    static updateSpriteInfo(index, characters) {
        const spriteInfo = document.getElementById(`sprite-info-${index}`);
        if (spriteInfo) {
            import('./character-data.js').then(({ SPRITE_OPTIONS }) => {
                const spriteIndex = characters[index].spriteIndex || 0;
                spriteInfo.textContent = `Sprite ${spriteIndex + 1} of ${SPRITE_OPTIONS.length}`;
            });
        }
    }

    /**
     * Handle custom portrait upload (EXACT from Phase-3)
     */
    static handleCustomPortraitUpload(index, file, characters) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.getElementById(`custom-canvas-${index}`);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw image scaled to fit
                    const aspectRatio = img.width / img.height;
                    let drawWidth = canvas.width;
                    let drawHeight = canvas.height;
                    
                    if (aspectRatio > 1) {
                        drawHeight = canvas.width / aspectRatio;
                    } else {
                        drawWidth = canvas.height * aspectRatio;
                    }
                    
                    const x = (canvas.width - drawWidth) / 2;
                    const y = (canvas.height - drawHeight) / 2;
                    
                    ctx.drawImage(img, x, y, drawWidth, drawHeight);
                    
                    // Store custom portrait
                    characters[index].customPortrait = canvas.toDataURL();
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Clear custom portrait (EXACT from Phase-3)
     */
    static clearCustomPortrait(index) {
        const characters = window.characters || [];
        characters[index].customPortrait = null;
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
    }

    /**
     * Update checkbox states - grey out when max reached (EXACT from Phase-3)
     */
    static updateCheckboxStates(index, itemType, maxLimit, characters) {
        let prefix, selectedCount;
        
        if (itemType === 'personalityTags') {
            prefix = 'tags';
            selectedCount = characters[index].personalityTags.length;
        } else if (itemType === 'inventory') {
            prefix = 'inventory-item';
            selectedCount = characters[index].inventory.length;
        } else if (itemType === 'deskItems') {
            prefix = 'desk-item';
            selectedCount = characters[index].deskItems.length;
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
     * Update character tags with limit enforcement (EXACT from Phase-3)
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
     * Update character items with limit enforcement (EXACT from Phase-3)
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
}

export { EventHandlers };
