// This file simulates the game's backend for the test harness.

// This is the single source of truth for the tile size.
const TILE_SIZE = 48;

const PREMADE_CHARACTER_SPRITES = [];
// BILO_PLACEHOLDER: You must change the number "20" to match the exact
// number of character sprite sheets you have in the assets/characters folder.
for (let i = 1; i <= 20; i++) {
    // String(i).padStart(2, '0') ensures that numbers 1-9 get a leading zero.
    const number = String(i).padStart(2, '0');
    // Path is now relative to the HTML file, so it's 'assets/characters/'
    PREMADE_CHARACTER_SPRITES.push(`assets/characters/Premade_Character_48x48_${number}.png`);
}

const gameState = {
    characters: [
        {
            id: 'char_player',
            name: 'Alex', // Default name
            isPlayer: true,
            isEnabled: true,
            jobRole: 'Senior Coder', // Default job role

            // --- Core Attributes ---
            physicalAttributes: { age: 28, height: 175, weight: 70, build: 'Average', looks: 7 },
            skills: { competence: 7, laziness: 2, charisma: 6, leadership: 4 }, // Scored 1-10

            // --- Tag System ---
            personalityTags: ['Creative', 'Introverted', 'Witty', 'Flirty'],
            experienceTags: ['5+ Years Experience', 'Startup Background'],

            // --- Dynamic State ---
            needs: { energy: 8, hunger: 9, social: 6, comfort: 10, stress: 1 }, // Scored 1-10
            mood: 'Neutral', // 'Happy', 'Sad', 'Angry', 'Stressed', 'Tired'

            // --- Action & Interaction State ---
            actionState: 'idle_down', // 'DEFAULT', 'HoldingItem', 'InConversation'
            facingAngle: 90, // Current direction in degrees (0-359). Default is 90 (facing down).
            maxSightRange: 250, // Maximum sight distance in pixels.
            isBusy: false, // Flag to prevent contradictory prompts
            currentAction: null, // e.g., { type: 'USE_COMPUTER', duration: 300, elapsedTime: 0 }
            currentActionTranscript: [], // A log of the sub-steps of a complex action
            pendingIntent: null, // A full action object queued after a prerequisite action is complete.
            heldItem: null, // e.g., { id: 'coffee_mug_1', type: 'coffee_mug' }
            conversationId: null, // ID of the conversation they are in

            // --- Memory & Goals ---
            shortTermMemory: [], // A rolling log of the last 20 fully completed actions by any character in the vicinity.
            longTermMemory: [], // A curated list of up to 100 significant events, summarized by the AI itself.
            longTermGoal: { type: 'promotion', target: 'Senior Position', progress: 0.0 }, // The AI's current primary ambition.
            assignedTask: { displayName: 'Review Q4 Reports', requiredLocation: 'desk_1' }, // The "bullshit busy work" task

            // --- Backend & Visuals ---
            inventory: [{ id: 'smartphone_1', type: 'smartphone', name: 'Smartphone' }], // Items that are pocketed, not held.
            deskItems: [{ id: 'novelty_mug_1', type: 'novelty_mug', name: 'Novelty Mug' }], // Items placed on or under the character's desk at game start.
            relationships: { 'char_1': 55, 'char_2': 32 }, // Social standing, 0-100. Initial value is 50.
            api: { key: '...', provider: 'gemma-3-27b' }, // User-provided API key and a provider  selected from a dropdown.
            promptCount: 0,
            deskId: 'desk_1', // Character's "home base"
            path: [], // Temporary array of coordinates for movement.
            position: { x: -366.667, y: -189.333 }, // Real-time coordinate on the canvas. Updated to spawn_point_1
            portrait: '', // base64 string for the UI portrait. BILO_PLACEHOLDER: This is currently an empty string.
            spriteColors: { skin: '#EAC086', hair: '#2C1E10', shirt: '#4A5568', pants: '#2D3748', shoes: '#1A202C' }, // BILO_PLACEHOLDER: Still using spriteColors instead of appearance object.
            pixiSprite: null // BILO_PLACEHOLDER: Still using pixiSprite for pre-made character sprites (Phase 1).
        }
    ],
    map: {
        // This tells the front-end which Tiled map file to load.
        json: 'assets/maps/purgatorygamemap.json', 
        data: null // To store the parsed map data
    },
    navGrid: null, // To store the generated navigation grid
    worldObjects: [] // Added to store interactive objects in the world
};

