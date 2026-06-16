import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';

export function LiveIndicator() {
  const { data } = useAzuraNowPlaying();

  if (!data?.live?.is_live) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-300">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      LIVE
      {data.live.streamer_name && (
        <span className="text-red-200">· {data.live.streamer_name}</span>
      )}
    </div>
  );
}
