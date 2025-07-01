'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import Image from 'next/image';
import { LayerResult, BoundaryType } from '@/utils/boundaryCalculation';
import { LayerType } from '@/components/EmotionalLayer';
import ResultsPopup from '@/components/ResultsPopup';

interface User {
  id: number;
  x: number;
  y: number;
  layer: 'outer' | 'daily' | 'inner' | 'deep';
  value: number;
  profile: string;
  icons: {
    outer: string;
    daily: string;
    inner: string;
    deep: string;
  };
}

interface QuizResults {
  layerResults: Record<LayerType, LayerResult | null>;
  userId: string;
}

// Available icons from the public/icons folder
const availableIcons = [
  'exploration',
  'withdrawal',
  'turbulence',
  'stability',
  'sensitivity',
  'planning',
  'order',
  'openness',
  'logic',
  'intuition',
  'impulse',
  'flow',
  'connection',
  'clarity',
  'caution',
  'anchor'
];

// Function to get 4 random unique icons
const getRandomIcons = () => {
  const shuffled = [...availableIcons].sort(() => 0.5 - Math.random());
  return {
    outer: shuffled[0],
    daily: shuffled[1],
    inner: shuffled[2],
    deep: shuffled[3]
  };
};

// Mock data for user results with random icons for each layer
const mockUsers: User[] = [
  // OPEN-DEEP QUADRANT (Top-right, x > 0, y > 0) - 100 users - Extended x range
  { id: 1, x: 1.3, y: 0.4, layer: 'outer', value: 70, profile: 'Open Deep 1', icons: getRandomIcons() },
  { id: 2, x: 0.8, y: 0.3, layer: 'inner', value: 80, profile: 'Open Deep 2', icons: getRandomIcons() },
  { id: 3, x: 0.6, y: 0.45, layer: 'daily', value: 64, profile: 'Open Deep 3', icons: getRandomIcons() },
  { id: 4, x: 1.0, y: 0.25, layer: 'deep', value: 75, profile: 'Open Deep 4', icons: getRandomIcons() },
  { id: 5, x: 0.4, y: 0.35, layer: 'outer', value: 62, profile: 'Open Deep 5', icons: getRandomIcons() },
  { id: 6, x: 0.9, y: 0.5, layer: 'inner', value: 73, profile: 'Open Deep 6', icons: getRandomIcons() },
  { id: 7, x: 1.2, y: 0.2, layer: 'daily', value: 58, profile: 'Open Deep 7', icons: getRandomIcons() },
  { id: 8, x: 0.7, y: 0.15, layer: 'outer', value: 71, profile: 'Open Deep 8', icons: getRandomIcons() },
  { id: 9, x: 0.5, y: 0.5, layer: 'deep', value: 66, profile: 'Open Deep 9', icons: getRandomIcons() },
  { id: 10, x: 1.1, y: 0.35, layer: 'inner', value: 79, profile: 'Open Deep 10', icons: getRandomIcons() },
  { id: 11, x: 0.3, y: 0.25, layer: 'daily', value: 54, profile: 'Open Deep 11', icons: getRandomIcons() },
  { id: 12, x: 1.4, y: 0.3, layer: 'outer', value: 77, profile: 'Open Deep 12', icons: getRandomIcons() },
  { id: 13, x: 1.6, y: 0.6, layer: 'inner', value: 68, profile: 'Open Deep 13', icons: getRandomIcons() },
  { id: 14, x: 0.2, y: 0.4, layer: 'deep', value: 72, profile: 'Open Deep 14', icons: getRandomIcons() },
  { id: 15, x: 1.5, y: 0.15, layer: 'outer', value: 65, profile: 'Open Deep 15', icons: getRandomIcons() },
  { id: 16, x: 1.0, y: 0.6, layer: 'daily', value: 59, profile: 'Open Deep 16', icons: getRandomIcons() },
  { id: 17, x: 1.8, y: 0.25, layer: 'inner', value: 74, profile: 'Open Deep 17', icons: getRandomIcons() },
  { id: 18, x: 0.6, y: 0.7, layer: 'deep', value: 61, profile: 'Open Deep 18', icons: getRandomIcons() },
  { id: 19, x: 1.7, y: 0.45, layer: 'outer', value: 76, profile: 'Open Deep 19', icons: getRandomIcons() },
  { id: 20, x: 0.8, y: 0.8, layer: 'daily', value: 63, profile: 'Open Deep 20', icons: getRandomIcons() },
  { id: 21, x: 0.3, y: 0.6, layer: 'inner', value: 69, profile: 'Open Deep 21', icons: getRandomIcons() },
  { id: 22, x: 1.3, y: 0.75, layer: 'deep', value: 78, profile: 'Open Deep 22', icons: getRandomIcons() },
  { id: 23, x: 0.5, y: 0.1, layer: 'outer', value: 57, profile: 'Open Deep 23', icons: getRandomIcons() },
  { id: 24, x: 1.6, y: 0.8, layer: 'inner', value: 82, profile: 'Open Deep 24', icons: getRandomIcons() },
  { id: 25, x: 1.0, y: 0.15, layer: 'daily', value: 64, profile: 'Open Deep 25', icons: getRandomIcons() },
  { id: 26, x: 1.9, y: 0.35, layer: 'deep', value: 71, profile: 'Open Deep 26', icons: getRandomIcons() },
  { id: 27, x: 0.7, y: 0.9, layer: 'outer', value: 60, profile: 'Open Deep 27', icons: getRandomIcons() },
  { id: 28, x: 1.2, y: 0.5, layer: 'inner', value: 73, profile: 'Open Deep 28', icons: getRandomIcons() },
  { id: 29, x: 0.2, y: 0.8, layer: 'daily', value: 56, profile: 'Open Deep 29', icons: getRandomIcons() },
  { id: 30, x: 1.5, y: 0.95, layer: 'deep', value: 79, profile: 'Open Deep 30', icons: getRandomIcons() },
  { id: 31, x: 0.9, y: 0.2, layer: 'outer', value: 67, profile: 'Open Deep 31', icons: getRandomIcons() },
  { id: 32, x: 1.8, y: 0.6, layer: 'inner', value: 75, profile: 'Open Deep 32', icons: getRandomIcons() },
  { id: 33, x: 0.4, y: 0.75, layer: 'daily', value: 62, profile: 'Open Deep 33', icons: getRandomIcons() },
  { id: 34, x: 1.4, y: 0.1, layer: 'deep', value: 68, profile: 'Open Deep 34', icons: getRandomIcons() },
  { id: 35, x: 1.1, y: 0.85, layer: 'outer', value: 66, profile: 'Open Deep 35', icons: getRandomIcons() },
  { id: 36, x: 1.7, y: 0.2, layer: 'inner', value: 77, profile: 'Open Deep 36', icons: getRandomIcons() },
  { id: 37, x: 0.6, y: 0.3, layer: 'daily', value: 58, profile: 'Open Deep 37', icons: getRandomIcons() },
  { id: 38, x: 1.9, y: 0.75, layer: 'deep', value: 81, profile: 'Open Deep 38', icons: getRandomIcons() },
  { id: 39, x: 0.8, y: 0.65, layer: 'outer', value: 64, profile: 'Open Deep 39', icons: getRandomIcons() },
  { id: 40, x: 1.6, y: 0.35, layer: 'inner', value: 70, profile: 'Open Deep 40', icons: getRandomIcons() },
  { id: 41, x: 0.35, y: 0.55, layer: 'outer', value: 72, profile: 'Open Deep 41', icons: getRandomIcons() },
  { id: 42, x: 1.45, y: 0.65, layer: 'daily', value: 67, profile: 'Open Deep 42', icons: getRandomIcons() },
  { id: 43, x: 0.65, y: 0.85, layer: 'inner', value: 74, profile: 'Open Deep 43', icons: getRandomIcons() },
  { id: 44, x: 1.25, y: 0.4, layer: 'deep', value: 69, profile: 'Open Deep 44', icons: getRandomIcons() },
  { id: 45, x: 0.45, y: 0.2, layer: 'outer', value: 63, profile: 'Open Deep 45', icons: getRandomIcons() },
  { id: 46, x: 1.7, y: 0.55, layer: 'inner', value: 78, profile: 'Open Deep 46', icons: getRandomIcons() },
  { id: 47, x: 0.85, y: 0.75, layer: 'daily', value: 61, profile: 'Open Deep 47', icons: getRandomIcons() },
  { id: 48, x: 1.55, y: 0.25, layer: 'deep', value: 76, profile: 'Open Deep 48', icons: getRandomIcons() },
  { id: 49, x: 0.25, y: 0.45, layer: 'outer', value: 58, profile: 'Open Deep 49', icons: getRandomIcons() },
  { id: 50, x: 1.85, y: 0.7, layer: 'inner', value: 80, profile: 'Open Deep 50', icons: getRandomIcons() },
  { id: 51, x: 0.55, y: 0.15, layer: 'daily', value: 65, profile: 'Open Deep 51', icons: getRandomIcons() },
  { id: 52, x: 1.35, y: 0.8, layer: 'deep', value: 73, profile: 'Open Deep 52', icons: getRandomIcons() },
  { id: 53, x: 0.75, y: 0.35, layer: 'outer', value: 66, profile: 'Open Deep 53', icons: getRandomIcons() },
  { id: 54, x: 1.15, y: 0.6, layer: 'inner', value: 71, profile: 'Open Deep 54', icons: getRandomIcons() },
  { id: 55, x: 0.4, y: 0.7, layer: 'daily', value: 59, profile: 'Open Deep 55', icons: getRandomIcons() },
  { id: 56, x: 1.65, y: 0.15, layer: 'deep', value: 77, profile: 'Open Deep 56', icons: getRandomIcons() },
  { id: 57, x: 0.15, y: 0.25, layer: 'outer', value: 62, profile: 'Open Deep 57', icons: getRandomIcons() },
  { id: 58, x: 1.75, y: 0.85, layer: 'inner', value: 75, profile: 'Open Deep 58', icons: getRandomIcons() },
  { id: 59, x: 0.95, y: 0.45, layer: 'daily', value: 64, profile: 'Open Deep 59', icons: getRandomIcons() },
  { id: 60, x: 1.05, y: 0.75, layer: 'deep', value: 68, profile: 'Open Deep 60', icons: getRandomIcons() },
  { id: 61, x: 0.3, y: 0.5, layer: 'outer', value: 60, profile: 'Open Deep 61', icons: getRandomIcons() },
  { id: 62, x: 1.4, y: 0.2, layer: 'inner', value: 79, profile: 'Open Deep 62', icons: getRandomIcons() },
  { id: 63, x: 0.7, y: 0.6, layer: 'daily', value: 57, profile: 'Open Deep 63', icons: getRandomIcons() },
  { id: 64, x: 1.8, y: 0.4, layer: 'deep', value: 72, profile: 'Open Deep 64', icons: getRandomIcons() },
  { id: 65, x: 0.5, y: 0.8, layer: 'outer', value: 65, profile: 'Open Deep 65', icons: getRandomIcons() },
  { id: 66, x: 1.2, y: 0.15, layer: 'inner', value: 70, profile: 'Open Deep 66', icons: getRandomIcons() },
  { id: 67, x: 0.6, y: 0.25, layer: 'daily', value: 63, profile: 'Open Deep 67', icons: getRandomIcons() },
  { id: 68, x: 1.6, y: 0.75, layer: 'deep', value: 74, profile: 'Open Deep 68', icons: getRandomIcons() },
  { id: 69, x: 0.8, y: 0.55, layer: 'outer', value: 61, profile: 'Open Deep 69', icons: getRandomIcons() },
  { id: 70, x: 1.3, y: 0.85, layer: 'inner', value: 76, profile: 'Open Deep 70', icons: getRandomIcons() },
  { id: 71, x: 0.2, y: 0.35, layer: 'daily', value: 58, profile: 'Open Deep 71', icons: getRandomIcons() },
  { id: 72, x: 1.9, y: 0.6, layer: 'deep', value: 81, profile: 'Open Deep 72', icons: getRandomIcons() },
  { id: 73, x: 0.9, y: 0.15, layer: 'outer', value: 64, profile: 'Open Deep 73', icons: getRandomIcons() },
  { id: 74, x: 1.1, y: 0.7, layer: 'inner', value: 67, profile: 'Open Deep 74', icons: getRandomIcons() },
  { id: 75, x: 0.35, y: 0.9, layer: 'daily', value: 62, profile: 'Open Deep 75', icons: getRandomIcons() },
  { id: 76, x: 1.5, y: 0.3, layer: 'deep', value: 78, profile: 'Open Deep 76', icons: getRandomIcons() },
  { id: 77, x: 0.65, y: 0.5, layer: 'outer', value: 59, profile: 'Open Deep 77', icons: getRandomIcons() },
  { id: 78, x: 1.7, y: 0.1, layer: 'inner', value: 73, profile: 'Open Deep 78', icons: getRandomIcons() },
  { id: 79, x: 0.45, y: 0.65, layer: 'daily', value: 66, profile: 'Open Deep 79', icons: getRandomIcons() },
  { id: 80, x: 1.25, y: 0.9, layer: 'deep', value: 71, profile: 'Open Deep 80', icons: getRandomIcons() },
  { id: 81, x: 0.1, y: 0.4, layer: 'outer', value: 56, profile: 'Open Deep 81', icons: getRandomIcons() },
  { id: 82, x: 1.8, y: 0.15, layer: 'inner', value: 75, profile: 'Open Deep 82', icons: getRandomIcons() },
  { id: 83, x: 0.55, y: 0.8, layer: 'daily', value: 68, profile: 'Open Deep 83', icons: getRandomIcons() },
  { id: 84, x: 1.4, y: 0.5, layer: 'deep', value: 72, profile: 'Open Deep 84', icons: getRandomIcons() },
  { id: 85, x: 0.75, y: 0.25, layer: 'outer', value: 63, profile: 'Open Deep 85', icons: getRandomIcons() },
  { id: 86, x: 1.15, y: 0.75, layer: 'inner', value: 69, profile: 'Open Deep 86', icons: getRandomIcons() },
  { id: 87, x: 0.25, y: 0.6, layer: 'daily', value: 61, profile: 'Open Deep 87', icons: getRandomIcons() },
  { id: 88, x: 1.6, y: 0.4, layer: 'deep', value: 77, profile: 'Open Deep 88', icons: getRandomIcons() },
  { id: 89, x: 0.85, y: 0.85, layer: 'outer', value: 65, profile: 'Open Deep 89', icons: getRandomIcons() },
  { id: 90, x: 1.35, y: 0.2, layer: 'inner', value: 74, profile: 'Open Deep 90', icons: getRandomIcons() },
  { id: 91, x: 0.4, y: 0.3, layer: 'daily', value: 57, profile: 'Open Deep 91', icons: getRandomIcons() },
  { id: 92, x: 1.75, y: 0.65, layer: 'deep', value: 79, profile: 'Open Deep 92', icons: getRandomIcons() },
  { id: 93, x: 0.6, y: 0.95, layer: 'outer', value: 62, profile: 'Open Deep 93', icons: getRandomIcons() },
  { id: 94, x: 1.05, y: 0.1, layer: 'inner', value: 70, profile: 'Open Deep 94', icons: getRandomIcons() },
  { id: 95, x: 0.15, y: 0.7, layer: 'daily', value: 64, profile: 'Open Deep 95', icons: getRandomIcons() },
  { id: 96, x: 1.9, y: 0.3, layer: 'deep', value: 76, profile: 'Open Deep 96', icons: getRandomIcons() },
  { id: 97, x: 0.7, y: 0.4, layer: 'outer', value: 58, profile: 'Open Deep 97', icons: getRandomIcons() },
  { id: 98, x: 1.2, y: 0.8, layer: 'inner', value: 73, profile: 'Open Deep 98', icons: getRandomIcons() },
  { id: 99, x: 0.5, y: 0.15, layer: 'daily', value: 66, profile: 'Open Deep 99', icons: getRandomIcons() },
  { id: 100, x: 1.85, y: 0.9, layer: 'deep', value: 80, profile: 'Open Deep 100', icons: getRandomIcons() },

  // CLOSED-DEEP QUADRANT (Top-left, x < 0, y > 0) - 50 users - Extended x range
  { id: 101, x: -0.6, y: 0.25, layer: 'inner', value: 75, profile: 'Closed Deep 1', icons: getRandomIcons() },
  { id: 102, x: -0.8, y: 0.4, layer: 'outer', value: 60, profile: 'Closed Deep 2', icons: getRandomIcons() },
  { id: 103, x: -0.4, y: 0.3, layer: 'daily', value: 68, profile: 'Closed Deep 3', icons: getRandomIcons() },
  { id: 104, x: -0.7, y: 0.15, layer: 'deep', value: 72, profile: 'Closed Deep 4', icons: getRandomIcons() },
  { id: 105, x: -0.9, y: 0.2, layer: 'outer', value: 55, profile: 'Closed Deep 5', icons: getRandomIcons() },
  { id: 106, x: -0.5, y: 0.45, layer: 'inner', value: 78, profile: 'Closed Deep 6', icons: getRandomIcons() },
  { id: 107, x: -0.3, y: 0.35, layer: 'daily', value: 63, profile: 'Closed Deep 7', icons: getRandomIcons() },
  { id: 108, x: -1.0, y: 0.35, layer: 'outer', value: 67, profile: 'Closed Deep 8', icons: getRandomIcons() },
  { id: 109, x: -0.6, y: 0.5, layer: 'deep', value: 81, profile: 'Closed Deep 9', icons: getRandomIcons() },
  { id: 110, x: -0.2, y: 0.2, layer: 'inner', value: 59, profile: 'Closed Deep 10', icons: getRandomIcons() },
  { id: 111, x: -1.2, y: 0.6, layer: 'daily', value: 65, profile: 'Closed Deep 11', icons: getRandomIcons() },
  { id: 112, x: -1.4, y: 0.3, layer: 'outer', value: 58, profile: 'Closed Deep 12', icons: getRandomIcons() },
  { id: 113, x: -1.6, y: 0.8, layer: 'inner', value: 73, profile: 'Closed Deep 13', icons: getRandomIcons() },
  { id: 114, x: -0.35, y: 0.55, layer: 'deep', value: 70, profile: 'Closed Deep 14', icons: getRandomIcons() },
  { id: 115, x: -1.1, y: 0.4, layer: 'outer', value: 62, profile: 'Closed Deep 15', icons: getRandomIcons() },
  { id: 116, x: -0.75, y: 0.65, layer: 'inner', value: 76, profile: 'Closed Deep 16', icons: getRandomIcons() },
  { id: 117, x: -1.3, y: 0.25, layer: 'daily', value: 64, profile: 'Closed Deep 17', icons: getRandomIcons() },
  { id: 118, x: -0.45, y: 0.7, layer: 'deep', value: 69, profile: 'Closed Deep 18', icons: getRandomIcons() },
  { id: 119, x: -1.5, y: 0.45, layer: 'outer', value: 57, profile: 'Closed Deep 19', icons: getRandomIcons() },
  { id: 120, x: -0.25, y: 0.6, layer: 'inner', value: 74, profile: 'Closed Deep 20', icons: getRandomIcons() },
  { id: 121, x: -1.7, y: 0.35, layer: 'daily', value: 61, profile: 'Closed Deep 21', icons: getRandomIcons() },
  { id: 122, x: -0.55, y: 0.85, layer: 'deep', value: 77, profile: 'Closed Deep 22', icons: getRandomIcons() },
  { id: 123, x: -1.0, y: 0.15, layer: 'outer', value: 59, profile: 'Closed Deep 23', icons: getRandomIcons() },
  { id: 124, x: -0.65, y: 0.75, layer: 'inner', value: 71, profile: 'Closed Deep 24', icons: getRandomIcons() },
  { id: 125, x: -1.8, y: 0.5, layer: 'daily', value: 66, profile: 'Closed Deep 25', icons: getRandomIcons() },
  { id: 126, x: -0.15, y: 0.3, layer: 'deep', value: 73, profile: 'Closed Deep 26', icons: getRandomIcons() },
  { id: 127, x: -1.45, y: 0.7, layer: 'outer', value: 63, profile: 'Closed Deep 27', icons: getRandomIcons() },
  { id: 128, x: -0.85, y: 0.1, layer: 'inner', value: 68, profile: 'Closed Deep 28', icons: getRandomIcons() },
  { id: 129, x: -0.4, y: 0.9, layer: 'daily', value: 60, profile: 'Closed Deep 29', icons: getRandomIcons() },
  { id: 130, x: -1.25, y: 0.55, layer: 'deep', value: 75, profile: 'Closed Deep 30', icons: getRandomIcons() },
  { id: 131, x: -0.7, y: 0.8, layer: 'outer', value: 58, profile: 'Closed Deep 31', icons: getRandomIcons() },
  { id: 132, x: -1.6, y: 0.2, layer: 'inner', value: 72, profile: 'Closed Deep 32', icons: getRandomIcons() },
  { id: 133, x: -0.3, y: 0.65, layer: 'daily', value: 65, profile: 'Closed Deep 33', icons: getRandomIcons() },
  { id: 134, x: -1.1, y: 0.85, layer: 'deep', value: 79, profile: 'Closed Deep 34', icons: getRandomIcons() },
  { id: 135, x: -0.5, y: 0.15, layer: 'outer', value: 56, profile: 'Closed Deep 35', icons: getRandomIcons() },
  { id: 136, x: -1.35, y: 0.75, layer: 'inner', value: 67, profile: 'Closed Deep 36', icons: getRandomIcons() },
  { id: 137, x: -0.2, y: 0.4, layer: 'daily', value: 62, profile: 'Closed Deep 37', icons: getRandomIcons() },
  { id: 138, x: -1.75, y: 0.6, layer: 'deep', value: 74, profile: 'Closed Deep 38', icons: getRandomIcons() },
  { id: 139, x: -0.9, y: 0.9, layer: 'outer', value: 64, profile: 'Closed Deep 39', icons: getRandomIcons() },
  { id: 140, x: -0.6, y: 0.35, layer: 'inner', value: 69, profile: 'Closed Deep 40', icons: getRandomIcons() },
  { id: 141, x: -1.2, y: 0.1, layer: 'daily', value: 61, profile: 'Closed Deep 41', icons: getRandomIcons() },
  { id: 142, x: -0.45, y: 0.8, layer: 'deep', value: 76, profile: 'Closed Deep 42', icons: getRandomIcons() },
  { id: 143, x: -1.5, y: 0.15, layer: 'outer', value: 57, profile: 'Closed Deep 43', icons: getRandomIcons() },
  { id: 144, x: -0.8, y: 0.65, layer: 'inner', value: 71, profile: 'Closed Deep 44', icons: getRandomIcons() },
  { id: 145, x: -0.35, y: 0.25, layer: 'daily', value: 63, profile: 'Closed Deep 45', icons: getRandomIcons() },
  { id: 146, x: -1.65, y: 0.4, layer: 'deep', value: 78, profile: 'Closed Deep 46', icons: getRandomIcons() },
  { id: 147, x: -1.0, y: 0.7, layer: 'outer', value: 59, profile: 'Closed Deep 47', icons: getRandomIcons() },
  { id: 148, x: -0.25, y: 0.5, layer: 'inner', value: 72, profile: 'Closed Deep 48', icons: getRandomIcons() },
  { id: 149, x: -1.4, y: 0.85, layer: 'daily', value: 66, profile: 'Closed Deep 49', icons: getRandomIcons() },
  { id: 150, x: -1.8, y: 0.95, layer: 'deep', value: 80, profile: 'Closed Deep 50', icons: getRandomIcons() },

  // CLOSED-OUTER QUADRANT (Bottom-left, x < 0, y < 0) - 25 users - Extended x range
  { id: 151, x: -0.5, y: -0.55, layer: 'outer', value: 65, profile: 'Closed Outer 1', icons: getRandomIcons() },
  { id: 152, x: -0.8, y: -0.4, layer: 'inner', value: 55, profile: 'Closed Outer 2', icons: getRandomIcons() },
  { id: 153, x: -0.7, y: -0.65, layer: 'outer', value: 60, profile: 'Closed Outer 3', icons: getRandomIcons() },
  { id: 154, x: -0.4, y: -0.75, layer: 'inner', value: 70, profile: 'Closed Outer 4', icons: getRandomIcons() },
  { id: 155, x: -1.0, y: -0.3, layer: 'daily', value: 63, profile: 'Closed Outer 5', icons: getRandomIcons() },
  { id: 156, x: -0.3, y: -0.45, layer: 'deep', value: 68, profile: 'Closed Outer 6', icons: getRandomIcons() },
  { id: 157, x: -0.9, y: -0.6, layer: 'outer', value: 57, profile: 'Closed Outer 7', icons: getRandomIcons() },
  { id: 158, x: -0.6, y: -0.25, layer: 'inner', value: 74, profile: 'Closed Outer 8', icons: getRandomIcons() },
  { id: 159, x: -0.2, y: -0.6, layer: 'daily', value: 52, profile: 'Closed Outer 9', icons: getRandomIcons() },
  { id: 160, x: -1.2, y: -0.45, layer: 'deep', value: 71, profile: 'Closed Outer 10', icons: getRandomIcons() },
  { id: 161, x: -1.4, y: -0.7, layer: 'outer', value: 59, profile: 'Closed Outer 11', icons: getRandomIcons() },
  { id: 162, x: -1.6, y: -0.2, layer: 'inner', value: 66, profile: 'Closed Outer 12', icons: getRandomIcons() },
  { id: 163, x: -1.8, y: -0.8, layer: 'daily', value: 62, profile: 'Closed Outer 13', icons: getRandomIcons() },
  { id: 164, x: -0.35, y: -0.35, layer: 'outer', value: 58, profile: 'Closed Outer 14', icons: getRandomIcons() },
  { id: 165, x: -1.1, y: -0.55, layer: 'inner', value: 64, profile: 'Closed Outer 15', icons: getRandomIcons() },
  { id: 166, x: -0.75, y: -0.15, layer: 'daily', value: 61, profile: 'Closed Outer 16', icons: getRandomIcons() },
  { id: 167, x: -1.3, y: -0.35, layer: 'deep', value: 67, profile: 'Closed Outer 17', icons: getRandomIcons() },
  { id: 168, x: -0.45, y: -0.8, layer: 'outer', value: 56, profile: 'Closed Outer 18', icons: getRandomIcons() },
  { id: 169, x: -1.5, y: -0.5, layer: 'inner', value: 69, profile: 'Closed Outer 19', icons: getRandomIcons() },
  { id: 170, x: -0.25, y: -0.25, layer: 'daily', value: 53, profile: 'Closed Outer 20', icons: getRandomIcons() },
  { id: 171, x: -1.7, y: -0.6, layer: 'deep', value: 72, profile: 'Closed Outer 21', icons: getRandomIcons() },
  { id: 172, x: -0.85, y: -0.85, layer: 'outer', value: 60, profile: 'Closed Outer 22', icons: getRandomIcons() },
  { id: 173, x: -1.05, y: -0.15, layer: 'inner', value: 65, profile: 'Closed Outer 23', icons: getRandomIcons() },
  { id: 174, x: -0.55, y: -0.7, layer: 'daily', value: 59, profile: 'Closed Outer 24', icons: getRandomIcons() },
  { id: 175, x: -1.25, y: -0.9, layer: 'deep', value: 73, profile: 'Closed Outer 25', icons: getRandomIcons() },

  // OPEN-OUTER QUADRANT (Bottom-right, x > 0, y < 0) - 25 users - Extended x range
  { id: 176, x: 1.0, y: -0.6, layer: 'inner', value: 65, profile: 'Open Outer 1', icons: getRandomIcons() },
  { id: 177, x: 0.6, y: -0.45, layer: 'outer', value: 72, profile: 'Open Outer 2', icons: getRandomIcons() },
  { id: 178, x: 0.4, y: -0.3, layer: 'daily', value: 56, profile: 'Open Outer 3', icons: getRandomIcons() },
  { id: 179, x: 0.8, y: -0.25, layer: 'deep', value: 78, profile: 'Open Outer 4', icons: getRandomIcons() },
  { id: 180, x: 1.2, y: -0.4, layer: 'outer', value: 64, profile: 'Open Outer 5', icons: getRandomIcons() },
  { id: 181, x: 0.5, y: -0.65, layer: 'inner', value: 59, profile: 'Open Outer 6', icons: getRandomIcons() },
  { id: 182, x: 0.9, y: -0.5, layer: 'daily', value: 73, profile: 'Open Outer 7', icons: getRandomIcons() },
  { id: 183, x: 1.3, y: -0.25, layer: 'deep', value: 67, profile: 'Open Outer 8', icons: getRandomIcons() },
  { id: 184, x: 0.3, y: -0.55, layer: 'outer', value: 61, profile: 'Open Outer 9', icons: getRandomIcons() },
  { id: 185, x: 1.1, y: -0.7, layer: 'inner', value: 76, profile: 'Open Outer 10', icons: getRandomIcons() },
  { id: 186, x: 0.7, y: -0.15, layer: 'daily', value: 53, profile: 'Open Outer 11', icons: getRandomIcons() },
  { id: 187, x: 1.4, y: -0.55, layer: 'deep', value: 70, profile: 'Open Outer 12', icons: getRandomIcons() },
  { id: 188, x: 1.6, y: -0.8, layer: 'outer', value: 65, profile: 'Open Outer 13', icons: getRandomIcons() },
  { id: 189, x: 1.8, y: -0.3, layer: 'inner', value: 69, profile: 'Open Outer 14', icons: getRandomIcons() },
  { id: 190, x: 0.2, y: -0.4, layer: 'daily', value: 54, profile: 'Open Outer 15', icons: getRandomIcons() },
  { id: 191, x: 1.5, y: -0.2, layer: 'deep', value: 71, profile: 'Open Outer 16', icons: getRandomIcons() },
  { id: 192, x: 0.85, y: -0.75, layer: 'outer', value: 62, profile: 'Open Outer 17', icons: getRandomIcons() },
  { id: 193, x: 1.25, y: -0.35, layer: 'inner', value: 68, profile: 'Open Outer 18', icons: getRandomIcons() },
  { id: 194, x: 0.45, y: -0.85, layer: 'daily', value: 57, profile: 'Open Outer 19', icons: getRandomIcons() },
  { id: 195, x: 1.7, y: -0.6, layer: 'deep', value: 74, profile: 'Open Outer 20', icons: getRandomIcons() },
  { id: 196, x: 0.15, y: -0.7, layer: 'outer', value: 58, profile: 'Open Outer 21', icons: getRandomIcons() },
  { id: 197, x: 1.05, y: -0.15, layer: 'inner', value: 66, profile: 'Open Outer 22', icons: getRandomIcons() },
  { id: 198, x: 0.65, y: -0.9, layer: 'daily', value: 60, profile: 'Open Outer 23', icons: getRandomIcons() },
  { id: 199, x: 1.35, y: -0.75, layer: 'deep', value: 72, profile: 'Open Outer 24', icons: getRandomIcons() },
  { id: 200, x: 1.9, y: -0.9, layer: 'outer', value: 75, profile: 'Open Outer 25', icons: getRandomIcons() },
];

