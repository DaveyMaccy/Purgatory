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
            autoSaveInterval: 300000, // 5 minutes
            maxSaveSlots: 5
        };
        this.saveData = {
            characters: [],
            worldState: null,
            gameTime: 0,
            lastSaved: null
        };
    }
    
    /**
     * Initialize the Game State Manager
     */
    initialize() {
        console.log('🎮 Initializing Game State Manager...');
        
        this.loadSettings();
        this.setupAutoSave();
        this.setupStateTransitions();
        
        console.log('✅ Game State Manager initialized');
    }
    
    /**
     * Set the current game state
     */
    setState(newState, data = null) {
        if (newState === this.currentState) {
            return; // No change needed
        }
        
        const validStates = ['menu', 'loading', 'character-creation', 'playing', 'paused', 'error'];
        if (!validStates.includes(newState)) {
            console.warn(`⚠️ Invalid state: ${newState}`);
            return;
        }
        
        console.log(`🔄 State transition: ${this.currentState} → ${newState}`);
        
        // Store previous state
        this.previousState = this.currentState;
        
        // Add to history
        this.stateHistory.push({
            state: this.currentState,
            timestamp: Date.now(),
            data: data
        });
        
        // Trim history if too long
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift();
        }
        
        // Update current state
        this.currentState = newState;
        
        // Handle state-specific logic
        this.handleStateChange(newState, data);
        
        // Notify observers
        this.notifyObservers(newState, data);
    }
    
    /**
     * Get the current state
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * Go back to previous state
     */
    goToPreviousState() {
        if (this.previousState) {
            this.setState(this.previousState);
        }
    }
    
    /**
     * Handle state-specific logic
     */
    handleStateChange(newState, data) {
        switch (newState) {
            case 'menu':
                this.handleMenuState();
                break;
            case 'loading':
                this.handleLoadingState(data);
                break;
            case 'character-creation':
                this.handleCharacterCreationState();
                break;
            case 'playing':
                this.handlePlayingState(data);
                break;
            case 'paused':
                this.handlePausedState();
                break;
            case 'error':
                this.handleErrorState(data);
                break;
        }
    }
    
    /**
     * Handle menu state
     */
    handleMenuState() {
        // Clear game data when returning to menu
        if (this.previousState === 'playing' || this.previousState === 'paused') {
            this.clearGameData();
        }
    }
    
    /**
     * Handle loading state
     */
    handleLoadingState(data) {
        // Show loading UI if available
        if (window.uiManager) {
            window.uiManager.showLoadingState(true, data?.message || 'Loading...');
        }
    }
    
    /**
     * Handle character creation state
     */
    handleCharacterCreationState() {
        // Prepare for character creation
        this.clearGameData();
    }
    
    /**
     * Handle playing state
     */
    handlePlayingState(data) {
        // Hide loading UI
        if (window.uiManager) {
            window.uiManager.showLoadingState(false);
        }
        
        // Store game data
        if (data) {
            this.gameData = data;
        }
        
        // Start auto-save if enabled
        if (this.settings.autoSave) {
            this.startAutoSave();
        }
    }
    
    /**
     * Handle paused state
     */
    handlePausedState() {
        // Pause auto-save
        this.pauseAutoSave();
    }
    
    /**
     * Handle error state
     */
    handleErrorState(data) {
        console.error('🚨 Game entered error state:', data);
        
        // Show error message
        if (window.uiManager && data?.message) {
            window.uiManager.showError(data.message);
        }
        
        // Stop auto-save
        this.stopAutoSave();
    }
    
    /**
     * Add state observer
     */
    addObserver(callback) {
        this.observers.add(callback);
    }
    
    /**
     * Remove state observer
     */
    removeObserver(callback) {
        this.observers.delete(callback);
    }
    
    /**
     * Notify all observers of state change
     */
    notifyObservers(state, data) {
        this.observers.forEach(callback => {
            try {
                callback(state, data);
            } catch (error) {
                console.error('Error in state observer:', error);
            }
        });
    }
    
    /**
     * Save game data
     */
    async saveGame(slotName = 'quicksave') {
        try {
            const saveData = {
                version: '1.0',
                timestamp: Date.now(),
                state: this.currentState,
                settings: this.settings,
                gameData: this.gameData,
                characters: this.saveData.characters,
                worldState: this.saveData.worldState,
                gameTime: this.saveData.gameTime
            };
            
            // Save to localStorage
            const saveKey = `purgatory_save_${slotName}`;
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            
            // Update last saved timestamp
            this.saveData.lastSaved = Date.now();
            
            console.log(`💾 Game saved to slot: ${slotName}`);
            
            if (window.uiManager) {
                window.uiManager.showSuccess('Game saved successfully');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            
            if (window.uiManager) {
                window.uiManager.showError('Failed to save game');
            }
            
            return false;
        }
    }
    
    /**
     * Load game data
     */
    async loadGame(slotName = 'quicksave') {
        try {
            const saveKey = `purgatory_save_${slotName}`;
            const saveDataString = localStorage.getItem(saveKey);
            
            if (!saveDataString) {
                throw new Error('No save data found');
            }
            
            const saveData = JSON.parse(saveDataString);
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid save data');
            }
            
            // Load settings
            this.settings = { ...this.settings, ...saveData.settings };
            
            // Load game data
            this.gameData = saveData.gameData;
            this.saveData = {
                characters: saveData.characters,
                worldState: saveData.worldState,
                gameTime: saveData.gameTime,
                lastSaved: saveData.timestamp
            };
            
            console.log(`📁 Game loaded from slot: ${slotName}`);
            
            if (window.uiManager) {
                window.uiManager.showSuccess('Game loaded successfully');
            }
            
            // Transition to appropriate state
            this.setState(saveData.state, this.gameData);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            
            if (window.uiManager) {
                window.uiManager.showError('Failed to load game: ' + error.message);
            }
            
            return false;
        }
    }
    
    /**
     * Get available save slots
     */
    getSaveSlots() {
        const slots = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('purgatory_save_')) {
                const slotName = key.replace('purgatory_save_', '');
                try {
                    const saveData = JSON.parse(localStorage.getItem(key));
                    slots.push({
                        name: slotName,
                        timestamp: saveData.timestamp,
                        version: saveData.version,
                        gameTime: saveData.gameTime,
                        characters: saveData.characters?.length || 0
                    });
                } catch (error) {
                    console.warn(`Invalid save data in slot: ${slotName}`);
                }
            }
        }
        
        return slots.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * Delete save slot
     */
    deleteSave(slotName) {
        try {
            const saveKey = `purgatory_save_${slotName}`;
            localStorage.removeItem(saveKey);
            
            console.log(`🗑️ Save slot deleted: ${slotName}`);
            
            if (window.uiManager) {
                window.uiManager.showSuccess('Save deleted');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to delete save:', error);
            return false;
        }
    }
    
    /**
     * Validate save data structure
     */
    validateSaveData(saveData) {
        const requiredFields = ['version', 'timestamp', 'state'];
        return requiredFields.every(field => saveData.hasOwnProperty(field));
    }
    
    /**
     * Update game data
     */
    updateGameData(data) {
        this.gameData = { ...this.gameData, ...data };
    }
    
    /**
     * Clear game data
     */
    clearGameData() {
        this.gameData = null;
        this.saveData = {
            characters: [],
            worldState: null,
            gameTime: 0,
            lastSaved: null
        };
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const settingsString = localStorage.getItem('purgatory_settings');
            if (settingsString) {
                const savedSettings = JSON.parse(settingsString);
                this.settings = { ...this.settings, ...savedSettings };
                console.log('⚙️ Settings loaded');
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('purgatory_settings', JSON.stringify(this.settings));
            console.log('⚙️ Settings saved');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    /**
     * Update setting
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Notify observers of setting change
        this.notifyObservers('setting-changed', { key, value });
    }
    
    /**
     * Get setting value
     */
    getSetting(key) {
        return this.settings[key];
    }
    
    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        this.autoSaveTimer = null;
    }
    
    /**
     * Start auto-save timer
     */
    startAutoSave() {
        if (!this.settings.autoSave) return;
        
        this.stopAutoSave(); // Clear existing timer
        
        this.autoSaveTimer = setInterval(() => {
            if (this.currentState === 'playing') {
                this.saveGame('autosave');
            }
        }, this.settings.autoSaveInterval);
        
        console.log('🔄 Auto-save started');
    }
    
    /**
     * Pause auto-save timer
     */
    pauseAutoSave() {
        // Timer continues but doesn't save while paused
        console.log('⏸️ Auto-save paused');
    }
    
    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('⏹️ Auto-save stopped');
        }
    }
    
    /**
     * Setup state transition handlers
     */
    setupStateTransitions() {
        // Add UI Manager observer if available
        if (window.uiManager) {
            this.addObserver((state, data) => {
                window.uiManager.updateGameState(state);
            });
        }
    }
    
    /**
     * Export game data for debugging
     */
    exportGameData() {
        const exportData = {
            currentState: this.currentState,
            settings: this.settings,
            gameData: this.gameData,
            saveData: this.saveData,
            timestamp: Date.now()
        };
        
        const dataString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `purgatory_export_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📤 Game data exported');
    }
    
    /**
     * Get state statistics
     */
    getStateStats() {
        return {
            currentState: this.currentState,
            previousState: this.previousState,
            stateHistory: this.stateHistory.map(entry => ({
                state: entry.state,
                timestamp: entry.timestamp
            })),
            gameTime: this.saveData.gameTime,
            lastSaved: this.saveData.lastSaved,
            autoSaveEnabled: this.settings.autoSave
        };
    }
    
    /**
     * Cleanup Game State Manager
     */
    cleanup() {
        this.stopAutoSave();
        this.observers.clear();
        this.clearGameData();
        console.log('🗑️ Game State Manager cleaned up');
    }
}

export { GameStateManager };

console.log('🎮 Game State Manager Module loaded');
