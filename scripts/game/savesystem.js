class GraphicsRenderer {
  constructor() {
    this.officeMap = document.getElementById('office-map');
    this.characterElements = new Map();
  }

  initOfficeLayout(officeType) {
    this.officeMap.innerHTML = '';
    const layout = OfficeLayouts[officeType];
    
    layout.tiles.forEach((row, y) => {
      row.forEach((tileType, x) => {
        const tile = document.createElement('div');
        tile.className = `tile ${tileType}`;
        tile.dataset.x = x;
        tile.dataset.y = y;
        
        if (tileType !== 'floor') {
          tile.innerHTML = `<div class="object-label">${tileType.replace('-', ' ')}</div>`;
        }
        
        this.officeMap.appendChild(tile);
      });
    });
  }

  renderCharacter(character) {
    if (!this.characterElements.has(character.id)) {
      const charElement = this.createCharacterElement(character);
      this.characterElements.set(character.id, charElement);
      this.officeMap.appendChild(charElement);
    }

    this.updateCharacterElement(character);
  }

  createCharacterElement(character) {
    const element = document.createElement('div');
    element.className = 'character';
    element.id = `char-${character.id}`;
    
    element.innerHTML = `
      <div class="char-head" style="background-color: ${character.skinColor}"></div>
      <div class="char-torso" style="background-color: ${character.shirtColor}"></div>
      <div class="char-legs" style="background-color: ${character.pantsColor}"></div>
      <div class="char-name">${character.name}</div>
      <div class="char-status"></div>
    `;
    
    return element;
  }

  updateCharacterElement(character) {
    const element = document.getElementById(`char-${character.id}`);
    if (!element) return;
    
    // Position
    const tileSize = 64;
    element.style.left = `${character.position.x * tileSize}px`;
    element.style.top = `${character.position.y * tileSize}px`;
    
    // Mood indicator
    const status = element.querySelector('.char-status');
    status.className = `char-status ${character.mood}`;
    status.title = character.mood;
    
    // Task progress
    if (character.currentTask) {
      element.title = `${character.name}: ${character.currentTask} (${Math.round(character.taskProgress)}%)`;
    }
    
    // Walking animation
    if (character.state === 'WALKING') {
      element.classList.add('walking');
    } else {
      element.classList.remove('walking');
    }
  }
}

// Office layout configurations
const OfficeLayouts = {
  startup: {
    tiles: [
      ['wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'desk', 'floor', 'desk', 'wall'],
      ['wall', 'floor', 'coffee-machine', 'floor', 'wall'],
      ['wall', 'desk', 'floor', 'desk', 'wall'],
      ['wall', 'wall', 'door', 'wall', 'wall']
    ]
  },
  corporate: {
    tiles: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'desk', 'desk', 'desk', 'desk', 'wall'],
      ['wall', 'floor', 'water-cooler', 'floor', 'printer', 'wall'],
      ['wall', 'desk', 'desk', 'desk', 'desk', 'wall'],
      ['wall', 'wall', 'door', 'wall', 'wall', 'wall']
    ]
  },
  agency: {
    tiles: [
      ['wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'sofa', 'floor', 'tv', 'wall'],
      ['wall', 'floor', 'whiteboard', 'floor', 'wall'],
      ['wall', 'desk', 'floor', 'desk', 'wall'],
      ['wall', 'wall', 'door', 'wall', 'wall']
    ]
  }
};
