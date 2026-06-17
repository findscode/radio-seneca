import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';

export function LiveIndicator() {
  const { data } = useAzuraNowPlaying();

  if (!data?.live?.is_live) return null;

  return (
    <p>
      Live
      {data.live.streamer_name ? `: ${data.live.streamer_name}` : null}
    </p>
  );
}
