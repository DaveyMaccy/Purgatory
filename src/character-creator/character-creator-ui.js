/**
 * Character Creator UI Module
 * Handles all UI creation and management for the character creator
 * RESTORED to Phase 3 layout with office selector and proper portrait system
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
        
        console.log('✅ Character creator UI setup complete');
    }

    /**
     * PHASE 3 FEATURE: Setup office type selector
     */
    setupOfficeTypeSelector() {
        const creatorHeader = document.querySelector('.creator-header') || 
                             document.querySelector('#character-creator-modal .p-6:first-child');
        
        if (!creatorHeader) {
            console.warn('⚠️ Creator header not found, skipping office selector');
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
        
        creatorHeader.insertBefore(officeSection, creatorHeader.firstChild);
        
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
        
        console.log(`📋 Updated job roles for ${this.core.officeType} office`);
    }

    /**
     * Setup global API key section
     */
    setupGlobalAPIKeySection() {
        const creatorHeader = document.querySelector('.creator-header') || 
                             document.querySelector('#character-creator-modal .p-6:first-child');
        
        if (!creatorHeader) return;

        const apiSection = document.createElement('div');
        apiSection.style.cssText = `
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            border: 1px solid #dee2e6;
        `;
        
        apiSection.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <label style="font-weight: bold; color: #495057;">🔑 Global AI API Key:</label>
                <input type="text" id="global-api-key" placeholder="Enter your OpenAI/Gemini API key..." 
                       style="flex: 1; min-width: 300px; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px;">
                <span style="font-size: 12px; color: #6c757d;">Can be overridden per character</span>
            </div>
        `;
        
        creatorHeader.appendChild(apiSection);
        
        // Add event listener
        const globalApiInput = document.getElementById('global-api-key');
        if (globalApiInput) {
            globalApiInput.addEventListener('input', (e) => {
                this.core.globalAPIKey = e.target.value;
            });
        }
    }

    /**
     * Setup character management controls
     */
    setupCharacterManagementControls() {
        const creatorHeader = document.querySelector('.creator-header') || 
                             document.querySelector('#character-creator-modal .p-6:first-child');
        
        if (!creatorHeader) return;

        const controlsSection = document.createElement('div');
        controlsSection.style.cssText = `
            background: #fff3cd;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            border: 1px solid #ffeaa7;
        `;
        
        controlsSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <span id="character-count" style="font-weight: bold; color: #856404;">${this.core.characters.length}/${CONSTANTS.MAX_CHARACTERS} Characters</span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button type="button" id="add-character-btn" 
                            style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        ➕ Add Character
                    </button>
                    <button type="button" id="remove-character-btn" 
                            style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        ➖ Remove Current
                    </button>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <label style="display: flex; align-items: center; font-size: 14px;">
                        <input type="checkbox" id="randomize-all-checkbox" style="margin-right: 5px;">
                        Randomize All
                    </label>
                    <button type="button" id="randomize-current-btn" 
                            style="padding: 6px 12px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        🎲 Randomize
                    </button>
                </div>
            </div>
        `;
        
        creatorHeader.appendChild(controlsSection);
        
        console.log('✅ Character management controls created');
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
        tab.className = `character-tab ${index === this.core.currentCharacterIndex ? 'active' : ''}`;
        tab.textContent = character.name || `Character ${index + 1}`;
        tab.onclick = () => this.core.switchToTab(index);
        
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
        const character = this.core.characters[index];
        
        const panel = document.createElement('div');
        panel.id = `character-panel-${index}`;
        panel.className = `creator-panel ${index === this.core.currentCharacterIndex ? '' : 'hidden'}`;
        
        panel.innerHTML = this.generateCharacterPanelHTML(index, character);
        panelsContainer.appendChild(panel);
        
        // Initialize portrait display
        this.updateCharacterPortrait(index, character.spriteSheet);
        this.updateSpriteInfo(index);
    }

    /**
     * Generate character panel HTML with Phase 3 layout
     */
    generateCharacterPanelHTML(index, character) {
        const jobRoleOptions = CONSTANTS.JOB_ROLES_BY_OFFICE[this.core.officeType]
            .map(role => `<option value="${role}" ${role === character.jobRole ? 'selected' : ''}>${role}</option>`)
            .join('');
            
        const buildOptions = CONSTANTS.PHYSICAL_BUILDS
            .map(build => `<option value="${build}" ${build === character.physicalAttributes.build ? 'selected' : ''}>${build}</option>`)
            .join('');
            
        const genderOptions = CONSTANTS.GENDERS
            .map(gender => `<option value="${gender}" ${gender === character.physicalAttributes.gender ? 'selected' : ''}>${gender}</option>`)
            .join('');

        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr 300px; gap: 20px; height: 100%; max-height: 600px;">
                <!-- Left Column: Basic Information -->
                <div style="overflow-y: auto;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3 style="margin: 0 0 15px 0; color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 8px;">👤 Basic Information</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #495057;">Name:</label>
                                <input type="text" id="name-${index}" value="${character.name}" 
                                       style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;">
                            </div>
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #495057;">Gender:</label>
                                <select id="gender-${index}" 
                                        style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;">
                                    ${genderOptions}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #495057;">Job Role:</label>
                                <select id="jobRole-${index}" 
                                        style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;">
                                    ${jobRoleOptions}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #495057;">Build:</label>
                                <select id="build-${index}" 
                                        style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;">
                                    ${buildOptions}
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; font-weight: 500; color: #495057;">
                                <input type="checkbox" id="isPlayer-${index}" ${character.isPlayer ? 'checked' : ''} 
                                       style="margin-right: 8px; transform: scale(1.2);">
                                👑 Set as Player Character
                            </label>
                        </div>
                        
                        <div>
                            <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #495057;">Individual API Key (optional):</label>
                            <input type="text" id="api-key-${index}" value="${character.apiKey || ''}" 
                                   placeholder="Override global API key..." 
                                   style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;">
                        </div>
                    </div>
                    
                    <!-- Physical Attributes -->
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3 style="margin: 0 0 15px 0; color: #1976d2; border-bottom: 2px solid #bbdefb; padding-bottom: 8px;">📏 Physical Attributes</h3>
                        
                        ${this.generateAttributeSlider(index, 'age', 'Age', character.physicalAttributes.age, 18, 65, '')}
                        ${this.generateAttributeSlider(index, 'height', 'Height', character.physicalAttributes.height, 140, 200, ' cm')}
                        ${this.generateAttributeSlider(index, 'weight', 'Weight', character.physicalAttributes.weight, 40, 120, ' kg')}
                        ${this.generateAttributeSlider(index, 'looks', 'Attractiveness', character.physicalAttributes.looks, 1, 10, '/10')}
                    </div>
                    
                    <!-- Skill Attributes -->
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px;">
                        <h3 style="margin: 0 0 15px 0; color: #388e3c; border-bottom: 2px solid #c8e6c9; padding-bottom: 8px;">🎯 Skills (1-10 Scale)</h3>
                        
                        ${this.generateAttributeSlider(index, 'competence', 'Competence', character.skillAttributes.competence, 1, 10, '/10')}
                        ${this.generateAttributeSlider(index, 'laziness', 'Laziness', character.skillAttributes.laziness, 1, 10, '/10')}
                        ${this.generateAttributeSlider(index, 'charisma', 'Charisma', character.skillAttributes.charisma, 1, 10, '/10')}
                        ${this.generateAttributeSlider(index, 'leadership', 'Leadership', character.skillAttributes.leadership, 1, 10, '/10')}
                    </div>
                </div>
                
                <!-- Middle Column: Lists -->
                <div style="overflow-y: auto;">
                    <!-- Personality Tags -->
                    <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3 style="margin: 0 0 15px 0; color: #f57c00; border-bottom: 2px solid #ffcc02; padding-bottom: 8px;">🧠 Personality Tags</h3>
                        <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ffcc02; padding: 10px; border-radius: 4px; background: white;">
                            ${this.generatePersonalityTagsHTML(index, character.personalityTags)}
                        </div>
                    </div>
                    
                    <!-- Inventory -->
                    <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h3 style="margin: 0 0 15px 0; color: #7b1fa2; border-bottom: 2px solid #ce93d8; padding-bottom: 8px;">🎒 Inventory (Max 3)</h3>
                        <div style="max-height: 120px; overflow-y: auto; border: 1px solid #ce93d8; padding: 10px; border-radius: 4px; background: white; font-size: 14px;">
                            ${this.generateInventoryOptionsHTML(index, character.inventory)}
                        </div>
                    </div>
                    
                    <!-- Desk Items -->
                    <div style="background: #fce4ec; padding: 15px; border-radius: 8px;">
                        <h3 style="margin: 0 0 15px 0; color: #c2185b; border-bottom: 2px solid #f8bbd9; padding-bottom: 8px;">🗃️ Desk Items (Max 2)</h3>
                        <div style="max-height: 120px; overflow-y: auto; border: 1px solid #f8bbd9; padding: 10px; border-radius: 4px; background: white; font-size: 14px;">
                            ${this.generateDeskItemsOptionsHTML(index, character.deskItems)}
                        </div>
                    </div>
                </div>
                
                <!-- Right Column: Portrait & Sprite -->
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #424242; text-align: center; border-bottom: 2px solid #bdbdbd; padding-bottom: 8px;">🎭 Character Appearance</h3>
                    
                    <!-- Sprite Navigation -->
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #e0e0e0;">
                        <h4 style="margin: 0 0 10px 0; text-align: center; color: #616161;">Character Sprite</h4>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <button type="button" id="sprite-prev-${index}" 
                                    style="padding: 8px 12px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                                ◀ Prev
                            </button>
                            <span id="sprite-info-${index}" style="font-size: 12px; color: #757575; font-weight: 500;">
                                Sprite 1 of ${CONSTANTS.SPRITE_OPTIONS.length}
                            </span>
                            <button type="button" id="sprite-next-${index}" 
                                    style="padding: 8px 12px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                                Next ▶
                            </button>
                        </div>
                        
                        <!-- FIXED: Individual sprite display, not spritesheet -->
                        <div style="text-align: center; margin-bottom: 10px;">
                            <img id="character-portrait-${index}" 
                                 style="width: 96px; height: 96px; object-fit: cover; border: 3px solid #2196f3; border-radius: 8px; background: #fafafa;" 
                                 alt="Character Sprite">
                        </div>
                    </div>
                    
                    <!-- Custom Portrait Upload -->
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #e0e0e0;">
                        <h4 style="margin: 0 0 10px 0; text-align: center; color: #616161;">Custom Portrait</h4>
                        
                        <div style="text-align: center; margin-bottom: 15px;">
                            <canvas id="custom-canvas-${index}" width="96" height="96" 
                                    style="border: 3px solid #ff9800; border-radius: 8px; background: #fafafa;"></canvas>
                        </div>
                        
                        <div style="text-align: center;">
                            <input type="file" id="portrait-upload-${index}" accept="image/*" style="display: none;">
                            <button type="button" id="upload-portrait-btn-${index}" 
                                    style="padding: 6px 12px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">
                                📷 Upload
                            </button>
                            <button type="button" id="clear-custom-${index}" 
                                    style="padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                🗑️ Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate attribute slider HTML
     */
    generateAttributeSlider(index, attrName, label, value, min, max, unit) {
        return `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <label style="font-weight: 500; color: #495057;">${label}:</label>
                    <span id="${attrName}-val-${index}" style="font-weight: bold; color: #495057;">${value}${unit}</span>
                </div>
                <input type="range" id="${attrName}-${index}" min="${min}" max="${max}" value="${value}" 
                       style="width: 100%; accent-color: #2196f3;">
            </div>
        `;
    }

    /**
     * Generate personality tags HTML
     */
    generatePersonalityTagsHTML(index, selectedTags) {
        return CONSTANTS.PERSONALITY_TAGS.map(tag => `
            <label style="display: block; margin: 2px 0; font-size: 14px; cursor: pointer;">
                <input type="checkbox" id="personality-${index}-${tag}" value="${tag}" 
                       ${selectedTags.includes(tag) ? 'checked' : ''} 
                       style="margin-right: 6px;">
                ${tag}
            </label>
        `).join('');
    }

    /**
     * Generate inventory options HTML
     */
    generateInventoryOptionsHTML(index, selectedItems) {
        return CONSTANTS.INVENTORY_OPTIONS.map(item => `
            <label style="display: block; margin: 2px 0; font-size: 14px; cursor: pointer;">
                <input type="checkbox" id="inventory-${index}-${item}" value="${item}" 
                       ${selectedItems.includes(item) ? 'checked' : ''} 
                       style="margin-right: 6px;">
                ${item}
            </label>
        `).join('');
    }

    /**
     * Generate desk items options HTML
     */
    generateDeskItemsOptionsHTML(index, selectedItems) {
        return CONSTANTS.DESK_ITEM_OPTIONS.map(item => `
            <label style="display: block; margin: 2px 0; font-size: 14px; cursor: pointer;">
                <input type="checkbox" id="desk-item-${index}-${item}" value="${item}" 
                       ${selectedItems.includes(item) ? 'checked' : ''} 
                       style="margin-right: 6px;">
                ${item}
            </label>
        `).join('');
    }

    /**
     * Setup footer controls
     */
    setupFooterControls() {
        const footerContainer = document.querySelector('.creator-footer') || 
                               document.querySelector('#character-creator-modal .p-6:last-child');
        
        if (footerContainer) {
            footerContainer.innerHTML = `
                <div style="text-align: center;">
                    <button type="button" id="start-simulation-btn" 
                            style="padding: 15px 40px; background: #4caf50; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 18px; cursor: pointer; box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);">
                        🚀 Start Simulation
                    </button>
                </div>
            `;
        }
    }

    /**
     * FIXED: Update character portrait to show individual sprite, not spritesheet
     */
    updateCharacterPortrait(index, spriteSheet) {
        const portraitImg = document.getElementById(`character-portrait-${index}`);
        if (portraitImg && spriteSheet) {
            // Clean sprite path
            let cleanPath = spriteSheet;
            if (cleanPath.includes('assets/characters/assets/characters/')) {
                cleanPath = cleanPath.replace('assets/characters/assets/characters/', 'assets/characters/');
            }
            if (!cleanPath.startsWith('./')) {
                clean
