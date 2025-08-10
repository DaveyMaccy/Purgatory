// src/core/world/world.js
/**
 * World Management System - FIXED VERSION
 * 
 * CRITICAL FIXES:
 * ✅ Fixed map loading with proper fallback
 * ✅ Navigation grid generation without errors
 * ✅ Proper error handling
 * ✅ Clean initialization sequence
 * ✅ Backwards compatibility
 */

/**
 * Load map data from JSON file with fallback
 * @returns {Promise<Object>} The loaded map data
 */
export async function loadMapData() {
    try {
        console.log('🗺️ Loading map data from assets/maps/purgatorygamemap.json...');
        
        const response = await fetch('assets/maps/purgatorygamemap.json');
        
        if (!response.ok) {
            throw new Error(`Map loading failed: HTTP ${response.status}`);
        }
        
        const mapData = await response.json();
        
        // Validate essential map data
        if (!mapData.width || !mapData.height) {
            throw new Error('Invalid map data: missing required properties (width, height)');
        }
        
        // Ensure we have layers even if they're empty
        if (!mapData.layers) {
            mapData.layers = [];
            console.warn('⚠️ Map data has no layers, using empty array');
        }
        
        console.log('✅ Map data loaded successfully:', {
            width: mapData.width,
            height: mapData.height,
            layers: mapData.layers.length,
            tilewidth: mapData.tilewidth || 48,
            tileheight: mapData.tileheight || 48
        });
        
        return mapData;
        
    } catch (error) {
        console.error('❌ Error loading map data:', error);
        
        // Return a sensible fallback map
        console.log('🔧 Using fallback map data...');
        return createFallbackMapData();
    }
}

/**
 * Create fallback map data when loading fails
 */
function createFallbackMapData() {
    return {
        width: 30,
        height: 20,
        tilewidth: 48,
        tileheight: 48,
        layers: [],
        objects: [],
        meta: {
            source: 'fallback',
            note: 'Generated fallback map due to loading failure'
        }
    };
}

/**
 * World Class - Manages the game environment
 */
export class World {
    constructor(characterManager = null, mapData = null) {
        console.log('🌍 Creating game world...');
        
        this.characterManager = characterManager;
        this.mapData = mapData || createFallbackMapData();
        
        // World properties
        this.TILE_SIZE = this.mapData.tilewidth || 48;
        this.width = this.mapData.width || 30;
        this.height = this.mapData.height || 20;
        this.worldWidth = this.width * this.TILE_SIZE;
        this.worldHeight = this.height * this.TILE_SIZE;
        
        // Game systems
        this.objects = [];
        this.rooms = [];
        this.navGrid = null;
        this.rawNavGrid = null;
        this.gameTime = 0;
        this.officeType = 'Corporate';
        
        // Task and office management
        this.taskDictionary = this.createTaskDictionary();
        
        console.log(`🌍 World dimensions: ${this.width}×${this.height} tiles (${this.worldWidth}×${this.worldHeight} pixels)`);
        
        // Initialize world systems
        this.initialize();
    }

    /**
     * Initialize world systems
     */
    initialize() {
        try {
            console.log('⚙️ Initializing world systems...');
            
            // Generate navigation grid
            this.generateNavGrid();
            
            // Populate world with objects
            this.populateWorldWithObjects();
            
            console.log('✅ World systems initialized successfully');
            
        } catch (error) {
            console.error('❌ World initialization failed:', error);
            // Create minimal fallback world
            this.createMinimalWorld();
        }
    }

