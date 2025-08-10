/**
 * STAGE 3 COMPLETE: Character Manager - Handles character lifecycle and positioning
 * STAGE 4 FIX: Fixed coordinate system to match canvas size (800x450)
 * 
 * Handles all character-related operations including:
 * - Loading characters from character creator
 * - Character initialization and positioning
 * - Character updates and state management
 * - Integration with world navigation grid
 * - Player character identification
 */

import { Character } from './character.js';

export class CharacterManager {
    constructor() {
        this.characters = [];
        this.playerCharacter = null;
        
        console.log('👥 CharacterManager initialized');
    }

    /**
     * Load characters from the character creator data
     * @param {Array} charactersData - Array of character data from character creator
     */
    loadCharacters(charactersData) {
        console.log('📝 Loading characters from character creator:', charactersData);
        
        // Clear existing characters
        this.characters = [];
        this.playerCharacter = null;
        
        // Convert character creator data to Character instances
        charactersData.forEach((charData, index) => {
            try {
                // Create Character instance
                const character = new Character(charData);
                
                // Set as player character if it's the first one or explicitly marked
                if (index === 0 || charData.isPlayer) {
                    character.isPlayer = true;
                    this.playerCharacter = character;
                    console.log(`🎯 Set ${character.name} as player character`);
                }
                
                // Add to characters array
                this.characters.push(character);
                console.log(`✅ Created character: ${character.name} (${character.jobRole})`);
                
            } catch (error) {
                console.error(`❌ Failed to create character from data:`, charData, error);
            }
        });
        
        console.log(`📋 Loaded ${this.characters.length} characters total`);
    }

    /**
     * Initialize all characters - called after world is set up
     */
    initializeCharacters() {
        console.log('🔧 Initializing characters...');
        
        this.characters.forEach(character => {
            try {
                // Initialize character systems
                character.initializeNeeds();
                
                // Set initial action state
                if (!character.actionState) {
                    character.setActionState('idle');
                }
                
                console.log(`✅ Initialized character: ${character.name}`);
                
            } catch (error) {
                console.error(`❌ Failed to initialize character ${character.name}:`, error);
            }
        });
    }

    /**
     * STAGE 4 FIXED: Initialize character positions with proper canvas coordinates
     * Characters spawn near desk areas within the 800x450 canvas bounds
     * @param {World} world - The game world instance, containing the navGrid.
     */
    initializeCharacterPositions(world) {
        if (!world) {
            console.error("❌ Cannot initialize character positions: world is not available.");
            return;
        }

        console.log('📍 Initializing character positions...');
        
        // Define desk areas in canvas coordinates (800x450 canvas)
        const deskAreas = [
            { x: 120, y: 180, name: "Desk 1" },  // Near left desk
            { x: 320, y: 180, name: "Desk 2" },  // Near center-left desk
            { x: 520, y: 180, name: "Desk 3" },  // Near center-right desk
            { x: 120, y: 320, name: "Desk 4" },  // Near bottom-left desk
            { x: 320, y: 320, name: "Desk 5" }   // Near bottom-center desk
        ];
        
        this.characters.forEach((character, index) => {
            let position;
            
            // Try to position near a desk area first
            if (index < deskAreas.length) {
                const deskArea = deskAreas[index];
                // Add some randomness around the desk area
                const offsetX = (Math.random() - 0.5) * 80; // ±40 pixels
                const offsetY = (Math.random() - 0.5) * 80; // ±40 pixels
                
                position = {
                    x: Math.max(60, Math.min(740, deskArea.x + offsetX)), // Keep within canvas bounds
                    y: Math.max(60, Math.min(390, deskArea.y + offsetY))  // Keep within canvas bounds
                };
                
                console.log(`🏢 Positioned ${character.name} near ${deskArea.name}: (${position.x}, ${position.y})`);
            } else {
                // Fallback for extra characters - random position in walkable area
                position = {
                    x: 100 + Math.random() * 600, // Random X between 100-700
                    y: 100 + Math.random() * 250  // Random Y between 100-350
                };
                
                console.log(`🎲 Random position for ${character.name}: (${position.x}, ${position.y})`);
            }
            
            // Validate position is within reasonable bounds
            if (this.isPositionValid(position)) {
                character.setPosition(position);
                console.log(`✅ Positioned ${character.name} at (${position.x}, ${position.y})`);
            } else {
                // Ultimate fallback - safe center position
                const safePosition = {
                    x: 200 + (index * 100) % 400,
                    y: 200 + (index * 50) % 150
                };
                character.setPosition(safePosition);
                console.log(`🔧 Safe fallback position for ${character.name}: (${safePosition.x}, ${safePosition.y})`);
            }
        });
        
        console.log('📍 Character positioning complete');
    }

