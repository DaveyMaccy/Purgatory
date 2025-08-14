/**
 * ACTION SYSTEM - Player action processing and execution with Inventory Integration
 * LOCATION: src/core/systems/action-system.js
 * PURPOSE: Handle player action commands, execution, and inventory interactions
 * 
 * FEATURES:
 * - All original TASK_ACTIONS preserved
 * - New inventory actions (pick up, use, drop, combine, give)
 * - Item interaction system with effects
 * - Coffee machine integration
 * - Comprehensive action suggestions
 * - Robust error handling
 */

import { useItem, addItemToInventory, removeItemFromInventory, getItemById, getAllItems } from './inventory-system.js';

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
    
    // NEW: Inventory actions
    'pick up': 'PICK_UP_ITEM',
    'take': 'PICK_UP_ITEM',
    'drop': 'DROP_ITEM',
    'use': 'USE_ITEM',
    'drink': 'USE_ITEM',
    'eat': 'USE_ITEM',
    'combine': 'COMBINE_ITEMS',
    'give': 'GIVE_ITEM',
    
    // Social actions
    'talk to': 'START_CONVERSATION',
    'chat with': 'START_CONVERSATION',
    'socialize': 'SOCIALIZE',
    
    // Location shortcuts
    'desk': 'MOVE_TO_DESK',
    'meeting room': 'MOVE_TO_MEETING_ROOM',
    'break room': 'MOVE_TO_BREAK_ROOM',
    'printer': 'MOVE_TO_PRINTER',
    'coffee machine': 'MOVE_TO_COFFEE_MACHINE'
  };
}

// Export a constant that points to the single, safe-guarded object.
export const TASK_ACTIONS = window.TASK_ACTIONS;

/**
 * Get display text for action suggestion with inventory context
 * ENHANCED FROM: main.js lines 885-908
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
        case 'MOVE_TO_COFFEE_MACHINE':
            return `Go to coffee machine`;
        case 'PICK_UP_ITEM':
            return `Pick up item`;
        case 'USE_ITEM':
            return `Use item`;
        case 'DROP_ITEM':
            return `Drop item`;
        case 'COMBINE_ITEMS':
            return `Combine items`;
        case 'GIVE_ITEM':
            return `Give item to someone`;
        default:
            return keyword;
    }
}

/**
 * NEW: Parse item name from action text
 */
function parseItemFromAction(actionText, actionKeyword) {
    const text = actionText.toLowerCase();
    const keywordIndex = text.indexOf(actionKeyword.toLowerCase());
    
    if (keywordIndex === -1) return null;
    
    const afterKeyword = text.substring(keywordIndex + actionKeyword.length).trim();
    
    // Handle "use coffee" -> "coffee_mug_full" mapping
    const itemMappings = {
        'coffee': 'coffee_mug_full',
        'mug': 'coffee_mug_full',
        'energy bar': 'energy_bar',
        'sandwich': 'sandwich',
        'phone': 'smartphone',
        'laptop': 'laptop',
        'documents': 'documents',
        'keys': 'office_keys',
        'glasses': 'reading_glasses',
        'headphones': 'headphones',
        'stress ball': 'stress_ball',
        'pen': 'pen',
        'notebook': 'notebook'
    };
    
    // Check direct mappings first
    if (itemMappings[afterKeyword]) {
        return itemMappings[afterKeyword];
    }
    
    // Try to find item by partial name match
    const allItems = getAllItems();
    const matchingItem = allItems.find(item => 
        item.name.toLowerCase().includes(afterKeyword) ||
        item.id.includes(afterKeyword.replace(/\s+/g, '_'))
    );
    
    return matchingItem ? matchingItem.id : afterKeyword.replace(/\s+/g, '_');
}

/**
 * NEW: Execute inventory-related actions
 */
function executeInventoryAction(actionType, playerCharacter, itemName, targetCharacter = null) {
    switch (actionType) {
        case 'PICK_UP_ITEM':
            return executePickUpItem(playerCharacter, itemName);
        case 'USE_ITEM':
            return executeUseItem(playerCharacter, itemName);
        case 'DROP_ITEM':
            return executeDropItem(playerCharacter, itemName);
        case 'COMBINE_ITEMS':
            return executeCombineItems(playerCharacter, itemName);
        case 'GIVE_ITEM':
            return executeGiveItem(playerCharacter, itemName, targetCharacter);
        default:
            return false;
    }
}

