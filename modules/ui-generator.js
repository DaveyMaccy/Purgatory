/**
 * UI Generator Module
 * 
 * Handles all HTML generation for the character creator interface.
 * Creates tabs, panels, forms, and all visual elements.
 */

import { 
    JOB_ROLES_BY_OFFICE, 
    PHYSICAL_BUILDS, 
    GENDERS, 
    PERSONALITY_TAGS, 
    INVENTORY_OPTIONS, 
    DESK_ITEM_OPTIONS 
} from './character-data.js';
import { EventHandlers } from './event-handlers.js';
import { SpriteManager } from './sprite-manager.js';

class UIGenerator {
    /**
     * Create a character tab
     */
    static createCharacterTab(index, character, container) {
        const tab = document.createElement('div');
        tab.id = `character-tab-${index}`;
        tab.className = `character-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = `${character.firstName} ${character.lastName}`;
        tab.onclick = () => window.switchTab(index);
        
        if (container) {
            container.appendChild(tab);
        }
        
        return tab;
    }
    
    /**
     * Create a character panel
     */
    static createCharacterPanel(index, character, container, officeType) {
        const panel = document.createElement('div');
        panel.id = `character-panel-${index}`;
        panel.className = `creator-panel ${index === 0 ? '' : 'hidden'}`;
        
        panel.innerHTML = this.generatePanelHTML(index, character, officeType);
        
        if (container) {
            container.appendChild(panel);
        }
        
        // Setup event listeners for this panel
        EventHandlers.setupPanelEventListeners(index);
        
        // Initialize sprite and portrait
        SpriteManager.updateCharacterPortrait(index, character.spriteSheet);
        
        return panel;
    }
    
    /**
     * Generate complete panel HTML
     */
    static generatePanelHTML(index, charData, officeType) {
        const jobRoleOptions = JOB_ROLES_BY_OFFICE[officeType]
            .map(role => `<option value="${role}" ${role === charData.jobRole ? 'selected' : ''}>${role}</option>`)
            .join('');
            
        const buildOptions = PHYSICAL_BUILDS
            .map(build => `<option value="${build}" ${build === charData.physicalAttributes.build ? 'selected' : ''}>${build}</option>`)
            .join('');
            
        const genderOptions = GENDERS
            .map(gender => `<option value="${gender}" ${gender === charData.physicalAttributes.gender ? 'selected' : ''}>${gender}</option>`)
            .join('');
            
        const tagOptions = PERSONALITY_TAGS
            .map(tag => `<label class="checkbox-label" style="display: block; margin: 2px 0;">
                <input type="checkbox" id="tags-${index}-${tag}" value="${tag}" ${charData.personalityTags.includes(tag) ? 'checked' : ''}> 
                ${tag}
            </label>`)
            .join('');
            
        const inventoryOptions = INVENTORY_OPTIONS
            .map(item => `<label class="checkbox-label" style="display: block; margin: 2px 0;">
                <input type="checkbox" id="inventory-item-${index}-${item}" value="${item}" ${charData.inventory.includes(item) ? 'checked' : ''}> 
                ${item}
            </label>`)
            .join('');
            
        const deskItemOptions = DESK_ITEM_OPTIONS
            .map(item => `<label class="checkbox-label" style="display: block; margin: 2px 0;">
                <input type="checkbox" id="desk-item-${index}-${item}" value="${item}" ${charData.deskItems.includes(item) ? 'checked' : ''}> 
                ${item}
            </label>`)
            .join('');
        
        return `
            <div class="character-form">
                <!-- Player Character Badge -->
                ${charData.isPlayerCharacter ? '<div class="player-badge">👤 PLAYER CHARACTER</div>' : ''}
                
                <!-- Basic Information Section -->
                <div class="form-section">
                    <h3>Basic Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="first-name-${index}">First Name:</label>
                            <input type="text" id="first-name-${index}" value="${charData.firstName}" />
                        </div>
                        <div class="form-group">
                            <label for="last-name-${index}">Last Name:</label>
                            <input type="text" id="last-name-${index}" value="${charData.lastName}" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="age-${index}">Age: <span id="age-val-${index}">${charData.age}</span></label>
                            <input type="range" id="age-${index}" min="18" max="65" value="${charData.age}" />
                        </div>
                        <div class="form-group">
                            <label for="job-role-${index}">Job Role:</label>
                            <select id="job-role-${index}">
                                ${jobRoleOptions}
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Physical Attributes Section -->
                <div class="form-section">
                    <h3>Physical Attributes</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="gender-${index}">Gender:</label>
                            <select id="gender-${index}">
                                ${genderOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="build-${index}">Build:</label>
                            <select id="build-${index}">
                                ${buildOptions}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="height-${index}">Height: <span id="height-val-${index}">${charData.physicalAttributes.height} cm</span></label>
                            <input type="range" id="height-${index}" min="140" max="210" value="${charData.physicalAttributes.height}" />
                        </div>
                        <div class="form-group">
                            <label for="weight-${index}">Weight: <span id="weight-val-${index}">${charData.physicalAttributes.weight} kg</span></label>
                            <input type="range" id="weight-${index}" min="40" max="150" value="${charData.physicalAttributes.weight}" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="looks-${index}">Looks: <span id="looks-val-${index}">${charData.physicalAttributes.looks}/10</span></label>
                            <input type="range" id="looks-${index}" min="1" max="10" value="${charData.physicalAttributes.looks}" />
                        </div>
                    </div>
                </div>
                
                <!-- Skills Section -->
                <div class="form-section">
                    <h3>Skills & Abilities</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="competence-${index}">Competence: <span id="competence-val-${index}">${charData.skills.competence}/10</span></label>
                            <input type="range" id="competence-${index}" min="1" max="10" value="${charData.skills.competence}" />
                        </div>
                        <div class="form-group">
                            <label for="laziness-${index}">Laziness: <span id="laziness-val-${index}">${charData.skills.laziness}/10</span></label>
                            <input type="range" id="laziness-${index}" min="1" max="10" value="${charData.skills.laziness}" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="charisma-${index}">Charisma: <span id="charisma-val-${index}">${charData.skills.charisma}/10</span></label>
                            <input type="range" id="charisma-${index}" min="1" max="10" value="${charData.skills.charisma}" />
                        </div>
                        <div class="form-group">
                            <label for="leadership-${index}">Leadership: <span id="leadership-val-${index}">${charData.skills.leadership}/10</span></label>
                            <input type="range" id="leadership-${index}" min="1" max="10" value="${charData.skills.leadership}" />
                        </div>
                    </div>
                </div>
                
                <!-- Appearance Section -->
                <div class="form-section">
                    <h3>Appearance</h3>
                    <div class="sprite-selector">
                        <div class="sprite-navigation">
                            <button type="button" id="sprite-prev-${index}" class="sprite-nav-btn">◀</button>
                            <div class="sprite-preview">
                                <canvas id="preview-canvas-${index}" width="96" height="128"></canvas>
                                <div id="sprite-info-${index}" class="sprite-info">Character ${index + 1}</div>
                            </div>
                            <button type="button" id="sprite-next-${index}" class="sprite-nav-btn">▶</button>
                        </div>
                        
                        <!-- Custom Portrait Upload -->
                        <div class="portrait-upload">
                            <label for="portrait-upload-${index}">Custom Portrait:</label>
                            <input type="file" id="portrait-upload-${index}" accept="image/*" />
                            <button type="button" id="clear-custom-${index}" class="clear-btn">Clear Custom</button>
                        </div>
                    </div>
                </div>
                
                <!-- Personality Section -->
                <div class="form-section">
                    <h3>Personality Tags (Select 2-5)</h3>
                    <div class="checkbox-grid" style="max-height: 200px; overflow-y: auto;">
                        ${tagOptions}
                    </div>
                </div>
                
                <!-- Inventory Section -->
                <div class="form-section">
                    <h3>Inventory Items (Select 3-6)</h3>
                    <div class="checkbox-grid" style="max-height: 150px; overflow-y: auto;">
                        ${inventoryOptions}
                    </div>
                </div>
                
                <!-- Desk Items Section -->
                <div class="form-section">
                    <h3>Desk Items (Select 3-6)</h3>
                    <div class="checkbox-grid" style="max-height: 150px; overflow-y: auto;">
                        ${deskItemOptions}
                    </div>
                </div>
                
                <!-- Bio Section -->
                <div class="form-section">
                    <h3>Biography</h3>
                    <textarea id="bio-${index}" placeholder="Character background and personality..." rows="4" style="width: 100%;">${charData.bio}</textarea>
                </div>
                
                <!-- API Configuration Section -->
                <div class="form-section">
                    <h3>AI Configuration</h3>
                    <div class="form-group">
                        <label for="api-key-${index}">API Key (leave empty to use global):</label>
                        <input type="password" id="api-key-${index}" value="${charData.apiKey}" placeholder="Individual API key override" />
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="form-section">
                    <div class="action-buttons">
                        <button type="button" onclick="randomizeCurrentCharacter()" class="randomize-btn">🎲 Randomize All</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Update a character tab's display name
     */
    static updateTabName(index, firstName, lastName) {
        const tab = document.getElementById(`character-tab-${index}`);
        if (tab) {
            tab.textContent = `${firstName} ${lastName}`;
        }
    }
    
    /**
     * Create character management controls HTML
     */
    static generateManagementControlsHTML() {
        return `
            <div class="character-management">
                <button id="add-character-btn" type="button" class="management-btn">➕ Add Character</button>
                <button id="remove-character-btn" type="button" class="management-btn">➖ Remove Character</button>
                <span class="character-count">Characters: <span id="character-count-display">3</span>/5</span>
            </div>
        `;
    }
    
    /**
     * Update character count display
     */
    static updateCharacterCount(count) {
        const display = document.getElementById('character-count-display');
        if (display) {
            display.textContent = count;
        }
    }
    
    /**
     * Create global settings HTML
     */
    static generateGlobalSettingsHTML() {
        return `
            <div class="global-settings">
                <div class="form-section">
                    <h3>Global Settings</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="office-type-select">Office Type:</label>
                            <select id="office-type-select">
                                <option value="Tech Startup">Tech Startup</option>
                                <option value="Law Firm">Law Firm</option>
                                <option value="Medical Practice">Medical Practice</option>
                                <option value="Accounting Firm">Accounting Firm</option>
                                <option value="Marketing Agency">Marketing Agency</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="global-api-key">Global API Key:</label>
                            <input type="password" id="global-api-key" placeholder="Default API key for all characters" />
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Show/hide loading state
     */
    static setLoadingState(isLoading, message = 'Loading...') {
        const existingLoader = document.getElementById('character-creator-loader');
        
        if (isLoading) {
            if (!existingLoader) {
                const loader = document.createElement('div');
                loader.id = 'character-creator-loader';
                loader.className = 'loading-overlay';
                loader.innerHTML = `
                    <div class="loading-content">
                        <div class="spinner"></div>
                        <div class="loading-message">${message}</div>
                    </div>
                `;
                document.body.appendChild(loader);
            }
        } else {
            if (existingLoader) {
                existingLoader.remove();
            }
        }
    }
    
    /**
     * Show error message
     */
    static showError(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, duration);
    }
    
    /**
     * Show success message
     */
    static showSuccess(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #44aa44;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, duration);
    }
}

export { UIGenerator };

console.log('🎨 UI Generator Module loaded');
