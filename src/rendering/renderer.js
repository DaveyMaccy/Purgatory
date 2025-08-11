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
 * 
 * ANIMATION FIX: Updated sprite dimensions and frame cycling
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
        
        // Generate sprite paths (matches character-data.js - first 20 sprites)
        for (let i = 1; i <= 20; i++) {
            const spriteId = i.toString().padStart(2, '0');
            const spritePath = `assets/characters/character-${spriteId}.png`;
            
            console.log(`📥 Preloading: ${spritePath}`);
            
            const spritePromise = PIXI.Texture.fromURL(spritePath)
                .then(texture => {
                    if (texture && texture.valid) {
                        this.preloadedTextures.set(spritePath, texture);
                        console.log(`✅ Preloaded: ${spritePath}`);
                        return texture;
                    } else {
                        console.warn(`⚠️ Failed to preload: ${spritePath}`);
                        return null;
                    }
                })
                .catch(error => {
                    console.warn(`⚠️ Error preloading ${spritePath}:`, error);
                    return null;
                });
            
            spritePromises.push(spritePromise);
        }
        
        try {
            const textures = await Promise.allSettled(spritePromises);
            const successCount = textures.filter(result => 
                result.status === 'fulfilled' && result.value !== null
            ).length;
            
            console.log(`🎨 Preloading complete: ${successCount}/20 textures loaded`);
            return successCount;
            
        } catch (error) {
            console.error('❌ Error during sprite preloading:', error);
            return 0;
        }
    }

    /**
     * ENHANCED: Initialize renderer with proper error handling and optional sprite preloading
     */
    async initialize(mapData) {
        try {
            console.log('🎨 Initializing renderer...');
            
            if (USE_ENHANCED_SPRITES) {
                console.log('🎨 Enhanced renderer initializing (with sprite preloading)...');
            } else {
                console.log('🎨 Basic renderer initializing (enhanced sprites dormant)...');
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
        if (this.app && this.app
