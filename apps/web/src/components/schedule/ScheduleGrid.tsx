import { useMemo } from 'react';
import { useSchedule } from '../../hooks/useSchedule';
import { DAY_LABELS, DAY_ORDER } from '../../lib/schedule-matcher';
import type { DayOfWeek, ScheduleSlot } from '@radio-seneca/shared';

function groupByDay(slots: ScheduleSlot[]): Record<DayOfWeek, ScheduleSlot[]> {
  return DAY_ORDER.reduce(
    (acc, day) => {
      acc[day] = slots
        .filter((slot) => slot.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      return acc;
    },
    {} as Record<DayOfWeek, ScheduleSlot[]>,
  );
}

export function ScheduleGrid() {
  const { data: slots = [], isLoading, error } = useSchedule();

  const grouped = useMemo(() => groupByDay(slots), [slots]);

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading schedule…</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Could not load schedule. Make sure Strapi is running.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {DAY_ORDER.map((day) => (
        <section
          key={day}
          className="rounded-2xl border border-seneca-border bg-seneca-surface p-4"
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            {DAY_LABELS[day]}
          </h3>
          <ul className="space-y-2">
            {grouped[day].length === 0 && (
              <li className="text-sm text-slate-500">No shows scheduled</li>
            )}
            {grouped[day].map((slot) => (
              <li
                key={slot.documentId}
                className="rounded-lg border border-seneca-border/80 bg-seneca-bg/60 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slot.show.color }}
                  />
                  <p className="text-sm font-medium text-white">{slot.show.title}</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {slot.startTime} – {slot.endTime} · {slot.hostName}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
