import type { Core } from '@strapi/strapi';

const SHOWS = [
  {
    title: 'Morning Coffee',
    slug: 'morning-coffee',
    description: 'Start your day with mellow acoustic and indie tracks.',
    color: '#f59e0b',
    isLiveShow: true,
    hostName: 'DJ Alex',
    dayOfWeek: 'monday',
    startTime: '07:00:00',
    endTime: '10:00:00',
  },
  {
    title: 'Midday Mix',
    slug: 'midday-mix',
    description: 'AutoDJ rotation of current hits and deep cuts.',
    color: '#6366f1',
    isLiveShow: false,
    hostName: 'AutoDJ',
    dayOfWeek: 'monday',
    startTime: '10:00:00',
    endTime: '14:00:00',
  },
  {
    title: 'Afternoon Drive',
    slug: 'afternoon-drive',
    description: 'Energetic tracks for the commute home.',
    color: '#10b981',
    isLiveShow: false,
    hostName: 'AutoDJ',
    dayOfWeek: 'monday',
    startTime: '14:00:00',
    endTime: '18:00:00',
  },
  {
    title: 'Evening Sessions',
    slug: 'evening-sessions',
    description: 'Live sets and guest mixes every evening.',
    color: '#ec4899',
    isLiveShow: true,
    hostName: 'DJ Nova',
    dayOfWeek: 'monday',
    startTime: '18:00:00',
    endTime: '22:00:00',
  },
  {
    title: 'Night Jazz',
    slug: 'night-jazz',
    description: 'Late-night jazz and ambient soundscapes.',
    color: '#8b5cf6',
    isLiveShow: false,
    hostName: 'AutoDJ',
    dayOfWeek: 'monday',
    startTime: '22:00:00',
    endTime: '07:00:00',
  },
] as const;

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

async function enablePublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) return;

  const permissions = [
    { action: 'api::show.show.find', role: publicRole.id },
    { action: 'api::show.show.findOne', role: publicRole.id },
    { action: 'api::schedule-slot.schedule-slot.find', role: publicRole.id },
    { action: 'api::schedule-slot.schedule-slot.findOne', role: publicRole.id },
  ];

  for (const permission of permissions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action: permission.action, role: permission.role } });

    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: permission,
      });
    }
  }
}

async function seedSchedule(strapi: Core.Strapi) {
  const existing = await strapi.db.query('api::show.show').findOne({});

  if (existing) return;

  for (const day of DAYS) {
    for (const showData of SHOWS) {
      const show = await strapi.db.query('api::show.show').create({
        data: {
          title: showData.title,
          slug: `${showData.slug}-${day}`,
          description: showData.description,
          color: showData.color,
          isLiveShow: showData.isLiveShow,
          publishedAt: new Date(),
        },
      });

      await strapi.db.query('api::schedule-slot.schedule-slot').create({
        data: {
          dayOfWeek: day,
          startTime: showData.startTime,
          endTime: showData.endTime,
          hostName: showData.hostName,
          show: show.id,
          publishedAt: new Date(),
        },
      });
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await enablePublicPermissions(strapi);
    await seedSchedule(strapi);
  },
};
