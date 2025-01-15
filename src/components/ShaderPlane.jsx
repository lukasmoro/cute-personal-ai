import React from 'react';
import { useFrame } from '@react-three/fiber';

export function ShaderPlane({ Material, materialRef }) {
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta;
    }
  });

  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[10, 10]} />
      <primitive object={new Material()} ref={materialRef} />
    </mesh>
  );
}