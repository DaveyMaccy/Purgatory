/**
 * UI Generator Module - PHASE 4 FINAL
 * 
 * Generates the exact same UI layout as the monolithic version.
 * This includes the enhanced two-column layout, all interactive elements,
 * and pixel-perfect styling to match the original implementation.
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
     * Create a character tab - matches monolithic exactly
     */
    static createCharacterTab(index, character, container) {
        const tab = document.createElement('button');
        tab.textContent = `Character ${index + 1}`;
        tab.className = index === 0 ? 'active' : '';
        tab.onclick = () => window.switchTab(index);
        
        if (container) {
            container.appendChild(tab);
        }
        
        return tab;
    }
    
    /**
     * Update tab name when character name changes
     */
    static updateTabName(index, name) {
        const tab = document.querySelector(`#character-tabs button:nth-child(${index + 1})`);
        if (tab && name) {
            // Show first name only for tab
            const firstName = name.split(' ')[0];
            tab.textContent = firstName || `Character ${index + 1}`;
        }
    }
    
    /**
     * Create a character panel - matches monolithic exactly
     */
    static createCharacterPanel(index, character, container, officeType) {
        const panel = document.createElement('div');
        panel.id = `character-panel-${index}`;
        panel.className = `creator-panel ${index === 0 ? '' : 'hidden'}`;
        
        panel.innerHTML = this.generateEnhancedPanelHTML(index, character, officeType);
        
        if (container) {
            container.appendChild(panel);
        }
        
        // Setup event listeners for this panel
        EventHandlers.setupPanelEventListeners(index, window.characters, '');
        
        // Initialize sprite and portrait - pass characters array
        SpriteManager.updateCharacterPortrait(index, character.spriteSheet);
        if (window.characters) {
            SpriteManager.updateSpriteInfo(index, window.characters);
        }
        
        return panel;
    }
    
    /**
     * Generate complete enhanced panel HTML - EXACT MATCH to monolithic version
     */
    static generateEnhancedPanelHTML(index, charData, officeType) {
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
                        <label for="name-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Character Name</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input type="text" id="name-${index}" value="${charData.name}" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                            <button type="button" id="generate-name-${index}" style="padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Generate</button>
                        </div>
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
                            <input type="checkbox" id="isPlayer-${index}" ${charData.isPlayer ? 'checked' : ''}>
                            <span style="font-weight: bold;">Player Character</span>
                        </label>
                    </div>
                    
                    <!-- Physical Attributes -->
                    <div class="form-group">
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Physical Attributes</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label>Age: <span id="age-val-${index}">${charData.physicalAttributes.age}</span></label>
                                <input type="range" id="age-${index}" min="22" max="65" value="${charData.physicalAttributes.age}" style="width: 100%;">
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
                        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Personality (Max 6)</h3>
                        <div style="max-height: 120px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                            ${tagOptions}
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <!-- Inventory -->
                        <div class="form-group">
                            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Inventory (Max 3)</h3>
                            <div style="max-height: 100px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                                ${inventoryOptions}
                            </div>
                        </div>
                        
                        <!-- Desk Items -->
                        <div class="form-group">
                            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Desk Items (Max 2)</h3>
                            <div style="max-height: 100px; overflow-y: auto; border: 1px solid #ccc; padding: 8px; font-size: 14px;">
                                ${deskItemOptions}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Portraits and Settings -->
                <div class="w-80" style="width: 320px;">
                    <div class="space-y-4">
                        <!-- Character Portrait with Sprite Navigation -->
                        <div class="form-group">
                            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Character Portrait</h3>
                            <div style="text-align: center;">
                                <!-- Sprite Navigation Arrows -->
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <button type="button" id="sprite-prev-${index}" style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">◀ Prev</button>
                                    <span id="sprite-info-${index}" style="font-size: 12px; color: #6c757d;">Sprite 1 of ${SPRITE_OPTIONS.length}</span>
                                    <button type="button" id="sprite-next-${index}" style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Next ▶</button>
                                </div>
                                
                                <!-- Centered portrait canvas -->
                                <div style="display: flex; justify-content: center;">
                                    <canvas id="preview-canvas-${index}" width="96" height="96" style="border: 2px solid #ccc; border-radius: 8px; background: #f0f0f0;"></canvas>
                                </div>
                            </div>
                        </div>

                        <!-- Custom Portrait Upload -->
                        <div class="form-group">
                            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Custom Portrait</h3>
                            <div style="text-align: center;">
                                <!-- Centered custom canvas -->
                                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                                    <canvas id="custom-canvas-${index}" width="96" height="96" style="border: 2px solid #ccc; border-radius: 8px; background: #f8f9fa;"></canvas>
                                </div>
                                <input type="file" id="portrait-upload-${index}" accept="image/*" style="width: 100%; padding: 4px; font-size: 12px; margin-bottom: 5px;">
                                <button type="button" id="clear-custom-${index}" style="padding: 4px 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Clear Custom</button>
                            </div>
                        </div>

                        <!-- API Key Override -->
                        <div class="form-group">
                            <label for="api-key-input-${index}" style="display: block; margin-bottom: 5px; font-weight: bold;">Individual API Key</label>
                            <input type="text" id="api-key-input-${index}" value="${charData.apiKey}" placeholder="Override global key..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; font-family: monospace;">
                            <div style="font-size: 11px; color: #6c757d; margin-top: 2px;">Leave empty to use global key</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate complete panel HTML - legacy support for existing code
     */
    static generatePanelHTML(index, charData, officeType) {
        return this.generateEnhancedPanelHTML(index, charData, officeType);
    }
}

export { UIGenerator };

console.log('📦 UI Generator Module loaded - PHASE 4 FINAL');
