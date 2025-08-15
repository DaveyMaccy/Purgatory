/**
 * REPAIRED: Complete Rendering System with a Functional Animation Engine
 *
 * DO NOT EDIT WITHOUT EXPRESS PERMISSION!
 *
 * FINAL AUDIT COMPLETE:
 * - Rebuilt the animationData map from scratch based on corrected row numbers.
 * - All animations are now correctly mapped to the sprite sheet.
 */

const USE_ENHANCED_SPRITES = true;
const SPRITE_WIDTH = 48;
const SPRITE_HEIGHT = 96;

// animationData map rebuilt based on the final, corrected user notes.
const animationData = {
    'idle': {
        frames: 6,
        loop: true,
        frameSpeed: 0.15,
        directions: {
            'right': { y: 1 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 1 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 1 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down': { y: 1 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    'walking': {
        frames: 6,
        loop: true,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 2 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 2 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 2 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down': { y: 2 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    // --- NEW SLEEP ANIMATION ---
    'sleep': {
        frames: 4, // Uses frames 1-4
        loop: true,
        frameSpeed: 0.85, // Slow loop for ~3.4 second cycle
        directions: {
            // Row 3, starts at frame 1 (x: 0)
            'up': { y: 3 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH }
        }
    },
    'sit': {
        frames: 6,
        loop: true, 
        frameSpeed: 0.1,
        directions: {
            'right': { y: 4 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 2 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 5 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'down': { y: 2 * SPRITE_HEIGHT, x: 20 * SPRITE_WIDTH }
        }
    },
    'phone': {
        frames: 12,
        loop: false,
        loopSection: { start: 3, end: 8 },
        frameSpeed: 0.12,
        directions: {
            'down': { y: 6 * SPRITE_HEIGHT, x: 0 }
        }
    },
    'book': {
        frames: 12,
        loop: true,
        frameSpeed: 0.15,
        directions: {
            'down': { y: 7 * SPRITE_HEIGHT, x: 0 }
        }
    },
    'pickup': {
        frames: 12,
        loop: false,
        frameSpeed: 0.08,
        directions: {
            'right': { y: 9 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 9 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'left': { y: 9 * SPRITE_HEIGHT, x: 24 * SPRITE_WIDTH },
            'down': { y: 9 * SPRITE_HEIGHT, x: 36 * SPRITE_WIDTH }
        }
    },
    'give': {
        frames: 9,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 10 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 10 * SPRITE_HEIGHT, x: 9 * SPRITE_WIDTH },
            'left': { y: 10 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH },
            'down': { y: 10 * SPRITE_HEIGHT, x: 27 * SPRITE_WIDTH }
        }
    },
    'lift': {
        frames: 14,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 11 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 11 * SPRITE_HEIGHT, x: 14 * SPRITE_WIDTH },
            'left': { y: 11 * SPRITE_HEIGHT, x: 28 * SPRITE_WIDTH },
            'down': { y: 11 * SPRITE_HEIGHT, x: 42 * SPRITE_WIDTH }
        }
    },
    'throw': {
        frames: 14,
        loop: false,
        frameSpeed: 0.07,
        directions: {
            'right': { y: 12 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 12 * SPRITE_HEIGHT, x: 14 * SPRITE_WIDTH },
            'left': { y: 12 * SPRITE_HEIGHT, x: 28 * SPRITE_WIDTH },
            'down': { y: 12 * SPRITE_HEIGHT, x: 42 * SPRITE_WIDTH }
        }
    },
    'hit': {
        frames: 6,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 13 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 13 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 13 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down': { y: 13 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    'punch': {
        frames: 6,
        loop: false,
        frameSpeed: 0.08,
        directions: {
            'right': { y: 14 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up': { y: 14 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left': { y: 14 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down': { y: 14 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    }
};

// --- Chair and Sitting Logic Data ---
const chairTiles = new Map([
    // Break Room
    ['10,12', { direction: 'west', offset: { x: 0, y: 12 } }],
    ['3,13',  { direction: 'east' }],   
    ['3,14',  { direction: 'east' }],   
    ['3,15',  { direction: 'up' }],     
    // Unmarked Chairs
    ['3,6',   { direction: 'east' }],
    ['6,6',   { direction: 'west' }],
    // Main Office & Reception
    ['-7,8',  { direction: 'up' }],     
    ['-2,8',  { direction: 'up' }],      
    ['-6,-5', { direction: 'up' }],    
    ['-2,-3', { direction: 'up' }],      
    ['-7,5',  { direction: 'east' }],   
    ['10,-3', { direction: 'west' }],   
    ['3,-4',  { direction: 'down' }],   
    // Meeting Room
    ['15,8',  { direction: 'up' }],
    ['16,8',  { direction: 'up' }],
    ['18,7',  { direction: 'west' }],
    ['16,5',  { direction: 'down', offset: { x: 0, y: 12 } }],
    ['15,5',  { direction: 'down', offset: { x: 0, y: 12 } }] 
]);

// --- NEW DESK ASSIGNMENT SYSTEM ---
// Maps a character's ID to their assigned desk tile coordinate ("x,y").
// For this animation, desk tiles and chair tiles are the same.
const deskAssignments = new Map([
    // Assigns the character with ID 'player' to the desk/chair at tile -2,8.
    ['player', '-2,8'], 
    // Assigns character 'char_02' to the desk/chair at tile -7,8.
    ['char_02', '-7,8'],
    // Assigns character 'char_05' to the desk/chair at tile -6,-5.
    ['char_05', '-6,-5']
]);
// --- End Logic Data ---

export class Renderer {
    // ... (constructor and other methods remain unchanged) ...

    updateAllCharacterAnimations(deltaTime) {
        if (!USE_ENHANCED_SPRITES) return;

        const occupiedTiles = new Set();

        for (const sprite of this.characterSprites.values()) {
            const state = sprite.animationState;
            const tileX = Math.floor(sprite.x / this.TILE_SIZE);
            const tileY = Math.floor(sprite.y / this.TILE_SIZE);
            const tileKey = `${tileX},${tileY}`;
            occupiedTiles.add(tileKey);

            // --- Door Logic ---
            const navGrid = window.gameEngine.world.navGridInstance;
            if (navGrid) {
                const isHorizontalGap = !navGrid.isWalkable(tileX - 1, tileY) && !navGrid.isWalkable(tileX + 1, tileY);
                const isVerticalGap = !navGrid.isWalkable(tileX, tileY - 1) && !navGrid.isWalkable(tileX, tileY + 1);

                if (isHorizontalGap || isVerticalGap) {
                    const doorSprite = this.findTileSpriteAt('Tile Layer 4', tileX, tileY);
                    if (doorSprite && !this.activeDoors.has(tileKey)) {
                        this.activeDoors.set(tileKey, { sprite: doorSprite, originalRotation: doorSprite.rotation });
                        doorSprite.rotation -= Math.PI / 2; // 90 degrees counter-clockwise
                    }
                }
            }
            
            // --- MODIFIED ANIMATION LOGIC ---
            const character = window.characterManager.getCharacter(sprite.characterId);
            const assignedDeskTile = deskAssignments.get(sprite.characterId);
            const chairData = chairTiles.get(tileKey);

            // 1. SLEEPING LOGIC (Highest Priority)
            // Checks if a character exists, their energy is low, they have an assigned desk, AND they are on that desk tile.
            if (character && character.energy < 25 && assignedDeskTile && tileKey === assignedDeskTile) {
                state.name = 'sleep';
                state.direction = 'up'; // All desks face north
                sprite.pivot.set(0, 0); // Ensure no pivot offset from sitting
            }
            // 2. SITTING LOGIC (Runs if not sleeping)
            else if (chairData) {
                state.name = 'sit';
                if (chairData.direction === 'east') {
                    state.direction = 'right';
                } else if (chairData.direction === 'west') {
                    state.direction = 'left';
                } else {
                    state.direction = chairData.direction;
                }
                if (chairData.offset) {
                    sprite.pivot.set(-chairData.offset.x, -chairData.offset.y);
                } else {
                    sprite.pivot.set(0, 0);
                }
            } 
            // 3. DEFAULT LOGIC (Runs if not sleeping or sitting)
            else {
                if (state.name === 'sit' || state.name === 'sleep') {
                    if (character && character.path && character.path.length > 0) {
                        state.name = 'walking';
                    } else {
                        state.name = 'idle';
                    }
                }
                sprite.pivot.set(0, 0);
            }
            
            const anim = animationData[state.name];
            if (!anim) continue;
            state.timer += deltaTime;
            if (state.timer >= anim.frameSpeed) {
                state.timer -= anim.frameSpeed;
                let nextFrame = state.frame + 1;
                if (nextFrame >= anim.frames) {
                    if (anim.loop) nextFrame = 0;
                    else if (anim.loopSection) nextFrame = anim.loopSection.start;
                    else nextFrame = anim.frames - 1;
                }
                if (state.frame !== nextFrame) {
                    state.frame = nextFrame;
                    this.updateSpriteVisualFrame(sprite);
                }
            }
        }

        // --- Reset Doors Logic ---
        for (const [tileKey, door] of this.activeDoors.entries()) {
            if (!occupiedTiles.has(tileKey)) {
                door.sprite.rotation = door.originalRotation;
                this.activeDoors.delete(tileKey);
            }
        }
    }
    
    // ... (rest of the Renderer class remains unchanged) ...
}
