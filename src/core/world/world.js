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
        this.navGridInstance = null; // PHASE 4: Store NavGrid instance for pathfinding
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
        // Mark border walls as obstacles
        for (let x = 0; x < this.width; x++) {
            this.navGrid[0][x] = 1; // Top wall
            this.navGrid[this.height - 1][x] = 1; // Bottom wall
            
            // Also mark in NavGrid instance
            if (this.navGridInstance) {
                this.navGridInstance.markObstacle(x, 0);
                this.navGridInstance.markObstacle(x, this.height - 1);
            }
        }
        
        for (let y = 0; y < this.height; y++) {
            this.navGrid[y][0] = 1; // Left wall
            this.navGrid[y][this.width - 1] = 1; // Right wall
            
            // Also mark in NavGrid instance
            if (this.navGridInstance) {
                this.navGridInstance.markObstacle(0, y);
                this.navGridInstance.markObstacle(this.width - 1, y);
            }
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
                        
                        // Also mark in NavGrid instance
                        if (this.navGridInstance) {
                            this.navGridInstance.markObstacle(x, y);
                        }
                    }
                }
            }
        });
        
        console.log('🚧 Obstacles marked in navigation grid');
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
