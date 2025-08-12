/**
 * BULLETPROOF EVENT HANDLER SHIELD
 * Prevents all the broken shit from happening again
 */
class EventHandlerShield {
    static safeUpdateCheckboxStates(index, itemType, maxLimit) {
        // ALWAYS get fresh characters
        const characters = window.characters || [];
        if (!characters[index]) return;
        
        // Count selected items
        let selectedCount = 0;
        let prefix = '';
        
        if (itemType === 'personalityTags') {
            prefix = 'tags';
            selectedCount = characters[index].personalityTags?.length || 0;
        } else if (itemType === 'inventory') {
            prefix = 'inventory-item';
            selectedCount = characters[index].inventory?.length || 0;
        } else if (itemType === 'deskItems') {
            prefix = 'desk-item';
            selectedCount = characters[index].deskItems?.length || 0;
        }
        
        // Update UI
        const checkboxes = document.querySelectorAll(`input[id^="${prefix}-${index}-"]`);
        checkboxes.forEach(checkbox => {
            const isChecked = checkbox.checked;
            const isMaxReached = selectedCount >= maxLimit;
            
            if (isMaxReached && !isChecked) {
                checkbox.disabled = true;
                checkbox.parentElement.style.opacity = '0.5';
                checkbox.parentElement.style.cursor = 'not-allowed';
                checkbox.parentElement.style.color = '#9ca3af';
            } else {
                checkbox.disabled = false;
                checkbox.parentElement.style.opacity = '';
                checkbox.parentElement.style.cursor = '';
                checkbox.parentElement.style.color = '';
            }
        });
        
        console.log(`✅ Updated ${itemType} for character ${index}: ${selectedCount}/${maxLimit}`);
    }
    
    static safeUpdateCharacterData(index, itemType) {
        const characters = window.characters || [];
        if (!characters[index]) return;
        
        let checkboxes, dataArray;
        
        if (itemType === 'personalityTags') {
            checkboxes = document.querySelectorAll(`input[id^="tags-${index}-"]:checked`);
            dataArray = Array.from(checkboxes).map(cb => cb.value);
            characters[index].personalityTags = dataArray;
        } else if (itemType === 'inventory') {
            checkboxes = document.querySelectorAll(`input[id^="inventory-item-${index}-"]:checked`);
            dataArray = Array.from(checkboxes).map(cb => cb.value);
            characters[index].inventory = dataArray;
        } else if (itemType === 'deskItems') {
            checkboxes = document.querySelectorAll(`input[id^="desk-item-${index}-"]:checked`);
            dataArray = Array.from(checkboxes).map(cb => cb.value);
            characters[index].deskItems = dataArray;
        }
        
        // Update global reference
        window.characters = characters;
    }
    
    static safePlayerCheckboxHandler(index, checkbox) {
        const characters = window.characters || [];
        if (!characters[index]) {
            checkbox.checked = false;
            return;
        }
        
        if (checkbox.checked) {
            // Uncheck all others
            characters.forEach((char, otherIndex) => {
                if (otherIndex !== index) {
                    char.isPlayer = false;
                    const otherCheckbox = document.getElementById(`isPlayer-${otherIndex}`);
                    if (otherCheckbox) otherCheckbox.checked = false;
                }
            });
            characters[index].isPlayer = true;
        } else {
            // Don't allow unchecking if only player
            const otherPlayers = characters.filter((char, i) => i !== index && char.isPlayer);
            if (otherPlayers.length === 0) {
                checkbox.checked = true;
                console.log('⚠️ At least one character must be the player');
                return;
            }
            characters[index].isPlayer = false;
        }
        
        window.characters = characters;
    }
}

export { EventHandlerShield };
