import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastify from 'fastify';
import { registerAuthMiddleware } from './plugins/auth.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { registerI18nMiddleware } from './plugins/i18n.js';
import { registerOperationLogMiddleware } from './plugins/operation-log.js';
import { registerSecurityMiddleware } from './plugins/security.js';
import { registerRoutes } from './routes/index.js';
import { createIamService, type ManagedIamService } from './shared/iam-service.js';
import type { AppEnv } from '@tetap/config';

export type BuildBackendAdminAppOptions = {
  env: AppEnv;
  iamService?: ManagedIamService;
};

export const buildBackendAdminApp = async ({ env, iamService }: BuildBackendAdminAppOptions) => {
  const app = fastify({
    bodyLimit: env.BODY_LIMIT_BYTES,
    logger: {
      redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
        'req.body.accessToken',
        'req.body.refreshToken',
      ],
    },
    trustProxy: true,
  });

  const iam = iamService ?? (await createIamService(env));

  app.decorate('iam', iam);
  app.addHook('onClose', async () => {
    if (!iamService) {
      await iam.close();
    }
  });
  registerErrorHandler(app);
  registerI18nMiddleware(app);
  registerSecurityMiddleware(app, env);
  registerAuthMiddleware(app);
  registerOperationLogMiddleware(app);

  await app.register(helmet, {
    global: true,
  });
  await app.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  });
  await app.register(cors, {
    credentials: true,
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : false,
  });

  registerRoutes(app);

  return app;
};
