import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  defaultValue = 50,
  value: controlledValue,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // If component is controlled, use the controlled value
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  // Use useMemo to memoize the points array
  const points = useMemo(() => [
    { position: 0, color: '#D3D3D3' },    // Light grey
    { position: 25, color: '#A9A9A9' },   // Darker grey
    { position: 50, color: '#808080' },   // Medium grey
    { position: 75, color: '#555555' },   // Dark grey
    { position: 100, color: '#000000' }   // Black
  ], []);

  // Update value and call onChange
  const updateValue = useCallback((clientX: number) => {
    // Use the inner track for calculations to match visual positioning
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      
      // Calculate percentage relative to the inner track (same as visual positioning)
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = percentage * (max - min) + min;
      
      // Find the nearest point by comparing actual distances
      let nearestPoint = points[0];
      let minDistance = Math.abs(rawValue - points[0].position);
      
      for (let i = 1; i < points.length; i++) {
        const distance = Math.abs(rawValue - points[i].position);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = points[i];
        }
      }
      
      const newValue = nearestPoint.position;
      
      // Update internal value
      setInternalValue(newValue);
      
      if (onChange) {
        onChange(newValue);
      }
    }
  }, [min, max, onChange, points]);

  // Handle point click - prioritize direct clicks
  const handlePointClick = (pointValue: number) => {
    setInternalValue(pointValue);
    if (onChange) {
      onChange(pointValue);
    }
  };

  // Handle slider track click (not on buttons)
  const handleTrackClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    // Don't handle if clicking on a button or any child of a button
    const target = e.target as HTMLElement;
    
    // Check if target is a button or inside a button
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    updateValue(clientX);
  }, [updateValue]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleTrackClick(e);
  }, [handleTrackClick]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      updateValue(e.clientX);
    }
  }, [isDragging, updateValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleTrackClick(e);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    
    // Try to prevent default, but don't cause errors if it fails
    try {
      e.preventDefault();
    } catch {
      // Ignore passive event listener errors
    }
    
    const touch = e.touches[0];
    if (touch) {
      updateValue(touch.clientX);
    }
  }, [isDragging, updateValue]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Add touch events without passive: false to avoid warnings
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className="w-full">
      <div className="relative h-8 md:h-10 lg:h-12 flex items-center">
        {/* Outer container with border - back to original size */}
        <div 
          ref={sliderRef}
          className="w-full h-3 md:h-3 lg:h-3 bg-white border border-black rounded-full px-2 md:px-3 py-2 md:py-2 relative cursor-pointer touch-manipulation select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Inner track */}
          <div className="w-full h-full relative pointer-events-none" ref={trackRef}>
            {/* Fixed point indicators - gradient from light grey to black */}
            {points.map((point, index) => {
              const pointPercentage = ((point.position - min) / (max - min)) * 100;
              
              // Gradient colors from light grey to black
              const gradientColors = [
                'bg-gray-300',  // Light grey (leftmost)
                'bg-gray-400',  // Medium-light grey
                'bg-gray-600',  // Medium grey
                'bg-gray-800',  // Dark grey
                'bg-black'      // Black (rightmost)
              ];
              
              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-10"
                  style={{ left: `${pointPercentage}%` }}
                >
                  {/* Larger clickable area for tablets */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handlePointClick(point.position);
                    }}
                    className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center touch-manipulation pointer-events-auto hover:scale-110 active:scale-125 transition-all duration-200 rounded-full"
                  >
                    {/* Visual dot - original size */}
                    <div className={`w-2 h-2 ${gradientColors[index]} rounded-full transition-all duration-200`} />
                  </button>
                </div>
              );
            })}
            
            {/* Current value indicator - original size with enhanced touch feedback */}
            <div
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 transition-all duration-200 pointer-events-none ${
                isDragging ? 'scale-125' : 'scale-100'
              }`}
              style={{ left: `${((value - min) / (max - min)) * 100}%` }}
            >
              {/* Main handle bar - original size */}
              <div className="w-3 h-11 bg-black" />
              
              {/* Touch indicator circle when dragging */}
              {isDragging && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black bg-opacity-20 rounded-full animate-pulse" />
              )}
              
              {/* Larger invisible touch target for the handle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 pointer-events-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;