// src/character-creator/character-creator-ui.js
/**
 * Character Creator UI Module
 * Handles all UI creation and management for the character creator
 * PHASE 3 RESTORED VERSION with office selector and FIXED portrait system
 */

import { CONSTANTS } from './character-creator-constants.js';

export class CharacterCreatorUI {
    constructor(core) {
        this.core = core;
        console.log('🎨 Character Creator UI initialized');
    }

    /**
     * Initialize the complete UI
     */
    async initialize() {
        console.log('🎨 Setting up character creator UI...');
        
        // Setup office type selector (Phase 3 feature)
        this.setupOfficeTypeSelector();
        
        // Setup global API key section
        this.setupGlobalAPIKeySection();
        
        // Setup character management controls
        this.setupCharacterManagementControls();
        
        // Create character tabs and panels
        this.createAllCharacterTabs();
        this.createAllCharacterPanels();
        
        // Setup footer controls
        this.setupFooterControls();
        
        // Switch to first character
        this.core.switchToTab(0);
        this.refreshUI();
        
        console.log('✅ Character creator UI setup complete');
    }

    /**
     * PHASE 3 FEATURE: Setup office type selector
     */
    setupOfficeTypeSelector() {
        // Look for the existing modal structure from index.html
        const creatorModal = document.getElementById('creator-modal-backdrop');
        if (!creatorModal) {
            console.warn('⚠️ Creator modal not found');
            return;
        }

        const creatorHeader = creatorModal.querySelector('.creator-header');
        if (!creatorHeader) {
            console.warn('⚠️ Creator header not found');
            return;
        }

        // Check if office selector already exists
        if (document.getElementById('office-type-selector')) {
            console.log('📋 Office selector already exists');
            return;
        }

        const officeSection = document.createElement('div');
        officeSection.style.cssText = `
            background: #e3f2fd;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            border-left: 4px solid #2196f3;
        `;
        
        const officeOptions = CONSTANTS.OFFICE_TYPES
            .map(type => `<option value="${type}" ${type === this.core.officeType ? 'selected' : ''}>${type}</option>`)
            .join('');
        
        officeSection.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <label style="font-weight: bold; color: #1976d2; font-size: 16px;">🏢 Office Type:</label>
                <select id="office-type-selector" style="padding: 8px 12px; border: 2px solid #2196f3; border-radius: 6px; font-weight: bold; background: white; min-width: 150px;">
                    ${officeOptions}
                </select>
                <span style="font-size: 12px; color: #1976d2; font-style: italic;">Determines available job roles and office culture</span>
            </div>
        `;
        
        creatorHeader.appendChild(officeSection);
        
        // Add event listener
        const officeSelector = document.getElementById('office-type-selector');
        if (officeSelector) {
            officeSelector.addEventListener('change', (e) => {
                this.core.officeType = e.target.value;
                console.log(`🏢 Office type changed to: ${this.core.officeType}`);
                this.updateAllCharacterJobRoles();
            });
        }
        
        console.log('✅ Office type selector created');
    }

    /**
     * Update job roles when office type changes
     */
    updateAllCharacterJobRoles() {
        const availableRoles = CONSTANTS.JOB_ROLES_BY_OFFICE[this.core.officeType];
        
        this.core.characters.forEach((character, index) => {
            character.jobRole = availableRoles[0];
            
            const jobRoleSelect = document.getElementById(`jobRole-${index}`);
            if (jobRoleSelect) {
                jobRoleSelect.innerHTML = availableRoles
                    .map(role => `<option value="${role}">${role}</option>`)
                    .join('');
                jobRoleSelect.value = character.jobRole;
            }
        });
        
        console.log(`🔄 Updated job roles for office type: ${this.core.officeType}`);
    }

    /**
     * Setup global API key section
     */
    setupGlobalAPIKeySection() {
        // Find the creator modal and add to the main content area
        const creatorModal = document.getElementById('creator-modal-backdrop');
        if (!creatorModal) return;

        const creatorMain = creatorModal.querySelector('.creator-main');
        if (!creatorMain) return;

        // Check if already exists
        if (document.getElementById('global-api-section')) return;

        const apiSection = document.createElement('div');
        apiSection.id = 'global-api-section';
        apiSection.innerHTML = `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 15px;">
                <label style="font-weight: bold; color: #856404; margin-bottom: 8px; display: block;">
                    🔑 Global API Key (Optional):
                </label>
                <input type="text" id="global-api-key" placeholder="Enter your OpenAI API key..." 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;">
                <small style="color: #856404; font-size: 12px; margin-top: 5px; display: block;">
                    This key will be used for all characters unless overridden individually.
                </small>
            </div>
        `;
        
        // Insert before the character tabs
        const characterTabs = document.getElementById('character-tabs');
        if (characterTabs && characterTabs.parentNode) {
            characterTabs.parentNode.insertBefore(apiSection, characterTabs);
        } else {
            creatorMain.insertBefore(apiSection, creatorMain.firstChild);
        }
        
        const globalApiInput = document.getElementById('global-api-key');
        if (globalApiInput) {
            globalApiInput.addEventListener('input', (e) => {
                this.core.globalApiKey = e.target.value;
            });
        }
    }

    /**
     * Setup character management controls
     */
    setupCharacterManagementControls() {
        // Look for existing controls in the creator modal
        const creatorMain = document.querySelector('#creator-modal-backdrop .creator-main');
        if (!creatorMain) return;

        // Check if controls already exist
        if (document.getElementById('character-controls')) return;

        const controlsSection = document.createElement('div');
        controlsSection.id = 'character-controls';
        controlsSection.innerHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center; flex-wrap: wrap;">
                <button type="button" id="add-character-btn" 
                        style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ➕ Add Character
                </button>
                <button type="button" id="remove-character-btn" 
                        style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ➖ Remove Character
                </button>
                <button type="button" id="randomize-all-btn" 
                        style="padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🎲 Randomize All
                </button>
            </div>
        `;
        
        // Insert before character tabs
        const characterTabs = document.getElementById('character-tabs');
        if (characterTabs && characterTabs.parentNode) {
            characterTabs.parentNode.insertBefore(controlsSection, characterTabs);
        }
        
        this.setupCharacterControlEvents();
    }

