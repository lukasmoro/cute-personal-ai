import { useState, useEffect } from 'react';
import { KokoroTTS } from './kokoro-js/dist/kokoro.js';

const phrases = [
  "Hi Lukas, what is on your mind today",
  "Oh that is cool what about it? This one right?",
  "Oh that is cool. What about it? This one right?",
  "We have talked about something along those lines a while ago when you visited Kunstmuseum Bregenz. Do you remember? How do you feel about the future?",
  "Ok, we can start by finding a rough first direction. Tell me your ideas and I will generate some starting points."
];

const ProviderTTS = ({ isTalking }) => {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [audioUrls, setAudioUrls] = useState([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const initTTS = async () => {
      try {
        console.log('Loading TTS model...');
        const startTime = performance.now();
        
        const ttsInstance = await KokoroTTS.from_pretrained(
          "onnx-community/Kokoro-82M-ONNX",
          { dtype: "q8" }
        );
        
        console.log(`Model loaded in ${performance.now() - startTime}ms`);
        
        const urls = [];
        for (const phrase of phrases) {
          const genStart = performance.now();
          const audio = await ttsInstance.generate(phrase, { voice: "af_sky" });
          console.log(`Generated "${phrase}" in ${performance.now() - genStart}ms`);
          
          const wavBuffer = audio.toWav();
          const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          urls.push(audioUrl);
        }
        
        setAudioUrls(urls);
        setLoading(false);
        console.log('All audio pre-generated');
      } catch (error) {
        console.error("TTS loading failed:", error);
        setLoading(false);
      }
    };
    
    const urls = [];
    initTTS();

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const handleSpeak = async () => {
      if (loading || playing || audioUrls.length === 0) return;
      
      setPlaying(true);
      try {
        const audioEl = new Audio(audioUrls[currentPhraseIndex]);
        
        audioEl.onended = () => {
          setPlaying(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        };
        
        await audioEl.play();
      } catch (error) {
        console.error('Playback error:', error);
        setPlaying(false);
      }
    };

    if (isTalking) {
      handleSpeak();
    }
  }, [isTalking, loading, playing, currentPhraseIndex, audioUrls]);

  // Display loading state
  if (loading) {
    return <div className="text-gray-600">Generating audio files...</div>;
  }

  return null;
};

export { ProviderTTS };