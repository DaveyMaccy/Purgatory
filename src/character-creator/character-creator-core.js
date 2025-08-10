/**
 * Character Creator Core Module
 * Handles the main character creation logic and data management
 */

import { CONSTANTS } from './character-creator-constants.js';
import { CharacterCreatorUI } from './character-creator-ui.js';
import { CharacterCreatorEvents } from './character-creator-events.js';

export class CharacterCreatorCore {
    constructor() {
        this.characters = [];
        this.currentCharacterIndex = 0;
        this.officeType = 'Game Studio';
        this.globalAPIKey = '';
        this.ui = new CharacterCreatorUI(this);
        this.events = new CharacterCreatorEvents(this);
        
        console.log('🎭 Character Creator Core initialized');
    }

    /**
     * Initialize the character creator
     */
    async initialize(selectedOfficeType = 'Game Studio') {
        console.log('🎭 Initializing character creator...');
        
        try {
            this.officeType = selectedOfficeType;
            
            // Create default characters
            this.createDefaultCharacters();
            
            // Initialize UI
            await this.ui.initialize();
            
            // Setup event handlers
            this.events.initialize();
            
            console.log('✅ Character creator fully initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize character creator:', error);
            throw error;
        }
    }

    /**
     * Create default characters
     */
    createDefaultCharacters() {
        console.log('👥 Creating default characters...');
        
        this.characters = [
            this.createRandomCharacter(0),
            this.createRandomCharacter(1)
        ];
        
        // Set first character as player
        this.characters[0].isPlayer = true;
        this.characters[1].isPlayer = false;
        
        console.log(`✅ Created ${this.characters.length} default characters`);
    }

    /**
     * Create a random character
     */
    createRandomCharacter(index) {
        const gender = this.getRandomItem(CONSTANTS.GENDERS);
        const randomTags = this.getRandomItems(CONSTANTS.PERSONALITY_TAGS, 3, 6);
        const randomInventory = this.getRandomItems(CONSTANTS.INVENTORY_OPTIONS, 1, 3);
        const randomDeskItems = this.getRandomItems(CONSTANTS.DESK_ITEM_OPTIONS, 1, 2);
        
        // Use valid sprite index for 20 sprites
        const validSpriteIndex = Math.floor(Math.random() * 20);
        const spriteSheet = CONSTANTS.SPRITE_OPTIONS[validSpriteIndex];
        
        return {
            id: `char_${index}`,
            name: this.generateNameByGender(gender),
            isPlayer: false,
            gender: gender,
            office: this.officeType,
            jobRole: this.getRandomItem(CONSTANTS.JOB_ROLES_BY_OFFICE[this.officeType]),
            
            // Sprite information
            spriteSheet: spriteSheet,
            spriteIndex: validSpriteIndex,
            customPortrait: null,
            
            // Physical attributes
            physicalAttributes: {
                age: Math.floor(Math.random() * 30) + 22,
                height: Math.floor(Math.random() * 40) + 150,
                weight: Math.floor(Math.random() * 60) + 50,
                looks: Math.floor(Math.random() * 10) + 1,
                build: this.getRandomItem(CONSTANTS.PHYSICAL_BUILDS),
                gender: gender
            },
            
            // Skill attributes (using 1-10 scale as per original SSOT)
            skillAttributes: {
                competence: Math.floor(Math.random() * 10) + 1,
                laziness: Math.floor(Math.random() * 10) + 1,
                charisma: Math.floor(Math.random() * 10) + 1,
                leadership: Math.floor(Math.random() * 10) + 1
            },
            
            personalityTags: randomTags,
            inventory: randomInventory,
            deskItems: randomDeskItems,
            
            // API settings
            apiKey: '',
            
            // Game engine required fields
            position: { x: 0, y: 0 },
            actionState: 'idle',
            mood: 'Neutral',
            facingAngle: 90,
            maxSightRange: 250,
            isBusy: false,
            currentAction: null,
            currentActionTranscript: [],
            pendingIntent: null,
            heldItem: null,
            conversationId: null,
            shortTermMemory: [],
            longTermMemory: [],
            longTermGoal: null,
            assignedTask: null,
            pixiArmature: null,
            path: [],
            relationships: {}
        };
    }

