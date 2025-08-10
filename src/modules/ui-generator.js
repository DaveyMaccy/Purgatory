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
                            <input type="range" id="leadership-${index}" min="1" max="10" value="${charData.skills.leadership}"
