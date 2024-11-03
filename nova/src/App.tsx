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
  loading: "Loading...",
  history: "History",
  returnToPage: "Return to current page",
  items: "[Items]",
  error:
    "We're sorry, an error has occurred. Please refresh the page.\nError message: ",
  placeholder:
    "This is some placeholder text. You will be prompted about what to do next. Type what you'd like to do in the input line.",
};

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
  const [currentGoal, setCurrentGoal] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<string>("");

  function handleSubmit(
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    // new output
    setIsLoading(true);
    getPage(history.length + 1, chat, input)
      .then((response) => {
        setHistory([...history, response[0]]);
        setChat(response[1]);
        setCurIndex(history.length);
        if (state === "welcome") {
          setState("game");
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
                      text.centered ? "centered" : ""
                    } ${text.bold ? "bold" : ""} ${
                      text.italicized ? "italic" : ""
                    }
                  ${text.color}`}
                  >
                    {text.content}
                  </p>
                );
              })}
              <form>
                {!isLoading && curIndex == history.length - 1 && (
                  <Input
                    value={input}
                    setValue={setInput}
                    isWelcome={false}
                    handleSubmit={(e) => handleSubmit(e)}
                  />
                )}
              </form>
            </div>
            <div className="healthBar">
              {[...Array(health)].map((_, index) => (
                <img className="heart" key={index} src={fullHeart}></img>
              ))}
              {[...Array(10 - health)].map((_, index) => (
                <img
                  className="heart"
                  key={health + index}
                  src={emptyHeart}
                ></img>
              ))}
            </div>
            <button className="inventoryButton normalText">
              {strings.items}
            </button>
          </>
        );
      case "history":
        return (
          <>
            <h2 className="pageTitle">{strings.history}</h2>
            <div className="subContainer">
              <ol className="historyList">
                <li key={0} className="historyItem">
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
                    <li key={index + 1} className="historyItem">
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
      <p className="watermark">{strings.watermark}</p>
      {/* title */}
      <div className="mainContainer normalText">
        {isLoading ? (
          <p className="normalText">{strings.loading}</p>
        ) : (
          renderOutput(state)
        )}
      </div>
    </>
  );
}

export default App;
