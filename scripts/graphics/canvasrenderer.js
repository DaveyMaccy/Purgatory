class CanvasRenderer {
  constructor() {
    // Create main canvas with hardware acceleration
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      throw new Error('Could not find game-canvas element');
    }

    this.ctx = this.canvas.getContext('2d', { 
      willReadFrequently: false,
      alpha: true,
      desynchronized: true
    });

    // Initialize cleanup handlers
    this.cleanupHandlers = [];
    this.resizeHandler = this.resizeCanvas.bind(this);

    // Create offscreen buffer
    this.buffer = document.createElement('canvas');
    this.bufferCtx = this.buffer.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeHandler);
    this.cleanupHandlers.push(() => {
      window.removeEventListener('resize', this.resizeHandler);
    });
    
    // Performance settings
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.lastFrameTime = 0;
    this.fps = 0;
    
    // Rendering settings
    this.quality = 'medium';
    this.baseCharacterSize = 60; // Base size for reference
    this.characterSize = this.calculateCharacterSize();
    this.characterColors = {};
    this.assets = {};
    this.texturesGenerated = false;
    
    this.preloadAssets();
    this.render();
  }
  
  setQuality(quality) {
    this.quality = quality;
    switch(quality) {
      case 'low':
        this.targetFPS = 30;
        break;
      case 'medium':
        this.targetFPS = 60;
        break;
      case 'high':
        this.targetFPS = 120;
        break;
    }
    this.frameInterval = 1000 / this.targetFPS;
  }
  
  resizeCanvas() {
    const width = this.canvas.parentElement.clientWidth;
    const height = this.canvas.parentElement.clientHeight;
    
    // Set both canvases to same size
    this.canvas.width = width;
    this.canvas.height = height;
    this.buffer.width = width;
    this.buffer.height = height;

    // Update character size based on new dimensions
    this.characterSize = this.calculateCharacterSize();
  }

  calculateCharacterSize() {
    // Scale character size based on canvas dimensions
    const minDimension = Math.min(this.canvas.width, this.canvas.height);
    return Math.max(30, Math.min(100, Math.floor(minDimension / 10)));
  }

  cleanup() {
    // Remove all event listeners
    this.cleanupHandlers.forEach(handler => handler());
    this.cleanupHandlers = [];
    
    // Clear character colors
    this.characterColors = {};
  }
  
  preloadAssets() {
    // Only generate textures once
    if (this.texturesGenerated) return;

    // Generate procedural textures
    this.assets.floor = this.createFloorTexture();
    this.assets.wall = this.createWallTexture();
    this.assets.desk = this.createDeskTexture();
    this.assets.door = this.createDoorTexture();

    this.texturesGenerated = true;
  }
  
  render(timestamp = 0) {
    const delta = timestamp - this.lastFrameTime;
    
    // Skip frame if not enough time has passed
    if (delta < this.frameInterval) {
      requestAnimationFrame(this.render.bind(this));
      return;
    }
    
    // Calculate FPS
    this.fps = Math.round(1000 / delta);
    this.lastFrameTime = timestamp;
    
    // Clear buffer
    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
    
    // Draw to buffer
    this.renderOfficeLayout();
    this.renderCharacters();
    
    if (gameState.debugMode) {
      this.drawDebugInfo();
    }
    
    // Draw buffer to screen
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.buffer, 0, 0);
    
    // Continue animation loop
    requestAnimationFrame(this.render.bind(this));
  }
  
  renderOfficeLayout() {
    const officeType = GameState.OFFICE_TYPES[gameState.officeType];
    if (!officeType) return;
    
    const layout = officeType.layout;
    const tileWidth = this.buffer.width / layout[0].length;
    const tileHeight = this.buffer.height / layout.length;
    
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        const tileType = layout[y][x];
        const texture = this.assets[tileType];
        
        if (texture) {
          this.bufferCtx.drawImage(
            texture,
            x * tileWidth,
            y * tileHeight,
            tileWidth,
            tileHeight
          );
        } else {
          this.bufferCtx.fillStyle = this.getTileColor(tileType);
          this.bufferCtx.fillRect(
            x * tileWidth,
            y * tileHeight,
            tileWidth,
            tileHeight
          );
        }
        
        // Draw tile border
        this.bufferCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.bufferCtx.strokeRect(
          x * tileWidth,
          y * tileHeight,
          tileWidth,
          tileHeight
        );
      }
    }
  }
  
  renderCharacters() {
    gameState.characters.forEach(char => {
      if (!char.enabled) return;

      // Ensure position is within bounds
      char.position.x = Math.max(0, Math.min(1, char.position.x));
      char.position.y = Math.max(0, Math.min(1, char.position.y));
      
      // Generate unique color for character
      if (!this.characterColors[char.id]) {
        this.characterColors[char.id] = this.generateCharacterColor(char);
      }
      
      const color = this.characterColors[char.id];
      const size = this.characterSize;
      const x = char.position.x * this.buffer.width;
      const y = char.position.y * this.buffer.height;
      
      // Draw human-shaped character
      this.bufferCtx.save();
      
      // Head
      this.bufferCtx.fillStyle = char.appearance.skinColor;
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(x, y - size/3, size/4, 0, Math.PI * 2);
      this.bufferCtx.fill();
      
      // Body (shirt)
      this.bufferCtx.fillStyle = char.appearance.shirtColor;
      this.bufferCtx.fillRect(x - size/3, y - size/6, size*2/3, size/2);
      
      // Pants
      this.bufferCtx.fillStyle = char.appearance.pantsColor;
      this.bufferCtx.fillRect(x - size/3, y + size/3, size*2/3, size/3);
      
      // Hair
      this.bufferCtx.fillStyle = char.appearance.hairColor;
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(x, y - size/3, size/4, Math.PI, Math.PI * 2);
      this.bufferCtx.fill();
      
      // Outline
      this.bufferCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      this.bufferCtx.lineWidth = 2;
      this.bufferCtx.strokeRect(x - size/3, y - size/6, size*2/3, size/2 + size/3);
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(x, y - size/3, size/4, 0, Math.PI * 2);
      this.bufferCtx.stroke();
      
      this.bufferCtx.restore();
      
      // Draw mood indicator
      this.bufferCtx.fillStyle = this.getMoodColor(char.mood);
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(x, y - size / 3, size / 6, 0, Math.PI * 2);
      this.bufferCtx.fill();
      
      // Draw name
      this.bufferCtx.fillStyle = 'white';
      this.bufferCtx.font = '12px Arial';
      this.bufferCtx.textAlign = 'center';
      this.bufferCtx.fillText(char.name, x, y + size / 2 + 15);
      
      // Draw task progress
      if (char.currentTask) {
        const progress = char.taskProgress / 100;
        this.bufferCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.bufferCtx.fillRect(x - 30, y + size / 2 + 5, 60, 8);
        
        this.bufferCtx.fillStyle = '#4caf50';
        this.bufferCtx.fillRect(x - 30, y + size / 2 + 5, 60 * progress, 8);
      }
      
      DebugSystem.trackCharacter(char);
    });
  }

  // ... existing helper methods like createFloorTexture, getTileColor, etc ...
}

export default CanvasRenderer;
