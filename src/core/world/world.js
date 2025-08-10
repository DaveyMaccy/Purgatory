// src/core/world/world.js - COMPLETE FIXED VERSION
// Restores all original functionality + adds Stage 4 movement features

/**
 * STAGE 3 COMPLETE + STAGE 4 ENHANCED: World Management System
 * 
 * This file handles:
 * - Map data loading from JSON files
 * - Navigation grid generation for character positioning
 * - World object management
 * - Task assignment system
 * - Position validation and pathfinding preparation
 * - STAGE 4: A* pathfinding and movement utilities
 */

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
        
        // Return a default map if loading fails
        console.log('🔧 Using fallback map data...');
        return {
            width: 16,
            height: 12,
            tilewidth: 48,
            tileheight: 48,
            layers: []
        };
    }
}

/**
 * World Class - Manages the game environment
 * Implements world systems from the SSOT documentation (Chapter 4)
 * RESTORED: All original functionality + STAGE 4 enhancements
 */
export class World {
    constructor(characterManager, officeLayout) {
        this.characterManager = characterManager;
        this.officeLayout = officeLayout;
        
        // RESTORED: Original core properties
        this.objects = [];
        this.rooms = [];
        this.gameTime = 0; // Game time in milliseconds
        this.officeType = 'corporate';
        this.taskDictionary = this.createTaskDictionary();
        
        // RESTORED: Navigation grid (simple array, not separate NavGrid class)
        this.navGrid = [];
        
        // TILE_SIZE is now a property of the World class, making it accessible
        // to other modules like characterManager.js.
        this.TILE_SIZE = officeLayout?.tilewidth || 48; // Standard tile size from map data
        
        // World dimensions
        this.width = officeLayout?.width || 16;
        this.height = officeLayout?.height || 12;
        this.worldWidth = this.width * this.TILE_SIZE;
        this.worldHeight = this.height * this.TILE_SIZE;

        console.log(`🌍 World created: ${this.width}x${this.height} tiles (${this.worldWidth}x${this.worldHeight} pixels)`);
    }

    /**
     * RESTORED + ENHANCED: Generate navigation grid for character movement and positioning
     * This creates a 2D array representing walkable (0) and non-walkable (1) tiles
     */
    generateNavGrid() {
        console.log('🗺️ Generating navigation grid...');
        
        try {
            // Initialize grid with all walkable tiles
            this.navGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
            
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
     * RESTORED: Mark obstacles in the navigation grid
     * This creates walls and furniture as non-walkable areas
     */
    markObstacles() {
        // Mark border walls as obstacles
        for (let x = 0; x < this.width; x++) {
            this.navGrid[0][x] = 1; // Top wall
            this.navGrid[this.height - 1][x] = 1; // Bottom wall
        }
        
        for (let y = 0; y < this.height; y++) {
            this.navGrid[y][0] = 1; // Left wall
            this.navGrid[y][this.width - 1] = 1; // Right wall
        }
        
        // RESTORED: Mark desk areas as obstacles (matching renderer desk positions)
        const deskPositions = [
            { x: 2, y: 3, width: 3, height: 1 }, // Desk at (100, 150) in pixels
            { x: 6, y: 3, width: 3, height: 1 }, // Desk at (300, 150) in pixels
            { x: 10, y: 3, width: 3, height: 1 }, // Desk at (500, 150) in pixels
            { x: 2, y: 7, width: 3, height: 1 }, // Desk at (100, 350) in pixels
            { x: 6, y: 7, width: 3, height: 1 }  // Desk at (300, 350) in pixels
        ];
        
        deskPositions.forEach(desk => {
            for (let x = desk.x; x < desk.x + desk.width && x < this.width; x++) {
                for (let y = desk.y; y < desk.y + desk.height && y < this.height; y++) {
                    if (y >= 0 && y < this.height) {
                        this.navGrid[y][x] = 1;
                    }
                }
            }
        });
        
        console.log('🚧 Obstacles marked in navigation grid');
    }

    /**
     * RESTORED: Create task dictionary for character assignments
     * Based on SSOT task system design
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
            'Designer': [
                { displayName: 'Create Mockups', requiredLocation: 'desk', duration: 90000 },
                { displayName: 'Review Designs', requiredLocation: 'desk', duration: 60000 },
                { displayName: 'Client Presentation', requiredLocation: 'meeting_room', duration: 45000 }
            ],
            'HR Specialist': [
                { displayName: 'Interview Candidates', requiredLocation: 'meeting_room', duration: 60000 },
                { displayName: 'Process Documents', requiredLocation: 'desk', duration: 45000 },
                { displayName: 'Employee Training', requiredLocation: 'meeting_room', duration: 90000 }
            ],
            'Intern': [
                { displayName: 'Learn New Skills', requiredLocation: 'desk', duration: 90000 },
                { displayName: 'Assist Senior Staff', requiredLocation: 'desk', duration: 60000 },
                { displayName: 'Complete Assignments', requiredLocation: 'desk', duration: 120000 }
            ],
            'Employee': [
                { displayName: 'Complete Tasks', requiredLocation: 'desk', duration: 90000 },
                { displayName: 'Team Meeting', requiredLocation: 'meeting_room', duration: 45000 },
                { displayName: 'Project Work', requiredLocation: 'desk', duration: 120000 }
            ]
        };
    }

    /**
     * RESTORED: Populate world with objects
     */
    populateWorldWithObjects() {
        console.log('🏢 Populating world with objects...');
        // Implementation will be completed in later stages
    }

    /**
     * RESTORED: Update world state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Update world systems here
        // This will be expanded in later stages
    }

    /**
     * RESTORED + ENHANCED: Check if a position is walkable
     * @param {number} x - X coordinate in pixels
     * @param {number} y - Y coordinate in pixels
     * @returns {boolean} True if walkable
     */
    isPositionWalkable(x, y) {
        const gridX = Math.floor(x / this.TILE_SIZE);
        const gridY = Math.floor(y / this.TILE_SIZE);
        
        if (!this.navGrid || this.navGrid.length === 0) {
            return true; // If no nav grid, assume walkable
        }
        
        if (gridX < 0 || gridX >= this.width || 
            gridY < 0 || gridY >= this.height) {
            return false; // Outside world bounds
        }
        
        return this.navGrid[gridY][gridX] === 0;
    }

    /**
     * RESTORED + ENHANCED: Get a random walkable position
     * @returns {Object} Object with x, y coordinates in pixels
     */
    getRandomWalkablePosition() {
        const walkablePositions = [];
        
        if (!this.navGrid || this.navGrid.length === 0) {
            // If no nav grid, return default positions
            const x = 100 + Math.random() * (this.worldWidth - 200);
            const y = 100 + Math.random() * (this.worldHeight - 200);
            return { x, y };
        }
        
        // Find all walkable tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.navGrid[y][x] === 0) {
                    walkablePositions.push({
                        x: x * this.TILE_SIZE + this.TILE_SIZE / 2,
                        y: y * this.TILE_SIZE + this.TILE_SIZE / 2
                    });
                }
            }
        }
        
