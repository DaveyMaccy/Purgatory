
// Initialize game state
const gameState = new GameState();
window.gameState = gameState; // For debugging

// Initialize systems
const canvasRenderer = new CanvasRenderer();
const chatSystem = new ChatSystem();
DebugSystem.init();

// DOM elements
const startMenu = document.getElementById('start-menu');
const gameContainer = document.getElementById('game-container');
const newGameBtn = document.getElementById('new-game-btn');
const loadGameBtn = document.getElementById('load-game-btn');
const saveFileInput = document.getElementById('save-file-input');
const apiToggle = document.getElementById('api-toggle');
const exportSave = document.getElementById('export-save');
const importSave = document.getElementById('import-save');
const debugToggle = document.getElementById('debug-toggle');

// Event listeners
newGameBtn.addEventListener('click', startNewGame);
loadGameBtn.addEventListener('click', () => saveFileInput.click());
saveFileInput.addEventListener('change', handleFileUpload);
apiToggle.addEventListener('click', toggleApi);
exportSave.addEventListener('click', () => SaveSystem.exportSave());
importSave.addEventListener('click', () => saveFileInput.click());
debugToggle.addEventListener('click', toggleDebug);

function startNewGame() {
  const officeType = document.getElementById('office-type').value;
  gameState.officeType = officeType;
  
  // Create player character
  const player = new OfficeCharacter({
    id: 'char_player',
    name: 'Player',
    isPlayer: true,
    job: 'Boss',
    position: {x: 0.5, y: 0.5}
  });
  
  gameState.addCharacter(player);
  
  // Create NPCs
  for (let i = 0; i < 4; i++) {
    const npc = new OfficeCharacter({
      id: `char_npc_${i}`,
      name: `Employee ${i+1}`,
      job: GameState.JOB_ROLES[Math.floor(Math.random() * GameState.JOB_ROLES.length)],
      position: {
        x: 0.2 + Math.random() * 0.6,
        y: 0.2 + Math.random() * 0.6
      }
    });
    
    gameState.addCharacter(npc);
  }
  
  // Show game UI
  startMenu.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  
  // Start game loop
  gameLoop();
}

function gameLoop() {
  // Update game state
  gameState.characters.forEach(char => {
    char.updatePosition();
    char.updateNeeds();
  });
  
  // Schedule next update
  setTimeout(gameLoop, 1000 / 30); // 30fps
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  SaveSystem.importSave(file)
    .then(() => {
      startMenu.classList.add('hidden');
      gameContainer.classList.remove('hidden');
      gameLoop();
    })
    .catch(error => {
      console.error('Failed to load save:', error);
      chatSystem.addSystemMessage('Failed to load save file');
    });
}

function toggleApi() {
  const status = gameState.toggleApi();
  apiToggle.textContent = `API: ${status ? 'ON' : 'OFF'}`;
  chatSystem.addSystemMessage(`API turned ${status ? 'ON' : 'OFF'}`);
}

function toggleDebug() {
  const status = gameState.toggleDebug();
  debugToggle.textContent = status ? 'Debug: ON' : 'Debug: OFF';
  chatSystem.addSystemMessage(`Debug mode ${status ? 'enabled' : 'disabled'}`);
}

// Initialize save system
SaveSystem.init();
