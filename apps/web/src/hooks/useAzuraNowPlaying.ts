import { useSyncExternalStore } from 'react';
import type { AzuraStationNowPlaying } from '@radio-seneca/shared';
import {
  extractNowPlayingFromSseMessage,
  mergeNowPlaying,
} from '../lib/azura-sse';
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
let sseShortcode: string | undefined;

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<NowPlayingState>) {
  state = { ...state, ...patch };
  emit();
}

async function fetchFallback(): Promise<AzuraStationNowPlaying | null> {
  const response = await fetch(getProxiedNowPlayingRestUrl());
  if (!response.ok) {
    throw new Error(`Now Playing request failed: ${response.status}`);
  }
  return (await response.json()) as AzuraStationNowPlaying;
}

function closeEventSource() {
  eventSource?.close();
  eventSource = null;
}

function openEventSource(stationShortcode?: string) {
  if (stationShortcode) {
    sseShortcode = stationShortcode;
  }

  closeEventSource();
  eventSource = new EventSource(getNowPlayingSseUrl(sseShortcode));

  eventSource.onopen = () => {
    setState({ isConnected: true, error: null });
  };

  eventSource.onmessage = (event) => {
    const parsed = extractNowPlayingFromSseMessage(event.data);
    if (parsed) {
      setState({
        data: mergeNowPlaying(state.data, parsed),
        error: null,
        isConnected: true,
      });
    }
  };

  eventSource.onerror = async () => {
    setState({ isConnected: false });

    try {
      const fallback = await fetchFallback();
      if (fallback) {
        setState({ data: fallback, error: null });
        if (fallback.station.shortcode && fallback.station.shortcode !== sseShortcode) {
          openEventSource(fallback.station.shortcode);
        }
      }
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : 'Now Playing unavailable',
      });
    }
  };
}

async function ensureBootstrap() {
  if (state.data || state.error) {
    if (state.data?.station.shortcode) {
      openEventSource(state.data.station.shortcode);
    } else {
      openEventSource();
    }
    return;
  }

  try {
    const fallback = await fetchFallback();
    if (fallback) {
      setState({ data: fallback, error: null });
      openEventSource(fallback.station.shortcode);
    }
  } catch (error) {
    setState({
      error: error instanceof Error ? error.message : 'Now Playing unavailable',
    });
    openEventSource();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  subscriberCount += 1;

  if (subscriberCount === 1) {
    void ensureBootstrap();
  }

  return () => {
    listeners.delete(listener);
    subscriberCount -= 1;

    if (subscriberCount === 0) {
      closeEventSource();
      sseShortcode = undefined;
    }
  };
}

function getSnapshot(): NowPlayingState {
  return state;
}

export function useAzuraNowPlaying() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
