/**
 * UI Updater - Complete implementation for Stage 3: Character Status Integration
 * Handles all status panel updates, real-time clock, and character data binding
 * Based on SSOT Chapter 3.9: UI Data Binding
 * Updated with standardized imports and file paths
 */
export class UIUpdater {
    constructor(characterManager) {
        this.characterManager = characterManager;
        this.lastFocusCharacter = null;
        this.clockInterval = null;
        
        // Start the real-time clock
        this.startClock();
    }

    /**
     * Start the real-time clock display
     */
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const clockElement = document.getElementById('clock-display');
            if (clockElement) {
                clockElement.textContent = timeString;
            }
        };
        
        // Update immediately and then every second
        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    }

    /**
     * Stop the clock (cleanup)
     */
    stopClock() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }

    /**
     * Update all UI elements for the given character
     * This is the main UI sync function called from the game loop
     * @param {Character} character - The focus character to display
     */
    updateUI(character) {
        if (!character) return;
        
        this.updateCharacterBasics(character);
        this.updateStatusBars(character);
        this.updatePortrait(character);
        this.updateInventoryTab(character);
        this.updateTasksTab(character);
        this.updateRelationshipsTab(character);
        
        this.lastFocusCharacter = character;
    }

    /**
     * Update character name and job role
     */
    updateCharacterBasics(character) {
        const nameElement = document.getElementById('character-name');
        const roleElement = document.getElementById('character-role');
        
        if (nameElement) nameElement.textContent = character.name;
        if (roleElement) roleElement.textContent = character.jobRole;
    }

    /**
     * Update all status bars (energy, hunger, social, stress)
     */
    updateStatusBars(character) {
        this.updateStatusBar('energy', character.needs.energy);
        this.updateStatusBar('hunger', character.needs.hunger);
        this.updateStatusBar('social', character.needs.social);
        this.updateStatusBar('stress', character.needs.stress);
    }

    /**
     * Update a single status bar
     * @param {string} statName - The stat name (energy, hunger, social, stress)
     * @param {number} value - The value (1-10, converted to percentage)
     */
    updateStatusBar(statName, value) {
        const percentage = Math.round((value / 10) * 100);
        
        const valueElement = document.getElementById(`${statName}-value`);
        const barElement = document.getElementById(`${statName}-bar`);
        
        if (valueElement) {
            valueElement.textContent = `${percentage}%`;
        }
        
        if (barElement) {
            barElement.style.width = `${percentage}%`;
        }
    }

    /**
     * Update character portrait in the status panel
     */
    updatePortrait(character) {
        const portraitCanvas = document.getElementById('player-portrait-canvas');
        if (!portraitCanvas) return;
        
        const ctx = portraitCanvas.getContext('2d');
        
        // Clear the canvas
        ctx.clearRect(0, 0, portraitCanvas.width, portraitCanvas.height);
        
        // If character has a portrait (base64 string), display it
        if (character.portrait) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, portraitCanvas.width, portraitCanvas.height);
            };
            img.src = character.portrait;
        } else if (character.spriteSheet) {
            // Use sprite sheet as fallback portrait
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, portraitCanvas.width, portraitCanvas.height);
            };
            img.src = character.spriteSheet;
        } else {
            // Draw a simple placeholder
            ctx.fillStyle = '#4f46e5';
            ctx.fillRect(0, 0, portraitCanvas.width, portraitCanvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(character.name.charAt(0).toUpperCase(), 
                portraitCanvas.width / 2, portraitCanvas.height / 2 + 4);
        }
    }

    /**
     * Update the Inventory tab content
     */
    updateInventoryTab(character) {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;
        
        // Clear existing content
        inventoryList.innerHTML = '';
        
        // Add held item if any
        if (character.heldItem) {
            const li = document.createElement('li');
            li.className = 'p-2 bg-yellow-100 border border-yellow-300 rounded text-sm';
            li.innerHTML = `<span class="font-semibold">Holding:</span> ${character.heldItem.type || 'Unknown Item'}`;
            inventoryList.appendChild(li);
        }
        
        // Add inventory items
        if (character.inventory && character.inventory.length > 0) {
            character.inventory.forEach(item => {
                const li = document.createElement('li');
                li.className = 'p-2 bg-gray-50 border border-gray-200 rounded text-sm';
                
                // Handle both string items (from character creator) and object items (from game)
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
    }

    /**
     * Update the Tasks tab content
     */
    updateTasksTab(character) {
        const taskContent = document.getElementById('task-content');
        if (!taskContent) return;
        
        // Clear existing content
        taskContent.innerHTML = '';
        
        if (character.assignedTask) {
            // Task name
            const taskTitle = document.createElement('h4');
            taskTitle.className = 'font-semibold text-lg mb-2';
            taskTitle.textContent = character.assignedTask.displayName || character.assignedTask.type || 'Unknown Task';
            taskContent.appendChild(taskTitle);
            
            // Task progress (if available)
            if (character.assignedTask.progress !== undefined) {
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
            jobDiv.className = 'text-gray-600';
            jobDiv.innerHTML = `<span class="font-medium">Role:</span> ${character.jobRole}`;
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
    }

    /**
     * Update the Relationships tab content
     */
    updateRelationshipsTab(character) {
        const relationshipsList = document.getElementById('relationships-list');
        if (!relationshipsList) return;
        
        // Clear existing content
        relationshipsList.innerHTML = '';
        
        // Get all other characters
        const otherCharacters = this.characterManager.characters.filter(c => c.id !== character.id);
        
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
     * Update character UI elements (legacy method for compatibility)
     * @param {Character} character - The character to update
     * @param {Array} allCharacters - All characters in the game
     */
    updateCharacterUI(character, allCharacters) {
        this.updateUI(character);
        console.log(`UI updated for ${character.name}`);
    }

    /**
     * Update all characters' UI (legacy method)
     */
    updateAllCharactersUI() {
        const playerCharacter = this.characterManager.getPlayerCharacter();
        if (playerCharacter) {
            this.updateUI(playerCharacter);
        }
    }
    
    /**
     * Subscribe to character state changes
     * @param {Character} character - The character to observe
     */
    subscribeToCharacter(character) {
        character.addObserver(this);
    }
    
    /**
     * Unsubscribe from character state changes
     * @param {Character} character - The character to stop observing
     */
    unsubscribeFromCharacter(character) {
        character.removeObserver(this);
    }
    
    /**
     * Handle character state changes (Observer pattern)
     * @param {Character} character - The character whose state changed
     * @param {string} property - The property that changed
     */
    onCharacterStateChange(character, property) {
        // Only update UI for properties that affect the display
        const uiRelevantProperties = [
            'needs', 'mood', 'actionState', 'assignedTask', 'relationships', 
            'currentAction', 'heldItem', 'inventory', 'longTermGoal'
        ];
        
        if (uiRelevantProperties.includes(property)) {
            // Only update if this is the currently displayed character
            if (this.lastFocusCharacter && this.lastFocusCharacter.id === character.id) {
                this.updateUI(character);
            }
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopClock();
        
        // Unsubscribe from all characters
        this.characterManager.characters.forEach(character => {
            this.unsubscribeFromCharacter(character);
        });
    }
}
