/**
 * Character Class - Core character definition
 * Based on SSOT Chapter 2 specifications
 * 
 * PHASE 4 ADDITIONS:
 * - facingDirection property for animation
 * - actionState property for movement states
 * - path property for pathfinding
 * - setActionState method with animation support
 */

export class Character {
    /**
     * Create a new character
     * @param {Object} characterData - Character initialization data from character creator
     */
    constructor(characterData) {
        // Essential properties from character creator
        this.id = characterData.id || `char_${Date.now()}`;
        this.name = characterData.name || 'Unknown';
        
        // Physical attributes - FIXED: Use nested object structure
        this.physicalAttributes = characterData.physicalAttributes || {};
        if (!this.physicalAttributes.age) this.physicalAttributes.age = 25;
        if (!this.physicalAttributes.height) this.physicalAttributes.height = 170;
        if (!this.physicalAttributes.weight) this.physicalAttributes.weight = 70;
        if (!this.physicalAttributes.build) this.physicalAttributes.build = 'Average';
        if (!this.physicalAttributes.looks) this.physicalAttributes.looks = 5;
        if (!this.physicalAttributes.gender) this.physicalAttributes.gender = 'Other';
        
        // Job and role
        this.jobRole = characterData.jobRole || 'Intern';
        this.experienceTags = characterData.experienceTags || [];
        
        // Skills - FIXED: Use nested object structure  
        this.skills = characterData.skills || {};
        if (!this.skills.competence) this.skills.competence = 5;
        if (!this.skills.laziness) this.skills.laziness = 5;
        if (!this.skills.charisma) this.skills.charisma = 5;
        if (!this.skills.leadership) this.skills.leadership = 5;
        
        // Personality
        this.personalityTags = characterData.personalityTags || [];
        
        // Needs - FIXED: Use provided needs or defaults
        this.needs = characterData.needs || {
            energy: 8,
            hunger: 6,
            social: 7,
            stress: 3
        };
        
        // Relationships (map of characterId -> relationship score)
        this.relationships = new Map();
        
        // Inventory and items - FIXED: Use correct property names
        this.inventory = characterData.inventory || [];
        this.deskItems = characterData.deskItems || [];
        this.heldItem = null;
        
        // State and status
        this.mood = 'neutral'; // happy, neutral, sad, angry
        this.currentAction = null;
        this.assignedTask = null;
        this.isBusy = false;
        
        // Memory systems (based on SSOT Chapter 7)
        this.shortTermMemory = []; // Last 20 events
        this.longTermMemory = []; // Up to 100 significant events
        this.currentActionTranscript = []; // Current action steps
        
        // Position and movement
        this.position = { x: 0, y: 0 };
        this.targetPosition = null;
        
        // PHASE 4 ADDITIONS: Animation and pathfinding support
        this.facingDirection = 'down'; // 'up', 'down', 'left', 'right'
        this.actionState = 'idle'; // 'idle', 'walking', 'working', etc.
        this.path = []; // Array of {x, y} waypoints for movement
        
        // Sprite and visual
        this.spriteSheet = characterData.spriteSheet || 'assets/characters/character-01.png';
        this.portrait = characterData.portrait || null;
        
        // Player flag
        this.isPlayer = characterData.isPlayer || false;
        
        // Observer pattern for UI updates
        this.observers = [];
        
        // Perception and awareness
        this.maxSightRange = 200; // pixels
        this.facingAngle = 180; // degrees (0 = north, 90 = east, 180 = south, 270 = west)
        
        console.log(`👤 Character created: ${this.name} (${this.jobRole})`);
    }
    
    /**
     * Observer pattern methods for UI updates
     */
    addObserver(observer) {
        this.observers.push(observer);
    }
    
    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notifyObservers(property) {
        this.observers.forEach(observer => {
            if (observer.update) {
                observer.update(this, property);
            }
        });
    }
    
    /**
     * Update character needs over time
     * Based on SSOT Chapter 2.5 - Need Decay System
     * @param {number} deltaTime - Time passed in milliseconds
     */
    updateNeeds(deltaTime) {
        const decayRate = deltaTime / 1000 / 60; // Convert to minutes
        
        // Energy decreases over time (gets tired)
        this.needs.energy = Math.max(0, this.needs.energy - decayRate * 0.5);
        
        // Hunger decreases over time (gets hungry)
        this.needs.hunger = Math.max(0, this.needs.hunger - decayRate * 0.3);
        
        // Social decreases over time (gets lonely)
        this.needs.social = Math.max(0, this.needs.social - decayRate * 0.2);
        
        // Update mood based on needs
        this.updateMood();
        
        // Notify observers of need changes
        this.notifyObservers('needs');
    }
    
