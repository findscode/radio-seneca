import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';
import { useSchedule } from '../../hooks/useSchedule';
import { getCurrentShow } from '../../lib/schedule-matcher';

export function CurrentShow() {
  const { data: nowPlaying } = useAzuraNowPlaying();
  const { data: slots, isLoading, error } = useSchedule();

  const current = slots ? getCurrentShow(nowPlaying, slots) : null;

  return (
    <section className="rounded-2xl border border-seneca-border bg-seneca-surface p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">On Air Now</h2>

      {isLoading && <p className="text-sm text-slate-400">Loading schedule…</p>}
      {error && (
        <p className="text-sm text-amber-300">
          Schedule unavailable. Now Playing still works.
        </p>
      )}

      {current ? (
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-16 shrink-0 rounded-xl"
            style={{ backgroundColor: current.show.color }}
          />
          <div>
            <p className="text-xl font-semibold text-white">{current.show.title}</p>
            <p className="mt-1 text-sm text-slate-300">
              {current.source === 'live'
                ? `Live with ${current.slot.hostName}`
                : `${current.slot.hostName} · AutoDJ`}
            </p>
            {current.show.description && (
              <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                {current.show.description.replace(/<[^>]+>/g, '')}
              </p>
            )}
          </div>
        </div>
      ) : (
        !isLoading && (
          <p className="text-sm text-slate-400">No scheduled show for this time slot.</p>
        )
      )}
    </section>
  );
}
