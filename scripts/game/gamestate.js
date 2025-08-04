class GameState {
  static OFFICE_TYPES = {};
  static JOB_ROLES = [
    "Receptionist", "Personal Assistant", "Boss", "HR Director",
    "Senior Coder", "Junior Coder", "Manager", "Admin Assistant",
    "Clerk", "Accountant", "Marketing Specialist", "Sales Executive",
    "IT Support", "Project Manager", "Designer", "Quality Assurance",
    "Game Programmer", "Junior Programmer", "Head Developer", 
    "Creative Director", "Play Tester", "Game Designer",
    "Level Designer", "UI/UX Designer", "Sound Designer",
    "Narrative Designer", "Technical Artist", "Producer"
  ];
  
  static PERSONALITY_TAGS = [
    "Analytical", "Creative", "Detail-oriented", "Energetic",
    "Introverted", "Extroverted", "Optimistic", "Pessimistic",
    "Organized", "Spontaneous", "Patient", "Impulsive",
    "Diplomatic", "Blunt", "Competitive", "Cooperative",
    "Ambitious", "Content", "Curious", "Traditional",
    "Humorless", "Witty", "Serious", "Playful",
    "Empathetic", "Logical", "Artistic", "Technical",
    "Perfectionist", "Flexible", "Punctual", "Relaxed",
    "Assertive", "Reserved", "Charismatic", "Awkward",
    "Cynical", "Idealistic", "Skeptical", "Trusting",
    "Adventurous", "Cautious", "Confident", "Insecure",
    "Generous", "Selfish", "Humble", "Arrogant",
    "Flirty", "Party animal", "Strong", "Drunkard",
    "Coding", "Debugging", "Designing", "Testing",
    "Brainstorming", "Prototyping", "Iterating", "Polishing",
    "Documenting", "Presenting", "Collaborating", "Crunching"
  ];
  
  static API_PROVIDERS = {
    "Gemma 3 27b": "gemma-3-27b",
    "GPT4": "gpt-4",
    "DeepSeek": "deepseek-chat",
    "Gemini 1.5 (Fast)": "gemini-1.5-flash-latest"
  };
  
  constructor() {
    this.officeType = "startup";
    this.characters = [];
    this.playerCharacterId = null;
    this.apiEnabled = true;
    this.debugMode = false;
    this.worldState = {
      time: 0,
      objects: [],
      characterPositions: {}
    };
    this.lastSave = null;
  }
  
  getPlayerCharacter() {
    return this.characters.find(c => c.id === this.playerCharacterId);
  }
  
  getCharacter(id) {
    return this.characters.find(c => c.id === id);
  }
  
  addCharacter(character) {
    this.characters.push(character);
    if (character.isPlayer) {
      this.playerCharacterId = character.id;
    }
  }
  
  removeCharacter(id) {
    this.characters = this.characters.filter(c => c.id !== id);
    if (this.playerCharacterId === id) {
      this.playerCharacterId = null;
    }
  }
  
  toggleApi() {
    this.apiEnabled = !this.apiEnabled;
    return this.apiEnabled;
  }
  
  toggleDebug() {
    this.debugMode = !this.debugMode;
    return this.debugMode;
  }
}

// Initialize after loading office types
fetch('assets/office-types.json')
  .then(response => response.json())
  .then(data => {
    // Add game studio layout
    data['game-studio'] = {
      name: "Game Development Studio",
      layout: [
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
        ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'D', 'D', 'F', 'F', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'D', 'D', 'F', 'F', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
        ['W', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'W'],
        ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
      ],
      description: "A creative space for game development teams",
      departments: {
        "Programming": ["Game Programmer", "Junior Programmer", "Head Developer"],
        "Design": ["Game Designer", "Level Designer", "UI/UX Designer"],
        "Art": ["Technical Artist"],
        "Production": ["Producer"],
        "Testing": ["Play Tester"]
      }
    };
    GameState.OFFICE_TYPES = data;
  });

export default GameState;
