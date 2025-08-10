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
        
        // Global escape key handler for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
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

console.log('🎨 UI Manager Module loaded');
