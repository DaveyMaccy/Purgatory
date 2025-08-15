/**
 * WORLD STATE MANAGER - Integration layer for world items and game state
 * 
 * This file manages the connection between the world item placement system
 * and the existing game state. It ensures that:
 * 1. Character starting inventories from character creation are preserved
 * 2. World items are properly tracked and updated
 * 3. Item pickup/drop operations update both character and world state
 * 4. Daily restocking occurs automatically
 */

import { 
    generateInitialWorldItems, 
    restockDailyItems, 
    removeItemFromLocation, 
    addItemToLocation,
    getLocationItems,
    findItemLocations,
    WORLD_ITEM_PLACEMENT_RULES 
} from './world-item-locations.js';

import { addItemToInventory, removeItemFromInventory } from '../systems/inventory-system.js';

export class WorldStateManager {
    constructor() {
        this.worldItems = null; // Will be initialized when world loads
        this.lastRestockTime = null;
        this.gameStartTime = Date.now();
        
        console.log('🌍 WorldStateManager initialized');
    }

    /**
     * Initialize world items - called during game startup AFTER characters are loaded
     * This ensures character inventories are not overridden
     */
    initializeWorldItems() {
        console.log('🎲 Generating initial world item placement...');
        
        // Generate random item placement for all locations
        this.worldItems = generateInitialWorldItems();
        
        // Set initial restock time
        this.lastRestockTime = Date.now();
        
        console.log(`✅ World items initialized for ${Object.keys(this.worldItems).length} locations`);
        
        // Log summary of generated items
        this.logWorldItemSummary();
        
        return this.worldItems;
    }

    /**
     * Update world state - called by game loop
     */
    update(deltaTime, currentTime) {
        if (!this.worldItems) return;

        // Check for daily restocking (every 24 hours)
        const timeSinceLastRestock = currentTime - this.lastRestockTime;
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        if (timeSinceLastRestock >= TWENTY_FOUR_HOURS) {
            this.performDailyRestock(currentTime);
            this.lastRestockTime = currentTime;
        }
    }

    /**
     * Perform daily restocking of items like fridge contents
     */
    performDailyRestock(currentTime) {
        console.log('🔄 Performing daily item restock...');
        restockDailyItems(this.worldItems, currentTime);
    }

