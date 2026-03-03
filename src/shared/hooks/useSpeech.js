import { useState, useEffect } from 'react';

/**
 * Custom hook for text-to-speech functionality using AWS Polly
 */
export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const speak = async (text, language = 'english') => {
    if (isSpeaking && audioElement) {
      audioElement.pause();
      setIsSpeaking(false);
      setIsLoading(false);
      setAudioElement(null);
      return;
    }

    try {
      setIsLoading(true);
      
      // Call AWS Polly via backend
      const response = await fetch('http://localhost:3001/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      
      setIsLoading(false);
      setIsSpeaking(true);
      
      // Create audio element and play
      const audio = new Audio(data.audioBase64);
      audio.onended = () => {
        setIsSpeaking(false);
        setAudioElement(null);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setAudioElement(null);
      };
      
      setAudioElement(audio);
      await audio.play();
      
    } catch (error) {
      console.error('Speech error:', error);
      setIsLoading(false);
      
      // Fallback to browser speech synthesis
      console.log('Falling back to browser speech...');
      try {
        const utterance = new SpeechSynthesisUtterance();
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/\*/g, '').replace(/[\u{1F000}-\u{1FFFF}]/gu, '');
        utterance.text = cleanText;
        utterance.lang = language === 'english' ? 'en-US' : 'hi-IN';
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      } catch (fallbackError) {
        console.error('Fallback speech error:', fallbackError);
        setIsSpeaking(false);
        alert('Failed to generate speech. Please check if backend is running.');
      }
    }
  };

  const stop = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    setIsSpeaking(false);
    setIsLoading(false);
    setAudioElement(null);
  };

  return { isSpeaking, isLoading, speak, stop };
};
