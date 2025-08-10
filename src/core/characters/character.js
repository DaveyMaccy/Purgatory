// src/core/characters/character.js - Fixed Constructor for Stage 4 Movement

/**
 * Character Class - Represents an NPC or player character
 * Based on the SSOT documentation (Chapter 2: The Character Object)
 * Enhanced with complete observer pattern implementation for Stage 3
 * STAGE 4: Added movement path property for pathfinding system
 */
export class Character {
    constructor(config) {
        // Core Identity
        this.id = config.id || `char_${Date.now()}`;
        this.name = config.name || 'Unnamed';
        this.isPlayer = config.isPlayer || false;
        this.isEnabled = config.isEnabled !== undefined ? config.isEnabled : true;
        this.jobRole = config.jobRole || 'Employee';

        // Core Attributes
        this.physicalAttributes = {
            age: config.physicalAttributes?.age || 30,
            height: config.physicalAttributes?.height || 175,
            weight: config.physicalAttributes?.weight || 70,
            build: config.physicalAttributes?.build || 'Average',
            looks: config.physicalAttributes?.looks || 5,
            gender: config.physicalAttributes?.gender || 'Non-binary'
        };

        // Skills
        this.skills = {
            competence: config.skills?.competence || 5,
            laziness: config.skills?.laziness || 5,
            charisma: config.skills?.charisma || 5,
            leadership: config.skills?.leadership || 5
        };

        // Tag System
        this.personalityTags = config.personalityTags || [];
        this.experienceTags = config.experienceTags || [];

        // Dynamic State
        this.needs = {
            energy: config.needs?.energy || 8,
            hunger: config.needs?.hunger || 8,
            social: config.needs?.social || 8,
            comfort: config.needs?.comfort || 8,
            stress: config.needs?.stress || 2
        };
        this.mood = config.mood || 'Neutral';

        // Action & Interaction State
        this.actionState = config.actionState || 'idle';
        this.facingAngle = config.facingAngle || 90;
        this.maxSightRange = config.maxSightRange || 250;
        this.isBusy = config.isBusy || false;
        this.currentAction = config.currentAction || null;
        this.currentActionTranscript = config.currentActionTranscript || [];
        this.pendingIntent = config.pendingIntent || null;
        this.heldItem = config.heldItem || null;
        this.conversationId = config.conversationId || null;

        // Memory & Goals
        this.shortTermMemory = config.shortTermMemory || [];
        this.longTermMemory = config.longTermMemory || [];
        this.longTermGoal = config.longTermGoal || null;
        this.assignedTask = config.assignedTask || null;

        // Backend & Visuals
        this.inventory = config.inventory || [];
        this.deskItems = config.deskItems || [];
        this.relationships = config.relationships || {};
        this.position = config.position || { x: 0, y: 0 };
        this.portrait = config.portrait || null;
        this.spriteColors = config.spriteColors || null;

        // STAGE 4: Movement system properties
        this.path = config.path || []; // Array of {x, y} waypoints for pathfinding
        this.originalPathLength = 0; // For movement progress calculation

        // API Configuration
        this.apiKey = config.apiKey || '';
        this.promptCount = config.promptCount || 0;
        this.deskId = config.deskId || 'desk_1';

        // Observer pattern for UI updates
        this.observers = [];

        // Enhanced appearance system for Stage 3
        this.appearance = config.appearance || {
            body: 'body_skin_tone_1',
            hair: 'hair_style_4_blonde',
            shirt: 'shirt_style_2_red',
            pants: 'pants_style_1_jeans'
        };

        // Visual components
        this.pixiArmature = config.pixiArmature || null;
        this.spriteSheet = config.spriteSheet || null; // For character creator compatibility
    }

