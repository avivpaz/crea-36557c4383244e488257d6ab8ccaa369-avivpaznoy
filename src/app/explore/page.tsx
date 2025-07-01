'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import WorldMap from '@/components/WorldMap';
import ResultsPopup, { UserResultIcons } from '@/components/ResultsPopup';
import { LayerResult } from '@/utils/boundaryCalculation';
import { LayerType } from '@/components/EmotionalLayer';
import Image from 'next/image';
import { GroupInfoPanelContent } from '@/components/GroupInfoPanel';

// TODO: Remove this when real user data is implemented
const MOCK_USER_COUNT = 80; // Temporary constant based on current mockUsers structure

interface QuizResults {
  layerResults: Record<LayerType, LayerResult | null>;
  completedAt: string;
  userId: string;
}

// Emotional boundaries for X-axis (from boundaryCalculation.ts)
const EMOTIONAL_BOUNDARIES = [
  'Anchor', 'Turbulence', 'Clarity', 'Logic', 'Caution', 
  'Planning', 'Order', 'Withdrawal', 'Stability', 'Sensitivity', 
  'Connection', 'Intuition', 'Impulse', 'Openness', 'Exploration', 'Flow'
];

// Personality layers for Y-axis
const PERSONALITY_LAYERS = ['Deep Self', 'Daily Self', 'Inner Self', 'Outer Self'];

// Quarter information
const QUARTER_INFO = {
  'closed-deep': {
    title: 'Closed Deep',
    description: 'You keep feelings inside and think a lot.'
  },
  'open-deep': {
    title: 'Open Deep', 
    description: 'You tend to feel deeply and express emotions openly.'
  },
  'closed-outer': {
    title: 'Closed Outer',
    description: 'You stay in control and don\'t show much.'
  },
  'open-outer': {
    title: 'Open Outer',
    description: 'You show emotions quickly and clearly.'
  }
};

