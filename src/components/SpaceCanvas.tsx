"use client";

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import SpaceBackground from './SpaceBackground';

function CameraShake({ factor = 0.5 }) {
  const camera = useThree((state) => state.camera);
  const originalPosition = useRef([0, 0, 5]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = originalPosition.current[0] + Math.sin(t * 0.5) * 0.03 * factor;
    camera.position.y = originalPosition.current[1] + Math.cos(t * 0.4) * 0.03 * factor;
  });

  return null;
}

function ZoomEffect({ initialDelay = 0 }) {
  const camera = useThree((state) => state.camera);
  const [startTime, setStartTime] = useState<number | null>(null);
  const initialZoom = useRef(20); // Starting further out
  const targetZoom = useRef(5);
  const zoomState = useRef({
    current: initialZoom.current,
    target: targetZoom.current,
    zoomingIn: true,
    zoomSpeed: 0.5,
    changeInterval: 15000, // 15 seconds between zoom changes
    lastChange: 0,
    initialZoomComplete: false
  });

  useEffect(() => {
    // Set the camera's initial position
    camera.position.z = initialZoom.current;
  }, [camera]);

  useFrame(({ clock }) => {
    if (startTime === null && clock.elapsedTime > initialDelay) {
      setStartTime(clock.elapsedTime);
    }

    if (startTime !== null) {
      const state = zoomState.current;
      const timeSinceStart = clock.elapsedTime - startTime;
      
      // Initial zoom in effect (faster)
      if (!state.initialZoomComplete) {
        const progress = Math.min(1, timeSinceStart / 3); // Complete in 3 seconds
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
        state.current = initialZoom.current - (initialZoom.current - targetZoom.current) * easeProgress;
        
        if (progress === 1) {
          state.initialZoomComplete = true;
          state.lastChange = clock.elapsedTime;
          state.zoomingIn = false;
          state.current = targetZoom.current;
        }
        
        camera.position.z = state.current;
        return;
      }
      
      // After initial zoom, start the slow zoom in/out cycle
      const timeSinceLastChange = clock.elapsedTime - state.lastChange;
      
      // Check if we should change zoom direction
      if (timeSinceLastChange > state.changeInterval) {
        state.zoomingIn = !state.zoomingIn;
        state.target = state.zoomingIn ? targetZoom.current : initialZoom.current * 0.6; // Less extreme for the cycles
        state.lastChange = clock.elapsedTime;
      }

      // Smoothly interpolate towards target zoom
      const diff = state.target - state.current;
      if (Math.abs(diff) > 0.01) {
        state.current += diff * 0.002 * state.zoomSpeed; // Slower movement
        camera.position.z = state.current;
      }
    }
  });

  return null;
}

const SpaceCanvas: React.FC = () => {
  // State to handle initial animation
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state after a short delay to allow for initial animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={{ 
          background: 'radial-gradient(circle at 50% 50%, #ffffff, #f8f8ff)',
          transition: 'opacity 1.5s ease',
          opacity: isLoaded ? 1 : 0
        }}
        dpr={[1, 2]} // Responsive performance optimization
      >
        <ambientLight intensity={0.2} />
        
        <Suspense fallback={null}>
          <SpaceBackground />
          <CameraShake factor={0.2} />
          <ZoomEffect initialDelay={0.5} />
          
          <EffectComposer>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
            <ChromaticAberration offset={[0.0005, 0.0005]} />
            <Vignette
              darkness={0.2}
              eskil={false}
              offset={0.3}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SpaceCanvas; 