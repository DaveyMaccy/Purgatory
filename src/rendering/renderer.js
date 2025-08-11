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
 * 
 * PHASE 4 ADDITION:
 * - updateCharacterAnimation() method for movement system integration
 * 
 * ⚠️ DORMANT MODE: Enhanced sprite rendering is DISABLED by default
 * Set USE_ENHANCED_SPRITES = true to enable when movement system is ready
 */

// DORMANT CONTROL FLAG - Set to true when ready to enable enhanced sprites
const USE_ENHANCED_SPRITES = true;

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

        if (USE_ENHANCED_SPRITES) {
            console.log('🎨 Enhanced Renderer constructor with sprite preloading support');
        } else {
            console.log('🎨 Renderer constructor (enhanced sprites DORMANT)');
        }
    }

    /**
     * NEW: Preload all character sprite textures for better performance
     * ⚠️ DORMANT: Only runs when USE_ENHANCED_SPRITES = true
     */
    async preloadCharacterSprites() {
        if (!USE_ENHANCED_SPRITES) {
            console.log('💤 Sprite preloading DORMANT - skipping');
            return 0;
        }

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
     * ⚠️ DORMANT: Only runs when USE_ENHANCED_SPRITES = true
     */
    async loadSpriteTexture(spritePath) {
        if (!USE_ENHANCED_SPRITES) {
            throw new Error('Enhanced sprites are dormant');
        }

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
     * ENHANCED: Initialize PixiJS application with optional sprite preloading
     * ⚠️ SAFE: Sprite preloading only runs if USE_ENHANCED_SPRITES = true
     */
    async initialize(mapData) {
        try {
            if (USE_ENHANCED_SPRITES) {
                console.log('🔧 Initializing enhanced PixiJS renderer with sprite preloading...');
            } else {
                console.log('🔧 Initializing PixiJS renderer (enhanced sprites dormant)...');
            }

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

            // CONDITIONAL: Only preload sprites if enhanced mode is enabled
            let preloadedCount = 0;
            if (USE_ENHANCED_SPRITES) {
                preloadedCount = await this.preloadCharacterSprites();
                console.log(`🎮 Sprite preloading complete: ${preloadedCount} textures cached`);
            } else {
                console.log('💤 Sprite preloading skipped (dormant mode)');
            }

            // PRESERVED: Render the map if provided
            if (mapData) {
                this.renderMap(mapData);
            }

            this.isInitialized = true;
            
            if (USE_ENHANCED_SPRITES) {
                console.log(`✅ Enhanced PixiJS renderer initialized: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT} (16:9)`);
            } else {
                console.log(`✅ PixiJS renderer initialized: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT} (16:9) - Enhanced sprites DORMANT`);
            }

        } catch (error) {
            console.error('❌ Failed to initialize renderer:', error);
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
            this.WORLD_WIDTH = this.BASE_WIDTH;
            this.WORLD_HEIGHT = this.BASE_HEIGHT;
            return;
        }

        // PRESERVED: Get container dimensions
        const containerRect = this.container.getBoundingClientRect();
        const containerWidth = containerRect.width || this.container.clientWidth || 800;
        const containerHeight = containerRect.height || this.container.clientHeight || 600;

        // PRESERVED: Calculate size maintaining 16:9 aspect ratio
        const targetAspectRatio = 16 / 9;
        const containerAspectRatio = containerWidth / containerHeight;

        if (containerAspectRatio > targetAspectRatio) {
            // Container is wider than 16:9, fit to height
            this.WORLD_HEIGHT = Math.min(containerHeight * 0.85, this.BASE_HEIGHT);
            this.WORLD_WIDTH = this.WORLD_HEIGHT * targetAspectRatio;
        } else {
            // Container is taller than 16:9, fit to width
            this.WORLD_WIDTH = Math.min(containerWidth * 0.85, this.BASE_WIDTH);
            this.WORLD_HEIGHT = this.WORLD_WIDTH / targetAspectRatio;
        }

        // PRESERVED: Ensure minimum size
        this.WORLD_WIDTH = Math.max(this.WORLD_WIDTH, 800);
        this.WORLD_HEIGHT = Math.max(this.WORLD_HEIGHT, 450);

        console.log(`📐 Canvas sized: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT} (16:9 aspect ratio)`);
    }

    /**
     * PRESERVED: Setup responsive canvas styling
     */
    setupResponsiveCanvas() {
        if (this.app && this.app.view) {
            const canvas = this.app.view;
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '100%';
            canvas.style.border = '2px solid #34495e';
            canvas.style.borderRadius = '8px';
        }
    }

    /**
     * PRESERVED: Setup window resize listener
     */
    setupResizeListener() {
        this.resizeHandler = () => {
            this.calculateCanvasSize();
            if (this.app) {
                this.app.renderer.resize(this.WORLD_WIDTH, this.WORLD_HEIGHT);
                this.setupResponsiveCanvas();
            }
        };
        
        window.addEventListener('resize', this.resizeHandler);
    }

    /**
     * PRESERVED: Render basic office map with desks and environment
     */
    renderMap(mapData) {
        console.log('🗺️ Rendering office map...');

        // PRESERVED: Clear existing map sprites
        this.mapSprites.forEach(sprite => {
            this.mapLayer.removeChild(sprite);
        });
        this.mapSprites = [];

        // PRESERVED: Create background
        const background = new PIXI.Graphics();
        background.beginFill(0x95a5a6); // Light gray floor
        background.drawRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        background.endFill();
        this.mapLayer.addChild(background);
        this.mapSprites.push(background);

        // PRESERVED: Create walls
        const walls = new PIXI.Graphics();
        walls.beginFill(0x2c3e50); // Dark walls
        
        const wallThickness = 20;
        // Top wall
        walls.drawRect(0, 0, this.WORLD_WIDTH, wallThickness);
        // Bottom wall  
        walls.drawRect(0, this.WORLD_HEIGHT - wallThickness, this.WORLD_WIDTH, wallThickness);
        // Left wall
        walls.drawRect(0, 0, wallThickness, this.WORLD_HEIGHT);
        // Right wall
        walls.drawRect(this.WORLD_WIDTH - wallThickness, 0, wallThickness, this.WORLD_HEIGHT);
        
        walls.endFill();
        this.mapLayer.addChild(walls);
        this.mapSprites.push(walls);

        // PRESERVED: Create desks (simple rectangles for now)
        const deskPositions = [
            { x: 100, y: 150, width: 120, height: 60 },
            { x: 300, y: 150, width: 120, height: 60 },
            { x: 500, y: 150, width: 120, height: 60 },
            { x: 100, y: 350, width: 120, height: 60 },
            { x: 300, y: 350, width: 120, height: 60 }
        ];

        deskPositions.forEach((desk, index) => {
            const deskSprite = new PIXI.Graphics();
            deskSprite.beginFill(0x8b4513); // Brown desk color
            deskSprite.drawRect(desk.x, desk.y, desk.width, desk.height);
            deskSprite.endFill();
            
            // Add desk label
            const deskLabel = new PIXI.Text(`Desk ${index + 1}`, {
                fontSize: 12,
                fill: 0xffffff,
                align: 'center'
            });
            deskLabel.x = desk.x + desk.width / 2 - deskLabel.width / 2;
            deskLabel.y = desk.y + desk.height / 2 - deskLabel.height / 2;
            
            this.mapLayer.addChild(deskSprite);
            this.mapLayer.addChild(deskLabel);
            this.mapSprites.push(deskSprite, deskLabel);
        });

        console.log('✅ Office map rendered with walls and desks');
    }

    /**
     * FIXED: Render character sprite with basic sprite loading + optional enhancements
     * ⚠️ ALWAYS works: Loads basic sprites, enhanced features dormant until flag enabled
     * @param {Object} character - Character data
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
            
            // ALWAYS attempt basic sprite loading if character has spriteSheet
            if (character.spriteSheet) {
                try {
                    console.log(`🎨 Loading sprite for ${character.name}: ${character.spriteSheet}`);
                    
                    // Basic sprite loading (ALWAYS enabled)
                    const texture = await PIXI.Texture.fromURL(character.spriteSheet);
                    
                    if (texture && texture.valid) {
                        // CONDITIONAL: Use enhanced frame extraction if enabled, otherwise use full texture
                        if (USE_ENHANCED_SPRITES) {
                            // ENHANCED: Extract specific frame from sprite sheet
                            const SPRITE_WIDTH = 48;
                            const SPRITE_HEIGHT = 96;
                            const frameIndex = 0; // First frame for idle pose
                            const sourceX = frameIndex * SPRITE_WIDTH;
                            const sourceY = 0; // First row
                            
                            const frameTexture = new PIXI.Texture(
                                texture.baseTexture,
                                new PIXI.Rectangle(sourceX, sourceY, SPRITE_WIDTH, SPRITE_HEIGHT)
                            );
                            sprite = new PIXI.Sprite(frameTexture);
                            console.log(`✅ Enhanced frame extraction for ${character.name}`);
                        } else {
                            // BASIC: Use full texture as-is (current working behavior)
                            sprite = new PIXI.Sprite(texture);
                            console.log(`✅ Basic sprite loaded for ${character.name}`);
                        }
                        
                        // Set sprite properties
                        sprite.width = this.CHARACTER_WIDTH;
                        sprite.height = this.CHARACTER_HEIGHT;
                        sprite.anchor.set(0.5, 1.0); // Bottom center anchor
                        
                    } else {
                        throw new Error('Texture failed to load or is invalid');
                    }
                    
                } catch (error) {
                    console.warn(`⚠️ Sprite loading failed for ${character.name}, using placeholder:`, error);
                    sprite = this.createSimpleCharacterSprite(character);
                }
            } else {
                // No sprite sheet specified - use placeholder
                console.log(`🎨 No sprite sheet for ${character.name} - using placeholder`);
                sprite = this.createSimpleCharacterSprite(character);
            }

            // Set character position
            sprite.x = character.position?.x || 100;
            sprite.y = character.position?.y || 100;

            // PHASE 4 ADD: Store character ID reference for animation system
            sprite.characterId = character.id;

            // Add to character layer
            this.characterLayer.addChild(sprite);
            this.characterSprites.set(character.id, sprite);

            console.log(`✅ Character rendered: ${character.name} at (${sprite.x}, ${sprite.y})`);

        } catch (error) {
            console.error('❌ Failed to render character:', character.name, error);
            
            // Emergency fallback - create placeholder sprite
            try {
                const fallbackSprite = this.createSimpleCharacterSprite(character);
                fallbackSprite.x = character.position?.x || 100;
                fallbackSprite.y = character.position?.y || 100;
                fallbackSprite.characterId = character.id;
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
     * PHASE 4 ADD: Update character animation based on action state and direction
     * @param {string} characterId - Character ID
     * @param {string} actionState - Action state ('idle', 'walking', 'working', etc.)
     * @param {string} facingDirection - Direction ('up', 'down', 'left', 'right')
     */
    updateCharacterAnimation(characterId, actionState, facingDirection) {
        const sprite = this.characterSprites.get(characterId);
        if (!sprite) {
            console.warn(`⚠️ Cannot update animation: sprite not found for ${characterId}`);
            return;
        }

        // For now, implement basic visual feedback
        console.log(`🎭 ${characterId}: ${actionState} facing ${facingDirection}`);
        
        if (USE_ENHANCED_SPRITES) {
            // ENHANCED: Use sprite sheet frames for different directions and states
            this.updateSpriteFrame(sprite, actionState, facingDirection);
        } else {
            // BASIC: Simple visual changes (tint, scale, etc.)
            this.updateBasicAnimation(sprite, actionState, facingDirection);
        }
    }

    /**
     * PHASE 4 ADD: Update sprite frame for enhanced sprite sheets
     */
    updateSpriteFrame(sprite, actionState, facingDirection) {
        const SPRITE_WIDTH = 48;
        const SPRITE_HEIGHT = 96;
        
        // Direction mapping (row in sprite sheet)
        const directionRows = {
            'down': 0,
            'left': 1, 
            'right': 2,
            'up': 3
        };
        
        // Animation frame mapping (column in sprite sheet)
        const animationFrames = {
            'idle': 0,
            'walking': 1, // Could cycle through 1,2,3 for walking animation
            'working': 0
        };
        
        const row = directionRows[facingDirection] || 0;
        const frame = animationFrames[actionState] || 0;
        
        // Calculate source rectangle
        const sourceX = frame * SPRITE_WIDTH;
        const sourceY = row * SPRITE_HEIGHT;
        
        // Update texture rectangle
        if (sprite.texture && sprite.texture.baseTexture) {
            sprite.texture.frame = new PIXI.Rectangle(sourceX, sourceY, SPRITE_WIDTH, SPRITE_HEIGHT);
            sprite.texture.updateUvs();
        }
    }

    /**
     * PHASE 4 ADD: Basic animation for simple sprites
     */
    updateBasicAnimation(sprite, actionState, facingDirection) {
        // Simple visual feedback without sprite sheets
        
        // Direction changes: Flip sprite horizontally for left/right
        if (facingDirection === 'left') {
            sprite.scale.x = -Math.abs(sprite.scale.x); // Face left
        } else if (facingDirection === 'right') {
            sprite.scale.x = Math.abs(sprite.scale.x); // Face right
        }
        
        // Animation state changes: Subtle visual effects
        if (actionState === 'walking') {
            // Slight bounce effect for walking
            sprite.y -= 2;
            setTimeout(() => {
                if (this.characterSprites.get(sprite.characterId) === sprite) {
                    sprite.y += 2;
                }
            }, 200);
        }
        
        // Optional: Tint changes for different states
        if (actionState === 'working') {
            sprite.tint = 0xffffaa; // Slight yellow tint
        } else {
            sprite.tint = 0xffffff; // Normal color
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
        this.preloadedTextures.clear(); // Clear texture cache
        this.isInitialized = false;
        
        if (USE_ENHANCED_SPRITES) {
            console.log('🧹 Enhanced renderer destroyed and cleaned up');
        } else {
            console.log('🧹 Renderer destroyed and cleaned up');
        }
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
            enhancedSpritesEnabled: USE_ENHANCED_SPRITES, // NEW: Show dormant status
            preloadedTextures: this.preloadedTextures.size,
            worldBounds: this.getWorldBounds(),
            canvasSize: `${this.WORLD_WIDTH}x${this.WORLD_HEIGHT}`,
            aspectRatio: '16:9',
            textureCache: USE_ENHANCED_SPRITES ? 
                `${this.preloadedTextures.size} textures cached` : 
                'Texture caching dormant'
        };
    }
}
