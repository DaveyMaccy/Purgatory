/**
 * Chat System Defender - Protects chat and interaction UI elements
 * 
 * SAFETY: Only manages game chat elements, never character creator
 * Ensures chat log, input, and interaction systems always work
 */

import { UIContract } from './ui-contract.js';

export class ChatSystemDefender {
    constructor() {
        this.isInitialized = false;
        this.chatElements = [
            'chat-log',              // Main chat message area
            'player-input',          // Player input field
            'input-mode-selector'    // Talk/Action selector
        ];
        this.tabElements = [
            'inventory',             // Inventory tab content
            'tasks',                 // Tasks tab content  
            'relationships'          // Relationships tab content
        ];
        this.lastValidationTime = 0;
        this.validationInterval = 10000; // 10 seconds
    }

    /**
     * Initialize chat system protection
     */
    initialize() {
        console.log('🛡️ Initializing Chat System Defender...');
        
        // SAFETY CHECK: Never run if character creator is open
        if (UIContract.isCharacterCreatorOpen()) {
            console.log('🎭 Character creator open - delaying chat system initialization');
            setTimeout(() => this.initialize(), 1000);
            return;
        }

        this.validateChatElements();
        this.validateTabSystem();
        this.isInitialized = true;
        
        console.log('✅ Chat System Defender initialized');
    }

    /**
     * Validate chat elements exist
     * @returns {boolean} True if all chat elements present
     */
    validateChatElements() {
        const missing = [];
        
        for (const elementId of this.chatElements) {
            if (!UIContract.hasGameElement(elementId)) {
                missing.push(elementId);
            }
        }

        if (missing.length > 0) {
            console.warn(`⚠️ Chat System: Missing ${missing.length} elements:`, missing);
            return false;
        }

        return true;
    }

    /**
     * Validate tab system elements
     * @returns {boolean} True if tab system is intact
     */
    validateTabSystem() {
        const missing = [];
        
        for (const elementId of this.tabElements) {
            if (!UIContract.hasGameElement(elementId)) {
                missing.push(elementId);
            }
        }

        if (missing.length > 0) {
            console.warn(`⚠️ Tab System: Missing ${missing.length} elements:`, missing);
            return false;
        }

        // Check if openTab function exists
        if (typeof window.openTab !== 'function') {
            console.warn('⚠️ Missing global openTab function');
            return false;
        }

        return true;
    }

    /**
     * Safely add message to chat log
     * @param {string} message - Message to add
     * @param {string} type - Message type (system, character, player)
     */
    addChatMessage(message, type = 'system') {
        // SAFETY: Don't interfere if character creator is open
        if (UIContract.isCharacterCreatorOpen()) {
            return;
        }

        const chatLog = document.getElementById('chat-log');
        if (!chatLog) {
            console.warn('⚠️ Chat log element not found');
            return;
        }

        try {
            const messageElement = document.createElement('div');
            messageElement.className = `chat-message chat-${type}`;
            messageElement.textContent = message;
            
            chatLog.appendChild(messageElement);
            
            // Auto-scroll to bottom
            chatLog.scrollTop = chatLog.scrollHeight;
            
        } catch (error) {
            console.error('❌ Failed to add chat message:', error);
        }
    }

    /**
     * Clear chat log safely
     */
    clearChatLog() {
        const chatLog = document.getElementById('chat-log');
        if (chatLog) {
            chatLog.innerHTML = '';
            console.log('🧹 Chat log cleared');
        }
    }

    /**
     * Update inventory tab content safely
     * @param {Object} character - Character object
     */
    updateInventoryTab(character) {
        if (!character) return;

        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) {
            console.warn('⚠️ Inventory list element not found');
            return;
        }