// Enhanced color scheme for better visibility on white background
const layerColors: Record<string, string> = {
  outer: '#FF6B6B', // Bright coral red
  daily: '#45B7D1', // Sky blue
  inner: '#4ECDC4', // Teal
  deep: '#96CEB4', // Mint green
};

// Layer configuration with size and opacity rules
const layerConfig = {
  outer: { size: 1.0, opacity: 1.0 },   // 100% size, 100% opacity
  daily: { size: 0.8, opacity: 0.8 },   // 80% size, 80% opacity
  inner: { size: 0.6, opacity: 0.6 },   // 60% size, 60% opacity
  deep: { size: 0.4, opacity: 0.4 }     // 40% size, 40% opacity
};

interface UserDotProps {
  position: [number, number, number];
  layer: 'outer' | 'daily' | 'inner' | 'deep';
  value: number;
  profile: string;
  icons: {
    outer: string;
    daily: string;
    inner: string;
    deep: string;
  };
  onClick?: () => void;
  isSelected?: boolean;
  isNewUser?: boolean;
}

// Enhanced user dot component with 4 stacked SVG icons
const UserDot: React.FC<UserDotProps & { isZoomedView?: boolean }> = ({ position, layer, value, profile, icons, onClick, isSelected, isZoomedView = false, isNewUser = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [hasLanded, setHasLanded] = useState(!isNewUser);
  
  // Make symbols bigger in zoomed view, even smaller in full view for better overview
  const baseSizeMultiplier = isZoomedView ? 1.2 : 0.5;
  const baseSize = THREE.MathUtils.mapLinear(value, 0, 100, 0.02, 0.04) * baseSizeMultiplier;
  
  // Landing animation effect
  useEffect(() => {
    if (isNewUser && !hasLanded) {
      const timer = setTimeout(() => {
        setHasLanded(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isNewUser, hasLanded]);
  
  // Enhanced animation with smoother transitions
  useFrame((state) => {
    if (groupRef.current) {
      // Scale animation for hover/selection
      const targetScale = hovered || isSelected ? 1.8 : 1;
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.12);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.12);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.12);
      
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + position[0] * 8) * 0.008;
      groupRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.8 + position[1] * 6) * 0.004;
    }
  });

  // Layer order from back to front (largest to smallest)
  const layerOrder: (keyof typeof icons)[] = ['outer', 'daily', 'inner', 'deep'];

  return (
    <group ref={groupRef} position={position}>
      {/* Stacked SVG Icons */}
      <Html
        center
        distanceFactor={10}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) {
            onClick();
          }
        }}
      >
        <div 
          className={`relative cursor-pointer transition-all duration-200 ${
            hovered || isSelected ? 'drop-shadow-lg' : ''
          }`}
          style={{
            width: `${baseSize * 400}px`,
            height: `${baseSize * 400}px`,
            filter: isSelected ? `drop-shadow(0 0 10px ${layerColors[layer]})` : hovered ? `drop-shadow(0 0 5px ${layerColors[layer]})` : 'none'
          }}
        >
          {/* Landing effect - ripple animation */}
          {isNewUser && hasLanded && (
            <>
              <div 
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: layerColors[layer],
                  opacity: 0.3,
                  animationDuration: '1.5s',
                  animationIterationCount: '2'
                }}
              />
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: layerColors[layer],
                  opacity: hasLanded ? 0 : 0.5,
                  transform: hasLanded ? 'scale(2)' : 'scale(0)',
                  transition: 'all 1s ease-out',
                  pointerEvents: 'none'
                }}
              />
            </>
          )}
          
          {/* Render each layer from back to front */}
          {layerOrder.map((layerType, index) => {
            const config = layerConfig[layerType];
            
            return (
              <div
                key={layerType}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  zIndex: index + 1,
                  opacity: hasLanded ? 1 : 0,
                  transform: hasLanded ? 'scale(1)' : 'scale(0)',
                  transition: `all 0.5s ease-out ${index * 0.1}s`
                }}
              >
                <Image
                  src={`/icons/${icons[layerType]}.svg`}
                  alt={`${profile} - ${layerType} layer`}
                  width={baseSize * 400 * config.size}
                  height={baseSize * 400 * config.size}
                  className="object-contain"
                  style={{
                    opacity: config.opacity,
                    filter: `hue-rotate(${getHueRotationForLayer(layerType)}deg) saturate(1.2) brightness(1.1)`,
                    mixBlendMode: layerType === 'outer' ? 'normal' : 'multiply',
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute',
                    left: '50%',
                    top: '50%'
                  }}
                />
              </div>
            );
          })}
          
          {/* Hover tooltip */}
          {hovered && !isSelected && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-lg shadow-xl backdrop-blur-lg text-white border border-gray-300 text-sm pointer-events-none whitespace-nowrap z-10" style={{ backgroundColor: '#333333' }}>
              <p className="font-medium">{profile}</p>
              <p className="text-xs opacity-80 mt-1">Value: {value}%</p>
              <p className="text-xs opacity-60 mt-1">Primary: {layer} layer</p>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// Function to get hue rotation based on layer for color variation
const getHueRotationForLayer = (layer: string): number => {
  switch (layer) {
    case 'outer': return 0;    // Red tones
    case 'daily': return 220;  // Blue tones
    case 'inner': return 180;  // Teal tones
    case 'deep': return 120;   // Green tones
    default: return 0;
  }
};

// Function to convert User data to QuizResults format for ResultsPopup
const convertUserToQuizResults = (user: User): { layerResults: Record<LayerType, LayerResult | null>; completedAt: string; userId: string } => {
  const createVotes = (boundary: string, value: number): Record<BoundaryType, number> => {
    const votes: Partial<Record<BoundaryType, number>> = {};
    votes[boundary as BoundaryType] = value;
    return votes as Record<BoundaryType, number>;
  };

  const layerResults: Record<LayerType, LayerResult | null> = {
    outer: {
      layer: 'outer',
      winningBoundary: user.icons.outer as BoundaryType,
      votes: createVotes(user.icons.outer, user.value)
    },
    daily: {
      layer: 'daily',
      winningBoundary: user.icons.daily as BoundaryType,
      votes: createVotes(user.icons.daily, user.value)
    },
    inner: {
      layer: 'inner',
      winningBoundary: user.icons.inner as BoundaryType,
      votes: createVotes(user.icons.inner, user.value)
    },
    deep: {
      layer: 'deep',
      winningBoundary: user.icons.deep as BoundaryType,
      votes: createVotes(user.icons.deep, user.value)
    }
  };

  return {
    layerResults,
    completedAt: new Date().toISOString(),
    userId: user.id.toString()
  };
};

// Enhanced grid component with simple X/Y axis and quadrant labels
const QuadrantGrid: React.FC<{ selectedQuarter?: string | null, onQuarterSelect?: (quarter: string) => void }> = ({ selectedQuarter, onQuarterSelect }) => {
  if (selectedQuarter) {
    // Zoomed view - minimal grid lines for orientation
    return (
      <group>
        {/* Subtle background for orientation */}
        <gridHelper 
          args={[2, 10, "#F3F4F6", "#F9FAFB"]} 
          position={[0, 0, -0.01]} 
          rotation={[Math.PI / 2, 0, 0]} 
        />
        
        {/* Central cross lines for reference */}
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 0.01]} />
          <meshBasicMaterial color="#E5E7EB" transparent opacity={0.5} />
        </mesh>
        
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[2, 0.01]} />
          <meshBasicMaterial color="#E5E7EB" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }

  // Default full view
  return (
    <group>
      {/* Subtle background grid */}
      <gridHelper 
        args={[2, 20, "#E5E7EB", "#F3F4F6"]} 
        position={[0, 0, -0.01]} 
        rotation={[Math.PI / 2, 0, 0]} 
      />
      
      {/* Main X-axis (horizontal) - more prominent */}
      <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 0.02]} />
        <meshBasicMaterial color="#6B7280" transparent opacity={0.9} />
      </mesh>
      
      {/* Main Y-axis (vertical) - more prominent with margins */}
      <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[1.8, 0.02]} />
        <meshBasicMaterial color="#6B7280" transparent opacity={0.9} />
      </mesh>
      
      {/* Alternative line approach using lineBasicMaterial - X-axis (horizontal) line extended to full width */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-2.0, 0, 0.02, 2.0, 0, 0.02]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#D1D5DB" linewidth={2} />
      </line>
      
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, -0.9, 0.02, 0, 0.9, 0.02]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#D1D5DB" linewidth={2} />
      </line>
      
      {/* Clickable quadrant areas for navigation */}
      <mesh
        position={[-0.5, 0.5, 0]}
        onClick={() => onQuarterSelect?.('closed-deep')}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <mesh
        position={[0.5, 0.5, 0]}
        onClick={() => onQuarterSelect?.('open-deep')}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <mesh
        position={[-0.5, -0.5, 0]}
        onClick={() => onQuarterSelect?.('closed-outer')}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <mesh
        position={[0.5, -0.5, 0]}
        onClick={() => onQuarterSelect?.('open-outer')}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Quadrant labels in the center next to the cross of the lines */}
      <Html position={[-0.08, 0.08, 0]} center>
        <div className="text-sm font-normal text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
             onClick={() => onQuarterSelect?.('closed-deep')}>
          Closed Deep
        </div>
      </Html>
      <Html position={[0.08, 0.08, 0]} center>
        <div className="text-sm font-normal text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
             onClick={() => onQuarterSelect?.('open-deep')}>
          Open Deep
        </div>
      </Html>
      <Html position={[-0.08, -0.08, 0]} center>
        <div className="text-sm font-normal text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
             onClick={() => onQuarterSelect?.('closed-outer')}>
          Closed Outer
        </div>
      </Html>
      <Html position={[0.08, -0.08, 0]} center>
        <div className="text-sm font-normal text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
             onClick={() => onQuarterSelect?.('open-outer')}>
          Open Outer
        </div>
      </Html>
    </group>
  );
};

