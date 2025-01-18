import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ShaderCutePersonalAI } from './ShaderCutePersonalAI';
import { ShaderGradientUnderlay } from './ShaderGradientUnderlay';
import './InterfaceCutePersonalAI.css';

// Camera animation component
function CameraAnimation({ position }) {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      position.x,
      0.05
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      position.y,
      0.05
    );
  });
  
  return null;
}

export function InterfaceCutePersonalAI() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          setPosition(prev => ({ ...prev, y: prev.y === 0 ? 0 : 0 }));
          break;
        case 'ArrowDown':
          setPosition(prev => ({ ...prev, y: prev.y === 8 ? 0 : 8}));
          break;
        case 'ArrowLeft':
          setPosition(prev => ({ ...prev, x: prev.x === 10 ? 0 : 10 }));
          break;
        case 'ArrowRight':
          setPosition(prev => ({ ...prev, x: prev.x === 0 ? 0 : 0 }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="canvas">
      <Canvas
        camera={{ 
          position: [0, 0, 14],
          fov: 80 }}
        gl={{
          antialias: true,
          pixelRatio: window.devicePixelRatio,
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
        }}
      >
        <CameraAnimation position={position} />
        <ShaderCutePersonalAI />
        <ShaderGradientUnderlay />
      </Canvas>
    </div>
  );
}