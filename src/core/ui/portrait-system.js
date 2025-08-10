/**
 * Portrait System - Handles character portraits in the UI (PHASE 1 IMPLEMENTATION)
 * 
 * Responsibilities:
 *  - Render character portraits in the status panel using their spriteSheet
 * 
 * Important: Uses PREMADE SPRITES only (no custom portraits in Phase 1)
 */

class PortraitSystem {
    /**
     * Render portrait in status panel using character's spriteSheet
     * @param {string} characterId 
     * @param {string} spritePath - The character's spriteSheet path
     */
    renderPortrait(characterId, spritePath) {
        const portraitElement = document.getElementById('player-portrait');
        if (portraitElement) {
            portraitElement.src = spritePath;
        }
    }
}

// Export singleton instance
export const portraitSystem = new PortraitSystem();
