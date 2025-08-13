/**
 * STAGE 3 COMPLETE: World Management System
 * * This file handles:
 * - Map data loading from JSON files
 * - Navigation grid generation for character positioning
 * - World object management
 * - Task assignment system
 * - Position validation and pathfinding preparation
 * * PHASE 4 ADDITIONS:
 * - isPositionWalkable() method for obstacle checking
 * - findPath() method for pathfinding integration
 * - FIXED: Proper NavGrid instance creation and initialization
 */

import { NavGrid } from './nav-grid.js';

/**
 * Load map data from JSON file
 * @returns {Promise<Object>} The loaded map data
 */
export async function loadMapData() {
    try {
        console.log('🗺️ Loading map data from assets/maps/purgatorygamemap.json...');
        
        const response = await fetch('assets/maps/purgatorygamemap.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load map: HTTP ${response.status}`);
        }
        
        const mapData = await response.json();
        
        // Validate that we have the essential map data
        if (!mapData.width || !mapData.height) {
            throw new Error('Invalid map data: missing required properties (width, height)');
        }
        
        // Ensure we have layers even if they're empty
        if (!mapData.layers) {
            mapData.layers = [];
            console.warn('⚠️ Map data has no layers, using empty array');
        }
        
        // NEW: Extract tilesets information for renderer
        if (!mapData.tilesets) {
            mapData.tilesets = [];
            console.warn('⚠️ Map data has no tilesets');
        }
        
        console.log('✅ Map data loaded successfully:', {
            width: mapData.width,
            height: mapData.height,
            layers: mapData.layers.length,
            tilesets: mapData.tilesets.length,
            tilewidth: mapData.tilewidth || 48,
            tileheight: mapData.tileheight || 48
        });
        
        // NEW: Log layer information for debugging
        mapData.layers.forEach((layer, index) => {
            console.log(`📋 Layer ${index}:`, {
                name: layer.name || `Layer ${index}`,
                type: layer.type,
                visible: layer.visible,
                opacity: layer.opacity
            });
        });
        
        return mapData;
        
    } catch (error) {
        console.error('❌ Error loading map data:', error);
        
        // Return a default map if loading fails - PRESERVED FALLBACK
        console.log('🔧 Using fallback map data...');
        return {
            width: 30,  // Updated to match purgatorygamemap.json dimensions
            height: 20,
            tilewidth: 48,
            tileheight: 48,
            layers: [],
            tilesets: []
        };
    }
}

/**
 * World Class - Manages the game environment
 * Implements world systems from the SSOT documentation (Chapter 4)
 */
export class World {
    constructor(characterManager, officeLayout) {
        this.characterManager = characterManager;
        this.officeLayout = officeLayout;
        this.objects = [];
        this.rooms = [];
        // this.navGrid = []; // REMOVED
        this.navGridInstance = null; 
        this.gameTime = 0; // Game time in milliseconds

        // NEW PROPERTIES FOR INFINITE MAP
        this.mapData = officeLayout; // Store the raw map data
        this.TILE_SIZE = this.mapData.tilewidth || 48;
        this.worldBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 }; // To store the true map size in tiles
        this.chunks = new Map(); // To store data for loaded chunks, keyed by "x,y"
        this.activeChunks = new Set(); // To track the keys of currently visible chunks
        // this.navGrid is now managed by this.navGridInstance
        this.officeType = 'corporate';
        this.taskDictionary = this.createTaskDictionary();
        
        // TILE_SIZE is now a property of the World class, making it accessible
        // to other modules like characterManager.js.
        this.TILE_SIZE = officeLayout?.tilewidth || 48; // Standard tile size from map data
        
        // World dimensions
        // Use actual layer dimensions to match renderer
        const firstLayer = officeLayout?.layers?.[0];
        this.width = firstLayer?.width || officeLayout?.width || 30;
        this.height = firstLayer?.height || officeLayout?.height || 20;
        this.worldWidth = this.width * this.TILE_SIZE;
        this.worldHeight = this.height * this.TILE_SIZE;

