import { useState, useEffect, useCallback } from 'react';

export const ControllerVoiceInput = ({ onAudioData }) => {
  const [audioContext, setAudioContext] = useState(null);
  const [analyzer, setAnalyzer] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyzerNode = context.createAnalyser();
      analyzerNode.fftSize = 256;
      analyzerNode.smoothingTimeConstant = 0.8;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyzerNode);
      setAudioContext(context);
      setAnalyzer(analyzerNode);
      setMediaStream(stream);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  // initialize audio on component mount
  useEffect(() => {
    initializeAudio();
    
    // cleanup
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    let animationFrame;

    const analyzeAudio = () => {
      if (!analyzer) return;

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      analyzer.getByteFrequencyData(dataArray);
      const lowEnd = Math.floor(dataArray.length * 0.33);
      const midEnd = Math.floor(dataArray.length * 0.66);
      const lowFreq = Array.from(dataArray.slice(0, lowEnd));
      const midFreq = Array.from(dataArray.slice(lowEnd, midEnd));
      const highFreq = Array.from(dataArray.slice(midEnd));
      const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length / 255;

      const audioData = {
        low: average(lowFreq),
        mid: average(midFreq),
        high: average(highFreq),
        average: average(Array.from(dataArray))
      };

      onAudioData(audioData);
      animationFrame = requestAnimationFrame(analyzeAudio);
    };

    if (analyzer) {
      analyzeAudio();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [analyzer, onAudioData]);

  return null;
};

export default ControllerVoiceInput;