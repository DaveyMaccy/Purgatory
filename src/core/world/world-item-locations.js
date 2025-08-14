/**
 * WORLD ITEM LOCATIONS - Randomized initial placement of items in the office
 * 
 * This file defines probabilistic item placement throughout the office.
 * Items are randomly distributed at game start based on realistic probabilities.
 * 
 * IMPORTANT: This does NOT override character starting inventories from character creation.
 * Character inventories are preserved exactly as chosen during character creation.
 */

/**
 * Item placement templates with probability-based spawning
 * Each location has percentage chances for different item types and quantities
 */
export const WORLD_ITEM_PLACEMENT_RULES = {
    
    // ==================== STORAGE AREAS ====================
    
    // Main Office Storage Shelf (id: 63) - General office supplies
    "main_office_storage_shelf": {
        mapId: 63,
        name: "Main Office Storage Shelf",
        position: { x: 6, y: -16 },
        size: { width: 84, height: 36 },
        type: "storage",
        capacity: 50,
        description: "Large storage shelf with general office supplies",
        spawnRules: [
            { id: "pen", chance: 0.95, minQuantity: 15, maxQuantity: 30, description: "Standard ballpoint pens" },
            { id: "notebook", chance: 0.85, minQuantity: 8, maxQuantity: 20, description: "Spiral notebooks" },
            { id: "sticky_notes", chance: 0.90, minQuantity: 10, maxQuantity: 25, description: "Packs of sticky notes" },
            { id: "paper_clips", chance: 0.80, minQuantity: 5, maxQuantity: 15, description: "Boxes of paper clips" },
            { id: "stapler", chance: 0.70, minQuantity: 2, maxQuantity: 5, description: "Office staplers" },
            { id: "calculator", chance: 0.60, minQuantity: 2, maxQuantity: 6, description: "Basic calculators" },
            { id: "documents", chance: 0.95, minQuantity: 20, maxQuantity: 40, description: "Blank forms and papers" },
            { id: "flash_drive", chance: 0.75, minQuantity: 3, maxQuantity: 10, description: "USB flash drives" },
            { id: "business_cards", chance: 0.65, minQuantity: 5, maxQuantity: 15, description: "Blank business card templates" },
            { id: "hand_sanitizer", chance: 0.80, minQuantity: 3, maxQuantity: 8, description: "Bottles of hand sanitizer" }
        ]
    },

    // Main Office Storage Shelf 2 (id: 64) - Tech and personal supplies
    "main_office_storage_shelf_2": {
        mapId: 64,
        name: "Secondary Storage Shelf",
        position: { x: 107.333, y: -14.6667 },
        size: { width: 83.3333, height: 34.6667 },
        type: "storage",
        capacity: 40,
        description: "Secondary shelf with tech supplies and personal items",
        spawnRules: [
            { id: "laptop_charger", chance: 0.70, minQuantity: 2, maxQuantity: 6, description: "Laptop power adapters" },
            { id: "phone_charger", chance: 0.85, minQuantity: 4, maxQuantity: 10, description: "USB phone chargers" },
            { id: "headphones", chance: 0.60, minQuantity: 3, maxQuantity: 8, description: "Office headphones" },
            { id: "reading_glasses", chance: 0.50, minQuantity: 2, maxQuantity: 5, description: "Reading glasses (various strengths)" },
            { id: "stress_ball", chance: 0.75, minQuantity: 4, maxQuantity: 8, description: "Stress relief balls" },
            { id: "energy_bar", chance: 0.90, minQuantity: 8, maxQuantity: 20, description: "Energy bars for long work days" },
            { id: "tissue_box", chance: 0.85, minQuantity: 4, maxQuantity: 10, description: "Boxes of tissues" },
            { id: "hole_punch", chance: 0.40, minQuantity: 1, maxQuantity: 3, description: "3-hole punchers" },
            { id: "office_keys", chance: 0.30, minQuantity: 2, maxQuantity: 6, description: "Spare office keys" }
        ]
    },

    // Boss Office Bookshelf (id: 59) - Premium/executive items
    "boss_office_bookshelf": {
        mapId: 59,
        name: "Executive Bookshelf",
        position: { x: 52.6667, y: -332 },
        size: { width: 35.3333, height: 118.667 },
        type: "storage",
        capacity: 25,
        description: "Executive bookshelf with premium office supplies",
        spawnRules: [
            { id: "pen", chance: 0.85, minQuantity: 3, maxQuantity: 8, description: "Premium executive pens" },
            { id: "business_cards", chance: 0.90, minQuantity: 5, maxQuantity: 12, description: "Executive business cards" },
            { id: "documents", chance: 0.95, minQuantity: 8, maxQuantity: 15, description: "Important company documents" },
            { id: "calculator", chance: 0.70, minQuantity: 1, maxQuantity: 2, description: "Financial calculator" },
            { id: "reading_glasses", chance: 0.60, minQuantity: 1, maxQuantity: 2, description: "Executive reading glasses" },
            { id: "stress_ball", chance: 0.40, minQuantity: 1, maxQuantity: 3, description: "Executive stress balls" },
            { id: "notebook", chance: 0.80, minQuantity: 2, maxQuantity: 5, description: "Leather-bound notebooks" }
        ]
    },

    // Storage Closet Shelf (id: 44) - Cleaning and maintenance supplies
    "storage_closet_shelf": {
        mapId: 44,
        name: "Storage Closet Shelf",
        position: { x: 964, y: 9.33333 },
        size: { width: 72, height: 38.6667 },
        type: "storage",
        capacity: 30,
        description: "Closet with maintenance and cleaning supplies",
        spawnRules: [
            { id: "hand_sanitizer", chance: 0.95, minQuantity: 6, maxQuantity: 15, description: "Bulk hand sanitizer" },
            { id: "tissue_box", chance: 0.90, minQuantity: 8, maxQuantity: 15, description: "Tissue box supplies" },
            { id: "documents", chance: 0.70, minQuantity: 5, maxQuantity: 12, description: "Maintenance forms" },
            { id: "office_keys", chance: 0.60, minQuantity: 3, maxQuantity: 8, description: "Master key sets" },
            { id: "flash_drive", chance: 0.40, minQuantity: 1, maxQuantity: 4, description: "Backup drives" },
            { id: "energy_bar", chance: 0.80, minQuantity: 10, maxQuantity: 25, description: "Emergency snack supplies" }
        ]
    },

    // ==================== KITCHEN & BREAK ROOM ====================

    // Kitchen Fridge (id: 28) - Food and drinks (restocked daily)
    "kitchen_fridge": {
        mapId: 28,
        name: "Kitchen Refrigerator",
        position: { x: 674, y: 536 },
        size: { width: 81, height: 39 },
        type: "appliance",
        capacity: 25,
        description: "Office refrigerator with food and drinks",
        restockDaily: true, // Special flag for daily restocking
        spawnRules: [
            { id: "sandwich", chance: 0.80, minQuantity: 3, maxQuantity: 8, description: "Prepared sandwiches" },
            { id: "energy_bar", chance: 0.90, minQuantity: 5, maxQuantity: 12, description: "Energy bars" },
            { id: "breath_mints", chance: 0.70, minQuantity: 2, maxQuantity: 6, description: "Mint packages" },
            // Note: Coffee mugs are not stored in fridge - they're near coffee machine
        ]
    },

    // Kitchen Coffee Machine Area (id: 25) - Coffee supplies
    "kitchen_coffee_machine": {
        mapId: 25,
        name: "Coffee Machine Area",
        position: { x: 597, y: 544 },
        size: { width: 64, height: 53 },
        type: "appliance",
        capacity: 15,
        description: "Coffee machine with supplies",
        spawnRules: [
            { id: "coffee_mug_empty", chance: 0.95, minQuantity: 5, maxQuantity: 12, description: "Clean empty coffee mugs" },
            { id: "coffee_mug_full", chance: 0.60, minQuantity: 1, maxQuantity: 3, description: "Fresh brewed coffee" },
            // Coffee machine always has coffee available - handled by interaction system
        ]
    },

    // Break Room Vending Machine (id: 16) - Snacks and drinks
    "break_room_vending_machine": {
        mapId: 16,
        name: "Vending Machine",
        position: { x: 299, y: 470 },
        size: { width: 76, height: 35 },
        type: "appliance",
        capacity: 20,
        description: "Snack and drink vending machine",
        spawnRules: [
            { id: "energy_bar", chance: 0.95, minQuantity: 8, maxQuantity: 15, description: "Vending machine energy bars" },
            { id: "breath_mints", chance: 0.80, minQuantity: 4, maxQuantity: 8, description: "Mint packages" },
            // Note: Vending machine items require coins - future enhancement
        ]
    },

    // Break Room Coffee Table (id: 13) - Personal items left behind
    "break_room_coffee_table": {
        mapId: 13,
        name: "Break Room Coffee Table",
        position: { x: 201, y: 634 },
        size: { width: 34, height: 55 },
        type: "furniture",
        capacity: 8,
        description: "Coffee table where people leave personal items",
        spawnRules: [
            { id: "coffee_mug_empty", chance: 0.70, minQuantity: 1, maxQuantity: 3, description: "Forgotten empty mugs" },
            { id: "smartphone", chance: 0.30, minQuantity: 0, maxQuantity: 1, description: "Lost phone" },
            { id: "pen", chance: 0.60, minQuantity: 1, maxQuantity: 3, description: "Pens left behind" },
            { id: "notebook", chance: 0.40, minQuantity: 0, maxQuantity: 1, description: "Personal notebook" },
            { id: "stress_ball", chance: 0.50, minQuantity: 0, maxQuantity: 2, description: "Stress balls" }
        ]
    },

    // Break Room Table (id: 18) - Larger table with more items
    "break_room_table": {
        mapId: 18,
        name: "Break Room Table",
        position: { x: 415, y: 583 },
        size: { width: 64, height: 55 },
        type: "furniture",
        capacity: 12,
        description: "Main break room table",
        spawnRules: [
            { id: "coffee_mug_empty", chance: 0.80, minQuantity: 2, maxQuantity: 5, description: "Empty mugs needing washing" },
            { id: "pen", chance: 0.75, minQuantity: 2, maxQuantity: 6, description: "Pens scattered on table" },
            { id: "notebook", chance: 0.60, minQuantity: 1, maxQuantity: 3, description: "Personal notebooks" },
            { id: "documents", chance: 0.50, minQuantity: 1, maxQuantity: 4, description: "Work papers" },
            { id: "sticky_notes", chance: 0.70, minQuantity: 1, maxQuantity: 3, description: "Sticky note pads" }
        ]
    },

    // ==================== MEETING ROOM ====================

    // Meeting Room Table (id: 30) - Meeting supplies
    "meeting_room_table": {
        mapId: 30,
        name: "Meeting Room Table",
        position: { x: 682, y: 287 },
        size: { width: 174, height: 81 },
        type: "furniture",
        capacity: 20,
        description: "Large meeting table with presentation supplies",
        spawnRules: [
            { id: "pen", chance: 0.90, minQuantity: 8, maxQuantity: 15, description: "Meeting pens for attendees" },
            { id: "notebook", chance: 0.85, minQuantity: 5, maxQuantity: 10, description: "Meeting notebooks" },
            { id: "documents", chance: 0.80, minQuantity: 10, maxQuantity: 20, description: "Meeting agendas and handouts" },
            { id: "sticky_notes", chance: 0.70, minQuantity: 3, maxQuantity: 8, description: "Brainstorming sticky notes" },
            { id: "business_cards", chance: 0.60, minQuantity: 5, maxQuantity: 12, description: "Business cards for networking" },
            { id: "coffee_mug_empty", chance: 0.75, minQuantity: 2, maxQuantity: 6, description: "Mugs from previous meetings" }
        ]
    },

    // Meeting Room Whiteboard Area (id: 31) - Presentation supplies
    "meeting_room_whiteboard": {
        mapId: 31,
        name: "Meeting Room Whiteboard",
        position: { x: 778, y: 171 },
        size: { width: 79, height: 57 },
        type: "furniture",
        capacity: 8,
        description: "Whiteboard with presentation supplies",
        spawnRules: [
            { id: "pen", chance: 0.95, minQuantity: 3, maxQuantity: 8, description: "Whiteboard markers" },
            { id: "sticky_notes", chance: 0.80, minQuantity: 2, maxQuantity: 5, description: "Planning sticky notes" },
            { id: "documents", chance: 0.70, minQuantity: 2, maxQuantity: 6, description: "Presentation materials" }
        ]
    },

    // ==================== OFFICE DESKS ====================

    // Boss Office Desk (id: 60) - Executive desk items
    "boss_office_desk": {
        mapId: 60,
        name: "Executive Desk",
        position: { x: 100.667, y: -159.333 },
        size: { width: 138.667, height: 60 },
        type: "desk",
        capacity: 15,
        description: "Executive desk with premium items",
        spawnRules: [
            { id: "pen", chance: 0.90, minQuantity: 3, maxQuantity: 6, description: "Executive pens" },
            { id: "business_cards", chance: 0.95, minQuantity: 8, maxQuantity: 15, description: "Executive business cards" },
            { id: "documents", chance: 0.90, minQuantity: 5, maxQuantity: 12, description: "Important documents" },
            { id: "calculator", chance: 0.80, minQuantity: 1, maxQuantity: 2, description: "Financial calculator" },
            { id: "stress_ball", chance: 0.60, minQuantity: 1, maxQuantity: 2, description: "Executive stress relief" },
            { id: "coffee_mug_empty", chance: 0.70, minQuantity: 1, maxQuantity: 2, description: "Personal coffee mug" }
        ]
    },

    // HR Office Desk (id: 52) - HR-specific items
    "hr_office_desk": {
        mapId: 52,
        name: "HR Office Desk",
        position: { x: 417.333, y: -185.333 },
        size: { width: 58.6667, height: 100 },
        type: "desk",
        capacity: 12,
        description: "HR desk with personnel forms and supplies",
        spawnRules: [
            { id: "pen", chance: 0.90, minQuantity: 4, maxQuantity: 8, description: "HR pens for forms" },
            { id: "documents", chance: 0.95, minQuantity: 8, maxQuantity: 15, description: "HR forms and paperwork" },
            { id: "business_cards", chance: 0.80, minQuantity: 5, maxQuantity: 10, description: "HR business cards" },
            { id: "stapler", chance: 0.70, minQuantity: 1, maxQuantity: 2, description: "Document stapler" },
            { id: "calculator", chance: 0.60, minQuantity: 1, maxQuantity: 1, description: "Payroll calculator" },
            { id: "coffee_mug_empty", chance: 0.60, minQuantity: 1, maxQuantity: 1, description: "HR manager's mug" }
        ]
    },

    // Reception Area Desk (id: 69) - Front desk supplies
    "reception_area_desk": {
        mapId: 69,
        name: "Reception Desk",
        position: { x: -332, y: -190.667 },
        size: { width: 181.333, height: 52 },
        type: "desk",
        capacity: 18,
        description: "Reception desk with visitor and administrative supplies",
        spawnRules: [
            { id: "pen", chance: 0.95, minQuantity: 6, maxQuantity: 12, description: "Visitor sign-in pens" },
            { id: "business_cards", chance: 0.85, minQuantity: 10, maxQuantity: 20, description: "Company business cards" },
            { id: "documents", chance: 0.90, minQuantity: 8, maxQuantity: 15, description: "Visitor forms and info" },
            { id: "sticky_notes", chance: 0.80, minQuantity: 3, maxQuantity: 6, description: "Message sticky notes" },
            { id: "tissue_box", chance: 0.70, minQuantity: 1, maxQuantity: 3, description: "Tissue boxes for visitors" },
            { id: "hand_sanitizer", chance: 0.85, minQuantity: 1, maxQuantity: 3, description: "Hand sanitizer for public use" }
        ]
    },

    // ==================== MISCELLANEOUS AREAS ====================

    // Main Office Printer (id: 149) - Printer supplies
    "main_office_printer": {
        mapId: 149,
        name: "Office Printer",
        position: { x: 260, y: 203.333 },
        size: { width: 71.3333, height: 30.6667 },
        type: "office_equipment",
        capacity: 10,
        description: "Main office printer with supplies",
        spawnRules: [
            { id: "documents", chance: 0.85, minQuantity: 15, maxQuantity: 30, description: "Blank paper for printing" },
            { id: "stapler", chance: 0.70, minQuantity: 1, maxQuantity: 2, description: "Printer area stapler" },
            { id: "paper_clips", chance: 0.60, minQuantity: 2, maxQuantity: 5, description: "Paper clips for organizing" }
        ]
    },

    // Kitchen Sink Area (id: 26) - Cleaning supplies and forgotten items
    "kitchen_sink": {
        mapId: 26,
        name: "Kitchen Sink",
        position: { x: 731, y: 635 },
        size: { width: 28, height: 111 },
        type: "appliance",
        capacity: 8,
        description: "Kitchen sink area with cleaning supplies",
        spawnRules: [
            { id: "coffee_mug_empty", chance: 0.90, minQuantity: 3, maxQuantity: 8, description: "Dirty mugs waiting to be washed" },
            { id: "hand_sanitizer", chance: 0.70, minQuantity: 1, maxQuantity: 2, description: "Sink-side hand sanitizer" }
        ]
    }
};

