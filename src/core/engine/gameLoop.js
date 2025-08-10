/**
 * Game Loop - Core update cycle and time management
 */
export class GameLoop {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 1000 / 60; // Target 60 FPS
        this.running = false;
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.running = false;
    }

    /**
     * Main update loop
     * @param {number} currentTime - Current timestamp
     */
    update(currentTime) {
        if (!this.running) return;

        // Calculate delta time
        const delta = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += delta;

        // Process fixed updates
        while (this.accumulator >= this.deltaTime) {
            this.fixedUpdate(this.deltaTime);
            this.accumulator -= this.deltaTime;
        }

        // Process variable update
        this.variableUpdate(delta);

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Fixed update (physics, AI, etc.)
     * @param {number} delta - Fixed delta time
     */
    fixedUpdate(delta) {
        this.gameEngine.update(delta);
    }

    /**
     * Variable update (input, animations, etc.)
     * @param {number} delta - Variable delta time
     */
    variableUpdate(delta) {
        this.gameEngine.variableUpdate(delta);
        
        // Update UI at variable rate
        if (this.gameEngine.uiUpdater) {
            this.gameEngine.uiUpdater.updateAllCharactersUI();
        }
    }

    /**
     * Render the game
     */
    render() {
        this.gameEngine.render();
    }
}
