"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// List of available icons
const iconNames = [
  'exploration', 'withdrawal', 'turbulence', 'stability', 'sensitivity',
  'planning', 'order', 'openness', 'logic', 'intuition', 'impulse',
  'flow', 'connection', 'clarity', 'caution', 'anchor'
];

function FloatingIcons({ count = 25 }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate icon data
  const { iconData } = React.useMemo(() => {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      // Random icon selection
      const iconName = iconNames[Math.floor(Math.random() * iconNames.length)];
      
      // Position
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 18;
      const z = (Math.random() - 0.5) * 10;
      
      // Size variation - smaller sizes overall
      let size;
      const sizeRandom = Math.random();
      if (sizeRandom < 0.1) {
        size = 30 + Math.random() * 15; // 10% large icons (30-45px) - further reduced
      } else {
        size = 15 + Math.random() * 20; // 90% small icons (15-35px) - reduced
      }
      
      // Movement speeds
      const speedX = (Math.random() - 0.5) * 0.03;
      const speedY = (Math.random() - 0.5) * 0.03;
      
      // Rotation speeds
      const rotationSpeed = (Math.random() - 0.5) * 0.02;
      
      data.push({
        iconName,
        position: { x, y, z },
        originalPosition: { x, y, z },
        size,
        speed: { x: speedX, y: speedY },
        rotationSpeed,
        phase: Math.random() * Math.PI * 2 // Random phase for sine/cosine
      });
    }
    
    return { iconData: data };
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      groupRef.current.children.forEach((mesh, i) => {
        const data = iconData[i];
        if (data) {
          // Floating motion
          mesh.position.x = data.originalPosition.x + 
            Math.sin(time * 0.5 + data.phase) * 2.5 + 
            time * data.speed.x;
            
          mesh.position.y = data.originalPosition.y + 
            Math.cos(time * 0.4 + data.phase * 0.7) * 2 + 
            time * data.speed.y;
          
          // Gentle rotation
          mesh.rotation.z += data.rotationSpeed;
        }
      });
      
      // Overall group rotation
      groupRef.current.rotation.z = time * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {iconData.map((data, index) => (
        <mesh key={index} position={[data.position.x, data.position.y, data.position.z]}>
          <Html
            center
            transform
            occlude
            style={{
              width: `${data.size}px`,
              height: `${data.size}px`,
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/icons/${data.iconName}.svg`}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                opacity: 0.8,
                mixBlendMode: 'normal'
              }}
            />
          </Html>
        </mesh>
      ))}
    </group>
  );
}

function BackgroundIcons({ count = 20 }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { iconData } = React.useMemo(() => {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const iconName = iconNames[Math.floor(Math.random() * iconNames.length)];
      
      // Larger spread for background
      const x = (Math.random() - 0.5) * 25;
      const y = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 12 - 4;
      
      // Smaller sizes for background
      const size = 12 + Math.random() * 18; // 12-30px - reduced from 15-35px
      
      const speedX = (Math.random() - 0.5) * 0.02;
      const speedY = (Math.random() - 0.5) * 0.02;
      const rotationSpeed = (Math.random() - 0.5) * 0.015;
      
      data.push({
        iconName,
        position: { x, y, z },
        originalPosition: { x, y, z },
        size,
        speed: { x: speedX, y: speedY },
        rotationSpeed,
        phase: Math.random() * Math.PI * 2
      });
    }
    
    return { iconData: data };
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      groupRef.current.children.forEach((mesh, i) => {
        const data = iconData[i];
        if (data) {
          mesh.position.x = data.originalPosition.x + 
            Math.sin(time * 0.3 + data.phase) * 3 + 
            time * data.speed.x;
            
          mesh.position.y = data.originalPosition.y + 
            Math.cos(time * 0.25 + data.phase * 0.8) * 2.5 + 
            time * data.speed.y;
          
          mesh.rotation.z += data.rotationSpeed;
        }
      });
      
      // Counter-rotation for depth
      groupRef.current.rotation.z = -time * 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      {iconData.map((data, index) => (
        <mesh key={index} position={[data.position.x, data.position.y, data.position.z]}>
          <Html
            center
            transform
            occlude
            style={{
              width: `${data.size}px`,
              height: `${data.size}px`,
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/icons/${data.iconName}.svg`}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                opacity: 0.4,
                mixBlendMode: 'normal'
              }}
            />
          </Html>
        </mesh>
      ))}
    </group>
  );
}

function MidgroundIcons({ count = 15 }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { iconData } = React.useMemo(() => {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const iconName = iconNames[Math.floor(Math.random() * iconNames.length)];
      
      const x = (Math.random() - 0.5) * 22;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 8 - 1;
      
      const size = 15 + Math.random() * 15; // 15-30px - reduced from 18-43px
      
      const speedX = (Math.random() - 0.5) * 0.025;
      const speedY = (Math.random() - 0.5) * 0.025;
      const rotationSpeed = (Math.random() - 0.5) * 0.018;
      
      data.push({
        iconName,
        position: { x, y, z },
        originalPosition: { x, y, z },
        size,
        speed: { x: speedX, y: speedY },
        rotationSpeed,
        phase: Math.random() * Math.PI * 2
      });
    }
    
    return { iconData: data };
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      groupRef.current.children.forEach((mesh, i) => {
        const data = iconData[i];
        if (data) {
          mesh.position.x = data.originalPosition.x + 
            Math.sin(time * 0.4 + data.phase) * 2.2 + 
            time * data.speed.x;
            
          mesh.position.y = data.originalPosition.y + 
            Math.cos(time * 0.35 + data.phase * 0.6) * 1.8 + 
            time * data.speed.y;
          
          mesh.rotation.z += data.rotationSpeed;
        }
      });
      
      groupRef.current.rotation.z = time * 0.012;
    }
  });

  return (
    <group ref={groupRef}>
      {iconData.map((data, index) => (
        <mesh key={index} position={[data.position.x, data.position.y, data.position.z]}>
          <Html
            center
            transform
            occlude
            style={{
              width: `${data.size}px`,
              height: `${data.size}px`,
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/icons/${data.iconName}.svg`}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                opacity: 0.6,
                mixBlendMode: 'normal'
              }}
            />
          </Html>
        </mesh>
      ))}
    </group>
  );
}

const SpaceBackground: React.FC = () => {
  return (
    <>
      <BackgroundIcons count={20} />
      <MidgroundIcons count={15} />
      <FloatingIcons count={25} />
    </>
  );
};

export default SpaceBackground; 