// BILO_PLACEHOLDER: This is a simplified A* implementation.
function findPath(grid, start, end) {
    const cols = grid[0].length;
    const rows = grid.length;

    function heuristic(pos0, pos1) {
        // Manhattan distance
        const d1 = Math.abs(pos1.x - pos0.x);
        const d2 = Math.abs(pos1.y - pos0.y);
        return d1 + d2;
    }

    function Node(x, y, g, h, f, parent) {
        this.x = x;
        this.y = y;
        this.g = g;
        this.h = h;
        this.f = f;
        this.parent = parent;
    }

    const openList = [];
    const closedList = [];

    const startNode = new Node(start.x, start.y, 0, heuristic(start, end), heuristic(start, end), null);
    openList.push(startNode);

    while (openList.length > 0) {
        let lowIdx = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowIdx].f) {
                lowIdx = i;
            }
        }
        const currentNode = openList[lowIdx];

        if (currentNode.x === end.x && currentNode.y === end.y) {
            let curr = currentNode;
            const path = [];
            while (curr.parent) {
                path.push({ x: curr.x, y: curr.y });
                curr = curr.parent;
            }
            return path.reverse();
        }

        openList.splice(lowIdx, 1);
        closedList.push(currentNode);

        const neighbors = [];
        const x = currentNode.x;
        const y = currentNode.y;

        if (x < cols - 1) neighbors.push(new Node(x + 1, y));
        if (x > 0) neighbors.push(new Node(x - 1, y));
        if (y < rows - 1) neighbors.push(new Node(x, y + 1));
        if (y > 0) neighbors.push(new Node(x, y - 1));

        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];

            if (neighbor.x < 0 || neighbor.x >= cols || neighbor.y < 0 || neighbor.y >= rows ||
                grid[neighbor.y][neighbor.x] === 1 ||
                closedList.find(node => node.x === neighbor.x && node.y === neighbor.y)) {
                continue;
            }

            const gScore = currentNode.g + 1;

            let isNewPath = false;
            const existingNode = openList.find(node => node.x === neighbor.x && node.y === neighbor.y);

            if (existingNode) {
                if (gScore < existingNode.g) {
                    existingNode.g = gScore;
                    isNewPath = true;
                }
            } else {
                neighbor.g = gScore;
                openList.push(neighbor);
                isNewPath = true;
            }

            if (isNewPath) {
                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;
            }
        }
    }
    return null; // No path found
}