        try {
            // Clear existing content
            inventoryList.innerHTML = '';
            
            // Add held item if any
            if (character.heldItem) {
                const li = document.createElement('li');
                li.className = 'p-2 bg-yellow-100 border border-yellow-300 rounded text-sm';
                li.innerHTML = `<span class="font-semibold">Holding:</span> ${character.heldItem.type || character.heldItem.name || 'Unknown Item'}`;
                inventoryList.appendChild(li);
            }
            
            // Add inventory items
            if (character.inventory && character.inventory.length > 0) {
                character.inventory.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'p-2 bg-gray-50 border border-gray-200 rounded text-sm';
                    
                    // Handle both string items and object items
                    if (typeof item === 'string') {
                        li.textContent = item;
                    } else {
                        li.textContent = item.name || item.type || 'Unknown Item';
                    }
                    
                    inventoryList.appendChild(li);
                });
            } else if (!character.heldItem) {
                // Show empty state
                const li = document.createElement('li');
                li.className = 'p-2 text-gray-500 italic text-sm';
                li.textContent = 'No items';
                inventoryList.appendChild(li);
            }
            
        } catch (error) {
            console.error('❌ Failed to update inventory tab:', error);
        }
    }

    /**
     * Update tasks tab content safely
     * @param {Object} character - Character object
     */
    updateTasksTab(character) {
        if (!character) return;

        const taskContent = document.getElementById('task-content');
        if (!taskContent) {
            console.warn('⚠️ Task content element not found');
            return;
        }

        try {
            // Clear existing content
            taskContent.innerHTML = '';
            
            if (character.assignedTask) {
                // Task name
                const taskTitle = document.createElement('h4');
                taskTitle.className = 'font-semibold text-lg mb-2';
                taskTitle.textContent = character.assignedTask.displayName || character.assignedTask.type || 'Unknown Task';
                taskContent.appendChild(taskTitle);
                
                // Task progress if available
                if (typeof character.assignedTask.progress === 'number') {
                    const progressContainer = document.createElement('div');
                    progressContainer.className = 'mb-3';
                    
                    const progressLabel = document.createElement('div');
                    progressLabel.className = 'flex justify-between text-sm mb-1';
                    progressLabel.innerHTML = `<span>Progress</span><span>${Math.round(character.assignedTask.progress * 100)}%</span>`;
                    
                    const progressBarContainer = document.createElement('div');
                    progressBarContainer.className = 'bg-gray-200 rounded-full h-2';
                    
                    const progressBar = document.createElement('div');
                    progressBar.className = 'bg-blue-500 h-2 rounded-full';
                    progressBar.style.width = `${character.assignedTask.progress * 100}%`;
                    
                    progressBarContainer.appendChild(progressBar);
                    progressContainer.appendChild(progressLabel);
                    progressContainer.appendChild(progressBarContainer);
                    taskContent.appendChild(progressContainer);
                }
                
                // Current action
                if (character.currentAction) {
                    const actionDiv = document.createElement('div');
                    actionDiv.className = 'text-sm text-gray-600';
                    actionDiv.innerHTML = `<span class="font-medium">Current:</span> ${character.currentAction.type}`;
                    taskContent.appendChild(actionDiv);
                }
            } else {
                // Show job role as default "task"
                const jobDiv = document.createElement('div');
                jobDiv.className = 'text-gray-600 mb-2';
                jobDiv.innerHTML = `<span class="font-medium">Job Role:</span> ${character.jobRole}`;
                taskContent.appendChild(jobDiv);
                
                const noTask = document.createElement('div');
                noTask.className = 'text-gray-500 italic text-sm mt-2';
                noTask.textContent = 'No specific task assigned';
                taskContent.appendChild(noTask);
            }
            
            // Long-term goal
            if (character.longTermGoal) {
                const goalDiv = document.createElement('div');
                goalDiv.className = 'mt-4 p-3 bg-blue-50 border border-blue-200 rounded';
                
                const goalTitle = document.createElement('div');
                goalTitle.className = 'font-medium text-blue-800';
                goalTitle.textContent = 'Long-term Goal';
                
                const goalText = document.createElement('div');
                goalText.className = 'text-sm text-blue-700';
                goalText.textContent = character.longTermGoal.target || character.longTermGoal.type || 'Unknown goal';
                
                goalDiv.appendChild(goalTitle);
                goalDiv.appendChild(goalText);
                taskContent.appendChild(goalDiv);
            }
            
        } catch (error) {
            console.error('❌ Failed to update tasks tab:', error);
        }
    }

    /**
     * Update relationships tab content safely
     * @param {Object} character - Character object
     * @param {Array} allCharacters - All characters in the game
     */
    updateRelationshipsTab(character, allCharacters = []) {
        if (!character) return;

        const relationshipsList = document.getElementById('relationships-list');
        if (!relationshipsList) {
            console.warn('⚠️ Relationships list element not found');
            return;
        }

        try {
            // Clear existing content
            relationshipsList.innerHTML = '';
            
            // Get other characters
            const otherCharacters = allCharacters.filter(c => c.id !== character.id);
            
            if (otherCharacters.length === 0) {
                const li = document.createElement('li');
                li.className = 'text-gray-500 italic';
                li.textContent = 'No other characters';
                relationshipsList.appendChild(li);
                return;
            }
            
            otherCharacters.forEach(otherChar => {
                const relationshipScore = character.relationships[otherChar.id] || 50; // Default neutral
                const li = document.createElement('li');
                li.className = 'space-y-1';
                
                // Character name and score
                const nameDiv = document.createElement('div');
                nameDiv.className = 'flex justify-between items-center';
                nameDiv.innerHTML = `
                    <span class="font-medium">${otherChar.name}</span>
                    <span class="text-sm">${relationshipScore}/100</span>
                `;
                
                // Relationship bar
                const barContainer = document.createElement('div');
                barContainer.className = 'bg-gray-200 rounded-full h-2';
                
                const relationshipBar = document.createElement('div');
                relationshipBar.className = 'h-2 rounded-full';
                relationshipBar.style.width = `${relationshipScore}%`;
                relationshipBar.style.backgroundColor = this.getRelationshipColor(relationshipScore);
                
                barContainer.appendChild(relationshipBar);
                li.appendChild(nameDiv);
                li.appendChild(barContainer);
                relationshipsList.appendChild(li);
            });
            
        } catch (error) {
            console.error('❌ Failed to update relationships tab:', error);
        }
    }

    /**
     * Get color for relationship score
     * @param {number} score - Relationship score (0-100)
     * @returns {string} CSS color
     */
    getRelationshipColor(score) {
        if (score >= 80) return '#10b981'; // green-500
        if (score >= 60) return '#3b82f6'; // blue-500
        if (score >= 40) return '#f59e0b'; // amber-500
        if (score >= 20) return '#ef4444'; // red-500
        return '#7f1d1d'; // red-900
    }

    /**
     * Perform periodic validation
     * @returns {boolean} True if validation passes
     */
    periodicValidation() {
        const now = Date.now();
        
        // Skip if validated recently
        if (now - this.lastValidationTime < this.validationInterval) {
            return true;
        }

        // SAFETY: Skip if character creator is open
        if (UIContract.isCharacterCreatorOpen()) {
            console.log('🎭 Skipping chat system validation - character creator is open');
            return true;
        }

        this.lastValidationTime = now;
        
        const chatValid = this.validateChatElements();
        const tabsValid = this.validateTabSystem();
        
        if (!chatValid || !tabsValid) {
            console.warn('⚠️ Chat system validation failed');
            return false;
        }

        return true;
    }

    /**
     * Update all chat/tab systems for character
     * @param {Object} character - Character object
     * @param {Array} allCharacters - All characters in game
     */
    updateAll(character, allCharacters = []) {
        if (!character) {
            console.warn('⚠️ No character provided for chat system update');
            return;
        }

        // SAFETY: Never update if character creator is open
        if (UIContract.isCharacterCreatorOpen()) {
            return;
        }

        try {
            this.updateInventoryTab(character);
            this.updateTasksTab(character);
            this.updateRelationshipsTab(character, allCharacters);
            
        } catch (error) {
            console.error('❌ Chat system update failed:', error);
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.isInitialized = false;
        console.log('🗑️ Chat System Defender destroyed');
    }
}

console.log('💬 Chat System Defender loaded');
