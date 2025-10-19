'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import KidSparkHeader from '../KidSparkHeader';
import Lottie from '../Lottie';

interface Screen4Props {
  imageUrl: string | null;
  prompt: string;
  onBack?: () => void;
}

export default function Screen4({ imageUrl, prompt, onBack }: Screen4Props) {
  const [activeTab, setActiveTab] = useState<'coloring' | 'animation'>('coloring');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(imageUrl);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Debug: Track when video URL changes
  useEffect(() => {
    console.log('generatedVideoUrl changed:', generatedVideoUrl);
    if (generatedVideoUrl) {
      console.log('Video should now be visible in the UI');
    }
  }, [generatedVideoUrl]);

  const handleRefresh = async () => {
    if (!prompt) return;

    setIsRegenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          sampleCount: 1
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentImageUrl(result.imageUrl);
      } else {
        alert('Error regenerating image: ' + result.error);
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      alert('Error regenerating image. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePlay = async () => {
    if (!currentImageUrl || !prompt) return;

    setIsGeneratingVideo(true);
    try {
      console.log('Starting video generation request...');
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: currentImageUrl,
          prompt: prompt,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        const dataUrl: string | undefined = result.dataUrl;
        if (!dataUrl) {
          console.error('No dataUrl in response:', result);
          alert('Error: No video data returned from server');
          return;
        }

        // Use base64 data URL for immediate playback
        console.log('Received base64 video data URL');
        setGeneratedVideoUrl(dataUrl);
        setActiveTab('animation');
      } else {
        console.error('Video generation failed:', result.error);
        alert('Error generating video: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Error generating video. Please try again.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDownload = () => {
    // Download the current sketch
    if (currentImageUrl) {
      const link = document.createElement('a');
      link.href = currentImageUrl;
      link.download = 'sketch-template.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!currentImageUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your sketch template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-30 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-xl hover:shadow-2xl ring-4 ring-white/70 transition transform hover:scale-105"
          aria-label="Go back"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Decorative circles and shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-200/30 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-pink-200/25 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-orange-200/25 rounded-full"></div>

        {/* Small dots */}
        <div className="absolute top-32 left-1/3 w-3 h-3 bg-orange-300/40 rounded-full"></div>
        <div className="absolute top-60 right-1/4 w-2 h-2 bg-orange-300/50 rounded-full"></div>
        <div className="absolute bottom-40 left-1/2 w-4 h-4 bg-orange-300/35 rounded-full"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        {/* Brand header */}
        <KidSparkHeader />
        {/* Header section */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-1 sm:mb-2 leading-tight">
              Hi Champu
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700">
              Let&apos;s color and animate!
            </p>
          </div>

          {/* Profile image */}
          <div className="relative group cursor-pointer ml-4 flex-shrink-0">
            <div className="relative transform transition-transform duration-300 group-hover:scale-105">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-orange-200 to-pink-200 p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-50 to-orange-50 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-xl ring-2 ring-orange-100">
                    <Image
                      src="/screen3.png"
                      alt="Champu's profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-green-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-y-auto pb-28 sm:pb-0">
          {/* Tab Navigation */}
          <div className="flex bg-white/80 backdrop-blur-sm rounded-full p-1 mb-8 shadow-lg">
            <button
              onClick={() => setActiveTab('coloring')}
              className={`px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === 'coloring'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Coloring
            </button>
            <button
              onClick={() => setActiveTab('animation')}
              className={`px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === 'animation'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Animation
            </button>
          </div>

          {/* Sketch Display Area */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-8 w-full max-w-4xl">
            <div className="aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
              <div className={isGeneratingVideo ? 'w-full h-full blur-sm' : 'w-full h-full'}>
                {activeTab === 'animation' && generatedVideoUrl ? (
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      console.error('Video error details:', e);
                      const videoElement = e.target as HTMLVideoElement;
                      console.error('Video element error:', videoElement.error);
                      console.log('Attempted video URL:', generatedVideoUrl);
                      console.log('Video element readyState:', videoElement.readyState);
                      if (videoElement.error) {
                        console.error('Video error code:', videoElement.error.code);
                        console.error('Video error message:', videoElement.error.message);
                      }
                      alert('Error loading video. Please check the console for details and try again.');
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : currentImageUrl ? (
                  <Image
                    src={currentImageUrl}
                    alt="Sketch template"
                    width={800}
                    height={600}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="animate-pulse">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">Sketch Template</p>
                      <p className="text-sm">Black dots show where to add colors!</p>
                    </div>
                  </div>
                )}
              </div>

              {isGeneratingVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <Lottie
                    src="https://lottie.host/ad5870ab-c2d2-4144-819f-b9899e242a1b/51FakkvBUy.lottie"
                    className="w-72 h-72"
                  />
                </div>
              )}

              {/* Prompt to generate when on Animation tab but no video yet */}
              {activeTab === 'animation' && !generatedVideoUrl && !isGeneratingVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30">
                  <button
                    onClick={handlePlay}
                    className="group relative overflow-hidden w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl ring-4 ring-white/60 bg-gradient-to-r from-red-500 to-pink-500 transform hover:scale-105 transition-all duration-300"
                    aria-label="Generate animation"
                  >
                    <span className="relative z-10 text-xl sm:text-2xl md:text-3xl font-extrabold">Play</span>
                  </button>
                  <p className="mt-4 text-base sm:text-lg md:text-xl font-semibold text-gray-700 text-center px-4">
                    Tap Play to create your animation
                  </p>
                </div>
              )}

              {/* Overlay for coloring mode */}
              {activeTab === 'coloring' && currentImageUrl && (
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-xl pointer-events-none"></div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                {activeTab === 'animation' ? (
                  <>
                    <strong>Animation:</strong> Your animation is ready! Tap Play any time to make a new one from your sketch and idea.
                  </>
                ) : (
                  <>
                    <strong>Coloring Instructions:</strong> The black dots are special coloring areas! Color over them with any colors you want to add your creative details and make the sketch uniquely yours!
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Control Buttons (desktop/tablet) */}
          <div className="hidden sm:flex items-center justify-center gap-4 sm:gap-6">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRegenerating}
              className={`group relative overflow-hidden w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl ring-4 ring-white/60 transform transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
                isRegenerating
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105 cursor-pointer'
              }`}
            >
              {/* Glow and shine overlays */}
              {!isRegenerating && (
                <>
                  <span className="absolute -inset-6 rounded-full blur-2xl bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-orange-300/20 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                  <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="pointer-events-none absolute left-[-150%] top-0 h-full w-1/3 bg-white/20 -skew-x-12 group-hover:translate-x-[450%] transition-transform duration-700" />
                </>
              )}
              {isRegenerating ? (
                <div className="animate-spin relative z-10">
                  <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              ) : (
                <span className="relative z-10 text-sm md:text-base font-bold">Recreate</span>
              )}
            </button>

            {/* Play button */}
            <button
              onClick={handlePlay}
              disabled={isGeneratingVideo}
              className={`group relative overflow-hidden w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl ring-4 ring-white/60 transform transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 ${
                isGeneratingVideo
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105 cursor-pointer'
              }`}
            >
              {/* Glow and shine overlays */}
              {!isGeneratingVideo && (
                <>
                  <span className="absolute -inset-8 rounded-full blur-2xl bg-gradient-to-r from-red-400/25 via-pink-400/25 to-orange-300/25 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                  <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="pointer-events-none absolute left-[-150%] top-0 h-full w-1/3 bg-white/25 -skew-x-12 group-hover:translate-x-[450%] transition-transform duration-700" />
                </>
              )}
              {isGeneratingVideo ? (
                <div className="animate-spin relative z-10">
                  <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              ) : (
                <span className="relative z-10 text-sm md:text-base font-bold">Play</span>
              )}
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="group relative overflow-hidden w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl ring-4 ring-white/60 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-200"
            >
              {/* Glow and shine overlays */}
              <span className="absolute -inset-6 rounded-full blur-2xl bg-gradient-to-r from-yellow-300/30 via-orange-300/30 to-pink-300/30 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="pointer-events-none absolute left-[-150%] top-0 h-full w-1/3 bg-white/20 -skew-x-12 group-hover:translate-x-[450%] transition-transform duration-700" />
            <span className="relative z-10 text-sm md:text-base font-bold">Save</span>
            </button>
          </div>

          {/* Mobile Sticky Action Bar */}
          <div className="sm:hidden fixed left-4 right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-20">
            <div className="bg-white/80 backdrop-blur-md rounded-full shadow-2xl p-2 flex items-center gap-2">
              {/* Again (Regenerate) */}
              <button
                onClick={handleRefresh}
                disabled={isRegenerating}
                aria-busy={isRegenerating}
                className={`flex-1 h-16 rounded-full flex items-center justify-center gap-2 text-white text-xl font-bold transition-all shadow-xl ring-2 ring-white/60 ${
                  isRegenerating
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 active:scale-[0.98]'
                }`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
               Recreate
              </button>

              {/* Play (Generate Video) */}
              <button
                onClick={handlePlay}
                disabled={isGeneratingVideo}
                aria-busy={isGeneratingVideo}
                className={`flex-1 h-16 rounded-full flex items-center justify-center gap-2 text-white text-xl font-bold transition-all shadow-xl ring-2 ring-white/60 ${
                  isGeneratingVideo
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 active:scale-[0.98]'
                }`}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play
              </button>

              {/* Save (Download) */}
              <button
                onClick={handleDownload}
                className="flex-1 h-16 rounded-full flex items-center justify-center gap-2 text-white text-xl font-bold transition-all shadow-xl ring-2 ring-white/60 bg-gradient-to-r from-yellow-400 to-orange-500 active:scale-[0.98]"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5L12 15m0 0l4.5-4.5M12 15V3" />
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
