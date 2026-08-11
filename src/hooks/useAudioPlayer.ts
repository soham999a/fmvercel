import { useState, useRef, useCallback, useEffect } from 'react';
import { RadioStation } from '@/types/radio';

interface AudioPlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

export const EQ_BANDS = [60, 250, 1000, 4000, 12000] as const;
export type EqGains = number[]; // dB per band

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const eqAttachedRef = useRef(false);

  const [state, setState] = useState<AudioPlayerState>({
    currentStation: null,
    isPlaying: false,
    volume: 0.7,
    isLoading: false,
    error: null,
  });
  const [eqEnabled, setEqEnabled] = useState(false);
  const [eqGains, setEqGains] = useState<EqGains>([0, 0, 0, 0, 0]);
  const [eqUnavailable, setEqUnavailable] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio();
    // Note: crossOrigin is intentionally NOT set — many radio streams block CORS.
    // Setting it would break playback. EQ (Web Audio) may be silenced for those
    // streams; users see "EQ unavailable" and can toggle it off.
    audioRef.current.volume = state.volume;

    const audio = audioRef.current;

    audio.addEventListener('playing', () => {
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false, error: null }));
    });
    audio.addEventListener('pause', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });
    audio.addEventListener('waiting', () => {
      setState(prev => ({ ...prev, isLoading: true }));
    });
    audio.addEventListener('error', () => {
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false, error: 'Failed to play station' }));
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Lazy-init Web Audio graph on first EQ enable
  const ensureEqGraph = useCallback(() => {
    if (eqAttachedRef.current || !audioRef.current) return true;
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      if (!Ctx) return false;
      const ctx = new Ctx();
      const src = ctx.createMediaElementSource(audioRef.current);
      const filters = EQ_BANDS.map((freq, i) => {
        const f = ctx.createBiquadFilter();
        f.type = i === 0 ? 'lowshelf' : i === EQ_BANDS.length - 1 ? 'highshelf' : 'peaking';
        f.frequency.value = freq;
        f.Q.value = 1;
        f.gain.value = 0;
        return f;
      });
      // chain: source -> f0 -> f1 -> ... -> destination
      let prev: AudioNode = src;
      for (const f of filters) { prev.connect(f); prev = f; }
      prev.connect(ctx.destination);
      audioCtxRef.current = ctx;
      sourceRef.current = src;
      filtersRef.current = filters;
      eqAttachedRef.current = true;
      return true;
    } catch (e) {
      // Cross-origin streams without CORS headers can't be routed through Web Audio.
      console.warn('EQ unavailable for this stream:', e);
      setEqUnavailable(true);
      return false;
    }
  }, []);

  const toggleEq = useCallback((on: boolean) => {
    if (on) {
      const ok = ensureEqGraph();
      if (!ok) return;
      audioCtxRef.current?.resume();
    }
    setEqEnabled(on);
    // When disabled, flatten gains so graph is transparent
    if (!on && filtersRef.current.length) {
      filtersRef.current.forEach(f => (f.gain.value = 0));
    } else if (on && filtersRef.current.length) {
      filtersRef.current.forEach((f, i) => (f.gain.value = eqGains[i] ?? 0));
    }
  }, [ensureEqGraph, eqGains]);

  const setEqGain = useCallback((index: number, gainDb: number) => {
    setEqGains(prev => {
      const next = [...prev];
      next[index] = gainDb;
      return next;
    });
    const f = filtersRef.current[index];
    if (f && eqEnabled) f.gain.value = gainDb;
  }, [eqEnabled]);

  const play = useCallback((station: RadioStation) => {
    if (!audioRef.current) return;
    setState(prev => ({ ...prev, currentStation: station, isLoading: true, error: null }));
    const streamUrl = station.url_resolved || station.url;
    audioRef.current.src = streamUrl;
    audioRef.current.play().catch((e) => {
      console.error('Playback failed:', e);
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false, error: 'Failed to play station' }));
    });
  }, []);

  const pause = useCallback(() => { audioRef.current?.pause(); }, []);
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !state.currentStation) return;
    if (state.isPlaying) pause();
    else audioRef.current.play().catch(console.error);
  }, [state.isPlaying, state.currentStation, pause]);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    const v = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = v;
    setState(prev => ({ ...prev, volume: v }));
  }, []);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = '';
    setState(prev => ({ ...prev, currentStation: null, isPlaying: false, isLoading: false }));
  }, []);

  return {
    ...state,
    play, pause, togglePlayPause, setVolume, stop,
    eqEnabled, eqGains, eqUnavailable,
    toggleEq, setEqGain,
  };
}
