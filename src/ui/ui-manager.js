/**
 * UI Manager Module
 * 
 * Centralized UI management including modals, messages, loading states,
 * and general UI coordination. Handles all non-game-specific UI elements.
 */

class UIManager {
    constructor() {
        this.isInitialized = false;
        this.activeModals = new Set();
        this.loadingElements = new Map();
        this.activePopups = new Map();
        this.popupStack = [];
    }
    
    /**
     * Initialize the UI Manager
     */
    async initialize() {
        console.log('🎨 Initializing UI Manager...');
        
        this.setupModalHandlers();
        this.setupGlobalUIElements();
        this.setupKeyboardShortcuts();
        this.setupLoadingStates();
        
        this.isInitialized = true;
        console.log('✅ UI Manager initialized');
    }
    
    /**
     * Setup modal event handlers
     */
    setupModalHandlers() {
        // Character creator modal
        const creatorModal = document.getElementById('character-creator-modal');
        if (creatorModal) {
            // Close on background click
            creatorModal.addEventListener('click', (e) => {
                if (e.target === creatorModal) {
                    this.closeModal('character-creator-modal');
                }
            });
        }
        
        // Global escape key handler for modals and popups
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.popupStack.length > 0) {
                    this.closeAllPopups();
                } else {
                    this.closeTopModal();
                }
            }
        });
        
        // Close button handlers
        const closeButtons = document.querySelectorAll('.modal-close, .character-creator-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = btn.closest('.modal, #character-creator-modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }
    
    /**
     * Setup global UI elements
     */
    setupGlobalUIElements() {
        // Menu toggle buttons
        const menuToggles = document.querySelectorAll('[data-toggle-menu]');
        menuToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.dataset.toggleMenu;
                this.toggleMenu(targetId);
            });
        });
        
        // Tab navigation
        const tabButtons = document.querySelectorAll('[data-tab-target]');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.tabTarget;
                this.switchTab(targetId);
            });
        });
        
        // Collapsible sections
        const collapsibles = document.querySelectorAll('[data-collapsible]');
        collapsibles.forEach(element => {
            const header = element.querySelector('[data-collapsible-header]');
            if (header) {
                header.addEventListener('click', () => {
                    this.toggleCollapsible(element);
                });
            }
        });
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.matches('input, textarea, select')) {
                return;
            }
            
            // Ctrl/Cmd + N: New Game
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (window.showCharacterCreator) {
                    window.showCharacterCreator();
                }
            }
            
            // Space: Pause/Resume
            if (e.key === ' ') {
                e.preventDefault();
                if (window.togglePause) {
                    window.togglePause();
                }
            }
            
            // Number keys 1-5: Focus on characters
            if (e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const charIndex = parseInt(e.key) - 1;
                if (window.setFocusTarget) {
                    window.setFocusTarget(`char_${charIndex + 1}`);
                }
            }
            
            // F1: Help/Controls
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
        });
    }
    
    /**
     * Setup loading state management
     */
    setupLoadingStates() {
        // Remove any existing loading overlays on init
        const existingLoaders = document.querySelectorAll('.loading-overlay');
        existingLoaders.forEach(loader => loader.remove());
    }
    
    /**
     * Create and show popup window
     */
    showPopup(title, options, position = null) {
        const popupId = 'popup-' + Date.now();
        const popup = document.createElement('div');
        popup.id = popupId;
        popup.className = 'interaction-popup';
        
        // Position popup
        let positionStyle = 'position: fixed; z-index: 1000;';
        if (position) {
            positionStyle += `left: ${position.x}px; top: ${position.y}px;`;
        } else {
            positionStyle += 'left: 50%; top: 50%; transform: translate(-50%, -50%);';
        }
        
        popup.style.cssText = positionStyle + `
            background: rgba(45, 55, 72, 0.95);
            border: 2px solid #4a5568;
            border-radius: 8px;
            min-width: 200px;
            max-width: 300px;
            padding: 0;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'popup-header';
        header.style.cssText = `
            background: #2d3748;
            color: #e2e8f0;
            padding: 12px 16px;
            border-bottom: 1px solid #4a5568;
            border-radius: 6px 6px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 14px;
        `;
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        header.appendChild(titleSpan);
        
        // Add back button if there are previous popups
        if (this.popupStack.length > 0) {
            const backBtn = document.createElement('button');
            backBtn.innerHTML = '←';
            backBtn.className = 'popup-back-btn';
            backBtn.style.cssText = `
                background: none;
                border: none;
                color: #a0aec0;
                font-size: 16px;
                cursor: pointer;
                padding: 0 4px;
                margin-right: 8px;
            `;
            backBtn.onclick = () => this.goBackPopup();
            
            const buttonContainer = document.createElement('div');
            buttonContainer.appendChild(backBtn);
            buttonContainer.appendChild(this.createCloseButton(popupId));
            header.appendChild(buttonContainer);
        } else {
            header.appendChild(this.createCloseButton(popupId));
        }
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'popup-options';
        optionsContainer.style.cssText = `
            padding: 8px 0;
        `;
        
        // Add options
        options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'popup-option-btn';
            optionBtn.textContent = option.text;
            optionBtn.style.cssText = `
                width: 100%;
                background: none;
                border: none;
                color: #e2e8f0;
                padding: 12px 16px;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            `;
            
            optionBtn.onmouseover = () => {
                optionBtn.style.backgroundColor = '#4a5568';
            };
            optionBtn.onmouseout = () => {
                optionBtn.style.backgroundColor = 'transparent';
            };
            
            optionBtn.onclick = () => {
                if (option.action) {
                    option.action();
                }

                if (!option.keepOpen) {
                    // Use a timeout to prevent the old popup from being destroyed before
                    // a new one (potentially opened by the action) can render. This fixes
                    // the non-functional "Search" and inventory item buttons.
                    setTimeout(() => this.closePopup(popupId), 0);
                }
            };
            
            optionsContainer.appendChild(optionBtn);
        });
        
        popup.appendChild(header);
        popup.appendChild(optionsContainer);
        document.body.appendChild(popup);
        
        // Store popup reference
        this.activePopups.set(popupId, popup);
        this.popupStack.push(popupId);
        
        return popupId;
    }
    
    /**
     * Create close button for popups
     */
    createCloseButton(popupId) {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.className = 'popup-close-btn';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #a0aec0;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.onclick = () => this.closeAllPopups();
        return closeBtn;
    }
    
    /**
     * Close specific popup
     */
    closePopup(popupId) {
        const popup = this.activePopups.get(popupId);
        if (popup) {
            popup.remove();
            this.activePopups.delete(popupId);
            
            // Remove from stack
            const index = this.popupStack.indexOf(popupId);
            if (index > -1) {
                this.popupStack.splice(index, 1);
            }
        }
    }
    
    /**
     * Close all popups
     */
    closeAllPopups() {
        this.popupStack.forEach(popupId => {
            const popup = this.activePopups.get(popupId);
            if (popup) {
                popup.remove();
            }
        });
        this.activePopups.clear();
        this.popupStack = [];
    }
    
    /**
     * Go back to previous popup
     */
    goBackPopup() {
        if (this.popupStack.length > 1) {
            const currentPopupId = this.popupStack.pop();
            this.closePopup(currentPopupId);
        }
    }
    
    /**
     * Show container contents popup
     */
    showContainerPopup(containerName, items, position, onTakeItem, onGiveItem) {
        const options = [
            {
                text: 'Search',
                action: () => {
                    this.showSearchResultsPopup(containerName, items, position, onTakeItem, onGiveItem);
                },
                keepOpen: false
            }
        ];
        
        return this.showPopup(containerName, options, position);
    }
    
    /**
     * Show search results popup for container contents
     */
    showSearchResultsPopup(containerName, items, position, onTakeItem, onGiveItem) {
        const options = [];
        
        // Add container items for taking
        if (items && items.length > 0) {
            items.forEach(item => {
                // Look up the item's display name from the central inventory system
                const itemData = window.getItemById(item.id);
                const displayName = itemData ? itemData.name : item.id;
                options.push({
                    text: `Take ${displayName} (${item.quantity})`,
                    action: () => onTakeItem(item),
                    keepOpen: false
                });
            });
        } else {
            // Use a non-clickable label for an empty container
            options.push({ text: '(Empty)', action: null, keepOpen: true });
        }
        
        // Add player inventory items for giving
        const player = window.characterManager?.getPlayerCharacter();
        if (player && player.inventory && player.inventory.length > 0) {
            options.push({ text: '--- Give Item ---', action: null, keepOpen: true });
            
            player.inventory.forEach(invItem => {
                const itemData = window.getItemById(typeof invItem === 'object' ? invItem.id : invItem);
                if (itemData) {
                    options.push({
                        text: `Give ${itemData.name}`,
                        action: () => onGiveItem(invItem),
                        keepOpen: false
                    });
                }
            });
        }
        
        return this.showPopup(`${containerName} Contents`, options, position);
    }
    
    /**
     * Show character interaction popup
     */
    showCharacterPopup(characterName, position, actions) {
        const options = [
            {
                text: 'Talk',
                action: () => actions.talk(),
                keepOpen: false
            },
            {
                text: 'Give Item',
                action: () => actions.giveItem(),
                keepOpen: false
            },
            {
                text: 'Ask For Item',
                action: () => actions.askForItem(),
                keepOpen: false
            },
            {
                text: 'Ask to Use Object',
                action: () => actions.askToUse(),
                keepOpen: false
            }
        ];
        
        return this.showPopup(characterName, options, position);
    }
    
    /**
     * Show inventory item popup
     */
    showInventoryItemPopup(item, position, actions) {
        const options = [];
        
        // Add context-appropriate actions
        if (item.interactions?.eat) {
            options.push({
                text: 'Eat',
                action: () => actions.eat(item),
                keepOpen: false
            });
        }
        
        if (item.interactions?.drink) {
            options.push({
                text: 'Drink',
                action: () => actions.drink(item),
                keepOpen: false
            });
        }
        
        // Always available actions
        options.push({
            text: 'Use',
            action: () => actions.use(item),
            keepOpen: false
        });
        
        options.push({
            text: 'Use With...',
            action: () => actions.useWith(item),
            keepOpen: false
        });
        
        return this.showPopup(item.name || 'Item', options, position);
    }

    /**
     * Show modal by ID
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            this.activeModals.add(modalId);
            console.log(`📝 Modal opened: ${modalId}`);
        }
    }
    
    /**
     * Close modal by ID
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            this.activeModals.delete(modalId);
            console.log(`📝 Modal closed: ${modalId}`);
            
            // Call specific close handler if available
            if (modalId === 'character-creator-modal' && window.closeCharacterCreator) {
                // Character creator has its own close logic
            }
        }
    }
    
    /**
     * Close the topmost modal
     */
    closeTopModal() {
        if (this.activeModals.size > 0) {
            const lastModal = Array.from(this.activeModals).pop();
            this.closeModal(lastModal);
        }
    }
    
    /**
     * Toggle menu visibility
     */
    toggleMenu(menuId) {
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.classList.toggle('hidden');
            menu.classList.toggle('visible');
        }
    }
    
    /**
     * Switch between tabs
     */
    switchTab(targetId) {
        // Hide all tab content
        const allTabContent = document.querySelectorAll('.tab-content');
        allTabContent.forEach(content => content.classList.add('hidden'));
        
        // Remove active class from all tab buttons
        const allTabButtons = document.querySelectorAll('[data-tab-target]');
        allTabButtons.forEach(button => button.classList.remove('active'));
        
        // Show target tab content
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }
        
        // Activate corresponding tab button
        const targetButton = document.querySelector(`[data-tab-target="${targetId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
    
    /**
     * Toggle collapsible section
     */
    toggleCollapsible(element) {
        const content = element.querySelector('[data-collapsible-content]');
        const header = element.querySelector('[data-collapsible-header]');
        
        if (content) {
            const isCollapsed = content.classList.contains('collapsed');
            
            if (isCollapsed) {
                content.classList.remove('collapsed');
                content.style.maxHeight = content.scrollHeight + 'px';
                if (header) header.setAttribute('aria-expanded', 'true');
            } else {
                content.classList.add('collapsed');
                content.style.maxHeight = '0';
                if (header) header.setAttribute('aria-expanded', 'false');
            }
        }
    }
    
    /**
     * Show loading overlay
     */
    showLoadingState(isLoading, message = 'Loading...', targetId = null) {
        if (isLoading) {
            const loaderId = targetId ? `loader-${targetId}` : 'global-loader';
            
            if (!this.loadingElements.has(loaderId)) {
                const loader = this.createLoadingElement(message);
                loader.id = loaderId;
                
                if (targetId) {
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.appendChild(loader);
                    } else {
                        document.body.appendChild(loader);
                    }
                } else {
                    document.body.appendChild(loader);
                }
                
                this.loadingElements.set(loaderId, loader);
            }
        } else {
            const loaderId = targetId ? `loader-${targetId}` : 'global-loader';
            const loader = this.loadingElements.get(loaderId);
            
            if (loader && loader.parentNode) {
                loader.parentNode.removeChild(loader);
                this.loadingElements.delete(loaderId);
            }
        }
    }
    
    /**
     * Create loading element
     */
    createLoadingElement(message) {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('loading-styles')) {
            const styles = document.createElement('style');
            styles.id = 'loading-styles';
            styles.textContent = `
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }
                .loading-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 10px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-message {
                    color: #333;
                    font-size: 14px;
                }
            `;
            document.head.appendChild(styles);
        }
        
        return loader;
    }
    
    /**
     * Show error message
     */
    showError(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    }
    
    /**
     * Show success message
     */
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    }
    
    /**
     * Show warning message
     */
    showWarning(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    }
    
    /**
     * Show info message
     */
    showInfo(message, duration = 3000) {
        this.showNotification(message, 'info', duration);
    }
    
    /**
     * Show notification with type
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 6px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    max-width: 300px;
                    word-wrap: break-word;
                    animation: slideIn 0.3s ease-out;
                }
                .notification-error { background: #e74c3c; }
                .notification-success { background: #27ae60; }
                .notification-warning { background: #f39c12; }
                .notification-info { background: #3498db; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
    
    /**
     * Show help/controls modal
     */
    showHelp() {
        const helpContent = `
            <h3>Game Controls</h3>
            <ul>
                <li><strong>Ctrl/Cmd + N:</strong> New Game</li>
                <li><strong>Space:</strong> Pause/Resume</li>
                <li><strong>1-5:</strong> Focus on Character</li>
                <li><strong>Escape:</strong> Close Modal</li>
                <li><strong>F1:</strong> Show Help</li>
            </ul>
            <h3>Character Creator</h3>
            <ul>
                <li><strong>Ctrl/Cmd + R:</strong> Randomize Current Character</li>
                <li><strong>Ctrl/Cmd + 1-5:</strong> Switch Character Tab</li>
            </ul>
        `;
        
        this.showCustomModal('Help', helpContent);
    }
    
    /**
     * Show custom modal with content
     */
    showCustomModal(title, content) {
        const modalId = 'custom-modal-' + Date.now();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 10000;';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h2 style="margin: 0;">${title}</h2>
                    <button class="modal-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.activeModals.add(modalId);
        
        // Setup close handlers
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modalId);
                modal.remove();
            }
        });
        
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal(modalId);
                modal.remove();
            });
        }
    }
    
    /**
     * Update UI state based on game state
     */
    updateGameState(state) {
        const body = document.body;
        
        // Remove existing state classes
        body.classList.remove('game-loading', 'game-menu', 'game-playing', 'game-paused');
        
        // Add current state class
        body.classList.add(`game-${state}`);
        
        // Update UI elements based on state
        this.updateUIForState(state);
    }
    
    /**
     * Update UI elements for specific game state
     */
    updateUIForState(state) {
        const newGameBtn = document.getElementById('new-game-btn');
        const gameControls = document.querySelector('.game-controls');
        const mainMenu = document.querySelector('.main-menu');
        
        switch (state) {
            case 'menu':
                if (newGameBtn) newGameBtn.style.display = 'block';
                if (gameControls) gameControls.style.display = 'none';
                if (mainMenu) mainMenu.style.display = 'block';
                break;
                
            case 'playing':
                if (newGameBtn) newGameBtn.style.display = 'none';
                if (gameControls) gameControls.style.display = 'block';
                if (mainMenu) mainMenu.style.display = 'none';
                break;
                
            case 'loading':
                // Loading state is handled by showLoadingState
                break;
        }
    }
    
    /**
     * Cleanup UI Manager
     */
    cleanup() {
        // Remove all active modals
        this.activeModals.forEach(modalId => {
            this.closeModal(modalId);
        });
        
        // Remove all loading elements
        this.loadingElements.forEach(loader => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        });
        this.loadingElements.clear();
        
        this.isInitialized = false;
        console.log('🗑️ UI Manager cleaned up');
    }
}

