import React, { useState, useEffect } from "react";
import { useWhisper } from "@chengsokdara/use-whisper";
import "./ProviderWhisper.css";

const ProviderWhisper = ({ isRecording }) => {
  
  // state
  const [error, setError] = useState("");

  // setup useWhispher hook from @chengsokdara/use-whisper + error handling
  const { recording, transcript, startRecording, stopRecording } = useWhisper({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    streaming: true,
    timeSlice: 1000,
    whisperConfig: {
      language: "en",
      response_format: "json",
    },
    onError: (error) => {
      console.error("Whisper Error:", error);
      setError(error.message);
    },
  });

  // handle recording triggered on isRecording event
  useEffect(() => {
    const handleRecording = async () => {
      if (isRecording && !recording) {
        setError("");
        try {
          await startRecording();
        } catch (err) {
          console.error("Failed to start recording:", err);
          setError("Failed to start recording");
        }
      } else if (!isRecording && recording) {
        try {
          await stopRecording();
        } catch (err) {
          console.error("Failed to stop recording:", err);
          setError("Failed to stop recording");
        }
      }
    };

    handleRecording();
  }, [isRecording, recording, startRecording, stopRecording]);

  return (
    <div className="whisper-container">
      {error && (
        <div className="whisper-error">
          <p>Error: {error}</p>
        </div>
      )}
      <div className="recording-instruction">
        <p>Hold SPACEBAR to record</p>
      </div>
      <div className="status-group"></div>
      <div className="transcript-container">
        <div className="transcript-label">
          {recording ? "Real-time Transcript" : "Final Transcript"}
        </div>
        <div className="transcript-text">
          {transcript?.text || "No transcription yet..."}
        </div>
      </div>
    </div>
  );
};

export { ProviderWhisper };
