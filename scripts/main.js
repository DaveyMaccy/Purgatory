console.log('[Main] Starting script execution');

// Base path for module imports
const BASE_PATH = window.location.pathname
  .split('/')
  .slice(0, -1) // Remove index.html
  .join('/') + '/scripts/';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Main] DOM fully loaded, starting initialization');
  console.log('[Main] Base path:', BASE_PATH);

  try {
    // Verify all required modules are loaded
    const requiredModules = {
      GameState: BASE_PATH + 'game/gamestate.js',
      OfficeCharacter: BASE_PATH + 'game/character.js',
      CanvasRenderer: BASE_PATH + 'graphics/canvasrenderer.js',
      ChatSystem: BASE_PATH + 'ui/chatsystem.js',
      DebugSystem: BASE_PATH + 'game/debugsystem.js',
      SaveSystem: BASE_PATH + 'game/savestate.js',
      AISystem: BASE_PATH + 'game/ai_system.js',
      PromptTracker: BASE_PATH + 'game/prompttracker.js'
    };

    // Dynamically check all imports
    await Promise.all(Object.entries(requiredModules).map(async ([name, path]) => {
      const module = await import(path);
      if (!module[name]) {
        throw new Error(`Module ${name} not found in ${path}`);
      }
      window[name] = module[name]; // Make available globally for debugging
      console.log(`[Main] Successfully loaded ${name} from ${path}`);
    }));

    console.log('[Main] All modules loaded successfully');
  } catch (error) {
    console.error('[Main] Critical module loading error:', error);
    alert('Failed to load required game modules. See console for details.');
    return;
  }

  // Verify critical DOM elements exist before proceeding
  const requiredElementIds = ['start-menu', 'game-container', 'new-game-btn', 'office-background'];
  const missingElements = requiredElementIds.filter(id => !document.getElementById(id));
  
  if (missingElements.length > 0) {
    const errorMsg = `Missing required DOM elements: ${missingElements.join(', ')}`;
    console.error('[Main]', errorMsg);
    alert(errorMsg);
    return;
  }
  
  console.log('[Main] All required DOM elements found');
  // Initialize office background
  const bgCanvas = document.getElementById('office-background');
  if (bgCanvas) {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    const bgCtx = bgCanvas.getContext('2d');
  } else {
    console.error('office-background canvas NOT found.');
    return; // Stop execution if canvas is missing
  }

  // Office scene parameters
  let cameraX = 0;
  const officeWidth = 3000;
  const panSpeed = 0.5;

  // Simple office scene rendering
  function renderOfficeBackground() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Draw office background
    bgCtx.fillStyle = '#1a1a2e';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Draw office elements
    bgCtx.fillStyle = '#2c3e50';
    for (let x = -cameraX % 800; x < bgCanvas.width; x += 800) {
      // Draw cubicles
      bgCtx.fillRect(x + 50, 300, 200, 150);
      bgCtx.fillRect(x + 300, 300, 200, 150);
      bgCtx.fillRect(x + 550, 300, 200, 150);
      
      // Draw meeting room
      bgCtx.fillStyle = '#34495e';
      bgCtx.fillRect(x + 100, 100, 600, 150);
    }

    // Update camera position
    cameraX += panSpeed;
    if (cameraX > officeWidth) cameraX = 0;

    requestAnimationFrame(renderOfficeBackground);
  }

  // Start rendering
  renderOfficeBackground();
  
  // Initialize game state
  const gameState = new GameState();
  window.gameState = gameState; // For debugging

  // Initialize systems
  let canvasRenderer;
  let chatSystem;
  const promptTracker = new PromptTracker();

  // Setup canvas click handler
  document.getElementById('game-canvas')?.addEventListener('click', (e) => {
  if (!gameState.playerCharacterId) return;
  
  const rect = e.target.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  
  const player = gameState.getPlayerCharacter();
  player.targetPosition = { x, y };
  player.state = OfficeCharacter.STATES.WALKING;
  
  chatSystem.addMessage(player, `Moving to (${x.toFixed(2)}, ${y.toFixed(2)})`);
});

// DOM elements
const elements = {
  startMenu: document.getElementById('start-menu'),
  characterCreation: document.getElementById('character-creation'),
  optionsMenu: document.getElementById('options-menu'),
  gameContainer: document.getElementById('game-container'),
  newGameBtn: document.getElementById('new-game-btn'),
  loadGameBtn: document.getElementById('load-game-btn'),
  optionsBtn: document.getElementById('options-btn'),
  addCharacterBtn: document.getElementById('add-character-btn'),
  startSimulationBtn: document.getElementById('start-simulation-btn'),
  backToMenuBtn: document.getElementById('back-to-menu-btn'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),
  exportPromptsBtn: document.getElementById('export-prompts-btn'),
  exportFullDataBtn: document.getElementById('export-full-data-btn'),
  fileInput: document.getElementById('file-input'),
  apiEnabled: document.getElementById('api-enabled'),
  promptCap: document.getElementById('prompt-cap'),
  apiProvider: document.getElementById('api-provider'),
  graphicsQuality: document.getElementById('graphics-quality'),
  gameMenuBtn: document.getElementById('game-menu-btn'),
  apiStatus: document.getElementById('api-status'),
  promptCount: document.getElementById('prompt-count'),
  characterTabs: document.getElementById('character-tabs'),
  characterForm: document.getElementById('character-form'),
  characterSelector: document.getElementById('character-selector'),
  characterDetails: document.getElementById('character-details')
};

