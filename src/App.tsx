import { useEffect, useState } from "react";
import { AsciiField } from "./AsciiField";
import { readLanguage, storeLanguage, textFor, type Lang } from "./i18n";
import { quoteAt, utcHour } from "./quotes";
import { useBroadcast } from "./useBroadcast";
import { streamUrl, usePlayer } from "./usePlayer";

export function App() {
  const player = usePlayer();
  const broadcast = useBroadcast();
  const [lang, setLang] = useState<Lang>(readLanguage);
  const [hour, setHour] = useState(() => utcHour(new Date()));
  const text = textFor(lang);

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      const now = new Date();
      setHour(utcHour(now));
      const next = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours() + 1,
      );
      timer = window.setTimeout(schedule, Math.max(1000, next - now.getTime() + 50));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  function chooseLanguage(next: Lang) {
    storeLanguage(next);
    setLang(next);
  }

  return (
    <div className="screen">
      <aside className="cover">
        <div className="cover-top">
          <div className="brand-block">
            <span className="tick" aria-hidden="true" />
            <p className="logo">SENECA</p>
          </div>
          <LanguageSwitch
            className="lang lang-mobile"
            lang={lang}
            onChange={chooseLanguage}
          />
        </div>
        <CoverArt art={broadcast.current.art} />
        <p className="quote">{quoteAt(new Date(), lang)}</p>
      </aside>

      <main className="stage">
        <AsciiField shift={hour} />
        <div className="stage-body">
          <header className="top">
            <p className="live">
              {text.live}
              <span className="dot" aria-hidden="true" />
            </p>
            <div className="top-side">
              <LanguageSwitch
                className="lang lang-desktop"
                lang={lang}
                onChange={chooseLanguage}
              />
              <p className="stats">
                {text.now}&nbsp;&nbsp;{broadcast.listenersNow}
                {broadcast.listeners24h !== null && (
                  <>
                    <br />
                    {text.day}&nbsp;&nbsp;{broadcast.listeners24h}
                  </>
                )}
              </p>
            </div>
          </header>

          <h1 className="title">
            {player.offline ? text.unavailable : broadcast.current.title}
          </h1>
          <p className={player.offline ? "status" : "artist"}>
            {player.offline ? text.reconnecting : broadcast.current.artist}
          </p>

          <div className="controls">
            <button
              type="button"
              className="play"
              aria-pressed={player.listening}
              onClick={player.togglePlay}
            >
              {player.listening ? text.pause : text.play}
            </button>
            <label className="volume">
              <span className="vol-label">{text.vol}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={player.volume}
                aria-label={text.volume}
                style={{ ["--vol" as string]: `${player.volume * 100}%` }}
                onChange={(event) =>
                  player.changeVolume(Number(event.target.value))
                }
              />
            </label>
            <button
              type="button"
              className={player.muted ? "mute is-on" : "mute"}
              aria-pressed={player.muted}
              onClick={player.toggleMute}
            >
              {text.mute}
            </button>
          </div>
          <audio
            ref={player.audioRef}
            className="stream"
            preload="none"
            src={streamUrl || undefined}
          />

          <hr className="rule" />

          <section className="recent" aria-label={text.recent}>
            <h2>{text.recent}</h2>
            <ol>
              {broadcast.history.map((track) => (
                <li key={track.id}>
                  <Thumb art={track.art} />
                  <span className="row-title">{track.title}</span>
                  <span className="row-artist">{track.artist}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}

function LanguageSwitch({
  className,
  lang,
  onChange,
}: {
  className: string;
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <p className={className}>
      <button
        type="button"
        className={lang === "ru" ? "is-on" : ""}
        aria-pressed={lang === "ru"}
        onClick={() => onChange("ru")}
      >
        RU
      </button>
      <span aria-hidden="true"> / </span>
      <button
        type="button"
        className={lang === "en" ? "is-on" : ""}
        aria-pressed={lang === "en"}
        onClick={() => onChange("en")}
      >
        EN
      </button>
    </p>
  );
}

function CoverArt({ art }: { art: string | null }) {
  const failed = useFailedArt(art);
  if (!art || failed.failed) {
    return (
      <p className="mark" aria-hidden="true">
        S
      </p>
    );
  }
  return <img className="cover-image" src={art} alt="" onError={failed.fail} />;
}

function Thumb({ art }: { art: string | null }) {
  const failed = useFailedArt(art);
  if (!art || failed.failed) {
    return (
      <span className="mini" aria-hidden="true">
        S
      </span>
    );
  }
  return <img className="mini-art" src={art} alt="" onError={failed.fail} />;
}

function useFailedArt(art: string | null) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [art]);
  return { failed, fail: () => setFailed(true) };
}