    /**
     * Update character needs over time with decay
     * @param {number} deltaTime - Time passed in milliseconds
     */
    updateNeeds(deltaTime) {
        const decayRate = 0.001; // Adjust this value to control decay speed
        const timeInSeconds = deltaTime / 1000;
        
        const oldNeeds = { ...this.needs };
        
        // Energy decreases over time
        this.needs.energy = Math.max(1, this.needs.energy - (decayRate * timeInSeconds));
        
        // Hunger decreases over time
        this.needs.hunger = Math.max(1, this.needs.hunger - (decayRate * timeInSeconds * 1.2));
        
        // Social decreases over time (slower)
        this.needs.social = Math.max(1, this.needs.social - (decayRate * timeInSeconds * 0.5));
        
        // Comfort decreases when tired or hungry
        if (this.needs.energy < 5 || this.needs.hunger < 5) {
            this.needs.comfort = Math.max(1, this.needs.comfort - (decayRate * timeInSeconds * 0.8));
        }
        
        // Stress increases when other needs are low
        if (this.needs.energy < 4 || this.needs.hunger < 4 || this.needs.social < 4) {
            this.needs.stress = Math.min(10, this.needs.stress + (decayRate * timeInSeconds * 2));
        } else {
            // Stress decreases slowly when all needs are met
            this.needs.stress = Math.max(1, this.needs.stress - (decayRate * timeInSeconds * 0.3));
        }
        
        // Check if any needs changed significantly (for observer notification)
        const needsChanged = Object.keys(this.needs).some(need => 
            Math.abs(this.needs[need] - oldNeeds[need]) > 0.1
        );
        
        if (needsChanged) {
            this.notifyObservers('needs');
        }
    }

    /**
     * Initialize character needs system
     */
    initializeNeeds() {
        console.log(`🔧 Initializing needs for ${this.name}`);
        
        // Ensure all needs are within valid range
        Object.keys(this.needs).forEach(need => {
            this.needs[need] = Math.max(1, Math.min(10, this.needs[need]));
        });
        
        this.notifyObservers('needs');
    }

