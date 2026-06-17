import type { AzuraStationNowPlaying } from '@radio-seneca/shared';

export function isNowPlayingPayload(value: unknown): value is AzuraStationNowPlaying {
  return (
    typeof value === 'object' &&
    value !== null &&
    'now_playing' in value &&
    typeof (value as AzuraStationNowPlaying).now_playing === 'object'
  );
}

export function mergeNowPlaying(
  current: AzuraStationNowPlaying | null,
  incoming: AzuraStationNowPlaying,
): AzuraStationNowPlaying {
  if (!current) return incoming;

  return {
    ...current,
    ...incoming,
    station: { ...current.station, ...incoming.station },
    now_playing: incoming.now_playing ?? current.now_playing,
    live: incoming.live ?? current.live,
    listeners: incoming.listeners ?? current.listeners,
    song_history:
      incoming.song_history && incoming.song_history.length > 0
        ? incoming.song_history
        : current.song_history,
    playing_next: incoming.playing_next ?? current.playing_next,
  };
}

export function extractNowPlayingFromSseMessage(raw: string): AzuraStationNowPlaying | null {
  try {
    const json = JSON.parse(raw) as Record<string, unknown>;

    if (Object.keys(json).length === 0) {
      return null;
    }

    const pub = json.pub as
      | { data?: { np?: AzuraStationNowPlaying } | AzuraStationNowPlaying }
      | undefined;
    if (pub?.data) {
      const payload = pub.data;
      if ('np' in payload && payload.np && isNowPlayingPayload(payload.np)) {
        return payload.np;
      }
      if (isNowPlayingPayload(payload)) {
        return payload;
      }
    }

    const connect = json.connect as
      | {
          data?: Array<{ data?: { np?: AzuraStationNowPlaying } }>;
          subs?: Record<string, { publications?: Array<{ data?: { np?: AzuraStationNowPlaying } }> }>;
        }
      | undefined;

    if (connect?.data) {
      for (const row of connect.data) {
        if (row.data?.np && isNowPlayingPayload(row.data.np)) {
          return row.data.np;
        }
      }
    }

    if (connect?.subs) {
      for (const sub of Object.values(connect.subs)) {
        for (const publication of sub.publications ?? []) {
          if (publication.data?.np && isNowPlayingPayload(publication.data.np)) {
            return publication.data.np;
          }
        }
      }
    }

    if (isNowPlayingPayload(json)) {
      return json;
    }

    return null;
  } catch {
    return null;
  }
}
