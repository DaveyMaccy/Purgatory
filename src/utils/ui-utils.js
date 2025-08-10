/**
 * UI Utilities Module
 * Handles UI initialization, styling, and tab management
 */

/**
 * Initialize all UI elements and styling
 */
export function initializeUI(worldClickHandler, rightClickHandler) {
    // Add CSS styling
    addTabCSS();
    
    // Setup world container
    setupWorldContainer(worldClickHandler, rightClickHandler);
    
    // Setup status panel tabs
    setupStatusPanelTabs();
    
    console.log('✅ UI utilities initialized');
}

/**
 * Add CSS for tabs and character creator
 */
function addTabCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .tabs {
            display: flex;
            border-bottom: 1px solid #d1d5db;
            margin-bottom: 0;
            background-color: #f9fafb;
            padding: 8px 8px 0 8px;
            border-radius: 6px 6px 0 0;
            gap: 2px;
        }
        
        .tab-link {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            color: #374151;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 6px 6px 0 0;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            flex: 1;
            text-align: center;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-bottom: none;
        }
        
        .tab-link:hover {
            background-color: #e5e7eb;
            color: #1f2937;
        }
        
        .tab-link.active {
            background-color: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .tab-content {
            display: none;
            padding: 16px;
            border: 1px solid #d1d5db;
            border-top: none;
            border-radius: 0 0 6px 6px;
            background-color: white;
            min-height: 200px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .character-tab {
            padding: 8px 16px;
            margin: 2px;
            border: 1px solid #ddd;
            background: #f8f9fa;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        
        .character-tab:hover {
            background: #e9ecef;
        }
        
        .character-tab.active {
            background: #007bff;
            color: white;
        }
        
        .character-tab.player-character {
            border-color: #28a745;
            font-weight: bold;
        }
        
        .creator-panel {
            padding: 1.5rem;
            height: 100%;
            overflow-y: auto;
        }
        
        .creator-panel.hidden {
            display: none;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setup world container for click handling
 */
function setupWorldContainer(worldClickHandler, rightClickHandler) {
    const worldContainer = document.getElementById('world-canvas-container');
    if (worldContainer) {
        worldContainer.addEventListener('click', worldClickHandler);
        worldContainer.addEventListener('contextmenu', rightClickHandler);
        
        worldContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f0f0f0;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
        `;
        
        console.log('✅ World container configured');
    }
}

/**
 * Setup status panel tabs
 */
function setupStatusPanelTabs() {
    window.openTab = function(evt, tabName) {
        console.log(`📋 Switching to tab: ${tabName}`);
        
        // Hide all tab content
        const tabContents = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove("active");
        }
        
        // Remove active class from all tab links
        const tabLinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tabLinks.length; i++) {
            tabLinks[i].classList.remove("active");
        }
        
        // Show selected tab
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add("active");
        }
        
        if (evt && evt.currentTarget) {
            evt.currentTarget.classList.add("active");
        }
    };
    
    console.log('✅ Status panel tabs configured');
}
