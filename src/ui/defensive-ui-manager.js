/**
 * Defensive UI Manager - Main coordinator for UI protection
 * 
 * CRITICAL SAFETY: This system NEVER touches character creator elements
 * Only protects and manages game UI elements during active gameplay
 */

import { UIContract } from './ui-contract.js';
import { StatusPanelDefender } from './status-panel-defender.js';
import { ChatSystemDefender } from './chat-system-defender.js';

export class DefensiveUIManager {
    constructor() {
        this.isInitialized = false;
        this.modules = new Map();
        this.watchdogInterval = null;
        this.watchdogDelay = 10000; // 10 seconds
        this.developerMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.manualOverride = false;
        this.lastValidation = 0;
    }

    /**
     * Initialize defensive UI system
     * SAFETY: Never runs if character creator is open
     */
    async initialize() {
        console.log('🛡️ Initializing Defensive UI Manager...');
        
        // CRITICAL SAFETY CHECK: Character creator protection
        if (!this.validateCreatorSafety()) {
            console.error('🚨 Character creator safety check failed - aborting UI protection');
            return false;
        }

        // Wait if character creator is currently open
        if (UIContract.isCharacterCreatorOpen()) {
            console.log('🎭 Character creator is open - delaying defensive UI initialization');
            setTimeout(() => this.initialize(), 2000);
            return false;
        }

        try {
            // Initialize protection modules
            await this.initializeModules();
            
            // Start watchdog system
            this.startWatchdog();
            
            // Set up developer controls
            this.setupDeveloperControls();
            
            this.isInitialized = true;
            console.log('✅ Defensive UI Manager initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Defensive UI Manager:', error);
            return false;
        }
    }

    /**
     * CRITICAL: Validate character creator safety
     * @returns {boolean} True if character creator is safe from interference
     */
    validateCreatorSafety() {
        // Check that all protected elements are unmarked
        for (const elementId of UIContract.PROTECTED_CREATOR_ELEMENTS) {
            const element = document.getElementById(elementId);
            if (element && element.dataset.defensiveUiModified) {
                console.error(`🚨 VIOLATION: Character creator element ${elementId} marked as modified`);
                return false;
            }
        }

        console.log('✅ Character creator safety validated');
        return true;
    }

    /**
     * Initialize protection modules
     */
    async initializeModules() {
        console.log('🔧 Initializing UI protection modules...');

        // Status Panel Defender
        const statusDefender = new StatusPanelDefender();
        this.modules.set('statusPanel', statusDefender);
        statusDefender.initialize();

        // Chat System Defender  
        const chatDefender = new ChatSystemDefender();
        this.modules.set('chatSystem', chatDefender);
        chatDefender.initialize();

        console.log(`✅ Initialized ${this.modules.size} protection modules`);
    }

    /**
     * Start watchdog system for periodic validation
     */
    startWatchdog() {
        if (this.watchdogInterval) {
            clearInterval(this.watchdogInterval);
        }

        this.watchdogInterval = setInterval(() => {
            this.performWatchdogCheck();
        }, this.watchdogDelay);

        console.log(`🐕 UI Watchdog started (${this.watchdogDelay}ms interval)`);
    }

    /**
     * Stop watchdog system
     */
    stopWatchdog() {
        if (this.watchdogInterval) {
            clearInterval(this.watchdogInterval);
            this.watchdogInterval = null;
            console.log('🐕 UI Watchdog stopped');
        }
    }

    /**
     * Perform periodic watchdog validation
     */
    performWatchdogCheck() {
        // Skip if manually disabled
        if (this.manualOverride) {
            return;
        }

        // CRITICAL: Skip if character creator is open
        if (UIContract.isCharacterCreatorOpen()) {
            console.log('🎭 Watchdog: Character creator open - skipping validation');
            return;
        }

        try {
            // Validate character creator safety first
            if (!this.validateCreatorSafety()) {
                console.error('🚨 CRITICAL: Character creator safety compromised');
                this.emergencyShutdown();
                return;
            }

            // Validate all UI elements
            const validation = UIContract.validateAll();
            this.lastValidation = Date.now();

            // Validate each module
            let allModulesValid = true;
            for (const [name, module] of this.modules) {
                if (module.periodicValidation && !module.periodicValidation()) {
                    console.warn(`⚠️ Module ${name} validation failed`);
                    allModulesValid = false;
                }
            }

            if (!allModulesValid) {
                console.warn('⚠️ Some UI modules failed validation');
            }

        } catch (error) {
            console.error('❌ Watchdog check failed:', error);
        }
    }