interface WorldMapSceneProps {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
  users: User[];
  selectedQuarter?: string | null;
  onQuarterSelect?: (quarter: string) => void;
}

// Main world map scene with white background
const WorldMapScene: React.FC<WorldMapSceneProps> = ({ onSelectUser, selectedUser, users, selectedQuarter, onQuarterSelect }) => {
  const getFilteredUsers = () => {
    if (!selectedQuarter) return users;
    
    // Filter users by quarter
    const quarterUsers = users.filter(user => {
      const userQuarter = getQuarterForPosition(user.x, user.y);
      return userQuarter === selectedQuarter;
    });

    if (quarterUsers.length === 0) return [];

    // Find the actual bounds of users in this quarter
    const xValues = quarterUsers.map(u => u.x);
    const yValues = quarterUsers.map(u => u.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    // Add some padding to avoid users being at the very edge
    const paddingX = 0.2; // Padding for x-axis to match extended line width
    const paddingY = 0.1; // Keep y-axis padding smaller
    const xRange = Math.max(maxX - minX, 0.2); // Minimum range to avoid division by very small numbers
    const yRange = Math.max(maxY - minY, 0.2);
    
    // Transform positions to fill the screen for the selected quarter
    return quarterUsers.map(user => {
      // Normalize to 0-1 range within the quarter bounds
      const normalizedX = (user.x - minX) / xRange;
      const normalizedY = (user.y - minY) / yRange;
      
      // Map to extended range: x-axis (-2+paddingX, 2-paddingX), y-axis (-1+paddingY, 1-paddingY)
      const transformedX = (normalizedX * (4 - 2 * paddingX)) - (2 - paddingX); // Range: -1.8 to 1.8
      const transformedY = (normalizedY * (2 - 2 * paddingY)) - (1 - paddingY);  // Range: -0.9 to 0.9
      
      return {
        ...user,
        x: transformedX,
        y: transformedY
      };
    });
  };

  const getQuarterForPosition = (x: number, y: number): string => {
    if (x < 0 && y > 0) return 'closed-deep';     // top-left
    if (x > 0 && y > 0) return 'open-deep';       // top-right
    if (x < 0 && y < 0) return 'closed-outer';    // bottom-left
    if (x > 0 && y < 0) return 'open-outer';      // bottom-right
    return 'closed-deep'; // fallback for users exactly on axes
  };

  const filteredUsers = getFilteredUsers();

  return (
    <>
      {/* White background */}
      <color attach="background" args={['#FFFFFF']} />
      
      {/* Lighting optimized for white background */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 5]} intensity={0.4} />
      <pointLight position={[1, 1, 2]} intensity={0.3} color="#F3F4F6" />
      <pointLight position={[-1, -1, 2]} intensity={0.3} color="#F9FAFB" />
      
      <QuadrantGrid selectedQuarter={selectedQuarter} onQuarterSelect={onQuarterSelect} />
      
      {/* User dots */}
      {filteredUsers.map((user) => (
        <UserDot 
          key={user.id}
          position={[user.x, user.y, 0]}
          layer={user.layer}
          value={user.value}
          profile={user.profile}
          icons={user.icons}
          onClick={() => onSelectUser(user)}
          isSelected={selectedUser?.id === user.id}
          isZoomedView={selectedQuarter !== null}
          isNewUser={user.id === 999} // Special ID for current user
        />
      ))}
      
      {/* Smooth orbit controls */}
      <OrbitControls 
        enablePan={selectedQuarter ? false : true}
        enableZoom={selectedQuarter ? true : false}
        enableRotate={false}
        maxDistance={selectedQuarter ? 1.8 : 1.8}
        minDistance={selectedQuarter ? 1.8 : 1.8}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        zoomSpeed={0.5}
        panSpeed={0.8}
        screenSpacePanning={true}
        target={[0, 0, 0]}
      />
    </>
  );
};

