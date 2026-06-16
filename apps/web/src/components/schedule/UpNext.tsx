import { useSchedule } from '../../hooks/useSchedule';
import { DAY_LABELS, getUpNext } from '../../lib/schedule-matcher';

export function UpNext() {
  const { data: slots, isLoading } = useSchedule();
  const next = slots ? getUpNext(slots) : null;

  if (isLoading) return null;
  if (!next) return null;

  return (
    <section className="rounded-2xl border border-seneca-border bg-seneca-surface p-6">
      <h2 className="mb-3 text-lg font-semibold text-white">Up Next</h2>
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-lg"
          style={{ backgroundColor: next.show.color }}
        />
        <div>
          <p className="font-medium text-white">{next.show.title}</p>
          <p className="text-sm text-slate-400">
            {DAY_LABELS[next.dayOfWeek]} · {next.startTime} · {next.hostName}
          </p>
        </div>
      </div>
    </section>
  );
}