/**
 * Special restocking rules for specific locations
 */
export const DAILY_RESTOCK_RULES = {
    "kitchen_fridge": {
        restockTime: "09:00", // 9 AM daily
        spawnRules: [
            { id: "sandwich", chance: 0.85, minQuantity: 4, maxQuantity: 10, description: "Fresh daily sandwiches" },
            { id: "energy_bar", chance: 0.90, minQuantity: 6, maxQuantity: 15, description: "Restocked energy bars" },
            { id: "breath_mints", chance: 0.75, minQuantity: 3, maxQuantity: 8, description: "Fresh mints" }
        ]
    }
};

/**
 * Generate random items for a location based on spawn rules
 */
export function generateLocationItems(locationKey) {
    const location = WORLD_ITEM_PLACEMENT_RULES[locationKey];
    if (!location || !location.spawnRules) {
        console.warn(`⚠️ No spawn rules found for location: ${locationKey}`);
        return [];
    }

    const generatedItems = [];
    
    location.spawnRules.forEach(rule => {
        // Roll for chance
        if (Math.random() <= rule.chance) {
            // Generate random quantity within range
            const quantity = Math.floor(Math.random() * (rule.maxQuantity - rule.minQuantity + 1)) + rule.minQuantity;
            
            if (quantity > 0) {
                generatedItems.push({
                    id: rule.id,
                    quantity: quantity,
                    description: rule.description,
                    location: locationKey,
                    placedAt: Date.now()
                });
            }
        }
    });

    console.log(`🎲 Generated ${generatedItems.length} item types for ${location.name}`);
    return generatedItems;
}

