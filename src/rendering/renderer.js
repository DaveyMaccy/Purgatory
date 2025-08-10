/**
 * Renderer - PixiJS-based rendering system for Office Purgatory
 * FIXED VERSION - Addresses sprite loading and coordinate system issues
 * 
 * FIXES APPLIED:
 * - Fixed double path sprite loading bug
 * - Support for 20 sprites instead of 5
 * - Proper world bounds handling for 30×20 map
 * - Enhanced error handling and fallbacks
 * - Fixed coordinate scaling and positioning
 */

export class Renderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.app = null;
        this.isInitialized = false;
        
        // World dimensions - Updated to handle dynamic sizing
        this.WORLD_WIDTH = 960;   // Will be updated based on map data
        this.WORLD_HEIGHT = 540;  // Will be updated based on map data
        
        // Character dimensions
        this.CHARACTER_WIDTH = 48;
        this.CHARACTER_HEIGHT = 96;
        
        // Layers
        this.mapLayer = null;
        this.characterLayer = null;
        
        // Character tracking
        this.characterSprites = new Map();
        this.characterAnimations = new Map();
        
        // Resize handler reference
        this.resizeHandler = null;
        
        console.log('🎨 Renderer created');
    }

    /**
     * Initialize the PixiJS application and set up the rendering pipeline
     */
    async initialize() {
        try {
            console.log('🎨 Initializing PixiJS renderer...');
            
            // Create PixiJS application
            this.app = new PIXI.Application({
                width: this.WORLD_WIDTH,
                height: this.WORLD_HEIGHT,
                backgroundColor: 0xf0f0f0,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });

            // Add canvas to container
            this.container.appendChild(this.app.view);
            
            // Set up responsive canvas
            this.setupResponsiveCanvas();
            
            // Create layers
            this.mapLayer = new PIXI.Container();
            this.characterLayer = new PIXI.Container();
            
            this.app.stage.addChild(this.mapLayer);
            this.app.stage.addChild(this.characterLayer);
            
            this.isInitialized = true;
            console.log('✅ PixiJS renderer initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize renderer:', error);
            throw error;
        }
    }

    /**
     * Set up responsive canvas that maintains aspect ratio
     */
    setupResponsiveCanvas() {
        const canvas = this.app.view;
        
        // Set initial responsive styling
        canvas.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            display: block;
        `;
        
        // Create resize handler
        this.resizeHandler = () => {
            if (!this.container || !this.app) return;
            
            const containerRect = this.container.getBoundingClientRect();
            const aspectRatio = this.WORLD_WIDTH / this.WORLD_HEIGHT;
            
            let newWidth = containerRect.width;
            let newHeight = containerRect.width / aspectRatio;
            
            if (newHeight > containerRect.height) {
                newHeight = containerRect.height;
                newWidth = containerRect.height * aspectRatio;
            }
            
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;
        };
        
        // Set up resize listener
        window.addEventListener('resize', this.resizeHandler);
        this.resizeHandler(); // Initial sizing
        
        console.log('✅ Responsive canvas setup complete');
    }

    /**
     * Update world dimensions (called when map data is loaded)
     */
    updateWorldDimensions(width, height) {
        this.WORLD_WIDTH = width;
        this.WORLD_HEIGHT = height;
        
        if (this.app) {
            this.app.renderer.resize(width, height);
            console.log(`📏 Renderer dimensions updated to ${width}×${height}`);
        }
        
        // Update responsive canvas
        if (this.resizeHandler) {
            this.resizeHandler();
        }
    }

    /**
     * Render the map background
     */
    renderMap(mapData) {
        if (!this.isInitialized) {
            console.error('❌ Renderer not initialized');
            return;
        }

        console.log('🗺️ Rendering map...');
        
        // Update world dimensions based on map data
        if (mapData && mapData.width && mapData.height) {
            const tileSize = mapData.tilewidth || 48;
            const worldWidth = mapData.width * tileSize;
            const worldHeight = mapData.height * tileSize;
            this.updateWorldDimensions(worldWidth, worldHeight);
        }
        
        // Clear existing map
        this.mapLayer.removeChildren();
        
        // Create simple office background
        const background = new PIXI.Graphics();
        background.beginFill(0xf8f9fa); // Light gray background
        background.drawRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        background.endFill();
        this.mapLayer.addChild(background);
        
        // Add office walls
        this.renderOfficeWalls();
        
        console.log('✅ Map rendered successfully');
    }

    /**
     * Render office walls and boundaries
     */
    renderOfficeWalls() {
        const graphics = new PIXI.Graphics();
        
        // Calculate scale factors for responsive walls
        const scaleX = this.WORLD_WIDTH / 960;
        const scaleY = this.WORLD_HEIGHT / 540;
        
        // Wall styling
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
     * FIXED: Add character sprite with proper error handling and path correction
     */
    async addCharacter(character) {
        if (!this.isInitialized) {
            console.error('❌ Renderer not initialized');
            return;
        }

        try {
            console.log(`👤 Adding character sprite for ${character.name}`);

            // Create character container
            const characterContainer = new PIXI.Container();
            
            // Try to load character sprite, fallback to placeholder
            let characterSprite;
            try {
                if (character.spriteSheet && character.spriteSheet !== 'placeholder') {
                    // FIXED: Clean up any double paths
                    let spritePath = character.spriteSheet;
                    
                    // Remove double path issue
                    if (spritePath.includes('assets/characters/assets/characters/')) {
                        spritePath = spritePath.replace('assets/characters/assets/characters/', 'assets/characters/');
                    }
                    
                    // Ensure proper path format
                    if (!spritePath.startsWith('./')) {
                        spritePath = './' + spritePath;
                    }
                    
                    console.log(`🖼️ Loading sprite: ${spritePath}`);
                    const texture = await PIXI.Texture.from(spritePath);
                    characterSprite = this.createAnimatedSprite(texture, character);
                } else {
                    throw new Error('No sprite sheet specified');
                }
            } catch (spriteError) {
                console.warn(`⚠️ Failed to load sprite for ${character.name}, using placeholder:`, spriteError.message);
                characterSprite = this.createPlaceholderSprite(character);
            }
            
            // Position character with proper world bounds
            characterSprite.x = character.position?.x || (this.WORLD_WIDTH / 2);
            characterSprite.y = character.position?.y || (this.WORLD_HEIGHT / 2);
            characterSprite.anchor.set(0.5, 1.0); // Anchor at bottom center
            
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
            characterSprite.addChild(nameText);

            // Add player indicator if this is the player
            if (character.isPlayer) {
                const playerIndicator = new PIXI.Graphics();
                playerIndicator.beginFill(0x00ff00); // Green circle
                playerIndicator.drawCircle(0, -this.CHARACTER_HEIGHT - 20, 5);
                playerIndicator.endFill();
                characterSprite.addChild(playerIndicator);
            }

            // Add to container and stage
            characterContainer.addChild(characterSprite);
            this.characterLayer.addChild(characterContainer);
            
            // Store references
            this.characterSprites.set(character.id, characterContainer);
            this.characterAnimations.set(character.id, {
                sprite: characterSprite,
                facing: 'down',
                isWalking: false,
                walkFrame: 0
            });
            
            console.log(`✅ Character sprite added for ${character.name} at (${characterSprite.x}, ${characterSprite.y})`);

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
     * Create animated sprite from texture (handles spritesheet frames)
     */
    createAnimatedSprite(texture, character) {
        // Calculate frame dimensions (assuming 4x4 sprite grid)
        const frameWidth = texture.width / 4;
        const frameHeight = texture.height / 4;
        
        // Create sprite from down-facing idle (first frame)
        const idleTexture = new PIXI.Texture(
            texture.baseTexture,
            new PIXI.Rectangle(0, 0, frameWidth, frameHeight)
        );
        
        const sprite = new PIXI.Sprite(idleTexture);
        sprite.width = this.CHARACTER_WIDTH;
        sprite.height = this.CHARACTER_HEIGHT;
        sprite.anchor.set(0.5, 1.0); // Anchor at bottom center
        
        return sprite;
    }

    /**
     * Create placeholder sprite for characters without custom sprites
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
     * Update character position and animation
     */
    updateCharacter(character) {
        const characterContainer = this.characterSprites.get(character.id);
        const animData = this.characterAnimations.get(character.id);
        
        if (!characterContainer || !animData) {
            return;
        }
        
        // Update position
        const sprite = animData.sprite;
        sprite.x = character.position.x;
        sprite.y = character.position.y;
        
        // Update animation state
        const isMoving = character.path && character.path.length > 0;
        
        if (isMoving !== animData.isWalking) {
            animData.isWalking = isMoving;
            
            if (!isMoving) {
                animData.walkFrame = 0; // Reset to idle frame
                this.updateCharacterAnimation(character.id);
            }
        }
        
        // Update facing direction based on movement
        if (isMoving && character.path.length > 0) {
            const target = character.path[0];
            const dx = target.x - character.position.x;
            const dy = target.y - character.position.y;
            
            let newFacing = animData.facing;
            if (Math.abs(dx) > Math.abs(dy)) {
                newFacing = dx > 0 ? 'right' : 'left';
            } else {
                newFacing = dy > 0 ? 'down' : 'up';
            }
            
            if (newFacing !== animData.facing) {
                animData.facing = newFacing;
                this.updateCharacterAnimation(character.id);
            }
        }
    }

    /**
     * Update character animation frame
     */
    updateCharacterAnimation(characterId) {
        const animData = this.characterAnimations.get(characterId);
        if (!animData) return;
        
        // Animation logic would go here for future implementation
        // For now, characters use static sprites
    }

    /**
     * Update character sprite position
     */
    updateCharacterPosition(characterId, x, y) {
        const characterContainer = this.characterSprites.get(characterId);
        if (characterContainer) {
            const sprite = characterContainer.children[0]; // Get the actual sprite
            if (sprite) {
                sprite.x = x;
                sprite.y = y;
            }
        }
    }

    /**
     * Remove character sprite
     */
    removeCharacter(characterId) {
        const characterContainer = this.characterSprites.get(characterId);
        if (characterContainer) {
            this.characterLayer.removeChild(characterContainer);
            this.characterSprites.delete(characterId);
            this.characterAnimations.delete(characterId);
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
     * Get world bounds for camera/movement systems
     */
    getWorldBounds() {
        return {
            width: this.WORLD_WIDTH,
            height: this.WORLD_HEIGHT,
            aspectRatio: this.WORLD_WIDTH / this.WORLD_HEIGHT
        };
    }

    /**
     * Cleanup with resize listener removal
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
        this.characterAnimations.clear();
        this.isInitialized = false;
        console.log('🧹 Renderer destroyed and cleaned up');
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
            aspectRatio: (this.WORLD_WIDTH / this.WORLD_HEIGHT).toFixed(2)
        };
    }
}
