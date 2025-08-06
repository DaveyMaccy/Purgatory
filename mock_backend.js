// This file simulates the game's backend for the test harness.

// This list defines all the available pre-made character sprite sheets.
// The front-end will use this list to populate the character selector.
const PREMADE_CHARACTER_SPRITES = [
    'assets/characters/Premade_Character_48x48_1.png',
    'assets/characters/Premade_Character_48x48_2.png',
    'assets/characters/Premade_Character_48x48_3.png',
    // BILO_PLACEHOLDER: Add the rest of your 20 character file paths here.
    // Make sure the file names exactly match the files in your assets/characters folder.
];

const gameState = {
    characters: [
        {
            id: 'char_player',
            name: 'Player',
            isPlayer: true,
            position: { x: 450, y: 350 },
            actionState: 'idle_down',
            // The default character sprite. This will be updated by the selector.
            spriteSheet: PREMADE_CHARACTER_SPRITES[0],
            pixiSprite: null
        }
    ],
    map: {
        // This tells the front-end which Tiled map file to load.
        json: 'assets/maps/purgatorygamemap.json'
    }
};

const backend = {
    /**
     * Called when the player clicks on the map.
     * Sets a target destination for the character to move towards.
     */
    findPathFor: (character, targetPos) => {
        console.log(`Mock Backend: Setting target destination for ${character.name} to x:${targetPos.x}, y:${targetPos.y}`);
        character.targetPosition = targetPos;
    },

    /**
     * This function is called on every frame by the front-end's game loop.
     * It contains the simplified logic for moving the character.
     */
    update: (deltaTime) => {
        for (const character of gameState.characters) {
            if (character.targetPosition) {
                const speed = 2.5; // Movement speed in pixels per frame
                const dx = character.targetPosition.x - character.position.x;
                const dy = character.targetPosition.y - character.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < speed) {
                    character.position.x = character.targetPosition.x;
                    character.position.y = character.targetPosition.y;
                    delete character.targetPosition;

                    // Set idle state based on last direction
                    if (character.actionState.startsWith('walk_')) {
                        character.actionState = character.actionState.replace('walk_', 'idle_');
                    }
                } else {
                    character.position.x += (dx / dist) * speed;
                    character.position.y += (dy / dist) * speed;

                    // Determine animation based on direction
                    if (Math.abs(dx) > Math.abs(dy)) {
                        character.actionState = dx > 0 ? 'walk_right' : 'walk_left';
                    } else {
                        character.actionState = dy > 0 ? 'walk_down' : 'walk_up';
                    }
                }
            }
        }
    }
};
