/**
 * Game State Manager Module
 * 
 * Manages the overall game state, transitions, and persistence.
 * Handles save/load functionality and state coordination.
 */

class GameStateManager {
    constructor() {
        this.currentState = 'menu';
        this.previousState = null;
        this.stateHistory = [];
        this.maxHistorySize = 10;
        this.observers = new Set();
        this.gameData = null;
        this.settings = {
            simulationSpeed: 1.0,
            volume: 0.8,
            showDebugInfo: false,
            autoSave: true,
            autoSaveInterval:
