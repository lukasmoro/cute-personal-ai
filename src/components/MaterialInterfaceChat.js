import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const MaterialInterfaceCutePersonalAI = shaderMaterial(
  {
    time: 0,
    resolution: [0, 0]
  },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  uniform float time;
  uniform vec2 resolution;
  varying vec2 vUv;
  void main() {
    vec2 position = vUv;
    float color = 0.0;
    color += sin(position.x * 10.0 + time) * 0.5;
    color += cos(position.y * 10.0 + time) * 0.5;
    gl_FragColor = vec4(vec3(color + 0.5), 1.0);
  }
  `
);

extend({ MaterialInterfaceCutePersonalAI });

export { MaterialInterfaceCutePersonalAI };