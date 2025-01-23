import { useState, useEffect } from 'react';
import { KokoroTTS } from './kokoro-js/dist/kokoro.js';

// stream of thought should be moved to parent component or even made the new highest order node
// besides answers it should contain trigger point for mimics & gestures
// trigger points should refer to json files with structured outputs that influence the assistant visuals
// other trigger points should initiate actions like image retrieval & generation (image, code, nodes), pulling up chats & agent space

const streamOfThought = [
  "Hi Lukas, what is on your mind today",
  "Oh that is cool what about it? This one right?",
  "We have talked about something along those lines a while ago when you visited Kunstmuseum Bregenz. Do you remember? How do you feel about the future?",
  "Ok, we can start by finding a rough first direction. Tell me your ideas and I will generate some starting points."
];

const ProviderTTS = ({ isTalking }) => {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [audioUrls, setAudioUrls] = useState([]);
  const [thoughtIndex, setThoughtIndex] = useState(0);

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
        for (const thought of streamOfThought) {
          const genStart = performance.now();
          const audio = await ttsInstance.generate(thought, { voice: "af_sky" });
          console.log(`Generated "${thought}" in ${performance.now() - genStart}ms`);
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
        const audioEl = new Audio(audioUrls[thoughtIndex]);
        
        audioEl.onended = () => {
          setPlaying(false);
          setThoughtIndex((prev) => (prev + 1) % streamOfThought.length);
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
  }, [isTalking, loading, playing, thoughtIndex, audioUrls]);

  if (loading) {
    return <div>Generating audio files...</div>;
  }

  return null;
};

export { ProviderTTS };