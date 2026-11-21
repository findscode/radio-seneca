import { useEffect, useRef } from "react";
import type { TrackView } from "./nowPlaying";

export function useMediaSession(
  track: TrackView,
  listening: boolean,
  onPlay: () => void,
  onPause: () => void,
) {
  const handlers = useRef({ onPlay, onPause });
  handlers.current = { onPlay, onPause };

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.setActionHandler("play", () => handlers.current.onPlay());
    session.setActionHandler("pause", () => handlers.current.onPause());
    session.setActionHandler("stop", () => handlers.current.onPause());
    return () => {
      session.setActionHandler("play", null);
      session.setActionHandler("pause", null);
      session.setActionHandler("stop", null);
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: "Seneca",
      artwork: track.art ? [{ src: track.art, sizes: "512x512" }] : [],
    });
  }, [track.title, track.artist, track.art]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = listening ? "playing" : "paused";
  }, [listening]);
}
