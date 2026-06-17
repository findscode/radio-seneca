import { usePlayerStore } from '../../stores/player';
import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';

export function PlayerBar() {
  const { data, error: nowPlayingError } = useAzuraNowPlaying();
  const { isPlaying, volume, isMuted, error, setPlaying, setVolume, toggleMute } =
    usePlayerStore();

  const song = data?.now_playing?.song;

  return (
    <div className="fixed inset-x-0 bottom-0 border-t">
      <div className="flex items-center gap-4 p-3">
        <button type="button" onClick={() => setPlaying(!isPlaying)} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div>
          <p>{song?.title ?? '—'}</p>
          <p>{song?.artist ?? '—'}</p>
          {(error || nowPlayingError) && <p role="alert">{error || nowPlayingError}</p>}
        </div>

        <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted || volume === 0 ? 'Unmute' : 'Mute'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
