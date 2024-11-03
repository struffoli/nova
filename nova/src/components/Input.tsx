import React from "react";
import "../App.css";

type Props = {
  value: string;
  setValue: (value: string) => void;
  isWelcome: boolean;
  handleSubmit: (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
};

const Input = ({ value, setValue, isWelcome, handleSubmit }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`inputContainer normalText ${isWelcome ? "nameInput" : ""}`}
    >
      {/* todo: disable pasting in \n */}
      <textarea
        maxLength={isWelcome ? 20 : 128}
        className={`input normalText ${
          isWelcome ? "" : "tallTextarea inputWide"
        }`}
        value={value}
        onChange={(e) => handleChange(e)}
        onKeyDown={(e) => handleKeyDown(e)}
        rows={isWelcome ? 1 : 2}
      ></textarea>
    </div>
  );
};

export default Input;
