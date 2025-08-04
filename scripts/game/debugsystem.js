class DebugSystem {
  static LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };
  
  static level = DebugSystem.LEVELS.INFO;
  static logs = [];
  static maxLogs = 200;
  
  static init() {
    this.logElement = document.getElementById('debug-overlay');
    this.renderPanel();
    
    // Override console methods
    console.error = (...args) => {
      this.log('ERROR', ...args);
      console._error(...args);
    };
    
    console.warn = (...args) => {
      this.log('WARN', ...args);
      console._warn(...args);
    };
    
    console.info = (...args) => {
      this.log('INFO', ...args);
      console._info(...args);
    };
    
    console.debug = (...args) => {
      this.log('DEBUG', ...args);
      console._debug(...args);
    };
  }
  
  static log(level, ...messages) {
    const numericLevel = DebugSystem.LEVELS[level] || 0;
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
  
  static renderPanel() {
    if (!this.logElement) return;
    
    this.logElement.innerHTML = '';
    if (!gameState.debugMode) return;
    
    const panel = document.createElement('div');
    panel.className = 'debug-panel';
    
    // Add filter controls
    const controls = document.createElement('div');
    controls.style.marginBottom = '10px';
    
    ['ERROR', 'WARN', 'INFO', 'DEBUG'].forEach(level => {
      const btn = document.createElement('button');
      btn.textContent = level;
      btn.style.marginRight = '5px';
      btn.style.opacity = DebugSystem.LEVELS[level] <= this.level ? 1 : 0.5;
      btn.onclick = () => {
        this.level = DebugSystem.LEVELS[level];
        this.renderPanel();
      };
      controls.appendChild(btn);
    });
    
    panel.appendChild(controls);
    
    // Add log entries
    const visibleLogs = this.logs.filter(log => 
      DebugSystem.LEVELS[log.level] <= this.level
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
  
  static trackCharacter(character) {
    if (!gameState.debugMode) return;
    
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

// Preserve original console methods
console._error = console.error;
console._warn = console.warn;
console._info = console.info;
console._debug = console.debug;

export default DebugSystem;