export { UIManager };

// ADDITIONAL FUNCTIONS MOVED FROM main.js

/**
 * Initialize UI elements and inject required styles
 * EXACT CODE FROM: main.js lines 44-65
 */
export function initializeUIElements() {
    console.log('🎨 Initializing UI elements...');
    
    // Hide game elements first
    hideCharacterCreator();
    hideGameView();
    
    // Setup status panel tabs  
    setupStatusPanelTabs();
    
    // Inject tab CSS fixes
    injectTabCSS();
    
    // ALWAYS show start screen last
    showStartScreen();

    // Setup debug panel
    setupDebugPanel();
    
    console.log('✅ UI elements initialized');
}

/**
 * Inject CSS fixes for tab alignment
 * EXACT CODE FROM: main.js lines 109-163
 */
export function injectTabCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Tab alignment fixes */
        .tab-bar {
            display: flex;
            border-bottom: 1px solid #333;
            background: #1a1a1a;
        }
        
        .tab-link {
            padding: 10px 20px;
            background: transparent;
            color: #888;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .tab-link:hover {
            background: #2a2a2a;
            color: #fff;
        }
        
        .tab-link.active {
            background: #333;
            color: #0ff;
            border-bottom: 2px solid #0ff;
            margin-bottom: -1px;
        }
        
        .tab-content {
            display: none;
            padding: 15px;
            min-height: 200px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Ensure proper z-index for tab bar */
        .tab-bar {
            z-index: 10;
            margin-top: -1px;
        }
        
        /* Ensure the widget container has proper flex layout */
        .widget.flex-grow {
            display: flex;
            flex-direction: column;
        }
        
        .widget .flex-grow {
            flex: 1;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Tab CSS injected with proper alignment');
}

/**
 * Set up status panel tab switching
 * EXACT CODE FROM: main.js lines 168-199
 */
export function setupStatusPanelTabs() {
    console.log('🔧 Setting up status panel tabs...');
    
    const tabs = document.querySelectorAll('.status-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            const tabName = tab.textContent.trim().toLowerCase();
            console.log(`📋 Switching to tab: ${tabName}`);
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content visibility
            contents.forEach((content, contentIndex) => {
                content.classList.toggle('hidden', contentIndex !== index);
            });
            
            // FORCE UI UPDATE AFTER TAB SWITCH
            if (window.characterManager && window.uiUpdater) {
                setTimeout(() => {
                    const focusedCharacter = window.characterManager.getPlayerCharacter();
                    if (focusedCharacter) {
                        console.log(`🔄 Forcing UI update for tab: ${tabName}`);
                        window.uiUpdater.updateUI(focusedCharacter);
                    }
                }, 50);
            }
        });
    });
    
    console.log('✅ Status panel tabs configured');
}

