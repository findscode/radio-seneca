import { useEffect, useRef, useState } from "react";
import { reportClientEvent, retryDelayMs } from "./report";

const VOLUME_KEY = "seneca.volume";
const MUTE_KEY = "seneca.muted";
const DEFAULT_VOLUME = 0.8;
const STALL_MS = 12_000;
const WATCH_MS = 3_000;

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
  const reloading = useRef(false);
  const attempt = useRef(0);
  const timer = useRef(0);
  const startRef = useRef<() => void>(() => undefined);
  const stopRef = useRef<() => void>(() => undefined);
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

    let lastTime = -1;
    let lastProgress = performance.now();

    const clearTimer = () => {
      if (timer.current === 0) return;
      window.clearTimeout(timer.current);
      timer.current = 0;
    };

    const release = () => {
      reloading.current = false;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };

    const start = () => {
      if (streamUrl === "") return;
      reloading.current = true;
      audio.src = streamUrl;
      audio.load();
      lastTime = -1;
      lastProgress = performance.now();
      void audio.play().catch(() => {
        reloading.current = false;
        fail("play failed");
      });
    };

    const schedule = () => {
      if (!wantsAudio.current || timer.current !== 0) return;
      const delay = retryDelayMs(attempt.current);
      attempt.current += 1;
      reportClientEvent("reconnect", `retry in ${delay}ms`);
      timer.current = window.setTimeout(() => {
        timer.current = 0;
        if (wantsAudio.current) start();
      }, delay);
    };

    const fail = (detail: string) => {
      setPlaying(false);
      if (!wantsAudio.current || timer.current !== 0) return;
      setOffline(true);
      reportClientEvent("error", detail);
      release();
      schedule();
    };

    const stop = () => {
      wantsAudio.current = false;
      clearTimer();
      setListening(false);
      setOffline(false);
      setPlaying(false);
      release();
    };

    startRef.current = start;
    stopRef.current = stop;

    const onPlay = () => {
      if (!wantsAudio.current) {
        wantsAudio.current = true;
        setListening(true);
      }
    };
    const onPlaying = () => {
      reloading.current = false;
      setPlaying(true);
      setOffline(false);
      attempt.current = 0;
      lastProgress = performance.now();
      clearTimer();
    };
    const onPause = () => {
      setPlaying(false);
      if (reloading.current || !wantsAudio.current) return;
      if (!audio.getAttribute("src") || audio.ended || audio.error) return;
      stop();
    };
    const onEnded = () => fail("stream ended");
    const onError = () => {
      if (!audio.getAttribute("src")) return;
      fail("stream failed");
    };

    const watch = window.setInterval(() => {
      if (!wantsAudio.current || timer.current !== 0) return;
      const now = performance.now();
      if (audio.currentTime !== lastTime) {
        lastTime = audio.currentTime;
        lastProgress = now;
        return;
      }
      if (now - lastProgress >= STALL_MS) fail("stream stalled");
    }, WATCH_MS);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      clearTimer();
      window.clearInterval(watch);
      startRef.current = () => undefined;
      stopRef.current = () => undefined;
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  function play() {
    if (streamUrl === "" || wantsAudio.current) return;
    wantsAudio.current = true;
    attempt.current = 0;
    setListening(true);
    startRef.current();
  }

  function pause() {
    stopRef.current();
  }

  function togglePlay() {
    if (wantsAudio.current) pause();
    else play();
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
    play,
    pause,
    togglePlay,
    changeVolume,
    toggleMute,
  };
}
