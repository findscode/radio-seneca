export type Lang = "ru" | "en";

const LANGUAGE_KEY = "seneca.language";

export type Copy = {
  live: string;
  play: string;
  pause: string;
  vol: string;
  mute: string;
  recent: string;
  now: string;
  day: string;
  unavailable: string;
  reconnecting: string;
  volume: string;
};

const copy: Record<Lang, Copy> = {
  en: {
    live: "LIVE",
    play: "PLAY",
    pause: "PAUSE",
    vol: "VOL",
    mute: "MUTE",
    recent: "> RECENT",
    now: "NOW",
    day: "24H",
    unavailable: "Broadcast unavailable",
    reconnecting: "Reconnecting…",
    volume: "Volume",
  },
  ru: {
    live: "ЭФИР",
    play: "ПУСК",
    pause: "ПАУЗА",
    vol: "ЗВУК",
    mute: "ТИХО",
    recent: "> НЕДАВНИЕ",
    now: "NOW",
    day: "24Ч",
    unavailable: "Эфир недоступен",
    reconnecting: "Переподключение…",
    volume: "Громкость",
  },
};

export function languageFrom(saved: string | null, browserLanguage: string): Lang {
  if (saved === "ru" || saved === "en") return saved;
  return browserLanguage.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function readLanguage(): Lang {
  return languageFrom(localStorage.getItem(LANGUAGE_KEY), navigator.language);
}

export function storeLanguage(lang: Lang) {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

export function textFor(lang: Lang): Copy {
  return copy[lang];
}
