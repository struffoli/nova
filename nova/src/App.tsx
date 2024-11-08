import React, { useState } from "react";
import "./App.css";
import { getPage } from "./gameFunctions";
import { Chat, Page, Text, Item } from "./types";
// icon by halfmage https://www.svgrepo.com/svg/377250/clock
import clock from "./assets/clock-svgrepo-com.svg";
import Input from "./components/Input";
import fullHeart from "./assets/filledHeart.svg";
import emptyHeart from "./assets/clearHeart.svg";

type State = "welcome" | "game" | "history" | "quiz";

const strings = {
  whatIsYourName: "What is your name?",
  watermark: "(c) kevinware 1999",
  hello: "Hello",
  welcome: "Welcome",
  loading1: "Loading",
  loading2: "Loading...",
  history: "History",
  returnToPage: "Return to current page",
  items: "[Items]",
  goal: "Current Goal: ",
  location: "Current Location: ",
  error:
    "We're sorry, an error has occurred. Please refresh the page.\nError message: ",
  placeholder:
    "This is some placeholder text. You will be prompted about what to do next. Type what you'd like to do in the input line.",
  placeholder2: "Defeat Kevin!",
  placeholder3: "GDC",
};

const placeholderItems: Item[] = [
  { name: "Sword", quantity: 1 },
  { name: "Shield", quantity: 1 },
  { name: "Potion", quantity: 3 },
];

