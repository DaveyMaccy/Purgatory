/**
 * STAGE 2: Basic Rendering System using PixiJS
 * 
 * This file handles all visual rendering for the game world
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
        this.WORLD_WIDTH = 800;
        this.WORLD_HEIGHT = 600;
    }

    /**
     * Initialize PixiJS application and containers
     */
    async initialize() {
        try {
            console.log('Initializing PixiJS renderer...');
            
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

            // Create layers
            this.mapLayer = new PIXI.Container();
            this.characterLayer = new PIXI.Container();
            
            this.worldContainer.addChild(this.mapLayer);
            this.worldContainer.addChild(this.characterLayer);

            this.isInitialized = true;
            console.log('PixiJS renderer initialized successfully');

        } catch (error) {
            console.error('Failed to initialize renderer:', error);
            throw error;
        }
    }

    /**
     * Render a basic office background
     * @param {Object} mapData - Map data from JSON file
     */
    renderMap(mapData) {
        if (!this.isInitialized) {
            console.error('Renderer not initialized');
            return;
        }

        console.log('Rendering map...');

        // Clear existing map
        this.mapLayer.removeChildren();

        // Create a simple office background for now
        // In Stage 2, we'll use a basic colored background with some simple shapes
        
        // Office floor
        const floor = new PIXI.Graphics();
        floor.beginFill(0xf5f5f5); // Light gray floor
        floor.drawRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        floor.endFill();
        this.mapLayer.addChild(floor);

        // Add some basic office elements as colored rectangles
        this.addOfficeElements();

        console.log('Map rendered successfully');
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
            console.error('Renderer not initialized');
            return;
        }

        try {
            console.log(`Adding character sprite for ${character.name}`);

            // Load character texture
            const texture = await PIXI.Texture.fromURL(character.spriteSheet);
            
            // Create sprite
            const sprite = new PIXI.Sprite(texture);
            
            // Set sprite properties
            sprite.width = this.TILE_SIZE;
            sprite.height = this.TILE_SIZE;
            sprite.x = character.x || 100;
            sprite.y = character.y || 100;
            sprite.anchor.set(0.5); // Center the sprite
            
            // Add name label
            const nameText = new PIXI.Text(character.name, {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x000000,
                align: 'center'
            });
            nameText.anchor.set(0.5);
            nameText.x = 0;
            nameText.y = -30; // Above the character
            sprite.addChild(nameText);

            // Add player indicator if this is the player
            if (character.isPlayer) {
                const playerIndicator = new PIXI.Graphics();
                playerIndicator.beginFill(0x00ff00); // Green circle
                playerIndicator.drawCircle(0, -40, 5);
                playerIndicator.endFill();
                sprite.addChild(playerIndicator);
            }

            // Store sprite reference
            this.characterSprites.set(character.id, sprite);
            
            // Add to character layer
            this.characterLayer.addChild(sprite);

            console.log(`Character sprite added for ${character.name} at (${sprite.x}, ${sprite.y})`);

        } catch (error) {
            console.error(`Failed to add character ${character.name}:`, error);
            
            // Fallback: create a colored circle if image fails to load
            this.createFallbackCharacterSprite(character);
        }
    }

    /**
     * Create a fallback sprite if character image fails to load
     * @param {Object} character - Character data
     */
    createFallbackCharacterSprite(character) {
        console.log(`Creating fallback sprite for ${character.name}`);

        const graphics = new PIXI.Graphics();
        
        // Different colors for different characters
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b];
        const colorIndex = parseInt(character.id.replace('char_', '')) % colors.length;
        
        graphics.beginFill(colors[colorIndex]);
        graphics.drawCircle(0, 0, this.TILE_SIZE / 2);
        graphics.endFill();
        
        // Add border
        graphics.lineStyle(2, 0x000000);
        graphics.drawCircle(0, 0, this.TILE_SIZE / 2);

        graphics.x = character.x || 100;
        graphics.y = character.y || 100;

        // Add name label
        const nameText = new PIXI.Text(character.name, {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x000000,
            align: 'center'
        });
        nameText.anchor.set(0.5);
        nameText.x = 0;
        nameText.y = -30;
        graphics.addChild(nameText);

        // Add player indicator
        if (character.isPlayer) {
            const playerIndicator = new PIXI.Graphics();
            playerIndicator.beginFill(0x00ff00);
            playerIndicator.drawCircle(0, -40, 5);
            playerIndicator.endFill();
            graphics.addChild(playerIndicator);
        }

        this.characterSprites.set(character.id, graphics);
        this.characterLayer.addChild(graphics);
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
}
