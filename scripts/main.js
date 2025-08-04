import GameState from './game/gamestate.js';
import OfficeCharacter from './game/character.js';
import CanvasRenderer from './graphics/canvasrenderer.js';
import ChatSystem from './ui/chatsystem.js';
import DebugSystem from './game/debugsystem.js';
import SaveSystem from './game/savestate.js';
import PromptTracker from './game/prompttracker.js';

// Initialize game state
const gameState = new GameState();
window.gameState = gameState; // For debugging

// Initialize systems
let canvasRenderer;
let chatSystem;
const promptTracker = new PromptTracker();

// DOM elements
const startMenu = document.getElementById('start-menu');
const characterCreation = document.getElementById('character-creation');
const optionsMenu = document.getElementById('options-menu');
const gameContainer = document.getElementById('game-container');
const newGameBtn = document.getElementById('new-game-btn');
const loadGameBtn = document.getElementById('load-game-btn');
const optionsBtn = document.getElementById('options-btn');
const addCharacterBtn = document.getElementById('add-character-btn');
const startSimulationBtn = document.getElementById('start-simulation-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const exportPromptsBtn = document.getElementById('export-prompts-btn');
const exportFullDataBtn = document.getElementById('export-full-data-btn');
const fileInput = document.getElementById('file-input');
const apiEnabled = document.getElementById('api-enabled');
const promptCap = document.getElementById('prompt-cap');
const apiProvider = document.getElementById('api-provider');
const graphicsQuality = document.getElementById('graphics-quality');
const gameMenuBtn = document.getElementById('game-menu-btn');
const apiStatus = document.getElementById('api-status');
const promptCount = document.getElementById('prompt-count');
const characterTabs = document.getElementById('character-tabs');
const characterForm = document.getElementById('character-form');
const characterSelector = document.getElementById('character-selector');
const characterDetails = document.getElementById('character-details');

// Initialize character counter
let characterCount = 0;

// Event listeners
newGameBtn.addEventListener('click', showCharacterCreation);
loadGameBtn.addEventListener('click', () => fileInput.click());
optionsBtn.addEventListener('click', showOptionsMenu);
addCharacterBtn.addEventListener('click', addNewCharacter);
startSimulationBtn.addEventListener('click', startSimulation);
backToMenuBtn.addEventListener('click', backToMainMenu);
saveSettingsBtn.addEventListener('click', saveSettings);
exportPromptsBtn.addEventListener('click', () => promptTracker.exportPromptData());
exportFullDataBtn.addEventListener('click', () => promptTracker.exportFullDataset());
fileInput.addEventListener('change', handleFileUpload);
apiEnabled.addEventListener('change', toggleApiStatus);
gameMenuBtn.addEventListener('click', showOptionsMenu);

// Initialize debug system
DebugSystem.init();

// Initialize prompt tracker
promptTracker.init();

// Set default character
addNewCharacter();

function showCharacterCreation() {
  startMenu.classList.add('hidden');
  characterCreation.classList.remove('hidden');
}

function showOptionsMenu() {
  gameContainer.classList.add('hidden');
  optionsMenu.classList.remove('hidden');
}

function backToMainMenu() {
  characterCreation.classList.add('hidden');
  optionsMenu.classList.add('hidden');
  startMenu.classList.remove('hidden');
}

function addNewCharacter() {
  characterCount++;
  const charId = `char_${characterCount}`;
  
  // Add character tab
  const tab = document.createElement('div');
  tab.className = 'character-tab';
  tab.textContent = `Character ${characterCount}`;
  tab.dataset.id = charId;
  tab.addEventListener('click', () => selectCharacterTab(charId));
  characterTabs.appendChild(tab);
  
  // Activate first tab
  if (characterCount === 1) {
    tab.classList.add('active');
    renderCharacterForm(charId);
  }
}

function selectCharacterTab(charId) {
  // Update tabs
  document.querySelectorAll('.character-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.id === charId);
  });
  
  // Render form
  renderCharacterForm(charId);
}

