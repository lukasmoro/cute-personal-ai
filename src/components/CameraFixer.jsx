import React from 'react';
import { OrthographicCamera } from '@react-three/drei';

export function CameraFixer({ children, position = [0, 0, 1], zoom = 40 }) {
  return (
    <OrthographicCamera
      makeDefault
      position={position}
      zoom={zoom}
    >
      <group position={[0, 0, -1]}>
        {children}
      </group>
    </OrthographicCamera>
  );
}