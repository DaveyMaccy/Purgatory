// src/core/world/world.js

import { NavGrid } from './nav-grid.js';

/**
 * World class - Manages the game world, navigation grid, and world state
 * FIXED VERSION - Updated for actual map dimensions (30×20 tiles)
 * 
 * FIXES APPLIED:
 * - Updated to use actual map data dimensions (30×20 = 2304×1536 pixels)
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
        
        // FIXED: Use actual map data dimensions
        this.TILE_SIZE = mapData?.tilewidth || 48;
        this.width = mapData?.width || 30;        // UPDATED: Use actual map width (30 tiles)
        this.height = mapData?.height || 20;      // UPDATED: Use actual map height (20 tiles)
        this.worldWidth = this.width * this.TILE_SIZE;   // 2304 pixels
        this.worldHeight = this.height * this.TILE_SIZE; // 1536 pixels

        console.log(`🌍 Using ACTUAL map dimensions: ${this.width}×${this.height} tiles (${this.worldWidth}×${this.worldHeight} pixels)`);

        // Navigation system - STAGE 4 INTEGRATION
        this.navGrid = new NavGrid();
        this.rawNavGrid = null;
        
        // Game time tracking
        this.gameTime = 0;
        
        // Initialize the world
        this.generateNavGrid();
        this.populateWorldWithObjects();

        console.log(`🌍 World created: ${this.width}×${this.height} tiles (${this.worldWidth}×${this.worldHeight} pixels)`);
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
     * UPDATED: Enhanced for larger 30×20 world
     */
    markObstacles() {
        // Enhanced office layout for larger 30×20 grid (2304×1536 pixels)
        const obstacles = [
            // Outer walls (border)
            ...this.generateBorderWalls(),
            
            // Office desks - positioned for 30×20 grid
            { x: 144, y: 144, width: 144, height: 72 },     // Desk 1 (3×1.5 tiles)
            { x: 432, y: 192, width: 144, height: 72 },     // Desk 2
            { x: 720, y: 240, width: 144, height: 72 },     // Desk 3
            { x: 1008, y: 144, width: 144, height: 72 },    // Desk 4
            { x: 1296, y: 192, width: 144, height: 72 },    // Desk 5
            { x: 1584, y: 240, width: 144, height: 72 },    // Desk 6
            { x: 1872, y: 144, width: 144, height: 72 },    // Desk 7
            
            // Second row of desks
            { x: 144, y: 432, width: 144, height: 72 },     // Desk 8
            { x: 432, y: 480, width: 144, height: 72 },     // Desk 9
            { x: 720, y: 528, width: 144, height: 72 },     // Desk 10
            { x: 1008, y: 432, width: 144, height: 72 },    // Desk 11
            { x: 1296, y: 480, width: 144, height: 72 },    // Desk 12
            { x: 1584, y: 528, width: 144, height: 72 },    // Desk 13
            { x: 1872, y: 432, width: 144, height: 72 },    // Desk 14
            
            // Meeting rooms and larger areas
            { x: 360, y: 720, width: 240, height: 192 },    // Large meeting room
            { x: 960, y: 864, width: 240, height: 192 },    // Second meeting room
            { x: 1440, y: 720, width: 240, height: 192 },   // Third meeting room
            
            // Kitchen/break areas
            { x: 96, y: 960, width: 192, height: 144 },     // Kitchen area
            { x: 1920, y: 960, width: 192, height: 144 },   // Break area
            
            // Office equipment and fixtures
            { x: 48, y: 288, width: 48, height: 48 },       // Printer/copier 1
            { x: 2160, y: 336, width: 48, height: 48 },     // Water cooler
            { x: 1152, y: 96, width: 48, height: 48 },      // Printer/copier 2
            { x: 1152, y: 1200, width: 48, height: 48 },    // Supply cabinet
            
            // Internal walls/partitions - more for larger space
            { x: 648, y: 48, width: 144, height: 24 },      // Partition 1
            { x: 1296, y: 48, width: 144, height: 24 },     // Partition 2
            { x: 576, y: 1440, width: 144, height: 24 },    // Partition 3
            { x: 1440, y: 1440, width: 144, height: 24 }    // Partition 4
        ];
        
        // Mark each obstacle area as non-walkable
        obstacles.forEach(obstacle => {
            const startGridX = Math.floor(obstacle.x / this.TILE_SIZE);
            const startGridY = Math.floor(obstacle.y / this.TILE_SIZE);
            const endGridX = Math.ceil((obstacle.x + obstacle.width) / this.TILE_SIZE);
            const endGridY = Math.ceil((obstacle.y + obstacle.height) / this.TILE_SIZE);
            
            for (let gridY = startGridY; gridY < endGridY && gridY < this.height; gridY++) {
                for (let gridX = startGridX; gridX < endGridX && gridX < this.width; gridX++) {
                    if (gridY >= 0 && gridX >= 0) {
                        this.rawNavGrid[gridY][gridX] = 1; // Mark as obstacle
                        this.navGrid.setWalkable(gridX, gridY, false);
                    }
                }
            }
        });
        
        console.log(`🚧 Marked ${obstacles.length} obstacle areas in navigation grid`);
    }

    /**
     * Generate border walls for the world boundaries
     */
    generateBorderWalls() {
        const walls = [];
        const wallThickness = this.TILE_SIZE;
        
        // Top wall
        walls.push({ x: 0, y: 0, width: this.worldWidth, height: wallThickness });
        
        // Bottom wall
        walls.push({ x: 0, y: this.worldHeight - wallThickness, width: this.worldWidth, height: wallThickness });
        
        // Left wall
        walls.push({ x: 0, y: 0, width: wallThickness, height: this.worldHeight });
        
        // Right wall
        walls.push({ x: this.worldWidth - wallThickness, y: 0, width: wallThickness, height: this.worldHeight });
        
        return walls;
    }

    /**
     * Populate world with interactive objects and furniture
     */
    populateWorldWithObjects() {
        console.log('🏢 Populating world with office objects...');
        
        // This will be implemented in future stages
        // For now, obstacles serve as the primary world objects
        
        console.log('✅ World population complete');
    }

    /**
     * STAGE 4: Find path between two points using A* pathfinding
     */
    findPath(startPos, endPos) {
        if (!this.navGrid) {
            throw new Error('Navigation grid not initialized');
        }
        
        // Convert world coordinates to grid coordinates
        const startGrid = this.worldToGrid(startPos.x, startPos.y);
        const endGrid = this.worldToGrid(endPos.x, endPos.y);
        
        console.log(`🔍 Finding path from (${startGrid.x}, ${startGrid.y}) to (${endGrid.x}, ${endGrid.y})`);
        
        // Use NavGrid's A* pathfinding
        const gridPath = this.navGrid.findPath(startGrid, endGrid);
        
        if (gridPath.length === 0) {
            console.warn('🚫 No path found');
            return [];
        }
        
        // Convert grid path back to world coordinates
        const worldPath = gridPath.map(gridPos => this.gridToWorld(gridPos.x, gridPos.y));
        
        console.log(`✅ Path found with ${worldPath.length} waypoints`);
        return worldPath;
    }

    /**
     * Check if a position is walkable
     */
    isWalkable(x, y) {
        const gridPos = this.worldToGrid(x, y);
        return this.navGrid.isWalkable(gridPos.x, gridPos.y);
    }

    /**
     * Get a random walkable position in the world
     */
    getRandomWalkablePosition() {
        const walkablePositions = [];
        
        // Sample positions across the grid (every 2 tiles to improve performance)
        for (let y = 1; y < this.height - 1; y += 2) {
            for (let x = 1; x < this.width - 1; x += 2) {
                if (this.navGrid.isWalkable(x, y)) {
                    const worldPos = this.gridToWorld(x, y);
                    walkablePositions.push(worldPos);
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
     * FIXED: Returns actual world dimensions
     */
    getWorldBounds() {
        return {
            width: this.worldWidth,     // 2304 pixels for 30×20 map
            height: this.worldHeight,   // 1536 pixels for 30×20 map
            tileWidth: this.width,      // 30 tiles
            tileHeight: this.height,    // 20 tiles
            tileSize: this.TILE_SIZE    // 48 pixels
        };
    }

    /**
     * Convert world coordinates to grid coordinates
     */
    worldToGrid(x, y) {
        return {
            x: Math.floor(x / this.TILE_SIZE),
            y: Math.floor(y / this.TILE_SIZE)
        };
    }

    /**
     * Convert grid coordinates to world coordinates
     */
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.TILE_SIZE + this.TILE_SIZE / 2,
            y: gridY * this.TILE_SIZE + this.TILE_SIZE / 2
        };
    }

    /**
     * Update world state (called each frame)
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Future: Update dynamic world elements, time-based events, etc.
    }

    /**
     * Get world status for debugging
     */
    getStatus() {
        return {
            dimensions: `${this.width}×${this.height} tiles`,
            pixelSize: `${this.worldWidth}×${this.worldHeight} pixels`,
            tileSize: this.TILE_SIZE,
            navGridGenerated: !!this.navGrid && this.navGrid.grid && this.navGrid.grid.length > 0,
            walkableTiles: this.getWalkableTileCount(),
            gameTime: this.gameTime.toFixed(1)
        };
    }

    /**
     * Count walkable tiles for debugging
     */
    getWalkableTileCount() {
        if (!this.rawNavGrid || this.rawNavGrid.length === 0) return 0;
        
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.rawNavGrid[y][x] === 0) count++;
            }
        }
        return count;
    }
}

