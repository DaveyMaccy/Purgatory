class PromptTracker {
  constructor() {
    this.prompts = [];
    this.maxEntries = 10000;
    this.sessionStart = Date.now();
    this.totalTokens = 0;
    this.promptsPerMinute = [];
    this.currentMinute = Math.floor(Date.now() / 60000);
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
    // Calculate token counts
    const promptTokens = entry.prompt ? entry.prompt.length / 4 : 0; // Approximate tokens
    const responseTokens = entry.response ? entry.response.length / 4 : 0;
    const totalTokens = promptTokens + responseTokens;
    
    // Update total tokens
    this.totalTokens += totalTokens;
    
    // Track per-minute stats
    const currentMinute = Math.floor(Date.now() / 60000);
    if (currentMinute !== this.currentMinute) {
      this.promptsPerMinute.push({
        minute: this.currentMinute,
        count: 0,
        tokens: 0
      });
      this.currentMinute = currentMinute;
    }
    
    // Update current minute stats
    if (this.promptsPerMinute.length > 0) {
      const current = this.promptsPerMinute[this.promptsPerMinute.length - 1];
      current.count++;
      current.tokens += totalTokens;
    }
    
    // Add token data to entry
    const trackedEntry = {
      ...entry,
      tokens: {
        prompt: promptTokens,
        response: responseTokens,
        total: totalTokens
      }
    };
    
    this.prompts.push(trackedEntry);
    
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

  getTokenStats() {
    const sessionMinutes = (Date.now() - this.sessionStart) / 60000;
    const avgTokensPerPrompt = this.prompts.length > 0 
      ? this.totalTokens / this.prompts.length 
      : 0;
    const tokensPerMinute = sessionMinutes > 0
      ? this.totalTokens / sessionMinutes
      : 0;

    return {
      totalPrompts: this.prompts.length,
      totalTokens: this.totalTokens,
      avgTokensPerPrompt: Math.round(avgTokensPerPrompt),
      tokensPerMinute: Math.round(tokensPerMinute),
      promptsPerMinute: [...this.promptsPerMinute]
    };
  }
  
  exportPromptData() {
    const dataStr = JSON.stringify(this.prompts, null, 2);
    this.downloadFile(dataStr, 'prompt-data.json');
  }
  
  exportFullDataset() {
    const tokenStats = this.getTokenStats();
    const fullData = {
      metadata: {
        exportDate: new Date().toISOString(),
        gameVersion: '1.0',
        characterCount: gameState.characters.length,
        promptCount: this.prompts.length,
        totalTokens: tokenStats.totalTokens,
        avgTokensPerPrompt: tokenStats.avgTokensPerPrompt,
        tokensPerMinute: tokenStats.tokensPerMinute,
        sessionDurationMinutes: (Date.now() - this.sessionStart) / 60000
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
