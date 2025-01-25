import React from "react";
import { OrthographicCamera } from "@react-three/drei";

//fixed camera for permanent ui elements

export function CameraFixer({ children, position = [0, 0, 1], zoom = 40 }) {
  return (
    <OrthographicCamera makeDefault position={position} zoom={zoom}>
      <group position={[0, 0, -1]}>{children}</group>
    </OrthographicCamera>
  );
}
