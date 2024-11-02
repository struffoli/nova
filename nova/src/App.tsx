import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

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
  const [output, setOutput] = useState(strings.placeholder);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");

  async function callApi(query: String) {
    // call api
    try {
      return strings.placeholder + " You last typed: " + query;
    } catch (error) {
      throw new Error("Error calling API");
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
            <p className="outputContainer">{output}</p>
            <form
              onSubmit={(e) => {
                // new output
                setIsLoading(true);
                setOutput("");
                setInput("");
                callApi(input)
                  .then((newOutput) => {
                    setOutput(newOutput);
                  })
                  .catch((err) => {
                    setIsError(true);
                    setError(err.message);
                  })
                  .finally(() => {
                    setIsLoading(false);
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
