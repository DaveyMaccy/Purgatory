export default class DebugSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.LEVELS = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.level = this.LEVELS.INFO;
    this.logs = [];
    this.maxLogs = 200;
    this.logElement = document.getElementById('debug-overlay');

    // Preserve original console methods
    if (!console._error) {
      console._error = console.error;
      console._warn = console.warn;
      console._info = console.info;
      console._debug = console.debug;
    }

    this.init();
  }

  init() {
    this.renderPanel();

    // Override console methods
    console.error = (...args) => this.log('ERROR', ...args);
    console.warn = (...args) => this.log('WARN', ...args);
    console.info = (...args) => this.log('INFO', ...args);
    console.debug = (...args) => this.log('DEBUG', ...args);
  }

  log(level, ...messages) {
    const numericLevel = this.LEVELS[level] || 0;
    if (numericLevel > this.level) return;

    const timestamp = new Date().toISOString().substring(11, 23);
    const logEntry = {
      timestamp,
      level,
      messages,
      stack: new Error().stack
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.renderPanel();
  }

  renderPanel() {
    if (!this.logElement || !this.gameState.debugMode) {
      if (this.logElement) this.logElement.innerHTML = '';
      return;
    }

    this.logElement.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'debug-panel';

    // Add filter controls
    const controls = document.createElement('div');
    controls.style.marginBottom = '10px';

    Object.keys(this.LEVELS).forEach(level => {
      const btn = document.createElement('button');
      btn.textContent = level;
      btn.style.marginRight = '5px';
      btn.style.opacity = this.LEVELS[level] <= this.level ? 1 : 0.5;
      btn.onclick = () => {
        this.level = this.LEVELS[level];
        this.renderPanel();
      };
      controls.appendChild(btn);
    });

    panel.appendChild(controls);

    // Add log entries
    const visibleLogs = this.logs.filter(log =>
      this.LEVELS[log.level] <= this.level
    );

    visibleLogs.slice(-10).forEach(log => {
      const entry = document.createElement('div');
      entry.className = 'debug-entry';

      const header = document.createElement('div');
      header.innerHTML = `
        <span class="debug-timestamp">${log.timestamp}</span>
        <span class="debug-level-${log.level.toLowerCase()}">${log.level}</span>
      `;

      const message = document.createElement('div');
      message.style.marginTop = '5px';
      message.textContent = log.messages.map(m =>
        typeof m === 'object' ? JSON.stringify(m) : m
      ).join(' ');

      entry.appendChild(header);
      entry.appendChild(message);
      panel.appendChild(entry);
    });

    this.logElement.appendChild(panel);
  }

  trackCharacter(character) {
    if (!this.logElement || !this.gameState.debugMode) return;

    const marker = document.createElement('div');
    marker.className = 'character-marker';
    marker.style.backgroundColor = character.isPlayer ? '#4caf50' : '#2196f3';
    marker.style.left = `${character.position.x * 100}%`;
    marker.style.top = `${character.position.y * 100}%`;
    marker.dataset.id = character.id;

    const label = document.createElement('div');
    label.className = 'character-label';
    label.textContent = `${character.name} (${character.state})`;
    label.style.left = `${character.position.x * 100}%`;
    label.style.top = `${character.position.y * 100}%`;

    this.logElement.appendChild(marker);
    this.logElement.appendChild(label);
  }
}
