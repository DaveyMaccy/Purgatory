/**
 * NavGrid class - Handles pathfinding and navigation grid operations
 * Complete A* pathfinding implementation for Stage 4
 */
export class NavGrid {
    constructor() {
        this.grid = [];
        this.width = 0;
        this.height = 0;
    }

    /**
     * Initialize the navigation grid
     * @param {number} width - Grid width in tiles
     * @param {number} height - Grid height in tiles
     */
    initialize(width, height) {
        this.width = width;
        this.height = height;
        this.grid = Array(height).fill(null).map(() => Array(width).fill(0));
        console.log(`🗺️ NavGrid initialized: ${width}x${height}`);
    }

    /**
     * Mark a tile as an obstacle
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    markObstacle(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = 1; // 1 represents an obstacle
        }
    }

    /**
     * Check if a tile is walkable
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if walkable
     */
    isWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.grid[y][x] === 0;
    }

    /**
     * Find path between two points using A* algorithm
     * @param {Object} start - Start position {x, y}
     * @param {Object} end - End position {x, y}
     * @returns {Array} Array of waypoints from start to end
     */
    findPath(start, end) {
        // Validate inputs
        if (!start || !end || 
            !this.isWalkable(start.x, start.y) || 
            !this.isWalkable(end.x, end.y)) {
            console.warn('🚫 Invalid pathfinding request:', { start, end });
            return [];
        }

        // If start and end are the same, return empty path
        if (start.x === end.x && start.y === end.y) {
            return [];
        }

        const openSet = [start];
        const closedSet = new Set();
        const cameFrom = new Map();
        
        // gScore: cost from start to current node
        const gScore = new Map();
        gScore.set(this.hashPoint(start), 0);
        
        // fScore: estimated total cost from start to end
        const fScore = new Map();
        fScore.set(this.hashPoint(start), this.heuristic(start, end));
        
        while (openSet.length > 0) {
            // Get node with lowest fScore
            openSet.sort((a, b) => {
                const scoreA = fScore.get(this.hashPoint(a)) || Infinity;
                const scoreB = fScore.get(this.hashPoint(b)) || Infinity;
                return scoreA - scoreB;
            });
            const current = openSet.shift();
            
            // If we reached the end, reconstruct path
            if (current.x === end.x && current.y === end.y) {
                const path = this.reconstructPath(cameFrom, current);
                console.log(`🎯 Path found: ${path.length} steps`);
                return path;
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
                    fScore.set(neighborHash, tentativeGScore + this.heuristic(neighbor, end));
                    
                    if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // No path found
        console.warn('🚫 No path found between:', start, 'and', end);
        return [];
    }

    /**
     * Get all walkable neighbors of a point
     * @param {Object} point - Point {x, y}
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
                // For diagonal movement, check if both adjacent cells are walkable
                // to prevent cutting corners
                if (Math.abs(dir.x) === 1 && Math.abs(dir.y) === 1) {
                    if (this.isWalkable(point.x + dir.x, point.y) && 
                        this.isWalkable(point.x, point.y + dir.y)) {
                        neighbors.push({x: newX, y: newY});
                    }
                } else {
                    neighbors.push({x: newX, y: newY});
                }
            }
        }
        
        return neighbors;
    }

    /**
     * Heuristic function for A* (Manhattan distance)
     * @param {Object} a - Point A {x, y}
     * @param {Object} b - Point B {x, y}
     * @returns {number} Estimated distance
     */
    heuristic(a, b) {
        // Manhattan distance works well for grid-based movement
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    /**
     * Create a unique hash for a point
     * @param {Object} point - Point {x, y}
     * @returns {string} Unique string identifier
     */
    hashPoint(point) {
        return `${point.x},${point.y}`;
    }

    /**
     * Reconstruct the path from the came-from map
     * @param {Map} cameFrom - Map of point to previous point
     * @param {Object} current - Current end point
     * @returns {Array} Array of points representing the path
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
     * Get grid information for debugging
     * @returns {Object} Grid status
     */
    getStatus() {
        const walkableCount = this.countWalkableTiles();
        const obstacleCount = (this.width * this.height) - walkableCount;
        
        return {
            dimensions: `${this.width}x${this.height}`,
            walkableTiles: walkableCount,
            obstacles: obstacleCount,
            density: `${((obstacleCount / (this.width * this.height)) * 100).toFixed(1)}% obstacles`
        };
    }

    /**
     * Count walkable tiles
     * @returns {number} Number of walkable tiles
     */
    countWalkableTiles() {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 0) count++;
            }
        }
        return count;
    }

    /**
     * Get a visual representation of the grid for debugging
     * @returns {string} String representation of the grid
     */
    visualize() {
        let visual = '\n🗺️ Navigation Grid:\n';
        for (let y = 0; y < Math.min(this.height, 10); y++) { // Limit to 10 rows for console
            let row = '';
            for (let x = 0; x < Math.min(this.width, 20); x++) { // Limit to 20 cols for console
                row += this.grid[y][x] === 0 ? '.' : '#';
            }
            visual += row + '\n';
        }
        if (this.height > 10 || this.width > 20) {
            visual += '... (truncated for display)\n';
        }
        return visual;
    }
}