    /**
     * Emergency shutdown if character creator is compromised
     */
    emergencyShutdown() {
        console.error('🚨 EMERGENCY: Shutting down defensive UI to protect character creator');
        
        this.stopWatchdog();
        this.manualOverride = true;
        
        // Destroy all modules
        for (const [name, module] of this.modules) {
            if (module.destroy) {
                module.destroy();
            }
        }
        
        this.modules.clear();
        this.isInitialized = false;
        
        console.log('🛑 Defensive UI emergency shutdown complete');
    }

    /**
     * Update UI safely for a character
     * @param {Object} character - Character to display
     * @param {Array} allCharacters - All characters in game
     */
    updateUI(character, allCharacters = []) {
        // SAFETY: Never update during character creation
        if (UIContract.isCharacterCreatorOpen()) {
            return;
        }

        if (!this.isInitialized) {
            console.warn('⚠️ Defensive UI not initialized - cannot update');
            return;
        }

        if (!UIContract.validateCharacter(character)) {
            console.warn('⚠️ Invalid character data - skipping UI update');
            return;
        }

        try {
            // Update status panel
            const statusDefender = this.modules.get('statusPanel');
            if (statusDefender) {
                statusDefender.updateAll(character);
            }

            // Update chat system and tabs
            const chatDefender = this.modules.get('chatSystem');
            if (chatDefender) {
                chatDefender.updateAll(character, allCharacters);
            }

        } catch (error) {
            console.error('❌ Defensive UI update failed:', error);
        }
    }

    /**
     * Add chat message safely
     * @param {string} message - Message to add
     * @param {string} type - Message type
     */
    addChatMessage(message, type = 'system') {
        const chatDefender = this.modules.get('chatSystem');
        if (chatDefender) {
            chatDefender.addChatMessage(message, type);
        }
    }

    /**
     * Setup developer controls for manual override
     */
    setupDeveloperControls() {
        if (!this.developerMode) {
            return;
        }

        // Add to debug object
        if (!window.debugGame) {
            window.debugGame = {};
        }

        window.debugGame.disableUIProtection = (reason = 'Manual override') => {
            console.log(`🔧 UI Protection disabled: ${reason}`);
            this.manualOverride = true;
            this.stopWatchdog();
        };

        window.debugGame.enableUIProtection = () => {
            if (this.manualOverride) {
                console.log('🛡️ UI Protection re-enabled');
                this.manualOverride = false;
                this.startWatchdog();
            }
        };

        window.debugGame.validateUI = () => {
            console.log('🔍 Manual UI validation:');
            const results = UIContract.validateAll();
            console.log('Validation results:', results);
            return results;
        };

        window.debugGame.getUIStatus = () => {
            return {
                initialized: this.isInitialized,
                manualOverride: this.manualOverride,
                moduleCount: this.modules.size,
                lastValidation: new Date(this.lastValidation).toISOString(),
                creatorOpen: UIContract.isCharacterCreatorOpen(),
                creatorSafe: this.validateCreatorSafety()
            };
        };

        window.debugGame.emergencyUIShutdown = () => {
            this.emergencyShutdown();
        };

        console.log('🔧 Developer UI controls added to window.debugGame');
    }

    /**
     * Get status of defensive UI system
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            moduleCount: this.modules.size,
            watchdogActive: !!this.watchdogInterval,
            manualOverride: this.manualOverride,
            lastValidation: this.lastValidation,
            creatorOpen: UIContract.isCharacterCreatorOpen(),
            creatorSafe: this.validateCreatorSafety(),
            developerMode: this.developerMode
        };
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        console.log('🗑️ Destroying Defensive UI Manager...');
        
        this.stopWatchdog();
        
        // Destroy all modules
        for (const [name, module] of this.modules) {
            if (module.destroy) {
                module.destroy();
            }
        }
        
        this.modules.clear();
        this.isInitialized = false;
        
        console.log('✅ Defensive UI Manager destroyed');
    }
}

console.log('🛡️ Defensive UI Manager loaded');
