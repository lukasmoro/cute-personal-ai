import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ShaderPlane } from './ShaderPlane';
import './InterfaceCutePersonalAI.css';
import { MaterialInterfaceCutePersonalAI } from './MaterialInterfaceCutePersonalAI';

export function InterfaceCutePersonalAI() {
  const materialRef = useRef();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value = [window.innerWidth, window.innerHeight];
    }
  }, []);

  return (
    <div className="canvas">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ShaderPlane Material={MaterialInterfaceCutePersonalAI} materialRef={materialRef} />
      </Canvas>
    </div>
  );
}