import { ScheduleGrid } from '../components/schedule/ScheduleGrid';

export function SchedulePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-seneca-accent">Program Guide</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Schedule</h1>
        <p className="mt-3 text-slate-400">
          Weekly program grid. Live shows are matched to AzuraCast streamer names.
        </p>
      </header>
      <ScheduleGrid />
    </div>
  );
}
