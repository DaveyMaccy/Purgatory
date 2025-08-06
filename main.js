// This is the core front-end code for the test harness.

// --- Global Variables ---
let sheet; // Will hold the parsed spritesheet data for the current character
const TILE_SIZE = 48; // The size of your tiles in the Tiled map

// --- Application Setup ---
const mainApp = new PIXI.Application();
const selectorApp = new PIXI.Application(); // A separate app for the character preview

// --- Main Initialization Function ---
window.onload = async () => {
    try {
        // Initialize the main game canvas
        await mainApp.init({
            resizeTo: document.getElementById('world-canvas-container'),
            background: '#000000',
        });
        document.getElementById('world-canvas-container').appendChild(mainApp.view);

        // Initialize the character selector canvas
        await selectorApp.init({
            resizeTo: document.getElementById('character-selector-canvas-container'),
            background: '#1a202c',
        });
        document.getElementById('character-selector-canvas-container').appendChild(selectorApp.view);

        // Load the Tiled map data and render it
        const mapData = await loadMapData(gameState.map.json);
        await renderMap(mapData);

        // Set up the character selector and load the initial character
        await setupCharacterSelector();
        
        // Set up player interaction (clicking)
        setupPlayerInteraction();

        // Start the main game loop
        mainApp.ticker.add(gameLoop);

    } catch (error) {
        console.error("Initialization failed:", error);
        document.body.innerHTML = `<div style="color: red; padding: 20px;">Error during setup. Check console for details. Most likely a file path is incorrect or a file is missing.</div>`;
    }
};

// --- Tiled Map Rendering ---
/**
 * Loads the Tiled JSON file.
 * @param {string} url - Path to the Tiled JSON file.
 * @returns {object} - The parsed map data.
 */
async function loadMapData(url) {
    console.log(`Loading map data from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load map data: ${response.statusText} (${url})`);
    }
    const mapJson = await response.json();
    // Store the URL on the object so we can resolve relative paths later
    mapJson.url = url; 
    return mapJson;
}


/**
 * Renders the Tiled map, including both tile layers and object layers.
 * @param {object} mapData - The loaded Tiled map data.
 */
async function renderMap(mapData) {
    const mapUrl = new URL(mapData.url, window.location.href);
    
    // Create a map to hold all loaded tileset textures
    const tilesets = {};

    // Pre-load all tileset images
    for (const tilesetDef of mapData.tilesets) {
        const tilesetUrl = new URL(tilesetDef.source, mapUrl).href;
        // The key will be the firstgid, the value will be the loaded texture
        await PIXI.Assets.load(tilesetUrl);
        tilesets[tilesetDef.firstgid] = PIXI.BaseTexture.from(tilesetUrl);
        console.log(`Loaded tileset with first GID ${tilesetDef.firstgid} from ${tilesetUrl}`);
    }

    // Render layers in the order they appear in Tiled
    for (const layer of mapData.layers) {
        if (!layer.visible) continue;

        if (layer.type === 'tilelayer') {
            renderTileLayer(layer, mapData, tilesets);
        } else if (layer.type === 'objectgroup') {
            // FIX: Added function call to render object layers (furniture, etc.)
            renderObjectLayer(layer, mapData, tilesets);
        }
    }
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

    for (const chunk of layer.chunks) {
        for (let i = 0; i < chunk.data.length; i++) {
            const gid = chunk.data[i];
            const tileId = gid & 0x1FFFFFFF; // Mask out flip flags
            if (tileId === 0) continue;

            const tilesetDef = findTilesetForGid(mapData.tilesets, tileId);
            if (!tilesetDef) continue;

            const baseTexture = tilesets[tilesetDef.firstgid];
            const x = (i % chunk.width) + chunk.x;
            const y = Math.floor(i / chunk.width) + chunk.y;

            const tileX = ((tileId - tilesetDef.firstgid) % tilesetDef.columns) * TILE_SIZE;
            const tileY = Math.floor((tileId - tilesetDef.firstgid) / tilesetDef.columns) * TILE_SIZE;

            const tileRect = new PIXI.Rectangle(tileX, tileY, TILE_SIZE, TILE_SIZE);
            const texture = new PIXI.Texture(baseTexture, tileRect);
            const sprite = new PIXI.Sprite(texture);
            sprite.x = x * TILE_SIZE;
            sprite.y = y * TILE_SIZE;
            mainApp.stage.addChild(sprite);
        }
    }
}

/**
 * Renders objects (like furniture) from an object layer.
 */