    /**
     * Update mood based on current needs
     * Low needs lead to negative moods
     */
    updateMood() {
        const avgNeed = (this.needs.energy + this.needs.hunger + this.needs.social) / 3;
        
        let newMood;
        if (avgNeed > 7) {
            newMood = 'happy';
        } else if (avgNeed > 4) {
            newMood = 'neutral';
        } else if (avgNeed > 2) {
            newMood = 'sad';
        } else {
            newMood = 'angry';
        }
        
        if (newMood !== this.mood) {
            this.mood = newMood;
            this.notifyObservers('mood');
        }
    }
    
    /**
     * Set current action
     * @param {Object} action - Action object with type and parameters
     */
    setCurrentAction(action) {
        this.currentAction = action;
        this.isBusy = !!action;
        this.notifyObservers('currentAction');
    }
    
    /**
     * PHASE 4 ADD: Set action state with animation support
     * @param {string} newState - The new action state
     */
    setActionState(newState) {
        const oldState = this.actionState;
        this.actionState = newState;
        
        if (oldState !== newState) {
            this.notifyObservers('actionState');
            
            // Update sprite animation if renderer supports it
            if (window.renderer && window.renderer.updateCharacterAnimation) {
                window.renderer.updateCharacterAnimation(this.id, newState, this.facingDirection);
            }
        }
    }
    
    /**
     * Set mood with observer notifications
     * @param {string} newMood - The new mood state
     */
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
                this.notifyObservers('actionComplete');
            }
        }
    }
    
    /**
     * Add event to short-term memory
     * Maintains a maximum of 20 events
     * @param {string} event - Event description
     */
    addToShortTermMemory(event) {
        this.shortTermMemory.push({
            timestamp: Date.now(),
            event: event
        });
        
        // Keep only last 20 events
        if (this.shortTermMemory.length > 20) {
            this.shortTermMemory.shift();
        }
    }
    
    /**
     * Add significant event to long-term memory
     * Maintains a maximum of 100 events
     * @param {string} event - Event description
     */
    addToLongTermMemory(event) {
        this.longTermMemory.push({
            timestamp: Date.now(),
            event: event
        });
        
        // Keep only last 100 events
        if (this.longTermMemory.length > 100) {
            this.longTermMemory.shift();
        }
    }
    
    /**
     * Get character status for UI display
     * @returns {Object} Character status information
     */
    getStatus() {
        return {
            name: this.name,
            jobRole: this.jobRole,
            mood: this.mood,
            needs: { ...this.needs },
            currentAction: this.currentAction?.displayName || 'Idle',
            assignedTask: this.assignedTask?.displayName || 'None',
            position: { ...this.position },
            isPlayer: this.isPlayer,
            actionState: this.actionState // PHASE 4: Include action state
        };
    }
    
    /**
     * Serialize character data for saving
     * @returns {Object} Serialized character data
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            physicalAttributes: this.physicalAttributes,
            jobRole: this.jobRole,
            experienceTags: this.experienceTags,
            skills: this.skills,
            personalityTags: this.personalityTags,
            needs: this.needs,
            relationships: Array.from(this.relationships.entries()),
            inventory: this.inventory,
            deskItems: this.deskItems,
            mood: this.mood,
            position: this.position,
            spriteSheet: this.spriteSheet,
            portrait: this.portrait,
            isPlayer: this.isPlayer,
            longTermMemory: this.longTermMemory,
            facingDirection: this.facingDirection, // PHASE 4: Save facing direction
            actionState: this.actionState // PHASE 4: Save action state
        };
    }
    
    /**
     * Load character data from saved state
     * @param {Object} data - Saved character data
     */
    fromJSON(data) {
        Object.assign(this, data);
        
        // Restore relationships as Map
        if (data.relationships) {
            this.relationships = new Map(data.relationships);
        }
        
        // Reset runtime state
        this.observers = [];
        this.currentAction = null;
        this.isBusy = false;
        this.shortTermMemory = [];
        this.currentActionTranscript = [];
        this.path = []; // PHASE 4: Reset path
    }
}

