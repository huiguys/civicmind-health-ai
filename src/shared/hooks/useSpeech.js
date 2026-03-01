import { useState, useEffect } from 'react';

/**
 * Custom hook for text-to-speech functionality
 */
export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text, language = 'en-US') => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text.replace(/<[^>]*>/g, '').replace(/\*/g, '');
    utterance.lang = language;
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { isSpeaking, speak, stop };
};
