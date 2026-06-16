export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface AzuraSong {
  id: string;
  text: string;
  title: string;
  artist: string;
  album: string;
  art: string;
  custom_fields: Record<string, unknown>;
}

export interface AzuraLive {
  is_live: boolean;
  streamer_name: string;
  broadcast_start: number | null;
  art: string;
}

export interface AzuraNowPlaying {
  elapsed: number;
  remaining: number;
  sh_id: number;
  played_at: number;
  duration: number;
  playlist: string;
  streamer: string;
  is_request: boolean;
  song: AzuraSong;
}

export interface AzuraStationNowPlaying {
  station: {
    id: number;
    name: string;
    shortcode: string;
    description: string;
    frontend: string;
    backend: string;
    listen_url: string;
    url: string;
    public_player_url: string;
    playlist_pls_url: string;
    playlist_m3u_url: string;
    is_public: boolean;
    mounts: Array<{
      id: number;
      name: string;
      url: string;
      bitrate: number;
      format: string;
      listeners: { total: number; unique: number; current: number };
      path: string;
      is_default: boolean;
    }>;
  };
  listeners: { total: number; unique: number; current: number };
  live: AzuraLive;
  now_playing: AzuraNowPlaying;
  playing_next: AzuraNowPlaying | null;
  song_history: AzuraNowPlaying[];
  is_online: boolean;
  cache: string;
}

export interface Show {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  color: string;
  isLiveShow: boolean;
  cover?: {
    url: string;
    alternativeText?: string;
  } | null;
}

export interface ScheduleSlot {
  id: number;
  documentId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  hostName: string;
  show: Show;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta?: StrapiResponse<T>['meta'];
}
