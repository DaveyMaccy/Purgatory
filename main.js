// main.js
/**
 * Main Game Initialization File - RESTORED AND FIXED
 * 
 * CRITICAL FIXES:
 * ✅ Proper initialization sequence
 * ✅ Fixed character creator integration
 * ✅ Restored to work with existing index.html
 * ✅ Clean separation of concerns
 * ✅ Works with modular character creator
 */

// Import modules (only the character creator for now)
import { initializeCharacterCreator } from './character-creator.js';

// Game state
let gameState = {
    characters: [],
    officeType: 'Corporate',
    isInitialized: false,
    isPaused: false
};

/**
 * Main initialization function
 */
async function initialize() {
    try {
        console.log('🎮 Starting Office Purgatory...');
        console.log('📋 Initialization sequence beginning...');
        
        // Step 1: Initialize character creator
        console.log('👥 Step 1: Initializing character creator...');
        await initializeCharacterCreator();
        console.log('✅ Character creator ready');
        
        // Step 2: Setup UI
        console.log('🖥️ Step 2: Setting up UI...');
        setupUI();
        console.log('✅ UI setup complete');
        
        // Step 3: Enable new game button
        console.log('🎮 Step 3: Enabling game controls...');
        enableNewGameButton();
        console.log('✅ Game controls enabled');
        
        gameState.isInitialized = true;
        console.log('🎉 Office Purgatory initialized successfully!');
        console.log('💡 Click "New Game" to create characters and start playing');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showErrorMessage('Failed to initialize game. Please refresh the page and try again.');
    }
}

/**
 * Setup UI elements and event handlers
 */
function setupUI() {
    // Setup start screen
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('main-game-ui');
    
    if (startScreen) {
        startScreen.style.display = 'flex';
    }
    
    if (gameContainer) {
        gameContainer.classList.add('hidden');
    }
    
    // Setup tab functionality for status panel
    setupStatusPanelTabs();
    
    // Setup window resize handler
    window.addEventListener('resize', handleWindowResize);
    
    console.log('🖥️ UI elements configured');
}

/**
 * Setup status panel tab functionality
 */
function setupStatusPanelTabs() {
    // The openTab function is already defined in index.html, just ensure it works
    if (typeof window.openTab !== 'function') {
        window.openTab = function(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-link");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        };
    }
}

/**
 * Enable the new game button
 */
function enableNewGameButton() {
    const newGameBtn = document.getElementById('new-game-btn');
    
    if (newGameBtn) {
        newGameBtn.disabled = false;
        newGameBtn.textContent = 'New Game';
        newGameBtn.style.opacity = '1';
        newGameBtn.style.cursor = 'pointer';
        
        console.log('🎮 New Game button enabled');
    } else {
        console.warn('⚠️ New Game button not found in DOM');
    }
}

/**
 * Initialize the main game with character data
 * Called from character creator when "Start Simulation" is clicked
 */
window.initializeGame = function(characterData) {
    try {
        console.log('🚀 Initializing main game with character data...');
        console.log('👥 Characters:', characterData.characters.length);
        console.log('🏢 Office type:', characterData.officeType);
        
        // Store character data
        gameState.characters = characterData.characters;
        gameState.officeType = characterData.officeType;
        
        // Hide start screen
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // Hide character creator
        const creatorModal = document.getElementById('creator-modal-backdrop');
        if (creatorModal) {
            creatorModal.classList.add('hidden');
        }
        
        // Show game container
        const gameContainer = document.getElementById('main-game-ui');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
        }
        
        // Initialize game systems
        initializeGameSystems();
        
        // Initialize status panel with first character
        initializeStatusPanel();
        
        console.log('✅ Main game initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize main game:', error);
        showErrorMessage('Failed to start the game. Please try again.');
    }
};

/**
 * Initialize game systems (basic placeholder for now)
 */
