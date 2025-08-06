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

        // Pre-load all character assets
        await preloadCharacterAssets();

        // Load the Tiled map data and render it
        const mapData = await loadMapData(gameState.map.json);
        await renderMap(mapData);

        // BILO_FIX: Initialize the backend with map data to generate the nav grid and populate objects.
        backend.initialize(mapData);

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
                    <li>Is the map file path in <strong>mock_backend.js</strong> correct? (e.g., 'assets/maps/purgatorygamemap.json')</li>
                    <li>Are the image paths inside your <strong>purgatorygamemap.json</strong> correct relative to your project folder?</li>
                    <li>Are all character sprite sheet paths in <strong>mock_backend.js</strong> correct?</li>
                </ol>
                <p>Open the browser's developer console (F12) for more details.</p>
            </div>`;
    }
}; // BILO_FIX: Added missing closing brace for window.onload function.

// --- Asset Pre-loading ---
async function preloadCharacterAssets() {
    console.log("Pre-loading character assets...");
    for (const url of PREMADE_CHARACTER_SPRITES) {
        await PIXI.Assets.load(url);
        // BILO_PLACEHOLDER: This spritesheet definition is an EXAMPLE.
        // You MUST change the coordinates (x, y) and dimensions (w, h) to match your assets.
        // For a production system, this data should be loaded from a JSON atlas file.
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
        allCharacterSheets[url] = sheet;
    }
    console.log("All character assets pre-loaded and parsed.");
}

// --- Tiled Map Rendering ---
async function loadMapData(url) {
    console.log(`Attempting to load map data from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}, failed to fetch ${url}`);
    const mapJson = await response.json();
    mapJson.url = url;
    console.log("Map data loaded successfully.");
    return mapJson;
}

/**
 * Renders the Tiled map using EMBEDDED tileset data.
 * @param {object} mapData - The loaded Tiled map data.
 */
async function renderMap(mapData) {
    console.log("Starting map render with EMBEDDED tileset logic...");

    // const mapUrl = new URL(mapData.url, window.location.href); // No longer needed for this pathing strategy
    const tilesets = {};

    for (const tilesetDef of mapData.tilesets) {
        // BILO_FIX: Reverted path logic. Now it correctly expects paths in JSON to be relative to index.html's base URL.
        // So, if JSON has "assets/path/to/image.png", it will resolve correctly from Purgatory/
        const imageUrl = new URL(tilesetDef.image.replace(/\\/g, '/'), window.location.href).href;

        console.log(`Loading tileset image from: ${imageUrl}`);
        
        await PIXI.Assets.load(imageUrl);
        console.log(`Successfully loaded image: ${imageUrl}`);

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

function renderTileLayer(layer, mapData, tilesets) {
    const isCollisionLayer = layer.properties?.some(p => p.name === 'collides' && p.value === true);
    if (isCollisionLayer) {
        console.log(`Skipping rendering of collision layer: ${layer.name}`);
        return;
    }

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

function renderObjectLayer(layer, mapData, tilesets) {
    for (const obj of layer.objects) {
        // BILO_FIX: Only render objects that have a GID (are tile objects)
        if (!obj.visible || !obj.gid) {
            // Check if it's a room or action point (no GID, but useful for debugging)
            if (obj.type === 'room' || obj.type === 'action_point' || obj.type === 'spawn_point') {
                // console.log(`Skipping non-visual object: ${obj.name} (type: ${obj.type})`);
            } else {
                console.warn(`Skipping object without GID: ${obj.name} (type: ${obj.type})`);
            }
            continue;
        }

        const gid = obj.gid;
        const tileId = gid & 0x1FFFFFFF;
        const tilesetDef = findTilesetForGid(mapData.tilesets, tileId);
        if (!tilesetDef) continue;

        const tileset = tilesets[tilesetDef.firstgid];
        const localTileId = tileId - tilesetDef.firstgid;
        const tileX = (localTileId % tileset.columns) * tileset.tileSize;
        const tileY = Math.floor(localTileId / tileset.columns) * tileset.tileSize;

        // BILO_FIX: Use TILE_SIZE for rendering consistent with other tiles, unless object has explicit dimensions
        const renderWidth = obj.width > 0 ? obj.width : tileset.tileSize;
        const renderHeight = obj.height > 0 ? obj.height : tileset.tileSize;

        const tileRect = new PIXI.Rectangle(tileX, tileY, renderWidth, renderHeight); // Use object width/height if available
        const texture = new PIXI.Texture(tileset.texture, tileRect);
        const sprite = new PIXI.Sprite(texture);

        sprite.anchor.set(0, 1); // Anchor at bottom-left for Tiled object layer consistency
        sprite.x = obj.x;
        sprite.y = obj.y;
        mainApp.stage.addChild(sprite);
    }
}

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
    
    const sheet = allCharacterSheets[newSpritePath];
    if (!sheet) {
        console.error(`Spritesheet not found in cache for: ${newSpritePath}`);
        return;
    }

    player.pixiSprite = createAnimatedSprite(sheet, 'idle_down');
    selectorSprite = createAnimatedSprite(sheet, 'walk_down');

    mainApp.stage.addChild(player.pixiSprite);
    selectorApp.stage.addChild(selectorSprite);
    selectorSprite.x = selectorApp.screen.width / 2;
    selectorSprite.y = selectorApp.screen.height / 2;

    updateCharacterName(); // BILO_FIX: Call this here to update character name on change
}

function updateCharacterName() {
    // BILO_FIX: Update with character's actual name, not just index
    const player = gameState.characters.find(c => c.isPlayer);
    document.getElementById('char-name-display').textContent = `${player.name} (Char ${currentCharacterIndex + 1})`;
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

    // BILO_FIX: Add event listener for the player input field
    document.getElementById('player-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const inputMode = document.getElementById('input-mode-selector').value;
            const message = document.getElementById('player-input').value;
            document.getElementById('player-input').value = ''; // Clear input

            if (message.trim() === '') return; // Don't process empty messages

            const chatLog = document.getElementById('chat-log');
            const p = document.createElement('p');
            p.className = 'text-gray-300 text-sm'; // Add some styling
            p.innerHTML = `<span class="font-bold text-blue-300">Player (${inputMode}):</span> ${message}`;
            chatLog.appendChild(p);
            chatLog.scrollTop = chatLog.scrollHeight; // Auto-scroll to bottom

            // BILO_PLACEHOLDER: Send this to backend for processing (e.g., processAction, processDialogue)
            console.log(`Player Input Mode: ${inputMode}, Message: ${message}`);
        }
    });
}

function updateCamera() {
    const panSpeed = 5; // BILO_FIX: Changed to panSpeed for clarity.
    // BILO_PLACEHOLDER: Implement camera follow logic as described in SSOT 3.7
    // For now, only simple keyboard panning.
    if (keys['ArrowUp']) mainApp.stage.y += panSpeed;
    if (keys['ArrowDown']) mainApp.stage.y -= panSpeed;
    if (keys['ArrowLeft']) mainApp.stage.x += panSpeed;
    if (keys['ArrowRight']) mainApp.stage.x -= panSpeed;
}

// BILO_FIX: New function to update the HTML UI
function updateUI(character) {
    // Update Clock Display (SSOT 3.13)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('current-time-display').textContent = `${hours}:${minutes}`;

    // Update Character Name Display
    document.getElementById('char-name-display').textContent = character.name;

    // Update Player Portrait (SSOT 3.9)
    const portraitImg = document.getElementById('player-portrait');
    if (portraitImg && character.portrait) { // Only update if portrait string exists
        portraitImg.src = character.portrait; // Assumes base64 string
    } else if (portraitImg) {
        portraitImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Transparent 1x1 GIF if no portrait
    }
    
    // Update Inventory Tab (SSOT 3.9)
    const inventoryList = document.getElementById('inventory-content');
    if (inventoryList) {
        inventoryList.innerHTML = ''; // Clear old list
        if (character.inventory && character.inventory.length > 0) {
            character.inventory.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.name;
                inventoryList.appendChild(li);
            });
        } else {
            const p = document.createElement('p');
            p.textContent = 'Inventory is empty.';
            inventoryList.appendChild(p);
        }
    }

    // Update the Tasks Tab (SSOT 3.9)
    const taskDisplay = document.getElementById('tasks-content'); // BILO_FIX: Corrected ID to 'tasks-content'
    if (taskDisplay) {
        if (character.assignedTask) {
            taskDisplay.innerHTML = `<p class="font-semibold">Current Task:</p><p>${character.assignedTask.displayName}</p>`;
            // BILO_PLACEHOLDER: Add code to update task progress bar here when implemented.
        } else {
            taskDisplay.innerHTML = '<p>No task assigned.</p>';
        }
    }

    // Update Relationships Tab (SSOT 3.9)
    const relationshipsList = document.getElementById('relationships-content');
    if (relationshipsList) {
        relationshipsList.innerHTML = '';
        const relationshipsHeader = document.createElement('p');
        relationshipsHeader.className = 'font-semibold mb-1';
        relationshipsHeader.textContent = 'Relationships:';
        relationshipsList.appendChild(relationshipsHeader);

        let hasRelationships = false;
        for (const otherCharId in character.relationships) {
            if (character.relationships.hasOwnProperty(otherCharId)) {
                const otherChar = gameState.characters.find(c => c.id === otherCharId);
                if (otherChar && otherChar.id !== character.id) {
                    hasRelationships = true;
                    const score = character.relationships[otherCharId];
                    // BILO_PLACEHOLDER: Implement getRelationshipColor based on SSOT 3.9. For now, use a simple text display.
                    const li = document.createElement('li');
                    li.textContent = `${otherChar.name}: ${score}/100`;
                    relationshipsList.appendChild(li);
                }
            }
        }
        if (!hasRelationships) {
            const p = document.createElement('p');
            p.textContent = 'No active relationships.';
            relationshipsList.appendChild(p);
        }
    }
}


// --- Game Loop ---
function gameLoop(ticker) {
    backend.update(ticker.deltaTime);

    for (const character of gameState.characters) {
        if (character.pixiSprite) {
            character.pixiSprite.x = character.position.x;
            character.pixiSprite.y = character.position.y;
            character.pixiSprite.zIndex = character.position.y; // For correct depth sorting

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
    
    mainApp.stage.sortChildren(); // Apply depth sorting
    
    updateCamera();
    updateUI(gameState.characters.find(c => c.isPlayer)); // Update the UI every frame
}
