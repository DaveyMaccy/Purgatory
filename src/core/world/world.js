// src/core/world/world.js

import { NavGrid } from './nav-grid.js';

/**
 * World class - Manages the game world, navigation grid, and world state
 * Combines Stage 3 functionality with Stage 4 pathfinding integration
 * 
 * FIXES APPLIED:
 * - Updated to optimized 960×540 world dimensions (20×11 tiles)
 * - Fixed coordinate conversion between world and grid systems
 * - Enhanced pathfinding integration with proper bounds checking
 * - Better error handling and status reporting
 * - Improved obstacle placement for larger world
 */
export class World {
    constructor(mapData = null) {
        console.log('🌍 Creating game world...');
        
        // Extract office layout from map data
        const officeLayout = mapData?.layers?.[0];
        
        // UPDATED: World configuration to match optimized canvas dimensions
        this.TILE_SIZE = officeLayout?.tilewidth || 48; // Standard tile size from map data
        
        // UPDATED: World dimensions for optimized 960×540 canvas (16:9)
        this.width = officeLayout?.width || 20;   // Was 16 - now 20 tiles wide
        this.height = officeLayout?.height || 11; // Was 12 - now 11 tiles tall (better 16:9)
        this.worldWidth = this.width * this.TILE_SIZE;     // 20 * 48 = 960 pixels
        this.worldHeight = this.height * this.TILE_SIZE;   // 11 * 48 = 528 pixels

        // Navigation system - STAGE 4 INTEGRATION
        this.navGrid = new NavGrid(); // Create NavGrid instance instead of just array
        this.rawNavGrid = null; // Keep raw grid for backwards compatibility
        
        // Game time tracking
        this.gameTime = 0;
        
        // Initialize the world
        this.generateNavGrid();
        this.populateWorldWithObjects();

        console.log(`🌍 World created: ${this.width}×${this.height} tiles (${this.worldWidth}×${this.worldHeight} pixels)`);
        console.log(`📊 Optimized for 16:9 aspect ratio with ${((this.worldWidth * this.worldHeight) / (800 * 450) * 100 - 100).toFixed(0)}% more area`);
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
            
            console.log(`✅ Navigation grid generated: ${this.width}×${this.height} tiles`);
            console.log('📊 Grid sample (first 5 rows):', this.rawNavGrid.slice(0, 5));
            
        } catch (error) {
            console.error('❌ Failed to generate navigation grid:', error);
            throw error;
        }
    }

    /**
     * Mark obstacles in the navigation grid based on office layout
     */
    markObstacles() {
        // Enhanced office layout for larger 20×11 world
        const obstacles = [
            // Outer walls (border)
            ...this.generateBorderWalls(),
            
            // Office desks - positioned for 20×11 grid
            { x: 96, y: 96, width: 144, height: 72 },     // Desk 1 (2×1.5 tiles)
            { x: 288, y: 144, width: 144, height: 72 },   // Desk 2
            { x: 480, y: 192, width: 144, height: 72 },   // Desk 3
            { x: 672, y: 96, width: 144, height: 72 },    // Desk 4
            { x: 96, y: 288, width: 144, height: 72 },    // Desk 5
            { x: 384, y: 336, width: 144, height: 72 },   // Desk 6
            { x: 624, y: 288, width: 144, height: 72 },   // Desk 7
            
            // Meeting tables
            { x: 240, y: 240, width: 120, height: 96 },   // Meeting table 1
            { x: 528, y: 384, width: 120, height: 96 },   // Meeting table 2
            
            // Office equipment
            { x: 48, y: 192, width: 48, height: 48 },     // Printer/copier
            { x: 864, y: 144, width: 48, height: 48 },    // Water cooler
            
            // Internal walls/partitions
            { x: 432, y: 48, width: 96, height: 24 },     // Partition 1
            { x: 192, y: 456, width: 96, height: 24 }     // Partition 2
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
     * Generate border walls for the world
     * @returns {Array} Array of wall obstacles
     */
    generateBorderWalls() {
        const wallThickness = 24;
        return [
            // Top wall
            { x: 0, y: 0, width: this.worldWidth, height: wallThickness },
            // Bottom wall  
            { x: 0, y: this.worldHeight - wallThickness, width: this.worldWidth, height: wallThickness },
            // Left wall
            { x: 0, y: 0, width: wallThickness, height: this.worldHeight },
            // Right wall
            { x: this.worldWidth - wallThickness, y: 0, width: wallThickness, height: this.worldHeight }
        ];
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
        // For now, just log that the world is ready for objects
        console.log('✅ World ready for object population');
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
            width: this.worldWidth,     // 960 pixels
            height: this.worldHeight,   // 528 pixels
            tileWidth: this.width,      // 20 tiles
            tileHeight: this.height,    // 11 tiles
            tileSize: this.TILE_SIZE    // 48 pixels
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
            dimensions: `${this.width}×${this.height} tiles`,
            pixelSize: `${this.worldWidth}×${this.worldHeight} pixels`,
            tileSize: this.TILE_SIZE,
            navGridGenerated: !!this.navGrid && this.navGrid.width > 0,
            walkableTiles: this.getWalkableTileCount(),
            gameTime: this.gameTime,
            aspectRatio: (this.worldWidth / this.worldHeight).toFixed(3),
            optimization: `+${((this.worldWidth * this.worldHeight) / (800 * 450) * 100 - 100).toFixed(0)}% area vs 800×450`
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

    /**
     * Get nearby walkable positions around a point
     * @param {number} centerX - Center X in pixels
     * @param {number} centerY - Center Y in pixels
     * @param {number} radius - Search radius in tiles
     * @returns {Array} Array of walkable positions
     */
    getNearbyWalkablePositions(centerX, centerY, radius = 2) {
        const centerGrid = this.worldToGrid(centerX, centerY);
        const walkablePositions = [];
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const gridX = centerGrid.x + dx;
                const gridY = centerGrid.y + dy;
                
                if (this.navGrid.isWalkable(gridX, gridY)) {
                    const worldPos = this.gridToWorld(gridX, gridY);
                    walkablePositions.push(worldPos);
                }
            }
        }
        
        return walkablePositions;
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
        console.warn('⚠️ Failed to load map data, using optimized default:', error.message);
        // UPDATED: Return optimized default map data
        return {
            width: 20,      // Was 16 - now optimized
            height: 11,     // Was 12 - now optimized for 16:9
            tilewidth: 48,
            tileheight: 48,
            layers: [{
                width: 20,  // Updated
                height: 11, // Updated  
                tilewidth: 48,
                tileheight: 48
            }]
        };
    }
}
