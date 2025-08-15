/**
 * INVENTORY SYSTEM - Comprehensive inventory management
 * 
 * This file manages:
 * - All in-game items with office theme
 * - Character inventory operations
 * - Item interactions and combinations
 * - Task item requirements
 * - UI state updates
 */

// ==================== IN-GAME ITEMS CATALOG ====================

/**
 * Complete catalog of all items in the game organized by category
 */
export const GAME_ITEMS = {
    // Work Tools & Equipment
    WORK_TOOLS: {
        laptop: {
            id: 'laptop',
            name: 'Laptop',
            description: 'A work laptop for completing desk tasks',
            category: 'work_tools',
            canHold: false, // Too big to hold, stays at desk
            required_for: ['DESK_WORK', 'CREATIVE_WORK'],
            stackable: false,
            weight: 2.5
        },
        documents: {
            id: 'documents',
            name: 'Documents',
            description: 'Important papers and forms to be printed or filed',
            category: 'work_tools',
            canHold: true,
            required_for: ['PRINTING'],
            stackable: true,
            weight: 0.1
        },
        smartphone: {
            id: 'smartphone',
            name: 'Smartphone',
            description: 'Personal phone for communication and apps',
            category: 'work_tools',
            canHold: true,
            stackable: false,
            weight: 0.2
        },
        notebook: {
            id: 'notebook',
            name: 'Notebook',
            description: 'Paper notebook for taking notes and sketching',
            category: 'work_tools',
            canHold: true,
            stackable: false,
            weight: 0.3
        },
        pen: {
            id: 'pen',
            name: 'Pen',
            description: 'Writing instrument for signing and note-taking',
            category: 'work_tools',
            canHold: true,
            stackable: true,
            weight: 0.05
        },
        flash_drive: {
            id: 'flash_drive',
            name: 'Flash Drive',
            description: 'USB storage device for file transfers',
            category: 'work_tools',
            canHold: true,
            stackable: false,
            weight: 0.02
        },
        business_cards: {
            id: 'business_cards',
            name: 'Business Cards',
            description: 'Professional business cards for networking',
            category: 'work_tools',
            canHold: true,
            stackable: true,
            weight: 0.1
        }
    },

    // Food & Drinks
    CONSUMABLES: {
        coffee_mug_empty: {
            id: 'coffee_mug_empty',
            name: 'Empty Coffee Mug',
            description: 'An empty coffee mug that needs filling',
            category: 'consumables',
            canHold: true,
            stackable: false,
            weight: 0.3,
            interactions: {
                use_coffee_machine: 'coffee_mug_full'
            }
        },
        coffee_mug_full: {
            id: 'coffee_mug_full',
            name: 'Full Coffee Mug',
            description: 'A steaming hot cup of coffee',
            category: 'consumables',
            canHold: true,
            stackable: false,
            weight: 0.5,
            interactions: {
                drink: {
                    result: 'coffee_mug_empty',
                    effects: { energy: +30, stress: -10 },
                    duration: 5000 // 5 seconds to drink
                }
            }
        },
        energy_bar: {
            id: 'energy_bar',
            name: 'Energy Bar',
            description: 'A nutritious snack for quick energy',
            category: 'consumables',
            canHold: true,
            stackable: true,
            weight: 0.1,
            interactions: {
                eat: {
                    result: null, // Item consumed
                    effects: { hunger: +20, energy: +10 },
                    duration: 3000 // 3 seconds to eat
                }
            }
        },
        sandwich: {
            id: 'sandwich',
            name: 'Sandwich',
            description: 'A tasty lunch sandwich',
            category: 'consumables',
            canHold: true,
            stackable: false,
            weight: 0.4,
            interactions: {
                eat: {
                    result: null,
                    effects: { hunger: +50, energy: +10 },
                    duration: 8000 // 8 seconds to eat
                }
            }
        },
        breath_mints: {
            id: 'breath_mints',
            name: 'Breath Mints',
            description: 'Freshen breath for important meetings',
            category: 'consumables',
            canHold: true,
            stackable: true,
            weight: 0.05,
            interactions: {
                use: {
                    result: 'breath_mints', // Stay the same but with less quantity
                    effects: { charisma: +0.5 }, // Temporary boost
                    duration: 1000
                }
            }
        }
    },

    // Office Supplies
    OFFICE_SUPPLIES: {
        stapler: {
            id: 'stapler',
            name: 'Stapler',
            description: 'For binding documents together',
            category: 'office_supplies',
            canHold: true,
            stackable: false,
            weight: 0.5
        },
        paper_clips: {
            id: 'paper_clips',
            name: 'Paper Clips',
            description: 'Small metal clips for organizing papers',
            category: 'office_supplies',
            canHold: true,
            stackable: true,
            weight: 0.02
        },
        sticky_notes: {
            id: 'sticky_notes',
            name: 'Sticky Notes',
            description: 'Colorful notes for reminders and organization',
            category: 'office_supplies',
            canHold: true,
            stackable: true,
            weight: 0.05
        },
        calculator: {
            id: 'calculator',
            name: 'Calculator',
            description: 'For quick mathematical calculations',
            category: 'office_supplies',
            canHold: true,
            stackable: false,
            weight: 0.2
        },
        hole_punch: {
            id: 'hole_punch',
            name: 'Hole Punch',
            description: 'For punching holes in documents',
            category: 'office_supplies',
            canHold: false, // Too big
            stackable: false,
            weight: 1.0
        }
    },

    // Personal Items
    PERSONAL: {
        office_keys: {
            id: 'office_keys',
            name: 'Office Keys',
            description: 'Keys for office doors and cabinets',
            category: 'personal',
            canHold: true,
            stackable: false,
            weight: 0.1
        },
        reading_glasses: {
            id: 'reading_glasses',
            name: 'Reading Glasses',
            description: 'Glasses for better vision when working',
            category: 'personal',
            canHold: true,
            stackable: false,
            weight: 0.1,
            interactions: {
                wear: {
                    result: 'reading_glasses',
                    effects: { competence: +0.5 }, // Temporary boost
                    duration: 1000
                }
            }
        },
        headphones: {
            id: 'headphones',
            name: 'Headphones',
            description: 'For listening to music or blocking noise',
            category: 'personal',
            canHold: true,
            stackable: false,
            weight: 0.4,
            interactions: {
                wear: {
                    result: 'headphones',
                    effects: { stress: -1, social: -1 }, // Less social when wearing
                    duration: 1000
                }
            }
        },
        stress_ball: {
            id: 'stress_ball',
            name: 'Stress Ball',
            description: 'Squeeze for stress relief',
            category: 'personal',
            canHold: true,
            stackable: false,
            weight: 0.1,
            interactions: {
                squeeze: {
                    result: 'stress_ball',
                    effects: { stress: -2 },
                    duration: 2000
                }
            }
        },
        hand_sanitizer: {
            id: 'hand_sanitizer',
            name: 'Hand Sanitizer',
            description: 'Keep hands clean and germ-free',
            category: 'personal',
            canHold: true,
            stackable: true,
            weight: 0.15
        },
        phone_charger: {
            id: 'phone_charger',
            name: 'Phone Charger',
            description: 'USB charger for smartphones',
            category: 'personal',
            canHold: true,
            stackable: false,
            weight: 0.2
        },
        laptop_charger: {
            id: 'laptop_charger',
            name: 'Laptop Charger',
            description: 'Power adapter for laptop',
            category: 'personal',
            canHold: true,
            stackable: false,
            weight: 0.8
        }
    },

    // Desk Decorations & Items
    DESK_ITEMS: {
        family_photo: {
            id: 'family_photo',
            name: 'Family Photo',
            description: 'A cherished photo of loved ones',
            category: 'desk_items',
            canHold: true,
            stackable: false,
            weight: 0.1,
            interactions: {
                look_at: {
                    result: 'family_photo',
                    effects: { stress: -1, social: +1 },
                    duration: 2000
                }
            }
        },
        desk_plant: {
            id: 'desk_plant',
            name: 'Desk Plant',
            description: 'A small potted plant for the desk',
            category: 'desk_items',
            canHold: false, // Too fragile to carry around
            stackable: false,
            weight: 1.5,
            interactions: {
                water: {
                    result: 'desk_plant',
                    effects: { stress: -1 },
                    duration: 3000
                }
            }
        },
        desk_calendar: {
            id: 'desk_calendar',
            name: 'Desk Calendar',
            description: 'Calendar for tracking dates and appointments',
            category: 'desk_items',
            canHold: false,
            stackable: false,
            weight: 0.5
        },
        desk_lamp: {
            id: 'desk_lamp',
            name: 'Desk Lamp',
            description: 'Adjustable lamp for better lighting',
            category: 'desk_items',
            canHold: false,
            stackable: false,
            weight: 2.0
        },
        award_trophy: {
            id: 'award_trophy',
            name: 'Award Trophy',
            description: 'Recognition for outstanding work',
            category: 'desk_items',
            canHold: true,
            stackable: false,
            weight: 1.0,
            interactions: {
                admire: {
                    result: 'award_trophy',
                    effects: { stress: -1, confidence: +1 },
                    duration: 3000
                }
            }
        },
        fidget_toy: {
            id: 'fidget_toy',
            name: 'Fidget Toy',
            description: 'Small toy for keeping hands busy',
            category: 'desk_items',
            canHold: true,
            stackable: false,
            weight: 0.1,
            interactions: {
                fidget: {
                    result: 'fidget_toy',
                    effects: { stress: -1 },
                    duration: 1500
                }
            }
        },
        tissue_box: {
            id: 'tissue_box',
            name: 'Tissue Box',
            description: 'Box of tissues for convenience',
            category: 'desk_items',
            canHold: false,
            stackable: false,
            weight: 0.3
        }
    }
};

