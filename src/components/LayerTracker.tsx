import React from 'react';
import EmotionalLayer, { LayerType } from './EmotionalLayer';
import { LayerResult } from '@/utils/boundaryCalculation';

interface LayerTrackerProps {
  currentLayer: LayerType;
  completedLayers: LayerType[];
  layerResults: Record<LayerType, LayerResult | null>;
}

export const LayerTracker: React.FC<LayerTrackerProps> = ({
  currentLayer,
  completedLayers,
  layerResults,
}) => {
  const layers: LayerType[] = ['outer', 'daily', 'inner', 'deep'];

  return (
    <div className="relative w-full">
      {/* Horizontal connecting line - almost full width */}
      <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-black/30 transform -translate-y-1/2"></div>
      
      {/* Icons container - spread across almost full width */}
      <div className="flex items-center justify-between px-8">
        {layers.map((layer) => (
          <div key={layer} className="relative z-10">
            <EmotionalLayer
              type={layer}
              isActive={layer === currentLayer}
              isCompleted={completedLayers.includes(layer)}
              winningBoundary={layerResults[layer]?.winningBoundary || null}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerTracker; 