        console.log(`🌍 World created: ${this.width}x${this.height} tiles (${this.worldWidth}x${this.worldHeight} pixels)`);
    }

    processMapData() {
    console.log('Processing infinite map data...');
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    this.mapData.layers.forEach(layer => {
        if (layer.chunks) {
            layer.chunks.forEach(chunk => {
                minX = Math.min(minX, chunk.x);
                minY = Math.min(minY, chunk.y);
                maxX = Math.max(maxX, chunk.x + chunk.width);
                maxY = Math.max(maxY, chunk.y + chunk.height);
            });
        }
    });

    this.worldBounds = { minX, minY, maxX, maxY };
    console.log('✅ World bounds calculated:', this.worldBounds);
}

updateActiveChunks(characters, renderer) {
    if (!characters || characters.length === 0) return;

    // 1. Calculate the "Active Area" bounding box
    let minCharX = Infinity, minCharY = Infinity, maxCharX = -Infinity, maxCharY = -Infinity;
    characters.forEach(char => {
        minCharX = Math.min(minCharX, char.position.x);
        minCharY = Math.min(minCharY, char.position.y);
        maxCharX = Math.max(maxCharX, char.position.x);
        maxCharY = Math.max(maxCharY, char.position.y);
    });

    const buffer = 10 * this.TILE_SIZE; // 10-tile buffer
    const activeArea = {
        minX: minCharX - buffer,
        minY: minCharY - buffer,
        maxX: maxCharX + buffer,
        maxY: maxCharY + buffer,
    };

    // 2. Determine which chunks are needed
    const neededChunks = new Set();
    // CORRECTED: Find the first tile layer to safely get chunks
    const firstTileLayer = this.mapData.layers.find(l => l.type === 'tilelayer' && l.chunks);
    if (firstTileLayer) {
        firstTileLayer.chunks.forEach(chunk => {
            const chunkBounds = {
                minX: chunk.x * this.TILE_SIZE,
                minY: chunk.y * this.TILE_SIZE,
                maxX: (chunk.x + chunk.width) * this.TILE_SIZE,
                maxY: (chunk.y + chunk.height) * this.TILE_SIZE,
            };

            // Check if chunk overlaps with the active area
            if (activeArea.minX < chunkBounds.maxX && activeArea.maxX > chunkBounds.minX &&
                activeArea.minY < chunkBounds.maxY && activeArea.maxY > chunkBounds.minY) {
                neededChunks.add(`${chunk.x},${chunk.y}`);
            }
        });
    }

    // 3. Load new chunks
    for (const key of neededChunks) {
        if (!this.activeChunks.has(key)) {
            const [x, y] = key.split(',').map(Number);
            this.mapData.layers.forEach(layer => {
                // CORRECTED: Only process layers that have chunks
                if (layer.chunks) {
                    const chunkData = layer.chunks.find(c => c.x === x && c.y === y);
                    if (chunkData) {
                        renderer.renderChunk(chunkData, layer.name);
                    }
                }
            });
            this.activeChunks.add(key);
            console.log(`Loaded chunk: ${key}`);
        }
    }

    // 4. Unload old chunks
    for (const key of this.activeChunks) {
        if (!neededChunks.has(key)) {
            renderer.removeChunk(key);
            this.activeChunks.delete(key);
            console.log(`Unloaded chunk: ${key}`);
        }
    }

    // 5. Regenerate collision grid for the active area
    this.generateNavGridForActiveArea();
}
    
