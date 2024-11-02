import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const strings = {
  whatIsYourName: "What is your name?",
  watermark: "(c) kevinware 1999",
};

function App() {
  const [name, setName] = useState("");
  const [input, setInput] = useState("");

  return (
    <>
      <p className="watermark">{strings.watermark}</p>
      {name === "" ? (
        // title
        <div className="mainContainer">
          <form onSubmit={(e) => setName(input)}>
            <label className="title flex-col">
              {strings.whatIsYourName}
              <div className="inputContainer">
                <input
                  type="text"
                  className="input"
                  onChange={(e) => setInput(e.target.value)}
                ></input>
              </div>
            </label>
          </form>
        </div>
      ) : (
        // main game
        <h1>Hello {name}</h1>
      )}
    </>
  );
}

export default App;
