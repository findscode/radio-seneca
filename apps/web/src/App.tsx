import { Link, Outlet, useLocation } from 'react-router-dom';
import { AudioPlayer } from './components/player/AudioPlayer';
import { PlayerBar } from './components/player/PlayerBar';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen pb-24">
      <AudioPlayer />

      <header className="border-b border-seneca-border bg-seneca-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-bold tracking-tight text-white">
            Radio Seneca
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className={location.pathname === '/' ? 'text-white' : 'text-slate-400 hover:text-white'}
            >
              Home
            </Link>
            <Link
              to="/schedule"
              className={
                location.pathname === '/schedule'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }
            >
              Schedule
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <PlayerBar />
    </div>
  );
}
