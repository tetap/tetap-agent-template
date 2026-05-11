import { defaultLocale } from '@tetap/i18n/locales';
import { resolveLocale } from '@tetap/i18n/node';
import type { FastifyInstance } from 'fastify';

export const registerI18nMiddleware = (app: FastifyInstance) => {
  app.decorateRequest('locale', defaultLocale);

  app.addHook('onRequest', async request => {
    request.locale = resolveLocale(request);
  });
};