    /**
     * Handle player picking up item from world location
     */
    pickupItemFromLocation(character, locationKey, itemId, quantity = 1) {
        if (!this.worldItems || !character) {
            console.warn('⚠️ Cannot pickup item: world items or character not available');
            return false;
        }

        // Check if location exists and has the item
        const locationItems = getLocationItems(this.worldItems, locationKey);
        const targetItem = locationItems.find(item => item.id === itemId);

        if (!targetItem) {
            console.warn(`⚠️ Item ${itemId} not found at ${locationKey}`);
            return false;
        }

        if (targetItem.quantity < quantity) {
            console.warn(`⚠️ Not enough ${itemId} at ${locationKey} (requested: ${quantity}, available: ${targetItem.quantity})`);
            return false;
        }

        // Remove from world location
        const worldRemoveSuccess = removeItemFromLocation(this.worldItems, locationKey, itemId, quantity);
        if (!worldRemoveSuccess) {
            return false;
        }

        // Add to character inventory
        const inventoryAddSuccess = addItemToInventory(character, itemId, quantity);
        if (!inventoryAddSuccess) {
            // If inventory add fails, put item back in world
            addItemToLocation(this.worldItems, locationKey, itemId, quantity);
            console.warn(`⚠️ Could not add ${itemId} to ${character.name}'s inventory`);
            return false;
        }

        console.log(`✅ ${character.name} picked up ${quantity}x ${itemId} from ${locationKey}`);

        // Notify UI if this is the player character
        if (character.isPlayer && window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${character.name}:</strong> Picked up ${itemId} from ${this.getLocationDisplayName(locationKey)}.`);
            window.uiUpdater.updateCharacterData(character);
        }

        return true;
    }

    /**
     * Handle player dropping item at location
     */
    dropItemAtLocation(character, locationKey, itemId, quantity = 1) {
        if (!this.worldItems || !character) {
            console.warn('⚠️ Cannot drop item: world items or character not available');
            return false;
        }

        // Remove from character inventory
        const inventoryRemoveSuccess = removeItemFromInventory(character, itemId, quantity);
        if (!inventoryRemoveSuccess) {
            console.warn(`⚠️ ${character.name} does not have ${itemId} to drop`);
            return false;
        }

        // Add to world location
        const worldAddSuccess = addItemToLocation(this.worldItems, locationKey, itemId, quantity);
        if (!worldAddSuccess) {
            // If world add fails, put item back in inventory
            addItemToInventory(character, itemId, quantity);
            console.warn(`⚠️ Could not drop ${itemId} at ${locationKey}`);
            return false;
        }

        console.log(`✅ ${character.name} dropped ${quantity}x ${itemId} at ${locationKey}`);

        // Notify UI if this is the player character
        if (character.isPlayer && window.uiUpdater) {
            window.uiUpdater.addChatMessage(`<strong>${character.name}:</strong> Dropped ${itemId} at ${this.getLocationDisplayName(locationKey)}.`);
            window.uiUpdater.updateCharacterData(character);
        }

        return true;
    }

    /**
     * Get items available at a specific location
     */
    getItemsAtLocation(locationKey) {
        if (!this.worldItems) return [];
        return getLocationItems(this.worldItems, locationKey);
    }

    /**
     * Find all locations that contain a specific item
     */
    findItemInWorld(itemId) {
        if (!this.worldItems) return [];
        return findItemLocations(this.worldItems, itemId);
    }

    /**
     * Get location display name for UI
     */
    getLocationDisplayName(locationKey) {
        const location = WORLD_ITEM_PLACEMENT_RULES[locationKey];
        return location ? location.name : locationKey;
    }

    /**
     * Get nearby locations for character interaction
     */
    getNearbyInteractableLocations(characterPosition, radius = 100) {
        if (!this.worldItems) return [];

        const nearbyLocations = [];

        Object.keys(this.worldItems).forEach(locationKey => {
            const location = this.worldItems[locationKey];
            if (!location.position) return;

            // Calculate distance
            const dx = location.position.x - characterPosition.x;
            const dy = location.position.y - characterPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius) {
                const items = getLocationItems(this.worldItems, locationKey);
                if (items.length > 0) {
                    nearbyLocations.push({
                        locationKey,
                        name: location.name,
                        distance,
                        items: items.map(item => `${item.quantity}x ${item.id}`),
                        position: location.position
                    });
                }
            }
        });

        // Sort by distance
        nearbyLocations.sort((a, b) => a.distance - b.distance);

        return nearbyLocations;
    }

    /**
     * Get interaction suggestions for nearby locations
     */
    getInteractionSuggestions(character) {
        const nearby = this.getNearbyInteractableLocations(character.position);
        const suggestions = [];

        nearby.slice(0, 3).forEach(location => { // Limit to 3 closest locations
            location.items.slice(0, 2).forEach(itemDesc => { // Limit to 2 items per location
                const itemId = itemDesc.split('x ')[1]; // Extract item ID from "3x pen" format
                suggestions.push(`pick up ${itemId} from ${location.name.toLowerCase()}`);
            });
        });

        return suggestions;
    }

    /**
     * Serialize world state for saving
     */
    serialize() {
        return {
            worldItems: this.worldItems,
            lastRestockTime: this.lastRestockTime,
            gameStartTime: this.gameStartTime
        };
    }

    /**
     * Load world state from save data
     */
    deserialize(data) {
        this.worldItems = data.worldItems || null;
        this.lastRestockTime = data.lastRestockTime || Date.now();
        this.gameStartTime = data.gameStartTime || Date.now();
        
        console.log('✅ World state loaded from save data');
    }

    /**
     * Debug: Log summary of world items
     */
    logWorldItemSummary() {
        if (!this.worldItems) return;

        console.log('📋 World Item Summary:');
        Object.keys(this.worldItems).forEach(locationKey => {
            const location = this.worldItems[locationKey];
            const totalItems = location.items.reduce((sum, item) => sum + item.quantity, 0);
            console.log(`  📍 ${location.name}: ${location.items.length} types, ${totalItems} total items`);
        });
    }

    /**
     * Debug: Get world statistics
     */
    getWorldStatistics() {
        if (!this.worldItems) {
            return { locations: 0, itemTypes: 0, totalItems: 0 };
        }

        let totalItems = 0;
        let itemTypes = new Set();

        Object.values(this.worldItems).forEach(location => {
            location.items.forEach(item => {
                totalItems += item.quantity;
                itemTypes.add(item.id);
            });
        });

        return {
            locations: Object.keys(this.worldItems).length,
            itemTypes: itemTypes.size,
            totalItems: totalItems
        };
    }
}

console.log('🌍 WorldStateManager loaded - Ready for world item management');