function App() {
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [curIndex, setCurIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Page[]>([]);
  const [state, setState] = useState<State>("welcome");
  const [chat, setChat] = useState<Chat>({ messages: [] });
  const [health, setHealth] = useState(10);
  const [items, setItems] = useState<Item[]>([]);
  const [currentGoal, setCurrentGoal] = useState<string>();
  const [currentLocation, setCurrentLocation] = useState<string>();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  function handleSubmit(
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    // new output
    setIsLoading(true);
    getPage(history.length + 1, chat, state === "welcome" ? name : input)
      .then((response) => {
        // update history with new page
        setHistory([...history, response[0]]);
        // save chat state (used by stateless backend)
        setChat(response[1]);
        setCurIndex(history.length);
        if (state === "welcome") {
          setState("game");
        }

        // process system_calls
        // "set_health"
        // "add_item"
        // "remove_item"
        // "set_goal"
        // "set_location"
        // "start_battle"
        // "end_battle"
        // "game_end"
        for (let i = 0; i < response[2].system_calls.length; i++) {
          const system_call = response[2].system_calls[i];
          switch (system_call.type) {
            case "set_health":
              setHealth(system_call.int_param);
              break;
            case "add_item":
              // if already exists, add another. only adds 1 at a time so careful not to mismatch what the language model thinks is happening.
              let found = false;
              setItems(
                items.map((item) => {
                  if (item.name === system_call.string_param) {
                    found = true;
                    return { name: item.name, quantity: item.quantity + 1 };
                  }
                  return item;
                })
              );
              if (!found) {
                setItems([
                  ...items,
                  { name: system_call.string_param, quantity: 1 },
                ]);
              }
              break;
            case "remove_item": // removes all regardless of int_param or current quantity
              setItems(items.filter((item) => item.name !== system_call.string_param));
              break;
            case "set_goal":
              setCurrentGoal(system_call.string_param);
              break;
            case "set_location":
              setCurrentLocation(system_call.string_param);
              break;
            case "start_battle": // don't really currently use these
              break;
            case "end_battle":
              break;
            case "game_end":
              // uncomment to disable input on game_end.
              // setIsGameOver(true); 
              break;
          }
        }

      })
      .catch((err) => {
        setIsError(true);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
        setInput("");
      });
    e.preventDefault();
  }

  function renderOutput(state: State): React.ReactNode {
    switch (state) {
      case "welcome":
        return (
          <>
            <h2 className="pageTitle">{strings.welcome}</h2>
            {/* todo: semantically incorrect.. fix later */}
            <form>
              <label className="title flex-col">
                {strings.whatIsYourName}
                <Input
                  value={name}
                  setValue={setName}
                  isWelcome={true}
                  handleSubmit={(e) => {
                    if (!isLoading) {
                      handleSubmit(e);
                    }
                  }}
                />
              </label>
            </form>
          </>
        );
      case "game":
        return (
          <>
            <h2 className="pageTitle">
              {history[curIndex].title +
                " [" +
                (curIndex + 1) +
                "/" +
                history.length +
                "]"}{" "}
            </h2>
            <button
              className="historyButton"
              onClick={() => setState("history")}
            >
              <img className="historyIcon" src={clock}></img>
            </button>
            <div className="subContainer">
              {history[curIndex].content.map((text: Text, index: number) => {
                return (
                  <p
                    key={index}
                    className={`outputContainer ${
                      text.color === "#ddd" ? "tertiaryText" : text.color === "#fd3" ? "secondaryText" : ""
                    }`}
                    // make bold if text.bold
                    style={{
                      color: text.color,
                      textAlign: text.centered ? "center" : "left",
                      fontWeight: text.bold ? "bold" : "normal",
                      fontStyle: text.italicized ? "italic" : "normal",
                    }}
                  >
                    {text.content}
                  </p>
                );
              })}
              {!isLoading && curIndex == history.length - 1 && (
                <>
                  <p className="outputContainer tertiaryText">
                    {strings.goal} {currentGoal}
                  </p>
                  <p className="outputContainer tertiaryText">
                    {strings.location} {currentLocation}
                  </p>
                    {!isGameOver && (
                    <form>
                      <Input
                      value={input}
                      setValue={setInput}
                      isWelcome={false}
                      handleSubmit={(e) => handleSubmit(e)}
                      />
                    </form>
                    )}
                </>
              )}
            </div>
            {curIndex == history.length - 1 && (
              <div className="healthBar">
                {[...Array(health)].map((_, index) => (
                  <img
                    className={`heart ${health <= 3 ? "shake" : ""}`}
                    key={index}
                    src={fullHeart}
                  ></img>
                ))}
                {[...Array(10 - health)].map((_, index) => (
                  <img
                    className={`heart ${health <= 3 ? "shake" : ""}`}
                    key={health + index}
                    src={emptyHeart}
                  ></img>
                ))}
              </div>
            )}
            {curIndex == history.length - 1 && (
              <button
                onClick={() => setIsInventoryOpen(true)}
                className="inventoryButton normalText"
              >
                {strings.items}
              </button>
            )}
          </>
        );
      case "history":
        return (
          <>
            <h2 className="pageTitle">{strings.history}</h2>
            <div className="subContainer">
              <ol className="historyList" start={0}>
                <li key={-1} className="historyItem">
                  <button
                    onClick={() => {
                      setCurIndex(history.length - 1);
                      setState("game");
                    }}
                    className="historyItemButton normalText"
                  >
                    {strings.returnToPage}
                  </button>
                </li>
                {history.slice(0, -1).map((page: Page, index: number) => {
                  return (
                    <li key={index} className="historyItem">
                      <button
                        onClick={() => {
                          setCurIndex(index);
                          setState("game");
                        }}
                        className="historyItemButton normalText"
                      >
                        {page.title}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        );
      case "quiz":
    }
  }

  return (
    <>
      {isError && (
        <div className="errorMessage">
          {strings.error} {error}
        </div>
      )}
      {isInventoryOpen && (
        <div className="inventoryModal">
          <button
            onClick={() => setIsInventoryOpen(false)}
            className="closeInventoryButton normalText"
          >
            X
          </button>
          <h2 className="normalText">{strings.items}</h2>
          <ul className="inventoryList">
            {items.map((item: Item, index: number) => {
              return (
                <li key={index} className="inventoryItem">
                  <p className="normalText">{item.name}</p>
                  <p className="normalText">{item.quantity}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="watermark">{strings.watermark}</p>
      {/* title */}
      <div className="mainContainer normalText">
        {isLoading ? (
          <>
            <h2 className="pageTitle">{strings.loading1}</h2>
            <p className="normalText unselectable">{strings.loading2}</p>
          </>
        ) : (
          renderOutput(state)
        )}
      </div>
    </>
  );
}

export default App;
