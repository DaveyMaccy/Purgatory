/**
 * Prompt Engine - Generates LLM prompts from context
 */
export function generatePrompt(character, context) {
    const {
        internalState,
        location,
        privacyScore,
        nearbyEntities
    } = context;

    // Format memories
    const longTermMemories = internalState.longTermMemory.join('\n');
    const shortTermMemories = internalState.shortTermMemory.join('\n');

    // Format nearby entities
    const nearbyChars = nearbyEntities.characters.map(c => 
        `${c.name} (${c.state}, ${Math.round(c.distance)}px away)`
    ).join('\n');
    
    const nearbyObjs = nearbyEntities.objects.map(o => 
        `${o.type} (${Math.round(o.distance)}px away)`
    ).join('\n');

    // Create the prompt
    return `
[SYSTEM INSTRUCTION: Your memory is cleared. The following prompt is your entire world. Base your response ONLY on the context provided below.]

### YOUR IDENTITY & STATUS ###
You are ${character.name}, a ${internalState.identity}.
Your personality is defined by these traits: ${internalState.personalityTags.join(', ')}.
Your current skills are: Competence(${internalState.skills.competence}/10), Laziness(${internalState.skills.laziness}/10), Charisma(${internalState.skills.charisma}/10), Leadership(${internalState.skills.leadership}/10).
Your current mood is: ${internalState.mood}. This is because your needs are: Energy(${internalState.needs.energy}/10), Hunger(${internalState.needs.hunger}/10), Social(${internalState.needs.social}/10), Comfort(${internalState.needs.comfort}/10), Stress(${internalState.needs.stress}/10).

### YOUR MEMORIES ###
Key past events you remember (Long-Term Memory):
${longTermMemories || 'No significant memories'}

Recent Events (Short-Term Memory):
${shortTermMemories || 'Nothing notable recently'}

### YOUR GOALS & CURRENT SITUATION ###
Your primary goal right now is: ${internalState.longTermGoal ? internalState.longTermGoal.target : 'None defined'}.
You are currently working on: ${internalState.assignedTask ? internalState.assignedTask.displayName : 'No current task'}.
You are in the ${location} and your action state is '${internalState.actionState}'.
The current Privacy Score is ${privacyScore}/10. You can SHOUT to be heard by more people, or WHISPER to be heard by fewer.

### YOUR PERCEPTION ###
You can see the following characters:
${nearbyChars || 'No characters nearby'}

You can see the following objects:
${nearbyObjs || 'No objects nearby'}

### YOUR DECISION ###
Based on your personality, mood, memories, and goals, decide your next step. You can either perform one of the available gameplay actions OR you can say something. You cannot do both at once.

Respond ONLY with a JSON object. Use "responseType": "ACTION" for a gameplay action, or "responseType": "DIALOGUE" to speak.

Always include a "thought" field with your internal reasoning for the decision.

Respond ONLY with a JSON object using the specified format.
`;
}
