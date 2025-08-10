/**
 * Input Manager Module
 * 
 * Handles all game input including mouse, keyboard, and touch events.
 * Manages focus controls, camera movement, and interaction handling.
 */

class InputManager {
    constructor() {
        this.isInitialized = false;
        this.activeKeys = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.focusTargetId = null;
        this.inputMode = 'mouse'; // 'mouse', 'keyboard', 'touch'
        
        // Input handlers
        this.keyHandlers = new Map();
        this.mouseHandlers = new Map();
        this.touchHandlers = new Map();
        
        // Camera controls
        this.cameraPosition = { x: 0, y: 0 };
        this.cameraZoom = 1.0;
        this.cameraSpeed = 200; // pixels per second
        this.zoomSpeed = 0.1;
        this.minZoom = 0.5;
        this.maxZoom = 3.0;
        
        // Focus controls
        this.focusTransitionSpeed = 1000; // pixels per second
        this.focusZoom = 1.5;
        this.focusOffset = { x: 0, y: -50 }; // Offset from character center
    }
    
    /**
     * Initialize the Input Manager
     */
    initialize() {
        console.log('🎮 Initializing Input Manager...');
        
        this.setupKeyboardHandlers();
        this.setupMouseHandlers();
        this.setupTouchHandlers();
        this.setupFocusControls();
        this.setupGamepadSupport();
        
        this.isInitialized = true;
        console.log('✅ Input Manager initialized');
    }
    
    /**
     * Setup keyboard event handlers
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            this.activeKeys.add(e.code);
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.activeKeys.delete(e.code);
            this.handleKeyUp(e);
        });
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            const gameKeys = [
                'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH'
            ];
            
            if (gameKeys.includes(e.code) && !this.isTyping()) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * Setup mouse event handlers
     */
    setupMouseHandlers() {
        const gameCanvas = document.getElementById('game-canvas');
        
        if (gameCanvas) {
            // Mouse movement
            gameCanvas.addEventListener('mousemove', (e) => {
                this.mousePosition = this.getCanvasCoordinates(e, gameCanvas);
                this.handleMouseMove(e);
            });
            
            // Mouse buttons
            gameCanvas.addEventListener('mousedown', (e) => {
                this.isMouseDown = true;
                this.dragStart = this.getCanvasCoordinates(e, gameCanvas);
                this.handleMouseDown(e);
            });
            
            gameCanvas.addEventListener('mouseup', (e) => {
                this.isMouseDown = false;
                this.isDragging = false;
                this.handleMouseUp(e);
            });
            
            // Mouse wheel for zooming
            gameCanvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.handleMouseWheel(e);
            });
            
            // Context menu prevention
            gameCanvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
        
