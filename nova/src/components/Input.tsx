import React, { useState, useRef, useEffect } from "react";
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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      updateCursorPosition();
    };

    const handleKeyUp = () => {
      updateCursorPosition();
    };

    const updateCursorPosition = () => {
      if (inputRef.current && cursorRef.current) {
        const textarea = inputRef.current.querySelector(
          "textarea"
        ) as HTMLTextAreaElement;
        const { selectionStart } = textarea;

        const rect = textarea.getBoundingClientRect(); // Get the textarea's position
        const text = textarea.value.substring(0, selectionStart);
        const span = document.createElement("span"); // Create a span to calculate width
        span.innerText = text || " "; // Use space for empty text
        span.style.font = getComputedStyle(textarea).font; // Use textarea's font
        span.style.visibility = "hidden"; // Hide the span
        document.body.appendChild(span); // Append to body for measurement

        const cursorX = rect.left + span.offsetWidth; // Calculate cursor X position
        const cursorY =
          rect.top + parseInt(getComputedStyle(textarea).lineHeight, 10) - 4; // Adjust for vertical position
        cursorRef.current.style.transform = `translate(${cursorX}px, ${cursorY}px)`; // Move cursor

        span.remove(); // Remove the span after measurement
      }
    };

    if (isFocused) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("keyup", handleKeyUp);
    } else {
      if (cursorRef.current) {
        cursorRef.current.style.display = "none";
      }
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFocused, value]);

  // Effect to manage cursor visibility and position
  useEffect(() => {
    if (inputRef.current) {
      const cursor = inputRef.current.querySelector(".cursor") as HTMLElement;
      if (cursor) {
        cursor.style.display = isFocused ? "inline" : "none";
      }
    }
  }, [isFocused]);

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
      ref={inputRef}
      className={`inputContainer normalText ${isWelcome ? "nameInput" : ""}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
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
      <span
        ref={cursorRef}
        className={`cursor ${isFocused ? "active" : ""}`}
      ></span>
    </div>
  );
};

export default Input;
