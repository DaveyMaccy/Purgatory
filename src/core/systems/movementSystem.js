export class MovementSystem {
    moveCharacter(character, world, deltaTime) {
        if (character.path.length === 0) return;
        
        const speed = 100; // pixels per second
        const target = character.path[0];
        const dx = target.x - character.position.x;
        const dy = target.y - character.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If we're close to the point, snap to it and remove from path
        if (distance < 5) {
            character.position = { ...target };
            character.path.shift();
            return;
        }
        
        // Move towards the point
        const moveDistance = speed * deltaTime;
        const ratio = moveDistance / distance;
        
        character.position.x += dx * ratio;
        character.position.y += dy * ratio;
        
        // Ensure we stay within walkable areas
        if (!world.isPositionWalkable(character.position.x, character.position.y)) {
            // If we hit an obstacle, recalculate path
            character.path = world.findPath(
                character.position,
                character.path[character.path.length - 1]
            );
        }
    }
}
