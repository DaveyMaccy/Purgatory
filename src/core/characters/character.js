/**
 * Character Class - Represents an NPC or player character
 * Based on the SSOT documentation (Chapter 2: The Character Object)
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
        this.actionQueue = config.actionQueue || [];
        this.conversationId = config.conversationId || null;

        // Memory & Goals
        this.shortTermMemory = config.shortTermMemory || [];
        this.longTermMemory = config.longTermMemory || [];
        this.longTermGoal = config.longTermGoal || { 
            type: 'promotion', 
            target: 'Senior Position', 
            progress: 0.0 
        };
        this.assignedTask = config.assignedTask || null;

    // Backend & Visuals
    this.inventory = config.inventory || [];
    this.deskItems = config.deskItems || [];
    this.relationships = config.relationships || {};
    this.api = config.api || { key: '', provider: 'gemini-2.0-flash-lite' };
    this.promptCount = config.promptCount || 0;
    this.deskId = config.deskId || '';
    this.path = config.path || [];
    this.position = config.position || { x: 0, y: 0 };
    this.portrait = config.portrait || '';
    
    // State change observers
    this.observers = [];
        
        // Visual representation (PixiJS)
        this.pixiArmature = null;
    }

    /**
     * Update character's needs based on time passed
     * @param {number} deltaTime - Time passed in milliseconds
     */
    updateNeeds(deltaTime) {
        // Convert deltaTime to hours (1 minute real-time = 1 hour game-time)
        const hoursPassed = deltaTime / (1000 * 60);
        
        // Needs decay rates (per game-hour)
        const decayRates = {
            energy: 0.15,
            hunger: 0.1,
            social: 0.05,
            comfort: 0.03
        };
        
        // Update needs with decay
        for (const need in this.needs) {
            if (need !== 'stress') {
                this.needs[need] = Math.max(0, this.needs[need] - (decayRates[need] * hoursPassed));
            }
        }
        
        // Update mood based on most critical need
        this.updateMood();
    }

    /**
     * Update character's mood based on needs
     */
    updateMood() {
        if (this.needs.energy < 3) this.mood = 'Tired';
        else if (this.needs.hunger < 3) this.mood = 'Hungry';
        else if (this.needs.social < 3) this.mood = 'Lonely';
        else if (this.needs.stress > 7) this.mood = 'Stressed';
        else if (this.needs.comfort < 3) this.mood = 'Uncomfortable';
        else this.mood = 'Neutral';
    }

    /**
     * Add an event to short-term memory
     * @param {string} event - Description of the event
     */
    addToShortTermMemory(event) {
        this.shortTermMemory.push(event);
        // Keep only the last 20 events
        if (this.shortTermMemory.length > 20) {
            this.shortTermMemory.shift();
        }
    }

    /**
     * Add a significant event to long-term memory
     * @param {string} summary - AI-generated summary of the event
     */
    addToLongTermMemory(summary) {
        this.longTermMemory.push(summary);
        // Keep only the last 100 events
        if (this.longTermMemory.length > 100) {
            this.longTermMemory.shift();
        }
    }

    /**
     * Update relationship with another character
     * @param {string} characterId - ID of the other character
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
            this.notifyObservers('relationship');
        }
    }
    
    // Observer pattern methods
    addObserver(observer) {
        this.observers.push(observer);
    }
    
    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notifyObservers(property) {
        for (const observer of this.observers) {
            observer.onCharacterStateChange(this, property);
        }
    }
    
    // Wrapper methods for state changes
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
    
    setAssignedTask(task) {
        const hadTask = !!this.assignedTask;
        this.assignedTask = task;
        this.notifyObservers('assignedTask');
    }

    /**
     * Update the character's state
     * @param {number} deltaTime - Time passed in milliseconds
     */
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

    update(deltaTime) {
        this.updateNeeds(deltaTime);
    }
}