    /**
     * Validate if position is within canvas bounds
     * @param {Object} position - Position {x, y}
     * @returns {boolean} True if position is valid
     */
    isPositionValid(position) {
        return position.x >= 50 && position.x <= 750 &&
               position.y >= 50 && position.y <= 400;
    }

    /**
     * Get the player character
     * @returns {Character|null} The player character or null if not found
     */
    getPlayerCharacter() {
        return this.playerCharacter;
    }

    /**
     * Get character by ID
     * @param {string} characterId - Character ID to find
     * @returns {Character|null} The character or null if not found
     */
    getCharacter(characterId) {
        return this.characters.find(char => char.id === characterId) || null;
    }

    /**
     * Get character by name (for debugging)
     * @param {string} name - Character name to find
     * @returns {Character|null} The character or null if not found
     */
    getCharacterByName(name) {
        return this.characters.find(char => char.name === name) || null;
    }

    /**
     * Get all NPC characters (non-player)
     * @returns {Array} Array of NPC characters
     */
    getNPCs() {
        return this.characters.filter(char => !char.isPlayer);
    }

    /**
     * Update all characters
     * @param {number} deltaTime - Time passed in milliseconds
     */
    update(deltaTime) {
        this.characters.forEach(character => {
            try {
                character.update(deltaTime);
            } catch (error) {
                console.error(`❌ Error updating character ${character.name}:`, error);
            }
        });
    }

    /**
     * Add a new character to the game (for dynamic character creation)
     * @param {Object} characterData - Character data
     * @returns {Character} The created character
     */
    addCharacter(characterData) {
        const character = new Character(characterData);
        this.characters.push(character);
        console.log(`➕ Added new character: ${character.name}`);
        return character;
    }

    /**
     * Remove a character from the game
     * @param {string} characterId - Character ID to remove
     * @returns {boolean} True if character was removed
     */
    removeCharacter(characterId) {
        const index = this.characters.findIndex(char => char.id === characterId);
        if (index !== -1) {
            const character = this.characters[index];
            this.characters.splice(index, 1);
            
            // Clear player reference if this was the player
            if (this.playerCharacter && this.playerCharacter.id === characterId) {
                this.playerCharacter = null;
            }
            
            console.log(`➖ Removed character: ${character.name}`);
            return true;
        }
        return false;
    }

    /**
     * Get comprehensive status for debugging
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            totalCharacters: this.characters.length,
            playerCharacter: this.playerCharacter ? this.playerCharacter.name : 'None',
            npcCount: this.getNPCs().length,
            charactersWithPositions: this.characters.filter(char => char.position).length,
            characterNames: this.characters.map(char => char.name)
        };
    }

    /**
     * Get all character positions for renderer updates
     * @returns {Array} Array of {id, name, x, y, isPlayer} objects
     */
    getCharacterPositions() {
        return this.characters.map(char => ({
            id: char.id,
            name: char.name,
            x: char.position?.x || 0,
            y: char.position?.y || 0,
            isPlayer: char.isPlayer
        }));
    }

    /**
     * Force all characters to notify their observers (useful for debugging)
     */
    forceNotifyObservers() {
        this.characters.forEach(character => {
            character.notifyObservers('debug_update');
        });
        console.log('🔄 Forced observer notifications for all characters');
    }
}
