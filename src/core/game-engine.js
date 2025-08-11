/**
 * Game Engine - Corrected Update
 * This version applies the specified changes while preserving other essential methods.
 */
import { World } from './world/world.js';

export class GameEngine {
    /**
     * CONSTRUCTOR REPLACED AS PER INSTRUCTIONS
     * @param {CharacterManager} characterManager - The manager for all characters.
     * @param {Renderer} renderer - The PIXI.js-based rendering system.
     */
    constructor(characterManager, renderer) {
        this.characterManager = characterManager;
        this.renderer = renderer;
        this.isRunning = false;
        this.isInitialized = false; // This line was added as instructed
        this.gameLoop = null;
        this.lastTimestamp = 0; // For requestAnimationFrame delta time
        this.world = null; // Will be initialized later
        this.uiUpdater = null; // Note: UIUpdater is managed in main.js
        console.log('🎮 GameEngine created with enhanced renderer support');
    }

    /**
     * INITIALIZE METHOD REPLACED AS PER INSTRUCTIONS
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
            // Create a simple world object for context, though renderer now handles map data
            this.world = new World(this.characterManager, this.renderer.mapData);
            this.world.generateNavGrid();
            this.characterManager.initializeCharacterPositions(this.world);
            
            // Render all characters using the enhanced sprite system
            console.log('🎨 Rendering characters with enhanced sprites...');
            const characters = this.characterManager.getCharacters();
            
            for (const character of characters) {
                try {
                    await this.renderer.renderCharacter(character);
                    console.log(`✅ Rendered character: ${character.name}`);
                } catch (error) {
                    console.error(`❌ Failed to render character ${character.name}:`, error);
                }
            }
            
            console.log(`✅ Game Engine initialized successfully with ${characters.length} characters`);
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Game Engine:', error);
            throw error;
        }
    }

    /**
     * New start method to work with the updated main.js and use requestAnimationFrame
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        const gameLoop = (timestamp) => {
            if (!this.isRunning) return;
            const deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;
            this.update(deltaTime);
            this.gameLoop = requestAnimationFrame(gameLoop);
        };
        this.gameLoop = requestAnimationFrame(gameLoop);
        console.log('▶️ Game loop started.');
    }

    /**
     * UPDATE METHOD REPLACED AS PER INSTRUCTIONS
     */
    update(deltaTime) {
        if (!this.isRunning || !this.renderer?.isInitialized) {
            return;
        }
        
        try {
            // Update character logic (needs, etc.)
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
        }
    }

    // --- PRESERVED METHODS FROM ORIGINAL FILE ---

    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        console.log('⛔ Game stopped.');
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            isInitialized: this.isInitialized,
            gameTime: this.gameTime,
            characterCount: this.characterManager ? this.characterManager.getCharacters().length : 0,
            rendererInitialized: this.renderer ? this.renderer.isInitialized : false,
            hasWorld: !!this.world,
        };
    }

    getCharacterPositions() {
        if (!this.characterManager) return [];
        return this.characterManager.characters.map(char => ({
            id: char.id,
            name: char.name,
            position: char.position,
            isPlayer: char.isPlayer
        }));
    }

    forceUIUpdate() {
        if (this.uiUpdater && this.characterManager) {
            const playerCharacter = this.characterManager.getPlayerCharacter();
            if (playerCharacter) {
                this.uiUpdater.updateUI(playerCharacter);
                console.log('🔄 Forced UI update completed');
            }
        }
    }
}
