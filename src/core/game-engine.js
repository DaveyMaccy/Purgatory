// ============================================
// FILE: src/core/game-engine.js
// ============================================
// REPLACEMENT - Fixes animation acceleration when tab is inactive.

/**
 * GameEngine Class - Central game coordination
 * * This class orchestrates all game systems including:
 * - Game loop management
 * - System updates (movement, AI, rendering)
 * - Time management
 * - State coordination
 * * FINAL FIX:
 * - Clamps deltaTime to prevent animation speed-up after tab inactivity.
 */

import { World } from './world/world.js';
import { MovementSystem } from './systems/movement-system.js';

export class GameEngine {
    constructor(characterManager, renderer, mapData) {
        this.characterManager = characterManager;
        this.renderer = renderer;
        this.mapData = mapData;
        
        this.world = new World(characterManager, mapData);
        // this.world.generateNavGrid(); // DELETED - This is now handled dynamically by updateActiveChunks

        this.movementSystem = new MovementSystem();
        
        this.isRunning = false;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.gameTime = 0;
        
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        
        this.gameLoop = this.gameLoop.bind(this);
        
        console.log('🎮 Game engine initialized');
    }
    
    start() {
        if (this.isRunning) {
            console.warn('⚠️ Game engine already running');
            return;
        }
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.fpsUpdateTime = this.lastFrameTime;
        
        console.log('🚀 Starting game engine...');
        requestAnimationFrame(this.gameLoop);
    }
    
    stop() {
        this.isRunning = false;
        console.log('🛑 Game engine stopped');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? '⏸️ Game paused' : '▶️ Game resumed');
        return this.isPaused;
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        let deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // --- NEW: Clamp deltaTime ---
        // Prevents massive spikes when the tab is inactive.
        // If more than 100ms (0.1s) has passed, treat it as if only 100ms passed.
        const MAX_DELTA_TIME = 100;
        if (deltaTime > MAX_DELTA_TIME) {
            deltaTime = MAX_DELTA_TIME;
        }
        // --- END FIX ---
        
        this.updateFPS(currentTime);
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        if (this.world) {
            this.world.update(deltaTime);
        }
        
        if (this.characterManager) {
            const characters = this.characterManager.characters;
            characters.forEach(character => {
                character.update(deltaTime);
            });
        }
        
        // Update character movement and rendering states
        if (this.movementSystem && this.characterManager && this.world) {
            const characters = this.characterManager.characters;
            
            for (const character of characters) {
                this.movementSystem.moveCharacter(character, this.world, deltaTime / 1000, this.world.TILE_SIZE);
                
                if (this.renderer) {
                    this.renderer.updateCharacterPosition(character.id, character.position.x, character.position.y);
                    this.renderer.syncCharacterDirection(character.id, character.facingDirection);
                }
            }
        }

