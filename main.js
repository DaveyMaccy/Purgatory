// This is the core front-end code for the test harness.

// --- Global Variables ---
let mainApp; // The main PIXI application for the game world
let selectorApp; // The PIXI application for the character selector preview
const TILE_SIZE = 48; // The size of your tiles in the Tiled map
const allCharacterSheets = {}; // Cache for all loaded character spritesheet data

// --- Main Initialization Function ---
window.onload = async () => {
    try {
        console.log("Starting initialization...");

        // Initialize the main game canvas
        mainApp = new PIXI.Application({
            resizeTo: document.getElementById('world-canvas-container'),
            background: '#000000',
        });
        document.getElementById('world-canvas-container').appendChild(mainApp.view);
        console.log("Main game canvas initialized.");

        // Initialize the character selector preview canvas
        selectorApp = new PIXI.Application({
            resizeTo: document.getElementById('character-selector-canvas-container'),
            background: '#1a202c',
        });
        document.getElementById('character-selector-canvas-container').appendChild(selectorApp.view);
        console.log("Character selector canvas initialized.");

        // Pre-load all required assets (map and all character sprites)
        await preloadAllAssets();

        // Load the Tiled map data and render it
        const mapData = await loadMapData(gameState.map.json);
        await renderMap(mapData);

        // Set up the character selector and load the initial character
        await setupCharacterSelector();

        // Set up player interaction (clicking and keyboard)
        setupPlayerInteraction();

        // Start the main game loop
        mainApp.ticker.add(gameLoop);
        console.log("Initialization complete. Starting game loop.");

    } catch (error) {
        console.error("CRITICAL ERROR DURING INITIALIZATION:", error);
        document.body.innerHTML = `
            <div style="color: red; background: #111; padding: 20px; font-family: monospace;">
                <h1>Initialization Failed</h1>
                <p>The test harness could not start. This is likely a file path or map format error.</p>
                <p><strong>Error Message:</strong> ${error.message}</p>
                <p><strong>Checklist:</strong></p>
                <ol style="list-style-position: inside;">
                    <li>Did you re-export your map from Tiled with the <strong>"Embed in map"</strong> option checked for all tilesets?</li>
                    <li>Is the map file path in <strong>mock_backend.js</strong> correct? (e.g., 'assets/maps/purgatorygamemap.json')</li>
                    <li>Are all character sprite sheet paths in <strong>mock_backend.js</strong> correct?</li>
                </ol>
                <p>Open the browser's developer console (F12) for more details.</p>
            </div>`;
    }
};

// --- Asset Pre-loading ---
async function preloadAllAssets() {
    console.log("Pre-loading all assets...");
    // Create a list of all character sprite URLs to load
    const characterAssetUrls = PREMADE_CHARACTER_SPRITES;
    
    // Load all character assets in parallel
    for (const url of characterAssetUrls) {
        await PIXI.Assets.load(url);
        // BILO_FIX: This placeholder is still here because the spritesheet data IS hardcoded.
        // This is a fragile design choice specified in the original code. For a production
        // system, this data should be loaded from a JSON atlas file.
        const baseTexture = PIXI.BaseTexture.from(url);
        const sheet = new PIXI.Spritesheet(baseTexture, {
            frames: {
                'walk_down_0': { frame: { x: 0, y: 0, w: 48, h: 48 } }, 'walk_down_1': { frame: { x: 48, y: 0, w: 48, h: 48 } }, 'walk_down_2': { frame: { x: 96, y: 0, w: 48, h: 48 } },
                'walk_left_0': { frame: { x: 0, y: 48, w: 48, h: 48 } }, 'walk_left_1': { frame: { x: 48, y: 48, w: 48, h: 48 } }, 'walk_left_2': { frame: { x: 96, y: 48, w: 48, h: 48 } },
                'walk_right_0': { frame: { x: 0, y: 96, w: 48, h: 48 } }, 'walk_right_1': { frame: { x: 48, y: 96, w: 48, h: 48 } }, 'walk_right_2': { frame: { x: 96, y: 96, w: 48, h: 48 } },
                'walk_up_0': { frame: { x: 0, y: 144, w: 48, h: 48 } }, 'walk_up_1': { frame: { x: 48, y: 144, w: 48, h: 48 } }, 'walk_up_2': { frame: { x: 96, y: 144, w: 48, h: 48 } },
            },
            animations: {
                'idle_down': ['walk_down_1'], 'idle_left': ['walk_left_1'], 'idle_right': ['walk_right_1'], 'idle_up': ['walk_up_1'],
                'walk_down': ['walk_down_0', 'walk_down_1', 'walk_down_2', 'walk_down_1'],
                'walk_left': ['walk_left_0', 'walk_left_1', 'walk_left_2', 'walk_left_1'],
                'walk_right': ['walk_right_0', 'walk_right_1', 'walk_right_2', 'walk_right_1'],
                'walk_up': ['walk_up_0', 'walk_up_1', 'walk_up_2', 'walk_up_1'],
            },
            meta: { scale: '1' }
        });
        await sheet.parse();
        allCharacterSheets[url] = sheet; // Cache the parsed sheet
    }
    console.log("All character assets pre-loaded and parsed.");
}