/**
 * Generate initial world state with all items placed randomly
 */
export function generateInitialWorldItems() {
    const worldItems = {};
    
    // Generate items for each location
    Object.keys(WORLD_ITEM_PLACEMENT_RULES).forEach(locationKey => {
        worldItems[locationKey] = {
            ...WORLD_ITEM_PLACEMENT_RULES[locationKey],
            items: generateLocationItems(locationKey),
            lastUpdated: Date.now()
        };
    });

    console.log(`🌍 Generated initial world items for ${Object.keys(worldItems).length} locations`);
    return worldItems;
}

/**
 * Restock daily items (called by game timer)
 */
export function restockDailyItems(worldItems, currentTime) {
    const currentHour = new Date(currentTime).getHours();
    const currentMinute = new Date(currentTime).getMinutes();
    
    Object.keys(DAILY_RESTOCK_RULES).forEach(locationKey => {
        const restockRule = DAILY_RESTOCK_RULES[locationKey];
        const [restockHour, restockMinute] = restockRule.restockTime.split(':').map(Number);
        
        // Check if it's time to restock (within 1 minute window)
        if (currentHour === restockHour && Math.abs(currentMinute - restockMinute) <= 1) {
            const location = worldItems[locationKey];
            if (location) {
                // Clear existing items and regenerate
                location.items = [];
                
                restockRule.spawnRules.forEach(rule => {
                    if (Math.random() <= rule.chance) {
                        const quantity = Math.floor(Math.random() * (rule.maxQuantity - rule.minQuantity + 1)) + rule.minQuantity;
                        
                        if (quantity > 0) {
                            location.items.push({
                                id: rule.id,
                                quantity: quantity,
                                description: rule.description,
                                location: locationKey,
                                placedAt: Date.now(),
                                restocked: true
                            });
                        }
                    }
                });
                
                location.lastUpdated = Date.now();
                console.log(`🔄 Restocked ${location.name} with ${location.items.length} item types`);
            }
        }
    });
}

