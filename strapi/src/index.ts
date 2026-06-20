import type { Core } from '@strapi/strapi';

const PUBLIC_ROLE_UID = 'public';
const CONTENT_TYPES = ['product', 'category', 'brand', 'page'];

export default {
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: PUBLIC_ROLE_UID },
    });

    if (publicRole) {
      const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
        where: {
          role: publicRole.id,
          action: {
            $startsWithi: 'api::',
          },
        },
      });

      const existingActions = new Set(permissions.map((p: any) => p.action));

      for (const ct of CONTENT_TYPES) {
        const findAction = `api::${ct}.${ct}.find`;
        const findOneAction = `api::${ct}.${ct}.findOne`;

        if (!existingActions.has(findAction)) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: findAction,
              role: publicRole.id,
            },
          });
        }

        if (!existingActions.has(findOneAction)) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: findOneAction,
              role: publicRole.id,
            },
          });
        }
      }
    }
  },
};
