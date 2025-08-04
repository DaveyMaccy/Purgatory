export default class SaveSystem {
  constructor(gameState, chatSystem, officeCharacter) {
    this.gameState = gameState;
    this.chatSystem = chatSystem;
    this.OfficeCharacter = officeCharacter;
  }

  exportSave() {
    try {
      const saveData = {
        timestamp: new Date().toISOString(),
        gameState: {
          officeType: this.gameState.officeType,
          characters: this.gameState.characters.map(c => ({
            id: c.id,
            name: c.name,
            job: c.job,
            isPlayer: c.isPlayer,
            position: c.position,
            state: c.state,
            mood: c.mood,
            needs: c.needs,
            appearance: c.appearance,
            personality: c.personality,
            apiKey: c.apiKey,
          })),
          playerCharacterId: this.gameState.playerCharacterId,
          apiEnabled: this.gameState.apiEnabled,
          debugMode: this.gameState.debugMode,
        }
      };
      const dataStr = JSON.stringify(saveData, null, 2);
      this.downloadFile(dataStr, `purgatory-save-${Date.now()}.json`);
      this.chatSystem.addSystemMessage('Game state exported successfully.');
    } catch (error) {
      console.error("Failed to export save:", error);
      this.chatSystem.addSystemMessage('Error exporting save file. See console for details.');
    }
  }

  importSave(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (!data.gameState || !data.gameState.characters) {
            throw new Error("Invalid save file format.");
          }

          // Restore game state
          const loadedGameState = data.gameState;
          this.gameState.officeType = loadedGameState.officeType;
          this.gameState.playerCharacterId = loadedGameState.playerCharacterId;
          this.gameState.apiEnabled = loadedGameState.apiEnabled;
          this.gameState.debugMode = loadedGameState.debugMode;

          // Re-create character instances
          this.gameState.characters = loadedGameState.characters.map(charData => {
            return new this.OfficeCharacter(charData);
          });

          this.chatSystem.addSystemMessage('Game state loaded successfully.');
          resolve();
        } catch (error) {
          console.error("Failed to parse or load save file:", error);
          this.chatSystem.addSystemMessage('Error loading save file. See console for details.');
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        this.chatSystem.addSystemMessage('Failed to read the save file.');
        reject(error);
      };
      reader.readAsText(file);
    });
  }

  downloadFile(data, filename) {
    const blob = new Blob([data], { type: 'application/json' });
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