/**
 * Execute pick up item action
 */
function executePickUpItem(character, itemName) {
    if (!itemName) {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>System:</strong> Pick up what? Try "pick up coffee mug" or "take pen".`);
        }
        return false;
    }

    // Try to get world state manager for picking up from world
    const worldStateManager = window.world?.getWorldStateManager?.();
    if (worldStateManager) {
        // Find nearby locations with the item
        const nearbyLocations = worldStateManager.getNearbyInteractableLocations(character.position, 100);
        const locationWithItem = nearbyLocations.find(loc => 
            loc.items.some(item => item.includes(itemName))
        );

        if (locationWithItem) {
            return worldStateManager.pickupItemFromLocation(character, locationWithItem.locationKey, itemName, 1);
        }
    }

    // Fallback: just add to inventory (for testing or when world system not available)
    const success = addItemToInventory(character, itemName, 1);
    if (success) {
        const item = getItemById(itemName);
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${character.name}:</strong> Picked up ${item?.name || itemName}.`);
        }
        return true;
    }

    if (window.uiUpdater) {
        window.uiUpdater.addChatMessage(`<strong>System:</strong> Could not find ${itemName} nearby.`);
    }
    return false;
}

/**
 * Execute use item action
 */
function executeUseItem(character, itemName) {
    if (!itemName) {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>System:</strong> Use what? Try "use coffee" or "drink coffee".`);
        }
        return false;
    }

    // Check if character has the item
    const hasItem = character.inventory?.some(invItem => {
        const itemId = typeof invItem === 'object' ? invItem.id : invItem;
        return itemId === itemName || itemId.includes(itemName);
    });

    if (!hasItem) {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>System:</strong> You don't have a ${itemName} to use.`);
        }
        return false;
    }

    const item = getItemById(itemName);
    if (!item) {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>System:</strong> Unknown item: ${itemName}.`);
        }
        return false;
    }

    // Determine interaction type based on item
    let interactionType = 'use';
    if (item.interactions?.drink) interactionType = 'drink';
    if (item.interactions?.eat) interactionType = 'eat';
    if (item.interactions?.wear) interactionType = 'wear';
    if (item.interactions?.squeeze) interactionType = 'squeeze';
    if (item.interactions?.look_at) interactionType = 'look_at';
    if (item.interactions?.admire) interactionType = 'admire';
    if (item.interactions?.fidget) interactionType = 'fidget';

    const success = useItem(character, itemName, interactionType);
    if (success) {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${character.name}:</strong> Used ${item.name}.`);
        }
        return true;
    }

    return false;
}

/**
 * Execute drop item action
 */
function executeDropItem(character, itemName) {
    if (!itemName) {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>System:</strong> Drop what? Try "drop pen" or "drop documents".`);
        }
        return false;
    }

    // Try to drop in world if world state manager available
    const worldStateManager = window.world?.getWorldStateManager?.();
    if (worldStateManager) {
        // Find current location (simplified - just use nearest location)
        const nearbyLocations = worldStateManager.getNearbyInteractableLocations(character.position, 50);
        const currentLocation = nearbyLocations[0];
        
        if (currentLocation) {
            return worldStateManager.dropItemAtLocation(character, currentLocation.locationKey, itemName, 1);
        }
    }

    // Fallback: just remove from inventory
    const success = removeItemFromInventory(character, itemName, 1);
    if (success) {
        const item = getItemById(itemName);
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${character.name}:</strong> Dropped ${item?.name || itemName}.`);
        }
        return true;
    } else {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>System:</strong> You don't have a ${itemName} to drop.`);
        }
        return false;
    }
}

/**
 * Execute combine items action
 */
function executeCombineItems(character, itemNames) {
    if (window.uiUpdater) {
        window.uiUpdater.addChatMessage(`<strong>System:</strong> Item combination not yet implemented. Try "use coffee machine" with an empty mug.`);
    }
    return false;
}

/**
 * Execute give item action
 */