        if (walkablePositions.length === 0) {
            console.warn('⚠️ No walkable positions found, using center position');
            return { 
                x: this.worldWidth / 2, 
                y: this.worldHeight / 2 
            };
        }
        
        // Return random walkable position
        const randomIndex = Math.floor(Math.random() * walkablePositions.length);
        return walkablePositions[randomIndex];
    }

    // ========================================
    // STAGE 4: NEW PATHFINDING METHODS
    // ========================================

    /**
     * STAGE 4: Find path between two positions using A* pathfinding
     * @param {Object} start - Starting position {x, y} in pixels
     * @param {Object} end - Target position {x, y} in pixels
     * @returns {Array} Array of waypoints from start to end
     */
    findPath(start, end) {
        // Convert pixel coordinates to grid coordinates
        const startGrid = {
            x: Math.floor(start.x / this.TILE_SIZE),
            y: Math.floor(start.y / this.TILE_SIZE)
        };
        const endGrid = {
            x: Math.floor(end.x / this.TILE_SIZE),
            y: Math.floor(end.y / this.TILE_SIZE)
        };

        // Ensure start and end are within bounds and walkable
        if (!this.isGridWalkable(startGrid.x, startGrid.y) || 
            !this.isGridWalkable(endGrid.x, endGrid.y)) {
            console.warn('🚫 Start or end position is not walkable');
            return [];
        }

        // If start and end are the same, return empty path
        if (startGrid.x === endGrid.x && startGrid.y === endGrid.y) {
            return [];
        }

        // A* algorithm implementation
        const openSet = [startGrid];
        const closedSet = new Set();
        const cameFrom = new Map();
        
        // gScore: cost from start to current node
        const gScore = new Map();
        gScore.set(this.hashPoint(startGrid), 0);
        
        // fScore: estimated total cost from start to end
        const fScore = new Map();
        fScore.set(this.hashPoint(startGrid), this.heuristic(startGrid, endGrid));
        
        while (openSet.length > 0) {
            // Get node with lowest fScore
            openSet.sort((a, b) => {
                const scoreA = fScore.get(this.hashPoint(a)) || Infinity;
                const scoreB = fScore.get(this.hashPoint(b)) || Infinity;
                return scoreA - scoreB;
            });
            const current = openSet.shift();
            
            // If we reached the end, reconstruct path
            if (current.x === endGrid.x && current.y === endGrid.y) {
                const gridPath = this.reconstructPath(cameFrom, current);
                // Convert grid path back to pixel coordinates
                return this.convertGridPathToPixels(gridPath);
            }
            
            closedSet.add(this.hashPoint(current));
            
            // Check neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborHash = this.hashPoint(neighbor);
                if (closedSet.has(neighborHash)) continue;
                
                // Calculate tentative gScore
                const tentativeGScore = (gScore.get(this.hashPoint(current)) || 0) + 1;
                
                if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y) || 
                    tentativeGScore < (gScore.get(neighborHash) || Infinity)) {
                    
                    cameFrom.set(neighborHash, current);
                    gScore.set(neighborHash, tentativeGScore);
                    fScore.set(neighborHash, tentativeGScore + this.heuristic(neighbor, endGrid));
                    
                    if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // No path found
        console.warn('🚫 No path found from', start, 'to', end);
        return [];
    }

    /**
     * STAGE 4: Check if grid coordinates are walkable
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @returns {boolean} True if walkable
     */
    isGridWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        if (!this.navGrid || this.navGrid.length === 0) {
            return true;
        }
        return this.navGrid[y][x] === 0;
    }

    /**
     * STAGE 4: Get walkable neighbors of a grid point
     * @param {Object} point - Grid point {x, y}
     * @returns {Array} Array of neighbor points
     */
    getNeighbors(point) {
        const neighbors = [];
        const directions = [
            {x: 0, y: -1},  // Up
            {x: 1, y: 0},   // Right
            {x: 0, y: 1},   // Down
            {x: -1, y: 0},  // Left
            {x: 1, y: -1},  // Up-Right (diagonal)
            {x: 1, y: 1},   // Down-Right (diagonal)
            {x: -1, y: 1},  // Down-Left (diagonal)
            {x: -1, y: -1}  // Up-Left (diagonal)
        ];
        
        for (const dir of directions) {
            const newX = point.x + dir.x;
            const newY = point.y + dir.y;
            
            if (this.isGridWalkable(newX, newY)) {
                neighbors.push({x: newX, y: newY});
            }
        }
        
        return neighbors;
    }

    /**
     * STAGE 4: Heuristic function for A* (Manhattan distance)
     * @param {Object} a - First point
     * @param {Object} b - Second point
     * @returns {number} Distance estimate
     */
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    /**
     * STAGE 4: Create hash string for a point
     * @param {Object} point - Point {x, y}
     * @returns {string} Hash string
     */
    hashPoint(point) {
        return `${point.x},${point.y}`;
    }

    /**
     * STAGE 4: Reconstruct path from A* came-from map
     * @param {Map} cameFrom - Map of point -> previous point
     * @param {Object} current - Current endpoint
     * @returns {Array} Path from start to end
     */
    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentPoint = current;
        
        while (cameFrom.has(this.hashPoint(currentPoint))) {
            currentPoint = cameFrom.get(this.hashPoint(currentPoint));
            path.unshift(currentPoint);
        }
        
        return path;
    }

    /**
     * STAGE 4: Convert grid path to pixel coordinates
     * @param {Array} gridPath - Array of grid coordinates
     * @returns {Array} Array of pixel coordinates
     */
    convertGridPathToPixels(gridPath) {
        return gridPath.map(point => ({
            x: point.x * this.TILE_SIZE + this.TILE_SIZE / 2, // Center of tile
            y: point.y * this.TILE_SIZE + this.TILE_SIZE / 2
        }));
    }

    /**
     * STAGE 4: Get nearest walkable position to a target
     * @param {Object} target - Target position {x, y}
     * @param {number} searchRadius - Search radius in pixels (default: 100)
     * @returns {Object|null} Nearest walkable position or null
     */
    getNearestWalkablePosition(target, searchRadius = 100) {
        // Convert search radius to grid units
        const gridRadius = Math.ceil(searchRadius / this.TILE_SIZE);
        const centerX = Math.floor(target.x / this.TILE_SIZE);
        const centerY = Math.floor(target.y / this.TILE_SIZE);
        
        // Search in expanding rings
        for (let radius = 0; radius <= gridRadius; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    // Only check perimeter of current radius
                    if (Math.abs(dx) !== radius && Math.abs(dy) !== radius && radius > 0) {
                        continue;
                    }
                    
                    const checkX = centerX + dx;
                    const checkY = centerY + dy;
                    
                    if (this.isGridWalkable(checkX, checkY)) {
                        return {
                            x: checkX * this.TILE_SIZE + this.TILE_SIZE / 2,
                            y: checkY * this.TILE_SIZE + this.TILE_SIZE / 2
                        };
                    }
                }
            }
        }
        
        console.warn('⚠️ No walkable position found near target');
        return null;
    }

    // ========================================
    // UTILITY METHODS (RESTORED + NEW)
    // ========================================

    /**
     * RESTORED + ENHANCED: Get world bounds for renderer and systems
     * @returns {Object} World bounds {width, height}
     */
    getWorldBounds() {
        return {
            width: this.worldWidth,
            height: this.worldHeight,
            tileWidth: this.width,
            tileHeight: this.height,
            tileSize: this.TILE_SIZE
        };
    }

    /**
     * STAGE 4: Convert world coordinates to grid coordinates
     * @param {number} x - X coordinate in pixels
     * @param {number} y - Y coordinate in pixels
     * @returns {Object} Grid coordinates {x, y}
     */
    worldToGrid(x, y) {
        return {
            x: Math.floor(x / this.TILE_SIZE),
            y: Math.floor(y / this.TILE_SIZE)
        };
    }

    /**
     * STAGE 4: Convert grid coordinates to world coordinates
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @returns {Object} World coordinates {x, y} (center of tile)
     */
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.TILE_SIZE + this.TILE_SIZE / 2,
            y: gridY * this.TILE_SIZE + this.TILE_SIZE / 2
        };
    }

    /**
     * STAGE 4: Check if position is within world bounds
     * @param {Object} position - Position to check {x, y}
     * @returns {boolean} True if within bounds
     */
    isWithinBounds(position) {
        return position.x >= 0 && position.x < this.worldWidth &&
               position.y >= 0 && position.y < this.worldHeight;
    }

    /**
     * STAGE 4: Clamp position to world bounds
     * @param {Object} position - Position to clamp {x, y}
     * @returns {Object} Clamped position
     */
    clampToWorldBounds(position) {
        return {
            x: Math.max(0, Math.min(this.worldWidth - 1, position.x)),
            y: Math.max(0, Math.min(this.worldHeight - 1, position.y))
        };
    }

    /**
     * RESTORED + ENHANCED: Get world status for debugging
     * @returns {Object} World status information
     */
    getStatus() {
        return {
            dimensions: `${this.width}x${this.height} tiles`,
            pixelSize: `${this.worldWidth}x${this.worldHeight} pixels`,
            tileSize: this.TILE_SIZE,
            navGridGenerated: !!this.navGrid && this.navGrid.length > 0,
            walkableTiles: this.getWalkableTileCount(),
            gameTime: this.gameTime,
            objectCount: this.objects.length,
            roomCount: this.rooms.length,
            officeType: this.officeType,
            taskDictionaryKeys: Object.keys(this.taskDictionary)
        };
    }

    /**
     * RESTORED: Count walkable tiles for debugging
     * @returns {number} Number of walkable tiles
     */
    getWalkableTileCount() {
        if (!this.navGrid || this.navGrid.length === 0) return 0;
        
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.navGrid[y][x] === 0) count++;
            }
        }
        return count;
    }

    /**
     * STAGE 4: Test pathfinding between two random positions
     */
    testRandomPathfinding() {
        const start = this.getRandomWalkablePosition();
        const end = this.getRandomWalkablePosition();
        
        console.log(`🧪 Testing pathfinding from (${Math.floor(start.x)}, ${Math.floor(start.y)}) to (${Math.floor(end.x)}, ${Math.floor(end.y)})`);
        
        const path = this.findPath(start, end);
        
        if (path.length > 0) {
            console.log(`✅ Path found with ${path.length} waypoints`);
            console.log('Path waypoints:', path.map(p => `(${Math.floor(p.x)}, ${Math.floor(p.y)})`));
        } else {
            console.log('❌ No path found');
        }
        
        return { start, end, path };
    }

    /**
     * STAGE 4: Debug method to visualize navigation grid
     */
    debugNavGrid() {
        console.log('🗺️ World Navigation Grid Debug:');
        console.log(`World Size: ${this.worldWidth}x${this.worldHeight} pixels`);
        console.log(`Grid Size: ${this.width}x${this.height} tiles`);
        console.log(`Tile Size: ${this.TILE_SIZE}x${this.TILE_SIZE} pixels`);
        
        console.log('Grid (0=walkable, 1=obstacle):');
        for (let y = 0; y < Math.min(this.height, 10); y++) {
            const row = this.navGrid[y].slice(0, Math.min(this.width, 20)).join('');
            console.log(`Row ${y}: ${row}`);
        }
        
        if (this.height > 10) {
            console.log('... (truncated)');
        }
    }
}