// --- Tiled Map Rendering ---
/**
 * Loads the Tiled JSON file.
 * @param {string} url - Path to the Tiled JSON file.
 * @returns {object} - The parsed map data.
 */
async function loadMapData(url) {
    console.log(`Attempting to load map data from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, failed to fetch ${url}`);
    }
    const mapJson = await response.json();
    mapJson.url = url;
    console.log("Map data loaded successfully.");
    return mapJson;
}


/**
 * Renders the Tiled map using embedded tileset data.
 * @param {object} mapData - The loaded Tiled map data.
 */
async function renderMap(mapData) {
    console.log("Starting map render with embedded tileset logic...");

    const mapUrl = new URL(mapData.url, window.location.href);
    const mapDirectory = mapUrl.href.substring(0, mapUrl.href.lastIndexOf('/') + 1);
    const tilesets = {};

    for (const tilesetDef of mapData.tilesets) {
        const imageUrl = `${mapDirectory}${tilesetDef.image}`;
        console.log(`Pre-loading tileset image from: ${imageUrl}`);
        await PIXI.Assets.load(imageUrl);
        console.log(`Successfully pre-loaded image: ${imageUrl}`);
        tilesets[tilesetDef.firstgid] = {
            texture: PIXI.BaseTexture.from(imageUrl),
            columns: tilesetDef.columns,
            tileSize: tilesetDef.tilewidth
        };
    }

    for (const layer of mapData.layers) {
        if (!layer.visible) continue;
        if (layer.type === 'tilelayer') {
            renderTileLayer(layer, mapData, tilesets);
        } else if (layer.type === 'objectgroup') {
            renderObjectLayer(layer, mapData, tilesets);
        }
    }
    console.log("Map render complete.");
}

/**
 * Renders a single tile layer from the Tiled map data.
 */
function renderTileLayer(layer, mapData, tilesets) {
    const isCollisionLayer = layer.properties?.some(p => p.name === 'collides' && p.value === true);
    if (isCollisionLayer) {
        console.log(`Skipping rendering of collision layer: ${layer.name}`);
        return;
    }
    
    // BILO_FIX: Using PIXI.Container for tile layers instead of individual sprites
    // is a major performance improvement.
    const layerContainer = new PIXI.Container();
    mainApp.stage.addChild(layerContainer);

    for (const chunk of layer.chunks) {
        for (let i = 0; i < chunk.data.length; i++) {
            const gid = chunk.data[i];
            const tileId = gid & 0x1FFFFFFF;
            if (tileId === 0) continue;

            const tilesetDef = findTilesetForGid(mapData.tilesets, tileId);
            if (!tilesetDef) continue;

            const tileset = tilesets[tilesetDef.firstgid];
            const x = (i % chunk.width) + chunk.x;
            const y = Math.floor(i / chunk.width) + chunk.y;

            const localTileId = tileId - tilesetDef.firstgid;
            const tileX = (localTileId % tileset.columns) * tileset.tileSize;
            const tileY = Math.floor(localTileId / tileset.columns) * tileset.tileSize;

            const tileRect = new PIXI.Rectangle(tileX, tileY, tileset.tileSize, tileset.tileSize);
            const texture = new PIXI.Texture(tileset.texture, tileRect);
            const sprite = new PIXI.Sprite(texture);
            sprite.x = x * tileset.tileSize;
            sprite.y = y * tileset.tileSize;
            layerContainer.addChild(sprite);
        }
    }
}

/**
 * Renders objects (like furniture) from an object layer.
 */
function renderObjectLayer(layer, mapData, tilesets) {
    for (const obj of layer.objects) {
        if (!obj.visible || !obj.gid) continue;

        const gid = obj.gid;
        const tileId = gid & 0x1FFFFFFF;

        const tilesetDef = findTilesetForGid(mapData.tilesets, tileId);
        if (!tilesetDef) continue;

        const tileset = tilesets[tilesetDef.firstgid];
        const localTileId = tileId - tilesetDef.firstgid;
        const tileX = (localTileId % tileset.columns) * tileset.tileSize;
        const tileY = Math.floor(localTileId / tileset.columns) * tileset.tileSize;

        const tileRect = new PIXI.Rectangle(tileX, tileY, tileset.tileSize, tileset.tileSize);
        const texture = new PIXI.Texture(tileset.texture, tileRect);
        const sprite = new PIXI.Sprite(texture);

        sprite.anchor.set(0, 1);
        sprite.x = obj.x;
        sprite.y = obj.y;
        mainApp.stage.addChild(sprite);
    }
}

