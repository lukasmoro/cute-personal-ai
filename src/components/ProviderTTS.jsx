import { useState, useEffect, useMemo, useRef } from "react";
import { KokoroTTS } from "./kokoro-js/dist/kokoro.js";
import { useThoughtStream } from "./ContextThoughtStream.jsx";
import { parseThought } from "./utils/thoughtParser";
import { useSpeechStream } from "./ContextSpeechStream";

export const ProviderTTS = ({ isTalking }) => {
  
  // states
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  // references
  const audioUrlsRef = useRef([]);
  const audioRef = useRef(null);
  const lastTriggerRef = useRef(false);
  const progressIntervalRef = useRef(null);

  // context
  const { streamOfThought, thoughtIndex, nextThought } = useThoughtStream();
  const { updateAudioTime, setPlaying: setContextPlaying } = useSpeechStream();

  // cache thoughts between re-renders
  const cachedThoughts = useMemo(() => {
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
        for (const cachedThought of cachedThoughts) {
          if (!mounted) return;
          const audio = await ttsInstance.generate(cachedThought, {
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
  }, [cachedThoughts]);

  // start time tracking
  const startTimeTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        updateAudioTime(audioRef.current.currentTime);
      }
    }, 16);
  };

  // stop time tracking
  const stopTimeTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    updateAudioTime(0);
  };

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
        stopTimeTracking();
      }

      try {
        setPlaying(true);
        setContextPlaying(true);

        audioRef.current = new Audio(audioUrlsRef.current[thoughtIndex]);
        audioRef.current.onended = () => {
          setPlaying(false);
          setContextPlaying(false);
          stopTimeTracking();
          audioRef.current = null;
          nextThought();
        };

        await audioRef.current.play();
        startTimeTracking();
      } catch (error) {
        console.error("Audio setup error:", error);
        setPlaying(false);
        setContextPlaying(false);
        stopTimeTracking();
        audioRef.current = null;
      }
    };

    if (isTalking && !playing) {
      handleSpeak();
    }
  }, [
    isTalking,
    loading,
    playing,
    thoughtIndex,
    nextThought,
    setContextPlaying,
    updateAudioTime,
  ]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
      }
      stopTimeTracking();
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioUrlsRef.current = [];
    };
  }, []);

  // display loader while generating files
  if (loading) {
    return <div>Generating audio files...</div>;
  }
  return null;
};
