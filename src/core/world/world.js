// src/core/world/world.js

import { NavGrid } from './nav-grid.js';

/**
 * World class - Manages the game world, navigation grid, and world state
 * Combines Stage 3 functionality with Stage 4 pathfinding integration
 */
export class World {
    constructor(mapData = null) {
        console.log('🌍 Creating game world...');
        
        // Extract office layout from map data
        const officeLayout = mapData?.layers?.[0];
        
        // World configuration
        this.TILE_SIZE = officeLayout?.tilewidth || 48; // Standard tile size from map data
        
        // World dimensions
        this.width = officeLayout?.width || 16;
        this.height = officeLayout?.height || 12;
        this.worldWidth = this.width * this.TILE_SIZE;
        this.worldHeight = this.height * this.TILE_SIZE;

        // Navigation system - STAGE 4 INTEGRATION
        this.navGrid = new NavGrid(); // Create NavGrid instance instead of just array
        this.rawNavGrid = null; // Keep raw grid for backwards compatibility
        
        // Game time tracking
        this.gameTime = 0;
        
        // Initialize the world
        this.generateNavGrid();
        this.populateWorldWithObjects();

        console.log(`🌍 World created: ${this.width}x${this.height} tiles (${this.worldWidth}x${this.worldHeight} pixels)`);
    }

    /**
     * STAGE 2-3 CRITICAL: Generate navigation grid for character movement and positioning
     * STAGE 4 UPDATE: Now creates both NavGrid instance and raw array
     */
    generateNavGrid() {
        console.log('🗺️ Generating navigation grid...');
        
        try {
            // Initialize NavGrid instance
            this.navGrid.initialize(this.width, this.height);
            
            // Create raw grid for backwards compatibility
            this.rawNavGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
            
            // Mark obstacles based on map data or default office layout
            this.markObstacles();
            
            console.log(`✅ Navigation grid generated: ${this.width}x${this.height} tiles`);
            console.log('📊 Grid sample (first 5 rows):', this.rawNavGrid.slice(0, 5));
            
        } catch (error) {
            console.error('❌ Failed to generate navigation grid:', error);
            // Create simple fallback grid
            this.navGrid.initialize(this.width, this.height);
            this.rawNavGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
            console.log('🔧 Using fallback navigation grid');
        }
    }

    /**
     * Mark obstacles in the navigation grid
     * This creates walls and furniture as non-walkable areas
     * UPDATED: Now includes office obstacles (desks, tables) that match renderer
     */
    markObstacles() {
        // Mark border walls as obstacles
        for (let x = 0; x < this.width; x++) {
            this.markObstacle(x, 0); // Top wall
            this.markObstacle(x, this.height - 1); // Bottom wall
        }
        
        for (let y = 0; y < this.height; y++) {
            this.markObstacle(0, y); // Left wall
            this.markObstacle(this.width - 1, y); // Right wall
        }
        
        // Office obstacles that match renderer positions
        // Convert pixel positions to grid coordinates (48px tile size)
        const obstacles = [
            // Top row desks (100,150 -> 140x60)
            { x: 100, y: 150, width: 140, height: 60, type: 'desk' },
            { x: 280, y: 150, width: 140, height: 60, type: 'desk' },
            { x: 460, y: 150, width: 140, height: 60, type: 'desk' },
            
            // Bottom row desks (100,300 -> 140x60)
            { x: 100, y: 300, width: 140, height: 60, type: 'desk' },
            { x: 280, y: 300, width: 140, height: 60, type: 'desk' },
            
            // Meeting table (500,280 -> 120x80)
            { x: 500, y: 280, width: 120, height: 80, type: 'table' },
            
            // Break room counter (650,100 -> 100x50)
            { x: 650, y: 100, width: 100, height: 50, type: 'counter' }
        ];
        
        // Mark each obstacle area as non-walkable
        obstacles.forEach(obstacle => {
            const startGridX = Math.floor(obstacle.x / this.TILE_SIZE);
            const startGridY = Math.floor(obstacle.y / this.TILE_SIZE);
            const endGridX = Math.ceil((obstacle.x + obstacle.width) / this.TILE_SIZE);
            const endGridY = Math.ceil((obstacle.y + obstacle.height) / this.TILE_SIZE);
            
            for (let gridY = startGridY; gridY < endGridY && gridY < this.height; gridY++) {
                for (let gridX = startGridX; gridX < endGridX && gridX < this.width; gridX++) {
                    if (gridX >= 0 && gridY >= 0) {
                        this.markObstacle(gridX, gridY);
                    }
                }
            }
        });
        
        console.log('🏢 Office layout obstacles marked in navigation grid');
    }

