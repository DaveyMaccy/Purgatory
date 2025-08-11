/**
 * Enhanced Renderer Debug Utilities
 * Include this script in your HTML to add debugging capabilities to the browser console.
 */

// Add debug functions to window for easy console access
window.debugRenderer = {
    
    /**
     * Checks the overall status of the renderer via the global window.game object.
     * @returns {Object|null} The status object from the renderer or null if not found.
     */
    status() {
        if (!window.game?.renderer) {
            console.log('❌ Renderer not found at window.game.renderer. Is the game running?');
            return null;
        }
        
        const status = window.game.renderer.getStatus();
        console.log('🎨 Renderer Status:', status);
        console.table(status.preloadedTextures);
        return status;
    },
    
    /**
     * Checks the PIXI texture cache to see what has been loaded.
     * @returns {Object|null} An object with cached texture info or null if renderer not found.
     */
    textures() {
        if (!window.game?.renderer) {
            console.log('❌ Renderer not found. Is the game running?');
            return null;
        }
        
        const cache = window.game.renderer.getTextureCacheStatus();
        console.log('📦 Texture Cache:', cache);
        console.table(cache);
        return cache;
    },
    
    /**
     * Tests loading a single sprite texture by its index number.
     * This helps diagnose issues with file paths or loading errors.
     * @param {number} [index=1] - The character sprite index to test (e.g., 1 for character-01.png).
     */
    async testSprite(index = 1) {
        const spritePath = `assets/characters/character-${index.toString().padStart(2, '0')}.png`;
        console.log(`🧪 Testing sprite: ${spritePath}`);
        
        try {
            const response = await fetch(spritePath);
            if (response.ok) {
                console.log(`✅ HTTP OK (${response.status}) for ${spritePath}`);
                
                if (window.game?.renderer) {
                    try {
                        // Use the renderer's internal loading method to check the full pipeline
                        const texture = await window.game.renderer.loadSpriteTexture(spritePath);
                        console.log('✅ PIXI texture loaded successfully:', texture.width + 'x' + texture.height);
                    } catch (pixiError) {
                        console.error('❌ PIXI failed to load texture:', pixiError);
                    }
                } else {
                    console.warn('⚠️ Renderer not available to test PIXI loading.');
                }
            } else {
                console.error(`❌ HTTP request failed with status: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Network request failed. Check browser console network tab and CORS policy.', error);
        }
    },
    
    /**
     * Runs a quick test on the first 5 character sprites to check for common loading issues.
     */
    async testAll() {
        console.log('🧪 Testing first 5 character sprites...');
        for (let i = 1; i <= 5; i++) {
            await this.testSprite(i);
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between requests
        }
        console.log('✅ Sprite test complete.');
    }
};

// Log instructions to the console so the user knows the tool is available.
console.log('---');
console.log('🔍 Renderer Debug Utilities Loaded. Use the following commands in the console:');
console.log('%c   debugRenderer.status()', 'font-weight: bold;', '- Check renderer status and preloaded textures.');
console.log('%c   debugRenderer.textures()', 'font-weight: bold;', '- Check the PIXI texture cache.');
console.log('%c   debugRenderer.testSprite(1)', 'font-weight: bold;', '- Test loading a specific sprite (e.g., character-01.png).');
console.log('%c   debugRenderer.testAll()', 'font-weight: bold;', '- Test loading the first 5 character sprites.');
console.log('---');
