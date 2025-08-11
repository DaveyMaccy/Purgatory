/**
 * Status Panel Defender - Protects character status UI elements
 * 
 * SAFETY: Only touches game UI elements, never character creator
 * Ensures status bars, character info, and portrait always work
 */

import { UIContract } from './ui-contract.js';

export class StatusPanelDefender {
    constructor() {
        this.isInitialized = false;
        this.lastValidationTime = 0;
        this.validationInterval = 5000; // 5 seconds
        this.statusElements = [
            'character-name',
            'character-role', 
            'energy-value',
            'energy-bar',
            'hunger-value', 
            'hunger-bar',
            'social-value',
            'social-bar',
            'stress-value',
            'stress-bar',
            'player-portrait-canvas',
            'clock-display'
        ];
    }

    /**
     * Initialize status panel protection
     */
    initialize() {
        console.log('🛡️ Initializing Status Panel Defender...');
        
        // SAFETY CHECK: Never run if character creator is open
        if (UIContract.isCharacterCreatorOpen()) {
            console.log('🎭 Character creator open - delaying status panel initialization');
            setTimeout(() => this.initialize(), 1000);
            return;
        }

        this.validateStatusElements();
        this.isInitialized = true;
        
        console.log('✅ Status Panel Defender initialized');
    }

    /**
     * Validate all status panel elements exist
     * @returns {boolean} True if all elements are present
     */
    validateStatusElements() {
        const missing = [];
        
        for (const elementId of this.statusElements) {
            if (!UIContract.hasGameElement(elementId)) {
                missing.push(elementId);
            }
        }

        if (missing.length > 0) {
            console.warn(`⚠️ Status Panel: Missing ${missing.length} elements:`, missing);
            return false;
        }

        return true;
    }

    /**
     * Safe update for character basic info
     * @param {Object} character - Character object
     */
    updateCharacterBasics(character) {
        if (!UIContract.validateCharacter(character)) {
            console.warn('⚠️ Invalid character data for status panel update');
            return;
        }

        this.safeUpdateText('character-name', character.name || 'Unknown');
        this.safeUpdateText('character-role', character.jobRole || 'Unknown Role');
    }

    /**
     * Safe update for status bars
     * @param {Object} needs - Character needs object
     */
    updateStatusBars(needs) {
        if (!needs || typeof needs !== 'object') {
            console.warn('⚠️ Invalid needs data for status bars');
            return;
        }

        const statusTypes = ['energy', 'hunger', 'social', 'stress'];
        
        for (const type of statusTypes) {
            const value = needs[type];
            if (typeof value === 'number') {
                this.updateSingleStatusBar(type, value);
            }
        }
    }

    /**
     * Update a single status bar safely
     * @param {string} type - Status type (energy, hunger, etc.)
     * @param {number} value - Value from 0-10
     */
    updateSingleStatusBar(type, value) {
        const percentage = Math.max(0, Math.min(100, Math.round((value / 10) * 100)));
        
        // Update value text
        this.safeUpdateText(`${type}-value`, `${percentage}%`);
        
        // Update progress bar
        this.safeUpdateStyle(`${type}-bar`, { width: `${percentage}%` });
    }

    /**
     * Safe update for character portrait
     * @param {Object} character - Character object
     */
    updatePortrait(character) {
        const canvas = document.getElementById('player-portrait-canvas');
        if (!canvas) {
            console.warn('⚠️ Portrait canvas missing');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('⚠️ Cannot get canvas context');
            return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Use custom portrait if available, otherwise use sprite portrait
        const portraitData = character.customPortrait || character.portrait;
        
        if (portraitData) {
            const img = new Image();
            img.onload = () => {
                try {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                } catch (error) {
                    console.warn('⚠️ Failed to draw portrait image:', error);
                    this.drawFallbackPortrait(ctx, canvas, character);
                }
            };
            img.onerror = () => {
                console.warn('⚠️ Failed to load portrait image');
                this.drawFallbackPortrait(ctx, canvas, character);
            };
            img.src = portraitData;
        } else {
            this.drawFallbackPortrait(ctx, canvas, character);
        }
    }

    /**
     * Draw fallback portrait with character initial
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} character - Character object
     */
    drawFallbackPortrait(ctx, canvas, character) {
        // Draw background
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw character initial
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const initial = character.name ? character.name.charAt(0).toUpperCase() : '?';
        ctx.fillText(initial, canvas.width / 2, canvas.height / 2);
    }

    /**
     * Update clock display
     */
    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        this.safeUpdateText('clock-display', timeString);
    }

    /**
     * Safely update element text content
     * @param {string} elementId - Element ID
     * @param {string} text - New text content
     */
    safeUpdateText(elementId, text) {
        // SAFETY: Never touch character creator elements
        if (UIContract.PROTECTED_CREATOR_ELEMENTS.includes(elementId)) {
            console.warn(`🛡️ Attempted to update protected creator element: ${elementId}`);
            return;
        }

        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`⚠️ Status element not found: ${elementId}`);
        }
    }

    /**
     * Safely update element styles
     * @param {string} elementId - Element ID  
     * @param {Object} styles - Style properties to update
     */
    safeUpdateStyle(elementId, styles) {
        // SAFETY: Never touch character creator elements
        if (UIContract.PROTECTED_CREATOR_ELEMENTS.includes(elementId)) {
            console.warn(`🛡️ Attempted to style protected creator element: ${elementId}`);
            return;
        }

        const element = document.getElementById(elementId);
        if (element && styles) {
            Object.assign(element.style, styles);
        } else if (!element) {
            console.warn(`⚠️ Status element not found for styling: ${elementId}`);
        }
    }

    /**
     * Perform periodic validation
     * @returns {boolean} True if validation passes
     */
    periodicValidation() {
        const now = Date.now();
        
        // Skip if validated recently
        if (now - this.lastValidationTime < this.validationInterval) {
            return true;
        }

        // SAFETY: Skip if character creator is open
        if (UIContract.isCharacterCreatorOpen()) {
            console.log('🎭 Skipping status panel validation - character creator is open');
            return true;
        }

        this.lastValidationTime = now;
        const isValid = this.validateStatusElements();
        
        if (!isValid) {
            console.warn('⚠️ Status panel validation failed');
        }

        return isValid;
    }

    /**
     * Complete status panel update
     * @param {Object} character - Character object
     */
    updateAll(character) {
        if (!character) {
            console.warn('⚠️ No character provided for status panel update');
            return;
        }

        // SAFETY: Never update if character creator is open
        if (UIContract.isCharacterCreatorOpen()) {
            return;
        }

        try {
            this.updateCharacterBasics(character);
            
            if (character.needs) {
                this.updateStatusBars(character.needs);
            }
            
            this.updatePortrait(character);
            this.updateClock();
            
        } catch (error) {
            console.error('❌ Status panel update failed:', error);
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.isInitialized = false;
        console.log('🗑️ Status Panel Defender destroyed');
    }
}

console.log('🛡️ Status Panel Defender loaded');
