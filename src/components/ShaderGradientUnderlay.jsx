import React, { useRef, useState, useEffect } from "react";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MathUtils } from "three";
import { useMimics } from "./ContextThoughtStream";
import { useSpeechStream } from "./ContextSpeechStream";

const MaterialGradientUnderlay = shaderMaterial(
  {
    u_time: 0,
    u_resolution: new THREE.Vector2(0, 0),
    u_color1: new THREE.Color("#FFB700"),
    u_color2: new THREE.Color("#4000FF"),
    u_intensity: 1.0,
    u_waveSpeed: 0.75,
    u_breatheSpeed: 0.4,
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
    uniform float u_intensity;
    uniform float u_waveSpeed;
    uniform float u_breatheSpeed;
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
      
      float rotationSpeed = 0.2 * u_intensity;
      uv = rotate2D(uv, u_time * rotationSpeed);
      
      float wave = sin(u_time * 0.5) * 0.02 * u_intensity;
      uv.x += sin(uv.y * 4.0 + u_time * u_waveSpeed) * wave;
      uv.y += sin(uv.x * 4.0 + u_time * u_waveSpeed) * wave;
      
      float gradient = length(uv) * (2.2 + sin(u_time * 0.3) * 0.1 * u_intensity);
      float colorMix = smoothstep(0.3, 0.7, vUv.y + sin(u_time * 0.2) * 0.1);
      colorMix = pow(colorMix, 1.2);
      
      vec3 color = mix(u_color1, u_color2, colorMix);
      float breathe = 0.7 + sin(u_time * u_breatheSpeed) * 0.05 * u_intensity;
      float vignette = 1.0 - smoothstep(0.0, breathe, gradient);
      vignette = smoothstep(0.0, 0.7, vignette);
      
      gl_FragColor = vec4(color, vignette);
    }
  `
);

extend({ MaterialGradientUnderlay });

export const ShaderGradientUnderlay = ({ targetPosition = [0, 0.6, -1.0] }) => {
  const shaderRef = useRef();
  const meshRef = useRef();
  const mimics = useMimics();
  const { audioTime, playing } = useSpeechStream();
  const [currentPosition, setCurrentPosition] = useState([0, 0.6, -1.0]);
  const lastMimicRef = useRef(null);

  // Shader state with interpolation
  const [shaderState, setShaderState] = useState({
    intensity: 1.0,
    waveSpeed: 0.75,
    breatheSpeed: 0.4,
    color1: new THREE.Color("#FFB700"),
    color2: new THREE.Color("#4000FF"),
  });

  // Get mimic parameters for a given type
  const getMimicParams = (mimicType) => {
    switch (mimicType) {
      case "friendly":
        return {
          intensity: 1.2,
          waveSpeed: 0.9,
          breatheSpeed: 0.5,
          color1: new THREE.Color("#FFB700"),
          color2: new THREE.Color("#FF6B00"),
        };
      case "curious":
        return {
          intensity: 1.4,
          waveSpeed: 1.2,
          breatheSpeed: 0.6,
          color1: new THREE.Color("#4000FF"),
          color2: new THREE.Color("#00FFB7"),
        };
      case "focused":
        return {
          intensity: 0.8,
          waveSpeed: 0.5,
          breatheSpeed: 0.3,
          color1: new THREE.Color("#0066FF"),
          color2: new THREE.Color("#002BFF"),
        };
      case "calm":
        return {
          intensity: 0.6,
          waveSpeed: 0.4,
          breatheSpeed: 0.2,
          color1: new THREE.Color("#00FFB7"),
          color2: new THREE.Color("#00FF87"),
        };
      default:
        return {
          intensity: 1.0,
          waveSpeed: 0.75,
          breatheSpeed: 0.4,
          color1: new THREE.Color("#FFB700"),
          color2: new THREE.Color("#4000FF"),
        };
    }
  };

  // Debug useEffect to monitor timing
  useEffect(() => {
    if (playing) {
      console.log("Audio Time:", audioTime);
      console.log(
        "Available Mimics:",
        mimics.map((m) => ({
          content: m.content,
          timestamp: m.timestamp,
        }))
      );
    }
  }, [audioTime, playing, mimics]);

  // Update shader based on current audio time
  useEffect(() => {
    if (!mimics.length || !playing) return;

    // Find the appropriate mimic for the current audio time
    const currentMimic = mimics.find(
      (m) =>
        m.timestamp <= audioTime &&
        (!mimics[mimics.indexOf(m) + 1] ||
          mimics[mimics.indexOf(m) + 1].timestamp > audioTime)
    );

    const nextMimic = currentMimic
      ? mimics[mimics.indexOf(currentMimic) + 1]
      : null;

    if (currentMimic && currentMimic !== lastMimicRef.current) {
      console.log(
        "Switching to mimic:",
        currentMimic.content,
        "at time:",
        audioTime
      );
      lastMimicRef.current = currentMimic;

      // Get the parameters for current mimic
      const currentParams = getMimicParams(currentMimic.content);

      if (nextMimic) {
        // Calculate how far we are between current and next mimic
        const duration = nextMimic.timestamp - currentMimic.timestamp;
        const elapsed = audioTime - currentMimic.timestamp;
        const progress = Math.min(Math.max(elapsed / duration, 0), 1);

        // Get next parameters and interpolate
        const nextParams = getMimicParams(nextMimic.content);

        setShaderState({
          intensity: MathUtils.lerp(
            currentParams.intensity,
            nextParams.intensity,
            progress
          ),
          waveSpeed: MathUtils.lerp(
            currentParams.waveSpeed,
            nextParams.waveSpeed,
            progress
          ),
          breatheSpeed: MathUtils.lerp(
            currentParams.breatheSpeed,
            nextParams.breatheSpeed,
            progress
          ),
          color1: currentParams.color1.lerp(nextParams.color1, progress),
          color2: currentParams.color2.lerp(nextParams.color2, progress),
        });
      } else {
        // If no next mimic, just use current parameters
        setShaderState(currentParams);
      }
    }
  }, [audioTime, mimics, playing]);

  // Reset shader state when audio stops
  useEffect(() => {
    if (!playing) {
      lastMimicRef.current = null;
      setShaderState({
        intensity: 1.0,
        waveSpeed: 0.75,
        breatheSpeed: 0.4,
        color1: new THREE.Color("#FFB700"),
        color2: new THREE.Color("#4000FF"),
      });
    }
  }, [playing]);

  // Position animation
  useFrame(() => {
    if (!meshRef.current) return;
    const newX = MathUtils.lerp(currentPosition[0], targetPosition[0], 0.05);
    const newY = MathUtils.lerp(
      currentPosition[1],
      targetPosition[1] + 0.6,
      0.05
    );
    const newZ = MathUtils.lerp(
      currentPosition[2],
      targetPosition[2] - 1.0,
      0.05
    );
    setCurrentPosition([newX, newY, newZ]);
  });

  // Shader animation
  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.u_time += delta * (playing ? 3.0 : 1.0);
      shaderRef.current.u_resolution.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      );

      shaderRef.current.u_intensity = shaderState.intensity;
      shaderRef.current.u_waveSpeed = shaderState.waveSpeed;
      shaderRef.current.u_breatheSpeed = shaderState.breatheSpeed;
      shaderRef.current.u_color1.copy(shaderState.color1);
      shaderRef.current.u_color2.copy(shaderState.color2);
    }
  });

  return (
    <mesh position={currentPosition} ref={meshRef}>
      <planeGeometry args={[10, 10]} />
      <materialGradientUnderlay ref={shaderRef} transparent />
    </mesh>
  );
};