generateNavGridForActiveArea() {
    // Create a new NavGrid instance covering the entire world space
    const gridWidth = this.worldBounds.maxX - this.worldBounds.minX;
    const gridHeight = this.worldBounds.maxY - this.worldBounds.minY;

    this.navGridInstance = new NavGrid();
    this.navGridInstance.initialize(gridWidth, gridHeight);

    // Find the collision layer
    const collisionLayer = this.mapData.layers.find(l => l.properties?.some(p => p.name === 'collides' && p.value === true));
    if (!collisionLayer) {
        console.warn("No collision layer found in map data.");
        return;
    }

    // Populate the grid with collision data ONLY from active chunks
    for (const chunkKey of this.activeChunks) {
        const [chunkX, chunkY] = chunkKey.split(',').map(Number);
        const chunk = collisionLayer.chunks.find(c => c.x === chunkX && c.y === chunkY);

        if (chunk) {
            for (let i = 0; i < chunk.data.length; i++) {
                if (chunk.data[i] > 0) { // If there's a tile here, it's a wall
                    const localX = i % chunk.width;
                    const localY = Math.floor(i / chunk.width);

                    // Convert to overall grid coordinates
                    const gridX = chunk.x - this.worldBounds.minX + localX;
                    const gridY = chunk.y - this.worldBounds.minY + localY;

                    this.navGridInstance.markObstacle(gridX, gridY);
                }
            }
        }
    }
}

    /**
     * NEW: Extract collision data from Tiled map layers
     * Looks for object layers with collision objects and tile layers that represent walls
     */
    extractCollisionLayer(mapData) {
        console.log('🧱 Extracting collision data from map layers...');
        
        if (!mapData.layers || mapData.layers.length === 0) {
            console.warn('⚠️ No layers found in map data');
            return [];
        }
        
        const collisionObjects = [];
        
        mapData.layers.forEach((layer, index) => {
            console.log(`🔍 Processing layer ${index}: ${layer.name || 'Unnamed'} (${layer.type})`);
            
            // Handle object layers (desks, walls, furniture)
            if (layer.type === 'objectgroup' && layer.objects) {
                layer.objects.forEach(obj => {
                    // Skip spawn points and action points
                    if (obj.name && (obj.name.includes('spawn_point') || obj.name.includes('action_point'))) {
                        return;
                    }
                    
                    // Add solid objects as collision areas
                    if (obj.type === 'desk' || obj.type === 'storage' || obj.type === 'misc' || 
                        obj.name && obj.name.includes('wall')) {
                        collisionObjects.push({
                            x: obj.x,
                            y: obj.y,
                            width: obj.width,
                            height: obj.height,
                            type: obj.type || 'obstacle',
                            name: obj.name || 'unnamed'
                        });
                        console.log(`  ➕ Added collision object: ${obj.name} (${obj.type})`);
                    }
                });
            }
            
            // Handle tile layers (for wall tiles)
            if (layer.type === 'tilelayer' && layer.data) {
                // This will be used by the renderer, but we can also extract wall tiles
                console.log(`  📦 Found tile layer with ${layer.data.length} tiles`);
                
                // Note: For now, we'll rely on object layers for collision.
                // If needed, we can add tile-based collision detection here.
            }
            
        });
        
        console.log(`✅ Extracted ${collisionObjects.length} collision objects`);
        return collisionObjects;
    }

    getMapSpawnPoints() {
        const spawnPoints = [];

        this.officeLayout.layers.forEach(layer => {
            if (layer.type === 'objectgroup' && layer.objects) {
                layer.objects.forEach(obj => {
                    if (obj.name && obj.name.includes('spawn_point')) {
                            spawnPoints.push({
                            x: obj.x + (obj.width || 0) / 2,
                            y: obj.y + (obj.height || 0) / 2,
                            name: obj.name
                            });
                            console.log(`🎯 Found spawn point: ${obj.name} at (${obj.x}, ${obj.y})`);
                    }
                });
            }
        });

    return spawnPoints;
    }
            
    /**
     * PHASE 4 ADD: Check if a pixel position is walkable
     * Converts pixel coordinates to tile coordinates and checks navGrid
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @returns {boolean} True if position is walkable
     */
    isPositionWalkable(x, y) {
    if (!this.navGridInstance) return false; // Grid not ready

    // Convert pixel coordinates to TILE coordinates, accounting for world offset
    const tileX = Math.floor(x / this.TILE_SIZE) - this.worldBounds.minX;
    const tileY = Math.floor(y / this.TILE_SIZE) - this.worldBounds.minY;

    // Use the NavGrid instance's own isWalkable method
    return this.navGridInstance.isWalkable(tileX, tileY);
}

    /**
     * PHASE 4 ADD: Find path between two pixel positions
     * Converts to tile coordinates and uses NavGrid's A* implementation
     * @param {Object} startPos - Starting position {x, y} in pixels
     * @param {Object} endPos - Ending position {x, y} in pixels
     * @returns {Array} Array of waypoints in pixel coordinates
     */
   findPath(startPos, endPos) {
    // Convert pixel positions to TILE positions, accounting for world offset
    const startTile = {
        x: Math.floor(startPos.x / this.TILE_SIZE) - this.worldBounds.minX,
        y: Math.floor(startPos.y / this.TILE_SIZE) - this.worldBounds.minY
    };

    const endTile = {
        x: Math.floor(endPos.x / this.TILE_SIZE) - this.worldBounds.minX,
        y: Math.floor(endPos.y / this.TILE_SIZE) - this.worldBounds.minY
    };

    // Use the NavGrid's findPath method
    if (this.navGridInstance) {
        const tilePath = this.navGridInstance.findPath(startTile, endTile);

        // Convert tile path back to PIXEL coordinates, re-adding the offset
        return tilePath.map(tile => ({
            x: ((tile.x + this.worldBounds.minX) * this.TILE_SIZE) + (this.TILE_SIZE / 2),
            y: ((tile.y + this.worldBounds.minY) * this.TILE_SIZE) + (this.TILE_SIZE / 2)
        }));
    }

    return [];
}

    /**
     * Create task dictionary for character assignments
     * Based on SSOT task system design - PRESERVED: Original task structure by job role
     */
    createTaskDictionary() {
        return {
            'Manager': [
                { displayName: 'Review Reports', requiredLocation: 'desk', duration: 30000 },
                { displayName: 'Attend Meeting', requiredLocation: 'meeting_room', duration: 45000 },
                { displayName: 'Plan Strategy', requiredLocation: 'desk', duration: 60000 }
            ],
            'Developer': [
                { displayName: 'Write Code', requiredLocation: 'desk', duration: 120000 },
                { displayName: 'Debug Issues', requiredLocation: 'desk', duration: 90000 },
                { displayName: 'Code Review', requiredLocation: 'desk', duration: 60000 }
            ],
            'Sales Rep': [
                { displayName: 'Cold Calls', requiredLocation: 'desk', duration: 90000 },
                { displayName: 'Update CRM', requiredLocation: 'desk', duration: 60000 },
                { displayName: 'Client Meeting', requiredLocation: 'meeting_room', duration: 45000 }
            ],
            'Marketing': [
                { displayName: 'Content Creation', requiredLocation: 'desk', duration: 150000 },
                { displayName: 'Social Media', requiredLocation: 'desk', duration: 45000 },
                { displayName: 'Campaign Analysis', requiredLocation: 'desk', duration: 90000 }
            ],
            'Intern': [
                { displayName: 'Coffee Run', requiredLocation: 'break_room', duration: 30000 },
                { displayName: 'File Organization', requiredLocation: 'desk', duration: 120000 },
                { displayName: 'Data Entry', requiredLocation: 'desk', duration: 180000 }
            ]
        };
    }

    /**
     * Assign initial tasks to all characters based on their job roles
     * This ensures every character has something to do when the game starts
     */
    assignInitialTasks() {
        console.log('📋 Assigning initial tasks to characters...');
        
        if (!this.characterManager || !this.characterManager.characters) {
            console.warn('⚠️ No character manager or characters available for task assignment');
            return;
        }

        this.characterManager.characters.forEach(character => {
            // Skip player character for task assignment (they're controlled by the player)
            if (character.isPlayer) {
                console.log(`👤 Skipping task assignment for player character: ${character.name}`);
                return;
            }

            // Get available tasks for the character's job role
            const availableTasks = this.taskDictionary[character.jobRole];
            
            if (availableTasks && availableTasks.length > 0) {
                // Assign a random task from their job role
                const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
                character.assignedTask = { ...randomTask };
                
                console.log(`📋 Assigned "${randomTask.displayName}" to ${character.name} (${character.jobRole})`);
            } else {
                console.warn(`⚠️ No tasks available for job role: ${character.jobRole}`);
            }
        });

        console.log('✅ Initial task assignment complete');
    }

    /**
     * PRESERVED: Get a spawn position that avoids obstacles
     * @returns {Object} Position object with x and y coordinates in pixels
     */
    getSpawnPosition() {
    // First try to use designated spawn points from map
    if (this.officeLayout && this.officeLayout.layers) {
        const spawnPoints = this.getMapSpawnPoints();
        if (spawnPoints.length > 0) {
            // Use spawn points in order, cycling if needed
            const spawnIndex = this.usedSpawnPoints || 0;
            const spawn = spawnPoints[spawnIndex % spawnPoints.length];
            this.usedSpawnPoints = (this.usedSpawnPoints || 0) + 1;
            console.log(`🎯 Using map spawn point ${spawnIndex}: (${spawn.x}, ${spawn.y})`);
            return spawn;
        }
    }
    
    // Fallback to random walkable position
    console.log('📍 No spawn points found, using random walkable position');
    const maxAttempts = 50;
    let attempts = 0;
        
        while (attempts < maxAttempts) {
            const x = Math.random() * (this.width - 2) + 1; // Keep away from walls
            const y = Math.random() * (this.height - 2) + 1;
            
            const pixelX = x * this.TILE_SIZE + this.TILE_SIZE / 2;
            const pixelY = y * this.TILE_SIZE + this.TILE_SIZE / 2;
            
            if (this.isPositionWalkable(pixelX, pixelY)) {
                return { x: pixelX, y: pixelY };
            }
            
            attempts++;
        }
        
        // Fallback position if no valid position found
        console.warn('⚠️ Could not find valid spawn position, using fallback');
        return { 
            x: 2 * this.TILE_SIZE + this.TILE_SIZE / 2, 
            y: 2 * this.TILE_SIZE + this.TILE_SIZE / 2 
        };
    }

    /**
     * PRESERVED: Get a random walkable position in the world
     * Used for initial character placement
     * @returns {Object} Position object with x and y coordinates in pixels
     */
    getRandomWalkablePosition() {
    if (!this.navGridInstance) {
        console.warn('⚠️ NavGrid not ready for getRandomWalkablePosition, using fallback.');
        return { x: 100, y: 100 };
    }

    const maxAttempts = 100;
    let attempts = 0;

    const gridWidth = this.worldBounds.maxX - this.worldBounds.minX;
    const gridHeight = this.worldBounds.maxY - this.worldBounds.minY;

    while (attempts < maxAttempts) {
        const tileX = Math.floor(Math.random() * gridWidth);
        const tileY = Math.floor(Math.random() * gridHeight);

        if (this.navGridInstance.isWalkable(tileX, tileY)) {
            // Convert tile position back to PIXEL coordinates, re-adding the offset
            return {
                x: ((tileX + this.worldBounds.minX) * this.TILE_SIZE) + (this.TILE_SIZE / 2),
                y: ((tileY + this.worldBounds.minY) * this.TILE_SIZE) + (this.TILE_SIZE / 2)
            };
        }

        attempts++;
    }

    // Fallback to a safe position if no walkable position found
    console.warn('⚠️ Could not find random walkable position, using fallback');
    return {
        x: (this.worldBounds.minX * this.TILE_SIZE) + 100,
        y: (this.worldBounds.minY * this.TILE_SIZE) + 100
    };
}

    /**
     * PRESERVED: Get the task dictionary for UI display
     */
    getTaskDictionary() {
        return this.taskDictionary;
    }

    /**
     * PRESERVED: Update world state (called each frame)
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Future: Update world objects, environmental effects, etc.
    }
}




