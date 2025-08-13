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

    findPath(start, end) {
        // Simple implementation of A* pathfinding
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
                return this.reconstructPath(cameFrom, current);
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
        return [];
    }

    getNeighbors(point) {
        const neighbors = [];
        const { x, y } = point;

        // Cardinal directions (Up, Down, Left, Right)
        const cardinalDirs = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];

        for (const dir of cardinalDirs) {
            if (this.isWalkable(x + dir.dx, y + dir.dy)) {
                neighbors.push({ x: x + dir.dx, y: y + dir.dy });
            }
        }

        // Diagonal directions
        const diagonalDirs = [
            { dx: 1, dy: -1 }, { dx: 1, dy: 1 },
            { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
        ];

        for (const dir of diagonalDirs) {
            const diagX = x + dir.dx;
            const diagY = y + dir.dy;

            // Check if the diagonal tile itself is walkable
            if (this.isWalkable(diagX, diagY)) {
                // CRITICAL FIX: Prevent cutting corners.
                // To move diagonally, both adjacent cardinal tiles must also be walkable.
                if (this.isWalkable(x + dir.dx, y) && this.isWalkable(x, y + dir.dy)) {
                    neighbors.push({ x: diagX, y: diagY });
                }
            }
        }
        return neighbors;
    }

    heuristic(a, b) {
        // Manhattan distance
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    hashPoint(point) {
        return `${point.x},${point.y}`;
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentPoint = current;
        
        while (cameFrom.has(this.hashPoint(currentPoint))) {
            currentPoint = cameFrom.get(this.hashPoint(currentPoint));
            path.unshift(currentPoint);
        }
        
        return path;
    }
}