// ==================== INVENTORY MANAGEMENT FUNCTIONS ====================

/**
 * Get all items as a flat array for easy searching
 */
export function getAllItems() {
    const allItems = [];
    for (const category of Object.values(GAME_ITEMS)) {
        for (const item of Object.values(category)) {
            allItems.push(item);
        }
    }
    return allItems;
}

/**
 * Find an item by ID
 */
export function getItemById(itemId) {
    for (const category of Object.values(GAME_ITEMS)) {
        if (category[itemId]) {
            return category[itemId];
        }
    }
    return null;
}

/**
 * Get items by category
 */
export function getItemsByCategory(categoryName) {
    const category = GAME_ITEMS[categoryName.toUpperCase()];
    return category ? Object.values(category) : [];
}

/**
 * Check if character has required items for a task
 */
export function hasRequiredItems(character, taskRequiredItems = []) {
    if (!taskRequiredItems || taskRequiredItems.length === 0) {
        return true;
    }

    const characterItems = [
        ...(character.inventory || []),
        ...(character.deskItems || [])
    ];

    // Handle both string and object format items
    const characterItemIds = characterItems.map(item => 
        typeof item === 'string' ? item.toLowerCase() : item.id || item.name || ''
    ).map(id => id.toLowerCase());

    return taskRequiredItems.every(requiredItem => {
        const requiredId = requiredItem.toLowerCase();
        return characterItemIds.includes(requiredId) || 
               characterItemIds.some(id => id.includes(requiredId));
    });
}

