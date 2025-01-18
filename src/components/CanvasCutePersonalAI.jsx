import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { ShaderCutePersonalAI } from './ShaderCutePersonalAI';
import { ShaderGradientUnderlay } from './ShaderGradientUnderlay';
import { CameraFixer } from './CameraFixer';
import './CanvasCutePersonalAI.css';

export function CanvasCutePersonalAI() {
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
        <CameraController />
        <CameraFixer>
          <ShaderCutePersonalAI />
          <ShaderGradientUnderlay />
        </CameraFixer>
      </Canvas>
    </div>
  );
}