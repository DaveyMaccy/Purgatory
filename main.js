// This is the core front-end code for the test harness.

// --- Global Variables ---
let sheet; // Will hold the parsed spritesheet data for the current character
let mainApp; // The main PIXI application for the game world
let selectorApp; // The PIXI application for the character selector preview

// --- Main Initialization Function ---
window.onload = async () => {
    try {
        console.log("Starting initialization...");

        mainApp = new PIXI.Application();
        await mainApp.init({
            resizeTo: document.getElementById('world-canvas-container'),
            background: '#000000',
        });
        document.getElementById('world-canvas-container').appendChild(mainApp.view);
        console.log("Main game canvas initialized.");

        selectorApp = new PIXI.Application();
        await selectorApp.init({
            resizeTo: document.getElementById('character-selector-canvas-container'),
            background: '#1a202c',
        });
        document.getElementById('character-selector-canvas-container').appendChild(selectorApp.view);
        console.log("Character selector canvas initialized.");

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
                <p>The test harness could not start. This is almost always a file path error.</p>
                <p><strong>Error Message:</strong> ${error.message}</p>
                <p><strong>Checklist:</strong></p>
                <ol style="list-style-position: inside;">
                    <li>Is the map file path in <strong>mock_backend.js</strong> correct? (e.g., 'assets/maps/purgatorygamemap.json')</li>
                    <li>Is the <strong>purgatorygamemap.png</strong> file in the same folder as the .json file?</li>
                    <li>Are all character sprite sheet paths in <strong>mock_backend.js</strong> correct?</li>
                </ol>
                <p>Open the browser's developer console (F12) for more details.</p>
            </div>`;
    }
};

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
 * Renders the Tiled map, including both tile layers and object layers.
 * @param {object} mapData - The loaded Tiled map data.
 */
async function renderMap(mapData) {
    console.log("Starting map render...");
    const mapUrl = new URL(mapData.url, window.location.href);
    const mapDirectory = mapUrl.href.substring(0, mapUrl.href.lastIndexOf('/') + 1);
    const tilesets = {};

    for (const tilesetDef of mapData.tilesets) {
        // BILO_FIX: This logic is now completely rewritten. It no longer looks for external .tsx files.
        // It reads the image path directly from the map data and assumes the image is in the same folder.
        const imageFilename = tilesetDef.image.split('/').pop();
        const imageUrl = `${mapDirectory}${imageFilename}`;

        console.log(`Loading tileset image from: ${imageUrl}`);
        await PIXI.Assets.load(imageUrl);

        tilesets[tilesetDef.firstgid] = {
            texture: PIXI.BaseTexture.from(imageUrl),
            columns: tilesetDef.columns,
            tileSize: tilesetDef.tilewidth
        };
        console.log(`Loaded tileset GID ${tilesetDef.firstgid}`);
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
            mainApp.stage.addChild(sprite);
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
    await changeCharacter(0);
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
async function loadCharacterSheet(url) {
    console.log(`Loading character sheet: ${url}`);
    await PIXI.Assets.load(url);
    const baseTexture = PIXI.BaseTexture.from(url);

    // BILO_PLACEHOLDER: This sprite sheet definition is an EXAMPLE.
    // You MUST change the coordinates (x, y) and dimensions (w, h) to match your assets.
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

function createAnimatedSprite(currentSheet) {
    const sprite = new PIXI.AnimatedSprite(currentSheet.animations.idle_down);
    sprite.animationSpeed = 0.15;
    sprite.anchor.set(0.5);
    sprite.play();
    return sprite;
}

// --- Player Interaction & Camera ---
const keys = {};

function setupPlayerInteraction() {
    // Keyboard listeners for camera panning
    window.addEventListener('keydown', (e) => { keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    // Mouse listener for character movement
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
    
    updateCamera();

    if(selectorSprite && selectorSprite.currentAnimationName !== 'walk_down') {
        selectorSprite.textures = sheet.animations['walk_down'];
        selectorSprite.play();
        selectorSprite.currentAnimationName = 'walk_down';
    }
}
