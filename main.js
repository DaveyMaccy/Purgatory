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
async function preloadCharacterAssets() {
    console.log("Pre-loading character assets...");
    for (const url of PREMADE_CHARACTER_SPRITES) {
        
        // Use the modern PixiJS workflow correctly.
        const texture = await PIXI.Assets.load(url);
        const baseTexture = texture.baseTexture;

        const frames = {};
        const animations = {};

        const charNumberMatch = url.match(/_(\d{2})\.png$/);
        const charPrefix = charNumberMatch ? `char_${charNumberMatch[1]}_` : '';

        const frameWidth = 48;
        const frameHeight = 48;

        // --- Define ALL Frames based on Spritesheet_animations_GUIDE.png (48x48 grid) ---
        frames[`${charPrefix}walk_down_0`] = { frame: { x: 0, y: 0, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_down_1`] = { frame: { x: 48, y: 0, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_down_2`] = { frame: { x: 96, y: 0, w: frameWidth, h: frameHeight } };
        animations['walk_down'] = [`${charPrefix}walk_down_0`, `${charPrefix}walk_down_1`, `${charPrefix}walk_down_2`, `${charPrefix}walk_down_1`];
        animations['idle_down'] = [`${charPrefix}walk_down_1`];

        frames[`${charPrefix}walk_left_0`] = { frame: { x: 0, y: 48, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_left_1`] = { frame: { x: 48, y: 48, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_left_2`] = { frame: { x: 96, y: 48, w: frameWidth, h: frameHeight } };
        animations['walk_left'] = [`${charPrefix}walk_left_0`, `${charPrefix}walk_left_1`, `${charPrefix}walk_left_2`, `${charPrefix}walk_left_1`];
        animations['idle_left'] = [`${charPrefix}walk_left_1`];

        frames[`${charPrefix}walk_right_0`] = { frame: { x: 0, y: 96, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_right_1`] = { frame: { x: 48, y: 96, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_right_2`] = { frame: { x: 96, y: 96, w: frameWidth, h: frameHeight } };
        animations['walk_right'] = [`${charPrefix}walk_right_0`, `${charPrefix}walk_right_1`, `${charPrefix}walk_right_2`, `${charPrefix}walk_right_1`];
        animations['idle_right'] = [`${charPrefix}walk_right_1`];

        frames[`${charPrefix}walk_up_0`] = { frame: { x: 0, y: 144, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_up_1`] = { frame: { x: 48, y: 144, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_up_2`] = { frame: { x: 96, y: 144, w: frameWidth, h: frameHeight } };
        animations['walk_up'] = [`${charPrefix}walk_up_0`, `${charPrefix}walk_up_1`, `${charPrefix}walk_up_2`, `${charPrefix}walk_up_1`];
        animations['idle_up'] = [`${charPrefix}walk_up_1`];

        frames[`${charPrefix}sleep_0`] = { frame: { x: 0, y: 192, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}sleep_1`] = { frame: { x: 48, y: 192, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}sleep_2`] = { frame: { x: 96, y: 192, w: frameWidth, h: frameHeight } };
        animations['sleep'] = [`${charPrefix}sleep_0`, `${charPrefix}sleep_1`, `${charPrefix}sleep_2`, `${charPrefix}sleep_1`];

        frames[`${charPrefix}sit_0`] = { frame: { x: 0, y: 240, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}sit_1`] = { frame: { x: 48, y: 240, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}sit_2`] = { frame: { x: 96, y: 240, w: frameWidth, h: frameHeight } };
        animations['sit'] = [`${charPrefix}sit_0`, `${charPrefix}sit_1`, `${charPrefix}sit_2`, `${charPrefix}sit_1`];

        frames[`${charPrefix}phase_0`] = { frame: { x: 0, y: 288, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}phase_1`] = { frame: { x: 48, y: 288, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}phase_2`] = { frame: { x: 96, y: 288, w: frameWidth, h: frameHeight } };
        animations['phase'] = [`${charPrefix}phase_0`, `${charPrefix}phase_1`, `${charPrefix}phase_2`, `${charPrefix}phase_1`];

        frames[`${charPrefix}push_0`] = { frame: { x: 0, y: 336, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}push_1`] = { frame: { x: 48, y: 336, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}push_2`] = { frame: { x: 96, y: 336, w: frameWidth, h: frameHeight } };
        animations['push'] = [`${charPrefix}push_0`, `${charPrefix}push_1`, `${charPrefix}push_2`, `${charPrefix}push_1`];

        frames[`${charPrefix}pick_up_0`] = { frame: { x: 0, y: 384, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}pick_up_1`] = { frame: { x: 48, y: 384, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}pick_up_2`] = { frame: { x: 96, y: 384, w: frameWidth, h: frameHeight } };
        animations['pick_up'] = [`${charPrefix}pick_up_0`, `${charPrefix}pick_up_1`, `${charPrefix}pick_up_2`, `${charPrefix}pick_up_1`];

        frames[`${charPrefix}lift_0`] = { frame: { x: 0, y: 432, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}lift_1`] = { frame: { x: 48, y: 432, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}lift_2`] = { frame: { x: 96, y: 432, w: frameWidth, h: frameHeight } };
        animations['lift'] = [`${charPrefix}lift_0`, `${charPrefix}lift_1`, `${charPrefix}lift_2`, `${charPrefix}lift_1`];

        frames[`${charPrefix}throw_0`] = { frame: { x: 0, y: 480, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}throw_1`] = { frame: { x: 48, y: 480, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}throw_2`] = { frame: { x: 96, y: 480, w: frameWidth, h: frameHeight } };
        animations['throw'] = [`${charPrefix}throw_0`, `${charPrefix}throw_1`, `${charPrefix}throw_2`, `${charPrefix}throw_1`];

        frames[`${charPrefix}hit_0`] = { frame: { x: 0, y: 528, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}hit_1`] = { frame: { x: 48, y: 528, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}hit_2`] = { frame: { x: 96, y: 528, w: frameWidth, h: frameHeight } };
        animations['hit'] = [`${charPrefix}hit_0`, `${charPrefix}hit_1`, `${charPrefix}hit_2`, `${charPrefix}hit_1`];

        frames[`${charPrefix}punch_0`] = { frame: { x: 0, y: 576, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}punch_1`] = { frame: { x: 48, y: 576, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}punch_2`] = { frame: { x: 96, y: 576, w: frameWidth, h: frameHeight } };
        animations['punch'] = [`${charPrefix}punch_0`, `${charPrefix}punch_1`, `${charPrefix}punch_2`, `${charPrefix}punch_1`];

        frames[`${charPrefix}shoot_0`] = { frame: { x: 0, y: 624, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}shoot_1`] = { frame: { x: 48, y: 624, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}shoot_2`] = { frame: { x: 96, y: 624, w: frameWidth, h: frameHeight } };
        animations['shoot'] = [`${charPrefix}shoot_0`, `${charPrefix}shoot_1`, `${charPrefix}shoot_2`, `${charPrefix}shoot_1`];

        frames[`${charPrefix}hurt_0`] = { frame: { x: 0, y: 672, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}hurt_1`] = { frame: { x: 48, y: 672, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}hurt_2`] = { frame: { x: 96, y: 672, w: frameWidth, h: frameHeight } };
        animations['hurt'] = [`${charPrefix}hurt_0`, `${charPrefix}hurt_1`, `${charPrefix}hurt_2`, `${charPrefix}hurt_1`];

        const sheet = new PIXI.Spritesheet(baseTexture, {
            frames: frames,
            animations: animations,
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
