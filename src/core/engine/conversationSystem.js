/**
 * Conversation System - Manages dialogue and conversations
 */
export class ConversationSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.activeConversations = {};
    }

    /**
     * Log dialogue to the interaction log
     * @param {Character} character - The speaking character
     * @param {string} content - The dialogue content
     */
    logDialogue(character, content) {
        const timestamp = new Date(this.gameEngine.gameTime).toLocaleTimeString();
        const logEntry = `[${timestamp}] ${character.name}: ${content}`;
        console.log(logEntry);
        // This is where you would call a function to add the message to the UI chat log
    }

    /**
     * Start a conversation between characters
     * @param {Array} characterIds - IDs of characters in the conversation
     */
    startConversation(characterIds) {
        const conversationId = `conv_${Date.now()}`;
        
        for (const characterId of characterIds) {
            const character = this.gameEngine.characterManager.getCharacter(characterId);
            if (character) {
                character.conversationId = conversationId;
                character.actionState = 'InConversation';
            }
        }
        
        this.activeConversations[conversationId] = {
            participants: characterIds,
            startTime: this.gameEngine.gameTime,
            lastUpdateTime: this.gameEngine.gameTime,
            transcript: []
        };
    }

    /**
     * End a conversation
     * @param {string} conversationId - ID of the conversation to end
     */
    endConversation(conversationId) {
        const conversation = this.activeConversations[conversationId];
        if (!conversation) return;
        
        for (const characterId of conversation.participants) {
            const character = this.gameEngine.characterManager.getCharacter(characterId);
            if (character && character.conversationId === conversationId) {
                character.conversationId = null;
                character.actionState = 'DEFAULT';
            }
        }
        
        delete this.activeConversations[conversationId];
    }

    /**
     * Update active conversations
     */
    updateActiveConversations() {
        for (const conversationId in this.activeConversations) {
            const conversation = this.activeConversations[conversationId];
            if (conversation.lastUpdateTime < this.gameEngine.gameTime - 30000) { // 30 second timeout
                this.endConversation(conversationId);
            }
        }
    }
}
