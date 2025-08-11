/**
 * Game Engine - Enhanced for Renderer Integration
 * This version is tightly coupled with the renderer for initialization and updates.
 */
export class GameEngine {
    /**
     * Constructor with explicit dependencies on core systems.
     * @param {CharacterManager} characterManager - The manager for all characters.
     * @param {Renderer} renderer - The PIXI.js-based rendering system.
     */
    constructor(characterManager, renderer) {
        this.characterManager = characterManager;
        this.renderer = renderer;
        this.isRunning = false;
        this.isInitialized = false; // Tracks initialization status
        this.gameLoop = null; // Holds the requestAnimationFrame ID
        this.lastTimestamp = 0;

        console.log('🎮 GameEngine created with enhanced renderer support');
    }

    /**
     * Initialize the game engine with enhanced renderer support.
     * This method now verifies the renderer is ready before proceeding.
     */
    async initialize() {
        console.log('🔧 Initializing Game Engine with enhanced renderer...');
        
        try {
            // Verify renderer is initialized (including sprite preloading)
            if (!this.renderer || !this.renderer.isInitialized) {
                throw new Error('Renderer must be initialized before GameEngine.initialize()');
            }
            
            // Check renderer status and log preloading results
            const rendererStatus = this.renderer.getStatus();
            console.log('🎨 Renderer status:', {
                isInitialized: rendererStatus.isInitialized,
                characterCount: rendererStatus.characterCount,
                preloadedTextures: rendererStatus.preloadedTextures,
                canvasSize: rendererStatus.canvasSize
            });
            
            // Initialize character positions in the world
            console.log('👥 Initializing character positions...');
            // This assumes the renderer's world dimensions are available for positioning
            this.characterManager.initializeCharacterPositions(this.renderer.getWorldBounds());
            
            // Render all characters using the enhanced sprite system
            console.log('🎨 Rendering characters with enhanced sprites...');
            const characters = this.characterManager.getCharacters();
            
            for (const character of characters) {
                try {
                    await this.renderer.renderCharacter(character);
                    console.log(`✅ Rendered character: ${character.name}`);
                } catch (error) {
                    console.error(`❌ Failed to render character ${character.name}:`, error);
                    // Continue with other characters even if one fails
                }
            }
            
            console.log(`✅ Game Engine initialized successfully with ${characters.length} characters`);
            
            // Mark as ready to start
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Game Engine:', error);
            throw error; // Propagate error to main.js for user feedback
        }
    }

    /**
     * Starts the game loop using requestAnimationFrame for smooth rendering.
     */
    start() {
        if (this.isRunning) {
            console.warn('⚠️ Game loop already running.');
            return;
        }
        if (!this.isInitialized) {
            console.error('❌ Cannot start GameEngine: not initialized.');
            return;
        }

        this.isRunning = true;
        this.lastTimestamp = performance.now();
        
        // Bind the loop function to ensure `this` context is correct
        const gameLoop = (timestamp) => {
            if (!this.isRunning) return;
            
            const deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;
            
            this.update(deltaTime);
            
            this.gameLoop = requestAnimationFrame(gameLoop);
        };
        
        this.gameLoop = requestAnimationFrame(gameLoop);
        console.log('▶️ Game loop started with requestAnimationFrame.');
    }

    /**
     * Enhanced game loop with better error handling and renderer integration.
     * @param {number} deltaTime - The time elapsed since the last frame in milliseconds.
     */
    update(deltaTime) {
        if (!this.isRunning || !this.renderer?.isInitialized) {
            return;
        }
        
        try {
            // Update game logic (e.g., character needs, AI)
            this.characterManager.update(deltaTime);

            // Update character positions in the renderer
            const characters = this.characterManager.getCharacters();
            characters.forEach(character => {
                if (character.position) {
                    this.renderer.updateCharacterPosition(
                        character.id, 
                        character.position.x, 
                        character.position.y
                    );
                }
            });
            
            // Update the renderer (triggers PIXI rendering)
            this.renderer.update();
            
        } catch (error) {
            console.error('❌ Error in enhanced game loop:', error);
            // Decide if the game should stop on error. For now, we continue.
            // this.stop(); 
        }
    }

    /**
     * Stops the game loop and cleans up resources.
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }

        // The renderer is destroyed in main.js during cleanup
        console.log('⛔ Game loop stopped.');
    }

    /**
     * Get comprehensive game status for debugging.
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isInitialized: this.isInitialized,
            characterCount: this.characterManager ? this.characterManager.getCharacters().length : 0,
            rendererInitialized: this.renderer ? this.renderer.isInitialized : false,
        };
    }
}