        // Global mouse leave handler
        document.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
            this.isDragging = false;
        });
    }
    
    /**
     * Setup touch event handlers for mobile
     */
    setupTouchHandlers() {
        const gameCanvas = document.getElementById('game-canvas');
        
        if (gameCanvas) {
            let lastTouchDistance = 0;
            
            gameCanvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.inputMode = 'touch';
                
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    this.dragStart = this.getCanvasCoordinates(touch, gameCanvas);
                } else if (e.touches.length === 2) {
                    // Pinch zoom start
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    lastTouchDistance = this.getTouchDistance(touch1, touch2);
                }
            });
            
            gameCanvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                
                if (e.touches.length === 1) {
                    // Single finger drag (camera movement)
                    const touch = e.touches[0];
                    const currentPos = this.getCanvasCoordinates(touch, gameCanvas);
                    
                    if (this.dragStart) {
                        const deltaX = currentPos.x - this.dragStart.x;
                        const deltaY = currentPos.y - this.dragStart.y;
                        this.moveCamera(-deltaX, -deltaY);
                        this.dragStart = currentPos;
                    }
                } else if (e.touches.length === 2) {
                    // Two finger pinch (zoom)
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const currentDistance = this.getTouchDistance(touch1, touch2);
                    
                    if (lastTouchDistance > 0) {
                        const zoomFactor = currentDistance / lastTouchDistance;
                        this.zoomCamera(zoomFactor - 1);
                    }
                    
                    lastTouchDistance = currentDistance;
                }
            });
            
            gameCanvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                
                if (e.touches.length === 0) {
                    this.dragStart = null;
                    lastTouchDistance = 0;
                }
            });
        }
    }
    
    /**
     * Setup focus controls from UI elements
     */
    setupFocusControls() {
        // Focus target selector
        const focusSelect = document.getElementById('focus-target');
        if (focusSelect) {
            focusSelect.addEventListener('change', (e) => {
                this.setFocusTarget(e.target.value);
            });
        }
        
        // Character focus buttons
        const focusButtons = document.querySelectorAll('[data-focus-target]');
        focusButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.focusTarget;
                this.setFocusTarget(targetId);
            });
        });
        
        // Speed controls
        const speedControl = document.getElementById('simulation-speed');
        if (speedControl) {
            speedControl.addEventListener('change', (e) => {
                const speed = parseFloat(e.target.value);
                if (window.setSimulationSpeed) {
                    window.setSimulationSpeed(speed);
                }
            });
        }
    }
    
    /**
     * Setup basic gamepad support
     */
    setupGamepadSupport() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 Gamepad connected:', e.gamepad.id);
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('🎮 Gamepad disconnected:', e.gamepad.id);
        });
    }
    
    /**
     * Handle key down events
     */
    handleKeyDown(e) {
        // Skip if typing in input field
        if (this.isTyping()) return;
        
        switch (e.code) {
            // Camera movement (WASD)
            case 'KeyW':
            case 'ArrowUp':
                this.startCameraMovement('up');
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.startCameraMovement('down');
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.startCameraMovement('left');
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.startCameraMovement('right');
                break;
                
            // Zoom controls
            case 'KeyQ':
            case 'Minus':
                this.zoomCamera(-this.zoomSpeed);
                break;
            case 'KeyE':
            case 'Equal':
                this.zoomCamera(this.zoomSpeed);
                break;
                
            // Focus reset
            case 'KeyC':
                this.resetCamera();
                break;
                
            // Character focus (1-5)
            case 'Digit1':
                this.setFocusTarget('char_1');
                break;
            case 'Digit2':
                this.setFocusTarget('char_2');
                break;
            case 'Digit3':
                this.setFocusTarget('char_3');
                break;
            case 'Digit4':
                this.setFocusTarget('char_4');
                break;
            case 'Digit5':
                this.setFocusTarget('char_5');
                break;
                
            // Game controls
            case 'Space':
                if (window.togglePause) {
                    window.togglePause();
                }
                break;
                
            // Debug
            case 'KeyF':
                this.toggleDebugInfo();
                break;
        }
        
        // Call custom key handlers
        const handler = this.keyHandlers.get(e.code);
        if (handler) {
            handler(e);
        }
    }
    
    /**
     * Handle key up events
     */
    handleKeyUp(e) {
        // Stop camera movement
        const movementKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (movementKeys.includes(e.code)) {
            this.stopCameraMovement();
        }
    }
    
    /**
     * Handle mouse move events
     */
    handleMouseMove(e) {
        if (this.isMouseDown && !this.focusTargetId) {
            // Camera dragging
            if (!this.isDragging) {
                this.isDragging = true;
            }
            
            const deltaX = this.mousePosition.x - this.dragStart.x;
            const deltaY = this.mousePosition.y - this.dragStart.y;
            
            this.moveCamera(-deltaX, -deltaY);
            this.dragStart = { ...this.mousePosition };
        }
    }
    
    /**
     * Handle mouse down events
     */
    handleMouseDown(e) {
        this.inputMode = 'mouse';
        
        // Handle character selection/interaction
        if (e.button === 0) { // Left click
            this.handleCharacterInteraction(this.mousePosition);
        }
    }
    
    /**
     * Handle mouse up events
     */
    handleMouseUp(e) {
        // Handle click vs drag distinction
        if (!this.isDragging && e.button === 0) {
            this.handleCanvasClick(this.mousePosition);
        }
    }
    
    /**
     * Handle mouse wheel events
     */
    handleMouseWheel(e) {
        const zoomDelta = e.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;
        this.zoomCamera(zoomDelta);
    }
    
    /**
     * Move camera by delta amount
     */
    moveCamera(deltaX, deltaY) {
        this.cameraPosition.x += deltaX;
        this.cameraPosition.y += deltaY;
        
        // Update renderer if available
        if (window.renderer && window.renderer.setCamera) {
            window.renderer.setCamera(this.cameraPosition.x, this.cameraPosition.y, this.cameraZoom);
        }
    }
    
    /**
     * Zoom camera
     */
    zoomCamera(zoomDelta) {
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.cameraZoom + zoomDelta));
        
        if (newZoom !== this.cameraZoom) {
            this.cameraZoom = newZoom;
            
            // Update renderer if available
            if (window.renderer && window.renderer.setCamera) {
                window.renderer.setCamera(this.cameraPosition.x, this.cameraPosition.y, this.cameraZoom);
            }
        }
    }
    
    /**
     * Start continuous camera movement
     */
    startCameraMovement(direction) {
        this.stopCameraMovement(); // Clear existing movement
        
        this.cameraMovementTimer = setInterval(() => {
            const speed = this.cameraSpeed / 60; // 60 FPS
            
            switch (direction) {
                case 'up':
                    this.moveCamera(0, -speed);
                    break;
                case 'down':
                    this.moveCamera(0, speed);
                    break;
                case 'left':
                    this.moveCamera(-speed, 0);
                    break;
                case 'right':
                    this.moveCamera(speed, 0);
                    break;
            }
        }, 1000 / 60);
    }
    
    /**
     * Stop camera movement
     */
    stopCameraMovement() {
        if (this.cameraMovementTimer) {
            clearInterval(this.cameraMovementTimer);
            this.cameraMovementTimer = null;
        }
    }
    
    /**
     * Set focus target
     */
    setFocusTarget(targetId) {
        if (targetId === 'none' || targetId === '') {
            this.focusTargetId = null;
            this.stopCameraMovement();
        } else {
            this.focusTargetId = targetId;
            this.focusOnTarget();
        }
        
    /**
     * Set focus target
     */
    setFocusTarget(targetId) {
        if (targetId === 'none' || targetId === '') {
            this.focusTargetId = null;
            this.stopCameraMovement();
        } else {
            this.focusTargetId = targetId;
            this.focusOnTarget();
        }
        
        // Update UI
        const focusSelect = document.getElementById('focus-target');
        if (focusSelect && focusSelect.value !== targetId) {
            focusSelect.value = targetId || 'none';
        }
        
        // Update renderer
        if (window.renderer) {
            if (targetId && targetId !== 'none') {
                window.renderer.setFocusTarget(targetId);
            } else {
                window.renderer.clearFocusTarget();
            }
        }
    }
    
    /**
     * Focus camera on target
     */
    focusOnTarget() {
        if (!this.focusTargetId || !window.characterManager) return;
        
        const character = window.characterManager.getCharacter(this.focusTargetId);
        if (character) {
            const targetX = character.position.x + this.focusOffset.x;
            const targetY = character.position.y + this.focusOffset.y;
            
            // Smooth camera transition
            this.smoothMoveCamera(targetX, targetY, this.focusZoom);
        }
    }
    
    /**
     * Smooth camera movement to target position
     */
    smoothMoveCamera(targetX, targetY, targetZoom = null) {
        if (this.cameraTween) {
            clearInterval(this.cameraTween);
        }
        
        const startX = this.cameraPosition.x;
        const startY = this.cameraPosition.y;
        const startZoom = this.cameraZoom;
        const endZoom = targetZoom || this.cameraZoom;
        
        const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
        const duration = Math.min(2000, Math.max(500, distance / this.focusTransitionSpeed * 1000));
        
        let startTime = Date.now();
        
        this.cameraTween = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            // Easing function (ease out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            this.cameraPosition.x = startX + (targetX - startX) * easedProgress;
            this.cameraPosition.y = startY + (targetY - startY) * easedProgress;
            this.cameraZoom = startZoom + (endZoom - startZoom) * easedProgress;
            
            // Update renderer
            if (window.renderer && window.renderer.setCamera) {
                window.renderer.setCamera(this.cameraPosition.x, this.cameraPosition.y, this.cameraZoom);
            }
            
            if (progress >= 1) {
                clearInterval(this.cameraTween);
                this.cameraTween = null;
            }
        }, 1000 / 60);
    }
    
    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.focusTargetId = null;
        this.smoothMoveCamera(0, 0, 1.0);
        
        // Update UI
        const focusSelect = document.getElementById('focus-target');
        if (focusSelect) {
            focusSelect.value = 'none';
        }
        
        // Update renderer
        if (window.renderer && window.renderer.clearFocusTarget) {
            window.renderer.clearFocusTarget();
        }
    }
    
    /**
     * Handle character interaction (click on character)
     */
    handleCharacterInteraction(position) {
        if (!window.characterManager) return;
        
        // Find character at position
        const character = window.characterManager.getCharacterAtPosition(position.x, position.y);
        
        if (character) {
            console.log(`🖱️ Character clicked: ${character.firstName} ${character.lastName}`);
            
            // Set focus to clicked character
            this.setFocusTarget(character.id);
            
            // Trigger character interaction if available
            if (window.gameEngine && window.gameEngine.handleCharacterClick) {
                window.gameEngine.handleCharacterClick(character.id, position);
            }
        }
    }
    
    /**
     * Handle canvas click (empty space)
     */
    handleCanvasClick(position) {
        console.log(`🖱️ Canvas clicked at: ${position.x}, ${position.y}`);
        
        // Trigger movement command or other interactions
        if (window.gameEngine && window.gameEngine.handleCanvasClick) {
            window.gameEngine.handleCanvasClick(position);
        }
    }
    
    /**
     * Toggle debug information display
     */
    toggleDebugInfo() {
        if (window.gameStateManager) {
            const currentValue = window.gameStateManager.getSetting('showDebugInfo');
            window.gameStateManager.updateSetting('showDebugInfo', !currentValue);
        }
        
        // Update debug display
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Get canvas coordinates from mouse/touch event
     */
    getCanvasCoordinates(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }
    
    /**
     * Get distance between two touch points
     */
    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Check if user is currently typing in an input field
     */
    isTyping() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }
    
    /**
     * Add custom key handler
     */
    addKeyHandler(keyCode, handler) {
        this.keyHandlers.set(keyCode, handler);
    }
    
    /**
     * Remove custom key handler
     */
    removeKeyHandler(keyCode) {
        this.keyHandlers.delete(keyCode);
    }
    
    /**
     * Add custom mouse handler
     */
    addMouseHandler(eventType, handler) {
        if (!this.mouseHandlers.has(eventType)) {
            this.mouseHandlers.set(eventType, new Set());
        }
        this.mouseHandlers.get(eventType).add(handler);
    }
    
    /**
     * Remove custom mouse handler
     */
    removeMouseHandler(eventType, handler) {
        const handlers = this.mouseHandlers.get(eventType);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    
    /**
     * Update focus target position (called from game loop)
     */
    updateFocusTarget() {
        if (this.focusTargetId && !this.cameraTween) {
            this.focusOnTarget();
        }
    }
    
    /**
     * Get current input state
     */
    getInputState() {
        return {
            mode: this.inputMode,
            activeKeys: Array.from(this.activeKeys),
            mousePosition: { ...this.mousePosition },
            isMouseDown: this.isMouseDown,
            isDragging: this.isDragging,
            cameraPosition: { ...this.cameraPosition },
            cameraZoom: this.cameraZoom,
            focusTargetId: this.focusTargetId
        };
    }
    
    /**
     * Set camera position directly
     */
    setCameraPosition(x, y, zoom = null) {
        this.cameraPosition.x = x;
        this.cameraPosition.y = y;
        
        if (zoom !== null) {
            this.cameraZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
        }
        
        // Update renderer
        if (window.renderer && window.renderer.setCamera) {
            window.renderer.setCamera(this.cameraPosition.x, this.cameraPosition.y, this.cameraZoom);
        }
    }
    
    /**
     * Get camera bounds for culling
     */
    getCameraBounds() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return null;
        
        const halfWidth = (canvas.width / 2) / this.cameraZoom;
        const halfHeight = (canvas.height / 2) / this.cameraZoom;
        
        return {
            left: this.cameraPosition.x - halfWidth,
            right: this.cameraPosition.x + halfWidth,
            top: this.cameraPosition.y - halfHeight,
            bottom: this.cameraPosition.y + halfHeight
        };
    }
    
    /**
     * Enable/disable input handling
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (!enabled) {
            this.stopCameraMovement();
            this.activeKeys.clear();
            this.isMouseDown = false;
            this.isDragging = false;
        }
    }
    
    /**
     * Update input manager (called from game loop)
     */
    update(deltaTime) {
        // Update continuous camera movement
        if (this.focusTargetId) {
            this.updateFocusTarget();
        }
        
        // Update gamepad input
        this.updateGamepadInput();
        
        // Update debug info
        this.updateDebugInfo();
    }
    
    /**
     * Update gamepad input
     */
    updateGamepadInput() {
        const gamepads = navigator.getGamepads();
        
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad) {
                // Left stick for camera movement
                const leftStickX = gamepad.axes[0];
                const leftStickY = gamepad.axes[1];
                
                if (Math.abs(leftStickX) > 0.1 || Math.abs(leftStickY) > 0.1) {
                    this.moveCamera(leftStickX * this.cameraSpeed / 60, leftStickY * this.cameraSpeed / 60);
                }
                
                // Right stick for zoom
                const rightStickY = gamepad.axes[3];
                if (Math.abs(rightStickY) > 0.1) {
                    this.zoomCamera(rightStickY * this.zoomSpeed / 10);
                }
                
                // Buttons for character focus
                if (gamepad.buttons[0].pressed) { // A button
                    this.setFocusTarget('char_1');
                }
                if (gamepad.buttons[1].pressed) { // B button
                    this.resetCamera();
                }
            }
        }
    }
    
    /**
     * Update debug information
     */
    updateDebugInfo() {
        const debugPanel = document.getElementById('debug-input-info');
        if (debugPanel && window.gameStateManager?.getSetting('showDebugInfo')) {
            debugPanel.innerHTML = `
                <strong>Input State:</strong><br>
                Mode: ${this.inputMode}<br>
                Camera: (${Math.round(this.cameraPosition.x)}, ${Math.round(this.cameraPosition.y)})<br>
                Zoom: ${this.cameraZoom.toFixed(2)}<br>
                Focus: ${this.focusTargetId || 'None'}<br>
                Mouse: (${Math.round(this.mousePosition.x)}, ${Math.round(this.mousePosition.y)})<br>
                Active Keys: ${Array.from(this.activeKeys).join(', ') || 'None'}
            `;
        }
    }
    
    /**
     * Cleanup Input Manager
     */
    cleanup() {
        this.stopCameraMovement();
        
        if (this.cameraTween) {
            clearInterval(this.cameraTween);
        }
        
        this.keyHandlers.clear();
        this.mouseHandlers.clear();
        this.touchHandlers.clear();
        this.activeKeys.clear();
        
        this.isInitialized = false;
        console.log('🗑️ Input Manager cleaned up');
    }
}

export { InputManager };

console.log('🎮 Input Manager Module loaded');
