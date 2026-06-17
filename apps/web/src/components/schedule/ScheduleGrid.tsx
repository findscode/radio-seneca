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
    return <p>Loading…</p>;
  }

  if (error) {
    return <p role="alert">{error.message}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {DAY_ORDER.map((day) => (
        <section key={day}>
          <h2>{DAY_LABELS[day]}</h2>
          <ul>
            {grouped[day].length === 0 && <li>—</li>}
            {grouped[day].map((slot) => (
              <li key={slot.documentId}>
                <p>{slot.show.title}</p>
                <p>
                  {slot.startTime}–{slot.endTime} {slot.hostName}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
