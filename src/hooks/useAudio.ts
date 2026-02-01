import { useCallback, useRef, useState, useEffect } from 'react';

interface AudioRefs {
  ambient: HTMLAudioElement | null;
  tap: HTMLAudioElement | null;
  claim: HTMLAudioElement | null;
  navigate: HTMLAudioElement | null;
}

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const audioRefs = useRef<AudioRefs>({
    ambient: null,
    tap: null,
    claim: null,
    navigate: null,
  });

  // Initialize audio elements
  useEffect(() => {
    // Create audio context for better mobile support
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    
    // We'll use Web Audio API generated sounds for effects
    // Ambient music would need to be loaded from a file
    
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const playTapSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      // Create a "pulse" sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [isMuted]);

  const playClaimSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      // Create a "success" sound with harmonics
      const playNote = (freq: number, delay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
        
        osc.type = 'sine';
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      };
      
      playNote(523.25, 0);    // C5
      playNote(659.25, 0.1);  // E5
      playNote(783.99, 0.2);  // G5
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [isMuted]);

  const playNavigateSound = useCallback(() => {
    if (isMuted) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleAmbient = useCallback(() => {
    // Ambient music toggle - would need audio file
    setIsAmbientPlaying(prev => !prev);
  }, []);

  return {
    isMuted,
    isAmbientPlaying,
    playTapSound,
    playClaimSound,
    playNavigateSound,
    toggleMute,
    toggleAmbient,
  };
};
