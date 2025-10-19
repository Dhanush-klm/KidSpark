'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import KidSparkHeader from '../KidSparkHeader';
import Lottie from '../Lottie';

// Extend window interface for mediaRecorder
declare global {
  interface Window {
    currentMediaRecorder?: MediaRecorder;
  }
}

interface Screen3Props {
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
  onBack?: () => void;
  onProceed?: () => void;
  userName?: string;
}

export default function Screen3({ onImageGenerated, onBack, onProceed, userName }: Screen3Props) {
  const [isRecording, setIsRecording] = useState(false);
  const displayName = userName && userName.trim() ? userName.trim() : 'Champu';
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showEmptyPromptModal, setShowEmptyPromptModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [decorOffsets, setDecorOffsets] = useState({
    a: { x: 0, y: 0, r: 0 },
    b: { x: 0, y: 0, r: 0 },
    c: { x: 0, y: 0, r: 0 },
    d: { x: 0, y: 0, r: 0 },
  });

  // Auto-expand textarea based on content, but keep it reasonable
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = window.innerHeight * 0.3; // Max 30% of screen height
      const newHeight = Math.max(80, Math.min(textarea.scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Auto-adjust height when transcribed text changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [transcribedText]);

  // Randomize decorative animation offsets so they aren't aligned
  useEffect(() => {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    setDecorOffsets({
      // Top-left anchor
      a: { x: rand(-30, 40), y: rand(-24, 24), r: rand(-6, 6) },
      // Top-right anchor
      b: { x: rand(-40, 30), y: rand(-24, 24), r: rand(-6, 6) },
      // Bottom-right anchor
      c: { x: rand(-28, 36), y: rand(-20, 20), r: rand(-6, 6) },
      // Bottom-left anchor
      d: { x: rand(-24, 32), y: rand(-18, 18), r: rand(-6, 6) },
    });
  }, []);

  const generateImage = async () => {
    const prompt = textareaRef.current?.value.trim();
    if (!prompt) {
      setShowEmptyPromptModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          sampleCount: 1 // Generate 1 sketch for coloring book use case
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedImage(result.imageUrl);
        // Notify parent component about image generation
        if (onImageGenerated) {
          onImageGenerated(result.imageUrl, prompt);
        }
      } else {
        alert('Error generating image: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording if already recording
        const currentRecorder = window.currentMediaRecorder;
        if (currentRecorder) {
          currentRecorder.stop();
        }
        setIsRecording(false);
        setIsListening(false);
        return;
      }

      setIsRecording(true);
      setIsListening(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Only process if we have audio data (avoid empty recordings)
        if (audioChunks.length > 0) {
          // Create audio blob
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

          // Send to Whisper API
          setIsTranscribing(true);
          await transcribeAudio(audioBlob);
        }
      };

      // Start recording
      mediaRecorder.start();

      // Store mediaRecorder reference so we can stop it later
      window.currentMediaRecorder = mediaRecorder;

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      setIsListening(false);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setTranscribedText(result.text);
        if (textareaRef.current) {
          textareaRef.current.value = result.text;
          // Auto-expand the textarea after adding text
          setTimeout(adjustTextareaHeight, 0);
        }
      } else {
        alert('Error transcribing audio: ' + result.error);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Error transcribing audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };
  return (
    <>
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
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

        {/* Paper plane trail */}
        <svg className="absolute top-16 right-20 w-32 h-16" viewBox="0 0 100 50">
          <path
            d="M10,40 Q30,20 50,35 T90,25"
            stroke="#D4A574"
            strokeWidth="1.5"
            strokeDasharray="3,3"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full flex flex-col">
        {/* Brand header */}
        <KidSparkHeader />
        {/* Header section */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-orange-600 mb-1 sm:mb-2 leading-tight">
              Hi {displayName}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-gray-700">
              Let&apos;s learn something new today!
            </p>
          </div>
        </div>

        {/* Main content area - fit to screen, scroll when overflow */}
        <div className="flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 pt-8 pb-6 sm:py-4 min-h-0 flex-1 overflow-y-auto relative">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-gray-800 mb-4 sm:mb-8 lg:mb-10 xl:mb-12 leading-tight">
            What should we<br />
            create today
          </h2>

          {/* Lottie decorations around the heading (large, outside text areas) */}
          <div
            className="pointer-events-none absolute left-3 sm:left-10 top-1 sm:-top-4 block sm:block opacity-60"
            style={{ transform: `translate(${decorOffsets.a.x}px, ${decorOffsets.a.y}px) rotate(${decorOffsets.a.r}deg)` }}
          >
            <Lottie
              src="https://lottie.host/78cb45da-2c61-4dde-90d4-3e613333dbe8/iPC1Jk8gzR.lottie"
              className="w-16 h-16 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56"
            />
          </div>

          <div
            className="pointer-events-none absolute right-3 sm:right-10 top-2 sm:-top-2 block sm:block opacity-60"
            style={{ transform: `translate(${decorOffsets.b.x}px, ${decorOffsets.b.y}px) rotate(${decorOffsets.b.r}deg)` }}
          >
            <Lottie
              src="https://lottie.host/470b1402-1c74-4a86-bc68-4f90b69ef616/pd64i0k4k0.lottie"
              className="w-16 h-16 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
            />
          </div>

          <div
            className="pointer-events-none absolute right-6 sm:right-16 bottom-16 sm:bottom-36 block sm:block opacity-60"
            style={{ transform: `translate(${decorOffsets.c.x}px, ${decorOffsets.c.y}px) rotate(${decorOffsets.c.r}deg)` }}
          >
            <Lottie
              src="https://lottie.host/b38da3a0-c7ce-48a9-9374-8437ade9a51b/FWQFeYiuQO.lottie"
              className="w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52"
            />
          </div>

          <div
            className="pointer-events-none absolute left-4 sm:left-12 bottom-16 sm:bottom-24 block sm:block opacity-60"
            style={{ transform: `translate(${decorOffsets.d.x}px, ${decorOffsets.d.y}px) rotate(${decorOffsets.d.r}deg)` }}
          >
            <Lottie
              src="https://lottie.host/a6aef2d9-96c5-44fb-90c9-7367bbdbbc68/ymqGXtMQ5J.lottie"
              className="w-16 h-16 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56"
            />
          </div>

          {/* Typing area for letters */}
          <div className="relative mb-6 sm:mb-8 lg:mb-10 xl:mb-12 max-w-4xl mx-auto">
            <textarea
              ref={textareaRef}
              className="w-full text-xl sm:text-3xl md:text-4xl lg:text-4xl font-medium text-gray-800 bg-transparent border-none outline-none resize-none placeholder-gray-500 text-center"
              placeholder="Type your creative idea here..."
              style={{ minHeight: '80px' }}
              onInput={adjustTextareaHeight}
              disabled={isTranscribing}
              aria-busy={isTranscribing}
            />
            {isTranscribing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Lottie
                  src="https://lottie.host/ec809a51-95fb-4dcf-b3c4-c57706f0e66d/LVwRvjv30g.lottie"
                  className="w-16 h-16 sm:w-20 sm:h-20"
                />
              </div>
            )}
          </div>

          {/* Divider line */}
          <div className="hidden sm:block w-20 sm:w-24 md:w-32 h-1 bg-gray-400 mx-auto mb-6 sm:mb-8 lg:mb-10 xl:mb-12"></div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-0">
            {/* Microphone button */}
            <button
              onClick={startRecording}
              disabled={isTranscribing}
              className={`w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl ring-4 ring-white/60 transform transition-all duration-300 ${
                isTranscribing
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75'
                  : isListening
                    ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse scale-110'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'
              }`}
              title={isRecording ? 'Click to stop recording' : 'Click to start recording'}
            >
              {isListening ? (
                // Animated listening indicator
                <div className="relative">
                  <svg className="w-10 h-10 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  {/* Pulsing rings for visual feedback */}
                  <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border border-red-400 animate-pulse"></div>
                </div>
              ) : (
                <svg className="w-10 h-10 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Create button */}
            <button
              onClick={generateImage}
              disabled={isGenerating || isTranscribing}
              className={`w-full sm:w-auto min-h-16 px-12 sm:px-12 md:px-14 lg:px-20 py-6 sm:py-5 text-white text-3xl sm:text-3xl md:text-4xl lg:text-4xl font-bold rounded-full shadow-xl hover:shadow-2xl ring-4 ring-pink-200/40 transform transition-all duration-300 ${
                isGenerating || isTranscribing
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105 cursor-pointer'
              }`}
            >
              {isGenerating ? 'Creating...' : isTranscribing ? 'Transcribing…' : 'Create'}
            </button>
          </div>

          {/* Generated Image Display */}
          {generatedImage && (
            <div className="mt-8 sm:mt-12 lg:mt-16 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
                  Your Sketch Template
                </h3>
                <div className="relative">
                  <Image
                    src={generatedImage}
                    alt="Generated sketch template"
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/5 rounded-lg pointer-events-none"></div>
                </div>
                <p className="text-base text-gray-600 mt-4 text-center">
                  Black dots show where to sketch the details. Children can fill in these areas with their creativity!
                </p>
                {onProceed && (
                  <div className="mt-6 flex items-center justify-center">
                    <button
                      onClick={onProceed}
                      className="min-h-16 px-10 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-2xl font-bold rounded-full shadow-xl hover:shadow-2xl ring-4 ring-pink-200/40 transform hover:scale-105 transition-all"
                    >
                      Proceed to Animation
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    {showEmptyPromptModal && (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Lottie
              src="https://lottie.host/02d2dc96-07dc-4618-94c5-5fd782a43452/sLZLeOfrkj.lottie"
              className="w-40 h-40"
            />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Please enter your creative idea</h3>
          <p className="text-gray-600 mb-6">Type what you want to create, then tap Create!</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowEmptyPromptModal(false)}
              className="min-h-12 px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
