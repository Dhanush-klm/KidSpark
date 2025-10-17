'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [showSecondScreen, setShowSecondScreen] = useState(false);

  useEffect(() => {
    // Show first screen for 2 seconds, then switch to second screen
    const timer = setTimeout(() => {
      setShowSecondScreen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSecondScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large circles */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-orange-200/40 rounded-full"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-orange-200/25 rounded-full"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-orange-200/35 rounded-full"></div>

          {/* Small dots */}
          <div className="absolute top-32 left-1/3 w-3 h-3 bg-orange-300/50 rounded-full"></div>
          <div className="absolute top-60 right-1/4 w-2 h-2 bg-orange-300/60 rounded-full"></div>
          <div className="absolute bottom-40 left-1/2 w-4 h-4 bg-orange-300/40 rounded-full"></div>
          <div className="absolute bottom-60 right-10 w-2 h-2 bg-orange-300/50 rounded-full"></div>

          {/* Additional decorative elements for second screen */}
          <div className="absolute top-1/3 right-10 w-16 h-16 bg-red-200/40 rounded-full"></div>
          <div className="absolute bottom-1/3 left-16 w-12 h-12 bg-pink-200/30 rounded-full"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Children with balloon image */}
            <div className="mb-12 relative">
              <Image
                src="/screen2.png"
                alt="Children with balloon"
                width={600}
                height={400}
                className="mx-auto rounded-lg shadow-2xl"
                priority
              />
            </div>

            {/* Text content */}
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-bold text-gray-800 leading-tight">
                Innovative learning<br />
                <span className="text-orange-600">modern learner</span>
              </h2>

              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                It is a long established fact that a reader will by the<br />
                readable content of a page when.
              </p>

              {/* CTA Button */}
              <button className="mt-8 px-12 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Let's go 👋
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-200/40 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-orange-200/25 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-orange-200/35 rounded-full"></div>

        {/* Small dots */}
        <div className="absolute top-32 left-1/3 w-3 h-3 bg-orange-300/50 rounded-full"></div>
        <div className="absolute top-60 right-1/4 w-2 h-2 bg-orange-300/60 rounded-full"></div>
        <div className="absolute bottom-40 left-1/2 w-4 h-4 bg-orange-300/40 rounded-full"></div>
        <div className="absolute bottom-60 right-10 w-2 h-2 bg-orange-300/50 rounded-full"></div>

        {/* Curved dashed lines */}
        <svg className="absolute top-1/4 left-0 w-full h-1/2" viewBox="0 0 100 50">
          <path
            d="M10,25 Q30,10 50,25 T90,25"
            stroke="#D4A574"
            strokeWidth="1"
            strokeDasharray="2,2"
            fill="none"
            opacity="0.6"
          />
        </svg>
        <svg className="absolute bottom-1/4 left-0 w-full h-1/2" viewBox="0 0 100 50">
          <path
            d="M15,30 Q40,15 70,30 T95,30"
            stroke="#D4A574"
            strokeWidth="1"
            strokeDasharray="2,2"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-8xl md:text-9xl font-bold tracking-tight">
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#D2691E' }}>K</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#FFB6C1' }}>i</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#FFD700' }}>d</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#228B22' }}>S</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#87CEEB' }}>p</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#4169E1' }}>a</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#D2691E' }}>r</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#FFB6C1' }}>k</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
