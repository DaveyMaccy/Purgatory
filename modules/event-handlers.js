/**
 * Event Handlers Module - BULLETPROOF VERSION
 * All event handlers now use the shield system
 */

import { UIGenerator } from './ui-generator.js';
import { SpriteManager } from './sprite-manager.js';
import { ValidationUtils } from './validation-utils.js';
import { EventHandlerShield } from './event-handler-shield.js';
import { 
    PERSONALITY_TAGS, 
    INVENTORY_OPTIONS, 
    DESK_ITEM_OPTIONS,
    generateNameByGender 
} from './character-data.js';

class EventHandlers {
    /**
     * Setup bulletproof event listeners
     */
    static setupPanelEventListeners(index, characters, globalAPIKey) {
        // Ensure characters array exists
        if (!window.characters) {
            window.characters = characters || [];
        }
        
        // BULLETPROOF: Player character checkbox
        const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
        if (isPlayerCheckbox) {
            isPlayerCheckbox.addEventListener('change', function() {
                EventHandlerShield.safePlayerCheckboxHandler(index, this);
            });
        }

        // Name generation button
        const generateNameBtn = document.getElementById(`generate-name-${index}`);
        if (generateNameBtn) {
            generateNameBtn.addEventListener('click', function() {
                const characters = window.characters || [];
                if (characters[index]) {
                    const gender = characters[index].physicalAttributes?.gender || 'Male';
                    const newName = generateNameByGender(gender);
                    characters[index].name = newName;
                    const nameInput = document.getElementById(`name-${index}`);
                    if (nameInput) nameInput.value = newName;
                    window.characters = characters;
                }
            });
        }

        // Gender change
        const genderSelect = document.getElementById(`gender-${index}`);
        if (genderSelect) {
            genderSelect.addEventListener('change', function() {
                const characters = window.characters || [];
                if (characters[index]) {
                    characters[index].physicalAttributes.gender = this.value;
                    const newName = generateNameByGender(this.value);
                    characters[index].name = newName;
                    const nameInput = document.getElementById(`name-${index}`);
                    if (nameInput) nameInput.value = newName;
                    window.characters = characters;
                }
            });
        }

        // Sprite navigation
        const prevBtn = document.getElementById(`sprite-prev-${index}`);
        const nextBtn = document.getElementById(`sprite-next-${index}`);
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => EventHandlers.navigateSprite(index, -1));
            nextBtn.addEventListener('click', () => EventHandlers.navigateSprite(index, 1));
        }

        // Custom portrait upload
        const portraitUpload = document.getElementById(`portrait-upload-${index}`);
        if (portraitUpload) {
            portraitUpload.addEventListener('change', function(e) {
                EventHandlers.handleCustomPortraitUpload(index, e.target.files[0]);
            });
        }

        // Clear custom portrait
        const clearCustomBtn = document.getElementById(`clear-custom-${index}`);
        if (clearCustomBtn) {
            clearCustomBtn.addEventListener('click', () => EventHandlers.clearCustomPortrait(index));
        }

        // Physical attribute sliders
        ['age', 'height', 'weight', 'looks'].forEach(attr => {
            const slider = document.getElementById(`${attr}-${index}`);
            const valueLabel = document.getElementById(`${attr}-val-${index}`);
            if (slider && valueLabel) {
                slider.addEventListener('input', function() {
                    const characters = window.characters || [];
                    if (characters[index]) {
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
                        window.characters = characters;
                    }
                });
            }
        });

        // Skill sliders
        ['competence', 'laziness', 'charisma', 'leadership'].forEach(skill => {
            const slider = document.getElementById(`${skill}-${index}`);
            const valueLabel = document.getElementById(`${skill}-val-${index}`);
            if (slider && valueLabel) {
                slider.addEventListener('input', function() {
                    const characters = window.characters || [];
                    if (characters[index]) {
                        const value = parseInt(this.value);
                        characters[index].skills[skill] = value;
                        valueLabel.textContent = `${value}/10`;
                        window.characters = characters;
                    }
                });
            }
        });

        // BULLETPROOF: Personality tags with shield
        PERSONALITY_TAGS.forEach(tag => {
            const checkbox = document.getElementById(`tags-${index}-${tag}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlerShield.safeUpdateCharacterData(index, 'personalityTags');
                    EventHandlerShield.safeUpdateCheckboxStates(index, 'personalityTags', 6);
                });
            }
        });

        // BULLETPROOF: Inventory items with shield
        INVENTORY_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`inventory-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlerShield.safeUpdateCharacterData(index, 'inventory');
                    EventHandlerShield.safeUpdateCheckboxStates(index, 'inventory', 3);
                });
            }
        });

        // BULLETPROOF: Desk items with shield
        DESK_ITEM_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`desk-item-${index}-${item}`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    EventHandlerShield.safeUpdateCharacterData(index, 'deskItems');
                    EventHandlerShield.safeUpdateCheckboxStates(index, 'deskItems', 2);
                });
            }
        });
        
        // Basic form handlers
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        if (jobRoleSelect) {
            jobRoleSelect.addEventListener('change', function() {
                const characters = window.characters || [];
                if (characters[index]) {
                    characters[index].jobRole = this.value;
                    window.characters = characters;
                }
            });
        }
        
        const buildSelect = document.getElementById(`build-${index}`);
        if (buildSelect) {
            buildSelect.addEventListener('change', function() {
                const characters = window.characters || [];
                if (characters[index]) {
                    characters[index].physicalAttributes.build = this.value;
                    window.characters = characters;
                }
            });
        }
        
        // Initialize checkbox states with delay
        setTimeout(() => {
            EventHandlerShield.safeUpdateCheckboxStates(index, 'personalityTags', 6);
            EventHandlerShield.safeUpdateCheckboxStates(index, 'inventory', 3);
            EventHandlerShield.safeUpdateCheckboxStates(index, 'deskItems', 2);
        }, 100);
    }

    /**
     * Navigate through sprites
     */
    static navigateSprite(index, direction) {
        const characters = window.characters || [];
        if (!characters[index]) return;
        
        const character = characters[index];
        let newSpriteIndex = (character.spriteIndex || 0) + direction;
        
        import('./character-data.js').then(({ SPRITE_OPTIONS }) => {
            if (newSpriteIndex < 0) newSpriteIndex = SPRITE_OPTIONS.length - 1;
            if (newSpriteIndex >= SPRITE_OPTIONS.length) newSpriteIndex = 0;
            
            character.spriteIndex = newSpriteIndex;
            character.spriteSheet = SPRITE_OPTIONS[newSpriteIndex];
            
            SpriteManager.updateCharacterPortrait(index, character.spriteSheet);
            EventHandlers.updateSpriteInfo(index);
            
            window.characters = characters;
        });
    }

    /**
     * Update sprite info display
     */
    static updateSpriteInfo(index) {
        const spriteInfo = document.getElementById(`sprite-info-${index}`);
        if (spriteInfo) {
            import('./character-data.js').then(({ SPRITE_OPTIONS }) => {
                const characters = window.characters || [];
                const spriteIndex = characters[index]?.spriteIndex || 0;
                spriteInfo.textContent = `Sprite ${spriteIndex + 1} of ${SPRITE_OPTIONS.length}`;
            });
        }
    }

    /**
     * Handle custom portrait upload
     */
    static handleCustomPortraitUpload(index, file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.getElementById(`custom-canvas-${index}`);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
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
                    
                    const characters = window.characters || [];
                    if (characters[index]) {
                        characters[index].customPortrait = canvas.toDataURL();
                        window.characters = characters;
                    }
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Clear custom portrait
     */
    static clearCustomPortrait(index) {
        const characters = window.characters || [];
        if (characters[index]) {
            characters[index].customPortrait = null;
            window.characters = characters;
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
    }

    // Legacy methods for compatibility
    static updateCharacterTags(index, tagType, maxLimit, characters) {
        EventHandlerShield.safeUpdateCharacterData(index, tagType);
        EventHandlerShield.safeUpdateCheckboxStates(index, tagType, maxLimit);
    }

    static updateCharacterItems(index, itemType, maxLimit, characters) {
        EventHandlerShield.safeUpdateCharacterData(index, itemType);
        EventHandlerShield.safeUpdateCheckboxStates(index, itemType, maxLimit);
    }

    static updateCheckboxStates(index, itemType, maxLimit, characters) {
        EventHandlerShield.safeUpdateCheckboxStates(index, itemType, maxLimit);
    }
}

export { EventHandlers };
