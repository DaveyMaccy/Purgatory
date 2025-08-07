// This is the core front-end code for the test harness.

// --- Global Variables ---
let mainApp; // The main PIXI application for the game world
let selectorApp; // The PIXI application for the character selector preview
let characterContainer; // A dedicated container for characters to manage z-sorting
// 'TILE_SIZE' is now declared only in mock_backend.js to prevent redeclaration errors.
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
        mainApp.resize();
        
        // Set initial camera position to spawn point
        const spawnPoint = gameState.characters.find(c => c.isPlayer).position;
        mainApp.stage.x = -spawnPoint.x + mainApp.screen.width / 2;
        mainApp.stage.y = -spawnPoint.y + mainApp.screen.height / 2;
        
        console.log("Main game canvas initialized.");

        // Initialize the character selector preview canvas
        selectorApp = new PIXI.Application({
            resizeTo: document.getElementById('character-selector-canvas-container'),
            background: '#1a202c',
        });
        document.getElementById('character-selector-canvas-container').appendChild(selectorApp.view);
        selectorApp.resize();
        console.log("Character selector canvas initialized.");
        
        // Pre-load all character assets
        await preloadCharacterAssets();

        // Load and render the Tiled map data first, so it's on the bottom layer.
        const mapData = await loadMapData(gameState.map.json);
        await renderMap(mapData);
        
        // Create a container for characters and add it to the stage AFTER the map.
        // This ensures characters will always be drawn on top of the map floor.
        characterContainer = new PIXI.Container();
        characterContainer.sortableChildren = true;
        mainApp.stage.addChild(characterContainer);

        // Initialize the backend with map data to generate the nav grid and populate objects.
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
};

// --- Asset Pre-loading ---
// **FIX:** This function has been completely rewritten to manually build textures,
// bypassing the problematic PIXI.Spritesheet class for a more robust result.
async function preloadCharacterAssets() {
    console.log("Pre-loading character assets...");

    const frameWidth = 48;
    const frameHeight = 48;

    // Define the structure of our animations just once.
    const animationBlueprints = {
        'walk_down':  [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:1, y:0}],
        'idle_down':  [{x:1, y:0}],
        'walk_left':  [{x:0, y:1}, {x:1, y:1}, {x:2, y:1}, {x:1, y:1}],
        'idle_left':  [{x:1, y:1}],
        'walk_right': [{x:0, y:2}, {x:1, y:2}, {x:2, y:2}, {x:1, y:2}],
        'idle_right': [{x:1, y:2}],
        'walk_up':    [{x:0, y:3}, {x:1, y:3}, {x:2, y:3}, {x:1, y:3}],
        'idle_up':    [{x:1, y:3}],
        'sleep':      [{x:0, y:4}, {x:1, y:4}, {x:2, y:4}, {x:1, y:4}],
        'sit':        [{x:0, y:5}, {x:1, y:5}, {x:2, y:5}, {x:1, y:5}],
        'phase':      [{x:0, y:6}, {x:1, y:6}, {x:2, y:6}, {x:1, y:6}],
        'push':       [{x:0, y:7}, {x:1, y:7}, {x:2, y:7}, {x:1, y:7}],
        'pick_up':    [{x:0, y:8}, {x:1, y:8}, {x:2, y:8}, {x:1, y:8}],
        'lift':       [{x:0, y:9}, {x:1, y:9}, {x:2, y:9}, {x:1, y:9}],
        'throw':      [{x:0, y:10}, {x:1, y:10}, {x:2, y:10}, {x:1, y:10}],
        'hit':        [{x:0, y:11}, {x:1, y:11}, {x:2, y:11}, {x:1, y:11}],
        'punch':      [{x:0, y:12}, {x:1, y:12}, {x:2, y:12}, {x:1, y:12}],
        'shoot':      [{x:0, y:13}, {x:1, y:13}, {x:2, y:13}, {x:1, y:13}],
        'hurt':       [{x:0, y:14}, {x:1, y:14}, {x:2, y:14}, {x:1, y:14}],
    };

    for (const url of PREMADE_CHARACTER_SPRITES) {
        await PIXI.Assets.load(url);
        const baseTexture = PIXI.BaseTexture.from(url);
        
        const sheet = { animations: {} };

        for (const animName in animationBlueprints) {
            const frames = [];
            for (const frameCoords of animationBlueprints[animName]) {
                const rect = new PIXI.Rectangle(
                    frameCoords.x * frameWidth,
                    frameCoords.y * frameHeight,
                    frameWidth,
                    frameHeight
                );
                frames.push(new PIXI.Texture(baseTexture, rect));
            }
            sheet.animations[animName] = frames;
        }
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
    mapJson.absoluteUrl = new URL(url, window.location.href).href; 
    console.log("Map data loaded successfully.");
    return mapJson;
}

async function renderMap(mapData) {
    console.log("Starting map render...");

    const tilesets = {};
    for (const tilesetDef of mapData.tilesets) {
        const mapDirectoryAbsoluteUrl = mapData.absoluteUrl.substring(0, mapData.absoluteUrl.lastIndexOf('/') + 1); 
        const imageUrl = new URL(tilesetDef.image.replace(/\\/g, '/'), mapDirectoryAbsoluteUrl).href;
        await PIXI.Assets.load(imageUrl);
        tilesets[tilesetDef.firstgid] = {
            texture: PIXI.BaseTexture.from(imageUrl),
            columns: tilesetDef.columns,
            tileSize: tilesetDef.tilewidth
        };
    }

    for (const layer of mapData.layers) {
        if (!layer.visible) continue;
        const layerContainer = new PIXI.Container();
        mainApp.stage.addChild(layerContainer);

        if (layer.type === 'tilelayer') {
            const isCollisionLayer = layer.properties?.some(p => p.name === 'collides' && p.value === true);
            if (isCollisionLayer) {
                console.log(`Skipping rendering of collision layer: ${layer.name}`);
                continue;
            }
            renderTileLayerChunk(layerContainer, layer, mapData, tilesets);
        } else if (layer.type === 'objectgroup') {
            renderObjectLayer(layerContainer, layer, mapData, tilesets);
        }
    }
    console.log("Map render complete.");
}