    /**
     * Generate navigation grid for pathfinding
     */
    generateNavGrid() {
        console.log('🗺️ Generating navigation grid...');
        
        try {
            // Initialize raw grid (2D array)
            this.rawNavGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
            
            // Mark obstacles
            this.markObstacles();
            
            // Create navGrid object for compatibility
            this.navGrid = {
                grid: this.rawNavGrid.map(row => [...row]),
                width: this.width,
                height: this.height,
                tileSize: this.TILE_SIZE,
                
                // Helper methods
                isWalkable: (x, y) => {
                    return x >= 0 && x < this.width && y >= 0 && y < this.height && this.rawNavGrid[y][x] === 0;
                },
                
                setWalkable: (x, y, walkable) => {
                    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                        this.rawNavGrid[y][x] = walkable ? 0 : 1;
                        this.navGrid.grid[y][x] = this.rawNavGrid[y][x];
                    }
                }
            };
            
            console.log(`✅ Navigation grid generated: ${this.width}×${this.height} tiles`);
            console.log('📊 Grid sample (first 3 rows):', this.rawNavGrid.slice(0, 3));
            
        } catch (error) {
            console.error('❌ Failed to generate navigation grid:', error);
            this.createFallbackGrid();
        }
    }

    /**
     * Mark obstacles in the navigation grid
     */
    markObstacles() {
        // Create border walls
        for (let x = 0; x < this.width; x++) {
            this.rawNavGrid[0][x] = 1; // Top wall
            this.rawNavGrid[this.height - 1][x] = 1; // Bottom wall
        }
        
        for (let y = 0; y < this.height; y++) {
            this.rawNavGrid[y][0] = 1; // Left wall
            this.rawNavGrid[y][this.width - 1] = 1; // Right wall
        }
        
        // Add some basic office obstacles (desks, furniture)
        const obstacles = this.createOfficeObstacles();
        
        obstacles.forEach(obstacle => {
            for (let x = obstacle.x; x < obstacle.x + obstacle.width && x < this.width; x++) {
                for (let y = obstacle.y; y < obstacle.y + obstacle.height && y < this.height; y++) {
                    if (x >= 0 && y >= 0) {
                        this.rawNavGrid[y][x] = 1;
                    }
                }
            }
        });
        
        console.log(`🚧 Marked ${obstacles.length + 4} obstacle areas (including walls)`);
    }

    /**
     * Create basic office obstacles
     */
    createOfficeObstacles() {
        const obstacles = [];
        
        // Add desks in a basic office layout
        const deskWidth = 2;
        const deskHeight = 1;
        const spacing = 4;
        
        // Row of desks
        for (let i = 0; i < 5; i++) {
            obstacles.push({
                x: 3 + (i * spacing),
                y: 5,
                width: deskWidth,
                height: deskHeight,
                type: 'desk'
            });
        }
        
        // Another row
        for (let i = 0; i < 5; i++) {
            obstacles.push({
                x: 3 + (i * spacing),
                y: 10,
                width: deskWidth,
                height: deskHeight,
                type: 'desk'
            });
        }
        
        // Conference room
        obstacles.push({
            x: 5,
            y: 15,
            width: 8,
            height: 3,
            type: 'conference_table'
        });
        
        return obstacles;
    }

    /**
     * Create fallback grid when generation fails
     */
    createFallbackGrid() {
        console.log('🔧 Creating fallback navigation grid...');
        
        this.rawNavGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
        
        // Just add border walls
        for (let x = 0; x < this.width; x++) {
            this.rawNavGrid[0][x] = 1;
            this.rawNavGrid[this.height - 1][x] = 1;
        }
        
        for (let y = 0; y < this.height; y++) {
            this.rawNavGrid[y][0] = 1;
            this.rawNavGrid[y][this.width - 1] = 1;
        }
        
        // Create basic navGrid object
        this.navGrid = {
            grid: this.rawNavGrid.map(row => [...row]),
            width: this.width,
            height: this.height,
            tileSize: this.TILE_SIZE,
            isWalkable: (x, y) => x >= 0 && x < this.width && y >= 0 && y < this.height && this.rawNavGrid[y][x] === 0,
            setWalkable: (x, y, walkable) => {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.rawNavGrid[y][x] = walkable ? 0 : 1;
                }
            }
        };
        
        console.log('✅ Fallback navigation grid created');
    }

    /**
     * Create minimal world when initialization fails
     */
    createMinimalWorld() {
        console.log('🔧 Creating minimal world...');
        
        this.width = 20;
        this.height = 15;
        this.TILE_SIZE = 48;
        this.worldWidth = this.width * this.TILE_SIZE;
        this.worldHeight = this.height * this.TILE_SIZE;
        
        this.createFallbackGrid();
        this.objects = [];
        this.rooms = [];
        
        console.log('✅ Minimal world created');
    }

    /**
     * Populate world with objects based on office type
     */
    populateWorldWithObjects() {
        console.log('🪑 Populating world with objects...');
        
        this.objects = [
            { id: 'entrance', x: 1, y: 1, width: 2, height: 1, type: 'door' },
            { id: 'water_cooler', x: 25, y: 5, width: 1, height: 1, type: 'amenity' },
            { id: 'printer', x: 25, y: 10, width: 2, height: 1, type: 'equipment' },
            { id: 'coffee_machine', x: 2, y: 18, width: 1, height: 1, type: 'amenity' }
        ];
        
        console.log(`🪑 Added ${this.objects.length} world objects`);
    }

    /**
     * Create task dictionary based on office type
     */
    createTaskDictionary() {
        const baseTasks = {
            'work': { duration: 120, energy: -10, productivity: +5 },
            'break': { duration: 15, energy: +5, social: +3 },
            'meeting': { duration: 60, energy: -5, social: +2 },
            'coffee': { duration: 5, energy: +3 },
            'email': { duration: 30, energy: -3, productivity: +2 }
        };
        
        // Add office-specific tasks later
        return baseTasks;
    }

    /**
     * Find valid spawn positions for characters
     */
    findValidSpawnPositions(count) {
        const positions = [];
        const attempts = count * 10; // Try multiple times per character
        
        for (let i = 0; i < attempts && positions.length < count; i++) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;
            
            if (this.isPositionWalkable(x, y)) {
                // Check if position is not too close to existing positions
                const tooClose = positions.some(pos => 
                    Math.abs(pos.x - x) < 2 && Math.abs(pos.y - y) < 2
                );
                
                if (!tooClose) {
                    positions.push({ x, y });
                }
            }
        }
        
        // Fill remaining positions with fallback spots if needed
        while (positions.length < count) {
            positions.push({
                x: 2 + (positions.length % 5) * 3,
                y: 2 + Math.floor(positions.length / 5) * 3
            });
        }
        
        console.log(`📍 Found ${positions.length} spawn positions for ${count} characters`);
        return positions;
    }

    /**
     * Check if a position is walkable
     */
    isPositionWalkable(x, y) {
        if (!this.rawNavGrid) return false;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.rawNavGrid[y][x] === 0;
    }

    /**
     * Get world tile at position
     */
    getTileAt(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return { walkable: false, type: 'void' };
        }
        
        return {
            walkable: this.rawNavGrid[y][x] === 0,
            type: this.rawNavGrid[y][x] === 0 ? 'floor' : 'wall'
        };
    }

    /**
     * Update world state (called from game loop)
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Update world objects if needed
        // Future: animate objects, update states, etc.
    }

    /**
     * Get world info for debugging
     */
    getDebugInfo() {
        return {
            dimensions: `${this.width}×${this.height}`,
            tileSize: this.TILE_SIZE,
            worldSize: `${this.worldWidth}×${this.worldHeight}`,
            objects: this.objects.length,
            gameTime: this.gameTime,
            hasNavGrid: !!this.rawNavGrid,
            walkableTiles: this.rawNavGrid ? this.rawNavGrid.flat().filter(tile => tile === 0).length : 0
        };
    }
}

// Export additional utilities
export function createBasicWorld() {
    return new World(null, createFallbackMapData());
}
