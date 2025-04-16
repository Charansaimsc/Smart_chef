import React, { useState, useEffect } from 'react';

const TextToSpeech = ({ text, language, disabled }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  
  // Map our language codes to BCP-47 language tags for speech synthesis
  const languageVoiceMappings = {
    english: 'en-US',
    telugu: 'te-IN',
    hindi: 'hi-IN'
  };
  
  // Check if speech synthesis is supported and load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
      
      // Function to load and set voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
        }
      };
      
      // Load voices right away (might work in some browsers)
      loadVoices();
      
      // Chrome requires this event to get voices
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);
  
  const handleSpeak = () => {
    if (!speechSupported || !text || voices.length === 0) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = languageVoiceMappings[language] || 'en-US';
    utterance.lang = langCode;
    
    // Try to find a voice that matches our language, with better fallback options
    let selectedVoice = null;
    
    // First try: exact match
    selectedVoice = voices.find(voice => voice.lang === langCode);
    
    // Second try: starts with language code (e.g., 'hi-' for Hindi)
    if (!selectedVoice) {
      const langPrefix = langCode.split('-')[0];
      selectedVoice = voices.find(voice => voice.lang.startsWith(langPrefix + '-'));
    }
    
    // Third try: Microsoft voices often have good language support
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.name.includes(langCode.split('-')[0]) || 
        (voice.name.includes('Microsoft') && voice.lang.startsWith(langCode.split('-')[0]))
      );
    }
    
    // Set voice if found
    if (selectedVoice) {
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang}) for ${language}`);
      utterance.voice = selectedVoice;
    } else {
      console.log(`No matching voice found for ${language}, using browser default`);
    }
    
    // Add some properties that can improve speech quality
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  // Stop speaking if component unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);
  
  // Get translations for the button text
  const getButtonLabel = () => {
    const translations = {
      english: "Listen",
      telugu: "వినండి",
      hindi: "सुनो"
    };
    
    return translations[language] || "Listen";
  };
  
  if (!speechSupported) return null;
  
  return (
    <button 
      className="listen-button" 
      onClick={handleSpeak}
      disabled={disabled || isSpeaking || voices.length === 0}
      title={voices.length === 0 ? "Loading voices..." : ""}
    >
      {isSpeaking ? '■' : '▶'} {getButtonLabel()}
    </button>
  );
};

export default TextToSpeech;