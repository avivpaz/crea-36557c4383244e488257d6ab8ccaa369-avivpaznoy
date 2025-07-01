'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingPage() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/results');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="relative mb-12">
        {/* Animated flower-like pattern */}
        <svg
          viewBox="0 0 200 200"
          width="200"
          height="200"
          className="animate-spin-slow"
          style={{ animationDuration: '10s' }}
        >
          {/* Outer petals */}
          <path
            d="M100,10 A90,90 0 0,1 100,190 A90,90 0 0,1 100,10 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M10,100 A90,90 0 0,1 190,100 A90,90 0 0,1 10,100 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            transform="rotate(45 100 100)"
          />
          
          {/* Inner petals */}
          <path
            d="M100,40 A60,60 0 0,1 100,160 A60,60 0 0,1 100,40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M40,100 A60,60 0 0,1 160,100 A60,60 0 0,1 40,100 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            transform="rotate(45 100 100)"
          />
          
          {/* Center petals */}
          <path
            d="M100,70 A30,30 0 0,1 100,130 A30,30 0 0,1 100,70 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M70,100 A30,30 0 0,1 130,100 A30,30 0 0,1 70,100 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            transform="rotate(45 100 100)"
          />
        </svg>
      </div>
      <p className="text-2xl font-light">Generating your results...</p>
    </div>
  );
} 