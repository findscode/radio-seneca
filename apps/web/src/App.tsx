import { Link, Outlet, useLocation } from 'react-router-dom';
import { AudioPlayer } from './components/player/AudioPlayer';
import { PlayerBar } from './components/player/PlayerBar';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="pb-20">
      <AudioPlayer />

      <header>
        <Link to="/">Radio Seneca</Link>
        <nav>
          <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>
            Home
          </Link>
          {' · '}
          <Link
            to="/schedule"
            aria-current={location.pathname === '/schedule' ? 'page' : undefined}
          >
            Schedule
          </Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <PlayerBar />
    </div>
  );
}
