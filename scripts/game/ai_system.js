export default class AISystem {
  constructor(gameState, chatSystem) {
    this.gameState = gameState;
    this.chatSystem = chatSystem;
    this.ACTION_MAP = {
      'move': this.handleMoveAction.bind(this),
      'work': this.handleWorkAction.bind(this),
      'talk': this.handleTalkAction.bind(this),
      'eat': this.handleEatAction.bind(this),
      'rest': this.handleRestAction.bind(this)
    };

    this.promptTemplate = `
      You are {characterName}, a {jobRole} in an office simulation.
      Current mood: {mood}
      Needs: {needs}
      Personality traits: {personality}

      Available actions:
      - move(x,y): Navigate to coordinates
      - work(task): Perform job-related task
      - talk(characterId,message): Communicate with others
      - eat(): Satisfy hunger
      - rest(): Recover energy

      Current situation: {situation}

      Respond with JSON: {"action":"action_name","params":{},"reason":"your rationale"}
    `;
  }

  generatePrompt(character) {
    const situation = this.getSituationDescription(character);
    return this.promptTemplate
      .replace('{characterName}', character.name)
      .replace('{jobRole}', character.job)
      .replace('{mood}', character.mood)
      .replace('{needs}', JSON.stringify(character.needs))
      .replace('{personality}', character.personality.join(', '))
      .replace('{situation}', situation);
  }

  getSituationDescription(character) {
    const nearbyChars = this.gameState.characters.filter(c =>
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
      if (!handler) {
        throw new Error(`Unknown action: ${action.action}`);
      }

      await handler(character, action.params);
      return true;
    } catch (error) {
      console.error('AI processing error:', error);
      return false;
    }
  }

  handleMoveAction(character, params) {
    if (params.x === undefined || params.y === undefined) {
      throw new Error('Missing coordinates for move action');
    }
    character.targetPosition = {
      x: Math.max(0, Math.min(1, params.x)),
      y: Math.max(0, Math.min(1, params.y))
    };
    character.state = 'walking';
  }

  handleWorkAction(character, params) {
    character.setTask(params.task || 'General work');
    character.taskProgress += 10;
    if (character.taskProgress >= 100) {
      character.completeTask();
    }
  }

  handleTalkAction(character, params) {
    if (!params.message || !params.characterId) {
      throw new Error('Missing parameters for talk action');
    }

    const targetChar = this.gameState.getCharacter(params.characterId);
    if (!targetChar) {
      throw new Error(`Character not found: ${params.characterId}`);
    }

    character.state = 'talking';
    this.chatSystem.addMessage(character, `To ${targetChar.name}: ${params.message}`);
  }
  
  handleEatAction(character, params) {
    character.needs.hunger = Math.max(0, character.needs.hunger - 0.5);
    character.state = 'eating';
  }

  handleRestAction(character, params) {
    character.needs.energy = Math.min(1.0, character.needs.energy + 0.3);
    character.state = 'idle';
  }

  getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
