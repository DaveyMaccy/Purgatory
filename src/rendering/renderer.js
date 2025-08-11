/**
 * ENHANCED: Complete Rendering System with Sprite Preloading
 *
 * This file handles all visual rendering for the game world with proper dimensions,
 * enhanced sprite preloading, texture caching, and better error handling.
 * 
 * PRESERVES ALL EXISTING FEATURES:
 * - 16:9 aspect ratio and responsive canvas
 * - Map rendering with office layout
 * - Character positioning and sprite management
 * - Resize handling and cleanup
 * - Debug utilities and status checking
 * 
 * ADDS NEW FEATURES:
 * - Sprite texture preloading system
 * - Texture caching for better performance
 * - Enhanced error handling for asset loading
 * - Better fallback mechanisms
 */

export class Renderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.app = null;
        this.worldContainer = null;
        this.characterSprites = new Map(); // Map character IDs to sprites
        this.preloadedTextures = new Map(); // NEW: Cache for loaded textures
        this.mapSprites = [];
        this.isInitialized = false;

        // PRESERVED: 16:9 aspect ratio constants
        this.TILE_SIZE = 48;
        this.CHARACTER_WIDTH = 48;
        this.CHARACTER_HEIGHT = 96; // Characters are 48x96 (2 tiles tall)

        // PRESERVED: 16:9 aspect ratio dimensions
        this.BASE_WIDTH = 1280;
        this.BASE_HEIGHT = 720;

        // Current render dimensions (will be calculated)
        this.WORLD_WIDTH = this.BASE_WIDTH;
        this.WORLD_HEIGHT = this.BASE_HEIGHT;

        console.log('🎨 Enhanced Renderer constructor with sprite preloading support');
    }

    /**
     * NEW: Preload all character sprite textures for better performance
     */
    async preloadCharacterSprites() {
        console.log('🔄 Preloading character sprite textures...');
        
        const spritePromises = [];
        
        // Generate sprite paths (matches character-data.js - first 25 sprites)
        for (let i = 1; i <= 25; i++) {
            const paddedNumber = i.toString().padStart(2, '0');
            const spritePath = `assets/characters/character-${paddedNumber}.png`;
            
            const promise = this.loadSpriteTexture(spritePath).catch(error => {
                console.warn(`⚠️ Failed to preload sprite: ${spritePath}`, error);
                return null; // Continue with other sprites
            });
            
            spritePromises.push(promise);
        }
        
        const results = await Promise.allSettled(spritePromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        console.log(`✅ Preloaded ${successCount}/25 character sprites`);
        return successCount;
    }

    /**
     * NEW: Load a single sprite texture with caching
     */
    async loadSpriteTexture(spritePath) {
        // Check if already loaded
        if (this.preloadedTextures.has(spritePath)) {
            return this.preloadedTextures.get(spritePath);
        }
        
        try {
            const texture = await PIXI.Texture.fromURL(spritePath);
            
            // Validate texture is actually loaded
            if (texture && texture.valid && texture.width > 0 && texture.height > 0) {
                this.preloadedTextures.set(spritePath, texture);
                console.log(`📦 Cached texture: ${spritePath} (${texture.width}x${texture.height})`);
                return texture;
            } else {
                throw new Error('Invalid texture dimensions or failed to load');
            }
        } catch (error) {
            console.error(`❌ Failed to load texture: ${spritePath}`, error);
            throw error;
        }
    }

    /**
     * ENHANCED: Initialize PixiJS application with sprite preloading
     */
    async initialize(mapData) {
        try {
            console.log('🔧 Initializing enhanced PixiJS renderer with sprite preloading...');

            // PRESERVED: Validate container exists before proceeding
            if (!this.container) {
                throw new Error('Container element is required for renderer initialization');
            }

            // PRESERVED: Calculate optimal canvas size for container
            this.calculateCanvasSize();

            // PRESERVED: Create PixiJS application with calculated dimensions
            this.app = new PIXI.Application({
                width: this.WORLD_WIDTH,
                height: this.WORLD_HEIGHT,
                backgroundColor: 0x2c3e50,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });

            // PRESERVED: Make canvas responsive and centered
            this.setupResponsiveCanvas();

            // PRESERVED: Add canvas to container
            this.container.appendChild(this.app.view);

            // PRESERVED: Create world container for all game objects
            this.worldContainer = new PIXI.Container();
            this.app.stage.addChild(this.worldContainer);

            // PRESERVED: Create layers in proper order (bottom to top)
            this.mapLayer = new PIXI.Container();
            this.characterLayer = new PIXI.Container();

            this.worldContainer.addChild(this.mapLayer);
            this.worldContainer.addChild(this.characterLayer);

            // PRESERVED: Add resize listener for responsive behavior
            this.setupResizeListener();

            // NEW: Preload sprites BEFORE rendering anything
            const preloadedCount = await this.preloadCharacterSprites();
            console.log(`🎮 Sprite preloading complete: ${preloadedCount} textures cached`);

            // PRESERVED: Render the map if provided
            if (mapData) {
                this.renderMap(mapData);
            }

            this.isInitialized = true;
            console.log(`✅ Enhanced PixiJS renderer initialized: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT} (16:9)`);

        } catch (error) {
            console.error('❌ Failed to initialize enhanced renderer:', error);
            throw error;
        }
    }

    /**
     * PRESERVED: Calculate optimal canvas size maintaining 16:9 aspect ratio with better fallbacks
     */
    calculateCanvasSize() {
        // PRESERVED: Better error handling for missing container
        if (!this.container) {
            console.warn('⚠️ No container provided, using fallback dimensions');
            this.WORLD_WIDTH = 800;
            this.WORLD_HEIGHT = 450;
            return;
        }

        try {
            const containerRect = this.container.getBoundingClientRect();
            let containerWidth = containerRect.width;
            let containerHeight = containerRect.height;

            // PRESERVED: Better fallback logic
            if (containerWidth <= 0 || containerHeight <= 0) {
                console.warn('⚠️ Container has no size, using fallback dimensions');
                containerWidth = Math.max(this.container.offsetWidth, 800);
                containerHeight = Math.max(this.container.offsetHeight, 450);
            }

            // Final fallback to reasonable defaults
            if (containerWidth <= 0) containerWidth = 800;
            if (containerHeight <= 0) containerHeight = 450;

            // Calculate 16:9 dimensions that fit in container
            const aspectRatio = 16 / 9;

            let width = containerWidth;
            let height = width / aspectRatio;

            // If height exceeds container, scale by height instead
            if (height > containerHeight) {
                height = containerHeight;
                width = height * aspectRatio;
            }

            // Ensure minimum size for playability
            const MIN_WIDTH = 800;
            const MIN_HEIGHT = 450;

            this.WORLD_WIDTH = Math.max(Math.floor(width), MIN_WIDTH);
            this.WORLD_HEIGHT = Math.max(Math.floor(height), MIN_HEIGHT);

            console.log(`📐 Canvas size calculated: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT}`);

        } catch (error) {
            console.error('❌ Error calculating canvas size:', error);
            // Safe fallback
            this.WORLD_WIDTH = 800;
            this.WORLD_HEIGHT = 450;
            console.log('🔧 Using safe fallback dimensions: 800x450');
        }
    }

    /**
     * PRESERVED: Setup responsive canvas styling
     */
    setupResponsiveCanvas() {
        const canvas = this.app.view;
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = 'contain'; // Maintain aspect ratio
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
    }

    /**
     * PRESERVED: Setup resize listener for responsive behavior
     */
    setupResizeListener() {
        const resizeHandler = () => {
            this.calculateCanvasSize();
            if (this.app) {
                this.app.renderer.resize(this.WORLD_WIDTH, this.WORLD_HEIGHT);
            }
        };

        window.addEventListener('resize', resizeHandler);

        // Store reference for cleanup
        this.resizeHandler = resizeHandler;
    }

    /**
     * PRESERVED: Render office map with proper 16:9 proportions
     * @param {Object} mapData - Map data from JSON file
     */
    renderMap(mapData) {
        console.log('🗺️ Rendering office map...');

        // Clear existing map sprites
        this.mapSprites.forEach(sprite => {
            this.mapLayer.removeChild(sprite);
        });
        this.mapSprites = [];

        // Create a simple office layout graphics
        const graphics = new PIXI.Graphics();

        // Calculate scale factors for responsive design
        const scaleX = this.WORLD_WIDTH / this.BASE_WIDTH;
        const scaleY = this.WORLD_HEIGHT / this.BASE_HEIGHT;

        // Floor
        const floorColor = 0xf0f0f0;
        graphics.beginFill(floorColor);
        graphics.drawRect(10, 10, this.WORLD_WIDTH - 20, this.WORLD_HEIGHT - 20);
        graphics.endFill();

        // Office desks (scaled positions)
        const deskColor = 0x8B4513;
        const desks = [
            { x: 200 * scaleX, y: 150 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 450 * scaleX, y: 150 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 200 * scaleX, y: 350 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 450 * scaleX, y: 350 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 650 * scaleX, y: 350 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 900 * scaleX, y: 350 * scaleY, width: 120 * scaleX, height: 60 * scaleY }
        ];

        desks.forEach(desk => {
            graphics.beginFill(deskColor);
            graphics.drawRect(desk.x, desk.y, desk.width, desk.height);
            graphics.endFill();
        });

        // Add walls
        graphics.beginFill(0x654321);
        graphics.drawRect(0, 0, this.WORLD_WIDTH, 10); // Top wall
        graphics.drawRect(0, this.WORLD_HEIGHT - 10, this.WORLD_WIDTH, 10); // Bottom wall
        graphics.drawRect(0, 0, 10, this.WORLD_HEIGHT); // Left wall
        graphics.drawRect(this.WORLD_WIDTH - 10, 0, 10, this.WORLD_HEIGHT); // Right wall
        graphics.endFill();

        this.mapLayer.addChild(graphics);
        console.log('✅ Office map rendered');
    }

    /**
 * FIXED: Render character sprite with proper texture loading from sprite sheets
 * @param {Object} character - Character data with spriteSheet property
 */
async renderCharacter(character) {
    if (!this.isInitialized) {
        console.warn('❌ Cannot render character: renderer not initialized');
        return;
    }

    // Remove existing sprite if it exists
    if (this.characterSprites.has(character.id)) {
        this.removeCharacter(character.id);
    }

    try {
        let sprite;
        
        // Check if character has a valid sprite sheet
        if (character.spriteSheet) {
            try {
                console.log(`🎨 Loading sprite sheet for ${character.name}: ${character.spriteSheet}`);
                
                // Load the full sprite sheet texture
                const fullTexture = await PIXI.Texture.fromURL(character.spriteSheet);
                
                if (fullTexture && fullTexture.valid) {
                    // SPRITE SHEET SPECIFICATIONS (from sprite-manager.js analysis)
                    const SPRITE_WIDTH = 48;
                    const SPRITE_HEIGHT = 96;
                    
                    // Extract the first sprite frame (standing/idle pose)
                    // Using frame 0 for game world (frame 3 is used for portraits)
                    const frameIndex = 0; // First frame for idle pose
                    const sourceX = frameIndex * SPRITE_WIDTH;
                    const sourceY = 0; // First row
                    
                    // Create a new texture from the specific frame
                    const frameTexture = new PIXI.Texture(
                        fullTexture.baseTexture,
                        new PIXI.Rectangle(sourceX, sourceY, SPRITE_WIDTH, SPRITE_HEIGHT)
                    );
                    
                    // Create sprite from the frame texture
                    sprite = new PIXI.Sprite(frameTexture);
                    
                    // Set sprite properties to match renderer constants
                    sprite.width = this.CHARACTER_WIDTH;
                    sprite.height = this.CHARACTER_HEIGHT;
                    sprite.anchor.set(0.5, 1.0); // Bottom center anchor for proper positioning
                    
                    console.log(`✅ Loaded sprite frame for ${character.name} (${SPRITE_WIDTH}x${SPRITE_HEIGHT})`);
                    
                } else {
                    throw new Error('Texture failed to load or is invalid');
                }
                
            } catch (error) {
                console.warn(`⚠️ Failed to load sprite sheet for ${character.name}:`, error);
                console.warn(`⚠️ Falling back to placeholder sprite`);
                sprite = this.createSimpleCharacterSprite(character);
            }
        } else {
            console.log(`🎨 No sprite sheet specified for ${character.name}, using placeholder`);
            sprite = this.createSimpleCharacterSprite(character);
        }

        // Set character position
        sprite.x = character.position?.x || 100;
        sprite.y = character.position?.y || 100;

        // Add to character layer
        this.characterLayer.addChild(sprite);
        this.characterSprites.set(character.id, sprite);

        console.log(`✅ Character sprite rendered: ${character.name} at (${sprite.x}, ${sprite.y})`);

    } catch (error) {
        console.error('❌ Failed to render character:', character.name, error);
        
        // Emergency fallback - create placeholder sprite
        try {
            const fallbackSprite = this.createSimpleCharacterSprite(character);
            fallbackSprite.x = character.position?.x || 100;
            fallbackSprite.y = character.position?.y || 100;
            this.characterLayer.addChild(fallbackSprite);
            this.characterSprites.set(character.id, fallbackSprite);
            console.log(`🔧 Emergency fallback sprite created for ${character.name}`);
        } catch (fallbackError) {
            console.error('❌ Even fallback sprite failed:', fallbackError);
        }
    }
}

    /**
     * PRESERVED: Create a simple character sprite (fallback when image loading fails)
     * @param {Object} character - Character data
     * @returns {PIXI.Graphics} - Simple character sprite
     */
    createSimpleCharacterSprite(character) {
        const graphics = new PIXI.Graphics();

        // Body (rectangle)
        graphics.beginFill(0x4a90e2); // Blue body
        graphics.drawRect(-this.CHARACTER_WIDTH/2, -this.CHARACTER_HEIGHT, this.CHARACTER_WIDTH, this.CHARACTER_HEIGHT);
        graphics.endFill();

        // Head (circle)
        graphics.beginFill(0xfdbcb4); // Skin tone
        graphics.drawCircle(0, -this.CHARACTER_HEIGHT + 15, 12);
        graphics.endFill();

        // Simple face
        graphics.beginFill(0x000000);
        graphics.drawCircle(-4, -this.CHARACTER_HEIGHT + 12, 1); // Left eye
        graphics.drawCircle(4, -this.CHARACTER_HEIGHT + 12, 1);  // Right eye
        graphics.endFill();

        return graphics;
    }

    /**
     * PRESERVED: Update character sprite position
     * @param {string} characterId - Character ID
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    updateCharacterPosition(characterId, x, y) {
        const sprite = this.characterSprites.get(characterId);
        if (sprite) {
            sprite.x = x;
            sprite.y = y;
        }
    }

    /**
     * PRESERVED: Remove character sprite
     * @param {string} characterId - Character ID
     */
    removeCharacter(characterId) {
        const sprite = this.characterSprites.get(characterId);
        if (sprite) {
            this.characterLayer.removeChild(sprite);
            this.characterSprites.delete(characterId);
        }
    }

    /**
     * PRESERVED: Update renderer (called each frame)
     */
    update() {
        if (this.app && this.isInitialized) {
            this.app.render();
        }
    }

    /**
     * ENHANCED: Cleanup with texture cache clearing
     */
    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }

        if (this.app) {
            this.app.destroy(true);
            this.app = null;
        }
        
        this.characterSprites.clear();
        this.preloadedTextures.clear(); // NEW: Clear texture cache
        this.isInitialized = false;
        console.log('🧹 Enhanced renderer destroyed and cleaned up');
    }

    /**
     * PRESERVED: Get world bounds for camera/movement systems
     */
    getWorldBounds() {
        return {
            width: this.WORLD_WIDTH,
            height: this.WORLD_HEIGHT,
            aspectRatio: 16/9
        };
    }

    /**
     * ENHANCED: Debug method to check renderer status including texture cache
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasApp: !!this.app,
            hasContainer: !!this.container,
            characterCount: this.characterSprites.size,
            preloadedTextures: this.preloadedTextures.size, // NEW
            worldBounds: this.getWorldBounds(),
            canvasSize: `${this.WORLD_WIDTH}x${this.WORLD_HEIGHT}`,
            aspectRatio: '16:9',
            textureCache: Array.from(this.preloadedTextures.keys()) // NEW: List cached textures
        };
    }

    /**
     * NEW: Get texture cache status for debugging
     */
    getTextureCacheStatus() {
        const cached = Array.from(this.preloadedTextures.entries()).map(([path, texture]) => ({
            path,
            isValid: texture.valid,
            dimensions: `${texture.width}x${texture.height}`,
            baseTexture: !!texture.baseTexture
        }));

        return {
            totalCached: this.preloadedTextures.size,
            textures: cached
        };
    }

    /**
     * NEW: Force reload a specific texture (useful for debugging)
     */
    async reloadTexture(spritePath) {
        try {
            // Remove from cache
            this.preloadedTextures.delete(spritePath);
            
            // Reload
            const texture = await this.loadSpriteTexture(spritePath);
            console.log(`✅ Reloaded texture: ${spritePath}`);
            return texture;
        } catch (error) {
            console.error(`❌ Failed to reload texture: ${spritePath}`, error);
            throw error;
        }
    }
}
