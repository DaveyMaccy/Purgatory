class AISystem {
  static ACTION_MAP = {
    'move': 'handleMoveAction',
    'work': 'handleWorkAction',
    'talk': 'handleTalkAction',
    'eat': 'handleEatAction',
    'rest': 'handleRestAction'
  };

  constructor() {
    this.promptTemplate = `
      You are {characterName}, a {jobRole} in an office simulation.
      Current mood: {mood}
      Needs: {needs}
      Personality traits: {personality}
      
      Available actions:
      - move(x,y): Navigate to coordinates
      - work(task): Perform job-related task
      - talk(character,message): Communicate with others
      - eat(): Satisfy hunger
      - rest(): Recover energy
      
      Current situation: {situation}
      
      Respond with JSON: {"action":"action_name","params":{},"reason":"your rationale"}
    `;
  }

  generatePrompt(character, gameState) {
    const situation = this.getSituationDescription(character, gameState);
    
    return this.promptTemplate
      .replace('{characterName}', character.name)
      .replace('{jobRole}', character.job)
      .replace('{mood}', character.mood)
      .replace('{needs}', JSON.stringify(character.needs))
      .replace('{personality}', character.personality.join(', '))
      .replace('{situation}', situation);
  }

  getSituationDescription(character, gameState) {
    const nearbyChars = gameState.characters.filter(c => 
      c.id !== character.id &&
      this.getDistance(character.position, c.position) < 0.2
    );
    
    let desc = `Located at (${character.position.x.toFixed(2)}, ${character.position.y.toFixed(2)})`;
    
    if (nearbyChars.length > 0) {
      desc += `. Nearby: ${nearbyChars.map(c => c.name).join(', ')}`;
    }
    
    if (character.currentTask) {
      desc += `. Currently working on: ${character.currentTask}`;
    }
    
    return desc;
  }

  async processAIResponse(character, response) {
    try {
      const action = JSON.parse(response);
      
      if (!action || !action.action) {
        throw new Error('Invalid action format');
      }
      
      const handler = this.ACTION_MAP[action.action];
      if (!handler || !this[handler]) {
        throw new Error(`Unknown action: ${action.action}`);
      }
      
      await this[handler](character, action.params);
      return true;
    } catch (error) {
      console.error('AI processing error:', error);
      return false;
    }
  }

  handleMoveAction(character, params) {
    if (!params.x || !params.y) {
      throw new Error('Missing coordinates for move action');
    }
    
    character.targetPosition = {
      x: Math.max(0, Math.min(1, params.x)),
      y: Math.max(0, Math.min(1, params.y))
    };
    character.state = OfficeCharacter.STATES.WALKING;
  }

  handleWorkAction(character, params) {
    character.setTask(params.task || 'General work');
    character.taskProgress += 10;
    
    if (character.taskProgress >= 100) {
      character.completeTask();
    }
  }

  handleTalkAction(character, params) {
    if (!params.message || !params.character) {
      throw new Error('Missing parameters for talk action');
    }
    
    const targetChar = gameState.getCharacter(params.character);
    if (!targetChar) {
      throw new Error(`Character not found: ${params.character}`);
    }
    
    character.state = OfficeCharacter.STATES.TALKING;
    chatSystem.addMessage(character, `To ${targetChar.name}: ${params.message}`);
  }

  getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export default new AISystem();
