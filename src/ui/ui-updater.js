/**
 * BULLETPROOF UI Updater - Complete implementation
 * Handles all status panel updates without spam
 */
export class UIUpdater {
    constructor(characterManager) {
        this.characterManager = characterManager;
        this.lastFocusCharacter = null;
        this.lastPortraitSrc = null; // Track portrait changes
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
        
        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    }

    /**
     * Stop the clock
     */
    stopClock() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }

   /**
     * Observer pattern update method - called when character state changes
     * @param {Character} character - The character that changed
     * @param {string} property - The property that changed
     */
    update(character, property) {
        // Only update UI for the currently focused character
        if (character.id === window.focusTargetId) {
            if (property === 'needs') {
                this.updateStatusBars(character);
            } else if (property === 'portrait') {
                this.updatePortrait(character);
            } else if (property === 'mood') {
                this.updateCharacterBasics(character);
            }
            console.log(`🔄 Observer update: ${character.name} ${property}`);
        }
    }

    /**
     * BULLETPROOF: Main UI update function
     */
    updateUI(character) {
        if (!character) {
            console.warn('⚠️ No character provided to updateUI');
            return;
        }

        try {
            this.updateCharacterBasics(character);
            this.updateStatusBars(character);
            this.updatePortrait(character);
            this.updateCharacterTab(character);
            this.updateInventoryTab(character);
            this.updateTasksTab(character);
            this.updateRelationshipsTab(character);
            
            this.lastFocusCharacter = character;
            console.log(`✅ UI updated successfully for ${character.name}`);
            
        } catch (error) {
            console.error('❌ Error updating UI:', error);
        }
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
     * Update all status bars
     */
    updateStatusBars(character) {
        if (!character.needs) return;
        
        this.updateStatusBar('energy', character.needs.energy);
        this.updateStatusBar('hunger', character.needs.hunger);
        this.updateStatusBar('social', character.needs.social);
        this.updateStatusBar('stress', character.needs.stress);
    }

    /**
     * Update a single status bar
     */
    updateStatusBar(statName, value) {
        const percentage = Math.round((value / 100) * 100);
        
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
     * BULLETPROOF: Only update portrait when it actually changes
     */
    updatePortrait(character) {
        const portraitCanvas = document.getElementById('player-portrait-canvas');
        if (!portraitCanvas || !character) return;
        
        // FIXED PRIORITY: custom always wins, then sprite with proper rendering
        let newPortraitSrc;
        if (character.customPortrait) {
            newPortraitSrc = character.customPortrait;
        } else {
            newPortraitSrc = character.portrait || character.spriteSheet;
        }
        
        if (this.lastPortraitSrc === newPortraitSrc) return;
        
        this.lastPortraitSrc = newPortraitSrc;
        
        const ctx = portraitCanvas.getContext('2d');
        ctx.clearRect(0, 0, portraitCanvas.width, portraitCanvas.height);
        
        if (newPortraitSrc) {
            const img = new Image();
            img.onload = () => {
                // FIXED SPRITE RENDERING: Full fit with no compression
                ctx.imageSmoothingEnabled = false; // Remove compression
                
                if (character.customPortrait) {
                    // Custom portrait - maintain aspect ratio
                    const aspectRatio = img.width / img.height;
                    let drawWidth = portraitCanvas.width;
                    let drawHeight = portraitCanvas.height;
                    
                    if (aspectRatio > 1) {
                        drawHeight = portraitCanvas.width / aspectRatio;
                    } else {
                        drawWidth = portraitCanvas.height * aspectRatio;
                    }
                    
                    const x = (portraitCanvas.width - drawWidth) / 2;
                    const y = (portraitCanvas.height - drawHeight) / 2;
                    ctx.drawImage(img, x, y, drawWidth, drawHeight);
               } else {
                    // Extract 4th sprite from sprite sheet if needed
                    if (character.spriteSheet && !character.portrait) {
                        // Extract 4th sprite from first row with proper aspect ratio
                        const spriteWidth = 48;
                        const spriteHeight = 96;
                        const spriteIndex = 3; // Fourth sprite (0-based)
                        const sourceX = spriteIndex * spriteWidth;
                        const sourceY = 0; // First row
                        
                        // Calculate proper scaling to maintain 48:96 aspect ratio
                        const aspectRatio = spriteWidth / spriteHeight; // 0.5 (width is half of height)
                        let drawWidth = portraitCanvas.width;
                        let drawHeight = portraitCanvas.height;
                        
                        if (aspectRatio < 1) {
                            // Sprite is taller than wide (48x96) - fit to width
                            drawHeight = drawWidth / aspectRatio;
                        } else {
                            // Sprite is wider than tall - fit to height  
                            drawWidth = drawHeight * aspectRatio;
                        }
                        
                        // Center the sprite in the canvas
                        const x = (portraitCanvas.width - drawWidth) / 2;
                        const y = (portraitCanvas.height - drawHeight) / 2;
                        
                        ctx.drawImage(
                            img,
                            sourceX, sourceY, spriteWidth, spriteHeight, // Source
                            x, y, drawWidth, drawHeight // Dest with proper scaling
                        );
                    } else {
                        // Portrait already extracted - just draw it
                        ctx.drawImage(img, 0, 0, portraitCanvas.width, portraitCanvas.height);
                    }
                }
                
                console.log('✅ Portrait updated successfully');
            };
            img.onerror = () => {
                console.warn('⚠️ Portrait failed to load, drawing placeholder');
                this.drawPortraitPlaceholder(ctx, portraitCanvas, character);
            };
            img.src = newPortraitSrc;
        } else {
            this.drawPortraitPlaceholder(ctx, portraitCanvas, character);
        }
    }

    /**
     * Draw placeholder portrait
     */
    drawPortraitPlaceholder(ctx, canvas, character) {
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = character.name ? character.name.charAt(0).toUpperCase() : '?';
        ctx.fillText(initial, canvas.width / 2, canvas.height / 2);
    }

    /**
     * BULLETPROOF: Update character stats tab
     */
    updateCharacterTab(character) {
        const characterStats = document.getElementById('character-stats');
        if (!characterStats || !character) return;
        
        try {
            characterStats.innerHTML = '';
            
            // Physical Attributes (SAFE ACCESS)
            if (character.physicalAttributes) {
                const physicalSection = document.createElement('div');
                physicalSection.className = 'mb-4';
                physicalSection.innerHTML = `
                    <h4 class="font-semibold text-base mb-2 text-purple-800">Physical Attributes</h4>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div><span class="font-medium">Age:</span> ${character.physicalAttributes.age || 'N/A'}</div>
                        <div><span class="font-medium">Height:</span> ${character.physicalAttributes.height || 'N/A'}cm</div>
                        <div><span class="font-medium">Weight:</span> ${character.physicalAttributes.weight || 'N/A'}kg</div>
                        <div><span class="font-medium">Build:</span> ${character.physicalAttributes.build || 'N/A'}</div>
                        <div><span class="font-medium">Looks:</span> ${character.physicalAttributes.looks || 'N/A'}/10</div>
                        <div><span class="font-medium">Gender:</span> ${character.physicalAttributes.gender || 'N/A'}</div>
                    </div>
                `;
                characterStats.appendChild(physicalSection);
            }
            
            // Skills (SAFE ACCESS)  
            if (character.skills) {
                const skillsSection = document.createElement('div');
                skillsSection.className = 'mb-4';
                skillsSection.innerHTML = `
                    <h4 class="font-semibold text-base mb-2 text-blue-800">Skills</h4>
                    <div class="space-y-1 text-xs">
                        <div class="flex justify-between">
                            <span>Competence:</span>
                            <span class="font-medium">${character.skills.competence || 0}/10</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Laziness:</span>
                            <span class="font-medium">${character.skills.laziness || 0}/10</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Charisma:</span>
                            <span class="font-medium">${character.skills.charisma || 0}/10</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Leadership:</span>
                            <span class="font-medium">${character.skills.leadership || 0}/10</span>
                        </div>
                    </div>
                `;
                characterStats.appendChild(skillsSection);
            }
            
            // Personality Tags (SAFE ACCESS)
            if (character.personalityTags && character.personalityTags.length > 0) {
                const personalitySection = document.createElement('div');
                personalitySection.className = 'mb-4';
                personalitySection.innerHTML = `
                    <h4 class="font-semibold text-base mb-2 text-green-800">Personality</h4>
                    <div class="flex flex-wrap gap-1">
                        ${character.personalityTags.map(tag => 
                            `<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">${tag}</span>`
                        ).join('')}
                    </div>
                `;
                characterStats.appendChild(personalitySection);
            }
            
        } catch (error) {
            console.error('❌ Failed to update character tab:', error);
        }
    }

    /**
     * BULLETPROOF: Handle both string and object inventory items
     */
    updateInventoryTab(character) {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;
        
        inventoryList.innerHTML = '';
        
        // Add held item if any
        if (character.heldItem) {
            const li = document.createElement('li');
            li.className = 'p-2 bg-yellow-100 border border-yellow-300 rounded text-sm';
            li.innerHTML = `<span class="font-semibold">Holding:</span> ${character.heldItem.type || character.heldItem.name || 'Unknown Item'}`;
            inventoryList.appendChild(li);
        }
        
        if (character.inventory && character.inventory.length > 0) {
            character.inventory.forEach(item => {
                const li = document.createElement('li');
                li.className = 'p-2 bg-gray-50 border border-gray-200 rounded text-sm cursor-pointer hover:bg-gray-100';
                
                const itemId = typeof item === 'object' ? (item.id || item.originalString) : item;
                const itemData = window.getItemById ? window.getItemById(itemId) : { name: itemId, id: itemId };

                if (itemData) {
                    li.textContent = itemData.name;

                    li.addEventListener('click', (event) => {
                        this.handleInventoryItemClick(itemData, event, character);
                    });
                } else {
                     li.textContent = itemId;
                }
                
                inventoryList.appendChild(li);
            });
        } else if (!character.heldItem) {
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
                progressBarContainer.className = 'bg-gray-200 rounded-full h-3';
                
                const progressBar = document.createElement('div');
                progressBar.className = 'h-3 rounded-full transition-all duration-300';
                
                // Color progress bar based on completion
                const progress = character.assignedTask.progress * 100;
                if (progress < 25) {
                    progressBar.className += ' bg-red-500';
                } else if (progress < 50) {
                    progressBar.className += ' bg-yellow-500';
                } else if (progress < 75) {
                    progressBar.className += ' bg-blue-500';
                } else {
                    progressBar.className += ' bg-green-500';
                }
                
                progressBar.style.width = `${progress}%`;
                
                progressBarContainer.appendChild(progressBar);
                progressContainer.appendChild(progressLabel);
                progressContainer.appendChild(progressBarContainer);
                taskContent.appendChild(progressContainer);
                
                // Add estimated time remaining
                if (character.assignedTask.duration && character.assignedTask.elapsedTime) {
                    const remaining = character.assignedTask.duration - character.assignedTask.elapsedTime;
                    const timeRemaining = Math.max(0, Math.ceil(remaining / 1000));
                    
                    const timeDiv = document.createElement('div');
                    timeDiv.className = 'text-xs text-gray-500 mt-1';
                    timeDiv.textContent = `Est. ${timeRemaining}s remaining`;
                    progressContainer.appendChild(timeDiv);
                }
                
                // Show required location with status
                if (character.assignedTask.requiredLocation) {
                    const locationDiv = document.createElement('div');
                    locationDiv.className = 'text-xs text-gray-600 mt-1';
                    
                    // SAFE: Check if method exists before calling
                    const isAtLocation = (character.isAtTaskLocation && typeof character.isAtTaskLocation === 'function') 
                        ? character.isAtTaskLocation() : false;
                    
                    locationDiv.innerHTML = `<span class="font-medium">Location:</span> ${character.assignedTask.requiredLocation} ${isAtLocation ? '✓' : '✗'}`;
                    
                    if (isAtLocation) {
                        locationDiv.className += ' text-green-600';
                    } else {
                        locationDiv.className += ' text-orange-600';
                    }
                    
                    progressContainer.appendChild(locationDiv);
                }
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
    }

    /**
     * BULLETPROOF: Update relationships with all characters
     */
    updateRelationshipsTab(character) {
        const relationshipsList = document.getElementById('relationships-list');
        if (!relationshipsList) return;
        
        relationshipsList.innerHTML = '';
        
        // BULLETPROOF: Get all other characters from character manager
        const allCharacters = this.characterManager.characters;
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
    }

    getRelationshipColor(score) {
        if (score >= 80) return '#10b981'; // green-500
        if (score >= 60) return '#3b82f6'; // blue-500
        if (score >= 40) return '#f59e0b'; // amber-500
        if (score >= 20) return '#ef4444'; // red-500
        return '#7f1d1d'; // red-900
    }

    /**
    * Handle inventory item click
    */
    handleInventoryItemClick(item, event, character) {
        if (!window.uiManager) return;

        // Get click position
        const rect = event.target.getBoundingClientRect();
        const position = {
            x: rect.left,
            y: rect.bottom + 5
        };

        // Define actions for inventory items
        const actions = {
            eat: (item) => {
                if (window.useItem) {
                    const success = window.useItem(character, item.id, 'eat');
                    if (success) {
                        this.addChatMessage(`<strong>${character.name}:</strong> Ate ${item.name}`);
                        this.updateUI(character);
                    }
                }
            },
            drink: (item) => {
                if (window.useItem) {
                    const success = window.useItem(character, item.id, 'drink');
                    if (success) {
                        this.addChatMessage(`<strong>${character.name}:</strong> Drank ${item.name}`);
                        this.updateUI(character);
                    }
                }
            },
            use: (item) => {
                if (window.useItem) {
                    const success = window.useItem(character, item.id, 'use');
                    if (success) {
                        this.addChatMessage(`<strong>${character.name}:</strong> Used ${item.name}`);
                        this.updateUI(character);
                    }
                }
            },
            useWith: (item) => {
                this.addChatMessage(`<strong>System:</strong> Click on an object to use ${item.name} with it.`);
                // TODO: Implement use-with system
            }
        };

        window.uiManager.showInventoryItemPopup(item, position, actions);
    }

    /**
     * Add chat message to chat log
     */
    addChatMessage(message, type = 'system') {
        const chatLog = document.getElementById('chat-log');
        if (!chatLog) return;

        try {
            const messageElement = document.createElement('div');
            messageElement.className = `chat-message chat-${type}`;
           messageElement.innerHTML = message;
            
            chatLog.appendChild(messageElement);
            
            // Auto-scroll to bottom
            chatLog.scrollTop = chatLog.scrollHeight;
            
        } catch (error) {
            console.error('❌ Failed to add chat message:', error);
        }
    }

    /**
     * Legacy methods for compatibility
     */
    updateCharacterUI(character, allCharacters) {
        this.updateUI(character);
        console.log(`UI updated for ${character.name}`);
    }

    updateAllCharactersUI() {
        const playerCharacter = this.characterManager.getPlayerCharacter();
        if (playerCharacter) {
            this.updateUI(playerCharacter);
        }
    }
    
    subscribeToCharacter(character) {
        if (character.addObserver) {
            character.addObserver(this);
        }
    }
    
    unsubscribeFromCharacter(character) {
        if (character.removeObserver) {
            character.removeObserver(this);
        }
    }
    
    onCharacterStateChange(character, property) {
        const uiRelevantProperties = [
            'needs', 'mood', 'actionState', 'assignedTask', 'relationships', 
            'currentAction', 'heldItem', 'inventory', 'longTermGoal'
        ];
        
        if (uiRelevantProperties.includes(property)) {
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
        
        if (this.characterManager && this.characterManager.characters) {
            this.characterManager.characters.forEach(character => {
                this.unsubscribeFromCharacter(character);
            });
        }
    }
}

/**
 * Connect observer pattern for automatic UI updates
 * MOVED FROM: main.js for better organization
 */
export function connectUIObservers() {
    console.log('🔄 Connecting UI observers...');
    
    if (window.uiUpdater && window.characterManager && window.characterManager.characters) {
        // Register UIUpdater as observer for all characters
        window.characterManager.characters.forEach(character => {
            // Only add if not already added (prevent duplicates)
            if (!character.observers.includes(window.uiUpdater)) {
                character.addObserver(window.uiUpdater);
                console.log(`✅ UI observer connected to ${character.name}`);
            }
        });
    }
}

/**
 * Start continuous UI updates  
 * MOVED FROM: main.js for better organization
 */
export function startUIUpdateLoop() {
    console.log('🔄 Starting UI update loop...');
    
    function updateUILoop() {
        if (window.uiUpdater && window.characterManager && window.characterManager.characters) {
            // FIXED: Use focusTargetId to find character or default to player
            let focusedCharacter = null;
            
            if (window.focusTargetId) {
                focusedCharacter = window.characterManager.characters.find(char => char.id === window.focusTargetId);
            }
            
            // Default to player character or first character
            if (!focusedCharacter) {
                focusedCharacter = window.characterManager.getPlayerCharacter() || window.characterManager.characters[0];
            }
            
            if (focusedCharacter) {
                // Character needs should already exist from Character constructor
                // If they don't exist, log error instead of creating placeholders
                if (!focusedCharacter.needs) {
                    console.error(`❌ Character ${focusedCharacter.name} missing needs object`);
                    return;
                }
                
                window.uiUpdater.updateUI(focusedCharacter);
            }
        }
        
        // Update every 1000ms (1 second) - reduced frequency for stability
        setTimeout(updateUILoop, 1000);
    }
    
    // Start the loop
    updateUILoop();
    console.log('✅ UI update loop started');
}








