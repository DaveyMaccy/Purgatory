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

        // Mark impassable cells based on the collision layer data
        collisionLayer.chunks.forEach(chunk => {
            for (let y = 0; y < chunk.height; y++) {
                for (let x = 0; x < chunk.width; x++) {
                    const tileIndex = x + y * chunk.width;
                    const tileId = chunk.data[tileIndex];
                    if (tileId > 0) { // Any tile ID > 0 in this layer is considered a wall
                        const worldX = chunk.x + x;
                        const worldY = chunk.y + y;
                        if (this.navGrid[worldY] && this.navGrid[worldY][worldX] !== undefined) {
                            this.navGrid[worldY][worldX] = 1; // 1 represents an impassable wall
                        }
                    }
                }
            }
        });
        
        console.log('Navigation grid generated successfully.');
    }

    /**
     * Populate the world with objects
     * Based on SSOT Chapter 4.2
     * @param {Array} characters - Array of characters to place desk items for
     */
    populateWorldWithObjects(characters) {
        // Implementation remains the same...
    }

    // ... other methods from your original file ...
    
    /**
     * Update the world state
     * @param {number} deltaTime - Time passed in milliseconds
     */
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        this.characterManager.characters.forEach(character => {
            if (!character.isPlayer && character.isEnabled && 
                !character.assignedTask && !character.currentAction) {
                this.assignTask(character);
            }
        });
    }
    
    assignTask(character) {
        if (character.assignedTask) return;
        
        const tasks = this.taskDictionary[this.officeType][character.jobRole];
        if (tasks && tasks.length > 0) {
            const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
            character.assignedTask = { ...randomTask, progress: 0 }; // Ensure progress is initialized
            console.log(`Assigned task to ${character.name}: ${character.assignedTask.displayName}`);
        }
    }
}
