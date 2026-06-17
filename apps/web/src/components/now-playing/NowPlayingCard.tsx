import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';
import { LiveIndicator } from './LiveIndicator';

export function NowPlayingCard() {
  const { data, error } = useAzuraNowPlaying();

  const song = data?.now_playing?.song;
  const art = data?.live?.is_live && data.live.art ? data.live.art : song?.art;

  return (
    <section>
      <h2>Now Playing</h2>
      <LiveIndicator />

      {error && <p role="alert">{error}</p>}

      {art && <img src={art} alt="" width={160} height={160} />}

      <p>{song?.title ?? '—'}</p>
      <p>{song?.artist ?? '—'}</p>
      {song?.album && <p>{song.album}</p>}
      {data?.listeners?.current != null && <p>{data.listeners.current}</p>}
    </section>
  );
}
