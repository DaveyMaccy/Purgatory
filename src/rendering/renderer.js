/**
 * Enhanced Renderer with Character Animation System
 * Handles character sprite animation, facing direction, and collision-aware obstacles
 * 
 * FIXES APPLIED:
 * - Updated to optimized 960×540 resolution (16:9, +44% area)
 * - Better responsive scaling and aspect ratio handling
 * - Enhanced error handling and status reporting
 * - Improved console logging with dimension info
 */
export class Renderer {
    constructor(container) {
        this.container = container;
        this.app = null;
        this.isInitialized = false;
        
        // UPDATED: Optimized world settings for better space usage (16:9 aspect ratio)
        this.WORLD_WIDTH = 960;   // Was 800 - now 20% larger  
        this.WORLD_HEIGHT = 540;  // Was 450 - now 20% larger (960÷540 = 1.777... = 16:9)
        this.CHARACTER_WIDTH = 48;
        this.CHARACTER_HEIGHT = 96;
        
        // Layers
        this.mapLayer = null;
        this.obstacleLayer = null;
        this.characterLayer = null;
        
        // Character management
        this.characterSprites = new Map();
        this.characterAnimations = new Map();
        
        // Animation frame tracking
        this.animationTimer = 0;
        this.walkAnimationSpeed = 200; // milliseconds per frame
        
        console.log(`🎨 Renderer constructor called with optimized 16:9 aspect ratio: ${this.WORLD_WIDTH}×${this.WORLD_HEIGHT}`);
    }

    /**
     * Initialize the PixiJS renderer with enhanced animation support
     */
    async initialize() {
        try {
            console.log(`🔧 Initializing PixiJS renderer with optimized 16:9 dimensions: ${this.WORLD_WIDTH}×${this.WORLD_HEIGHT}...`);

            // Create PixiJS application with optimized dimensions
            this.app = new PIXI.Application({
                width: this.WORLD_WIDTH,
                height: this.WORLD_HEIGHT,
                backgroundColor: 0xf0f0f0,
                antialias: true,
                resolution: 1
            });

            // Create layers in order (back to front)
            this.mapLayer = new PIXI.Container();
            this.obstacleLayer = new PIXI.Container();
            this.characterLayer = new PIXI.Container();
            
            this.app.stage.addChild(this.mapLayer);
            this.app.stage.addChild(this.obstacleLayer);
            this.app.stage.addChild(this.characterLayer);

            // Append to container
            if (this.container) {
                this.container.innerHTML = '';
                this.container.appendChild(this.app.view);
                console.log(`📐 Canvas size calculated: ${this.WORLD_WIDTH}×${this.WORLD_HEIGHT}`);
            }

            // Set up resize handling
            this.resizeHandler = () => this.handleResize();
            window.addEventListener('resize', this.resizeHandler);

            this.isInitialized = true;
            console.log(`✅ PixiJS renderer initialized: ${this.WORLD_WIDTH}×${this.WORLD_HEIGHT} (16:9, optimized)`);

        } catch (error) {
            console.error('❌ Failed to initialize PixiJS renderer:', error);
            throw error;
        }
    }

    /**
     * Handle window resize with improved aspect ratio handling
     */
    handleResize() {
        if (!this.app || !this.container) return;
        
        const containerRect = this.container.getBoundingClientRect();
        const aspectRatio = 16 / 9;
        
        let newWidth = containerRect.width;
        let newHeight = newWidth / aspectRatio;
        
        if (newHeight > containerRect.height) {
            newHeight = containerRect.height;
            newWidth = newHeight * aspectRatio;
        }
        
        this.app.renderer.resize(newWidth, newHeight);
        
        // Scale the stage to maintain aspect ratio
        const scaleX = newWidth / this.WORLD_WIDTH;
        const scaleY = newHeight / this.WORLD_HEIGHT;
        const scale = Math.min(scaleX, scaleY);
        
        this.app.stage.scale.set(scale);
        
        console.log(`🔄 Renderer resized: ${newWidth.toFixed(0)}×${newHeight.toFixed(0)} (scale: ${scale.toFixed(2)})`);
    }

