import { getAppEnv, loadConfigEnv } from '@tetap/config/node';
import { buildBackendAdminApp } from './app.js';

loadConfigEnv();

const env = getAppEnv();
const app = await buildBackendAdminApp({ env });

try {
  const address = await app.listen({ host: env.BACKEND_ADMIN_HOST, port: env.BACKEND_ADMIN_PORT });
  app.log.info({ address });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
