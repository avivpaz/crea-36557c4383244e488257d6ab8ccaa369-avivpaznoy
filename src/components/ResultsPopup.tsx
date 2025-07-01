'use client';

import React, { useState, useRef } from 'react';
import { LayerType } from '@/components/EmotionalLayer';
import { LayerResult, BoundaryType } from '@/utils/boundaryCalculation';
import Image from 'next/image';
import QRCode from 'qrcode';

// Boundary display names and descriptions
const boundaryInfo: Record<BoundaryType, { name: string; description: string; color: string }> = {
  caution: { name: 'Caution', description: 'Think before doing', color: '#3B82F6' },
  flow: { name: 'Flow', description: 'Goes with the flow', color: '#EC4899' },
  anchor: { name: 'Anchor', description: 'Looks for emotional stability', color: '#10B981' },
  sensitivity: { name: 'Sensitivity', description: 'Feels gently, notices details', color: '#F59E0B' },
  logic: { name: 'Logic', description: 'Understands through clear thinking', color: '#8B5CF6' },
  exploration: { name: 'Exploration', description: 'Loves discovering new things', color: '#EF4444' },
  stability: { name: 'Stability', description: 'Calm, balanced, steady', color: '#059669' },
  intuition: { name: 'Intuition', description: 'Trusts gut feelings', color: '#DC2626' },
  planning: { name: 'Planning', description: 'Likes to plan and stay organized', color: '#1D4ED8' },
  openness: { name: 'Openness', description: 'Likes to share and connect', color: '#9333EA' },
  connection: { name: 'Connection', description: 'Wants real closeness with others', color: '#0891B2' },
  withdrawal: { name: 'Withdrawal', description: 'Needs quiet and alone time', color: '#6B7280' },
  impulse: { name: 'Impulse', description: 'Acts in the moment', color: '#F97316' },
  order: { name: 'Order', description: 'Feels good when things are in order', color: '#1E40AF' },
  clarity: { name: 'Clarity', description: 'Needs things simple and honest', color: '#7C3AED' },
  turbulence: { name: 'Turbulence', description: 'Feels a lot, changes often', color: '#DC2626' }
};

// Layer labels
const layerLabels: Record<LayerType, string> = {
  outer: 'Outer self',
  daily: 'Daily self',
  inner: 'Inner self',
  deep: 'Deep self'
};

interface QuizResults {
  layerResults: Record<LayerType, LayerResult | null>;
  completedAt: string;
  userId: string;
}

interface ResultsPopupProps {
  results: QuizResults;
  onClose: () => void;
}

// Generate group name based on outer self result quadrant
const getGroupName = (layerResults: Record<LayerType, LayerResult | null>): string => {
  const outerResult = layerResults.outer;
  
  if (!outerResult?.winningBoundary) {
    return 'Balanced Explorer';
  }
  
  const outerBoundary = outerResult.winningBoundary;
  
  // Define quadrant groups
  const quadrants = {
    'Open + Deep': ['openness', 'exploration', 'intuition', 'sensitivity'],
    'Closed + Deep': ['withdrawal', 'anchor', 'logic', 'turbulence'],
    'Open + Outer': ['connection', 'impulse', 'flow', 'clarity'],
    'Closed + Outer': ['caution', 'planning', 'order', 'stability']
  };
  
  // Find which quadrant the outer boundary belongs to
  for (const [quadrantName, boundaries] of Object.entries(quadrants)) {
    if (boundaries.includes(outerBoundary)) {
      return quadrantName;
    }
  }
  
  return 'Balanced Explorer';
};

