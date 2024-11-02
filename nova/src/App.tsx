import React, { useState } from "react";
import "./App.css";
import { getPage } from "./gameFunctions.ts";
import { Page, Text } from "./types.ts";

enum State {
  WELCOME,
  NOVA,
  HISTORY,
  QUIZ,
}

const strings = {
  whatIsYourName: "What is your name?",
  watermark: "(c) kevinware 1999",
  hello: "Hello",
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

  function renderOutput(state: State): React.ReactNode {
    switch (state) {
      default:
        return <></>;
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
        {name === "" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setName(input);
              setInput("");
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
        ) : (
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
        )}
      </div>
    </>
  );
}

export default App;