    /**
     * Setup event listeners for character controls
     */
    setupCharacterControlEvents() {
        const addBtn = document.getElementById('add-character-btn');
        const removeBtn = document.getElementById('remove-character-btn');
        const randomizeAllBtn = document.getElementById('randomize-all-btn');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (this.core.addCharacter()) {
                    this.refreshUI();
                }
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (this.core.removeCharacter(this.core.currentCharacterIndex)) {
                    this.refreshUI();
                }
            });
        }
        
        if (randomizeAllBtn) {
            randomizeAllBtn.addEventListener('click', () => {
                this.core.randomizeAllCharacters();
                this.refreshUI();
            });
        }
    }

    /**
     * Create all character tabs
     */
    createAllCharacterTabs() {
        const tabsContainer = document.getElementById('character-tabs');
        if (!tabsContainer) {
            console.error('❌ Character tabs container not found');
            return;
        }
        
        tabsContainer.innerHTML = '';
        
        this.core.characters.forEach((character, index) => {
            this.createCharacterTab(index);
        });
    }

    /**
     * Create individual character tab
     */
    createCharacterTab(index) {
        const tabsContainer = document.getElementById('character-tabs');
        const character = this.core.characters[index];
        
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.id = `character-tab-${index}`;
        tab.className = `creator-tab ${index === this.core.currentCharacterIndex ? 'active' : ''}`;
        tab.textContent = character.name || `Character ${index + 1}`;
        tab.onclick = () => {
            this.core.switchToTab(index);
            this.refreshUI();
        };
        
        // Add player indicator
        if (character.isPlayer) {
            tab.classList.add('player-character');
            tab.textContent += ' 👑';
        }
        
        tabsContainer.appendChild(tab);
    }

    /**
     * Create all character panels
     */
    createAllCharacterPanels() {
        const panelsContainer = document.getElementById('character-panels');
        if (!panelsContainer) {
            console.error('❌ Character panels container not found');
            return;
        }
        
        panelsContainer.innerHTML = '';
        
        this.core.characters.forEach((character, index) => {
            this.createCharacterPanel(index);
        });
    }

    /**
     * Create individual character panel with PHASE 3 layout
     */
    createCharacterPanel(index) {
        const panelsContainer = document.getElementById('character-panels');
        const character = this.core.characters[
