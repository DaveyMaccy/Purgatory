// src/core/world/world.js - Enhanced with NavGrid integration for Stage 4

import { NavGrid } from './nav-grid.js';

export class World {
    constructor(characterManager, officeLayout) {
        this.characterManager = characterManager;
        this.officeLayout = officeLayout;
        
        // Game time tracking
        this.gameTime = 0;
        
        // STAGE 4: Navigation system
        this.navGrid = new NavGrid();
        
        // World configuration from layout data
        this.TILE_SIZE = officeLayout?.tilewidth || 48;
        
        // World dimensions
        this.width = officeLayout?.width || 16;
        this.height = officeLayout?.height || 12;
        this.worldWidth = this.width * this.TILE_SIZE;
        this.worldHeight = this.height * this.TILE_SIZE;

        console.log(`🌍 World created: ${this.width}x${this.height} tiles (${this.worldWidth}x${this.worldHeight} pixels)`);
    }

    /**
     * STAGE 4 CRITICAL: Generate navigation grid for character movement and pathfinding
     */
    generateNavGrid() {
        console.log('🗺️ Generating navigation grid for pathfinding...');
        
        try {
            // Initialize the NavGrid with world dimensions
            this.navGrid.initialize(this.width, this.height);
            
            // Mark obstacles based on map data or default office layout
            this.markObstacles();
            
            console.log(`✅ Navigation grid generated: ${this.width}x${this.height} tiles`);
            console.log('📊 Grid sample (first 5 rows):', this.navGrid.grid.slice(0, 5));
            
        } catch (error) {
            console.error('❌ Failed to generate navigation grid:', error);
            
            // Create a simple fallback grid
            this.navGrid.initialize(this.width, this.height);
            console.log('🔧 Using fallback navigation grid with no obstacles');
        }
    }

    /**
     * STAGE 4: Mark obstacles in the navigation grid
     * Creates walls and furniture as non-walkable areas
     */
    markObstacles() {
        console.log('🧱 Marking obstacles in navigation grid...');
        
        // Mark border walls as obstacles
        for (let x = 0; x < this.width; x++) {
            this.navGrid.markObstacle(x, 0); // Top wall
            this.navGrid.markObstacle(x, this.height - 1); // Bottom wall
        }
        
        for (let y = 0; y < this.height; y++) {
            this.navGrid.markObstacle(0, y); // Left wall
            this.navGrid.markObstacle(this.width - 1, y); // Right wall
        }
        
        // Add some office furniture as obstacles (sample layout)
        this.addOfficeFurniture();
        
        console.log('✅ Obstacles marked in navigation grid');
    }

    /**
     * STAGE 4: Add office furniture obstacles
     */
    addOfficeFurniture() {
        // Conference room table (center-left area)
        for (let x = 3; x <= 5; x++) {
            for (let y = 3; y <= 5; y++) {
                this.navGrid.markObstacle(x, y);
            }
        }
        
        // Desk clusters (right side)
        for (let x = 10; x <= 12; x++) {
            for (let y = 2; y <= 3; y++) {
                this.navGrid.markObstacle(x, y);
            }
        }
        
        for (let x = 10; x <= 12; x++) {
            for (let y = 6; y <= 7; y++) {
                this.navGrid.markObstacle(x, y);
            }
        }
        
        // Kitchen area (bottom-left)
        for (let x = 2; x <= 4; x++) {
            for (let y = 8; y <= 9; y++) {
                this.navGrid.markObstacle(x, y);
            }
        }
        
        console.log('🪑 Office furniture obstacles added');
    }

    /**
     * STAGE 4: Find path between two positions using A* pathfinding
     * @param {Object} start - Starting position {x, y} in pixels
     * @param {Object} end - Target position {x, y} in pixels
     * @returns {Array} Array of waypoints from start to end
     */
    findPath(start, end) {
        if (!this.navGrid) {
            console.error('❌ Navigation grid not initialized');
            return [];
        }
        
        return this.navGrid.findPath(start, end);
    }

    /**
     * STAGE 4: Check if a pixel position is walkable
     * @param {number} x - X coordinate in pixels
     * @param {number} y - Y coordinate in pixels
     * @returns {boolean} True if walkable
     */
    isPositionWalkable(x, y) {
        if (!this.navGrid) {
            console.warn('⚠️ Navigation grid not available, assuming walkable');
            return true;
        }
        
        // Convert pixel coordinates to grid coordinates
        const gridX = Math.floor(x / this.TILE_SIZE);
        const gridY = Math.floor(y / this.TILE_SIZE);
        
        return this.navGrid.isWalkable(gridX, gridY);
    }

