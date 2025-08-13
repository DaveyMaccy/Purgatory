/**
 * STAGE 3 COMPLETE: World Management System
 * 
 * This file handles:
 * - Map data loading from JSON files
 * - Navigation grid generation for character positioning
 * - World object management
 * - Task assignment system
 * - Position validation and pathfinding preparation
 * 
 * PHASE 4 ADDITIONS:
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
        this.navGrid = [];
        this.navGridInstance = null; // PHASE 4: Store NavGrid instance for pathfinding
        this.gameTime = 0; // Game time in milliseconds
        this.officeType = 'corporate';
        this.taskDictionary = this.createTaskDictionary();
        
        // TILE_SIZE is now a property of the World class, making it accessible
        // to other modules like characterManager.js.
        this.TILE_SIZE = officeLayout?.tilewidth || 48; // Standard tile size from map data
        
        // World dimensions
        this.width = officeLayout?.width || 30;
        this.height = officeLayout?.height || 20;
        this.worldWidth = this.width * this.TILE_SIZE;
        this.worldHeight = this.height * this.TILE_SIZE;

        console.log(`🌍 World created: ${this.width}x${this.height} tiles (${this.worldWidth}x${this.worldHeight} pixels)`);
    }

    /**
     * STAGE 2-3 CRITICAL: Generate navigation grid for character movement and positioning
     * This creates a 2D array representing walkable (0) and non-walkable (1) tiles
     * PHASE 4 FIXED: Proper NavGrid instance creation and initialization
     */
    generateNavGrid() {
        console.log('🗺️ Generating navigation grid...');
        
        try {
            // Initialize grid with all walkable tiles
            this.navGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
            
            // CRITICAL FIX: Use correct NavGrid constructor signature
            this.navGridInstance = new NavGrid();
            this.navGridInstance.initialize(this.width, this.height);
            
            console.log('✅ NavGrid A* instance created and initialized');
            
            // Mark obstacles based on map data or default office layout
            this.markObstacles();
            
            console.log(`✅ Navigation grid generated: ${this.width}x${this.height} tiles`);
            console.log('📊 Grid sample (first 5 rows):', this.navGrid.slice(0, 5));
            
        } catch (error) {
            console.error('❌ Failed to generate navigation grid:', error);
            // Create a simple fallback grid
            this.navGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
            console.log('🔧 Using fallback navigation grid');
        }
    }

    /**
     * Mark obstacles in the navigation grid
     * This creates walls and furniture as non-walkable areas
     */
  markObstacles() {
        console.log('🚧 Marking obstacles in navigation grid...');
        
        // If we have map data with collision objects, use those
        if (this.officeLayout && this.officeLayout.layers) {
            const collisionObjects = this.extractCollisionLayer(this.officeLayout);
            
            collisionObjects.forEach(obj => {
                // Convert world coordinates to grid coordinates
                const startX = Math.floor(obj.x / this.TILE_SIZE);
                const startY = Math.floor(obj.y / this.TILE_SIZE);
                const endX = Math.min(this.width - 1, Math.floor((obj.x + obj.width) / this.TILE_SIZE));
                const endY = Math.min(this.height - 1, Math.floor((obj.y + obj.height) / this.TILE_SIZE));
                
                // Mark all tiles covered by this object as non-walkable
                for (let y = Math.max(0, startY); y <= endY; y++) {
                    for (let x = Math.max(0, startX); x <= endX; x++) {
                        if (y < this.height && x < this.width) {
                            this.navGrid[y][x] = 1; // 1 = non-walkable
                        }
                    }
                }
                
                console.log(`  🚫 Marked obstacle: ${obj.name} at grid (${startX},${startY}) to (${endX},${endY})`);
            });
        } else {
            // PRESERVED: Fallback obstacle placement if no map data
            console.log('📍 Using fallback obstacle placement...');
            
            // Create basic office layout with walls around the perimeter
            for (let x = 0; x < this.width; x++) {
                this.navGrid[0][x] = 1; // Top wall
                this.navGrid[this.height - 1][x] = 1; // Bottom wall
            }
            for (let y = 0; y < this.height; y++) {
                this.navGrid[y][0] = 1; // Left wall  
                this.navGrid[y][this.width - 1] = 1; // Right wall
            }
            
            // Add some furniture obstacles in the middle area
            const furniturePositions = [
                {x: 3, y: 3, width: 2, height: 1}, // Desk 1
                {x: 6, y: 3, width: 2, height: 1}, // Desk 2
                {x: 9, y: 3, width: 2, height: 1}, // Desk 3
                {x: 3, y: 7, width: 2, height: 1}, // Desk 4
                {x: 6, y: 7, width: 2, height: 1}, // Desk 5
            ];
            
            furniturePositions.forEach((furniture, index) => {
                for (let y = furniture.y; y < furniture.y + furniture.height; y++) {
                    for (let x = furniture.x; x < furniture.x + furniture.width; x++) {
                        if (y < this.height && x < this.width) {
                            this.navGrid[y][x] = 1;
                        }
                    }
                }
                console.log(`  🪑 Added fallback furniture ${index + 1} at (${furniture.x},${furniture.y})`);
            });
        }
        
        // Count walkable vs non-walkable tiles
        let walkableTiles = 0;
        let blockedTiles = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.navGrid[y][x] === 0) walkableTiles++;
                else blockedTiles++;
            }
        }
        
        console.log(`✅ Navigation grid complete: ${walkableTiles} walkable, ${blockedTiles} blocked tiles`);
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
    
    /**
     * PHASE 4 ADD: Check if a pixel position is walkable
     * Converts pixel coordinates to tile coordinates and checks navGrid
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @returns {boolean} True if position is walkable
     */
    isPositionWalkable(x, y) {
        // Convert pixel coordinates to tile coordinates
        const tileX = Math.floor(x / this.TILE_SIZE);
        const tileY = Math.floor(y / this.TILE_SIZE);
        
        // Check bounds
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return false;
        }
        
        // Check navigation grid (0 = walkable, 1 = obstacle)
        return this.navGrid[tileY][tileX] === 0;
    }

    /**
     * PHASE 4 ADD: Find path between two pixel positions
     * Converts to tile coordinates and uses NavGrid's A* implementation
     * @param {Object} startPos - Starting position {x, y} in pixels
     * @param {Object} endPos - Ending position {x, y} in pixels
     * @returns {Array} Array of waypoints in pixel coordinates
     */
    findPath(startPos, endPos) {
        // Convert pixel positions to tile positions
        const startTile = {
            x: Math.floor(startPos.x / this.TILE_SIZE),
            y: Math.floor(startPos.y / this.TILE_SIZE)
        };
        
        const endTile = {
            x: Math.floor(endPos.x / this.TILE_SIZE),
            y: Math.floor(endPos.y / this.TILE_SIZE)
        };
        
        // Use the NavGrid's findPath method
        if (this.navGridInstance) {
            const tilePath = this.navGridInstance.findPath(startTile, endTile);
            
            // Convert tile path back to pixel coordinates (center of each tile)
            return tilePath.map(tile => ({
                x: (tile.x * this.TILE_SIZE) + (this.TILE_SIZE / 2),
                y: (tile.y * this.TILE_SIZE) + (this.TILE_SIZE / 2)
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
        const maxAttempts = 100;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const tileX = Math.floor(Math.random() * this.width);
            const tileY = Math.floor(Math.random() * this.height);
            
            if (this.navGrid[tileY][tileX] === 0) {
                // Convert tile position to pixel position (center of tile)
                return {
                    x: (tileX * this.TILE_SIZE) + (this.TILE_SIZE / 2),
                    y: (tileY * this.TILE_SIZE) + (this.TILE_SIZE / 2)
                };
            }
            
            attempts++;
        }
        
        // Fallback to a safe position if no walkable position found
        console.warn('⚠️ Could not find random walkable position, using fallback');
        return {
            x: this.worldWidth / 2,
            y: this.worldHeight / 2
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

