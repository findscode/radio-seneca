import { useQuery } from '@tanstack/react-query';
import { fetchScheduleSlots } from '../lib/strapi';

export function useSchedule() {
  return useQuery({
    queryKey: ['schedule-slots'],
    queryFn: fetchScheduleSlots,
    staleTime: 60_000,
    retry: 2,
  });
}
