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
        
        // Create a container for characters to ensure they render above the map.
        characterContainer = new PIXI.Container();
        characterContainer.sortableChildren = true; // Enable z-index sorting within this container
        mainApp.stage.addChild(characterContainer);


        // Pre-load all character assets
        await preloadCharacterAssets();

        // Load the Tiled map data and render it
        const mapData = await loadMapData(gameState.map.json);
        await renderMap(mapData);

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
        // 1. Await the asset load to get a PIXI.Texture object.
        const texture = await PIXI.Assets.load(url);
        
        // 2. Get the PIXI.BaseTexture from the loaded texture. This is what the Spritesheet requires.
        const baseTexture = texture.baseTexture;

        const frames = {};
        const animations = {};

        const charNumberMatch = url.match(/_(\d{2})\.png$/);
        const charPrefix = charNumberMatch ? `char_${charNumberMatch[1]}_` : '';

        const frameWidth = 48;
        const frameHeight = 48;

        // --- Define ALL Frames based on Spritesheet_animations_GUIDE.png (48x48 grid) ---
        // Row 0: Walk Down (3 frames)
        frames[`${charPrefix}walk_down_0`] = { frame: { x: 0, y: 0, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_down_1`] = { frame: { x: 48, y: 0, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_down_2`] = { frame: { x: 96, y: 0, w: frameWidth, h: frameHeight } };
        animations['walk_down'] = [`${charPrefix}walk_down_0`, `${charPrefix}walk_down_1`, `${charPrefix}walk_down_2`, `${charPrefix}walk_down_1`];
        animations['idle_down'] = [`${charPrefix}walk_down_1`];

        // Row 1: Walk Left (3 frames)
        frames[`${charPrefix}walk_left_0`] = { frame: { x: 0, y: 48, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_left_1`] = { frame: { x: 48, y: 48, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_left_2`] = { frame: { x: 96, y: 48, w: frameWidth, h: frameHeight } };
        animations['walk_left'] = [`${charPrefix}walk_left_0`, `${charPrefix}walk_left_1`, `${charPrefix}walk_left_2`, `${charPrefix}walk_left_1`];
        animations['idle_left'] = [`${charPrefix}walk_left_1`];

        // Row 2: Walk Right (3 frames)
        frames[`${charPrefix}walk_right_0`] = { frame: { x: 0, y: 96, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_right_1`] = { frame: { x: 48, y: 96, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_right_2`] = { frame: { x: 96, y: 96, w: frameWidth, h: frameHeight } };
        animations['walk_right'] = [`${charPrefix}walk_right_0`, `${charPrefix}walk_right_1`, `${charPrefix}walk_right_2`, `${charPrefix}walk_right_1`];
        animations['idle_right'] = [`${charPrefix}walk_right_1`];

        // Row 3: Walk Up (3 frames)
        frames[`${charPrefix}walk_up_0`] = { frame: { x: 0, y: 144, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_up_1`] = { frame: { x: 48, y: 144, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}walk_up_2`] = { frame: { x: 96, y: 144, w: frameWidth, h: frameHeight } };
        animations['walk_up'] = [`${charPrefix}walk_up_0`, `${charPrefix}walk_up_1`, `${charPrefix}walk_up_2`, `${charPrefix}walk_up_1`];
        animations['idle_up'] = [`${charPrefix}walk_up_1`];

        // Row 4: Sleep (3 frames)
        frames[`${charPrefix}sleep_0`] = { frame: { x: 0, y: 192, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}sleep_1`] = { frame: { x: 48, y: 192, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}sleep_2`] = { frame: { x: 96, y: 192, w: frameWidth, h: frameHeight } };
        animations['sleep'] = [`${charPrefix}sleep_0`, `${charPrefix}sleep_1`, `${charPrefix}sleep_2`, `${charPrefix}sleep_1`];

        // Row 5: Sit (3 frames)
        frames[`${charPrefix}sit_0`] = { frame: { x: 0, y: 240, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}sit_1`] = { frame: { x: 48, y: 240, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}sit_2`] = { frame: { x: 96, y: 240, w: frameWidth, h: frameHeight } };
        animations['sit'] = [`${charPrefix}sit_0`, `${charPrefix}sit_1`, `${charPrefix}sit_2`, `${charPrefix}sit_1`];

        // Row 6: Phase (3 frames)
        frames[`${charPrefix}phase_0`] = { frame: { x: 0, y: 288, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}phase_1`] = { frame: { x: 48, y: 288, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}phase_2`] = { frame: { x: 96, y: 288, w: frameWidth, h: frameHeight } };
        animations['phase'] = [`${charPrefix}phase_0`, `${charPrefix}phase_1`, `${charPrefix}phase_2`, `${charPrefix}phase_1`];

        // Row 7: Push (3 frames)
        frames[`${charPrefix}push_0`] = { frame: { x: 0, y: 336, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}push_1`] = { frame: { x: 48, y: 336, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}push_2`] = { frame: { x: 96, y: 336, w: frameWidth, h: frameHeight } };
        animations['push'] = [`${charPrefix}push_0`, `${charPrefix}push_1`, `${charPrefix}push_2`, `${charPrefix}push_1`];

        // Row 8: Pick Up (3 frames)
        frames[`${charPrefix}pick_up_0`] = { frame: { x: 0, y: 384, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}pick_up_1`] = { frame: { x: 48, y: 384, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}pick_up_2`] = { frame: { x: 96, y: 384, w: frameWidth, h: frameHeight } };
        animations['pick_up'] = [`${charPrefix}pick_up_0`, `${charPrefix}pick_up_1`, `${charPrefix}pick_up_2`, `${charPrefix}pick_up_1`];

        // Row 9: Lift (3 frames)
        frames[`${charPrefix}lift_0`] = { frame: { x: 0, y: 432, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}lift_1`] = { frame: { x: 48, y: 432, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}lift_2`] = { frame: { x: 96, y: 432, w: frameWidth, h: frameHeight } };
        animations['lift'] = [`${charPrefix}lift_0`, `${charPrefix}lift_1`, `${charPrefix}lift_2`, `${charPrefix}lift_1`];

        // Row 10: Throw (3 frames)
        frames[`${charPrefix}throw_0`] = { frame: { x: 0, y: 480, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}throw_1`] = { frame: { x: 48, y: 480, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}throw_2`] = { frame: { x: 96, y: 480, w: frameWidth, h: frameHeight } };
        animations['throw'] = [`${charPrefix}throw_0`, `${charPrefix}throw_1`, `${charPrefix}throw_2`, `${charPrefix}throw_1`];

        // Row 11: Hit (3 frames)
        frames[`${charPrefix}hit_0`] = { frame: { x: 0, y: 528, w: frameWidth, h: frameHeight } };
        frames[`${charPrefix}hit_1`] = { frame: { x: 48, y: 528, w: frameWidth, h: frameHeight }