// Validate required UI elements in elements object
const requiredElementKeys = [
  'startMenu', 'gameContainer', 'newGameBtn', 'loadGameBtn',
  'optionsBtn', 'addCharacterBtn', 'startSimulationBtn'
];

const missingUIElements = requiredElementKeys.filter(key => !elements[key]);
if (missingUIElements.length > 0) {
  console.error('[Main] Missing UI elements in elements object:', missingUIElements);
}

// Initialize character counter
let characterCount = 0;

// Event listeners
const eventListeners = [];

function addListener(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
  }
}

addListener(elements.newGameBtn, 'click', showCharacterCreation);
addListener(elements.loadGameBtn, 'click', () => elements.fileInput?.click());
addListener(elements.optionsBtn, 'click', showOptionsMenu);
addListener(elements.addCharacterBtn, 'click', addNewCharacter);
addListener(elements.startSimulationBtn, 'click', startSimulation);
addListener(elements.backToMenuBtn, 'click', backToMainMenu);
addListener(elements.saveSettingsBtn, 'click', saveSettings);
addListener(elements.exportPromptsBtn, 'click', () => promptTracker.exportPromptData());
addListener(elements.exportFullDataBtn, 'click', () => promptTracker.exportFullDataset());
addListener(elements.fileInput, 'change', handleFileUpload);
addListener(elements.apiEnabled, 'change', toggleApiStatus);
addListener(elements.gameMenuBtn, 'click', showOptionsMenu);

function cleanupListeners() {
  eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  eventListeners.length = 0;
}

// Initialize debug system
DebugSystem.init();

// Initialize prompt tracker
promptTracker.init();

// Set default character
addNewCharacter();

function showCharacterCreation() {
  elements.startMenu?.classList.add('hidden');
  elements.characterCreation?.classList.remove('hidden');
}

function showOptionsMenu() {
  elements.startMenu?.classList.add('hidden');
  elements.optionsMenu?.classList.remove('hidden');
}

function backToMainMenu() {
  elements.characterCreation?.classList.add('hidden');
  elements.optionsMenu?.classList.add('hidden');
  elements.startMenu?.classList.remove('hidden');
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
      <label>Appearance</label>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <label for="${charId}-skin">Skin Color</label>
          <input type="color" id="${charId}-skin" value="#f5d5b0">
        </div>
        <div>
          <label for="${charId}-hair">Hair Color</label>
          <input type="color" id="${charId}-hair" value="#3a2a1a">
        </div>
        <div>
          <label for="${charId}-shirt">Shirt Color</label>
          <input type="color" id="${charId}-shirt" value="#2a5ca7">
        </div>
        <div>
          <label for="${charId}-pants">Pants Color</label>
          <input type="color" id="${charId}-pants" value="#1a1a1a">
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
  // Validate form data
  const tabs = elements.characterTabs?.querySelectorAll('.character-tab');
  if (!tabs || tabs.length === 0) {
    alert('Please create at least one character');
    return;
  }

  // Cleanup previous simulation if any
  if (canvasRenderer) {
    canvasRenderer.cleanup();
  }
  cleanupListeners();

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
      appearance: {
        skinColor: document.getElementById(`${charId}-skin`).value,
        hairColor: document.getElementById(`${charId}-hair`).value,
        shirtColor: document.getElementById(`${charId}-shirt`).value,
        pantsColor: document.getElementById(`${charId}-pants`).value
      },
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

async function processAICharacter(character) {
  if (!character.canAcceptPrompt()) return;
  
  character.lastPromptTime = Date.now();
  character.promptCount++;
  
  // Generate AI prompt
  const prompt = AISystem.generatePrompt(character, gameState);
  
  try {
    // Call AI API (implementation depends on selected provider)
    const response = await callAIAPI(prompt, character.apiKey);
    
    // Track the prompt/response
    promptTracker.track({
      characterId: character.id,
      characterName: character.name,
      timestamp: new Date().toISOString(),
      prompt,
      response,
      state: JSON.stringify({
        position: character.position,
        mood: character.mood,
        needs: character.needs,
        currentTask: character.currentTask
      })
    });
    
    // Process the AI response
    await AISystem.processAIResponse(character, response);
  } catch (error) {
    console.error('AI processing failed:', error);
    character.state = OfficeCharacter.STATES.IDLE;
  }
}

async function callAIAPI(prompt, apiKey) {
  if (!gameState.apiEnabled || !apiKey) {
    throw new Error('API is disabled or missing API key');
  }

  try {
    // Implementation depends on selected API provider
    const provider = gameState.apiProvider || 'openai';
    const endpoint = provider === 'openai' 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.example.com/chat';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 
      JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
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
}); // End of DOMContentLoaded
