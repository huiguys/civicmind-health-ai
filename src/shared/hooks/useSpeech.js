import { useState, useEffect } from 'react';

/**
 * Custom hook for text-to-speech functionality using AWS Polly
 */
export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
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
      setAudioElement(null);
      return;
    }

    try {
      setIsSpeaking(true);
      
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
      setIsSpeaking(false);
      setAudioElement(null);
    }
  };

  const stop = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    setIsSpeaking(false);
    setAudioElement(null);
  };

  return { isSpeaking, speak, stop };
};
