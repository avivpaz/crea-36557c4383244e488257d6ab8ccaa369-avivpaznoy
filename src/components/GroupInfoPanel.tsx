'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface GroupInfoPanelProps {
  groupName: string;
  onClose: () => void;
}

interface GroupData {
  layers: {
    outer: number;
    daily: number;
    inner: number;
    deep: number;
  };
  topBoundaries: {
    icon: string;
    name: string;
    percentage: number;
  }[];
  about: string;
  peopleCount: number;
  location: string;
}

// Mock data for each group
const groupData: Record<string, GroupData> = {
  'Open Deep': {
    layers: {
      outer: 5,
      daily: 15,
      inner: 25,
      deep: 10
    },
    topBoundaries: [
      { icon: 'logic', name: 'Logic', percentage: 38 },
      { icon: 'caution', name: 'Caution', percentage: 20 },
      { icon: 'anchor', name: 'Anchor', percentage: 19 },
      { icon: 'sensitivity', name: 'Sensitivity', percentage: 12 }
    ],
    about: 'You tend to feel deeply and express emotions openly.',
    peopleCount: 40,
    location: 'Global'
  },
  'Closed Deep': {
    layers: {
      outer: 8,
      daily: 20,
      inner: 30,
      deep: 15
    },
    topBoundaries: [
      { icon: 'stability', name: 'Stability', percentage: 42 },
      { icon: 'planning', name: 'Planning', percentage: 25 },
      { icon: 'order', name: 'Order', percentage: 18 },
      { icon: 'withdrawal', name: 'Withdrawal', percentage: 15 }
    ],
    about: 'You experience deep emotions but prefer to keep them private.',
    peopleCount: 13,
    location: 'Global'
  },
  'Closed Outer': {
    layers: {
      outer: 35,
      daily: 25,
      inner: 15,
      deep: 5
    },
    topBoundaries: [
      { icon: 'withdrawal', name: 'Withdrawal', percentage: 45 },
      { icon: 'caution', name: 'Caution', percentage: 28 },
      { icon: 'stability', name: 'Stability', percentage: 17 },
      { icon: 'anchor', name: 'Anchor', percentage: 10 }
    ],
    about: 'You maintain emotional boundaries and prefer practical approaches.',
    peopleCount: 13,
    location: 'Global'
  },
  'Open Outer': {
    layers: {
      outer: 40,
      daily: 30,
      inner: 12,
      deep: 8
    },
    topBoundaries: [
      { icon: 'exploration', name: 'Exploration', percentage: 35 },
      { icon: 'openness', name: 'Openness', percentage: 30 },
      { icon: 'flow', name: 'Flow', percentage: 20 },
      { icon: 'connection', name: 'Connection', percentage: 15 }
    ],
    about: 'You express yourself freely and engage with the world actively.',
    peopleCount: 14,
    location: 'Global'
  }
};

