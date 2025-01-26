import React, { createContext, useContext, useState } from "react";

const ContextSpeechStreamInstance = createContext(null);

export const useSpeechStream = () => {
  const context = useContext(ContextSpeechStreamInstance);
  if (!context) {
    throw new Error(
      "useSpeechStream must be used within an AudioContext.Provider"
    );
  }
  return context;
};

export const ContextSpeechStream = ({ children }) => {
  const [audioState, setAudioState] = useState({
    audioTime: 0,
    playing: false,
    lastUpdate: Date.now(),
  });

  const updateAudioTime = (time) => {
    const now = Date.now();
    console.log(`Current audio time: ${time}`);
    setAudioState((prev) => ({
      ...prev,
        audioTime: time,
        lastUpdate: now,
    }));
  };

  const setPlaying = (isPlaying) => {
    setAudioState((prev) => ({
      ...prev,
      playing: isPlaying,
    }));
  };

  const value = {
    ...audioState,
    updateAudioTime,
    setPlaying,
  };

  return (
    <ContextSpeechStreamInstance.Provider value={value}>
      {children}
    </ContextSpeechStreamInstance.Provider>
  );
};

export default ContextSpeechStream;
