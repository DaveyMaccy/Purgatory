/**
 * UI Contract - Validation rules for game UI elements
 * 
 * CRITICAL: This ONLY validates GAME UI elements, never character creator
 * Character creator elements are explicitly excluded from all validation
 */

export class UIContract {
    /**
     * Game UI elements that must exist (from index.html doc 8)
     * EXCLUDES all character creator elements
     */
    static REQUIRED_GAME_ELEMENTS = [
        'main-game-ui',           // Main game container
        'character-name',         // Character name display
        'character-role',         // Character role display
        'energy-value',           // Energy percentage text
        'energy-bar',             // Energy progress bar
        'hunger-value',           // Hunger percentage text
        'hunger-bar',             // Hunger progress bar
        'social-value',           // Social percentage text
        'social-bar',             // Social progress bar
        'stress-value',           // Stress percentage text
        'stress-bar',             // Stress progress bar
        'player-portrait-canvas', // Character portrait canvas
        'inventory-list',         // Inventory item list
        'task-content',           // Task information area
        'relationships-list',     // Relationships display
        'chat-log',               // Chat messages area
        'world-canvas-container', // Game world canvas
        'clock-display'           // Game clock
    ];

    /**
     * Character creator elements that must NEVER be touched
     * These are completely off-limits to defensive UI
     */
    static PROTECTED_CREATOR_ELEMENTS = [
        'creator-modal-backdrop',
        'creator-modal-content',
        'character-tabs',
        'character-panels',
        'start-simulation-button',
        'randomize-btn',
        'start-screen-backdrop'
    ];

    /**
     * Tab system elements (part of game UI)
     */
    static TAB_ELEMENTS = [
        'inventory',              // Inventory tab content
        'tasks',                  // Tasks tab content
        'relationships'           // Relationships tab content
    ];

    /**
     * Validate that character creator is not interfered with
     * @returns {boolean} True if character creator is safe
     */
    static validateCreatorProtection() {
        for (const elementId of this.PROTECTED_CREATOR_ELEMENTS) {
            const element = document.getElementById(elementId);
            if (element && element.dataset.defensiveUiModified) {
                console.error(`🚨 VIOLATION: Character creator element ${elementId} was modified by defensive UI`);
                return false;
            }
        }
        return true;
    }

    /**
     * Check if character creator is currently open
     * @returns {boolean} True if character creator modal is visible
     */
    static isCharacterCreatorOpen() {
        const modal = document.getElementById('creator-modal-backdrop');
        return modal && modal.style.display !== 'none' && !modal.classList.contains('hidden');
    }

    /**
     * Validate game state has required properties
     * @param {Object} gameState - Current game state
     * @returns {boolean} True if valid
     */
    static validateGameState(gameState) {
        const required = {
            characterManager: 'object',
            gameEngine: 'object'
        };

        for (const [key, type] of Object.entries(required)) {
            if (!gameState[key] || typeof gameState[key] !== type) {
                console.warn(`⚠️ Game state missing ${key} (${type})`);
                return false;
            }
        }
        return true;
    }

    /**
     * Validate character object has required properties
     * @param {Object} character - Character to validate
     * @returns {boolean} True if valid
     */
    static validateCharacter(character) {
        if (!character) return false;

        const required = ['id', 'name', 'jobRole', 'needs'];
        
        for (const prop of required) {
            if (!character[prop]) {
                console.warn(`⚠️ Character missing property: ${prop}`);
                return false;
            }
        }

        // Validate needs object
        if (character.needs) {
            const requiredNeeds = ['energy', 'hunger', 'social', 'stress'];
            for (const need of requiredNeeds) {
                if (typeof character.needs[need] !== 'number') {
                    console.warn(`⚠️ Character needs.${need} is not a number`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Check if a specific game UI element exists
     * @param {string} elementId - Element ID to check
     * @returns {boolean} True if element exists
     */
    static hasGameElement(elementId) {
        // SAFETY: Never check character creator elements
        if (this.PROTECTED_CREATOR_ELEMENTS.includes(elementId)) {
            console.warn(`🛡️ Attempted to check protected creator element: ${elementId}`);
            return true; // Pretend it exists to avoid interference
        }

        return !!document.getElementById(elementId);
    }

    /**
     * Get missing game UI elements
     * @returns {string[]} Array of missing element IDs
     */
    static getMissingGameElements() {
        // SAFETY: Skip validation if character creator is open
        if (this.isCharacterCreatorOpen()) {
            console.log('🎭 Character creator is open - skipping game UI validation');
            return [];
        }

        const missing = [];
        
        for (const elementId of this.REQUIRED_GAME_ELEMENTS) {
            if (!this.hasGameElement(elementId)) {
                missing.push(elementId);
            }
        }

        return missing;
    }

    /**
     * Validate tab system elements
     * @returns {boolean} True if tab system is intact
     */
    static validateTabSystem() {
        // Check tab content elements
        for (const tabId of this.TAB_ELEMENTS) {
            if (!document.getElementById(tabId)) {
                console.warn(`⚠️ Missing tab element: ${tabId}`);
                return false;
            }
        }

        // Check if openTab function exists (from index.html)
        if (typeof window.openTab !== 'function') {
            console.warn('⚠️ Missing global openTab function');
            return false;
        }

        return true;
    }

    /**
     * Complete UI validation report
     * @returns {Object} Validation results
     */
    static validateAll() {
        const results = {
            creatorProtected: this.validateCreatorProtection(),
            creatorOpen: this.isCharacterCreatorOpen(),
            missingElements: this.getMissingGameElements(),
            tabSystemValid: this.validateTabSystem(),
            timestamp: new Date().toISOString()
        };

        // Log summary
        if (results.missingElements.length > 0) {
            console.warn(`⚠️ UI Validation: ${results.missingElements.length} missing elements:`, results.missingElements);
        } else {
            console.log('✅ UI Validation: All game elements present');
        }

        if (!results.creatorProtected) {
            console.error('🚨 CRITICAL: Character creator protection violated');
        }

        return results;
    }
}

console.log('📋 UI Contract loaded - Game element validation ready');
