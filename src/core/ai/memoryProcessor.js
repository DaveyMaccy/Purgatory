/**
 * Memory Consolidation System
 * Implements SSOT Chapter 7.2 specifications
 * Processes events to determine significant memories
 */

export default class MemoryProcessor {
    /**
     * Analyze events and consolidate into long-term memory
     * @param {Character} character - The character whose memory is being processed
     * @param {Array} recentEvents - Array of recent events from short-term memory
     */
    async processEvents(character, recentEvents) {
        if (!recentEvents.length) return null;

        // Filter events that are potentially significant
        const significantEvents = recentEvents.filter(event => 
            this.isSignificantEvent(event, character)
        );

        if (!significantEvents.length) return null;

        // Generate prompt for memory consolidation
        const prompt = this.createMemoryPrompt(character, significantEvents);
        const response = await this.sendMemoryRequest(character, prompt);
        
        if (response && response.isSignificant) {
            character.addToLongTermMemory(response.summary);
            return response.summary;
        }
        
        return null;
    }

    /**
     * Determine if an event is significant based on character traits
     * @param {Object} event - The event object
     * @param {Character} character - The character experiencing the event
     */
    isSignificantEvent(event, character) {
        // High-impact events are always significant
        if (event.magnitude >= 7) return true;
        
        // Events involving important relationships
        if (character.relationships[event.actorId] >= 70 || 
            character.relationships[event.actorId] <= 30) {
            return true;
        }
        
        // Events relevant to character's goals
        if (event.type.includes(character.longTermGoal.type) ||
            event.target.includes(character.longTermGoal.target)) {
            return true;
        }
        
        return false;
    }

    /**
     * Create memory consolidation prompt (SSOT Chapter 7.2)
     * @param {Character} character - The character
     * @param {Array} events - Significant events to process
     */
    createMemoryPrompt(character, events) {
        let prompt = `### MEMORY CONSOLIDATION ###\n`;
        prompt += `You are ${character.name}. Based on your personality (${character.personalityTags.join(', ')}) `;
        prompt += `and the following recent events, what is the single most important or memorable thing that just happened?\n`;
        prompt += `--- Recent Events ---\n`;
        
        events.forEach(event => {
            prompt += `- ${event.description} (${event.timestamp})\n`;
        });
        
        prompt += `---------------------\n`;
        prompt += `Summarize the most significant event in a single, concise sentence from your perspective. `;
        prompt += `If nothing significant happened, respond with "Nothing important happened."\n`;
        prompt += `Respond ONLY with a JSON object: {"thought": "your reasoning", "isSignificant": true/false, "summary": "<your one-sentence summary>"}`;
        
        return prompt;
    }

    /**
     * Send memory consolidation request to API
     * @param {Character} character - The character
     * @param {string} prompt - Formatted prompt text
     */
    async sendMemoryRequest(character, prompt) {
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${character.api.key}`
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            const content = data.candidates[0].content.parts[0].text;
            
            try {
                return JSON.parse(content);
            } catch (e) {
                console.error('Invalid JSON response from memory API:', content);
                return null;
            }
        } catch (error) {
            console.error('Memory processing failed:', error);
            return null;
        }
    }
}
