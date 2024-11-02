from openai import OpenAI

# read apikey from file
with open('apikey.txt', 'r') as file:
    apikey = file.read().replace('\n', '')

client = OpenAI(
    api_key = apikey
)

name = input("What is your name? >")

messages=[
    {"role": "system", "content": f"We are playing an interactive text-based RPG game. You are the gamemaster overseeing it. The player is an engineer in the year 3000 named {name}. They are tasked with saving humanity with their computer science skills and knowledge. Welcome the player with a random initial scenario and introduce the challenge they are facing. Refer to the player as their name or \"you\", and build the game based on their actions. Finish each message with a question to the player to prompt their next move. Do not suggest actions or make moves for the player, but guide them through a storyline with your writing. The purpose of the game is to assist with studying computer science concepts. When the player encounters enemies such as \"bugs\" or \"rogue ai\" and must battle them, enter a battle mode where they are asked a computer science question and must answer as if they are speaking to the enemy. If the player answers correctly, they defeat the enemy and continue the game. If they answer incorrectly, they lose health points and must try again. The player wins the game by reaching the end of the storyline with a set number of health points remaining. The player loses the game if their health points reach zero. The player can also lose the game by making a series of poor decisions that lead to a game over scenario. Enemy encounters should be every 5 moves or so. Do not let the player make impossible moves. Write creatively."},
]

token_usage = [0, 0]

user_move = ""

while user_move != "exit":
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )

    print(completion.choices[0].message.content)
    messages.append({"role": "assistant", "content": completion.choices[0].message.content})
    token_usage[0] += completion.usage.prompt_tokens
    token_usage[1] += completion.usage.completion_tokens

    print("Total prompt tokens used:", token_usage[0])
    print("Total completion tokens used:", token_usage[1])

    user_move = input("What will you do? >")
    messages.append({"role": "user", "content": user_move})
