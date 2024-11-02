import React, { useState } from "react";
import "./App.css";
import { getPage } from "./gameFunctions";
import { Page, Text } from "./types";

type State = "welcome" | "game" | "history" | "quiz";

const strings = {
  whatIsYourName: "What is your name?",
  watermark: "(c) kevinware 1999",
  hello: "Hello",
  welcome: "Welcome",
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
  const [history, setHistory] = useState<Page[]>([placeholderPage]);
  const [state, setState] = useState<State>("welcome");

  function renderOutput(state: State): React.ReactNode {
    switch (state) {
      case "welcome":
        return (
          <>
            <h2 className="pageTitle">{strings.welcome}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setName(input);
                setInput("");
                setState("game");
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
            <h2 className="pageTitle">{history[curIndex].title}</h2>
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
                  // new output
                  setIsLoading(true);
                  getPage(input)
                    .then((newPage) => {
                      setHistory([...history, newPage]);
                      setCurIndex(history.length);
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
                }}
              >
                {!isLoading && (
                  <div className="inputContainer">
                    <input
                      type="text"
                      className="input normalText"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    ></input>
                  </div>
                )}
              </form>
            </div>
          </>
        );
      case "history":
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