/**
 * Load map data from JSON file
 * UPDATED: Enhanced error handling and validation
 */
export async function loadMapData() {
    try {
        console.log('🗺️ Loading map data...');
        
        const response = await fetch('./assets/office-layout.json');
        if (!response.ok) {
            throw new Error(`Failed to load map: ${response.status} ${response.statusText}`);
        }
        
        const mapData = await response.json();
        
        // Validate map data structure
        if (!mapData.width || !mapData.height || !mapData.layers) {
            throw new Error('Invalid map data structure');
        }
        
        console.log(`✅ Map data loaded: ${mapData.width}×${mapData.height} tiles`);
        console.log(`📊 Map details:`, {
            dimensions: `${mapData.width}×${mapData.height}`,
            tileSize: `${mapData.tilewidth}×${mapData.tileheight}`,
            layers: mapData.layers?.length || 0,
            worldSize: `${mapData.width * (mapData.tilewidth || 48)}×${mapData.height * (mapData.tileheight || 48)} pixels`
        });
        
        return mapData;
        
    } catch (error) {
        console.warn('⚠️ Failed to load map data, using fallback:', error.message);
        
        // Return fallback map data for 30×20 tiles
        return {
            width: 30,
            height: 20,
            tilewidth: 48,
            tileheight: 48,
            layers: [{
                name: 'background',
                width: 30,
                height: 20,
                data: new Array(30 * 20).fill(1) // All tiles walkable by default
            }]
        };
    }
}
