import { useEffect, useState } from "react";
import { AsciiField } from "./AsciiField";
import { quote } from "./fixture";
import { useBroadcast } from "./useBroadcast";
import { streamUrl, usePlayer } from "./usePlayer";

export function App() {
  const player = usePlayer();
  const broadcast = useBroadcast();

  return (
    <div className="screen">
      <aside className="cover">
        <div className="cover-top">
          <div className="brand-block">
            <span className="tick" aria-hidden="true" />
            <p className="logo">SENECA</p>
          </div>
          <p className="lang lang-mobile">RU / EN</p>
        </div>
        <CoverArt art={broadcast.current.art} />
        <p className="quote">{quote}</p>
      </aside>

      <main className="stage">
        <AsciiField />
        <div className="stage-body">
          <header className="top">
            <p className="live">
              LIVE
              <span className="dot" aria-hidden="true" />
            </p>
            <div className="top-side">
              <p className="lang lang-desktop">RU / EN</p>
              <p className="stats">
                NOW&nbsp;&nbsp;{broadcast.listenersNow}
                {broadcast.listeners24h !== null && (
                  <>
                    <br />
                    24H&nbsp;&nbsp;{broadcast.listeners24h}
                  </>
                )}
              </p>
            </div>
          </header>

          <h1 className="title">{broadcast.current.title}</h1>
          <p className="artist">{broadcast.current.artist}</p>

          <div className="controls">
            <button
              type="button"
              className="play"
              aria-pressed={player.playing}
              onClick={player.togglePlay}
            >
              {player.playing ? "PAUSE" : "PLAY"}
            </button>
            <label className="volume">
              <span className="vol-label">VOL</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={player.volume}
                aria-label="Volume"
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
              MUTE
            </button>
          </div>
          <audio
            ref={player.audioRef}
            className="stream"
            preload="none"
            src={streamUrl || undefined}
          />

          <hr className="rule" />

          <section className="recent" aria-label="Recent">
            <h2>&gt; RECENT</h2>
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

function CoverArt({ art }: { art: string | null }) {
  const failed = useFailedArt(art);
  if (!art || failed.failed) {
    return (
      <p className="mark" aria-hidden="true">
        S
      </p>
    );
  }
  return (
    <img
      className="cover-image"
      src={art}
      alt=""
      onError={failed.fail}
    />
  );
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