// Main exported component
const WorldMap: React.FC<{ 
  userResults?: QuizResults | null; 
  targetPosition?: { x: number; y: number } | null;
  selectedQuarter?: string | null;
  onQuarterSelect?: (quarter: string) => void;
  users?: User[]; // Add users as a prop
}> = ({ userResults, targetPosition, selectedQuarter, onQuarterSelect, users = [] }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserIcon, setShowUserIcon] = useState(false);

  const handleSelectUser = (user: User) => {
    setSelectedUser(prev => prev?.id === user.id ? null : user);
  };

  // Handle user icon animation when userResults are provided
  useEffect(() => {
    if (userResults) {
      console.log('UserResults received:', userResults);
      console.log('Target position:', targetPosition);
      
      // Show user icon immediately for smooth handoff from flying animation
      setShowUserIcon(true);
    }
  }, [userResults, targetPosition]);

  // Create user data from quiz results
  const currentUser: User | null = userResults ? {
    id: 999, // Special ID for current user
    x: targetPosition?.x || Math.random() * 0.8 - 0.4, // Use target position or random
    y: targetPosition?.y || Math.random() * 0.8 - 0.4,
    layer: userResults.layerResults.daily?.winningBoundary ? 'daily' : 'outer', // Use daily layer as primary
    value: 95, // Make user stand out more
    profile: `You (${userResults.userId})`,
    icons: {
      outer: userResults.layerResults.outer?.winningBoundary || 'exploration',
      daily: userResults.layerResults.daily?.winningBoundary || 'stability', 
      inner: userResults.layerResults.inner?.winningBoundary || 'intuition',
      deep: userResults.layerResults.deep?.winningBoundary || 'flow'
    }
  } : null;

  // Use real users data, fallback to mockUsers if no users provided
  const baseUsers = users.length > 0 ? users : mockUsers;
  
  // Combine real users with current user
  const allUsers = showUserIcon && currentUser ? [...baseUsers, currentUser] : baseUsers;
  
  console.log('ShowUserIcon:', showUserIcon, 'CurrentUser:', currentUser, 'AllUsers count:', allUsers.length);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden" style={{ zIndex: 10 }}>
      <Canvas 
        key={selectedQuarter || 'default'} // Force re-render when quarter changes
        camera={{ 
          position: selectedQuarter ? [0, 0, 1.0] : [0, 0, 1.8], // Increased distance for full view
          fov: selectedQuarter ? 60 : 60 // Increased FOV for better coverage
        }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance" 
        }}
        style={{ 
          zIndex: 10,
          width: '100%',
          height: '100%'
        }}
      >
        <WorldMapScene 
          onSelectUser={handleSelectUser} 
          selectedUser={selectedUser}
          users={allUsers}
          selectedQuarter={selectedQuarter}
          onQuarterSelect={onQuarterSelect}
        />
      </Canvas>
      
      {selectedUser && selectedQuarter && (
        <ResultsPopup 
          results={convertUserToQuizResults(selectedUser)}
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
};

export default WorldMap; 