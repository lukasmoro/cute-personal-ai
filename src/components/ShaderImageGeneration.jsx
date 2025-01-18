import React, { useRef, useState, useEffect } from 'react';
import { extend, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const MaterialImageGeneration = shaderMaterial(
  {
    u_time: 0,
    u_resolution: new THREE.Vector2(0, 0),
    u_scale: 0,
    u_texture: null,
    u_blur: 2.0,
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
    uniform float u_scale;
    uniform float u_blur;
    uniform sampler2D u_texture;
    varying vec2 vUv;

    vec4 gaussianBlur(sampler2D image, vec2 uv, vec2 resolution, float radius) {
      vec4 color = vec4(0.0);
      float total = 0.0;
      vec2 pixel = vec2(1.0) / resolution;
      
      for(float x = -4.0; x <= 4.0; x += 1.0) {
        for(float y = -4.0; y <= 4.0; y += 1.0) {
          vec2 offset = vec2(x, y) * pixel * radius;
          float weight = exp(-(x*x + y*y) / (2.0 * 8.0));
          color += texture2D(image, uv + offset) * weight;
          total += weight;
        }
      }
      
      return color / total;
    }

    void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv = uv / u_scale;
    
    float dist = length(uv);
    float innerRadius = 0.4;
    float outerRadius = 0.7;
    float edgeFade = 1.0 - smoothstep(innerRadius, outerRadius, dist);
    vec4 texColor = texture2D(u_texture, vUv);

    if (u_blur > 0.0) {
        texColor = gaussianBlur(u_texture, vUv, u_resolution, u_blur);
    }

    float finalAlpha = texColor.a * edgeFade * u_scale;

    gl_FragColor = vec4(texColor.rgb * finalAlpha, finalAlpha);
    }
  `
);

extend({ MaterialImageGeneration });

export const ShaderImageGeneration = ({ isDown = false }) => {
  // references 
  const shaderRef = useRef();

  // constants
  const texture = useLoader(THREE.TextureLoader, './lavender.jpg');
  const BLUR_STRENGTH = 2;
  const BLUR_DURATION = 0.95;
  const BLUR_FADE_OUT = 0.5;
  
  //states
  const [scale, setScale] = useState(0);
  const [blur, setBlur] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetScale, setTargetScale] = useState(0);
  const [blurStartTime, setBlurStartTime] = useState(null);
  
  useEffect(() => {
    if (isDown) {
      setTargetScale(1.0);
      setBlurStartTime(Date.now());
    } else {
      setTargetScale(0.0);
      setBlur(2);
      setBlurStartTime(null);
    }
    setIsAnimating(true);
  }, [isDown]);
  
  useFrame((state, delta) => {
    if (!shaderRef.current) return;
    
    shaderRef.current.u_time += delta;
    shaderRef.current.u_resolution.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr
    );
    
    // scale
    if (isAnimating) {
      const diff = targetScale - scale;
      const easeStrength = 0.075;
      const newScale = scale + diff * easeStrength;
      
      if (Math.abs(diff) < 0.001) {
        setScale(targetScale);
        setIsAnimating(false);
      } else {
        setScale(newScale);
      }
    }
    
    // blur
    if (blurStartTime && isDown) {
      const elapsed = (Date.now() - blurStartTime) / 1000;
      if (elapsed <= BLUR_DURATION) {
        setBlur(BLUR_STRENGTH);
      } else if (elapsed <= BLUR_DURATION + BLUR_FADE_OUT) {
        const fadeProgress = (elapsed - BLUR_DURATION) * (1 / BLUR_FADE_OUT);
        setBlur(BLUR_STRENGTH * (1 - fadeProgress));
      } else {
        setBlur(0);
      }
    }
    
    shaderRef.current.u_scale = scale;
    shaderRef.current.u_blur = blur;
    shaderRef.current.u_texture = texture;
  });
  
  return (
    <mesh position={[0, 2, -3]}>
      <planeGeometry args={[23, 23, 64, 64]} />
      <materialImageGeneration ref={shaderRef} transparent />
    </mesh>
  );
};