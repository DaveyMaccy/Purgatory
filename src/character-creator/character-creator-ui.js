// src/character-creator/character-creator-ui.js
/**
 * Character Creator UI Module
 * Handles all UI creation and management for the character creator
 * PHASE 3 RESTORED VERSION with office selector and proper portrait system
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
        
        console.log(`🔄 Updated job roles for office type: ${this.core.officeType}`);
    }

    /**
     * Setup global API key section
     */
    setupGlobalAPIKeySection() {
        const apiSection = document.getElementById('global-api-section');
        if (apiSection) {
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
            
            const globalApiInput = document.getElementById('global-api-key');
            if (globalApiInput) {
                globalApiInput.addEventListener('input', (e) => {
                    this.core.globalApiKey = e.target.value;
                });
            }
        }
    }

    /**
     * Setup character management controls
     */
    setupCharacterManagementControls() {
        const controlsSection = document.getElementById('character-controls');
        if (controlsSection) {
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
            
            this.setupCharacterControlEvents();
        }
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
        const character = this.core.characters[index];
        
        const panel = document.createElement('div');
        panel.id = `character-panel-${index}`;
        panel.className = `creator-panel ${index === this.core.currentCharacterIndex ? '' : 'hidden'}`;
        
        panel.innerHTML = this.generateCharacterPanelHTML(index, character);
        panelsContainer.appendChild(panel);
        
        // Setup event listeners for this panel
        this.setupPanelEventListeners(index);
        
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 100%;">
                <!-- Left Column: Basic Info & Appearance -->
                <div>
                    <!-- Basic Information -->
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #e0e0e0;">
                        <h3 style="margin: 0 0 15px 0; color: #333; text-align: center;">👤 Basic Information</h3>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">Name:</label>
                            <input type="text" id="name-${index}" value="${character.name}" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">Job Role:</label>
                            <select id="jobRole-${index}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                ${jobRoleOptions}
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 10px;">
                            <label style="display: flex; align-items: center; font-weight: bold; cursor: pointer;">
                                <input type="checkbox" id="isPlayer-${index}" ${character.isPlayer ? 'checked' : ''} 
                                       style="margin-right: 8px; transform: scale(1.2);">
                                👑 Player Character
                            </label>
                        </div>
                    </div>

                    <!-- Physical Attributes -->
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #e0e0e0;">
                        <h3 style="margin: 0 0 15px 0; color: #333; text-align: center;">🏃 Physical Attributes</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Gender:</label>
                                <select id="gender-${index}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                    ${genderOptions}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Build:</label>
                                <select id="build-${index}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                    ${buildOptions}
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Appearance Selection -->
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #e0e0e0;">
                        <h3 style="margin: 0 0 15px 0; color: #333; text-align: center;">🎨 Appearance</h3>
                        
                        <!-- Sprite Navigation -->
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
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
                        
                        <!-- Random Character Button -->
                        <div style="text-align: center;">
                            <button type="button" id="randomize-character-${index}" 
                                    style="padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                🎲 Randomize Character
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Skills, Personality, Items -->
                <div>
                    <!-- Skills -->
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #e0e0e0;">
                        <h3 style="margin: 0 0 15px 0; color: #333; text-align: center;">💪 Skills</h3>
                        ${this.generateSkillsHTML(index, character.skills)}
                    </div>

                    <!-- Personality -->
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #e0e0e0;">
                        <h3 style="margin: 0 0 15px 0; color: #333; text-align: center;">🧠 Personality</h3>
                        <div style="max-height: 120px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                            ${this.generatePersonalityTagsHTML(index, character.personality.tags)}
                        </div>
                    </div>

                    <!-- Inventory & Desk Items -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <!-- Inventory -->
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #e0e0e0;">
                            <h4 style="margin: 0 0 10px 0; color: #333; text-align: center;">🎒 Inventory</h4>
                            <div style="max-height: 100px; overflow-y: auto; font-size: 12px;">
                                ${this.generateInventoryOptionsHTML(index, character.inventory)}
                            </div>
                        </div>

                        <!-- Desk Items -->
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #e0e0e0;">
                            <h4 style="margin: 0 0 10px 0; color: #333; text-align: center;">🗃️ Desk Items</h4>
                            <div style="max-height: 100px; overflow-y: auto; font-size: 12px;">
                                ${this.generateDeskItemsOptionsHTML(index, character.deskItems)}
                            </div>
                        </div>
                    </div>

                    <!-- Individual API Key -->
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #2196f3;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #1976d2;">
                            🔑 Individual API Key (Optional):
                        </label>
                        <input type="text" id="apiKey-${index}" value="${character.apiKey}" 
                               placeholder="Override global API key..."
                               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 12px;">
                        <small style="color: #1976d2; font-size: 11px; margin-top: 5px; display: block;">
                            Leave blank to use global API key.
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate skills HTML with sliders
     */
    generateSkillsHTML(index, skills) {
        return Object.entries(skills).map(([skill, value]) => `
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px; text-transform: capitalize;">
                    ${skill}: <span id="${skill}-value-${index}" style="color: #2196f3;">${value}</span>
                </label>
                <input type="range" id="${skill}-${index}" min="0" max="100" value="${value}" 
                       style="width: 100%; height: 6px; background: #ddd; border-radius: 3px;">
            </div>
        `).join('');
    }

    /**
     * Generate personality tags HTML with checkboxes
     */
    generatePersonalityTagsHTML(index, selectedTags) {
        return CONSTANTS.PERSONALITY_TAGS.map(tag => `
            <label style="display: block; margin: 2px 0; font-size: 13px; cursor: pointer;">
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
            <label style="display: block; margin: 2px 0; font-size: 12px; cursor: pointer;">
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
            <label style="display: block; margin: 2px 0; font-size: 12px; cursor: pointer;">
                <input type="checkbox" id="desk-item-${index}-${item}" value="${item}" 
                       ${selectedItems.includes(item) ? 'checked' : ''} 
                       style="margin-right: 6px;">
                ${item}
            </label>
        `).join('');
    }

    /**
     * Setup event listeners for a character panel
     */
    setupPanelEventListeners(index) {
        const character = this.core.characters[index];

        // Basic info listeners
        const nameInput = document.getElementById(`name-${index}`);
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                character.name = e.target.value;
                this.updateCharacterTab(index);
            });
        }

        const jobRoleSelect = document.getElementById(`jobRole-${index}`);
        if (jobRoleSelect) {
            jobRoleSelect.addEventListener('change', (e) => {
                character.jobRole = e.target.value;
            });
        }

        const isPlayerCheck = document.getElementById(`isPlayer-${index}`);
        if (isPlayerCheck) {
            isPlayerCheck.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.core.setPlayerCharacter(index);
                    this.refreshUI();
                } else {
                    // Don't allow unchecking if this is the only player
                    const playerCount = this.core.characters.filter(c => c.isPlayer).length;
                    if (playerCount === 1) {
                        e.target.checked = true;
                        console.warn('⚠️ At least one player character required');
                    } else {
                        character.isPlayer = false;
                        this.updateCharacterTab(index);
                    }
                }
            });
        }

        // Physical attributes listeners
        const genderSelect = document.getElementById(`gender-${index}`);
        if (genderSelect) {
            genderSelect.addEventListener('change', (e) => {
                character.physicalAttributes.gender = e.target.value;
            });
        }

        const buildSelect = document.getElementById(`build-${index}`);
        if (buildSelect) {
            buildSelect.addEventListener('change', (e) => {
                character.physicalAttributes.build = e.target.value;
            });
        }

        // Sprite navigation listeners
        const spritePrevBtn = document.getElementById(`sprite-prev-${index}`);
        if (spritePrevBtn) {
            spritePrevBtn.addEventListener('click', () => {
                this.core.updateCharacterSprite(index, 'prev');
                this.updateCharacterPortrait(index, character.spriteSheet);
                this.updateSpriteInfo(index);
            });
        }

        const spriteNextBtn = document.getElementById(`sprite-next-${index}`);
        if (spriteNextBtn) {
            spriteNextBtn.addEventListener('click', () => {
                this.core.updateCharacterSprite(index, 'next');
                this.updateCharacterPortrait(index, character.spriteSheet);
                this.updateSpriteInfo(index);
            });
        }

        // Randomize character button
        const randomizeBtn = document.getElementById(`randomize-character-${index}`);
        if (randomizeBtn) {
            randomizeBtn.addEventListener('click', () => {
                this.core.randomizeCharacter(index);
                this.refreshUI();
            });
        }

        // Skills listeners
        Object.keys(character.skills).forEach(skill => {
            const skillSlider = document.getElementById(`${skill}-${index}`);
            if (skillSlider) {
                skillSlider.addEventListener('input', (e) => {
                    character.skills[skill] = parseInt(e.target.value);
                    const valueSpan = document.getElementById(`${skill}-value-${index}`);
                    if (valueSpan) {
                        valueSpan.textContent = e.target.value;
                    }
                });
            }
        });

        // Personality tags listeners
        CONSTANTS.PERSONALITY_TAGS.forEach(tag => {
            const tagCheckbox = document.getElementById(`personality-${index}-${tag}`);
            if (tagCheckbox) {
                tagCheckbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        // Check for conflicts
                        const conflictingTag = CONSTANTS.CONFLICTING_TRAITS.find(pair => 
                            (pair[0] === tag && character.personality.tags.includes(pair[1])) ||
                            (pair[1] === tag && character.personality.tags.includes(pair[0]))
                        );
                        
                        if (conflictingTag) {
                            e.target.checked = false;
                            alert(`Cannot select "${tag}" because it conflicts with another selected trait.`);
                            return;
                        }
                        
                        character.personality.tags.push(tag);
                    } else {
                        const tagIndex = character.personality.tags.indexOf(tag);
                        if (tagIndex > -1) {
                            character.personality.tags.splice(tagIndex, 1);
                        }
                    }
                });
            }
        });

        // Inventory listeners
        CONSTANTS.INVENTORY_OPTIONS.forEach(item => {
            const itemCheckbox = document.getElementById(`inventory-${index}-${item}`);
            if (itemCheckbox) {
                itemCheckbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        if (character.inventory.length < 3) {
                            character.inventory.push(item);
                        } else {
                            e.target.checked = false;
                            alert('Maximum 3 inventory items allowed.');
                        }
                    } else {
                        const itemIndex = character.inventory.indexOf(item);
                        if (itemIndex > -1) {
                            character.inventory.splice(itemIndex, 1);
                        }
                    }
                });
            }
        });

        // Desk items listeners
        CONSTANTS.DESK_ITEM_OPTIONS.forEach(item => {
            const itemCheckbox = document.getElementById(`desk-item-${index}-${item}`);
            if (itemCheckbox) {
                itemCheckbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        if (character.deskItems.length < 2) {
                            character.deskItems.push(item);
                        } else {
                            e.target.checked = false;
                            alert('Maximum 2 desk items allowed.');
                        }
                    } else {
                        const itemIndex = character.deskItems.indexOf(item);
                        if (itemIndex > -1) {
                            character.deskItems.splice(itemIndex, 1);
                        }
                    }
                });
            }
        });

        // API key listener
        const apiKeyInput = document.getElementById(`apiKey-${index}`);
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                character.apiKey = e.target.value;
            });
        }
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
            
            const startBtn = document.getElementById('start-simulation-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    this.startSimulation();
                });
            }
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
                cleanPath = './' + cleanPath;
            }
            
            portraitImg.src = cleanPath;
            portraitImg.alt = `Character ${index + 1} Portrait`;
            
            // Handle image load errors
            portraitImg.onerror = () => {
                console.warn(`⚠️ Failed to load sprite: ${cleanPath}`);
                portraitImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjZjVmNWY1Ii8+CjxjaXJjbGUgY3g9IjQ4IiBjeT0iMzYiIHI9IjE2IiBmaWxsPSIjY2NjIi8+CjxwYXRoIGQ9Ik0yNCA3MmMyNC0yNCA0OC0yNCA3MiAwIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iNCIvPgo8L3N2Zz4K';
            };
        }
    }

    /**
     * Update sprite info display
     */
    updateSpriteInfo(index) {
        const spriteInfo = document.getElementById(`sprite-info-${index}`);
        if (spriteInfo) {
            const spriteIndex = this.core.characters[index].spriteIndex || 0;
            spriteInfo.textContent = `Sprite ${spriteIndex + 1} of ${CONSTANTS.SPRITE_OPTIONS.length}`;
        }
    }

    /**
     * Update character tab text
     */
    updateCharacterTab(index) {
        const tab = document.getElementById(`character-tab-${index}`);
        if (tab) {
            const character = this.core.characters[index];
            tab.textContent = character.name || `Character ${index + 1}`;
            
            if (character.isPlayer) {
                tab.classList.add('player-character');
                tab.textContent += ' 👑';
            } else {
                tab.classList.remove('player-character');
            }
        }
    }

    /**
     * Refresh the entire UI
     */
    refreshUI() {
        // Update tabs
        this.createAllCharacterTabs();
        
        // Update panels
        this.createAllCharacterPanels();
        
        // Switch to current character
        this.switchToCharacterPanel(this.core.currentCharacterIndex);
    }

    /**
     * Switch to a specific character panel
     */
    switchToCharacterPanel(index) {
        // Hide all panels
        this.core.characters.forEach((_, i) => {
            const panel = document.getElementById(`character-panel-${i}`);
            if (panel) {
                panel.classList.add('hidden');
            }
        });
        
        // Show current panel
        const currentPanel = document.getElementById(`character-panel-${index}`);
        if (currentPanel) {
            currentPanel.classList.remove('hidden');
        }
        
        // Update tab states
        this.core.characters.forEach((_, i) => {
            const tab = document.getElementById(`character-tab-${i}`);
            if (tab) {
                if (i === index) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            }
        });
    }

    /**
     * Start the simulation
     */
    startSimulation() {
        const gameState = this.core.getGameState();
        
        if (!gameState) {
            alert('Please fix the validation errors before starting the simulation.');
            return;
        }
        
        console.log('🚀 Starting simulation with game state:', gameState);
        
        // Hide character creator
        const modal = document.getElementById('character-creator-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Show game world
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
        
        // Initialize the main game with the character data
        if (window.initializeGame) {
            window.initializeGame(gameState);
        } else {
            console.error('❌ Game initialization function not found');
        }
    }
}
