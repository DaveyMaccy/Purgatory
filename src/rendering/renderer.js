/**
 * REPAIRED: Complete Rendering System with a Functional Animation Engine
 *
 * DO NOT EDIT WITHOUT EXPRESS PERMISSION!
 *
 * FINAL AUDIT COMPLETE:
 * - Rebuilt the animationData map from scratch based on corrected row numbers.
 * - All animations are now correctly mapped to the sprite sheet.
 */

const USE_ENHANCED_SPRITES = true;
const SPRITE_WIDTH = 48;
const SPRITE_HEIGHT = 96;

// animationData map rebuilt based on the final, corrected user notes.
const animationData = {
    'idle': {
        frames: 6,
        loop: true,
        frameSpeed: 0.15,
        directions: {
            'right': { y: 1 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 1 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 1 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down': { y: 1 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    'walking': {
        frames: 6,
        loop: true,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 2 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 2 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 2 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down': { y: 2 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    'sit': {
        frames: 6,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 4 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'left': { y: 4 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH }
        }
    },
    'phone': {
        frames: 12,
        loop: false,
        loopSection: { start: 3, end: 8 },
        frameSpeed: 0.12,
        directions: {
            'down': { y: 6 * SPRITE_HEIGHT, x: 0 }
        }
    },
    'book': {
        frames: 12,
        loop: true,
        frameSpeed: 0.15,
        directions: {
            'down': { y: 7 * SPRITE_HEIGHT, x: 0 }
        }
    },
    'pickup': {
        frames: 12,
        loop: false,
        frameSpeed: 0.08,
        directions: {
            'right': { y: 9 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 9 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'left': { y: 9 * SPRITE_HEIGHT, x: 24 * SPRITE_WIDTH },
            'down': { y: 9 * SPRITE_HEIGHT, x: 36 * SPRITE_WIDTH }
        }
    },
    'give': {
        frames: 9,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 10 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 10 * SPRITE_HEIGHT, x: 9 * SPRITE_WIDTH },
            'left': { y: 10 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH },
            'down': { y: 10 * SPRITE_HEIGHT, x: 27 * SPRITE_WIDTH }
        }
    },
    'lift': {
        frames: 14,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 11 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 11 * SPRITE_HEIGHT, x: 14 * SPRITE_WIDTH },
            'left': { y: 11 * SPRITE_HEIGHT, x: 28 * SPRITE_WIDTH },
            'down': { y: 11 * SPRITE_HEIGHT, x: 42 * SPRITE_WIDTH }
        }
    },
    'throw': {
        frames: 14,
        loop: false,
        frameSpeed: 0.07,
        directions: {
            'right': { y: 12 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 12 * SPRITE_HEIGHT, x: 14 * SPRITE_WIDTH },
            'left': { y: 12 * SPRITE_HEIGHT, x: 28 * SPRITE_WIDTH },
            'down': { y: 12 * SPRITE_HEIGHT, x: 42 * SPRITE_WIDTH }
        }
    },
    'hit': {
        frames: 6,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 13 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 13 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 13 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down': { y: 13 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    'punch': {
        frames: 6,
        loop: false,
        frameSpeed: 0.08,
        directions: {
            'right': { y: 14 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 14 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 14 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down': { y: 14 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    }
};

export class Renderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.app = null;
        this.worldContainer = null;
        this.characterSprites = new Map();
        this.preloadedTextures = new Map();
        this.mapSprites = [];
        this.tilesetTextures = new Map();
        this.mapTileSprites = [];
        this.isInitialized = false;
        this.TILE_SIZE = 48;
        this.CHARACTER_WIDTH = SPRITE_WIDTH;
        this.CHARACTER_HEIGHT = SPRITE_HEIGHT;
        this.BASE_WIDTH = 1280;
        this.BASE_HEIGHT = 720;
        this.WORLD_WIDTH = this.BASE_WIDTH;
        this.WORLD_HEIGHT = this.BASE_HEIGHT;
        this.cameraX = 0;
        this.cameraY = 0;
        this.followTarget = null;

if (USE_ENHANCED_SPRITES) {
            console.log('🎨 Enhanced Renderer with Animation Engine enabled');
        } else {
            console.log('🎨 Renderer constructor (enhanced sprites DORMANT)');
        }
    }

    async preloadCharacterSprites() {
        if (!USE_ENHANCED_SPRITES) {
            console.log('💤 Sprite preloading DORMANT - skipping');
            return 0;
        }
        console.log('🔄 Preloading character sprite textures...');
        const spritePromises = [];
        for (let i = 1; i <= 20; i++) {
            const paddedNumber = i.toString().padStart(2, '0');
            const spritePath = `assets/characters/character-${paddedNumber}.png`;
            const promise = this.loadSpriteTexture(spritePath).catch(error => {
                console.warn(`⚠️ Failed to preload sprite: ${spritePath}`, error);
                return null;
            });
            spritePromises.push(promise);
        }
        const results = await Promise.allSettled(spritePromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log(`✅ Preloaded ${successCount}/20 character sprites`);
        return successCount;
    }

    async loadSpriteTexture(spritePath) {
        if (!USE_ENHANCED_SPRITES) {
            throw new Error('Enhanced sprites are dormant');
        }
        if (this.preloadedTextures.has(spritePath)) {
            return this.preloadedTextures.get(spritePath);
        }
        try {
            const texture = await PIXI.Texture.fromURL(spritePath);
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

    async initialize(mapData) {
        try {
            if (USE_ENHANCED_SPRITES) {
                console.log('🔧 Initializing enhanced PixiJS renderer with sprite preloading...');
            } else {
                console.log('🔧 Initializing PixiJS renderer (enhanced sprites dormant)...');
            }
            if (!this.container) {
                throw new Error('Container element is required for renderer initialization');
            }

            this.calculateCanvasSize();
            this.app = new PIXI.Application({
                width: this.WORLD_WIDTH,
                height: this.WORLD_HEIGHT,
                backgroundColor: 0x2c3e50,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });
            this.setupResponsiveCanvas();
            this.container.appendChild(this.app.view);

            this.worldContainer = new PIXI.Container();
            this.app.stage.addChild(this.worldContainer);

            this.mapLayer = new PIXI.Container();
            this.characterLayer = new PIXI.Container();
            this.worldContainer.addChild(this.mapLayer);
            this.worldContainer.addChild(this.characterLayer);

            this.setupResizeListener();

            let preloadedCount = 0;
            if (USE_ENHANCED_SPRITES) {
                preloadedCount = await this.preloadCharacterSprites();
                console.log(`🎮 Sprite preloading complete: ${preloadedCount} textures cached`);
            } else {
                console.log('💤 Sprite preloading skipped (dormant mode)');
            }

            if (mapData) {
                // Load tilesets first, then render
                if (mapData.tilesets && mapData.tilesets.length > 0) {
                    await this.loadTilesets(mapData.tilesets);
                    this.renderTilemap(mapData);
                } else {
                    console.log('📍 No tilesets found, using fallback map rendering');
                    this.renderMap(mapData);
                }
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

    calculateCanvasSize() {
        if (!this.container) {
            console.warn('⚠️ No container provided, using fallback dimensions');
            this.WORLD_WIDTH = this.BASE_WIDTH;
            this.WORLD_HEIGHT = this.BASE_HEIGHT;
            return;
        }

        const containerRect = this.container.getBoundingClientRect();
        const containerWidth = containerRect.width || this.container.clientWidth || 800;
        const containerHeight = containerRect.height || this.container.clientHeight || 600;

        const targetAspectRatio = 16 / 9;
        const containerAspectRatio = containerWidth / containerHeight;

        if (containerAspectRatio > targetAspectRatio) {
            this.WORLD_HEIGHT = Math.min(containerHeight * 0.85, this.BASE_HEIGHT);
            this.WORLD_WIDTH = this.WORLD_HEIGHT * targetAspectRatio;
        } else {
            this.WORLD_WIDTH = Math.min(containerWidth * 0.85, this.BASE_WIDTH);
            this.WORLD_HEIGHT = this.WORLD_WIDTH / targetAspectRatio;
        }

        this.WORLD_WIDTH = Math.max(this.WORLD_WIDTH, 800);
        this.WORLD_HEIGHT = Math.max(this.WORLD_HEIGHT, 450);
        console.log(`📐 Canvas sized: ${this.WORLD_WIDTH}x${this.WORLD_HEIGHT} (16:9 aspect ratio)`);
    }

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

    renderMap(mapData) {
        console.log('🗺️ Rendering office map...');
        this.mapSprites.forEach(sprite => {
            this.mapLayer.removeChild(sprite);
        });
        this.mapSprites = [];

        const background = new PIXI.Graphics();
        background.beginFill(0x95a5a6);
        background.drawRect(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        background.endFill();
        this.mapLayer.addChild(background);
        this.mapSprites.push(background);

        const walls = new PIXI.Graphics();
        walls.beginFill(0x2c3e50);
        const wallThickness = 20;
        walls.drawRect(0, 0, this.WORLD_WIDTH, wallThickness);
        walls.drawRect(0, this.WORLD_HEIGHT - wallThickness, this.WORLD_WIDTH, wallThickness);
        walls.drawRect(0, 0, wallThickness, this.WORLD_HEIGHT);
        walls.drawRect(this.WORLD_WIDTH - wallThickness, 0, wallThickness, this.WORLD_HEIGHT);
        walls.endFill();
        this.mapLayer.addChild(walls);
        this.mapSprites.push(walls);

        const deskPositions = [{
            x: 100,
            y: 150,
            width: 120,
            height: 60
        }, {
            x: 300,
            y: 150,
            width: 120,
            height: 60
        }, {
            x: 500,
            y: 150,
            width: 120,
            height: 60
        }, {
            x: 100,
            y: 350,
            width: 120,
            height: 60
        }, {
            x: 300,
            y: 350,
            width: 120,
            height: 60
        }, ];

        deskPositions.forEach((desk, index) => {
            const deskSprite = new PIXI.Graphics();
            deskSprite.beginFill(0x8b4513);
            deskSprite.drawRect(desk.x, desk.y, desk.width, desk.height);
            deskSprite.endFill();

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

    async renderCharacter(character) {
        if (!this.isInitialized) {
            console.warn('❌ Cannot render character: renderer not initialized');
            return;
        }
        if (this.characterSprites.has(character.id)) {
            this.removeCharacter(character.id);
        }

        try {
            let sprite;
            const texture = await PIXI.Texture.fromURL(character.spriteSheet);
            if (!texture || !texture.valid) {
                throw new Error('Texture failed to load or is invalid');
            }

            const baseTexture = texture.baseTexture;
            const initialFrameRect = new PIXI.Rectangle(
                animationData.idle.directions.down.x,
                animationData.idle.directions.down.y,
                SPRITE_WIDTH,
                SPRITE_HEIGHT
            );
            const frameTexture = new PIXI.Texture(baseTexture, initialFrameRect);
            sprite = new PIXI.Sprite(frameTexture);

            sprite.width = this.CHARACTER_WIDTH;
            sprite.height = this.CHARACTER_HEIGHT;
            sprite.anchor.set(0.5, 1.0);
            sprite.x = character.position?.x || 100;
            sprite.y = character.position?.y || 100;

            sprite.animationState = {
                name: 'idle',
                direction: 'down',
                frame: 0,
                timer: 0,
            };
            sprite.characterId = character.id;
            this.characterLayer.addChild(sprite);
            this.characterSprites.set(character.id, sprite);
            console.log(`✅ Character rendered: ${character.name}`);
        } catch (error) {
            console.error(`❌ Failed to render character ${character.name}:`, error);
        }
    }

    setPlayerCharacter(characterId) {
    this.setFollowTarget(characterId);
    console.log(`👤 Player character set: ${characterId}`);
}

    createSimpleCharacterSprite(character) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x4a90e2);
        graphics.drawRect(-this.CHARACTER_WIDTH / 2, -this.CHARACTER_HEIGHT, this.CHARACTER_WIDTH, this.CHARACTER_HEIGHT);
        graphics.endFill();

        graphics.beginFill(0xfdbcb4);
        graphics.drawCircle(0, -this.CHARACTER_HEIGHT + 15, 12);
        graphics.endFill();

        graphics.beginFill(0x000000);
        graphics.drawCircle(-4, -this.CHARACTER_HEIGHT + 12, 1);
        graphics.drawCircle(4, -this.CHARACTER_HEIGHT + 12, 1);
        graphics.endFill();

        return graphics;
    }

    updateCharacterPosition(characterId, x, y) {
        const sprite = this.characterSprites.get(characterId);
        if (sprite) {
            sprite.x = x;
            sprite.y = y;
        }
    }

    setFollowTarget(characterId) {
    this.followTarget = characterId;
    console.log(`📹 Camera now following character: ${characterId}`);
}

updateCamera() {
    if (!this.followTarget || !this.characterSprites.has(this.followTarget)) {
        return;
    }
    
    const targetSprite = this.characterSprites.get(this.followTarget);
    
    // Center camera on target character
    const targetCameraX = -(targetSprite.x - this.WORLD_WIDTH / 2);
    const targetCameraY = -(targetSprite.y - this.WORLD_HEIGHT / 2);
    
    // Smooth camera movement (optional - remove for instant following)
    const lerpFactor = 0.1;
    this.cameraX += (targetCameraX - this.cameraX) * lerpFactor;
    this.cameraY += (targetCameraY - this.cameraY) * lerpFactor;
    
    // Apply camera transform to world container
    if (this.worldContainer) {
        this.worldContainer.x = this.cameraX;
        this.worldContainer.y = this.cameraY;
    }
}

    

    async loadTilesets(tilesets) {
        console.log('🗂️ Loading map tilesets...');

        for (const tileset of tilesets) {
            try {
                const tilesetPath = `assets/maps/${tileset.image}`;
                console.log(`📥 Loading tileset: ${tilesetPath}`);

                const texture = await PIXI.Texture.fromURL(tilesetPath);
                if (texture && texture.valid) {
                    this.tilesetTextures.set(tileset.firstgid, {
                        texture: texture,
                        tilewidth: tileset.tilewidth,
                        tileheight: tileset.tileheight,
                        columns: tileset.columns,
                        name: tileset.name
                    });
                    console.log(`✅ Tileset loaded: ${tileset.name} (${tileset.tilecount} tiles)`);
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load tileset: ${tileset.image}`, error);
            }
        }
        console.log(`🎨 Loaded ${this.tilesetTextures.size} tilesets`);
    }

    renderTilemap(mapData) {
        console.log('🗺️ Rendering tilemap layers...');

        // Clear existing tile sprites
        this.mapTileSprites.forEach(sprite => {
            this.mapLayer.removeChild(sprite);
        });
        this.mapTileSprites = [];

        if (!mapData.layers || this.tilesetTextures.size === 0) {
            console.warn('⚠️ No layers or tilesets available for tilemap rendering');
            return;
        }

        mapData.layers.forEach((layer, layerIndex) => {
            if (layer.type === 'tilelayer' && layer.data && layer.visible !== false) {
                console.log(`🎨 Rendering tile layer: ${layer.name || `Layer ${layerIndex}`}`);
                this.renderTileLayer(layer, mapData);
            }
        });
        console.log(`✅ Rendered ${this.mapTileSprites.length} map tiles`);
    }

    renderTileLayer(layer, mapData) {
        const mapWidth = mapData.width;
        const mapHeight = mapData.height;
        const tileWidth = mapData.tilewidth || 48;
        const tileHeight = mapData.tileheight || 48;

        // Handle chunked data format from Tiled
        let tileData = [];
        if (layer.chunks) {
            // Reconstruct tile data from chunks
            tileData = new Array(mapWidth * mapHeight).fill(0);
            layer.chunks.forEach(chunk => {
                for (let i = 0; i < chunk.data.length; i++) {
                    const localX = i % chunk.width;
                    const localY = Math.floor(i / chunk.width);
                    const worldX = chunk.x + localX;
                    const worldY = chunk.y + localY;

                    if (worldX >= 0 && worldX < mapWidth && worldY >= 0 && worldY < mapHeight) {
                        const index = worldY * mapWidth + worldX;
                        tileData[index] = chunk.data[i];
                    }
                }
            });
        } else {
            tileData = layer.data;
        }

        console.log(`🔍 Processing ${tileData.length} tiles from layer data`);
        let processedTiles = 0;

        for (let i = 0; i < tileData.length; i++) {
            const gid = tileData[i];
            if (gid === 0) continue; // Empty tile
    
            processedTiles++;
            if (processedTiles <= 5) {
                console.log(`🎯 Processing tile ${processedTiles}: GID=${gid} at index ${i}`);
            }

            // Handle tile flipping flags (Tiled format)
            const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
            const FLIPPED_VERTICALLY_FLAG = 0x40000000;
            const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

            const flippedH = (gid & FLIPPED_HORIZONTALLY_FLAG) !== 0;
            const flippedV = (gid & FLIPPED_VERTICALLY_FLAG) !== 0;
            const flippedD = (gid & FLIPPED_DIAGONALLY_FLAG) !== 0;

            const cleanGid = gid & ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);

            // Find the correct tileset
            let tilesetData = null;
            let tileId = cleanGid;

            for (const [firstgid, tileset] of this.tilesetTextures.entries()) {
                if (cleanGid >= firstgid) {
                    tilesetData = tileset;
                    tileId = cleanGid - firstgid;
                }
            }

            if (!tilesetData) continue;

            // Calculate tile position in tileset
            const tilesPerRow = tilesetData.columns;
            const tileX = tileId % tilesPerRow;
            const tileY = Math.floor(tileId / tilesPerRow);

            // Create texture for this tile
            const tileTexture = new PIXI.Texture(
                tilesetData.texture.baseTexture,
                new PIXI.Rectangle(
                    tileX * tilesetData.tilewidth,
                    tileY * tilesetData.tileheight,
                    tilesetData.tilewidth,
                    tilesetData.tileheight
                )
            );

            const sprite = new PIXI.Sprite(tileTexture);

            // Position tile in world
            const worldX = (i % mapWidth) * tileWidth;
            const worldY = Math.floor(i / mapWidth) * tileHeight;
            sprite.x = worldX;
            sprite.y = worldY;

            // Apply flipping
            if (flippedH) sprite.scale.x = -1;
            if (flippedV) sprite.scale.y = -1;
            if (flippedD) {
                // Diagonal flip - rotate 90 degrees and flip
                sprite.rotation = Math.PI / 2;
                sprite.scale.y = -sprite.scale.y;
            }

            // Apply layer opacity
            if (layer.opacity !== undefined) {
                sprite.alpha = layer.opacity;
            }

            this.mapLayer.addChild(sprite);
            this.mapTileSprites.push(sprite);
        }
    }

    updateCharacterAnimation(characterId, actionState) {
        const sprite = this.characterSprites.get(characterId);
        if (!sprite) return;

        if (!animationData[actionState]) {
            console.warn(`Animation '${actionState}' not found. Defaulting to 'idle'.`);
            actionState = 'idle';
        }

        if (sprite.animationState.name !== actionState) {
            sprite.animationState.name = actionState;
            sprite.animationState.frame = 0;
            sprite.animationState.timer = 0;
        }
    }

    syncCharacterDirection(characterId, facingDirection) {
        const sprite = this.characterSprites.get(characterId);
        if (!sprite) return;

        const currentAnim = animationData[sprite.animationState.name];
        if (currentAnim && currentAnim.directions[facingDirection]) {
            sprite.animationState.direction = facingDirection;
        }
    }

    updateAllCharacterAnimations(deltaTime) {
        if (!USE_ENHANCED_SPRITES) return;

        for (const sprite of this.characterSprites.values()) {
            const state = sprite.animationState;
            const anim = animationData[state.name];
            if (!anim) continue;

            state.timer += deltaTime;
            if (state.timer >= anim.frameSpeed) {
                state.timer -= anim.frameSpeed;
                let nextFrame = state.frame + 1;

                if (nextFrame >= anim.frames) {
                    if (anim.loop) {
                        nextFrame = 0;
                    } else if (anim.loopSection) {
                        nextFrame = anim.loopSection.start;
                    } else {
                        nextFrame = anim.frames - 1;
                    }
                }

                if (state.frame !== nextFrame) {
                    state.frame = nextFrame;
                    this.updateSpriteVisualFrame(sprite);
                }
            }
        }
    }

    updateSpriteVisualFrame(sprite) {
        const state = sprite.animationState;
        const anim = animationData[state.name];
        if (!anim || !sprite.texture) return;

        let directionData = anim.directions[state.direction];
        if (!directionData) {
            directionData = anim.directions[Object.keys(anim.directions)[0]];
        }
        if (!directionData) {
            console.warn(`Animation '${state.name}' has no direction data.`);
            return;
        }

        const sourceX = directionData.x + (state.frame * SPRITE_WIDTH);
        const sourceY = directionData.y;

        sprite.texture.frame = new PIXI.Rectangle(sourceX, sourceY, SPRITE_WIDTH, SPRITE_HEIGHT);
        sprite.texture.updateUvs();
    }

    removeCharacter(characterId) {
        const sprite = this.characterSprites.get(characterId);
        if (sprite) {
            this.characterLayer.removeChild(sprite);
            this.characterSprites.delete(characterId);
        }
    }

    update() {
    if (this.app && this.isInitialized) {
        this.updateCamera();
        this.app.render();
    }
}

    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.app) {
            this.app.destroy(true);
            this.app = null;
        }
        this.characterSprites.clear();
        this.preloadedTextures.clear();
        this.tilesetTextures.clear();
        this.mapTileSprites = [];
        this.isInitialized = false;

        if (USE_ENHANCED_SPRITES) {
            console.log('🧹 Enhanced renderer destroyed and cleaned up');
        } else {
            console.log('🧹 Renderer destroyed and cleaned up');
        }
    }

    getWorldBounds() {
        return {
            width: this.WORLD_WIDTH,
            height: this.WORLD_HEIGHT,
            aspectRatio: 16 / 9
        };
    }

    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasApp: !!this.app,
            hasContainer: !!this.container,
            characterCount: this.characterSprites.size,
            enhancedSpritesEnabled: USE_ENHANCED_SPRITES,
            preloadedTextures: this.preloadedTextures.size,
            worldBounds: this.getWorldBounds(),
            canvasSize: `${this.WORLD_WIDTH}x${this.WORLD_HEIGHT}`,
            aspectRatio: '16:9',
            textureCache: USE_ENHANCED_SPRITES ? `${this.preloadedTextures.size} textures cached` : 'Texture caching dormant'
        };
    }
}
