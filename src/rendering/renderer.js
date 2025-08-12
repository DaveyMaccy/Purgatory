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
 * - CORRECTED all typos in the 'punch' animation definition.
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
            'up':    { y: 15 * SPRITE_HEIGHT, x: 6 * SPRITE_WIDTH },
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

    async preloadCharacterSprites() {
        if (!USE_ENHANCED_SPRITES) {
            console.log('💤 Sprite preloading DORMANT - skipping');
            return 0;
        }

        console.log('🔄 Preloading character sprite textures...');
        
        const spritePromises = [];
        
        for (let i = 1; i <= 25; i++) {
            const paddedNumber = i.toString().padStart(2, '0');
            const spritePath = `assets/characters/character-${paddedNumber}.png`;
            
            const promise = this.loadSpriteTexture(spritePath).catch(error => {
                console.warn(`⚠️ Failed to preload sprite: ${spritePath}`, error);
                return null;
            });
            
            spritePromises.push(promise);
        }
        
        const results = await Promise.allSettled(spritePromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        console.log(`✅ Preloaded ${successCount}/25 character sprites`);
        return successCount;
    }

    async loadSpriteTexture(spritePath) {
        if (!USE_ENHANCED_SPRITES) {
            throw new Error('Enhanced sprites are dormant');
        }

        if (this.preloadedTextures.has(spritePath)) {
            return this.preloadedTextures.get(spritePath);