function generateNavGrid(mapData) {
    const gridWidth = Math.ceil(mapData.width * TILE_SIZE / TILE_SIZE);
    const gridHeight = Math.ceil(mapData.height * TILE_SIZE / TILE_SIZE);

    let navGrid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));

    for (const layer of mapData.layers) {
        const isCollisionLayer = layer.properties?.some(p => p.name === 'collides' && p.value === true);

        if (layer.type === 'tilelayer' && isCollisionLayer) {
            for (const chunk of layer.chunks) {
                for (let i = 0; i < chunk.data.length; i++) {
                    const gid = chunk.data[i];
                    const tileId = gid & 0x1FFFFFFF;
                    if (tileId === 0) continue;

                    const gridX = chunk.x + (i % chunk.width);
                    const gridY = chunk.y + Math.floor(i / chunk.width);

                    if (gridY >= 0 && gridY < gridHeight && gridX >= 0 && gridX < gridWidth) {
                        navGrid[gridY][gridX] = 1;
                    }
                }
            }
        } else if (layer.type === 'objectgroup') {
            for (const obj of layer.objects) {
                const isObstacle = obj.properties?.some(p => p.name === 'collides' && p.value === true) ||
                                   ['desk', 'chair', 'misc', 'food_and_drink', 'storage', 'office_equipment', 'room'].includes(obj.type);
                if (isObstacle) {
                    const startGridX = Math.floor(obj.x / TILE_SIZE);
                    const startGridY = Math.floor(obj.y / TILE_SIZE);
                    const endGridX = Math.ceil((obj.x + obj.width) / TILE_SIZE);
                    const endGridY = Math.ceil((obj.y + obj.height) / TILE_SIZE);

                    for (let y = startGridY; y < endGridY; y++) {
                        for (let x = startGridX; x < endGridX; x++) {
                            if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
                                navGrid[y][x] = 1;
                            }
                        }
                    }
                }
                if (obj.type && !['room', 'spawn_point', ''].includes(obj.type) && obj.name) {
                     gameState.worldObjects.push({
                        id: obj.id,
                        name: obj.name,
                        type: obj.type,
                        x: obj.x,
                        y: obj.y,
                        width: obj.width,
                        height: obj.height,
                        tags: []
                    });
                }
            }
        }
    }

    for (const char of gameState.characters) {
        const charGridX = Math.floor(char.position.x / TILE_SIZE);
        const charGridY = Math.floor(char.position.y / TILE_SIZE);
        if (charGridY >= 0 && charGridY < gridHeight && charGridX >= 0 && charGridX < gridWidth) {
            if (navGrid[charGridY][charGridX] === 1) {
                navGrid[charGridY][charGridX] = 0;
                console.warn(`Character ${char.name} spawned on an obstacle. Temporarily made tile walkable.`);
            }
        }
    }

    gameState.navGrid = navGrid;
    console.log("Navigation grid generated from map data.");
}

function findDeskById(deskId) {
    if (deskId === 'desk_1') {
        return { x: -382.667 + 129.333 / 2, y: 168 + 54.667 / 2, width: 0, height: 0 };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
}

function findRandomWalkableTileNear(location) {
    const gridX = Math.floor(location.x / TILE_SIZE);
    const gridY = Math.floor(location.y / TILE_SIZE);

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const checkX = gridX + dx;
            const checkY = gridY + dy;
            if (checkY >= 0 && checkY < gameState.navGrid.length &&
                checkX >= 0 && checkX < gameState.navGrid[0].length &&
                gameState.navGrid[checkY][checkX] === 0) {
                return { x: checkX * TILE_SIZE + TILE_SIZE / 2, y: checkY * TILE_SIZE + TILE_SIZE / 2 };
            }
        }
    }
    console.warn("Could not find a walkable tile near", location);
    return null;
}

function findRandomSpawnZone(locations) {
    if (locations.includes('break_room')) {
        return { name: 'break_room', x: 111, y: 482, width: 447, height: 272 };
    }
    if (locations.includes('desk')) {
        return { name: 'desk', x: -382.667, y: 168, width: 129.333, height: 54.667 };
    }
    if (locations.includes('main_office')) {
        return { name: 'main_office', x: -466.667, y: 0, width: 1051.52, height: 460.606 };
    }
    return null;
}

function findRandomWalkableTileInZone(zone) {
    if (!zone) return null;
    const startGridX = Math.floor(zone.x / TILE_SIZE);
    const startGridY = Math.floor(zone.y / TILE_SIZE);
    const endGridX = Math.ceil((zone.x + zone.width) / TILE_SIZE);
    const endGridY = Math.ceil((zone.y + zone.height) / TILE_SIZE);

    const walkableTiles = [];
    for (let y = startGridY; y < endGridY; y++) {
        for (let x = startGridX; x < endGridX; x++) {
            if (y >= 0 && y < gameState.navGrid.length &&
                x >= 0 && x < gameState.navGrid[0].length &&
                gameState.navGrid[y][x] === 0) {
                walkableTiles.push({ x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 });
            }
        }
    }

    if (walkableTiles.length > 0) {
        return walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
    }
    return null;
}

function createWorldObject(type, position, tags = []) {
    const id = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const newObject = {
        id: id,
        type: type,
        name: type.replace(/_/g, ' '),
        position: position,
        tags: tags,
    };
    gameState.worldObjects.push(newObject);
    console.log("Created world object:", newObject);
    return newObject;
}

