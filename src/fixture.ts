export type Track = {
  title: string;
  artist: string;
};

export const nowPlaying: Track = {
  title: "ON TIME",
  artist: "SENECA",
};

export const history: Track[] = [
  { title: "QUIET HOUR", artist: "LISTENER" },
  { title: "OPEN AIR", artist: "NORTH" },
  { title: "SECOND GLASS", artist: "ROOM" },
  { title: "LOW LIGHT", artist: "ARCHIVE" },
  { title: "AFTER WORD", artist: "FIELD" },
];

export const quote = "NOTHING IS OURS EXCEPT TIME.";

export const listenersNow = 12;
export const listeners24h = 184;
