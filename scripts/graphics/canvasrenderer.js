export default class CanvasRenderer {
  constructor(gameState, debugSystem) {
    this.gameState = gameState;
    this.debugSystem = debugSystem;
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      throw new Error('Could not find game-canvas element');
    }

    this.ctx = this.canvas.getContext('2d', {
      willReadFrequently: false,
      alpha: true,
      desynchronized: true
    });

    this.cleanupHandlers = [];
    this.resizeHandler = this.resizeCanvas.bind(this);

    this.buffer = document.createElement('canvas');
    this.bufferCtx = this.buffer.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', this.resizeHandler);
    this.cleanupHandlers.push(() => {
      window.removeEventListener('resize', this.resizeHandler);
    });

    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.lastFrameTime = 0;
    this.fps = 0;

    this.quality = 'medium';
    this.baseCharacterSize = 60;
    this.characterSize = this.calculateCharacterSize();
    this.characterColors = {};
    this.assets = {};
    this.texturesGenerated = false;

    this.preloadAssets();
    this.render();
  }

  setQuality(quality) {
    this.quality = quality;
    switch (quality) {
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

    this.canvas.width = width;
    this.canvas.height = height;
    this.buffer.width = width;
    this.buffer.height = height;

    this.characterSize = this.calculateCharacterSize();
  }

  calculateCharacterSize() {
    const minDimension = Math.min(this.canvas.width, this.canvas.height);
    return Math.max(30, Math.min(100, Math.floor(minDimension / 10)));
  }

  cleanup() {
    this.cleanupHandlers.forEach(handler => handler());
    this.cleanupHandlers = [];
    this.characterColors = {};
  }

  preloadAssets() {
    if (this.texturesGenerated) return;
    this.assets.floor = this.createFloorTexture();
    this.assets.wall = this.createWallTexture();
    this.assets.desk = this.createDeskTexture();
    this.assets.door = this.createDoorTexture();
    this.texturesGenerated = true;
  }

  render(timestamp = 0) {
    const delta = timestamp - this.lastFrameTime;

    if (delta < this.frameInterval) {
      requestAnimationFrame(this.render.bind(this));
      return;
    }

    this.fps = Math.round(1000 / delta);
    this.lastFrameTime = timestamp;

    this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
    this.renderOfficeLayout();
    this.renderCharacters();

    if (this.gameState.debugMode) {
      this.drawDebugInfo();
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.buffer, 0, 0);

    requestAnimationFrame(this.render.bind(this));
  }

  renderOfficeLayout() {
    const officeType = this.gameState.constructor.OFFICE_TYPES[this.gameState.officeType];
    if (!officeType) return;

    const layout = officeType.layout;
    const tileWidth = this.buffer.width / layout[0].length;
    const tileHeight = this.buffer.height / layout.length;

    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        const tileType = layout[y][x];
        const texture = this.assets[tileType];

        if (texture) {
          this.bufferCtx.drawImage(texture, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
        } else {
          this.bufferCtx.fillStyle = this.getTileColor(tileType);
          this.bufferCtx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
        }

        this.bufferCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.bufferCtx.strokeRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
      }
    }
  }

  renderCharacters() {
    this.gameState.characters.forEach(char => {
      if (!char.enabled) return;

      char.position.x = Math.max(0, Math.min(1, char.position.x));
      char.position.y = Math.max(0, Math.min(1, char.position.y));

      if (!this.characterColors[char.id]) {
        this.characterColors[char.id] = this.generateCharacterColor(char);
      }

      const size = this.characterSize;
      const x = char.position.x * this.buffer.width;
      const y = char.position.y * this.buffer.height;

      this.bufferCtx.save();
      this.bufferCtx.fillStyle = char.appearance.skinColor;
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(x, y - size / 3, size / 4, 0, Math.PI * 2);
      this.bufferCtx.fill();
      this.bufferCtx.fillStyle = char.appearance.shirtColor;
      this.bufferCtx.fillRect(x - size / 3, y - size / 6, size * 2 / 3, size / 2);
      this.bufferCtx.fillStyle = char.appearance.pantsColor;
      this.bufferCtx.fillRect(x - size / 3, y + size / 3, size * 2 / 3, size / 3);
      this.bufferCtx.fillStyle = char.appearance.hairColor;
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(x, y - size / 3, size / 4, Math.PI, Math.PI * 2);
      this.bufferCtx.fill();
      this.bufferCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      this.bufferCtx.lineWidth = 2;
      this.bufferCtx.strokeRect(x - size / 3, y - size / 6, size * 2 / 3, size / 2 + size / 3);
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(x, y - size / 3, size / 4, 0, Math.PI * 2);
      this.bufferCtx.stroke();
      this.bufferCtx.restore();

      this.bufferCtx.fillStyle = this.getMoodColor(char.mood);
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(x, y - size / 3, size / 6, 0, Math.PI * 2);
      this.bufferCtx.fill();

      this.bufferCtx.fillStyle = 'white';
      this.bufferCtx.font = '12px Arial';
      this.bufferCtx.textAlign = 'center';
      this.bufferCtx.fillText(char.name, x, y + size / 2 + 15);

      if (char.currentTask) {
        const progress = char.taskProgress / 100;
        this.bufferCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.bufferCtx.fillRect(x - 30, y + size / 2 + 5, 60, 8);
        this.bufferCtx.fillStyle = '#4caf50';
        this.bufferCtx.fillRect(x - 30, y + size / 2 + 5, 60 * progress, 8);
      }

      this.debugSystem.trackCharacter(char);
    });
  }

  createFloorTexture() { return this.createTexture('#3d3d3d'); }
  createWallTexture() { return this.createTexture('#2c2c2c'); }
  createDeskTexture() { return this.createTexture('#8b4513'); }
  createDoorTexture() { return this.createTexture('#a0522d'); }

  createTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 64, 64);
    return canvas;
  }

  getTileColor(type) {
    const colors = { 'F': '#3d3d3d', 'W': '#2c2c2c', 'D': '#8b4513' };
    return colors[type] || '#000';
  }

  getMoodColor(mood) {
    const colors = { 'stressed': 'red', 'hungry': 'orange', 'tired': 'blue', 'neutral': 'green' };
    return colors[mood] || 'grey';
  }

  generateCharacterColor(char) {
    let hash = 0;
    for (let i = 0; i < char.id.length; i++) {
      hash = char.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      let value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  drawDebugInfo() {
    this.bufferCtx.fillStyle = 'white';
    this.bufferCtx.font = '14px Arial';
    this.bufferCtx.textAlign = 'left';
    this.bufferCtx.fillText(`FPS: ${this.fps}`, 10, 20);
  }
}
