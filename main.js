/**
 * Handle left-clicks on the game world for character movement
 */
function handleWorldClick(event) {
    if (!gameEngine || !movementSystem || !characterManager) {
        console.warn('🚫 Game systems not ready');
        return;
    }

    // Get click coordinates relative to the canvas
    const rect = event.currentTarget.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    console.log('🖱️ World clicked at canvas coords:', { x: canvasX, y: canvasY });

    // Get the focused character (player character)
    const focusCharacter = characterManager.getCharacter(focusTargetId);
    if (!focusCharacter) {
        console.warn('🚫 No focus character selected for movement');
        return;
    }

    // Get world bounds from the game engine
    const worldBounds = gameEngine.world.getWorldBounds();
    const canvasWidth = 800;  // From renderer setup
    const canvasHeight = 450; // From renderer setup
    
    // Convert canvas coordinates to world coordinates
    // Scale canvas coordinates to world coordinate space
    const worldX = (canvasX / canvasWidth) * worldBounds.width;
    const worldY = (canvasY / canvasHeight) * worldBounds.height;
    
    const targetPosition = { 
        x: Math.max(worldBounds.tileSize, Math.min(worldBounds.width - worldBounds.tileSize, worldX)),
        y: Math.max(worldBounds.tileSize, Math.min(worldBounds.height - worldBounds.tileSize, worldY))
    };

    console.log(`🎯 Converted to world coordinates: (${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)})`);
    console.log(`📊 World bounds: ${worldBounds.width}x${worldBounds.height}, Canvas: ${canvasWidth}x${canvasHeight}`);

    // Move the character to the clicked position
    const success = movementSystem.moveCharacterTo(focusCharacter, targetPosition, gameEngine.world);
    
    if (success) {
        console.log(`✅ ${focusCharacter.name} moving to:`, targetPosition);
    } else {
        console.warn(`🚫 Could not move ${focusCharacter.name} to:`, targetPosition);
        
        // Try nearby positions with proper world coordinate scaling
        const tileSize = worldBounds.tileSize;
        const nearbyPositions = [
            { x: targetPosition.x + tileSize, y: targetPosition.y },
            { x: targetPosition.x - tileSize, y: targetPosition.y },
            { x: targetPosition.x, y: targetPosition.y + tileSize },
            { x: targetPosition.x, y: targetPosition.y - tileSize },
            { x: targetPosition.x + tileSize/2, y: targetPosition.y + tileSize/2 },
            { x: targetPosition.x - tileSize/2, y: targetPosition.y - tileSize/2 }
        ];
        
        for (const nearbyPos of nearbyPositions) {
            // Ensure nearby position is within world bounds
            if (nearbyPos.x >= tileSize && nearbyPos.x <= worldBounds.width - tileSize && 
                nearbyPos.y >= tileSize && nearbyPos.y <= worldBounds.height - tileSize) {
                
                const nearbySuccess = movementSystem.moveCharacterTo(focusCharacter, nearbyPos, gameEngine.world);
                if (nearbySuccess) {
                    console.log(`✅ Found alternative position for ${focusCharacter.name}:`, nearbyPos);
                    return;
                }
            }
        }
        
        console.log('🚫 No valid nearby position found for movement');
    }
}

/**
 * DEBUG: Enhanced movement testing function with proper coordinates
 */
window.testMovement = function(canvasX, canvasY) {
    if (!focusTargetId || !characterManager || !movementSystem || !gameEngine) {
        console.warn('🚫 Game not ready for movement test');
        return;
    }
    
    const character = characterManager.getCharacter(focusTargetId);
    if (!character) {
        console.warn('🚫 No character found for movement test');
        return;
    }
    
    // Convert canvas coordinates to world coordinates
    const worldBounds = gameEngine.world.getWorldBounds();
    const canvasWidth = 800;
    const canvasHeight = 450;
    
    const worldX = (canvasX / canvasWidth) * worldBounds.width;
    const worldY = (canvasY / canvasHeight) * worldBounds.height;
    
    const targetPosition = { x: worldX, y: worldY };
    
    console.log(`🧪 Test movement: ${character.name}`);
    console.log(`   From: (${character.position.x.toFixed(1)}, ${character.position.y.toFixed(1)})`);
    console.log(`   Canvas click: (${canvasX}, ${canvasY})`);
    console.log(`   World target: (${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);
    console.log(`   World bounds: ${worldBounds.width}x${worldBounds.height}`);
    
    // Test if target position is walkable
    const isWalkable = gameEngine.world.isPositionWalkable(worldX, worldY);
    console.log(`   Target walkable: ${isWalkable}`);
    
    // Test grid conversion
    const gridPos = gameEngine.world.worldToGrid(worldX, worldY);
    console.log(`   Grid position: (${gridPos.x}, ${gridPos.y})`);
    console.log(`   Grid bounds: ${worldBounds.tileWidth}x${worldBounds.tileHeight}`);
    
    movementSystem.moveCharacterTo(character, targetPosition, gameEngine.world);
};

/**
 * DEBUG: Test specific world coordinates directly
 */
window.testWorldMovement = function(worldX, worldY) {
    if (!focusTargetId || !characterManager || !movementSystem || !gameEngine) {
        console.warn('🚫 Game not ready for movement test');
        return;
    }
    
    const character = characterManager.getCharacter(focusTargetId);
    if (!character) {
        console.warn('🚫 No character found for movement test');
        return;
    }
    
    const targetPosition = { x: worldX, y: worldY };
    
    console.log(`🧪 Direct world movement test: ${character.name}`);
    console.log(`   From: (${character.position.x.toFixed(1)}, ${character.position.y.toFixed(1)})`);
    console.log(`   To: (${worldX}, ${worldY})`);
    
    // Test grid conversion
    const startGrid = gameEngine.world.worldToGrid(character.position.x, character.position.y);
    const endGrid = gameEngine.world.worldToGrid(worldX, worldY);
    console.log(`   Start grid: (${startGrid.x}, ${startGrid.y})`);
    console.log(`   End grid: (${endGrid.x}, ${endGrid.y})`);
    
    // Test walkability
    const startWalkable = gameEngine.world.navGrid.isWalkable(startGrid.x, startGrid.y);
    const endWalkable = gameEngine.world.navGrid.isWalkable(endGrid.x, endGrid.y);
    console.log(`   Start walkable: ${startWalkable}, End walkable: ${endWalkable}`);
    
    movementSystem.moveCharacterTo(character, targetPosition, gameEngine.world);
};