// Create the user result icons component - memoized to prevent re-renders
const UserResultIcons = React.memo(({ layerResults }: { layerResults: Record<LayerType, LayerResult | null> }) => {
  const layerOrder: LayerType[] = ['outer', 'daily', 'inner', 'deep'];
  
  // Layer configuration with size and opacity rules - matching combinations page exactly
  const layerConfig = {
    outer: { size: 1.0, opacity: 1.0 },   // 100% size, 100% opacity
    daily: { size: 0.8, opacity: 0.8 },   // 80% size, 80% opacity
    inner: { size: 0.6, opacity: 0.6 },   // 60% size, 60% opacity
    deep: { size: 0.4, opacity: 0.4 }     // 40% size, 40% opacity
  };
  
  const baseSize = 240; // Base size for the display (reduced from 280 to create space around icons)
  
  return (
    <>
      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes spinRight {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes spinLeft {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        
        .icon-spin-right {
          animation: spinRight 15s linear infinite;
        }
        
        .icon-spin-left {
          animation: spinLeft 15s linear infinite;
        }
      `}</style>
      
      <div 
        className="relative"
        style={{
          width: `${baseSize}px`,
          height: `${baseSize}px`,
        }}
      >
        {layerOrder.map((layerType, layerIndex) => {
          const layerResult = layerResults[layerType];
          const winningBoundary = layerResult?.winningBoundary;
          
          if (!winningBoundary) return null;
          
          const config = layerConfig[layerType];
          const iconSize = baseSize * config.size;
          
          // Alternate spin direction: even indices spin right, odd indices spin left
          const spinClass = layerIndex % 2 === 0 ? 'icon-spin-right' : 'icon-spin-left';
          
          return (
            <div
              key={layerType}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                zIndex: layerIndex + 1, // Proper z-index stacking like combinations page
              }}
            >
              <Image
                src={`/icons/${winningBoundary}.svg`}
                alt={`${layerType} layer - ${winningBoundary}`}
                width={iconSize}
                height={iconSize}
                className={`object-contain ${spinClass}`}
                style={{
                  opacity: config.opacity,
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
    </>
  );
});

UserResultIcons.displayName = 'UserResultIcons';

export default function ResultsPopup({ results, onClose }: ResultsPopupProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const groupName = getGroupName(results.layerResults);
  
  const handleClose = () => {
    setIsAnimating(true);
    // Close popup immediately to hand off animation to parent
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Generate shareable URL
  const generateShareableUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      userId: results.userId,
      completedAt: results.completedAt,
      outer: results.layerResults.outer?.winningBoundary || '',
      daily: results.layerResults.daily?.winningBoundary || '',
      inner: results.layerResults.inner?.winningBoundary || '',
      deep: results.layerResults.deep?.winningBoundary || '',
      outerVotes: JSON.stringify(results.layerResults.outer?.votes || {}),
      dailyVotes: JSON.stringify(results.layerResults.daily?.votes || {}),
      innerVotes: JSON.stringify(results.layerResults.inner?.votes || {}),
      deepVotes: JSON.stringify(results.layerResults.deep?.votes || {})
    });
    return `${baseUrl}/share-results?${params.toString()}`;
  };

  // Generate QR code
  const generateQRCode = async () => {
    try {
      const shareUrl = generateShareableUrl();
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  // Handle share button click
  const handleShare = async () => {
    if (isGeneratingQR) return;
    
    setIsGeneratingQR(true);
    
    try {
      // Generate QR code
      await generateQRCode();
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Close QR modal
  const closeQRModal = () => {
    setShowQRModal(false);
    setQrCodeDataUrl('');
  };

  // Copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableUrl());
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <>
      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-[100001] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
            {/* Close button */}
            <button
              onClick={closeQRModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Share Your Results
              </h3>
              <p className="text-gray-600 mb-6">
                Scan this QR code with your phone to view and save your identity shape results
              </p>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                    <Image
                      src={qrCodeDataUrl}
                      alt="QR Code to share results"
                      width={250}
                      height={250}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-sm text-gray-500 mb-6">
                <p className="mb-2">â¢ Open your phone&apos;s camera</p>
                <p className="mb-2">â¢ Point it at the QR code</p>
                <p>â¢ Tap the link that appears</p>
              </div>

              {/* Alternative copy link */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 mb-3">Or copy the link manually:</p>
                <button
                  onClick={copyToClipboard}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  Copy Share Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Popup */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 md:p-6 lg:p-8 xl:px-16 xl:py-8 transition-opacity duration-500 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}>
        <div 
          ref={popupRef}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl relative mx-4 md:mx-8 lg:mx-12 xl:mx-16"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 z-10"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-left pt-6 pb-4 md:pt-8 md:pb-6 lg:pt-10 lg:pb-6 px-8 md:px-12 lg:px-16">
            <div className="text-sm md:text-base lg:text-lg font-semibold text-black">
              Your Identity shape 
              <span className="font-normal text-gray-500 mx-2">//</span>
              <span className="font-normal text-gray-600 text-xs md:text-sm lg:text-base">Use your ID number and shapes to find yourself</span>
            </div>
          </div>

          {/* Main content */}
          <div className="px-8 pb-6 md:px-12 md:pb-8 lg:px-16 lg:pb-10 mt-6 md:mt-8 lg:mt-10">
            <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8 lg:gap-10 xl:gap-12">
              {/* User Result Icons - Left Side - Increased width for bigger icons */}
              <div className="flex-shrink-0 mx-auto md:mx-0 flex items-center justify-center md:w-96 lg:w-[240px] xl:w-[320px]" data-popup-icons>
                <UserResultIcons layerResults={results.layerResults} />
              </div>

              {/* Right Side Content - Further reduced width */}
              <div className="flex-1 w-full max-w-full">
                {/* ID Number and Group Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-5 lg:gap-x-6 xl:gap-x-7 gap-y-3 md:gap-y-4 mb-4 md:mb-5 lg:mb-6 pl-10 md:pl-11 lg:pl-12">
                  {/* ID Number */}
                  <div className="text-center md:text-left">
                    <p className="text-gray-600 text-xs md:text-sm lg:text-base mb-1">ID number</p>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">{results.userId}</p>
                  </div>

                  {/* Group Name */}
                  <div className="text-center md:text-left">
                    <p className="text-gray-600 text-xs md:text-sm lg:text-base mb-1">Your group</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-black">{groupName}</p>
                  </div>
                </div>

                {/* Attributes - 2x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-5 lg:gap-x-6 xl:gap-x-7 gap-y-3 md:gap-y-4 lg:gap-y-5">
                  {(Object.keys(layerLabels) as LayerType[]).map((layerType) => {
                    const layerResult = results.layerResults[layerType];
                    const winningBoundary = layerResult?.winningBoundary as BoundaryType;
                    const info = boundaryInfo[winningBoundary];
                    
                    if (!info || !layerResult) return null;
                    
                    const total = Object.values(layerResult.votes).reduce((sum, v) => sum + v, 0);
                    const percentage = Math.round((layerResult.votes[winningBoundary] / total) * 100);
                    
                    return (
                      <div key={layerType} className="flex items-start space-x-2 md:space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <Image 
                            src={`/icons/${winningBoundary}.svg`}
                            alt={winningBoundary}
                            width={40}
                            height={40}
                            className="w-8 h-8 md:w-10 md:h-10 lg:w-11 lg:h-11"
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-600 text-xs md:text-sm mb-0.5">
                            {layerLabels[layerType]}
                          </div>
                          <div className="font-semibold text-black text-sm md:text-base lg:text-lg mb-0.5 md:mb-1">
                            {info.name} â {percentage}%
                          </div>
                          <div className="text-gray-600 text-xs md:text-sm lg:text-base leading-tight">
                            {info.description}.
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Share button */}
            <div className="flex justify-end mt-6 md:mt-8">
              <button 
                onClick={handleShare}
                disabled={isGeneratingQR}
                className={`p-2 md:p-3 transition-colors ${
                  isGeneratingQR 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Share with QR code"
              >
                {isGeneratingQR ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Export the UserResultIcons component for use in other components
export { UserResultIcons }; 