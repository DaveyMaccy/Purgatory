/**
 * Context Builder - Gathers internal/external context for NPC decisions
 */
export function gatherContext(character, world) {
    // Internal State Awareness
    const internalState = {
        identity: `${character.physicalAttributes.age}-year-old ${character.jobRole}`,
        personalityTags: character.personalityTags,
        personalityDescriptions: getPersonalityDescriptions(character),
        skills: character.skills,
        needs: character.needs,
        mood: character.mood,
        longTermMemory: character.longTermMemory,
        shortTermMemory: character.shortTermMemory,
        longTermGoal: character.longTermGoal,
        assignedTask: character.assignedTask,
        actionState: character.actionState,
        heldItem: character.heldItem
    };

    // External World Awareness
    const location = getCurrentLocation(character);
    const privacyScore = calculatePrivacyScore(location);
    const nearbyEntities = world.getNearbyEntities(character);
    const availableIntents = getAvailableIntents(character, location);
    
    return {
        internalState,
        location,
        privacyScore,
        nearbyEntities,
        availableIntents
    };
}

function getPersonalityDescriptions(character) {
    const descriptions = {
        'Introverted': 'You prefer solitude and quiet environments',
        'Extroverted': 'You thrive in social situations and gain energy from interactions',
        'Flirty': 'You enjoy playful social interactions and romantic tension',
        'Gossipy': "You're naturally curious about office rumors and personal matters",
    };
    
    return character.personalityTags.map(tag => 
        descriptions[tag] || `${tag}: This trait influences your behavior`
    );
}

function getCurrentLocation(character) {
    return character.deskId ? 'Office Area' : 'Unknown Location';
}

function calculatePrivacyScore(location) {
    if (location.includes('Break Room')) return 3;
    if (location.includes('Meeting Room')) return 6;
    if (location.includes('Bathroom')) return 9;
    return 2;
}

function getAvailableIntents(character, location) {
    const intents = [];
    intents.push('IDLE: Stand still for a while');
    intents.push('MOVE_TO: Navigate to a different location');

    if (character.heldItem) {
        intents.push(`PUT_DOWN: Place the ${character.heldItem.type} you're holding`);
        intents.push(`THROW: Throw the ${character.heldItem.type}`);
    }

    if (character.assignedTask && 
        location.includes(character.assignedTask.requiredLocation)) {
        intents.push(`WORK_ON: Focus on your task: ${character.assignedTask.displayName}`);
    }

    if (character.needs.energy < 4) {
        intents.push('DRINK_COFFEE: Get coffee to boost energy');
    }
    if (character.needs.hunger < 4) {
        intents.push('EAT_SNACK: Eat something to satisfy hunger');
    }
    if (character.needs.social < 4) {
        intents.push('SOCIALIZE: Chat with a colleague to fulfill social needs');
    }

    return intents;
}
