import type { Core } from '@strapi/strapi';

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

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await enablePublicPermissions(strapi);
  },
};
