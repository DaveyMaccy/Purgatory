/**
 * Action Queue System - A new system for Purgatory
 * PURPOSE: To manage and queue character actions, ensuring they only
 * execute after the character has completed any required movement.
 */

/**
 * Queues an action for a character. This action will be executed
 * once the character's movement path is empty.
 * @param {Character} character The character who will perform the action.
 * @param {object} action The action to be queued. Contains type, target, and payload.
 */
export function queueAction(character, action) {
    // Any new action immediately cancels a previously queued one.
    if (character.queuedAction) {
        console.log(`Action cancelled for ${character.name}: ${character.queuedAction.type}`);
    }
    character.queuedAction = action;
    console.log(`Action queued for ${character.name}: ${action.type}`);
}

/**
 * Clears any queued action for a character.
 * This is called when a character's movement is interrupted.
 * @param {Character} character The character whose action should be cleared.
 */
export function clearQueuedAction(character) {
    if (character.queuedAction) {
        console.log(`Action cancelled for ${character.name}: ${character.queuedAction.type}`);
        character.queuedAction = null;
    }
}

/**
 * Checks for and triggers the execution of a queued action.
 * This should be called by the movement system upon arrival at a destination.
 * @param {Character} character The character to check.
 * @param {GameEngine} gameEngine The main game engine to execute the action.
 */
export function executeQueuedAction(character, gameEngine) {
    if (!character.queuedAction) {
        return; // No action to execute
    }

    console.log(`Executing queued action for ${character.name}: ${character.queuedAction.type}`);
    
    // Delegate the actual execution to the game engine
    if (gameEngine && gameEngine.executeAction) {
        gameEngine.executeAction(character, character.queuedAction);
    }
    
    // Clear the action after execution
    character.queuedAction = null;
}
