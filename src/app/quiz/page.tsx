'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LayerTracker from '@/components/LayerTracker';
import Slider from '@/components/Slider';
import { questions } from '@/components/Questions';
import { LayerType } from '@/components/EmotionalLayer';
import { BoundaryCalculator, LayerResult } from '@/utils/boundaryCalculation';

// Icon animation component
const IconLoadingAnimation = ({ onComplete, layerResults }: { 
  onComplete: () => void;
  layerResults: Record<LayerType, LayerResult | null>;
}) => {
  const [animationPhase, setAnimationPhase] = useState<'start' | 'moving' | 'shuffling' | 'complete'>('start');
  
  // Get the 4 selected boundary icons
  const selectedIcons = [
    layerResults.outer?.winningBoundary,
    layerResults.daily?.winningBoundary,
    layerResults.inner?.winningBoundary,
    layerResults.deep?.winningBoundary
  ].filter(Boolean) as string[];

  useEffect(() => {
    // Start animation after a brief delay
    const startTimer = setTimeout(() => {
      setAnimationPhase('moving');
    }, 500);

    // Start shuffling after icons have moved to grid
    const shuffleTimer = setTimeout(() => {
      setAnimationPhase('shuffling');
    }, 2500);

    // Complete animation after shuffling
    const completeTimer = setTimeout(() => {
      setAnimationPhase('complete');
      setTimeout(() => onComplete(), 1000);
    }, 4500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(shuffleTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0">
        <div className="flex justify-between items-center p-4 md:p-6 lg:p-8">
          <Image
            src="/logo.svg"
            alt="Noy Logo"
            width={60}
            height={30}
            className="w-16 max-w-full"
            priority
          />
        </div>
      </div>

      {/* Icon animation */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-80 h-80 md:w-96 md:h-96">
          {selectedIcons.map((icon, index) => {
            // Calculate starting positions (from different directions)
            const startPositions = [
              { x: -200, y: -100 },   // from top-left
              { x: 200, y: -100 },    // from top-right
              { x: -200, y: 100 },    // from bottom-left
              { x: 200, y: 100 }      // from bottom-right
            ];
            
            // Final positions in 2x2 grid
            const gridPositions = [
              { x: -50, y: -50 },  // top-left
              { x: 50, y: -50 },   // top-right
              { x: -50, y: 50 },   // bottom-left
              { x: 50, y: 50 }     // bottom-right
            ];

            // Shuffled positions (swap some icons around)
            const shuffledPositions = [
              { x: 50, y: 50 },    // bottom-right (was top-left)
              { x: -50, y: 50 },   // bottom-left (was top-right)
              { x: 50, y: -50 },   // top-right (was bottom-left)
              { x: -50, y: -50 }   // top-left (was bottom-right)
            ];
            
            const startPos = startPositions[index] || { x: 0, y: 0 };
            const gridPos = gridPositions[index] || { x: 0, y: 0 };
            const shuffledPos = shuffledPositions[index] || { x: 0, y: 0 };
            
            // Determine current position based on animation phase
            let currentPos = startPos;
            let currentScale = 'scale-50';
            let currentOpacity = 'opacity-0';
            
            if (animationPhase === 'moving') {
              currentPos = gridPos;
              currentScale = 'scale-100';
              currentOpacity = 'opacity-100';
            } else if (animationPhase === 'shuffling') {
              currentPos = shuffledPos;
              currentScale = 'scale-100';
              currentOpacity = 'opacity-100';
            } else if (animationPhase === 'complete') {
              currentPos = gridPos; // Return to original grid positions
              currentScale = 'scale-110';
              currentOpacity = 'opacity-100';
            }
            
            return (
              <div
                key={`${icon}-${index}`}
                className={`absolute transition-all duration-1000 ease-in-out ${currentOpacity} ${currentScale}`}
                style={{
                  transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-32px',
                  marginTop: '-32px',
                  zIndex: 10 + index
                }}
              >
                <Image 
                  src={`/icons/${icon}.svg`}
                  alt={icon}
                  width={64}
                  height={64}
                  className="w-16 h-16 md:w-20 md:h-20"
                />
              </div>
            );
          })}
        </div>
        
        {/* Loading text */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-black mb-2">
            Analyzing your boundaries...
          </h2>
        </div>
      </div>
    </div>
  );
};

export default function QuizPage() {
  const router = useRouter();
  const [currentLayer, setCurrentLayer] = useState<LayerType>('outer');
  const [completedLayers, setCompletedLayers] = useState<LayerType[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [layerResults, setLayerResults] = useState<Record<LayerType, LayerResult | null>>({
    outer: null,
    daily: null,
    inner: null,
    deep: null
  });
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(false);
  
  // Use useRef to persist the calculator across re-renders
  const boundaryCalculator = useRef(new BoundaryCalculator());

  // Get questions for current layer
  const questionsInCurrentLayer = questions.filter(q => q.layer === currentLayer);
  
  // Get total question count and current position
  const allQuestions = questions.sort((a, b) => a.id - b.id);
  const currentLayerFirstQuestionId = questionsInCurrentLayer[0]?.id || 1;
  const currentQuestionNumber = allQuestions.findIndex(q => q.id === currentLayerFirstQuestionId) + questionsInCurrentLayer.length;

  // Initialize default answers for current layer
  useEffect(() => {
    questionsInCurrentLayer.forEach(question => {
      if (answers[question.id] === undefined) {
        setAnswers(prev => ({
          ...prev,
          [question.id]: 50
        }));
      }
    });
  }, [currentLayer, questionsInCurrentLayer]);

  // Add animation effect when layer changes
  useEffect(() => {
    setQuestionsVisible(false);
    const timer = setTimeout(() => {
      setQuestionsVisible(true);
    }, 300); // Delay before showing questions

    return () => clearTimeout(timer);
  }, [currentLayer]);

  const handleSliderChange = (questionId: number, value: number) => {
    console.log(`=== SLIDER CHANGE ===`);
    console.log(`Question ${questionId}: Attempting to set value to ${value}`);
    console.log(`Current answers[${questionId}]:`, answers[questionId]);
    
    // Save the answer
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: value
      };
      console.log(`New answers[${questionId}]:`, newAnswers[questionId]);
      console.log(`Full new answers:`, newAnswers);
      return newAnswers;
    });

    // Add vote to boundary calculator
    const boundary = boundaryCalculator.current.addVote(questionId, value);
    console.log(`Question ${questionId}, Value ${value} -> Boundary: ${boundary}`);
    console.log(`=== END SLIDER CHANGE ===`);
  };

  const handleNextLayer = () => {
    // Hide questions before transitioning
    setQuestionsVisible(false);
    
    setTimeout(() => {
      // Ensure all answers in current layer are counted as votes
      questionsInCurrentLayer.forEach(question => {
        const currentAnswer = answers[question.id] ?? 50;
        boundaryCalculator.current.addVote(question.id, currentAnswer);
      });
      
      // Calculate the result for the current layer
      const layerResult = boundaryCalculator.current.calculateLayerResult(currentLayer);
      if (layerResult) {
        setLayerResults(prev => ({
          ...prev,
          [currentLayer]: layerResult
        }));
        console.log(`Layer ${currentLayer} result:`, layerResult);
      }
      
      // Mark current layer as completed
      if (!completedLayers.includes(currentLayer)) {
        setCompletedLayers(prev => [...prev, currentLayer]);
      }
      
      // Determine next layer
      let nextLayer: LayerType;
      
      switch (currentLayer) {
        case 'outer':
          nextLayer = 'daily';
          break;
        case 'daily':
          nextLayer = 'inner';
          break;
        case 'inner':
          nextLayer = 'deep';
          break;
        case 'deep':
          // Quiz complete - calculate final results and show loading animation
          const finalLayerResults = {
            outer: boundaryCalculator.current.calculateLayerResult('outer'),
            daily: boundaryCalculator.current.calculateLayerResult('daily'),
            inner: boundaryCalculator.current.calculateLayerResult('inner'),
            deep: layerResult // We just calculated this above
          };
          
          setLayerResults(finalLayerResults);
          setShowLoadingAnimation(true);
          return;
        default:
          nextLayer = 'outer';
      }
      
      console.log("Next layer:", nextLayer);
      setCurrentLayer(nextLayer);
    }, 200); // Small delay for smooth transition
  };

  const handleAnimationComplete = () => {
    // Store results in localStorage before navigating
    const resultsData = {
      layerResults,
      completedAt: new Date().toISOString(),
      userId: `N.${Math.floor(Math.random() * 999) + 1}` // Generate random ID
    };
    
    localStorage.setItem('quizResults', JSON.stringify(resultsData));
    
    // Navigate to explore page with popup after animation completes
    router.push('/explore?showResults=true');
  };

  // Show loading animation if quiz is complete
  if (showLoadingAnimation) {
    return <IconLoadingAnimation onComplete={handleAnimationComplete} layerResults={layerResults} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Fixed Boundaries tracker at the top */}
      <div className="fixed top-0 left-0 right-0 bg-white z-30 py-3 md:py-4 lg:py-6 border-b border-gray-100">
        <LayerTracker 
          currentLayer={currentLayer} 
          completedLayers={completedLayers}
          layerResults={layerResults}
        />
      </div>

      {/* Scrollable Questions area */}
      <div className="flex-1 overflow-y-auto px-8 md:px-20 lg:px-32 xl:px-40 pt-24 md:pt-28 lg:pt-32 pb-20 md:pb-24 lg:pb-28">
        <div className="max-w-3xl w-full mx-auto">
          <div className="flex flex-col space-y-6 md:space-y-8 lg:space-y-10 py-4 md:py-6 lg:py-8">
            {questionsInCurrentLayer.map((question, index) => (
              <div 
                key={question.id} 
                className={`flex flex-col space-y-4 md:space-y-5 lg:space-y-6  transition-all duration-700 ease-out transform ${
                  questionsVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  transitionDelay: questionsVisible ? `${index * 150}ms` : '0ms' 
                }}
              >
                <h3 className="text-[18px] text-black leading-relaxed font-normal text-left">
                  {question.id}. {question.text}
                </h3>
                
                <div className="flex items-center space-x-2 md:space-x-3">
                  <span className="text-xs md:text-sm text-gray-600 w-14 md:w-16 text-right select-none">Not me</span>
                  <div className="flex-1">
                    <Slider 
                      min={0}
                      max={100}
                      value={(() => {
                        const sliderValue = answers[question.id] ?? 50;
                        console.log(`Slider ${question.id} receiving value:`, sliderValue);
                        return sliderValue;
                      })()}
                      onChange={(value) => handleSliderChange(question.id, value)} 
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-14 md:w-16 text-left select-none">Fully me</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation - bottom right corner */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 z-10">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-black font-light">{currentQuestionNumber}/16</span>
          <button 
            onClick={handleNextLayer} 
            className="flex items-center justify-center p-3 md:p-4 hover:opacity-70 transition-opacity"
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 