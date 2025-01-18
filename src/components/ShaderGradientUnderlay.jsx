import React, { useRef, useState } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';

const MaterialGradientUnderlay = shaderMaterial(
  {
    u_time: 0,
    u_resolution: new THREE.Vector2(0, 0),
    u_color1: new THREE.Color('#FFB700'),
    u_color2: new THREE.Color('#4000FF'),
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
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  varying vec2 vUv;

  vec2 rotate2D(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(
      p.x * c - p.y * s,
      p.x * s + p.y * c
    );
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 uv = vUv - center;
    
    float rotationSpeed = 0.2;
    uv = rotate2D(uv, u_time * rotationSpeed);
    
    float wave = sin(u_time * 0.5) * 0.02;
    uv.x += sin(uv.y * 4.0 + u_time * 0.75) * wave;
    uv.y += sin(uv.x * 4.0 + u_time * 0.75) * wave;
    
    float gradient = length(uv) * (2.2 + sin(u_time * 0.3) * 0.1);
    
    // Adjusted color mix for better balance
    float colorMix = smoothstep(0.3, 0.7, vUv.y + sin(u_time * 0.2) * 0.1);
    // Add power function to adjust color distribution
    colorMix = pow(colorMix, 1.2); // Adjust this value to control color balance
    vec3 color = mix(u_color1, u_color2, colorMix);
    
    float breathe = 0.7 + sin(u_time * 0.4) * 0.05;
    float vignette = 1.0 - smoothstep(0.0, breathe, gradient);
    vignette = smoothstep(0.0, 0.7, vignette);
    
    gl_FragColor = vec4(color, vignette);
  }
  `
);

extend({ MaterialGradientUnderlay });

export const ShaderGradientUnderlay = ({ targetPosition = [0, 0.6, -1.0] }) => {
  
  // references
  const shaderRef = useRef();
  const meshRef = useRef();

  // states
  const [currentPosition, setCurrentPosition] = useState([ 0, 0.6, -1.0]);

  // position animation
  useFrame(() => {
    if (!meshRef.current) return;
    const newX = MathUtils.lerp(currentPosition[0], targetPosition[0] + 0 , 0.05);
    const newY = MathUtils.lerp(currentPosition[1], targetPosition[1] + 0.6, 0.05);
    const newZ = MathUtils.lerp(currentPosition[2], targetPosition[2] - 1.0, 0.05);
    setCurrentPosition([newX, newY, newZ]);
  });
  
  // shader animation
  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.u_time += delta * 3.0;
      shaderRef.current.u_resolution.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      );
    }
  });

  return (
    <mesh 
      position={currentPosition} 
      ref={meshRef}
    >
      <planeGeometry args={[10, 10]} />
      <materialGradientUnderlay ref={shaderRef} transparent />
    </mesh>
  );
};