/**
 * IMPORTANT FILE STRUCTURE NOTE:
 * 
 * This project runs on GitHub Pages at /Purgatory/ path
 * All file references must work both locally and on GitHub
 * 
 * File layout:
 * - scripts/main.js (this file)
 * - scripts/game/ (game logic)
 * - scripts/graphics/ (rendering)
 * - scripts/ui/ (UI components)
 * - assets/ (data files)
 * - styles/ (CSS)
 * 
 * When running locally, use relative paths (./ and ../)
 * GitHub Pages serves from /Purgatory/ so absolute paths work there
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
        this.elements = this.queryDOMElements();
        
        if (!this.validateDOMElements()) {
            console.error('[DEBUG] validateDOMElements failed');
            return;
        }

        await this.loadOfficeData();
        this.setupEventListeners();
        this.renderBackground();
        console.log('[Main] Game initialized successfully.');
    }

    async loadOfficeData() {
        try {
            const response = await fetch('../assets/office-types.json');
            const data = await response.json();
            GameState.OFFICE_TYPES = data;
            console.log('[Main] Office types loaded successfully.');
        } catch (error) {
            console.error('[Main] Failed to load office-types.json', error);
            alert('Failed to load critical game data. Please check the console.');
        }
    }

    // ... [rest of the existing Game class implementation]
}
