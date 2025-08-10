/**
 * STAGE 3 COMPLETE: Full Rendering System using PixiJS with proper character integration
 * 
 * This file handles all visual rendering for the game world including:
 * - PixiJS initialization and canvas management
 * - Character sprite rendering with proper 48x96 dimensions
 * - Office map background rendering
 * - Character positioning and updates
 * - Proper cleanup and error handling
 */

export class Renderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.app = null;
        this.worldContainer = null;
        this.characterSprites = new Map(); // Map character IDs to sprites
        this.mapSprites = [];
        this.isInitialized = false;
        
        // Rendering constants
        this.TILE_SIZE = 48;
        this.CHARACTER_WIDTH = 48;
        this.CHARACTER_HEIGHT = 96; // Characters are 48x96 (2 tiles tall)
        this.WORLD_WIDTH = 800;
        this.WORLD_HEIGHT = 600;
        
        console.log('🎨 Renderer constructor called');
    }

    /**
     * Initialize PixiJS application and containers
     */
    async initialize() {
        try {
            console.log('🔧 Initializing PixiJS renderer...');
            
            // Create PixiJS application
            this.app = new PIXI.Application({
                width: this.WORLD_WIDTH,
                height: this.WORLD_HEIGHT,
                backgroundColor: 0x2c3e50,
                antialias: true,
                resolution: 1
            });

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

            this.isInitialized = true;
            console.log('✅ PixiJS renderer initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize renderer:', error);
            throw error;
        }
    }

    /**
     * Render a basic office background
     * @param {Object} mapData - Map data from JSON file
     */
    renderMap(mapData) {
        if (!this.isInitialized) {
            console.error('❌ Renderer not initialized');
            return;
        }

        console.log('🗺️ Rendering map...');

        // Clear existing map
        this.mapLayer.removeChildren();

        // Create a simple office background for now
        // Office floor
        const floor = new PIXI.Graphics();
        floor.beginFill(0xf5f5f5); // Light gray floor
        floor.drawRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        floor.endFill();
        this.mapLayer.addChild(floor);

        // Add office elements
        this.addOfficeElements();

        console.log('✅ Map rendered successfully');
    }

    /**
     * Add basic office elements (desks, walls, etc.)
     */
    addOfficeElements() {
        const graphics = new PIXI.Graphics();

        // Desks (brown rectangles)
        const deskColor = 0x8b4513;
        const desks = [
            { x: 100, y: 150, width: 120, height: 60 },
            { x: 300, y: 150, width: 120, height: 60 },
            { x: 500, y: 150, width: 120, height: 60 },
            { x: 100, y: 350, width: 120, height: 60 },
            { x: 300, y: 350, width: 120, height: 60 }
        ];

        desks.forEach(desk => {
            graphics.beginFill(deskColor);
            graphics.drawRect(desk.x, desk.y, desk.width, desk.height);
            graphics.endFill();
        });

        // Walls (dark gray lines)
        graphics.lineStyle(4, 0x333333);
        
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
     * Create and add a character sprite to the world
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
                    // Character sprites are 48x96, and we want the idle frame (usually first frame)
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
            sprite.width = this.CHARACTER_WIDTH;   // 48 pixels wide
            sprite.height = this.CHARACTER_HEIGHT; // 96 pixels tall
            sprite.x = character.position?.x || 100;
            sprite.y = character.position?.y || 100;
            
            // Anchor at bottom center so character "stands" on the ground
            sprite.anchor.set(0.5, 1.0); // Center horizontally, bottom vertically
            
            // Add name label
            const nameText = new PIXI.Text(character.name, {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x000000,
                align: 'center'
            });
            nameText.anchor.set(0.5);
            nameText.x = 0;
            nameText.y = -this.CHARACTER_HEIGHT - 10; // Above the character
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
            fallbackSprite.x = character.position?.x || 100;
            fallbackSprite.y = character.position?.y || 100;
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
        // Renderer updates will be added here later
        // For now, PixiJS handles the rendering automatically
        if (this.app && this.isInitialized) {
            this.app.render();
        }
    }

    /**
     * Cleanup and destroy renderer
     */
    destroy() {
        if (this.app) {
            this.app.destroy(true);
            this.app = null;
        }
        this.characterSprites.clear();
        this.isInitialized = false;
        console.log('🧹 Renderer destroyed and cleaned up');
    }

    /**
     * Get world bounds for camera/movement systems
     */
    getWorldBounds() {
        return {
            width: this.WORLD_WIDTH,
            height: this.WORLD_HEIGHT
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
            worldBounds: this.getWorldBounds()
        };
    }
}