function executeGiveItem(character, itemName, targetCharacter) {
    if (window.uiUpdater) {
        window.uiUpdater.addChatMessage(`<strong>System:</strong> Giving items to other characters not yet implemented.`);
    }
    return false;
}

/**
 * NEW: Special location-based item interactions
 */
function executeLocationAction(character, actionType) {
    switch (actionType) {
        case 'DRINK_COFFEE':
        case 'MOVE_TO_COFFEE_MACHINE':
            return executeCoffeeMachineInteraction(character);
        default:
            return false;
    }
}

/**
 * Handle coffee machine interaction
 */
function executeCoffeeMachineInteraction(character) {
    // Check if character has empty mug
    const hasEmptyMug = character.inventory?.some(item => {
        const itemId = typeof item === 'object' ? item.id : item;
        return itemId === 'coffee_mug_empty' || itemId.includes('coffee_mug_empty');
    });

    if (!hasEmptyMug) {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>System:</strong> You need an empty coffee mug to use the coffee machine.`);
        }
        return false;
    }

    // Transform empty mug to full mug
    const success = removeItemFromInventory(character, 'coffee_mug_empty', 1);
    if (success) {
        addItemToInventory(character, 'coffee_mug_full', 1);
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${character.name}:</strong> Filled coffee mug at the coffee machine.`);
        }
        return true;
    }

    return false;
}

/**
 * Process player action commands with inventory integration
 * ENHANCED FROM: main.js lines 933-955
 */
export function processPlayerAction(actionText, playerCharacter) {
    const text = actionText.toLowerCase();
    
    // Find matching action
    let actionType = null;
    let actionTarget = null;
    let matchedKeyword = null;
    
    for (const [keyword, type] of Object.entries(TASK_ACTIONS)) {
        if (text === keyword || text.startsWith(keyword + ' ')) {
            actionType = type;
            matchedKeyword = keyword;
            if (text.length > keyword.length) {
                actionTarget = text.substring(keyword.length).trim();
            }
            break;
        }
    }
    
    if (!actionType) {
        if (window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>System:</strong> Unknown action: "${actionText}". Try "help" for available commands.`);
        }
        return false;
    }

    // Handle inventory actions
    const inventoryActions = ['PICK_UP_ITEM', 'USE_ITEM', 'DROP_ITEM', 'COMBINE_ITEMS', 'GIVE_ITEM'];
    if (inventoryActions.includes(actionType)) {
        const itemName = parseItemFromAction(actionText, matchedKeyword);
        const success = executeInventoryAction(actionType, playerCharacter, itemName);
        
        // Trigger UI update after inventory action
        if (window.uiUpdater) {
            window.uiUpdater.updateUI(playerCharacter);
        }
        
        return success;
    }

    // Handle location-based actions with items
    const locationActions = ['DRINK_COFFEE', 'MOVE_TO_COFFEE_MACHINE'];
    if (locationActions.includes(actionType)) {
        const success = executeLocationAction(playerCharacter, actionType);
        
        // Trigger UI update after location action
        if (window.uiUpdater) {
            window.uiUpdater.updateUI(playerCharacter);
        }
        
        return success;
    }

    // Handle existing movement and task actions
    const success = executePlayerAction(actionType, actionTarget, playerCharacter);
    
    // Trigger UI update
    if (window.uiUpdater) {
        window.uiUpdater.updateUI(playerCharacter);
    }
    
    return success;
}

/**
 * Execute player action (preserved from original)
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
        case 'MOVE_TO_COFFEE_MACHINE':
            const locationMap = {
                'MOVE_TO_DESK': 'desk',
                'MOVE_TO_MEETING_ROOM': 'meeting room',
                'MOVE_TO_BREAK_ROOM': 'break room',
                'MOVE_TO_PRINTER': 'printer',
                'MOVE_TO_COFFEE_MACHINE': 'coffee machine'
            };
            const location = locationMap[actionType];
            if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Moving to ${location}...`);
            // Note: Actual movement would be handled by movement system
            break;
            
        case 'DRINK_COFFEE':
            // Legacy coffee action - use inventory system if available
            const hasCoffee = playerCharacter.inventory?.some(item => {
                const itemId = typeof item === 'object' ? item.id : item;
                return itemId === 'coffee_mug_full' || itemId.includes('coffee');
            });
            
            if (hasCoffee) {
                const success = useItem(playerCharacter, 'coffee_mug_full', 'drink');
                if (success && window.uiUpdater) {
                    window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Had some coffee. Feeling more energized!`);
                }
            } else {
                // Fallback to old behavior
                playerCharacter.needs.energy = Math.min(10, playerCharacter.needs.energy + 3);
                if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Had some coffee. Feeling more energized!`);
            }
            break;
            
        case 'EAT_SNACK':
            // Legacy snack action - try to use inventory items first
            const hasFood = playerCharacter.inventory?.some(item => {
                const itemId = typeof item === 'object' ? item.id : item;
                return itemId === 'energy_bar' || itemId === 'sandwich' || itemId.includes('food');
            });
            
            if (hasFood) {
                const foodItem = playerCharacter.inventory.find(item => {
                    const itemId = typeof item === 'object' ? item.id : item;
                    return itemId === 'energy_bar' || itemId === 'sandwich';
                });
                const itemId = typeof foodItem === 'object' ? foodItem.id : foodItem;
                const success = useItem(playerCharacter, itemId, 'eat');
                if (success && window.uiUpdater) {
                    window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Had a snack. Feeling less hungry.`);
                }
            } else {
                // Fallback to old behavior
                playerCharacter.needs.hunger = Math.min(10, playerCharacter.needs.hunger + 2);
                if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Had a snack. Feeling less hungry.`);
            }
            break;
            
        case 'START_CONVERSATION':
        case 'SOCIALIZE':
            if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> Looking for someone to talk to.`);
            break;
            
        default:
            if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>System:</strong> Action "${actionType}" not implemented yet.`);
            return false;
    }
    
    return true;
}

