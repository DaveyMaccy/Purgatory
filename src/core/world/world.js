/**
 * STAGE 1 FIX: Added loadMapData function to world.js
 * 
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
        
        // BILO_FIX: TILE_SIZE is now a property of the World class, making it accessible
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
                // Add more job roles as needed
            },
            // Add more office types as needed
        };
    }

    /**
     * Generate the navigation grid (A* grid)
     * Based on SSOT Chapter 4.1
     */
    generateNavGrid() {
        // BILO_FIX: The original function used hardcoded dimensions. This version correctly
        // uses the `width` and `height` properties from the loaded Tiled map JSON file.
        if (!this.officeLayout || !this.officeLayout.width || !this.officeLayout.height) {
            console.error("Cannot generate nav grid: officeLayout data is incomplete.");
            return;
        }

        const gridWidth = this.officeLayout.width;
        const gridHeight = this.officeLayout.height;

        this.navGrid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));

        // Find the layer with collision data. In your purgatorygamemap.json, this is "Tile Layer 2".
        const collisionLayer = this.officeLayout.layers.find(layer => layer.name === "Tile Layer 2");
        if (!collisionLayer) {
            console.error("Could not find a collision layer named 'Tile Layer 2' in the map data.");
            return;
        }

        // Parse the collision data to mark walls and obstacles
        const { data } = collisionLayer;
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const index = y * gridWidth + x;
                const tileId = data[index];
                
                // Mark as walkable (0) or blocked (1)
                // Tile ID of 0 means empty/walkable, any other value means blocked
                this.navGrid[y][x] = tileId === 0 ? 0 : 1;
            }
        }

        console.log(`Generated navigation grid: ${gridWidth}x${gridHeight}`);
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
            }
        });
    }

    /**
     * Populate the world with objects (placeholder for now)
     */
    populateWorldWithObjects() {
        // Implementation remains the same...
        // This will be completed in later stages
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
        
        if (gridX < 0 || gridX >= this.navGrid[0]?.length || 
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