    /**
     * Generate name based on gender
     */
    generateNameByGender(gender) {
        const names = CONSTANTS.NAMES_BY_GENDER[gender];
        if (!names) return 'Unknown Character';
        
        const firstName = this.getRandomItem(names.first);
        const lastName = this.getRandomItem(names.last);
        return `${firstName} ${lastName}`;
    }

    /**
     * Switch to a character tab
     */
    switchToTab(index) {
        if (index < 0 || index >= this.characters.length) {
            console.warn(`Invalid character index: ${index}`);
            return;
        }
        
        // Update current character from form before switching
        if (this.currentCharacterIndex !== index) {
            this.updateCharacterFromForm(this.currentCharacterIndex);
        }
        
        this.currentCharacterIndex = index;
        
        // Update UI
        this.ui.updateTabDisplay(index);
        this.ui.refreshCharacterPanel(index);
        
        console.log(`📝 Switched to character ${index + 1}: ${this.characters[index].name}`);
    }

    /**
     * Add new character
     */
    addNewCharacter() {
        if (this.characters.length >= 5) {
            alert('Maximum 5 characters allowed');
            return;
        }
        
        const newIndex = this.characters.length;
        const newCharacter = this.createRandomCharacter(newIndex);
        newCharacter.isPlayer = false;
        
        this.characters.push(newCharacter);
        
        // Update UI
        this.ui.recreateAllUI();
        this.switchToTab(newIndex);
        
        console.log(`✅ Added new character: ${newCharacter.name}`);
    }

    /**
     * Remove current character
     */
    removeCurrentCharacter() {
        if (this.characters.length <= 2) {
            alert('Minimum 2 characters required');
            return;
        }
        
        const removedCharacter = this.characters[this.currentCharacterIndex];
        
        // If removing player character, make first remaining character the player
        if (removedCharacter.isPlayer && this.characters.length > 1) {
            const nextPlayerIndex = this.currentCharacterIndex === 0 ? 1 : 0;
            this.characters[nextPlayerIndex].isPlayer = true;
        }
        
        this.characters.splice(this.currentCharacterIndex, 1);
        
        // Adjust current index
        if (this.currentCharacterIndex >= this.characters.length) {
            this.currentCharacterIndex = this.characters.length - 1;
        }
        
        // Update UI
        this.ui.recreateAllUI();
        this.switchToTab(this.currentCharacterIndex);
        
        console.log(`✅ Removed character: ${removedCharacter.name}`);
    }

    /**
     * Randomize current character
     */
    randomizeCurrentCharacter() {
        try {
            if (this.currentCharacterIndex >= 0 && this.currentCharacterIndex < this.characters.length) {
                const wasPlayer = this.characters[this.currentCharacterIndex].isPlayer;
                this.characters[this.currentCharacterIndex] = this.createRandomCharacter(this.currentCharacterIndex);
                this.characters[this.currentCharacterIndex].isPlayer = wasPlayer;
                
                // Update UI
                this.ui.refreshCharacterPanel(this.currentCharacterIndex);
                this.ui.updateTabDisplay(this.currentCharacterIndex);
                
                console.log(`✅ Randomized character ${this.currentCharacterIndex + 1}`);
            }
        } catch (error) {
            console.error('❌ Failed to randomize character:', error);
        }
    }

    /**
     * Randomize all characters
     */
    randomizeAllCharacters() {
        console.log('🎲 Randomizing all characters...');
        
        this.characters.forEach((char, index) => {
            const wasPlayer = char.isPlayer;
            this.characters[index] = this.createRandomCharacter(index);
            this.characters[index].isPlayer = wasPlayer;
        });
        
        // Update UI
        this.ui.recreateAllUI();
        this.switchToTab(this.currentCharacterIndex);
        
        console.log('✅ All characters randomized');
    }

