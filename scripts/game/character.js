class OfficeCharacter {
  static STATES = {
    IDLE: 'idle',
    WALKING: 'walking',
    WORKING: 'working',
    TALKING: 'talking',
    EATING: 'eating',
    STRESSED: 'stressed'
  };

  constructor(data) {
    this.id = data.id;
    this.name = data.name || `Character_${this.id}`;
    this.job = data.job || 'Employee';
    this.isPlayer = data.isPlayer || false;
    this.position = data.position || { x: 0.5, y: 0.5 };
    this.targetPosition = null;
    this.state = OfficeCharacter.STATES.IDLE;
    this.mood = 'neutral';
    this.taskProgress = 0;
    this.currentTask = null;
    this.tasksCompleted = 0;
    this.enabled = true;
    this.needs = {
      energy: 1.0,
      hunger: 0.2,
      stress: 0.1
    };
    this.appearance = data.appearance || {
      skinColor: '#f5d5b0',
      hairColor: '#3a2a1a',
      shirtColor: '#2a5ca7',
      pantsColor: '#1a1a1a'
    };
    this.personality = data.personality || [];
    this.apiKey = data.apiKey || '';
    this.lastPromptTime = 0;
    this.promptCount = 0;
  }

  updatePosition() {
    if (!this.targetPosition || !this.enabled) return;

    const speed = 0.005;
    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.01) {
      this.position = { 
        x: Math.max(0, Math.min(1, this.targetPosition.x)),
        y: Math.max(0, Math.min(1, this.targetPosition.y))
      };
      this.targetPosition = null;
      this.state = OfficeCharacter.STATES.IDLE;
    } else {
      this.position.x = Math.max(0, Math.min(1, this.position.x + (dx / distance) * speed));
      this.position.y = Math.max(0, Math.min(1, this.position.y + (dy / distance) * speed));
      this.state = OfficeCharacter.STATES.WALKING;
      this.needs.energy = Math.max(0, this.needs.energy - 0.001);
    }
  }

  updateNeeds() {
    // Energy recovers when idle
    if (this.state === OfficeCharacter.STATES.IDLE) {
      this.needs.energy = Math.min(1.0, Math.max(0, this.needs.energy + 0.002));
    }

    // Hunger increases over time
    this.needs.hunger = Math.min(1.0, Math.max(0, this.needs.hunger + 0.001));

    // Stress management
    if (this.state === OfficeCharacter.STATES.WORKING) {
      this.needs.stress = Math.min(1.0, Math.max(0, this.needs.stress + 0.003));
    } else {
      this.needs.stress = Math.min(1.0, Math.max(0, this.needs.stress - 0.001));
    }

    // Update mood based on needs
    this.updateMood();
  }

  updateMood() {
    const prevMood = this.mood;
    
    if (this.needs.stress > 0.8) {
      this.mood = 'stressed';
    } else if (this.needs.hunger > 0.7) {
      this.mood = 'hungry';
    } else if (this.needs.energy < 0.3) {
      this.mood = 'tired';
    } else {
      this.mood = 'neutral';
    }

    // Only change mood if significantly different
    if (prevMood !== this.mood) {
      const moodChanges = {
        'stressed': ['neutral', 'tired'],
        'hungry': ['neutral'],
        'tired': ['neutral', 'stressed'],
        'neutral': ['stressed', 'hungry', 'tired']
      };
      
      if (!moodChanges[prevMood]?.includes(this.mood)) {
        this.mood = prevMood;
      }
    }
  }

  canAcceptPrompt() {
    return !this.isPlayer && 
           this.enabled && 
           Date.now() - this.lastPromptTime > 10000; // 10s cooldown
  }

  setTask(task) {
    this.currentTask = task;
    this.taskProgress = 0;
    this.state = OfficeCharacter.STATES.WORKING;
  }

  completeTask() {
    this.tasksCompleted++;
    this.currentTask = null;
    this.taskProgress = 0;
    this.state = OfficeCharacter.STATES.IDLE;
  }
}

export default OfficeCharacter;
