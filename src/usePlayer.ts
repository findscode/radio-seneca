import { useEffect, useRef, useState } from "react";

const VOLUME_KEY = "seneca.volume";
const MUTE_KEY = "seneca.muted";
const DEFAULT_VOLUME = 0.8;

export const streamUrl = import.meta.env.VITE_STREAM_URL?.trim() ?? "";

function readVolume(): number {
  const raw = localStorage.getItem(VOLUME_KEY);
  if (raw === null) return DEFAULT_VOLUME;
  const value = Number(raw);
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, value));
}

function readMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(readVolume);
  const [muted, setMuted] = useState(readMuted);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const sync = () => setPlaying(!audio.paused);
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);
    audio.addEventListener("error", sync);
    return () => {
      audio.removeEventListener("play", sync);
      audio.removeEventListener("pause", sync);
      audio.removeEventListener("error", sync);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || streamUrl === "") return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    void audio.play().catch(() => setPlaying(false));
  }

  function changeVolume(next: number) {
    const value = Math.min(1, Math.max(0, next));
    setVolume(value);
    localStorage.setItem(VOLUME_KEY, String(value));
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  }

  return {
    audioRef,
    playing,
    volume,
    muted,
    togglePlay,
    changeVolume,
    toggleMute,
  };
}
