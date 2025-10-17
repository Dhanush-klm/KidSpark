'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface Screen3Props {
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
}

export default function Screen3({ onImageGenerated }: Screen3Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const generateImage = async () => {
    const prompt = textareaRef.current?.value.trim();
    if (!prompt) {
      alert('Please enter a creative idea first!');
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
        const currentRecorder = (window as any).currentMediaRecorder;
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
          await transcribeAudio(audioBlob);
        }
      };

      // Start recording
      mediaRecorder.start();

      // Store mediaRecorder reference so we can stop it later
      (window as any).currentMediaRecorder = mediaRecorder;

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      setIsListening(false);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
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
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-auto">
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
        {/* Header section */}
        <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-orange-600 mb-1 sm:mb-2 leading-tight">
              Hi Champu
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700">
              Let's learn something new today!
            </p>
          </div>

          {/* Profile image */}
          <div className="relative group cursor-pointer ml-4 flex-shrink-0">
            {/* Profile container with enhanced styling */}
            <div className="relative transform transition-transform duration-300 group-hover:scale-105">
              {/* Outer ring for profile effect */}
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
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-green-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area - fit to screen, scroll when overflow */}
        <div className="flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 py-4 min-h-0 flex-1 overflow-y-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-800 mb-6 sm:mb-8 lg:mb-10 xl:mb-12 leading-tight">
            What should we<br />
            create today
          </h2>

          {/* Typing area for letters */}
          <div className="mb-6 sm:mb-8 lg:mb-10 xl:mb-12 max-w-4xl mx-auto">
            <textarea
              ref={textareaRef}
              className="w-full text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-gray-800 bg-transparent border-none outline-none resize-none placeholder-gray-500 text-center"
              placeholder="Type your creative idea here..."
              style={{ minHeight: '80px' }}
              onInput={adjustTextareaHeight}
            />
          </div>

          {/* Divider line */}
          <div className="w-20 sm:w-24 md:w-32 h-1 bg-gray-400 mx-auto mb-6 sm:mb-8 lg:mb-10 xl:mb-12"></div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {/* Microphone button */}
            <button
              onClick={startRecording}
              className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform transition-all duration-300 ${
                isListening
                  ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse scale-110'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105'
              }`}
              title={isRecording ? 'Click to stop recording' : 'Click to start recording'}
            >
              {isListening ? (
                // Animated listening indicator
                <div className="relative">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  {/* Pulsing rings for visual feedback */}
                  <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border border-red-400 animate-pulse"></div>
                </div>
              ) : (
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Create button */}
            <button
              onClick={generateImage}
              disabled={isGenerating}
              className={`px-8 sm:px-10 md:px-12 lg:px-16 py-3 sm:py-4 text-white text-base sm:text-lg md:text-xl lg:text-2xl font-semibold rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 ${
                isGenerating
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105 cursor-pointer'
              }`}
            >
              {isGenerating ? 'Creating...' : 'Create'}
            </button>
          </div>

          {/* Generated Image Display */}
          {generatedImage && (
            <div className="mt-8 sm:mt-12 lg:mt-16 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                  Your Sketch Template
                </h3>
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated sketch template"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/5 rounded-lg pointer-events-none"></div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Black dots show where to sketch the details. Children can fill in these areas with their creativity!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
