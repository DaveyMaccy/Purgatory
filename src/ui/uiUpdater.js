/**
 * UI Updater - Updates character UI elements
 */
export class UIUpdater {
    constructor(characterManager) {
        this.characterManager = characterManager;
    }

    /**
     * Update character UI elements
     * @param {Character} character - The character to update
     * @param {Array} allCharacters - All characters in the game
     */
    updateCharacterUI(character, allCharacters) {
        // This would update the character's UI elements
        // For example: needs bars, mood indicator, action state, etc.
        console.log(`Updating UI for ${character.name}`);
    }

    /**
     * Update all characters' UI
     */
    updateAllCharactersUI() {
        this.characterManager.characters.forEach(character => {
            this.updateCharacterUI(character);
        });
    }
    
    /**
     * Subscribe to character state changes
     * @param {Character} character - The character to observe
     */
    subscribeToCharacter(character) {
        character.addObserver(this);
    }
    
    /**
     * Unsubscribe from character state changes
     * @param {Character} character - The character to stop observing
     */
    unsubscribeFromCharacter(character) {
        character.removeObserver(this);
    }
    
    /**
     * Handle character state changes
     * @param {Character} character - The character whose state changed
     * @param {string} property - The property that changed
     */
    onCharacterStateChange(character, property) {
        // Only update UI for properties that affect the display
        const uiRelevantProperties = [
            'actionState', 'mood', 'assignedTask', 'relationships'
        ];
        
        if (uiRelevantProperties.includes(property)) {
            this.updateCharacterUI(character);
        }
    }
}
