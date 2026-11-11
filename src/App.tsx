import { asciiField } from "./ascii";
import {
  history,
  listeners24h,
  listenersNow,
  nowPlaying,
  quote,
} from "./fixture";
import { streamUrl, usePlayer } from "./usePlayer";

const pattern = asciiField();

export function App() {
  const player = usePlayer();

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
        <p className="mark" aria-hidden="true">
          S
        </p>
        <p className="quote">{quote}</p>
      </aside>

      <main className="stage">
        <pre className="ascii" aria-hidden="true">
          {pattern}
        </pre>
        <div className="stage-body">
          <header className="top">
            <p className="live">
              LIVE
              <span className="dot" aria-hidden="true" />
            </p>
            <div className="top-side">
              <p className="lang lang-desktop">RU / EN</p>
              <p className="stats">
                NOW&nbsp;&nbsp;{listenersNow}
                <br />
                24H&nbsp;&nbsp;{listeners24h}
              </p>
            </div>
          </header>

          <h1 className="title">{nowPlaying.title}</h1>
          <p className="artist">{nowPlaying.artist}</p>

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
              {history.map((track) => (
                <li key={track.title}>
                  <span className="mini" aria-hidden="true">
                    S
                  </span>
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
