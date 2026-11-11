export type TrackView = {
  id: string;
  title: string;
  artist: string;
  art: string | null;
};

export type Broadcast = {
  current: TrackView;
  history: TrackView[];
  listenersNow: number;
  listeners24h: number | null;
};

type Song = {
  id?: string;
  title?: string;
  artist?: string;
  art?: string;
};

export type NowPlayingPayload = {
  listeners?: {
    current?: number;
  };
  now_playing?: {
    song?: Song;
  };
  song_history?: Array<{
    sh_id?: number;
    song?: Song;
  }>;
};

function artUrl(song: Song | undefined): string | null {
  const art = song?.art?.trim() ?? "";
  return art === "" ? null : art;
}

function trackFromSong(song: Song | undefined, id: string): TrackView {
  return {
    id,
    title: song?.title?.trim() || "—",
    artist: song?.artist?.trim() || "",
    art: artUrl(song),
  };
}

export function toBroadcast(payload: NowPlayingPayload): Broadcast {
  const currentSong = payload.now_playing?.song;
  const history = (payload.song_history ?? []).slice(0, 5).map((item, index) =>
    trackFromSong(item.song, String(item.sh_id ?? `history-${index}`)),
  );

  return {
    current: trackFromSong(currentSong, currentSong?.id ?? "now"),
    history,
    listenersNow: payload.listeners?.current ?? 0,
    listeners24h: null,
  };
}

type Publication = {
  data?: {
    np?: NowPlayingPayload;
  };
};

type SocketMessage = {
  connect?: {
    data?: Publication[];
    subs?: Record<string, { publications?: Publication[] }>;
  };
  pub?: Publication;
};

function payloadFromPublication(row: Publication | undefined): NowPlayingPayload | null {
  return row?.data?.np ?? null;
}

export function payloadFromSocketMessage(message: unknown): NowPlayingPayload | null {
  if (!message || typeof message !== "object") return null;
  const record = message as SocketMessage;

  const direct = payloadFromPublication(record.pub);
  if (direct) return direct;

  const legacy = record.connect?.data ?? [];
  for (const row of legacy) {
    const payload = payloadFromPublication(row);
    if (payload) return payload;
  }

  const subs = record.connect?.subs ?? {};
  for (const sub of Object.values(subs)) {
    for (const row of sub.publications ?? []) {
      const payload = payloadFromPublication(row);
      if (payload) return payload;
    }
  }

  return null;
}