    /**
     * Update character from form data
     */
    updateCharacterFromForm(index) {
        const character = this.characters[index];
        if (!character) return;
        
        // Update basic info
        const nameInput = document.getElementById(`name-${index}`);
        const genderSelect = document.getElementById(`gender-${index}`);
        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        const buildSelect = document.getElementById(`build-${index}`);
        const isPlayerCheckbox = document.getElementById(`isPlayer-${index}`);
        const apiKeyInput = document.getElementById(`api-key-${index}`);
        
        if (nameInput) character.name = nameInput.value;
        if (genderSelect) character.physicalAttributes.gender = genderSelect.value;
        if (jobRoleSelect) character.jobRole = jobRoleSelect.value;
        if (buildSelect) character.physicalAttributes.build = buildSelect.value;
        if (apiKeyInput) character.apiKey = apiKeyInput.value;
        
        // Handle player character selection
        if (isPlayerCheckbox) {
            if (isPlayerCheckbox.checked) {
                // Make this the only player character
                this.characters.forEach((char, i) => {
                    char.isPlayer = (i === index);
                });
            }
        }
        
        // Update personality tags, inventory, desk items
        this.updateCharacterLists(index);
    }

    /**
     * Update character lists (tags, inventory, desk items)
     */
    updateCharacterLists(index) {
        const character = this.characters[index];
        
        // Update personality tags
        const selectedTags = [];
        CONSTANTS.PERSONALITY_TAGS.forEach(tag => {
            const checkbox = document.getElementById(`personality-${index}-${tag}`);
            if (checkbox && checkbox.checked) {
                selectedTags.push(tag);
            }
        });
        character.personalityTags = selectedTags;
        
        // Update inventory (max 3)
        const selectedInventory = [];
        CONSTANTS.INVENTORY_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`inventory-${index}-${item}`);
            if (checkbox && checkbox.checked) {
                selectedInventory.push(item);
            }
        });
        character.inventory = selectedInventory.slice(0, 3);
        
        // Update desk items (max 2)
        const selectedDeskItems = [];
        CONSTANTS.DESK_ITEM_OPTIONS.forEach(item => {
            const checkbox = document.getElementById(`desk-item-${index}-${item}`);
            if (checkbox && checkbox.checked) {
                selectedDeskItems.push(item);
            }
        });
        character.deskItems = selectedDeskItems.slice(0, 2);
    }

    /**
     * Validate all characters
     */
    validateAllCharacters() {
        const errors = [];
        
        if (!this.characters || this.characters.length === 0) {
            errors.push('No characters created');
            return errors;
        }
        
        if (this.characters.length < 2) {
            errors.push('At least 2 characters required');
        }
        
        // Check for player character
        const playerCount = this.characters.filter(char => char.isPlayer).length;
        if (playerCount === 0) {
            errors.push('No player character selected');
        } else if (playerCount > 1) {
            errors.push('Multiple player characters selected');
        }
        
        // Validate each character
        this.characters.forEach((char, index) => {
            if (!char.name || char.name.trim().length === 0) {
                errors.push(`Character ${index + 1}: Missing name`);
            }
            
            if (!char.jobRole) {
                errors.push(`Character ${index + 1}: Missing job role`);
            }
            
            if (!char.spriteSheet) {
                errors.push(`Character ${index + 1}: Missing sprite selection`);
            }
        });
        
        return errors;
    }

    /**
     * Export characters for game
     */
    exportCharacters() {
        console.log('📤 Exporting characters from creator...');
        
        if (!this.characters || this.characters.length === 0) {
            console.warn('⚠️ No characters created, returning null');
            return null;
        }
        
        // Update current character from form
        this.updateCharacterFromForm(this.currentCharacterIndex);
        
        // Initialize relationships
        this.initializeCharacterRelationships();
        
        // Clean up sprite paths
        const fixedCharacters = this.characters.map(char => {
            if (char.spriteSheet && char.spriteSheet.includes('assets/characters/assets/characters/')) {
                char.spriteSheet = char.spriteSheet.replace('assets/characters/assets/characters/', 'assets/characters/');
            }
            
            if (char.spriteSheet && !char.spriteSheet.startsWith('./')) {
                char.spriteSheet = './' + char.spriteSheet;
            }
            
            return char;
        });
        
        console.log(`✅ Exported ${fixedCharacters.length} characters from creator`);
        return fixedCharacters;
    }

    /**
     * Initialize relationships between characters
     */
    initializeCharacterRelationships() {
        this.characters.forEach(char => {
            char.relationships = {};
            this.characters.forEach(otherChar => {
                if (otherChar.id !== char.id) {
                    char.relationships[otherChar.id] = 50; // Neutral starting relationship
                }
            });
        });
    }

    /**
     * Helper functions
     */
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomItems(array, min, max) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}