function renderObjectLayer(layer, mapData, tilesets) {
    for (const obj of layer.objects) {
        if (!obj.visible || !obj.gid) continue; // Skip invisible objects or objects without a tile

        const gid = obj.gid;
        const tileId = gid & 0x1FFFFFFF; // Mask out flip flags

        const tilesetDef = findTilesetForGid(mapData.tilesets, tileId);
        if (!tilesetDef) continue;

        const baseTexture = tilesets[tilesetDef.firstgid];
        const tileX = ((tileId - tilesetDef.firstgid) % tilesetDef.columns) * TILE_SIZE;
        const tileY = Math.floor((tileId - tilesetDef.firstgid) / tilesetDef.columns) * TILE_SIZE;

        const tileRect = new PIXI.Rectangle(tileX, tileY, TILE_SIZE, TILE_SIZE);
        const texture = new PIXI.Texture(baseTexture, tileRect);
        const sprite = new PIXI.Sprite(texture);

        // Tiled object coordinates have the origin at the bottom-left, so we adjust
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

/**
 * Sets up the character selector UI and initial character.
 */
async function setupCharacterSelector() {
    await changeCharacter(0); // Load the first character

    document.getElementById('next-char-btn').addEventListener('click', () => changeCharacter(1));
    document.getElementById('prev-char-btn').addEventListener('click', () => changeCharacter(-1));
}

/**
 * Handles changing the selected character.
 */
async function changeCharacter(direction) {
    if (direction !== 0) {
        currentCharacterIndex += direction;
        if (currentCharacterIndex >= PREMADE_CHARACTER_SPRITES.length) currentCharacterIndex = 0;
        if (currentCharacterIndex < 0) currentCharacterIndex = PREMADE_CHARACTER_SPRITES.length - 1;
    }

    const player = gameState.characters.find(c => c.isPlayer);
    const newSpritePath = PREMADE_CHARACTER_SPRITES[currentCharacterIndex];
    player.spriteSheet = newSpritePath;

    if (player.pixiSprite) mainApp.stage.removeChild(player.pixiSprite);
    if (selectorSprite) selectorApp.stage.removeChild(selectorSprite);

    await loadCharacterSheet(newSpritePath);
    player.pixiSprite = createAnimatedSprite(sheet);
    selectorSprite = createAnimatedSprite(sheet);

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
/**
 * Loads a new character sprite sheet and defines its animations.
 */
async function loadCharacterSheet(url) {
    console.log(`Loading character sheet: ${url}`);
    await PIXI.Assets.load(url);
    const baseTexture = PIXI.BaseTexture.from(url);

    // BILO_PLACEHOLDER: This sprite sheet definition is an EXAMPLE.
    // You MUST change the coordinates (x, y) and dimensions (w, h) to match your
    // specific character sprite sheet assets.
    sheet = new PIXI.Spritesheet(baseTexture, {
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
}

/**
 * Creates a new animated sprite from the currently loaded sheet.
 */
function createAnimatedSprite(currentSheet) {
    const sprite = new PIXI.AnimatedSprite(currentSheet.animations.idle_down);
    sprite.animationSpeed = 0.15;
    sprite.anchor.set(0.5);
    sprite.play();
    return sprite;
}

// --- Player Interaction ---
function setupPlayerInteraction() {
    mainApp.stage.interactive = true;
    mainApp.stage.hitArea = mainApp.screen;
    mainApp.stage.on('pointerdown', (event) => {
        const player = gameState.characters.find(c => c.isPlayer);
        // FIX: Correctly translate the click from screen coordinates to world coordinates.
        // This is essential for click-to-move to work when the camera is panned.
        const worldPos = mainApp.stage.toLocal(event.global);
        backend.findPathFor(player, worldPos);
    });
}

// --- Game Loop ---
function gameLoop(ticker) {
    backend.update(ticker.deltaTime);

    for (const character of gameState.characters) {
        if (character.pixiSprite) {
            character.pixiSprite.x = character.position.x;
            character.pixiSprite.y = character.position.y;

            if (character.pixiSprite.currentAnimationName !== character.actionState) {
                if (sheet.animations[character.actionState]) {
                    character.pixiSprite.textures = sheet.animations[character.actionState];
                    character.pixiSprite.play();
                    character.pixiSprite.currentAnimationName = character.actionState;
                }
            }
        }
    }
    
    // Also update the selector sprite's animation to keep it lively
    if(selectorSprite && selectorSprite.currentAnimationName !== 'walk_down') {
        selectorSprite.textures = sheet.animations['walk_down'];
        selectorSprite.play();
        selectorSprite.currentAnimationName = 'walk_down';
    }
}