    /**
     * Observer pattern methods
     */
    addObserver(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(propertyChanged) {
        this.observers.forEach(observer => {
            if (observer.onCharacterStateChange) {
                observer.onCharacterStateChange(this, propertyChanged);
            }
        });
    }

    /**
     * State management methods with observer notifications
     */
    setActionState(newState) {
        const oldState = this.actionState;
        this.actionState = newState;
        if (oldState !== newState) {
            this.notifyObservers('actionState');
        }
    }
    
    setMood(newMood) {
        const oldMood = this.mood;
        this.mood = newMood;
        if (oldMood !== newMood) {
            this.notifyObservers('mood');
        }
    }

    /**
     * STAGE 4: Set character position and notify observers
     * @param {Object} position - {x, y} coordinates
     */
    setPosition(position) {
        this.position = { ...position };
        this.notifyObservers('position');
    }

    /**
     * Set character portrait and notify observers
     * @param {string} portraitData - Base64 image data or URL
     */
    setPortrait(portraitData) {
        this.portrait = portraitData;
        this.notifyObservers('portrait');
    }

    /**
     * STAGE 4: Set movement path
     * @param {Array} newPath - Array of {x, y} waypoints
     */
    setPath(newPath) {
        this.path = [...newPath];
        this.originalPathLength = newPath.length;
        this.notifyObservers('path');
    }

    /**
     * STAGE 4: Clear movement path
     */
    clearPath() {
        this.path = [];
        this.originalPathLength = 0;
        this.notifyObservers('path');
    }

    /**
     * Set current action and notify observers
     * @param {Object} action - Action object
     */
    setCurrentAction(action) {
        this.currentAction = action;
        this.notifyObservers('currentAction');
    }

    /**
     * Set assigned task and notify observers
     * @param {Object} task - Task object
     */
    setAssignedTask(task) {
        this.assignedTask = task;
        this.notifyObservers('assignedTask');
    }

    /**
     * Update relationship with another character
     * @param {string} characterId - Other character's ID
     * @param {number} delta - Change in relationship value
     */
    updateRelationship(characterId, delta) {
        if (!this.relationships[characterId]) {
            this.relationships[characterId] = 50; // Neutral starting point
        }
        
        this.relationships[characterId] = Math.max(0, Math.min(100, 
            this.relationships[characterId] + delta
        ));
        
        this.notifyObservers('relationships');
    }

    /**
     * Add item to inventory
     * @param {Object} item - Item object
     */
    addToInventory(item) {
        this.inventory.push(item);
        this.notifyObservers('inventory');
    }

    /**
     * Remove item from inventory
     * @param {string} itemId - Item ID to remove
     */
    removeFromInventory(itemId) {
        this.inventory = this.inventory.filter(item => item.id !== itemId);
        this.notifyObservers('inventory');
    }

    /**
     * Pick up an item (set as held item)
     * @param {Object} item - Item to pick up
     * @returns {boolean} Success status
     */
    pickUpItem(item) {
        if (this.heldItem) {
            return false; // Already holding something
        }
        
        this.heldItem = item;
        this.notifyObservers('heldItem');
        return true;
    }

    /**
     * Put down the currently held item
     * @returns {Object|null} The item that was put down
     */
    putDownItem() {
        const item = this.heldItem;
        this.heldItem = null;
        this.notifyObservers('heldItem');
        return item;
    }

    /**
     * Use an item
     * @param {Object} item - Item to use
     * @returns {boolean} Success status
     */
    useItem(item) {
        // Implementation depends on item type
        console.log(`${this.name} used ${item.name}`);
        
        // Remove consumable items
        if (item.consumable) {
            this.removeFromInventory(item.id);
        }
        
        return true;
    }

    /**
     * Get witness event description based on perception level
     * Based on SSOT Chapter 4.3
     * @returns {string|null} Witness event description or null if no event
     */
    getWitnessEvent() {
        // In a full implementation, this would use the perception system
        // For now, we'll return a placeholder
        return null;
    }

    /**
     * Main character update method called each frame
     * @param {number} deltaTime - Time passed in milliseconds
     */
    update(deltaTime) {
        this.updateNeeds(deltaTime);
        
        // Update current action progress if any
        if (this.currentAction && this.currentAction.duration) {
            this.currentAction.elapsedTime = (this.currentAction.elapsedTime || 0) + deltaTime;
            
            if (this.currentAction.elapsedTime >= this.currentAction.duration) {
                // Action completed
                this.setCurrentAction(null);
            }
        }
    }

    /**
     * Get character status for debugging
     * @returns {Object} Character status information
     */
    getStatus() {
        return {
            id: this.id,
            name: this.name,
            isPlayer: this.isPlayer,
            jobRole: this.jobRole,
            actionState: this.actionState,
            mood: this.mood,
            needs: { ...this.needs },
            position: { ...this.position },
            hasPath: this.path.length > 0,
            pathLength: this.path.length,
            heldItem: this.heldItem ? this.heldItem.name : null,
            inventoryCount: this.inventory.length,
            relationshipCount: Object.keys(this.relationships).length
        };
    }

    /**
     * STAGE 4: Get movement progress (0-1)
     * @returns {number} Progress from 0 (not started) to 1 (completed)
     */
    getMovementProgress() {
        if (this.originalPathLength === 0) return 1.0;
        const remainingWaypoints = this.path.length;
        return Math.max(0, (this.originalPathLength - remainingWaypoints) / this.originalPathLength);
    }

    /**
     * STAGE 4: Check if character is currently moving
     * @returns {boolean} True if character has a path to follow
     */
    isMoving() {
        return this.path.length > 0;
    }

    /**
     * Calculate character's current speed based on needs and state
     * @returns {number} Speed multiplier (0.5 to 1.5)
     */
    getSpeedMultiplier() {
        let speedMultiplier = 1.0;
        
        // Low energy makes movement slower
        if (this.needs.energy < 3) {
            speedMultiplier *= 0.7;
        } else if (this.needs.energy > 8) {
            speedMultiplier *= 1.2;
        }
        
        // High stress makes movement faster (anxious)
        if (this.needs.stress > 7) {
            speedMultiplier *= 1.3;
        }
        
        // Carrying items makes movement slightly slower
        if (this.heldItem) {
            speedMultiplier *= 0.9;
        }
        
        return Math.max(0.5, Math.min(1.5, speedMultiplier));
    }

    /**
     * STAGE 4: Check if character can move (not busy, not in conversation, etc.)
     * @returns {boolean} True if character can move
     */
    canMove() {
        return !this.isBusy && 
               this.actionState !== 'InConversation' && 
               this.actionState !== 'Unconscious';
    }

    /**
     * Get character's current facing direction as a string
     * @returns {string} Direction (north, south, east, west, etc.)
     */
    getFacingDirection() {
        const angle = this.facingAngle;
        
        if (angle >= 315 || angle < 45) return 'east';
        if (angle >= 45 && angle < 135) return 'south';
        if (angle >= 135 && angle < 225) return 'west';
        if (angle >= 225 && angle < 315) return 'north';
        
        return 'east'; // Default
    }

    /**
     * Set character facing direction
     * @param {number} angle - Angle in degrees (0 = east, 90 = south, etc.)
     */
    setFacingAngle(angle) {
        this.facingAngle = (angle + 360) % 360; // Normalize to 0-359
        this.notifyObservers('facingAngle');
    }
}
