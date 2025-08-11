/**
 * STAGE 3 COMPLETE: World Management System
 * 
 * This file handles:
 * - Map data loading from JSON files
 * - Navigation grid generation for character positioning
 * - World object management
 * - Task assignment system
 * - Position validation and pathfinding preparation
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
 */
export class World {
    constructor(characterManager, officeLayout) {
        this.characterManager = characterManager;
        this.officeLayout = officeLayout;
        this.objects = [];
        this.rooms = [];
        this.navGrid = [];
        this.gameTime = 0; // Game time in milliseconds
        this.officeType = 'corporate';
        this.taskDictionary = this.createTaskDictionary();
        
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
     * STAGE 2-3 CRITICAL: Generate navigation grid for character movement and positioning
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
     * Mark obstacles in the navigation grid
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
        
        // Mark desk areas as obstacles (matching renderer desk positions)
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
     * Create task dictionary for character assignments
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
                { displayName: 'User Research', requiredLocation: 'desk', duration: 60000 },
                { displayName: 'Design Review', requiredLocation: 'meeting_room', duration: 45000 }
            ],
            'Analyst': [
                { displayName: 'Analyze Data', requiredLocation: 'desk', duration: 80000 },
                { displayName: 'Generate Reports', requiredLocation: 'desk', duration: 70000 },
                { displayName: 'Present Findings', requiredLocation: 'meeting_room', duration: 30000 }
            ],
            'Intern': [
                { displayName: 'Learn Systems', requiredLocation: 'desk', duration: 60000 },
                { displayName: 'Assist Team', requiredLocation: 'desk', duration: 45000 },
                { displayName: 'Attend Training', requiredLocation: 'meeting_room', duration: 90000 }
            ]
        };
    }

    /**
     * Assign tasks to all characters based on their job roles
     */
    assignTasksToCharacters() {
        console.log('📋 Assigning tasks to characters...');
        
        this.characterManager.characters.forEach(character => {
            const tasks = this.taskDictionary[character.jobRole];
            if (tasks && tasks.length > 0) {
                const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
                character.assignedTask = { ...randomTask }; // Clone to avoid reference issues
                console.log(`📝 Assigned task "${randomTask.displayName}" to ${character.name}`);
            } else {
                // Default task if no specific tasks found
                character.assignedTask = { 
                    displayName: 'General office work', 
                    requiredLocation: 'desk',
                    duration: 60000
                };
                console.log(`📝 Assigned default task to ${character.name}`);
            }
        });
    }

    /**
     * Populate the world with objects (placeholder for future implementation)
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
     * Get a random walkable position
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
            navGridGenerated: !!this.navGrid && this.navGrid.length > 0,
            walkableTiles: this.getWalkableTileCount(),
            gameTime: this.gameTime
        };
    }

    /**
     * Count walkable tiles for debugging
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
}

/**
     * PHASE 4 ADD: Find path between two pixel positions
     * Converts to tile coordinates and uses NavGrid's A* implementation
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
            
            // Convert tile path back to pixel coordinates
            return tilePath.map(tile => ({
                x: (tile.x * this.TILE_SIZE) + (this.TILE_SIZE / 2),
                y: (tile.y * this.TILE_SIZE) + (this.TILE_SIZE / 2)
            }));
        }
        
        return [];
    }