function ExplorePageContent() {
  const [showResultsPopup, setShowResultsPopup] = useState(false);
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [showUserInWorld, setShowUserInWorld] = useState(false);
  const [userTargetPosition, setUserTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState<string | null>(null);
  
  // Animation states
  const [showIconAnimation, setShowIconAnimation] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'start' | 'moving' | 'flying' | 'landing' | 'complete'>('start');
  const [popupIconPosition, setPopupIconPosition] = useState<{ x: number; y: number } | null>(null);
  
  // TODO: Replace with real API call to fetch users from database
  // const [users, setUsers] = useState<User[]>([]);
  // 
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await fetch('/api/users');
  //       const userData = await response.json();
  //       setUsers(userData);
  //     } catch (error) {
  //       console.error('Failed to fetch users:', error);
  //     }
  //   };
  //   fetchUsers();
  // }, []);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check if we should show results popup
    const shouldShowResults = searchParams.get('showResults') === 'true';
    
    if (shouldShowResults) {
      // Get results from localStorage
      const storedResults = localStorage.getItem('quizResults');
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults);
        setQuizResults(parsedResults);
        setShowResultsPopup(true);
        
        // Generate a random target position for the user in the world
        const targetPos = {
          x: Math.random() * 0.8 - 0.4, // Random position between -0.4 and 0.4
          y: Math.random() * 0.8 - 0.4
        };
        setUserTargetPosition(targetPos);
      }
    }

    return () => clearInterval(timer);
  }, [searchParams]);

  // Get the target screen position for animation
  const getTargetScreenPosition = () => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return { x: 600, y: 400 }; // Default fallback for SSR
    }
    
    if (!userTargetPosition) {
      return {
        x: window.innerWidth * 0.7,
        y: window.innerHeight * 0.5
      };
    }
    
    // Get the actual canvas element position
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      return {
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.5
      };
    }
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Scale factor for the world coordinates to screen coordinates
    const scale = Math.min(rect.width, rect.height) * 0.4;
    
    return {
      x: centerX + (userTargetPosition.x * scale),
      y: centerY - (userTargetPosition.y * scale) // Negative because Y is inverted in screen coordinates
    };
  };

  const handleCloseResultsPopup = () => {
    // Calculate the position of the icons in the popup before closing
    const popup = document.querySelector('[data-popup-icons]');
    if (popup) {
      const rect = popup.getBoundingClientRect();
      setPopupIconPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    } else {
      // Fallback: estimate popup icon position (left side of popup)
      setPopupIconPosition({
        x: typeof window !== 'undefined' ? window.innerWidth * 0.3 : 400, // Approximate left side position
        y: typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400
      });
    }
    
    // Start the flying icon animation immediately
    setShowIconAnimation(true);
    setAnimationPhase('start');
    
    // Close popup with slight delay to allow position calculation
    setTimeout(() => {
      setShowResultsPopup(false);
    }, 100);
    
    // Remove the showResults parameter from URL
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/explore');
    }
    
    // Animation sequence with proper timing
    setTimeout(() => {
      setAnimationPhase('moving');
    }, 50);

    setTimeout(() => {
      setAnimationPhase('flying');
    }, 600);

    setTimeout(() => {
      setAnimationPhase('landing');
    }, 1600);

    // Show user in world slightly before landing completes for smooth handoff
    setTimeout(() => {
      setShowUserInWorld(true);
    }, 1850);

    // Hide flying animation after user appears in world
    setTimeout(() => {
      setAnimationPhase('complete');
      setShowIconAnimation(false);
    }, 2100);
  };

  const formatTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleQuarterSelect = (quarter: string) => {
    setSelectedQuarter(quarter);
  };

  const handleBackToWorldView = () => {
    setSelectedQuarter(null);
  };

  const getQuarterDisplayName = (quarter: string) => {
    switch (quarter) {
      case 'closed-deep': return 'Closed Deep';
      case 'open-deep': return 'Open Deep';
      case 'closed-outer': return 'Closed Outer';
      case 'open-outer': return 'Open Outer';
      default: return '';
    }
  };

  const targetScreenPos = getTargetScreenPosition();

  return (
    <div className="h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Flying Icon Animation - Outside everything else so it persists */}
      {showIconAnimation && quizResults && (
        <div className="fixed inset-0 pointer-events-none z-[100002]">
          <div className="relative w-full h-full">
            {/* Single UserResultIcons component that flies from popup to target */}
            <div
              className={`absolute ${
                animationPhase === 'start' ? 'opacity-100' : 
                animationPhase === 'moving' ? 'opacity-100' :
                animationPhase === 'flying' ? 'opacity-100' :
                animationPhase === 'landing' ? 'opacity-100' :
                'opacity-0'
              }`}
              style={{
                left: popupIconPosition ? (
                  animationPhase === 'start' ? `${popupIconPosition.x}px` :
                  animationPhase === 'moving' ? `${(popupIconPosition.x + targetScreenPos.x) / 2}px` :
                  `${targetScreenPos.x}px`
                ) : (
                  animationPhase === 'start' ? `${typeof window !== 'undefined' ? window.innerWidth * 0.3 : 400}px` :
                  animationPhase === 'moving' ? `${typeof window !== 'undefined' ? window.innerWidth * 0.5 : 600}px` :
                  `${targetScreenPos.x}px`
                ),
                top: popupIconPosition ? (
                  animationPhase === 'start' ? `${popupIconPosition.y}px` :
                  animationPhase === 'moving' ? `${(popupIconPosition.y + targetScreenPos.y) / 2 - 30}px` : // Arc upward
                  `${targetScreenPos.y}px`
                ) : (
                  animationPhase === 'start' ? `${typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400}px` :
                  animationPhase === 'moving' ? `${typeof window !== 'undefined' ? window.innerHeight * 0.5 - 30 : 370}px` :
                  `${targetScreenPos.y}px`
                ),
                transform: `translate(-50%, -50%)`,
                transition: animationPhase === 'start' ? 'all 50ms ease-out' :
                           animationPhase === 'moving' ? 'all 550ms cubic-bezier(0.34, 1.56, 0.64, 1)' :
                           animationPhase === 'flying' ? 'all 1000ms cubic-bezier(0.22, 0.61, 0.36, 1)' :
                           animationPhase === 'landing' ? 'all 250ms cubic-bezier(0.33, 1, 0.68, 1)' :
                           'opacity 200ms ease-out',
                zIndex: 100003
              }}
            >
              <div
                style={{
                  transform: `scale(${
                    animationPhase === 'start' ? 1 :
                    animationPhase === 'moving' ? 0.85 :
                    animationPhase === 'flying' ? 0.12 :
                    animationPhase === 'landing' ? 0.032 :
                    0
                  }) rotate(${
                    animationPhase === 'start' ? '0deg' :
                    animationPhase === 'moving' ? '5deg' :
                    animationPhase === 'flying' ? '15deg' :
                    animationPhase === 'landing' ? '0deg' :
                    '0deg'
                  })`,
                  transformOrigin: 'center',
                  transition: 'inherit',
                  filter: animationPhase === 'flying' ? 'blur(0.5px)' : 
                         animationPhase === 'landing' ? 'blur(0px)' : 'none',
                  willChange: 'transform, filter'
                }}
              >
                <UserResultIcons layerResults={quizResults.layerResults} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Overlay */}
      {showInfoOverlay && (
        <div className="fixed inset-0 z-[100001] overflow-hidden pointer-events-none">
          {/* Title */}
      

          {/* Axes and Quarters Container - Centered on screen */}
          <div className="w-full h-full flex items-center justify-center p-16">
            <div className="relative w-full h-full">
              
              {/* X-axis line */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 transform -translate-y-1/2" style={{ backgroundColor: '#333333', opacity: 0.7 }}></div>
              
              {/* Y-axis line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 transform -translate-x-1/2" style={{ backgroundColor: '#333333', opacity: 0.7 }}></div>

              {/* Y-axis labels (Personality layers) - positioned along the Y line */}
              <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2">
                <div className="absolute left-4 -top-10 text-sm font-medium px-2 py-1 rounded whitespace-nowrap" style={{ color: '#333333' }}>
                  Y axis - Personality layers
                </div>
                {PERSONALITY_LAYERS.map((layer, index) => {
                  // Custom positioning for Inner Self and Daily Self to be at center
                  let topPosition;
                  if (layer === 'Daily Self') {
                    topPosition = '25%'; // Just above center (from top to center)
                  } else if (layer === 'Inner Self') {
                    topPosition = '75%'; // Just below center (from center to bottom)
                  } else {
                    topPosition = `${(index * 100 / (PERSONALITY_LAYERS.length - 1))}%`;
                  }
                  
                  return (
                    <div key={layer}>
                      {/* Dot on the Y-axis line */}
                      <div 
                        className="absolute w-2 h-2 rounded-full"
                        style={{ 
                          top: topPosition,
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: '#333333',
                          opacity: 0.9,
                          zIndex: 10
                        }}
                      />
                      {/* Label */}
                      <div 
                        className="absolute left-6 text-sm font-medium px-2 py-1 rounded whitespace-nowrap"
                        style={{ 
                          top: topPosition,
                          transform: 'translateY(-50%)',
                          color: '#333333'
                        }}
                      >
                        {layer}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels (Emotional boundaries) - positioned along the X line */}
              <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2">
                <div className="absolute -top-8 left-0 text-sm font-medium px-2 py-1 rounded whitespace-nowrap" style={{ color: '#333333' }}>
                  X axis - Emotional boundaries
                </div>
                {EMOTIONAL_BOUNDARIES.map((boundary, index) => (
                  <div key={boundary}>
                    {/* Dot on the X-axis line */}
                    <div 
                      className="absolute w-2 h-2 rounded-full"
                      style={{ 
                        left: `${(index * 100 / (EMOTIONAL_BOUNDARIES.length - 1))}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#333333',
                        opacity: 0.9,
                        zIndex: 10
                      }}
                    />
                    {/* Label */}
                    <div 
                      className="absolute top-6 text-xs px-2 py-1 rounded whitespace-nowrap"
                      style={{ 
                        left: `${(index * 100 / (EMOTIONAL_BOUNDARIES.length - 1))}%`,
                        transform: 'translateX(-50%)',
                        minWidth: 'fit-content',
                        color: '#333333'
                      }}
                    >
                      {boundary}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quarter Information Squares */}
              {/* Closed Deep (top-left) */}
              <div className="absolute left-[15%] top-[15%] bg-white/90 backdrop-blur-sm border border-gray-300/50 p-3 rounded-lg shadow-lg max-w-[180px]">
                <h3 className="font-medium text-gray-800 mb-1 text-sm">{QUARTER_INFO['closed-deep'].title}</h3>
                <p className="text-xs text-gray-600">{QUARTER_INFO['closed-deep'].description}</p>
              </div>

              {/* Open Deep (top-right) */}
              <div className="absolute right-[15%] top-[15%] bg-white/90 backdrop-blur-sm border border-gray-300/50 p-3 rounded-lg shadow-lg max-w-[180px]">
                <h3 className="font-medium text-gray-800 mb-1 text-sm">{QUARTER_INFO['open-deep'].title}</h3>
                <p className="text-xs text-gray-600">{QUARTER_INFO['open-deep'].description}</p>
              </div>

              {/* Closed Outer (bottom-left) */}
              <div className="absolute left-[15%] bottom-[15%] bg-white/90 backdrop-blur-sm border border-gray-300/50 p-3 rounded-lg shadow-lg max-w-[180px]">
                <h3 className="font-medium text-gray-800 mb-1 text-sm">{QUARTER_INFO['closed-outer'].title}</h3>
                <p className="text-xs text-gray-600">{QUARTER_INFO['closed-outer'].description}</p>
              </div>

              {/* Open Outer (bottom-right) */}
              <div className="absolute right-[15%] bottom-[15%] bg-white/90 backdrop-blur-sm border border-gray-300/50 p-3 rounded-lg shadow-lg max-w-[180px]">
                <h3 className="font-medium text-gray-800 mb-1 text-sm">{QUARTER_INFO['open-outer'].title}</h3>
                <p className="text-xs text-gray-600">{QUARTER_INFO['open-outer'].description}</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Results Popup */}
      {showResultsPopup && quizResults && (
        <div style={{ zIndex: 100000, position: 'relative' }}>
          <ResultsPopup 
            results={quizResults} 
            onClose={handleCloseResultsPopup}
          />
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-start p-6 bg-transparent pointer-events-none">
        {/* Left side - Title and Stats or Back Button */}
        <div className="flex flex-col space-y-6 pointer-events-auto">
          {selectedQuarter ? (
            <>
              <button
                onClick={handleBackToWorldView}
                className="flex items-center space-x-2 hover:text-gray-600 transition-colors"
                style={{ color: '#333333' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back to world view</span>
              </button>
              
              <div className="flex flex-col space-y-2">
                <div className="text-sm text-gray-500">Viewing</div>
                {showGroupInfo ? (
                  <div className="bg-white rounded-xl shadow-lg p-4 w-80">
                    {/* Header with group name and close button */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-800">{getQuarterDisplayName(selectedQuarter)}</h2>
                      <button
                        onClick={() => setShowGroupInfo(null)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
                        aria-label="Close"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Embed GroupInfoPanel content */}
                    <GroupInfoPanelContent groupName={getQuarterDisplayName(selectedQuarter)} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-normal" style={{ color: '#333333' }}>{getQuarterDisplayName(selectedQuarter)}</h1>
                    <button
                      onClick={() => setShowGroupInfo(getQuarterDisplayName(selectedQuarter))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
                      aria-label="Show group information"
                    >
                      <svg className="w-4 h-4 text-gray-600 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/">
                <Image
                  src="/logo.svg"
                  alt="Noy Logo"
                  width={80}
                  height={40}
                  className="w-20 max-w-full cursor-pointer hover:opacity-80 transition-opacity"
                  priority
                />
              </Link>
              
              {/* Stats */}
              {!showInfoOverlay && (
                <div className="flex flex-col space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">people in the world</div>
                    <div className="text-4xl font-light" style={{ color: '#333333' }}>{MOCK_USER_COUNT}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Largest group</div>
                    <div className="text-xl font-normal" style={{ color: '#333333' }}>Open-Deep</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right side - Info button and Search */}
        {!selectedQuarter && (
          <div className="pointer-events-auto flex items-center space-x-3 z-30">
              {/* Axis Toggle */}
              <button
              onClick={() => setShowInfoOverlay(!showInfoOverlay)}
              className="relative flex items-center px-2 py-1 rounded-full z-30 overflow-hidden"
              style={{
                backgroundColor: showInfoOverlay ? '#333333' : 'white',
                border: showInfoOverlay ? 'none' : '1px solid #E5E7EB',
                minWidth: '80px',
                height: '32px',
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Animated circle that moves between positions */}
              <div
                className="absolute w-6 h-6 rounded-full"
                style={{
                  backgroundColor: showInfoOverlay ? 'white' : '#333333',
                  left: showInfoOverlay ? 'calc(100% - 32px)' : '8px',
                  top: '4px',
                  transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateZ(0)' // Hardware acceleration
                }}
              />
              
              {/* Axis text that fades and moves */}
              <span 
                className="relative z-10 text-sm font-medium"
                style={{
                  color: showInfoOverlay ? 'white' : '#374151',
                  marginLeft: showInfoOverlay ? '8px' : '32px',
                  transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Axis
              </span>
            </button>
            {/* Combinations Button */}
            <Link
              href="/combinations"
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
              style={{ color: '#333333' }}
            >
               View All 
            </Link>
            
          
            
            {/* Search Input */}
            {/* <div className="relative z-30">
              <input
                type="text"
                placeholder="search your number..."
                className="w-64 h-8 pl-4 pr-10 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 placeholder:text-xs placeholder:text-gray-400"
                style={{ color: '#333333' }}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div> */}
          </div>
        )}
      </div>

      {/* Map Content - Full screen */}
      <div className="w-full h-full bg-white">
        <div 
          className={`w-full h-full transition-all duration-300 ${
            showInfoOverlay 
              ? 'pointer-events-none blur-sm' 
              : ''
          }`} 
          style={{ zIndex: 10 }}
        >
          <WorldMap 
            userResults={showUserInWorld ? quizResults : null}
            targetPosition={userTargetPosition}
            selectedQuarter={selectedQuarter}
            onQuarterSelect={handleQuarterSelect}
            users={[]}
          />
        </div>
        
        {/* Interaction blocker overlay when labels are showing */}
        {showInfoOverlay && (
          <div 
            className="absolute inset-0 w-full h-full pointer-events-auto cursor-default"
            style={{ zIndex: 15 }}
          />
        )}
      </div>
      
      {/* Footer with timestamp */}
      <div className="absolute bottom-0 left-0 z-20 p-6 bg-transparent">
        <div className="flex items-center space-x-2 text-sm" style={{ color: '#333333' }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#333333' }}></div>
          <span className="font-medium">LIVE</span>
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExplorePageContent />
    </Suspense>
  );
} 