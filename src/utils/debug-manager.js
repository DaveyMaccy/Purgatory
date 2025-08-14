/**
 * DEBUG MANAGER - Debug panel functionality and character debugging
 * EXTRACTED FROM: main.js lines 675-710 + part of setupDebugPanel
 * PURPOSE: Handle debug commands and character data inspection
 */

/**
 * Debug function to check character data structure
 * EXACT CODE FROM: main.js lines 678-710
 */
export function debugCharacterData() {
    if (window.characterManager && window.characterManager.characters) {
        console.log('🔍 DEBUG: Character data structure:');
        window.characterManager.characters.forEach((char, index) => {
            console.log(`Character ${index}:`, {
                name: char.name,
                id: char.id,
                jobRole: char.jobRole,
                hasNeeds: !!char.needs,
                needs: char.needs,
                hasInventory: !!char.inventory,
                inventory: char.inventory,
                hasPhysicalAttributes: !!char.physicalAttributes,
                physicalAttributes: char.physicalAttributes,
                hasSkills: !!char.skills,
                skills: char.skills
            });
        });
        
        // Test if UI elements exist
        console.log('🔍 DEBUG: UI Elements check:');
        console.log('character-name element:', !!document.getElementById('character-name'));
        console.log('character-role element:', !!document.getElementById('character-role'));
        console.log('energy-value element:', !!document.getElementById('energy-value'));
        console.log('inventory-list element:', !!document.getElementById('inventory-list'));
        console.log('character-stats element:', !!document.getElementById('character-stats'));
    }
}

/**
 * Setup debug command execution
 * EXTRACTED FROM: main.js setupDebugPanel function (the run command part)
 */
export function setupDebugCommands() {
    // Run debug command
    const runBtn = document.getElementById('run-debug-cmd');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            const select = document.getElementById('debug-command-select');
            const output = document.getElementById('debug-output');
            const result = document.getElementById('debug-result');
            
            if (select && select.value) {
                try {
                    let commandResult;
                    const command = select.value;
                    
                    // Execute the debug command
                    switch(command) {
                        case 'debugCharacterData':
                            debugCharacterData();
                            commandResult = 'Check console for character data';
                            break;
                        case 'debugCharacterStatus':
                            if (window.debugCharacterStatus) {
                                window.debugCharacterStatus();
                                commandResult = 'Check console for character status';
                            } else {
                                commandResult = 'debugCharacterStatus function not found';
                            }
                            break;
                        case 'console.clear':
                            console.clear();
                            commandResult = 'Console cleared';
                            break;
                        default:
                            // Try to evaluate as window property
                            commandResult = eval(`window.${command}`);
                            console.log(`Debug: ${command}`, commandResult);
                    }
                    
                    // Show result
                    if (output && result) {
                        result.textContent = typeof commandResult === 'object' 
                            ? JSON.stringify(commandResult, null, 2) 
                            : String(commandResult);
                        output.classList.remove('hidden');
                    }
                    
                } catch (error) {
                    console.error('Debug command failed:', error);
                    if (result) {
                        result.textContent = `Error: ${error.message}`;
                        output.classList.remove('hidden');
                    }
                }
            }
        });
    }
}