const GroupInfoPanel: React.FC<GroupInfoPanelProps> = ({ groupName, onClose }) => {
  const [currentView, setCurrentView] = useState(0);
  const data = groupData[groupName] || groupData['Open Deep'];
  
  const views = [
    // View 1: People in this group (moved from last to first)
    {
      title: 'People in this group',
      content: (
        <div className="space-y-4">
          <div className="text-2xl font-semibold text-gray-800">
            {data.peopleCount} people
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">World location</div>
            <div className="w-full h-32 bg-gray-50 rounded-lg relative overflow-hidden">
              {/* X-Y coordinate system */}
              {/* X-axis */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 transform -translate-y-1/2"></div>
              {/* Y-axis */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2"></div>
              
              {/* Group dot positioned in the appropriate quadrant */}
              <div 
                className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: groupName === 'Open Deep' || groupName === 'Open Outer' ? '75%' : '25%',
                  top: groupName === 'Open Deep' || groupName === 'Closed Deep' ? '25%' : '75%'
                }}
              />
              
              {/* Axis labels */}
              <div className="absolute bottom-2 right-2 text-[10px] text-gray-500">x</div>
              <div className="absolute top-2 left-2 text-[10px] text-gray-500">y</div>
            </div>
          </div>
        </div>
      )
    },
    // View 2: Group Layers (moved from first to second)
    {
      title: 'Group Layers',
      content: (
        <div className="space-y-4">
          {Object.entries(data.layers).map(([layer, percentage]) => (
            <div key={layer} className="flex items-center justify-between">
              <span className="text-sm capitalize text-gray-700 w-20">{layer} self</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage * 2}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-10 text-right">{percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    // View 3: Top boundaries
    {
      title: 'Top boundaries in this group',
      content: (
        <div className="space-y-3">
          {data.topBoundaries.map((boundary, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className={`w-6 h-6 rounded flex items-center justify-center ${
                  index === 0 ? 'bg-blue-100' :
                  index === 1 ? 'bg-pink-100' :
                  index === 2 ? 'bg-green-100' :
                  'bg-yellow-100'
                }`}
              >
                <Image
                  src={`/icons/${boundary.icon}.svg`}
                  alt={boundary.name}
                  width={16}
                  height={16}
                  className="opacity-80"
                />
              </div>
              <span className="text-sm text-gray-700 flex-1">{boundary.name}</span>
              <span className="text-sm text-gray-600">{boundary.percentage}%</span>
            </div>
          ))}
        </div>
      )
    },
    // View 4: About this group
    {
      title: 'About this group',
      content: (
        <div className="text-sm text-gray-700 leading-relaxed">
          {data.about}
        </div>
      )
    }
  ];

  const handleNext = () => {
    setCurrentView((prev) => (prev + 1) % views.length);
  };

  const handlePrev = () => {
    setCurrentView((prev) => (prev - 1 + views.length) % views.length);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-gray-800">{groupName}</h2>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        <div className="text-sm text-gray-500 mb-6">{views[currentView].title}</div>

        {/* Content */}
        <div className="min-h-[200px]">
          {views[currentView].content}
        </div>

        {/* Navigation dots and arrow */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            {views.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentView ? 'bg-gray-800' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const GroupInfoPanelContent: React.FC<{ groupName: string }> = ({ groupName }) => {
  const [currentView, setCurrentView] = useState(0);
  const data = groupData[groupName] || groupData['Open Deep'];
  
  const views = [
    // View 1: People in this group (moved from last to first)
    {
      title: 'People in this group',
      content: (
        <div className="space-y-4">
          <div className="text-2xl font-semibold text-gray-800">
            {data.peopleCount} people
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">World location</div>
            <div className="w-full h-32 bg-gray-50 rounded-lg relative overflow-hidden">
              {/* X-Y coordinate system */}
              {/* X-axis */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 transform -translate-y-1/2"></div>
              {/* Y-axis */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2"></div>
              
              {/* Group dot positioned in the appropriate quadrant */}
              <div 
                className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: groupName === 'Open Deep' || groupName === 'Open Outer' ? '75%' : '25%',
                  top: groupName === 'Open Deep' || groupName === 'Closed Deep' ? '25%' : '75%'
                }}
              />
              
              {/* Axis labels */}
              <div className="absolute bottom-2 right-2 text-[10px] text-gray-500">x</div>
              <div className="absolute top-2 left-2 text-[10px] text-gray-500">y</div>
            </div>
          </div>
        </div>
      )
    },
    // View 2: Group Layers (moved from first to second)
    {
      title: 'Group Layers',
      content: (
        <div className="space-y-4">
          {Object.entries(data.layers).map(([layer, percentage]) => (
            <div key={layer} className="flex items-center justify-between">
              <span className="text-sm capitalize text-gray-700 w-20">{layer} self</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage * 2}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-10 text-right">{percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    // View 3: Top boundaries
    {
      title: 'Top boundaries in this group',
      content: (
        <div className="space-y-3">
          {data.topBoundaries.map((boundary, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className={`w-6 h-6 rounded flex items-center justify-center ${
                  index === 0 ? 'bg-blue-100' :
                  index === 1 ? 'bg-pink-100' :
                  index === 2 ? 'bg-green-100' :
                  'bg-yellow-100'
                }`}
              >
                <Image
                  src={`/icons/${boundary.icon}.svg`}
                  alt={boundary.name}
                  width={16}
                  height={16}
                  className="opacity-80"
                />
              </div>
              <span className="text-sm text-gray-700 flex-1">{boundary.name}</span>
              <span className="text-sm text-gray-600">{boundary.percentage}%</span>
            </div>
          ))}
        </div>
      )
    },
    // View 4: About this group
    {
      title: 'About this group',
      content: (
        <div className="text-sm text-gray-700 leading-relaxed">
          {data.about}
        </div>
      )
    }
  ];

  const handleNext = () => {
    setCurrentView((prev) => (prev + 1) % views.length);
  };

  const handlePrev = () => {
    setCurrentView((prev) => (prev - 1 + views.length) % views.length);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Title */}
      <div className="text-sm text-gray-500 text-center">{views[currentView].title}</div>

      {/* Content */}
      <div className="min-h-[150px] w-full">
        {views[currentView].content}
      </div>

      {/* Navigation with dots and arrows */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Previous"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Navigation dots */}
        <div className="flex gap-2">
          {views.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentView ? 'bg-gray-800' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNext}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Next"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GroupInfoPanel; 