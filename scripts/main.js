import GameState from './game/gamestate.js';
import OfficeCharacter from './game/character.js';
import CanvasRenderer from './graphics/canvasrenderer.js';
import ChatSystem from './ui/chatsystem.js';
import DebugSystem from './game/debugsystem.js';
import SaveSystem from './game/savestate.js';
import AISystem from './game/ai_system.js';
import PromptTracker from './game/prompttracker.js';

class Game {
    constructor() {
        this.elements = {};
        this.gameState = new GameState();
        this.debugSystem = new DebugSystem(this.gameState);
        this.chatSystem = new ChatSystem(this.gameState, this.debugSystem, OfficeCharacter);
        this.saveSystem = new SaveSystem(this.gameState, this.chatSystem, OfficeCharacter);
        this.aiSystem = new AISystem(this.gameState, this.chatSystem);
        this.promptTracker = new PromptTracker(this.gameState);
        this.canvasRenderer = null;
        this.characterCount = 0;
        this.eventListeners = [];
    }

    async initialize() {
        console.log('[Main] Initializing game...');
        this.elements = this.queryDOMElements();
        if (!this.validateDOMElements()) return;

        await this.loadOfficeData();
        this.setupEventListeners();
        this.addNewCharacter();
        this.renderBackground();
        console.log('[Main] Game initialized successfully.');
    }

    queryDOMElements() {
        const ids = [
            'start-menu', 'character-creation', 'options-menu', 'game-container',
            'new-game-btn', 'load-game-btn', 'options-btn', 'add-character-btn',
            'start-simulation-btn', 'back-to-menu-btn', 'save-settings-btn',
            'export-prompts-btn', 'export-full-data-btn', 'file-input', 'api-enabled',
            'prompt-cap', 'api-provider', 'graphics-quality', 'game-menu-btn',
            'api-status', 'prompt-count', 'character-tabs', 'character-form',
            'character-selector', 'character-details', 'office-background'
        ];
        const elements = {};
        ids.forEach(id => elements[id] = document.getElementById(id));
        return elements;
    }

    validateDOMElements() {
        const requiredElementIds = ['start-menu', 'game-container', 'new-game-btn', 'office-background'];
        const missingElements = requiredElementIds.filter(id => !this.elements[id]);
        if (missingElements.length > 0) {
            const errorMsg = `Missing required DOM elements: ${missingElements.join(', ')}`;
            console.error('[Main]', errorMsg);
            alert(errorMsg);
            return false;
        }
        console.log('[Main] All required DOM elements found.');
        return true;
    }

    async loadOfficeData() {
        try {
            const response = await fetch('assets/office-types.json');
            const data = await response.json();
            GameState.OFFICE_TYPES = data;
            console.log('[Main] Office types loaded successfully.');
        } catch (error) {
            console.error('[Main] Failed to load office-types.json', error);
            alert('Failed to load critical game data. Please check the console.');
        }
    }

    setupEventListeners() {
        this.addListener(this.elements.newGameBtn, 'click', () => this.showCharacterCreation());
        this.addListener(this.elements.loadGameBtn, 'click', () => this.elements.fileInput.click());
        this.addListener(this.elements.optionsBtn, 'click', () => this.showOptionsMenu());
        this.addListener(this.elements.addCharacterBtn, 'click', () => this.addNewCharacter());
        this.addListener(this.elements.startSimulationBtn, 'click', () => this.startSimulation());
        this.addListener(this.elements.backToMenuBtn, 'click', () => this.backToMainMenu());
        this.addListener(this.elements.saveSettingsBtn, 'click', () => this.saveSettings());
        this.addListener(this.elements.exportPromptsBtn, 'click', () => this.promptTracker.exportPromptData());
        this.addListener(this.elements.exportFullDataBtn, 'click', () => this.promptTracker.exportFullDataset());
        this.addListener(this.elements.fileInput, 'change', (e) => this.handleFileUpload(e));
        this.addListener(this.elements.apiEnabled, 'change', () => this.toggleApiStatus());
        this.addListener(this.elements.gameMenuBtn, 'click', () => this.showOptionsMenu());
    }

    addListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    renderBackground() {
        const bgCanvas = this.elements.officeBackground;
        if (!bgCanvas) return;
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        const bgCtx = bgCanvas.getContext('2d');
        let cameraX = 0;
        const officeWidth = 3000;
        const panSpeed = 0.5;

        const render = () => {
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgCtx.fillStyle = '#1a1a2e';
            bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgCtx.fillStyle = '#2c3e50';
            for (let x = -cameraX % 800; x < bgCanvas.width; x += 800) {
                bgCtx.fillRect(x + 50, 300, 200, 150);
                bgCtx.fillRect(x + 300, 300, 200, 150);
                bgCtx.fillRect(x + 550, 300, 200, 150);
                bgCtx.fillStyle = '#34495e';
                bgCtx.fillRect(x + 100, 100, 600, 150);
            }
            cameraX = (cameraX + panSpeed) % officeWidth;
            requestAnimationFrame(render);
        };
        render();
    }

    showCharacterCreation() {
        this.elements.startMenu.classList.add('hidden');
        this.elements.characterCreation.classList.remove('hidden');
    }

    showOptionsMenu() {
        this.elements.startMenu.classList.add('hidden');
        this.elements.optionsMenu.classList.remove('hidden');
    }

    backToMainMenu() {
        this.elements.characterCreation.classList.add('hidden');
        this.elements.optionsMenu.classList.add('hidden');
        this.elements.startMenu.classList.remove('hidden');
    }

    addNewCharacter() {
        this.characterCount++;
        const charId = `char_${this.characterCount}`;
        const tab = document.createElement('div');
        tab.className = 'character-tab';
        tab.textContent = `Character ${this.characterCount}`;
        tab.dataset.id = charId;
        tab.addEventListener('click', () => this.selectCharacterTab(charId));
        this.elements.characterTabs.appendChild(tab);
        if (this.characterCount === 1) {
            this.selectCharacterTab(charId);
        }
    }

    selectCharacterTab(charId) {
        Array.from(this.elements.characterTabs.children).forEach(tab => {
            tab.classList.toggle('active', tab.dataset.id === charId);
        });
        this.renderCharacterForm(charId);
    }

    renderCharacterForm(charId) {
        this.elements.characterForm.innerHTML = `
            <div class="form-group"><label for="${charId}-name">Name</label><input type="text" id="${charId}-name" placeholder="Character name"></div>
            <div class="form-group"><label for="${charId}-job">Job Role</label><select id="${charId}-job">${GameState.JOB_ROLES.map(role => `<option value="${role}">${role}</option>`).join('')}</select></div>
            <div class="form-group"><label>Is Player Character?</label><div><label><input type="radio" name="${charId}-player" value="yes"> Yes</label><label><input type="radio" name="${charId}-player" value="no" checked> No</label></div></div>
            <div class="form-group"><label>Appearance</label><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"><div><label for="${charId}-skin">Skin</label><input type="color" id="${charId}-skin" value="#f5d5b0"></div><div><label for="${charId}-hair">Hair</label><input type="color" id="${charId}-hair" value="#3a2a1a"></div><div><label for="${charId}-shirt">Shirt</label><input type="color" id="${charId}-shirt" value="#2a5ca7"></div><div><label for="${charId}-pants">Pants</label><input type="color" id="${charId}-pants" value="#1a1a1a"></div></div></div>
            <div class="form-group"><label>Personality Tags</label><div class="tags-container" id="${charId}-tags">${GameState.PERSONALITY_TAGS.map(tag => `<div class="tag" data-tag="${tag}">${tag}</div>`).join('')}</div></div>
        `;
        this.elements.characterForm.querySelector(`#${charId}-tags`).addEventListener('click', e => {
            if (e.target.classList.contains('tag')) {
                e.target.classList.toggle('selected');
            }
        });
    }

    startSimulation() {
        if (this.elements.characterTabs.children.length === 0) {
            alert('Please create at least one character');
            return;
        }

        if (this.canvasRenderer) {
            this.canvasRenderer.cleanup();
        }

        this.gameState.characters = [];
        Array.from(this.elements.characterTabs.children).forEach(tab => {
            const charId = tab.dataset.id;
            const form = this.elements.characterForm;
            const charData = {
                id: charId,
                name: form.querySelector(`#${charId}-name`).value || `Character ${charId.split('_')[1]}`,
                job: form.querySelector(`#${charId}-job`).value,
                isPlayer: form.querySelector(`input[name="${charId}-player"]:checked`).value === 'yes',
                appearance: {
                    skinColor: form.querySelector(`#${charId}-skin`).value,
                    hairColor: form.querySelector(`#${charId}-hair`).value,
                    shirtColor: form.querySelector(`#${charId}-shirt`).value,
                    pantsColor: form.querySelector(`#${charId}-pants`).value
                },
                personality: Array.from(form.querySelectorAll(`#${charId}-tags .tag.selected`)).map(tag => tag.dataset.tag),
                position: { x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6 }
            };
            const character = new OfficeCharacter(charData);
            this.gameState.addCharacter(character);
        });

        this.canvasRenderer = new CanvasRenderer(this.gameState, this.debugSystem);
        this.toggleApiStatus();

        this.elements.characterCreation.classList.add('hidden');
        this.elements.gameContainer.classList.remove('hidden');

        this.updateCharacterSelector();
        this.gameLoop();
    }

