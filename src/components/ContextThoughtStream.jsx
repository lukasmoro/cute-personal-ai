import React, { createContext, useState, useContext, useMemo } from "react";
import { parseThought } from "./utils/thoughtParser";

const ThoughtStreamContext = createContext();

export const useThoughtStream = () => {
  const context = useContext(ThoughtStreamContext);
  return context;
};

// custom hooks for specific marker types
export const useGestures = () => {
  const { currentParsedThought } = useThoughtStream();
  return currentParsedThought.gesture;
};

export const useMimics = () => {
  const { currentParsedThought } = useThoughtStream();
  return currentParsedThought.mimic;
};

export const useActions = () => {
  const { currentParsedThought } = useThoughtStream();
  return currentParsedThought.action;
};

export const useSpokenText = () => {
  const { currentParsedThought } = useThoughtStream();
  return currentParsedThought.text;
};


export const ContextThoughtStream = ({ children }) => {
  const [streamOfThought, setStreamOfThought] = useState([
    "[gesture: greeting] [mimic: friendly] Hi Lukas, what is on your mind today",
    "[mimic: curious] Oh that is cool what about it? [gesture: pointing] This one right? [action: display image: zumthor.png/huyghes.png/klimt.png]",
    "[gesture: explaining] [mimic: calm] We have talked about something along those lines a while ago when you visited Kunstmuseum Bregenz. [mimic: happy] Do you remember? [gesture: explaining] How do you feel about the future?",
    "[gesture: thinking] [mimic: focused] Ok, we can start by finding a rough first direction. [gesture: explaining] Tell me your ideas and I will generate some starting points.",
    "[gesture: concentrated] [mimic: flow] Here is a first direction combining those visuals. [action: generate image from zumthor.png/huyghes.png & prompt] [action: display image: result1.png] [action: connect zumthor.png/huyghes.png to result1.png]",
  ]);

  const [thoughtIndex, setThoughtIndex] = useState(0);

  // parse current thought
  const currentParsedThought = useMemo(() => {
    return parseThought(streamOfThought[thoughtIndex]);
  }, [streamOfThought, thoughtIndex]);

  const nextThought = () => {
    setThoughtIndex((prev) => (prev + 1) % streamOfThought.length);
  };

  const addThought = (thought) => {
    setStreamOfThought((prev) => [...prev, thought]);
  };

  const value = {
    streamOfThought,
    thoughtIndex,
    currentParsedThought,
    nextThought,
    addThought,
    setStreamOfThought,
  };

  return (
    <ThoughtStreamContext.Provider value={value}>
      {children}
    </ThoughtStreamContext.Provider>
  );
};
