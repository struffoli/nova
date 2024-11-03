import React, { useState } from "react";
import "./App.css";
import { getPage } from "./gameFunctions";
import { Chat, Page, Text } from "./types";
// icon by halfmage https://www.svgrepo.com/svg/377250/clock
import clock from "./assets/clock-svgrepo-com.svg";

type State = "welcome" | "game" | "history" | "quiz";

const strings = {
  whatIsYourName: "What is your name?",
  watermark: "(c) kevinware 1999",
  hello: "Hello",
  welcome: "Welcome",
  history: "History",
  returnToPage: "Return to current page",
  error:
    "We're sorry, an error has occurred. Please refresh the page.\nError message: ",
  placeholder:
    "This is some placeholder text. You will be prompted about what to do next. Type what you'd like to do in the input line.",
};

const placeholderPage: Page = {
  id: 0,
  title: "Landing Page",
  content: [
    {
      color: "green",
      centered: false,
      bold: false,
      italicized: false,
      content: strings.placeholder,
    },
  ],
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              <label className="title flex-col">
                {strings.whatIsYourName}
                <div className="inputContainer normalText nameInput">
                  <input
                    type="text"
                    maxLength={20}
                    className="input normalText"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  ></input>
                </div>
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
              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
              >
                {!isLoading && curIndex == history.length - 1 && (
                  <div className="inputContainer">
                    {/* todo: disable pasting in \n */}
                    <textarea
                      maxLength={128}
                      className="input normalText inputWide"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    ></textarea>
                  </div>
                )}
              </form>
            </div>
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
      <div className="mainContainer normalText">{renderOutput(state)}</div>
    </>
  );
}

export default App;
