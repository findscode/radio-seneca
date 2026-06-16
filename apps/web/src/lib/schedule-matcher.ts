import type { AzuraStationNowPlaying, DayOfWeek, ScheduleSlot, Show } from '@radio-seneca/shared';

const DAY_INDEX: Record<DayOfWeek, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getCurrentDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[date.getDay()];
}

function isTimeInSlot(nowMinutes: number, start: string, end: string): boolean {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);

  if (startMinutes <= endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

function matchesDay(slot: ScheduleSlot, date: Date): boolean {
  return slot.dayOfWeek === getCurrentDayOfWeek(date);
}

export function findSlotByTime(slots: ScheduleSlot[], date = new Date()): ScheduleSlot | null {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const todaySlots = slots.filter((slot) => matchesDay(slot, date));

  const current = todaySlots.find((slot) =>
    isTimeInSlot(nowMinutes, slot.startTime, slot.endTime),
  );

  if (current) return current;

  const overnight = slots.find((slot) => {
    if (slot.endTime > slot.startTime) return false;
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      matchesDay(slot, yesterday) &&
      nowMinutes < parseTimeToMinutes(slot.endTime)
    );
  });

  return overnight ?? null;
}

export function findSlotByStreamer(
  slots: ScheduleSlot[],
  streamerName: string,
  date = new Date(),
): ScheduleSlot | null {
  const normalized = streamerName.trim().toLowerCase();
  if (!normalized) return null;

  const candidates = slots.filter(
    (slot) =>
      matchesDay(slot, date) &&
      slot.hostName.trim().toLowerCase() === normalized,
  );

  if (candidates.length === 0) return null;

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const active = candidates.find((slot) =>
    isTimeInSlot(nowMinutes, slot.startTime, slot.endTime),
  );

  return active ?? candidates[0];
}

export function getCurrentShow(
  nowPlaying: AzuraStationNowPlaying | null,
  slots: ScheduleSlot[],
  date = new Date(),
): { show: Show; slot: ScheduleSlot; source: 'live' | 'schedule' } | null {
  if (nowPlaying?.live?.is_live && nowPlaying.live.streamer_name) {
    const liveSlot = findSlotByStreamer(
      slots,
      nowPlaying.live.streamer_name,
      date,
    );
    if (liveSlot) {
      return { show: liveSlot.show, slot: liveSlot, source: 'live' };
    }
  }

  const slot = findSlotByTime(slots, date);
  if (!slot) return null;

  return { show: slot.show, slot, source: 'schedule' };
}

export function getUpNext(
  slots: ScheduleSlot[],
  date = new Date(),
): ScheduleSlot | null {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const today = getCurrentDayOfWeek(date);
  const todayIndex = DAY_INDEX[today];

  const sorted = [...slots].sort((a, b) => {
    const dayDiff = DAY_INDEX[a.dayOfWeek] - DAY_INDEX[b.dayOfWeek];
    if (dayDiff !== 0) return dayDiff;
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
  });

  const upcomingToday = sorted.filter(
    (slot) =>
      slot.dayOfWeek === today &&
      parseTimeToMinutes(slot.startTime) > nowMinutes,
  );

  if (upcomingToday.length > 0) return upcomingToday[0];

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDayIndex = (todayIndex + offset) % 7;
    const nextDay = Object.entries(DAY_INDEX).find(([, idx]) => idx === nextDayIndex)?.[0] as
      | DayOfWeek
      | undefined;

    if (!nextDay) continue;

    const nextSlots = sorted.filter((slot) => slot.dayOfWeek === nextDay);
    if (nextSlots.length > 0) return nextSlots[0];
  }

  return null;
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const DAY_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