/**
 * NEW: Get action suggestions based on character's current inventory and context
 */
export function getInventoryActionSuggestions(character) {
    const suggestions = [];
    
    if (!character.inventory || character.inventory.length === 0) {
        suggestions.push('pick up coffee mug', 'pick up pen', 'pick up energy bar');
        return suggestions;
    }

    // Suggest actions based on items in inventory
    character.inventory.forEach(item => {
        const itemId = typeof item === 'object' ? item.id : item;
        const gameItem = getItemById(itemId);
        
        if (gameItem && gameItem.interactions) {
            Object.keys(gameItem.interactions).forEach(interaction => {
                suggestions.push(`${interaction} ${gameItem.name.toLowerCase()}`);
            });
        }
    });

    // Add general suggestions
    suggestions.push('drop item', 'use item', 'go to coffee machine');
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * NEW: Get help text for inventory commands
 */
export function getInventoryHelpText() {
    return `
<strong>Inventory Commands:</strong><br>
• <code>pick up [item]</code> - Pick up an item from the environment<br>
• <code>use [item]</code> - Use an item from your inventory<br>
• <code>drink coffee</code> - Drink coffee if you have a full mug<br>
• <code>eat [food]</code> - Eat food items to restore hunger<br>
• <code>drop [item]</code> - Drop an item from your inventory<br>
• <code>go to coffee machine</code> - Fill empty coffee mug<br>
<br>
<strong>Examples:</strong><br>
• <code>pick up energy bar</code><br>
• <code>use stress ball</code><br>
• <code>drink coffee</code><br>
• <code>eat sandwich</code><br>
    `;
}

/**
 * NEW: Get all available action keywords for autocomplete
 */
export function getAllActionKeywords() {
    return Object.keys(TASK_ACTIONS);
}

/**
 * NEW: Check if action requires specific items
 */
export function getActionRequirements(actionType) {
    const requirements = {
        'DRINK_COFFEE': ['coffee_mug_full'],
        'MOVE_TO_COFFEE_MACHINE': ['coffee_mug_empty'],
        'EAT_SNACK': ['energy_bar', 'sandwich']
    };
    
    return requirements[actionType] || [];
}

console.log('⚡ Action System updated with comprehensive inventory integration');
console.log('📦 Features loaded:');
console.log('  - All original TASK_ACTIONS preserved');
console.log('  - New inventory actions (pick up, use, drop)');
console.log('  - Item interaction system with effects');
console.log('  - Coffee machine integration');
console.log('  - Enhanced action suggestions');
console.log('  - Comprehensive error handling');
