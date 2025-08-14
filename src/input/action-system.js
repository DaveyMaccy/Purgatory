/**
 * ACTION SYSTEM - Player action processing and execution
 * EXTRACTED FROM: main.js lines 748-890 (TASK_ACTIONS + related functions)
 * PURPOSE: Handle player action commands and execution
 */

// Defensive declaration to prevent redeclaration errors from unknown duplicate scripts.
// This checks if the object already exists on the global scope before creating it.
if (typeof window.TASK_ACTIONS === 'undefined') {
  window.TASK_ACTIONS = {
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
}

// Export a constant that points to the single, safe-guarded object.
export const TASK_ACTIONS = window.TASK_ACTIONS;

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
        if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>System:</strong> Unknown action: "${actionText}". Try "work", "complete task", or "move to desk".`);
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
                if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Working on: ${playerCharacter.assignedTask.displayName}`);
                // Manually progress task
                const progressAmount = 0.2; // 20% progress per action
                if (!playerCharacter.assignedTask.progress) {
                    playerCharacter.assignedTask.progress = 0;
                }
                playerCharacter.assignedTask.progress = Math.min(1.0, 
                    playerCharacter.assignedTask.progress + progressAmount);
                
                if (playerCharacter.assignedTask.progress >= 1.0) {
                    playerCharacter.completeCurrentTask();
                    if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>System:</strong> Task completed! New task assigned.`);
                } else {
                    if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>System:</strong> Task progress: ${Math.round(playerCharacter.assignedTask.progress * 100)}%`);
                }
            } else {
                if (window.uiUpdater) window.uiUpdater.addChatMessage('<strong>System:</strong> No task assigned.');
            }
            break;
            
        case 'COMPLETE_TASK':
            if (playerCharacter.assignedTask) {
                playerCharacter.completeCurrentTask();
                if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Completed current task!`);
                if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>System:</strong> New task assigned.`);
            } else {
                if (window.uiUpdater) window.uiUpdater.addChatMessage('<strong>System:</strong> No task to complete.');
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
            if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Moving to ${location}...`);
            // Note: Actual movement would be handled by movement system
            break;
            
        case 'DRINK_COFFEE':
            playerCharacter.needs.energy = Math.min(10, playerCharacter.needs.energy + 3);
            if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Had some coffee. Feeling more energized!`);
            break;
            
        case 'EAT_SNACK':
            playerCharacter.needs.hunger = Math.min(10, playerCharacter.needs.hunger + 2);
            if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Had a snack. Feeling less hungry.`);
            break;
            
        default:
            if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>System:</strong> Action "${actionType}" not implemented yet.`);
    }
    
    // Trigger UI update
    if (window.uiUpdater) {
        window.uiUpdater.updateUI(playerCharacter);
    }
}