    /**
     * Render the map with obstacles
     * @param {Object} mapData - Map data from JSON
     */
    renderMap(mapData) {
        if (!this.isInitialized) {
            console.error('❌ Renderer not initialized');
            return;
        }

        console.log('🗺️ Rendering map with optimized 16:9 layout...');

        // Clear existing map content
        this.mapLayer.removeChildren();
        this.obstacleLayer.removeChildren();

        // Create floor background
        const floor = new PIXI.Graphics();
        floor.beginFill(0xe8f4f8); // Light blue office floor
        floor.drawRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        floor.endFill();
        this.mapLayer.addChild(floor);

        // Add office walls
        this.renderWalls();
        
        // Add office obstacles (desks, tables, etc.)
        this.renderOfficeObstacles();

        console.log('✅ Map rendered successfully in optimized 16:9 format');
    }

    /**
     * Render office walls
     */
    renderWalls() {
        const graphics = new PIXI.Graphics();
        
        // Wall styling
        graphics.lineStyle(4, 0x333333);
        
        // Outer walls
        graphics.drawRect(4, 4, this.WORLD_WIDTH - 8, this.WORLD_HEIGHT - 8);
        
        this.obstacleLayer.addChild(graphics);
    }

    /**
     * Render office obstacles (desks, tables, etc.)
     */
    renderOfficeObstacles() {
        const graphics = new PIXI.Graphics();
        
        // Desk styling
        graphics.lineStyle(2, 0x8B4513);
        graphics.beginFill(0xDEB887);
        
        // Sample desks positioned for 20×11 grid (optimized layout)
        const desks = [
            { x: 100, y: 100, width: 120, height: 60 },
            { x: 280, y: 150, width: 120, height: 60 },
            { x: 450, y: 200, width: 120, height: 60 },
            { x: 620, y: 100, width: 120, height: 60 },
            { x: 100, y: 300, width: 120, height: 60 },
            { x: 350, y: 350, width: 120, height: 60 },
            { x: 600, y: 280, width: 120, height: 60 }
        ];
        
        // Draw desks
        desks.forEach(desk => {
            graphics.drawRect(desk.x, desk.y, desk.width, desk.height);
        });
        
        graphics.endFill();
        
        // Add some meeting tables
        graphics.lineStyle(2, 0x654321);
        graphics.beginFill(0xD2691E);
        
        const tables = [
            { x: 200, y: 250, width: 100, height: 80 },
            { x: 500, y: 350, width: 100, height: 80 }
        ];
        
        tables.forEach(table => {
            graphics.drawRect(table.x, table.y, table.width, table.height);
        });
        
        graphics.endFill();
        this.obstacleLayer.addChild(graphics);
    }

    /**
     * Add character sprite to the renderer
     * @param {Object} character - Character data
     */
    async addCharacter(character) {
        if (!this.isInitialized) {
            console.warn('⚠️ Cannot add character: renderer not initialized');
            return;
        }

        console.log('👤 Adding character sprite for', character.name);

        try {
            // Create character container
            const characterContainer = new PIXI.Container();
            
            // Try to load character sprite, fallback to placeholder
            let characterSprite;
            try {
                if (character.spriteSheet && character.spriteSheet !== 'placeholder') {
                    const texture = await PIXI.Texture.from(`./assets/characters/${character.spriteSheet}.png`);
                    characterSprite = this.createAnimatedSprite(texture, character);
                } else {
                    throw new Error('No sprite sheet specified');
                }
            } catch (spriteError) {
                console.warn(`⚠️ Failed to load sprite for ${character.name}, using placeholder:`, spriteError.message);
                characterSprite = this.createPlaceholderSprite(character);
            }
            
            // Position character
            characterSprite.x = character.position?.x || 100;
            characterSprite.y = character.position?.y || 100;
            
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
        }
    }

