/**
 * Sprite Manager Module
 * 
 * Handles all sprite-related functionality including navigation,
 * portrait generation, custom uploads, and sprite rendering.
 */

import { SPRITE_OPTIONS } from './character-data.js';
import { UIGenerator } from './ui-generator.js';

class SpriteManager {
    /**
     * Navigate through available sprites
     */
    static navigateSprite(index, direction, characters) {
        if (!characters || !characters[index]) return;
        
        const currentSprite = characters[index].spriteSheet;
        const currentSpriteIndex = SPRITE_OPTIONS.indexOf(currentSprite);
        
        let newIndex = currentSpriteIndex + direction;
        
        // Wrap around the sprite options
        if (newIndex < 0) {
            newIndex = SPRITE_OPTIONS.length - 1;
        } else if (newIndex >= SPRITE_OPTIONS.length) {
            newIndex = 0;
        }
        
        const newSprite = SPRITE_OPTIONS[newIndex];
        characters[index].spriteSheet = newSprite;
        
        // Update portrait and sprite info
        this.updateCharacterPortrait(index, newSprite);
        
        console.log(`🔄 Character ${index + 1} sprite changed to: ${newSprite}`);
    }
    
    /**
     * Update character portrait from sprite sheet
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
                const spriteIndex = 3; // Fourth sprite (idle pose)
                const sourceX = spriteIndex * spriteWidth;
                const sourceY = 0; // First row
                
                // Draw the specific sprite frame, scaled to fit canvas
                ctx.drawImage(
                    img,
                    sourceX, sourceY, spriteWidth, spriteHeight, // Source rectangle
                    0, 0, canvas.width, canvas.height // Destination rectangle
                );
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
        this.updateSpriteInfo(index);
    }
    
    /**
     * Draw placeholder portrait
     */
    static drawPlaceholderPortrait(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw placeholder background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw placeholder figure
        ctx.fillStyle = '#ccc';
        
        // Head
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height * 0.25, canvas.width * 0.15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Body
        ctx.fillRect(
            canvas.width * 0.35, 
            canvas.height * 0.35, 
            canvas.width * 0.3, 
            canvas.height * 0.5
        );
        
        // Text
        ctx.fillStyle = '#999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No Sprite', canvas.width / 2, canvas.height * 0.9);
    }
    
    /**
     * Update sprite information display
     */
    static updateSpriteInfo(index) {
        const spriteInfo = document.getElementById(`sprite-info-${index}`);
        if (!spriteInfo) return;
        
        const spriteFileName = window.characters?.[index]?.spriteSheet;
        if (spriteFileName) {
            const fileName = spriteFileName.split('/').pop();
            const spriteNumber = fileName.replace('character-', '').replace('.png', '');
            spriteInfo.textContent = `Sprite ${spriteNumber}`;
        } else {
            spriteInfo.textContent = `Character ${index + 1}`;
        }
    }
    
    /**
     * Handle custom portrait upload
     */
    static handleCustomPortraitUpload(index, file, characters) {
        if (!file || !characters || !characters[index]) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            UIGenerator.showError('Please select a valid image file');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            UIGenerator.showError('Image file too large. Please select a file smaller than 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Create a temporary canvas for cropping
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                // Calculate square crop dimensions
                const size = Math.min(img.width, img.height);
                const offsetX = (img.width - size) / 2;
                const offsetY = (img.height - size) / 2;
                
                // Set canvas size to match preview canvas
                tempCanvas.width = 96;
                tempCanvas.height = 128;
                
                // Draw cropped and scaled image
                tempCtx.drawImage(
                    img,
                    offsetX, offsetY, size, size, // Source rectangle (square crop)
                    0, 0, 96, 96 // Destination rectangle (top part of canvas)
                );
                
                // Store as custom portrait
                const portraitData = tempCanvas.toDataURL('image/jpeg', 0.8);
                characters[index].customPortrait = portraitData;
                
                // Update the preview canvas
                SpriteManager.displayCustomPortrait(index, portraitData);
                
                UIGenerator.showSuccess('Custom portrait uploaded successfully');
            };
            
            img.onerror = function() {
                UIGenerator.showError('Failed to load image. Please try a different file');
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            UIGenerator.showError('Failed to read file. Please try again');
        };
        
        reader.readAsDataURL(file);
    }
    
    /**
     * Display custom portrait on canvas
     */
    static displayCustomPortrait(index, portraitData) {
        const canvas = document.getElementById(`preview-canvas-${index}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        
        img.src = portraitData;
    }
    
    /**
     * Clear custom portrait
     */
    static clearCustomPortrait(index, characters) {
        if (!characters || !characters[index]) return;
        
        characters[index].customPortrait = null;
        
        // Clear the file input
        const fileInput = document.getElementById(`portrait-upload-${index}`);
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Restore original sprite portrait
        this.updateCharacterPortrait(index, characters[index].spriteSheet);
        
        UIGenerator.showSuccess('Custom portrait cleared');
    }
    
    /**
     * Get portrait data for character (custom or generated)
     */
    static getCharacterPortrait(index, characters) {
        if (!characters || !characters[index]) return null;
        
        const character = characters[index];
        
        // Return custom portrait if available
        if (character.customPortrait) {
            return character.customPortrait;
        }
        
        // Generate portrait from sprite sheet
        if (character.spriteSheet) {
            return this.generatePortraitFromSprite(character.spriteSheet);
        }
        
        return null;
    }
    
    /**
     * Generate portrait data from sprite sheet
     */
    static generatePortraitFromSprite(spritePath) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 96;
            canvas.height = 128;
            
            const img = new Image();
            img.onload = function() {
                // Extract 4th sprite from first row
                const spriteWidth = 48;
                const spriteHeight = 96;
                const spriteIndex = 3;
                const sourceX = spriteIndex * spriteWidth;
                const sourceY = 0;
                
                ctx.drawImage(
                    img,
                    sourceX, sourceY, spriteWidth, spriteHeight,
                    0, 0, canvas.width, canvas.height
                );
                
                resolve(canvas.toDataURL());
            };
            
            img.onerror = () => reject(new Error('Failed to load sprite'));
            img.src = spritePath;
        });
    }
    
    /**
     * Validate sprite path
     */
    static isValidSpritePath(spritePath) {
        return SPRITE_OPTIONS.includes(spritePath);
    }
    
    /**
     * Get sprite index from path
     */
    static getSpriteIndex(spritePath) {
        return SPRITE_OPTIONS.indexOf(spritePath);
    }
    
    /**
     * Get sprite path from index
     */
    static getSpriteFromIndex(index) {
        if (index >= 0 && index < SPRITE_OPTIONS.length) {
            return SPRITE_OPTIONS[index];
        }
        return SPRITE_OPTIONS[0]; // Default to first sprite
    }
    
    /**
     * Preload all sprite images for better performance
     */
    static preloadSprites() {
        return Promise.all(
            SPRITE_OPTIONS.map(spritePath => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(spritePath);
                    img.onerror = () => reject(new Error(`Failed to load ${spritePath}`));
                    img.src = spritePath;
                });
            })
        );
    }
    
    /**
     * Create sprite preview thumbnail
     */
    static createSpriteThumb(spritePath, size = 48) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size * 2; // 2:1 ratio for character sprites
        
        const img = new Image();
        img.onload = function() {
            // Extract 4th sprite from first row
            const spriteWidth = 48;
            const spriteHeight = 96;
            const spriteIndex = 3;
            const sourceX = spriteIndex * spriteWidth;
            const sourceY = 0;
            
            ctx.drawImage(
                img,
                sourceX, sourceY, spriteWidth, spriteHeight,
                0, 0, canvas.width, canvas.height
            );
        };
        
        img.src = spritePath;
        return canvas;
    }
    
    /**
     * Export character portraits as a batch
     */
    static async exportAllPortraits(characters) {
        const portraits = {};
        
        for (let i = 0; i < characters.length; i++) {
            const character = characters[i];
            try {
                if (character.customPortrait) {
                    portraits[character.id] = character.customPortrait;
                } else if (character.spriteSheet) {
                    portraits[character.id] = await this.generatePortraitFromSprite(character.spriteSheet);
                }
            } catch (error) {
                console.warn(`Failed to export portrait for character ${i}:`, error);
            }
        }
        
        return portraits;
    }
    
    /**
     * Apply color filters to sprite (for future color customization)
     */
    static applyColorFilters(canvas, colors) {
        if (!colors) return;
        
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // This is a placeholder for color filtering logic
        // Could be expanded in Phase 2 for full customization
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Get available sprite count
     */
    static getSpriteCount() {
        return SPRITE_OPTIONS.length;
    }
    
    /**
     * Get sprite filename without path
     */
    static getSpriteFilename(spritePath) {
        return spritePath.split('/').pop();
    }
    
    /**
     * Initialize sprite manager
     */
    static initialize() {
        console.log(`🎨 Sprite Manager initialized with ${SPRITE_OPTIONS.length} sprites`);
        
        // Preload sprites in background for better performance
        this.preloadSprites()
            .then(() => console.log('✅ All sprites preloaded'))
            .catch(error => console.warn('⚠️ Some sprites failed to preload:', error));
    }
}

export { SpriteManager };

console.log('🖼️ Sprite Manager Module loaded');
