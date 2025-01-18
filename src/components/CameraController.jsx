import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

export function CameraController({ initialPosition = { x: 0, y: 0, z: 14 } }) {
  const [position, setPosition] = useState(initialPosition);
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          setPosition(prev => ({ ...prev, y: prev.y === 0 ? 0 : 0 }));
          break;
        case 'ArrowDown':
          setPosition(prev => ({ ...prev, y: prev.y === 8 ? 0 : 8 }));
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

  return null;
}