function renderCharacterForm(charId) {
  characterForm.innerHTML = `
    <div class="form-group">
      <label for="${charId}-name">Name</label>
      <input type="text" id="${charId}-name" placeholder="Character name">
    </div>
    
    <div class="form-group">
      <label for="${charId}-job">Job Role</label>
      <select id="${charId}-job">
        ${GameState.JOB_ROLES.map(role => `<option value="${role}">${role}</option>`).join('')}
      </select>
    </div>
    
    <div class="form-group">
      <label>Is Player Character?</label>
      <div>
        <label>
          <input type="radio" name="${charId}-player" value="yes"> Yes
        </label>
        <label>
          <input type="radio" name="${charId}-player" value="no" checked> No
        </label>
      </div>
    </div>
    
    <div class="form-group">
      <label>Physical Attributes</label>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label for="${charId}-age">Age</label>
          <input type="number" id="${charId}-age" min="18" max="70" value="30">
        </div>
        <div>
          <label for="${charId}-build">Build</label>
          <select id="${charId}-build">
            <option value="slim">Slim</option>
            <option value="average" selected>Average</option>
            <option value="athletic">Athletic</option>
            <option value="stocky">Stocky</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label>Skills (0-100%)</label>
      <div class="skills-grid">
        <div class="skill-item">
          <label for="${charId}-competence">Competence:</label>
          <input type="range" id="${charId}-competence" min="0" max="100" value="50">
        </div>
        <div class="skill-item">
          <label for="${charId}-laziness">Laziness:</label>
          <input type="range" id="${charId}-laziness" min="0" max="100" value="50">
        </div>
        <div class="skill-item">
          <label for="${charId}-charisma">Charisma:</label>
          <input type="range" id="${charId}-charisma" min="0" max="100" value="50">
        </div>
        <div class="skill-item">
          <label for="${charId}-leadership">Leadership:</label>
          <input type="range" id="${charId}-leadership" min="0" max="100" value="50">
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label>Personality Tags</label>
      <div class="tags-container" id="${charId}-tags">
        ${GameState.PERSONALITY_TAGS.map(tag => `
          <div class="tag" data-tag="${tag}">${tag}</div>
        `).join('')}
      </div>
    </div>
    
    <div class="form-group">
      <label for="${charId}-api-key">API Key (for NPCs)</label>
      <input type="text" id="${charId}-api-key" placeholder="Enter API key">
    </div>
  `;
  
  // Add tag selection
  const tagsContainer = document.getElementById(`${charId}-tags`);
  tagsContainer.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', function() {
      this.classList.toggle('selected');
    });
  });
}

function startSimulation() {
  // Create characters from form data
  gameState.characters = [];
  
  document.querySelectorAll('.character-tab').forEach(tab => {
    const charId = tab.dataset.id;
    
    const charData = {
      id: charId,
      name: document.getElementById(`${charId}-name`).value || `Character ${charId.split('_')[1]}`,
      job: document.getElementById(`${charId}-job`).value,
      isPlayer: document.querySelector(`input[name="${charId}-player"]:checked`).value === 'yes',
      age: parseInt(document.getElementById(`${charId}-age`).value) || 30,
      build: document.getElementById(`${charId}-build`).value,
      skills: {
        competence: parseInt(document.getElementById(`${charId}-competence`).value) / 100 || 0.5,
        laziness: parseInt(document.getElementById(`${charId}-laziness`).value) / 100 || 0.5,
        charisma: parseInt(document.getElementById(`${charId}-charisma`).value) / 100 || 0.5,
        leadership: parseInt(document.getElementById(`${charId}-leadership`).value) / 100 || 0.5
      },
      personality: [],
      apiKey: document.getElementById(`${charId}-api-key`).value || ''
    };
    
    // Get selected tags
    document.querySelectorAll(`#${charId}-tags .tag.selected`).forEach(tag => {
      charData.personality.push(tag.dataset.tag);
    });
    
    // Set random position
    charData.position = {
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6
    };
    
    const character = new OfficeCharacter(charData);
    gameState.addCharacter(character);
    
    // Set player character
    if (charData.isPlayer) {
      gameState.playerCharacterId = charId;
    }
  });
  
  // Initialize systems
  canvasRenderer = new CanvasRenderer();
  chatSystem = new ChatSystem();
  
  // Set API status
  toggleApiStatus();
  
  // Show game UI
  characterCreation.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  
  // Initialize character selector
  updateCharacterSelector();
  
  // Start game loop
  gameLoop();
}