const ITEM_SPAWN_LOGIC = {
    'coffee_mug': { locations: ['break_room', 'desk', 'main_office'], maxCount: 5 },
    'snack': { locations: ['break_room'], maxCount: 3 },
    'notebook': { locations: ['desk', 'main_office'], maxCount: 4 },
    'stapler': { locations: ['desk', 'main_office'], maxCount: 2 },
    'photo_frame': { locations: ['desk', 'main_office'], maxCount: 3 }
};

function populateWorldWithObjects(characters) {
    characters.forEach(character => {
        if (character.deskItems && character.deskId) {
            const deskLocation = findDeskById(character.deskId);
            if (deskLocation) {
                character.deskItems.forEach(itemToPlace => {
                    const position = findRandomWalkableTileNear(deskLocation);
                    if (position) {
                        createWorldObject(itemToPlace.type, position, itemToPlace.tags);
                    }
                });
            }
        }
    });

    for (const itemType in ITEM_SPAWN_LOGIC) {
        const logic = ITEM_SPAWN_LOGIC[itemType];
        const count = Math.floor(Math.random() * (logic.maxCount + 1));

        for (let i = 0; i < count; i++) {
            const spawnZone = findRandomSpawnZone(logic.locations);
            if (spawnZone) {
                const position = findRandomWalkableTileInZone(spawnZone);
                if (position) {
                    createWorldObject(itemType, position);
                }
            }
        }
    }
    console.log("World objects populated:", gameState.worldObjects);
}


const backend = {
    initialize: (mapData) => {
        gameState.map.data = mapData;
        generateNavGrid(mapData);
        populateWorldWithObjects(gameState.characters);
        console.log("Backend initialized with map data, nav grid, and world objects.");
    },

    findPathFor: (character, targetWorldPos) => {
        const startGridPos = {
            x: Math.floor(character.position.x / TILE_SIZE),
            y: Math.floor(character.position.y / TILE_SIZE)
        };
        const endGridPos = {
            x: Math.floor(targetWorldPos.x / TILE_SIZE),
            y: Math.floor(targetWorldPos.y / TILE_SIZE)
        };

        if (!gameState.navGrid[endGridPos.y] || gameState.navGrid[endGridPos.y][endGridPos.x] === undefined || gameState.navGrid[endGridPos.y][endGridPos.x] === 1) {
            console.warn("Target position is impassable or outside grid. Cannot find path.");
            character.path = [];
            return;
        }

        console.log(`Mock Backend: Finding path for ${character.name} from (${startGridPos.x},${startGridPos.y}) to (${endGridPos.x},${endGridPos.y})`);
        const path = findPath(gameState.navGrid, startGridPos, endGridPos);

        if (path) {
            character.path = path.map(p => ({
                x: p.x * TILE_SIZE + TILE_SIZE / 2,
                y: p.y * TILE_SIZE + TILE_SIZE / 2
            }));
            console.log("Path found:", character.path);
        } else {
            character.path = [];
            console.log("No path found.");
        }
    },

    update: (deltaTime) => {
        for (const character of gameState.characters) {
            if (character.path && character.path.length > 0) {
                const speed = 2.5;
                const nextPoint = character.path[0];

                const dx = nextPoint.x - character.position.x;
                const dy = nextPoint.y - character.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < speed) {
                    character.position.x = nextPoint.x;
                    character.position.y = nextPoint.y;
                    character.path.shift();

                    if (character.path.length === 0) {
                        if (character.actionState.startsWith('walk_')) {
                            character.actionState = character.actionState.replace('walk_', 'idle_');
                        }
                    }
                } else {
                    character.position.x += (dx / dist) * speed;
                    character.position.y += (dy / dist) * speed;

                    if (Math.abs(dx) > Math.abs(dy)) {
                        character.actionState = dx > 0 ? 'walk_right' : 'walk_left';
                    } else {
                        character.actionState = dy > 0 ? 'walk_down' : 'walk_up';
                    }
                }
            } else {
                if (character.actionState.startsWith('walk_')) {
                    character.actionState = character.actionState.replace('walk_', 'idle_');
                }
            }
        }
    }
};
