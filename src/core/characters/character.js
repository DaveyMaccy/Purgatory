/**
 * Character Class - Represents an NPC or player character
 * Based on the SSOT documentation (Chapter 2: The Character Object)
 * Enhanced with complete observer pattern implementation for Stage 3
 * Updated with standardized naming conventions
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
            looks: config.physicalAttributes?.looks || 5
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
        this.actionState = config.actionState || 'DEFAULT';
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
        this.needs.hunger = Math.max(1, this.needs.hunger - (decayRate * timeInSeconds));
        
        // Social decreases over time (slower)
        this.needs.social = Math.max(1, this.needs.social - (decayRate * 0.5 * timeInSeconds));
        
        // Stress increases slightly over time
        this.needs.stress = Math.min(10, this.needs.stress + (decayRate * 0.3 * timeInSeconds));
        
        // Comfort decreases slowly
        this.needs.comfort = Math.max(1, this.needs.comfort - (decayRate * 0.3 * timeInSeconds));
        
        // Notify observers if needs changed significantly
        if (this.needsChangedSignificantly(oldNeeds, this.needs)) {
            this.notifyObservers('needs');
        }
    }

    /**
     * Check if needs have changed significantly enough to warrant UI update
     */
    needsChangedSignificantly(oldNeeds, newNeeds) {
        const threshold = 0.1; // 10% of a point
        
        for (const need in oldNeeds) {
            if (Math.abs(oldNeeds[need] - newNeeds[need]) >= threshold) {
                return true;
            }
        }
        return false;
    }

    /**
     * Update a specific need value
     * @param {string} needType - The type of need (energy, hunger, social, comfort, stress)
     * @param {number} change - The change amount (can be positive or negative)
     */
    updateNeed(needType, change) {
        if (!this.needs.hasOwnProperty(needType)) {
            console.warn(`Unknown need type: ${needType}`);
            return;
        }
        
        const oldValue = this.needs[needType];
        
        if (needType === 'stress') {
            // Stress is inverse - higher is worse
            this.needs[needType] = Math.max(1, Math.min(10, this.needs[needType] + change));
        } else {
            // Other needs - higher is better
            this.needs[needType] = Math.max(1, Math.min(10, this.needs[needType] + change));
        }
        
        // Notify observers if the change was significant
        if (Math.abs(this.needs[needType] - oldValue) >= 0.1) {
            this.notifyObservers('needs');
        }
    }

    /**
     * Update relationship with another character
     * @param {string} characterId - The other character's ID
     * @param {number} change - Relationship change value (-10 to +10)
     */
    updateRelationship(characterId, change) {
        if (!this.relationships[characterId]) {
            this.relationships[characterId] = 50; // Neutral starting point
        }
        
        const oldValue = this.relationships[characterId];
        this.relationships[characterId] = Math.min(100, 
            Math.max(0, this.relationships[characterId] + change));
        
        // Notify observers if relationship changed significantly
        if (Math.abs(this.relationships[characterId] - oldValue) >= 5) {
            this.notifyObservers('relationships');
        }
    }

    /**
     * Add an item to inventory
     * @param {Object} item - The item to add
     */
    addToInventory(item) {
        this.inventory.push(item);
        this.notifyObservers('inventory');
    }

    /**
     * Remove an item from inventory
     * @param {string} itemId - The item ID to remove
     */
    removeFromInventory(itemId) {
        const initialLength = this.inventory.length;
        this.inventory = this.inventory.filter(item => 
            (typeof item === 'string' ? item : item.id) !== itemId);
        
        if (this.inventory.length !== initialLength) {
            this.notifyObservers('inventory');
        }
    }

    /**
     * Set the character's held item
     * @param {Object|null} item - The item to hold, or null to drop
     */
    setHeldItem(item) {
        const hadItem = !!this.heldItem;
        this.heldItem = item;
        
        // Update action state based on held item
        if (item && !hadItem) {
            this.setActionState('HoldingItem');
        } else if (!item && hadItem) {
            this.setActionState('DEFAULT');
        }
        
        this.notifyObservers('heldItem');
    }

    /**
     * Set the character's current action
     * @param {Object|null} action - The action object or null
     */
    setCurrentAction(action) {
        this.currentAction = action;
        this.notifyObservers('currentAction');
    }

    /**
     * Set the character's assigned task
     * @param {Object|null} task - The task object or null
     */
    setAssignedTask(task) {
        this.assignedTask = task;
        this.notifyObservers('assignedTask');
    }

    /**
     * Set the character's long-term goal
     * @param {Object|null} goal - The goal object or null
     */
    setLongTermGoal(goal) {
        this.longTermGoal = goal;
        this.notifyObservers('longTermGoal');
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
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notifyObservers(property) {
        for (const observer of this.observers) {
            if (typeof observer.onCharacterStateChange === 'function') {
                try {
                    observer.onCharacterStateChange(this, property);
                } catch (error) {
                    console.error(`Error notifying observer about ${property}:`, error);
                }
            }
        }
    }
    
    /**
     * Enhanced wrapper methods for state changes with observer notifications
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
     * Set character position and notify observers
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
                
                // Process pending intent if any
                if (this.pendingIntent) {
                    this.setCurrentAction(this.pendingIntent);
                    this.pendingIntent = null;
                }
            } else {
                // Notify observers of action progress
                this.notifyObservers('currentAction');
            }
        }
    }

    /**
     * Get character data for serialization
     * @returns {Object} Serializable character data
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            isPlayer: this.isPlayer,
            isEnabled: this.isEnabled,
            jobRole: this.jobRole,
            physicalAttributes: this.physicalAttributes,
            skills: this.skills,
            personalityTags: this.personalityTags,
            experienceTags: this.experienceTags,
            needs: this.needs,
            mood: this.mood,
            actionState: this.actionState,
            facingAngle: this.facingAngle,
            maxSightRange: this.maxSightRange,
            isBusy: this.isBusy,
            currentAction: this.currentAction,
            currentActionTranscript: this.currentActionTranscript,
            pendingIntent: this.pendingIntent,
            heldItem: this.heldItem,
            conversationId: this.conversationId,
            shortTermMemory: this.shortTermMemory,
            longTermMemory: this.longTermMemory,
            longTermGoal: this.longTermGoal,
            assignedTask: this.assignedTask,
            inventory: this.inventory,
            deskItems: this.deskItems,
            relationships: this.relationships,
            position: this.position,
            portrait: this.portrait,
            spriteColors: this.spriteColors,
            appearance: this.appearance,
            spriteSheet: this.spriteSheet
        };
    }
}
