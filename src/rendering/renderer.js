/**
 * REPAIRED: Complete Rendering System with a Functional Animation Engine
 *
 * This file handles all visual rendering and now includes a robust animation
 * system tailored to the provided character sprite sheet.
 *
 * FIX HIGHLIGHTS:
 * - Added a detailed 'animationData' map to define all character animations.
 * - Implemented stateful animation tracking for each character sprite.
 * - Created an 'updateAllCharacterAnimations' method to be called in the main game loop.
 * - Rewrote 'updateCharacterAnimation' and 'updateSpriteFrame' to use the new system.
 * - Preserved all existing functionality (preloading, map rendering, etc.).
 */

// DORMANT CONTROL FLAG - Set to true when ready to enable enhanced sprites
const USE_ENHANCED_SPRITES = true;

// NEW: Sprite sheet dimensions based on analysis.
// Sprites are 48px wide and 96px tall.
const SPRITE_WIDTH = 48;
const SPRITE_HEIGHT = 96;

// NEW: The Animation Data Map
// This is the "brain" that tells the renderer where to find each animation on the sprite sheet.
// It's based on your detailed breakdown.
// 'y' and 'x' are the top-left pixel coordinates for the start of an animation sequence.
const animationData = {
    'idle': {
        frames: 6,
        loop: true,
        frameSpeed: 0.15, // seconds per frame
        directions: {
            'up':    { y: 1 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'left':  { y: 1 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'right': { y: 1 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down':  { y: 1 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    'walk': {
        frames: 6,
        loop: true,
        frameSpeed: 0.1,
        directions: {
            'up':    { y: 3 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'left':  { y: 3 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'right': { y: 3 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down':  { y: 3 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    'sit': {
        frames: 6,
        loop: false, // Sits once and holds the last frame
        frameSpeed: 0.1,
        directions: {
            'right': { y: 5 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'left':  { y: 5 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH }
            // 'up' and 'down' are not available for this animation
        }
    },
    'phone': {
        frames: 12,
        loop: false,
        loopSection: { start: 3, end: 8 }, // Corresponds to frames 4-9
        frameSpeed: 0.12,
        directions: {
            'down': { y: 7 * SPRITE_HEIGHT, x: 0 }
        }
    },
    'book': {
        frames: 12,
        loop: true, // Replays the whole animation
        frameSpeed: 0.15,
        directions: {
            'down': { y: 8 * SPRITE_HEIGHT, x: 0 }
        }
    },
    'pickup': {
        frames: 12,
        loop: false,
        frameSpeed: 0.08,
        directions: {
            'right': { y: 10 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up':    { y: 10 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'left':  { y: 10 * SPRITE_HEIGHT, x: 24 * SPRITE_WIDTH },
            'down':  { y: 10 * SPRITE_HEIGHT, x: 36 * SPRITE_WIDTH }
        }
    },
    'give': {
        frames: 9,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 11 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up':    { y: 11 * SPRITE_HEIGHT, x: 9 * SPRITE_WIDTH },
            'left':  { y: 11 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH },
            'down':  { y: 11 * SPRITE_HEIGHT, x: 27 * SPRITE_WIDTH }
        }
    },
    'lift': {
        frames: 14,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 12 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up':    { y: 12 * SPRITE_HEIGHT, x: 14 * SPRITE_WIDTH },
            'left':  { y: 12 * SPRITE_HEIGHT, x: 28 * SPRITE_WIDTH },
            'down':  { y: 12 * SPRITE_HEIGHT, x: 42 * SPRITE_WIDTH }
        }
    },
    'throw': {
        frames: 14,
        loop: false,
        frameSpeed: 0.07,
        directions: {
            'right': { y: 13 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up':    { y: 13 * SPRITE_HEIGHT, x: 14 * SPRITE_WIDTH },
            'left':  { y: 13 * SPRITE_HEIGHT, x: 28 * SPRITE_WIDTH },
            'down':  { y: 13 * SPRITE_HEIGHT, x: 42 * SPRITE_WIDTH }
        }
    },
    'hit': {
        frames: 6,
        loop: false,
        frameSpeed: 0.1,
        directions: {
            'right': { y: 14 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up':    { y: 14 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left':  { y: 14 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down':  { y: 14 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    },
    'punch': {
        frames: 6,
        loop: false,
        frameSpeed: 0.08,
        directions: {
            'right': { y: 15 * SPRITE_HEIGHT, x: 0 * SPRITE_WIDTH },
            'up':    { y: 15 * SPRIGHT_HEIGHT, x: 6 * SPRITE_WIDTH },
            'left':  { y: 15 * SPRITE_HEIGHT, x: 12 * SPRITE_WIDTH },
            'down':  { y: 15 * SPRITE_HEIGHT, x: 18 * SPRITE_WIDTH }
        }
    }
};


export class Renderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.app = null;
        this.worldContainer = null;
        this.characterSprites = new Map(); // Map character IDs to sprites
        this.preloadedTextures = new Map();
        this.mapSprites = [];
        this.isInitialized = false;

        this.TILE_SIZE = 48;
        // CORRECTED: Use the global constants for character size
        this.CHARACTER_WIDTH = SPRITE_WIDTH;
        this.CHARACTER_HEIGHT = SPRITE_HEIGHT;

        this.BASE_WIDTH = 1280;
        this.BASE_HEIGHT = 720;
        this.WORLD_WIDTH = this.BASE_WIDTH;
        this.WORLD_HEIGHT = this.BASE_HEIGHT;

        if (USE_ENHANCED_SPRITES) {
            console.log('🎨 Enhanced Renderer with Animation Engine enabled');
        } else {
            console.log('🎨 Renderer constructor (enhanced sprites DORMANT)');
        }
    }

    // ... (preloadCharacterSprites, loadSpriteTexture, initialize, calculateCanvasSize, etc. remain the same) ...
    
    // =========================================================================
    // The code from your provided `renderer.js` file from line 125 to 528
    // (from `initialize` to the end of `renderMap`) goes here.
    // It is unchanged.
    // =========================================================================


    /**
     * ENHANCED: Render character sprite and initialize its animation state
     */
    async renderCharacter(character) {
        if (!this.isInitialized) {
            console.warn('❌ Cannot render character: renderer not initialized');
            return;
        }

        if (this.characterSprites.has(character.id)) {
            this.removeCharacter(character.id);
        }

        try {
            let sprite;
            const texture = await PIXI.Texture.fromURL(character.spriteSheet);
            
            if (!texture || !texture.valid) {
                 throw new Error('Texture failed to load or is invalid');
            }
            
            // The base texture is the entire sprite sheet image
            const baseTexture = texture.baseTexture;

            // Create a texture for the very first frame (idle, facing down)
            const initialFrameRect = new PIXI.Rectangle(
                animationData.idle.directions.down.x,
                animationData.idle.directions.down.y,
                SPRITE_WIDTH,
                SPRITE_HEIGHT
            );
            
            const frameTexture = new PIXI.Texture(baseTexture, initialFrameRect);
            sprite = new PIXI.Sprite(frameTexture);

            sprite.width = this.CHARACTER_WIDTH;
            sprite.height = this.CHARACTER_HEIGHT;
            sprite.anchor.set(0.5, 1.0);
            sprite.x = character.position?.x || 100;
            sprite.y = character.position?.y || 100;

            // NEW: Attach animation state to the sprite itself
            sprite.animationState = {
                name: 'idle',
                direction: 'down',
                frame: 0,
                timer: 0,
            };
            
            sprite.characterId = character.id;
            this.characterLayer.addChild(sprite);
            this.characterSprites.set(character.id, sprite);

            console.log(`✅ Character rendered: ${character.name}`);

        } catch (error) {
            console.error(`❌ Failed to render character ${character.name}:`, error);
            // Implement fallback if needed
        }
    }
    
    // ... (createSimpleCharacterSprite and updateCharacterPosition remain the same) ...

    /**
     * REWRITTEN: Called by external systems (like MovementSystem) to CHANGE the animation.
     * This function now only sets the desired state. The actual frame-by-frame
     * animation is handled by `updateAllCharacterAnimations`.
     */
    updateCharacterAnimation(characterId, actionState, facingDirection) {
        const sprite = this.characterSprites.get(characterId);
        if (!sprite) return;

        // Check if the requested animation exists
        if (!animationData[actionState]) {
            console.warn(`Animation '${actionState}' not found. Defaulting to 'idle'.`);
            actionState = 'idle';
        }

        // Check if the direction is valid for this animation
        let newDirection = facingDirection;
        if (!animationData[actionState].directions[newDirection]) {
            // If the direction isn't supported (e.g., 'up' for 'sit'), keep the old one or default.
            newDirection = sprite.animationState.direction || 'down';
            // If still not valid, pick the first available direction
            if (!animationData[actionState].directions[newDirection]) {
                 newDirection = Object.keys(animationData[actionState].directions)[0];
            }
        }
        
        const state = sprite.animationState;
        // Reset animation only if the action or direction has changed
        if (state.name !== actionState || state.direction !== newDirection) {
            state.name = actionState;
            state.direction = newDirection;
            state.frame = 0;
            state.timer = 0;
            // Immediately update to the first frame of the new animation
            this.updateSpriteVisualFrame(sprite); 
        }
    }

    /**
     * NEW: Main animation loop driver.
     * This method should be called once per frame from your main game loop.
     * @param {number} deltaTime - Time in seconds since the last frame.
     */
    updateAllCharacterAnimations(deltaTime) {
        if (!USE_ENHANCED_SPRITES) return;

        for (const sprite of this.characterSprites.values()) {
            const state = sprite.animationState;
            const anim = animationData[state.name];
            if (!anim) continue;

            state.timer += deltaTime;

            // Time to advance to the next frame?
            if (state.timer >= anim.frameSpeed) {
                state.timer -= anim.frameSpeed;
                
                let nextFrame = state.frame + 1;

                // Handle looping
                if (nextFrame >= anim.frames) {
                    if (anim.loop) {
                        // Standard loop
                        nextFrame = 0;
                    } else if (anim.loopSection) {
                        // Special loop (like phone use)
                        nextFrame = anim.loopSection.start;
                    } else {
                        // Non-looping animation, stay on last frame
                        nextFrame = anim.frames - 1;
                    }
                }
                
                if (state.frame !== nextFrame) {
                    state.frame = nextFrame;
                    this.updateSpriteVisualFrame(sprite);
                }
            }
        }
    }
    
    /**
     * REWRITTEN: Updates the sprite's texture to show the correct frame.
     * This is now a purely visual update based on the sprite's current animation state.
     */
    updateSpriteVisualFrame(sprite) {
        const state = sprite.animationState;
        const anim = animationData[state.name];
        if (!anim || !sprite.texture) return;

        let directionData = anim.directions[state.direction];
        
        // Fallback if direction doesn't exist for this animation (e.g., trying to 'sit' facing 'up')
        if (!directionData) {
            directionData = anim.directions[Object.keys(anim.directions)[0]]; // Use first available direction
        }

        if (!directionData) {
             console.warn(`Animation '${state.name}' has no direction data.`);
             return;
        }

        const sourceX = directionData.x + (state.frame * SPRITE_WIDTH);
        const sourceY = directionData.y;
        
        sprite.texture.frame = new PIXI.Rectangle(sourceX, sourceY, SPRITE_WIDTH, SPRITE_HEIGHT);
        sprite.texture.updateUvs();
    }
    
    // ... (removeCharacter, update, destroy, and other methods remain the same) ...
}
