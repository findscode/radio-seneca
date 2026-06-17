import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';

export function SongHistory() {
  const { data } = useAzuraNowPlaying();
  const history = data?.song_history?.slice(0, 5) ?? [];

  if (history.length === 0) return null;

  return (
    <section>
      <h2>Recently Played</h2>
      <ul>
        {history.map((entry) => (
          <li key={`${entry.sh_id}-${entry.played_at}`}>
            {entry.song.art && <img src={entry.song.art} alt="" width={40} height={40} />}
            <span>{entry.song.title}</span>
            <span>{entry.song.artist}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
