/**
 * OFFICE PURGATORY SIMULATOR - FILE STRUCTURE NOTE:
 * 
 * GitHub Pages Deployment:
 * - Project runs at /Purgatory/ path on GitHub Pages
 * - Absolute paths work on GitHub (/Purgatory/path)
 * - Relative paths work locally (./path or ../path)
 * 
 * Local Development File Layout:
 * - scripts/main.js (this file)
 * - scripts/game/ (core game logic)
 * - scripts/graphics/ (rendering system)
 * - scripts/ui/ (interface components)
 * - assets/ (data files)
 * - styles/ (CSS files)
 * 
 * Path Handling:
 * - All imports use relative paths (./)
 * - Asset loading uses relative paths (../assets/)
 * - GitHub Pages requires absolute paths (/Purgatory/)
 */

import GameState from './game/gamestate.js';
import OfficeCharacter from './game/character.js';
import CanvasRenderer from './graphics/canvasrenderer.js';
import ChatSystem from './ui/chatsystem.js';
import DebugSystem from './game/debugsystem.js';
import SaveSystem from './game/savestate.js';
import AISystem from './game/ai_system.js';
import PromptTracker from './game/prompttracker.js';

export class Game {
    constructor() {
        this.elements = {};
        this.gameState = new GameState();
        this.debugSystem = new DebugSystem(this.gameState);
        this.chatSystem = new ChatSystem(this.gameState, this.debugSystem, OfficeCharacter);
        this.saveSystem = new SaveSystem(this.gameState, this.chatSystem, OfficeCharacter);
        this.aiSystem = new AISystem(this.gameState, this.chatSystem);
        this.promptTracker = new PromptTracker(this.gameState);
        this.canvasRenderer = null;
        this.characterCount = 0;
        this.eventListeners = [];

        // Bind all methods to ensure proper 'this' context
        this.addCharacter = this.addCharacter.bind(this);
        this.startSimulation = this.startSimulation.bind(this);
        this.backToMenu = this.backToMenu.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.toggleGameMenu = this.toggleGameMenu.bind(this);
        this.sendChatMessage = this.sendChatMessage.bind(this);
    }

    async initialize() {
        console.log('[Main] Initializing game...');
        try {
            this.elements = this.queryDOMElements();
            
            if (!this.validateDOMElements()) {
                console.error('[DEBUG] validateDOMElements failed');
                return;
            }

            await this.loadOfficeData();
            
            // Initialize background renderer with proper timing
            await new Promise(resolve => setTimeout(resolve, 100)); // Ensure DOM is ready
            
            try {
                const canvas = document.getElementById('game-canvas');
                if (!canvas) {
                    throw new Error('Canvas element not found');
                }
                
                // Verify canvas is properly sized
                canvas.width = canvas.parentElement.clientWidth || 800;
                canvas.height = canvas.parentElement.clientHeight || 600;
                
                this.canvasRenderer = new CanvasRenderer(this.gameState, this.debugSystem);
                
                // Verify textures loaded
                await this.canvasRenderer.preloadAssets();
                console.log('[Main] Background renderer initialized successfully');
            } catch (error) {
                console.error('[Main] Background initialization failed:', error);
                // Silent fallback to CSS background
                document.body.classList.add('fallback-bg');
            }

            this.setupCoreButtons();
            console.log('[Main] Game initialized successfully.');
        } catch (error) {
            console.error('[Main] Initialization failed:', error);
            alert('Game initialization failed. Please check console for details.');
        }
    }

