"use client";

import Image from 'next/image';
import KidSparkHeader from '../KidSparkHeader';
import Lottie from '../Lottie';

interface Screen2Props {
  onNext: () => void;
}

export default function Screen2({ onNext }: Screen2Props) {
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

      {/* Brand header */}
      <div className="relative z-20">
        <KidSparkHeader />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[100dvh] p-4 sm:p-6">
        <div className="text-center max-w-3xl mx-auto w-full">
          {/* Hero animation (replaces static image) */}
          <div className="mb-4 sm:mb-6 relative flex items-center justify-center">
            <Lottie
              src="https://lottie.host/e2d6b4d8-3a21-4486-b363-8b03571ee1f2/FT9nFDO9FZ.lottie"
              className="w-44 h-44 sm:w-64 sm:h-64 md:w-72 md:h-72"
            />
          </div>

          {/* Text content */}
          <div className="space-y-3 sm:space-y-4 pb-24 sm:pb-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              Innovative learning<br />
              <span className="text-orange-600">modern learner</span>
            </h2>

            <p className="text-lg sm:text-2xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              It is a long established fact that a reader will by the readable content of a page when.
            </p>

            {/* CTA Button */}
            {/* Desktop/tablet CTA */}
            <button
              onClick={onNext}
              className="hidden sm:inline-flex mt-4 sm:mt-6 px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg sm:text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Let&apos;s go 👋
            </button>
            {/* Mobile sticky CTA */}
            <div className="sm:hidden">
              <div className="fixed left-4 right-4 bottom-4 z-30">
                <button
                  onClick={onNext}
                  className="w-full min-h-14 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-2xl font-bold rounded-full shadow-xl active:scale-[0.98] transition-all"
                >
                  Let&apos;s go 👋
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
