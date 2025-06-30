import { useState, useCallback, useRef } from 'react';
import { VoiceSettings } from '../types';

export const useVoice = () => {
  const [isSupported] = useState(() => 'speechSynthesis' in window && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    voice: 'en-US',
    rate: 1,
    pitch: 1,
    volume: 0.8
  });

  const speak = useCallback((text: string) => {
    if (!isSupported || !settings.enabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSupported, settings]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = settings.voice;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    
    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognitionRef.current.start();
  }, [isSupported, settings.voice]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isSupported,
    isSpeaking,
    isListening,
    transcript,
    settings,
    setSettings,
    speak,
    startListening,
    stopListening,
    clearTranscript: () => setTranscript('')
  };
};