// UI Visibility Helper Functions - EXACT CODE FROM main.js lines 557-634

export function showStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.classList.remove('hidden');
        startScreen.style.display = 'flex';
    } else {
        console.warn('UI Warning: Element with ID "start-screen-backdrop" not found.');
    }
}

export function hideStartScreen() {
    const startScreen = document.getElementById('start-screen-backdrop');
    if (startScreen) {
        startScreen.classList.add('hidden');
        startScreen.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "start-screen-backdrop" not found.');
    }
}

export function showCharacterCreator() {
    const creator = document.getElementById('creator-modal-backdrop');
    if (creator) {
        creator.classList.remove('hidden');
        creator.style.display = 'flex';
    } else {
        throw new Error('UI Error: Element with ID "creator-modal-backdrop" not found. Cannot open character creator.');
    }
}

export function hideCharacterCreator() {
    const creator = document.getElementById('creator-modal-backdrop');
    if (creator) {
        creator.classList.add('hidden');
        creator.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "creator-modal-backdrop" not found.');
    }
}

export function showGameView() {
    const gameView = document.getElementById('main-game-ui');
    if (gameView) {
        gameView.classList.remove('hidden');
        gameView.style.display = 'flex';
    } else {
        throw new Error('UI Error: Element with ID "main-game-ui" not found. Cannot show game view.');
    }
}