function renderTileLayerChunk(layerContainer, layer, mapData, tilesets) {
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

function renderObjectLayer(layerContainer, layer, mapData, tilesets) {
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

        const renderWidth = obj.width > 0 ? obj.width : tileset.tileSize;
        const renderHeight = obj.height > 0 ? obj.height : tileset.tileSize;

        const tileRect = new PIXI.Rectangle(tileX, tileY, renderWidth, renderHeight); 
        const texture = new PIXI.Texture(tileset.texture, tileRect);
        const sprite = new PIXI.Sprite(texture);

        sprite.anchor.set(0, 1);
        sprite.x = obj.x;
        sprite.y = obj.y;
        layerContainer.addChild(sprite);
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
    const player = gameState.characters.find(c => c.isPlayer);
    const initialSpritePath = PREMADE_CHARACTER_SPRITES[currentCharacterIndex];
    const sheet = allCharacterSheets[initialSpritePath];

    if (!sheet) {
        console.error(`Initial spritesheet for selector not found: ${initialSpritePath}`);
        return;
    }

    selectorSprite = createAnimatedSprite(sheet, 'walk_down');
    selectorApp.stage.addChild(selectorSprite);
    selectorSprite.x = selectorApp.screen.width / 2;
    selectorSprite.y = selectorApp.screen.height / 2;
    
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

    const sheet = allCharacterSheets[newSpritePath];
    if (!sheet) {
        console.error(`Spritesheet not found in cache for: ${newSpritePath}`);
        return;
    }

    if (player.pixiSprite) {
        characterContainer.removeChild(player.pixiSprite);
    }
    
    if (selectorSprite) {
        selectorSprite.textures = sheet.animations['walk_down'];
        selectorSprite.play();
        selectorSprite.currentAnimationName = 'walk_down';
    }

    player.pixiSprite = createAnimatedSprite(sheet, 'idle_down'); 
    characterContainer.addChild(player.pixiSprite); 

    updateCharacterName(); 
}

function updateCharacterName() {
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

    document.getElementById('player-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const inputMode = document.getElementById('input-mode-selector').value;
            const message = document.getElementById('player-input').value;
            document.getElementById('player-input').value = '';

            if (message.trim() === '') return;

            const chatLog = document.getElementById('chat-log');
            const p = document.createElement('p');
            p.className = 'text-gray-300 text-sm';
            p.innerHTML = `<span class="font-bold text-blue-300">Player (${inputMode}):</span> ${message}`;
            chatLog.appendChild(p);
            chatLog.scrollTop = chatLog.scrollHeight; 

            console.log(`Player Input Mode: ${inputMode}, Message: ${message}`);
        }
    });
}

function updateCamera() {
    const player = gameState.characters.find(c => c.isPlayer);
    if (player) {
        // Center camera on player with some smoothing
        const targetX = -player.position.x + mainApp.screen.width / 2;
        const targetY = -player.position.y + mainApp.screen.height / 2;
        
        mainApp.stage.x += (targetX - mainApp.stage.x) * 0.1;
        mainApp.stage.y += (targetY - mainApp.stage.y) * 0.1;
    }
    
    // Still allow manual panning
    const panSpeed = 5;
    if (keys['ArrowUp']) mainApp.stage.y += panSpeed;
    if (keys['ArrowDown']) mainApp.stage.y -= panSpeed;
    if (keys['ArrowLeft']) mainApp.stage.x += panSpeed;
    if (keys['ArrowRight']) mainApp.stage.x -= panSpeed;
}

function updateUI(character) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('current-time-display').textContent = `${hours}:${minutes}`;

    document.getElementById('char-name-display').textContent = character.name;

    const portraitImg = document.getElementById('player-portrait');
    if (portraitImg && character.portrait) { 
        portraitImg.src = character.portrait;
    } else if (portraitImg) {
        portraitImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    }
    
    const inventoryList = document.getElementById('inventory-content');
    if (inventoryList) {
        inventoryList.innerHTML = ''; 
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

    const taskDisplay = document.getElementById('tasks-content');
    if (taskDisplay) {
        if (character.assignedTask) {
            taskDisplay.innerHTML = `<p class="font-semibold">Current Task:</p><p>${character.assignedTask.displayName}</p>`;
        } else {
            taskDisplay.innerHTML = '<p>No task assigned.</p>';
        }
    }

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
            character.pixiSprite.zIndex = character.position.y; 

            const newAnimation = character.actionState;
            const currentAnimation = character.pixiSprite.currentAnimationName;
            const sheet = allCharacterSheets[character.spriteSheet];

            if (newAnimation && newAnimation !== currentAnimation && sheet.animations[newAnimation]) {
                character.pixiSprite.textures = sheet.animations[newAnimation];
                character.pixiSprite.play();
                character.pixiSprite.currentAnimationName = newAnimation;
            }
        }
    }
    
    characterContainer.sortChildren(); 
    
    updateCamera();
    updateUI(gameState.characters.find(c => c.isPlayer)); 
}
