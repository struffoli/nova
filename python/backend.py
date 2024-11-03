# simple backend server for react app to use to access openai api etc
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

# TODO:
# come up with design using structured output to get consistent formatted outputs and parse things like health, items etc
# and be able to know when we are in a battle mode etc
# likely will have multiple different assistants to handle things when it gets more complex
# e.g. one should pre-process an input with a summarized context or just the game state and prevents impossible moves, like using items we dont have or doing something impossible or innapropriate
# generally a response should have multiple parts:
# - text chunks (can be different types)
# - game state changes (health, items, location etc)
# - mode

# api endpoint for first message in the game
# parameters: player name from landing page and possibly other settings
# returns: messages list as json (response from openai)
# logs token usage
@app.post("/start_game")
def start_game(player_name: str) -> Chat:
    prompt = f"""We are playing an interactive text-based RPG game, similar to a retro arcade game like Oregon Trail. You are the gamemaster overseeing it.
    This is an educational game designed to help players learn computer science concepts in a fun and engaging way.
    Come up with a setting where the player must use their computer science knowledge and programming skills. One example could be an engineer saving humanity, but be creative.
    Welcome the player and create the initial scene. This is where you can give any background information and decide what happens first, like an immediate NPC interaction or just free exploration.
    The player should have to figure out their goal themselves based on their exploration of your world.
    Try to come up with an original, creative prompt.
    Refer to the player as their name ({player_name}) or \"you\", and build the game based on their actions.
    Do not make moves for the player or even suggest actions, but guide them through a storyline implicitly with your writing.
    The purpose of the game is to assist with studying computer science concepts.
    When the player encounters enemies such as \"bugs\" or \"rogue ai\" and must battle them, enter a battle mode where they are asked a computer science question and must answer as if they are speaking to the enemy.
    If the player answers correctly, they defeat the enemy and continue the game. If they answer incorrectly, they lose health points and must try again.
    Make questions more challenging as the story progresses. Rare special events can occur to keep it interesting, such as helpful NPCs or enemies that don't act traditionally.
    The player wins the game by reaching the end of the storyline with a set number of health points remaining.
    The player loses the game if their health points reach zero. The player can also lose the game by making a series of poor decisions that lead to a game over scenario.
    Enemy encounters should be every 5 moves or so. Do not let the player make impossible moves. Write creatively while being easy to understand, and keep most responses short.
    At the bottom of each response, include a brief sentence summary of the player's status, such as health, location, current goal, etc., and then follow with a question to prompt the player's next move."""

    # get rid of newlines and extra spaces like tabs
    prompt = prompt.replace("\n", " ")
    prompt = " ".join(prompt.split())

    messages = [{"role": "system", "content": prompt}]

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    token_usage[0] += completion.usage.prompt_tokens
    token_usage[1] += completion.usage.completion_tokens
    logging.info(f"\t\tUsed: {completion.usage.prompt_tokens + completion.usage.completion_tokens}")
    logging.info(f"\t\t\t(prompt: {token_usage[0]}) (response: {token_usage[1]})")

    messages.append({"role": "assistant", "content": completion.choices[0].message.content})

    return Chat(messages=messages)

# api endpoint for making a move in the game
# parameters: messages (history of game messages), user_move (current user move)
# returns: structured json (response from openai)
# logs token usage
@app.post("/make_move")
def make_move(chat: Chat, user_move: str) -> Chat:
    messages = chat.messages
    messages.append({"role": "user", "content": user_move})

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
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