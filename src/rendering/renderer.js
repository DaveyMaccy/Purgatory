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
        // this.mapSprites = []; // REMOVED
        this.tilesetTextures = new Map();
        // this.mapTileSprites = []; // REMOVED
        this.chunkContainers = new Map(); // To store PIXI.Container for each chunk, keyed by "layerName,x,y"
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
            this.mapData = mapData; // ADD THIS LINE
            this.app.stage.addChild(this.worldContainer);

            this.mapLayer = new PIXI.Container();
            this.objectLayer = new PIXI.Container();
            this.characterLayer = new PIXI.Container();
            this.worldContainer.addChild(this.mapLayer);
            this.worldContainer.addChild(this.objectLayer);
            this.worldContainer.addChild(this.characterLayer);

            // Set up world click detection
            this.setupWorldClickDetection();

            this.setupResizeListener();

            let preloadedCount = 0;
            if (USE_ENHANCED_SPRITES) {
                preloadedCount = await this.preloadCharacterSprites();
                console.log(`🎮 Sprite preloading complete: ${preloadedCount} textures cached`);
            } else {
                console.log('💤 Sprite preloading skipped (dormant mode)');
            }

            if (mapData) {
                // Load tilesets. The new system will handle rendering chunks dynamically.
                if (mapData.tilesets && mapData.tilesets.length > 0) {
                    await this.loadTilesets(mapData.tilesets);
               } else {
                   console.warn('⚠️ No tilesets found in map data.');
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

        // FIXED: Leave small margin for borders/padding but maximize canvas size
        const usableWidth = Math.max(containerWidth - 20, 400); // 10px margin each side, min 400px
        const usableHeight = Math.max(containerHeight - 20, 300); // 10px margin top/bottom, min 300px

        const targetAspectRatio = 16 / 9;
        const containerAspectRatio = usableWidth / usableHeight;

        if (containerAspectRatio > targetAspectRatio) {
            // Container is wider than 16:9, fit to height
            this.WORLD_HEIGHT = usableHeight;
            this.WORLD_WIDTH = this.WORLD_HEIGHT * targetAspectRatio;
        } else {
            // Container is taller than 16:9, fit to width
            this.WORLD_WIDTH = usableWidth;
            this.WORLD_HEIGHT = this.WORLD_WIDTH / targetAspectRatio;
        }

        // FIXED: Keep reasonable minimums but allow larger sizes
        this.WORLD_WIDTH = Math.max(this.WORLD_WIDTH, 640);  // Reduced minimum for small screens
        this.WORLD_HEIGHT = Math.max(this.WORLD_HEIGHT, 360); // Reduced minimum for small screens
        
        // FIXED: No maximum limits - let it scale up for large containers
        console.log(`📐 Canvas sized: ${Math.round(this.WORLD_WIDTH)}x${Math.round(this.WORLD_HEIGHT)} (16:9 aspect ratio, ${Math.round((this.WORLD_WIDTH * this.WORLD_HEIGHT) / (containerWidth * containerHeight) * 100)}% of container)`);
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
            // CRITICAL FIX: Anchor at (0.5, 0.5) for center positioning, not (0.5, 1.0) for bottom
            sprite.anchor.set(0.5, 0.5);
            sprite.x = character.position?.x || 100;
            sprite.y = character.position?.y || 100;
            
            console.error(`[RENDERER DEBUG] Character ${character.name} sprite positioned at (${sprite.x}, ${sprite.y})`);

            sprite.animationState = {
                name: 'idle',
                direction: 'down',
                frame: 0,
                timer: 0,
            };
            // Make character sprite interactive for clicking
            sprite.interactive = true;
            sprite.buttonMode = true;
            sprite.on('click', (event) => {
                event.stopPropagation();
                console.log(`🖱️ Character clicked: ${character.name}`);
                if (window.gameEngine && window.gameEngine.onCharacterClick) {
                    window.gameEngine.onCharacterClick(character, {
                        x: event.data.global.x,
                        y: event.data.global.y
                    });
                }
            });

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

    renderChunk(chunk, layerName) {
    const key = `${layerName},${chunk.x},${chunk.y}`;
    if (this.chunkContainers.has(key)) return; // Already rendered

    const chunkContainer = new PIXI.Container();
    chunkContainer.x = chunk.x * this.TILE_SIZE;
    chunkContainer.y = chunk.y * this.TILE_SIZE;

    for (let i = 0; i < chunk.data.length; i++) {
        const gid = chunk.data[i];
        if (gid === 0) continue;

        const tileSprite = this.createTileSprite(gid);
        if (tileSprite) {
            const x = (i % chunk.width) * this.TILE_SIZE;
            const y = Math.floor(i / chunk.width) * this.TILE_SIZE;
            tileSprite.position.set(x, y);
            chunkContainer.addChild(tileSprite);
        }
    }

    this.mapLayer.addChild(chunkContainer);
    this.chunkContainers.set(key, chunkContainer);
}

removeChunk(chunkKey) {
    // We need to remove this chunk from all layers
    this.mapData.layers.forEach(layer => {
        const key = `${layer.name},${chunkKey}`;
        const container = this.chunkContainers.get(key);
        if (container) {
            this.mapLayer.removeChild(container);
            container.destroy({ children: true });
            this.chunkContainers.delete(key);
        }
    });
}

createTileSprite(gid) {
    // Standard Tiled flip flags
    const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    const FLIPPED_VERTICALLY_FLAG = 0x40000000;
    const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
    
    // Flag to clear, as recommended by Tiled documentation
    const HEXAGONAL_ROTATION_FLAG = 0x10000000;

    // Isolate the flip flags from the GID. Use 'let' so they can be corrected.
    let flippedH = (gid & FLIPPED_HORIZONTALLY_FLAG) !== 0;
    let flippedV = (gid & FLIPPED_VERTICALLY_FLAG) !== 0;
    let flippedD = (gid & FLIPPED_DIAGONALLY_FLAG) !== 0;

    // Get the clean GID by clearing ALL potential flags
    const cleanGid = gid & ~(
        FLIPPED_HORIZONTALLY_FLAG |
        FLIPPED_VERTICALLY_FLAG |
        FLIPPED_DIAGONALLY_FLAG |
        HEXAGONAL_ROTATION_FLAG
    );

    // Find the correct tileset for the GID
    let tilesetData = null;
    let tileIdInTileset = 0;
    for (const [firstgid, tileset] of this.tilesetTextures.entries()) {
        if (cleanGid >= firstgid) {
            tilesetData = tileset;
            tileIdInTileset = cleanGid - firstgid;
        }
    }

    if (!tilesetData) return null;

    // Calculate the tile's source rectangle within the tileset texture
    const tileX = tileIdInTileset % tilesetData.columns;
    const tileY = Math.floor(tileIdInTileset / tilesetData.columns);

    const rect = new PIXI.Rectangle(
        tileX * tilesetData.tilewidth,
        tileY * tilesetData.tileheight,
        tilesetData.tilewidth,
        tilesetData.tileheight
    );

    const texture = new PIXI.Texture(tilesetData.texture.baseTexture, rect);
    const sprite = new PIXI.Sprite(texture);

    // --- Definitive Transformation Logic ---
    const originalTileWidth = tilesetData.tilewidth;
    const originalTileHeight = tilesetData.tileheight;

    sprite.anchor.set(0.5, 0.5);
    sprite.x += originalTileWidth / 2;
    sprite.y += originalTileHeight / 2;
    
    // STEP 1: DATA CORRECTION FOR THE ANOMALOUS TILE
    // We identify the anomalous Layer 4 tile by its cleanGid and correct its flags in memory.
    if (cleanGid === 365 && flippedD && flippedV && !flippedH) {
        flippedV = false; // Turn OFF the incorrect Vertical flag.
        flippedH = true;  // Turn ON the correct Horizontal flag.
        // The tile's flags are now D+H and will be processed correctly by the logic below.
    }
    
    // STEP 2: EXPLICIT 8-CASE UNIVERSAL LOGIC
    // This block correctly handles all tiles based on their (now corrected) flags.
    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;

    if (flippedD) {
        if (flippedH && flippedV) { // D+H+V
            rotation = Math.PI / 2;
            scaleX = -1;
        } else if (flippedH) { // D+H -> Should be 90° Clockwise
            rotation = Math.PI / 2;
        } else if (flippedV) { // D+V -> Should be 270° Clockwise
            rotation = -Math.PI / 2;
        } else { // D only
            rotation = Math.PI / 2;
            scaleY = -1;
        }
    } else {
        if (flippedH && flippedV) { // H+V (180°)
            rotation = Math.PI;
        } else if (flippedH) { // H
            scaleX = -1;
        } else if (flippedV) { // V
            scaleY = -1;
        }
    }

    // STEP 3: APPLY FINAL TRANSFORMATIONS
    sprite.rotation = rotation;
    sprite.scale.set(scaleX, scaleY);

    return sprite;
}
    
    async loadTilesets(tilesets) {
        console.log('🗂️ Loading map tilesets...');

        for (const tileset of tilesets) {
            try {
                // Try multiple possible paths for tilesets
                const possiblePaths = [
                    `assets/maps/${tileset.image}`,
                    `assets/${tileset.image}`,
                    tileset.image
                ];

                let tilesetPath = possiblePaths[0];
                console.log(`🔍 Trying tileset paths:`, possiblePaths);
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

    /**
    * Setup world click detection for objects and containers
    */
    setupWorldClickDetection() {
        this.worldContainer.interactive = true;
        // This is now the SINGLE source of truth for all world clicks.
        this.worldContainer.on('click', (event) => {
            const worldPos = {
                x: event.data.global.x - this.worldContainer.x,
                y: event.data.global.y - this.worldContainer.y
            };

            const clickedObject = this.findObjectAtPosition(worldPos);
            
            // THE DEFINITIVE FIX: Check if the clicked object is a real, interactable object,
            // and NOT just an invisible 'room' object.
            if (clickedObject && clickedObject.type !== 'room') {
                // --- OBJECT CLICK LOGIC ---
                console.log(`[Renderer] INTERACTABLE Object clicked: ${clickedObject.name}`);
                if (window.gameEngine && window.gameEngine.onObjectClick) {
                    window.gameEngine.onObjectClick(clickedObject, {
                        x: event.data.global.x,
                        y: event.data.global.y
                    });
                }
            } else {
                // --- GROUND CLICK LOGIC ---
                // This code now runs if the click was on empty ground OR on a 'room' object.
                console.log(`[Renderer] Ground clicked at world position: (${worldPos.x.toFixed(1)}, ${worldPos.y.toFixed(1)})`);
                const player = window.characterManager?.getPlayerCharacter();
                if (player) {
                    // CENTER CLICK TO TILE: This ensures characters move to tile centers
                    const TILE_SIZE = 48;
                    const centeredWorldPos = {
                        x: Math.floor(worldPos.x / TILE_SIZE) * TILE_SIZE + (TILE_SIZE / 2),
                        y: Math.floor(worldPos.y / TILE_SIZE) * TILE_SIZE + (TILE_SIZE / 2)
                    };
                    console.log(`[Renderer] Centered to tile: (${centeredWorldPos.x}, ${centeredWorldPos.y})`);
                    
                    const path = window.gameEngine.world.findPath(player.position, centeredWorldPos);
                    if (path && path.length > 0) {
                        // A new manual move command ALWAYS cancels a queued action.
                        if (player.queuedAction) {
                            player.queuedAction = null;
                            console.log("Action cancelled by manual movement.");
                        }
                        player.path = path;
                    }
                }
            }
        });
    }

    /**
    * Find clickable object at world position
    */
    findObjectAtPosition(worldPos) {
        if (!this.mapData || !this.mapData.layers) return null;

        // Find object layer
        const objectLayer = this.mapData.layers.find(layer =>
            layer.type === 'objectgroup' && layer.name === 'Object Layer 1'
        );

        if (!objectLayer || !objectLayer.objects) return null;

        // Check each object for collision with click position
        for (const obj of objectLayer.objects) {
            if (worldPos.x >= obj.x &&
                worldPos.x <= obj.x + obj.width &&
                worldPos.y >= obj.y &&
                worldPos.y <= obj.y + obj.height) {

                // Return object with interaction metadata
                return {
                    name: obj.name,
                    type: obj.type,
                    x: obj.x,
                    y: obj.y,
                    width: obj.width,
                    height: obj.height,
                    isContainer: this.isContainerObject(obj),
                    hasSpecialAction: this.hasSpecialAction(obj),
                    actionPoint: this.getActionPoint(obj)
                };
            }
        }

        return null;
    }

    /**
    * Check if object is a container
    */
    isContainerObject(obj) {
        const containerTypes = ['desk', 'storage', 'food_and_drink'];
        return containerTypes.includes(obj.type) ||
            obj.name.includes('shelf') ||
            obj.name.includes('desk') ||
            obj.name.includes('cabinet');
    }

    /**
    * Check if object has special actions
    */
    hasSpecialAction(obj) {
        const specialObjects = [
            'desk',
            'coffee_machine', 'coffee_station', 'vending_machine',
            'tv', 'games_console', 'whiteboard', 'printer',
            'bathroom_stall', 'couch', 'break_room_tv'
        ];

        return specialObjects.some(special => obj.name.includes(special));
    }

    /**
    * Get action point for object (where character should stand)
    */
    getActionPoint(obj) {
        // Calculate action point based on object center and type
        const centerX = obj.x + (obj.width / 2);
        const centerY = obj.y + (obj.height / 2);

        // For most objects, action point is in front (below the object)
        return {
            x: centerX,
            y: obj.y + obj.height + 20, // 20 pixels in front
            facing: 'up' // Character faces toward object
        };
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
