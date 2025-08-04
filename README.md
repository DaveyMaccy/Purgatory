# Office Purgatory Simulator

An AI-powered office simulation game where you can observe and interact with AI characters in various office environments.

## Game Features

- **Multiple Office Types**: Choose between traditional offices or game development studios
- **AI Characters**: Each character has unique personality traits and behaviors
- **Player Control**: Designate one character as the player character
- **Data Collection**: Track all AI prompts and responses for analysis

## Getting Started

1. **Launch the Game**:
   - Open `index.html` in a modern web browser
   - Click "New Simulation" to begin

2. **Character Creation**:
   - Create multiple characters
   - Designate one as your player character
   - Assign roles and personality traits
   - For NPCs, provide API keys if using real AI

3. **Game Controls**:
   - **Click** on the game canvas to move your character
   - Use the **chat box** for commands:
     - `/goto x y` - Move to coordinates
     - `/talk name message` - Talk to another character
     - `/work task` - Perform a work task
     - `/api` - Toggle AI processing
     - `/debug` - Toggle debug mode

4. **Game Studio Roles**:
   - Game Programmer
   - Junior Programmer  
   - Head Developer
   - Creative Director
   - Play Tester
   - Game Designer
   - Level Designer
   - UI/UX Designer
   - Sound Designer
   - Narrative Designer
   - Technical Artist
   - Producer

## Data Collection

The game tracks all AI prompts and responses. To export data:
1. Open the **Settings** menu
2. Click "Export Prompt Data" for just prompts
3. Click "Export Full Dataset" for complete game state

## Mobile Support

The game is responsive and works on mobile devices:
- Tap to move your character
- Virtual keyboard for chat input
- Optimized touch controls

## Troubleshooting

- If AI characters aren't responding, check:
  - API keys are valid
  - API is enabled in settings
  - Prompt cap hasn't been reached
- For graphical issues:
  - Try lowering graphics quality
  - Ensure browser supports WebGL