/**
 * Remove item from world location when picked up by player
 */
export function removeItemFromLocation(worldItems, locationKey, itemId, quantity = 1) {
    const location = worldItems[locationKey];
    if (!location || !location.items) {
        console.warn(`⚠️ Location ${locationKey} not found or has no items`);
        return false;
    }

    const itemIndex = location.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
        console.warn(`⚠️ Item ${itemId} not found in ${locationKey}`);
        return false;
    }

    const item = location.items[itemIndex];
    
    if (item.quantity <= quantity) {
        // Remove item entirely
        location.items.splice(itemIndex, 1);
        console.log(`📦 Removed all ${itemId} from ${locationKey}`);
    } else {
        // Reduce quantity
        item.quantity -= quantity;
        console.log(`📦 Removed ${quantity}x ${itemId} from ${locationKey} (${item.quantity} remaining)`);
    }

    location.lastUpdated = Date.now();
    return true;
}

/**
 * Add item to world location (rare - for dropping items)
 */
export function addItemToLocation(worldItems, locationKey, itemId, quantity = 1) {
    const location = worldItems[locationKey];
    if (!location) {
        console.warn(`⚠️ Location ${locationKey} not found`);
        return false;
    }

    if (!location.items) {
        location.items = [];
    }

    // Check if item already exists
    const existingItem = location.items.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        location.items.push({
            id: itemId,
            quantity: quantity,
            description: `Dropped ${itemId}`,
            location: locationKey,
            placedAt: Date.now(),
            dropped: true
        });
    }

    location.lastUpdated = Date.now();
    console.log(`📦 Added ${quantity}x ${itemId} to ${locationKey}`);
    return true;
}

/**
 * Get all available items at a location for interaction
 */
export function getLocationItems(worldItems, locationKey) {
    const location = worldItems[locationKey];
    if (!location || !location.items) {
        return [];
    }

    return location.items.filter(item => item.quantity > 0);
}

/**
 * Get all locations that contain a specific item
 */
export function findItemLocations(worldItems, itemId) {
    const locations = [];
    
    Object.keys(worldItems).forEach(locationKey => {
        const location = worldItems[locationKey];
        if (location && location.items) {
            const hasItem = location.items.some(item => item.id === itemId && item.quantity > 0);
            if (hasItem) {
                locations.push({
                    locationKey,
                    name: location.name,
                    position: location.position
                });
            }
        }
    });

    return locations;
}

console.log('🗺️ World Item Locations system loaded - Randomized placement with finite resources');