    setupCoreButtons() {
        console.log('[Main] Setting up all buttons...');
        
        // Preserve working start menu buttons
        this.elements.newGameBtn.addEventListener('click', () => {
            console.log('[UI] New Game clicked');
            this.startNewGame();
        });

        this.elements.loadGameBtn.addEventListener('click', () => {
            console.log('[UI] Load Game clicked');
            this.loadGame();
        });

        this.elements.optionsBtn.addEventListener('click', () => {
            console.log('[UI] Options clicked');
            this.showOptions();
        });

        // Restore other buttons
        if (this.elements.addCharacterBtn) {
            this.elements.addCharacterBtn.addEventListener('click', () => {
                console.log('[UI] Add Character clicked');
                this.addCharacter();
            });
        }

        if (this.elements.startSimulationBtn) {
            this.elements.startSimulationBtn.addEventListener('click', () => {
                console.log('[UI] Start Simulation clicked');
                this.startSimulation();
            });
        }

        if (this.elements.backToMenuBtn) {
            this.elements.backToMenuBtn.addEventListener('click', () => {
                console.log('[UI] Back to Menu clicked');
                this.backToMenu();
            });
        }

        if (this.elements.saveSettingsBtn) {
            this.elements.saveSettingsBtn.addEventListener('click', () => {
                console.log('[UI] Save Settings clicked');
                this.saveSettings();
            });
        }

        if (this.elements.gameMenuBtn) {
            this.elements.gameMenuBtn.addEventListener('click', () => {
                console.log('[UI] Game Menu clicked');
                this.toggleGameMenu();
            });
        }

        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', () => {
                console.log('[UI] Send clicked');
                this.sendChatMessage();
            });
        }

        console.log('[Main] All buttons setup complete');
    }

    startNewGame() {
        console.log('[Game] Starting new game');
        // Hide start menu, show character creation
        this.elements.startMenu.classList.add('hidden');
        this.elements.characterCreation.classList.remove('hidden');
    }

    loadGame() {
        console.log('[Game] Loading game');
        // Trigger file input click
        this.elements.fileInput.click();
        this.elements.fileInput.onchange = (e) => this.handleFileLoad(e);
    }

    showOptions() {
        console.log('[UI] Showing options');
        // Hide start menu, show options
        this.elements.startMenu.classList.add('hidden');
        this.elements.optionsMenu.classList.remove('hidden');
    }

    addCharacter() {
        console.log('[Game] Adding character');
        // Create new character and add to game state
        const char = new OfficeCharacter(`Employee ${++this.characterCount}`);
        this.gameState.addCharacter(char);
    }

    startSimulation() {
        console.log('[Game] Starting simulation');
        // Hide character creation, show game
        this.elements.characterCreation.classList.add('hidden');
        this.elements.gameContainer.classList.remove('hidden');
        this.gameState.startSimulation();
    }

    backToMenu() {
        console.log('[UI] Returning to main menu');
        // Hide options, show start menu
        this.elements.optionsMenu.classList.add('hidden');
        this.elements.startMenu.classList.remove('hidden');
    }

    saveSettings() {
        console.log('[UI] Saving settings');
        // Save current settings
        this.gameState.saveSettings();
    }

    toggleGameMenu() {
        console.log('[UI] Toggling game menu');
        // Toggle game menu visibility
        this.elements.gameMenu.classList.toggle('hidden');
    }

    sendChatMessage() {
        console.log('[Chat] Sending message');
        const message = this.elements.chatInput.value;
        if (message) {
            this.chatSystem.sendMessage(message);
            this.elements.chatInput.value = '';
        }
    }

    async loadOfficeData() {
        const pathsToTry = [
            './assets/office-types.json',
            '../assets/office-types.json',
            '/Purgatory/assets/office-types.json'
        ];
        
        for (const path of pathsToTry) {
            try {
                console.log('[Path] Attempting to load from:', path);
                const response = await fetch(path);
                if (!response.ok) continue;
                
                const data = await response.json();
                GameState.OFFICE_TYPES = data;
                console.log('[Main] Office types loaded successfully from:', path);
                return;
            } catch (error) {
                console.warn('[Path] Failed to load from', path, error);
            }
        }
        throw new Error('Could not load office-types.json from any known path');
    }

    queryDOMElements() {
        return {
            // Main menu elements
            startMenu: document.getElementById('start-menu'),
            newGameBtn: document.getElementById('new-game-btn'),
            loadGameBtn: document.getElementById('load-game-btn'),
            optionsBtn: document.getElementById('options-btn'),
            fileInput: document.getElementById('file-input'),
            
            // Other screens
            characterCreation: document.getElementById('character-creation'),
            optionsMenu: document.getElementById('options-menu'),
            gameContainer: document.getElementById('game-container'),
            
            // Character creation
            addCharacterBtn: document.getElementById('add-character-btn'),
            startSimulationBtn: document.getElementById('start-simulation-btn'),
            
            // Options screen
            backToMenuBtn: document.getElementById('back-to-menu-btn'),
            saveSettingsBtn: document.getElementById('save-settings-btn')
        };
    }

    validateDOMElements() {
        const elements = this.elements;
        const requiredElements = [
            'startMenu', 'newGameBtn', 'loadGameBtn', 'optionsBtn',
            'characterCreation', 'optionsMenu', 'fileInput'
        ];
        
        for (const element of requiredElements) {
            if (!elements[element]) {
                console.error(`[DOM] Missing required element: ${element}`);
                return false;
            }
        }
        return true;
    }

    // ... [rest of the existing Game class implementation]
}