    /**
     * Mark a single obstacle in both navigation grids
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     */
    markObstacle(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.navGrid.markObstacle(x, y);
            if (this.rawNavGrid) {
                this.rawNavGrid[y][x] = 1;
            }
        }
    }

    /**
     * STAGE 4 NEW: Find path between two points using A* pathfinding
     * @param {Object} start - Start position {x, y} in pixels
     * @param {Object} end - End position {x, y} in pixels
     * @returns {Array} Array of waypoints in pixel coordinates
     */
    findPath(start, end) {
        // Convert pixel coordinates to grid coordinates
        const startGrid = this.worldToGrid(start.x, start.y);
        const endGrid = this.worldToGrid(end.x, end.y);
        
        // Get path in grid coordinates
        const gridPath = this.navGrid.findPath(startGrid, endGrid);
        
        // Convert back to pixel coordinates
        const pixelPath = gridPath.map(point => this.gridToWorld(point.x, point.y));
        
        console.log(`🗺️ Path found: ${gridPath.length} waypoints`);
        return pixelPath;
    }

    /**
     * Populate world with objects (placeholder for now)
     */
    populateWorldWithObjects() {
        console.log('🏢 Populating world with objects...');
        // Implementation will be completed in later stages
    }

    /**
     * Update world state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Update world systems here
        // This will be expanded in later stages
    }

    /**
     * Check if a position is walkable
     * @param {number} x - X coordinate in pixels
     * @param {number} y - Y coordinate in pixels
     * @returns {boolean} True if walkable
     */
    isPositionWalkable(x, y) {
        const gridX = Math.floor(x / this.TILE_SIZE);
        const gridY = Math.floor(y / this.TILE_SIZE);
        
        return this.navGrid.isWalkable(gridX, gridY);
    }

    /**
     * Get a random walkable position
     * @returns {Object} Object with x, y coordinates in pixels
     */
    getRandomWalkablePosition() {
        const walkablePositions = [];
        
        // Find all walkable tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.navGrid.isWalkable(x, y)) {
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

    /**
     * Get world bounds for renderer and systems
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
     * Convert world coordinates to grid coordinates
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
     * Convert grid coordinates to world coordinates
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
     * Get world status for debugging
     * @returns {Object} World status information
     */
    getStatus() {
        return {
            dimensions: `${this.width}x${this.height} tiles`,
            pixelSize: `${this.worldWidth}x${this.worldHeight} pixels`,
            tileSize: this.TILE_SIZE,
            navGridGenerated: !!this.navGrid && this.navGrid.width > 0,
            walkableTiles: this.getWalkableTileCount(),
            gameTime: this.gameTime
        };
    }

    /**
     * Count walkable tiles for debugging
     * @returns {number} Number of walkable tiles
     */
    getWalkableTileCount() {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.navGrid.isWalkable(x, y)) count++;
            }
        }
        return count;
    }
}

/**
 * Load map data from file
 * @param {string} mapPath - Path to map file
 * @returns {Promise<Object>} Map data object
 */
export async function loadMapData(mapPath = './assets/maps/purgatorygamemap.json') {
    try {
        console.log('🗺️ Loading map data from:', mapPath);
        const response = await fetch(mapPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const mapData = await response.json();
        console.log('✅ Map data loaded successfully');
        console.log('📊 Map info:', {
            width: mapData.width,
            height: mapData.height,
            tilewidth: mapData.tilewidth,
            tileheight: mapData.tileheight,
            layers: mapData.layers?.length || 0
        });
        
        return mapData;
        
    } catch (error) {
        console.warn('⚠️ Failed to load map data, using default:', error.message);
        // Return default map data
        return {
            width: 16,
            height: 12,
            tilewidth: 48,
            tileheight: 48,
            layers: [{
                width: 16,
                height: 12,
                tilewidth: 48,
                tileheight: 48
            }]
        };
    }
}
