// src/core/world/nav-grid.js

export class NavGrid {
    constructor() {
        this.grid = [];
        this.width = 0;
        this.height = 0;
    }

    initialize(width, height) {
        this.width = width;
        this.height = height;
        this.grid = Array(height).fill(null).map(() => Array(width).fill(0));
    }

    markObstacle(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = 1; // 1 represents an obstacle
        }
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.grid[y][x] === 0;
    }

    /**
     * Find path from start to end using A* algorithm
     * @param {Object} start - Starting position {x, y}
     * @param {Object} end - Target position {x, y}
     * @returns {Array} Array of path points from start to end
     */
    findPath(start, end) {
        // Convert pixel coordinates to grid coordinates if needed
        const startGrid = {
            x: Math.floor(start.x / 48), // Assuming 48px tile size
            y: Math.floor(start.y / 48)
        };
        const endGrid = {
            x: Math.floor(end.x / 48),
            y: Math.floor(end.y / 48)
        };

        // Ensure start and end are within bounds and walkable
        if (!this.isWalkable(startGrid.x, startGrid.y) || 
            !this.isWalkable(endGrid.x, endGrid.y)) {
            console.warn('🚫 Start or end position is not walkable');
            return [];
        }

        // If start and end are the same, return empty path
        if (startGrid.x === endGrid.x && startGrid.y === endGrid.y) {
            return [];
        }

        // A* algorithm implementation
        const openSet = [startGrid];
        const closedSet = new Set();
        const cameFrom = new Map();
        
        // gScore: cost from start to current node
        const gScore = new Map();
        gScore.set(this.hashPoint(startGrid), 0);
        
        // fScore: estimated total cost from start to end
        const fScore = new Map();
        fScore.set(this.hashPoint(startGrid), this.heuristic(startGrid, endGrid));
        
        while (openSet.length > 0) {
            // Get node with lowest fScore
            openSet.sort((a, b) => {
                const scoreA = fScore.get(this.hashPoint(a)) || Infinity;
                const scoreB = fScore.get(this.hashPoint(b)) || Infinity;
                return scoreA - scoreB;
            });
            const current = openSet.shift();
            
            // If we reached the end, reconstruct path
            if (current.x === endGrid.x && current.y === endGrid.y) {
                const gridPath = this.reconstructPath(cameFrom, current);
                // Convert grid path back to pixel coordinates
                return this.convertGridPathToPixels(gridPath);
            }
            
            closedSet.add(this.hashPoint(current));
            
            // Check neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborHash = this.hashPoint(neighbor);
                if (closedSet.has(neighborHash)) continue;
                
                // Calculate tentative gScore
                const tentativeGScore = (gScore.get(this.hashPoint(current)) || 0) + 1;
                
                if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y) || 
                    tentativeGScore < (gScore.get(neighborHash) || Infinity)) {
                    
                    cameFrom.set(neighborHash, current);
                    gScore.set(neighborHash, tentativeGScore);
                    fScore.set(neighborHash, tentativeGScore + this.heuristic(neighbor, endGrid));
                    
                    if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // No path found
        console.warn('🚫 No path found from', start, 'to', end);
        return [];
    }

    /**
     * Get walkable neighbors of a grid point
     * @param {Object} point - Grid point {x, y}
     * @returns {Array} Array of neighbor points
     */
    getNeighbors(point) {
        const neighbors = [];
        const directions = [
            {x: 0, y: -1},  // Up
            {x: 1, y: 0},   // Right
            {x: 0, y: 1},   // Down
            {x: -1, y: 0},  // Left
            {x: 1, y: -1},  // Up-Right (diagonal)
            {x: 1, y: 1},   // Down-Right (diagonal)
            {x: -1, y: 1},  // Down-Left (diagonal)
            {x: -1, y: -1}  // Up-Left (diagonal)
        ];
        
        for (const dir of directions) {
            const newX = point.x + dir.x;
            const newY = point.y + dir.y;
            
            if (this.isWalkable(newX, newY)) {
                neighbors.push({x: newX, y: newY});
            }
        }
        
        return neighbors;
    }

    /**
     * Heuristic function for A* (Manhattan distance)
     * @param {Object} a - First point
     * @param {Object} b - Second point
     * @returns {number} Distance estimate
     */
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    /**
     * Create hash string for a point
     * @param {Object} point - Point {x, y}
     * @returns {string} Hash string
     */
    hashPoint(point) {
        return `${point.x},${point.y}`;
    }

    /**
     * Reconstruct path from A* came-from map
     * @param {Map} cameFrom - Map of point -> previous point
     * @param {Object} current - Current endpoint
     * @returns {Array} Path from start to end
     */
    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentPoint = current;
        
        while (cameFrom.has(this.hashPoint(currentPoint))) {
            currentPoint = cameFrom.get(this.hashPoint(currentPoint));
            path.unshift(currentPoint);
        }
        
        return path;
    }

    /**
     * Convert grid path to pixel coordinates
     * @param {Array} gridPath - Array of grid coordinates
     * @returns {Array} Array of pixel coordinates
     */
    convertGridPathToPixels(gridPath) {
        const TILE_SIZE = 48; // Match the tile size from world.js
        return gridPath.map(point => ({
            x: point.x * TILE_SIZE + TILE_SIZE / 2, // Center of tile
            y: point.y * TILE_SIZE + TILE_SIZE / 2
        }));
    }

    /**
     * Get grid dimensions
     * @returns {Object} Width and height of the grid
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }

    /**
     * Debug method to print grid state
     */
    debugPrint() {
        console.log('🗺️ NavGrid Debug:');
        console.log(`Dimensions: ${this.width}x${this.height}`);
        console.log('Grid (0=walkable, 1=obstacle):');
        
        for (let y = 0; y < Math.min(this.height, 10); y++) {
            const row = this.grid[y].slice(0, Math.min(this.width, 20)).join('');
            console.log(`Row ${y}: ${row}`);
        }
        
        if (this.height > 10) {
            console.log('... (truncated)');
        }
    }
}
