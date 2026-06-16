import { Link } from 'react-router-dom';
import { NowPlayingCard } from '../components/now-playing/NowPlayingCard';
import { SongHistory } from '../components/now-playing/SongHistory';
import { CurrentShow } from '../components/schedule/CurrentShow';
import { UpNext } from '../components/schedule/UpNext';

export function HomePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-seneca-accent">Radio Seneca</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Always on. Always yours.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Hybrid internet radio — AutoDJ between live shows. Tune in and explore the program.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <NowPlayingCard />
          <SongHistory />
        </div>
        <div className="space-y-6">
          <CurrentShow />
          <UpNext />
          <Link
            to="/schedule"
            className="block rounded-xl border border-seneca-border bg-seneca-surface px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-seneca-accent hover:text-white"
          >
            View full schedule →
          </Link>
        </div>
      </div>
    </div>
  );
}
