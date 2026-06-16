import { useEffect, useState, useSyncExternalStore } from 'react';
import type { AzuraStationNowPlaying } from '@radio-seneca/shared';
import { getNowPlayingSseUrl, getProxiedNowPlayingRestUrl } from '../lib/azuracast';

interface NowPlayingState {
  data: AzuraStationNowPlaying | null;
  error: string | null;
  isConnected: boolean;
}

let state: NowPlayingState = {
  data: null,
  error: null,
  isConnected: false,
};

const listeners = new Set<() => void>();
let eventSource: EventSource | null = null;
let subscriberCount = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<NowPlayingState>) {
  state = { ...state, ...patch };
  emit();
}

function parseNowPlayingPayload(raw: string): AzuraStationNowPlaying | null {
  try {
    const json = JSON.parse(raw) as {
      data?: AzuraStationNowPlaying | AzuraStationNowPlaying[];
      pub?: { data?: AzuraStationNowPlaying };
    };

    if (json.pub?.data) return json.pub.data;
    if (Array.isArray(json.data)) {
      return json.data[0] ?? null;
    }
    if (json.data) return json.data;

    return json as unknown as AzuraStationNowPlaying;
  } catch {
    return null;
  }
}

async function fetchFallback(): Promise<AzuraStationNowPlaying | null> {
  const response = await fetch(getProxiedNowPlayingRestUrl());
  if (!response.ok) {
    throw new Error(`Now Playing request failed: ${response.status}`);
  }
  return (await response.json()) as AzuraStationNowPlaying;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  subscriberCount += 1;

  if (subscriberCount === 1) {
    eventSource = new EventSource(getNowPlayingSseUrl());

    eventSource.onopen = () => {
      setState({ isConnected: true, error: null });
    };

    eventSource.onmessage = (event) => {
      const parsed = parseNowPlayingPayload(event.data);
      if (parsed) {
        setState({ data: parsed, error: null, isConnected: true });
      }
    };

    eventSource.onerror = async () => {
      setState({ isConnected: false });

      try {
        const fallback = await fetchFallback();
        setState({ data: fallback, error: null });
      } catch (error) {
        setState({
          error: error instanceof Error ? error.message : 'Now Playing unavailable',
        });
      }
    };
  }

  return () => {
    listeners.delete(listener);
    subscriberCount -= 1;

    if (subscriberCount === 0) {
      eventSource?.close();
      eventSource = null;
    }
  };
}

function getSnapshot(): NowPlayingState {
  return state;
}

export function useAzuraNowPlaying() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!snapshot.data && !snapshot.error) {
      fetchFallback()
        .then((data) => setState({ data, error: null }))
        .catch((error) =>
          setState({
            error: error instanceof Error ? error.message : 'Now Playing unavailable',
          }),
        )
        .finally(() => setTick((value) => value + 1));
    }
  }, [snapshot.data, snapshot.error]);

  return snapshot;
}
