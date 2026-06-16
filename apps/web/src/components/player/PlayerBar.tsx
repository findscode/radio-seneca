import { usePlayerStore } from '../../stores/player';
import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';

export function PlayerBar() {
  const { data, error: nowPlayingError } = useAzuraNowPlaying();
  const { isPlaying, volume, isMuted, error, setPlaying, setVolume, toggleMute } =
    usePlayerStore();

  const song = data?.now_playing?.song;
  const title = song?.title || 'Radio Seneca';
  const artist = song?.artist || 'Internet Radio';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-seneca-border bg-seneca-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setPlaying(!isPlaying)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-seneca-accent text-white transition hover:brightness-110"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{title}</p>
          <p className="truncate text-xs text-slate-400">{artist}</p>
          {(error || nowPlayingError) && (
            <p className="truncate text-xs text-red-400">{error || nowPlayingError}</p>
          )}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 transition hover:text-white"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-24 accent-seneca-accent"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
