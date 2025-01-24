import { useState, useEffect, useMemo, useRef } from "react";
import { KokoroTTS } from "./kokoro-js/dist/kokoro.js";
import { useThoughtStream } from "./ProviderThoughtStream";
import { parseThought } from "./utils/thoughtParser";

export const ProviderTTS = ({ isTalking }) => {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioUrlsRef = useRef([]);
  const audioRef = useRef(null);
  const lastTriggerRef = useRef(false);
  const { streamOfThought, thoughtIndex, nextThought } = useThoughtStream();

  // get parsed thoughts
  const cleanThoughts = useMemo(() => {
    return streamOfThought.map((thought) => parseThought(thought).text);
  }, [streamOfThought]);

  // initialize TTS & generate audio
  useEffect(() => {
    let mounted = true;
    const initTTS = async () => {
      try {
        const ttsInstance = await KokoroTTS.from_pretrained(
          "onnx-community/Kokoro-82M-ONNX",
          { dtype: "q8" }
        );
        const urls = [];
        for (const cleanThought of cleanThoughts) {
          if (!mounted) return;
          const audio = await ttsInstance.generate(cleanThought, {
            voice: "af_sky",
          });
          const wavBuffer = audio.toWav();
          const audioBlob = new Blob([wavBuffer], { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          urls.push(audioUrl);
        }
        if (mounted) {
          audioUrlsRef.current = urls;
          setLoading(false);
        }
      } catch (error) {
        console.error("TTS Error:", error);
        if (mounted) setLoading(false);
      }
    };

    initTTS();

    return () => {
      mounted = false;
    };
  }, [cleanThoughts]);

  // audio playback
  useEffect(() => {
    if (isTalking === lastTriggerRef.current) {
      return;
    }
    lastTriggerRef.current = isTalking;

    const handleSpeak = async () => {
      if (loading || playing || audioUrlsRef.current.length === 0) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }

      try {
        setPlaying(true);
        audioRef.current = new Audio(audioUrlsRef.current[thoughtIndex]);
        audioRef.current.onended = () => {
          setPlaying(false);
          audioRef.current = null;
          nextThought();
        };
        await audioRef.current.play();
      } catch (error) {
        console.error("Audio setup error:", error);
        setPlaying(false);
        audioRef.current = null;
      }
    };

    if (isTalking && !playing) {
      handleSpeak();
    }
  }, [isTalking, loading, playing, thoughtIndex, nextThought]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
      }
      // Clean up audio URLs
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioUrlsRef.current = [];
    };
  }, []);

  if (loading) {
    return <div>Generating audio files...</div>;
  }

  return null;
};