    gameLoop() {
        this.gameState.characters.forEach(char => {
            char.updatePosition();
            char.updateNeeds();
            if (!char.isPlayer && char.enabled && char.canAcceptPrompt()) {
                this.processAICharacter(char);
            }
        });

        if (this.elements.promptCount) {
            this.elements.promptCount.textContent = `Prompts: ${this.promptTracker.getCount()}`;
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    async processAICharacter(character) {
        if (!character.canAcceptPrompt()) return;
        character.lastPromptTime = Date.now();
        character.promptCount++;

        const prompt = this.aiSystem.generatePrompt(character);
        try {
            const response = await this.callAIAPI(prompt, character.apiKey);
            this.promptTracker.track({
                characterId: character.id,
                characterName: character.name,
                timestamp: new Date().toISOString(),
                prompt,
                response,
                state: JSON.stringify({ position: character.position, mood: character.mood, needs: character.needs, currentTask: character.currentTask })
            });
            await this.aiSystem.processAIResponse(character, response);
        } catch (error) {
            console.error('AI processing failed:', error);
            character.state = 'idle';
        }
    }

    async callAIAPI(prompt, apiKey) {
        if (!this.gameState.apiEnabled) {
            return JSON.stringify({ action: "rest", params: {}, reason: "API is disabled." });
        }
        if (!apiKey) {
             console.warn("Attempted to call AI for character without API key.");
             return JSON.stringify({ action: "rest", params: {}, reason: "Missing API key." });
        }
        // Placeholder for actual API call
        return JSON.stringify({ action: "work", params: {task: "thinking"}, reason: "Placeholder response." });
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.saveSystem.importSave(file)
            .then(() => {
                this.elements.startMenu.classList.add('hidden');
                this.elements.gameContainer.classList.remove('hidden');
                this.canvasRenderer = new CanvasRenderer(this.gameState, this.debugSystem);
                this.updateCharacterSelector();
                this.gameLoop();
            })
            .catch(error => {
                console.error('Failed to load save:', error);
                alert('Failed to load save file. See console for details.');
            });
    }

    toggleApiStatus() {
        this.gameState.apiEnabled = this.elements.apiEnabled.checked;
        this.elements.apiStatus.textContent = `API: ${this.gameState.apiEnabled ? 'ON' : 'OFF'}`;
    }

    saveSettings() {
        this.gameState.promptCap = parseInt(this.elements.promptCap.value) || 50;
        this.gameState.apiProvider = this.elements.apiProvider.value;
        this.gameState.graphicsQuality = this.elements.graphicsQuality.value;
        if (this.canvasRenderer) {
            this.canvasRenderer.setQuality(this.gameState.graphicsQuality);
        }
        alert('Settings saved successfully!');
    }

    updateCharacterSelector() {
        this.elements.characterSelector.innerHTML = '';
        this.gameState.characters.forEach(char => {
            const option = document.createElement('option');
            option.value = char.id;
            option.textContent = char.name;
            this.elements.characterSelector.appendChild(option);
        });

        if (this.gameState.characters.length > 0) {
            this.elements.characterSelector.value = this.gameState.characters[0].id;
            this.showCharacterDetails(this.gameState.characters[0].id);
        }

        this.elements.characterSelector.addEventListener('change', (e) => {
            this.showCharacterDetails(e.target.value);
        });
    }

    showCharacterDetails(charId) {
        const character = this.gameState.getCharacter(charId);
        if (!character) return;
        this.elements.characterDetails.innerHTML = `
            <div class="detail-row"><strong>Name:</strong> ${character.name}</div>
            <div class="detail-row"><strong>Job:</strong> ${character.job}</div>
            <div class="detail-row"><strong>Status:</strong> ${character.state}</div>
            <div class="detail-row"><strong>Mood:</strong> ${character.mood}</div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.initialize();
});
