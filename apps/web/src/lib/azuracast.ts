import type { AzuraStationNowPlaying } from '@radio-seneca/shared';

const azuraBaseUrl = import.meta.env.VITE_AZURACAST_URL ?? 'https://demo.azuracast.com';
const stationId = import.meta.env.VITE_STATION_ID ?? '1';
const useSameOriginProxy =
  import.meta.env.VITE_USE_SAME_ORIGIN_PROXY === 'true' || import.meta.env.PROD;

export function getAzuraBaseUrl(): string {
  return azuraBaseUrl.replace(/\/$/, '');
}

export function getStationId(): string {
  return stationId;
}

export function getStreamUrl(data?: AzuraStationNowPlaying | null): string {
  if (data?.station?.listen_url) {
    return data.station.listen_url;
  }

  return `${getAzuraBaseUrl()}/radio/8000/stream`;
}

export function getNowPlayingRestUrl(): string {
  return `${getAzuraBaseUrl()}/api/nowplaying/${getStationId()}`;
}

export function getNowPlayingSseUrl(): string {
  if (useSameOriginProxy || import.meta.env.DEV) {
    return `/api/live/nowplaying/sse`;
  }

  return `${getAzuraBaseUrl()}/api/live/nowplaying/sse`;
}

export function getProxiedNowPlayingRestUrl(): string {
  if (useSameOriginProxy || import.meta.env.DEV) {
    return `/api/nowplaying/${getStationId()}`;
  }

  return getNowPlayingRestUrl();
}
