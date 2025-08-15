/**
 * Character Class - Core character definition with Inventory Integration
 * Based on SSOT Chapter 2 specifications
 * * PHASE 4 ADDITIONS:
 * - facingDirection property for animation
 * - actionState property for movement states
 * - path property for pathfinding
 * - setActionState method with animation support
 * * NEW INVENTORY INTEGRATION:
 * - Enhanced inventory management with item objects
 * - Starting inventory based on job role
 * - Item interaction support
 * - Inventory weight tracking
 */

import { getStartingInventory, getStartingDeskItems, getInventoryWeight, hasRequiredItems } from '../systems/inventory-system.js';

export class Character {
    /**
     * Create a new character
     * @param {Object} characterData - Character initialization data from character creator
     */
    constructor(characterData) {
        // Essential properties from character creator
        this.id = characterData.id || `char_${Date.now()}`;
        this.name = characterData.name || 'Unknown';
        
        // Player status
        this.isPlayer = characterData.isPlayer || false;
        this.isEnabled = characterData.isEnabled !== false; // Default to true
        
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
        
        // === NEW ENHANCED INVENTORY SYSTEM ===
        
      // Initialize inventory ONLY from character creator selections - never use defaults
        this.inventory = [];
        if (characterData.inventory && Array.isArray(characterData.inventory)) {
            // Convert character creator inventory (strings) to proper item objects
            this.inventory = this.initializeInventoryItems(characterData.inventory);
        }
        // IMPORTANT: Never fall back to role-based defaults - only use what was selected in character creator
        
       // Initialize desk items ONLY from character creator selections - never use defaults  
        this.deskItems = [];
        if (characterData.deskItems && Array.isArray(characterData.deskItems)) {
            this.deskItems = this.initializeInventoryItems(characterData.deskItems);
        }
        // IMPORTANT: Never fall back to role-based defaults - only use what was selected in character creator
        
        // Item currently being held (not in inventory)
        this.heldItem = characterData.heldItem || null;
        
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
        
        console.log(`✅ Character created: ${this.name} (${this.jobRole}) - Inventory: ${this.inventory.length} items, Desk: ${this.deskItems.length} items`);
    }

    /**
     * NEW: Initialize inventory items from string array to proper item objects
     */
    initializeInventoryItems(itemArray) {
        if (!Array.isArray(itemArray)) return [];
        
        return itemArray.map(item => {
            if (typeof item === 'string') {
                // Convert string to item object
                return {
                    id: item.toLowerCase().replace(/\s+/g, '_'),
                    originalString: item,
                    quantity: 1,
                    acquiredAt: Date.now()
                };
            } else if (typeof item === 'object' && item.id) {
                // Already an object, ensure it has required properties
                return {
                    quantity: 1,
                    acquiredAt: Date.now(),
                    ...item
                };
            } else {
                // Fallback for unknown format
                return {
                    id: 'unknown_item',
                    originalString: String(item),
                    quantity: 1,
                    acquiredAt: Date.now()
                };
            }
        });
    }

    /**
     * NEW: Check if character has required items for a task
     */
    hasRequiredItems(requiredItems) {
        return hasRequiredItems(this, requiredItems);
    }

    /**
     * NEW: Get total inventory weight
     */
    getInventoryWeight() {
        return getInventoryWeight(this);
    }

    /**
     * NEW: Find item in inventory by ID or name
     */
    findInventoryItem(itemId) {
        return this.inventory.find(item => {
            if (typeof item === 'object') {
                return item.id === itemId || item.originalString === itemId;
            }
            return item === itemId;
        });
    }

    /**
     * NEW: Check if inventory has space (future enhancement)
     */
    canCarryMoreItems(additionalWeight = 0) {
        const currentWeight = this.getInventoryWeight();
        const maxWeight = 10; // Base carrying capacity
        const strengthBonus = this.physicalAttributes.build === 'Athletic' ? 5 : 0;
        
        return (currentWeight + additionalWeight) <= (maxWeight + strengthBonus);
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
        
        // Energy decreases over time (gets tired) - slower, more realistic decay
        this.needs.energy = Math.max(0, this.needs.energy - decayRate * 0.1);
        
        // Hunger decreases over time (gets hungry) - slower, more realistic decay  
        this.needs.hunger = Math.max(0, this.needs.hunger - decayRate * 0.08);
        
        // Social decreases over time (gets lonely) - slower, more realistic decay
        this.needs.social = Math.max(0, this.needs.social - decayRate * 0.05);
        
        // Stress can increase randomly (office life!)
        if (Math.random() < 0.001) { // 0.1% chance per frame
            this.needs.stress = Math.min(10, this.needs.stress + 0.1);
        }
        
        // Update mood based on needs
        this.updateMood();
        
        // Notify observers of need changes
        this.notifyObservers('needsUpdate');
    }

