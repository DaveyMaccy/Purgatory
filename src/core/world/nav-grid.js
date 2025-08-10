/**
 * NavGrid class - Handles pathfinding and navigation grid operations
 * Complete A* pathfinding implementation for Stage 4
 * 
 * FIXES APPLIED:
 * - Enhanced input validation with better debugging
 * - Automatic nearby position finding for blocked positions
 * - Rounded coordinates to handle floating point issues
 * - Better error messages and logging
 * - Diagonal movement corner-cutting prevention
 * - Comprehensive A* algorithm implementation
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
        console.log(`🗺️ NavGrid initialized: ${width}×${height}`);
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
        // Enhanced input validation with better debugging
        if (!start || !end) {
            console.warn('🚫 Invalid pathfinding request: missing start or end position', { start, end });
            return [];
        }

        if (typeof start.x !== 'number' || typeof start.y !== 'number' ||
            typeof end.x !== 'number' || typeof end.y !== 'number') {
            console.warn('🚫 Invalid pathfinding request: non-numeric coordinates', { start, end });
            return [];
        }

        // Round coordinates to handle floating point issues
        const startPos = { x: Math.round(start.x), y: Math.round(start.y) };
        const endPos = { x: Math.round(end.x), y: Math.round(end.y) };

        // Check bounds
        if (startPos.x < 0 || startPos.x >= this.width || startPos.y < 0 || startPos.y >= this.height ||
            endPos.x < 0 || endPos.x >= this.width || endPos.y < 0 || endPos.y >= this.height) {
            console.warn('🚫 Pathfinding coordinates out of bounds:', { 
                start: startPos, 
                end: endPos, 
                gridSize: { width: this.width, height: this.height }
            });
            return [];
        }

        // Check if start position is walkable
        if (!this.isWalkable(startPos.x, startPos.y)) {
            console.warn('🚫 Start position is not walkable:', startPos);
            
            // Try to find a nearby walkable position for start
            const nearbyStart = this.findNearbyWalkable(startPos);
            if (nearbyStart) {
                console.log('🔧 Using nearby walkable start position:', nearbyStart);
                startPos.x = nearbyStart.x;
                startPos.y = nearbyStart.y;
            } else {
                return [];
            }
        }

        // Check if end position is walkable
        if (!this.isWalkable(endPos.x, endPos.y)) {
            console.warn('🚫 End position is not walkable:', endPos);
            
            // Try to find a nearby walkable position for end
            const nearbyEnd = this.findNearbyWalkable(endPos);
            if (nearbyEnd) {
                console.log('🔧 Using nearby walkable end position:', nearbyEnd);
                endPos.x = nearbyEnd.x;
                endPos.y = nearbyEnd.y;
            } else {
                return [];
            }
        }

        // If start and end are the same, return empty path
        if (startPos.x === endPos.x && startPos.y === endPos.y) {
            return [];
        }

        console.log(`🗺️ A* pathfinding: (${startPos.x},${startPos.y}) → (${endPos.x},${endPos.y})`);

        // A* Algorithm Implementation
        const openSet = [startPos];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        const startKey = this.hashPoint(startPos);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startPos, endPos));
        
        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                const currentKey = this.hashPoint(openSet[i]);
                const bestKey = this.hashPoint(current);
                if ((fScore.get(currentKey) || Infinity) < (fScore.get(bestKey) || Infinity)) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            // Remove current from openSet
            openSet.splice(currentIndex, 1);
            
            // Check if we reached the goal
            if (current.x === endPos.x && current.y === endPos.y) {
                const path = this.reconstructPath(cameFrom, current);
                console.log(`✅ Path found: ${path.length} waypoints`);
                return path;
            }
            
            // Add current to closedSet
            closedSet.add(this.hashPoint(current));
            
            // Check all neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = this.hashPoint(neighbor);
                
                if (closedSet.has(neighborKey)) {
                    continue;
                }
                
                // Calculate tentative gScore
                const currentKey = this.hashPoint(current);
                const tentativeGScore = (gScore.get(currentKey) || 0) + this.getDistance(current, neighbor);
                
                // Check if this path to neighbor is better
                if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }
                
                // This path is the best until now
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, endPos));
            }
        }
        
        // No path found
        console.warn('🚫 No path found between:', startPos, 'and', endPos);
        return [];
    }

    /**
     * Find a nearby walkable position
     * @param {Object} position - Position to search around {x, y}
     * @param {number} maxRadius - Maximum search radius (default: 3)
     * @returns {Object|null} Nearby walkable position or null
     */
    findNearbyWalkable(position, maxRadius = 3) {
        // Try positions in expanding squares around the target
        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    // Only check the perimeter of the current radius
                    if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
                        continue;
                    }
                    
                    const testX = position.x + dx;
                    const testY = position.y + dy;
                    
                    if (this.isWalkable(testX, testY)) {
                        return { x: testX, y: testY };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Get distance between two points (for movement cost calculation)
     * @param {Object} a - Point A {x, y}
     * @param {Object} b - Point B {x, y}
     * @returns {number} Distance
     */
    getDistance(a, b) {
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        
        // Diagonal movement costs more
        if (dx === 1 && dy === 1) {
            return 1.4; // sqrt(2) ≈ 1.414
        }
        return 1; // Cardinal movement
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
            dimensions: `${this.width}×${this.height}`,
            walkableTiles: walkableCount,
            obstacles: obstacleCount,
            density: `${((obstacleCount / (this.width * this.height)) * 100).toFixed(1)}% obstacles`,
            totalTiles: this.width * this.height
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
        visual += '\nLegend: . = walkable, # = obstacle\n';
        return visual;
    }

    /**
     * Test pathfinding between two specific points (for debugging)
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate  
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @returns {Array} Path result
     */
    testPath(startX, startY, endX, endY) {
        console.log(`🧪 Testing path from (${startX}, ${startY}) to (${endX}, ${endY})`);
        
        const start = { x: startX, y: startY };
        const end = { x: endX, y: endY };
        
        const startWalkable = this.isWalkable(startX, startY);
        const endWalkable = this.isWalkable(endX, endY);
        
        console.log(`   Start walkable: ${startWalkable}, End walkable: ${endWalkable}`);
        
        if (!startWalkable || !endWalkable) {
            console.warn('   Cannot test: one or both positions not walkable');
            return [];
        }
        
        const path = this.findPath(start, end);
        console.log(`   Result: ${path.length} waypoints`);
        
        if (path.length > 0) {
            console.log('   Path waypoints:', path);
        }
        
        return path;
    }
}
