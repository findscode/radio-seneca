import { create } from 'zustand';

interface PlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  error: string | null;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setError: (error: string | null) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  error: null,
  setPlaying: (isPlaying) => set({ isPlaying, error: isPlaying ? null : get().error }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setError: (error) => set({ error, isPlaying: error ? false : get().isPlaying }),
}));
