import { Link } from 'react-router-dom';
import { NowPlayingCard } from '../components/now-playing/NowPlayingCard';
import { SongHistory } from '../components/now-playing/SongHistory';
import { CurrentShow } from '../components/schedule/CurrentShow';
import { UpNext } from '../components/schedule/UpNext';

export function HomePage() {
  return (
    <div className="space-y-6">
      <NowPlayingCard />
      <SongHistory />
      <CurrentShow />
      <UpNext />
      <p>
        <Link to="/schedule">Schedule</Link>
      </p>
    </div>
  );
}
