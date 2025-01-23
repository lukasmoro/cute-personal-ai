import { useState, useEffect } from 'react';
import { KokoroTTS } from './kokoro-js/dist/kokoro.js';

const ProviderTTS = ({ isTalking }) => {
  const [tts, setTts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const predefinedText = "In Heidegger's first major text, Being and Time (1927), Dasein is introduced as a term for the type of being that humans possess. Heidegger believed that Dasein already has a pre-ontological and concrete understanding that shapes how it lives, which he analyzed in terms of the unitary structure of being-in-the-world. Heidegger used this analysis to approach the question of the meaning of being; that is, the question of how entities appear as the specific entities they are. In other words, Heidegger's governing question of being is concerned with what makes beings intelligible as beings.";

  useEffect(() => {
    const initTTS = async () => {
      try {
        const ttsInstance = await KokoroTTS.from_pretrained(
          "onnx-community/Kokoro-82M-ONNX",
          { dtype: "q8" }
        );
        setTts(ttsInstance);
        setLoading(false);
      } catch (error) {
        console.error("TTS loading failed:", error);
        setLoading(false);
      }
    };
    initTTS();
  }, []);

  useEffect(() => {
    const handleSpeak = async () => {
      if (!tts || loading || playing) return;
      setPlaying(true);
      try {
        const t0 = performance.now();
        
        const audio = await tts.generate(predefinedText, { voice: "af_sky" });
        const t1 = performance.now();
        
        const wavBuffer = audio.toWav();
        const t2 = performance.now();
        
        const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const t3 = performance.now();
  
        console.log({
          'Generation time': `${t1 - t0}ms`,
          'WAV conversion': `${t2 - t1}ms`,
          'Blob creation': `${t3 - t2}ms`,
          'Total time': `${t3 - t0}ms`
        });

        const audioEl = new Audio(audioUrl);
        
        audioEl.onended = () => {
          setPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audioEl.play();
      } catch (error) {
        console.error('TTS error:', error);
        setPlaying(false);
      }
    };

    if (isTalking) {
      handleSpeak();
    }
  }, [isTalking, tts, loading, playing]);

  return null;
};

export { ProviderTTS };