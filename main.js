// This is the core front-end code for the test harness.

// --- Global Variables ---
let sheet; // Will hold the parsed spritesheet data for the current character
const TILE_SIZE = 48; // The size of your tiles in the Tiled map

// --- Application Setup ---
const mainApp = new PIXI.Application();
const selectorApp = new PIXI.Application(); // A separate app for the character preview

// --- Main Initialization Function ---
window.onload = async () => {
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

    // Load the Tiled map data
    const mapData = await loadMapData(gameState.map.json);
    await renderMap(mapData);

    // Set up the character selector
    setupCharacterSelector();

    // Start the main game loop
    mainApp.ticker.add(gameLoop);
};

// --- Tiled Map Rendering ---
/**
 * Loads the Tiled JSON file.
 * @param {string} url - Path to the Tiled JSON file.
 * @returns {object} - The parsed map data.
 */
async function loadMapData(url) {
    const response = await fetch(url);
    return await response.json();
}

/**
 * Renders the Tiled map onto the main canvas.
 * @param {object} mapData - The loaded Tiled map data.
 */
async function renderMap(mapData) {
    // BILO_PLACEHOLDER: This assumes your tileset image file is located relative
    // to your JSON file as specified within the Tiled editor.
    // e.g., if Tiled says "../tilesets/my_tiles.png", make sure that path is correct.
    const tilesetUrl = new URL(mapData.tilesets[0].source, new URL(mapData.url, window.location.href)).href;
    await PIXI.Assets.load(tilesetUrl);
    const tilesetTexture = PIXI.BaseTexture.from(tilesetUrl);

    for (const layer of mapData.layers) {
        if (layer.type === 'tilelayer') {
            for (const chunk of layer.chunks) {
                for (let i = 0; i < chunk.data.length; i++) {
                    const tileId = chunk.data[i];
                    if (tileId === 0) continue; // Skip empty tiles

                    const x = (i % chunk.width) + chunk.x;
                    const y = Math.floor(i / chunk.width) + chunk.y;

                    const tileX = ((tileId - 1) % mapData.tilesets[0].columns) * TILE_SIZE;
                    const tileY = Math.floor((tileId - 1) / mapData.tilesets[0].columns) * TILE_SIZE;

                    const tileRect = new PIXI.Rectangle(tileX, tileY, TILE_SIZE, TILE_SIZE);
                    const texture = new PIXI.Texture(tilesetTexture, tileRect);
                    const sprite = new PIXI.Sprite(texture);
                    sprite.x = x * TILE_SIZE;
                    sprite.y = y * TILE_SIZE;
                    mainApp.stage.addChild(sprite);
                }
            }
        }
    }
}


// --- Character Selector Logic ---
let currentCharacterIndex = 0;
let selectorSprite;

/**
 * Sets up the character selector UI and initial character.
 */
async function setupCharacterSelector() {
    const player = gameState.characters.find(c => c.isPlayer);

    // Initial character load
    await loadCharacterSheet(PREMADE_CHARACTER_SPRITES[currentCharacterIndex]);
    player.pixiSprite = createAnimatedSprite(sheet);
    mainApp.stage.addChild(player.pixiSprite);

    // Setup selector preview
    selectorSprite = createAnimatedSprite(sheet);
    selectorSprite.x = selectorApp.screen.width / 2;
    selectorSprite.y = selectorApp.screen.height / 2;
    selectorApp.stage.addChild(selectorSprite);
    updateCharacterName();

    // Button listeners
    document.getElementById('next-char-btn').addEventListener('click', () => changeCharacter(1));
    document.getElementById('prev-char-btn').addEventListener('click', () => changeCharacter(-1));
}

/**
 * Handles changing the selected character.
 * @param {number} direction - 1 for next, -1 for previous.
 */
async function changeCharacter(direction) {
    currentCharacterIndex += direction;
    if (currentCharacterIndex >= PREMADE_CHARACTER_SPRITES.length) {
        currentCharacterIndex = 0;
    }
    if (currentCharacterIndex < 0) {
        currentCharacterIndex = PREMADE_CHARACTER_SPRITES.length - 1;
    }

    const player = gameState.characters.find(c => c.isPlayer);
    const newSpritePath = PREMADE_CHARACTER_SPRITES[currentCharacterIndex];
    player.spriteSheet = newSpritePath;

    // Remove old sprites
    mainApp.stage.removeChild(player.pixiSprite);
    selectorApp.stage.removeChild(selectorSprite);

    // Load and create new sprites
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
 * @param {string} url - The path to the character's sprite sheet .png file.
 */
async function loadCharacterSheet(url) {
    await PIXI.Assets.load(url);
    const baseTexture = PIXI.BaseTexture.from(url);

    // BILO_PLACEHOLDER: This sprite sheet definition is an EXAMPLE based on your guide.
    // You MUST change the coordinates (x, y) and dimensions (w, h) to match your
    // specific character sprite sheet assets. This assumes all your pre-made
    // characters use the exact same animation layout.
    sheet = new PIXI.Spritesheet(baseTexture, {
        frames: {
            // Assumes a 3-frame animation, 48x48 pixels per frame
            'walk_down_0': { frame: { x: 0, y: 0, w: 48, h: 48 } },
            'walk_down_1': { frame: { x: 48, y: 0, w: 48, h: 48 } },
            'walk_down_2': { frame: { x: 96, y: 0, w: 48, h: 48 } },

            'walk_left_0': { frame: { x: 0, y: 48, w: 48, h: 48 } },
            'walk_left_1': { frame: { x: 48, y: 48, w: 48, h: 48 } },
            'walk_left_2': { frame: { x: 96, y: 48, w: 48, h: 48 } },

            'walk_right_0': { frame: { x: 0, y: 96, w: 48, h: 48 } },
            'walk_right_1': { frame: { x: 48, y: 96, w: 48, h: 48 } },
            'walk_right_2': { frame: { x: 96, y: 96, w: 48, h: 48 } },

            'walk_up_0': { frame: { x: 0, y: 144, w: 48, h: 48 } },
            'walk_up_1': { frame: { x: 48, y: 144, w: 48, h: 48 } },
            'walk_up_2': { frame: { x: 96, y: 144, w: 48, h: 48 } },
        },
        animations: {
            'idle_down': ['walk_down_1'], 'idle_left': ['walk_left_1'],
            'idle_right': ['walk_right_1'], 'idle_up': ['walk_up_1'],
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
 * @param {PIXI.Spritesheet} currentSheet - The parsed spritesheet.
 * @returns {PIXI.AnimatedSprite} - The configured animated sprite.
 */
function createAnimatedSprite(currentSheet) {
    const sprite = new PIXI.AnimatedSprite(currentSheet.animations.idle_down);
    sprite.animationSpeed = 0.1;
    sprite.anchor.set(0.5);
    sprite.play();
    return sprite;
}

// --- Player Interaction ---
mainApp.stage.interactive = true;
mainApp.stage.hitArea = mainApp.screen;
mainApp.stage.on('pointerdown', (event) => {
    const player = gameState.characters.find(c => c.isPlayer);
    backend.findPathFor(player, event.global);
});

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
    // Also update the selector sprite's animation
    if(selectorSprite && selectorSprite.currentAnimationName !== 'walk_down') {
        selectorSprite.textures = sheet.animations['walk_down'];
        selectorSprite.play();
        selectorSprite.currentAnimationName = 'walk_down';
    }
}