    /**
     * NEW: Apply item effects to character (called by inventory system)
     */
    applyItemEffects(effects) {
        if (!effects) return;
        
        // Apply to needs
        const needsUpdates = {};
        for (const [effect, value] of Object.entries(effects)) {
            if (this.needs.hasOwnProperty(effect)) {
                needsUpdates[effect] = value;
            }
        }
        
        if (Object.keys(needsUpdates).length > 0) {
            this.updateNeeds(needsUpdates);
        }
        
        // Apply to skills (temporary bonuses)
        for (const [effect, value] of Object.entries(effects)) {
            if (this.skills.hasOwnProperty(effect)) {
                // Note: Skill bonuses should be temporary and managed by a buff system
                console.log(`💪 ${this.name} gained temporary ${effect} bonus: +${value}`);
            }
        }
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
        
        // Update assigned task progress based on location and time
        this.updateTaskProgress(deltaTime);
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
     * Update assigned task progress based on location and activity
     * @param {number} deltaTime - Time elapsed in milliseconds
     */
    updateTaskProgress(deltaTime) {
        if (!this.assignedTask) return;
        
        // Initialize progress if not set
        if (this.assignedTask.progress === undefined) {
            this.assignedTask.progress = 0;
            this.assignedTask.elapsedTime = 0;
        }
        
        // Check if character is at the required location for their task
        const isAtRequiredLocation = this.isAtTaskLocation();
        
        if (isAtRequiredLocation) {
            // Progress the task based on competence and time
            this.assignedTask.elapsedTime += deltaTime;
            
            // Calculate progress rate based on character competence (1-10 scale)
            const baseProgressRate = 1.0; // 100% progress per duration
            const competenceModifier = this.skills.competence / 10; // 0.1 to 1.0
            const lazynessModifier = (11 - this.skills.laziness) / 10; // 1.0 to 0.1
            
            const effectiveRate = baseProgressRate * competenceModifier * lazynessModifier;
            
            // Calculate progress as a percentage of duration
            if (this.assignedTask.duration) {
                this.assignedTask.progress = Math.min(1.0, 
                    (this.assignedTask.elapsedTime * effectiveRate) / this.assignedTask.duration
                );
            }
            
            // Check for task completion
            if (this.assignedTask.progress >= 1.0) {
                this.completeCurrentTask();
            }
            
            // Notify observers of progress update
            this.notifyObservers('taskProgress');
        }
    }
    
    /**
     * Check if character is at the location required for their current task
     * @returns {boolean} True if at required location
     */
    isAtTaskLocation() {
        if (!this.assignedTask || !this.assignedTask.requiredLocation) return false;
        
        const requiredLocation = this.assignedTask.requiredLocation;
        
        // Define approximate locations for different task types
        const taskLocations = {
            'desk': { x: 400, y: 300, radius: 50 }, // Near character's desk area
            'meeting_room': { x: 600, y: 200, radius: 80 }, // Meeting room area
            'break_room': { x: 200, y: 400, radius: 60 }, // Break room area
            'printer': { x: 500, y: 400, radius: 30 } // Printer area
        };
        
        const location = taskLocations[requiredLocation];
        if (!location) return true; // If location not defined, assume we can work anywhere
        
        // Calculate distance to required location
        const distance = Math.sqrt(
            Math.pow(this.position.x - location.x, 2) + 
            Math.pow(this.position.y - location.y, 2)
        );
        
        return distance <= location.radius;
    }
    
    /**
     * Complete the current assigned task and request a new one
     */
    completeCurrentTask() {
        if (!this.assignedTask) return;
        
        const completedTask = this.assignedTask.displayName;
        console.log(`✅ ${this.name} completed task: ${completedTask}`);
        
        // Add to memory
        this.addToShortTermMemory(`Completed task: ${completedTask}`);
        
        // Improve mood slightly for completing tasks
        if (this.mood === 'Tired' || this.mood === 'Stressed') {
            this.setMood('Neutral');
        } else if (this.mood === 'Neutral') {
            this.setMood('Happy');
        }
        
        // Store last completed task to avoid immediate repetition
        this.lastCompletedTask = completedTask;
        
        // Clear current task
        this.assignedTask = null;
        
        // Notify observers
        this.notifyObservers('taskComplete');
        
        // Trigger task reassignment through world system - SAFE: Check existence first
        if (window.gameEngine && window.gameEngine.world && window.gameEngine.world.assignNewTaskToCharacter) {
            window.gameEngine.world.assignNewTaskToCharacter(this);
        }
    }
    
    /**
     * Assign a new task to this character
     * @param {Object} task - Task object with displayName, requiredLocation, duration
     */
    assignTask(task) {
        this.assignedTask = {
            ...task,
            progress: 0,
            elapsedTime: 0,
            startTime: Date.now()
        };
        
        console.log(`📋 ${this.name} assigned new task: ${task.displayName}`);
        this.addToShortTermMemory(`Started new task: ${task.displayName}`);
        
        this.notifyObservers('newTask');
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
