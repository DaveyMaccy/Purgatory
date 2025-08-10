/**
 * Response Processor - Converts AI responses to game actions
 */
export function processResponse(character, response) {
    if (!response || !response.responseType) {
        console.warn(`Invalid response from AI for ${character.name}`);
        return;
    }
    
    try {
        if (response.responseType === 'ACTION') {
            handleActionResponse(character, response.action);
        } else if (response.responseType === 'DIALOGUE') {
            handleDialogueResponse(character, response.content);
        }
        
        // Add thought to short-term memory
        if (response.thought) {
            character.addToShortTermMemory(`Thought: ${response.thought}`);
        }
        
    } catch (error) {
        console.error(`Error processing AI response for ${character.name}:`, error);
    }
}

function handleActionResponse(character, action) {
    if (!action || !action.type) {
        console.warn(`Invalid action from AI for ${character.name}`);
        return;
    }

    // Add default duration if not provided
    if (!action.duration) {
        action.duration = calculateActionDuration(action.type);
    }

    // Add to character's action queue
    if (!character.actionQueue) character.actionQueue = [];
    character.actionQueue.push(action);
    console.log(`${character.name} will perform: ${action.type}`);
}

function calculateActionDuration(actionType) {
    // Default durations for different action types
    const durations = {
        'IDLE': 5000,        // 5 seconds
        'MOVE_TO': 10000,     // 10 seconds (base time, actual will depend on path)
        'PUT_DOWN': 2000,     // 2 seconds
        'THROW': 3000,        // 3 seconds
        'WORK_ON': 15000,     // 15 seconds
        'START_CONVERSATION': 5000, // 5 seconds
        'DRINK_COFFEE': 8000, // 8 seconds
        'EAT_SNACK': 10000,   // 10 seconds
        'SOCIALIZE': 12000    // 12 seconds
    };

    return durations[actionType] || 5000; // Default to 5 seconds
}

function handleDialogueResponse(character, content) {
    // This would be handled by the conversation system
    console.log(`${character.name} says: ${content}`);
}
