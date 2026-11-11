/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STREAM_URL?: string;
  readonly VITE_NOWPLAYING_URL?: string;
  readonly VITE_NOWPLAYING_WS_URL?: string;
  readonly VITE_STATION_SHORTCODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
