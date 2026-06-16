import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';
import { LiveIndicator } from './LiveIndicator';

export function NowPlayingCard() {
  const { data, error, isConnected } = useAzuraNowPlaying();

  const song = data?.now_playing?.song;
  const art = data?.live?.is_live && data.live.art ? data.live.art : song?.art;

  return (
    <section className="rounded-2xl border border-seneca-border bg-seneca-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Now Playing</h2>
        <div className="flex items-center gap-2">
          <LiveIndicator />
          <span
            className={`text-xs ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            {isConnected ? 'Live feed' : 'Polling'}
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="mx-auto h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-seneca-border sm:mx-0">
          {art ? (
            <img src={art} alt={song?.title ?? 'Album art'} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-slate-600">
              ♪
            </div>
          )}
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <p className="text-2xl font-bold text-white">{song?.title ?? '—'}</p>
          <p className="mt-1 text-lg text-slate-300">{song?.artist ?? '—'}</p>
          {song?.album && (
            <p className="mt-2 text-sm text-slate-500">{song.album}</p>
          )}
          {data?.listeners?.current != null && (
            <p className="mt-4 text-sm text-slate-400">
              {data.listeners.current} listener{data.listeners.current === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
