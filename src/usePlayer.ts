import { useEffect, useRef, useState } from "react";
import { reportClientEvent, retryDelayMs } from "./report";

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
  const wantsAudio = useRef(false);
  const attempt = useRef(0);
  const timer = useRef(0);
  const failRef = useRef<(detail: string) => void>(() => undefined);
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [offline, setOffline] = useState(false);
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

    const clearTimer = () => {
      if (timer.current === 0) return;
      window.clearTimeout(timer.current);
      timer.current = 0;
    };

    const schedule = () => {
      if (!wantsAudio.current || timer.current !== 0) return;
      const delay = retryDelayMs(attempt.current);
      attempt.current += 1;
      reportClientEvent("reconnect", `retry in ${delay}ms`);
      timer.current = window.setTimeout(() => {
        timer.current = 0;
        const node = audioRef.current;
        if (!node || !wantsAudio.current || streamUrl === "") return;
        node.src = streamUrl;
        node.load();
        void node.play().catch(() => failRef.current("play failed"));
      }, delay);
    };

    const fail = (detail: string) => {
      setPlaying(false);
      if (!wantsAudio.current || timer.current !== 0) return;
      setOffline(true);
      reportClientEvent("error", detail);
      schedule();
    };

    failRef.current = fail;

    const onPlay = () => {
      setPlaying(true);
      setOffline(false);
      attempt.current = 0;
      clearTimer();
    };
    const onPause = () => setPlaying(false);
    const onError = () => fail("stream failed");

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    return () => {
      clearTimer();
      failRef.current = () => undefined;
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, []);

  function stop() {
    wantsAudio.current = false;
    if (timer.current !== 0) {
      window.clearTimeout(timer.current);
      timer.current = 0;
    }
    setListening(false);
    setOffline(false);
    audioRef.current?.pause();
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || streamUrl === "") return;
    if (wantsAudio.current) {
      stop();
      return;
    }
    wantsAudio.current = true;
    setListening(true);
    void audio.play().catch(() => failRef.current("play failed"));
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
    listening,
    offline,
    volume,
    muted,
    togglePlay,
    changeVolume,
    toggleMute,
  };
}