/**
 * Finds the correct tileset definition for a given global tile ID (gid).
 */
function findTilesetForGid(tilesets, gid) {
    let correctTileset = null;
    for (const tileset of tilesets) {
        if (gid >= tileset.firstgid) {
            correctTileset = tileset;
        } else {
            break;
        }
    }
    return correctTileset;
}


// --- Character Selector Logic ---
let currentCharacterIndex = 0;
let selectorSprite;

async function setupCharacterSelector() {
    await changeCharacter(0); // Initialize with the first character
    document.getElementById('next-char-btn').addEventListener('click', () => changeCharacter(1));
    document.getElementById('prev-char-btn').addEventListener('click', () => changeCharacter(-1));
}

async function changeCharacter(direction) {
    if (direction !== 0) {
        currentCharacterIndex += direction;
        if (currentCharacterIndex >= PREMADE_CHARACTER_SPRITES.length) currentCharacterIndex = 0;
        if (currentCharacterIndex < 0) currentCharacterIndex = PREMADE_CHARACTER_SPRITES.length - 1;
    }

    const player = gameState.characters.find(c => c.isPlayer);
    const newSpritePath = PREMADE_CHARACTER_SPRITES[currentCharacterIndex];
    player.spriteSheet = newSpritePath;

    // Remove old sprites if they exist
    if (player.pixiSprite) mainApp.stage.removeChild(player.pixiSprite);
    if (selectorSprite) selectorApp.stage.removeChild(selectorSprite);
    
    // Get the pre-parsed sheet from the cache
    const sheet = allCharacterSheets[newSpritePath];
    if (!sheet) {
        console.error(`Spritesheet not found in cache for: ${newSpritePath}`);
        return;
    }

    player.pixiSprite = createAnimatedSprite(sheet, 'idle_down');
    selectorSprite = createAnimatedSprite(sheet, 'walk_down'); // Show walking animation in selector

    mainApp.stage.addChild(player.pixiSprite);
    selectorApp.stage.addChild(selectorSprite);
    selectorSprite.x = selectorApp.screen.width / 2;
    selectorSprite.y = selectorApp.screen.height / 2;

    updateCharacterName();
}

function updateCharacterName() {
    document.getElementById('char-name-display').textContent = `Character ${currentCharacterIndex + 1}`;
}


// --- Sprite Sheet and Animation Logic ---
function createAnimatedSprite(sheet, initialAnimation) {
    const sprite = new PIXI.AnimatedSprite(sheet.animations[initialAnimation]);
    sprite.animationSpeed = 0.15;
    sprite.anchor.set(0.5);
    sprite.play();
    sprite.currentAnimationName = initialAnimation;
    return sprite;
}

// --- Player Interaction & Camera ---
const keys = {};

function setupPlayerInteraction() {
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    mainApp.stage.interactive = true;
    mainApp.stage.hitArea = mainApp.screen;
    mainApp.stage.on('pointerdown', (event) => {
        const player = gameState.characters.find(c => c.isPlayer);
        const worldPos = mainApp.stage.toLocal(event.global);
        backend.findPathFor(player, worldPos);
    });
}

function updateCamera() {
    const panSpeed = 5;
    if (keys['ArrowUp']) mainApp.stage.y += panSpeed;
    if (keys['ArrowDown']) mainApp.stage.y -= panSpeed;
    if (keys['ArrowLeft']) mainApp.stage.x += panSpeed;
    if (keys['ArrowRight']) mainApp.stage.x -= panSpeed;
}

// --- Game Loop ---
function gameLoop(ticker) {
    backend.update(ticker.deltaTime);

    for (const character of gameState.characters) {
        if (character.pixiSprite) {
            // Sync position from backend
            character.pixiSprite.x = character.position.x;
            character.pixiSprite.y = character.position.y;
            character.pixiSprite.zIndex = character.position.y; // For correct depth sorting

            // BILO_FIX: More robust animation update logic
            // Only change animation if the new state is different and valid
            const newAnimation = character.actionState;
            const currentAnimation = character.pixiSprite.currentAnimationName;
            const sheet = allCharacterSheets[character.spriteSheet];

            if (newAnimation !== currentAnimation && sheet.animations[newAnimation]) {
                character.pixiSprite.textures = sheet.animations[newAnimation];
                character.pixiSprite.play();
                character.pixiSprite.currentAnimationName = newAnimation;
            }
        }
    }
    
    // Ensure character container is sorted by y-index for proper overlap
    mainApp.stage.sortChildren();
    
    updateCamera();
}
