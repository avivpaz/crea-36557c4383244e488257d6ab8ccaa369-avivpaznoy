import React from 'react';
import Image from 'next/image';
import { BoundaryType } from '@/utils/boundaryCalculation';

export type LayerType = 'outer' | 'daily' | 'inner' | 'deep';

interface EmotionalLayerProps {
  type: LayerType;
  isActive: boolean;
  isCompleted: boolean;
  winningBoundary?: BoundaryType | null;
}

export const EmotionalLayer: React.FC<EmotionalLayerProps> = ({
  type,
  isActive,
  isCompleted,
  winningBoundary,
}) => {
  const getLayerIcon = () => {
    if (isCompleted && winningBoundary) {
      // Show the winning boundary icon for completed layers
      const iconPath = `/icons/${winningBoundary}.svg`;
      
      return (
        <Image 
          src={iconPath} 
          alt={`${winningBoundary} boundary icon`}
          width={23}
          height={23}
          className="w-[23px] h-[23px] animate-pulse"
        />
      );
    } else if (isActive && !isCompleted) {
      // Show loading gif for the current active layer being worked on
      return (
        <Image 
          src="/quiz_loader.gif" 
          alt="Loading boundary"
          width={23}
          height={23}
          className="w-[23px] h-[23px]"
          unoptimized // Required for GIFs to animate properly
        />
      );
    } else {
      // Return invisible placeholder to maintain alignment for future layers
      return <div className="w-[23px] h-[23px]"></div>;
    }
  };

  const formatLayerName = (type: LayerType) => {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} self`;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {getLayerIcon()}
      <div className={`text-[15px] ${isActive ? 'font-medium text-black' : 'text-gray-400'}`}>
        {formatLayerName(type)}
      </div>
    </div>
  );
};

export default EmotionalLayer; 