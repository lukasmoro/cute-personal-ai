import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ShaderCutePersonalAI} from './ShaderCutePersonalAI'
import './InterfaceCutePersonalAI.css';

export function InterfaceCutePersonalAI() {
  return (
    <div className="canvas">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ShaderCutePersonalAI />
      </Canvas>
    </div>
  );
}