/**
 * Add item to character inventory
 */
export function addItemToInventory(character, itemId, quantity = 1) {
    if (!character.inventory) {
        character.inventory = [];
    }

    const item = getItemById(itemId);
    if (!item) {
        console.warn(`⚠️ Unknown item: ${itemId}`);
        return false;
    }

    // Check if item can be held
    if (!item.canHold) {
        console.warn(`⚠️ Item ${item.name} cannot be carried`);
        return false;
    }

    // Handle stackable items
    if (item.stackable) {
        const existingItem = character.inventory.find(invItem => 
            (typeof invItem === 'object' ? invItem.id : invItem) === itemId
        );

        if (existingItem) {
            if (typeof existingItem === 'object') {
                existingItem.quantity = (existingItem.quantity || 1) + quantity;
            } else {
                // Convert string to object for quantity tracking
                const index = character.inventory.indexOf(existingItem);
                character.inventory[index] = { id: itemId, quantity: quantity + 1 };
            }
        } else {
            character.inventory.push({ id: itemId, quantity });
        }
    } else {
        // Non-stackable items
        for (let i = 0; i < quantity; i++) {
            character.inventory.push({ id: itemId, quantity: 1 });
        }
    }

    console.log(`✅ Added ${quantity}x ${item.name} to ${character.name}'s inventory`);
    
   // Notify UI update if available
    if (window.uiUpdater && character.isPlayer) {
        window.uiUpdater.updateUI(character);
    }

    return true;
}

/**
 * Remove item from character inventory
 */
export function removeItemFromInventory(character, itemId, quantity = 1) {
    if (!character.inventory) {
        return false;
    }

    const itemIndex = character.inventory.findIndex(invItem => 
        (typeof invItem === 'object' ? invItem.id : invItem) === itemId
    );

    if (itemIndex === -1) {
        console.warn(`⚠️ Item ${itemId} not found in ${character.name}'s inventory`);
        return false;
    }

    const inventoryItem = character.inventory[itemIndex];
    
    if (typeof inventoryItem === 'object' && inventoryItem.quantity > quantity) {
        // Reduce quantity
        inventoryItem.quantity -= quantity;
    } else {
        // Remove entirely
        character.inventory.splice(itemIndex, 1);
    }

    console.log(`✅ Removed ${quantity}x ${itemId} from ${character.name}'s inventory`);
    
    /// Notify UI update if available
    if (window.uiUpdater && character.isPlayer) {
        window.uiUpdater.updateUI(character);
    }

    return true;
}

/**
 * Use item and apply its effects
 */