function initializeGameSystems() {
    console.log('⚙️ Initializing game systems...');
    
    // For now, show a placeholder in the world canvas container
    const gameWorldDiv = document.getElementById('world-canvas-container');
    if (gameWorldDiv) {
        gameWorldDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #2a2a2a; color: white; text-align: center; padding: 20px;">
                <div>
                    <h2 style="margin-bottom: 20px;">🎮 Game World</h2>
                    <p><strong>Office Type:</strong> ${gameState.officeType}</p>
                    <p><strong>Characters:</strong> ${gameState.characters.length}</p>
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                        <p><strong>🚧 Development Status:</strong></p>
                        <p>Character Creator: ✅ Complete</p>
                        <p>World Rendering: 🚧 In Progress</p>
                        <p>Character Movement: 🚧 In Progress</p>
                        <p>AI System: 🚧 In Progress</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    console.log('⚙️ Basic game systems initialized');
}

/**
 * Initialize the status panel with character data
 */
function initializeStatusPanel() {
    console.log('📊 Initializing status panel...');
    
    // Find the player character
    const playerCharacter = gameState.characters.find(char => char.isPlayer);
    if (!playerCharacter) {
        console.warn('⚠️ No player character found');
        return;
    }
    
    // Update character name and role
    const nameElement = document.getElementById('character-name');
    const roleElement = document.getElementById('character-role');
    
    if (nameElement) {
        nameElement.textContent = playerCharacter.name || 'Unknown';
    }
    
    if (roleElement) {
        roleElement.textContent = playerCharacter.jobRole || 'No Role';
    }
    
    // Update status bars
    updateStatusBars(playerCharacter);
    
    // Update inventory
    updateInventoryDisplay(playerCharacter);
    
    // Update portrait canvas (basic placeholder)
    updatePortraitCanvas(playerCharacter);
    
    // Start clock
    startClock();
    
    console.log('📊 Status panel initialized for:', playerCharacter.name);
}

/**
 * Update status bars in the UI
 */
function updateStatusBars(character) {
    const needs = character.needs || {};
    
    const statusMappings = [
        { id: 'energy', value: needs.energy || 0 },
        { id: 'hunger', value: needs.hunger || 0 },
        { id: 'social', value: needs.social || 0 },
        { id: 'stress', value: Math.max(0, 100 - (needs.energy || 0)) } // Inverse of energy for stress
    ];
    
    statusMappings.forEach(({ id, value }) => {
        const valueElement = document.getElementById(`${id}-value`);
        const barElement = document.getElementById(`${id}-bar`);
        
        if (valueElement) {
            valueElement.textContent = `${Math.round(value)}%`;
        }
        
        if (barElement) {
            barElement.style.width = `${Math.round(value)}%`;
        }
    });
}

/**
 * Update inventory display
 */
function updateInventoryDisplay(character) {
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryList) return;
    
    inventoryList.innerHTML = '';
    
    if (character.inventory && character.inventory.length > 0) {
        character.inventory.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            listItem.style.cssText = 'padding: 4px 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 4px;';
            inventoryList.appendChild(listItem);
        });
    } else {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'No items';
        emptyItem.style.cssText = 'color: #999; font-style: italic;';
        inventoryList.appendChild(emptyItem);
    }
}

/**
 * Update portrait canvas with character sprite
 */
function updatePortraitCanvas(character) {
    const canvas = document.getElementById('player-portrait-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (character.spriteSheet) {
        // Try to load and draw the character sprite
        const img = new Image();
        img.onload = function() {
            // Scale and draw the image to fit the canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.onerror = function() {
            // Fallback: draw a simple placeholder
            drawPlaceholderPortrait(ctx, canvas, character);
        };
        img.src = character.spriteSheet;
    } else {
        // Draw placeholder
        drawPlaceholderPortrait(ctx, canvas, character);
    }
}

/**
 * Draw a placeholder portrait
 */
function drawPlaceholderPortrait(ctx, canvas, character) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Background
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Head
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 5, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Body
    ctx.fillStyle = '#cbd5e0';
    ctx.fillRect(centerX - 10, centerY + 8, 20, 15);
    
    // Initial
    ctx.fillStyle = '#2d3748';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    const initial = (character.name || 'U').charAt(0).toUpperCase();
    ctx.fillText(initial, centerX, centerY + 2);
}

/**
 * Start the real-time clock
 */
function startClock() {
    function updateClock() {
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
    }
    
    // Update immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Future: resize game canvas here
    console.log('📐 Window resized');
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    // Create error overlay
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-family: Arial, sans-serif;
    `;
    
    errorDiv.innerHTML = `
        <div style="background: #ff4444; padding: 30px; border-radius: 8px; max-width: 500px; text-align: center;">
            <h2 style="margin: 0 0 15px 0;">❌ Error</h2>
            <p style="margin: 0 0 20px 0;">${message}</p>
            <button onclick="location.reload()" style="padding: 10px 20px; background: white; color: #ff4444; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                Reload Page
            </button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
}

/**
 * Development utilities
 */
window.gameState = gameState;
window.debugGame = function() {
    console.log('🔍 Game State Debug:', gameState);
    return gameState;
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    console.log('👋 Office Purgatory shutting down...');
});
