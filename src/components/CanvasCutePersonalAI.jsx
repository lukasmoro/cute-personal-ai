import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ControllerVoiceInput } from "./ControllerVoiceInput";
import { ContextThoughtStream } from "./ContextThoughtStream";
import { ProviderWhisper } from "./ProviderWhisper";
import { ProviderTTS } from "./ProviderTTS";
import { ShaderCutePersonalAI } from "./ShaderCutePersonalAI";
import { ShaderVoiceInput } from "./ShaderVoiceInput";
import { ShaderGradientUnderlay } from "./ShaderGradientUnderlay";
import { ShaderImageGeneration } from "./ShaderImageGeneration";
import { CameraFixer } from "./CameraFixer";
import { ContextSpeechStream } from "./ContextSpeechStream";
import "./CanvasCutePersonalAI.css";

export function CanvasCutePersonalAI() {
  // states & flags
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]);
  const isDown = targetPosition[1] < -5;
  const [audioData, setAudioData] = useState({
    low: 0,
    mid: 0,
    high: 0,
    average: 0,
  });
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // event handler 'SPACE'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat) {
        setIsListening(true);
        setIsRecording(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setIsListening(false);
        setIsRecording(false);
        setIsTalking(true);
        setTimeout(() => setIsTalking(false), 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // event handler 'ARROW UP + DOWN + LEFT + RIGHT + A' + positions state updater of cute personal ai
  useEffect(() => {
    const positions = {
      center: [0, 0, 0],
      left: [-14, 0, 0],
      right: [14, 0, 0],
      top: [0, 8, 0],
      bottom: [0, -7, 0],
    };

    const handleEvent = (event) => {
      switch (event.key.toLowerCase()) {
        case "arrowleft":
          setTargetPosition(positions.left);
          break;
        case "arrowright":
          setTargetPosition(positions.right);
          break;
        case "arrowup":
          setTargetPosition(positions.top);
          break;
        case "arrowdown":
          setTargetPosition(positions.bottom);
          break;
        case "a":
          setTargetPosition(positions.center);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleEvent);
    return () => window.removeEventListener("keydown", handleEvent);
  }, []);

  return (
    <ContextThoughtStream>
      <ContextSpeechStream>
        <div className="canvas">
          <Canvas
            camera={{
              position: [0, 0, 14],
              fov: 80,
            }}
            gl={{
              antialias: true,
              pixelRatio: window.devicePixelRatio,
              alpha: true,
              stencil: false,
              depth: true,
              powerPreference: "high-performance",
            }}
          >
            <ControllerVoiceInput
              onAudioData={setAudioData}
              isListening={isListening}
            />
            <CameraFixer>
              <ShaderCutePersonalAI targetPosition={targetPosition} />
              <ShaderVoiceInput
                targetPosition={targetPosition}
                audioData={audioData}
              />
              <ShaderGradientUnderlay targetPosition={targetPosition} />
            </CameraFixer>
            <ShaderImageGeneration isDown={isDown} />
          </Canvas>
          <div className="providers">
            <ProviderWhisper isRecording={isRecording} />
            <ProviderTTS isTalking={isTalking} />
          </div>
        </div>
      </ContextSpeechStream>
    </ContextThoughtStream>
  );
}
