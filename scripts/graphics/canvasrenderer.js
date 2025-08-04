class CanvasRenderer {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    
    this.tileSize = 80;
    this.characterSize = 60;
    this.quality = 'medium';
    this.assets = {};
    this.characterColors = {};
    
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    
    this.preloadAssets();
    this.render();
  }
  
  setQuality(quality) {
    this.quality = quality;
  }
  
  resizeCanvas() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }
  
  preloadAssets() {
    // Generate procedural textures
    this.assets.floor = this.createFloorTexture();
    this.assets.wall = this.createWallTexture();
    this.assets.desk = this.createDeskTexture();
    this.assets.door = this.createDoorTexture();
  }
  
  render() {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    
    // Calculate FPS
    if (delta > 0) {
      this.fps = Math.round(1000 / delta);
    }
    this.lastFrameTime = now;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw office layout
    this.renderOfficeLayout();
    
    // Draw characters
    gameState.characters.forEach(char => {
      this.renderCharacter(char);
    });
    
    // Draw debug info
    if (gameState.debugMode) {
      this.drawDebugInfo();
    }
    
    // Continue animation loop
    requestAnimationFrame(this.render.bind(this));
  }
  
  renderOfficeLayout() {
    const officeType = GameState.OFFICE_TYPES[gameState.officeType];
    if (!officeType) return;
    
    const layout = officeType.layout;
    const tileWidth = this.canvas.width / layout[0].length;
    const tileHeight = this.canvas.height / layout.length;
    
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        const tileType = layout[y][x];
        const texture = this.assets[tileType];
        
        if (texture) {
          this.ctx.drawImage(
            texture,
            x * tileWidth,
            y * tileHeight,
            tileWidth,
            tileHeight
          );
        } else {
          this.ctx.fillStyle = this.getTileColor(tileType);
          this.ctx.fillRect(
            x * tileWidth,
            y * tileHeight,
            tileWidth,
            tileHeight
          );
        }
        
        // Draw tile border
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.strokeRect(
          x * tileWidth,
          y * tileHeight,
          tileWidth,
          tileHeight
        );
      }
    }
  }
  
  renderCharacter(character) {
    if (!character.enabled) return;
    
    // Generate unique color for character
    if (!this.characterColors[character.id]) {
      this.characterColors[character.id] = this.generateCharacterColor(character);
    }
    
    const color = this.characterColors[character.id];
    const size = this.characterSize;
    const x = character.position.x * this.canvas.width;
    const y = character.position.y * this.canvas.height;
    
    // Draw character body
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw character outline
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw character mood indicator
    this.ctx.fillStyle = this.getMoodColor(character.mood);
    this.ctx.beginPath();
    this.ctx.arc(x, y - size / 3, size / 6, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw character name
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(character.name, x, y + size / 2 + 15);
    
    // Draw task progress if applicable
    if (character.currentTask) {
      const progress = character.taskProgress / 100;
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(x - 30, y + size / 2 + 5, 60, 8);
      
      this.ctx.fillStyle = '#4caf50';
      this.ctx.fillRect(x - 30, y + size / 2 + 5, 60 * progress, 8);
    }
    
    // Track character in debug system
    DebugSystem.trackCharacter(character);
  }
  
  // ... other methods remain the same ...
}

export default CanvasRenderer;
