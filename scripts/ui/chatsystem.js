class ChatSystem {
  static MAX_MESSAGES = 100;
  static MAX_HISTORY = 200;
  
  constructor() {
    this.messages = [];
    this.history = [];
    this.historyIndex = -1;
    
    this.chatBox = document.getElementById('chat-box');
    this.chatInput = document.getElementById('chat-input');
    this.sendButton = document.getElementById('send-btn');
    
    this.setupEvents();
  }
  
  setupEvents() {
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      } else if (e.key === 'ArrowUp') {
        this.navigateHistory(-1);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        this.navigateHistory(1);
        e.preventDefault();
      }
    });
    
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
  }
  
  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;
    
    // Add to history
    this.history.push(message);
    if (this.history.length > ChatSystem.MAX_HISTORY) {
      this.history.shift();
    }
    this.historyIndex = this.history.length;
    
    // Clear input
    this.chatInput.value = '';
    
    // Process message
    this.addMessage(gameState.getPlayerCharacter(), message);
    
    // Handle commands
    if (message.startsWith('/')) {
      this.handleCommand(message);
    } else {
      // Handle conversation
      this.handleConversation(message);
    }
  }
  
  addMessage(sender, message) {
    const timestamp = new Date();
    const messageObj = {
      sender,
      message,
      timestamp,
      isPlayer: sender.isPlayer
    };
    
    this.messages.push(messageObj);
    if (this.messages.length > ChatSystem.MAX_MESSAGES) {
      this.messages.shift();
    }
    
    this.renderMessage(messageObj);
  }
  
  renderMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    
    const senderName = document.createElement('span');
    senderName.className = 'chat-sender';
    senderName.textContent = message.sender.name + ': ';
    senderName.style.color = message.isPlayer ? '#4caf50' : '#2196f3';
    
    const messageText = document.createElement('span');
    messageText.className = 'chat-text';
    messageText.textContent = message.message;
    
    // Highlight player name mentions
    const playerName = gameState.getPlayerCharacter().name;
    if (messageText.textContent.includes(playerName) {
      messageText.innerHTML = messageText.innerHTML.replace(
        new RegExp(playerName, 'gi'),
        `<span class="mention">${playerName}</span>`
      );
    }
    
    messageElement.appendChild(senderName);
    messageElement.appendChild(messageText);
    this.chatBox.appendChild(messageElement);
    
    // Auto-scroll to bottom
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }
  
  navigateHistory(direction) {
    if (this.history.length === 0) return;
    
    this.historyIndex = Math.max(0, Math.min(
      this.history.length, 
      this.historyIndex + direction
    ));
    
    if (this.historyIndex < this.history.length) {
      this.chatInput.value = this.history[this.historyIndex];
    } else {
      this.chatInput.value = '';
    }
  }
  
  handleCommand(command) {
    const parts = command.substring(1).split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    DebugSystem.log('DEBUG', `Processing command: ${command}`);
    
    switch(cmd) {
      case 'goto':
        if (args.length === 2) {
          const x = parseFloat(args[0]);
                   const y = parseFloat(args[1]);
          if (!isNaN(x) && !isNaN(y)) {
            gameState.getPlayerCharacter().targetPosition = {x, y};
            gameState.getPlayerCharacter().state = OfficeCharacter.STATES.WALKING;
          }
        }
        break;
      case 'api':
        const status = gameState.toggleApi();
        this.addSystemMessage(`API turned ${status ? 'ON' : 'OFF'}`);
        break;
      case 'debug':
        const debugStatus = gameState.toggleDebug();
        this.addSystemMessage(`Debug mode ${debugStatus ? 'enabled' : 'disabled'}`);
        break;
      case 'save':
        SaveSystem.exportSave();
        this.addSystemMessage('Game saved');
        break;
      case 'load':
        document.getElementById('save-file-input').click();
        break;
      default:
        this.addSystemMessage(`Unknown command: ${cmd}`);
    }
  }
  
  addSystemMessage(message) {
    const systemMessage = {
      sender: { name: 'System', isPlayer: false },
      message,
      timestamp: new Date()
    };
    
    this.messages.push(systemMessage);
    this.renderMessage(systemMessage);
  }
}

export default ChatSystem;
