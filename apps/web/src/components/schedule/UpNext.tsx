import { useSchedule } from '../../hooks/useSchedule';
import { DAY_LABELS, getUpNext } from '../../lib/schedule-matcher';

export function UpNext() {
  const { data: slots, isLoading } = useSchedule();
  const next = slots ? getUpNext(slots) : null;

  if (isLoading || !next) return null;

  return (
    <section>
      <h2>Up Next</h2>
      <p>{next.show.title}</p>
      <p>
        {DAY_LABELS[next.dayOfWeek]} {next.startTime} {next.hostName}
      </p>
    </section>
  );
}