        // Run the animation frame-by-frame updates
        if (this.renderer) {
            this.renderer.updateAllCharacterAnimations(deltaTime / 1000);
        }
    }
    
    render() {
        if (this.renderer) {
            this.renderer.update();
        }
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
            
            const fpsElement = document.getElementById('fps-counter');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${this.fps}`;
            }
        }
    }
    
    getGameState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            gameTime: this.gameTime,
            fps: this.fps,
            characterCount: this.characterManager?.characters.length || 0,
            worldSize: this.world ? `${this.world.width}x${this.world.height}` : 'N/A'
        };
    }
    
    handleEvent(eventType, eventData) {
        switch (eventType) {
            case 'character_click':
                this.handleCharacterClick(eventData.characterId);
                break;
            case 'world_click':
                this.handleWorldClick(eventData.x, eventData.y);
                break;
            case 'task_complete':
                this.handleTaskComplete(eventData.characterId, eventData.taskId);
                break;
            default:
                console.warn(`⚠️ Unknown event type: ${eventType}`);
        }
    }
    
    handleCharacterClick(characterId) {
        console.log(`👤 Character clicked: ${characterId}`);
        const character = this.characterManager.getCharacter(characterId);
        if (character) {
            console.log('Character info:', character.getStatus());
        }
    }
    
    handleWorldClick(x, y) {
        console.log(`🌍 World clicked at: (${x}, ${y})`);
    }
    
    handleTaskComplete(characterId, taskId) {
        console.log(`✅ Task completed: ${taskId} by character ${characterId}`);
        
        const character = this.characterManager.getCharacter(characterId);
        if (character && this.world && this.world.assignNewTaskToCharacter) {
            this.world.assignNewTaskToCharacter(character);
        }
    }

    /**
    * Handle character click events with popup interaction
    */
    onCharacterClick(character, clickPosition) {
        if (window.uiManager) window.uiManager.closeAllPopups();
        console.log(`🖱️ Character clicked in game engine: ${character.name}`);

        const player = this.characterManager.getPlayerCharacter();
        if (!player) return;

        // If clicking on player character, focus on them
        if (character.isPlayer) {
            if (window.setFocusTarget) {
                window.setFocusTarget(character.id);
            }
        } else {
            // Show NPC interaction popup
            this.showCharacterInteractionPopup(character, clickPosition, player);
        }
    }

   /**
    * Handle object click events
    */
    onObjectClick(clickedObject, clickPosition) {
        if (window.uiManager) window.uiManager.closeAllPopups();
        console.log(`🖱️ Object clicked: ${clickedObject.name} (${clickedObject.type})`);

        const player = this.characterManager.getPlayerCharacter();
        if (!player) return;

        const options = [];

        // 1. Add container-related options
        if (clickedObject.isContainer) {
            options.push({
                text: 'Search',
                action: () => this.showContainerItemPopup(clickedObject, clickPosition, player)
            });
        }

        // 2. Add special actions
        if (clickedObject.hasSpecialAction) {
            this.addSpecialActions(options, clickedObject, player);
        }

        // 3. Show the combined popup if any options were found
        if (options.length > 0) {
            window.uiManager.showPopup(clickedObject.name, options, clickPosition);
        }
    }
    
    /**
     * NEW HELPER: Opens the second-level menu showing container items.
     */
    showContainerItemPopup(container, position, player) {
        // Get real items from the world state manager, not a placeholder
        const items = this.world.worldStateManager.getItemsAtLocation(container.name);

        const onTakeItem = (item) => {
            this.takeItemFromContainer(player, container, item);
        };

        const onGiveItem = (item) => {
            this.giveItemToContainer(player, container, item);
        };

        if (window.uiManager) {
            window.uiManager.showSearchResultsPopup(container.name, items, position, onTakeItem, onGiveItem);
        }
    }
    /**
     * NEW HELPER: Populates an options array with special actions for an object.
     */
    addSpecialActions(options, obj, player) {
        if (obj.name.includes('desk')) {
            options.push({ text: 'Work on Task', action: () => this.workAtDesk(player, obj) });
            options.push({ text: 'Browse Web', action: () => this.browseWeb(player, obj) });
        }
        if (obj.name.includes('coffee')) {
            options.push({ text: 'Make Coffee', action: () => this.makeCoffee(player, obj) });
        }
        if (obj.name.includes('tv')) {
            options.push({ text: 'Watch TV', action: () => this.watchTV(player, obj) });
        }
        if (obj.name.includes('games_console')) {
            options.push({ text: 'Play Games', action: () => this.playGames(player, obj) });
        }
        if (obj.name.includes('bathroom_stall')) {
            options.push({ text: 'Use Bathroom', action: () => this.useBathroom(player, obj) });
        }
        if (obj.name.includes('whiteboard')) {
            options.push({ text: 'Use Whiteboard', action: () => this.useWhiteboard(player, obj) });
        }
    }

    /**
    * Show character interaction popup
    */
    showCharacterInteractionPopup(character, position, player) {
        const actions = {
            talk: () => {
                if (window.uiUpdater) {
                    window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Talks to ${character.name}`);
                }
                // TODO: Implement conversation system
            },
            giveItem: () => {
                this.showGiveItemMenu(character, player);
            },
            askForItem: () => {
                this.showAskForItemMenu(character, player);
            },
            askToUse: () => {
                if (window.uiUpdater) {
                    window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Asks ${character.name} to move`);
                }
                // TODO: Implement ask to use object system
            }
        };

        if (window.uiManager) {
            window.uiManager.showCharacterPopup(character.name, position, actions);
        }
    }

    /**
    * Show container interaction popup
    */
    showContainerInteractionPopup(container, position, player) {
        // Get container contents
        const items = this.getContainerContents(container);

        const onTakeItem = (item) => {
            this.takeItemFromContainer(player, container, item);
        };

        const onGiveItem = (item) => {
            this.giveItemToContainer(player, container, item);
        };

        if (window.uiManager) {
            window.uiManager.showContainerPopup(container.name, items, position, onTakeItem, onGiveItem);
        }
    }

    /**
    * Show object interaction popup
    */
    showObjectInteractionPopup(obj, position, player) {
        const options = [];

        // Add object-specific actions
        if (obj.name.includes('desk')) {
            options.push({
                text: 'Work on Task',
                action: () => this.workAtDesk(player, obj)
            });
            options.push({
                text: 'Browse Web',
                action: () => this.browseWeb(player, obj)
            });
        }

        if (obj.name.includes('coffee')) {
            options.push({
                text: 'Make Coffee',
                action: () => this.makeCoffee(player, obj)
            });
        }

        if (obj.name.includes('tv')) {
            options.push({
                text: 'Watch TV',
                action: () => this.watchTV(player, obj)
            });
        }

        if (obj.name.includes('games_console')) {
            options.push({
                text: 'Play Games',
                action: () => this.playGames(player, obj)
            });
        }

        if (obj.name.includes('bathroom_stall')) {
            options.push({
                text: 'Use Bathroom',
                action: () => this.useBathroom(player, obj)
            });
        }

        if (obj.name.includes('whiteboard')) {
            options.push({
                text: 'Use Whiteboard',
                action: () => this.useWhiteboard(player, obj)
            });
        }

        if (options.length > 0 && window.uiManager) {
            window.uiManager.showPopup(obj.name, options, position);
        }
    }


    /**
     * NEW: Queues a "take item" action.
     */
    takeItemFromContainer(player, container, item) {
        player.queuedAction = {
            type: 'TAKE_ITEM',
            target: container,
            payload: item
        };
        this.movePlayerToActionPoint(player, container.actionPoint);
    }

    /**
     * NEW: Queues a "give item" action.
     */
    giveItemToContainer(player, container, item) {
        player.queuedAction = {
            type: 'GIVE_ITEM',
            target: container,
            payload: item
        };
        this.movePlayerToActionPoint(player, container.actionPoint);
    }

    /**
     * NEW: Queues a "work at desk" action.
     */
    workAtDesk(player, desk) {
        player.queuedAction = {
            type: 'WORK_AT_DESK',
            target: desk
        };
        this.movePlayerToActionPoint(player, desk.actionPoint);
    }

    /**
     * NEW: Queues a "browse web" action.
     */
    browseWeb(player, desk) {
        player.queuedAction = {
            type: 'BROWSE_WEB',
            target: desk
        };
        this.movePlayerToActionPoint(player, desk.actionPoint);
    }

    /**
     * NEW: Queues a "make coffee" action.
     */
    makeCoffee(player, coffeeStation) {
        player.queuedAction = {
            type: 'MAKE_COFFEE',
            target: coffeeStation
        };
        this.movePlayerToActionPoint(player, coffeeStation.actionPoint);
    }

    /**
     * NEW: Queues a "watch TV" action.
     */
    watchTV(player, tv) {
        const actionPoint = tv.name.includes('break_room') ? this.findCouchActionPoint() : tv.actionPoint;
        player.queuedAction = {
            type: 'WATCH_TV',
            target: tv
        };
        this.movePlayerToActionPoint(player, actionPoint);
    }

    /**
     * NEW: Queues a "play games" action.
     */
    playGames(player, gamesConsole) {
        const actionPoint = this.findCouchActionPoint();
        player.queuedAction = {
            type: 'PLAY_GAMES',
            target: gamesConsole
        };
        this.movePlayerToActionPoint(player, actionPoint);
    }

    /**
     * NEW: Queues a "use bathroom" action.
     */
    useBathroom(player, bathroom) {
        player.queuedAction = {
            type: 'USE_BATHROOM',
            target: bathroom
        };
        this.movePlayerToActionPoint(player, bathroom.actionPoint);
    }

    /**
     * NEW: Queues a "use whiteboard" action.
     */
    useWhiteboard(player, whiteboard) {
        const actionPoint = {
            x: whiteboard.x + (whiteboard.width / 2),
            y: whiteboard.y + whiteboard.height + 20,
            facing: 'up'
        };
        player.queuedAction = {
            type: 'USE_WHITEBOARD',
            target: whiteboard
        };
        this.movePlayerToActionPoint(player, actionPoint);
    }

    /**
     * NEW: Main action executor, called by the movement system upon arrival.
     */
    executeAction(character, action) {
        const { type, target, payload } = action;
        const ui = window.uiUpdater;

        switch (type) {
            case 'TAKE_ITEM':
                this.world.worldStateManager.pickupItemFromLocation(character, target.name, payload.id, 1);
                break;

            case 'GIVE_ITEM':
                const itemId = typeof payload === 'object' ? payload.id : payload;
                this.world.worldStateManager.dropItemAtLocation(character, target.name, itemId, 1);
                break;

            case 'WORK_AT_DESK':
                if (character.assignedTask) {
                    const progressAmount = 0.2;
                    character.assignedTask.progress = Math.min(1.0, (character.assignedTask.progress || 0) + progressAmount);
                    if (ui) {
                        if (character.assignedTask.progress >= 1.0) {
                            character.completeCurrentTask();
                            ui.addChatMessage(`<strong>${character.name}:</strong> Completed task at desk!`);
                        } else {
                            ui.addChatMessage(`<strong>${character.name}:</strong> Worked on ${character.assignedTask.displayName}.`);
                        }
                        ui.updateUI(character);
                    }
                } else if (ui) {
                    ui.addChatMessage(`<strong>${character.name}:</strong> No task assigned to work on.`);
                }
                break;

            case 'BROWSE_WEB':
                character.needs.stress = Math.max(0, character.needs.stress - 20);
                if (ui) {
                    ui.addChatMessage(`<strong>${character.name}:</strong> Browses the web (stress reduced).`);
                    ui.updateUI(character);
                }
                break;

            case 'MAKE_COFFEE':
                const hasEmptyMug = character.inventory?.some(item => (typeof item === 'object' ? item.id : item) === 'coffee_mug_empty');
                if (hasEmptyMug) {
                    window.removeItemFromInventory(character, 'coffee_mug_empty', 1);
                    window.addItemToInventory(character, 'coffee_mug_full', 1);
                    if (ui) ui.addChatMessage(`<strong>${character.name}:</strong> Made fresh coffee!`);
                } else if (ui) {
                    ui.addChatMessage(`<strong>${character.name}:</strong> Needs an empty mug to make coffee.`);
                }
                if (ui) ui.updateUI(character);
                break;

            case 'WATCH_TV':
                character.needs.stress = Math.max(0, character.needs.stress - 30);
                if (ui) {
                    ui.addChatMessage(`<strong>${character.name}:</strong> Watches TV (stress reduced).`);
                    ui.updateUI(character);
                }
                break;

            case 'PLAY_GAMES':
                character.needs.stress = Math.max(0, character.needs.stress - 40);
                if (ui) {
                    ui.addChatMessage(`<strong>${character.name}:</strong> Plays games (stress greatly reduced).`);
                    ui.updateUI(character);
                }
                break;

            case 'USE_BATHROOM':
                character.needs.bladder = 100;
                if (ui) {
                    ui.addChatMessage(`<strong>${character.name}:</strong> Uses the bathroom.`);
                    ui.updateUI(character);
                }
                break;

            case 'USE_WHITEBOARD':
                 if (ui) ui.addChatMessage(`<strong>${character.name}:</strong> Uses the whiteboard for a presentation.`);
                 break;
        }
    }

    /**
    * Find couch action point for TV/games
    */
    findCouchActionPoint() {
        // TODO: Get actual couch position from map data
        return {
            x: 150, // Approximate couch position
            y: 670,
            facing: 'up' // Face toward TV
        };
    }

    /**
    * Move player to action point
    */
    movePlayerToActionPoint(player, actionPoint) {
        if (!actionPoint) return;

        // First, find the nearest walkable tile to the desired action point.
        // This prevents pathfinding from failing if the point is inside an object.
        const targetDestination = this.world.findNearestWalkablePosition({
            x: actionPoint.x,
            y: actionPoint.y
        });

        if (!targetDestination) {
            console.warn(`Could not find a walkable path to the action point for ${player.name}.`);
            return;
        }

        // Set player path to the validated, walkable destination
        const path = this.world.findPath(player.position, targetDestination);

        // A new path assignment cancels any previously queued action.
        if (player.queuedAction) {
            console.log(`Movement overrides queued action for ${player.name}. Action cancelled.`);
            player.queuedAction = null;
        }
        
        if (path && path.length > 0) {
            player.path = path;
            console.log(`🚶 Moving ${player.name} to action point near (${Math.round(actionPoint.x)}, ${Math.round(actionPoint.y)})`);
        } else {
            console.log(`❌ No valid path could be found for ${player.name}, even to the nearest walkable tile.`);
        }
    }

    /**
    * Show give item menu
    */
    showGiveItemMenu(targetCharacter, player) {
        if (!player.inventory || player.inventory.length === 0) {
            if (window.uiUpdater) {
                window.uiUpdater.addChatMessage(`<strong>System:</strong> You have no items to give.`);
            }
            return;
        }

        const options = player.inventory.map(invItem => {
            const itemId = typeof invItem === 'object' ? invItem.id : invItem;
            const item = window.getItemById ? window.getItemById(itemId) : { name: itemId };

            return {
                text: `Give ${item.name || itemId}`,
                action: () => {
                    // TODO: Implement item giving system
                    if (window.uiUpdater) {
                        window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Gives ${item.name || itemId} to ${targetCharacter.name}`);
                    }
                }
            };
        });

        if (window.uiManager) {
            window.uiManager.showPopup(`Give Item to ${targetCharacter.name}`, options);
        }
    }

    /**
    * Show ask for item menu
    */
    showAskForItemMenu(targetCharacter, player) {
        // TODO: Get target character's inventory
        const targetItems = targetCharacter.inventory || [];

        if (targetItems.length === 0) {
            if (window.uiUpdater) {
                window.uiUpdater.addChatMessage(`<strong>System:</strong> ${targetCharacter.name} has no items to give.`);
            }
            return;
        }

        const options = targetItems.map(invItem => {
            const itemId = typeof invItem === 'object' ? invItem.id : invItem;
            const item = window.getItemById ? window.getItemById(itemId) : { name: itemId };

            return {
                text: `Ask for ${item.name || itemId}`,
                action: () => {
                    // TODO: Implement item requesting system
                    if (window.uiUpdater) {
                        window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Asks ${targetCharacter.name} for ${item.name || itemId}`);
                    }
                }
            };
        });

        if (window.uiManager) {
            window.uiManager.showPopup(`Ask ${targetCharacter.name} for Item`, options);
        }
    }
    
    destroy() {
        this.stop();
        
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        this.characterManager = null;
        this.renderer = null;
        this.world = null;
        this.movementSystem = null;
        
        console.log('🧹 Game engine destroyed');
    }
}









