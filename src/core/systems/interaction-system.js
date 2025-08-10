/**
 * Handles item interactions between characters and objects
 */
export class InteractionSystem {
    constructor(world) {
        this.world = world;
    }

    /**
     * Attempt to pick up an item
     * @param {Character} character - The character attempting the action
     * @param {Object} item - The item to pick up
     * @returns {boolean} True if successful
     */
    pickUpItem(character, item) {
        if (!item || !character) return false;
        
        // Check if item is within interaction range
        if (!this.isWithinRange(character, item)) {
            return false;
        }

        return character.pickUpItem(item);
    }

    /**
     * Put down an item the character is holding
     * @param {Character} character - The character attempting the action
     * @returns {boolean} True if successful
     */
    putDownItem(character) {
        if (!character || !character.heldItem) return false;
        
        // Find valid location near character
        const dropPosition = this.findDropPosition(character);
        if (!dropPosition) return false;

        character.putDownItem();
        character.heldItem.position = dropPosition;
        return true;
    }

    /**
     * Use an item on a target
     * @param {Character} character - The character using the item
     * @param {Object} item - The item being used
     * @param {Object|null} target - Optional target of the interaction
     * @returns {boolean} True if successful
     */
    useItem(character, item, target = null) {
        if (!character || !item) return false;
        
        // Check if character is holding the item
        if (!character.heldItem || character.heldItem.id !== item.id) {
            return false;
        }

        // Check if target is within range if specified
        if (target && !this.isWithinRange(character, target)) {
            return false;
        }

        return character.useItem(item);
    }

    /**
     * Check if target is within interaction range
     * @private
     */
    isWithinRange(character, target) {
        const dx = character.position.x - target.position.x;
        const dy = character.position.y - target.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= 50; // Interaction range of 50 pixels
    }

    /**
     * Find valid position to drop an item near character
     * @private
     */
    findDropPosition(character) {
        // Simple implementation: drop at character's position
        // More advanced: check for valid positions in navgrid
        return { x: character.position.x, y: character.position.y };
    }
}
