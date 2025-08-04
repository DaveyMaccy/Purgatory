class PromptTracker {
  constructor() {
    this.prompts = [];
    this.maxEntries = 10000;
  }
  
  init() {
    // Load from localStorage if available
    const savedData = localStorage.getItem('promptTrackerData');
    if (savedData) {
      try {
        this.prompts = JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse prompt data', e);
      }
    }
  }
  
  track(entry) {
    this.prompts.push(entry);
    
    // Limit the number of entries
    if (this.prompts.length > this.maxEntries) {
      this.prompts.shift();
    }
    
    // Save to localStorage
    localStorage.setItem('promptTrackerData', JSON.stringify(this.prompts));
  }
  
  getCount() {
    return this.prompts.length;
  }
  
  exportPromptData() {
    const dataStr = JSON.stringify(this.prompts, null, 2);
    this.downloadFile(dataStr, 'prompt-data.json');
  }
  
  exportFullDataset() {
    const fullData = {
      metadata: {
        exportDate: new Date().toISOString(),
        gameVersion: '1.0',
        characterCount: gameState.characters.length,
        promptCount: this.prompts.length
      },
      gameConfig: {
        officeType: gameState.officeType,
        promptCap: gameState.promptCap,
        apiProvider: gameState.apiProvider
      },
      characters: gameState.characters.map(char => ({
        id: char.id,
        name: char.name,
        job: char.job,
        personality: char.personality
      })),
      prompts: this.prompts
    };
    
    const dataStr = JSON.stringify(fullData, null, 2);
    this.downloadFile(dataStr, 'office-sim-dataset.json');
  }
  
  downloadFile(data, filename) {
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

export default PromptTracker;
