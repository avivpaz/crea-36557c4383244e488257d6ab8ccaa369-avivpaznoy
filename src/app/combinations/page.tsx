'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

// Layer colors matching WorldMap
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

interface IconCombination {
  outer: string;
  daily: string;
  inner: string;
  deep: string;
}

// Component to display a single icon combination
const IconCombinationDisplay: React.FC<{ 
  combination: IconCombination; 
  index: number;
  size?: number;
}> = ({ combination, index, size = 80 }) => {
  const layerOrder: (keyof IconCombination)[] = ['outer', 'daily', 'inner', 'deep'];

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Icon Stack */}
      <div 
        className="relative mb-3"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {layerOrder.map((layerType, layerIndex) => {
          const config = layerConfig[layerType];
          
          return (
            <div
              key={layerType}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                zIndex: layerIndex + 1,
              }}
            >
              <Image
                src={`/icons/${combination[layerType]}.svg`}
                alt={`${layerType} layer - ${combination[layerType]}`}
                width={size * config.size}
                height={size * config.size}
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
      </div>

      {/* Combination Info */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-800 mb-2">
          Combination #{index + 1}
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          {layerOrder.map((layerType) => (
            <div key={layerType} className="flex items-center justify-between">
              <span 
                className="w-3 h-3 rounded-full mr-2 inline-block"
                style={{ backgroundColor: layerColors[layerType] }}
              />
              <span className="capitalize font-medium">{layerType}:</span>
              <span className="ml-1">{combination[layerType]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Function to generate all possible combinations of 4 icons
const generateAllCombinations = (): IconCombination[] => {
  const combinations: IconCombination[] = [];
  
  // Generate all possible combinations (16^4 = 65,536 combinations)
  // For practical display, let's limit to unique combinations where all 4 icons are different
  for (let outer = 0; outer < availableIcons.length; outer++) {
    for (let daily = 0; daily < availableIcons.length; daily++) {
      for (let inner = 0; inner < availableIcons.length; inner++) {
        for (let deep = 0; deep < availableIcons.length; deep++) {
          // Only include combinations where all icons are different
          const icons = [outer, daily, inner, deep];
          const uniqueIcons = new Set(icons);
          
          if (uniqueIcons.size === 4) {
            combinations.push({
              outer: availableIcons[outer],
              daily: availableIcons[daily],
              inner: availableIcons[inner],
              deep: availableIcons[deep]
            });
          }
        }
      }
    }
  }
  
  return combinations;
};

// Function to generate sample combinations (for performance)
const generateSampleCombinations = (count: number = 100): IconCombination[] => {
  const combinations: IconCombination[] = [];
  
  for (let i = 0; i < count; i++) {
    // Shuffle icons and take first 4
    const shuffled = [...availableIcons].sort(() => 0.5 - Math.random());
    combinations.push({
      outer: shuffled[0],
      daily: shuffled[1],
      inner: shuffled[2],
      deep: shuffled[3]
    });
  }
  
  return combinations;
};

export default function CombinationsPage() {
  // For performance, we'll show a sample of combinations
  // To show ALL combinations, uncomment the line below (warning: 43,680 combinations!)
  // const combinations = generateAllCombinations();
  const combinations = generateSampleCombinations(200);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Icon Combinations</h1>
              <p className="text-gray-600 mt-2">
                Explore all possible combinations of 4-layer icon stacks
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Showing {combinations.length} sample combinations 
                {combinations.length < 1000 && " (unique icons per combination)"}
              </p>
            </div>
            <Link 
              href="/explore" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Layer Legend</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(layerConfig).map(([layerType, config]) => (
              <div key={layerType} className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: layerColors[layerType] }}
                />
                <div>
                  <div className="font-medium capitalize text-gray-800">{layerType} Layer</div>
                  <div className="text-sm text-gray-600">
                    {Math.round(config.size * 100)}% size, {Math.round(config.opacity * 100)}% opacity
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combinations Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {combinations.map((combination, index) => (
            <IconCombinationDisplay
              key={`${combination.outer}-${combination.daily}-${combination.inner}-${combination.deep}`}
              combination={combination}
              index={index}
              size={100}
            />
          ))}
        </div>

        {/* Show All Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              // This would generate all combinations - warning: very large!
              alert(`Total possible combinations with unique icons: ${generateAllCombinations().length}\nThis would be too many to display efficiently. Currently showing ${combinations.length} samples.`);
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Calculate All Possible Combinations
          </button>
          <p className="text-sm text-gray-500 mt-2">
            With 16 icons, there are 43,680 unique combinations where all 4 icons are different
          </p>
        </div>
      </div>
    </div>
  );
} 