export function useItem(character, itemId, interactionType = 'use') {
    const item = getItemById(itemId);
    if (!item) {
        console.warn(`⚠️ Unknown item: ${itemId}`);
        return false;
    }

    const interaction = item.interactions?.[interactionType];
    if (!interaction) {
        console.warn(`⚠️ Item ${item.name} has no ${interactionType} interaction`);
        return false;
    }

    // Apply effects to character
    if (interaction.effects) {
        for (const [effect, value] of Object.entries(interaction.effects)) {
            if (character.needs && character.needs.hasOwnProperty(effect)) {
                character.needs[effect] = Math.max(0, Math.min(10, character.needs[effect] + value));
            } else if (character.skills && character.skills.hasOwnProperty(effect)) {
                character.skills[effect] = Math.max(1, Math.min(10, character.skills[effect] + value));
            }
        }
    }

    // Handle item transformation
    if (interaction.result) {
        if (interaction.result !== itemId) {
            // Transform item
            removeItemFromInventory(character, itemId, 1);
            if (interaction.result !== null) {
                addItemToInventory(character, interaction.result, 1);
            }
        }
    } else if (interaction.result === null) {
        // Consume item
        removeItemFromInventory(character, itemId, 1);
    }

    console.log(`✅ ${character.name} used ${item.name} (${interactionType})`);

    // Add to action transcript if available
    if (character.currentActionTranscript) {
        character.currentActionTranscript.push(`Used ${item.name}`);
    }

    return true;
}

/**
 * Combine items (crafting/assembly)
 */
export function combineItems(character, itemId1, itemId2) {
    const item1 = getItemById(itemId1);
    const item2 = getItemById(itemId2);
    
    if (!item1 || !item2) {
        console.warn(`⚠️ Cannot combine: unknown items`);
        return false;
    }

    // Define combination recipes
    const recipes = {
        'coffee_mug_empty+coffee_machine': 'coffee_mug_full',
        'documents+stapler': 'documents', // Stapled documents
        'pen+notebook': 'notebook', // Written notes
        'laptop+flash_drive': 'laptop' // Data transfer
    };

    const recipeKey1 = `${itemId1}+${itemId2}`;
    const recipeKey2 = `${itemId2}+${itemId1}`;
    
    const result = recipes[recipeKey1] || recipes[recipeKey2];
    
    if (result) {
        // Remove input items
        removeItemFromInventory(character, itemId1, 1);
        removeItemFromInventory(character, itemId2, 1);
        
        // Add result item
        addItemToInventory(character, result, 1);
        
        console.log(`✅ ${character.name} combined ${item1.name} + ${item2.name} = ${getItemById(result)?.name}`);
        return true;
    }

    console.warn(`⚠️ No recipe for combining ${item1.name} + ${item2.name}`);
    return false;
}

/**
 * Check character inventory weight (future enhancement)
 */
export function getInventoryWeight(character) {
    if (!character.inventory) return 0;

    return character.inventory.reduce((total, item) => {
        const gameItem = getItemById(typeof item === 'object' ? item.id : item);
        const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;
        return total + (gameItem?.weight || 0) * quantity;
    }, 0);
}

/**
 * Get starting inventory for a character based on their role
 */
export function getStartingInventory(jobRole) {
    const commonItems = ['smartphone', 'pen', 'office_keys'];
    
    const roleSpecificItems = {
        'Lead Developer': ['laptop', 'flash_drive', 'coffee_mug_empty', 'headphones'],
        'IT Specialist': ['laptop', 'flash_drive', 'documents', 'business_cards'],
        'Admin Assistant': ['notebook', 'sticky_notes', 'stapler', 'business_cards'],
        'Business Analyst': ['laptop', 'calculator', 'documents', 'coffee_mug_empty'],
        'Manager': ['business_cards', 'documents', 'coffee_mug_empty', 'stress_ball'],
        'Game Designer': ['notebook', 'pen', 'fidget_toy', 'coffee_mug_empty'],
        'QA Tester': ['laptop', 'sticky_notes', 'energy_bar', 'headphones']
    };

    return [...commonItems, ...(roleSpecificItems[jobRole] || ['energy_bar', 'coffee_mug_empty'])];
}

/**
 * Get starting desk items for a character based on their role
 */
export function getStartingDeskItems(jobRole) {
    const commonDeskItems = ['desk_calendar', 'tissue_box'];
    
    const roleSpecificDeskItems = {
        'Lead Developer': ['desk_lamp', 'award_trophy', 'desk_plant'],
        'IT Specialist': ['desk_lamp', 'fidget_toy'],
        'Admin Assistant': ['family_photo', 'desk_plant', 'desk_lamp'],
        'Business Analyst': ['desk_plant', 'award_trophy'],
        'Manager': ['family_photo', 'award_trophy', 'desk_plant'],
        'Game Designer': ['fidget_toy', 'award_trophy'],
        'QA Tester': ['desk_plant', 'fidget_toy']
    };

    return [...commonDeskItems, ...(roleSpecificDeskItems[jobRole] || ['desk_plant'])];
}

console.log('📦 Inventory System loaded - Comprehensive item management ready');
