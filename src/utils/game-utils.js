/**
 * Game Utilities Module
 * Handles game initialization, renderer setup, and default character generation
 */

/**
 * Generate default characters when creator fails
 */
export function generateDefaultCharacters() {
    console.log('🎭 Generating default characters...');
    
    return [
        {
            id: 'char_0',
            name: 'Alex Thompson',
            isPlayer: true,
            jobRole: 'IT Specialist',
            spriteSheet: './assets/characters/character-01.png',
            spriteIndex: 0,
            physicalAttributes: { 
                gender: 'Male', 
                age: 28, 
                height: 175, 
                weight: 70, 
                looks: 7,
                build: 'Average'
            },
            skillAttributes: { 
                competence: 75, 
                laziness: 30, 
                charisma: 60, 
                leadership: 50 
            },
            personalityTags: ['Analytical', 'Introverted', 'Detail-oriented'],
            inventory: ['Coffee Mug', 'Smartphone'],
            deskItems: ['Family Photo', 'Plant'],
            apiKey: '',
            position: { x: 200, y: 200 },
            actionState: 'idle',
            mood: 'Neutral',
            facingAngle: 90,
            maxSightRange: 250,
            isBusy: false,
            currentAction: null,
            path: [],
            relationships: {}
        },
        {
            id: 'char_1',
            name: 'Sarah Chen',
            isPlayer: false,
            jobRole: 'Project Manager',
            spriteSheet: './assets/characters/character-02.png',
            spriteIndex: 1,
            physicalAttributes: { 
                gender: 'Female', 
                age: 32, 
                height: 165, 
                weight: 60, 
                looks: 8,
                build: 'Slim'
            },
            skillAttributes: { 
                competence: 85, 
                laziness: 20, 
                charisma: 80, 
                leadership: 90 
            },
            personalityTags: ['Organized', 'Extroverted', 'Leadership'],
            inventory: ['Notebook', 'Pen'],
            deskItems: ['Calendar', 'Award Trophy'],
            apiKey: '',
            position: { x: 400, y: 300 },
            actionState: 'idle',
            mood: 'Neutral',
            facingAngle: 90,
            maxSightRange: 250,
            isBusy: false,
            currentAction: null,
            path: [],
            relationships: {}
        }
    ];
}

/**
 * Initialize renderer with comprehensive error handling
 */
export async function initializeRenderer(gameEngine, mapData, characters) {
    console.log('🎨 Initializing renderer...');
    
    const worldContainer = document.getElementById('world-canvas-container');
    if (!worldContainer) {
        throw new Error('World canvas container not found');
    }
    
    let renderer = null;
    
    try {
        const { Renderer } = await import('../rendering/renderer.js');
        renderer = new Renderer(worldContainer);
        await renderer.initialize();
        gameEngine.setRenderer(renderer);
        
        // Render map
        renderer.renderMap(mapData);
        console.log('🏢 Map rendered');
        
        // Add characters
        for (const character of characters) {
            await renderer.addCharacter(character);
        }
        console.log('👥 Characters added to renderer');
        
        return renderer;
        
    } catch (rendererError) {
        console.error('❌ Renderer failed:', rendererError);
        createRendererFallback(worldContainer, gameEngine.world.getWorldBounds());
        return null;
    }
}

/**
 * Create fallback renderer when PixiJS fails
 */
function createRendererFallback(container, worldBounds) {
    console.log('📦 Creating fallback renderer...');
    
    const fallback = document.createElement('div');
    fallback.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #2c3e50;
        font-family: Arial, sans-serif;
        text-align: center;
        border-radius: 8px;
    `;
    
    fallback.innerHTML = `
        <h3>🏢 Office Purgatory</h3>
        <p>World Size: ${worldBounds.width}×${worldBounds.height} pixels</p>
        <p>Click anywhere to test movement</p>
        <p style="font-size: 12px; color: #7f8c8d;">
            Renderer fallback active - game systems working
        </p>
    `;
    
    container.innerHTML = '';
    container.appendChild(fallback);
}
