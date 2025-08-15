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
                this.movementSystem.moveCharacter(character, this.world, deltaTime / 1000);
                
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
        console.log(`🖱️ Object clicked: ${clickedObject.name} (${clickedObject.type})`);

        const player = this.characterManager.getPlayerCharacter();
        if (!player) return;

        // Show appropriate popup based on object type
        if (clickedObject.isContainer) {
            this.showContainerInteractionPopup(clickedObject, clickPosition, player);
        } else if (clickedObject.hasSpecialAction) {
            this.showObjectInteractionPopup(clickedObject, clickPosition, player);
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
    * Get container contents
    */
    getContainerContents(container) {
        // TODO: Implement proper container system
        // For now, return some example items based on container type
        const exampleItems = {
            'desk': [
                { id: 'pen', name: 'Pen' },
                { id: 'documents', name: 'Documents' }
            ],
            'storage': [
                { id: 'office_supplies', name: 'Office Supplies' }
            ],
            'food_and_drink': [
                { id: 'energy_bar', name: 'Energy Bar' },
                { id: 'coffee_mug_empty', name: 'Empty Coffee Mug' }
            ]
        };

        return exampleItems[container.type] || [];
    }

    /**
    * Take item from container
    */
    takeItemFromContainer(player, container, item) {
        // Move player to container if needed
        if (container.actionPoint) {
            this.movePlayerToActionPoint(player, container.actionPoint);
        }

        // Add item to inventory
        if (window.addItemToInventory) {
            const success = window.addItemToInventory(player, item.id, 1);
            if (success && window.uiUpdater) {
                window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Took ${item.name} from ${container.name}`);
                window.uiUpdater.updateUI(player);
            }
        }
    }

    /**
    * Give item to container
    */
    giveItemToContainer(player, container, item) {
        // Move player to container if needed
        if (container.actionPoint) {
            this.movePlayerToActionPoint(player, container.actionPoint);
        }

        // Remove item from inventory
        if (window.removeItemFromInventory) {
            const itemId = typeof item === 'object' ? item.id : item;
            const success = window.removeItemFromInventory(player, itemId, 1);
            if (success && window.uiUpdater) {
                const itemObj = window.getItemById ? window.getItemById(itemId) : { name: itemId };
                window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Put ${itemObj.name} in ${container.name}`);
                window.uiUpdater.updateUI(player);
            }
        }
    }

    /**
    * Work at desk
    */
    workAtDesk(player, desk) {
        this.movePlayerToActionPoint(player, desk.actionPoint);

        if (player.assignedTask) {
            // Progress task
            const progressAmount = 0.2;
            if (!player.assignedTask.progress) {
                player.assignedTask.progress = 0;
            }
            player.assignedTask.progress = Math.min(1.0,
                player.assignedTask.progress + progressAmount);

            if (window.uiUpdater) {
                if (player.assignedTask.progress >= 1.0) {
                    player.completeCurrentTask();
                    window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Completed task at desk! New task assigned.`);
                } else {
                    window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Working on ${player.assignedTask.displayName} - ${Math.round(player.assignedTask.progress * 100)}% complete`);
                }
                window.uiUpdater.updateUI(player);
            }
        } else {
            if (window.uiUpdater) {
                window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> No task assigned to work on.`);
            }
        }
    }

    /**
    * Browse web at desk
    */
    browseWeb(player, desk) {
        this.movePlayerToActionPoint(player, desk.actionPoint);

        // Reduce stress but don't count as task work
        player.needs.stress = Math.max(0, player.needs.stress - 20);

        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Browses the web (stress reduced)`);
            window.uiUpdater.updateUI(player);
        }
    }

    /**
    * Make coffee
    */
    makeCoffee(player, coffeeStation) {
        this.movePlayerToActionPoint(player, coffeeStation.actionPoint);

        // Check if player has empty mug
        const hasEmptyMug = player.inventory?.some(item => {
            const itemId = typeof item === 'object' ? item.id : item;
            return itemId === 'coffee_mug_empty';
        });

        if (hasEmptyMug) {
            // Replace empty mug with full mug
            if (window.removeItemFromInventory && window.addItemToInventory) {
                window.removeItemFromInventory(player, 'coffee_mug_empty', 1);
                window.addItemToInventory(player, 'coffee_mug_full', 1);

                if (window.uiUpdater) {
                    window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Made fresh coffee!`);
                    window.uiUpdater.updateUI(player);
                }
            }
        } else {
            // Give them a full coffee mug
            if (window.addItemToInventory) {
                window.addItemToInventory(player, 'coffee_mug_full', 1);

                if (window.uiUpdater) {
                    window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Made coffee and took a mug!`);
                    window.uiUpdater.updateUI(player);
                }
            }
        }
    }

    /**
    * Watch TV
    */
    watchTV(player, tv) {
        // Move to couch if available, otherwise stand in front of TV
        const actionPoint = tv.name.includes('break_room') ?
            this.findCouchActionPoint() : tv.actionPoint;

        this.movePlayerToActionPoint(player, actionPoint);

        // Reduce stress
        player.needs.stress = Math.max(0, player.needs.stress - 30);

        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Watches TV (stress reduced)`);
            window.uiUpdater.updateUI(player);
        }
    }

    /**
    * Play games
    */
    playGames(player, gamesConsole) {
        // Move to couch facing TV
        const actionPoint = this.findCouchActionPoint();
        this.movePlayerToActionPoint(player, actionPoint);

        // Reduce stress significantly
        player.needs.stress = Math.max(0, player.needs.stress - 40);

        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Plays games (stress greatly reduced)`);
            window.uiUpdater.updateUI(player);
        }
    }

    /**
    * Use bathroom
    */
    useBathroom(player, bathroom) {
        this.movePlayerToActionPoint(player, bathroom.actionPoint);

        // Restore bladder need
        player.needs.bladder = 100;

        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Uses the bathroom`);
            window.uiUpdater.updateUI(player);
        }
    }

    /**
    * Use whiteboard
    */
    useWhiteboard(player, whiteboard) {
        // Stand at action point facing the meeting room table
        const actionPoint = {
            x: whiteboard.x + (whiteboard.width / 2),
            y: whiteboard.y + whiteboard.height + 20,
            facing: 'up'
        };

        this.movePlayerToActionPoint(player, actionPoint);

        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${player.name}:</strong> Uses the whiteboard for presentation`);
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

        // Set player path to action point
        const path = this.world.findPath(player.position, {
            x: actionPoint.x,
            y: action.y
        });

        if (path && path.length > 0) {
            player.path = path;
            console.log(`🚶 Moving ${player.name} to action point`);
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



