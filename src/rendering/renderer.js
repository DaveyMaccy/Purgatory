/**
 * Enhanced Renderer with Character Animation System
 * Handles character sprite animation, facing direction, and collision-aware obstacles
 */
export class Renderer {
    constructor(container) {
        this.container = container;
        this.app = null;
        this.isInitialized = false;
        
        // World settings for 16:9 aspect ratio
        this.WORLD_WIDTH = 800;
        this.WORLD_HEIGHT = 450;
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
        
        console.log('🎨 Renderer constructor called with 16:9 aspect ratio');
    }

    /**
     * Initialize the PixiJS renderer with enhanced animation support
     */
    async initialize() {
        try {
            console.log('🔧 Initializing PixiJS renderer with 16:9 aspect ratio...');

            // Create PixiJS application
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
                console.log(`📐 Canvas size calculated: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT}`);
            }

            // Set up resize handling
            this.resizeHandler = () => this.handleResize();
            window.addEventListener('resize', this.resizeHandler);

            this.isInitialized = true;
            console.log(`✅ PixiJS renderer initialized: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT} (16:9)`);

        } catch (error) {
            console.error('❌ Failed to initialize PixiJS renderer:', error);
            throw error;
        }
    }

    /**
     * Handle window resize
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

        console.log('🗺️ Rendering map with 16:9 layout...');

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

        console.log('✅ Map rendered successfully in 16:9 format');
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
     * Render office obstacles (desks, tables, etc.) that characters should collide with
     */
    renderOfficeObstacles() {
        // Define desk positions that match the collision grid
        const obstacles = [
            // Top row desks
            { x: 100, y: 150, width: 140, height: 60, type: 'desk', label: 'Desk 1' },
            { x: 280, y: 150, width: 140, height: 60, type: 'desk', label: 'Desk 2' },
            { x: 460, y: 150, width: 140, height: 60, type: 'desk', label: 'Desk 3' },
            
            // Bottom row desks
            { x: 100, y: 300, width: 140, height: 60, type: 'desk', label: 'Desk 4' },
            { x: 280, y: 300, width: 140, height: 60, type: 'desk', label: 'Desk 5' },
            
            // Meeting table
            { x: 500, y: 280, width: 120, height: 80, type: 'table', label: 'Meeting Table' },
            
            // Break room area
            { x: 650, y: 100, width: 100, height: 50, type: 'counter', label: 'Break Counter' }
        ];

        obstacles.forEach(obstacle => {
            const graphics = new PIXI.Graphics();
            
            // Set color based on type
            let color = 0x8B4513; // Brown for desks
            if (obstacle.type === 'table') color = 0x654321; // Darker brown for tables
            if (obstacle.type === 'counter') color = 0xA0522D; // Lighter brown for counters
            
            // Draw obstacle
            graphics.beginFill(color);
            graphics.drawRoundedRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 8);
            graphics.endFill();
            
            // Add border
            graphics.lineStyle(2, 0x444444);
            graphics.drawRoundedRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 8);
            
            // Add label
            const label = new PIXI.Text(obstacle.label, {
                fontFamily: 'Arial',
                fontSize: 10,
                fill: 0xffffff,
                align: 'center'
            });
            label.anchor.set(0.5);
            label.x = obstacle.x + obstacle.width / 2;
            label.y = obstacle.y + obstacle.height / 2;
            
            this.obstacleLayer.addChild(graphics);
            this.obstacleLayer.addChild(label);
        });
    }

    /**
     * Add character with animation support
     * @param {Object} character - Character data
     */
    async addCharacter(character) {
        if (!this.isInitialized) {
            console.error('❌ Renderer not initialized');
            return;
        }

        try {
            console.log(`👤 Adding character sprite for ${character.name}`);

            let characterContainer = new PIXI.Container();
            let sprite;

            // Try to load character spritesheet
            if (character.spriteSheet) {
                try {
                    // Load the full spritesheet texture
                    const texture = await PIXI.Texture.fromURL(character.spriteSheet);
                    
                    // Create animated sprite with walk cycle
                    sprite = this.createAnimatedSprite(texture, character);
                    
                } catch (spriteError) {
                    console.warn(`⚠️ Failed to load sprite for ${character.name}, using placeholder:`, spriteError);
                    sprite = this.createPlaceholderSprite(character);
                }
            } else {
                // Create placeholder sprite
                sprite = this.createPlaceholderSprite(character);
            }
            
            // Set up character container
            characterContainer.addChild(sprite);
            
            // Set position
            characterContainer.x = character.position?.x || (this.WORLD_WIDTH / 2);
            characterContainer.y = character.position?.y || (this.WORLD_HEIGHT / 2);
            
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
            characterContainer.addChild(nameText);

            // Add player indicator if this is the player
            if (character.isPlayer) {
                const playerIndicator = new PIXI.Graphics();
                playerIndicator.beginFill(0x00ff00); // Green circle
                playerIndicator.drawCircle(0, -this.CHARACTER_HEIGHT - 20, 5);
                playerIndicator.endFill();
                characterContainer.addChild(playerIndicator);
            }

            // Store character data
            this.characterSprites.set(character.id, characterContainer);
            this.characterAnimations.set(character.id, {
                sprite: sprite,
                facing: 'down', // down, up, left, right
                isWalking: false,
                walkFrame: 0,
                lastUpdate: 0,
                lastPosition: { x: characterContainer.x, y: characterContainer.y }
            });
            
            this.characterLayer.addChild(characterContainer);
            
            console.log(`✅ Character sprite added for ${character.name} at (${characterContainer.x}, ${characterContainer.y})`);

        } catch (error) {
            console.error(`❌ Failed to add character ${character.name}:`, error);
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
        graphics.beginFill(0xfdbcb4); // Skin tone
        graphics.drawCircle(0, -this.CHARACTER_HEIGHT + 15, 12);
        graphics.endFill();
        
        // Simple face
        graphics.beginFill(0x000000);
        graphics.drawCircle(-4, -this.CHARACTER_HEIGHT + 12, 1); // Left eye
        graphics.drawCircle(4, -this.CHARACTER_HEIGHT + 12, 1);  // Right eye
        graphics.endFill();
        
        // Direction indicator (small triangle pointing down)
        graphics.beginFill(0xff0000);
        graphics.drawPolygon([0, -this.CHARACTER_HEIGHT + 25, -3, -this.CHARACTER_HEIGHT + 20, 3, -this.CHARACTER_HEIGHT + 20]);
        graphics.endFill();
        
        return graphics;
    }

    /**
     * Update character position and animation
     * @param {string} characterId - Character ID
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    updateCharacterPosition(characterId, x, y) {
        const characterContainer = this.characterSprites.get(characterId);
        const animData = this.characterAnimations.get(characterId);
        
        if (!characterContainer || !animData) return;
        
        // Calculate movement direction
        const oldX = characterContainer.x;
        const oldY = characterContainer.y;
        const deltaX = x - oldX;
        const deltaY = y - oldY;
        const isMoving = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1;
        
        // Update position
        characterContainer.x = x;
        characterContainer.y = y;
        
        // Update facing direction and animation state
        if (isMoving) {
            // Determine primary direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                animData.facing = deltaX > 0 ? 'right' : 'left';
            } else {
                animData.facing = deltaY > 0 ? 'down' : 'up';
            }
            animData.isWalking = true;
        } else {
            animData.isWalking = false;
        }
        
        // Update sprite animation based on direction and movement
        this.updateCharacterAnimation(characterId);
    }

    /**
     * Update character animation based on movement state
     * @param {string} characterId - Character ID
     */
    updateCharacterAnimation(characterId) {
        const animData = this.characterAnimations.get(characterId);
        if (!animData || !animData.sprite.texture) return;
        
        const currentTime = Date.now();
        
        // Only update animation frame if walking and enough time has passed
        if (animData.isWalking && currentTime - animData.lastUpdate > this.walkAnimationSpeed) {
            animData.walkFrame = (animData.walkFrame + 1) % 4; // 4 frames per direction
            animData.lastUpdate = currentTime;
        } else if (!animData.isWalking) {
            animData.walkFrame = 0; // Idle frame
        }
        
        // Calculate frame position in spritesheet
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
            aspectRatio: '16:9',
            animationData: Array.from(this.characterAnimations.entries()).map(([id, data]) => ({
                characterId: id,
                facing: data.facing,
                isWalking: data.isWalking,
                walkFrame: data.walkFrame
            }))
        };
    }
}
