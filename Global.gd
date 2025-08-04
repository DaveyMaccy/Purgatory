# Global.gd
# This is an Autoload singleton that stores all global data, constants,
# and core functions for the game.

extends Node

# --- Game State Management ---
var game_paused = false

# This dictionary stores the type of office and the tasks associated with it.
const OFFICE_TYPES = {
    "Startup": {
        "description": "A bustling, chaotic startup with open-plan desks and a high-energy environment.",
        "tasks": ["Develop MVP", "A/B test landing page", "Secure seed funding"]
    },
    "Corporate": {
        "description": "A traditional, slow-paced corporate environment with private offices and clear hierarchies.",
        "tasks": ["Process quarterly reports", "Schedule budget meetings", "Maintain client database"]
    },
    "Creative Agency": {
        "description": "A vibrant, collaborative agency where creativity is paramount and deadlines are tight.",
        "tasks": ["Design marketing campaign", "Brainstorm new brand identity", "Edit client video"]
    },
    "Government Office": {
        "description": "A quiet, bureaucratic office focused on strict protocols and methodical work.",
        "tasks": ["Audit tax records", "Process public permits", "Draft policy memo"]
    }
}

var current_office_type = ""
var tasks = {} # Stores tasks to be assigned to characters.

# --- Character Registry ---
var character_registry = {}
var player_character = null

# --- API Management ---
const SUPPORTED_APIS = {
	"Gemma 3 27b": "gemma-3-27b",
	"GPT4": "gpt-4",
	"DeepSeek": "deepseek-chat",
	"Gemini 1.5 (Fast)": "gemini-1.5-flash-latest"
}
var api_keys = {} # Stores API Key -> Character ID mapping.

# --- Job Roles ---
const JOB_ROLES = [
	"Receptionist", "Personal Assistant", "Boss", "HR Director",
	"Senior Coder", "Junior Coder", "Manager", "Admin Assistant",
	"Clerk", "Accountant", "Marketing Specialist", "Sales Executive",
	"IT Support", "Project Manager", "Designer", "Quality Assurance"
]

# --- Personality Tags ---
const PERSONALITY_TAGS = [
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
	"Flirty", "Party animal", "Strong", "Drunkard"
]

# --- Functions ---

# Registers an API key with its corresponding character ID.
# This prevents multiple characters from using the same key.
func register_api_key(character_id: String, api_key: String):
	if not api_key.strip_edges().is_empty():
		api_keys[api_key] = character_id

# Retrieves a character node based on a given API key.
func get_character_by_api_key(api_key: String):
	if api_keys.has(api_key):
		return character_registry.get(api_keys[api_key])
	return null

# Retrieves the relationship score between two characters.
func get_relationship(character_a: OfficeCharacter, character_b: OfficeCharacter) -> float:
	# Ensure the relationship is checked from the perspective of character_a.
	return character_a.character_data["relationships"].get(character_b.character_data["id"], 0.0)

# Pauses or unpauses the game.
func toggle_pause(paused: bool):
	game_paused = paused
	get_tree().paused = paused
	print("Game paused: ", game_paused)

# Saves the entire game state to a file.
func export_save_game():
    var save_data = {
        "office_type": current_office_type,
        "tasks": tasks,
        "characters": {}
    }
    
    for char_id in character_registry:
        # We save the character's data dictionary, not the node itself.
        save_data["characters"][char_id] = character_registry[char_id].character_data

    var file = FileAccess.open("user://savegame.json", FileAccess.WRITE)
    file.store_string(JSON.stringify(save_data, "\t"))
    file.close()
    print("Game state exported successfully.")

# Loads the game state from a file.
func load_game():
    if FileAccess.file_exists("user://savegame.json"):
        var file = FileAccess.open("user://savegame.json", FileAccess.READ)
        var content = file.get_as_text()
        var save_data = JSON.parse_string(content)
        file.close()

        if save_data:
            current_office_type = save_data["office_type"]
            tasks = save_data["tasks"]
            # The logic to load characters will be handled by the main scene.
            print("Game state loaded successfully.")
            return true
    
    return false
