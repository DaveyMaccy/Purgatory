/**
 * UI Generator Module - WORKING VERSION
 * 
 * FIXED: Correct import paths and uses original data structure
 */

import { 
    JOB_ROLES_BY_OFFICE, 
    PHYSICAL_BUILDS, 
    GENDERS, 
    PERSONALITY_TAGS, 
    INVENTORY_OPTIONS, 
    DESK_ITEM_OPTIONS,
    SPRITE_OPTIONS
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
            <div class="flex gap-6 h-full">
                <!-- Left Column: Form Fields -->
                <div class="flex-1 space-y-4 overflow-y-auto" style="max-height: 500px; padding-right: 10px;">
                    <!-- Basic Info -->
                    <div class="form-group">
                        <label for="first-name-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">First Name</label>
                        <input type="text" id="first-name-${index}" value="${charData.firstName}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    
                    <div class="form-group">
                        <label for="last-name-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Last Name</label>
                        <input type="text" id="last-name-${index}" value="${charData.lastName}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group">
                            <label for="jobRole-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Job Role</label>
                            <select id="jobRole-${index}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">${jobRoleOptions}</select>
                        </div>
                        
                        <div class="form-group">
                            <label for="gender-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Gender</label>
                            <select id="gender-${index}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">${genderOptions}</select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="isPlayer-${index}" ${charData.isPlayerCharacter ? 'checked' : ''}>
                            <span style="font-weight: bold;">Player Character</span>
                        </label>
                    </div>
                    
                    <!-- Physical Attributes -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Physical Attributes</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label>Age: <span id="age-val-${index}">${charData.age}</span></label>
                                <input type="range" id="age-${index}" min="22" max="65" value="${charData.age}" style="width: 100%;">
                            </div>
                            <div>
                                <label>Height: <span id="height-val-${index}">${charData.physicalAttributes.height} cm</span></label>
                                <input type="range" id="height-${index}" min="150" max="200" value="${charData.physicalAttributes.height}" style="width: 100%;">
                            </div>
                            <div>
                                <label>Weight: <span id="weight-val-${index}">${charData.physicalAttributes.weight} kg</span></label>
                                <input type="range" id="weight-${index}" min="45" max="120" value="${charData.physicalAttributes.weight}" style="width: 100%;">
                            </div>
                            <div>
                                <label>Looks: <span id="looks-val-${index}">${charData.physicalAttributes.looks}/10</span></label>
                                <input type="range" id="looks-${index}" min="1" max="10" value="${charData.physicalAttributes.looks}" style="width: 100%;">
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <label for="build-${index}" style="display: block; margin-bottom: 5px;">Build</label>
                            <select id="build-${index}" style="width: 100%; padding: 4px;">${buildOptions}</select>
                        </div>
                    </div>

                    <!-- Skills -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Skills</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label>Competence: <span id="competence-val-${index}">${charData.skills.competence}/10</span></label>
                                <input type="range" id="competence-${index}" min="1" max="10" value="${charData.skills.competence}" style="width: 100%;">
                            </div>
                            <div>
                                <label>Laziness: <span id="laziness-val-${index}">${charData.skills.laziness}/10</span></label>
                                <input type="range" id="laziness-${index}" min="1" max="10" value="${charData.skills.laziness}" style="width: 100%;">
                            </div>
                            <div>
                                <label>Charisma: <span id="charisma-val-${index}">${charData.skills.charisma}/10</span></label>
                                <input type="range" id="charisma-${index}" min="1" max="10" value="${charData.skills.charisma}" style="width: 100%;">
                            </div>
                            <div>
                                <label>Leadership: <span id="leadership-val-${index}">${charData.skills.leadership}/10</span></label>
                                <input type="range" id="leadership-${index}" min="1" max="10" value="${charData.skills.leadership}" style="width: 100%;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Personality Tags -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Personality</h3>
                        <div style="max-height: 120px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                            ${tagOptions}
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <!-- Inventory -->
                        <div class="form-group">
                            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Inventory</h3>
                            <div style="max-height: 100px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                                ${inventoryOptions}
                            </div>
                        </div>
                        
                        <!-- Desk Items -->
                        <div class="form-group">
                            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Desk Items</h3>
                            <div style="max-height: 100px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                                ${deskItemOptions}
                            </div>
                        </div>
                    </div>
                    
                    <!-- API Key -->
                    <div class="form-group">
                        <label for="api-key-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">API Key</label>
                        <input type="text" id="api-key-${index}" value="${charData.apiKey}" placeholder="Individual API key..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; font-family: monospace;">
                    </div>
                </div>

                <!-- Right Column: Portrait -->
                <div class="w-80" style="width: 320px;">
                    <div class="space-y-4">
                        <!-- Character Portrait -->
                        <div class="form-group">
                            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Character Portrait</h3>
                            <div style="text-align: center;">
                                <canvas id="preview-canvas-${index}" width="96" height="96" style="border: 2px solid #ccc; border-radius: 8px; background: #f0f0f0;"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Update tab name when character name changes
     */
    static updateTabName(index, firstName, lastName) {
        const tab = document.getElementById(`character-tab-${index}`);
        if (tab) {
            tab.textContent = `${firstName} ${lastName}`;
        }
    }
}

export { UIGenerator };

console.log('📦 UI Generator Module loaded - WORKING VERSION');
