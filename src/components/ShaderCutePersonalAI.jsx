import React, { useRef, useState } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MaterialCutePersonalAI = shaderMaterial(
  {
    u_time: 0,
    u_resolution: new THREE.Vector2(0, 0),
    u_morphState: 0,
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
    varying vec2 vUv;

    float smin(float a, float b, float k) {
      float h = max(k - abs(a - b), 0.0) / k;
      return min(a, b) - h * h * k * 0.26;
    }

    float circle(vec2 p, float radius) {
      return length(p) - radius;
    }

    float connection(vec2 p, vec2 a, vec2 b, float width) {
      vec2 pa = p - a;
      vec2 ba = b - a;
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      return length(pa - ba * h) - width;
    }

    float cutePersonalAI(vec2 p, float radius) {
      vec2 positions[4];
      positions[0] = vec2(0.0, 0.0);
      positions[1] = vec2(0.0, radius * 2.7);
      positions[2] = vec2(-radius * 2.2, radius * 1.5);
      positions[3] = vec2(radius * 2.2, radius * 1.5);

      float d = circle(p - positions[0], radius);
      
      for(int i = 1; i < 4; i++) {
        vec2 morphedPos = positions[i] * u_morphState;
        float c = circle(p - morphedPos, radius);
        d = min(d, c);
        float connWidth = radius * 0.09;
        float conn = connection(p, positions[0], morphedPos, connWidth);
        d = smin(d, conn, 0.06);
      }

      vec2 finalSmallCirclePos = vec2(0.0, -radius * 2.25);
      vec2 initialSmallCirclePos = vec2(0.0, 0.0);
      vec2 smallCirclePos = mix(initialSmallCirclePos, finalSmallCirclePos, u_morphState);
      float smallCircle = circle(p - smallCirclePos, radius * 0.275);
      d = min(d, smallCircle);
      return d;
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      float mainCircleRadius = 0.155;
      float circleDist = circle(uv, 0.7);
      float ai = cutePersonalAI(uv, mainCircleRadius);
      float d = mix(circleDist, ai, u_morphState);
      
      // anti-aliasing
      float pixelWidth = fwidth(d);
      d = smoothstep(pixelWidth, -pixelWidth, d);
      
      gl_FragColor = vec4(1.0, 1.0, 1.0, d);
    }
  `
);

extend({ MaterialCutePersonalAI });

export const ShaderCutePersonalAI = () => {
  const materialRef = useRef();
  const [morphState, setMorphState] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetState, setTargetState] = useState(0);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.u_time += delta;
      materialRef.current.u_resolution.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      );
      if (isAnimating) {
        const diff = targetState - morphState;
        const easeFactor = 0.15;
        const newMorphState = morphState + diff * easeFactor;
        if (Math.abs(diff) < 0.001) {
          setMorphState(targetState);
          setIsAnimating(false);
        } else {
          setMorphState(newMorphState);
        }
      }
      materialRef.current.u_morphState = morphState;
    }
  });

  const handleClick = () => {
    setTargetState(morphState < 0.5 ? 1.0 : 0.0);
    setIsAnimating(true);
  };

  return (
    <mesh onClick={handleClick}>
      <planeGeometry args={[10, 10, 64, 64]} />
      <materialCutePersonalAI ref={materialRef} transparent />
    </mesh>
  );
};