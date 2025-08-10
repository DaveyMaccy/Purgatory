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
        this.conversationId =
