'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to explore page with results popup
    router.push('/explore?showResults=true');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
        <p>Redirecting to your world...</p>
      </div>
    </div>
  );
} 