function gameLoop() {
  // Update game state
  gameState.characters.forEach(char => {
    char.updatePosition();
    char.updateNeeds();
    
    // Process AI for NPCs
    if (!char.isPlayer && char.enabled && char.canAcceptPrompt()) {
      processAICharacter(char);
    }
  });
  
  // Render
  canvasRenderer.render();
  
  // Update UI
  promptCount.textContent = `Prompts: ${promptTracker.getCount()}`;
  
  // Schedule next update
  requestAnimationFrame(gameLoop);
}

function processAICharacter(character) {
  // In a real implementation, this would call the AI system
  // For now, we'll simulate some behavior
  character.lastPromptTime = Date.now();
  character.promptCount++;
  
  // Track prompt
  const prompt = `What should ${character.name} do next?`;
  const response = `{"action": "work", "reason": "Continuing assigned task"}`;
  
  promptTracker.track({
    characterId: character.id,
    characterName: character.name,
    timestamp: new Date().toISOString(),
    prompt,
    response,
    state: JSON.stringify({
      position: character.position,
      mood: character.mood,
      needs: character.needs
    })
  });
  
  // Update character state
  character.taskProgress = Math.min(100, character.taskProgress + 10);
  if (character.taskProgress >= 100) {
    character.taskProgress = 0;
    character.tasksCompleted++;
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  SaveSystem.importSave(file)
    .then(() => {
      // Initialize systems
      canvasRenderer = new CanvasRenderer();
      chatSystem = new ChatSystem();
      
      // Show game UI
      startMenu.classList.add('hidden');
      gameContainer.classList.remove('hidden');
      
      // Start game loop
      gameLoop();
    })
    .catch(error => {
      console.error('Failed to load save:', error);
      alert('Failed to load save file. See console for details.');
    });
}

function toggleApiStatus() {
  gameState.apiEnabled = apiEnabled.checked;
  apiStatus.textContent = `API: ${gameState.apiEnabled ? 'ON' : 'OFF'}`;
}

function saveSettings() {
  gameState.promptCap = parseInt(promptCap.value) || 50;
  gameState.apiProvider = apiProvider.value;
  gameState.graphicsQuality = graphicsQuality.value;
  
  // Apply graphics settings
  if (canvasRenderer) {
    canvasRenderer.setQuality(gameState.graphicsQuality);
  }
  
  alert('Settings saved successfully!');
}

function updateCharacterSelector() {
  characterSelector.innerHTML = '';
  gameState.characters.forEach(char => {
    const option = document.createElement('option');
    option.value = char.id;
    option.textContent = char.name;
    characterSelector.appendChild(option);
  });
  
  // Select first character by default
  if (gameState.characters.length > 0) {
    characterSelector.value = gameState.characters[0].id;
    showCharacterDetails(gameState.characters[0].id);
  }
  
  characterSelector.addEventListener('change', (e) => {
    showCharacterDetails(e.target.value);
  });
}

function showCharacterDetails(charId) {
  const character = gameState.getCharacter(charId);
  if (!character) return;
  
  characterDetails.innerHTML = `
    <div class="detail-row">
      <strong>Name:</strong> ${character.name}
    </div>
    <div class="detail-row">
      <strong>Job:</strong> ${character.job}
    </div>
    <div class="detail-row">
      <strong>Status:</strong> ${character.state}
    </div>
    <div class="detail-row">
      <strong>Mood:</strong> ${character.mood}
    </div>
    <div class="progress-container">
      <div class="progress-label">Task Progress</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${character.taskProgress}%"></div>
      </div>
      <div class="progress-value">${Math.round(character.taskProgress)}%</div>
    </div>
    <div class="detail-row">
      <strong>Tasks Completed:</strong> ${character.tasksCompleted}
    </div>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Energy</div>
        <div class="stat-bar">
          <div class="stat-fill" style="width: ${character.needs.energy * 100}%"></div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Stress</div>
        <div class="stat-bar">
          <div class="stat-fill stress" style="width: ${character.needs.stress * 100}%"></div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Hunger</div>
        <div class="stat-bar">
          <div class="stat-fill hunger" style="width: ${character.needs.hunger * 100}%"></div>
        </div>
      </div>
    </div>
    <div class="detail-row">
      <strong>Personality:</strong> ${character.personality.join(', ')}
    </div>
  `;
}

// Initialize
updateCharacterSelector();
