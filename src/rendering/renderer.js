/**
 * FIXED: Rendering System with 16:9 aspect ratio and responsive canvas
 * 
 * This file handles all visual rendering for the game world with proper dimensions
 */

export class Renderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.app = null;
        this.worldContainer = null;
        this.characterSprites = new Map(); // Map character IDs to sprites
        this.mapSprites = [];
        this.isInitialized = false;
        
        // FIXED: 16:9 aspect ratio constants
        this.TILE_SIZE = 48;
        this.CHARACTER_WIDTH = 48;
        this.CHARACTER_HEIGHT = 96; // Characters are 48x96 (2 tiles tall)
        
        // FIXED: 16:9 aspect ratio dimensions
        this.BASE_WIDTH = 1280;
        this.BASE_HEIGHT = 720;
        
        // Current render dimensions (will be calculated)
        this.WORLD_WIDTH = this.BASE_WIDTH;
        this.WORLD_HEIGHT = this.BASE_HEIGHT;
        
        console.log('🎨 Renderer constructor called with 16:9 aspect ratio');
    }

    /**
     * FIXED: Initialize PixiJS application with responsive 16:9 canvas
     */
    async initialize() {
        try {
            console.log('🔧 Initializing PixiJS renderer with 16:9 aspect ratio...');
            
            // Calculate optimal canvas size for container
            this.calculateCanvasSize();
            
            // Create PixiJS application with calculated dimensions
            this.app = new PIXI.Application({
                width: this.WORLD_WIDTH,
                height: this.WORLD_HEIGHT,
                backgroundColor: 0x2c3e50,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });

            // FIXED: Make canvas responsive and centered
            this.setupResponsiveCanvas();

            // Add canvas to container
            this.container.appendChild(this.app.view);

            // Create world container for all game objects
            this.worldContainer = new PIXI.Container();
            this.app.stage.addChild(this.worldContainer);

            // Create layers in proper order (bottom to top)
            this.mapLayer = new PIXI.Container();
            this.characterLayer = new PIXI.Container();
            
            this.worldContainer.addChild(this.mapLayer);
            this.worldContainer.addChild(this.characterLayer);

            // Add resize listener for responsive behavior
            this.setupResizeListener();

            this.isInitialized = true;
            console.log(`✅ PixiJS renderer initialized: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT} (16:9)`);

        } catch (error) {
            console.error('❌ Failed to initialize renderer:', error);
            throw error;
        }
    }

    /**
     * FIXED: Calculate optimal canvas size maintaining 16:9 aspect ratio
     */
    calculateCanvasSize() {
        const containerRect = this.container.getBoundingClientRect();
        const containerWidth = containerRect.width || window.innerWidth * 0.7; // Fallback
        const containerHeight = containerRect.height || window.innerHeight * 0.7; // Fallback
        
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
    }

    /**
     * FIXED: Setup responsive canvas styling
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
     * FIXED: Setup resize listener for responsive behavior
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
     * FIXED: Render office map with proper 16:9 proportions
     * @param {Object} mapData - Map data from JSON file
     */
    renderMap(mapData) {
        if (!this.isInitialized) {
            console.error('❌ Renderer not initialized');
            return;
        }

        console.log('🗺️ Rendering map with 16:9 layout...');

        // Clear existing map
        this.mapLayer.removeChildren();

        // Create office background that fills the 16:9 area
        const floor = new PIXI.Graphics();
        floor.beginFill(0xf5f5f5); // Light gray floor
        floor.drawRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        floor.endFill();
        this.mapLayer.addChild(floor);

        // Add office elements scaled for 16:9 layout
        this.addOfficeElements();

        console.log('✅ Map rendered successfully in 16:9 format');
    }

    /**
     * FIXED: Add office elements scaled for 16:9 layout
     */
    addOfficeElements() {
        const graphics = new PIXI.Graphics();

        // FIXED: Scale desk positions for wider 16:9 layout
        const deskColor = 0x8b4513;
        const scaleX = this.WORLD_WIDTH / 800; // Scale from old 800px width
        const scaleY = this.WORLD_HEIGHT / 600; // Scale from old 600px height
        
        const desks = [
            { x: 150 * scaleX, y: 150 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 400 * scaleX, y: 150 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 650 * scaleX, y: 150 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 900 * scaleX, y: 150 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 150 * scaleX, y: 350 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 400 * scaleX, y: 350 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 650 * scaleX, y: 350 * scaleY, width: 120 * scaleX, height: 60 * scaleY },
            { x: 900 * scaleX, y: 350 * scaleY, width: 120 * scaleX, height: 60 * scaleY }
        ];

        desks.forEach(desk => {
            graphics.beginFill(deskColor);
            graphics.drawRect(desk.x, desk.y, desk.width, desk.height);
            graphics.endFill();
        });

        // FIXED: Walls scaled for 16:9
        graphics.lineStyle(4 * Math.min(scaleX, scaleY), 0x333333);
        
        // Top wall
        graphics.moveTo(0, 0);
        graphics.lineTo(this.WORLD_WIDTH, 0);
        
        // Bottom wall
        graphics.moveTo(0, this.WORLD_HEIGHT - 4);
        graphics.lineTo(this.WORLD_WIDTH, this.WORLD_HEIGHT - 4);
        
        // Left wall
        graphics.moveTo(0, 0);
        graphics.lineTo(0, this.WORLD_HEIGHT);
        
        // Right wall
        graphics.moveTo(this.WORLD_WIDTH - 4, 0);
        graphics.lineTo(this.WORLD_WIDTH - 4, this.WORLD_HEIGHT);

        this.mapLayer.addChild(graphics);
    }

    /**
     * FIXED: Create character sprite with proper scaling
     * @param {Object} character - Character data
     */
    async addCharacter(character) {
        if (!this.isInitialized) {
            console.error('❌ Renderer not initialized');
            return;
        }

        try {
            console.log(`👤 Adding character sprite for ${character.name}`);

            let sprite;

            // Try to load custom spritesheet first
            if (character.spriteSheet) {
                try {
                    // Load the full spritesheet texture
                    const fullTexture = await PIXI.Texture.fromURL(character.spriteSheet);
                    
                    // Create a cropped texture for proper 48x96 character
                    const croppedTexture = new PIXI.Texture(
                        fullTexture.baseTexture,
                        new PIXI.Rectangle(0, 0, this.CHARACTER_WIDTH, this.CHARACTER_HEIGHT)
                    );
                    
                    // Create sprite from cropped texture
                    sprite = new PIXI.Sprite(croppedTexture);
                    
                } catch (spriteError) {
                    console.warn(`⚠️ Failed to load sprite for ${character.name}, using placeholder:`, spriteError);
                    sprite = this.createPlaceholderSprite(character);
                }
            } else {
                // Create placeholder sprite
                sprite = this.createPlaceholderSprite(character);
            }
            
            // Set proper sprite dimensions and position
            sprite.width = this.CHARACTER_WIDTH;
            sprite.height = this.CHARACTER_HEIGHT;
            sprite.x = character.position?.x || (this.WORLD_WIDTH / 2);
            sprite.y = character.position?.y || (this.WORLD_HEIGHT / 2);
            
            // Anchor at bottom center so character "stands" on the ground
            sprite.anchor.set(0.5, 1.0);
            
            // Add name label
            const nameText = new PIXI.Text(character.name, {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x000000,
                align: 'center'
            });
            nameText.anchor.set(0.5);
            nameText.x = 0;
            nameText.y = -this.CHARACTER_HEIGHT - 10;
            sprite.addChild(nameText);

            // Add player indicator if this is the player
            if (character.isPlayer) {
                const playerIndicator = new PIXI.Graphics();
                playerIndicator.beginFill(0x00ff00); // Green circle
                playerIndicator.drawCircle(0, -this.CHARACTER_HEIGHT - 20, 5);
                playerIndicator.endFill();
                sprite.addChild(playerIndicator);
            }

            // Store sprite reference
            this.characterSprites.set(character.id, sprite);
            this.characterLayer.addChild(sprite);
            
            console.log(`✅ Character sprite added for ${character.name} at (${sprite.x}, ${sprite.y})`);

        } catch (error) {
            console.error(`❌ Failed to add character ${character.name}:`, error);
            // Create a basic placeholder as fallback
            const fallbackSprite = this.createPlaceholderSprite(character);
            fallbackSprite.x = character.position?.x || (this.WORLD_WIDTH / 2);
            fallbackSprite.y = character.position?.y || (this.WORLD_HEIGHT / 2);
            fallbackSprite.anchor.set(0.5, 1.0);
            
            this.characterSprites.set(character.id, fallbackSprite);
            this.characterLayer.addChild(fallbackSprite);
        }
    }

    /**
     * Create a placeholder sprite for characters without custom sprites
     * @param {Object} character - Character data
     * @returns {PIXI.Graphics} A placeholder sprite
     */
    createPlaceholderSprite(character) {
        const graphics = new PIXI.Graphics();
        
        // Body (rectangle)
        graphics.beginFill(character.color || 0x3498db);
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
     * Update character sprite position
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
     * Remove character sprite
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
     * Update renderer (called each frame)
     */
    update() {
        if (this.app && this.isInitialized) {
            this.app.render();
        }
    }

    /**
     * FIXED: Cleanup with resize listener removal
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
        this.isInitialized = false;
        console.log('🧹 Renderer destroyed and cleaned up');
    }

    /**
     * FIXED: Get world bounds for camera/movement systems
     */
    getWorldBounds() {
        return {
            width: this.WORLD_WIDTH,
            height: this.WORLD_HEIGHT,
            aspectRatio: 16/9
        };
    }

    /**
     * Debug method to check renderer status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasApp: !!this.app,
            characterCount: this.characterSprites.size,
            worldBounds: this.getWorldBounds(),
            canvasSize: `${this.WORLD_WIDTH}x${this.WORLD_HEIGHT}`,
            aspectRatio: '16:9'
        };
    }
}
