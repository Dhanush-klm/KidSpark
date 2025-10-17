'use client';

import { useState, useEffect } from 'react';
import Screen1 from './components/screens/Screen1';
import Screen2 from './components/screens/Screen2';
import Screen3 from './components/screens/Screen3';

type Screen = 'screen1' | 'screen2' | 'screen3';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('screen1');

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

  switch (currentScreen) {
    case 'screen1':
      return <Screen1 />;
    case 'screen2':
      return <Screen2 onNext={handleNext} />;
    case 'screen3':
      return <Screen3 />;
    default:
      return <Screen1 />;
  }
}
