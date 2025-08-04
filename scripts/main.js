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
            
            // Initialize background renderer
            try {
                this.canvasRenderer = new CanvasRenderer(this.gameState, this.debugSystem);
                if (!this.canvasRenderer.canvas) {
                    throw new Error('Canvas element not found');
                }
                console.log('[Main] Background renderer initialized');
            } catch (error) {
                console.error('[Main] Failed to initialize background:', error);
                alert('Background initialization failed. Using fallback styles.');
            }

            this.setupCoreButtons();
            console.log('[Main] Game initialized successfully.');
        } catch (error) {
            console.error('[Main] Initialization failed:', error);
            alert('Game initialization failed. Please check console for details.');
        }
    }

    setupCoreButtons() {
        console.log('[Main] Setting up core buttons...');
        
        // New Game Button
        this.elements.newGameBtn.addEventListener('click', () => {
            console.log('[UI] New Game clicked');
            this.startNewGame();
        });

        // Load Game Button
        this.elements.loadGameBtn.addEventListener('click', () => {
            console.log('[UI] Load Game clicked');
            this.loadGame();
        });

        // Options Button
        this.elements.optionsBtn.addEventListener('click', () => {
            console.log('[UI] Options clicked');
            this.showOptions();
        });

        console.log('[Main] Core buttons setup complete');
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
