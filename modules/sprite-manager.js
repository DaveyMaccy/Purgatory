/**
 * Sprite Manager Module - PHASE 3 COMPLETE ENHANCEMENT
 * 
 * Handles all sprite-related operations including navigation, portrait generation,
 * and custom portrait uploads. Matches monolithic implementation exactly.
 */

import { SPRITE_OPTIONS } from './character-data.js';

class SpriteManager {
    /**
     * Navigate through sprites with arrows - matches monolithic exactly
     */
    static navigateSprite(index, direction, characters) {
        const character = characters[index];
        let newSpriteIndex = (character.spriteIndex || 0) + direction;
        
        // Wrap around
        if (newSpriteIndex < 0) newSpriteIndex = SPRITE_OPTIONS.length - 1;
        if (newSpriteIndex >= SPRITE_OPTIONS.length) newSpriteIndex = 0;
        
        character.spriteIndex = newSpriteIndex;
        character.spriteSheet = SPRITE_OPTIONS[newSpriteIndex];
        
        // Update portrait and info
        this.updateCharacterPortrait(index, character.spriteSheet);
        this.updateSpriteInfo(index, characters);
    }
    
    /**
     * Update sprite info display - matches monolithic exactly
     */
    static updateSpriteInfo(index, characters = null) {
        const spriteInfo = document.getElementById(`sprite-info-${index}`);
        if (spriteInfo) {
            // Get characters from window if not passed
            const charactersArray = characters || window.characters || [];
            const spriteIndex = charactersArray[index]?.spriteIndex || 0;
            spriteInfo.textContent = `Sprite ${spriteIndex + 1} of ${SPRITE_OPTIONS.length}`;
        }
    }
    
    /**
     * Handle custom portrait upload - matches monolithic exactly
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
     * Clear custom portrait - matches monolithic exactly
     */
    static clearCustomPortrait(index, characters) {
        if (characters && characters[index]) {
            characters[index].customPortrait = null;
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
    
    /**
     * Update character portrait - Extract 4th sprite from first row - matches monolithic exactly
     */
    static updateCharacterPortrait(index, spritePath) {
        const canvas = document.getElementById(`preview-canvas-${index}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (spritePath) {
            const img = new Image();
            img.onload = function() {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Extract 4th sprite from first row (index 3, since 0-based)
                const spriteWidth = 48;
                const spriteHeight = 96;
                const spriteIndex = 3; // Fourth sprite (0-based index)
                const sourceX = spriteIndex * spriteWidth;
                const sourceY = 0; // First row
                
                // Draw the specific sprite frame, scaled to fit canvas
                ctx.drawImage(
                    img,
                    sourceX, sourceY, spriteWidth, spriteHeight, // Source rectangle
                    0, 0, canvas.width, canvas.height // Destination rectangle
                );
                
                // Store as portrait data
                if (window.characters && window.characters[index]) {
                    window.characters[index].portrait = canvas.toDataURL();
                }
            };
            
            img.onerror = function() {
                // Fallback: draw placeholder
                SpriteManager.drawPlaceholderPortrait(ctx, canvas);
            };
            
            img.src = spritePath;
        } else {
            // Draw placeholder when no sprite
            this.drawPlaceholderPortrait(ctx, canvas);
        }
        
        // Update sprite info
        this.updateSpriteInfo(index, null);
    }
    
    /**
     * Draw placeholder portrait - matches monolithic exactly
     */
    static drawPlaceholderPortrait(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Portrait', canvas.width / 2, canvas.height / 2 + 4);
    }
    
    /**
     * Initialize portrait canvases for a character
     */
    static initializePortraitCanvases(index) {
        // Initialize main portrait canvas
        const mainCanvas = document.getElementById(`preview-canvas-${index}`);
        if (mainCanvas) {
            this.drawPlaceholderPortrait(mainCanvas.getContext('2d'), mainCanvas);
        }
        
        // Initialize custom portrait canvas
        this.clearCustomPortrait(index, null);
    }
    
    /**
     * Get character portrait (custom takes priority)
     */
    static getCharacterPortrait(character) {
        return character.customPortrait || character.portrait || null;
    }
    
    /**
     * Validate sprite index
     */
    static validateSpriteIndex(spriteIndex) {
        if (typeof spriteIndex !== 'number') return 0;
        if (spriteIndex < 0) return 0;
        if (spriteIndex >= SPRITE_OPTIONS.length) return 0;
        return spriteIndex;
    }
    
    /**
     * Get sprite path by index
     */
    static getSpritePathByIndex(spriteIndex) {
        const validIndex = this.validateSpriteIndex(spriteIndex);
        return SPRITE_OPTIONS[validIndex];
    }
    
    /**
     * Legacy method for backward compatibility
     */
    static updatePortrait(index, spritePath) {
        return this.updateCharacterPortrait(index, spritePath);
    }
}

export { SpriteManager };

console.log('📦 Sprite Manager Module loaded - PHASE 3 COMPLETE ENHANCEMENT');
