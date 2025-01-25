import React, { createContext, useContext, useState, useEffect } from 'react';

const ContextSpeechStreamInstance = createContext(null);

export const useSpeechStream = () => {
  const context = useContext(ContextSpeechStreamInstance);
  if (!context) {
    throw new Error('useSpeechStream must be used within an AudioContext.Provider');
  }
  return context;
};

export const ContextSpeechStream = ({ children }) => {
  const [audioState, setAudioState] = useState({
    audioTime: 0,
    playing: false,
    lastUpdate: Date.now()
  });

  const updateAudioTime = (time) => {
    const now = Date.now();
    setAudioState(prev => {
      // Only log if time has changed significantly (more than 0.1 seconds)
      if (Math.abs(time - prev.audioTime) > 0.1) {
        console.log(`[ContextSpeechStream] Time updated: ${time.toFixed(2)}s (Δ${(time - prev.audioTime).toFixed(2)}s)`);
      }
      // Log every second regardless of changes
      if (now - prev.lastUpdate > 1000) {
        console.log(`[ContextSpeechStream] Current audio time: ${time.toFixed(2)}s`);
      }
      return {
        ...prev,
        audioTime: time,
        lastUpdate: now
      };
    });
  };

  const setPlaying = (isPlaying) => {
    console.log(`[ContextSpeechStream] Playback state changed: ${isPlaying ? 'playing' : 'stopped'}`);
    setAudioState(prev => ({
      ...prev,
      playing: isPlaying
    }));
  };

  // Debug logging for component lifecycle
  useEffect(() => {
    console.log('[ContextSpeechStream] Provider mounted');
    return () => {
      console.log('[ContextSpeechStream] Provider unmounted');
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    if (audioState.playing) {
      console.log(`[ContextSpeechStream] Currently playing at ${audioState.audioTime.toFixed(2)}s`);
    }
  }, [audioState.playing, audioState.audioTime]);

  const value = {
    ...audioState,
    updateAudioTime,
    setPlaying
  };

  return (
    <ContextSpeechStreamInstance.Provider value={value}>
      {children}
    </ContextSpeechStreamInstance.Provider>
  );
};

export default ContextSpeechStream;