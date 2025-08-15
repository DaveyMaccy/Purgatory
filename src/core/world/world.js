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
import { TASK_DICTIONARY, getRandomTaskForRole, validateTaskDictionary } from './task-dictionary.js';
import { WorldStateManager } from './world-state-manager.js';

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
        
        // World state manager for item tracking
        this.worldStateManager = new WorldStateManager();

        // NEW PROPERTIES FOR INFINITE MAP
        this.mapData = officeLayout; // Store the raw map data
        // CRITICAL FIX: Set TILE_SIZE only once and ensure it's always 48
        this.TILE_SIZE = 48; // FORCE 48 pixels, ignore map data
        console.error(`[WORLD DEBUG] TILE_SIZE forced to: ${this.TILE_SIZE}, map tilewidth was: ${this.mapData?.tilewidth}`);
        
        this.worldBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 }; // To store the true map size in tiles
        this.chunks = new Map(); // To store data for loaded chunks, keyed by "x,y"
        this.activeChunks = new Set(); // To track the keys of currently visible chunks
        // this.navGrid is now managed by this.navGridInstance
       this.officeType = 'corporate';
        
        // Load task dictionary from external file
        this.taskDictionary = TASK_DICTIONARY;
        
        // Validate task dictionary on initialization
        const validation = validateTaskDictionary();
        if (!validation.isValid) {
            console.error('❌ Task dictionary validation failed:', validation.errors);
        } else {
            console.log('✅ Task dictionary validated successfully');
        }
        
        // REMOVED DUPLICATE TILE_SIZE ASSIGNMENT
        
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
    if (!renderer || !renderer.isInitialized || !characters || characters.length === 0) return;

    // ZONE 1: The Visual Area - Based on what the camera can see.
    const view = renderer.app.view;
    const camera = renderer.worldContainer;
    const visualBuffer = 2 * this.TILE_SIZE; // Load chunks just before they enter the screen.
    const visualArea = {
        minX: -camera.x - visualBuffer,
        minY: -camera.y - visualBuffer,
        maxX: -camera.x + view.width + visualBuffer,
        maxY: -camera.y + view.height + visualBuffer,
    };

    // ZONE 2: The Functional Area - A large radius around the player for NPC pathfinding.
    const player = this.characterManager.getPlayerCharacter();
    if (!player) return; // Can't define a functional area without a player.

    const functionalBuffer = 64 * this.TILE_SIZE; // A generous 64-tile radius for NPCs.
    const functionalArea = {
        minX: player.position.x - functionalBuffer,
        minY: player.position.y - functionalBuffer,
        maxX: player.position.x + functionalBuffer,
        maxY: player.position.y + functionalBuffer,
    };

    // COMBINED AREA: The union of both zones for loading.
    const combinedArea = {
        minX: Math.min(visualArea.minX, functionalArea.minX),
        minY: Math.min(visualArea.minY, functionalArea.minY),
        maxX: Math.max(visualArea.maxX, functionalArea.maxX),
        maxY: Math.max(visualArea.maxY, functionalArea.maxY),
    };

    // Gather all unique chunk coordinates from ALL layers to create a master list.
    const allChunkCoords = new Map();
    this.mapData.layers.forEach(layer => {
        if (layer.chunks) {
            layer.chunks.forEach(chunk => {
                const key = `${chunk.x},${chunk.y}`;
                if (!allChunkCoords.has(key)) {
                    allChunkCoords.set(key, chunk);
                }
            });
        }
    });

    // Determine which chunks are needed by checking the master list against the combined area.
    const neededChunks = new Set();
    for (const [key, chunk] of allChunkCoords.entries()) {
        const chunkBounds = {
            minX: chunk.x * this.TILE_SIZE,
            minY: chunk.y * this.TILE_SIZE,
            maxX: (chunk.x + chunk.width) * this.TILE_SIZE,
            maxY: (chunk.y + chunk.height) * this.TILE_SIZE,
        };

        if (combinedArea.minX < chunkBounds.maxX && combinedArea.maxX > chunkBounds.minX &&
            combinedArea.minY < chunkBounds.maxY && combinedArea.maxY > chunkBounds.minY) {
            neededChunks.add(key);
        }
    }

    let chunksChanged = false;

    // Load new chunks that are needed.
    for (const key of neededChunks) {
        if (!this.activeChunks.has(key)) {
            chunksChanged = true;
            const [x, y] = key.split(',').map(Number);
            this.mapData.layers.forEach(layer => {
                if (layer.chunks) {
                    const chunkData = layer.chunks.find(c => c.x === x && c.y === y);
                    if (chunkData) {
                        renderer.renderChunk(chunkData, layer.name);
                    }
                }
            });
            this.activeChunks.add(key);
        }
    }

    // Unload old chunks that are no longer needed.
    for (const key of this.activeChunks) {
        if (!neededChunks.has(key)) {
            chunksChanged = true;
            renderer.removeChunk(key);
            this.activeChunks.delete(key);
            console.log(`Unloaded chunk: ${key}`);
        }
    }

    // Regenerate collision grid for the active area ONLY if the set of active chunks has changed.
    if (chunksChanged) {
        this.generateNavGridForActiveArea();
    }
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
     * NEW HELPER: Finds the nearest walkable position to a target pixel coordinate.
     * This prevents pathfinding failures when an object's default action point is inside an obstacle.
     * @param {Object} targetPos - The desired destination {x, y} in pixels.
     * @returns {Object|null} A walkable {x, y} position in pixels, or null if none is found.
     */
    findNearestWalkablePosition(targetPos) {
        // Convert the target to tile coordinates first.
        const targetTile = {
            x: Math.floor(targetPos.x / this.TILE_SIZE),
            y: Math.floor(targetPos.y / this.TILE_SIZE)
        };
        
        // If the target's tile is walkable, return the CENTER of that tile.
        // CRITICAL FIX: Always return centered coordinates for ANY walkable position
        if (this.isPositionWalkable(targetPos.x, targetPos.y)) {
            return {
                x: (targetTile.x * this.TILE_SIZE) + (this.TILE_SIZE / 2),
                y: (targetTile.y * this.TILE_SIZE) + (this.TILE_SIZE / 2)
            };
        }

        // If the initial tile isn't walkable, begin searching nearby for one.
        const startTile = {
            x: Math.floor(targetPos.x / this.TILE_SIZE),
            y: Math.floor(targetPos.y / this.TILE_SIZE)
        };

        const queue = [startTile];
        const visited = new Set([`${startTile.x},${startTile.y}`]);
        const maxSearchDistance = 5; // Search a 5-tile radius

        while (queue.length > 0) {
            const currentTile = queue.shift();
            
            // Check if this tile is a valid destination by converting back to centered pixel coordinates
            const currentPixelPos = {
                x: (currentTile.x * this.TILE_SIZE) + (this.TILE_SIZE / 2),
                y: (currentTile.y * this.TILE_SIZE) + (this.TILE_SIZE / 2)
            };

            if (this.isPositionWalkable(currentPixelPos.x, currentPixelPos.y)) {
                return currentPixelPos; // Found a walkable spot
            }
            
            // If the search radius is exceeded, stop exploring from this branch
            const distance = Math.abs(currentTile.x - startTile.x) + Math.abs(currentTile.y - startTile.y);
            if (distance >= maxSearchDistance) {
                continue;
            }

            // Add neighbors to the queue for the next level of search
            const neighbors = [
                { x: currentTile.x, y: currentTile.y - 1 }, { x: currentTile.x + 1, y: currentTile.y },
                { x: currentTile.x, y: currentTile.y + 1 }, { x: currentTile.x - 1, y: currentTile.y }
            ];
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push(neighbor);
                }
            }
        }

        console.warn(`Pathfinding: Could not find any walkable tile near (${targetPos.x}, ${targetPos.y})`);
        return null; // No walkable position found nearby
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
        
        // If a path is found, remove the first node (which is the starting tile).
        // This ensures the character immediately moves towards the next tile's center.
        if (tilePath.length > 0) {
            tilePath.shift();
        }

        // Convert tile path back to PIXEL coordinates, re-adding the offset
        return tilePath.map(tile => ({
            x: ((tile.x + this.worldBounds.minX) * this.TILE_SIZE) + (this.TILE_SIZE / 2),
            y: ((tile.y + this.worldBounds.minY) * this.TILE_SIZE) + (this.TILE_SIZE / 2)
        }));
    }

    return [];
}

    // NOTE: Task dictionary now loaded from external file in constructor
    
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
            // Assign tasks to ALL characters, including the player
            this.assignNewTaskToCharacter(character);
        });

       console.log('✅ Initial task assignment complete');
        
        // World item initialization is now handled by the GameCoordinator during startup.
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
            
            // Center the spawn point within its tile for consistent positioning.
            const centeredX = Math.floor(spawn.x / this.TILE_SIZE) * this.TILE_SIZE + (this.TILE_SIZE / 2);
            const centeredY = Math.floor(spawn.y / this.TILE_SIZE) * this.TILE_SIZE + (this.TILE_SIZE / 2);
            
            return { x: centeredX, y: centeredY };
        }
    }
    
    // Fallback to random walkable position
    console.log('📍 No spawn points found, using random walkable position');
    const maxAttempts = 50;
    let attempts = 0;
        
        while (attempts < maxAttempts) {
            // This logic now correctly generates random coordinates within the GLOBAL tile bounds
            const gridWidth = this.worldBounds.maxX - this.worldBounds.minX;
            const gridHeight = this.worldBounds.maxY - this.worldBounds.minY;
            
            const tileX = Math.floor(Math.random() * gridWidth) + this.worldBounds.minX;
            const tileY = Math.floor(Math.random() * gridHeight) + this.worldBounds.minY;

            // Convert the global tile coordinate to a global centered pixel coordinate
            const pixelX = (tileX * this.TILE_SIZE) + (this.TILE_SIZE / 2);
            const pixelY = (tileY * this.TILE_SIZE) + (this.TILE_SIZE / 2);
            
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
        // Generate LOCAL grid coordinates (0-based for the navGrid)
        const localTileX = Math.floor(Math.random() * gridWidth);
        const localTileY = Math.floor(Math.random() * gridHeight);

        if (this.navGridInstance.isWalkable(localTileX, localTileY)) {
            // Convert LOCAL tile position to GLOBAL PIXEL coordinates
            const globalTileX = localTileX + this.worldBounds.minX;
            const globalTileY = localTileY + this.worldBounds.minY;
            return {
                x: (globalTileX * this.TILE_SIZE) + (this.TILE_SIZE / 2),
                y: (globalTileY * this.TILE_SIZE) + (this.TILE_SIZE / 2)
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
        
        // Check for characters without tasks and assign new ones
        this.checkForIdleCharacters();
        
        // Update world state manager
        if (this.worldStateManager) {
            this.worldStateManager.update(deltaTime, Date.now());
        }
        
        // Future: Update world objects, environmental effects, etc.
    }
    
    /**
     * Get the world state manager for item interactions
     */
    getWorldStateManager() {
        return this.worldStateManager;
    }
    
    /**
     * Assign a new task to a specific character
     * @param {Object} character - Character object
     */
   assignNewTaskToCharacter(character) {
        // Allow both player and NPCs to get task assignments
        
        // Use the helper function to get a random task, avoiding repetition
        const randomTask = getRandomTaskForRole(character.jobRole, character.lastCompletedTask);
        
        if (randomTask) {
            // SAFE: Use new assignTask method if it exists, fallback to direct assignment
            if (character.assignTask && typeof character.assignTask === 'function') {
                character.assignTask(randomTask);
            } else {
                // Fallback to old method for compatibility
                character.assignedTask = { ...randomTask };
                console.log(`📋 ${character.name} assigned new task: ${randomTask.displayName}`);
            }
            
            character.lastCompletedTask = randomTask.displayName;
        } else {
            console.warn(`⚠️ No tasks available for job role: ${character.jobRole}`);
        }
    }
    
    /**
     * Check for characters without assigned tasks and assign new ones
     */
    checkForIdleCharacters() {
        if (!this.characterManager || !this.characterManager.characters) return;
        
        this.characterManager.characters.forEach(character => {
            // Check for characters without tasks - allow both NPCs and player
            // But maybe be less aggressive about reassigning to player
            if (!character.assignedTask) {
                if (character.isPlayer) {
                    // For player, only auto-assign if they've been idle for a while
                    // This gives player agency while still having workplace expectations
                    console.log(`👤 Player ${character.name} has no assigned task`);
                    this.assignNewTaskToCharacter(character);
                } else {
                    console.log(`🔄 Found idle NPC: ${character.name}, assigning new task...`);
                    this.assignNewTaskToCharacter(character);
                }
            }
        });
    }
}












