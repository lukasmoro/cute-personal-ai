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
  // fragement shader
  `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_morphState;
    varying vec2 vUv;

    float smin(float a, float b, float k) {
      float h = max(k - abs(a - b), 0.0) / k;
      return min(a, b) - h * h * k * 0.2;
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

    float growGraph(vec2 p, float mainRadius, float smallRadius, float spread) {
      float graphLoreMaster = circle(p, mainRadius * 0.7);
      float hexAngle = 1.0471966;
      float mainDistance = mainRadius * 1.5;
      float d = graphLoreMaster;
      vec2 positions[6];
      
      for(int i = 0; i < 6; i++) {
        positions[i] = vec2(cos(float(i) * hexAngle), sin(float(i) * hexAngle)) * mainDistance * u_morphState * 1.1;
      }

      float mediumRadius = 0.07;
      
      for(int i = 0; i < 6; i++) {
        float c = circle(p - positions[i], mediumRadius);
        d = min(d, c);
      }
      
      float smallDistance = mediumRadius * 3.0;
      float tinyRadius = 0.035;
      
      for(int i = 0; i < 6; i++) {
        vec2 basePos = positions[i];
        
        for(int j = 0; j < 5; j++) {
          vec2 randOffset = vec2(
            sin(float(i) * 12.3 + float(j) * 7.1) * 1.0,
            cos(float(i) * 8.7 + float(j) * 9.2) * 1.0
          );
          vec2 smallPos = basePos + randOffset * smallDistance * pow(u_morphState, 5.0);
          float smallCircle = circle(p - smallPos, tinyRadius);
          d = min(d, smallCircle);
          float smallConn = connection(p, basePos, smallPos, tinyRadius * 0.075 * u_morphState);
          d = smin(d, smallConn, 0.03);
        }
      }
      
      float connectionWidth = smallRadius * 0.075 * u_morphState;
      float connSmoothFactor = 0.035;
      vec2 center = vec2(0.0);
      
      for(int i = 0; i < 6; i++) {
        float conn = connection(p, center, positions[i], connectionWidth);
        d = smin(d, conn, connSmoothFactor);
      }
      
      return d;
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      float mainCircleRadius = 0.3;
      float smallCircleRadius = 0.1;
      float circleDist = circle(uv, 0.7);
      float growingDist = growGraph(uv, mainCircleRadius, smallCircleRadius, 0.5);
      float d = mix(circleDist, growingDist, u_morphState);
      vec3 col = vec3(0.85);
      col *= step(0.0, d);
      gl_FragColor = vec4(col, 1.0);
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
      <planeGeometry args={[10, 10]} />
      <materialCutePersonalAI ref={materialRef} />
    </mesh>
  );
};