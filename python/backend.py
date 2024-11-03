# simple backend server for react app to use to access openai api etc
from enum import Enum
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

# logger
import logging
# add date and time to log messages
# log to file backend.log
logging.basicConfig(filename='backend.log', level=logging.INFO, format='%(asctime)s - %(message)s')

app = FastAPI()

origins = [
    "http://localhost:5173",
]

# add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# read api key from file
with open('apikey.txt', 'r') as file:
    api_key = file.read().replace('\n', '')

client = OpenAI(
    api_key=api_key
)

token_usage = [0, 0] # prompt tokens, completion tokens
# log token_usage when server closes
def log_token_usage():
    logging.info(f"Server shutdown: total tokens used: {token_usage[0] + token_usage[1]}")
    logging.info(f"\t(prompt: {token_usage[0]}) (response: {token_usage[1]})")
app.add_event_handler('shutdown', log_token_usage)

# api stuff now
class Chat(BaseModel):
    messages: list[dict]

# need to come up with design using structured output to get consistent formatted outputs and parse things like health, items etc
# and be able to know when we are in a battle mode etc
# likely will have multiple different assistants to handle things when it gets more complex
# e.g. one should pre-process an input with a summarized context or just the game state and prevents impossible moves, like using items we dont have or doing something impossible or innapropriate
# generally a response should have multiple parts:
# - text chunks (can be different types)
#   - normal text (story, description, etc)
#   - system (player state changes, battle mode, etc)
#   - narrator (meta information, environmental changes in game, sudden events, etc)
#   - dialogue (npc, player, etc)
# and others that arent for text output but for the game system to use, usually based on the text chunks
# - player state changes (health, items, location etc)
# - game mode change (returning to normal mode, entering battle mode, etc)
# - complete game (tell system to stop prompting)

# class BlockType(str, Enum):
#     text = "text"
#     text2 = "text2"
#     special = "special"
#     dialogue = "dialogue"
#     action_prompt = "action_prompt"
#     set_health = "set_health"
#     set_item_quantity = "set_item_quantity"
#     set_goal = "set_goal"
#     set_location = "set_location"
#     start_battle = "start_battle"
#     end_battle = "end_battle"
#     game_end = "game_end"

class Text(BaseModel):
    text: str
class Text2(BaseModel):
    text2: str
class Special(BaseModel):
    special: str
class Dialogue(BaseModel):
    dialogue: str
class ActionPrompt(BaseModel):
    action_prompt: str
class SetHealth(BaseModel):
    set_health: int
class SetItemQuantity(BaseModel):
    set_item: str
    set_quantity: int
class SetGoal(BaseModel):
    set_goal: str
class SetLocation(BaseModel):
    location: str
class StartBattle(BaseModel):
    start_battle: str
class EndBattle(BaseModel):
    end_battle: str
class GameEnd(BaseModel):
    game_end: str

# class Block(BaseModel):
#     type: BlockType
#     value: str

class Response(BaseModel):
    # use equivalent of json schema anyOf to allow multiple types
    blocks: list[Union[Text, Text2, Dialogue, ActionPrompt, SetHealth, SetItemQuantity, SetGoal, SetLocation, StartBattle, EndBattle, GameEnd]]