    /**
     * Update character position and animation
     * @param {Object} character - Character data
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
     * @param {string} characterId - Character ID
     */
    updateCharacterAnimation(characterId) {
        const animData = this.characterAnimations.get(characterId);
        if (!animData) return;
        
        // Update walk frame if walking
        if (animData.isWalking) {
            this.animationTimer += 16; // Assuming ~60fps
            if (this.animationTimer >= this.walkAnimationSpeed) {
                animData.walkFrame = (animData.walkFrame + 1) % 4; // 4 frames per direction
                this.animationTimer = 0;
            }
        }
        
        // Update sprite texture based on facing direction and frame
        const frameWidth = this.CHARACTER_WIDTH;
        const frameHeight = this.CHARACTER_HEIGHT;
        
        let directionRow = 0;
        switch (animData.facing) {
            case 'down': directionRow = 0; break;
            case 'up': directionRow = 1; break;
            case 'left': directionRow = 2; break;
            case 'right': directionRow = 3; break;
        }
        
        const frameX = animData.walkFrame * frameWidth;
        const frameY = directionRow * frameHeight;
        
        // Update sprite texture region (if using spritesheet)
        if (animData.sprite.texture.baseTexture) {
            try {
                const newTexture = new PIXI.Texture(
                    animData.sprite.texture.baseTexture,
                    new PIXI.Rectangle(frameX, frameY, frameWidth, frameHeight)
                );
                animData.sprite.texture = newTexture;
            } catch (error) {
                // Fallback: just rotate placeholder sprite based on direction
                if (animData.sprite instanceof PIXI.Graphics) {
                    let rotation = 0;
                    switch (animData.facing) {
                        case 'up': rotation = -Math.PI / 2; break;
                        case 'down': rotation = Math.PI / 2; break;
                        case 'left': rotation = Math.PI; break;
                        case 'right': rotation = 0; break;
                    }
                    animData.sprite.rotation = rotation;
                }
            }
        }
    }

    /**
     * Create animated sprite from spritesheet
     * @param {PIXI.Texture} texture - Spritesheet texture
     * @param {Object} character - Character data
     * @returns {PIXI.Sprite} Animated sprite
     */
    createAnimatedSprite(texture, character) {
        // For now, create a simple sprite from the first frame (down-facing idle)
        // The spritesheet has 4 directions x 4 frames each = 16 frames total
        // Layout: [down-idle, down-walk1, down-walk2, down-walk3, 
        //          up-idle, up-walk1, up-walk2, up-walk3,
        //          left-idle, left-walk1, left-walk2, left-walk3,
        //          right-idle, right-walk1, right-walk2, right-walk3]
        
        const frameWidth = this.CHARACTER_WIDTH;
        const frameHeight = this.CHARACTER_HEIGHT;
        
        // Create texture for down-facing idle (first frame)
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
     * @param {Object} character - Character data
     * @returns {PIXI.Graphics} Placeholder sprite
     */
    createPlaceholderSprite(character) {
        const graphics = new PIXI.Graphics();
        
        // Body (rectangle)
        graphics.beginFill(character.color || 0x3498db);
        graphics.drawRect(-this.CHARACTER_WIDTH/2, -this.CHARACTER_HEIGHT, this.CHARACTER_WIDTH, this.CHARACTER_HEIGHT);
        graphics.endFill();
        
        // Head (circle)
        graphics.beginFill(0xffdbac);
        graphics.drawCircle(0, -this.CHARACTER_HEIGHT + 15, 12);
        graphics.endFill();
        
        // Name label
        const nameText = new PIXI.Text(character.name || 'Character', {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x000000,
            align: 'center'
        });
        nameText.anchor.set(0.5, 1);
        nameText.x = 0;
        nameText.y = -this.CHARACTER_HEIGHT - 5;
        
        graphics.addChild(nameText);
        
        return graphics;
    }

    /**
     * Remove character sprite
     * @param {string} characterId - Character ID
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
            // Update all character animations
            this.characterAnimations.forEach((animData, characterId) => {
                if (animData.isWalking) {
                    this.updateCharacterAnimation(characterId);
                }
            });
            
            this.app.render();
        }
    }

    /**
     * Cleanup
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
     * Get world bounds for camera/movement systems
     */
    getWorldBounds() {
        return {
            width: this.WORLD_WIDTH,    // 960
            height: this.WORLD_HEIGHT,  // 540
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
            canvasSize: `${this.WORLD_WIDTH}×${this.WORLD_HEIGHT}`,
            aspectRatio: '16:9 (optimized)',
            improvement: '+44% area vs previous 800×450',
            animationData: Array.from(this.characterAnimations.entries()).map(([id, data]) => ({
                characterId: id,
                facing: data.facing,
                isWalking: data.isWalking,
                walkFrame: data.walkFrame
            }))
        };
    }
}