    /**
     * STAGE 4: Get a random walkable position in pixels
     * @returns {Object} Object with x, y coordinates in pixels
     */
    getRandomWalkablePosition() {
        if (!this.navGrid || this.navGrid.grid.length === 0) {
            // Fallback if no nav grid
            const x = 100 + Math.random() * (this.worldWidth - 200);
            const y = 100 + Math.random() * (this.worldHeight - 200);
            return { x, y };
        }
        
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
            console.warn('⚠️ No walkable positions found, using fallback');
            return { x: this.worldWidth / 2, y: this.worldHeight / 2 };
        }
        
        // Return random walkable position
        const randomIndex = Math.floor(Math.random() * walkablePositions.length);
        return walkablePositions[randomIndex];
    }

    /**
     * STAGE 4: Get nearest walkable position to a target
     * @param {Object} target - Target position {x, y}
     * @param {number} searchRadius - Search radius in pixels (default: 100)
     * @returns {Object|null} Nearest walkable position or null
     */
    getNearestWalkablePosition(target, searchRadius = 100) {
        if (!this.navGrid) return target;
        
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
                    
                    if (this.navGrid.isWalkable(checkX, checkY)) {
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

    /**
     * STAGE 4: Convert pixel coordinates to grid coordinates
     * @param {Object} pixelPos - Position in pixels {x, y}
     * @returns {Object} Position in grid coordinates {x, y}
     */
    pixelToGrid(pixelPos) {
        return {
            x: Math.floor(pixelPos.x / this.TILE_SIZE),
            y: Math.floor(pixelPos.y / this.TILE_SIZE)
        };
    }

    /**
     * STAGE 4: Convert grid coordinates to pixel coordinates (center of tile)
     * @param {Object} gridPos - Position in grid coordinates {x, y}
     * @returns {Object} Position in pixels {x, y}
     */
    gridToPixel(gridPos) {
        return {
            x: gridPos.x * this.TILE_SIZE + this.TILE_SIZE / 2,
            y: gridPos.y * this.TILE_SIZE + this.TILE_SIZE / 2
        };
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
     * STAGE 5+: Populate world with objects (placeholder for later stages)
     */
    populateWorldWithObjects() {
        console.log('🏢 Populating world with objects...');
        // Implementation will be completed in later stages
    }

    /**
     * STAGE 4: Debug method to visualize navigation grid
     */
    debugNavGrid() {
        if (!this.navGrid) {
            console.log('❌ Navigation grid not available');
            return;
        }
        
        console.log('🗺️ World Navigation Grid Debug:');
        console.log(`World Size: ${this.worldWidth}x${this.worldHeight} pixels`);
        console.log(`Grid Size: ${this.width}x${this.height} tiles`);
        console.log(`Tile Size: ${this.TILE_SIZE}x${this.TILE_SIZE} pixels`);
        
        this.navGrid.debugPrint();
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
     * STAGE 4: Get world boundaries for validation
     */
    getWorldBounds() {
        return {
            minX: 0,
            minY: 0,
            maxX: this.worldWidth,
            maxY: this.worldHeight,
            width: this.worldWidth,
            height: this.worldHeight
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
     * STAGE 4: Get walkable positions near a specific location
     * @param {Object} center - Center position {x, y}
     * @param {number} radius - Search radius in pixels
     * @returns {Array} Array of walkable positions
     */
    getWalkablePositionsNear(center, radius = 100) {
        const walkablePositions = [];
        const gridRadius = Math.ceil(radius / this.TILE_SIZE);
        const centerGridX = Math.floor(center.x / this.TILE_SIZE);
        const centerGridY = Math.floor(center.y / this.TILE_SIZE);
        
        for (let dx = -gridRadius; dx <= gridRadius; dx++) {
            for (let dy = -gridRadius; dy <= gridRadius; dy++) {
                const gridX = centerGridX + dx;
                const gridY = centerGridY + dy;
                
                if (this.navGrid.isWalkable(gridX, gridY)) {
                    const pixelPos = this.gridToPixel({ x: gridX, y: gridY });
                    const distance = Math.sqrt(
                        Math.pow(pixelPos.x - center.x, 2) + 
                        Math.pow(pixelPos.y - center.y, 2)
                    );
                    
                    if (distance <= radius) {
                        walkablePositions.push(pixelPos);
                    }
                }
            }
        }
        
        return walkablePositions;
    }
}
