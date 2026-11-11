import { useEffect, useState } from "react";
import { fixtureBroadcast } from "./fixture";
import {
  payloadFromSocketMessage,
  toBroadcast,
  type Broadcast,
  type NowPlayingPayload,
} from "./nowPlaying";

const nowPlayingUrl = import.meta.env.VITE_NOWPLAYING_URL?.trim() ?? "";
const nowPlayingWsUrl = import.meta.env.VITE_NOWPLAYING_WS_URL?.trim() ?? "";
const stationShortcode = import.meta.env.VITE_STATION_SHORTCODE?.trim() ?? "";
const pollMs = 15_000;

export function useBroadcast(): Broadcast {
  const [broadcast, setBroadcast] = useState<Broadcast>(fixtureBroadcast);

  useEffect(() => {
    if (nowPlayingUrl === "") return;

    let stopped = false;
    let pollTimer = 0;
    let socket: WebSocket | null = null;

    const apply = (payload: NowPlayingPayload) => {
      if (!stopped) setBroadcast(toBroadcast(payload));
    };

    const pull = async () => {
      try {
        const response = await fetch(nowPlayingUrl);
        if (!response.ok) return;
        apply((await response.json()) as NowPlayingPayload);
      } catch {
        // Keep the last screen. The next poll tries again.
      }
    };

    const startPoll = () => {
      if (pollTimer !== 0) return;
      void pull();
      pollTimer = window.setInterval(() => void pull(), pollMs);
    };

    const stopPoll = () => {
      if (pollTimer === 0) return;
      window.clearInterval(pollTimer);
      pollTimer = 0;
    };

    void pull();

    if (nowPlayingWsUrl !== "" && stationShortcode !== "") {
      socket = new WebSocket(nowPlayingWsUrl);
      socket.addEventListener("open", () => {
        socket?.send(
          JSON.stringify({
            subs: {
              [`station:${stationShortcode}`]: { recover: true },
            },
          }),
        );
      });
      socket.addEventListener("message", (event) => {
        let message: unknown;
        try {
          message = JSON.parse(String(event.data));
        } catch {
          return;
        }
        const payload = payloadFromSocketMessage(message);
        if (!payload) return;
        apply(payload);
        stopPoll();
      });
      socket.addEventListener("error", () => startPoll());
      socket.addEventListener("close", () => {
        if (!stopped) startPoll();
      });
    } else {
      startPoll();
    }

    return () => {
      stopped = true;
      stopPoll();
      socket?.close();
    };
  }, []);

  return broadcast;
}
