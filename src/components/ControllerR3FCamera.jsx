import { useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

export function ControllerR3FCamera({
  initialPosition = { x: 0, y: 0, z: 14 },
}) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
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

  const handleWheel = useCallback((event) => {
    if (Math.abs(event.deltaY) < 40) {
      setPosition((prev) => ({
        ...prev,
        x: prev.x + event.deltaX * 0.1,
        y: prev.y - event.deltaY * 0.1,
      }));
      event.preventDefault();
    }
  }, []);

  const handleMouseDown = useCallback((event) => {
    if (event.button === 1) {
      setIsDragging(true);
      setLastMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    }
  }, []);

  const handleMouseMove = useCallback((event) => {
    if (!isDragging) return;

    const deltaX = (event.clientX - lastMousePosition.x) * 0.01;
    const deltaY = (event.clientY - lastMousePosition.y) * 0.01;

    setPosition((prev) => ({
      ...prev,
      x: prev.x - deltaX,
      y: prev.y + deltaY,
    }));

    setLastMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  }, [isDragging, lastMousePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    
    const preventContext = (e) => e.preventDefault();
    window.addEventListener("contextmenu", preventContext);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("contextmenu", preventContext);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  return null;
}