import { useRef, useState } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { shaderMaterial } from '@react-three/drei';

const MaterialVoiceInput = shaderMaterial(
  {
    u_time: 0,
    u_resolution: new THREE.Vector2(0, 0),
    u_morphState: 0,
    u_audioLow: 0,
    u_audioMid: 0,
    u_audioHigh: 0,
    u_audioAverage: 0
  },
  // vertex shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // fragment shader
  `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_morphState;
  uniform float u_audioLow;
  uniform float u_audioMid;
  uniform float u_audioHigh;
  uniform float u_audioAverage;
  varying vec2 vUv;

  float circle(vec2 p, float radius) {
    return length(p) - radius;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    
    // Use audio values to modify the visualization
    float radius = 0.155 + u_audioAverage * 0.1;
    vec2 dotOffset = vec2(0.0, -radius * 2.25);
    vec2 dotPos = dotOffset + vec2(u_audioLow * 0.1, u_audioHigh * 0.1);
    float dot = circle(uv - dotPos, radius * (0.275 + u_audioMid * 0.2));
    
    float pixelWidth = fwidth(dot);
    float alpha = smoothstep(pixelWidth, -pixelWidth, dot);
    
    // Add some color variation based on audio
    vec3 color = vec3(1.0 + u_audioLow * 0.5, 1.0 + u_audioMid * 0.5, 1.0 + u_audioHigh * 0.5);
    gl_FragColor = vec4(color, alpha);
  }
  `
);

extend({ MaterialVoiceInput });

export const ShaderVoiceInput = ({
  targetPosition = [0, 0, 0],
  audioData = { low: 0, mid: 0, high: 0, average: 0 },
}) => {
  const shaderRef = useRef();
  const meshRef = useRef();
  const [currentPosition, setCurrentPosition] = useState(targetPosition);

  useFrame(() => {
    if (!meshRef.current) return;
    const newX = MathUtils.lerp(currentPosition[0], targetPosition[0], 0.05);
    const newY = MathUtils.lerp(currentPosition[1], targetPosition[1], 0.05);
    const newZ = MathUtils.lerp(currentPosition[2], targetPosition[2], 0.05);
    setCurrentPosition([newX, newY, newZ]);
    meshRef.current.position.set(newX, newY, newZ);
  });

  useFrame((state, delta) => {
    if (!shaderRef.current) return;
    shaderRef.current.u_time += delta;
    shaderRef.current.u_resolution.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr
    );
    shaderRef.current.u_audioLow = audioData.low;
    shaderRef.current.u_audioMid = audioData.mid;
    shaderRef.current.u_audioHigh = audioData.high;
    shaderRef.current.u_audioAverage = audioData.average;
  });

  return (
    <mesh
      ref={meshRef}
      position={currentPosition}
    >
      <planeGeometry args={[10, 10, 64, 64]} />
      <materialVoiceInput ref={shaderRef} transparent />
    </mesh>
  );
};