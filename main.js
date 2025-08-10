// main.js
/**
 * Main Game Initialization File - FIXED VERSION
 * 
 * CRITICAL FIXES:
 * ✅ Proper initialization sequence
 * ✅ Fixed map loading with fallback
 * ✅ Character creator integration
 * ✅ Error handling and recovery
 * ✅ Clean separation of concerns
 */

// Import modules
import { initializeCharacterCreator } from './character-creator.js';
import { loadMapData, World } from './src/core/world/world.js';

// Game state
let gameState = {
    world: null,
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
        
        // Step 2: Load map data with fallback
        console.log('🗺️ Step 2: Loading map data...');
        const mapData = await loadMapData();
        console.log('✅ Map data loaded:', {
            width: mapData.width,
            height: mapData.height,
            tilesize: mapData.tilewidth || 48
        });
        
        // Step 3: Initialize world
        console.log('🌍 Step 3: Creating game world...');
        gameState.world = new World(null, mapData);
        console.log('✅ Game world created');
        
        // Step 4: Setup UI
        console.log('🖥️ Step 4: Setting up UI...');
        setupUI();
        console.log('✅ UI setup complete');
        
        // Step 5: Enable new game button
        console.log('🎮 Step 5: Enabling game controls...');
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
    const gameContainer = document.getElementById('game-container');
    
    if (startScreen) {
        startScreen.style.display = 'flex';
    }
    
    if (gameContainer) {
        gameContainer.style.display = 'none';
    }
    
    // Setup modal close handlers
    setupModalHandlers();
    
    // Setup window resize handler
    window.addEventListener('resize', handleWindowResize);
    
    console.log('🖥️ UI elements configured');
}

/**
 * Setup modal event handlers
 */
function setupModalHandlers() {
    // Character creator modal handlers
    const characterModal = document.getElementById('character-creator-modal');
    
    if (characterModal) {
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && characterModal.style.display === 'flex') {
                characterModal.style.display = 'none';
            }
        });
        
        // Close on outside click
        characterModal.addEventListener('click', (e) => {
            if (e.target === characterModal) {
                characterModal.style.display = 'none';
            }
        });
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
        
        // Show game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
        
        // Initialize game systems
        initializeGameSystems();
        
        console.log('✅ Main game initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize main game:', error);
        showErrorMessage('Failed to start the game. Please try again.');
    }
};

/**
 * Initialize game systems (rendering, AI, etc.)
 */
function initializeGameSystems() {
    console.log('⚙️ Initializing game systems...');
    
    // For now, just show a basic placeholder
    // In the future, this will initialize:
    // - PixiJS renderer
    // - Character manager
    // - AI system
    // - Game loop
    
    const gameWorldDiv = document.getElementById('game-world');
    if (gameWorldDiv) {
        gameWorldDiv.innerHTML = `
            <div style="padding: 20px; text-align: center; background: #f0f0f0; border-radius: 8px; margin: 20px;">
                <h2>🎮 Game World</h2>
                <p><strong>Office Type:</strong> ${gameState.officeType}</p>
                <p><strong>Characters:</strong> ${gameState.characters.length}</p>
                <div style="margin-top: 20px;">
                    <h3>Characters:</h3>
                    ${gameState.characters.map((char, index) => `
                        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; display: inline-block; margin-right: 10px;">
                            <strong>${char.name || `Character ${index + 1}`}</strong>
                            ${char.isPlayer ? '👑' : ''}
                            <br>
                            <small>${char.jobRole}</small>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 20px; padding: 15px; background: #fffacd; border-radius: 4px;">
                    <p><strong>🚧 Development Note:</strong></p>
                    <p>This is where the full game world will be rendered with PixiJS.<br>
                    Character sprites, office environment, and interactive elements will appear here.</p>
                </div>
            </div>
        `;
    }
    
    console.log('⚙️ Basic game systems initialized');
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Adjust game container size if needed
    const gameContainer = document.getElementById('game-container');
    if (gameContainer && gameContainer.style.display !== 'none') {
        // Future: resize PixiJS canvas here
        console.log('📐 Window resized, adjusting game view');
    }
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
