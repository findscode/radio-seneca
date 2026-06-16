import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';

export function SongHistory() {
  const { data } = useAzuraNowPlaying();
  const history = data?.song_history?.slice(0, 5) ?? [];

  if (history.length === 0) return null;

  return (
    <section className="rounded-2xl border border-seneca-border bg-seneca-surface p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Recently Played</h2>
      <ul className="space-y-3">
        {history.map((entry) => (
          <li
            key={`${entry.sh_id}-${entry.played_at}`}
            className="flex items-center gap-3 border-b border-seneca-border/60 pb-3 last:border-0 last:pb-0"
          >
            {entry.song.art ? (
              <img
                src={entry.song.art}
                alt=""
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-seneca-border text-slate-500">
                ♪
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{entry.song.title}</p>
              <p className="truncate text-xs text-slate-400">{entry.song.artist}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
