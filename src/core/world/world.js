// src/core/world/world.js

import { NavGrid } from './nav-grid.js';

/**
 * World class - FIXED VERSION
 * Handles map loading fallback and proper nav grid generation
 */
export class World {
    constructor(mapData = null) {
        console.log('🌍 Creating game world...');
        
        // FIXED: Use fallback dimensions when mapData is null or invalid
        this.TILE_SIZE = (mapData && mapData.tilewidth) ? mapData.tilewidth : 48;
        this.width = (mapData && mapData.width) ? mapData.width : 30;
        this.height = (mapData && mapData.height) ? mapData.height : 20;
        this.worldWidth = this.width * this.TILE_SIZE;
        this.worldHeight = this.height * this.TILE_SIZE;

        console.log(`🌍 Using map dimensions: ${this.width}×${this.height} tiles (${this.worldWidth}×${this.worldHeight} pixels)`);

        // Navigation system
        this.navGrid = new NavGrid();
        this.rawNavGrid = null;
        
        // Game time tracking
        this.gameTime = 0;
        
        // Initialize the world
        this.generateNavGrid();
        this.populateWorldWithObjects();

        console.log(`✅ World created successfully`);
    }

    /**
     * FIXED: Generate navigation grid with proper error handling
     */
    generateNavGrid() {
        console.log('🗺️ Generating navigation grid...');
        
        try {
            // Initialize NavGrid instance
            this.navGrid.initialize(this.width, this.height);
            
            // Create raw grid for backwards compatibility
            this.rawNavGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
            
            // Mark obstacles
            this.markObstacles();
            
            console.log(`✅ Navigation grid generated: ${this.width}×${this.height} tiles`);
            
        } catch (error) {
            console.error('❌ Failed to generate navigation grid:', error);
            // Create basic fallback grid
            this.createFallbackGrid();
        }
    }

    /**
     * Create a basic fallback navigation grid
     */
    createFallbackGrid() {
        console.log('🔧 Creating fallback navigation grid...');
        
        this.rawNavGrid = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
        
        // Simple border obstacles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    this.rawNavGrid[y][x] = 1; // Wall
                }
            }
        }
        
        // Initialize basic NavGrid
        if (!this.navGrid.grid) {
            this.navGrid.grid = this.rawNavGrid.map(row => [...row]);
            this.navGrid.width = this.width;
            this.navGrid.height = this.height;
        }
        
        console.log('✅ Fallback navigation grid created');
    }

    /**
     * Mark obstacles in the navigation grid
     */
    markObstacles() {
        // Basic office layout obstacles
        const obstacles = [
            // Some basic desks
            { x: 2, y: 3, width: 3, height: 1 },
            { x: 6, y: 3, width: 3, height: 1 },
            { x: 10, y: 3, width: 3, height: 1 },
            { x: 2, y: 7, width: 3, height: 1 },
            { x: 6, y: 7, width: 3, height: 1 }
        ];
        
        obstacles.forEach(obstacle => {
            for (let x = obstacle.x; x < obstacle.x + obstacle.width && x < this.width; x++) {
                for (let y = obstacle.y; y < obstacle.y + obstacle.height && y < this.height; y++) {
                    if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                        this.rawNavGrid[y][x] = 1;
                        if (this.navGrid && this.navGrid.setWalkable) {
                            this.navGrid.setWalkable(x, y, false);
                        }
                    }
                }
            }
        });
        
        console.log(`🚧 Marked ${obstacles.length} obstacle areas`);
    }

    /**
     * Populate world with objects
     */
    populateWorldWithObjects() {
        // Basic implementation
        console.log('🏢 World objects populated');
    }

    /**
     * Find path between two points
     */
    findPath(startPos, endPos) {
        if (!this.navGrid || !this.navGrid.findPath) {
            console.warn('🚫 NavGrid pathfinding not available, using direct path');
            return [endPos];
        }
        
        try {
            const startGrid = this.worldToGrid(startPos.x, startPos.y);
            const endGrid = this.worldToGrid(endPos.x, endPos.y);
            
            const gridPath = this.navGrid.findPath(startGrid, endGrid);
            
            if (gridPath.length === 0) {
                return [endPos]; // Direct path fallback
            }
            
            return gridPath.map(gridPos => this.gridToWorld(gridPos.x, gridPos.y));
            
        } catch (error) {
            console.warn('🚫 Pathfinding failed, using direct path:', error);
            return [endPos];
        }
    }

    /**
     * Check if position is walkable
     */
    isWalkable(x, y) {
        const gridPos = this.worldToGrid(x, y);
        
        if (gridPos.x < 0 || gridPos.x >= this.width || gridPos.y < 0 || gridPos.y >= this.height) {
            return false;
        }
        
        if (this.rawNavGrid && this.rawNavGrid[gridPos.y] && this.rawNavGrid[gridPos.y][gridPos.x] !== undefined) {
            return this.rawNavGrid[gridPos.y][gridPos.x] === 0;
        }
        
        return true; // Default to walkable
    }

    /**
     * Get random walkable position
     */
    getRandomWalkablePosition() {
        const walkablePositions = [];
        
        for (let y = 1; y < this.height - 1; y += 2) {
            for (let x = 1; x < this.width - 1; x += 2) {
                if (this.isWalkable(this.gridToWorld(x, y).x, this.gridToWorld(x, y).y)) {
                    walkablePositions.push(this.gridToWorld(x, y));
                }
            }
        }
        
        if (walkablePositions.length === 0) {
            return { 
                x: this.worldWidth / 2, 
                y: this.worldHeight / 2 
            };
        }
        
        return walkablePositions[Math.floor(Math.random() * walkablePositions.length)];
    }

    /**
     * Get world bounds
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
     * Update world state
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
    }

    /**
     * Get world status for debugging
     */
    getStatus() {
        return {
            dimensions: `${this.width}×${this.height} tiles`,
            pixelSize: `${this.worldWidth}×${this.worldHeight} pixels`,
            tileSize: this.TILE_SIZE,
            navGridGenerated: !!this.rawNavGrid,
            walkableTiles: this.getWalkableTileCount(),
            gameTime: this.gameTime.toFixed(1)
        };
    }

    /**
     * Count walkable tiles
     */
    getWalkableTileCount() {
        if (!this.rawNavGrid) return 0;
        
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
 * FIXED: Load map data with proper fallback
 */
export async function loadMapData() {
    try {
        console.log('🗺️ Loading map data...');
        
        // Try multiple possible paths
        const possiblePaths = [
            './assets/maps/office-layout.json',
            './assets/office-layout.json',
            './assets/maps/purgatorygamemap.json'
        ];
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const mapData = await response.json();
                    console.log(`✅ Map data loaded from: ${path}`);
                    return mapData;
                }
            } catch (e) {
                // Continue to next path
            }
        }
        
        throw new Error('No map file found at any expected location');
        
    } catch (error) {
        console.warn('⚠️ Failed to load map data, using fallback:', error.message);
        
        // Return sensible fallback
        return {
            width: 30,
            height: 20,
            tilewidth: 48,
            tileheight: 48,
            layers: [{
                name: 'background',
                width: 30,
                height: 20,
                data: new Array(30 * 20).fill(1)
            }]
        };
    }
}
