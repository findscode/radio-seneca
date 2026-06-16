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
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          setError('Unable to start playback. Tap play to retry.');
          setPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, setError, setPlaying]);

  return (
    <audio
      ref={audioRef}
      src={streamUrl}
      preload="none"
      crossOrigin="anonymous"
      onPlaying={() => {
        setError(null);
        setPlaying(true);
      }}
      onPause={() => setPlaying(false)}
      onError={() => setError('Stream is currently unavailable.')}
    />
  );
}
