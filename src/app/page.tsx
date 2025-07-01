"use client";

import Button from "@/components/Button";
import SpaceCanvas from "@/components/SpaceCanvas";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Intro animation component
const QuizIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);

  const lines = [
    "Ready to discover your shape?",
    "16 questions. 4 layers.",
    "And in the end?",
    "You'll see yourself like never before."
  ];

  useEffect(() => {
    // Show lines one by one
    const showLine = (index: number) => {
      setTimeout(() => {
        setVisibleLines(index + 1);
        if (index < lines.length - 1) {
          showLine(index + 1);
        } else {
          // Show start button after all lines are visible
          setTimeout(() => {
            setShowStartButton(true);
          }, 800);
        }
      }, 800); // Fixed 800ms delay between lines
    };

    showLine(0);
  }, [lines.length]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-8 z-10">
      {/* Animated text lines */}
      <div className="text-center space-y-3 mb-16">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`transition-all duration-1000 ease-out transform ${
              visibleLines > index 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-8"
            }`}
          >
            {index === 0 && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-2" style={{ color: '#333333' }}>
                {line}
              </h1>
            )}
            {index > 0 && (
              <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-700 leading-relaxed">
                {line}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Start button */}
      <div
        className={`transition-all duration-1000 ease-out transform ${
          showStartButton 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        <button
          onClick={onComplete}
          className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden text-lg font-medium rounded-full hover:text-white transition-all duration-300 ease-out"
          style={{ 
            color: '#333333', 
            borderColor: '#333333', 
            borderWidth: '2px',
            borderStyle: 'solid'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span className="relative z-10 flex items-center">
            Start
            <svg 
              className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  useEffect(() => {
    // Delay showing content to match the space background zoom
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleBeginJourney = () => {
    setShowIntro(true);
  };

  const handleIntroComplete = () => {
    // Navigate to quiz after intro completes
    router.push('/quiz');
  };

  // Show intro if user clicked "Begin your journey"
  if (showIntro) {
    return (
      <>
        <SpaceCanvas />
        <QuizIntro onComplete={handleIntroComplete} />
      </>
    );
  }

  return (
    <>
      <SpaceCanvas />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 relative space-theme">
        <div
          className={`transition-all duration-1000 ease-out transform ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "1s" }}
        >
          <div className="mb-16">
            <Image
              src="/logo.svg"
              alt="Noy Logo"
              width={120}
              height={60}
              className="w-80 max-w-full"
              priority
            />
          </div>
        </div>
    
        
        <div
          className={`transition-all duration-1000 ease-out transform ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "1.6s" }}
        >
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
            <button
              onClick={handleBeginJourney}
              className="btn btn-primary"
            >
              Begin your journey
            </button>
            <Button href="/explore" variant="secondary">
              Explore the world
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
