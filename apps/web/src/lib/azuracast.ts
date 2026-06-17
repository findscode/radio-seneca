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

function toProxiedAzuraPath(url: string): string {
  try {
    const parsed = new URL(url, getAzuraBaseUrl());
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url.startsWith('/') ? url : `/${url}`;
  }
}

export function getStreamUrl(data?: AzuraStationNowPlaying | null): string {
  const directUrl = data?.station?.listen_url;
  if (!directUrl) {
    return '';
  }

  if (useSameOriginProxy || import.meta.env.DEV) {
    return toProxiedAzuraPath(directUrl);
  }

  return directUrl;
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