# api endpoint for first message in the game
# parameters: player name from landing page and possibly other settings
# returns: messages list as json (response from openai)
# logs token usage
@app.post("/start_game")
def start_game(player_name: str) -> Chat:
    # prompt = f"""We are playing an interactive text-based RPG game, similar to a retro arcade game like Oregon Trail. You are the gamemaster overseeing it.
    # This is an educational game designed to help players learn computer science concepts in a fun and engaging way.
    # Come up with a setting where the player must use their computer science knowledge and programming skills. One example could be an engineer saving humanity, but be creative.
    # Welcome the player and create the initial scene. This is where you can give any background information and decide what happens first, like an immediate NPC interaction or just free exploration.
    # The player should have to figure out their goal themselves based on their exploration of your world.
    # Try to come up with an original, creative prompt.
    # Refer to the player as their name ({player_name}) or \"you\", and build the game based on their actions.
    # Do not make moves for the player or even suggest actions, but guide them through a storyline implicitly with your writing.
    # The purpose of the game is to assist with studying computer science concepts.
    # When the player encounters enemies such as \"bugs\" or \"rogue ai\" and must battle them, enter a battle mode where they are asked a computer science question and must answer as if they are speaking to the enemy.
    # If the player answers correctly, they defeat the enemy and continue the game. If they answer incorrectly, they lose health points and must try again.
    # Make questions more challenging as the story progresses. Rare special events can occur to keep it interesting, such as helpful NPCs or enemies that don't act traditionally.
    # The player wins the game by reaching the end of the storyline with a set number of health points remaining.
    # The player loses the game if their health points reach zero. The player can also lose the game by making a series of poor decisions that lead to a game over scenario.
    # Enemy encounters should be every 5 moves or so. Do not let the player make impossible moves. Write creatively while being easy to understand, and keep most responses short.
    # At the bottom of each response, include a brief sentence summary of the player's status, such as health, location, current goal, etc., and then follow with a question to prompt the player's next move."""
    prompt = f"""We are playing an interactive text-based RPG game, similar to a retro arcade game like Oregon Trail. You are the gamemaster overseeing it.
    This is an educational game designed to help players learn computer science concepts in a fun and engaging way.
    Come up with a world where the player must use their computer science knowledge and programming skills. One example could be an engineer in the year 3000 saving humanity by defeating bugs and rogue AI. Be creative and don't follow traditional sci-fi tropes.
    Welcome the player and create the initial scene (background info and whatever interactions might happens immediately).
    The player should have to figure out their goal themselves based on their exploration of your world.
    Refer to the player as their name "{player_name}" or \"you\", and build the game based on their actions.
    Do not make moves for the player or even suggest actions, but guide them through a storyline implicitly with your writing.
    The purpose of the game is to assist with studying computer science concepts.
    Enemy encounters should be battles where the player is asked a computer science question and must answer as if they are speaking to the enemy.
    Incorrect answers lose health and they get more challenging as the story progresses.
    Balance between free-play and enemy encounters, but aim to finish the game pretty quickly as a short story with either a win or loss while still having enough battles.
    Rare special events can occur to keep it interesting, such as helpful NPCs or enemies that don't act traditionally.
    Disallow impossible moves outside of the player's capability (e.g. using items they don't have).
    Write creatively while being easy to understand, and keep responses short.
    The game ends at zero health, and players start with 10 hearts of health. Reaching a conclusion in the storyline without dying will end the game.
    End each response with a question to prompt the player's next move.
    Construct your response using these blocks for each part:
    Text for normal story and description text.
    Text2 for text describing things like losing health, gaining items, entering battle, and environmental events like the building collapsing.
    Dialogue for speech in quotes from NPCs, player, etc.
    ActionPrompt for the last msg prompting to make a move.
    SetHealth for setting player health (an integer).
    SetItemQuantity for item updates (item name and quantity separated by a comma).
    SetGoal for what player currently seems to be trying to do,
    SetLocation for current location,
    StartBattle and EndBattle signals entering and ending battle mode,
    GameEnd to signal the last message and end the game.
    After this intro, set the initial health and location."""

    # get rid of newlines and extra spaces like tabs
    prompt = prompt.replace("\n", " ")
    prompt = " ".join(prompt.split())

    messages = [{"role": "system", "content": prompt}]

    # completion = client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     messages=messages
    # )
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=messages,
        response_format=Response
    )
    token_usage[0] += completion.usage.prompt_tokens
    token_usage[1] += completion.usage.completion_tokens
    logging.info(f"\t\tUsed: {completion.usage.prompt_tokens + completion.usage.completion_tokens}")
    logging.info(f"\t\t\t(prompt: {token_usage[0]}) (response: {token_usage[1]})")

    messages.append({"role": "assistant", "content": completion.choices[0].message.content})

    return Chat(messages=messages)

# todo: intermediate model that does a better job at handling impossible moves based on context. e.g. "i teleport to another world" should virtually be impossible unless they have an item that does that given by the game"

# api endpoint for making a move in the game
# parameters: messages (history of game messages), user_move (current user move)
# returns: structured json (response from openai)
# logs token usage
@app.post("/make_move")
def make_move(chat: Chat, user_move: str) -> Chat:
    messages = chat.messages
    messages.append({"role": "user", "content": user_move})

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=messages,
        response_format=Response
    )
    token_usage[0] += completion.usage.prompt_tokens
    token_usage[1] += completion.usage.completion_tokens
    logging.info(f"\t\tUsed: {completion.usage.prompt_tokens + completion.usage.completion_tokens}")
    logging.info(f"\t\t\t(prompt: {token_usage[0]}) (response: {token_usage[1]})")

    messages.append({"role": "assistant", "content": completion.choices[0].message.content})

    return Chat(messages=messages)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend:app", port=5432, reload=True, access_log=False)