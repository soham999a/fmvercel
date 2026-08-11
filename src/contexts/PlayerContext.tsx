import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useFavorites } from '@/hooks/useFavorites';
import { useListeningHistory } from '@/hooks/useListeningHistory';
import { RadioStation } from '@/types/radio';

interface PlayerContextType {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  error: string | null;
  play: (station: RadioStation) => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  stop: () => void;
  favorites: RadioStation[];
  isFavorite: (stationId: string) => boolean;
  toggleFavorite: (station: RadioStation) => void;
  eqEnabled: boolean;
  eqGains: number[];
  eqUnavailable: boolean;
  toggleEq: (on: boolean) => void;
  setEqGain: (index: number, gainDb: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioPlayer = useAudioPlayer();
  const favoritesHook = useFavorites();
  useListeningHistory(audioPlayer.currentStation, audioPlayer.isPlaying);

  return (
    <PlayerContext.Provider value={{ ...audioPlayer, ...favoritesHook }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

