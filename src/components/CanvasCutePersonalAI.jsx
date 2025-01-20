import React, {useState, useEffect} from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { VoiceInputController } from './VoiceInputController';
import { ShaderCutePersonalAI } from './ShaderCutePersonalAI';
import { ShaderVoiceInput } from './ShaderVoiceInput'
import { ShaderGradientUnderlay } from './ShaderGradientUnderlay';
import { ShaderImageGeneration } from './ShaderImageGeneration';
import { CameraFixer } from './CameraFixer';
import './CanvasCutePersonalAI.css';

export function CanvasCutePersonalAI() {
  
  // states & flags
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]);
  let isDown = targetPosition[1] < -5;
  const [audioData, setAudioData] = useState({ low: 0, mid: 0, high: 0, average: 0 });

  // positions for shader meshes
  const positions = {
    center: [0, 0, 0],
    left: [-14, 0, 0],
    right: [14, 0, 0],
    top: [0, 8, 0],
    bottom: [0, -7, 0]
  };

  // keyboard event handler
  useEffect(() => {
    const handleEvent = (event) => {
      
      switch(event.key.toLowerCase()) {
        case 'arrowleft':
          setTargetPosition(positions.left);
          break;
        case 'arrowright':
          setTargetPosition(positions.right);
          break;
        case 'arrowup':
          setTargetPosition(positions.top);
          break;
        case 'arrowdown':
          setTargetPosition(positions.bottom);
          break;
        case 'a':
          setTargetPosition(positions.center);
          break;
      }
    
    };
    
    window.addEventListener('keydown', handleEvent);
    return () => window.removeEventListener('keydown', handleEvent);
  }, []);

  return (
    <div className="canvas">
      <Canvas
        camera={{
          position: [0, 0, 14],
          fov: 80
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
        {/* <CameraController /> */}
        <VoiceInputController onAudioData={setAudioData} />
        <CameraFixer>
          <ShaderCutePersonalAI targetPosition={targetPosition} />
          <ShaderVoiceInput targetPosition = {targetPosition} audioData={audioData}/>
          <ShaderGradientUnderlay targetPosition={targetPosition} />
        </CameraFixer>
        <ShaderImageGeneration isDown={isDown} /> 
      </Canvas>
    </div>
  );
}