import type { DayOfWeek, ScheduleSlot, Show, StrapiListResponse } from '@radio-seneca/shared';

const configuredUrl = import.meta.env.VITE_STRAPI_URL;
const useSameOriginProxy =
  import.meta.env.VITE_USE_SAME_ORIGIN_PROXY === 'true' || import.meta.env.PROD;
const strapiUrl = (configuredUrl ?? (useSameOriginProxy ? '' : 'http://localhost:1337')).replace(
  /\/$/,
  '',
);

interface StrapiMedia {
  url: string;
  alternativeText?: string;
}

interface StrapiEntity {
  id: number;
  documentId: string;
  title?: string;
  slug?: string;
  description?: string | null;
  color?: string;
  isLiveShow?: boolean;
  cover?: StrapiMedia | null;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  hostName?: string;
  show?: StrapiEntity;
}

function mapShow(entity: StrapiEntity): Show {
  return {
    id: entity.id,
    documentId: entity.documentId,
    title: entity.title ?? '',
    slug: entity.slug ?? '',
    description: entity.description ?? null,
    color: entity.color ?? '#6366f1',
    isLiveShow: entity.isLiveShow ?? false,
    cover: entity.cover
      ? {
          url: entity.cover.url.startsWith('http')
            ? entity.cover.url
            : `${strapiUrl}${entity.cover.url}`,
          alternativeText: entity.cover.alternativeText,
        }
      : null,
  };
}

function mapScheduleSlot(entity: StrapiEntity): ScheduleSlot | null {
  if (!entity.show) return null;

  return {
    id: entity.id,
    documentId: entity.documentId,
    dayOfWeek: entity.dayOfWeek!,
    startTime: normalizeTime(entity.startTime!),
    endTime: normalizeTime(entity.endTime!),
    hostName: entity.hostName ?? '',
    show: mapShow(entity.show),
  };
}

function normalizeTime(value: string): string {
  return value.slice(0, 5);
}

export async function fetchScheduleSlots(): Promise<ScheduleSlot[]> {
  const params = new URLSearchParams({
    populate: 'show',
    'pagination[pageSize]': '200',
    sort: 'startTime:asc',
  });

  const response = await fetch(`${strapiUrl}/api/schedule-slots?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch schedule: ${response.status}`);
  }

  const json = (await response.json()) as StrapiListResponse<StrapiEntity>;
  return json.data
    .map((entity) => mapScheduleSlot(entity))
    .filter((slot): slot is ScheduleSlot => slot !== null);
}

export function getStrapiUrl(): string {
  return strapiUrl;
}
