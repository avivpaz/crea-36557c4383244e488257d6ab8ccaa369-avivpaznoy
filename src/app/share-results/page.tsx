'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayerType } from '@/components/EmotionalLayer';
import { LayerResult, BoundaryType } from '@/utils/boundaryCalculation';
import Image from 'next/image';
import html2canvas from 'html2canvas';

// Boundary display names and descriptions (same as in ResultsPopup)
const boundaryInfo: Record<BoundaryType, { name: string; description: string; color: string }> = {
  caution: { name: 'Caution', description: 'Careful, prepares ahead', color: '#3B82F6' },
  flow: { name: 'Flow', description: 'Moves easily, avoids resistance', color: '#EC4899' },
  anchor: { name: 'Anchor', description: 'Stable, seeks emotional ground', color: '#10B981' },
  sensitivity: { name: 'Sensitivity', description: 'Feels quietly, inwardly soft', color: '#F59E0B' },
  logic: { name: 'Logic', description: 'Analytical, seeks understanding', color: '#8B5CF6' },
  exploration: { name: 'Exploration', description: 'Curious, seeks new experiences', color: '#EF4444' },
  stability: { name: 'Stability', description: 'Consistent, reliable foundation', color: '#059669' },
  intuition: { name: 'Intuition', description: 'Trusts inner knowing', color: '#DC2626' },
  planning: { name: 'Planning', description: 'Organized, thinks ahead', color: '#1D4ED8' },
  openness: { name: 'Openness', description: 'Welcoming, embraces change', color: '#9333EA' },
  connection: { name: 'Connection', description: 'Values relationships deeply', color: '#0891B2' },
  withdrawal: { name: 'Withdrawal', description: 'Seeks solitude to recharge', color: '#6B7280' },
  impulse: { name: 'Impulse', description: 'Acts on immediate feelings', color: '#F97316' },
  order: { name: 'Order', description: 'Values structure and organization', color: '#1E40AF' },
  clarity: { name: 'Clarity', description: 'Seeks clear understanding', color: '#7C3AED' },
  turbulence: { name: 'Turbulence', description: 'Embraces chaos and change', color: '#DC2626' }
};

// Layer labels
const layerLabels: Record<LayerType, string> = {
  outer: 'Outer Self',
  daily: 'Daily Self / Dominant Layer',
  inner: 'Inner Self',
  deep: 'Deep Self'
};

interface QuizResults {
  layerResults: Record<LayerType, LayerResult | null>;
  completedAt: string;
  userId: string;
}

// Generate group name from the two highest boundaries
const getGroupName = (layerResults: Record<LayerType, LayerResult | null>): string => {
  const boundaries: { boundary: string; percentage: number }[] = [];
  
  Object.values(layerResults).forEach(result => {
    if (result) {
      Object.entries(result.votes).forEach(([boundary, votes]) => {
        const total = Object.values(result.votes).reduce((sum, v) => sum + v, 0);
        const percentage = Math.round((votes / total) * 100);
        boundaries.push({ boundary, percentage });
      });
    }
  });
  
  // Sort by percentage and get top 2
  boundaries.sort((a, b) => b.percentage - a.percentage);
  const top2 = boundaries.slice(0, 2);
  
  if (top2.length >= 2) {
    const name1 = boundaryInfo[top2[0].boundary as BoundaryType]?.name || top2[0].boundary;
    const name2 = boundaryInfo[top2[1].boundary as BoundaryType]?.name || top2[1].boundary;
    return `${name1} + ${name2}`;
  }
  
  return 'Balanced Explorer';
};

function ShareResultsContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const userId = searchParams.get('userId');
      const completedAt = searchParams.get('completedAt');
      const outer = searchParams.get('outer');
      const daily = searchParams.get('daily');
      const inner = searchParams.get('inner');
      const deep = searchParams.get('deep');
      const outerVotes = searchParams.get('outerVotes');
      const dailyVotes = searchParams.get('dailyVotes');
      const innerVotes = searchParams.get('innerVotes');
      const deepVotes = searchParams.get('deepVotes');

      if (!userId || !completedAt) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      const layerResults: Record<LayerType, LayerResult | null> = {
        outer: outer && outerVotes ? {
          layer: 'outer' as LayerType,
          winningBoundary: outer as BoundaryType,
          votes: JSON.parse(outerVotes)
        } : null,
        daily: daily && dailyVotes ? {
          layer: 'daily' as LayerType,
          winningBoundary: daily as BoundaryType,
          votes: JSON.parse(dailyVotes)
        } : null,
        inner: inner && innerVotes ? {
          layer: 'inner' as LayerType,
          winningBoundary: inner as BoundaryType,
          votes: JSON.parse(innerVotes)
        } : null,
        deep: deep && deepVotes ? {
          layer: 'deep' as LayerType,
          winningBoundary: deep as BoundaryType,
          votes: JSON.parse(deepVotes)
        } : null
      };

      setResults({
        userId,
        completedAt,
        layerResults
      });
      setLoading(false);
    } catch (error) {
      console.error('Error parsing shared results:', error);
      setError('Invalid share link data');
      setLoading(false);
    }
  }, [searchParams]);

  // User Result Icons Component
  const UserResultIcons = ({ layerResults }: { layerResults: Record<LayerType, LayerResult | null> }) => {
    const layerOrder: LayerType[] = ['outer', 'daily', 'inner', 'deep'];
    
    // Layer configuration with size and opacity rules
    const layerConfig = {
      outer: { size: 1.0, opacity: 1.0 },   // 100% size, 100% opacity
      daily: { size: 0.8, opacity: 0.8 },   // 80% size, 80% opacity
      inner: { size: 0.6, opacity: 0.6 },   // 60% size, 60% opacity
      deep: { size: 0.4, opacity: 0.4 }     // 40% size, 40% opacity
    };
    
    const baseSize = 680; // Base size for the icons
    
    return (
      <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56">
        {layerOrder.map((layerType, layerIndex) => {
          const layerResult = layerResults[layerType];
          const winningBoundary = layerResult?.winningBoundary;
          
          if (!winningBoundary) return null;
          
          const config = layerConfig[layerType];
          const iconSize = baseSize * config.size;
          
          return (
            <div
              key={layerType}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                zIndex: layerOrder.length - layerIndex, // Reverse z-index so outer is on top
              }}
            >
              <Image
                src={`/icons/${winningBoundary}.svg`}
                alt={`${layerType} layer - ${winningBoundary}`}
                width={iconSize}
                height={iconSize}
                className="object-contain"
                style={{
                  opacity: config.opacity,
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Download results as image
  const downloadAsImage = async () => {
    if (!resultsRef.current || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // Capture the results card as canvas
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        allowTaint: true,
        height: resultsRef.current.scrollHeight,
        width: resultsRef.current.scrollWidth
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `identity-shape-results-${results?.userId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      // You could show a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  // Share via native sharing if available
  const shareResults = async () => {
    if (!navigator.share) {
      // Fallback to download
      downloadAsImage();
      return;
    }

    try {
      await navigator.share({
        title: 'My Identity Shape Results',
        text: `Check out my identity shape results - ID: ${results?.userId}`,
        url: window.location.href
      });
    } catch {
      // User cancelled sharing or error occurred, fallback to download
      downloadAsImage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading shared results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Failed to load results'}</p>
          <p className="mt-2 text-gray-600">The share link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const groupName = getGroupName(results.layerResults);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Identity Shape Results
          </h1>
          <p className="text-gray-600">Shared results from the Identity Shape Quiz</p>
        </div>

        {/* Results Card */}
        <div 
          ref={resultsRef}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          {/* Header */}
          <div className="text-left pb-6 border-b border-gray-200 mb-8">
            <div className="text-lg font-semibold text-black">
              Your Identity shape 
              <span className="font-normal text-gray-500 mx-2">//</span>
              <span className="font-normal text-gray-600 text-base">Use your ID number and shapes to find yourself</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
            {/* User Result Icons - Left Side */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <UserResultIcons layerResults={results.layerResults} />
            </div>

            {/* Right Side Content */}
            <div className="flex-1 w-full">
              {/* ID Number and Group Name */}
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-6">
                {/* ID Number */}
                <div className="text-center md:text-left">
                  <p className="text-gray-600 text-base mb-2">ID number</p>
                  <p className="text-4xl md:text-5xl font-bold text-black">{results.userId}</p>
                </div>

                {/* Group Name */}
                <div className="text-center md:text-left">
                  <p className="text-gray-600 text-base mb-2">Your group</p>
                  <p className="text-2xl md:text-3xl font-bold text-black">{groupName}</p>
                </div>
              </div>

              {/* Attributes - 2x2 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {(Object.keys(layerLabels) as LayerType[]).map((layerType) => {
                  const layerResult = results.layerResults[layerType];
                  const winningBoundary = layerResult?.winningBoundary as BoundaryType;
                  const info = boundaryInfo[winningBoundary];
                  
                  if (!info || !layerResult) return null;
                  
                  const total = Object.values(layerResult.votes).reduce((sum, v) => sum + v, 0);
                  const percentage = Math.round((layerResult.votes[winningBoundary] / total) * 100);
                  
                  return (
                    <div key={layerType} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Image 
                          src={`/icons/${winningBoundary}.svg`}
                          alt={winningBoundary}
                          width={48}
                          height={48}
                          className="w-12 h-12 md:w-14 md:h-14"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-600 text-base mb-1">
                          {layerLabels[layerType]}
                        </div>
                        <div className="font-semibold text-black text-lg md:text-xl mb-2">
                          {info.name} â {percentage}%
                        </div>
                        <div className="text-gray-600 text-base leading-relaxed">
                          {info.description}.
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Completed on {new Date(results.completedAt).toLocaleDateString()}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Take your own Identity Shape Quiz to discover your unique pattern
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          {/* Download Button */}
          <button
            onClick={downloadAsImage}
            disabled={isDownloading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isDownloading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isDownloading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Preparing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Save to Phone</span>
              </div>
            )}
          </button>

          {/* Share Button (only show if native sharing is supported) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={shareResults}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShareResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ShareResultsContent />
    </Suspense>
  );
} 