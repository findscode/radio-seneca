import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';
import { useSchedule } from '../../hooks/useSchedule';
import { getCurrentShow } from '../../lib/schedule-matcher';

export function CurrentShow() {
  const { data: nowPlaying } = useAzuraNowPlaying();
  const { data: slots, isLoading, error } = useSchedule();

  const current = slots ? getCurrentShow(nowPlaying, slots) : null;

  return (
    <section>
      <h2>On Air</h2>

      {isLoading && <p>Loading…</p>}
      {error && <p role="alert">{error.message}</p>}

      {current ? (
        <div>
          <p>{current.show.title}</p>
          <p>{current.slot.hostName}</p>
          {current.show.description && <p>{current.show.description.replace(/<[^>]+>/g, '')}</p>}
        </div>
      ) : (
        !isLoading && !error && <p>—</p>
      )}
    </section>
  );
}
