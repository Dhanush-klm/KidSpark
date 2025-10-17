'use client';

import { useState, useEffect } from 'react';
import Screen1 from './components/screens/Screen1';
import Screen2 from './components/screens/Screen2';
import Screen3 from './components/screens/Screen3';
import Screen4 from './components/screens/Screen4';

type Screen = 'screen1' | 'screen2' | 'screen3' | 'screen4';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('screen1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

  useEffect(() => {
    // Show first screen for 2 seconds, then switch to second screen
    if (currentScreen === 'screen1') {
      const timer = setTimeout(() => {
        setCurrentScreen('screen2');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleNext = () => {
    setCurrentScreen('screen3');
  };

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    setGeneratedImage(imageUrl);
    setCurrentPrompt(prompt);
    setCurrentScreen('screen4');
  };

  switch (currentScreen) {
    case 'screen1':
      return <Screen1 />;
    case 'screen2':
      return <Screen2 onNext={handleNext} />;
    case 'screen3':
      return <Screen3 onImageGenerated={(imageUrl: string, prompt: string) => handleImageGenerated(imageUrl, prompt)} />;
    case 'screen4':
      return <Screen4 imageUrl={generatedImage} prompt={currentPrompt} />;
    default:
      return <Screen1 />;
  }
}
