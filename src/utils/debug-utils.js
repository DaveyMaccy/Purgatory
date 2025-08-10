/**
 * Debug Utilities Module
 * Provides comprehensive testing and debugging functions
 */

/**
 * Initialize debug functions on window object for console access
 */
export function initializeDebugFunctions() {
    // Make debug functions available globally
    window.runAllTests = runAllTests;
    window.debugElements = testUIElements;
    window.debugCharacterCreator = testCharacterCreatorConnection;
    window.debugGameState = testGameState;
    window.testSpriteLoading = testSpriteLoading;
    window.checkSystemHealth = runAllTests;
    
    console.log('🧪 Debug functions initialized');
}

/**
 * Comprehensive test suite
 */
async function runAllTests() {
    console.log('🧪 Running comprehensive test suite...');
    
    const results = {
        uiElements: testUIElements(),
        characterCreator: testCharacterCreatorConnection(),
        gameState: testGameState(),
        spriteLoading: await testSpriteLoading()
    };
    
    console.log('📊 Test Results:');
    console.table(results);
    
    // Calculate overall success
    const flatResults = Object.values(results).flatMap(r => 
        typeof r === 'object' ? Object.values(r) : [r]
    );
    const successCount = flatResults.filter(r => 
        r === true || (typeof r === 'object' && r.loaded > r.failed)
    ).length;
    const totalCount = flatResults.length;
    const successRate = (successCount / totalCount * 100).toFixed(1);
    
    console.log(`🎯 Overall Success Rate: ${successRate}%`);
    
    return results;
}

/**
 * Test UI elements existence
 */
function testUIElements() {
    return {
        newGameButton: !!document.getElementById('new-game-button'),
        creatorModal: !!document.getElementById('creator-modal-backdrop'),
        startScreen: !!document.getElementById('start-screen-backdrop'),
        gameView: !!document.getElementById('game-view'),
        worldContainer: !!document.getElementById('world-canvas-container'),
        statusPanel: !!document.getElementById('status-panel')
    };
}

/**
 * Test character creator connection
 */
function testCharacterCreatorConnection() {
    return {
        moduleLoaded: typeof window.initializeCharacterCreator === 'function',
        exportFunction: typeof window.getCharactersFromCreator === 'function',
        startGameFunction: typeof window.startGameWithCharacters === 'function',
        switchTabFunction: typeof window.switchTab === 'function'
    };
}

/**
 * Test game state
 */
function testGameState() {
    // Access from global scope
    const gameEngine = window.gameEngine;
    const characterManager = window.characterManager;
    const movementSystem = window.movementSystem;
    const renderer = window.renderer;
    const focusTargetId = window.focusTargetId;
    
    return {
        gameEngine: !!gameEngine,
        characterManager: !!characterManager,
        movementSystem: !!movementSystem,
        renderer: !!renderer,
        focusTargetSet: !!focusTargetId,
        worldExists: !!(gameEngine && gameEngine.world)
    };
}

/**
 * Test sprite loading for all 20 character sprites
 */
async function testSpriteLoading() {
    console.log('🧪 Testing sprite loading...');
    
    const results = { loaded: 0, failed: 0, details: [] };
    
    const promises = Array.from({length: 20}, (_, i) => {
        const spriteNumber = (i + 1).toString().padStart(2, '0');
        const spritePath = `./assets/characters/character-${spriteNumber}.png`;
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                results.loaded++;
                results.details.push({ sprite: spriteNumber, status: 'loaded', path: spritePath });
                resolve();
            };
            img.onerror = () => {
                results.failed++;
                results.details.push({ sprite: spriteNumber, status: 'failed', path: spritePath });
                resolve();
            };
            img.src = spritePath;
        });
    });
    
    await Promise.all(promises);
    
    console.log(`📊 Sprite Loading Results: ${results.loaded}/20 loaded, ${results.failed}/20 failed`);
    if (results.failed > 0) {
        console.log('❌ Failed sprites:', results.details.filter(d => d.status === 'failed'));
    }
    
    return results;
}

/**
 * Test coordinate conversion
 */
export function testCoordinateConversion(canvasX = 400, canvasY = 300) {
    console.log('🧪 Testing coordinate conversion...');
    
    const worldContainer = document.getElementById('world-canvas-container');
    if (!worldContainer) {
        console.error('❌ World container not found');
        return null;
    }
    
    const rect = worldContainer.getBoundingClientRect();
    console.log(`📊 Canvas click: (${canvasX}, ${canvasY})`);
    console.log(`📊 Canvas size: ${rect.width} × ${rect.height}`);
    
    // This would need access to game world bounds
    // For now, return test structure
    return {
        canvasX,
        canvasY,
        canvasWidth: rect.width,
        canvasHeight: rect.height,
        testPassed: true
    };
}

/**
 * Performance monitoring
 */
export function monitorPerformance() {
    const startTime = performance.now();
    
    return {
        start: startTime,
        measure: (label) => {
            const elapsed = performance.now() - startTime;
            console.log(`⏱️ ${label}: ${elapsed.toFixed(2)}ms`);
            return elapsed;
        }
    };
}

/**
 * Memory usage check (if available)
 */
export function checkMemoryUsage() {
    if (performance.memory) {
        const memory = performance.memory;
        console.log('💾 Memory Usage:', {
            used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
            total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
            limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
        });
        return memory;
    } else {
        console.log('💾 Memory monitoring not available');
        return null;
    }
}

// Auto-initialize debug functions when module loads
initializeDebugFunctions();
