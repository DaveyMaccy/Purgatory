/**
 * ACTION SYSTEM - Player action processing and execution
 * EXTRACTED FROM: main.js lines 748-890 (TASK_ACTIONS + related functions)
 * PURPOSE: Handle player action commands and execution
 */

// Available task actions based on current context
// EXACT CODE FROM: main.js lines 748-777
export const TASK_ACTIONS = {
    // Primary task actions
    'work': 'WORK_ON_TASK',
    'work on task': 'WORK_ON_TASK', 
    'complete task': 'COMPLETE_TASK',
    'finish task': 'COMPLETE_TASK',
    
    // Movement actions
    'move to': 'MOVE_TO',
    'go to': 'MOVE_TO',
    'walk to': 'MOVE_TO',
    
    // Need-based actions
    'get coffee': 'DRINK_COFFEE',
    'coffee': 'DRINK_COFFEE',
    'eat': 'EAT_SNACK',
    'snack': 'EAT_SNACK',
    
    // Social actions
    'talk to': 'START_CONVERSATION',
    'chat with': 'START_CONVERSATION',
    'socialize': 'SOCIALIZE',
    
    // Location shortcuts
    'desk': 'MOVE_TO_DESK',
    'meeting room': 'MOVE_TO_MEETING_ROOM',
    'break room': 'MOVE_TO_BREAK_ROOM',
    'printer': 'MOVE_TO_PRINTER'
};

/**
 * Get display text for action suggestion
 * EXACT CODE FROM: main.js lines 885-908
 */
export function getActionDisplayText(keyword, actionType, playerCharacter) {
    if (!playerCharacter) return keyword;
    
    switch (actionType) {
        case 'WORK_ON_TASK':
            const task = playerCharacter.assignedTask?.displayName || 'assigned task';
            return `Work on: ${task}`;
        case 'COMPLETE_TASK':
            return `Complete current task`;
        case 'MOVE_TO_DESK':
            return `Go to your desk`;
        case 'MOVE_TO_MEETING_ROOM':
            return `Go to meeting room`;
        case 'MOVE_TO_BREAK_ROOM':
            return `Go to break room`;
        case 'MOVE_TO_PRINTER':
            return `Go to printer`;
        default:
            return keyword;
    }
}

/**
 * Process player action commands
 * EXACT CODE FROM: main.js lines 933-955
 */
export function processPlayerAction(actionText, playerCharacter) {
    const text = actionText.toLowerCase();
    
    // Find matching action
    let actionType = null;
    let actionTarget = null;
    
    for (const [keyword, type] of Object.entries(TASK_ACTIONS)) {
        if (text === keyword || text.startsWith(keyword + ' ')) {
            actionType = type;
            if (text.length > keyword.length) {
                actionTarget = text.substring(keyword.length).trim();
            }
            break;
        }
    }
    
    if (!actionType) {
        addToChatLog('System', `Unknown action: "${actionText}". Try "work", "complete task", or "move to desk".`);
        return;
    }
    
    // Execute action
    executePlayerAction(actionType, actionTarget, playerCharacter);
}

/**
 * Execute player action
 * EXACT CODE FROM: main.js lines 960-1015
 */
export function executePlayerAction(actionType, target, playerCharacter) {
    switch (actionType) {
        case 'WORK_ON_TASK':
            if (playerCharacter.assignedTask) {
                addToChatLog(playerCharacter.name, `Working on: ${playerCharacter.assignedTask.displayName}`);
                // Manually progress task
                const progressAmount = 0.2; // 20% progress per action
                if (!playerCharacter.assignedTask.progress) {
                    playerCharacter.assignedTask.progress = 0;
                }
                playerCharacter.assignedTask.progress = Math.min(1.0, 
                    playerCharacter.assignedTask.progress + progressAmount);
                
                if (playerCharacter.assignedTask.progress >= 1.0) {
                    playerCharacter.completeCurrentTask();
                    addToChatLog('System', 'Task completed! New task assigned.');
                } else {
                    addToChatLog('System', `Task progress: ${Math.round(playerCharacter.assignedTask.progress * 100)}%`);
                }
            } else {
                addToChatLog('System', 'No task assigned.');
            }
            break;
            
        case 'COMPLETE_TASK':
            if (playerCharacter.assignedTask) {
                playerCharacter.completeCurrentTask();
                addToChatLog(playerCharacter.name, 'Completed current task!');
                addToChatLog('System', 'New task assigned.');
            } else {
                addToChatLog('System', 'No task to complete.');
            }
            break;
            
        case 'MOVE_TO_DESK':
        case 'MOVE_TO_MEETING_ROOM':
        case 'MOVE_TO_BREAK_ROOM':
        case 'MOVE_TO_PRINTER':
            const locationMap = {
                'MOVE_TO_DESK': 'desk',
                'MOVE_TO_MEETING_ROOM': 'meeting room',
                'MOVE_TO_BREAK_ROOM': 'break room',
                'MOVE_TO_PRINTER': 'printer'
            };
            const location = locationMap[actionType];
            addToChatLog(playerCharacter.name, `Moving to ${location}...`);
            // Note: Actual movement would be handled by movement system
            break;
            
        case 'DRINK_COFFEE':
            playerCharacter.needs.energy = Math.min(10, playerCharacter.needs.energy + 3);
            addToChatLog(playerCharacter.name, 'Had some coffee. Feeling more energized!');
            break;
            
        case 'EAT_SNACK':
            playerCharacter.needs.hunger = Math.min(10, playerCharacter.needs.hunger + 2);
            addToChatLog(playerCharacter.name, 'Had a snack. Feeling less hungry.');
            break;
            
        default:
            addToChatLog('System', `Action "${actionType}" not implemented yet.`);
    }
    
    // Trigger UI update
    if (window.uiUpdater) {
        window.uiUpdater.updateUI(playerCharacter);
    }
}
