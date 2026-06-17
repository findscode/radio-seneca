import { useEffect, useRef } from 'react';
import { getStreamUrl } from '../../lib/azuracast';
import { usePlayerStore } from '../../stores/player';
import { useAzuraNowPlaying } from '../../hooks/useAzuraNowPlaying';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { data } = useAzuraNowPlaying();
  const { isPlaying, volume, isMuted, setPlaying, setError } = usePlayerStore();

  const streamUrl = getStreamUrl(data);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          setError('Playback failed');
          setPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, streamUrl, setError, setPlaying]);

  if (!streamUrl) {
    return null;
  }

  return (
    <audio
      ref={audioRef}
      src={streamUrl}
      preload="none"
      onPlaying={() => {
        setError(null);
        setPlaying(true);
      }}
      onPause={() => setPlaying(false)}
      onError={() => setError('Stream unavailable')}
    />
  );
}
