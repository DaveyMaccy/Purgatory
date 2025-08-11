/**
 * NavGrid - A* pathfinding implementation
 * PHASE 4 FIXED: Complete implementation as specified in the fix document
 */
export class NavGrid {
    constructor(width, height, grid) {
        this.width = width;
        this.height = height;
        this.grid = grid;
    }
    
    /**
     * Mark a tile as obstacle
     */
    markObstacle(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = 1;
        }
    }
    
    /**
     * A* pathfinding implementation
     */
    findPath(start, end) {
        // Simple A* implementation
        const openSet = [start];
        const closedSet = [];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        gScore.set(`${start.x},${start.y}`, 0);
        fScore.set(`${start.x},${start.y}`, this.heuristic(start, end));
        
        while (openSet.length > 0) {
            // Get node with lowest fScore
            let current = openSet.reduce((lowest, node) => {
                const currentF = fScore.get(`${node.x},${node.y}`) || Infinity;
                const lowestF = fScore.get(`${lowest.x},${lowest.y}`) || Infinity;
                return currentF < lowestF ? node : lowest;
            });
            
            if (current.x === end.x && current.y === end.y) {
                // Reconstruct path
                const path = [];
                while (current) {
                    path.unshift(current);
                    current = cameFrom.get(`${current.x},${current.y}`);
                }
                return path;
            }
            
            openSet.splice(openSet.indexOf(current), 1);
            closedSet.push(current);
            
            // Check neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    continue;
                }
                
                if (this.grid[neighbor.y][neighbor.x] === 1) {
                    continue; // Obstacle
                }
                
                const tentativeG = (gScore.get(`${current.x},${current.y}`) || 0) + 1;
                
                if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }
                
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + this.heuristic(neighbor, end));
            }
        }
        
        return []; // No path found
    }
    
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }  // Left
        ];
        
        for (const dir of directions) {
            const x = node.x + dir.x;
            const y = node.y + dir.y;
            
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                neighbors.push({ x, y });
            }
        }
        
        return neighbors;
    }
    
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
}
