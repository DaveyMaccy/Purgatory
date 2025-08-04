import GameState from '/Purgatory/scripts/game/gamestate.js';
import OfficeCharacter from '/Purgatory/scripts/game/character.js';
import CanvasRenderer from '/Purgatory/scripts/graphics/canvasrenderer.js';
import ChatSystem from '/Purgatory/scripts/ui/chatsystem.js';
import DebugSystem from '/Purgatory/scripts/game/debugsystem.js';
import SaveSystem from '/Purgatory/scripts/game/savestate.js';
import AISystem from '/Purgatory/scripts/game/ai_system.js';
import PromptTracker from '/Purgatory/scripts/game/prompttracker.js';

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
            const response = await fetch('/Purgatory/assets/office-types.json');
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
