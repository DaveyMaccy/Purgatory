/**
 * INPUT HANDLER - Player input processing and suggestion system
 * EXTRACTED FROM: main.js lines 779-932 + 1017-1059
 * PURPOSE: Handle player input, suggestions, and dialogue processing
 */

// CORRECTED: 'addToChatLog' has been removed from this import line.
import { TASK_ACTIONS, getActionDisplayText, processPlayerAction } from './action-system.js';

/**
 * Setup player input event handlers
 * EXACT CODE FROM: main.js lines 779-830
 */
export function setupGameInputHandlers() {
    console.log('🎮 Setting up game input handlers...');
    
    const playerInput = document.getElementById('player-input');
    const inputModeSelector = document.getElementById('input-mode-selector');
    const actionSuggestions = document.getElementById('action-suggestions');
    
    if (!playerInput || !inputModeSelector) {
        console.warn('⚠️ Player input elements not found');
        return;
    }
    
    // Handle input typing for action suggestions
    playerInput.addEventListener('input', (event) => {
        if (inputModeSelector.value === 'action') {
            showActionSuggestions(event.target.value);
        }
    });
    
    // Handle enter key
    playerInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handlePlayerInput(playerInput.value, inputModeSelector.value);
            playerInput.value = '';
            hideActionSuggestions();
        } else if (event.key === 'Escape') {
            hideActionSuggestions();
        }
    });
    
    // Handle mode change
    inputModeSelector.addEventListener('change', () => {
        hideActionSuggestions();
        playerInput.placeholder = inputModeSelector.value === 'action' 
            ? 'Type an action (e.g., "work", "complete task", "move to desk")...' 
            : 'Type a message...';
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!playerInput.contains(event.target) && !actionSuggestions?.contains(event.target)) {
            hideActionSuggestions();
        }
    });
    
    console.log('✅ Player input handlers connected');
}

/**
 * Show action suggestions based on input
 * EXACT CODE FROM: main.js lines 835-882
 */
export function showActionSuggestions(inputText) {
    const suggestions = document.getElementById('action-suggestions');
    if (!suggestions) return;
    
    const text = inputText.toLowerCase().trim();
    if (text.length < 1) {
        hideActionSuggestions();
        return;
    }
    
    // Find matching actions with improved logic
    const matchingActions = [];
    for (const [keyword, actionType] of Object.entries(TASK_ACTIONS)) {
        // Check if user input matches keyword OR if keyword contains user input
        const keywordMatch = keyword.toLowerCase().includes(text) || text.includes(keyword.toLowerCase());
        
        // Also check individual words in the keyword
        const keywordWords = keyword.toLowerCase().split(' ');
        const textWords = text.split(' ');
        const wordMatch = keywordWords.some(word => 
            textWords.some(textWord => word.includes(textWord) || textWord.includes(word))
        );
        
        if (keywordMatch || wordMatch) {
            const playerCharacter = window.characterManager?.getPlayerCharacter();
            matchingActions.push({
                keyword,
                actionType,
                display: getActionDisplayText(keyword, actionType, playerCharacter)
            });
        }
    }
    
    // Populate suggestions
    suggestions.innerHTML = '';
    matchingActions.slice(0, 5).forEach(action => {
        const div = document.createElement('div');
        div.className = 'p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200';
        div.textContent = action.display;
        div.onclick = () => {
            document.getElementById('player-input').value = action.keyword;
            hideActionSuggestions();
            handlePlayerInput(action.keyword, 'action');
        };
        suggestions.appendChild(div);
    });
    
    suggestions.classList.toggle('hidden', matchingActions.length === 0);
}

/**
 * Hide action suggestions
 * EXACT CODE FROM: main.js lines (missing variable declaration fixed)
 */
export function hideActionSuggestions() {
    const suggestions = document.getElementById('action-suggestions');
    if (suggestions) {
        suggestions.classList.add('hidden');
    }
}

/**
 * Handle player input - main processing function
 * EXACT CODE FROM: main.js lines 913-928
 */
export function handlePlayerInput(inputText, mode) {
    if (!inputText || !inputText.trim()) return;
    
    const playerCharacter = window.characterManager?.getPlayerCharacter();
    if (!playerCharacter) {
        // CORRECTED: This now calls the centralized UI updater.
        if (window.uiUpdater) window.uiUpdater.addChatMessage('<strong>System:</strong> No player character found.');
        return;
    }
    
    if (mode === 'action') {
        processPlayerAction(inputText.trim(), playerCharacter);
    } else {
        processPlayerDialogue(inputText.trim(), playerCharacter);
    }
}

/**
 * Process player dialogue 
 * EXACT CODE FROM: main.js lines 1052-1054
 */
export function processPlayerDialogue(dialogueText, playerCharacter) {
    // CORRECTED: This also calls the centralized UI updater.
    if (window.uiUpdater) window.uiUpdater.addChatMessage(`<strong>${playerCharacter.name}:</strong> ${dialogueText}`);
}
