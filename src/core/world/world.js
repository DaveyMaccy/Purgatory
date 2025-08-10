/**
 * STAGE 2 FIXED: Load map data and World class with proper error handling
 * 
 * Fixed Issues:
 * 1. Actually loads the map JSON file
 * 2. Proper error handling
 * 3. Fixed navigation grid generation
 * 4. Returns the loaded data for use in game engine
 */

/**
 * Load map data from JSON file
 * @returns {Promise<Object>} The loaded map data
 */
export async function loadMapData() {
    try {
        console.log('Loading map data from assets/maps/purgatorygamemap.json...');
        
        const response = await fetch('assets/maps/purgatorygamemap.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load map: HTTP ${response.status}`);
        }
        
        const mapData = await response.json();
        
        // Validate that we have the essential map data
        if (!mapData.width || !mapData.height || !mapData.layers) {
            throw new Error('Invalid map data: missing required properties (width, height, layers)');
        }
        
        console.log('Map data loaded successfully:', {
            width: mapData.width,
            height: mapData.height,
            layers: mapData.layers.length,
            tilewidth: mapData.tilewidth,
            tileheight: mapData.tileheight
        });
        
        return mapData;
        
    } catch (error) {
        console.error('Error loading map data:', error);
        throw error;
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
        
        // FIXED: TILE_SIZE is now a property of the World class, making it accessible
        // to other modules like characterManager.js.
        this.TILE_SIZE = 48; // Standard tile size from your map data.

        // Generate navigation grid immediately upon construction.
        this.generateNavGrid();
    }

    /**
     * Create the task dictionary based on office types and job roles
     * @returns {Object} Task dictionary
     */
    createTaskDictionary() {
        return {
            corporate: {
                'Senior Coder': [
                    { displayName: 'Refactor legacy code', requiredLocation: 'desk' },
                    { displayName: 'Fix production bug', requiredLocation: 'desk' },
                ],
                'Manager': [
                    { displayName: 'Review team performance', requiredLocation: 'desk' },
                    { displayName: 'Plan project milestones', requiredLocation: 'desk' },
                ],
                'Intern': [
                    { displayName: 'Learn new framework', requiredLocation: 'desk' },
                    { displayName: 'Shadow senior developer', requiredLocation: 'desk' },
                ],
                'Designer': [
                    { displayName: 'Create UI mockups', requiredLocation: 'desk' },
                    { displayName: 'User research analysis', requiredLocation: 'desk' },
                ],
                'HR Specialist': [
                    { displayName: 'Interview candidates', requiredLocation: 'desk' },
                    { displayName: 'Update employee handbook', requiredLocation: 'desk' },
                ]
            },
            // Add more office types as needed
        };
    }

    /**
     * FIXED: Generate the navigation grid (A* grid) with proper error handling
     * Based on SSOT Chapter 4.1
     */
    generateNavGrid() {
        try {
            // FIXED: Check if officeLayout exists and has required properties
            if (!this.officeLayout || !this.officeLayout.width || !this.officeLayout.height) {
                console.warn("Cannot generate nav grid: officeLayout data is incomplete. Using default grid.");
                this.createDefaultNavGrid();
                return;
            }

            const gridWidth = this.officeLayout.width;
            const gridHeight = this.officeLayout.height;

            this.navGrid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));

            // Find the layer with collision data. In your purgatorygamemap.json, this is "Tile Layer 2".
            const collisionLayer = this.officeLayout.layers.find(layer => layer.name === "Tile Layer 2");
            if (!collisionLayer) {
                console.warn("Could not find a collision layer named 'Tile Layer 2' in the map data. Using default walkable grid.");
                // Create a simple walkable grid
                for (let y = 0; y < gridHeight; y++) {
                    for (let x = 0; x < gridWidth; x++) {
                        this.navGrid[y][x] = 0; // All walkable
                    }
                }
                console.log(`Generated default navigation grid: ${gridWidth}x${gridHeight}`);
                return;
            }

            // FIXED: Parse the collision data to mark walls and obstacles
            const { data } = collisionLayer;
            if (!data || !Array.isArray(data)) {
                console.warn("Collision layer has no data array. Using default walkable grid.");
                this.createDefaultNavGrid();
                return;
            }

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    const index = y * gridWidth + x;
                    if (index >= data.length) {
                        // Beyond data array, mark as walkable
                        this.navGrid[y][x] = 0;
                        continue;
                    }
                    
                    const tileId = data[index];
                    
                    // Mark as walkable (0) or blocked (1)
                    // Tile ID of 0 means empty/walkable, any other value means blocked
                    this.navGrid[y][x] = tileId === 0 ? 0 : 1;
                }
            }

            console.log(`Generated navigation grid: ${gridWidth}x${gridHeight}`);
            
        } catch (error) {
            console.error('Error generating navigation grid:', error);
            this.createDefaultNavGrid();
        }
    }

    /**
     * FIXED: Create a default navigation grid when map data is unavailable
     */
    createDefaultNavGrid() {
        const defaultWidth = 20;
        const defaultHeight = 15;
        
        this.navGrid = Array(defaultHeight).fill(null).map(() => Array(defaultWidth).fill(0));
        
        console.log(`Created default navigation grid: ${defaultWidth}x${defaultHeight}`);
    }

    /**
     * Assign tasks to characters based on their job roles
     */
    assignTasksToCharacters() {
        this.characterManager.characters.forEach(character => {
            const tasks = this.taskDictionary[this.officeType]?.[character.jobRole];
            if (tasks && tasks.length > 0) {
                const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
                character.assignedTask = randomTask;
                console.log(`Assigned task "${randomTask.displayName}" to ${character.name}`);
            } else {
                // Default task if no specific tasks found
                character.assignedTask = { displayName: 'General office work', requiredLocation: 'desk' };
                console.log(`Assigned default task to ${character.name}`);
            }
        });
    }

    /**
     * Populate the world with objects (placeholder for now)
     */
    populateWorldWithObjects() {
        // Implementation will be completed in later stages
        console.log('Populating world with objects...');
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
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if walkable
     */
    isPositionWalkable(x, y) {
        const gridX = Math.floor(x / this.TILE_SIZE);
        const gridY = Math.floor(y / this.TILE_SIZE);
        
        if (!this.navGrid || this.navGrid.length === 0) {
            return true; // If no nav grid, assume walkable
        }
        
        if (gridX < 0 || gridX >= (this.navGrid[0]?.length || 0) || 
            gridY < 0 || gridY >= this.navGrid.length) {
            return false;
        }
        
        return this.navGrid[gridY][gridX] === 0;
    }

    /**
     * Get a random walkable position
     * @returns {Object} Object with x, y coordinates
     */
    getRandomWalkablePosition() {
        const walkablePositions = [];
        
        if (!this.navGrid || this.navGrid.length === 0) {
            // If no nav grid, return default positions
            return { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 };
        }
        
        for (let y = 0; y < this.navGrid.length; y++) {
            for (let x = 0; x < this.navGrid[y].length; x++) {
                if (this.navGrid[y][x] === 0) {
                    walkablePositions.push({
                        x: x * this.TILE_SIZE + this.TILE_SIZE / 2,
                        y: y * this.TILE_SIZE + this.TILE_SIZE / 2
                    });
                }
            }
        }
        
        if (walkablePositions.length === 0) {
            console.warn('No walkable positions found, using default');
            return { x: 100, y: 100 };
        }
        
        return walkablePositions[Math.floor(Math.random() * walkablePositions.length)];
    }
}