export function hideGameView() {
    const gameView = document.getElementById('main-game-ui');
    if (gameView) {
        gameView.classList.add('hidden');
        gameView.style.display = 'none';
    } else {
        console.warn('UI Warning: Element with ID "main-game-ui" not found.');
    }
}

/**
 * Show error message to user
 * EXACT CODE FROM: main.js lines 639-655
 */
export function showErrorMessage(message) {
    console.error('❌ ERROR:', message);
    
    // Try to show in UI
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    // Also show as alert as fallback
    alert(`Error: ${message}`);
}

/**
 * Show success message to user
 * EXACT CODE FROM: main.js lines 660-673
 */
export function showSuccessMessage(message) {
    console.log('✅ SUCCESS:', message);
    
    // Try to show in UI
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

/**
 * Setup debug panel functionality
 * EXTRACTED FROM: main.js lines 711-746 (setupDebugPanel function)
 */
export function setupDebugPanel() {
    // Open debug panel button
    const debugBtn = document.getElementById('debug-panel-btn');
    if (debugBtn) {
        debugBtn.addEventListener('click', () => {
            const modal = document.getElementById('debug-modal-backdrop');
            if (modal) {
                modal.classList.remove('hidden');
            }
        });
    }
    
    // Close debug modal
    const closeBtn = document.getElementById('close-debug-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('debug-modal-backdrop');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    // Run debug command setup is now in debug-manager.js
    const runBtn = document.getElementById('run-debug-cmd');
    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            const { setupDebugCommands } = await import('../utils/debug-manager.js');
            setupDebugCommands();
        });
    }
}

console.log('🎨 UI Manager Module loaded');
